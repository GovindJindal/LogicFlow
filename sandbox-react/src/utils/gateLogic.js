// Logic gate boolean evaluation functions
export const evaluateGate = (type, inputs) => {
  const [a, b] = inputs;
  switch (type) {
    case 'AND': return (a === 1 && b === 1) ? 1 : 0;
    case 'OR': return (a === 1 || b === 1) ? 1 : 0;
    case 'NOT': return a === 1 ? 0 : 1;
    case 'NAND': return (a === 1 && b === 1) ? 0 : 1;
    case 'NOR': return (a === 1 || b === 1) ? 0 : 1;
    case 'XOR': return (a !== b) ? 1 : 0;
    case 'XNOR': return (a === b) ? 1 : 0;
    default: return 0;
  }
};

export const propagateSignals = (nodes, edges, initialInputs) => {
  const signalMap = { ...initialInputs };
  
  // Create an adjacency list of nodes based on edges
  // Also track incoming degree to do a topological sort
  const adj = {};
  const inDegree = {};
  
  nodes.forEach(n => {
    adj[n.id] = [];
    inDegree[n.id] = 0;
  });
  
  edges.forEach(e => {
    if (adj[e.source] && inDegree[e.target] !== undefined) {
      adj[e.source].push({ target: e.target, targetHandle: e.targetHandle });
      inDegree[e.target]++;
    }
  });
  
  // Initialize queue with nodes that have 0 incoming edges (Input nodes)
  const queue = nodes.filter(n => inDegree[n.id] === 0).map(n => n.id);
  
  // BFS topological sort evaluation
  while (queue.length > 0) {
    const currId = queue.shift();
    const currNode = nodes.find(n => n.id === currId);
    if (!currNode) continue;
    
    // Evaluate if it's a gate
    if (currNode.type === 'gateNode') {
      const type = currNode.data?.gateType;
      // Gather inputs
      const incomingEdges = edges.filter(e => e.target === currId);
      let a = 0, b = 0;
      incomingEdges.forEach(e => {
        const val = signalMap[e.source] ?? 0;
        if (e.targetHandle === 'a') a = val;
        else if (e.targetHandle === 'b') b = val;
        else if (incomingEdges.length === 1) a = val; // fallback for single inputs like NOT
      });
      
      signalMap[currId] = evaluateGate(type, [a, b]);
    } else if (currNode.type === 'inputNode') {
      // Signal already set from initialInputs
    } else if (currNode.type === 'outputNode') {
      // Handled later
    }
    
    // Reduce indegree of neighbors
    adj[currId].forEach(neighbor => {
      inDegree[neighbor.target]--;
      if (inDegree[neighbor.target] === 0) {
        queue.push(neighbor.target);
      }
    });
  }
  
  return signalMap;
};

// Generate binary permutations recursively
function getPermutations(n) {
  if (n <= 0) return [[]];
  const prev = getPermutations(n - 1);
  const next = [];
  prev.forEach(p => {
    next.push([...p, 0]);
    next.push([...p, 1]);
  });
  return next;
}

export const generateTruthTable = (nodes, edges) => {
  const inputs = nodes.filter(n => n.type === 'inputNode');
  const outputs = nodes.filter(n => n.type === 'outputNode');
  
  if (inputs.length === 0 || outputs.length === 0) return [];
  
  // Verify a complete path exists from any input to any output?
  // We can just simulate all permutations.
  
  const perms = getPermutations(inputs.length);
  const rows = [];
  
  perms.forEach(perm => {
    const testInputs = {};
    const inputObj = {};
    
    inputs.forEach((inp, idx) => {
      testInputs[inp.id] = perm[idx];
      const label = inp.data?.label || inp.id;
      inputObj[label] = perm[idx];
    });
    
    const signals = propagateSignals(nodes, edges, testInputs);
    const outputObj = {};
    
    outputs.forEach(out => {
      const inEdge = edges.find(e => e.target === out.id);
      const val = inEdge ? (signals[inEdge.source] ?? 0) : 0;
      const label = out.data?.label || out.id;
      outputObj[label] = val;
    });
    
    rows.push({
      inputs: inputObj,
      outputs: outputObj
    });
  });
  
  return rows;
};
