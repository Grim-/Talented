using System.Collections.Generic;
using System.Linq;
using Verse;

namespace Talented
{
    public class UnlockRule_AnyPredecessor : NodeUnlockRuleDef
    {
        public override UnlockResult Validate(BaseTreeHandler handler, TalentTreeNodeDef node)
        {
            var predecessors = node.GetPredecessors(handler.TreeDef);
            if (!predecessors.Any(p => handler.IsNodeFullyUnlocked(p)))
                return UnlockResult.Failed(UpgradeUnlockError.NoPrecedingNode,
                    "Requires at least one previous upgrade path to be fully unlocked");

            return UnlockResult.Succeeded();
        }
    }

    public class UnlockRule_PredecessorCount : NodeUnlockRuleDef
    {
        public int requiredCount = 1;

        public override UnlockResult Validate(BaseTreeHandler handler, TalentTreeNodeDef node)
        {
            var predecessors = node.GetPredecessors(handler.TreeDef);
            int unlockedCount = predecessors.Count(p => handler.IsNodeFullyUnlocked(p));

            if (unlockedCount < requiredCount)
                return UnlockResult.Failed(UpgradeUnlockError.NoPrecedingNode,
                    $"Requires {requiredCount} previous upgrade paths to be fully unlocked");

            return UnlockResult.Succeeded();
        }
    }

    public class UnlockRule_SpecificNodes : NodeUnlockRuleDef
    {
        public List<TalentTreeNodeDef> requiredNodes;

        public override UnlockResult Validate(BaseTreeHandler handler, TalentTreeNodeDef node)
        {
            if (requiredNodes == null || !requiredNodes.Any())
                return UnlockResult.Succeeded();

            if (!requiredNodes.All(n => handler.IsNodeFullyUnlocked(n)))
                return UnlockResult.Failed(UpgradeUnlockError.NoPrecedingNode,
                    "Requires specific previous nodes to be unlocked");

            return UnlockResult.Succeeded();
        }
    }
}
