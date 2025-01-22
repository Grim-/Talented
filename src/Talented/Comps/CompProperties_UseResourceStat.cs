using RimWorld;
using Verse;

namespace Talented
{
    public class CompProperties_UseResourceStat : CompProperties_AbilityEffect
    {
        public float amount;
        public StatDef maxResourceStatDef;

        public CompProperties_UseResourceStat()
        {
            compClass = typeof(UseResourceStat);
        }
    }

    public class UseResourceStat : CompAbilityEffect
    {
        new CompProperties_UseResourceStat Props => (CompProperties_UseResourceStat)props;

        public override bool CanApplyOn(LocalTargetInfo target, LocalTargetInfo dest)
        {
            Pawn CasterPawn = target.Pawn;
            if (CasterPawn != null && Props.maxResourceStatDef != null)
            {
                var resourceGene = CasterPawn.GetBasicResourceGeneByStatDef(Props.maxResourceStatDef);

                if (resourceGene != null && resourceGene.Has(Props.amount))
                {
                    return true;
                }

            }

            return base.CanApplyOn(target, dest);
        }

        public override void Apply(LocalTargetInfo target, LocalTargetInfo dest)
        {
            base.Apply(target, dest);

            Pawn CasterPawn = target.Pawn;
            if (CasterPawn != null && Props.maxResourceStatDef != null)
            {
                var resourceGene = CasterPawn.GetBasicResourceGeneByStatDef(Props.maxResourceStatDef);

                if (resourceGene != null)
                {
                    resourceGene.Consume(Props.amount);
                }

            }
        }
    }
}
