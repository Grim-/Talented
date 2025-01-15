using RimWorld;
using System.Collections.Generic;
using Verse;

namespace Talented
{
    public class TalentDef : Def
    {
        public int parasiteLevelRequired;
        public List<TalentDef> prerequisites;
        public string uiIconPath;
        public int pointCost = 1;

        // Nested effect lists
        public List<HediffEffectProperties> hediffEffects;
        public List<AbilityEffectProperties> abilityEffects;
        public List<OrganEffectProperties> organEffects;
        public List<StatEffectProperties> statEffects;

        public string DescriptionString;

        public virtual string FormattedDescriptionString
        {
            get
            {
                if (!string.IsNullOrEmpty(DescriptionString))
                    return DescriptionString;

                return GenerateDefaultDescription();
            }
        }

        private string GenerateDefaultDescription()
        {
            var description = new List<string>();

            if (hediffEffects?.Count > 0)
            {
                foreach (var effect in hediffEffects)
                {
                    description.Add($"Adds {effect.hediffDef?.label ?? "unknown hediff"}");
                }
            }

            if (abilityEffects?.Count > 0)
            {
                foreach (var effect in abilityEffects)
                {
                    if (effect.abilities?.Count > 0)
                    {
                        foreach (var ability in effect.abilities)
                        {
                            description.Add($"Grants {ability?.label ?? "unknown ability"}");
                        }
                    }
                }
            }

            if (organEffects?.Count > 0)
            {
                foreach (var effect in organEffects)
                {
                    string actionType = effect.isAddition ? "Adds" : "Modifies";
                    string organName = effect.targetOrgan?.label ?? "unknown organ";
                    string hediffEffect = effect.addedOrganHediff?.label ?? "unknown effect";
                    description.Add($"{actionType} {hediffEffect} to {organName}");
                }
            }

            if (description.Count == 0)
                description.Add("No effects");

            return string.Join("\n", description);
        }

        public List<UpgradeEffect> CreateEffects()
        {
            var effects = new List<UpgradeEffect>();

            if (hediffEffects != null)
                foreach (var props in hediffEffects)
                    effects.Add(new HediffEffect { hediffDef = props.hediffDef });

            if (abilityEffects != null)
                foreach (var props in abilityEffects)
                    effects.Add(new AbilityEffect { abilities = props.abilities });

            if (organEffects != null)
                foreach (var props in organEffects)
                    effects.Add(new OrganEffect
                    {
                        targetOrgan = props.targetOrgan,
                        addedOrganHediff = props.addedOrganHediff,
                        isAddition = props.isAddition
                    });

            if (statEffects != null)
                foreach (var props in statEffects)
                {
                    var effect = new StatEffect
                    {
                        statDef = props.statDef,
                        value = props.value,
                        operation = props.operation,
                        parentUpgrade = this
                    };
                    effects.Add(effect);
                }

            return effects;
        }
    }
    public class StatEffectProperties
    {
        public StatDef statDef;
        public float value;
        public StatModifierOperation operation = StatModifierOperation.Add;
    }

    public class OrganEffectProperties
    {
        public BodyPartDef targetOrgan;
        public HediffDef addedOrganHediff;
        public bool isAddition;
    }

    public class HediffEffectProperties
    {
        public HediffDef hediffDef;
    }

    public class AbilityEffectProperties
    {
        public List<AbilityDef> abilities;
    }
}
