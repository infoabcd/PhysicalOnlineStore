import PayPal from '/PayPal-LOGO.SVG';

const SITE = 'Physical Trading Platform';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/[0.08] bg-[#141414]">
      <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-5">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">支付方式</span>
            <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white px-2 py-1">
              <img src={PayPal} alt="PayPal" className="h-6 w-auto" />
            </span>
          </div>
          <div className="text-sm text-neutral-500">
            联系：
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="ml-1 font-medium text-neutral-300 underline decoration-white/20 underline-offset-4 transition hover:text-brand"
            >
              Facebook
            </a>
          </div>
        </div>
        <p className="mt-6 border-t border-white/[0.06] pt-6 text-center text-xs text-neutral-600 sm:text-left">
          © {new Date().getFullYear()} {SITE}
        </p>
      </div>
    </footer>
  );
}
