using RimWorld;
using System.Linq;
using Verse;

namespace Talented
{
    public static class Utils
    {
        public static Gene_BasicResource GetBasicResourceGeneByStatDef(this Pawn Pawn, StatDef ResourceStat)
        {
            return (Gene_BasicResource)Pawn.genes.GenesListForReading.Where(x => x is Gene_BasicResource basicResource && basicResource.Def.maxStat == ResourceStat).FirstOrDefault();
        }
    }
}
