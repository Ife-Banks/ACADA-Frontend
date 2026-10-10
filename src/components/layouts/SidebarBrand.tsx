import Link from "next/link";

interface Props {
  subtitle?: string;
}

export function SidebarBrand({ subtitle }: Props) {
  return (
    <div className="px-5 py-5 border-b border-white/10">
      <Link href="/" className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm">A</span>
        </div>
        <div>
          <p className="text-white font-semibold text-sm leading-tight">
            ACADA Cooperative
          </p>
          {subtitle && (
            <p className="text-sidebar-fg/60 text-xs leading-tight">{subtitle}</p>
          )}
        </div>
      </Link>
    </div>
  );
}
