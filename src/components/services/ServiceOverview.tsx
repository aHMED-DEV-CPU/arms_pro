"use client";

import { useState } from "react";
import type { IService } from "@/types";
import { t, getLocalizedValue, TranslationLang } from "@/lib/i18n";

type ServiceOverviewProps = {
  service: IService;
  lang?: TranslationLang;
};

export function ServiceOverview({ service, lang = "en" }: ServiceOverviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const overview = getLocalizedValue(service.overview, lang);
  const details = service.details || [];
  const capabilities = service.capabilities || [];
  const benefits = service.benefits || [];

  const hasDetails =
    Boolean(details.length) ||
    Boolean(capabilities.length) ||
    Boolean(benefits.length);

  return (
    <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
          {t("services", "overviewTitle", lang)}
        </p>
      </div>

      <div>
        <p className="max-w-3xl text-2xl leading-10 text-dark">{overview}</p>

        {hasDetails ? (
          <>
            <button
              type="button"
              className="mt-8 border-b border-accent pb-2 text-start text-sm font-semibold uppercase tracking-[0.16em] text-accent transition-colors duration-200 hover:text-dark focus:outline-none focus:text-dark"
              aria-expanded={isExpanded}
              onClick={() => setIsExpanded((expanded) => !expanded)}
            >
              {isExpanded 
                ? (lang === "ar" ? "عرض أقل" : "Show Less") 
                : (lang === "ar" ? "المزيد عن هذه الخدمة" : "More About This Service")}
            </button>

            <div
              className={`grid transition-all duration-300 ${
                isExpanded
                  ? "mt-10 grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="space-y-10 border-t border-dark/12 pt-8">
                  {details.length ? (
                    <div className="max-w-3xl space-y-5 text-lg leading-8 text-muted">
                      {details.map((paragraph, idx) => (
                        <p key={idx}>{getLocalizedValue(paragraph, lang)}</p>
                      ))}
                    </div>
                  ) : null}

                  {capabilities.length || benefits.length ? (
                    <div className="grid gap-10 lg:grid-cols-2">
                      {capabilities.length ? (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                            {getLocalizedValue(service.capabilitiesTitle, lang) || (lang === "ar" ? "ما نقدمه" : "What We Provide")}
                          </p>
                          <ul className="mt-5 grid gap-3 border-y border-dark/12 py-5">
                            {capabilities.map((item, idx) => (
                              <li
                                key={idx}
                                className="border-b border-dark/10 pb-3 text-sm font-medium leading-6 text-dark last:border-b-0 last:pb-0"
                              >
                                {getLocalizedValue(item, lang)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      {benefits.length ? (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                            {getLocalizedValue(service.benefitsTitle, lang) || (lang === "ar" ? "المزايا الرئيسية" : "Key Advantages")}
                          </p>
                          <div className="mt-5 space-y-5 border-y border-dark/12 py-5">
                            {benefits.map((benefit, idx) => {
                              const bTitle = getLocalizedValue(benefit.title, lang);
                              const bText = getLocalizedValue(benefit.text, lang);
                              return (
                                <div key={idx}>
                                  <h3 className="text-lg font-semibold text-dark">
                                    {bTitle}
                                  </h3>
                                  <p className="mt-2 text-sm leading-6 text-muted">
                                    {bText}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
