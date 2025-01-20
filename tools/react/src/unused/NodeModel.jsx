export class NodeModel {
    constructor(id = null, label = "New Node", type = 'Normal', x = 400, y = 200) {
        this.id = id == null ? `node_${Date.now()}` : id;
        this.label = label;
        this.type = type;
        this.x = x;
        this.y = y;
        this.connections = [];
        this.path = '';
        this.upgrades = [];
        this.branchPaths = [];
    }


    static NewId = ( ) =>
    {
        return `node_${Date.now()}`
    };
}