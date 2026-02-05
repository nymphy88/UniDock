"use client";

import { useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";

export default function MusicModule({ data, onDataUpdate }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(70);

  const playlist = [
    { title: "Quantum Dreams", artist: "Virtual Orchestra" },
    { title: "Digital Sunrise", artist: "Synth Wave" },
    { title: "Code Symphony", artist: "Algorithm Band" },
  ];

  const [currentTrack, setCurrentTrack] = useState(0);

  const handleNext = () => {
    setCurrentTrack((prev) => (prev + 1) % playlist.length);
    setCurrentTime(0);
  };

  const handlePrev = () => {
    setCurrentTrack((prev) => (prev - 1 + playlist.length) % playlist.length);
    setCurrentTime(0);
  };

  return (
    <div className="h-full p-6 flex flex-col justify-between bg-gradient-to-br from-red-50 to-rose-50">
      <div className="text-center">
        <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-red-400 to-rose-500 rounded-2xl flex items-center justify-center shadow-xl">
          <Volume2 className="h-16 w-16 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">
          {playlist[currentTrack].title}
        </h3>
        <p className="text-sm text-gray-500">{playlist[currentTrack].artist}</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">0:00</span>
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-400 to-rose-500"
              style={{ width: `${(currentTime / 180) * 100}%` }}
            ></div>
          </div>
          <span className="text-xs text-gray-500">3:00</span>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handlePrev}
            className="p-2 hover:bg-white rounded-full transition-colors"
          >
            <SkipBack className="h-6 w-6 text-gray-700" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-4 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-full hover:from-red-600 hover:to-rose-600 transition-all shadow-lg"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </button>
          <button
            onClick={handleNext}
            className="p-2 hover:bg-white rounded-full transition-colors"
          >
            <SkipForward className="h-6 w-6 text-gray-700" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-gray-500" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            className="flex-1"
          />
          <span className="text-xs text-gray-500">{volume}%</span>
        </div>
      </div>
    </div>
  );
}
