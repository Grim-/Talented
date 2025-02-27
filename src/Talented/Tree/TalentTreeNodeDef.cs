﻿using System.Collections.Generic;
using System.Linq;
using Verse;

namespace Talented
{
    public class TalentTreeNodeDef : Def
    {
        public List<TalentDef> upgrades;
        public IntVec2 position;
        public List<TalentTreeNodeDef> connections;
        public NodeType type = NodeType.Normal;
        public string path;
        public NodeStyleDef style;

        public NodeStyleDef Style
        {
            get
            {
                if (style == null)
                {
                    style = TalentedDefOf.DefaultNodeStyle;
                }

                return style;
            }
        }


        public List<BranchPathData> branchPaths;

        public List<NodeUnlockRuleDef> unlockRules;

        public bool sequential = false;
        public bool hide = false;
        public List<TalentDef> prerequisitesToShow;
        public int UpgradeCount => upgrades != null ? upgrades.Count : 0;
        public int ConnectionCount => connections != null ? connections.Count : 0;
        public bool BelongsToUpgradePath => path != null;
        public bool IsBranchNode => type == NodeType.Branch;

        public bool MeetsVisibilityRequirements(BaseTreeHandler treeHandler)
        {
            if (prerequisitesToShow == null || prerequisitesToShow.Count == 0)
            {
                return true;
            }

            bool result = true;
            var neededReqs = prerequisitesToShow.ToList();

            foreach (var item in neededReqs)
            {
                if (!treeHandler.HasUnlockUpgrade(item))
                {
                    return false;
                }
            }

            return result;
        }

        public int GetNodeMaxProgress()
        {
            if (upgrades == null)
                return 0;

            bool IsStackingStatEffect = upgrades.Any(x => x.stackingStatEffect != null);

            if (IsStackingStatEffect)
            {
                return upgrades.Where(x => x.stackingStatEffect != null).FirstOrDefault().stackingStatEffect.maxRepeats;
            }

            return upgrades.Count;
        }

        public IEnumerable<TalentTreeNodeDef> GetPredecessors(TalentTreeDef treeDef)
        {
            return treeDef.GetAllNodes().Where(n =>
                n.connections != null && n.connections.Contains(this));
        }

        public int GetUpgradeCost(int upgradeIndex)
        {
            if (HasUpgrade(upgradeIndex))
            {
                TalentDef upgrade = GetUpgrade(upgradeIndex);
                if (upgrade.stackingStatEffect != null)
                {
                    int currentLevel = upgrade.stackingStatEffect.currentRepeats;
                    if (currentLevel < upgrade.stackingStatEffect.maxRepeats)
                    {
                        return upgrade.pointCost;
                    }
                }
                return upgrade.pointCost;
            }
            return 0;
        }
        public string GetUpgradeLabel(int upgradeIndex)
        {
            if (HasUpgrade(upgradeIndex))
            {
                return GetUpgrade(upgradeIndex).label;
            }

            return "Unamed Node";
        }
        public bool HasUpgrade(int upgradeIndex)
        {
            if (upgradeIndex < 0 || upgradeIndex >= upgrades.Count)
            {
                return false;
            }
            return true;
        }
        public TalentDef GetUpgrade(int upgradeIndex)
        {
            if (upgradeIndex < 0 || upgradeIndex >= upgrades.Count)
            {
                return null;
            }

            return upgrades[upgradeIndex];
        }

    }
}
