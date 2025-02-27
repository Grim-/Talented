﻿using System.Collections.Generic;
using UnityEngine;

namespace Talented
{
    public class ConcentricRingStrategy : ITreeDisplayStrategy
    {
        private readonly float ringSpacing = 40f; // Space between rings
        private readonly float nodePadding = 20f;

        public ConcentricRingStrategy()
        {
        }

        public ConcentricRingStrategy(float ringSpacing = 100f, float nodePadding = 20f)
        {
            this.ringSpacing = ringSpacing;
            this.nodePadding = nodePadding;
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
            var pathGroups = GroupNodesByPath(nodes);
            var startNodes = FindStartNodes(nodes);

            // Calculate center point of available space
            Vector2 center = new Vector2(
                availableSpace.x + (availableSpace.width / 2),
                availableSpace.y + (availableSpace.height / 2)
            );

            // Position start nodes in the center
            PositionStartNodes(startNodes, nodePositions, center, nodeSize);

            // Calculate first ring radius based on available space
            float firstRingRadius = Mathf.Min(availableSpace.width, availableSpace.height) * 0.2f;

            // Position paths in concentric rings
            PositionPathRings(pathGroups, nodePositions, center, firstRingRadius, nodeSize);

            return nodePositions;
        }

        private void PositionStartNodes(
            List<TalentTreeNodeDef> startNodes,
            Dictionary<TalentTreeNodeDef, Rect> nodePositions,
            Vector2 center,
            float nodeSize)
        {
            if (startNodes.Count == 0) return;

            if (startNodes.Count == 1)
            {
                // Single start node goes in the exact center
                nodePositions[startNodes[0]] = new Rect(
                    center.x - (nodeSize / 2),
                    center.y - (nodeSize / 2),
                    nodeSize,
                    nodeSize);
            }
            else
            {
                // Multiple start nodes form a tiny ring in the center
                float innerRadius = nodeSize;
                float angleStep = 360f / startNodes.Count;

                for (int i = 0; i < startNodes.Count; i++)
                {
                    float angle = i * angleStep * Mathf.Deg2Rad;
                    Vector2 position = new Vector2(
                        center.x + (innerRadius * Mathf.Cos(angle)),
                        center.y + (innerRadius * Mathf.Sin(angle))
                    );

                    nodePositions[startNodes[i]] = new Rect(
                        position.x - (nodeSize / 2),
                        position.y - (nodeSize / 2),
                        nodeSize,
                        nodeSize);
                }
            }
        }

        private void PositionPathRings(
            Dictionary<string, List<TalentTreeNodeDef>> pathGroups,
            Dictionary<TalentTreeNodeDef, Rect> nodePositions,
            Vector2 center,
            float firstRingRadius,
            float nodeSize)
        {
            int ringIndex = 1;
            foreach (var path in pathGroups)
            {
                float ringRadius = firstRingRadius + ((ringIndex - 1) * ringSpacing);
                var orderedNodes = OrderByConnections(path.Value);

                // Calculate angle step based on number of nodes and minimum padding
                float totalAngleNeeded = orderedNodes.Count * nodePadding;
                float angleStep = Mathf.Max(360f / orderedNodes.Count, totalAngleNeeded / orderedNodes.Count);

                // Position nodes around the ring
                for (int i = 0; i < orderedNodes.Count; i++)
                {
                    float angle = i * angleStep * Mathf.Deg2Rad;
                    Vector2 position = new Vector2(
                        center.x + (ringRadius * Mathf.Cos(angle)),
                        center.y + (ringRadius * Mathf.Sin(angle))
                    );

                    nodePositions[orderedNodes[i]] = new Rect(
                        position.x - (nodeSize / 2),
                        position.y - (nodeSize / 2),
                        nodeSize,
                        nodeSize);
                }

                ringIndex++;
            }
        }

        private List<TalentTreeNodeDef> FindStartNodes(List<TalentTreeNodeDef> nodes)
        {
            return nodes.FindAll(n => n.type == NodeType.Start);
        }

        private Dictionary<string, List<TalentTreeNodeDef>> GroupNodesByPath(List<TalentTreeNodeDef> nodes)
        {
            var groups = new Dictionary<string, List<TalentTreeNodeDef>>();
            foreach (var node in nodes.FindAll(n => n.BelongsToUpgradePath))
            {
                if (string.IsNullOrEmpty(node.path))
                {
                    continue;
                }

                string key = node.path;
                if (!groups.ContainsKey(key))
                    groups[key] = new List<TalentTreeNodeDef>();
                groups[key].Add(node);
            }
            return groups;
        }

        private List<TalentTreeNodeDef> OrderByConnections(List<TalentTreeNodeDef> nodes)
        {
            var ordered = new List<TalentTreeNodeDef>();
            var processed = new HashSet<TalentTreeNodeDef>();

            var rootNodes = FindRootNodes(nodes);

            foreach (var node in rootNodes)
            {
                ProcessNode(node, processed, ordered);
            }

            foreach (var node in nodes)
            {
                if (!ordered.Contains(node))
                {
                    ordered.Add(node);
                }
            }

            return ordered;
        }

        private HashSet<TalentTreeNodeDef> FindRootNodes(List<TalentTreeNodeDef> nodes)
        {
            var targetNodes = new HashSet<TalentTreeNodeDef>();
            foreach (var node in nodes)
            {
                if (node.connections != null)
                {
                    foreach (var conn in node.connections)
                    {
                        targetNodes.Add(conn);
                    }
                }
            }

            var rootNodes = new HashSet<TalentTreeNodeDef>();
            foreach (var node in nodes)
            {
                if (!targetNodes.Contains(node))
                {
                    rootNodes.Add(node);
                }
            }

            return rootNodes;
        }

        private static void ProcessNode(
            TalentTreeNodeDef node,
            HashSet<TalentTreeNodeDef> processed,
            List<TalentTreeNodeDef> ordered)
        {
            if (processed.Contains(node)) return;

            processed.Add(node);
            ordered.Add(node);

            if (node.connections == null) return;

            foreach (var connection in node.connections)
            {
                ProcessNode(connection, processed, ordered);
            }
        }

        public void DrawToolBar(Rect toolbarRect)
        {
           
        }
    }
}
