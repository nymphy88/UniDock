import {
  StickyNote,
  Calculator,
  Clock,
  Image as ImageIcon,
  Terminal,
  Music,
  X,
  Sparkles,
  Database,
  Upload,
  Code,
} from "lucide-react";

const availableModules = [
  {
    type: "notepad",
    name: "Notepad",
    icon: StickyNote,
    color: "from-yellow-400 to-orange-500",
  },
  {
    type: "calculator",
    name: "Calculator",
    icon: Calculator,
    color: "from-blue-400 to-cyan-500",
  },
  {
    type: "timer",
    name: "Timer",
    icon: Clock,
    color: "from-purple-400 to-pink-500",
  },
  {
    type: "image",
    name: "Image Viewer",
    icon: ImageIcon,
    color: "from-green-400 to-emerald-500",
  },
  {
    type: "terminal",
    name: "Terminal",
    icon: Terminal,
    color: "from-gray-700 to-gray-900",
  },
  {
    type: "music",
    name: "Music Player",
    icon: Music,
    color: "from-red-400 to-rose-500",
  },
  {
    type: "aiapi",
    name: "AI API",
    icon: Sparkles,
    color: "from-purple-400 to-purple-600",
  },
  {
    type: "tablevariable",
    name: "Table Variable",
    icon: Database,
    color: "from-indigo-400 to-indigo-600",
  },
  {
    type: "universaldock",
    name: "Universal Dock",
    icon: Upload,
    color: "from-teal-400 to-teal-600",
  },
  {
    type: "baked",
    name: "Baked Module",
    icon: Code,
    color: "from-pink-400 to-pink-600",
  },
];

export default function ModuleSidebar({ isOpen, onClose, onAddModule }) {
  if (!isOpen) return null;

  return (
    <div className="fixed left-0 top-16 bottom-0 w-80 bg-white/90 backdrop-blur-xl border-r border-gray-200/50 z-40 shadow-xl">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/50">
        <h2 className="text-lg font-semibold text-gray-700">Module Library</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      <div className="p-6 overflow-y-auto h-full pb-20">
        <div className="space-y-3">
          {availableModules.map((module) => {
            const Icon = module.icon;
            return (
              <button
                key={module.type}
                onClick={() => {
                  onAddModule(module.type);
                  onClose();
                }}
                className="w-full group relative overflow-hidden rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-all hover:shadow-lg"
              >
                <div className="flex items-center gap-4 p-4">
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${module.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-700">{module.name}</h3>
                    <p className="text-xs text-gray-500">Drag to canvas</p>
                  </div>
                </div>
                {/* Glow effect on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-5 transition-opacity`}
                ></div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Quick Tips
          </h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Click any module to add it to canvas</li>
            <li>• Drag modules to reposition</li>
            <li>• Resize from corners</li>
            <li>• Right-click to delete</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
