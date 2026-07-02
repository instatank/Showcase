import Image from "next/image";
import type { Visual as VisualType } from "@/data/apps";
import DeviceFrame from "./DeviceFrame";
import PlaceholderImage from "./PlaceholderImage";

const aspectClass: Record<VisualType["aspect"], string> = {
  phone: "", // phone shots are framed by DeviceFrame, which sets aspect
  wide: "aspect-[16/10]",
  square: "aspect-square",
};

/**
 * Visual — the single place that decides how a screenshot is rendered.
 *
 * Phone shots are wrapped in the shared DeviceFrame; wide/square shots sit in a
 * plain rounded card.
 *
 * Visuals flagged `real: true` render the actual screenshot via next/image;
 * everything else still renders a labelled <PlaceholderImage> until its real
 * file is dropped in and the flag is set.
 */
export default function Visual({
  visual,
  showCaption = true,
}: {
  visual: VisualType;
  showCaption?: boolean;
}) {
  const inner = visual.real ? (
    <Image
      src={visual.src}
      alt={visual.alt}
      fill
      sizes="(max-width: 640px) 90vw, 300px"
      className="object-cover"
    />
  ) : (
    <PlaceholderImage label={visual.alt} src={visual.src} />
  );

  return (
    <figure>
      {visual.aspect === "phone" ? (
        <DeviceFrame>{inner}</DeviceFrame>
      ) : (
        <div
          className={`relative overflow-hidden rounded-xl2 border border-hairline bg-surface ${aspectClass[visual.aspect]}`}
        >
          {inner}
        </div>
      )}
      {showCaption && (
        <figcaption className="mt-3 text-center font-mono text-xs text-muted">
          {visual.caption}
        </figcaption>
      )}
    </figure>
  );
}
