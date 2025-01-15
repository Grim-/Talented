using Verse;

namespace Talented
{
    public class DamageTakenExperienceTypeDef : ExperienceTypeDef
    {
        public float damageFactor = 0.1f;

        public override float GetExperience(Pawn pawn)
        {
            return base.GetExperience(pawn);
        }

        public virtual float GetExperience(Pawn pawn, DamageWorker.DamageResult Damage)
        {
            return Damage.totalDamageDealt * damageFactor;
        }
    }
}
