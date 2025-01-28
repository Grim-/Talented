using RimWorld;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using UnityEngine;
using Verse;

namespace Talented
{
    public class StatPart_TalentUpgrades : StatPart
    {
        public override string ExplanationPart(StatRequest req)
        {
            StringBuilder explanation = new StringBuilder();

            if (!req.HasThing || parentStat == null)
            {
                return string.Empty;
            }

            Pawn pawn = req.Thing as Pawn;

            if (pawn == null || pawn.genes == null)
            {
                return string.Empty;
            }

            Dictionary<StackingStatEffect, int> appliedStackingEffectLevels = new Dictionary<StackingStatEffect, int>();
            HashSet<StatEffect> appliedStatEffects = new HashSet<StatEffect>();

            foreach (var gene in pawn.genes.GenesListForReading.OfType<Gene_TalentBase>())
            {
                foreach (var tree in gene.AvailableTrees())
                {
                    if (tree.handler == null)
                    {
                        continue;
                    }

                    foreach (var upgrade in tree.handler.unlockedUpgrades)
                    {
                        if (!tree.handler.activeEffects.TryGetValue(upgrade, out var effects))
                        {
                            continue;
                        }

                        foreach (var effect in effects)
                        {
                            if (effect is StatEffect statEffect)
                            {
                                if (!appliedStatEffects.Contains(statEffect))
                                {
                                    if (statEffect.statDef == parentStat && statEffect.IsActive)
                                    {
                                        explanation.AppendLine($"Talent Upgrade: {upgrade.label}");
                                        explanation.AppendLine($"- {statEffect.operation}: {statEffect.value}");
                                    }
                                    appliedStatEffects.Add(statEffect);
                                }
                            }
                            else if (effect is StackingStatEffect stackingStatEffect)
                            {
                                if (!appliedStackingEffectLevels.ContainsKey(stackingStatEffect))
                                {
                                    appliedStackingEffectLevels[stackingStatEffect] = 0;
                                }

                                int appliedLevel = Mathf.Min(stackingStatEffect.currentLevel, stackingStatEffect.maxLevel - appliedStackingEffectLevels[stackingStatEffect]);

                                foreach (var item in stackingStatEffect.effects)
                                {
                                    if (item.statDef == parentStat && stackingStatEffect.IsActive)
                                    {
                                        for (int i = 0; i < appliedLevel; i++)
                                        {
                                            explanation.AppendLine($"Talent Upgrade: {upgrade.label} - Stack {i + 1}");
                                            explanation.AppendLine($"- {item.operation}: {item.value}");
                                        }
                                    }
                                }

                                appliedStackingEffectLevels[stackingStatEffect] += appliedLevel;
                            }
                        }
                    }
                }
            }

            return explanation.ToString();
        }
        public override void TransformValue(StatRequest req, ref float val)
        {
            if (!req.HasThing || parentStat == null)
            {
                return;
            }

            Pawn pawn = req.Thing as Pawn;

            if (pawn == null || pawn.genes == null)
            {
                return;
            }

            Dictionary<StackingStatEffect, int> appliedStackingEffectLevels = new Dictionary<StackingStatEffect, int>();
            HashSet<StatEffect> appliedStatEffects = new HashSet<StatEffect>();

            foreach (var gene in pawn.genes.GenesListForReading.OfType<Gene_TalentBase>())
            {
                foreach (var tree in gene.AvailableTrees())
                {
                    if (tree.handler == null)
                    {
                        continue;
                    }

                    foreach (var upgrade in tree.handler.unlockedUpgrades)
                    {
                        if (!tree.handler.activeEffects.TryGetValue(upgrade, out var effects))
                        {
                            continue;
                        }

                        foreach (var effect in effects)
                        {
                            if (effect is StatEffect statEffect)
                            {
                                if (!appliedStatEffects.Contains(statEffect))
                                {
                                    ApplyStatEffect(ref val, statEffect);
                                    appliedStatEffects.Add(statEffect);
                                }
                            }
                            else if (effect is StackingStatEffect stackingStatEffect)
                            {
                                if (!appliedStackingEffectLevels.ContainsKey(stackingStatEffect))
                                {
                                    appliedStackingEffectLevels[stackingStatEffect] = 0;
                                }

                                int appliedLevel = Mathf.Min(stackingStatEffect.currentLevel, stackingStatEffect.maxLevel - appliedStackingEffectLevels[stackingStatEffect]);

                                ApplyStackingStatEffect(ref val, stackingStatEffect, appliedLevel);

                                appliedStackingEffectLevels[stackingStatEffect] += appliedLevel;
                            }
                        }
                    }
                }
            }
        }

        private void ApplyStatEffect(ref float val, StatEffect statEffect)
        {
            if (statEffect.statDef == parentStat && statEffect.IsActive)
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

        private void ApplyStackingStatEffect(ref float val, StackingStatEffect stackingStatEffect, int appliedLevel)
        {
            foreach (var item in stackingStatEffect.effects)
            {
                if (item.statDef == parentStat && stackingStatEffect.IsActive)
                {
                    for (int i = 0; i < appliedLevel; i++)
                    {
                        switch (item.operation)
                        {
                            case StatModifierOperation.Add:
                                val += item.value;
                                break;
                            case StatModifierOperation.Multiply:
                                val *= item.value;
                                break;
                            case StatModifierOperation.Override:
                                val = item.value;
                                break;
                        }
                    }
                }
            }
        }
    }


}