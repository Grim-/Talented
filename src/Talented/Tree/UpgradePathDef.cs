using System.Collections.Generic;
using System.Linq;
using Verse;

namespace Talented
{
    public class UpgradePathDef : Def
    {
        public List<UpgradePathDef> exclusiveWith;
        public string pathDescription;
        public string pathUIIcon;


        public bool IsPathExclusiveWith(UpgradePathDef otherPath)
        {
            if (exclusiveWith == null || otherPath == null)
                return false;

            return exclusiveWith.Contains(otherPath);
        }

        public bool IsPathExclusiveWith(IEnumerable<UpgradePathDef> otherPaths)
        {
            if (exclusiveWith == null || otherPaths == null || !otherPaths.Any())
                return false;

            return otherPaths.Any(IsPathExclusiveWith);
        }
    }
}
