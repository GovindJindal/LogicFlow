import { create } from 'zustand';

export const useGateStore = create((set, get) => ({
  nodes: [],
  edges: [],
  inputStates: {}, // e.g. { 'inputNode-123': 1 }
  outputStates: {}, // e.g. { 'gateNode-456': 0 }
  snapshots: [],

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setInputStates: (inputStates) => set({ inputStates }),
  setOutputStates: (outputStates) => set({ outputStates }),

  toggleInput: (nodeId) => {
    set((state) => {
      const current = state.inputStates[nodeId] ?? 0;
      return {
        inputStates: { ...state.inputStates, [nodeId]: current === 1 ? 0 : 1 },
      };
    });
  },

  deleteNode: (nodeId) => {
    get().pushSnapshot();
    set((state) => ({
      nodes: state.nodes.filter(n => n.id !== nodeId),
      edges: state.edges.filter(e => e.source !== nodeId && e.target !== nodeId)
    }));
  },

  clearCanvas: () => {
    get().pushSnapshot();
    set({ nodes: [], edges: [], inputStates: {}, outputStates: {} });
  },

  loadPreset: (preset) => {
    get().pushSnapshot();
    set({
      nodes: preset.nodes || [],
      edges: preset.edges || [],
      inputStates: preset.inputStates || {},
      outputStates: {},
    });
  },

  pushSnapshot: () => {
    set((state) => {
      const snap = {
        nodes: state.nodes,
        edges: state.edges,
        inputStates: state.inputStates,
      };
      return { snapshots: [...state.snapshots, snap] };
    });
  },

  undo: () => {
    set((state) => {
      if (state.snapshots.length === 0) return state;
      const prev = state.snapshots[state.snapshots.length - 1];
      return {
        nodes: prev.nodes,
        edges: prev.edges,
        inputStates: prev.inputStates,
        snapshots: state.snapshots.slice(0, -1),
      };
    });
  },
}));
