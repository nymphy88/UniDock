"use client";

import { useState, useEffect } from "react";
import { Code, Eye, EyeOff, RefreshCw } from "lucide-react";

export default function BakedModule({ data = {}, onDataUpdate }) {
  const [schema, setSchema] = useState(
    data.schema ||
      JSON.stringify(
        {
          title: "Sample Form",
          fields: [
            {
              type: "text",
              name: "username",
              label: "Username",
              placeholder: "Enter username",
            },
            {
              type: "email",
              name: "email",
              label: "Email",
              placeholder: "your@email.com",
            },
            { type: "textarea", name: "message", label: "Message", rows: 3 },
          ],
          submitLabel: "Submit",
        },
        null,
        2,
      ),
  );
  const [showSchema, setShowSchema] = useState(false);
  const [formData, setFormData] = useState(data.formData || {});

  // Update from incoming connections
  useEffect(() => {
    if (data._incomingData?.schema) {
      const incomingSchema =
        typeof data._incomingData.schema === "string"
          ? data._incomingData.schema
          : JSON.stringify(data._incomingData.schema, null, 2);
      setSchema(incomingSchema);
    }
  }, [data._incomingData]);

  const renderField = (field) => {
    const baseInputClass =
      "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500";

    switch (field.type) {
      case "text":
      case "email":
      case "number":
        return (
          <input
            type={field.type}
            name={field.name}
            value={formData[field.name] || ""}
            onChange={(e) => {
              const updated = { ...formData, [field.name]: e.target.value };
              setFormData(updated);
              onDataUpdate({ ...data, formData: updated });
            }}
            placeholder={field.placeholder}
            className={baseInputClass}
          />
        );
      case "textarea":
        return (
          <textarea
            name={field.name}
            value={formData[field.name] || ""}
            onChange={(e) => {
              const updated = { ...formData, [field.name]: e.target.value };
              setFormData(updated);
              onDataUpdate({ ...data, formData: updated });
            }}
            placeholder={field.placeholder}
            rows={field.rows || 3}
            className={baseInputClass}
          />
        );
      case "select":
        return (
          <select
            name={field.name}
            value={formData[field.name] || ""}
            onChange={(e) => {
              const updated = { ...formData, [field.name]: e.target.value };
              setFormData(updated);
              onDataUpdate({ ...data, formData: updated });
            }}
            className={baseInputClass}
          >
            <option value="">Select...</option>
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <div className="text-xs text-gray-400">
            Unknown field type: {field.type}
          </div>
        );
    }
  };

  const applySchema = () => {
    try {
      const parsed = JSON.parse(schema);
      onDataUpdate({ schema, parsedSchema: parsed, formData });
    } catch (error) {
      alert("Invalid JSON schema");
    }
  };

  let parsedSchema;
  try {
    parsedSchema = JSON.parse(schema);
  } catch {
    parsedSchema = null;
  }

  return (
    <div className="h-full flex flex-col p-4 gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-pink-600">
          <Code className="h-5 w-5" />
          <h3 className="font-semibold text-sm">Baked Module</h3>
          {data._incomingData?.schema && (
            <span className="text-xs bg-pink-100 px-2 py-1 rounded">
              Connected
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSchema(!showSchema)}
            className="p-1.5 hover:bg-pink-100 rounded-lg transition-colors"
            title="Toggle Schema Editor"
          >
            {showSchema ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={applySchema}
            className="p-1.5 hover:bg-pink-100 rounded-lg transition-colors"
            title="Apply Schema"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showSchema ? (
        <div className="flex-1 flex flex-col gap-2">
          <label className="text-xs font-medium text-gray-600">
            JSON Schema
          </label>
          <textarea
            value={schema}
            onChange={(e) => setSchema(e.target.value)}
            className="flex-1 px-3 py-2 text-xs font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
            placeholder="Enter JSON schema..."
          />
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          {parsedSchema ? (
            <div className="space-y-3">
              {parsedSchema.title && (
                <h4 className="font-semibold text-gray-700">
                  {parsedSchema.title}
                </h4>
              )}

              {parsedSchema.fields?.map((field, index) => (
                <div key={index}>
                  {field.label && (
                    <label className="text-xs font-medium text-gray-600 block mb-1">
                      {field.label}
                    </label>
                  )}
                  {renderField(field)}
                </div>
              ))}

              {parsedSchema.submitLabel && (
                <button className="w-full px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
                  {parsedSchema.submitLabel}
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">
              Invalid schema. Click the eye icon to edit.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const BakedModuleConfig = {
  handles: {
    inputs: [{ id: "schema", position: "left", label: "Schema" }],
    outputs: [{ id: "formData", position: "right", label: "Form Data" }],
  },
};
