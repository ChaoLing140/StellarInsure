import React from "react";

import { SITE_NAME, webPageStructuredData } from "@/lib/seo";

import { StructuredData } from "./structured-data";

interface PageSeoProps {
  title: string;
  description: string;
  pathname: string;
}

export function PageSeo({ title, description, pathname }: PageSeoProps) {
  return (
    <StructuredData
      data={webPageStructuredData({
        title: `${title} | ${SITE_NAME}`,
        description,
        pathname,
      })}
    />
  );
}
