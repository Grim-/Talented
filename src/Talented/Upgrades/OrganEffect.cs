using RimWorld;
using System.Collections.Generic;
using System.Linq;
using Verse;

namespace Talented
{
    public class OrganEffect : UpgradeEffect
    {
        public BodyPartDef targetOrgan;
        public HediffDef addedOrganHediff;
        public bool isAddition = true;
        private List<Hediff> addedParts = new List<Hediff>();


        protected override bool IsEffectAppliedTo(Pawn pawn)
        {
            addedParts.RemoveAll(part => part == null || !pawn.health.hediffSet.HasHediff(part.def));
            bool targetOrganExists = pawn.health.hediffSet.hediffs.Any(h => h.def == addedOrganHediff);
            return targetOrganExists;
        }

        protected override void Apply(Pawn pawn)
        {
            base.Apply(pawn);
            BodyPartDef partToUse = targetOrgan != null ? targetOrgan : BodyPartDefOf.Torso;
            BodyPartRecord targetPart = pawn.RaceProps.body.GetPartsWithDef(partToUse).FirstOrDefault();
            if (targetPart != null)
            {
                Hediff addedPart = pawn.health.AddHediff(addedOrganHediff, targetPart);
                addedParts.Add(addedPart);
            }
        }
        protected override void RemoveExistingEffects(Pawn pawn)
        {
            // Remove any existing organs of this type
            var existingOrgans = pawn.health.hediffSet.hediffs
                .Where(h => h.def == addedOrganHediff)
                .ToList();
            foreach (var organ in existingOrgans)
            {
                pawn.health.RemoveHediff(organ);
            }
        }
        protected override void Remove(Pawn pawn)
        {
            foreach (var part in addedParts)
            {
                if (part != null)
                    pawn.health.RemoveHediff(part);
            }
            addedParts.Clear();
        }

        public override void ExposeData()
        {
            base.ExposeData();
            Scribe_Defs.Look(ref targetOrgan, "targetOrgan");
            Scribe_Defs.Look(ref addedOrganHediff, "addedOrganHediff");
            Scribe_Values.Look(ref isAddition, "isAddition");
            Scribe_Collections.Look(ref addedParts, "addedParts", LookMode.Reference);
        }
    }
}
