"use client";

import React from "react";

import { useWallet, shortenWalletAddress } from "@/components/wallet-provider";
import { Icon } from "@/components/icon";

export function WalletConnectionButton() {
  const { account, connect, disconnect, isConnected, message, status } = useWallet();

  const isBusy = status === "checking" || status === "connecting";
  const showRetry = status === "error" || status === "unsupported";

  const buttonLabel =
    status === "checking"
      ? "Checking wallet..."
      : status === "connecting"
        ? "Connecting..."
        : isConnected && account
          ? `Disconnect ${shortenWalletAddress(account)}`
          : status === "unsupported"
            ? "Wallet Unsupported"
            : "Connect Wallet";

  const messageToneClass =
    status === "error" || status === "unsupported"
      ? "wallet-connection__message--warning"
      : "wallet-connection__message--muted";

  async function handleClick() {
    if (isBusy) {
      return;
    }

    if (isConnected) {
      disconnect();
      return;
    }

    await connect();
  }

  return (
    <div className="wallet-connection">
      <button
        aria-busy={isBusy}
        aria-label={buttonLabel}
        className={`cta-secondary wallet-connection__button ${isConnected ? "wallet-connection__button--connected" : ""}`}
        disabled={isBusy}
        type="button"
        onClick={handleClick}
      >
        <Icon name="wallet" size="sm" tone={isConnected ? "success" : "accent"} />
        <span>{buttonLabel}</span>
      </button>

      {showRetry ? (
        <div
          className="wallet-connection__error"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <p className={`wallet-connection__message ${messageToneClass}`}>{message}</p>
          <button
            className="cta-secondary wallet-connection__retry"
            type="button"
            onClick={() => {
              void connect();
            }}
            aria-label="Retry wallet connection"
          >
            Try again
          </button>
        </div>
      ) : (
        <p className={`wallet-connection__message ${messageToneClass}`} role="status" aria-live="polite">
          {message}
        </p>
      )}
    </div>
  );
}
