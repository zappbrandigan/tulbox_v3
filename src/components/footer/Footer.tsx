import { trackEvent } from "@/utils";
// import { GitCommitHorizontal } from 'lucide-react';

import { useState } from "react";
import {
  GitCommitHorizontal,
  Copy,
  Check,
  MessageSquare,
  BookOpen,
  Activity,
  Keyboard,
} from "lucide-react";

export default function AppFooter({
  appName,
  setShowShortcut,
}: {
  appName: string;
  setShowShortcut: (v: boolean) => void;
}) {
  const [copied, setCopied] = useState(false);

  const version = __APP_VERSION__;
  const commit = __APP_COMMIT__.substring(0, 7);
  const note = `
Note to sender: You can use Markdown formatting in the template above if you know it — for example:

- **bold** for bold
- *italic* for italic
- Backticks like \`this\` for code or field names
- Dashes (-) or numbers (1.) for lists, etc.

No worries if you don't — standard email formatting is totally fine! Feel free to add or remove sections in the above template
based no your needs. You can also remove this note before sending.
  `;
  const emailTemplate = `
Hi Brandon,

I noticed a bug or have feedback about ${appName}. Here are the details:

---

**What happened?**
(Briefly describe the issue or feedback)

[e.g., "I tried uploading a file but it didn't show up in the list."]

**What did you expect to happen?**
[e.g., "I expected the file to appear in the summary table."]

**Steps to reproduce (if applicable):**
1. Go to...
2. Click...
3. Upload/select/etc...

**Browser & Device (optional):**
[e.g., Safari on Mac, Chrome on Windows, etc.]

**Additional notes or screenshots (optional):**
[Paste any useful notes or attach screenshots]

---

${note}

Thanks!
`.trim();

  const requestTemplate = `
Hi Brandon,

I'd like to request a new feature/tool for ${appName} or report in the CWR tool. Here are the details:

---

**What are you trying to do?**
(Describe the task or workflow you're working on)

[e.g., "I want to generate a report that shows all OPU publishers grouped by writer."]

**What would you like to see added or changed?**
(Describe the new feature, option, or report you'd like)

[e.g., "A CSV export that includes writer name, publisher name, and their share percentage."]

**How would this help you or your team?**
(Explain how it would save time, reduce errors, or improve workflows)

[e.g., "We manually build this report every week for finance, and it's very time-consuming."]

**Anything else you want to include?**
[Mockups, examples, extra notes, etc.]

---

${note}

Thanks!`;

  const copyBuild = async () => {
    try {
      await navigator.clipboard.writeText(`v${version}-${commit}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      console.log();
    }
  };

  return (
    <footer className="w-full bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur border-t border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2">
        {/* 3-column utility bar; perfect center alignment on all widths */}
        <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-y-2 text-xs text-gray-600 dark:text-gray-400">
          {/* LEFT: brand + quick nav */}
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <span aria-label="TūlBOX copyright">
              © {new Date().getFullYear()} TūlBOX
            </span>
            <nav
              aria-label="Footer navigation"
              className="hidden sm:flex items-center gap-3"
            >
              <a
                href="https://docs.tulbox.app"
                className="inline-flex items-center gap-1 hover:underline underline-offset-2"
              >
                <BookOpen className="h-3.5 w-3.5" /> Docs
              </a>
              <span className="inline-flex items-center gap-1">
                <Activity className="h-3.5 w-3.5 text-emerald-600" /> Status
              </span>
              <button
                onClick={() => setShowShortcut(true)}
                className="inline-flex items-center gap-1 hover:underline underline-offset-2"
              >
                <Keyboard className="h-3.5 w-3.5 text-blue-600" /> Shortcuts
              </button>
            </nav>
          </div>

          {/* CENTER: version & commit with copy */}
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-gray-950/40 px-2.5 py-1">
              <span className="tabular-nums">v{version}</span>
              <GitCommitHorizontal className="h-3.5 w-3.5 opacity-70" />
              <span className="font-mono text-[11px] leading-none">
                {commit}
              </span>
              <button
                type="button"
                onClick={copyBuild}
                className="ml-1 rounded-md px-1 py-0.5 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Copy version and commit"
                title="Copy build (v + commit)"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5 opacity-80" />
                )}
              </button>
            </div>
          </div>

          {/* RIGHT: action chips */}
          <div className="flex items-center justify-center sm:justify-end gap-2">
            <a
              href={`mailto:brandon@tulbox.app?subject=Bug/Feedback:%20v${version}-${commit}&body=${encodeURIComponent(
                emailTemplate,
              )}`}
              onClick={() =>
                trackEvent("bugs_link_click", { label: "Bugs Link Clicked" })
              }
              className="inline-flex items-center gap-1 rounded-full border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-950/40 px-2.5 py-1 hover:shadow"
            >
              <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
              Feedback
            </a>
            <a
              href={`mailto:brandon@tulbox.app?subject=Request:%20v${version}-${commit}&body=${encodeURIComponent(
                requestTemplate,
              )}`}
              onClick={() =>
                trackEvent("request_link_click", {
                  label: "Request Link Clicked",
                })
              }
              className="inline-flex items-center gap-1 rounded-full border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-950/40 px-2.5 py-1 hover:shadow"
            >
              <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
              Request
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
