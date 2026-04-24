"use client";

import React, { useState } from "react";
import { Icon } from "@/components/icon";
import { useAppTranslation } from "@/i18n/provider";

export type NetworkType = "mainnet" | "testnet";

interface NetworkConfig {
  id: NetworkType;
  label: string;
  description: string;
  isTestnet: boolean;
}

const NETWORKS: NetworkConfig[] = [
  {
    id: "mainnet",
    label: "Mainnet",
    description: "Production network with real transactions",
    isTestnet: false,
  },
  {
    id: "testnet",
    label: "Testnet",
    description: "Test network for development purposes",
    isTestnet: true,
  },
];

interface NetworkSwitcherProps {
  currentNetwork?: NetworkType;
  onNetworkChange?: (network: NetworkType) => void;
}

export function NetworkSwitcher({
  currentNetwork = "mainnet",
  onNetworkChange,
}: NetworkSwitcherProps) {
  const { t } = useAppTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType>(currentNetwork);

  const currentConfig = NETWORKS.find((n) => n.id === selectedNetwork);

  function handleNetworkSelect(network: NetworkType) {
    if (network === "testnet" && selectedNetwork === "mainnet") {
      setShowWarning(true);
      setSelectedNetwork(network);
    } else {
      setSelectedNetwork(network);
      onNetworkChange?.(network);
      setIsOpen(false);
      setShowWarning(false);
    }
  }

  function confirmTestnetSwitch() {
    onNetworkChange?.(selectedNetwork);
    setIsOpen(false);
    setShowWarning(false);
  }

  function cancelTestnetSwitch() {
    setSelectedNetwork(currentNetwork);
    setShowWarning(false);
  }

  return (
    <div className="network-switcher">
      <button
        type="button"
        className="network-switcher__button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Network: ${currentConfig?.label}`}
      >
        <Icon
          name={currentConfig?.isTestnet ? "zap" : "globe"}
          size="sm"
          tone={currentConfig?.isTestnet ? "warning" : "accent"}
        />
        <span className="network-switcher__label">{currentConfig?.label}</span>
      </button>

      {isOpen && !showWarning && (
        <div className="network-switcher__menu" role="listbox">
          {NETWORKS.map((network) => (
            <button
              key={network.id}
              type="button"
              className={`network-switcher__option ${selectedNetwork === network.id ? "is-selected" : ""
                }`}
              onClick={() => handleNetworkSelect(network.id)}
              role="option"
              aria-selected={selectedNetwork === network.id}
            >
              <div className="network-switcher__option-label">
                <span className="network-switcher__option-name">{network.label}</span>
                {network.isTestnet && (
                  <span className="network-switcher__testnet-badge">Test</span>
                )}
              </div>
              <span className="network-switcher__option-description">
                {network.description}
              </span>
            </button>
          ))}
        </div>
      )}

      {showWarning && (
        <div className="network-switcher__warning" role="alertdialog" aria-modal="true">
          <div className="network-switcher__warning-header">
            <Icon name="alert-triangle" size="md" tone="warning" />
            <h3>{t("network.switchWarning.title")}</h3>
          </div>

          <p className="network-switcher__warning-message">
            {t("network.switchWarning.message")}
          </p>

          <ul className="network-switcher__warning-items">
            <li>{t("network.switchWarning.items.0")}</li>
            <li>{t("network.switchWarning.items.1")}</li>
            <li>{t("network.switchWarning.items.2")}</li>
          </ul>

          <div className="network-switcher__warning-actions">
            <button
              type="button"
              className="network-switcher__warning-cancel"
              onClick={cancelTestnetSwitch}
            >
              {t("network.switchWarning.cancel")}
            </button>
            <button
              type="button"
              className="network-switcher__warning-confirm"
              onClick={confirmTestnetSwitch}
            >
              {t("network.switchWarning.confirm")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
