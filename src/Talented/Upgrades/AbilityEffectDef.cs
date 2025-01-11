using RimWorld;
using System.Collections.Generic;

namespace Talented
{
    public class AbilityEffectDef : UpgradeEffectDef
    {
        public List<AbilityDef> abilities;

        public override string Description => $"You gain the abilites.";
        public override UpgradeEffect CreateEffect()
        {
            return new AbilityEffect
            {
                abilities = abilities
            };
        }
    }
}
