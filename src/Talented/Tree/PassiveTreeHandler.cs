using RimWorld;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using Verse;

namespace Talented
{
    public class PassiveTreeHandler : BaseTreeHandler
    {
        private int unspentLevels;
        private bool HasChosenPath => HasSelectedAPath();

        public PassiveTreeHandler()
        {
        }

        public PassiveTreeHandler(Pawn pawn, Gene_TalentBase gene, UpgradeTreeDef treeDef)
            : base(pawn, gene, treeDef)
        {
            this.unspentLevels = 0;
            this.availablePoints = 1;
        }

        protected override UnlockResult ValidateTreeSpecificRules(UpgradeTreeNodeDef node)
        {
            int currentProgress = GetNodeProgress(node);
            if (currentProgress >= node.UpgradeCount)
                return UnlockResult.Failed(UpgradeUnlockError.AlreadyUnlocked,
                    "Talented.Tree.Error.AlreadyUnlockedAll".Translate(treeDef.defName));

            if (node.type == NodeType.Start)
            {
                return UnlockResult.Succeeded();
            }

            if (availablePoints < node.GetUpgradeCost(currentProgress))
            {
                Log.Message("Talented.Tree.Log.InsufficientPoints".Translate(
                    treeDef.defName, node.defName, availablePoints, node.GetUpgradeCost(currentProgress)));

                return UnlockResult.Failed(UpgradeUnlockError.InsufficientPoints,
                    "Talented.Tree.Error.RequiresPoints".Translate(treeDef.defName, node.GetUpgradeCost(currentProgress)));
            }
            return UnlockResult.Succeeded();
        }

        public override UnlockResult TryUnlockNode(UpgradeTreeNodeDef node)
        {
            UnlockResult result = ValidateUnlock(node);
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
                availablePoints -= cost;
            }
            return unlockResult;
        }

        public override void OnPathSelected(UpgradePathDef path)
        {
            Log.Message("Talented.Tree.Log.PathSelected".Translate(treeDef.defName, path.defName, unspentLevels));
            if (unspentLevels > 0)
            {
                availablePoints += unspentLevels;
                unspentLevels = 0;
                AutoUnlockAvailableNodes();
            }
        }

        private void AutoUnlockAvailableNodes()
        {
            if (!HasChosenPath)
            {
                Log.Message("Talented.Tree.Log.NoPathChosen".Translate(treeDef.defName));
                return;
            }

            Log.Message("Talented.Tree.Log.AutoUnlockAttempt".Translate(treeDef.defName));
            bool unlocked;
            do
            {
                unlocked = false;
                var availableNodes = treeDef.GetAllNodes()
                    .Where(n => !IsNodeFullyUnlocked(n) &&
                               ValidateUpgradePath(n) &&
                               n.type != NodeType.Start);

                foreach (var node in availableNodes)
                {
                    UnlockResult result = ValidateUnlock(node);
                    if (result.Success)
                    {
                        Log.Message("Talented.Tree.Log.AutoUnlockNode".Translate(treeDef.defName, node.defName));
                        if (TryUnlockNode(node).Success)
                        {
                            unlocked = true;
                        }
                    }
                }
            } while (unlocked && availablePoints > 0);
        }

        protected override void OnTalentPointsGained(int points)
        {
            if (!HasChosenPath)
            {
                unspentLevels += points;
                Log.Message("Talented.Tree.Log.StoringPoints".Translate(treeDef.defName, points));
            }
            else
            {
                availablePoints += points;
                Log.Message("Talented.Tree.Log.AddingPoints".Translate(treeDef.defName, points, availablePoints));
                AutoUnlockAvailableNodes();
            }
        }

        public override void DrawToolBar(Rect rect)
        {
            base.DrawToolBar(rect);
            rect = rect.ContractedBy(2);
            float currentX = rect.x;
            string label = "Talented.Tree.UI.AvailablePoints".Translate(this.treeDef.treeName, availablePoints);
            Vector2 labelSize = Text.CalcSize(label);

            Rect labelRect = new Rect(currentX, rect.y, labelSize.x, labelSize.y);
            Widgets.Label(labelRect, label);
        }

        public override void ResetTree()
        {
            this.unspentLevels = 0;
            base.ResetTree();
        }

        public override void ExposeData()
        {
            base.ExposeData();
            Scribe_Values.Look(ref unspentLevels, "unspentLevels", 0);
        }

        public override int GetAvailablePoints()
        {
            return !HasChosenPath ? unspentLevels : availablePoints;
        }
    }
    //public class PassiveTreeHandler : BaseTreeHandler
    //{
    //    private int unspentLevels;
    //    private bool HasChosenPath => HasSelectedAPath();

    //    public PassiveTreeHandler()
    //    {
    //    }

    //    public PassiveTreeHandler(Pawn pawn, Gene_TalentBase gene, UpgradeTreeDef treeDef)
    //        : base(pawn, gene, treeDef)
    //    {
    //        this.unspentLevels = 0;
    //        this.availablePoints = 1;
    //    }

    //    protected override UnlockResult ValidateTreeSpecificRules(UpgradeTreeNodeDef node)
    //    {
    //        int currentProgress = GetNodeProgress(node);
    //        if (currentProgress >= node.UpgradeCount)
    //            return UnlockResult.Failed(UpgradeUnlockError.AlreadyUnlocked, $"{treeDef.defName} Already unlocked all upgrades in this node");

    //        if (node.type == NodeType.Start)
    //        {
    //            return UnlockResult.Succeeded();
    //        }

    //        if (availablePoints < node.GetUpgradeCost(currentProgress))
    //        {
    //            Log.Message($"{treeDef.defName} Insufficient points for node {node.defName}. Available: {availablePoints}, Required: {node.GetUpgradeCost(currentProgress)}");
    //            return UnlockResult.Failed(UpgradeUnlockError.InsufficientPoints,
    //                string.Format("{0} Requires {1} points", treeDef.defName, node.GetUpgradeCost(currentProgress)));
    //        }
    //        return UnlockResult.Succeeded();
    //    }
    //    public override UnlockResult TryUnlockNode(UpgradeTreeNodeDef node)
    //    {
    //        UnlockResult result = ValidateUnlock(node);
    //        if (!result.Success)
    //        {
    //            return result;
    //        }

    //        int currentProgress = GetNodeProgress(node);
    //        if (currentProgress >= node.UpgradeCount)
    //        {
    //            return UnlockResult.Failed(UpgradeUnlockError.AlreadyUnlocked, $"{treeDef.defName} Node is already fully unlocked");
    //        }

    //        int cost = node.GetUpgradeCost(currentProgress);
    //        if (availablePoints < cost)
    //        {
    //            return UnlockResult.Failed(UpgradeUnlockError.InsufficientPoints, $"{treeDef.defName} Requires {cost} points");
    //        }

    //        UnlockResult unlockResult = TryUnlockNextUpgrade(node);
    //        if (unlockResult.Success)
    //        {
    //            availablePoints -= cost;
    //        }
    //        return unlockResult;
    //    }

    //    public override void OnPathSelected(UpgradePathDef path)
    //    {
    //        Log.Message($"{treeDef.defName} Path selected: {path.defName}, Unspent levels: {unspentLevels}");
    //        if (unspentLevels > 0)
    //        {
    //            availablePoints += unspentLevels;
    //            unspentLevels = 0;
    //            AutoUnlockAvailableNodes();
    //        }
    //    }

    //    private void AutoUnlockAvailableNodes()
    //    {
    //        if (!HasChosenPath)
    //        {
    //            Log.Message($"{treeDef.defName} No path chosen, skipping auto-unlock");
    //            return;
    //        }

    //        Log.Message($"{treeDef.defName} Attempting to auto-unlock available nodes");
    //        bool unlocked;
    //        do
    //        {
    //            unlocked = false;
    //            var availableNodes = treeDef.GetAllNodes()
    //                .Where(n => !IsNodeFullyUnlocked(n) &&
    //                           ValidateUpgradePath(n) &&
    //                           n.type != NodeType.Start);

    //            foreach (var node in availableNodes)
    //            {
    //                UnlockResult result = ValidateUnlock(node);
    //                if (result.Success)
    //                {
    //                    Log.Message($"{treeDef.defName} Auto-unlocking node: {node.defName}");
    //                    if (TryUnlockNode(node).Success)
    //                    {
    //                        unlocked = true;
    //                    }
    //                }
    //            }
    //        } while (unlocked && availablePoints > 0);
    //    }


    //    public override void ResetTree()
    //    {
    //        this.unspentLevels = 0;
    //        base.ResetTree();
    //    }

    //    public override void ExposeData()
    //    {
    //        base.ExposeData();
    //        Scribe_Values.Look(ref unspentLevels, "unspentLevels", 0);

    //    }

    //    public override void DrawToolBar(Rect rect)
    //    {
    //        base.DrawToolBar(rect);
    //        rect = rect.ContractedBy(2);
    //        float currentX = rect.x;
    //        string label = $"{this.treeDef.treeName} Talent Points Available {availablePoints}";
    //        Vector2 labelSize = Text.CalcSize(label);

    //        Rect labelRect = new Rect(currentX, rect.y, labelSize.x, labelSize.y);
    //        Widgets.Label(labelRect, label);
    //    }

    //    protected override void OnTalentPointsGained(int points)
    //    {
    //        if (!HasChosenPath)
    //        {
    //            unspentLevels += points;
    //            Log.Message($"{treeDef.defName} Storing {points} unspent levels");
    //        }
    //        else
    //        {
    //            availablePoints += points;
    //            Log.Message($"{treeDef.defName} Adding {points} points, now have {availablePoints}");
    //            AutoUnlockAvailableNodes();
    //        }
    //    }

    //    public override int GetAvailablePoints()
    //    {
    //        return !HasChosenPath ? unspentLevels : availablePoints;
    //    }
    //}
}

