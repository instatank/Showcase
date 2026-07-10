import type { Metadata } from "next";
import DealScene from "@/components/lab/DealScene";

export const metadata: Metadata = {
  title: "The Deal — Ankit Anand",
  description:
    "Experiment 01: the showcase as a noir card room. Six apps dealt as one hand; contact waits on the river.",
};

export default function DealPage() {
  return <DealScene />;
}
