"use client";

import { useState } from "react";

interface SettingsSection {
  name: "account" | "preferences" | "security";
  label: string;
}

export default function SettingsPageClient() {
  const [activeTab, setActiveTab] = useState<SettingsSection["name"]>("account");
  const [timezone, setTimezone] = useState("UTC");
  const [currency, setCurrency] = useState("XLM");
  const [language, setLanguage] = useState("en");
  const [email, setEmail] = useState(true);
  const [sms, setSms] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const sections: SettingsSection[] = [
    { name: "account", label: "Account" },
    { name: "preferences", label: "Preferences" },
    { name: "security", label: "Security" },
  ];

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setStatus("");
    setError("");
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setStatus("Settings saved successfully.");
    } catch (err) {
      setError("Failed to save settings. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main id="main-content" className="policy-page">
      <div className="section-header">
        <span className="eyebrow">Settings</span>
        <h1>Account Settings</h1>
        <p>Manage your account, preferences, and security settings.</p>
      </div>

      <div className="settings-container">
        {/* Tabs */}
        <div className="settings-tabs" role="tablist">
          {sections.map((section) => (
            <button
              key={section.name}
              role="tab"
              aria-selected={activeTab === section.name}
              className={`settings-tab ${activeTab === section.name ? "active" : ""}`}
              onClick={() => setActiveTab(section.name)}
            >
              {section.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <form className="settings-panel" onSubmit={handleSave} aria-label="Settings form">
          {/* Account Settings */}
          {activeTab === "account" && (
            <div className="settings-section" role="tabpanel">
              <h2 className="settings-section-title">Account Information</h2>

              <label className="field">
                <span className="field__label">Timezone</span>
                <select
                  className="tx-select"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="Asia/Tokyo">Asia/Tokyo</option>
                </select>
              </label>

              <label className="field">
                <span className="field__label">Display Currency</span>
                <select
                  className="tx-select"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="XLM">XLM</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </label>

              <label className="field">
                <span className="field__label">Language</span>
                <select
                  className="tx-select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </label>
            </div>
          )}

          {/* Preferences */}
          {activeTab === "preferences" && (
            <div className="settings-section" role="tabpanel">
              <h2 className="settings-section-title">Notification Preferences</h2>

              <fieldset className="fieldset">
                <legend className="field__label">Communication Channels</legend>
                <label className="choice">
                  <input
                    type="checkbox"
                    checked={email}
                    onChange={(e) => setEmail(e.target.checked)}
                  />
                  Email notifications about policy updates and claims
                </label>
                <label className="choice">
                  <input
                    type="checkbox"
                    checked={sms}
                    onChange={(e) => setSms(e.target.checked)}
                  />
                  SMS alerts for urgent policy changes
                </label>
                <label className="choice">
                  <input
                    type="checkbox"
                    checked={pushNotifications}
                    onChange={(e) => setPushNotifications(e.target.checked)}
                  />
                  Push notifications for claim status updates
                </label>
              </fieldset>

              <fieldset className="fieldset">
                <legend className="field__label">Data & Analytics</legend>
                <label className="choice">
                  <input
                    type="checkbox"
                    checked={dataSharing}
                    onChange={(e) => setDataSharing(e.target.checked)}
                  />
                  Allow anonymous usage analytics to improve the platform
                </label>
              </fieldset>
            </div>
          )}

          {/* Security */}
          {activeTab === "security" && (
            <div className="settings-section" role="tabpanel">
              <h2 className="settings-section-title">Security Controls</h2>

              <fieldset className="fieldset">
                <legend className="field__label">Authentication</legend>
                <label className="choice">
                  <input
                    type="checkbox"
                    checked={twoFactorEnabled}
                    onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                  />
                  Two-factor authentication (2FA) enabled
                </label>
              </fieldset>

              <div className="settings-subsection">
                <h3 className="settings-subsection-title">Connected Wallets</h3>
                <p className="settings-subsection-text">
                  Your Stellar wallet connection is verified and secure.
                </p>
              </div>

              <div className="settings-subsection">
                <h3 className="settings-subsection-title">Session Management</h3>
                <button type="button" className="cta-secondary">
                  Sign Out from All Devices
                </button>
              </div>
            </div>
          )}

          {/* Status Messages */}
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}
          {status && (
            <div className="form-success" role="status">
              {status}
            </div>
          )}

          {/* Action Buttons */}
          <div className="form-actions">
            <button className="cta-primary" type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
