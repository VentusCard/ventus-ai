type Blob = {
  hue: "sky" | "indigo" | "violet" | "warm";
  /** CSS position values */
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  size: number;
  opacity?: number;
};

type HueFieldProps = {
  blobs: Blob[];
  className?: string;
};

/**
 * Ambient low-opacity radial colour wash rendered behind glass surfaces.
 * Purely decorative — sits at z-0 inside a `relative overflow-hidden` parent.
 */
const HueField = ({ blobs, className = "" }: HueFieldProps) => (
  <div className={`ventus-hue-field ${className}`} aria-hidden>
    {blobs.map((b, i) => (
      <div
        key={i}
        className={`ventus-hue-blob ventus-hue-${b.hue}`}
        style={{
          width: b.size,
          height: b.size,
          top: b.top,
          left: b.left,
          right: b.right,
          bottom: b.bottom,
          opacity: b.opacity,
        }}
      />
    ))}
  </div>
);

export default HueField;
