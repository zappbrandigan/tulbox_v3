import React, { useState } from 'react';
import { Plus, Search, Trash2, ToggleLeft, ToggleRight, AlertCircle, FileText } from 'lucide-react';
import { SearchReplaceRule } from '../types';

interface SearchReplaceProps {
  rules: SearchReplaceRule[];
  onRulesChange: (rules: SearchReplaceRule[]) => void;
  onApply: () => void;
}

const SearchReplace: React.FC<SearchReplaceProps> = ({ rules, onRulesChange, onApply }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

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

  const updateRule = (id: string, updates: Partial<SearchReplaceRule>) => {
    onRulesChange(rules.map(rule => 
      rule.id === id ? { ...rule, ...updates } : rule
    ));
  };

  const removeRule = (id: string) => {
    onRulesChange(rules.filter(rule => rule.id !== id));
  };

  const validateRegex = (pattern: string): boolean => {
    try {
      new RegExp(pattern);
      return true;
    } catch {
      return false;
    }
  };

  const applyCueSheetTemplate = () => {
  const cueSheetRule: SearchReplaceRule = {
    id: Date.now().toString(),
    searchPattern: '.*',
    replaceWith: 'CUE_SHEET_TEMPLATE',
    isRegex: true,
    isEnabled: true,
  };
    onRulesChange([...rules, cueSheetRule]);
  };

  const commonReplacements = [
    { name: 'Dotify filename', search: 'dotify', replace: '', regex: false },
    { name: 'Remove spaces', search: ' ', replace: '_', regex: false },
    { name: 'Replace underscores', search: '_', replace: '-', regex: false },
    { name: 'Lowercase extension', search: '\\.PDF$', replace: '.pdf', regex: true },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Search className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Search & Replace</h3>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
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

      {/* Cue Sheet Template */}
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-purple-600" />
            <h4 className="text-sm font-semibold text-purple-900">Cue Sheet Convention</h4>
          </div>
          <button
            onClick={applyCueSheetTemplate}
            className="px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            Apply Template
          </button>
        </div>
      </div>

      {showAdvanced && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-3">Quick Templates</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {commonReplacements.map((template, index) => (
              <button
                key={index}
                onClick={() => {
                  const newRule: SearchReplaceRule = {
                    id: Date.now().toString() + index,
                    searchPattern: template.search,
                    replaceWith: template.replace,
                    isRegex: template.regex,
                    isEnabled: true,
                  };
                  onRulesChange([...rules, newRule]);
                }}
                className="text-left p-2 text-sm bg-white rounded border border-blue-200 hover:border-blue-300 transition-colors"
              >
                <div className="font-medium text-blue-900">{template.name}</div>
                <div className="text-blue-600 text-xs">{template.search} → {template.replace}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`p-4 border rounded-lg transition-all ${
              rule.isEnabled 
                ? 'border-gray-200 bg-white' 
                : 'border-gray-100 bg-gray-50'
            }`}
          >
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
                <span className={rule.isEnabled ? 'text-gray-900' : 'text-gray-500'}>
                  Rule {rules.indexOf(rule) + 1}
                </span>
              </button>
              <button
                onClick={() => removeRule(rule.id)}
                className="text-red-600 hover:text-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Pattern
                </label>
                <input
                  type="text"
                  value={rule.searchPattern}
                  onChange={(e) => updateRule(rule.id, { searchPattern: e.target.value })}
                  placeholder="Enter search pattern..."
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    rule.isRegex && rule.searchPattern && !validateRegex(rule.searchPattern)
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  disabled={!rule.isEnabled}
                />
                {rule.isRegex && rule.searchPattern && !validateRegex(rule.searchPattern) && (
                  <div className="mt-1 flex items-center text-xs text-red-600">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Invalid regex pattern
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Replace With
                </label>
                <input
                  type="text"
                  value={rule.replaceWith}
                  onChange={(e) => updateRule(rule.id, { replaceWith: e.target.value })}
                  placeholder="Enter replacement..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!rule.isEnabled}
                />
              </div>
            </div>

            <div className="mt-3 flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rule.isRegex}
                  onChange={(e) => updateRule(rule.id, { isRegex: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={!rule.isEnabled}
                />
                <span className="ml-2 text-sm text-gray-700">Use Regular Expression</span>
              </label>
            </div>
          </div>
        ))}
      </div>

      {rules.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p>No search and replace rules yet</p>
          <p className="text-sm">Add rules to batch rename your files</p>
        </div>
      )}

      {rules.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onApply}
            disabled={rules.filter(r => r.isEnabled && r.searchPattern).length === 0}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Apply Rules ({rules.filter(r => r.isEnabled && r.searchPattern).length})
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchReplace;