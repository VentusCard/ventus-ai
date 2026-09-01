import { ReactNode } from "react";

interface ChapterHeaderProps {
  eyebrow: string;
  title: string;
  body: string;
  titleId: string;
  visual?: ReactNode;
  light?: boolean;
}

export function ChapterHeader({ eyebrow, title, body, titleId, visual, light = false }: ChapterHeaderProps) {
  return (
    <div className={`landing-chapter-head ${visual ? "has-visual" : "is-copy-only"} ${light ? "is-light" : ""}`}>
      <div className="landing-chapter-head__copy">
        <p className="landing-eyebrow">{eyebrow}</p>
        <h2 id={titleId}>{title}</h2>
        <p>{body}</p>
      </div>
      {visual ? <div className="landing-chapter-head__visual">{visual}</div> : null}
    </div>
  );
}
