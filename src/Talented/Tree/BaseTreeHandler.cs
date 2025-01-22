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

        protected HashSet<TalentPathDef> selectedPaths;
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
            this.selectedPaths = new HashSet<TalentPathDef>();
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

            return nodeProgress.TryGetValue(node, out int progress) &&
                   progress >= node.upgrades.Count;
        }

        public int GetNodeProgress(TalentTreeNodeDef node)
        {
            return nodeProgress.TryGetValue(node, out int progress) ? progress : 0;
        }

        public bool CanUnlockNextUpgrade(TalentTreeNodeDef node)
        {
            if (node?.upgrades == null) return false;
            int currentProgress = GetNodeProgress(node);
            return currentProgress < node.upgrades.Count;
        }
        public Color GetNodeColor(TalentTreeNodeDef node, int currentProgress)
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
            unlockedUpgrades.Add(upgrade);
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

        protected abstract UnlockResult ValidateTreeSpecificRules(TalentTreeNodeDef node);



        #region Progression Paths
        public bool IsPathSelected(TalentPathDef path) => selectedPaths.Contains(path);


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
            if (node.type == NodeType.Branch)
                return node.path != null && CanSelectPath(node.path);

            // Non-branch nodes require their path to be selected already
            if (node.path != null)
                return IsPathSelected(node.path);

            return true;
        }
        public virtual UnlockResult SelectPath(TalentPathDef path)
        {
            if (!CanSelectPath(path))
                return UnlockResult.Failed(UpgradeUnlockError.ExclusivePath, "Path conflicts with current selections");

            selectedPaths.Add(path);
            OnPathSelected(path);
            return UnlockResult.Succeeded();
        }

        public virtual bool CanSelectPath(TalentPathDef path)
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

        public abstract void OnPathSelected(TalentPathDef path);

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
            // Background with gradient-like edge effect
            Color darkBackground = new Color(0.15f, 0.15f, 0.15f, 0.85f);
            Widgets.DrawBoxSolid(rect, darkBackground);

            // Draw subtle dark edges instead of a solid border
            Color darkEdge = new Color(0.1f, 0.1f, 0.1f, 0.3f);
            Widgets.DrawBoxSolid(new Rect(rect.x, rect.y, rect.width, 1f), darkEdge);
            Widgets.DrawBoxSolid(new Rect(rect.x, rect.yMax - 1f, rect.width, 1f), darkEdge);

            // Contract the inner content area
            rect = rect.ContractedBy(6f);
            float currentX = rect.x;

            // Label with clean styling
            string label = "Talented.Tree.UI.AvailablePoints".Translate(this.treeDef.treeName, availablePoints);
            GameFont oldFont = Text.Font;
            Text.Font = GameFont.Small;
            Vector2 labelSize = Text.CalcSize(label);

            // Draw the actual label
            Rect labelRect = new Rect(currentX, rect.y + (rect.height - labelSize.y) / 2f, labelSize.x, labelSize.y);
            GUI.color = availablePoints > 0 ? new Color(0.9f, 0.9f, 0.2f) : Color.white;
            Widgets.Label(labelRect, label);
            GUI.color = Color.white;

            // Optional: Add hover tooltip
            if (Mouse.IsOver(labelRect))
            {
               // string tooltipText = "Talented.Tree.UI.PointsTooltip".Translate();
               // TooltipHandler.TipRegion(labelRect, tooltipText);
            }

            Text.Font = oldFont;
        }

        public virtual void ResetTree()
        {
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
                            if (node.upgrades[i].pointCost > 0)
                            {
                                pointsToRefund += node.upgrades[i].pointCost;
                            }
                        }
                    }
                }
            }


            unlockedUpgrades?.Clear();
            unlockedNodes?.Clear();
            selectedPaths?.Clear();
            nodeProgress?.Clear();
            activeEffects?.Clear();


            OnTalentPointsGained(pointsToRefund);


            UnlockStartingNodes();
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
                if (unlockedUpgrades == null) unlockedUpgrades = new HashSet<TalentDef>();
                if (unlockedNodes == null) unlockedNodes = new HashSet<TalentTreeNodeDef>();
                if (selectedPaths == null) selectedPaths = new HashSet<TalentPathDef>();
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
