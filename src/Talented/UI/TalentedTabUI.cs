using RimWorld;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using Verse;

namespace Talented
{
    public class TalentedTabUI : ITab
    {
        protected Gene_TalentBase TalentGene => SelPawn.genes.GetFirstGeneOfType<Gene_TalentBase>();
        protected TalentedGeneDef GeneDef => SelPawn.genes.GetFirstGeneOfType<Gene_TalentBase>().TalentedGeneDef;
        public override bool IsVisible => SelPawn.genes.GetFirstGeneOfType<Gene_TalentBase>() != null;

        protected const float PADDING = 5f;
        protected const float BUTTON_WIDTH = 90f;
        protected const float LEVEL_WIDTH = 80f;
        protected const float PROGRESS_WIDTH = 100f;
        protected const float TREE_BANNER_HEIGHT = 160f;
        protected const float TREE_BANNER_SPACING = 10f;

        protected Vector2 tabSize = new Vector2(500, 400);
        protected float toolbarHeight => 40f;
        protected Vector2 scrollPosition;

        public TalentedTabUI()
        {
            labelKey = "Talents";
            size = tabSize;
        }

        protected override void FillTab()
        {
            var rect = new Rect(0, 0, tabSize.x, tabSize.y);
            var toolbarRect = rect.TopPartPixels(toolbarHeight);
            GUI.DrawTexture(toolbarRect, SolidColorMaterials.NewSolidColorTexture(Color.grey));
            DrawToolbar(toolbarRect);
            DrawContent(rect.BottomPartPixels(rect.height - toolbarHeight));
        }

        protected virtual void DrawToolbar(Rect rect)
        {
            float curX = PADDING;
            var levelLabelRect = new Rect(curX, rect.y + PADDING, LEVEL_WIDTH, rect.height - PADDING * 2);
            Widgets.DrawHighlight(levelLabelRect);
            Text.Anchor = TextAnchor.MiddleCenter;
            Widgets.Label(levelLabelRect, $"Level: {TalentGene.CurrentLevel}");
            curX += LEVEL_WIDTH + PADDING;

            Text.Anchor = TextAnchor.UpperLeft;
            if (TalentGene is IExperienceHolder expHolder)
            {
                var progressRect = new Rect(curX, rect.y + (rect.height - 18f) / 2f, PROGRESS_WIDTH, 18f);
                Widgets.FillableBar(progressRect, expHolder.ExperienceProgress);
                curX += PROGRESS_WIDTH + PADDING;
            }
        }

        protected virtual void DrawContent(Rect rect)
        {
            var availableTrees = SelPawn.genes.GenesListForReading
                .Where(g => g is Gene_TalentBase)
                .Cast<Gene_TalentBase>()
                .ToList();

            float totalHeight = (TREE_BANNER_HEIGHT + TREE_BANNER_SPACING) * availableTrees.Count;
            Rect viewRect = new Rect(0, 0, rect.width - 16f, totalHeight);

            Widgets.BeginScrollView(rect, ref scrollPosition, viewRect);

            float currentY = 0f;
            foreach (var gene in availableTrees)
            {
                DrawTreeBanner(new Rect(PADDING, currentY, viewRect.width - PADDING * 2, TREE_BANNER_HEIGHT), gene);
                currentY += TREE_BANNER_HEIGHT + TREE_BANNER_SPACING;
            }

            Widgets.EndScrollView();
        }

        protected virtual void DrawTreeBanner(Rect rect, Gene_TalentBase gene)
        {
            const float BUTTON_SIZE = 64f; 
            const float BUTTON_SPACING = 10f;
            const float LABEL_HEIGHT = 16f; 
            const float INNER_PADDING = 3f;
            const float TITLE_HEIGHT = 18f;

            Color FOOTER_COLOR = new Color(0.2f, 0.2f, 0.2f);

            GUI.DrawTexture(rect, SolidColorMaterials.NewSolidColorTexture(new Color(0.2f, 0.2f, 0.2f, 0.5f)));
            Widgets.DrawBox(rect);

            float contentPadding = 10f;
            Rect contentRect = rect.ContractedBy(contentPadding);

            Rect titleRect = contentRect.TopPartPixels(TITLE_HEIGHT);
            Text.Font = GameFont.Medium;
            Text.Anchor = TextAnchor.MiddleLeft;
            Widgets.Label(titleRect, gene.def.label);

            Rect buttonAreaRect = new Rect(
                contentRect.x,
                titleRect.yMax + contentPadding,
                contentRect.width,
                contentRect.height - TITLE_HEIGHT - contentPadding
            );

            var trees = gene.AvailableTrees().ToList();
            if (trees.Count == 0) return;


            float availableWidth = buttonAreaRect.width;
            float totalSpacing = BUTTON_SPACING * (trees.Count - 1);
            float buttonWidth = (availableWidth - totalSpacing) / trees.Count;
            buttonWidth = Mathf.Min(buttonWidth, BUTTON_SIZE);

            float startX = buttonAreaRect.x;

            foreach (var (treeDef, handler, label) in trees)
            {
                Rect buttonRect = new Rect(startX, buttonAreaRect.y, buttonWidth, BUTTON_SIZE);


                Widgets.DrawBox(buttonRect, 1, SolidColorMaterials.NewSolidColorTexture(Color.white));


                Rect innerRect = buttonRect.ContractedBy(INNER_PADDING);

                // Icon area
                Rect iconRect = new Rect(
                    innerRect.x,
                    innerRect.y,
                    innerRect.width,
                    innerRect.height - LABEL_HEIGHT
                );
                GUI.DrawTexture(iconRect, treeDef.Skin?.BackgroundTexture ?? SolidColorMaterials.NewSolidColorTexture(FOOTER_COLOR));


                Rect footerRect = new Rect(
                    buttonRect.x,
                    buttonRect.y + buttonRect.height - LABEL_HEIGHT,
                    buttonRect.width,
                    LABEL_HEIGHT
                );

                GUI.DrawTexture(footerRect, SolidColorMaterials.NewSolidColorTexture(FOOTER_COLOR));

                Text.Font = GameFont.Tiny;
                Text.Anchor = TextAnchor.MiddleCenter;
                Widgets.Label(footerRect, label);

                if (Mouse.IsOver(buttonRect))
                {
                    Widgets.DrawHighlight(buttonRect);
                    TooltipHandler.TipRegion(buttonRect, $"Open {label}");
                    if (Widgets.ButtonInvisible(buttonRect))
                    {
                        Find.WindowStack.Add(new TalentTreeDisplayWindow(gene, treeDef, handler, treeDef.displayStrategy));
                    }
                }

                startX += buttonWidth + BUTTON_SPACING;
            }

            // Reset text settings
            Text.Font = GameFont.Small;
            Text.Anchor = TextAnchor.UpperLeft;
        }
    }
    //public class TalentedTabUI : ITab
    //{
    //    protected Gene_TalentBase TalentGene => SelPawn.genes.GetFirstGeneOfType<Gene_TalentBase>();
    //    protected TalentedGeneDef GeneDef => SelPawn.genes.GetFirstGeneOfType<Gene_TalentBase>().TalentedGeneDef;
    //    public override bool IsVisible => SelPawn.genes.GetFirstGeneOfType<Gene_TalentBase>() != null;

    //    protected const float PADDING = 5f;
    //    protected const float BUTTON_WIDTH = 90f;
    //    protected const float LEVEL_WIDTH = 80f;
    //    protected const float PROGRESS_WIDTH = 100f;
    //    protected Vector2 tabSize = new Vector2(500, 400);
    //    protected float toolbarHeight => 40f;

    //    public TalentedTabUI()
    //    {
    //        labelKey = "Talents";
    //        size = tabSize;
    //    }

    //    protected override void FillTab()
    //    {
    //        var rect = new Rect(0, 0, tabSize.x, tabSize.y);
    //        var toolbarRect = rect.TopPartPixels(toolbarHeight);
    //        GUI.DrawTexture(toolbarRect, SolidColorMaterials.NewSolidColorTexture(Color.grey));
    //        DrawToolbar(toolbarRect);
    //        DrawContent(rect.BottomPartPixels(rect.height - toolbarHeight));
    //    }

    //    protected virtual void DrawToolbar(Rect rect)
    //    {
    //        float curX = PADDING;
    //        var levelLabelRect = new Rect(curX, rect.y + PADDING, LEVEL_WIDTH, rect.height - PADDING * 2);
    //        Widgets.DrawHighlight(levelLabelRect);
    //        Text.Anchor = TextAnchor.MiddleCenter;
    //        Widgets.Label(levelLabelRect, $"Level: {TalentGene.CurrentLevel}");
    //        curX += LEVEL_WIDTH + PADDING;
    //        Text.Anchor = TextAnchor.UpperLeft;

    //        if (TalentGene is IExperienceHolder expHolder)
    //        {
    //            var progressRect = new Rect(curX, rect.y + (rect.height - 18f) / 2f, PROGRESS_WIDTH, 18f);
    //            Widgets.FillableBar(progressRect, expHolder.ExperienceProgress);
    //            curX += PROGRESS_WIDTH + PADDING;
    //        }


    //        DrawTreeButtons(rect);
    //    }

    //    protected virtual void DrawTreeButtons(Rect rect)
    //    {
    //        var dropdownRect = new Rect(rect.width - (BUTTON_WIDTH * 2 + PADDING * 2),
    //            rect.y + PADDING, BUTTON_WIDTH * 2 + PADDING, rect.height - PADDING * 2);

    //        if (Widgets.ButtonText(dropdownRect, "View Trees ▼"))
    //        {
    //            var options = new List<FloatMenuOption>();

    //            foreach (var gene in SelPawn.genes.GenesListForReading.Where(g => g is Gene_TalentBase).Cast<Gene_TalentBase>())
    //            {
    //                string geneLabel = gene.def.label;

    //                options.Add(new FloatMenuOption(
    //                    $"{geneLabel} - Main Tree",
    //                    () => gene.OpenActiveTree()
    //                ));

    //                options.Add(new FloatMenuOption(
    //                    $"{geneLabel} - Secondary Tree",
    //                    () => gene.OpenPassiveTree()
    //                ));
    //            }

    //            if (options.Any())
    //            {
    //                Find.WindowStack.Add(new FloatMenu(options));
    //            }
    //        }
    //    }

    //    protected virtual void DrawContent(Rect rect)
    //    {

    //    }
    //}
}
