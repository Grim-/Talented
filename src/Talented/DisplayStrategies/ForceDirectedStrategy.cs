using System.Collections.Generic;
using System.Linq;
using UnityEngine;

namespace Talented
{
    public class ForceDirectedStrategy : ITreeDisplayStrategy
    {
        private const float REPULSION_FORCE = 50f;
        private const float ATTRACTION_FORCE = 0.1f;
        private const float PATH_COHESION_FORCE = 0.3f;
        private const float MIN_SEPARATION = 100f;
        private const float DAMPING = 0.8f;
        private const float ANIMATION_SPEED = 0.05f;
        private const float MOVEMENT_THRESHOLD = 0.01f;

        // sterring behaviour values
        private const float MOUSE_AVOID_RADIUS = 150f;  
        private const float MOUSE_AVOID_FORCE = 100f;   
        private const float MOUSE_PANIC_SPEED = 2f;    

        private readonly float padding = 50f;

        private Dictionary<TalentTreeNodeDef, Vector2> currentVelocities;
        private Dictionary<TalentTreeNodeDef, Rect> targetPositions;
        private Dictionary<TalentTreeNodeDef, Rect> currentPositions;
        private bool isAnimating;

        // Track if any nodes are currently fleeing from mouse
        private bool isPanicking = false;

        public ForceDirectedStrategy()
        {
            currentVelocities = new Dictionary<TalentTreeNodeDef, Vector2>();
            targetPositions = new Dictionary<TalentTreeNodeDef, Rect>();
            currentPositions = new Dictionary<TalentTreeNodeDef, Rect>();
            isAnimating = false;
        }

        public ForceDirectedStrategy(float padding = 50f)
        {
            this.padding = padding;
            currentVelocities = new Dictionary<TalentTreeNodeDef, Vector2>();
            targetPositions = new Dictionary<TalentTreeNodeDef, Rect>();
            currentPositions = new Dictionary<TalentTreeNodeDef, Rect>();
            isAnimating = false;
        }

        public Dictionary<TalentTreeNodeDef, Rect> PositionNodes(
            List<TalentTreeNodeDef> nodes,
            Rect availableSpace,
            float nodeSize,
            float spacing)
        {
            if (!isAnimating || NeedsReset(nodes))
            {
                InitializePositions(nodes, availableSpace, nodeSize);
            }

            UpdatePositions(nodes, availableSpace, nodeSize);

            return new Dictionary<TalentTreeNodeDef, Rect>(currentPositions);
        }

        private bool NeedsReset(List<TalentTreeNodeDef> nodes)
        {
            foreach (var node in nodes)
            {
                if (!currentPositions.ContainsKey(node)) return true;
            }
            return false;
        }

        private void InitializePositions(List<TalentTreeNodeDef> nodes, Rect availableSpace, float nodeSize)
        {
            currentPositions.Clear();
            currentVelocities.Clear();
            targetPositions.Clear();

            foreach (var node in nodes)
            {
                var initialPos = new Rect(
                    Random.Range(availableSpace.x + padding, availableSpace.xMax - padding),
                    Random.Range(availableSpace.y + padding, availableSpace.yMax - padding),
                    nodeSize,
                    nodeSize
                );
                currentPositions[node] = initialPos;
                currentVelocities[node] = Vector2.zero;
            }

            isAnimating = true;
        }

        private void UpdatePositions(List<TalentTreeNodeDef> nodes, Rect availableSpace, float nodeSize)
        {
            var forces = CalculateForces(nodes, currentPositions, nodeSize);
            var totalMovement = 0f;

            // Reset panic state
            isPanicking = false;

            foreach (var node in nodes)
            {
                currentVelocities[node] = (currentVelocities[node] + forces[node]) * DAMPING;

                // Use faster animation speed if fleeing from mouse
                var currentSpeed = isPanicking ? ANIMATION_SPEED * MOUSE_PANIC_SPEED : ANIMATION_SPEED;
                var movement = currentVelocities[node] * currentSpeed;

                totalMovement += movement.magnitude;

                var currentPos = currentPositions[node];
                var newPos = new Vector2(currentPos.x, currentPos.y) + movement;

                newPos.x = Mathf.Clamp(newPos.x, availableSpace.x + padding, availableSpace.xMax - padding - nodeSize);
                newPos.y = Mathf.Clamp(newPos.y, availableSpace.y + padding, availableSpace.yMax - padding - nodeSize);

                currentPositions[node] = new Rect(newPos.x, newPos.y, nodeSize, nodeSize);
            }

            // Only consider nodes settled if they're not actively fleeing
            if (totalMovement / nodes.Count < MOVEMENT_THRESHOLD && !isPanicking)
            {
                isAnimating = false;
            }
        }

        private Dictionary<TalentTreeNodeDef, Vector2> CalculateForces(
            List<TalentTreeNodeDef> nodes,
            Dictionary<TalentTreeNodeDef, Rect> positions,
            float nodeSize)
        {
            var forces = new Dictionary<TalentTreeNodeDef, Vector2>();
            var pathCenters = new Dictionary<string, (Vector2 position, int count)>();

            // Get current mouse position in world space
            var mousePosition = Event.current?.mousePosition ?? Vector2.zero;

            // Initialize forces
            foreach (var node in nodes)
            {
                forces[node] = Vector2.zero;

                // Calculate path centers
                if (node.path != null)
                {
                    var nodePos = new Vector2(positions[node].x, positions[node].y);
                    if (pathCenters.ContainsKey(node.path.defName))
                    {
                        var (pos, count) = pathCenters[node.path.defName];
                        pathCenters[node.path.defName] = (pos + nodePos, count + 1);
                    }
                    else
                    {
                        pathCenters[node.path.defName] = (nodePos, 1);
                    }
                }
            }

            // Calculate actual centers
            foreach (var path in pathCenters.Keys.ToList())
            {
                var (pos, count) = pathCenters[path];
                pathCenters[path] = (pos / count, count);
            }

            // Calculate forces for each node
            for (int i = 0; i < nodes.Count; i++)
            {
                var node1 = nodes[i];
                var pos1 = new Vector2(positions[node1].x, positions[node1].y);

                // Apply mouse avoidance force
                var distanceToMouse = Vector2.Distance(pos1, mousePosition);
                if (distanceToMouse < MOUSE_AVOID_RADIUS)
                {
                    isPanicking = true;
                    var awayFromMouse = (pos1 - mousePosition).normalized;
                    var avoidanceStrength = 1 - (distanceToMouse / MOUSE_AVOID_RADIUS); // Stronger when closer
                    forces[node1] += awayFromMouse * MOUSE_AVOID_FORCE * avoidanceStrength;
                }

                // Apply separation force
                for (int j = 0; j < nodes.Count; j++)
                {
                    if (i == j) continue;

                    var node2 = nodes[j];
                    var pos2 = new Vector2(positions[node2].x, positions[node2].y);
                    var delta = pos1 - pos2;
                    var distance = delta.magnitude;

                    if (distance < MIN_SEPARATION)
                    {
                        var repulsionForce = delta.normalized * REPULSION_FORCE * (1 - distance / MIN_SEPARATION);
                        forces[node1] += repulsionForce;
                    }
                }

                // Apply path cohesion force
                if (node1.path != null && pathCenters.ContainsKey(node1.path.defName))
                {
                    var pathCenter = pathCenters[node1.path.defName].position;
                    var toCenter = pathCenter - pos1;
                    forces[node1] += toCenter * PATH_COHESION_FORCE;
                }

                // Apply connection attraction
                if (node1.connections != null)
                {
                    foreach (var connection in node1.connections)
                    {
                        if (!positions.ContainsKey(connection)) continue;

                        var pos2 = new Vector2(positions[connection].x, positions[connection].y);
                        var delta = pos2 - pos1;
                        forces[node1] += delta * ATTRACTION_FORCE;
                    }
                }
            }

            return forces;
        }

        public void DrawToolBar(Rect toolbarRect)
        {
            
        }
    }
}
