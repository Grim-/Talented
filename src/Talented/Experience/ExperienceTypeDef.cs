using RimWorld;
using Verse;

namespace Talented
{
    public abstract class ExperienceTypeDef
    {
        public float baseXP = 1f;
        public StatDef multiplierStat;

        public virtual float GetExperience(Pawn pawn)
        {
            float multiplier = multiplierStat != null ? pawn.GetStatValue(multiplierStat) : 1f;
            return baseXP * multiplier;
        }
    }
}
