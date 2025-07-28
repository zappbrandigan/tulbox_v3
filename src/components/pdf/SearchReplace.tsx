import React, { useState } from 'react';
import {
  Plus,
  Search,
  Trash2,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  Regex,
} from 'lucide-react';
import { SearchReplaceRule } from '@/types';
import { useToast, useShortcut } from '@/hooks';
import { Panel } from '@/components/ui';
import commonReplacements from '@/constants/searchAndReplaceTemplates';

const createRuleFromTemplate = (
  template: (typeof commonReplacements)[number],
  index: number
): SearchReplaceRule => ({
  id: `${Date.now().toString()}-${Math.random()
    .toString(36)
    .slice(2)}-${index}`,
  searchPattern: template.search,
  replaceWith: template.replace,
  isRegex: template.regex,
  isEnabled: true,
});

const Header = ({
  showAdvanced,
  setShowAdvanced,
  onRulesChange,
  rules,
}: {
  showAdvanced: boolean;
  setShowAdvanced: React.Dispatch<React.SetStateAction<boolean>>;
  onRulesChange: (rules: SearchReplaceRule[]) => void;
  rules: SearchReplaceRule[];
}) => {
  const addRule = () => {
    const newRule: SearchReplaceRule = {
      id: Date.now().toString(),
      searchPattern: '',
      replaceWith: '',
      isRegex: false,
      isEnabled: true,
    };
    onRulesChange([...rules, newRule]);
  };

  useShortcut({
    'mod+h': () => setShowAdvanced((prev) => !prev),
  });

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Search className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Search & Replace
        </h3>
      </div>
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setShowAdvanced((prev) => !prev)}
          className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          {showAdvanced ? 'Hide Templates' : 'Show Templates'}
        </button>
        <button
          onClick={addRule}
          className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Rule
        </button>
      </div>
    </div>
  );
};

const TemplateGrid = ({
  showAdvanced,
  rules,
  onRulesChange,
}: {
  showAdvanced: boolean;
  rules: SearchReplaceRule[];
  onRulesChange: (rules: SearchReplaceRule[]) => void;
}) => {
  if (!showAdvanced) return null;

  return (
    <div className="mb-3 mt-3 p-4 bg-blue-50 dark:bg-slate-700 rounded-lg border border-blue-200 dark:border-blue-700">
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        {commonReplacements.map((template, index) => (
          <button
            key={index}
            title={`${template.desc} (ctrl+${index + 1})`}
            onClick={() => {
              const newRule = createRuleFromTemplate(template, index);
              onRulesChange([...rules, newRule]);
            }}
            className="text-left p-2 text-sm bg-white dark:bg-gray-800 rounded border border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-400 transition-colors truncate"
          >
            <div className="font-medium text-blue-900 dark:text-blue-100">
              {template.name}
            </div>
            <div className="text-blue-600 dark:text-blue-300 text-xs">
              {template.search} → {template.replace}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const Inputs = ({
  rule,
  updateRule,
}: {
  rule: SearchReplaceRule;
  updateRule: (id: string, updates: Partial<SearchReplaceRule>) => void;
}) => {
  const validateRegex = (pattern: string): boolean => {
    try {
      new RegExp(pattern);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label
          htmlFor={rule.id}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Search Pattern
        </label>
        <input
          type="text"
          id={rule.id}
          name="search-pattern"
          value={rule.searchPattern}
          onChange={(e) =>
            updateRule(rule.id, { searchPattern: e.target.value })
          }
          autoComplete="off"
          placeholder="Enter search pattern..."
          className={`w-full px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            rule.isRegex &&
            rule.searchPattern &&
            !validateRegex(rule.searchPattern)
              ? 'border-red-300 bg-red-50 dark:border-red-500 dark:bg-red-900 text-red-900'
              : 'border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white'
          }`}
          disabled={!rule.isEnabled}
        />
        {rule.isRegex &&
          rule.searchPattern &&
          !validateRegex(rule.searchPattern) && (
            <div className="mt-1 flex items-center text-xs text-red-600 dark:text-red-300">
              <AlertCircle className="w-3 h-3 mr-1" />
              Invalid regex pattern
            </div>
          )}
      </div>
      <div>
        <label
          htmlFor={`${rule.id}-replace`}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Replace With
        </label>
        <input
          type="text"
          id={`${rule.id}-replace`}
          name="replacement"
          value={rule.replaceWith}
          onChange={(e) => updateRule(rule.id, { replaceWith: e.target.value })}
          autoComplete="off"
          placeholder="Enter replacement..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          disabled={!rule.isEnabled}
        />
      </div>
    </div>
  );
};

const RuleCard = ({
  rules,
  onRulesChange,
}: {
  rules: SearchReplaceRule[];
  onRulesChange: (rules: SearchReplaceRule[]) => void;
}) => {
  if (rules.length === 0) return null;
  const updateRule = (id: string, updates: Partial<SearchReplaceRule>) => {
    onRulesChange(
      rules.map((rule) => (rule.id === id ? { ...rule, ...updates } : rule))
    );
  };

  const removeRule = (id: string) => {
    onRulesChange(rules.filter((rule) => rule.id !== id));
  };

  const Header = ({ rule }: { rule: SearchReplaceRule }) => (
    <div className="flex items-center justify-between mb-3">
      <button
        onClick={() => updateRule(rule.id, { isEnabled: !rule.isEnabled })}
        className="flex items-center space-x-2 text-sm font-medium"
      >
        {rule.isEnabled ? (
          <ToggleRight className="w-5 h-5 text-blue-600" />
        ) : (
          <ToggleLeft className="w-5 h-5 text-gray-400" />
        )}
        <span
          className={
            rule.isEnabled
              ? 'text-gray-900 dark:text-white'
              : 'text-gray-500 dark:text-gray-400'
          }
        >
          Rule {rules.indexOf(rule) + 1}
        </span>
      </button>
      <button
        onClick={() => removeRule(rule.id)}
        className="text-red-600 hover:text-red-700 dark:hover:text-red-400 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-4 mt-3">
      {rules.map((rule) => (
        <div
          key={rule.id}
          className={`p-4 rounded-lg transition-all ${
            rule.isEnabled
              ? 'border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
              : 'border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900'
          }`}
        >
          <Header rule={rule} />

          <Inputs rule={rule} updateRule={updateRule} />

          <div className="mt-3 flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="regex"
                checked={rule.isRegex}
                onChange={(e) =>
                  updateRule(rule.id, { isRegex: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                disabled={!rule.isEnabled}
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Use Regular Expression
              </span>
            </label>
          </div>
        </div>
      ))}
    </div>
  );
};

const FooterButton = ({
  rules,
  onApply,
}: {
  rules: SearchReplaceRule[];
  onApply: () => void;
}) => {
  if (rules.length === 0) return null;

  const { showToast } = useToast();

  return (
    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-end">
      <button
        onClick={() => {
          onApply();
          showToast({
            message: 'Rule(s) applied!',
            icon: (
              <Regex className="w-4 h-4 text-blue-500 dark:text-blue-300" />
            ),
          });
        }}
        disabled={
          rules.filter((r) => r.isEnabled && r.searchPattern).length === 0
        }
        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
      >
        Apply Rules (
        {rules.filter((r) => r.isEnabled && r.searchPattern).length})
      </button>
    </div>
  );
};

const SearchReplace = ({
  rules,
  onRulesChange,
  onApply,
}: {
  rules: SearchReplaceRule[];
  onRulesChange: (rules: SearchReplaceRule[]) => void;
  onApply: () => void;
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  useShortcut(
    commonReplacements.reduce((acc, template, index) => {
      acc[`mod+${index + 1}`] = (e: KeyboardEvent) => {
        e.preventDefault();
        const newRule = createRuleFromTemplate(template, index);
        onRulesChange([...rules, newRule]);
      };
      return acc;
    }, {} as { [combo: string]: (e: KeyboardEvent) => void }),
    [rules]
  );

  return (
    <Panel>
      <Header
        showAdvanced={showAdvanced}
        setShowAdvanced={setShowAdvanced}
        rules={rules}
        onRulesChange={onRulesChange}
      />

      <TemplateGrid
        showAdvanced={showAdvanced}
        rules={rules}
        onRulesChange={onRulesChange}
      />

      <RuleCard rules={rules} onRulesChange={onRulesChange} />

      <FooterButton rules={rules} onApply={onApply} />
    </Panel>
  );
};

export default SearchReplace;
