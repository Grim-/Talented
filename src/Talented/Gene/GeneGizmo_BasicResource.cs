using RimWorld;
using System.Collections.Generic;
using UnityEngine;
using Verse;

namespace Talented
{
    [StaticConstructorOnStartup]
    public class GeneGizmo_BasicResource : GeneGizmo_Resource
    {
        private const float TotalPulsateTime = 0.85f;
        private List<Pair<IGeneResourceDrain, float>> tmpDrainGenes = new List<Pair<IGeneResourceDrain, float>>();

        protected override string Title
        {
            get
            {
                if (gene is Gene_BasicResource resourceGene && resourceGene.Def != null)
                {
                    return resourceGene.Def.resourceLabel;
                }
                return base.Title;
            }
        }

        public GeneGizmo_BasicResource(Gene_Resource gene, List<IGeneResourceDrain> drainGenes, Color barColor, Color barHighlightColor) : base(gene, drainGenes, barColor, barHighlightColor)
        {
            if (gene == null)
            {
                Log.Error("GeneGizmo_ResourceAstral created with null gene");
                return;
            }
        }

        protected override string GetTooltip()
        {
            if (!(gene is Gene_BasicResource resourceGene)) return "";

            string text = $"{resourceGene.Def.resourceLabel.CapitalizeFirst().Colorize(ColoredText.TipSectionTitleColor)}: {resourceGene.ValueForDisplay} / {resourceGene.MaxForDisplay}\n";

            string regen = $"\nRegenerates {resourceGene.RegenAmount} every {GenDate.ToStringTicksToPeriod(resourceGene.RegenTicks)}";

            if (!resourceGene.def.resourceDescription.NullOrEmpty())
            {
                text += $"\n\n{resourceGene.def.resourceDescription.Formatted(resourceGene.pawn.Named("PAWN")).Resolve()}";
            }

            return text + regen;
        }
    }
}
