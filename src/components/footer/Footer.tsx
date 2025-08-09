import { trackEvent } from '@/utils';
import { GitCommitHorizontal } from 'lucide-react';
import React from 'react';

interface FooterProps {
  appName: string;
  setShowShortcut: React.Dispatch<React.SetStateAction<boolean>>;
}

const Footer: React.FC<FooterProps> = ({ appName, setShowShortcut }) => {
  const version = __APP_VERSION__;
  // const updated = new Date(__APP_UPDATED__).toLocaleDateString('en-US', {
  //   month: 'short',
  //   day: 'numeric',
  //   year: 'numeric',
  // });
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

Thanks!
`.trim();

  return (
    <footer
      className="w-full py-2 px-4 text-xs text-gray-500 dark:text-gray-400
    flex flex-wrap justify-center items-center gap-x-4 gap-y-1
    bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 transition-colors"
    >
      <div className="flex items-center gap-1 text-gray-500 dark:text-gray-500">
        <span>v{version}</span>
        <GitCommitHorizontal className="inline h-3 w-3 opacity-70" />
        <span>{commit}</span>
      </div>

      {/* <div className="text-gray-400 dark:text-gray-500">Updated {updated}</div> */}

      <div className="flex gap-2 items-center text-blue-600">
        <a
          href={`mailto:brandon@tulbox.app?subject=Bug/Feedback:%20v${version}-${commit}&body=${encodeURIComponent(
            emailTemplate
          )}`}
          onClick={() => {
            trackEvent('bugs_link_click', { label: 'Bugs Link Clicked' });
          }}
          className="hover:underline underline-offset-2"
        >
          Feedback
        </a>
        <span className="text-gray-400 dark:text-gray-600">|</span>
        <a
          href={`mailto:brandon@tulbox.app?subject=Request:%20v${version}-${commit}&body=${encodeURIComponent(
            requestTemplate
          )}`}
          onClick={() => {
            trackEvent('request_link_click', { label: 'Request Link Clicked' });
          }}
          className="hover:underline underline-offset-2"
        >
          Requests
        </a>
        <span className="text-gray-400 dark:text-gray-600">|</span>
        <button onClick={() => setShowShortcut(true)}>Shortcuts</button>
      </div>
    </footer>
  );
};

export default Footer;
