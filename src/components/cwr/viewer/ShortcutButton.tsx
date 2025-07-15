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
  return (
    <button
      title={title}
      onClick={() => toggle((prev) => !prev)}
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
