import { EffectEditorBase } from "./EffectEditorBase";

export const OrganEffectEditor = ({ effect, onChange, onRemove }) => (
  <EffectEditorBase onRemove={onRemove}>
    <input
      type="text"
      value={effect.targetOrgan}
      onChange={e => onChange({ ...effect, targetOrgan: e.target.value })}
      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder="Target Organ"
    />
    <input
      type="text"
      value={effect.addedOrganHediff}
      onChange={e => onChange({ ...effect, addedOrganHediff: e.target.value })}
      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder="Added Health Effect"
    />
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={effect.isAddition}
        onChange={e => onChange({ ...effect, isAddition: e.target.checked })}
        className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
      />
      <span className="text-sm text-gray-300 whitespace-nowrap">Is Addition</span>
    </label>
  </EffectEditorBase>
);

