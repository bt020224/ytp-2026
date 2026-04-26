"use client";

import { t, type Lang } from "@/lib/i18n";

export const isApiKeyMissingError = (msg: string) =>
  /ANTHROPIC_API_KEY/i.test(msg) || /API key/i.test(msg);

export function ApiKeyMissingCard({ lang }: { lang: Lang }) {
  return (
    <div className="rounded-md bg-amber-500/10 ring-1 ring-amber-500/40 p-3 mt-2">
      <div className="flex items-start gap-2">
        <span className="text-base shrink-0">🔑</span>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-amber-200">
            {t("apiKeyMissingTitle", lang)}
          </div>
          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
            {t("apiKeyMissingBody", lang)}
          </p>
          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-[11px] font-medium text-amber-300 hover:text-amber-200 underline underline-offset-2"
          >
            {t("apiKeyGetIt", lang)} ↗
          </a>
        </div>
      </div>
    </div>
  );
}
