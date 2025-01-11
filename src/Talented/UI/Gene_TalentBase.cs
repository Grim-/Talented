﻿using RimWorld;
using System;
using System.Collections.Generic;
using Verse;

namespace Talented
{
    public abstract class Gene_TalentBase : Gene_BasicResource
    {
        protected PassiveTreeHandler passiveTree;
        protected ActiveTreeHandler activeTree;

        protected int talentPoints = 0;
        public int TalentPointsAvailable => talentPoints;

        protected int currentLevel = 1;
        public int CurrentLevel => currentLevel;

        private float currentExperience = 0f;
        public float CurrentExperience => currentExperience;
        public float ExperienceProgress => currentExperience / MaxExperienceForLevel(currentLevel);

        protected virtual float BaseExperience => 100f;
        protected virtual float ExperiencePerLevel => 1.5f;
        protected const int MaxLevel = 300;

        protected TalentedGeneDef TalentedGeneDef => (TalentedGeneDef)def;

        private ExperienceHandler experienceHandler;

        protected virtual float MaxExperienceForLevel(int level) => (level + 1) * BaseExperience;

        protected abstract void InitializeTrees();

        public override void PostMake()
        {
            base.PostMake();
            experienceHandler = new ExperienceHandler(this);
            InitializeTrees();
        }

        public override void PostRemove()
        {
            base.PostRemove();
            experienceHandler?.Cleanup();
        }

        public virtual void GainExperience(float amount)
        {
            if (currentLevel >= MaxLevel) return;
            currentExperience += amount;
            float maxExp = MaxExperienceForLevel(currentLevel);

            int levelsToGain = 0;
            float remainingExp = currentExperience;
            int tempLevel = currentLevel;

            while (remainingExp >= maxExp && tempLevel < MaxLevel)
            {
                remainingExp -= maxExp;
                tempLevel++;
                levelsToGain++;
                maxExp = MaxExperienceForLevel(tempLevel);
            }

            if (levelsToGain > 0)
            {
                currentExperience = remainingExp;
                GainLevel(levelsToGain);
            }
        }

        public virtual void GainLevel(int levels)
        {
            int oldLevel = currentLevel;
            int gainedLevels = levels;

            int newLevel = oldLevel + gainedLevels;
            currentLevel = Math.Min(newLevel, MaxLevel);

            // Give talent points on level up
            talentPoints += levels;

            passiveTree?.OnLevelUp(currentLevel);
            activeTree?.OnLevelUp(levels);

            OnLevelGained(levels);

            Messages.Message($"{pawn.Label} gained {levels} level{(levels > 1 ? "s" : "")} (level = {currentLevel})",
                MessageTypeDefOf.PositiveEvent);
        }

        public virtual void OpenPassiveTree()
        {
            if (TalentedGeneDef?.SecondaryTreeDef != null)
            {
                var window = new TalentTreeDisplayWindow(this, TalentedGeneDef.SecondaryTreeDef, passiveTree,
                    TalentedGeneDef.SecondaryTreeDef.displayStrategy);
                Find.WindowStack.Add(window);
            }
        }

        public virtual void OpenActiveTree()
        {
            if (TalentedGeneDef?.MainTreeDef != null)
            {
                var window = new TalentTreeDisplayWindow(this, TalentedGeneDef.MainTreeDef, activeTree,
                    TalentedGeneDef.MainTreeDef.displayStrategy);
                Find.WindowStack.Add(window);
            }
        }

        public bool CanAffordUpgrade(UpgradeDef upgrade)
        {
            return HasTalentPointsAvailable(upgrade.pointCost);
        }

        public bool HasTalentPointsAvailable(int amount)
        {
            return talentPoints >= amount;
        }

        public virtual void UseTalentPoints(int amount)
        {
            if (HasTalentPointsAvailable(amount))
            {
                talentPoints -= amount;
            }
        }

        public override void ExposeData()
        {
            base.ExposeData();
            Scribe_Deep.Look(ref passiveTree, "passiveTree");
            Scribe_Deep.Look(ref activeTree, "activeTree");
            Scribe_Values.Look(ref talentPoints, "talentPoints", 0);
            Scribe_Values.Look(ref currentLevel, "currentLevel", 1);
            Scribe_Values.Look(ref currentExperience, "currentExperience", 0f);
        }

        public override IEnumerable<Gizmo> GetGizmos()
        {
            foreach (var gizmo in base.GetGizmos())
            {
                yield return gizmo;
            }

            if (Prefs.DevMode)
            {
                yield return new Command_Action
                {
                    defaultLabel = "DEV: Gain Level",
                    defaultDesc = "Gain 1 Level (Debug)",
                    action = () => GainLevel(1),
                };

                yield return new Command_Action
                {
                    defaultLabel = "DEV: Max Experience",
                    defaultDesc = "Fill Experience Bar (Debug)",
                    action = () => GainExperience(MaxExperienceForLevel(currentLevel) - currentExperience - 0.1f),
                };
            }
        }

        public abstract void OnExperienceGained(float amount, string source);
        public abstract void OnLevelGained(int levels);
    }


    public class TalentedGeneDef : BasicResourceGeneDef
    {
        public UpgradeTreeDef MainTreeDef;
        public UpgradeTreeDef SecondaryTreeDef;
        public InspectTabBase CustomTab;
        public string TabLabel = "Talents";

        public ExperienceGainSettings experienceGainSettings;
    }
}
