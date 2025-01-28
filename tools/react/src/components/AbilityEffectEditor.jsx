import { EffectEditorBase } from "./EffectEditorBase";

export const AbilityEffectEditor = ({ effect, onChange, onRemove }) => (
  <EffectEditorBase onRemove={onRemove}>
    <input
      type="text"
      value={effect.abilityDef}
      onChange={e => onChange({ ...effect, abilityDef: e.target.value })}
      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder="Ability Definition"
    />
  </EffectEditorBase>
);