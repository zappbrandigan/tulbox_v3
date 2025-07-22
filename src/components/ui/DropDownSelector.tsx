import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

export interface DropdownOption {
  id: string;
  name: string;
  disabled?: boolean;
}

interface DropdownSelectorProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  icon?: React.ReactNode;
  className?: string;
}

export const DropdownSelector: React.FC<DropdownSelectorProps> = ({
  id,
  label,
  value,
  onChange,
  options,
}) => {
  const selectedOption = options.find((opt) => opt.id === value);

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
      >
        {label}
      </label>
      <Listbox value={value} onChange={onChange}>
        <ListboxButton
          id={id}
          className={clsx(
            'relative block w-48 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-1.5 pl-3 pr-8 text-left text-sm text-gray-900 dark:text-gray-100',
            'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-gray/25'
          )}
        >
          {selectedOption?.name ?? 'Select'}
          <ChevronDown
            className="group pointer-events-none absolute top-2.5 right-2.5 size-4 text-gray-400"
            aria-hidden="true"
          />
        </ListboxButton>
        <ListboxOptions
          anchor="bottom"
          transition
          className={clsx(
            'mt-1 w-48 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/70 backdrop-blur-md [--anchor-gap:--spacing(1)] p-1 z-50',
            'transition duration-100 ease-in data-leave:data-closed:opacity-0 focus:outline-none'
          )}
        >
          {options.map((opt) => (
            <ListboxOption key={opt.id} value={opt.id} disabled={opt.disabled}>
              {({ focus, selected, disabled }) => (
                <div
                  className={clsx(
                    'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-gray-900 dark:text-gray-200 select-none cursor-default',
                    focus && 'bg-gray-100 dark:bg-gray-700',
                    selected && 'text-blue-700 dark:text-white',
                    disabled &&
                      'text-gray-300 dark:text-gray-400 opacity-50 cursor-not-allowed'
                  )}
                >
                  <Check
                    className={clsx(
                      `w-4 h-4 text-blue-600 dark:text-blue-300`,
                      !selected && 'invisible'
                    )}
                    aria-hidden="true"
                  />
                  <span>{opt.name}</span>
                </div>
              )}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>
    </div>
  );
};
