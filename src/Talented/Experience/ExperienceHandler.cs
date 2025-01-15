using RimWorld;
using System.Linq;
using Verse;
using Verse.AI;

namespace Talented
{
    public class ExperienceHandler
    {
        private readonly Gene_TalentBase gene;
        private readonly ExperienceGainSettings settings;

        public ExperienceHandler(Gene_TalentBase gene)
        {
            this.gene = gene;
            this.settings = ((TalentedGeneDef)gene.def).experienceGainSettings;

            // Subscribe to events
            EventManager.OnDamageDealt += HandleDamageDealt;
            EventManager.OnDamageTaken += HandleDamageTaken;
            EventManager.OnSkillGained += HandleSkillGained;
            EventManager.OnAbilityCast += HandleAbilityUsed;
            EventManager.OnVerbUsed += HandleVerbUsed;
            EventManager.OnJobEnded += HandleJobEnded;
        }

        public void Cleanup()
        {
            // Unsubscribe from events
            EventManager.OnDamageDealt -= HandleDamageDealt;
            EventManager.OnDamageTaken -= HandleDamageTaken;
            EventManager.OnSkillGained -= HandleSkillGained;
            EventManager.OnAbilityCast -= HandleAbilityUsed;
            EventManager.OnVerbUsed -= HandleVerbUsed;
            EventManager.OnJobEnded -= HandleJobEnded;
        }


        private void HandleAbilityUsed(Pawn pawn, Ability ability)
        {
            if (pawn == gene.pawn)
            {
                var xpExtension = ability.def.GetModExtension<XPExtension>();
                if (xpExtension != null)
                {
                    float xp = xpExtension.xpGain * xpExtension.GetMultiplier(pawn);
                    gene.GainExperience(xp);
                    gene.OnExperienceGained(xp, $"ability_{ability.def.defName}");
                }
            }
        }
        private DamageWorker.DamageResult HandleDamageDealt(Thing dealer, Thing target, DamageInfo info, DamageWorker.DamageResult result)
        {
            if (dealer == gene.pawn)
            {
                var expType = settings.experienceTypes.OfType<DamageDealtExperienceTypeDef>().FirstOrDefault();
                if (expType != null)
                {
                    float xp = expType.GetExperience(gene.pawn, result);
                    gene.GainExperience(xp);
                    gene.OnExperienceGained(xp, "combat_damage_dealt");
                }
            }
            return result;
        }

        private void HandleDamageTaken(Pawn pawn, DamageInfo info)
        {
            if (pawn == gene.pawn)
            {
                var expType = settings.experienceTypes.OfType<DamageTakenExperienceTypeDef>().FirstOrDefault();
                if (expType != null)
                {
                    float xp = expType.GetExperience(gene.pawn) * info.Amount;
                    gene.GainExperience(xp);
                    gene.OnExperienceGained(xp, "combat_damage_taken");
                }
            }
        }

        private void HandleSkillGained(Pawn pawn, SkillDef skill, float xp)
        {
            if (pawn == gene.pawn)
            {
                var expType = settings.experienceTypes.OfType<SkillExperienceTypeDef>()
                    .FirstOrDefault(x => x.SkillDef == skill);
                if (expType != null)
                {
                    float gainedXP = expType.GetExperience(gene.pawn) * xp;
                    gene.GainExperience(gainedXP);
                    gene.OnExperienceGained(gainedXP, $"skill_{skill.defName}");
                }
            }
        }

          private void HandleVerbUsed(Pawn pawn, Verb verb)
        {
            if (pawn == gene.pawn)
            {
                var expType = settings.experienceTypes.OfType<VerbExperienceTypeDef>()
                    .FirstOrDefault(x => x.VerbClassName == verb.GetType().ToString());
                if (expType != null)
                {
                    float xp = expType.GetExperience(gene.pawn);
                    string verbLabel = verb.verbProps?.label ?? "unknown";
                    gene.GainExperience(xp);
                    gene.OnExperienceGained(xp, $"verb_{verbLabel}");
                }
            }
        }

        private void HandleJobEnded(Pawn pawn, Job job, JobCondition condition)
        {
            if (pawn == gene.pawn && condition == JobCondition.Succeeded)
            {
                var expType = settings.experienceTypes.OfType<JobExperienceTypeDef>()
                    .FirstOrDefault(x => x.SkillDef == job.def);
                if (expType != null)
                {
                    float xp = expType.GetExperience(gene.pawn);
                    gene.GainExperience(xp);
                    gene.OnExperienceGained(xp, $"job_{job.def.defName}");
                }
            }
        }
    }
}
