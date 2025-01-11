using RimWorld;
using System.Collections.Generic;
using Verse;

namespace Talented
{
    public class UpgradeDef : Def
    {
        public int parasiteLevelRequired;
        public List<UpgradeDef> prerequisites;
        public string uiIconPath;
        public int pointCost = 1;

        // Nested effect lists
        public List<HediffEffectProperties> hediffEffects;
        public List<AbilityEffectProperties> abilityEffects;
        public List<OrganEffectProperties> organEffects;

        public virtual string DescriptionString { get; } = "";

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

            return effects;
        }
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
