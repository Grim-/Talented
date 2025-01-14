using RimWorld;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Verse;

namespace Talented
{
    public class StatPart_TalentUpgrades : StatPart
    {
        public override void TransformValue(StatRequest req, ref float val)
        {
            if (parentStat == null) return;

            if (!req.HasThing)
                return;

            Pawn pawn = req.Thing as Pawn;
            if (pawn == null || pawn.genes == null)
                return;

            var talentGenes = pawn.genes.GenesListForReading
                .OfType<Gene_TalentBase>();

            foreach (var gene in talentGenes)
            {
                foreach (var TreeInstanceData in gene.AvailableTrees())
                {
                    if (TreeInstanceData.handler == null || TreeInstanceData.handler.activeEffects == null)
                        continue;

                    foreach (var effectList in TreeInstanceData.handler.activeEffects.Values)
                    {
                        foreach (var effect in effectList)
                        {
                            if (effect is StatEffect statEffect &&
                                statEffect.statDef == parentStat &&
                                statEffect.IsActive)
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

        private string GetUpgradeLabel(StatEffect effect, BaseTreeHandler handler)
        {
            var upgrade = effect.parentUpgrade;
            if (upgrade == null) return "Unknown upgrade";

            foreach (var nodePair in handler.NodeProgress)
            {
                var node = nodePair.Key;
                if (node.upgrades != null && node.upgrades.Contains(upgrade))
                {
                    int rank = node.upgrades.IndexOf(upgrade) + 1;
                    return $"{upgrade.label} ({node.label} Rank {rank} )";
                }
            }

            return upgrade.label;
        }

        public override string ExplanationPart(StatRequest req)
        {
            if (parentStat == null) return null;

            if (!req.HasThing)
                return null;

            Pawn pawn = req.Thing as Pawn;
            if (pawn == null || pawn.genes == null)
                return null;

            var talentGenes = pawn.genes.GenesListForReading
                .OfType<Gene_TalentBase>();

            var effectDetails = new List<(StatEffect effect, BaseTreeHandler handler)>();

            foreach (var gene in talentGenes)
            {
                foreach (var TreeInstanceData in gene.AvailableTrees())
                {
                    if (TreeInstanceData.handler == null || TreeInstanceData.handler.activeEffects == null)
                        continue;

                    foreach (var effectList in TreeInstanceData.handler.activeEffects.Values)
                    {
                        foreach (var effect in effectList)
                        {
                            if (effect is StatEffect statEffect &&
                                statEffect.statDef == parentStat &&
                                statEffect.IsActive)
                            {
                                effectDetails.Add((statEffect, TreeInstanceData.handler));
                            }
                        }
                    }
                }
            }

            if (!effectDetails.Any())
                return null;

            StringBuilder sb = new StringBuilder();
            sb.AppendLine("From talents:");

            foreach (var (effect, handler) in effectDetails)
            {
                string modifierText;
                switch (effect.operation)
                {
                    case StatModifierOperation.Add:
                        modifierText = effect.value.ToStringWithSign();
                        break;
                    case StatModifierOperation.Multiply:
                        modifierText = "x" + effect.value.ToStringPercent();
                        break;
                    case StatModifierOperation.Override:
                        modifierText = "= " + effect.value;
                        break;
                    default:
                        modifierText = effect.value.ToString();
                        break;
                }

                string upgradeInfo = GetUpgradeLabel(effect, handler);
                sb.AppendLine($"  {upgradeInfo}: {modifierText}");
            }

            return sb.ToString().TrimEnd();
        }
    }
}
