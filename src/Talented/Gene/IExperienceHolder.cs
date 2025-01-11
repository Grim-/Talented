using RimWorld;
using System.Collections.Generic;
using Verse;
using Verse.AI;

namespace Talented
{
    public interface IExperienceHolder
    {
        float ExperienceProgress { get; }
    }
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

        private DamageWorker.DamageResult HandleDamageDealt(Thing dealer, Thing target, DamageInfo info, DamageWorker.DamageResult result)
        {
            if (dealer == gene.pawn)
            {
                float xp = result.totalDamageDealt * settings.damageDealtXPMultiplier;
                gene.GainExperience(xp);
                gene.OnExperienceGained(xp, "combat_damage_dealt");
            }

            return result;
        }

        private void HandleDamageTaken(Pawn pawn, DamageInfo info)
        {
            if (pawn == gene.pawn)
            {
                float xp = info.Amount * settings.damageTakenXPMultiplier;
                gene.GainExperience(xp);
                gene.OnExperienceGained(xp, "combat_damage_taken");
            }
        }

        private void HandleSkillGained(Pawn pawn, SkillDef skill, float xp)
        {
            if (pawn == gene.pawn)
            {
                float multiplier = settings.skillXPMultiplier;
                if (settings.skillSpecificMultipliers != null &&
                    settings.skillSpecificMultipliers.TryGetValue(skill, out float specificMultiplier))
                {
                    multiplier = specificMultiplier;
                }

                float gainedXP = xp * multiplier;
                gene.GainExperience(gainedXP);
                gene.OnExperienceGained(gainedXP, $"skill_{skill.defName}");
            }
        }

        private void HandleAbilityUsed(Pawn pawn, Ability ability)
        {
            if (pawn == gene.pawn)
            {
                float xp = settings.abilityUseXP;
                if (settings.abilitySpecificXP != null &&
                    settings.abilitySpecificXP.TryGetValue(ability.def, out float specificXP))
                {
                    xp = specificXP;
                }

                gene.GainExperience(xp);
                gene.OnExperienceGained(xp, $"ability_{ability.def.defName}");
            }
        }

        private void HandleVerbUsed(Pawn pawn, Verb verb)
        {
            if (pawn == gene.pawn)
            {
                float xp = settings.verbUseXP;
                if (settings.verbSpecificXP != null &&
                    settings.verbSpecificXP.TryGetValue(verb.verbProps, out float specificXP))
                {
                    xp = specificXP;
                }

                string verbLabel = "unknown";
                if (verb.verbProps != null && !verb.verbProps.label.NullOrEmpty())
                {
                    verbLabel = verb.verbProps.label;
                }

                gene.GainExperience(xp);
                gene.OnExperienceGained(xp, $"verb_{verbLabel}");
            }
        }

        private void HandleJobEnded(Pawn pawn, Job job, JobCondition condition)
        {
            if (pawn == gene.pawn && condition == JobCondition.Succeeded)
            {
                float xp = settings.jobCompletionXP;
                if (settings.jobSpecificXP != null &&
                    settings.jobSpecificXP.TryGetValue(job.def, out float specificXP))
                {
                    xp = specificXP;
                }

                gene.GainExperience(xp);
                gene.OnExperienceGained(xp, $"job_{job.def.defName}");
            }
        }
    }

    public class ExperienceGainSettings
    {
        // Combat XP
        public float damageDealtXPMultiplier = 0.1f; 
        public float damageTakenXPMultiplier = 0.05f; 

        // Skill XP
        public float skillXPMultiplier = 0.02f;      
        public Dictionary<SkillDef, float> skillSpecificMultipliers;  

        // Ability Usage
        public float abilityUseXP = 10f;            
        public Dictionary<AbilityDef, float> abilitySpecificXP;  

        // Verb Usage (weapons, etc)
        public float verbUseXP = 5f;                
        public Dictionary<VerbProperties, float> verbSpecificXP; 

        // Job Completion
        public float jobCompletionXP = 2f;        
        public Dictionary<JobDef, float> jobSpecificXP; 
    }
}
