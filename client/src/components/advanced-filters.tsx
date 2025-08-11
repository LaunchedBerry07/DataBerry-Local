import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus } from "lucide-react";

interface FilterRule {
  id: string;
  field: string;
  operator: string;
  value: string;
}

export default function AdvancedFilters() {
  const [filterRules, setFilterRules] = useState<FilterRule[]>([
    { id: "1", field: "sender", operator: "contains", value: "" }
  ]);

  const addFilterRule = () => {
    const newRule: FilterRule = {
      id: Date.now().toString(),
      field: "sender",
      operator: "contains",
      value: ""
    };
    setFilterRules([...filterRules, newRule]);
  };

  const removeFilterRule = (id: string) => {
    setFilterRules(filterRules.filter(rule => rule.id !== id));
  };

  const updateFilterRule = (id: string, updates: Partial<FilterRule>) => {
    setFilterRules(filterRules.map(rule => 
      rule.id === id ? { ...rule, ...updates } : rule
    ));
  };

  const fieldOptions = [
    { value: "sender", label: "Sender" },
    { value: "subject", label: "Subject" },
    { value: "category", label: "Category" },
    { value: "amount", label: "Amount" },
    { value: "date", label: "Date" },
    { value: "status", label: "Status" }
  ];

  const operatorOptions = [
    { value: "contains", label: "Contains" },
    { value: "equals", label: "Equals" },
    { value: "starts_with", label: "Starts with" },
    { value: "ends_with", label: "Ends with" },
    { value: "greater_than", label: "Greater than" },
    { value: "less_than", label: "Less than" },
    { value: "is_empty", label: "Is empty" },
    { value: "is_not_empty", label: "Is not empty" }
  ];

  return (
    <div className="gradient-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Advanced Filters</h3>
        <Button
          onClick={addFilterRule}
          size="sm"
          className="gradient-pink-magenta text-white action-btn"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Rule
        </Button>
      </div>

      <div className="space-y-4">
        {filterRules.map((rule, index) => (
          <div key={rule.id} className="flex items-center space-x-4">
            {index > 0 && (
              <div className="px-3 py-2 bg-primary-600/50 rounded-lg">
                <span className="text-sm font-medium text-purple-300">AND</span>
              </div>
            )}
            
            <Select 
              value={rule.field} 
              onValueChange={(value) => updateFilterRule(rule.id, { field: value })}
            >
              <SelectTrigger className="w-40 bg-primary-600/50 border-primary-500/50 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-primary-800 border-primary-600/30">
                {fieldOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={rule.operator} 
              onValueChange={(value) => updateFilterRule(rule.id, { operator: value })}
            >
              <SelectTrigger className="w-40 bg-primary-600/50 border-primary-500/50 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-primary-800 border-primary-600/30">
                {operatorOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {!["is_empty", "is_not_empty"].includes(rule.operator) && (
              <Input
                value={rule.value}
                onChange={(e) => updateFilterRule(rule.id, { value: e.target.value })}
                placeholder="Enter value..."
                className="flex-1 bg-primary-600/50 border-primary-500/50 text-white"
              />
            )}

            {filterRules.length > 1 && (
              <Button
                onClick={() => removeFilterRule(rule.id)}
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300 p-2"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-primary-600/30">
        <Button
          variant="outline"
          className="border-primary-500/50 text-purple-300 hover:text-white"
          onClick={() => setFilterRules([{ id: "1", field: "sender", operator: "contains", value: "" }])}
        >
          Clear All
        </Button>
        <Button className="gradient-cyan-blue text-white action-btn">
          Apply Filters
        </Button>
      </div>
    </div>
  );
}