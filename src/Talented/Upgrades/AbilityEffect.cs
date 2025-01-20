using RimWorld;
using System.Collections.Generic;
using System.Linq;
using Verse;

namespace Talented
{
    public class AbilityEffect : UpgradeEffect
    {
        public List<AbilityDef> abilities;
        private List<Ability> grantedAbilities = new List<Ability>();

        protected override bool IsEffectAppliedTo(Pawn pawn)
        {
            if (pawn.abilities == null) return false;

            grantedAbilities.RemoveAll(ability => ability == null || !pawn.abilities.abilities.Contains(ability));

            return abilities.All(abilityDef =>
                grantedAbilities.Any(a => a.def == abilityDef) ||
                pawn.abilities.GetAbility(abilityDef) != null);
        }

        protected override void Apply(Pawn pawn)
        {
            base.Apply(pawn);
            if (pawn.abilities == null)
                pawn.abilities = new Pawn_AbilityTracker(pawn);

            foreach (var abilityDef in abilities)
            {
                if (!grantedAbilities.Any(a => a.def == abilityDef))
                {
                    pawn.abilities.GainAbility(abilityDef);
                    grantedAbilities.Add(pawn.abilities.GetAbility(abilityDef));
                }
            }
        }
        protected override void RemoveExistingEffects(Pawn pawn)
        {
            // Remove any existing abilities of these types
            if (pawn.abilities != null)
            {
                foreach (var abilityDef in abilities)
                {
                    var existingAbility = pawn.abilities.GetAbility(abilityDef);
                    if (existingAbility != null)
                    {
                        pawn.abilities.RemoveAbility(abilityDef);
                    }
                }
            }
        }
        protected override void Remove(Pawn pawn)
        {
            if (pawn.abilities != null)
            {
                foreach (var ability in grantedAbilities)
                {
                    if (ability != null)
                        pawn.abilities.RemoveAbility(ability.def);
                }
            }
            grantedAbilities.Clear();
        }

        public override void ExposeData()
        {
            base.ExposeData();
            Scribe_Collections.Look(ref abilities, "abilities", LookMode.Def);
            Scribe_Collections.Look(ref grantedAbilities, "grantedAbilities", LookMode.Reference);
        }
    }
}
