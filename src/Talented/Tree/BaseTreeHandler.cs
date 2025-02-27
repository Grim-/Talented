﻿using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using Verse;

namespace Talented
{
    public abstract class BaseTreeHandler : IExposable
    {
        protected Pawn pawn;
        protected Gene_TalentBase gene;
        protected TalentTreeDef treeDef;

        public TalentTreeDef TreeDef
        {
            get
            {
                return treeDef;
            }
        }

        public HashSet<TalentDef> unlockedUpgrades;
        public HashSet<TalentTreeNodeDef> unlockedNodes;
        public Dictionary<TalentDef, List<UpgradeEffect>> activeEffects;

        protected HashSet<TalentPath> selectedPaths;
        protected Dictionary<TalentTreeNodeDef, int> nodeProgress;

        public Dictionary<TalentTreeNodeDef, int> NodeProgress
        {
            get
            {
                return nodeProgress;
            }
        }

        protected TalentPointFormulaWorker talentPointWorker;
        public bool HasUnlockUpgrade(TalentDef upgradeDef)
        {
            return unlockedUpgrades.Contains(upgradeDef);
        }
        protected int availablePoints = 0;

        protected string toolBarStatusMessage = string.Empty;

        protected BaseTreeHandler()
        {
        }

        public BaseTreeHandler(Pawn pawn, Gene_TalentBase gene, TalentTreeDef treeDef)
        {
            this.pawn = pawn;
            this.gene = gene;
            this.treeDef = treeDef;
            this.unlockedUpgrades = new HashSet<TalentDef>();
            this.unlockedNodes = new HashSet<TalentTreeNodeDef>();
            this.activeEffects = new Dictionary<TalentDef, List<UpgradeEffect>>();
            this.selectedPaths = new HashSet<TalentPath>();
            this.nodeProgress = new Dictionary<TalentTreeNodeDef, int>();
            if (treeDef.talentPointFormula != null)
            {
                talentPointWorker = treeDef.talentPointFormula.CreateWorker();
            }
        }

        public virtual void OnLevelUp(int previousLevel, int newLevel)
        {
            if (talentPointWorker != null)
            {
                int points = talentPointWorker.GetTalentPointsForLevel(previousLevel, newLevel);
                OnTalentPointsGained(points);
            }
            else
            {
                OnTalentPointsGained(1);
            }
        }

        protected abstract void OnTalentPointsGained(int points);
        protected virtual void ReapplyUnlockedUpgrades()
        {
            if (activeEffects == null || unlockedUpgrades == null) return;

            var oldUpgrades = unlockedUpgrades.ToList();
            activeEffects.Clear();
            unlockedUpgrades.Clear();

            var nodeUpgrades = treeDef.GetAllNodes()
                .Where(n => n.upgrades != null)
                .ToDictionary(
                    n => n,
                    n => n.upgrades.Where(oldUpgrades.Contains).ToList()
                );

            foreach (var nodePair in nodeUpgrades)
            {
                var node = nodePair.Key;
                var upgrades = nodePair.Value;

                if (node.sequential && upgrades.Any())
                {
                    var lastUpgrade = upgrades.Last();
                    UnlockUpgrade(lastUpgrade);
                }
                else
                {
                    foreach (var upgrade in upgrades)
                    {
                        UnlockUpgrade(upgrade);
                    }
                }
            }
        }
        private void ApplyUpgradeEffects(TalentDef upgrade)
        {
            activeEffects[upgrade] = new List<UpgradeEffect>();
            var effects = upgrade.CreateEffects();
            foreach (var effect in effects)
            {
                effect.TryApply(pawn);
                activeEffects[upgrade].Add(effect);
            }
        }
        #region Nodes
        public virtual UnlockResult TryUnlockNode(TalentTreeNodeDef node)
        {
            UnlockResult result = ValidateUnlock(node);
            return result;
        }

        public bool IsNodeFullyUnlocked(TalentTreeNodeDef node)
        {
            if (node?.upgrades == null)
            {
                Log.ErrorOnce($"Node Def[{node.defName}] has no upgrades defined!", 2105);
                return false;
            }
            int progress = GetNodeProgress(node);
            int maxProgress = GetNodeMaxProgress(node);
           // Log.Message($"Node {node.defName}: Progress={progress}, MaxProgress={maxProgress}");
            return progress >= maxProgress;
        }
        public int GetNodeMaxProgress(TalentTreeNodeDef node)
        {
            return node.GetNodeMaxProgress();
        }
        public int GetNodeProgress(TalentTreeNodeDef node)
        {
            return nodeProgress.TryGetValue(node, out int progress) ? progress : 0;
        }

        public bool CanUnlockNextUpgrade(TalentTreeNodeDef node)
        {
            if (node?.upgrades == null) return false;
            int currentProgress = GetNodeProgress(node);
            return currentProgress < GetNodeMaxProgress(node);
        }
        public Color GetNodeColor(TalentTreeNodeDef node, int currentProgress)
        {
            bool isFullyUnlocked = IsNodeFullyUnlocked(node);
            TalentPath nodePath = this.TreeDef.GetPath(node.path);


            if (node.BelongsToUpgradePath && nodePath != null)
            {
                if (isFullyUnlocked)
                    return this.treeDef.Skin.unlockedNodeColor;

                if (nodePath != null && IsPathSelected(nodePath))
                    return this.treeDef.Skin.pathSelectedColor;

                return nodePath != null && CanSelectPath(nodePath) ? this.treeDef.Skin.pathAvailableColor : this.treeDef.Skin.pathExcludedColor;
            }

            if (isFullyUnlocked)
                return this.treeDef.Skin.unlockedNodeColor;

            UnlockResult canUnlockResult = ValidateUnlock(node);
            if (!canUnlockResult.Success)
                return this.treeDef.Skin.lockedNodeColor;

            if (currentProgress > 0)
            {
                return Color.Lerp(this.treeDef.Skin.availableNodeColor, this.treeDef.Skin.unlockedNodeColor, (float)currentProgress / node.upgrades.Count);
            }

            return this.treeDef.Skin.availableNodeColor;
        }
        public virtual UnlockResult TryUnlockNextUpgrade(TalentTreeNodeDef node, bool ignoreRequirements = false)
        {
            if (ignoreRequirements)
            {
                if (node.upgrades != null)
                {
                    foreach (var item in node.upgrades)
                    {
                        UnlockUpgrade(item);
                    }
                }
                return UnlockResult.Succeeded();
            }

            UnlockResult validationResult = ValidateUnlock(node);
            if (!validationResult.Success)
                return validationResult;

            int currentProgress = GetNodeProgress(node);
            int maxProgress = GetNodeMaxProgress(node);

            if (currentProgress >= maxProgress)
                return UnlockResult.Failed(UpgradeUnlockError.AlreadyUnlocked, "All upgrades in this node are already unlocked");

            var stackingUpgrade = node.upgrades.FirstOrDefault(x => x.stackingStatEffect != null);

            TalentDef upgradeToUnlock;
            if (stackingUpgrade != null)
            {
                upgradeToUnlock = stackingUpgrade;
                if (currentProgress >= stackingUpgrade.stackingStatEffect.maxRepeats)
                    return UnlockResult.Failed(UpgradeUnlockError.AlreadyUnlocked, "Maximum stacking level reached");
            }
            else
            {
                upgradeToUnlock = node.upgrades[currentProgress];
            }

            UnlockUpgrade(upgradeToUnlock);

            if (!nodeProgress.ContainsKey(node))
                nodeProgress[node] = 0;
            nodeProgress[node]++;

            if (GetNodeProgress(node) >= maxProgress)
            {
                unlockedNodes.Add(node);
                OnNodeFullyUnlocked(node);
            }

            return UnlockResult.Succeeded();
        }

        //public virtual UnlockResult TryUnlockNextUpgrade(TalentTreeNodeDef node, bool ignoreRequirements = false)
        //{
        //    if (ignoreRequirements)
        //    {
        //        if (node.upgrades != null)
        //        {
        //            foreach (var item in node.upgrades)
        //            {
        //                UnlockUpgrade(item);
        //            }
        //        }
        //        return UnlockResult.Succeeded();
        //    }

        //    UnlockResult validationResult = ValidateUnlock(node);
        //    if (!validationResult.Success)
        //        return validationResult;

        //    if (!CanUnlockNextUpgrade(node))
        //        return UnlockResult.Failed(UpgradeUnlockError.AlreadyUnlocked, "All upgrades in this node are already unlocked");

        //    int currentProgress = GetNodeProgress(node);
        //    UnlockUpgrade(node.upgrades[currentProgress]);

        //    if (!nodeProgress.ContainsKey(node))
        //        nodeProgress[node] = 0;
        //    nodeProgress[node]++;

        //    int maxProgress = GetNodeMaxProgress(node);
        //    if (GetNodeProgress(node) >= maxProgress)
        //    {
        //        unlockedNodes.Add(node);
        //        OnNodeFullyUnlocked(node);
        //    }

        //    return UnlockResult.Succeeded();
        //}

        protected virtual void OnNodeFullyUnlocked(TalentTreeNodeDef node)
        {


        }

        public virtual void UnlockStartingNodes(bool IgnoreRequirements = true)
        {
            if (this.treeDef.nodes != null)
            {
                foreach (var node in this.treeDef.GetAllNodes())
                {
                    if (node.type == NodeType.Start && !IsNodeFullyUnlocked(node))
                    {
                        ForceUnlockNode(node);
                    }
                }
            }
        }

        public void ForceUnlockNode(TalentTreeNodeDef node)
        {
            if (node == null || IsNodeFullyUnlocked(node))
                return;

            while (GetNodeProgress(node) < node.upgrades.Count)
            {
                TryUnlockNextUpgrade(node, true);
            }
        }
        public virtual void UnlockUpgrade(TalentDef upgrade)
        {
            var node = treeDef.GetAllNodes().FirstOrDefault(n => n.upgrades != null && n.upgrades.Contains(upgrade));
            bool isSequential = node?.sequential ?? false;
            Log.Message($"Unlocking upgrade {upgrade.defName}, Sequential: {isSequential}");

            // Handle stacking upgrades
            if (upgrade.stackingStatEffect != null)
            {
                // If this is the first time unlocking
                if (!activeEffects.ContainsKey(upgrade))
                {
                    activeEffects[upgrade] = new List<UpgradeEffect>();
                }

                // Get current level for the stacking effect
                int currentLevel = nodeProgress.TryGetValue(node, out int progress) ? progress : 0;
                if (currentLevel >= upgrade.stackingStatEffect.maxRepeats + GetNodeMaxProgress(node))
                {
                    Log.Error($"Attempted to unlock stacking upgrade {upgrade.defName} beyond max repeats!");
                    return;
                }

                // Create new effects with the current level
                var stackingEffect = new StackingStatEffect
                {
                    maxLevel = upgrade.stackingStatEffect.maxRepeats,
                    currentLevel = currentLevel + 1
                };

                foreach (var props in upgrade.stackingStatEffect.effects)
                {
                    stackingEffect.effects.Add(new StatEffect
                    {
                        statDef = props.statDef,
                        value = props.value,
                        operation = props.operation,
                        parentUpgrade = upgrade
                    });
                }

                // Remove previous level effects if they exist
                if (activeEffects[upgrade].Any())
                {
                    foreach (var effect in activeEffects[upgrade])
                    {
                        effect.TryRemove(pawn);
                    }
                    activeEffects[upgrade].Clear();
                }

                // Apply new stacking effect
                stackingEffect.TryApply(pawn, isSequential);
                activeEffects[upgrade].Add(stackingEffect);
            }
            else
            {
                // Handle regular non-stacking upgrades
                if (!activeEffects.ContainsKey(upgrade))
                {
                    if (isSequential && node != null)
                    {
                        RemovePreviousNodeUpgrades(node, upgrade);
                    }
                    activeEffects[upgrade] = new List<UpgradeEffect>();
                    var effects = upgrade.CreateEffects();
                    foreach (var effect in effects)
                    {
                        effect.TryApply(pawn, isSequential);
                        activeEffects[upgrade].Add(effect);
                    }
                }
            }

            if (!unlockedUpgrades.Contains(upgrade))
            {
                unlockedUpgrades.Add(upgrade);
            }
        }

        protected void RemovePreviousNodeUpgrades(TalentTreeNodeDef node, TalentDef untilUpgrade)
        {
            var previousUpgrades = node.upgrades
                .TakeWhile(u => u != untilUpgrade)
                .Where(u => activeEffects.ContainsKey(u))
                .ToList();

            Log.Message($"Removing previous upgrades: {string.Join(", ", previousUpgrades.Select(u => u.defName))}");

            foreach (var prevUpgrade in previousUpgrades)
            {
                foreach (var effect in activeEffects[prevUpgrade])
                {
                    effect.TryRemove(pawn);
                }
                activeEffects.Remove(prevUpgrade);
                unlockedUpgrades.Remove(prevUpgrade);
            }
        }
         public virtual UnlockResult ValidateUnlock(TalentTreeNodeDef node)
        {
            if (node?.upgrades == null || !node.upgrades.Any())
                return UnlockResult.Failed(UpgradeUnlockError.InvalidNode, "Invalid node");

            if (IsNodeFullyUnlocked(node))
                return UnlockResult.Failed(UpgradeUnlockError.AlreadyUnlocked, "All upgrades already unlocked");

            //if there are custom rules, check them first
            if (node.unlockRules != null && node.unlockRules.Any())
            {
                bool hasOverride = node.unlockRules.Any(r => r.overrideDefaultRules);

                foreach (var rule in node.unlockRules)
                {
                    var ruleResult = rule.Validate(this, node);
                    if (!ruleResult.Success)
                        return ruleResult;
                }

                if (hasOverride)
                    return UnlockResult.Succeeded();
            }

            // Normal validation logic
            if (node.type != NodeType.Start)
            {
                var predecessors = node.GetPredecessors(treeDef);
                if (!predecessors.All(IsNodeFullyUnlocked))
                    return UnlockResult.Failed(UpgradeUnlockError.NoPrecedingNode, "Requires all previous upgrades to be fully unlocked");
            }

            var nodePath = this.TreeDef.GetPath(node.path);

            if (node.type != NodeType.Branch && nodePath != null && !IsPathSelected(nodePath))
                return UnlockResult.Failed(UpgradeUnlockError.ExclusivePath, "Must select path at branch point first");

            return ValidateTreeSpecificRules(node);
        }

        #endregion

        protected abstract UnlockResult ValidateTreeSpecificRules(TalentTreeNodeDef node);

        public int GetTotalCostForNode(TalentTreeNodeDef Node)
        {
            int totalCost = 0;
            foreach (var upgradeDef in Node.upgrades)
            {
                if (upgradeDef.stackingStatEffect != null)
                {
                    int currentLevel = upgradeDef.stackingStatEffect.currentRepeats;
                    if (currentLevel < upgradeDef.stackingStatEffect.maxRepeats)
                    {
                        totalCost += upgradeDef.pointCost;
                    }
                }
                else
                {
                    if (!HasUnlockUpgrade(upgradeDef))
                    {
                        totalCost = upgradeDef.pointCost;
                    }
                }
            }

            return totalCost;
        }


        #region Progression Paths
        public bool IsPathSelected(TalentPath path) => selectedPaths.Contains(path);


        public PathStatus GetPathStatusBetweenNodes(TalentTreeNodeDef StartNode, TalentTreeNodeDef EndNode)
        {
            if (IsPathUnlocked(StartNode, EndNode))
            {
                return PathStatus.Unlocked;
            }
            else if (IsPathActive(StartNode, EndNode))
            {
                return PathStatus.Active;
            }
            else
            {
                return PathStatus.Locked;
            }
        }
        public bool IsPathActive(TalentTreeNodeDef StartNode, TalentTreeNodeDef EndNode)
        {
            return IsNodeFullyUnlocked(StartNode) ||
                  IsNodeFullyUnlocked(EndNode);
        }

        public bool IsPathUnlocked(TalentTreeNodeDef StartNode, TalentTreeNodeDef EndNode)
        {
            return IsNodeFullyUnlocked(StartNode) &&
                  IsNodeFullyUnlocked(EndNode);
        }



        protected virtual bool ValidateUpgradePath(TalentTreeNodeDef node)
        {
            if (node.type == NodeType.Start)
            {
                return true;
            }

            if (node.type == NodeType.Branch)
            {
                return node.path != string.Empty && CanSelectPath(this.TreeDef.GetPath(node.path));
            }

            if (node.path != string.Empty)
            {
                return IsPathSelected(this.TreeDef.GetPath(node.path));
            }

            return true;
        }
        public virtual UnlockResult SelectPath(TalentPath path)
        {
            if (!CanSelectPath(path))
                return UnlockResult.Failed(UpgradeUnlockError.ExclusivePath, "Path conflicts with current selections");

            selectedPaths.Add(path);
            OnPathSelected(path);
            return UnlockResult.Succeeded();
        }

        public virtual bool CanSelectPath(TalentPath path)
        {
            if (path == null) return false;
            if (selectedPaths.Contains(path)) return false;

            var nodesInPath = treeDef.GetAllNodes().Where(n => n.path == path.name).ToList();
            if (!nodesInPath.Any()) return false;

            foreach (var node in nodesInPath)
            {
                var predecessorPaths = node.GetPredecessors(treeDef)
                    .Where(p => p.path != string.Empty)
                    .Select(p => p.path)
                    .Distinct();

                foreach (var predPath in predecessorPaths)
                {
                    var Path = this.TreeDef.GetPath(predPath);
                    if (Path != null && Path.IsPathExclusiveWith(selectedPaths)
                        || selectedPaths.Any(sp => sp.IsPathExclusiveWith(Path)))
                    {
                        return false;
                    }
                }
            }

            return !path.IsPathExclusiveWith(selectedPaths);
        }

        public virtual bool HasSelectedAPath()
        {
            return selectedPaths != null && selectedPaths.Count > 0;
        }

        public abstract void OnPathSelected(TalentPath path);

        #endregion
 




        public virtual bool TryGetUnlockedUpgradeEffectsByDef(TalentDef TalentDef, out List<UpgradeEffect> upgradeEffect)
        {
            if (activeEffects.TryGetValue(TalentDef, out var effects))
            {
                upgradeEffect = effects;
                return true;
            }
            upgradeEffect = null;
            return false;
        }
        public virtual bool TryGetUnlockedUpgradeEffectsByDef<T>(TalentDef TalentDef, out List<T> upgradeEffect) where T : UpgradeEffect
        {
            List<T> effectsFound = new List<T>();
            if (activeEffects.TryGetValue(TalentDef, out var effects))
            {
                foreach (var item in effects)
                {
                    if (item is T itemAsT)
                    {
                        effectsFound.Add(itemAsT);
                    }
                }

                upgradeEffect = effectsFound;
                return true;
            }
            upgradeEffect = null;
            return false;
        }



        private Texture2D _PointsText;
        private Texture2D PointsText
        {
            get
            {
                if (_PointsText == null)
                {
                    _PointsText = ContentFinder<Texture2D>.Get("UI/Tree/Points", true);
                }

                return _PointsText;
            }
        }


        public virtual void DrawToolBar(Rect rect)
        {
            Color darkBackground = new Color(0.15f, 0.15f, 0.15f, 0.85f);
            Widgets.DrawBoxSolid(rect, darkBackground);

            Color darkEdge = new Color(0.1f, 0.1f, 0.1f, 0.3f);
            Widgets.DrawBoxSolid(new Rect(rect.x, rect.y, rect.width, 1f), darkEdge);
            Widgets.DrawBoxSolid(new Rect(rect.x, rect.yMax - 1f, rect.width, 1f), darkEdge);

            rect = rect.ContractedBy(6f);
            float currentX = rect.x;
            string label = GetToolbarLabel();
            GameFont oldFont = Text.Font;
            Text.Font = GameFont.Small;
            Vector2 labelSize = Text.CalcSize(label);

            Rect labelRect = new Rect(currentX, rect.y + (rect.height - labelSize.y) / 2f, labelSize.x, labelSize.y);
            GUI.color = availablePoints > 0 ? new Color(0.9f, 0.9f, 0.2f) : Color.white;
            Widgets.Label(labelRect, label);
            GUI.color = Color.white;

            Text.Font = oldFont;
        }


        private string GetToolbarLabel()
        {
            return this.TreeDef.GetFormattedTreeToolbarName(this.treeDef.treeName, this.gene.CurrentLevel, this.availablePoints, this.availablePoints, this.gene.pawn.Label) + "\r\n" + toolBarStatusMessage;
        }


        public void SetStatusMessage(string statusMessage)
        {
            this.toolBarStatusMessage = statusMessage;
        }

        public void ClearStatusMessage()
        {
            this.toolBarStatusMessage = "";
        }

        public virtual void ResetTree()
        {
            // Remove effects first
            if (activeEffects != null)
            {
                foreach (var effectPair in activeEffects)
                {
                    foreach (var effect in effectPair.Value)
                    {
                        effect.TryRemove(pawn);
                    }
                }
                activeEffects.Clear();
            }

            // Calculate refund
            int pointsToRefund = 0;
            if (nodeProgress != null)
            {
                foreach (var nodePair in nodeProgress)
                {
                    var node = nodePair.Key;
                    var progress = nodePair.Value;
                    if (node.upgrades != null)
                    {
                        for (int i = 0; i < progress && i < node.upgrades.Count; i++)
                        {
                            if (node.upgrades[i].stackingStatEffect != null)
                            {
                                pointsToRefund += node.upgrades[i].pointCost * nodePair.Value;
                            }
                            else if (node.upgrades[i].pointCost > 0)
                            {
                                pointsToRefund += node.upgrades[i].pointCost;
                            }
                        }
                    }
                }
            }

            pointsToRefund--;

            pointsToRefund = Mathf.Clamp(pointsToRefund, 0, 1000000);

            // Clear progress and give points back
            unlockedUpgrades?.Clear();
            unlockedNodes?.Clear();
            selectedPaths?.Clear();
            nodeProgress?.Clear();
            activeEffects?.Clear();
            OnTalentPointsGained(pointsToRefund);
        }

        public abstract int GetAvailablePoints();

        public virtual void ExposeData()
        {
            Scribe_References.Look(ref pawn, "pawn");
            Scribe_References.Look(ref gene, "gene");
            Scribe_Defs.Look(ref treeDef, "treeDef");


            Scribe_Values.Look(ref availablePoints, "availablePoints", 0);
            Scribe_Collections.Look(ref unlockedUpgrades, "unlockedUpgrades", LookMode.Def);
            Scribe_Collections.Look(ref unlockedNodes, "unlockedNodes", LookMode.Def);
            Scribe_Collections.Look(ref selectedPaths, "selectedPaths", LookMode.Deep);
            Scribe_Collections.Look(ref nodeProgress, "nodeProgress", LookMode.Def, LookMode.Value);
            Scribe_Collections.Look(
                ref activeEffects,
                "activeEffects",
                LookMode.Def,
                LookMode.Deep
            );

            if (Scribe.mode == LoadSaveMode.PostLoadInit)
            {
                if (unlockedUpgrades == null) unlockedUpgrades = new HashSet<TalentDef>();
                if (unlockedNodes == null) unlockedNodes = new HashSet<TalentTreeNodeDef>();
                if (selectedPaths == null) selectedPaths = new HashSet<TalentPath>();
                if (nodeProgress == null) nodeProgress = new Dictionary<TalentTreeNodeDef, int>();
                if (activeEffects == null) activeEffects = new Dictionary<TalentDef, List<UpgradeEffect>>();

                foreach (var path in selectedPaths.ToList())
                {
                    OnPathSelected(path);
                }

                ReapplyUnlockedUpgrades();
            }
        }
    }
}
