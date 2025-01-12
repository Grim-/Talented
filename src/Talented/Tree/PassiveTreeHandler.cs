using RimWorld;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using Verse;

namespace Talented
{
    public class PassiveTreeHandler : BaseTreeHandler
    {
        private int currentLevel;
        private int unspentLevels;
        private int availablePoints;
        private bool HasChosenPath => HasSelectedAPath();

        public PassiveTreeHandler()
        {
        }

        public PassiveTreeHandler(Pawn pawn, Gene_TalentBase gene, UpgradeTreeDef treeDef)
            : base(pawn, gene, treeDef)
        {
            this.currentLevel = 0;
            this.unspentLevels = 0;
            this.availablePoints = 1;
        }

        protected override UnlockResult ValidateTreeSpecificRules(UpgradeTreeNodeDef node)
        {
            int currentProgress = GetNodeProgress(node);
            if (currentProgress >= node.UpgradeCount)
                return UnlockResult.Failed(UpgradeUnlockError.AlreadyUnlocked, $"{treeDef.defName} Already unlocked all upgrades in this node");

            if (node.type == NodeType.Start)
            {
                return UnlockResult.Succeeded();
            }

            if (availablePoints < node.GetUpgradeCost(currentProgress))
            {
                Log.Message($"{treeDef.defName} Insufficient points for node {node.defName}. Available: {availablePoints}, Required: {node.GetUpgradeCost(currentProgress)}");
                return UnlockResult.Failed(UpgradeUnlockError.InsufficientPoints,
                    string.Format("{0} Requires {1} points", treeDef.defName, node.GetUpgradeCost(currentProgress)));
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
                return UnlockResult.Failed(UpgradeUnlockError.AlreadyUnlocked, $"{treeDef.defName} Node is already fully unlocked");
            }

            int cost = node.GetUpgradeCost(currentProgress);
            if (availablePoints < cost)
            {
                return UnlockResult.Failed(UpgradeUnlockError.InsufficientPoints, $"{treeDef.defName} Requires {cost} points");
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
            Log.Message($"{treeDef.defName} Path selected: {path.defName}, Unspent levels: {unspentLevels}");
            if (unspentLevels > 0)
            {
                availablePoints += unspentLevels;
                unspentLevels = 0;
                AutoUnlockAvailableNodes();
            }
        }

        public override void OnLevelUp(int newLevel)
        {
            base.OnLevelUp(newLevel);
            if (!HasChosenPath)
            {
                unspentLevels++;
                Log.Message($"{treeDef.defName} Storing {unspentLevels} unspent levels");
            }
            else
            {
                availablePoints++;
                Log.Message($"{treeDef.defName} Adding {1} points, now have {availablePoints}");
                AutoUnlockAvailableNodes();
            }
        }

        private void AutoUnlockAvailableNodes()
        {
            if (!HasChosenPath)
            {
                Log.Message($"{treeDef.defName} No path chosen, skipping auto-unlock");
                return;
            }

            Log.Message($"{treeDef.defName} Attempting to auto-unlock available nodes");
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
                        Log.Message($"{treeDef.defName} Auto-unlocking node: {node.defName}");
                        if (TryUnlockNode(node).Success)
                        {
                            unlocked = true;
                        }
                    }
                }
            } while (unlocked && availablePoints > 0);
        }

        public override void ExposeData()
        {
            base.ExposeData();

            Scribe_Values.Look(ref currentLevel, "currentLevel", 0);
            Scribe_Values.Look(ref unspentLevels, "unspentLevels", 0);
            Scribe_Values.Look(ref availablePoints, "availablePoints", 0);
        }

        public override void DrawToolBar(Rect rect)
        {
            base.DrawToolBar(rect);
            rect = rect.ContractedBy(2);
            float currentX = rect.x;
            string label = $"Talent Points Available {availablePoints} unspent points {unspentLevels}";
            Vector2 labelSize = Text.CalcSize(label);
            currentX += labelSize.x;

            Rect labelRect = new Rect(currentX, rect.y, labelSize.x, labelSize.y);
            Widgets.Label(labelRect, label);
        }

        protected override void OnTalentPointsGained(int points)
        {
            if (!HasChosenPath)
            {
                unspentLevels += points;
                Log.Message($"{treeDef.defName} Storing {points} unspent levels");
            }
            else
            {
                availablePoints += points;
                Log.Message($"{treeDef.defName} Adding {points} points, now have {availablePoints}");
                AutoUnlockAvailableNodes();
            }
        }
    }
}

