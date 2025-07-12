import { Command, ChevronUp } from 'lucide-react';

const ShortcutIcon = ({ text }: { text: string }) => {
  return (
    <span className="flex items-center text-sm font-mono tracking-tight leading-none">
      <span className="mr-[1px]">
        {/Mac/.test(navigator.userAgent) ? (
          <Command className="inline w-3.5 h-3.5 relative -top-px" />
        ) : (
          <ChevronUp className="inline w-4 h-4" />
        )}
      </span>
      <span className="">{text}</span>
    </span>
  );
};

export default ShortcutIcon;
