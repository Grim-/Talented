using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using Verse;

namespace Talented
{
    public class TalentPath : IExposable
    {
        public string name;
        public List<string> exclusiveWith;
        public string pathDescription;
        public string pathUIIcon;
        public Color pathColor = Color.white;


        public bool IsPathExclusiveWith(TalentPath otherPath)
        {
            if (exclusiveWith == null || otherPath == null)
                return false;

            return exclusiveWith.Contains(otherPath.name);
        }

        public bool IsPathExclusiveWith(IEnumerable<TalentPath> otherPaths)
        {
            if (exclusiveWith == null || otherPaths == null || !otherPaths.Any())
                return false;

            return otherPaths.Any(IsPathExclusiveWith);
        }


        public void ExposeData()
        {
            //save everything

            Scribe_Values.Look(ref name, "name");
        }
    }
}
