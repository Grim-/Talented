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

            // Dictionary to track effects by talent
            var talentEffects = new Dictionary<string, List<(StatEffect effect, BaseTreeHandler handler)>>();

            // Collect all effects, grouped by talent (upgrade)
            foreach (var gene in talentGenes)
            {
                foreach (var treeInstance in gene.AvailableTrees())
                {
                    if (treeInstance.handler == null) continue;

                    foreach (var upgrade in treeInstance.handler.unlockedUpgrades)
                    {
                        if (!treeInstance.handler.activeEffects.TryGetValue(upgrade, out var effects)) continue;

                        foreach (var effect in effects)
                        {
                            if (effect is StatEffect statEffect && statEffect.statDef == parentStat && statEffect.IsActive)
                            {
                                string upgradeLabel = GetUpgradeLabel(statEffect, treeInstance.handler);

                                // If this talent isn't already tracked, add it
                                if (!talentEffects.ContainsKey(upgradeLabel))
                                {
                                    talentEffects[upgradeLabel] = new List<(StatEffect, BaseTreeHandler)>();
                                }

                                talentEffects[upgradeLabel].Add((statEffect, treeInstance.handler));
                            }
                        }
                    }
                }
            }

            if (!talentEffects.Any())
                return null;

            StringBuilder sb = new StringBuilder();
            sb.AppendLine("From talents:");

            // Now iterate through each talent and show its effects
            foreach (var talent in talentEffects)
            {
                string upgradeLabel = talent.Key;  // e.g., "Enhanced Defense"
                var effectsForTalent = talent.Value;

                // For each talent, we now combine the effects and display them once
                float combinedValue = 0;
                string combinedModifier = "";

                foreach (var (effect, handler) in effectsForTalent)
                {
                    string modifierText = "";

                    switch (effect.operation)
                    {
                        case StatModifierOperation.Add:
                            combinedValue += effect.value;  // Add to the combined value
                            modifierText = effect.value.ToStringWithSign();
                            break;

                        case StatModifierOperation.Multiply:
                            combinedValue *= effect.value;  // Multiply the combined value
                            modifierText = "x" + effect.value.ToStringPercent();
                            break;

                        case StatModifierOperation.Override:
                            combinedValue = effect.value;  // Override the value
                            modifierText = "= " + effect.value;
                            break;

                        default:
                            modifierText = effect.value.ToString();
                            break;
                    }

                    combinedModifier = modifierText;  // Update with the latest modifier
                }

                // After processing all effects for the talent, append it to the explanation
                sb.AppendLine($"  {upgradeLabel}: {combinedModifier}");
            }

            return sb.ToString().TrimEnd();
        }
    }
}
