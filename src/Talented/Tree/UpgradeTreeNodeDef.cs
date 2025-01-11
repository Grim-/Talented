using System.Collections.Generic;
using System.Linq;
using Verse;

namespace Talented
{
    public class UpgradeTreeNodeDef : Def
    {
        public List<UpgradeDef> upgrades;
        public IntVec2 position;
        public List<UpgradeTreeNodeDef> connections;
        public NodeType type = NodeType.Normal;
        public UpgradePathDef path;
        public List<BranchPathData> branchPaths;


        public bool hide = false;
        public List<UpgradeDef> prerequisitesToShow;

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


        public IEnumerable<UpgradeTreeNodeDef> GetPredecessors(UpgradeTreeDef treeDef)
        {
            return treeDef.GetAllNodes().Where(n =>
                n.connections != null && n.connections.Contains(this));
        }

        public int GetUpgradeCost(int upgradeIndex)
        {
            if (HasUpgrade(upgradeIndex))
            {
                return GetUpgrade(upgradeIndex).pointCost;
            }

            return 0;
        }

        public bool HasUpgrade(int upgradeIndex)
        {
            if (upgradeIndex < 0 || upgradeIndex > upgrades.Count)
            {
                return false;
            }
            return true;
        }
        public UpgradeDef GetUpgrade(int upgradeIndex)
        {
            if (upgradeIndex < 0 || upgradeIndex > upgrades.Count)
            {
                return null;
            }
            return upgrades[upgradeIndex];
        }
        public int UpgradeCount => upgrades != null ? upgrades.Count : 0;
        public int ConnectionCount => connections != null ? connections.Count : 0;
        public bool BelongsToUpgradePath => path != null;
        public bool IsBranchNode => type == NodeType.Branch;
    }
}
