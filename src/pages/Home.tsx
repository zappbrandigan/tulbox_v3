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
import { useEffect } from 'react';
import { trackEvent } from '@/utils';

export default function RootHub() {
  const changelog: ChangeItem[] = [
    {
      date: '2025-08-18',
      tag: 'New',
      title: 'Info Page and Direct URL Support',
      summary:
        'This page! Also, users can now access tools via a direct URL path.',
      link: 'https://docs.tulbox.app/blog/2025/08/18/update',
    },
    {
      date: '2025-08-14',
      tag: 'New',
      title: 'CWR Converter now has IP report',
      summary:
        'A new interested party report for CWRs. This report includes all interested parties present in the CWR file.',
      link: 'https://docs.tulbox.app/changelog#346',
    },
    {
      date: '2025-08-12',
      tag: 'Improvement',
      title: 'PDF Manager transliteration',
      summary:
        'T1 and T2 templates now tranliterate foreign titles -- no more manually replaceing foreign characters.',
      link: 'https://docs.tulbox.app/blog/2025/08/12/update',
    },
    {
      date: '2025-08-11',
      tag: 'Improvement',
      title: 'Sortable tables in PD Search and PDF Manager',
      summary: 'Faster scanning and copying with keyboard-friendly navigation.',
      link: 'https://docs.tulbox.app/blog/2025/08/12/update',
    },
  ];

  const roadmap: RoadmapItem[] = [
    {
      id: 'auth',
      title: 'User Authentication',
      summary: 'Users will be required to signup and login to use the app.',
      stage: 'Next',
      eta: 'Oct 2025',
      icon: <ShieldUser />,
    },
    {
      id: 'prod-search',
      title: 'Production Search — improved results',
      summary: 'Improved search results when searching by category.',
      stage: 'Now',
      progress: 60,
      eta: 'Sep 2025',
      icon: <Search />,
    },
    {
      id: 'aor-report',
      title: 'New CWR Report',
      summary: 'Add assignment of rights report to the CWR Converter.',
      stage: 'Now',
      progress: 5,
      eta: 'Sep 2025',
      icon: <FileSpreadsheet />,
    },
    {
      id: 'cue-format-1',
      title: 'Cue Sheet Converter Formats',
      summary: 'Add support for RapidCue cue sheet format.',
      stage: 'Now',
      progress: 15,
      eta: 'Oct 2025',
      icon: <LetterText />,
    },
    {
      id: 'cue-format-2',
      title: 'Cue Sheet Converter Formats',
      summary: 'Add support for Cuetrak cue sheet format.',
      stage: 'Next',
      eta: 'Q4 2025',
      icon: <LetterText />,
    },
    {
      id: 'stamping',
      title: 'Cue Sheet Stamping Tool',
      summary: 'Automatically stamp PDF cue sheets.',
      stage: 'Later',
      eta: 'Q4 2025',
      icon: <Stamp />,
    },
    {
      id: 'ext',
      title: 'Browser Extension',
      summary:
        'A new browser extension to connect directly to internal systems.',
      stage: 'Later',
      eta: 'Q4 2025',
      icon: <Globe />,
    },
  ];

  const STAGES: RoadmapItem['stage'][] = ['Now', 'Next', 'Later'];

  useEffect(() => {
    trackEvent('screen_view', {
      firebase_screen: 'HomePage',
      firebase_screen_class: 'HomePage',
    });
  }, []);

  return (
    <>
      <PageMeta
        title="TūlBOX"
        description="A growing browser-based toolkit to support music publishing administration. Featured tools include CWR and sheet converters."
      />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 text-gray-900 dark:text-gray-100">
        <section className="mb-8">
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {changelog.map((item, i) => (
              <motion.article
                key={item.title}
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
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {STAGES.map((stage) => {
                const items = roadmap.filter((r) => r.stage === stage);
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
                      {items.map((r) => {
                        return (
                          <li key={r.id}>
                            <div className="group block rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:border-gray-300 dark:hover:border-gray-700 transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-cyan-500/60 dark:focus-within:ring-cyan-400/60">
                              <div className="flex items-start gap-3">
                                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
                                  {r.icon ?? <Rocket className="h-4 w-4" />}
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
                                          {r.progress}% • ETA {r.eta ?? '—'}
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
                        );
                      })}
                    </ul>
                  </section>
                );
              })}
            </div>

            {/* Footer actions */}
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

// --- types & helpers ---

type RoadmapItem = {
  id: string;
  title: string;
  summary: string;
  stage: 'Now' | 'Next' | 'Later';
  progress?: number; // 0–100 for "Now" items
  eta?: string; // e.g., "Sep 2025" or "Q4 2025"
  to?: string; // internal route
  icon?: React.ReactNode;
};

type ChangeItem = {
  date: string; // YYYY-MM-DD
  tag?: 'New' | 'Improvement' | 'Fix' | string;
  title: string;
  summary: string;
  link?: string;
};

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
