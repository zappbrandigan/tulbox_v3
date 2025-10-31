import { Link } from 'react-router';
import { motion } from 'framer-motion';
import {
  Bell,
  Rocket,
  ChevronRight,
  ShieldUser,
  LetterText,
  FileSpreadsheet,
  Search,
  Stamp,
  Globe,
} from 'lucide-react';
import { PageMeta } from '@/PageMeta';
import { useEffect, useMemo, useState } from 'react';
import { trackEvent } from '@/utils';

// --- types ---
type RoadmapStage = 'Now' | 'Next' | 'Later';
type ChangeItem = {
  date: string;
  tag?: 'New' | 'Improvement' | 'Fix' | string;
  title: string;
  summary: string;
  link?: string;
};
type RemoteRoadmapItem = {
  id: string;
  title: string;
  summary: string;
  stage: RoadmapStage;
  progress?: number;
  eta?: string;
  icon?: keyof typeof ICONS; // name from JSON
};
type RoadmapItem = RemoteRoadmapItem & { iconNode?: React.ReactNode };

const ICONS = {
  ShieldUser: <ShieldUser className="h-4 w-4" />,
  Search: <Search className="h-4 w-4" />,
  FileSpreadsheet: <FileSpreadsheet className="h-4 w-4" />,
  LetterText: <LetterText className="h-4 w-4" />,
  Stamp: <Stamp className="h-4 w-4" />,
  Globe: <Globe className="h-4 w-4" />,
  Rocket: <Rocket className="h-4 w-4" />,
} as const;

const STAGES: RoadmapStage[] = ['Now', 'Next', 'Later'];

export default function RootHub() {
  const [changelog, setChangelog] = useState<ChangeItem[] | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_REQUEST_URL}/files/internal/home`,
          {
            cache: 'no-store',
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as {
          changelog: ChangeItem[];
          roadmap: RemoteRoadmapItem[];
        };

        const mappedRoadmap: RoadmapItem[] = (json.roadmap ?? []).map((r) => ({
          ...r,
          iconNode: r.icon ? ICONS[r.icon] : undefined,
        }));

        setChangelog(json.changelog ?? []);
        setRoadmap(mappedRoadmap);
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError('Failed to load');
        }
      }
    })();

    trackEvent('screen_view', {
      firebase_screen: 'HomePage',
      firebase_screen_class: 'HomePage',
    });
  }, []);

  const grouped = useMemo(() => {
    if (!roadmap)
      return { Now: [], Next: [], Later: [] } as Record<
        RoadmapStage,
        RoadmapItem[]
      >;
    return {
      Now: roadmap.filter((r) => r.stage === 'Now'),
      Next: roadmap.filter((r) => r.stage === 'Next'),
      Later: roadmap.filter((r) => r.stage === 'Later'),
    };
  }, [roadmap]);

  return (
    <>
      <PageMeta
        title="TūlBOX"
        description="A growing browser-based toolkit to support music publishing administration. Featured tools include CWR and sheet converters."
      />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-gray-900 dark:text-gray-100">
        {/* --- What's New --- */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-800">
                <Bell className="h-4 w-4" />
              </span>
              What&apos;s New
            </h2>
            <Link
              to="https://docs.tulbox.app/blog"
              className="text-sm text-cyan-700 dark:text-cyan-300 hover:text-cyan-800 dark:hover:text-cyan-200 hover:underline underline-offset-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/60 dark:focus-visible:ring-cyan-400/60 rounded"
            >
              View all
            </Link>
          </div>

          {/* Loading / Error / Data states */}
          {!changelog && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 animate-pulse h-28"
                />
              ))}
            </div>
          )}
          {error && (
            <div className="text-sm text-rose-600 dark:text-rose-300">
              Failed to load updates: {error}
            </div>
          )}

          {changelog && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {changelog.map((item, i) => (
                <motion.article
                  key={`${item.title}-${item.date}-${i}`}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.35, delay: i * 0.04 }}
                  className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm transition-colors"
                >
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <Tag label={item.tag || 'Update'} />
                    <time dateTime={item.date}>{formatDate(item.date)}</time>
                  </div>
                  <h3 className="mt-2 font-semibold leading-snug">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                    {item.summary}
                  </p>
                  <div className="mt-3">
                    <Link
                      to={item.link || '/changelog'}
                      className="inline-flex items-center gap-1 text-sm text-cyan-700 dark:text-cyan-300 hover:text-cyan-800 dark:hover:text-cyan-200 hover:underline underline-offset-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/60 dark:focus-visible:ring-cyan-400/60 rounded"
                    >
                      Learn more <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </section>

        {/* --- Roadmap --- */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-3 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
                  <Rocket className="size-4" />
                </span>
                <h2 className="text-lg font-semibold">Roadmap</h2>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Updated{' '}
                {new Date().toLocaleDateString(undefined, {
                  month: 'short',
                  day: '2-digit',
                })}
              </div>
            </div>

            {!roadmap && !error && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-950/40 p-3"
                  >
                    <div className="h-24 animate-pulse bg-gray-200 dark:bg-gray-800 rounded" />
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="text-sm text-rose-600 dark:text-rose-300">
                Failed to load roadmap: {error}
              </div>
            )}

            {roadmap && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {STAGES.map((stage) => {
                  const items = grouped[stage];
                  return (
                    <section
                      key={stage}
                      aria-labelledby={`roadmap-${stage}`}
                      className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-950/40 p-3 transition-colors"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <h3
                          id={`roadmap-${stage}`}
                          className="text-sm font-semibold"
                        >
                          {stage}
                        </h3>
                        <span
                          className={[
                            'text-[10px] px-2 py-0.5 rounded-full border',
                            stage === 'Now'
                              ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                              : stage === 'Next'
                              ? 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300'
                              : 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300',
                          ].join(' ')}
                        >
                          {items.length} item{items.length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      <ul className="space-y-2">
                        {items.map((r) => (
                          <li key={r.id}>
                            <div className="group block rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
                              <div className="flex items-start gap-3">
                                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
                                  {r.iconNode ?? <Rocket className="h-4 w-4" />}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium truncate">
                                    {r.title}
                                  </p>
                                  <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">
                                    {r.summary}
                                  </p>

                                  {r.stage === 'Now' &&
                                  typeof r.progress === 'number' ? (
                                    <div className="mt-2">
                                      <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                                        <span
                                          className="block h-1.5 bg-cyan-600 dark:bg-cyan-400"
                                          style={{
                                            width: `${Math.min(
                                              Math.max(r.progress, 0),
                                              100
                                            )}%`,
                                          }}
                                        />
                                      </div>
                                      <div className="mt-1 flex items-center justify-between text-[10px] text-gray-600 dark:text-gray-400">
                                        <span>In progress</span>
                                        <span>
                                          {r.progress}% • ETA {r.eta ?? 'TBD'}
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="mt-2 text-[10px] text-gray-600 dark:text-gray-400">
                                      ETA {r.eta ?? 'TBD'}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </section>
                  );
                })}
              </div>
            )}

            <div className="mt-3 flex items-center justify-between">
              <a
                href="https://docs.tulbox.app/changelog"
                className="text-xs text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 hover:underline underline-offset-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 dark:focus-visible:ring-blue-400/60 rounded"
              >
                View full changelog →
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function Tag({ label }: { label: string }) {
  const color =
    label === 'New'
      ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
      : label === 'Fix'
      ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
      : 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300';
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${color}`}
    >
      {label}
    </span>
  );
}

function formatDate(iso: string) {
  try {
    const [y, m, d] = iso.split('-').map((n) => parseInt(n, 10));
    const dt = new Date(y, (m || 1) - 1, d || 1);
    return dt.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}
