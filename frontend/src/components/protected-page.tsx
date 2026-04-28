"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Skeleton } from "@/components/skeleton";

export function ProtectedPage({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <main id="main-content" tabIndex={-1} className="policy-page" aria-busy="true" aria-label="Loading…">
        <div className="section-header">
          <Skeleton style={{ width: "200px", height: "1.5rem", marginBottom: "0.75rem" }} />
          <Skeleton style={{ width: "400px", height: "1rem" }} />
        </div>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return <>{children}</>;
}
