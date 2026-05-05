const fs = require('fs');
const data = JSON.parse(fs.readFileSync('motherboard_modern.gltf', 'utf8'));

console.log("Nodes with 'arrow' or 'target':");
if (data.nodes) {
    data.nodes.forEach(n => {
        if (n.name && (n.name.toLowerCase().includes('arrow') || n.name.toLowerCase().includes('target'))) {
            console.log(n.name, n.translation);
        }
    });
}

console.log("Materials with 'arrow' or 'target' or 'red':");
if (data.materials) {
    data.materials.forEach(m => {
        if (m.name && (m.name.toLowerCase().includes('arrow') || m.name.toLowerCase().includes('red'))) {
            console.log(m.name);
        }
    });
}

console.log("\nSome top level objects with large translations:");
if (data.nodes) {
    data.nodes.forEach(n => {
        if (n.translation) {
            console.log(n.name, n.translation.map(v => v.toFixed(3)).join(' '));
        }
    });
}
