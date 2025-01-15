using System.Collections.Generic;
using UnityEngine;

namespace Talented
{
    public class RadialTreeStrategy : ITreeDisplayStrategy
    {
        private float MIN_RING_SPACING = 100f;
        private float CENTER_PADDING = 90f;
        public RadialTreeStrategy()
        {

        }
        public RadialTreeStrategy(float minRingSpacing = 100f, float centerPadding = 50f)
        {
            MIN_RING_SPACING = minRingSpacing;
            CENTER_PADDING = centerPadding;
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
            var startNodes = nodes.FindAll(n => n.type == NodeType.Start);

            if (startNodes.Count == 0)
                return nodePositions;

            // Create path sections and calculate max depth
            var pathSections = new Dictionary<TalentTreeNodeDef, (float startAngle, float endAngle)>();
            var nodeDepths = new Dictionary<TalentTreeNodeDef, int>();
            int maxDepth = CalculateDepthsAndSections(startNodes[0], nodes, pathSections, nodeDepths);

            // Calculate the maximum radius based on available space
            float maxRadius = Mathf.Min(availableSpace.width, availableSpace.height) / 2f - nodeSize;
            float ringSpacing = Mathf.Min(MIN_RING_SPACING, (maxRadius - CENTER_PADDING) / maxDepth);

            // Position start node at center
            var center = new Vector2(
                availableSpace.x + availableSpace.width / 2f,
                availableSpace.y + availableSpace.height / 2f
            );

            nodePositions[startNodes[0]] = new Rect(
                center.x - nodeSize / 2f,
                center.y - nodeSize / 2f,
                nodeSize,
                nodeSize
            );

            // Position all other nodes
            foreach (var node in nodes)
            {
                if (node.type == NodeType.Start)
                    continue;

                var depth = nodeDepths[node];
                var radius = CENTER_PADDING + (depth * ringSpacing);
                var parentPath = FindParentPath(node, nodes);

                if (!pathSections.ContainsKey(parentPath))
                    continue;

                var (startAngle, endAngle) = pathSections[parentPath];
                var siblings = GetSiblingNodes(node, parentPath, nodes);
                var angleSlice = (endAngle - startAngle) / (siblings.Count + 1);
                var nodeIndex = siblings.IndexOf(node) + 1;
                var angle = startAngle + (angleSlice * nodeIndex);

                var position = new Vector2(
                    center.x + radius * Mathf.Cos(angle),
                    center.y + radius * Mathf.Sin(angle)
                );

                nodePositions[node] = new Rect(
                    position.x - nodeSize / 2f,
                    position.y - nodeSize / 2f,
                    nodeSize,
                    nodeSize
                );
            }

            return nodePositions;
        }

        private int CalculateDepthsAndSections(
            TalentTreeNodeDef startNode,
            List<TalentTreeNodeDef> allNodes,
            Dictionary<TalentTreeNodeDef, (float startAngle, float endAngle)> pathSections,
            Dictionary<TalentTreeNodeDef, int> nodeDepths)
        {
            var visited = new HashSet<TalentTreeNodeDef>();
            int maxDepth = 0;

            void TraverseTree(TalentTreeNodeDef node, int depth, float startAngle, float endAngle)
            {
                if (visited.Contains(node))
                    return;

                visited.Add(node);
                nodeDepths[node] = depth;
                maxDepth = Mathf.Max(maxDepth, depth);
                pathSections[node] = (startAngle, endAngle);

                if (node.connections == null || node.connections.Count == 0)
                    return;

                float angleStep = (endAngle - startAngle) / node.connections.Count;
                for (int i = 0; i < node.connections.Count; i++)
                {
                    float connectionStartAngle = startAngle + (i * angleStep);
                    float connectionEndAngle = connectionStartAngle + angleStep;
                    TraverseTree(node.connections[i], depth + 1, connectionStartAngle, connectionEndAngle);
                }
            }

            TraverseTree(startNode, 0, 0, Mathf.PI * 2);
            return maxDepth;
        }

        private TalentTreeNodeDef FindParentPath(TalentTreeNodeDef node, List<TalentTreeNodeDef> allNodes)
        {
            foreach (var potential in allNodes)
            {
                if (potential.connections != null && potential.connections.Contains(node))
                    return potential;
            }
            return null;
        }

        private List<TalentTreeNodeDef> GetSiblingNodes(
            TalentTreeNodeDef node,
            TalentTreeNodeDef parent,
            List<TalentTreeNodeDef> allNodes)
        {
            if (parent?.connections == null)
                return new List<TalentTreeNodeDef>();

            return parent.connections;
        }

        public void DrawToolBar(Rect toolbarRect)
        {
            // Implementation for toolbar if needed
        }
    }
}
