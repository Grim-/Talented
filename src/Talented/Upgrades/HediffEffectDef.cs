using Verse;

namespace Talented
{
    public class HediffEffectDef : UpgradeEffectDef
    {
        public HediffDef hediffDef;

        public override string Description => $"You gain {hediffDef.label}";
        public override UpgradeEffect CreateEffect()
        {
            return new HediffEffect
            {
                hediffDef = hediffDef
            };
        }
    }
}
