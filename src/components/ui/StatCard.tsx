import { clsx } from 'clsx';

interface Props {
  value: React.ReactNode;
  label: string;
  bg: string;
  text: string;
  onClick?: () => void;
  clickable?: boolean;
}

const StatCard: React.FC<Props> = ({
  value,
  label,
  bg,
  text,
  onClick,
  clickable,
}) => {
  const isClickable = clickable ?? (!!onClick && Number(value) > 0);

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      className={clsx(
        'flex flex-col justify-center items-center text-center p-4 rounded-lg transition-colors',
        bg,
        isClickable &&
          'hover:cursor-pointer hover:scale-[1.05] transform transition-all transition-transform duration-400 ease-in-out hover:ring-1'
      )}
    >
      <div className={clsx('text-2xl font-bold', text)}>{value}</div>
      <div className={clsx('text-sm', text.replace('600', '800'))}>{label}</div>
    </div>
  );
};

export default StatCard;
