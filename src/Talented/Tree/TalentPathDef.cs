using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using Verse;

namespace Talented
{
    public class TalentPathDef : Def
    {
        public List<TalentPathDef> exclusiveWith;
        public string pathDescription;
        public string pathUIIcon;
        public Color pathColor = Color.white;


        public bool IsPathExclusiveWith(TalentPathDef otherPath)
        {
            if (exclusiveWith == null || otherPath == null)
                return false;

            return exclusiveWith.Contains(otherPath);
        }

        public bool IsPathExclusiveWith(IEnumerable<TalentPathDef> otherPaths)
        {
            if (exclusiveWith == null || otherPaths == null || !otherPaths.Any())
                return false;

            return otherPaths.Any(IsPathExclusiveWith);
        }
    }
}
