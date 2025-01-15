using RimWorld;
using Verse;

namespace Talented
{
    public class XPExtension : DefModExtension
    {
        public float xpGain = 1f;
        public StatDef multiplierStat;


        public float GetMultiplier(Pawn pawn)
        {
            if (multiplierStat == null)
            {
                return 1;
            }

            return pawn.GetStatValue(multiplierStat);
        }
    }
}
