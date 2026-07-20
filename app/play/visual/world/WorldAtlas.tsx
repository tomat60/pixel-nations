import type { ReactNode } from "react";

export type WorldAtlasProps = {
  children?: ReactNode;
};

// Seed module for the guarded World Atlas implementation run.
// The executor will replace this placeholder with the SVG atlas surface.
export function WorldAtlas({ children }: WorldAtlasProps) {
  return <div className="absolute inset-0">{children}</div>;
}
