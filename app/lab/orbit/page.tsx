import type { Metadata } from "next";
import OrbitScene from "@/components/lab/OrbitScene";

export const metadata: Metadata = {
  title: "The Orbit — Ankit Anand",
  description:
    "Experiment 03: the showcase as a planetary system. The story is the sun, six apps are worlds, and gravity decides where you land.",
};

export default function OrbitPage() {
  return <OrbitScene />;
}
