"use client";

import { useState } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";

export default function ImageModule({ data, onDataUpdate }) {
  const [imageUrl, setImageUrl] = useState(data.imageUrl || "");
  const [inputUrl, setInputUrl] = useState("");

  const handleLoadImage = () => {
    if (inputUrl) {
      setImageUrl(inputUrl);
      onDataUpdate({ imageUrl: inputUrl });
    }
  };

  return (
    <div className="h-full p-4 flex flex-col gap-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder="Enter image URL..."
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <button
          onClick={handleLoadImage}
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all"
        >
          <Upload className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-dashed border-green-200 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Loaded"
            className="max-w-full max-h-full object-contain"
            onError={() => setImageUrl("")}
          />
        ) : (
          <div className="text-center text-gray-400">
            <ImageIcon className="h-16 w-16 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No image loaded</p>
          </div>
        )}
      </div>
    </div>
  );
}
