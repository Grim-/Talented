using Verse;

namespace Talented
{
    public abstract class UpgradeEffectDef : Def
    {
        public abstract string Description { get; }
        public abstract UpgradeEffect CreateEffect();
    }
}
