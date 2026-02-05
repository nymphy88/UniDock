"use client";

import { useState, useEffect } from "react";
import { Send, Loader2, Sparkles } from "lucide-react";

export default function AIAPIModule({ data = {}, onDataUpdate }) {
  const [prompt, setPrompt] = useState(data.prompt || "");
  const [apiEndpoint, setApiEndpoint] = useState(
    data.apiEndpoint || "/api/ai/generate",
  );
  const [response, setResponse] = useState(data.response || "");
  const [loading, setLoading] = useState(false);

  // Update from incoming connections
  useEffect(() => {
    if (data._incomingData) {
      if (data._incomingData.prompt !== undefined) {
        setPrompt(data._incomingData.prompt);
      }
    }
  }, [data._incomingData]);

  const handleSendPrompt = async () => {
    const finalPrompt = data._incomingData?.prompt || prompt;
    const variables = data._incomingData?.variables || {};

    if (!finalPrompt.trim()) return;

    setLoading(true);
    try {
      // This will be connected to other nodes via handles
      // For now, it's a placeholder that stores the result
      const result = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: finalPrompt, variables }),
      });

      if (result.ok) {
        const responseData = await result.json();
        setResponse(JSON.stringify(responseData, null, 2));
        onDataUpdate({
          prompt: finalPrompt,
          apiEndpoint,
          response: JSON.stringify(responseData, null, 2),
          lastRun: new Date().toISOString(),
        });
      } else {
        setResponse(`Error: ${result.statusText}`);
      }
    } catch (error) {
      setResponse(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-4 gap-3">
      <div className="flex items-center gap-2 text-purple-600">
        <Sparkles className="h-5 w-5" />
        <h3 className="font-semibold text-sm">AI API Node</h3>
      </div>

      <div className="flex-1 flex flex-col gap-3 overflow-auto">
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">
            API Endpoint
          </label>
          <input
            type="text"
            value={apiEndpoint}
            onChange={(e) => {
              setApiEndpoint(e.target.value);
              onDataUpdate({ ...data, apiEndpoint: e.target.value });
            }}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="/api/ai/generate"
          />
        </div>

        <div className="flex-1 flex flex-col">
          <label className="text-xs font-medium text-gray-600 block mb-1">
            Prompt{" "}
            {data._incomingData?.prompt && (
              <span className="text-purple-500">(Connected)</span>
            )}
          </label>
          <textarea
            value={data._incomingData?.prompt || prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={data._incomingData?.prompt !== undefined}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none disabled:bg-gray-50 disabled:text-gray-600"
            placeholder="Enter your prompt here..."
          />
        </div>

        {data._incomingData?.variables && (
          <div className="p-2 bg-purple-50 rounded-lg border border-purple-200">
            <span className="text-xs font-medium text-purple-600">
              📊{" "}
              {Array.isArray(data._incomingData.variables)
                ? data._incomingData.variables.length
                : 0}{" "}
              variables connected
            </span>
          </div>
        )}

        <button
          onClick={handleSendPrompt}
          disabled={loading || !(data._incomingData?.prompt || prompt.trim())}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send
            </>
          )}
        </button>

        {response && (
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Response (Output Handle)
            </label>
            <pre className="p-3 bg-gray-100 rounded-lg text-xs overflow-auto max-h-32">
              {response}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export const AIAPIModuleConfig = {
  handles: {
    inputs: [
      { id: "prompt", position: "left", label: "Prompt" },
      { id: "variables", position: "left", label: "Variables" },
    ],
    outputs: [{ id: "response", position: "right", label: "Response" }],
  },
};
