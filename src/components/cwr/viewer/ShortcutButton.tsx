import { logUserEvent } from '@/utils/general/logEvent';
import { useSession } from '@/stores/session';

interface ShortcutButtonProps {
  children: React.ReactNode;
  title?: string;
  active: boolean;
  toggle: (value: React.SetStateAction<boolean>) => void;
}

const ShortcutButton: React.FC<ShortcutButtonProps> = ({
  children,
  toggle,
  title = 'Shortcut',
  active,
}) => {
  const sessionId = useSession((s) => s.sessionId);

  const handleClick = () => {
    toggle((prev) => !prev);
    logUserEvent(
      sessionId,
      'Shortcut Button Clicked',
      {
        action: 'ui-interaction',
        target: 'cwr-converter',
        value: title,
      },
      'cwr-converter'
    );
  };

  return (
    <button
      title={title}
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 rounded-full border ${
        active
          ? 'border-blue-500 text-blue-500'
          : 'border-gray-300 text-gray-400'
      } px-3 py-1 text-md font-medium transition hover:text-blue-500 hover:border-blue-500 focus:outline-none`}
    >
      {children}
    </button>
  );
};

export default ShortcutButton;
