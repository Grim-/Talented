using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using Verse;

namespace Talented
{
    public abstract class BaseTreeHandler : IExposable
    {
        protected Pawn pawn;
        protected Gene_TalentBase gene;
        protected UpgradeTreeDef treeDef;
        protected HashSet<UpgradeDef> unlockedUpgrades;
        protected HashSet<UpgradeTreeNodeDef> unlockedNodes;
        protected Dictionary<UpgradeDef, List<UpgradeEffect>> activeEffects;
        protected HashSet<UpgradePathDef> selectedPaths;
        protected Dictionary<UpgradeTreeNodeDef, int> nodeProgress;


        public bool HasUnlockUpgrade(UpgradeDef upgradeDef)
        {
            return unlockedUpgrades.Contains(upgradeDef);
        }

        protected BaseTreeHandler()
        {
        }

        public BaseTreeHandler(Pawn pawn, Gene_TalentBase gene, UpgradeTreeDef treeDef)
        {
            this.pawn = pawn;
            this.gene = gene;
            this.treeDef = treeDef;
            this.unlockedUpgrades = new HashSet<UpgradeDef>();
            this.unlockedNodes = new HashSet<UpgradeTreeNodeDef>();
            this.activeEffects = new Dictionary<UpgradeDef, List<UpgradeEffect>>();
            this.selectedPaths = new HashSet<UpgradePathDef>();
            this.nodeProgress = new Dictionary<UpgradeTreeNodeDef, int>();
        }

        public virtual void OnLevelUp(int newLevel)
        {
       
        }
        protected virtual void ReapplyUnlockedUpgrades()
        {
            if (activeEffects == null || unlockedUpgrades == null) return;

            var upgradesList = unlockedUpgrades.ToList();
            activeEffects.Clear();

            foreach (var upgrade in upgradesList)
            {
                if (upgrade == null) continue;

                activeEffects[upgrade] = new List<UpgradeEffect>();
                var effects = upgrade.CreateEffects();
                foreach (var effect in effects)
                {
                    effect.TryApply(pawn);
                    activeEffects[upgrade].Add(effect);
                }
            }
        }

        #region Nodes
        public virtual UnlockResult TryUnlockNode(UpgradeTreeNodeDef node)
        {
            UnlockResult result = ValidateUnlock(node);
            return result;
        }

        public bool IsNodeFullyUnlocked(UpgradeTreeNodeDef node)
        {
            if (node?.upgrades == null)
            {
                Log.ErrorOnce($"Node Def[{node.defName}] has no upgrades defined!", 2105);
                return false;
            }

            return nodeProgress.TryGetValue(node, out int progress) &&
                   progress >= node.upgrades.Count;
        }

        //public UnlockResult CanUnlockNode(UpgradeTreeNodeDef node)
        //{
        //    return ValidateUnlock(node);
        //}

        public int GetNodeProgress(UpgradeTreeNodeDef node)
        {
            return nodeProgress.TryGetValue(node, out int progress) ? progress : 0;
        }

        public bool CanUnlockNextUpgrade(UpgradeTreeNodeDef node)
        {
            if (node?.upgrades == null) return false;
            int currentProgress = GetNodeProgress(node);
            return currentProgress < node.upgrades.Count;
        }
        public Color GetNodeColor(UpgradeTreeNodeDef node, int currentProgress)
        {
            bool isFullyUnlocked = IsNodeFullyUnlocked(node);

            if (node.BelongsToUpgradePath)
            {
                if (isFullyUnlocked)
                    return this.treeDef.Skin.unlockedNodeColor;

                if (IsPathSelected(node.path))
                    return this.treeDef.Skin.pathSelectedColor;

                return CanSelectPath(node.path) ? this.treeDef.Skin.pathAvailableColor : this.treeDef.Skin.pathExcludedColor;
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

        public virtual UnlockResult TryUnlockNextUpgrade(UpgradeTreeNodeDef node, bool ignoreRequirements = false)
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

            if (!CanUnlockNextUpgrade(node))
                return UnlockResult.Failed(UpgradeUnlockError.AlreadyUnlocked, "All upgrades in this node are already unlocked");

            int currentProgress = GetNodeProgress(node);
            UnlockUpgrade(node.upgrades[currentProgress]);

            if (!nodeProgress.ContainsKey(node))
                nodeProgress[node] = 0;
            nodeProgress[node]++;

            if (GetNodeProgress(node) == node.upgrades.Count)
            {
                unlockedNodes.Add(node);
                OnNodeFullyUnlocked(node);
            }

            return UnlockResult.Succeeded();
        }

        protected virtual void OnNodeFullyUnlocked(UpgradeTreeNodeDef node)
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

        public void ForceUnlockNode(UpgradeTreeNodeDef node)
        {
            if (node == null || IsNodeFullyUnlocked(node))
                return;

            while (GetNodeProgress(node) < node.upgrades.Count)
            {
                TryUnlockNextUpgrade(node, true);
            }
        }

        public virtual void UnlockUpgrade(UpgradeDef upgrade)
        {
            if (!activeEffects.ContainsKey(upgrade))
            {
                activeEffects[upgrade] = new List<UpgradeEffect>();
                var effects = upgrade.CreateEffects();
                foreach (var effect in effects)
                {
                    effect.TryApply(pawn);
                    activeEffects[upgrade].Add(effect);
                }
            }
            unlockedUpgrades.Add(upgrade);
        }
        public virtual UnlockResult ValidateUnlock(UpgradeTreeNodeDef node)
        {
            if (node?.upgrades == null || !node.upgrades.Any())
                return UnlockResult.Failed(UpgradeUnlockError.InvalidNode, "Invalid node");

            if (IsNodeFullyUnlocked(node))
                return UnlockResult.Failed(UpgradeUnlockError.AlreadyUnlocked, "All upgrades already unlocked");

            if (node.type != NodeType.Start)
            {
                var predecessors = node.GetPredecessors(treeDef);
                if (!predecessors.All(IsNodeFullyUnlocked))
                    return UnlockResult.Failed(UpgradeUnlockError.NoPrecedingNode, "Requires all previous upgrades to be fully unlocked");
            }

            if (node.type != NodeType.Branch && node.path != null && !IsPathSelected(node.path))
                return UnlockResult.Failed(UpgradeUnlockError.ExclusivePath, "Must select path at branch point first");

            return ValidateTreeSpecificRules(node);
        }

        #endregion

        protected abstract UnlockResult ValidateTreeSpecificRules(UpgradeTreeNodeDef node);



        #region Progression Paths
        public bool IsPathSelected(UpgradePathDef path) => selectedPaths.Contains(path);


        public PathStatus GetPathStatusBetweenNodes(UpgradeTreeNodeDef StartNode, UpgradeTreeNodeDef EndNode)
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
        public bool IsPathActive(UpgradeTreeNodeDef StartNode, UpgradeTreeNodeDef EndNode)
        {
            return IsNodeFullyUnlocked(StartNode) ||
                  IsNodeFullyUnlocked(EndNode);
        }

        public bool IsPathUnlocked(UpgradeTreeNodeDef StartNode, UpgradeTreeNodeDef EndNode)
        {
            return IsNodeFullyUnlocked(StartNode) &&
                  IsNodeFullyUnlocked(EndNode);
        }



        protected virtual bool ValidateUpgradePath(UpgradeTreeNodeDef node)
        {
            if (node.type == NodeType.Branch)
                return node.path != null && CanSelectPath(node.path);

            // Non-branch nodes require their path to be selected already
            if (node.path != null)
                return IsPathSelected(node.path);

            return true;
        }
        public virtual UnlockResult SelectPath(UpgradePathDef path)
        {
            if (!CanSelectPath(path))
                return UnlockResult.Failed(UpgradeUnlockError.ExclusivePath, "Path conflicts with current selections");

            selectedPaths.Add(path);
            OnPathSelected(path);
            return UnlockResult.Succeeded();
        }

        public virtual bool CanSelectPath(UpgradePathDef path)
        {
            if (path == null) return false;
            if (selectedPaths.Contains(path)) return false;

            var nodesInPath = treeDef.GetAllNodes().Where(n => n.path == path).ToList();
            if (!nodesInPath.Any()) return false;

            foreach (var node in nodesInPath)
            {
                var predecessorPaths = node.GetPredecessors(treeDef)
                    .Where(p => p.path != null)
                    .Select(p => p.path)
                    .Distinct();

                foreach (var predPath in predecessorPaths)
                {
                    if (predPath.IsPathExclusiveWith(selectedPaths) ||
                        selectedPaths.Any(sp => sp.IsPathExclusiveWith(predPath)))
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

        public abstract void OnPathSelected(UpgradePathDef path);

        #endregion
 


        public virtual void DrawToolBar(Rect rect)
        {
 
        }


        public virtual void ExposeData()
        {
            Scribe_References.Look(ref pawn, "pawn");
            Scribe_References.Look(ref gene, "gene");
            Scribe_Defs.Look(ref treeDef, "treeDef");

            Scribe_Collections.Look(ref unlockedUpgrades, "unlockedUpgrades", LookMode.Def);
            Scribe_Collections.Look(ref unlockedNodes, "unlockedNodes", LookMode.Def);
            Scribe_Collections.Look(ref selectedPaths, "selectedPaths", LookMode.Def);
            Scribe_Collections.Look(ref nodeProgress, "nodeProgress", LookMode.Def, LookMode.Value);
            Scribe_Collections.Look(
                ref activeEffects,
                "activeEffects",
                LookMode.Def,
                LookMode.Deep
            );

            if (Scribe.mode == LoadSaveMode.PostLoadInit)
            {
                if (unlockedUpgrades == null) unlockedUpgrades = new HashSet<UpgradeDef>();
                if (unlockedNodes == null) unlockedNodes = new HashSet<UpgradeTreeNodeDef>();
                if (selectedPaths == null) selectedPaths = new HashSet<UpgradePathDef>();
                if (nodeProgress == null) nodeProgress = new Dictionary<UpgradeTreeNodeDef, int>();
                if (activeEffects == null) activeEffects = new Dictionary<UpgradeDef, List<UpgradeEffect>>();

                foreach (var path in selectedPaths.ToList())
                {
                    OnPathSelected(path);
                }

                ReapplyUnlockedUpgrades();
            }
        }
    }
}
