using System.Linq;
using Verse;

namespace Talented
{
    public class HediffEffect : UpgradeEffect
    {
        public HediffDef hediffDef;
        private Hediff appliedHediff;



        protected override bool IsEffectAppliedTo(Pawn pawn)
        {
            // First try to find our tracked hediff
            if (appliedHediff != null && pawn.health.hediffSet.HasHediff(hediffDef))
            {
                return true;
            }

            // If our tracked hediff is gone, check if the type exists at all
            return pawn.health.hediffSet.HasHediff(hediffDef);
        }

        protected override void RemoveExistingEffects(Pawn pawn)
        {
            var existingHediffs = pawn.health.hediffSet.hediffs
                .Where(h => h.def == hediffDef)
                .ToList();
            foreach (var hediff in existingHediffs)
            {
                pawn.health.RemoveHediff(hediff);
            }
        }
        protected override void Apply(Pawn pawn)
        {
            base.Apply(pawn);
            appliedHediff = HediffMaker.MakeHediff(hediffDef, pawn);
            pawn.health.AddHediff(appliedHediff);
        }

        protected override void Remove(Pawn pawn)
        {
            if (appliedHediff != null)
            {
                pawn.health.RemoveHediff(appliedHediff);
                appliedHediff = null;
            }
        }

        public override void ExposeData()
        {
            base.ExposeData();
            Scribe_Defs.Look(ref hediffDef, "hediffDef");
            Scribe_References.Look(ref appliedHediff, "appliedHediff");
        }
    }
}
