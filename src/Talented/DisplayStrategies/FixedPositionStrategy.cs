using System.Collections.Generic;
using UnityEngine;

namespace Talented
{
    /// <summary>
    /// A tree display strategy that positions nodes at their exact IntVec2 coordinates,
    /// scaling the positions to fit within the available space.
    /// </summary>
    public class FixedPositionStrategy : ITreeDisplayStrategy
    {
        private float MARGIN = 20f;
        public FixedPositionStrategy()
        {

        }
        public FixedPositionStrategy(float margin = 20f)
        {
            this.MARGIN = margin;
        }

        public Dictionary<TalentTreeNodeDef, Rect> PositionNodes(
            List<TalentTreeNodeDef> nodes,
            Rect availableSpace,
            float nodeSize,
            float spacing)
        {
            if (nodes == null || nodes.Count == 0)
                return new Dictionary<TalentTreeNodeDef, Rect>();

            var nodePositions = new Dictionary<TalentTreeNodeDef, Rect>();

            int minX = int.MaxValue;
            int maxX = int.MinValue;
            int minZ = int.MaxValue;
            int maxZ = int.MinValue;

            foreach (var node in nodes)
            {
                if (node.hide || !node.MeetsVisibilityRequirements(null))
                    continue;

                minX = Mathf.Min(minX, node.position.x);
                maxX = Mathf.Max(maxX, node.position.x);
                minZ = Mathf.Min(minZ, node.position.z);
                maxZ = Mathf.Max(maxZ, node.position.z);
            }


            float gridWidth = maxX - minX + 1;
            float gridHeight = maxZ - minZ + 1;

            float availableWidth = availableSpace.width - (2 * MARGIN);
            float availableHeight = availableSpace.height - (2 * MARGIN);

            // Calculate the maximum possible siz
            float maxHorizontalSize = availableWidth / gridWidth;
            float maxVerticalSize = availableHeight / gridHeight;
            float effectiveNodeSize = Mathf.Min(nodeSize, Mathf.Min(maxHorizontalSize, maxVerticalSize));

            // scaling factors
            float xScale = (availableWidth - effectiveNodeSize) / Mathf.Max(1, gridWidth - 1);
            float yScale = (availableHeight - effectiveNodeSize) / Mathf.Max(1, gridHeight - 1);

            // Position each node
            foreach (var node in nodes)
            {
                if (node.hide || !node.MeetsVisibilityRequirements(null))
                    continue;

                float normalizedX = gridWidth > 1 ?
                    (node.position.x - minX) / (float)(gridWidth - 1) : 0.5f;
                float normalizedZ = gridHeight > 1 ?
                    (node.position.z - minZ) / (float)(gridHeight - 1) : 0.5f;

                // Calculate actual position within available space
                float x = availableSpace.x + MARGIN + (normalizedX * (availableWidth - effectiveNodeSize));
                float y = availableSpace.y + MARGIN + (normalizedZ * (availableHeight - effectiveNodeSize));

                nodePositions[node] = new Rect(x, y, effectiveNodeSize, effectiveNodeSize);
            }

            return nodePositions;
        }

        public void DrawToolBar(Rect toolbarRect)
        {
           
        }
    }
}
