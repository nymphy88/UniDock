"use client";

import { useState } from "react";
import { Plus, Trash2, Database } from "lucide-react";

export default function TableVariableModule({ data = {}, onDataUpdate }) {
  const [variables, setVariables] = useState(
    data.variables || [
      { id: "1", key: "apiKey", value: "" },
      { id: "2", key: "endpoint", value: "" },
    ],
  );

  const addVariable = () => {
    const newVar = {
      id: Date.now().toString(),
      key: "",
      value: "",
    };
    const updated = [...variables, newVar];
    setVariables(updated);
    onDataUpdate({ variables: updated });
  };

  const updateVariable = (id, field, value) => {
    const updated = variables.map((v) =>
      v.id === id ? { ...v, [field]: value } : v,
    );
    setVariables(updated);
    onDataUpdate({ variables: updated });
  };

  const deleteVariable = (id) => {
    const updated = variables.filter((v) => v.id !== id);
    setVariables(updated);
    onDataUpdate({ variables: updated });
  };

  return (
    <div className="h-full flex flex-col p-4 gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-indigo-600">
          <Database className="h-5 w-5" />
          <h3 className="font-semibold text-sm">Table Variables</h3>
        </div>
        <button
          onClick={addVariable}
          className="p-1.5 hover:bg-indigo-100 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4 text-indigo-600" />
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="space-y-2">
          {variables.map((variable) => (
            <div
              key={variable.id}
              className="relative flex items-center gap-2 p-2 bg-white/50 rounded-lg border border-gray-200 group"
            >
              {/* Output handle indicator for each variable */}
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-green-500 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity" />

              <input
                type="text"
                value={variable.key}
                onChange={(e) =>
                  updateVariable(variable.id, "key", e.target.value)
                }
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Key"
              />
              <span className="text-gray-400">=</span>
              <input
                type="text"
                value={variable.value}
                onChange={(e) =>
                  updateVariable(variable.id, "value", e.target.value)
                }
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Value"
              />
              <button
                onClick={() => deleteVariable(variable.id)}
                className="p-1 hover:bg-red-100 rounded transition-colors"
              >
                <Trash2 className="h-3 w-3 text-red-500" />
              </button>
            </div>
          ))}
        </div>

        {variables.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            No variables yet. Click + to add one.
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          {variables.length} variable{variables.length !== 1 ? "s" : ""} defined
        </p>
      </div>
    </div>
  );
}

export const TableVariableModuleConfig = {
  handles: {
    inputs: [],
    outputs: [{ id: "variables", position: "right", label: "All Variables" }],
    // Dynamic outputs for each variable row
    dynamicOutputs: (data) => {
      return (data?.variables || []).map((v) => ({
        id: `var-${v.id}`,
        position: "right",
        label: v.key || "Unnamed",
      }));
    },
  },
};
