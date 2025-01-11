using RimWorld;
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
        protected Vector2 tabSize = new Vector2(500, 400);
        protected float toolbarHeight => 40f;

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

            // Level display
            var levelLabelRect = new Rect(curX, rect.y + PADDING, LEVEL_WIDTH, rect.height - PADDING * 2);
            Widgets.DrawHighlight(levelLabelRect);
            Text.Anchor = TextAnchor.MiddleCenter;
            Widgets.Label(levelLabelRect, $"Level: {TalentGene.CurrentLevel}");
            curX += LEVEL_WIDTH + PADDING;

            // Talent Points display
            var pointsLabelRect = new Rect(curX, rect.y + PADDING, LEVEL_WIDTH, rect.height - PADDING * 2);
            Widgets.DrawHighlight(pointsLabelRect);
            Widgets.Label(pointsLabelRect, $"Points: {TalentGene.TalentPointsAvailable}");
            curX += LEVEL_WIDTH + PADDING;

            Text.Anchor = TextAnchor.UpperLeft;

            // Experience Progress
            if (TalentGene is IExperienceHolder expHolder)
            {
                var progressRect = new Rect(curX, rect.y + (rect.height - 18f) / 2f, PROGRESS_WIDTH, 18f);
                Widgets.FillableBar(progressRect, expHolder.ExperienceProgress);
                curX += PROGRESS_WIDTH + PADDING;
            }

            // Tree Buttons
            DrawTreeButtons(rect);
        }

        protected virtual void DrawTreeButtons(Rect rect)
        {
            var mainTreeRect = new Rect(rect.width - (BUTTON_WIDTH * 2 + PADDING * 2),
                rect.y + PADDING, BUTTON_WIDTH, rect.height - PADDING * 2);
            if (Widgets.ButtonText(mainTreeRect, "Main Tree"))
            {
                TalentGene.OpenActiveTree();
            }

            var secondaryTreeRect = new Rect(rect.width - (BUTTON_WIDTH + PADDING),
                rect.y + PADDING, BUTTON_WIDTH, rect.height - PADDING * 2);
            if (Widgets.ButtonText(secondaryTreeRect, "Secondary Tree"))
            {
                TalentGene.OpenPassiveTree();
            }
        }

        protected virtual void DrawContent(Rect rect)
        {
            // Override this to add custom content below the toolbar
        }
    }
}
