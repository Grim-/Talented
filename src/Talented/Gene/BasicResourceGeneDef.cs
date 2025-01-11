using RimWorld;
using UnityEngine;
using Verse;

namespace Talented
{
    public class BasicResourceGeneDef : GeneDef
    {
        public string resourceName = "resourceName";
        public StatDef maxStat;
        public StatDef regenTicks;
        public StatDef regenStat;
        public StatDef regenSpeedStat;
        public StatDef costMult;
        public Color barColor;

        public BasicResourceGeneDef()
        {
            geneClass = typeof(Gene_BasicResource);
        }
    }
}
