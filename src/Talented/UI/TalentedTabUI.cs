using RimWorld;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using Verse;

namespace Talented
{
    public class TalentedTabUI : ITab
    {
        public override bool IsVisible => SelPawn != null && CheckTalentGene();

        private bool CheckTalentGene()
        {
            if (SelPawn == null) return false;
            if (SelPawn.RaceProps?.Humanlike != true) return false;
            if (SelPawn.genes == null) return false;
            return SelPawn.genes.GetFirstGeneOfType<Gene_TalentBase>() != null;
        }
        protected Gene_TalentBase TalentGene => SelPawn.genes.GetFirstGeneOfType<Gene_TalentBase>();

        protected const float PADDING = 5f;
        protected const float TREE_BUTTON_SPACING = 5f;
        protected const float LEVEL_WIDTH = 60f;
        protected const float PROGRESS_WIDTH = 100f;
        protected const float TREE_BANNER_HEIGHT = 60f;
        protected const float TREE_ROW_HEIGHT = 40f;
        protected const float TREE_BANNER_SPACING = 15f;
        protected const float TOOLBAR_MARGIN = 20f;
        private float TreeButtonExpBarWidth = 120f;
        private float TreeButtonExpBarHeight = 18f;
        protected Vector2 tabSize = new Vector2(500, 400);
        protected float toolbarHeight => 60f;
        protected Vector2 scrollPosition;


        private Texture2D GreyTexture = SolidColorMaterials.NewSolidColorTexture(Color.grey);
        private Texture2D BannerTexture = SolidColorMaterials.NewSolidColorTexture(new Color(0.2f, 0.2f, 0.2f, 0.5f));
        private Texture2D DefaultTreeTexture = SolidColorMaterials.NewSolidColorTexture(Color.gray);

        public TalentedTabUI()
        {
            labelKey = "Talented.Tab.Label";
            size = tabSize;
        }

        protected override void FillTab()
        {
            var rect = new Rect(0, 0, tabSize.x, tabSize.y);

            var toolbarRect = rect.TopPartPixels(toolbarHeight);
            GUI.DrawTexture(toolbarRect, GreyTexture);
            DrawToolbar(toolbarRect);

            var contentRect = rect.BottomPartPixels(rect.height - toolbarHeight);
            contentRect.y += TOOLBAR_MARGIN;
            contentRect.height -= TOOLBAR_MARGIN;

            DrawContent(contentRect);
        }

        protected virtual void DrawToolbar(Rect rect)
        {
            float curX = PADDING;

            Text.Font = GameFont.Medium;
            Text.Anchor = TextAnchor.MiddleCenter;
            Widgets.LabelFit(rect, "Talent Trees");
            if (Prefs.DevMode)
            {


            }

            Text.Anchor = TextAnchor.UpperLeft;
        }

        protected virtual void DrawContent(Rect rect)
        {
            List<Gene_TalentBase> genes = GetTalentGenes();
            if (genes.Count == 0) return;

            float totalHeight = CalcTotalContentHeight(genes);
            Rect viewRect = new Rect(0, 0, rect.width - 16f, totalHeight);

            Widgets.BeginScrollView(rect, ref scrollPosition, viewRect);
            DrawGeneList(genes, viewRect);
            Widgets.EndScrollView();
        }

        private List<Gene_TalentBase> GetTalentGenes()
        {
            return SelPawn.genes.GenesListForReading
                .Where(g => g is Gene_TalentBase)
                .Cast<Gene_TalentBase>()
                .ToList();
        }

        private float CalcTotalContentHeight(List<Gene_TalentBase> genes)
        {
            float height = 0f;
            foreach (var gene in genes)
            {
                height += TREE_BANNER_HEIGHT + gene.AvailableTrees().Count() * (TREE_ROW_HEIGHT + TREE_BUTTON_SPACING);
                height += TREE_BANNER_SPACING;
            }
            return height;
        }

        private void DrawGeneList(List<Gene_TalentBase> genes, Rect viewRect)
        {
            float currentY = 0f;
            foreach (var gene in genes)
            {
                float bannerHeight = CalcBannerHeight(gene);
                DrawGeneBanner(new Rect(PADDING, currentY, viewRect.width - PADDING * 2, bannerHeight), gene);
                currentY += bannerHeight + TREE_BANNER_SPACING;
            }
        }

        private float CalcBannerHeight(Gene_TalentBase gene)
        {
            return TREE_BANNER_HEIGHT + gene.AvailableTrees().Count() * (TREE_ROW_HEIGHT + TREE_BUTTON_SPACING);
        }

        protected virtual void DrawGeneBanner(Rect rect, Gene_TalentBase gene)
        {
            DrawBannerBackground(rect, gene);
            Rect contentRect = rect.ContractedBy(10f);

            DrawBannerHeader(contentRect, gene);
            DrawBannerTrees(contentRect, gene);
        }

        private void DrawBannerBackground(Rect rect, Gene_TalentBase gene)
        {
            if (gene.HasCustomBackground)
            {
                GUI.DrawTexture(rect, gene.BackgroundTexture ?? BannerTexture);
            }
            else
            {
                Widgets.DrawBoxSolidWithOutline(rect, Color.clear, Color.gray);
            } 
        }

        private void DrawBannerHeader(Rect rect, Gene_TalentBase gene)
        {
            Rect headerRect = rect.TopPartPixels(26f);

            Text.Font = GameFont.Medium;
            Text.Anchor = TextAnchor.MiddleLeft;
            float labelWidth = Text.CalcSize(gene.def.label).x;
            Widgets.LabelFit(headerRect, "Talented.Tab.Level".Translate(gene.def.label, gene.CurrentLevel));

            if (gene is IExperienceHolder expHolder)
            {
                Rect expRect = new Rect(
                    rect.xMax - 10f - TreeButtonExpBarWidth - PADDING,
                    headerRect.y + 4f, 
                    TreeButtonExpBarWidth,
                    TreeButtonExpBarHeight
                );

                if (Mouse.IsOver(rect))
                {
                    TooltipHandler.TipRegion(expRect, $"{expHolder.CurrentExperience} / {expHolder.XPForNextLevel}");
                }
                Widgets.FillableBar(expRect, expHolder.ExperienceProgress);
            }

            Text.Anchor = TextAnchor.UpperLeft;
        }

        private void DrawBannerTrees(Rect rect, Gene_TalentBase gene)
        {
            float currentY = rect.y + 36f;
            foreach (var tree in gene.AvailableTrees())
            {
                DrawTreeButton(new Rect(rect.x, currentY, rect.width, TREE_ROW_HEIGHT), tree.handler, gene);
                currentY += TREE_ROW_HEIGHT + TREE_BUTTON_SPACING;
            }
        }

        protected virtual void DrawTreeButton(Rect rect, BaseTreeHandler tree, Gene_TalentBase gene)
        {
            DrawTreeBackground(rect, tree);
            Rect iconRect = DrawTreeIcon(rect, tree);
            DrawTreeInfo(rect, iconRect, tree, gene);
            HandleTreeInteraction(rect, tree, gene);
        }

        private void DrawTreeBackground(Rect rect, BaseTreeHandler tree)
        {
            if (tree.TreeDef?.Skin != null)
            {
                if (tree.TreeDef.Skin.HasCustomTreeListBG)
                {
                    GUI.DrawTexture(rect, tree.TreeDef.Skin?.TreeListBackgroundTexture ??
                        BannerTexture, tree.TreeDef.Skin.treeListbackgroundScaleMode);
                }
                else
                {
                    Widgets.DrawBoxSolidWithOutline(rect, tree.TreeDef.Skin.TreeListColor, tree.TreeDef.Skin.TreeListOutlineColor);
                }
            }
            else
            {
                Widgets.DrawBoxSolidWithOutline(rect, Color.clear, Color.gray);
            }
        }

        private Rect DrawTreeIcon(Rect rect, BaseTreeHandler tree)
        {
            float iconSize = rect.height - 4f;
            Rect iconRect = new Rect(rect.x + 2f, rect.y + 2f, iconSize, iconSize);
            GUI.DrawTexture(iconRect, tree.TreeDef.Skin?.BackgroundTexture ??
               DefaultTreeTexture);
            return iconRect;
        }

        private void DrawTreeInfo(Rect rect, Rect iconRect, BaseTreeHandler tree, Gene_TalentBase gene)
        {
            Text.Font = GameFont.Small;
            Text.Anchor = TextAnchor.MiddleLeft;

            Rect labelRect = new Rect(iconRect.xMax + PADDING, rect.y, rect.width * 0.3f, rect.height);
            Widgets.LabelFit(labelRect, "Talented.Tab.TreePoints".Translate(tree.TreeDef.treeName, tree.GetAvailablePoints()));
        }

        private void HandleTreeInteraction(Rect rect, BaseTreeHandler tree, Gene_TalentBase gene)
        {
            if (Mouse.IsOver(rect))
            {
                Widgets.DrawHighlight(rect);
                TooltipHandler.TipRegion(rect, "Talented.Tab.OpenTree".Translate(tree.TreeDef.treeName));
                if (Widgets.ButtonInvisible(rect))
                {
                    Find.WindowStack.Add(new TalentTreeDisplayWindow(gene, tree.TreeDef, tree, tree.TreeDef.displayStrategy));
                }
            }
            Text.Anchor = TextAnchor.UpperLeft;
        }
    }
}
