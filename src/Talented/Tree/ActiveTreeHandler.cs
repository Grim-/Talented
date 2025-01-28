using System.Linq;
using UnityEngine;
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
            if (currentProgress >= GetNodeMaxProgress(node))
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
            int maxProgress = GetNodeMaxProgress(node);

            if (currentProgress >= maxProgress)
            {
                return UnlockResult.Failed(UpgradeUnlockError.AlreadyUnlocked,
                    "Talented.Tree.Error.NodeFullyUnlocked".Translate(treeDef.defName));
            }

            int totalCost = GetTotalCostForNode(node);

            if (availablePoints < totalCost)
            {
                return UnlockResult.Failed(UpgradeUnlockError.InsufficientPoints,
                    "Talented.Tree.Error.RequiresPoints".Translate(treeDef.defName, totalCost));
            }

            UnlockResult unlockResult = TryUnlockNextUpgrade(node);
            if (unlockResult.Success)
            {
                this.availablePoints -= totalCost;
            }
            return unlockResult;
        }



        public override void OnPathSelected(TalentPath path)
        {
        }


        public int GetTotalPointsSpent()
        {
            int total = 0;
            foreach (var node in treeDef.GetAllNodes())
            {
                int progress = GetNodeProgress(node);
                for (int i = 0; i < progress && i < GetNodeMaxProgress(node); i++)
                {
                    total += node.GetUpgradeCost(i);
                }
            }
            return total;
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
