using System.Collections.Generic;
using System.Linq;
using UnityEngine;

namespace Talented
{
    public class FixedPositionStrategy : ITreeDisplayStrategy
    {
        private readonly float margin;
        private readonly float viewportPadding;
        private readonly bool maintainAspectRatio;

        public FixedPositionStrategy()
        {
            margin = 20f;
            viewportPadding = 0.1f;
            maintainAspectRatio = true;
        }

        public FixedPositionStrategy(float margin = 20f, float viewportPadding = 0.1f, bool maintainAspectRatio = true)
        {
            this.margin = margin;
            this.viewportPadding = viewportPadding;
            this.maintainAspectRatio = maintainAspectRatio;
        }

        public Dictionary<TalentTreeNodeDef, Rect> PositionNodes(
            List<TalentTreeNodeDef> nodes,
            Rect availableSpace,
            float unsued,
            float spacing)
        {
            if (nodes == null || nodes.Count == 0)
                return new Dictionary<TalentTreeNodeDef, Rect>();

            float toolbarHeight = 35f;

            // Create drawing space that accounts for toolbar and margins
            Rect drawingSpace = new Rect(
                availableSpace.x + margin,
                availableSpace.y + toolbarHeight + margin,
                availableSpace.width - (margin * 2),
                availableSpace.height - toolbarHeight - (margin * 2)
            );

            var nodePositions = new Dictionary<TalentTreeNodeDef, Rect>();
            var bounds = CalculateGridBounds(nodes);

            // Apply viewport padding
            float paddedWidth = drawingSpace.width * (1f - viewportPadding * 2);
            float paddedHeight = drawingSpace.height * (1f - viewportPadding * 2) + 30f;
            float paddingOffsetX = drawingSpace.x + (drawingSpace.width - paddedWidth) / 2;
            float paddingOffsetY = drawingSpace.y + (drawingSpace.height - paddedHeight) / 2;

            // Calculate grid dimensions
            float gridWidth = bounds.maxX - bounds.minX + 1;
            float gridHeight = bounds.maxZ - bounds.minZ + 1;

            // Calculate maximum space needed
            float maxRequiredWidth = 0f;
            float maxRequiredHeight = 0f;

            foreach (var node in nodes.Where(n => !n.hide && n.MeetsVisibilityRequirements(null)))
            {
                float nodeSize = GetNodeSize(node);
                float nodeRequiredWidth = (gridWidth - 1) * spacing + nodeSize;
                float nodeRequiredHeight = (gridHeight - 1) * spacing + nodeSize;

                maxRequiredWidth = Mathf.Max(maxRequiredWidth, nodeRequiredWidth);
                maxRequiredHeight = Mathf.Max(maxRequiredHeight, nodeRequiredHeight);
            }

            // Calculate scale factors
            float xScale = spacing;
            float yScale = spacing;

            if (maxRequiredWidth > paddedWidth)
            {
                xScale = (paddedWidth - maxRequiredWidth + ((gridWidth - 1) * spacing)) / (float)(gridWidth - 1);
            }

            if (maxRequiredHeight > paddedHeight)
            {
                yScale = (paddedHeight - maxRequiredHeight + ((gridHeight - 1) * spacing)) / (float)(gridHeight - 1);
            }

            if (maintainAspectRatio)
            {
                float scale = Mathf.Min(xScale, yScale);
                xScale = yScale = scale;
            }

            // Position each node with its individual size
            foreach (var node in nodes)
            {
                if (node.hide || !node.MeetsVisibilityRequirements(null))
                    continue;

                float nodeSize = GetNodeSize(node);
                float totalWidth = (gridWidth - 1) * xScale + nodeSize;
                float totalHeight = (gridHeight - 1) * yScale + nodeSize;

                float centerOffsetX = paddingOffsetX + (paddedWidth - totalWidth) / 2f;
                float centerOffsetY = paddingOffsetY + (paddedHeight - totalHeight) / 2f;

                float normalizedX = gridWidth > 1 ?
                    (node.position.x - bounds.minX) / (float)(gridWidth - 1) : 0.5f;
                float normalizedZ = gridHeight > 1 ?
                    (node.position.z - bounds.minZ) / (float)(gridHeight - 1) : 0.5f;

                float x = centerOffsetX + (normalizedX * (totalWidth - nodeSize));
                float y = centerOffsetY + (normalizedZ * (totalHeight - nodeSize));

                nodePositions[node] = new Rect(x, y, nodeSize, nodeSize);
            }

            return nodePositions;
        }

        private float GetNodeSize(TalentTreeNodeDef node)
        {
            return node.Style != null ? node.Style.nodeSize : 60f;
        }

        private (int minX, int maxX, int minZ, int maxZ) CalculateGridBounds(List<TalentTreeNodeDef> nodes)
        {
            int minX = int.MaxValue, maxX = int.MinValue;
            int minZ = int.MaxValue, maxZ = int.MinValue;

            foreach (var node in nodes)
            {
                if (node.hide || !node.MeetsVisibilityRequirements(null))
                    continue;

                minX = Mathf.Min(minX, node.position.x);
                maxX = Mathf.Max(maxX, node.position.x);
                minZ = Mathf.Min(minZ, node.position.z);
                maxZ = Mathf.Max(maxZ, node.position.z);
            }

            return (minX, maxX, minZ, maxZ);
        }

        public void DrawToolBar(Rect toolbarRect)
        {
            // Implement if needed
        }
    }
    //public class FixedPositionStrategy : ITreeDisplayStrategy
    //{
    //    private readonly float margin;
    //    private readonly float viewportPadding;
    //    private readonly bool maintainAspectRatio;

    //    public FixedPositionStrategy()
    //    {
    //        margin = 20f;
    //        viewportPadding = 0.1f;
    //        maintainAspectRatio = true;
    //    }

    //    public FixedPositionStrategy(float margin = 20f, float viewportPadding = 0.1f, bool maintainAspectRatio = true)
    //    {
    //        this.margin = margin;
    //        this.viewportPadding = viewportPadding;
    //        this.maintainAspectRatio = maintainAspectRatio;
    //    }

    //    public Dictionary<TalentTreeNodeDef, Rect> PositionNodes(
    //        List<TalentTreeNodeDef> nodes,
    //        Rect availableSpace,
    //        float nodeSize,
    //        float spacing)
    //    {
    //        if (nodes == null || nodes.Count == 0)
    //            return new Dictionary<TalentTreeNodeDef, Rect>();

    //        float toolbarHeight = 35f;

    //        // Create drawing space that accounts for toolbar and margins
    //        Rect drawingSpace = new Rect(
    //            availableSpace.x + margin,
    //            availableSpace.y + toolbarHeight + margin,
    //            availableSpace.width - (margin * 2),
    //            availableSpace.height - toolbarHeight - (margin * 2)
    //        );

    //        var nodePositions = new Dictionary<TalentTreeNodeDef, Rect>();
    //        var bounds = CalculateGridBounds(nodes);

    //        // Apply viewport padding
    //        float paddedWidth = drawingSpace.width * (1f - viewportPadding * 2);
    //        float paddedHeight = drawingSpace.height * (1f - viewportPadding * 2)  + 30f;
    //        float paddingOffsetX = drawingSpace.x + (drawingSpace.width - paddedWidth) / 2;
    //        float paddingOffsetY = drawingSpace.y + (drawingSpace.height - paddedHeight) / 2;

    //        // Calculate grid dimensions
    //        float gridWidth = bounds.maxX - bounds.minX + 1;
    //        float gridHeight = bounds.maxZ - bounds.minZ + 1;

    //        // Base scale starts at the spacing value to match web app spacing
    //        float xScale = spacing;
    //        float yScale = spacing;

    //        float requiredWidth = (gridWidth - 1) * spacing;
    //        float requiredHeight = (gridHeight - 1) * spacing;

    //        if (requiredWidth > paddedWidth - nodeSize)
    //        {
    //            xScale = (paddedWidth - nodeSize) / (float)(gridWidth - 1);
    //        }

    //        if (requiredHeight > paddedHeight - nodeSize)
    //        {
    //            yScale = (paddedHeight - nodeSize) / (float)(gridHeight - 1);
    //        }

    //        // Maintain aspect ratio if needed
    //        if (maintainAspectRatio)
    //        {
    //            float scale = Mathf.Min(xScale, yScale);
    //            xScale = yScale = scale;
    //        }

    //        // Calculate total dimensions and center offset
    //        float totalWidth = (gridWidth - 1) * xScale + nodeSize;
    //        float totalHeight = (gridHeight - 1) * yScale + nodeSize;
    //        float centerOffsetX = paddingOffsetX + (paddedWidth - totalWidth) / 2f;
    //        float centerOffsetY = paddingOffsetY + (paddedHeight - totalHeight) / 2f;

    //        foreach (var node in nodes)
    //        {
    //            if (node.hide || !node.MeetsVisibilityRequirements(null))
    //                continue;

    //            float normalizedX = gridWidth > 1 ?
    //                (node.position.x - bounds.minX) / (float)(gridWidth - 1) : 0.5f;
    //            float normalizedZ = gridHeight > 1 ?
    //                (node.position.z - bounds.minZ) / (float)(gridHeight - 1) : 0.5f;

    //            float x = centerOffsetX + (normalizedX * (totalWidth - nodeSize));
    //            float y = centerOffsetY + (normalizedZ * (totalHeight - nodeSize));

    //            nodePositions[node] = new Rect(x, y, nodeSize, nodeSize);
    //        }

    //        return nodePositions;
    //    }

    //    private (int minX, int maxX, int minZ, int maxZ) CalculateGridBounds(List<TalentTreeNodeDef> nodes)
    //    {
    //        int minX = int.MaxValue, maxX = int.MinValue;
    //        int minZ = int.MaxValue, maxZ = int.MinValue;

    //        foreach (var node in nodes)
    //        {
    //            if (node.hide || !node.MeetsVisibilityRequirements(null))
    //                continue;

    //            minX = Mathf.Min(minX, node.position.x);
    //            maxX = Mathf.Max(maxX, node.position.x);
    //            minZ = Mathf.Min(minZ, node.position.z);
    //            maxZ = Mathf.Max(maxZ, node.position.z);
    //        }

    //        return (minX, maxX, minZ, maxZ);
    //    }

    //    public void DrawToolBar(Rect toolbarRect)
    //    {
    //        // Implement if needed
    //    }
    //}
}