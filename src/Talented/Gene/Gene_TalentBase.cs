using RimWorld;
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

        protected Dictionary<string, BaseTreeHandler> treeHandlers = new Dictionary<string, BaseTreeHandler>();

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

            if (talentedDef.TalentTrees == null || talentedDef.TalentTrees.Count == 0)
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

            if (talentedDef.experienceGainSettings != null)
            {
                experienceHandler = new ExperienceHandler(this);
            }
            else
            {
                Log.Warning($"Gene_TalentBase: No experience settings defined for gene {def.defName}");
            }
        }
        protected virtual void InitializeTrees()
        {
            if (pawn == null)
                throw new ArgumentNullException(nameof(pawn), "Pawn cannot be null when initializing trees");

            if (TalentedGeneDef.TalentTrees == null || !TalentedGeneDef.TalentTrees.Any())
                throw new InvalidOperationException("No tree definitions found");

            foreach (var treeDef in TalentedGeneDef.TalentTrees)
            {
                if (treeDef == null)
                {
                    Log.Error($"Gene_TalentBase: Null tree definition found in {def.defName}");
                    continue;
                }

                try
                {
                    if (!treeHandlers.ContainsKey(treeDef.defName))
                    {
                        BaseTreeHandler handler;
                        if (treeDef.handlerClass != null)
                        {
                            handler = (BaseTreeHandler)Activator.CreateInstance(treeDef.handlerClass,
                                new object[] { pawn, this, treeDef });
                        }
                        else
                        {
                            handler = new ActiveTreeHandler(pawn, this, treeDef);
                        }

                        treeHandlers.Add(treeDef.defName, handler);
                    }
                    else
                    {
                        Log.Error($"Gene_TalentBase: Cannot have two TalentTreeDefs with the same defName in the TalentTrees list.");
                    }
                }
                catch (Exception ex)
                {
                    Log.Error($"Gene_TalentBase: Failed to initialize tree handler for {treeDef.defName}. Exception: {ex}");
                }
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

            foreach (var item in treeHandlers.Values)
            {
                item?.OnLevelUp(oldLevel, currentLevel);
            }

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

   
 

        public BaseTreeHandler GetTreeHandler(string treeDefName)
        {
            return treeHandlers.TryGetValue(treeDefName, out var handler) ? handler : null;
        }

        public virtual IEnumerable<TreeInstanceData> AvailableTrees()
        {
            foreach (var pair in treeHandlers)
            {
                var treeDef = TalentedGeneDef.TalentTrees.FirstOrDefault(t => t.defName == pair.Key);
                if (treeDef != null)
                {
                    yield return new TreeInstanceData(treeDef, pair.Value, treeDef.label);
                }
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
