"use client";

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { setLanguageAction } from "@/actions/i18n";
import { TranslationLang } from "@/lib/i18n";

interface LanguageSwitcherProps {
  currentLang: TranslationLang;
}

export function LanguageSwitcher({ currentLang }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleLanguageSwitch(lang: TranslationLang) {
    if (lang === currentLang || isPending) return;

    startTransition(async () => {
      try {
        await setLanguageAction(lang);
        
        const segments = pathname.split("/");
        if (segments[1] === "en" || segments[1] === "ar") {
          segments[1] = lang;
        } else {
          segments.splice(1, 0, lang);
        }
        
        let targetUrl = segments.join("/");
        const queryString = searchParams.toString();
        if (queryString) {
          targetUrl += `?${queryString}`;
        }
        
        router.push(targetUrl);
      } catch (err) {
        console.error("Failed to switch language:", err);
      }
    });
  }

  return (
    <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-white">
      <button
        type="button"
        disabled={isPending}
        onClick={() => handleLanguageSwitch("en")}
        aria-label="Switch website language to English"
        aria-current={currentLang === "en" ? "true" : undefined}
        className={`px-1.5 py-1 transition focus:outline-none focus-visible:ring-1 focus-visible:ring-accent ${
          currentLang === "en"
            ? "text-accent font-bold"
            : "text-white/60 hover:text-white disabled:opacity-50"
        }`}
      >
        EN
      </button>
      <span className="text-white/20 select-none">|</span>
      <button
        type="button"
        disabled={isPending}
        onClick={() => handleLanguageSwitch("ar")}
        aria-label="تحويل لغة الموقع إلى العربية"
        aria-current={currentLang === "ar" ? "true" : undefined}
        className={`px-1.5 py-1 transition focus:outline-none focus-visible:ring-1 focus-visible:ring-accent ${
          currentLang === "ar"
            ? "text-accent font-bold font-arabic"
            : "text-white/60 hover:text-white disabled:opacity-50 font-arabic"
        }`}
      >
        العربية
      </button>
    </div>
  );
}
