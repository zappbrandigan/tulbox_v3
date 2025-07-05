import React from 'react';

interface FooterProps {
  appName: string;
}

const Footer: React.FC<FooterProps> = ({ appName }) => {
  const version = __APP_VERSION__;
  const updated = new Date(__APP_UPDATED__).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const commit = __APP_COMMIT__.substring(0, 6);
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
    <footer className="w-full py-3 text-xs text-gray-500 flex flex-col items-center space-y-1">
      <div className="text-gray-400">
        v{version} • {commit}
      </div>
      <div className="text-gray-400">Last Updated {updated}</div>
      <span>
        <a
          href={`mailto:brandon@tulbox.app?subject=Bug/Feedback:%20v${version}-${commit}&body=${encodeURIComponent(
            emailTemplate
          )}`}
          className="text-blue-500 hover:underline"
        >
          Feedback/Bug Report
        </a>
        {` • `}
        <a
          href={`mailto:brandon@tulbox.app?subject=Request:%20v${version}-${commit}&body=${encodeURIComponent(
            requestTemplate
          )}`}
          className="text-blue-500 hover:underline"
        >
          Requests
        </a>
      </span>
    </footer>
  );
};

export default Footer;
