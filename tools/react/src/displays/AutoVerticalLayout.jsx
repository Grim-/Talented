export class VerticalTreeStrategy {
  constructor(startFromBottom = true, horizontalPadding = 40, verticalPadding = 30) {
    this.DEFAULT_VERTICAL_SPACING = 120;
    this.StartAtBottom = startFromBottom;
    this.HORIZONTAL_PADDING = horizontalPadding;
    this.VERTICAL_PADDING = verticalPadding;
  }

  applyLayout(nodes, gameWidth, gameHeight, previewWidth, previewHeight) {
    if (!nodes || nodes.length === 0) return nodes;

    const startNodes = nodes.filter(n => n.type === 'Start');
    const newPositions = new Map();
    
    const baseHeights = new Map(nodes.map(node => [
      node.id, 
      node.height - 200
    ]));

    // Calculate levels
    const levels = this.calculateLevels(nodes);
    const maxLevel = Math.max(...Array.from(levels.values()));
    
    const verticalSpacing = Math.min(
      this.DEFAULT_VERTICAL_SPACING,
      (gameHeight - (2 * this.VERTICAL_PADDING)) / (maxLevel + 1)
    );

    const startY = this.StartAtBottom ? 
      gameHeight - this.VERTICAL_PADDING - (baseHeights.get(nodes[0]?.id) || 0) :
      this.VERTICAL_PADDING;

    // Position start nodes
    if (startNodes.length === 1) {
      newPositions.set(startNodes[0].id, {
        x: (gameWidth - startNodes[0].width) / 2,
        y: startY
      });
    } else if (startNodes.length > 1) {
      const totalWidth = startNodes.reduce((sum, node) => sum + node.width, 0);
      const spacing = (gameWidth - totalWidth - (2 * this.HORIZONTAL_PADDING)) / (startNodes.length - 1);
      
      let currentX = this.HORIZONTAL_PADDING;
      startNodes.forEach(node => {
        newPositions.set(node.id, {
          x: currentX,
          y: startY
        });
        currentX += node.width + spacing;
      });
    }

    // Position remaining nodes by level
    for (let level = 1; level <= maxLevel; level++) {
      const nodesInLevel = nodes.filter(n => levels.get(n.id) === level);
      
      const y = this.StartAtBottom ?
        startY - (level * verticalSpacing) :
        startY + (level * verticalSpacing);

      // Group nodes by their parent
      const nodesByParent = new Map();
      nodesInLevel.forEach(node => {
        const parent = nodes.find(n => 
          n.connections && n.connections.includes(node.id)
        );
        if (parent) {
          if (!nodesByParent.has(parent.id)) {
            nodesByParent.set(parent.id, []);
          }
          nodesByParent.get(parent.id).push(node);
        }
      });

      nodesByParent.forEach((children, parentId) => {
        const parentPos = newPositions.get(parentId);
        if (!parentPos) return;

        const totalWidth = children.reduce((sum, node) => sum + node.width, 0);
        const spacing = (gameWidth - totalWidth - (2 * this.HORIZONTAL_PADDING)) / Math.max(1, children.length - 1);
        
        let currentX = this.HORIZONTAL_PADDING;
        children.forEach(node => {
          newPositions.set(node.id, {
            x: currentX,
            y
          });
          currentX += node.width + spacing;
        });
      });
    }

    // Apply new positions while preserving current heights
    return nodes.map(node => {
      const pos = newPositions.get(node.id);
      if (pos) {
        const currentHeight = node.height;
        node.x = pos.x;
        node.y = pos.y;
        node.height = currentHeight; // Preserve the current height
      }
      return node;
    });
  }

  calculateLevels(nodes) {
    const levels = new Map();
    const visited = new Set();

    const findLevel = (nodeId, level) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      levels.set(nodeId, Math.max(level, levels.get(nodeId) || 0));
      
      const node = nodes.find(n => n.id === nodeId);
      if (!node?.connections) return;
      
      node.connections.forEach(childId => {
        findLevel(childId, level + 1);
      });
    };

    nodes
      .filter(n => n.type === 'Start')
      .forEach(node => findLevel(node.id, 0));

    return levels;
  }
}