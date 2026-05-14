type HelpTooltipProps = {
  text: string;
};

export default function HelpTooltip({ text }: HelpTooltipProps) {
  return (
    <span className="relative inline-flex group">
      <span className="flex h-6 w-6 cursor-help items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
        ?
      </span>

      <span className="pointer-events-none absolute right-0 top-8 z-50 hidden w-72 rounded-xl border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-700 shadow-lg group-hover:block">
        {text}
      </span>
    </span>
  );
}