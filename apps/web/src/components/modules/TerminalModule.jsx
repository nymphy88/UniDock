"use client";

import { useState } from "react";
import { Terminal as TerminalIcon } from "lucide-react";

export default function TerminalModule({ data, onDataUpdate }) {
  const [history, setHistory] = useState(
    data.history || [
      { type: "output", text: "Welcome to Quantum Terminal v1.0" },
      { type: "output", text: 'Type "help" for available commands' },
    ],
  );
  const [input, setInput] = useState("");

  const executeCommand = (cmd) => {
    const newHistory = [...history, { type: "input", text: `$ ${cmd}` }];

    const commands = {
      help: "Available commands: help, clear, date, echo [text], calc [expression]",
      clear: () => {
        setHistory([]);
        return null;
      },
      date: new Date().toLocaleString(),
      echo: cmd.substring(5),
      calc: () => {
        try {
          const expr = cmd.substring(5);
          return eval(expr).toString();
        } catch {
          return "Error: Invalid expression";
        }
      },
    };

    const command = cmd.split(" ")[0];
    let output = "";

    if (command === "clear") {
      commands.clear();
      return;
    } else if (cmd.startsWith("echo ")) {
      output = commands.echo;
    } else if (cmd.startsWith("calc ")) {
      output = commands.calc();
    } else if (commands[command]) {
      output = commands[command];
    } else if (cmd.trim()) {
      output = `Command not found: ${command}`;
    }

    if (output) {
      newHistory.push({ type: "output", text: output });
    }

    setHistory(newHistory);
    onDataUpdate({ history: newHistory });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      executeCommand(input);
      setInput("");
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 to-gray-800 text-green-400 font-mono text-sm p-4 overflow-auto">
      <div className="mb-4">
        {history.map((entry, i) => (
          <div
            key={i}
            className={
              entry.type === "input" ? "text-green-300" : "text-gray-300"
            }
          >
            {entry.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <span className="text-green-400">$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent outline-none text-green-400"
          autoFocus
        />
      </form>
    </div>
  );
}
