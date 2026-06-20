import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getApp, appSlugs } from "@/data/apps";
import AppDetail from "@/components/AppDetail";

/** Statically generate all six detail pages at build time. */
export function generateStaticParams() {
  return appSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const app = getApp(slug);
  if (!app) return { title: "Not found" };
  return {
    title: `${app.name} — Ankit Anand`,
    description: app.oneLiner,
  };
}

export default async function AppPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const app = getApp(slug);
  if (!app) notFound();
  return <AppDetail app={app} />;
}
