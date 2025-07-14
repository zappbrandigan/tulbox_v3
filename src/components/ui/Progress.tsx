interface Props {
  progress: number;
  message: string;
}

const Progress: React.FC<Props> = ({ progress, message }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4shadow-sm rounded-xl p-8 min-h-[235px] text-center">
      {/* label */}
      <span className="text-sm font-medium text-gray-600">
        {message}&hellip; {Math.round(progress * 100)}%
      </span>

      {/* progress track */}
      <div
        className="w-full max-w-md h-3 rounded-full bg-gray-300 overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {/* animated bar */}
        <div
          className="h-full animate-progress-bar"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
};

export default Progress;
