"use client";

import { useState, useEffect } from "react";

export default function NotepadModule({ data, onDataUpdate }) {
  const [text, setText] = useState(data.text || "");

  useEffect(() => {
    setText(data.text || "");
  }, [data.text]);

  const handleChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    onDataUpdate({ text: newText });
  };

  return (
    <div className="h-full p-4">
      <textarea
        value={text}
        onChange={handleChange}
        placeholder="Start typing your notes..."
        className="w-full h-full bg-transparent border-none outline-none resize-none text-gray-700 placeholder-gray-400 font-mono text-sm"
        style={{ lineHeight: "1.6" }}
      />
    </div>
  );
}
