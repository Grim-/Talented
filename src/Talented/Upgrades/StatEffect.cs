using RimWorld;
using System.Linq;
using Verse;

namespace Talented
{
    public class StatEffect : UpgradeEffect
    {
        public TalentDef parentUpgrade;
        public StatDef statDef;
        public float value;
        public StatModifierOperation operation;

        protected override bool IsEffectPresent(Pawn pawn)
        {
            return IsActive;
        }

        protected override void Apply(Pawn pawn)
        {
            isActive = true;
        }

        protected override void Remove(Pawn pawn)
        {
            isActive = false;
        }

        public override void ExposeData()
        {
            base.ExposeData();
            Scribe_Defs.Look(ref statDef, "statDef");
            Scribe_Values.Look(ref value, "value");
            Scribe_Values.Look(ref operation, "operation");
        }
    }


    public enum StatModifierOperation
    {
        Add,
        Multiply,
        Override
    }
}
