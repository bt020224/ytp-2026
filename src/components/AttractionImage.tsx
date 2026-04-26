"use client";

import { useState } from "react";
import {
  attractionName,
  attractionTheme,
  type Attraction,
} from "@/lib/attractions";
import type { Lang } from "@/lib/i18n";

type Props = {
  attraction: Attraction;
  lang: Lang;
  className?: string;
  rounded?: string;
};

export function AttractionImage({
  attraction,
  lang,
  className = "h-40 w-full",
  rounded = "rounded-t-xl",
}: Props) {
  const [failed, setFailed] = useState(false);
  const theme = attractionTheme(attraction);

  if (failed || !attraction.imageUrl) {
    return (
      <div
        className={`${className} ${rounded} bg-gradient-to-br ${theme.gradient} flex flex-col items-center justify-center relative overflow-hidden`}
      >
        <div className="text-4xl opacity-90">{theme.emoji}</div>
        <div className="mt-1 px-2 text-center font-bold text-white/95 text-sm leading-tight line-clamp-2">
          {attractionName(attraction, lang)}
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} ${rounded} relative overflow-hidden bg-slate-800`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={attraction.imageUrl}
        alt={attractionName(attraction, lang)}
        loading="lazy"
        onError={() => setFailed(true)}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none" />
    </div>
  );
}
