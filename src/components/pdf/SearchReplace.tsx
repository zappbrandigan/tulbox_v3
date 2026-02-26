import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Trash2,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  Trash,
} from "lucide-react";
import { SearchReplaceRule } from "@/types";
import { useShortcut } from "@/hooks";
import { Panel } from "@/components/ui";
import commonReplacements from "@/constants/searchAndReplaceTemplates";
import { useToast } from "@/stores/toast";
import type { SearchReplacePreview, SearchReplaceRuleImpact } from "@/utils";

const createRuleFromTemplate = (
  template: (typeof commonReplacements)[number],
  index: number,
): SearchReplaceRule => ({
  id: `${Date.now().toString()}-${Math.random()
    .toString(36)
    .slice(2)}-${index}`,
  searchPattern: template.search,
  replaceWith: template.replace,
  isRegex: template.regex,
  isCaseInsensitive: template.ignoreCase,
  isEnabled: true,
});

const isTemplateRule = (rule: SearchReplaceRule): boolean =>
  rule.replaceWith === "CUE_SHEET" || rule.replaceWith === "CUE_SHEET_NO_EP";

const validateRegex = (pattern: string): boolean => {
  try {
    new RegExp(pattern);
    return true;
  } catch {
    return false;
  }
};

const Header = ({
  showAdvanced,
  setShowAdvanced,
  onRulesChange,
  rules,
  addRule,
}: {
  showAdvanced: boolean;
  setShowAdvanced: React.Dispatch<React.SetStateAction<boolean>>;
  onRulesChange: (rules: SearchReplaceRule[]) => void;
  rules: SearchReplaceRule[];
  addRule: () => void;
}) => {
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
          {showAdvanced ? "Hide Templates" : "Show Templates"}
        </button>
        <button
          onClick={() => onRulesChange([])}
          disabled={rules.length === 0}
          className="inline-flex items-center px-3 py-1.5 bg-amber-600 text-white text-sm font-medium rounded-md hover:bg-amber-700 transition-colors disabled:bg-gray-300"
        >
          <Trash className="w-4 h-4 mr-1" />
          Clear Rules
        </button>
        <button
          onClick={addRule}
          className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
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
    <div className="mb-3 mt-3 p-4 bg-blue-50 dark:bg-slate-700 rounded-md border border-blue-200 dark:border-blue-700">
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        {commonReplacements.map((template, index) => (
          <button
            key={index}
            title={`${template.desc} (#${index + 1})`}
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
  const [showInvalidRegex, setShowInvalidRegex] = useState(false);

  useEffect(() => {
    const shouldValidate = rule.isRegex && rule.searchPattern.length > 0;
    if (!shouldValidate || validateRegex(rule.searchPattern)) {
      setShowInvalidRegex(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShowInvalidRegex(true);
    }, 180);

    return () => window.clearTimeout(timeoutId);
  }, [rule.isRegex, rule.searchPattern]);

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
          autoFocus={!rule.searchPattern ? true : false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="Enter search pattern..."
          className={`w-full px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 read-only:focus:ring-transparent ${
            rule.isRegex &&
            rule.searchPattern &&
            showInvalidRegex
              ? "border-red-300 bg-red-50 text-red-900 dark:border-red-500 dark:bg-red-900 dark:text-red-100"
              : "border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          }`}
          disabled={!rule.isEnabled}
          readOnly={
            rule.replaceWith === "CUE_SHEET" ||
            rule.replaceWith === "CUE_SHEET_NO_EP"
          }
        />
        {rule.isRegex &&
          rule.searchPattern &&
          showInvalidRegex && (
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
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="Enter replacement..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white read-only:focus:ring-transparent"
          disabled={!rule.isEnabled}
          readOnly={
            rule.replaceWith === "CUE_SHEET" ||
            rule.replaceWith === "CUE_SHEET_NO_EP"
          }
        />
      </div>
    </div>
  );
};

const RuleCard = ({
  rules,
  onRulesChange,
  impactsByRuleId,
}: {
  rules: SearchReplaceRule[];
  onRulesChange: (rules: SearchReplaceRule[]) => void;
  impactsByRuleId: Record<string, SearchReplaceRuleImpact>;
}) => {
  if (rules.length === 0) return null;
  const updateRule = (id: string, updates: Partial<SearchReplaceRule>) => {
    onRulesChange(
      rules.map((rule) => (rule.id === id ? { ...rule, ...updates } : rule)),
    );
  };

  const removeRule = (id: string) => {
    onRulesChange(rules.filter((rule) => rule.id !== id));
  };

  const Header = ({ rule }: { rule: SearchReplaceRule }) => (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
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
                ? "text-gray-900 dark:text-white"
                : "text-gray-500 dark:text-gray-400"
            }
          >
            Rule {rules.indexOf(rule) + 1}
          </span>
        </button>
        {(() => {
          const impact = impactsByRuleId[rule.id];
          if (!impact || !rule.isEnabled) return null;
          if (impact.invalidRegex) {
            return (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                Invalid regex
              </span>
            );
          }
          if (!impact.isApplicable) {
            return (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                Empty search
              </span>
            );
          }
          return (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              Affects {impact.changedFiles} file{impact.changedFiles === 1 ? "" : "s"}
            </span>
          );
        })()}
      </div>
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
          className={`p-4 rounded-md transition-all ${
            rule.isEnabled
              ? "border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
              : "border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900"
          }`}
        >
          <Header rule={rule} />

          <Inputs rule={rule} updateRule={updateRule} />

          <div className="mt-3 flex items-center space-x-5">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="regex"
                checked={rule.isRegex}
                onChange={(e) =>
                  updateRule(rule.id, { isRegex: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                disabled={
                  !rule.isEnabled ||
                  rule.replaceWith === "CUE_SHEET" ||
                  rule.replaceWith === "CUE_SHEET_NO_EP"
                }
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Use Regex
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="caseInsensitve"
                checked={rule.isCaseInsensitive}
                onChange={(e) =>
                  updateRule(rule.id, { isCaseInsensitive: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                disabled={
                  !rule.isEnabled ||
                  rule.replaceWith === "CUE_SHEET" ||
                  rule.replaceWith === "CUE_SHEET_NO_EP"
                }
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Case Insensitive
              </span>
            </label>
          </div>
        </div>
      ))}
    </div>
  );
};

const FooterButton = ({
  hasRules,
  canUndo,
  onUndo,
  isPreviewVisible,
  onTogglePreview,
  applicableRulesCount,
  hasInvalidRegexRules,
  applyRules,
}: {
  hasRules: boolean;
  canUndo: boolean;
  onUndo: () => void;
  isPreviewVisible: boolean;
  onTogglePreview: () => void;
  applicableRulesCount: number;
  hasInvalidRegexRules: boolean;
  applyRules: () => void;
}) => {
  if (!hasRules && !canUndo) return null;

  return (
    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
      <div className="flex justify-end">
        {canUndo && (
          <button
            onClick={onUndo}
            className="px-4 py-2 mr-2 bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-200 font-medium rounded-md hover:bg-amber-200 dark:hover:bg-amber-900 transition-colors"
          >
            Undo Last Apply
          </button>
        )}
        {hasRules && (
          <>
            <button
              onClick={onTogglePreview}
              className="px-4 py-2 mr-2 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200 font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {isPreviewVisible ? "Hide Preview" : "Show Preview"}
            </button>
            <button
              onClick={applyRules}
              disabled={applicableRulesCount === 0 || hasInvalidRegexRules}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
            >
              Apply Rules ({applicableRulesCount})
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const SearchReplace = ({
  rules,
  preview,
  onRulesChange,
  onApply,
  onUndo,
  canUndo,
  isPreviewVisible,
  onTogglePreview,
}: {
  rules: SearchReplaceRule[];
  preview: SearchReplacePreview;
  onRulesChange: (rules: SearchReplaceRule[]) => void;
  onApply: () => void;
  onUndo: () => void;
  canUndo: boolean;
  isPreviewVisible: boolean;
  onTogglePreview: () => void;
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { toast } = useToast();
  const hasInvalidRegexRules = rules.some(
    (rule) =>
      rule.isEnabled &&
      rule.isRegex &&
      rule.searchPattern.length > 0 &&
      !validateRegex(rule.searchPattern),
  );
  const applicableRulesCount = rules.filter(
    (rule) =>
      rule.isEnabled &&
      (isTemplateRule(rule) ||
        (rule.searchPattern.length > 0 &&
          (!rule.isRegex || validateRegex(rule.searchPattern)))),
  );
  const applicableRulesCountValue = applicableRulesCount.length;
  const impactsByRuleId = useMemo(
    () =>
      Object.fromEntries(preview.ruleImpacts.map((impact) => [impact.ruleId, impact])),
    [preview.ruleImpacts],
  );

  const addRule = () => {
    const newRule: SearchReplaceRule = {
      id: Date.now().toString(),
      searchPattern: "",
      replaceWith: "",
      isRegex: false,
      isCaseInsensitive: false,
      isEnabled: true,
    };
    onRulesChange([...rules, newRule]);
  };

  const applyRules = () => {
    if (hasInvalidRegexRules) {
      toast({
        description: "Fix invalid regex patterns before applying.",
        variant: "error",
      });
      return;
    }
    if (applicableRulesCountValue === 0) return;
    onApply();
    toast({
      description: "Applied search and replace rules.",
      variant: "default",
    });
  };

  useShortcut(
    {
      "mod+h": () => setShowAdvanced((prev) => !prev),
      "mod+.": () => addRule(),
      "mod+j": () => onRulesChange([]),
      "mod+shift+enter": () => {
        if (applicableRulesCountValue > 0 && !hasInvalidRegexRules) {
          applyRules();
        }
      },
      ...commonReplacements.reduce(
        (acc, template, index) => {
          acc[`mod+${index + 1}`] = () => {
            const newRule = createRuleFromTemplate(template, index);
            onRulesChange([...rules, newRule]);
          };
          return acc;
        },
        {} as { [combo: string]: (e: KeyboardEvent) => void },
      ),
    },
    [rules, applicableRulesCountValue, hasInvalidRegexRules],
  );

  return (
    <Panel>
      <Header
        showAdvanced={showAdvanced}
        setShowAdvanced={setShowAdvanced}
        rules={rules}
        onRulesChange={onRulesChange}
        addRule={addRule}
      />

      <TemplateGrid
        showAdvanced={showAdvanced}
        rules={rules}
        onRulesChange={onRulesChange}
      />

      {rules.length > 0 && (
        <div className="mt-3 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-sm text-gray-700 dark:text-gray-200">
          Will rename <span className="font-semibold">{preview.changedFiles}</span> of{" "}
          <span className="font-semibold">{preview.totalFiles}</span> files.
        </div>
      )}

      <RuleCard
        rules={rules}
        onRulesChange={onRulesChange}
        impactsByRuleId={impactsByRuleId}
      />

      <FooterButton
        hasRules={rules.length > 0}
        canUndo={canUndo}
        onUndo={onUndo}
        isPreviewVisible={isPreviewVisible}
        onTogglePreview={onTogglePreview}
        applicableRulesCount={applicableRulesCountValue}
        hasInvalidRegexRules={hasInvalidRegexRules}
        applyRules={applyRules}
      />
    </Panel>
  );
};

export default SearchReplace;
