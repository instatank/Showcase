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
 * plain rounded card. Right now every shot renders a <PlaceholderImage>.
 *
 * ➜ TO SWAP IN REAL IMAGES: replace the <PlaceholderImage .../> below with
 *   <Image src={visual.src} alt={visual.alt} fill className="object-cover" />
 *   (import next/image). That one change updates the whole site.
 */
export default function Visual({
  visual,
  showCaption = true,
}: {
  visual: VisualType;
  showCaption?: boolean;
}) {
  const inner = (
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
