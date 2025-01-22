using Verse;

namespace Talented
{
    public class NodeUnlockRuleDef : Def
    {
        public bool overrideDefaultRules = false;

        public virtual UnlockResult Validate(BaseTreeHandler handler, TalentTreeNodeDef node)
        {
            return UnlockResult.Succeeded();
        }
    }
}
