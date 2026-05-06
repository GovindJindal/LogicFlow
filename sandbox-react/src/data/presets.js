export const PRESETS = {
  halfAdder: {
    nodes: [
      { id: 'inA', type: 'inputNode', position: { x: 50, y: 50 }, data: { label: 'A' } },
      { id: 'inB', type: 'inputNode', position: { x: 50, y: 150 }, data: { label: 'B' } },
      { id: 'xor1', type: 'gateNode', position: { x: 250, y: 50 }, data: { gateType: 'XOR' } },
      { id: 'and1', type: 'gateNode', position: { x: 250, y: 200 }, data: { gateType: 'AND' } },
      { id: 'sum', type: 'outputNode', position: { x: 450, y: 50 }, data: { label: 'SUM' } },
      { id: 'carry', type: 'outputNode', position: { x: 450, y: 200 }, data: { label: 'CARRY' } },
    ],
    edges: [
      { id: 'e1', source: 'inA', sourceHandle: 'out', target: 'xor1', targetHandle: 'a', type: 'signalEdge' },
      { id: 'e2', source: 'inB', sourceHandle: 'out', target: 'xor1', targetHandle: 'b', type: 'signalEdge' },
      { id: 'e3', source: 'inA', sourceHandle: 'out', target: 'and1', targetHandle: 'a', type: 'signalEdge' },
      { id: 'e4', source: 'inB', sourceHandle: 'out', target: 'and1', targetHandle: 'b', type: 'signalEdge' },
      { id: 'e5', source: 'xor1', sourceHandle: 'out', target: 'sum', targetHandle: 'in', type: 'signalEdge' },
      { id: 'e6', source: 'and1', sourceHandle: 'out', target: 'carry', targetHandle: 'in', type: 'signalEdge' },
    ],
    inputStates: { 'inA': 0, 'inB': 0 }
  }
};

export const PRESET_LIST = [
  { id: 'halfAdder', name: 'Half Adder', description: 'Adds two single binary digits.' }
];
