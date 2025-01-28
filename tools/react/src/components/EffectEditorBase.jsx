import { X } from "lucide-react";

export const EffectEditorBase = ({ children, onRemove }) => (
  <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-gray-700 transition-colors">
    {children}
    <button
      onClick={onRemove}
      className="p-1 rounded-full hover:bg-gray-700 transition-colors group"
      aria-label="Remove effect"
    >
      <X className="h-4 w-4 text-gray-400 group-hover:text-red-400" />
    </button>
  </div>
);

