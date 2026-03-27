"""
Stellar smart contract integration service for StellarInsure.
Handles contract invocation, transaction building, submission, and event monitoring.
"""
import json
import base64
import logging
from typing import Optional, Dict, Any, List, Callable
from datetime import datetime
from stellar_sdk import SorobanServer
from stellar_sdk import Keypair, Server, TransactionBuilder, Network, Asset, Operation, SorobanDataBuilder, Address, InvokeHostFunction, StrKey, MuxedAccount, xdr as stellar_xdr
from stellar_sdk.soroban_types import Ed25519PublicKey

logger = logging.getLogger("stellar-insure.stellar")
from stellar_sdk.exceptions import (
    BadRequestError,
    BadSignatureError,
    NotFoundError,
    ConnectionError
)

from ..config import get_settings
from ..models import Transaction
from sqlalchemy.orm import Session


class StellarContractError(Exception):
    """Base exception for Stellar contract errors"""
    pass


class StellarService:
    """
    Service for interacting with Stellar smart contracts.
    Provides methods for contract invocation, transaction management, and event monitoring.
    """

    def __init__(self):
        self.settings = get_settings()
        self.server = Server(horizon_url=self.settings.stellar_horizon_url)
        self.soroban_server = SorobanServer(self.settings.stellar_horizon_url.replace("horizon", "soroban-rpc"))
        self.network_passphrase = (
            Network.TESTNET_NETWORK_PASSPHRASE if self.settings.is_testnet 
            else Network.PUBLIC_NETWORK_PASSPHRASE
        )
        self._admin_keypair: Optional[Keypair] = None
        self._contract_id: Optional[str] = None

    @property
    def admin_keypair(self) -> Optional[Keypair]:
        """Get admin keypair from secret key"""
        if self._admin_keypair is None and self.settings.stellar_admin_secret:
            self._admin_keypair = Keypair.from_secret(self.settings.stellar_admin_secret)
        return self._admin_keypair

    @property
    def contract_id(self) -> Optional[str]:
        """Get contract ID from settings"""
        if self._contract_id is None:
            self._contract_id = self.settings.stellar_contract_id
        return self._contract_id

    def load_account(self, public_key: str):
        """Load account from the network"""
        try:
            return self.server.load_account(public_key)
        except NotFoundError:
            raise StellarContractError(f"Account {public_key} not found on the network")

    def build_transaction(
        self,
        source_public_key: str,
        contract_function: str,
        contract_args: List[Any],
        timeout: int = 300
    ) -> TransactionBuilder:
        """
        Build a transaction to invoke a smart contract function.

        Args:
            source_public_key: The source account public key
            contract_function: Name of the contract function to invoke
            contract_args: Arguments to pass to the contract function
            timeout: Transaction timeout in seconds

        Returns:
            TransactionBuilder with the contract invocation operation
        """
        if not self.contract_id:
            raise StellarContractError("Contract ID not configured")

        source_account = self.load_account(source_public_key)

        builder = TransactionBuilder(
            source_account=source_account,
            network_passphrase=self.network_passphrase,
            base_fee=self.server.fetch_base_fee()
        )

        builder.add_time_bounds(timeout)

        host_function = InvokeHostFunction(
            contract_id=self.contract_id,
            function_name=contract_function,
            parameters=contract_args
        )

        builder.append_invoke_host_function_op(host_function)

        return builder

    def sign_transaction(self, builder: TransactionBuilder, signers: List[Keypair]) -> Any:
        """
        Sign a transaction with the provided signers.

        Args:
            builder: TransactionBuilder instance
            signers: List of Keypair objects to sign with

        Returns:
            Signed transaction envelope
        """
        transaction = builder.build()

        for signer in signers:
            transaction.sign(signer)

        return transaction

    async def submit_transaction(self, transaction) -> Dict[str, Any]:
        """
        Submit a signed transaction to the Stellar network.

        Args:
            transaction: Signed transaction envelope

        Returns:
            Response containing transaction hash and status

        Raises:
            StellarContractError: If transaction submission fails
        """
        try:
            logger.info("submitting_stellar_transaction", extra={"source": transaction.source})
            response = await self.server.submit_transaction(transaction)
            logger.info("stellar_transaction_submitted", extra={"hash": response["hash"]})

            return {
                "hash": response["hash"],
                "ledger": response.get("ledger"),
                "status": response.get("status", "pending"),
                "created_at": datetime.utcnow().isoformat()
            }

        except BadRequestError as e:
            logger.warning("stellar_transaction_rejected", extra={"error": str(e)})
            raise StellarContractError(f"Transaction rejected: {str(e)}")
        except ConnectionError as e:
            logger.error("stellar_connection_failed", extra={"error": str(e)})
            raise StellarContractError(f"Connection error: {str(e)}")

    async def simulate_transaction(self, transaction) -> Dict[str, Any]:
        """
        Simulate a transaction to estimate fees and check for errors.

        Args:
            transaction: Transaction to simulate

        Returns:
            Simulation result with estimated fees and potential errors
        """
        try:
            result = await self.soroban_server.simulate_transaction(transaction)

            return {
                "success": result.get("success", False),
                "cost": result.get("cost", {}),
                "error": result.get("error"),
                "results": result.get("results", [])
            }
        except Exception as e:
            raise StellarContractError(f"Simulation failed: {str(e)}")

    async def invoke_contract(
        self,
        function_name: str,
        args: List[Any],
        source_keypair: Optional[Keypair] = None,
        sign_with_admin: bool = True
    ) -> Dict[str, Any]:
        """
        Invoke a smart contract function.

        Args:
            function_name: Name of the contract function to call
            args: Arguments to pass to the function
            source_keypair: Optional source account keypair
            sign_with_admin: Whether to sign with admin keypair

        Returns:
            Transaction response with hash and status
        """
        logger.info("invoking_contract_function", extra={
            "function": function_name,
            "contract_id": self.contract_id
        })
        keypair = source_keypair or self.admin_keypair
        if not keypair:
            raise StellarContractError("No keypair available for signing")

        builder = self.build_transaction(
            source_public_key=keypair.public_key,
            contract_function=function_name,
            contract_args=args
        )

        signers = [keypair]
        if sign_with_admin and self.admin_keypair and keypair != self.admin_keypair:
            signers.append(self.admin_keypair)

        transaction = self.sign_transaction(builder, signers)

        return await self.submit_transaction(transaction)

    async def create_policy_contract(
        self,
        policy_id: int,
        policyholder_address: str,
        coverage_amount: float,
        premium: float,
        start_time: int,
        end_time: int,
        trigger_condition: str
    ) -> Dict[str, Any]:
        """
        Create a policy on the smart contract.

        Args:
            policy_id: Unique policy identifier
            policyholder_address: Stellar address of the policyholder
            coverage_amount: Coverage amount in XLM
            premium: Premium amount in XLM
            start_time: Policy start timestamp
            end_time: Policy end timestamp
            trigger_condition: Trigger condition for claims

        Returns:
            Transaction response
        """
        args = [
            policy_id,
            Address(policyholder_address),
            int(coverage_amount * 1e7),
            int(premium * 1e7),
            start_time,
            end_time,
            trigger_condition
        ]

        return await self.invoke_contract(
            function_name="create_policy",
            args=args
        )

    async def submit_claim_contract(
        self,
        claim_id: int,
        policy_id: int,
        claimant_address: str,
        claim_amount: float,
        proof: str
    ) -> Dict[str, Any]:
        """
        Submit a claim on the smart contract.

        Args:
            claim_id: Unique claim identifier
            policy_id: ID of the policy being claimed
            claimant_address: Stellar address of the claimant
            claim_amount: Claim amount in XLM
            proof: Proof or evidence for the claim

        Returns:
            Transaction response
        """
        args = [
            claim_id,
            policy_id,
            Address(claimant_address),
            int(claim_amount * 1e7),
            proof
        ]

        return await self.invoke_contract(
            function_name="submit_claim",
            args=args
        )

    async def approve_claim_contract(self, claim_id: int) -> Dict[str, Any]:
        """
        Approve a claim on the smart contract.

        Args:
            claim_id: ID of the claim to approve

        Returns:
            Transaction response
        """
        args = [claim_id]

        return await self.invoke_contract(
            function_name="approve_claim",
            args=args
        )

    async def reject_claim_contract(self, claim_id: int, reason: str) -> Dict[str, Any]:
        """
        Reject a claim on the smart contract.

        Args:
            claim_id: ID of the claim to reject
            reason: Reason for rejection

        Returns:
            Transaction response
        """
        args = [claim_id, reason]

        return await self.invoke_contract(
            function_name="reject_claim",
            args=args
        )

    def get_transaction_status(self, transaction_hash: str) -> Dict[str, Any]:
        """
        Get the status of a submitted transaction.

        Args:
            transaction_hash: Hash of the transaction to check

        Returns:
            Transaction status information
        """
        try:
            response = self.server.transactions().transaction(transaction_hash).call()

            return {
                "hash": response.get("hash"),
                "status": response.get("status"),
                "ledger": response.get("ledger"),
                "created_at": response.get("created_at"),
                "successful": response.get("successful", False)
            }
        except NotFoundError:
            return {
                "hash": transaction_hash,
                "status": "not_found",
                "error": "Transaction not found"
            }

    async def listen_for_events(
        self,
        contract_id: Optional[str] = None,
        event_types: Optional[List[str]] = None,
        callback: Optional[Callable] = None
    ):
        """
        Listen for events emitted by the smart contract.

        Args:
            contract_id: Contract ID to filter events (uses default if not provided)
            event_types: Types of events to filter for
            callback: Function to call when an event is received

        Yields:
            Event data as it is received
        """
        target_contract = contract_id or self.contract_id
        if not target_contract:
            raise StellarContractError("Contract ID not configured")

        try:
            async for event in self.soroban_server.get_events(
                contract_id=target_contract,
                event_type=event_types
            ):
                event_data = {
                    "contract_id": event.get("contract_id"),
                    "type": event.get("type"),
                    "topic": event.get("topic"),
                    "value": event.get("value"),
                    "tx_hash": event.get("tx_hash"),
                    "timestamp": datetime.utcnow().isoformat()
                }

                if callback:
                    callback(event_data)

                yield event_data

        except Exception as e:
            raise StellarContractError(f"Event listener error: {str(e)}")

    async def store_transaction_record(
        self,
        db: Session,
        user_id: int,
        transaction_hash: str,
        amount: float,
        transaction_type: str,
        policy_id: Optional[int] = None,
        claim_id: Optional[int] = None,
        status: str = "pending"
    ) -> Transaction:
        """
        Store a transaction record in the database.

        Args:
            db: Database session
            user_id: ID of the user
            transaction_hash: Hash of the blockchain transaction
            amount: Transaction amount
            transaction_type: Type of transaction
            policy_id: Optional policy ID
            claim_id: Optional claim ID
            status: Transaction status

        Returns:
            Created Transaction record
        """
        transaction = Transaction(
            user_id=user_id,
            policy_id=policy_id,
            claim_id=claim_id,
            transaction_hash=transaction_hash,
            amount=amount,
            transaction_type=transaction_type,
            status=status
        )

        db.add(transaction)
        db.commit()
        db.refresh(transaction)

        return transaction

    async def verify_stellar_signature(
        self,
        public_key: str,
        signature: str,
        message: str
    ) -> bool:
        """
        Verify a Stellar wallet signature.

        Args:
            public_key: Stellar public key
            signature: Base64-encoded signature
            message: Original message that was signed

        Returns:
            True if signature is valid, False otherwise
        """
        try:
            keypair = Keypair.from_public_key(public_key)
            signature_bytes = base64.b64decode(signature)
            message_bytes = message.encode('utf-8')
            
            return keypair.verify(message_bytes, signature_bytes)
        except Exception:
            return False


stellar_service = StellarService()


def get_stellar_service() -> StellarService:
    """Dependency to get the Stellar service instance"""
    return stellar_service
