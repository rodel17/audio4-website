// Text version of the logo for dark backgrounds (the logo image has a white background).
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex flex-col items-end ${className}`}>
      <span className="display text-3xl tracking-tight">
        <span className="text-brand">Audio</span>
        <span className="mx-0.5 text-[1.35em] text-white">4</span>
        <span className="text-brand">Design</span>
      </span>
      <span className="tag-bar -mt-1 text-[0.55rem]!">N Technology Corp.</span>
    </span>
  );
}
