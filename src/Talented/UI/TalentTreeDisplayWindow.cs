using RimWorld;
using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using Verse;

namespace Talented
{
    public class TalentTreeDisplayWindow : Window
    {
        private readonly Gene_TalentBase parasiteGene;
        private readonly TalentTreeDef treeDef;
        private readonly BaseTreeHandler treeHandler;
        private Vector2 scrollPosition;
        private readonly List<TalentTreeNodeDef> allNodes;
        private readonly ITreeDisplayStrategy displayStrategy;
        private Dictionary<TalentTreeNodeDef, Rect> nodePositions;
        private readonly List<UIAnimationState> activeAnimations = new List<UIAnimationState>();
        private readonly TalentTreeSkinDef skin;

        protected override float Margin => skin != null ? skin.windowMargin : 0;


        protected virtual float ToolBarHeight => 35f;
        protected virtual float ToolBarPadding => 20f;

        private Vector2 WindowSize = new Vector2(450f, 800f);
        public override Vector2 InitialSize => WindowSize;

        public TalentTreeDisplayWindow(Gene_TalentBase parasite, TalentTreeDef tree, BaseTreeHandler handler, TreeDisplayStrategyDef displayStrategyDef)
        {
            if (parasite == null)
            {
                Log.Error("TalentTreeDisplayWindow: parasite gene was null");
                return;
            }

            if (tree == null)
            {
                Log.Error("TalentTreeDisplayWindow: tree def was null");
                return;
            }

            if (handler == null)
            {
                Log.Error("TalentTreeDisplayWindow: tree handler was null");
                return;
            }

            if (displayStrategyDef == null)
            {
                Log.Error("TalentTreeDisplayWindow: display strategy def was null");
                return;
            }

            doWindowBackground = false;
            parasiteGene = parasite;
            treeDef = tree;

            float heightMargin = ToolBarHeight + ToolBarPadding;
            this.WindowSize = new Vector2(this.treeDef.dimensions.x > 0 ? this.treeDef.dimensions.x : this.InitialSize.x, this.treeDef.dimensions.z > 0 ? this.treeDef.dimensions.z + heightMargin : this.InitialSize.y + heightMargin);
            treeHandler = handler;
            allNodes = treeDef.GetAllNodes() ?? new List<TalentTreeNodeDef>();
            skin = tree.Skin;

            displayStrategy = (ITreeDisplayStrategy)Activator.CreateInstance(displayStrategyDef.strategyClass);


            if (displayStrategy == null)
            {
                Log.Error("TalentTreeDisplayWindow: display strategy failed to be created.");
                return;
            }


            doCloseButton = false;
            doCloseX = true;
            forcePause = true;
            absorbInputAroundWindow = false;
        }


        private const float DefaultNodeSize = 50f;

        public override void DoWindowContents(Rect inRect)
        {
            DrawBackground(inRect);

            Rect toolbarRect = new Rect(0f, 0f, inRect.width, ToolBarHeight);
            DrawToolbar(toolbarRect);

            nodePositions = displayStrategy.PositionNodes(allNodes, inRect, DefaultNodeSize, skin.nodeSpacing);
            DrawConnections();
            DrawNodes();
        }

        private void DrawBackground(Rect inRect)
        {
            if (skin?.BackgroundTexture != null)
            {
                GUI.color = Color.white;
                GUI.DrawTexture(inRect, skin.BackgroundTexture, skin.backgroundScaleMode);
            }
        }

        private void DrawNodes()
        {
            foreach (var kvp in nodePositions)
            {
                DrawNode(kvp.Key, kvp.Value);
            }
        }
        private void DrawNode(TalentTreeNodeDef node, Rect nodeRect)
        {
            UnlockResult canUnlockResult = treeHandler.ValidateUnlock(node);
            int currentProgress = treeHandler.GetNodeProgress(node);
            bool isFullyUnlocked = treeHandler.IsNodeFullyUnlocked(node);
            if (!node.hide || node.hide && node.MeetsVisibilityRequirements(treeHandler))
            {
                if (node.BelongsToUpgradePath)
                {
                    float borderThickness = 2;
                    Rect pathRect = nodeRect;
                    pathRect.x -= borderThickness;
                    pathRect.y -= borderThickness;
                    pathRect.width += 4;
                    pathRect.height += 4;
                    GUI.color = Color.yellow;
                    if (node.Style != null)
                    {
                        GUI.DrawTexture(pathRect, node.Style.GlowTexture);
                    }
                }

                // Draw glow effect if node has a style with glow
                if (node.Style != null && node.Style.glowIntensity > 0)
                {
                    GUI.color = node.Style.borderColor * node.Style.glowIntensity;
                    if (node.Style != null && node.Style.pulsing)
                    {
                        float pulse = Mathf.PingPong(Time.realtimeSinceStartup * node.Style.pulseSpeed, 1f);
                        GUI.color *= pulse;
                    }
                    GUI.DrawTexture(nodeRect, node.Style.GlowTexture);
                }

                GUI.color = treeHandler.GetNodeColor(node, currentProgress);
                if (node.Style != null)
                {
                    GUI.DrawTexture(nodeRect, node.Style.Texture);
                }
                GUI.color = Color.white;

                if (currentProgress > 0 && !isFullyUnlocked)
                {
                    float progressPercentage = (float)currentProgress / treeHandler.GetNodeMaxProgress(node);
                    Rect progressRect = nodeRect;
                    progressRect.height *= progressPercentage;
                    progressRect.y = nodeRect.yMax - progressRect.height;
                    GUI.color = Color.red;
                    if (node.Style != null)
                    {
                        GUI.DrawTexture(nodeRect, node.Style.Texture);
                    }
                    GUI.color = Color.white;
                }

                DrawNodeIconBG(node, nodeRect);
                DrawNodeIcon(node, treeHandler, nodeRect);
                HandleNodeClick(nodeRect, node, canUnlockResult);

                if (Mouse.IsOver(nodeRect))
                {
                    DrawNodeBadge(node, nodeRect, currentProgress);
                    DrawDescription(nodeRect, node, currentProgress);
                }
            }
            else
            {
                if (node.BelongsToUpgradePath)
                {
                    TalentPath path = this.treeHandler.TreeDef.GetPath(node.path);
                    GUI.color = new Color(path.pathColor.r, path.pathColor.g, path.pathColor.b, 0.1f);
                }
                else
                {
                    GUI.color = new Color(0.1f, 0.1f, 0.1f, 0.1f);
                }
                if (node.Style != null)
                {
                    GUI.DrawTexture(nodeRect, node.Style.Texture);
                }
                GUI.color = Color.white;
            }
        }
        //private void DrawNode(TalentTreeNodeDef node, Rect nodeRect)
        //{
        //    UnlockResult canUnlockResult = treeHandler.ValidateUnlock(node);
        //    int currentProgress = treeHandler.GetNodeProgress(node);
        //    bool isFullyUnlocked = treeHandler.IsNodeFullyUnlocked(node);
        //    if (!node.hide || node.hide && node.MeetsVisibilityRequirements(treeHandler))
        //    {
        //        if (node.BelongsToUpgradePath)
        //        {
        //            float borderThickness = 2;
        //            Rect pathRect = nodeRect;
        //            pathRect.x -= borderThickness;
        //            pathRect.y -= borderThickness;
        //            pathRect.width += 4;
        //            pathRect.height += 4;
        //            GUI.color = Color.yellow;
        //            if (node.Style != null)
        //            {
        //                GUI.DrawTexture(pathRect, node.Style.Texture);
        //            }
        //        }

        //        GUI.color = treeHandler.GetNodeColor(node, currentProgress);
        //        if (node.Style != null) 
        //        {
        //            GUI.DrawTexture(nodeRect, node.Style.Texture);
        //        }
        //        GUI.color = Color.white;

        //        if (currentProgress > 0 && !isFullyUnlocked)
        //        {
        //            float progressPercentage = (float)currentProgress / treeHandler.GetNodeMaxProgress(node);
        //            Rect progressRect = nodeRect;
        //            progressRect.height *= progressPercentage;
        //            progressRect.y = nodeRect.yMax - progressRect.height;
        //            GUI.color = Color.red;
        //            if (node.Style != null)
        //            {
        //                GUI.DrawTexture(nodeRect, node.Style.Texture);
        //            }
        //            GUI.color = Color.white;
        //        }
        //        DrawNodeIconBG(node, nodeRect);
        //        DrawNodeIcon(node, treeHandler, nodeRect);

        //        HandleNodeClick(nodeRect, node, canUnlockResult);
        //        if (Mouse.IsOver(nodeRect))
        //        {
        //            DrawNodeBadge(node, nodeRect, currentProgress);
        //            DrawDescription(nodeRect, node, currentProgress);
        //        }
        //    }
        //    else
        //    {
        //        if (node.BelongsToUpgradePath)
        //        {
        //            TalentPath path = this.treeHandler.TreeDef.GetPath(node.path);
        //            GUI.color = new Color(path.pathColor.r, path.pathColor.g, path.pathColor.b, 0.1f);
        //        }
        //        else
        //        {
        //            GUI.color = new Color(0.1f, 0.1f, 0.1f, 0.1f);
        //        }
        //        if (node.Style != null)
        //        {
        //            GUI.DrawTexture(nodeRect, node.Style.Texture);
        //        }

        //        GUI.color = Color.white;
        //    }
        //}
        private void DrawNodeBadge(TalentTreeNodeDef node, Rect nodeRect, int currentProgress)
        {
            int progress = treeHandler.GetNodeProgress(node);
            int maxProgress = node.upgrades.Sum(upgrade => upgrade.stackingStatEffect?.maxRepeats ?? 1);

            string label = "";
            if (!node.upgrades.NullOrEmpty())
            {
                var upgrade = node.upgrades[0];
                if (upgrade.stackingStatEffect != null)
                {
                    label = $"{upgrade.label} {progress}/{upgrade.stackingStatEffect.maxRepeats}";
                }
                else
                {
                    label = $"{upgrade.label} {progress}/{maxProgress}";
                }
            }

            Vector2 labelSize = Text.CalcSize(label);
            float padding = 4f;
            float xPos = nodeRect.x + (nodeRect.width - (labelSize.x + padding * 2)) / 2;
            float yPos = nodeRect.y - (labelSize.y + padding * 2) - 2f;
            Rect badgeRect = new Rect(xPos, yPos, labelSize.x + padding * 2, labelSize.y + padding * 2);
            Widgets.DrawBoxSolid(badgeRect, new Color(0, 0, 0, 0.5f));
            Widgets.DrawBox(badgeRect, 1, null);
            Text.Font = GameFont.Small;
            Rect labelRect = new Rect(
                badgeRect.x + padding,
                badgeRect.y + padding,
                labelSize.x,
                labelSize.y
            );
            Widgets.Label(labelRect, label);
            Text.Font = GameFont.Small;
        }

        private void HandleNodeClick(Rect nodeRect, TalentTreeNodeDef node, UnlockResult canUnlockResult)
        {
            if (!Widgets.ButtonInvisible(nodeRect))
                return;

            TalentPath nodePath = this.treeDef.GetPath(node.path);

            if (node.BelongsToUpgradePath && nodePath != null && !treeHandler.IsPathSelected(nodePath))
            {
                HandlePathSelection(node);
                if (treeHandler.IsPathSelected(nodePath))
                {
                    HandleSuccessfulUnlock(node);
                }
            }
            else if (canUnlockResult.Success)
            {
                HandleSuccessfulUnlock(node);
            }
            else
            {
                Messages.Message(canUnlockResult.Message, MessageTypeDefOf.RejectInput);
            }
        }

        private void HandleSuccessfulUnlock(TalentTreeNodeDef node)
        {
            if (treeHandler != null)
            {
                var unlockResult = treeHandler.TryUnlockNode(node);
                if (!unlockResult.Success)
                {
                    Messages.Message(unlockResult.Message, MessageTypeDefOf.RejectInput);
                    return;
                }
            }
        }
        private void HandlePathSelection(TalentTreeNodeDef node)
        {
            TalentPath nodePath = this.treeDef.GetPath(node.path);

            if (node.BelongsToUpgradePath && nodePath != null &&
                !treeHandler.IsPathSelected(nodePath) && treeHandler.CanSelectPath(nodePath))
            {
                UnlockResult result = treeHandler.SelectPath(nodePath);
                if (result.Success)
                {
                    var predecessors = node.GetPredecessors(treeDef)
                        .Where(p => treeHandler.IsNodeFullyUnlocked(p));

                    foreach (var predecessor in predecessors)
                    {
                        activeAnimations.Add(new ConnectionAnimation
                        {
                            startTime = Time.time,
                            duration = 0.5f,
                            startPos = nodePositions[predecessor].center,
                            endPos = nodePositions[node].center,
                            color = skin.unlockedNodeColor
                        });
                    }
                    Messages.Message($"Selected {node.path} upgrade path.", MessageTypeDefOf.NeutralEvent);
                }
                else
                {
                    Messages.Message(result.Message, MessageTypeDefOf.RejectInput);
                }
            }
            else
            {
                Messages.Message("Cannot select this path - conflicts with existing selection", MessageTypeDefOf.RejectInput);
            }
        }

        private void DrawNodeIcon(TalentTreeNodeDef node, BaseTreeHandler tree, Rect nodeRect)
        {
            Rect iconRect = nodeRect.ContractedBy(8f);
            Texture2D iconToUse = null;
            if (!node.upgrades.NullOrEmpty())
            {
                TalentDef upgrade = node.upgrades.FirstOrDefault();
                if (upgrade != null && !string.IsNullOrEmpty(upgrade.uiIconPath))
                {
                    iconToUse = ContentFinder<Texture2D>.Get(upgrade.uiIconPath);
                }
            }
            if (iconToUse == null)
            {
                iconToUse = tree.TreeDef.Skin.DefaultUpgradeIcon;
            }
            if (iconToUse != null)
            {
                Widgets.DrawTextureFitted(iconRect, iconToUse, 1f);
            }
        }
        private void DrawNodeIconBG(TalentTreeNodeDef node, Rect nodeRect)
        {
            //Rect iconRect = nodeRect.ContractedBy(1f);
            //Texture2D icon = skin.NodeBackgroundTexture;
            //if (icon != null)
            //{
            //    Widgets.DrawTextureFitted(iconRect, icon, 1f);
            //}
        }

        private void DrawDescription(Rect nodeRect, TalentTreeNodeDef node, int currentProgress)
        {
            bool isFullyUnlocked = treeHandler.IsNodeFullyUnlocked(node);
            UnlockResult canUnlockResult = treeHandler.ValidateUnlock(node);
            string tooltip = "";

            if (!node.upgrades.NullOrEmpty())
            {
                var upgrade = node.upgrades[0];
                if (upgrade.stackingStatEffect != null)
                {
                    int currentLevel = currentProgress;
                    tooltip = $"{upgrade.label} (Level {currentLevel})\n{upgrade.FormattedDescriptionString}";

                    if (currentLevel < upgrade.stackingStatEffect.maxRepeats)
                    {
                        tooltip += $"\n\nNext Level: {currentLevel + 1}/{upgrade.stackingStatEffect.maxRepeats}";
                    }
                    else
                    {
                        tooltip += "\n\nMaximum level reached";
                    }
                }
                else
                {
                    // Show current upgrade description if any upgrades are unlocked
                    if (currentProgress > 0)
                    {
                        var currentUpgrade = node.upgrades[currentProgress - 1];
                        tooltip = $"Current Upgrade: {currentUpgrade.label}\n{currentUpgrade.FormattedDescriptionString}";
                    }
                    // Show next upgrade description if not fully unlocked
                    if (currentProgress < this.treeHandler.GetNodeMaxProgress(node))
                    {
                        var nextUpgrade = node.upgrades[currentProgress];
                        if (!string.IsNullOrEmpty(tooltip))
                        {
                            tooltip += "\n\n";
                        }
                        tooltip += $"Next Upgrade: {nextUpgrade?.label ?? "Unknown"}\n{nextUpgrade?.FormattedDescriptionString ?? "Unknown upgrade"}";
                    }
                }
            }

            if (Prefs.DevMode)
            {
                tooltip += "\n[== Debug Info ==]";
                tooltip += $"\nNode: {node.defName}";
                tooltip += $"\nType: {node.type}";
                tooltip += $"\nFully Unlocked: {isFullyUnlocked}";
                tooltip += $"\nCan Unlock Next: {canUnlockResult.Success}";
                TalentPath nodePath = treeDef.GetPath(node.path);
                if (node.BelongsToUpgradePath && nodePath != null)
                {
                    tooltip += $"\nPath: {node.path}";
                    tooltip += $"\nPath Selected: {treeHandler.IsPathSelected(nodePath)}";
                }
            }

            if (!isFullyUnlocked && !canUnlockResult.Success)
            {
                tooltip += $"\n\nUnlock Error: {canUnlockResult.Message}";
            }

            TooltipHandler.TipRegion(nodeRect, tooltip);
        }
        private void DrawConnections()
        {
            foreach (var node in allNodes)
            {
                if (node.connections != null)
                {
                    foreach (var connection in node.connections)
                    {
                        if (node.hide && !node.MeetsVisibilityRequirements(treeHandler) || connection.hide && !connection.MeetsVisibilityRequirements(treeHandler))
                        {
                            continue;
                        }

                        if (nodePositions.ContainsKey(node) && nodePositions.ContainsKey(connection))
                        {
                            if (skin.HasConnectionTexure)
                            {
                                DrawTexturedConnection(node, connection);
                            }
                            else
                            {
                                DrawConnection(node, connection);
                            }                                                
                        }
                    }
                }
            }
        }

        private void DrawConnection(TalentTreeNodeDef from, TalentTreeNodeDef to)
        {
            Vector2 start = nodePositions[from].center;
            Vector2 end = nodePositions[to].center;

            Color lineColor = GetPathStatusColor(from, to);
            Widgets.DrawLine(start, end, lineColor, skin.connectionThickness);

            if (skin.showConnectionArrows && Vector2.Distance(start, end) > from.Style.nodeSize)
            {
                DrawConnectionArrow(start, end, lineColor);
            }
        }
        private void DrawTexturedConnection(TalentTreeNodeDef from, TalentTreeNodeDef to)
        {
            if (from == null || to == null || skin == null || skin.ConnectionTexture == null)
            {
                return;
            }

            Vector2 start = nodePositions[from].center;
            Vector2 end = nodePositions[to].center;
            Color lineColor = GetPathStatusColor(from, to);

            float distance = Vector2.Distance(start, end);
            Vector2 direction = (end - start).normalized;
            float angle = Mathf.Atan2(direction.y, direction.x) * Mathf.Rad2Deg;

            int numberOfLinks = Mathf.Max(1, Mathf.FloorToInt(distance / skin.connectionLinkSize));
            float spacing = distance / numberOfLinks;

            Matrix4x4 matrixBackup = GUI.matrix;
            GUI.color = lineColor;

            for (int i = 0; i < numberOfLinks; i++)
            {
                matrixBackup = GUI.matrix;
                float progress = i / (float)(numberOfLinks - 1);
                Vector2 position = Vector2.Lerp(start, end, progress);

                Rect linkRect = new Rect(
                    position.x - skin.connectionLinkSize / 2,
                    position.y - skin.connectionLinkSize / 2,
                    skin.connectionLinkSize,
                    skin.connectionLinkSize
                );

                GUIUtility.RotateAroundPivot(angle, position);

                if (skin != null && skin.ConnectionTexture)
                {
                    GUI.DrawTexture(linkRect, skin.ConnectionTexture);
                }

           
                GUI.matrix = matrixBackup;
            }

            GUI.color = Color.white;
            GUI.matrix = matrixBackup;

            if (skin.showConnectionArrows && distance > from.Style.nodeSize)
            {
                DrawConnectionArrow(start, end, lineColor);
            }
        }

        private Color GetPathStatusColor(TalentTreeNodeDef from, TalentTreeNodeDef to)
        {
            if (treeHandler == null)
            {
                return skin?.inactiveConnectionColor ?? Color.gray;
            }

            PathStatus status = treeHandler.GetPathStatusBetweenNodes(from, to);

            if (skin == null)
            {
                return Color.gray;
            }

            switch (status)
            {
                case PathStatus.Unlocked:
                    return skin.unlockedConnectionColor;
                case PathStatus.Active:
                    return skin.activeConnectionColor;
                case PathStatus.Locked:
                    return skin.inactiveConnectionColor;
                default:
                    return Color.gray;
            }
        }

        private void DrawConnectionArrow(Vector2 start, Vector2 end, Color color)
        {
            Vector2 direction = (start - end).normalized;
            Vector2 arrowCenter = Vector2.Lerp(start, end, 0.5f);

            Vector2 right = new Vector2(-direction.y, direction.x);
            Vector2 arrowPoint1 = arrowCenter + (direction * skin.arrowSize / 2) + (right * skin.arrowSize / 2);
            Vector2 arrowPoint2 = arrowCenter + (direction * skin.arrowSize / 2) - (right * skin.arrowSize / 2);
            Vector2 arrowBase = arrowCenter - (direction * skin.arrowSize / 2);

            Widgets.DrawLine(arrowBase, arrowPoint1, color, skin.connectionThickness);
            Widgets.DrawLine(arrowBase, arrowPoint2, color, skin.connectionThickness);
        }

        private void DrawToolbar(Rect rect)
        {
            treeHandler?.DrawToolBar(rect);
        }
    }

    public class NodeStyleDef : Def
    {
        public float nodeSize = 50f;
        public string texturePath;
        public string glowTexturePath;
        public Color borderColor = Color.white;
        public bool pulsing = false;
        public float pulseSpeed = 1f;
        public float glowIntensity = 1f;

        private Texture2D cachedTexture;
        private Texture2D cachedGlowTexture;

        public Texture2D Texture
        {
            get
            {
                if (cachedTexture == null && !texturePath.NullOrEmpty())
                {
                    cachedTexture = ContentFinder<Texture2D>.Get(texturePath);
                }
                return cachedTexture;
            }
        }

        public Texture2D GlowTexture
        {
            get
            {
                if (cachedGlowTexture == null && !glowTexturePath.NullOrEmpty())
                {
                    cachedGlowTexture = ContentFinder<Texture2D>.Get(glowTexturePath);
                }
                else if(cachedGlowTexture == null && glowTexturePath.NullOrEmpty())
                {
                    return Texture;
                }

                return cachedGlowTexture;
            }
        }
    }
}
