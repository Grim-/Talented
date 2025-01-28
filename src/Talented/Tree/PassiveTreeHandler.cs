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

        public PassiveTreeHandler(Pawn pawn, Gene_TalentBase gene, TalentTreeDef treeDef)
            : base(pawn, gene, treeDef)
        {
            this.unspentLevels = 0;
            this.availablePoints = 0;


            SetStatusMessage("You must select a path for auto level to continue");
        }

        protected override UnlockResult ValidateTreeSpecificRules(TalentTreeNodeDef node)
        {
            int currentProgress = GetNodeProgress(node);
            if (currentProgress >= GetNodeMaxProgress(node))
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

        public override UnlockResult TryUnlockNode(TalentTreeNodeDef node)
        {
            UnlockResult result = ValidateUnlock(node);
            if (!result.Success)
            {
                return result;
            }

            int currentProgress = GetNodeProgress(node);
            if (currentProgress >= GetNodeMaxProgress(node))
            {
                return UnlockResult.Failed(UpgradeUnlockError.AlreadyUnlocked,
                    "Talented.Tree.Error.NodeFullyUnlocked".Translate(treeDef.defName));
            }

            int cost = GetTotalCostForNode(node);
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

        public override void OnPathSelected(TalentPath path)
        {
            Log.Message("Talented.Tree.Log.PathSelected".Translate(treeDef.defName, path.name, unspentLevels));
            //if (unspentLevels > 0)
            //{
            //    availablePoints += unspentLevels;
            //    unspentLevels = 0;
            //    AutoUnlockAvailableNodes();
            //}
            AutoUnlockAvailableNodes();
            ClearStatusMessage();
        }

        private void AutoUnlockAvailableNodes()
        {
            //if (!HasChosenPath && TreeDef.availablePaths.Count > 0)
            //{
            //    Log.Message("Talented.Tree.Log.NoPathChosen".Translate(treeDef.defName));
            //    return;
            //}

            Log.Message("Talented.Tree.Log.AutoUnlockAttempt".Translate(treeDef.defName));
            bool unlocked;
            do
            {
                unlocked = false;
                var availableNodes = treeDef.GetAllNodes()
                    .Where(n => !IsNodeFullyUnlocked(n) &&
                               ValidateUpgradePath(n));

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
            //if (!HasChosenPath)
            //{
            //    unspentLevels += points;
            //    Log.Message("Talented.Tree.Log.StoringPoints".Translate(treeDef.defName, points));
            //}
            //else
            //{
            //    availablePoints += points;
            //    Log.Message("Talented.Tree.Log.AddingPoints".Translate(treeDef.defName, points, availablePoints));
            //}
            availablePoints += points;
            Log.Message("Talented.Tree.Log.AddingPoints".Translate(treeDef.defName, points, availablePoints));
            AutoUnlockAvailableNodes();
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
            return availablePoints;
        }
    }
}

