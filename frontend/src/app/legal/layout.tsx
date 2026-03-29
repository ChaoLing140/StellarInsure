import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    template: "%s | StellarInsure",
    default: "Legal | StellarInsure",
  },
  description: "Legal documentation for StellarInsure, including Terms of Service and Privacy Policy.",
};

export default function LegalLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
