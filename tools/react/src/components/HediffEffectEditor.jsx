import { EffectEditorBase } from "./EffectEditorBase";

export const HediffEffectEditor = ({ effect, onChange, onRemove }) => (
    <EffectEditorBase onRemove={onRemove}>
      <input
        type="text"
        value={effect.hediffDef}
        onChange={e => onChange({ ...effect, hediffDef: e.target.value })}
        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Health Effect Definition"
      />
      <input
        type="number"
        value={effect.severity}
        onChange={e => onChange({ ...effect, severity: parseFloat(e.target.value) || 0 })}
        className="w-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Severity"
      />
    </EffectEditorBase>
  );

