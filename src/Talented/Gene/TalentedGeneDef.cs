using Verse;

namespace Talented
{
    public class TalentedGeneDef : BasicResourceGeneDef
    {
        public string TabLabel = "Talents";
        public UpgradeTreeDef MainTreeDef;
        public UpgradeTreeDef SecondaryTreeDef;
        public ExperienceFormulaDef experienceFormula;
        public ExperienceGainSettings experienceGainSettings;
    }
}
