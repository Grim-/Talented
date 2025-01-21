using System.Collections.Generic;
using Verse;

namespace Talented
{
    public class TalentedGeneDef : BasicResourceGeneDef
    {


        public string TabLabel = "Talents";
        public TalentTreeDef MainTreeDef;
        public List<TalentTreeDef> TalentTrees;
        public TalentTreeDef SecondaryTreeDef;
        public ExperienceFormulaDef experienceFormula;
        public ExperienceGainSettings experienceGainSettings;

        public string geneListBackgroundTexturePath = string.Empty;

        public TalentedGeneDef()
        {
            geneClass = typeof(Gene_TalentBase);
            resourceGizmoType = typeof(GeneGizmo_BasicResource);
        }
    }
}
