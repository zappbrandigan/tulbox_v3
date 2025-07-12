interface ShortcutButtonProps {
  children: React.ReactNode;
  toggle: (value: React.SetStateAction<boolean>) => void;
}

const ShortcutButton: React.FC<ShortcutButtonProps> = ({
  children,
  toggle,
}) => {
  return (
    <button
      onClick={() => toggle((prev) => !prev)}
      className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 px-3 py-1 text-md font-medium text-gray-400 transition hover:text-blue-500 hover:border-blue-500 focus:outline-none"
    >
      {children}
    </button>
  );
};

export default ShortcutButton;
