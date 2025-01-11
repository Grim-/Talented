using Verse;

namespace Talented
{
    public class OrganEffectDef : UpgradeEffectDef
    {
        public BodyPartDef targetOrgan;
        public HediffDef addedOrganHediff;
        public bool isAddition;

        public override string Description => $"You gain a {addedOrganHediff.label} {(isAddition && targetOrgan != null ? $"attached to {targetOrgan.LabelShort}" : string.Empty)}";


        public override UpgradeEffect CreateEffect()
        {
            return new OrganEffect
            {
                targetOrgan = targetOrgan,
                addedOrganHediff = addedOrganHediff,
                isAddition = isAddition
            };
        }
    }
}
