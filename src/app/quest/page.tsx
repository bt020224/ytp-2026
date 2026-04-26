"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  TAIPEI_ATTRACTIONS,
  attractionName,
  attractionCategory,
} from "@/lib/attractions";
import { t } from "@/lib/i18n";
import { useLang } from "@/lib/useLang";
import { AttractionImage } from "@/components/AttractionImage";
import {
  ApiKeyMissingCard,
  isApiKeyMissingError,
} from "@/components/ApiKeyMissingCard";

type Character = "detective" | "explorer" | "foodie";

type Quest = {
  attractionId: string;
  task: string;
  hint: string;
  completion: string;
  xp: number;
};

type QuestLine = {
  character: Character;
  storyTitle: string;
  storyHook: string;
  ending: string;
  quests: Quest[];
  completed: number[]; // indices of completed quests
};

const STORAGE_KEY = "tfl_quest_state";

const CHARACTERS: {
  id: Character;
  emoji: string;
  nameKey: "questCharDetective" | "questCharExplorer" | "questCharFoodie";
  descKey: "questCharDetectiveDesc" | "questCharExplorerDesc" | "questCharFoodieDesc";
  gradient: string;
}[] = [
  {
    id: "detective",
    emoji: "🕵️",
    nameKey: "questCharDetective",
    descKey: "questCharDetectiveDesc",
    gradient: "from-slate-700 to-zinc-900",
  },
  {
    id: "explorer",
    emoji: "🧭",
    nameKey: "questCharExplorer",
    descKey: "questCharExplorerDesc",
    gradient: "from-emerald-700 to-teal-900",
  },
  {
    id: "foodie",
    emoji: "🍜",
    nameKey: "questCharFoodie",
    descKey: "questCharFoodieDesc",
    gradient: "from-rose-700 to-orange-900",
  },
];

function characterEmoji(c: Character) {
  return CHARACTERS.find((x) => x.id === c)?.emoji ?? "🎮";
}

export default function QuestPage() {
  const [lang] = useLang();
  const [character, setCharacter] = useState<Character | null>(null);
  const [questLine, setQuestLine] = useState<QuestLine | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openHint, setOpenHint] = useState<Set<number>>(new Set());

  // Load saved state
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as QuestLine;
        if (parsed?.quests?.length) {
          setQuestLine(parsed);
          setCharacter(parsed.character);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  const persist = (q: QuestLine | null) => {
    try {
      if (q) localStorage.setItem(STORAGE_KEY, JSON.stringify(q));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  const beginAdventure = async () => {
    if (!character) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/quest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ character, lang }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error");
        return;
      }
      const next: QuestLine = {
        character,
        storyTitle: data.storyTitle,
        storyHook: data.storyHook,
        ending: data.ending,
        quests: data.quests,
        completed: [],
      };
      setQuestLine(next);
      persist(next);
      setOpenHint(new Set());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  const completeQuest = (index: number) => {
    if (!questLine) return;
    if (questLine.completed.includes(index)) return;
    const next: QuestLine = {
      ...questLine,
      completed: [...questLine.completed, index],
    };
    setQuestLine(next);
    persist(next);
  };

  const reset = () => {
    setQuestLine(null);
    setCharacter(null);
    persist(null);
    setOpenHint(new Set());
  };

  const toggleHint = (i: number) => {
    setOpenHint((prev) => {
      const n = new Set(prev);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
  };

  const allDone =
    questLine && questLine.completed.length === questLine.quests.length;

  const totalXp = useMemo(() => {
    if (!questLine) return 0;
    return questLine.completed.reduce(
      (acc, i) => acc + (questLine.quests[i]?.xp ?? 0),
      0
    );
  }, [questLine]);

  // -------------------- VIEW: Active quest line --------------------
  if (questLine) {
    const totalQuests = questLine.quests.length;
    const completedCount = questLine.completed.length;
    const percent = Math.round((completedCount / totalQuests) * 100);

    return (
      <main className="min-h-screen">
        <div className="mx-auto max-w-[900px] px-4 md:px-8 py-8 md:py-10">
          {/* Story header */}
          <div className="mb-6 rounded-2xl bg-gradient-to-br from-fuchsia-900/40 via-violet-900/40 to-sky-900/30 ring-1 ring-violet-700/40 p-5">
            <div className="flex items-start gap-4">
              <div className="text-5xl">{characterEmoji(questLine.character)}</div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-violet-300 uppercase tracking-wider">
                  {t(
                    questLine.character === "detective"
                      ? "questCharDetective"
                      : questLine.character === "explorer"
                      ? "questCharExplorer"
                      : "questCharFoodie",
                    lang
                  )}
                </div>
                <h1 className="mt-1 text-2xl md:text-3xl font-black tracking-tight">
                  {questLine.storyTitle}
                </h1>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                  {questLine.storyHook}
                </p>
              </div>
            </div>
            {/* Progress */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>
                  {t("questProgress", lang)} {completedCount}/{totalQuests}
                </span>
                <span className="text-amber-300 font-semibold">
                  ⭐ {totalXp} XP
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-fuchsia-500 to-violet-500 transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quest list */}
          <ol className="space-y-4">
            {questLine.quests.map((q, i) => {
              const attraction = TAIPEI_ATTRACTIONS.find(
                (a) => a.id === q.attractionId
              );
              if (!attraction) return null;
              const done = questLine.completed.includes(i);
              const isCurrent =
                !done && i === questLine.completed.length;
              const isLocked = !done && !isCurrent;

              return (
                <li
                  key={`${q.attractionId}-${i}`}
                  className={`relative rounded-2xl ring-1 overflow-hidden transition ${
                    done
                      ? "bg-emerald-900/25 ring-emerald-700/40"
                      : isCurrent
                      ? "bg-slate-900/80 ring-violet-500/50 shadow-xl shadow-violet-500/20"
                      : "bg-slate-900/40 ring-slate-800 opacity-70"
                  }`}
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-56 md:shrink-0 relative">
                      <AttractionImage
                        attraction={attraction}
                        lang={lang}
                        className={`h-40 md:h-full w-full ${isLocked ? "blur-sm" : ""}`}
                        rounded=""
                      />
                      <div
                        className={`absolute top-3 left-3 flex h-10 w-10 items-center justify-center rounded-full text-base font-black shadow-lg ring-2 ring-slate-950 ${
                          done
                            ? "bg-emerald-500 text-slate-950"
                            : isCurrent
                            ? "bg-violet-500 text-white"
                            : "bg-slate-700 text-slate-400"
                        }`}
                      >
                        {done ? "✓" : i + 1}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 p-5">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <div className="font-bold text-slate-100">
                            {attractionName(attraction, lang)}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {attractionCategory(attraction, lang)} ·{" "}
                            <span className="text-amber-300 font-semibold">
                              +{q.xp} XP
                            </span>
                          </div>
                        </div>
                      </div>

                      {isLocked ? (
                        <div className="mt-3 text-sm text-slate-500 italic">
                          {t("questLocked", lang)}
                        </div>
                      ) : (
                        <>
                          <p className="mt-3 text-sm text-slate-100 leading-relaxed">
                            {q.task}
                          </p>

                          <button
                            onClick={() => toggleHint(i)}
                            className="mt-3 text-xs text-amber-300 hover:text-amber-200 font-medium"
                          >
                            {openHint.has(i) ? "▲" : "▼"} {t("questHint", lang)}
                          </button>
                          {openHint.has(i) && (
                            <p className="mt-1 text-xs text-amber-200/90 leading-relaxed">
                              {q.hint}
                            </p>
                          )}

                          <div className="mt-3 rounded-md bg-emerald-500/10 ring-1 ring-emerald-500/30 p-2.5 text-xs text-emerald-100">
                            <span className="font-semibold text-emerald-300">
                              {t("questCompletion", lang)}:{" "}
                            </span>
                            {q.completion}
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {!done && isCurrent && (
                              <button
                                onClick={() => completeQuest(i)}
                                className="rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-violet-500/40 transition"
                              >
                                {t("questCompleteBtn", lang)}
                              </button>
                            )}
                            {done && (
                              <span className="inline-flex items-center rounded-lg bg-emerald-500/20 ring-1 ring-emerald-500/40 px-3 py-1.5 text-sm font-bold text-emerald-300">
                                {t("questCompleted", lang)}
                              </span>
                            )}
                            <Link
                              href={`/plan?dest=${q.attractionId}`}
                              className="rounded-lg bg-slate-800 hover:bg-slate-700 ring-1 ring-slate-700 px-3 py-1.5 text-xs font-medium transition"
                            >
                              🛣️ {t("questOpenInPlan", lang)}
                            </Link>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Finale */}
          {allDone && (
            <div className="mt-8 rounded-2xl bg-gradient-to-br from-amber-500/30 via-fuchsia-500/30 to-violet-500/30 ring-1 ring-amber-300/40 p-6 text-center">
              <div className="text-5xl mb-2">🏆</div>
              <h2 className="text-2xl font-black tracking-tight">
                {t("questFinaleTitle", lang)}
              </h2>
              <p className="mt-3 text-slate-100 leading-relaxed">
                {questLine.ending}
              </p>
              <div className="mt-4 inline-block rounded-full bg-amber-500/30 ring-1 ring-amber-300/50 px-4 py-1.5 text-sm font-bold text-amber-200">
                ⭐ {totalXp} XP earned
              </div>
            </div>
          )}

          {/* Reset */}
          <div className="mt-6 text-center">
            <button
              onClick={reset}
              className="text-xs text-slate-400 hover:text-slate-200 underline underline-offset-2"
            >
              ↻ {t("questResetBtn", lang)}
            </button>
          </div>
        </div>
      </main>
    );
  }

  // -------------------- VIEW: Character pick --------------------
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[1100px] px-4 md:px-8 py-8 md:py-10">
        <div className="mb-6 text-center">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-fuchsia-200 via-white to-violet-200 bg-clip-text text-transparent">
            {t("questTitle", lang)}
          </h1>
          <p className="text-slate-400 text-sm md:text-base mt-2 max-w-xl mx-auto">
            {t("questSubtitle", lang)}
          </p>
        </div>

        <h2 className="text-lg font-semibold text-slate-200 mb-4">
          {t("questPickCharacter", lang)}
        </h2>

        <div className="grid gap-4 md:grid-cols-3 mb-6">
          {CHARACTERS.map((c) => (
            <button
              key={c.id}
              onClick={() => setCharacter(c.id)}
              className={`text-left rounded-2xl p-5 ring-1 transition card-hover bg-gradient-to-br ${c.gradient} ${
                character === c.id
                  ? "ring-violet-300 shadow-xl shadow-violet-500/40 scale-[1.02]"
                  : "ring-slate-700"
              }`}
            >
              <div className="text-5xl mb-3">{c.emoji}</div>
              <div className="text-lg font-bold text-white">
                {t(c.nameKey, lang)}
              </div>
              <p className="mt-1 text-xs text-slate-200 leading-relaxed">
                {t(c.descKey, lang)}
              </p>
              {character === c.id && (
                <div className="mt-2 text-xs font-semibold text-violet-100">
                  ✓
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={beginAdventure}
            disabled={!character || loading}
            className="rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-rose-500 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3 text-base font-black text-white shadow-xl shadow-fuchsia-500/40 transition"
          >
            {loading ? `⏳ ${t("questGenerating", lang)}` : `🎲 ${t("questBegin", lang)}`}
          </button>
          {error &&
            (isApiKeyMissingError(error) ? (
              <div className="mt-4">
                <ApiKeyMissingCard lang={lang} />
              </div>
            ) : (
              <p className="mt-3 text-xs text-rose-400">{error}</p>
            ))}
        </div>
      </div>
    </main>
  );
}
