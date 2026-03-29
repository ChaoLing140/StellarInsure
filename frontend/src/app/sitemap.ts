import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/seo";

const ROUTES = [
  "/",
  "/create",
  "/history",
  "/policies/weather-alpha",
  "/policies/flight-orbit",
  "/legal/terms",
  "/legal/privacy",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: absoluteUrl(route),
    lastModified: new Date("2026-03-28T00:00:00.000Z"),
    changeFrequency: route === "/" ? "daily" : "weekly",
    priority: route === "/" ? 1 : route.startsWith("/legal") ? 0.5 : 0.8,
  }));
}
