export class FixedPositionStrategy {
  constructor(margin = 20) {
    this.MARGIN = margin;
  }

  applyLayout(nodes, gameWidth, gameHeight, previewWidth, previewHeight) {
    if (!nodes || nodes.length === 0) return nodes;

    let minX = Number.MAX_VALUE;
    let maxX = Number.MIN_VALUE;
    let minY = Number.MAX_VALUE;
    let maxY = Number.MIN_VALUE;

    // Find bounds using base height without expansion
    nodes.forEach(node => {
      if (node.hide) return;
      minX = Math.min(minX, node.x);
      maxX = Math.max(maxX, node.x);
      minY = Math.min(minY, node.y);
      maxY = Math.max(maxY, node.y);
    });

    const gridWidth = maxX - minX;
    const gridHeight = maxY - minY;

    // Calculate scale to fit preview
    const scaleX = previewWidth / gameWidth;
    const scaleY = previewHeight / gameHeight;
    const scale = Math.min(scaleX, scaleY);

    // Store original heights before applying layout
    const originalHeights = new Map(nodes.map(node => [node.id, node.height]));

    return nodes.map(node => {
      const normalizedX = (node.x - minX) / (gridWidth || 1);
      const normalizedY = (node.y - minY) / (gridHeight || 1);


      node.x = this.MARGIN + (normalizedX * (gameWidth - 2 * this.MARGIN));
      node.y = this.MARGIN + (normalizedY * (gameHeight - 2 * this.MARGIN));
      
      return node;
    });
  }
}