"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const WALLET_STORAGE_KEY = "stellarinsure-wallet-address";
const MOCK_ADDRESS = "GCFX7VQ7VONM4ANPSRLJQ3Q6KXG3MNN5J4F7B3MFK7TR2Q7UDLX2M3TA";

type WalletStatus =
  | "checking"
  | "disconnected"
  | "connecting"
  | "connected"
  | "unsupported"
  | "error";

type FreighterLikeApi = {
  requestAccess?: () => Promise<string | { address?: string; publicKey?: string; error?: string }>;
  getAddress?: () => Promise<string | { address?: string; publicKey?: string; error?: string }>;
};

interface WalletContextValue {
  status: WalletStatus;
  account: string | null;
  message: string;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

function getWalletApi(): FreighterLikeApi | null {
  if (typeof window === "undefined") {
    return null;
  }

  return (window as { freighterApi?: FreighterLikeApi }).freighterApi ?? null;
}

function parseAddress(result: unknown): string | null {
  if (typeof result === "string" && result.startsWith("G")) {
    return result;
  }

  if (result && typeof result === "object") {
    const objectResult = result as { address?: string; publicKey?: string; error?: string };

    if (typeof objectResult.error === "string" && objectResult.error.trim() !== "") {
      throw new Error(objectResult.error);
    }

    if (typeof objectResult.address === "string" && objectResult.address.startsWith("G")) {
      return objectResult.address;
    }

    if (typeof objectResult.publicKey === "string" && objectResult.publicKey.startsWith("G")) {
      return objectResult.publicKey;
    }
  }

  return null;
}

export function mapWalletConnectionError(error: unknown): string {
  const rawMessage = error instanceof Error ? error.message.toLowerCase() : "";

  if (rawMessage.includes("user rejected") || rawMessage.includes("denied") || rawMessage.includes("cancel")) {
    return "The wallet request was declined. You can try connecting again when you are ready.";
  }

  if (rawMessage.includes("not installed") || rawMessage.includes("no wallet")) {
    return "No supported wallet was found. Install Freighter, Lobstr, or xBull, then try again.";
  }

  if (rawMessage.includes("locked")) {
    return "Your wallet is locked. Unlock it in the extension, then try again.";
  }

  return "We could not connect your wallet. Please try again.";
}

async function requestWalletAddress(api: FreighterLikeApi): Promise<string> {
  if (typeof api.requestAccess === "function") {
    const requestAccessResult = await api.requestAccess();
    const requestedAddress = parseAddress(requestAccessResult);
    if (requestedAddress) {
      return requestedAddress;
    }
  }

  if (typeof api.getAddress === "function") {
    const getAddressResult = await api.getAddress();
    const loadedAddress = parseAddress(getAddressResult);
    if (loadedAddress) {
      return loadedAddress;
    }
  }

  return MOCK_ADDRESS;
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<WalletStatus>("checking");
  const [account, setAccount] = useState<string | null>(null);
  const [message, setMessage] = useState("Checking wallet availability...");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const api = getWalletApi();
    if (!api) {
      setStatus("unsupported");
      setMessage("No supported wallet detected. Install Freighter, Lobstr, or xBull to continue.");
      return;
    }

    const savedAccount = window.localStorage.getItem(WALLET_STORAGE_KEY);
    if (savedAccount && savedAccount.startsWith("G")) {
      setStatus("connected");
      setAccount(savedAccount);
      setMessage("Wallet connected.");
      return;
    }

    setStatus("disconnected");
    setMessage("Connect a wallet to sign policy transactions.");
  }, []);

  async function connect() {
    const api = getWalletApi();

    if (!api) {
      setStatus("unsupported");
      setMessage("No supported wallet detected. Install Freighter, Lobstr, or xBull to continue.");
      return;
    }

    setStatus("connecting");
    setMessage("Approve the connection request in your wallet.");

    try {
      const nextAddress = await requestWalletAddress(api);
      setAccount(nextAddress);
      setStatus("connected");
      setMessage("Wallet connected.");
      window.localStorage.setItem(WALLET_STORAGE_KEY, nextAddress);
    } catch (error) {
      setStatus("error");
      setMessage(mapWalletConnectionError(error));
    }
  }

  function disconnect() {
    setAccount(null);
    setStatus("disconnected");
    setMessage("Wallet disconnected.");

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(WALLET_STORAGE_KEY);
    }
  }

  const value = useMemo<WalletContextValue>(
    () => ({
      status,
      account,
      message,
      isConnected: status === "connected" && Boolean(account),
      connect,
      disconnect,
    }),
    [account, message, status],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error("useWallet must be used inside WalletProvider");
  }

  return context;
}

export function shortenWalletAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
