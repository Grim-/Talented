﻿using UnityEngine;
using Verse;

namespace Talented
{
    public class ActiveTreeHandler : BaseTreeHandler
    {
        public ActiveTreeHandler()
        {
        }

        public ActiveTreeHandler(Pawn pawn, Gene_TalentBase gene, TalentTreeDef treeDef)
            : base(pawn, gene, treeDef)
        {
           // TryUnlockNextUpgrade(this.treeDef.RootNode, true);
        }

        protected override UnlockResult ValidateTreeSpecificRules(TalentTreeNodeDef node)
        {
            // Only require path selection if this node belongs to a path
            if (node.path != null && !HasSelectedAPath() && TreeDef.availablePaths.Count > 0)
            {
                return UnlockResult.Failed(UpgradeUnlockError.ExclusivePath,
                    "Talented.Tree.Error.MustSelectPath".Translate());
            }

            int currentProgress = GetNodeProgress(node);
            if (currentProgress >= node.UpgradeCount)
                return UnlockResult.Failed(UpgradeUnlockError.AlreadyUnlocked,
                    "Talented.Tree.Error.AlreadyUnlockedAll".Translate(treeDef.defName));

            if (availablePoints < node.GetUpgradeCost(currentProgress))
            {
                return UnlockResult.Failed(UpgradeUnlockError.InsufficientPoints,
                    "Talented.Tree.Error.RequiresPoints".Translate(treeDef.defName, node.GetUpgradeCost(currentProgress)));
            }

            return UnlockResult.Succeeded();
        }

        public override UnlockResult TryUnlockNode(TalentTreeNodeDef node)
        {
            UnlockResult result = base.TryUnlockNode(node);
            if (!result.Success)
            {
                return result;
            }

            int currentProgress = GetNodeProgress(node);
            if (currentProgress >= node.UpgradeCount)
            {
                return UnlockResult.Failed(UpgradeUnlockError.AlreadyUnlocked,
                    "Talented.Tree.Error.NodeFullyUnlocked".Translate(treeDef.defName));
            }

            int cost = node.GetUpgradeCost(currentProgress);
            if (availablePoints < cost)
            {
                return UnlockResult.Failed(UpgradeUnlockError.InsufficientPoints,
                    "Talented.Tree.Error.RequiresPoints".Translate(treeDef.defName, cost));
            }

            UnlockResult unlockResult = TryUnlockNextUpgrade(node);
            if (unlockResult.Success)
            {
                this.availablePoints -= cost;
            }
            return unlockResult;
        }

        public override void OnPathSelected(TalentPath path)
        {
        }

        public override void ExposeData()
        {
            base.ExposeData();
        }

        public int GetTotalPointsSpent()
        {
            int total = 0;
            foreach (var node in treeDef.GetAllNodes())
            {
                int progress = GetNodeProgress(node);
                for (int i = 0; i < progress && i < node.UpgradeCount; i++)
                {
                    total += node.GetUpgradeCost(i);
                }
            }
            return total;
        }

        public override void DrawToolBar(Rect rect)
        {
            base.DrawToolBar(rect);

        }

        protected override void OnTalentPointsGained(int points)
        {
            availablePoints += points;
        }

        public override int GetAvailablePoints()
        {
            return availablePoints;
        }
    }
}
