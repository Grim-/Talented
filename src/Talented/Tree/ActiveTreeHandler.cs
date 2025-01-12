using System.Linq;
using UnityEngine;
using Verse;

namespace Talented
{
    public class ActiveTreeHandler : BaseTreeHandler
    {
        private int availablePoints;
        public ActiveTreeHandler()
        {

        }

        public ActiveTreeHandler(Pawn pawn, Gene_TalentBase gene, UpgradeTreeDef treeDef)
            : base(pawn, gene, treeDef)
        {
            TryUnlockNextUpgrade(this.treeDef.RootNode, true);
        }

        protected override UnlockResult ValidateTreeSpecificRules(UpgradeTreeNodeDef node)
        {
            if (node.type != NodeType.Start && !HasSelectedAPath())
            {
                return UnlockResult.Failed(UpgradeUnlockError.ExclusivePath,"Must select a path first");
            }

            int currentProgress = GetNodeProgress(node);
            if (currentProgress >= node.UpgradeCount)
                return UnlockResult.Failed(UpgradeUnlockError.AlreadyUnlocked, "Already unlocked all upgrades in this node");

            if (availablePoints < node.GetUpgradeCost(currentProgress))
            {
                return UnlockResult.Failed(UpgradeUnlockError.InsufficientPoints,
                    string.Format("Requires {0} points", node.GetUpgradeCost(currentProgress)));
            }

            return UnlockResult.Succeeded();
        }

        public int GetAvailablePoints()
        {
            return availablePoints;
        }

        public override UnlockResult TryUnlockNode(UpgradeTreeNodeDef node)
        {
            UnlockResult result = base.TryUnlockNode(node);
            if (!result.Success)
            {
                return result;
            }

            int currentProgress = GetNodeProgress(node);
            if (currentProgress >= node.UpgradeCount)
            {
                return UnlockResult.Failed(UpgradeUnlockError.AlreadyUnlocked, "Node is already fully unlocked");
            }

            int cost = node.GetUpgradeCost(currentProgress);
            if (availablePoints < cost)
            {
                return UnlockResult.Failed(UpgradeUnlockError.InsufficientPoints, $"Requires {cost} points");
            }
    
            UnlockResult unlockResult = TryUnlockNextUpgrade(node);
            if (unlockResult.Success)
            {
                this.availablePoints -= cost;
            }

            return unlockResult;
        }

        public override void OnPathSelected(UpgradePathDef path)
        {

        }

        public override void ExposeData()
        {
            base.ExposeData();
            Scribe_Values.Look(ref availablePoints, "availablePoints", 0);
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
            rect = rect.ContractedBy(2);
            float currentX = rect.x;
            string label = $"{this.treeDef.treeName} Talent Points Available {availablePoints}";
            Vector2 labelSize = Text.CalcSize(label);

            Rect labelRect = new Rect(currentX, rect.y, labelSize.x, labelSize.y);
            Widgets.Label(labelRect, label);
        }

        protected override void OnTalentPointsGained(int points)
        {
            availablePoints += points;
        }
    }
}
