"use client";

import { useState } from "react";
import type { Service } from "@/data/services";

type ServiceOverviewProps = {
  service: Service;
};

export function ServiceOverview({ service }: ServiceOverviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const overview = service.overview ?? service.fullDescription;
  const hasDetails =
    Boolean(service.details?.length) ||
    Boolean(service.capabilities?.length) ||
    Boolean(service.benefits?.length);

  return (
    <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
          Overview
        </p>
      </div>

      <div>
        <p className="max-w-3xl text-2xl leading-10 text-dark">{overview}</p>

        {hasDetails ? (
          <>
            <button
              type="button"
              className="mt-8 border-b border-accent pb-2 text-left text-sm font-semibold uppercase tracking-[0.16em] text-accent transition-colors duration-200 hover:text-dark"
              aria-expanded={isExpanded}
              onClick={() => setIsExpanded((expanded) => !expanded)}
            >
              {isExpanded ? "Show Less" : "More About This Service"}
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
                  {service.details?.length ? (
                    <div className="max-w-3xl space-y-5 text-lg leading-8 text-muted">
                      {service.details.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  ) : null}

                  {service.capabilities?.length || service.benefits?.length ? (
                    <div className="grid gap-10 lg:grid-cols-2">
                      {service.capabilities?.length ? (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                            {service.capabilitiesTitle ?? "What We Provide"}
                          </p>
                          <ul className="mt-5 grid gap-3 border-y border-dark/12 py-5">
                            {service.capabilities.map((item) => (
                              <li
                                key={item}
                                className="border-b border-dark/10 pb-3 text-sm font-medium leading-6 text-dark last:border-b-0 last:pb-0"
                              >
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      {service.benefits?.length ? (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                            {service.benefitsTitle ?? "Key Advantages"}
                          </p>
                          <div className="mt-5 space-y-5 border-y border-dark/12 py-5">
                            {service.benefits.map((benefit) => (
                              <div key={benefit.title}>
                                <h3 className="text-lg font-semibold text-dark">
                                  {benefit.title}
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-muted">
                                  {benefit.text}
                                </p>
                              </div>
                            ))}
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
