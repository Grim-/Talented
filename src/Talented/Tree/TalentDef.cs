using RimWorld;
using System.Collections.Generic;
using Verse;

namespace Talented
{
    public class TalentDef : Def
    {
        public int levelRequired;
        public List<TalentDef> prerequisites;
        public string uiIconPath;
        public int pointCost = 1;

        // Nested effect lists
        public List<HediffEffectProperties> hediffEffects;
        public List<AbilityEffectProperties> abilityEffects;
        public List<OrganEffectProperties> organEffects;
        public List<StatEffectProperties> statEffects;
        public StackingStatEffectProperties stackingStatEffect;

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
                    description.Add($"Adds {effect.hediffDef?.label ?? "unknown hediff"}  \r\nDescription: {effect.hediffDef?.description}");
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
                            description.Add($"Grants {ability?.label ?? "unknown ability"} \r\nDescription: {ability.description}");
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
            if (stackingStatEffect != null)
            {
                foreach (var effect in stackingStatEffect.effects)
                {
                    string statName = effect.statDef?.label ?? "unknown stat";
                    string operation = effect.operation.ToString().ToLower();

                    for (int i = 0; i < stackingStatEffect.currentRepeats; i++)
                    {
                        description.Add($"{operation}s {statName} by {effect.value} \r\n");
                    }
                    
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

            if (stackingStatEffect != null)
            {
                var stackingEffect = new StackingStatEffect
                {
                    maxLevel = stackingStatEffect.maxRepeats,
                    currentLevel = 1
                };

                foreach (var props in stackingStatEffect.effects)
                {
                    stackingEffect.effects.Add(new StatEffect
                    {
                        statDef = props.statDef,
                        value = props.value,
                        operation = props.operation,
                        parentUpgrade = this
                    });
                }

                effects.Add(stackingEffect);
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
    public class StackingStatEffect : UpgradeEffect
    {
        public List<StatEffect> effects = new List<StatEffect>();
        public int currentLevel = 0;
        public int maxLevel;
        public bool repeatable = true;

        protected override bool IsEffectAppliedTo(Pawn pawn)
        {
            return isActive;
        }

        protected override void Apply(Pawn pawn)
        {
            base.Apply(pawn);
            foreach (var effect in effects)
            {
                var scaledEffect = new StatEffect
                {
                    statDef = effect.statDef,
                    value = effect.value,
                    operation = effect.operation,
                    parentUpgrade = effect.parentUpgrade
                };
                scaledEffect.TryApply(pawn);
            }
        }

        protected override void Remove(Pawn pawn)
        {
            foreach (var effect in effects)
            {
                var scaledEffect = new StatEffect
                {
                    statDef = effect.statDef,
                    value = effect.value,
                    operation = effect.operation,
                    parentUpgrade = effect.parentUpgrade
                };
                scaledEffect.TryRemove(pawn);
            }
        }

        public override void ExposeData()
        {
            base.ExposeData();
            Scribe_Values.Look(ref currentLevel, "currentLevel", 1);
            Scribe_Values.Look(ref maxLevel, "maxLevel", 1);
            Scribe_Values.Look(ref repeatable, "repeatable", true);
            Scribe_Collections.Look(ref effects, "effects", LookMode.Deep);
        }
    }
    public class StackingStatEffectProperties
    {
        public int maxRepeats = 1;
        public int currentRepeats = 1;
        public List<StatEffectProperties> effects;
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
