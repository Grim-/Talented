using Verse;

namespace Talented
{
    public class HediffEffect : UpgradeEffect
    {
        public HediffDef hediffDef;
        private Hediff appliedHediff;



        protected override bool IsEffectPresent(Pawn pawn)
        {
            // First try to find our tracked hediff
            if (appliedHediff != null && pawn.health.hediffSet.HasHediff(hediffDef))
            {
                return true;
            }

            // If our tracked hediff is gone, check if the type exists at all
            return pawn.health.hediffSet.HasHediff(hediffDef);
        }

        protected override void Apply(Pawn pawn)
        {
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
