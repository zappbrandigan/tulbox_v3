interface Props {
  progress: number;
  message: string;
}

const Progress: React.FC<Props> = ({ progress, message }) => {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 rounded-2xl shadow-md 
  bg-white dark:bg-gray-900 p-8 min-h-[235px] text-center transition-all duration-300"
    >
      {/* Label */}
      <span className="text-base font-semibold tracking-tight text-gray-700 dark:text-gray-100">
        {message}&hellip;{' '}
        {progress < 1 && (
          <span className="text-blue-600 dark:text-blue-400">
            {Math.round(progress * 100)}%
          </span>
        )}
      </span>

      {/* Progress Track */}
      <div
        className="w-full max-w-md h-4 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden relative"
        role="progressbar"
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {/* Filled Bar */}
        <div
          className="h-full bg-blue-500 relative transition-all duration-100 ease-out"
          style={{ width: `${progress * 100}%` }}
        >
          {/* Fading gradient mask overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-200 dark:from-blue-400 dark:to-blue-300 
          pointer-events-none transition-opacity duration-700"
            style={{ opacity: 1 - progress }}
          />
        </div>
      </div>
    </div>
  );
};

export default Progress;
