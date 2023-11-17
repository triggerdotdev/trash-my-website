type SpanProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLSpanElement>,
  HTMLSpanElement
>;

export function PrimaryGradientText({
  children,
  className,
  ...props
}: SpanProps) {
  return (
    <span
      style={{
        background: "linear-gradient(180deg, #E7FF52, #41FF54)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      {children}
    </span>
  );
}

export function SecondaryGradientText({
  children,
  className,
  ...props
}: SpanProps) {
  return (
    <span
      style={{
        background: "linear-gradient(0deg, #2563EB, #A855F7)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      {children}
    </span>
  );
}
