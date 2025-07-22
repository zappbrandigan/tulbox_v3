import { ReactNode } from 'react';
import clsx from 'clsx';

interface PanelProps {
  children: ReactNode;
  className?: string;
}

interface PanelHeaderProps {
  icon?: ReactNode;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
}

interface PanelBodyProps {
  children: ReactNode;
  className?: string;
}

const PanelRoot: React.FC<PanelProps> = ({ children, className }) => (
  <div
    className={clsx(
      'bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300',
      className
    )}
  >
    {children}
  </div>
);

const Header: React.FC<PanelHeaderProps> = ({
  icon,
  title,
  subtitle,
  children,
}) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 space-y-4 sm:space-y-0">
    {children ? (
      children
    ) : (
      <>
        <div className="flex items-center space-x-3">
          {icon}
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h3>
          )}
        </div>
        {subtitle && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {subtitle}
          </div>
        )}
      </>
    )}
  </div>
);

const Body: React.FC<PanelBodyProps> = ({ children, className }) => (
  <div className={clsx('mb-1', className)}>{children}</div>
);

// Attach subcomponents
const Panel = Object.assign(PanelRoot, {
  Header,
  Body,
});

export default Panel;
