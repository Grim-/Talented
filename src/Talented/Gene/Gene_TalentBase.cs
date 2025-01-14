﻿using RimWorld;
using System;
using System.Collections.Generic;
using UnityEngine;
using Verse;

namespace Talented
{
    public class Gene_TalentBase : Gene_BasicResource, IExperienceHolder
    {
        protected PassiveTreeHandler passiveTree;
        protected ActiveTreeHandler activeTree;

        public BaseTreeHandler PassiveTree => passiveTree;
        public BaseTreeHandler ActiveTree => activeTree;

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

        public TalentedGeneDef TalentedGeneDef => (TalentedGeneDef)def;

        private ExperienceHandler experienceHandler;
        private ExperienceFormulaWorker formulaWorker;

        public string genelistbackgroundTexturePath = "UI/Tree/genelistbackground";

        private Texture2D cachedBackgroundTexture;
        public Texture2D BackgroundTexture
        {
            get
            {
                if (cachedBackgroundTexture == null && HasCustomBackground)
                {
                    cachedBackgroundTexture = ContentFinder<Texture2D>.Get(TalentedGeneDef.geneListBackgroundTexturePath, false);
                }
                return cachedBackgroundTexture;
            }
        }

        public bool HasCustomBackground => !String.IsNullOrEmpty(TalentedGeneDef.geneListBackgroundTexturePath);

        public float XPForNextLevel => MaxExperienceForLevel(currentLevel);

        public Gene_TalentBase()
        {

        }

        public override void PostMake()
        {
            base.PostMake();

            if (def == null || !(def is TalentedGeneDef talentedDef))
            {
                Log.Error($"Gene_TalentBase: GeneDef is not a TalentedGeneDef for pawn {pawn?.Label}");
                return;
            }

            if (talentedDef.MainTreeDef == null || talentedDef.SecondaryTreeDef == null)
            {
                Log.Error($"Gene_TalentBase: Missing tree definitions for gene {def.defName}");
                return;
            }


            if (TalentedGeneDef?.experienceFormula != null)
            {
                formulaWorker = TalentedGeneDef.experienceFormula.CreateFormulaWorker();
                formulaWorker.Def = TalentedGeneDef.experienceFormula;
            }

            InitializeTrees();

            if (activeTree == null || passiveTree == null)
            {
                Log.Error($"Gene_TalentBase: Failed to initialize trees for gene {def.defName}");
                return;
            }

            if (talentedDef.experienceGainSettings != null)
            {
                experienceHandler = new ExperienceHandler(this);
            }
            else
            {
                Log.Warning($"Gene_TalentBase: No experience settings defined for gene {def.defName}");
            }
        }

        public override void PostRemove()
        {
            base.PostRemove();
            experienceHandler?.Cleanup();
        }
        protected virtual float MaxExperienceForLevel(int level)
        {
            if (formulaWorker != null)
            {
                return formulaWorker.GetExperienceForLevel(level);
            }
            return (level + 1) * BaseExperience;
        }

        protected virtual void InitializeTrees()
        {
            activeTree = new ActiveTreeHandler(pawn, this, TalentedGeneDef.MainTreeDef);
            passiveTree = new PassiveTreeHandler(pawn, this, TalentedGeneDef.SecondaryTreeDef);
        }
        public virtual void OnExperienceGained(float amount, string source)
        {

        }
        public virtual void OnLevelGained(int previousLevel, int newLevel)
        {

        }

        public virtual void GainExperience(float amount)
        {
            if (currentLevel >= MaxLevel) 
                return;

            currentExperience += amount;
            float maxExp = MaxExperienceForLevel(currentLevel);

            Messages.Message($"{this.pawn.Label} gained {amount} experience.", MessageTypeDefOf.PositiveEvent);

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
            int newLevel = Math.Min(oldLevel + levels, MaxLevel);
            currentLevel = newLevel;

            passiveTree?.OnLevelUp(oldLevel, currentLevel);
            activeTree?.OnLevelUp(oldLevel, currentLevel);
            OnLevelGained(oldLevel, currentLevel);

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


        public struct TreeInstanceData
        {
            public TalentTreeDef treeDef;
            public BaseTreeHandler handler;
            public string label;

            public TreeInstanceData(TalentTreeDef treeDef, BaseTreeHandler handler, string label)
            {
                this.treeDef = treeDef;
                this.handler = handler;
                this.label = label;
            }
        }

        public virtual IEnumerable<TreeInstanceData> AvailableTrees()
        {
            if (TalentedGeneDef?.MainTreeDef != null && activeTree != null)
            {
                yield return new TreeInstanceData(TalentedGeneDef.MainTreeDef, activeTree, TalentedGeneDef.MainTreeDef.label);
            }
            if (TalentedGeneDef?.SecondaryTreeDef != null && passiveTree != null)
            {
                yield return new TreeInstanceData(TalentedGeneDef.SecondaryTreeDef, passiveTree, TalentedGeneDef.SecondaryTreeDef.label);
            }
        }

        public bool CanAffordUpgrade(TalentDef upgrade)
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
                    defaultLabel = $"DEV: {this.Label}  Gain Level",
                    defaultDesc = "Gain 1 Level (Debug)",
                    action = () => GainLevel(1),
                };

                yield return new Command_Action
                {
                    defaultLabel = $"DEV:  {this.Label} Max Experience",
                    defaultDesc = "Fill Experience Bar (Debug)",
                    action = () => GainExperience(MaxExperienceForLevel(currentLevel) - currentExperience - 0.1f),
                };
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

    }
}
