using RimWorld;
using System.Collections.Generic;
using Verse;

namespace Talented
{
    public interface IExperienceHolder
    {
        float ExperienceProgress { get; }
    }

    public class ExperienceGainSettings
    {
        public List<ExperienceTypeDef> experienceTypes = new List<ExperienceTypeDef>();
    }

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


    public class DamageExperienceTypeDef : ExperienceTypeDef
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

    public class AbilityExperienceTypeDef : ExperienceTypeDef
    {
        public Ability AbilityDef;
    }
    public class SkillExperienceTypeDef : ExperienceTypeDef
    {
        public SkillDef SkillDef;
    }

    public class JobExperienceTypeDef : ExperienceTypeDef
    {
        public JobDef SkillDef;
    }

    public class VerbExperienceTypeDef : ExperienceTypeDef
    {
        public string VerbClassName;
    }


    public class XPExtension : DefModExtension
    {
        public float xpGain = 1f;
        public StatDef multiplierStat;


        public float GetMultiplier(Pawn pawn)
        {
            if (multiplierStat == null)
            {
                return 1;
            }

            return pawn.GetStatValue(multiplierStat);
        }
    }
}
