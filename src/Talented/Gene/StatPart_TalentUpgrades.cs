using RimWorld;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Verse;

namespace Talented
{
    public class StatPart_TalentUpgrades : StatPart
    {
        public override string ExplanationPart(StatRequest req)
        {
            return string.Empty;
        }

        public override void TransformValue(StatRequest req, ref float val)
        {
            if (!req.HasThing || parentStat == null) return;
            Pawn pawn = req.Thing as Pawn;
            if (pawn == null || pawn.genes == null) return;

            foreach (var gene in pawn.genes.GenesListForReading.OfType<Gene_TalentBase>())
            {
                foreach (var tree in gene.AvailableTrees())
                {
                    if (tree.handler == null) continue;

                    foreach (var upgrade in tree.handler.unlockedUpgrades)
                    {
                        if (!tree.handler.activeEffects.TryGetValue(upgrade, out var effects)) continue;

                        foreach (var effect in effects)
                        {
                            if (effect is StatEffect statEffect && statEffect.statDef == parentStat && statEffect.IsActive)
                            {
                                switch (statEffect.operation)
                                {
                                    case StatModifierOperation.Add:
                                        val += statEffect.value;
                                        break;
                                    case StatModifierOperation.Multiply:
                                        val *= statEffect.value;
                                        break;
                                    case StatModifierOperation.Override:
                                        val = statEffect.value;
                                        break;
                                }
                            }
                        }
                    }
                }
            }
        }

        private class StatExplanation
        {
            public StatEffect effect;
            public BaseTreeHandler hander;
        }
    }
}
