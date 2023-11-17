import { CSSProperties } from "react";
import { cn } from "../utils";
import { PrimaryGradientText, SecondaryGradientText } from "./GradientText";

export function Logo({ className }: { className?: string }) {
  return (
    <h1 className={cn("font-bold tracking-tighter", className)}>
      <PrimaryGradientText>TrashMySite</PrimaryGradientText>
      <SecondaryGradientText>.ai</SecondaryGradientText>
    </h1>
  );
}

export function LogoFlat({ style }: { style?: CSSProperties }) {
  return (
    <h1 className={"font-bold tracking-tighter"} style={style}>
      <span style={{ color: "#41FF54" }}>TrashMySite</span>
      <span style={{ color: "#A855F7" }}>.ai</span>
    </h1>
  );
}
