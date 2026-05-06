import { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
  Background, Controls, MiniMap,
  addEdge as rfAddEdge,
  applyNodeChanges, applyEdgeChanges,
  useReactFlow, ReactFlowProvider,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitFork, ChevronRight, LayoutGrid, Table,
  Cpu, Info, Share2, RotateCcw, Download,
} from 'lucide-react';

import { useGateStore } from './store/gateStore';
import { propagateSignals, generateTruthTable } from './utils/gateLogic';
import GateNode from './components/gates/GateNode';
import InputNode from './components/gates/InputNode';
import OutputNode from './components/gates/OutputNode';
import SignalEdge from './components/gates/SignalEdge';
import GatePalette from './components/gates/GatePalette';
import { PRESETS, PRESET_LIST } from './data/presets';

// ─── ReactFlow type registrations ─────────────────────────────────
const nodeTypes = { gateNode: GateNode, inputNode: InputNode, outputNode: OutputNode };
const edgeTypes = { signalEdge: SignalEdge };
const defaultEdgeOptions = { type: 'signalEdge', animated: false };

// ─── Helpers ──────────────────────────────────────────────────────
function exportCSV(rows) {
  if (!rows.length) return;
  const inKeys = Object.keys(rows[0].inputs);
  const outKeys = Object.keys(rows[0].outputs);
  const header = [...inKeys, ...outKeys].join(',');
  const body = rows.map((r) =>
    [...inKeys.map((k) => r.inputs[k]), ...outKeys.map((k) => r.outputs[k])].join(',')
  ).join('\n');
  const blob = new Blob([`${header}\n${body}`], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'truth-table.csv'; a.click();
  URL.revokeObjectURL(url);
}

// ─── Truth Table panel ────────────────────────────────────────────
function TruthTablePanel({ nodes, edges, inputStates }) {
  const rows = generateTruthTable(nodes, edges);

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-surface-500 text-xs font-mono gap-2 px-4">
        <Table size={20} />
        <p className="text-center">Add INPUT + OUTPUT nodes to generate truth table</p>
      </div>
    );
  }

  const inputLabels = Object.keys(rows[0].inputs);
  const outputLabels = Object.keys(rows[0].outputs);

  const inputNodes = nodes.filter((n) => n.type === 'inputNode');
  const activeRow = rows.findIndex((row) =>
    inputLabels.every((l) => {
      const node = inputNodes.find((n) => (n.data?.label || n.id) === l);
      return node && row.inputs[l] === (inputStates[node.id] ?? 0);
    })
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto custom-scroll">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-surface-700 sticky top-0 bg-surface-900">
              {inputLabels.map((l) => (
                <th key={l} className="px-3 py-2 text-primary-400 font-semibold text-left">{l}</th>
              ))}
              <th className="px-1 py-2 text-surface-700 text-center">│</th>
              {outputLabels.map((l) => (
                <th key={l} className="px-3 py-2 text-amber-400 font-semibold text-left">{l}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const isActive = i === activeRow;
              return (
                <tr
                  key={i}
                  className={`border-b border-surface-800/40 transition-colors ${
                    isActive ? 'bg-primary-600/20 border-primary-600/30' : 'hover:bg-surface-800/30'
                  }`}
                >
                  {inputLabels.map((l) => (
                    <td key={l} className={`px-3 py-1.5 ${row.inputs[l] === 1 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isActive && <span className="mr-1 text-primary-400">→</span>}
                      {row.inputs[l]}
                    </td>
                  ))}
                  <td className="px-1 text-surface-700 text-center">│</td>
                  {outputLabels.map((l) => (
                    <td key={l} className={`px-3 py-1.5 font-bold ${row.outputs[l] === 1 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {row.outputs[l]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t border-surface-700 p-2">
        <button
          onClick={() => exportCSV(rows)}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-surface-700 bg-surface-800 text-surface-400 hover:text-surface-200 hover:border-surface-600 text-xs font-mono transition-all"
        >
          <Download size={11} /> Export CSV
        </button>
      </div>
    </div>
  );
}

// ─── Preset picker ────────────────────────────────────────────────
function PresetPicker({ onSelect, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      className="absolute top-12 right-4 bg-surface-800 border border-surface-700 rounded-xl shadow-lg z-50 overflow-hidden w-64"
    >
      <div className="px-4 py-3 border-b border-surface-700">
        <p className="text-xs font-semibold text-surface-300">Load Demo Circuit</p>
      </div>
      {PRESET_LIST.map((p) => (
        <button
          key={p.id}
          onClick={() => { onSelect(p.id); onClose(); }}
          className="w-full text-left px-4 py-3 hover:bg-surface-700 transition-colors border-b border-surface-800 last:border-0"
        >
          <p className="text-sm font-semibold text-white">{p.name}</p>
          <p className="text-xs text-surface-400 mt-0.5">{p.description}</p>
        </button>
      ))}
    </motion.div>
  );
}

// ─── Inner canvas (needs ReactFlowProvider context) ───────────────
function SandboxCanvas() {
  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef(null);

  const {
    nodes, edges, inputStates, snapshots,
    setNodes, setEdges, setOutputStates, loadPreset, undo, pushSnapshot,
  } = useGateStore();

  const [showTruthTable, setShowTruthTable] = useState(true);
  const [showPresets, setShowPresets] = useState(false);
  const [showBridgeCTA, setShowBridgeCTA] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo]);

  useEffect(() => {
    if (nodes.length === 0) { setOutputStates({}); return; }
    const signals = propagateSignals(nodes, edges, inputStates);
    const enriched = { ...signals };
    nodes.forEach((n) => {
      if (n.type === 'outputNode') {
        const inEdge = edges.find((e) => e.target === n.id);
        if (inEdge) enriched[n.id] = signals[inEdge.source] ?? undefined;
      }
    });
    setOutputStates(enriched);

    const hasXOR = nodes.some((n) => n.data?.gateType === 'XOR');
    const hasAND = nodes.some((n) => n.data?.gateType === 'AND');
    const has2in = nodes.filter((n) => n.type === 'inputNode').length >= 2;
    setShowBridgeCTA(hasXOR && hasAND && has2in);
  }, [inputStates, edges, nodes, setOutputStates]);

  const onNodesChange = useCallback((changes) => {
    if (changes.some((c) => c.type === 'remove')) pushSnapshot();
    setNodes(applyNodeChanges(changes, nodes));
  }, [nodes, setNodes, pushSnapshot]);

  const onEdgesChange = useCallback((changes) => {
    if (changes.some((c) => c.type === 'remove')) pushSnapshot();
    setEdges(applyEdgeChanges(changes, edges));
  }, [edges, setEdges, pushSnapshot]);

  const onConnect = useCallback((params) => {
    pushSnapshot();
    setEdges(rfAddEdge({ ...params, type: 'signalEdge' }, edges));
  }, [edges, setEdges, pushSnapshot]);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const nodeType = event.dataTransfer.getData('application/reactflow/type');
    const gateType = event.dataTransfer.getData('application/reactflow/gateType');
    if (!nodeType) return;

    const bounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });
    const id = `${nodeType}-${Date.now()}`;
    const inputCount = nodes.filter((n) => n.type === 'inputNode').length;

    pushSnapshot();
    const newNode = {
      id, type: nodeType, position,
      data: nodeType === 'gateNode'
        ? { gateType }
        : { label: nodeType === 'inputNode' ? `IN${inputCount + 1}` : 'OUT' },
    };
    setNodes([...nodes, newNode]);

    if (nodeType === 'inputNode') {
      useGateStore.setState((s) => ({
        inputStates: { ...s.inputStates, [id]: 0 },
      }));
    }
  }, [nodes, reactFlowInstance, setNodes, pushSnapshot]);

  const onDragOver = useCallback((e) => {
    e.preventDefault(); e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleTidy = useCallback(() => {
    const ins = nodes.filter((n) => n.type === 'inputNode');
    const gates = nodes.filter((n) => n.type === 'gateNode');
    const outs = nodes.filter((n) => n.type === 'outputNode');
    setNodes([
      ...ins.map((n, i) => ({ ...n, position: { x: 80, y: 80 + i * 120 } })),
      ...gates.map((n, i) => ({ ...n, position: { x: 280, y: 80 + i * 120 } })),
      ...outs.map((n, i) => ({ ...n, position: { x: 480, y: 80 + i * 120 } })),
    ]);
    setTimeout(() => reactFlowInstance.fitView({ padding: 0.25 }), 50);
  }, [nodes, setNodes, reactFlowInstance]);

  const handleLoadPreset = useCallback((id) => {
    const preset = PRESETS[id];
    if (!preset) return;
    loadPreset(preset);
    setTimeout(() => reactFlowInstance.fitView({ padding: 0.25 }), 50);
  }, [loadPreset, reactFlowInstance]);

  const handleShare = useCallback(() => {
    try {
      const encoded = btoa(JSON.stringify({ nodes, edges, inputStates }));
      const url = `${window.location.origin}/sandbox?c=${encoded}`;
      navigator.clipboard.writeText(url);
    } catch {}
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2000);
  }, [nodes, edges, inputStates]);

  const canUndo = snapshots.length > 0;

  return (
    <div className="flex flex-col h-full relative">
      <div className="relative flex items-center justify-between gap-2 px-4 py-2 border-b border-surface-700/50 glass-panel flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
              canUndo ? 'border-surface-700 bg-surface-800 text-surface-300 hover:text-white hover:border-surface-600' : 'border-surface-800 bg-surface-900 text-surface-700 cursor-not-allowed'
            }`}
          >
            <RotateCcw size={12} />
            Undo
            {canUndo && <span className="text-surface-600">({snapshots.length})</span>}
          </button>

          <button
            onClick={() => setShowTruthTable((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
              showTruthTable ? 'bg-white/10 border-white/40 text-white' : 'bg-surface-800/40 border-surface-700/50 text-surface-400 hover:text-white'
            }`}
          >
            <Table size={12} /> Truth Table
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border border-surface-700 bg-surface-800 text-surface-400 hover:text-surface-200 transition-all"
          >
            <Share2 size={12} />
            {shareToast ? '✓ Copied!' : 'Share'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <AnimatePresence>
            {showBridgeCTA && (
              <motion.a
                href="../coa.html"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border border-amber-600/40 bg-amber-950/30 text-amber-300 hover:bg-amber-950/50 transition-all"
              >
                <Cpu size={12} /> See This in a CPU →
              </motion.a>
            )}
          </AnimatePresence>

          <button
            onClick={() => setShowPresets((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
              showPresets ? 'bg-surface-700 border-surface-600 text-surface-200' : 'border-surface-700 bg-surface-800 text-surface-400 hover:text-surface-200'
            }`}
          >
            <LayoutGrid size={12} /> Load Demo
          </button>
        </div>

        <AnimatePresence>
          {showPresets && (
            <PresetPicker onSelect={handleLoadPreset} onClose={() => setShowPresets(false)} />
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <GatePalette onTidy={handleTidy} />

        <div ref={reactFlowWrapper} className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            connectionRadius={30}
            snapToGrid snapGrid={[10, 10]}
            deleteKeyCode="Delete"
            minZoom={0.25} maxZoom={3}
            style={{ background: '#030305' }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#111827" />
            <Controls showInteractive={false} />
            <MiniMap
              style={{ background: '#0a0a0e', border: '1px solid #1e293b' }}
              nodeColor={(n) => n.type === 'inputNode' ? '#22C55E' : n.type === 'outputNode' ? '#F59E0B' : '#ffffff'}
              maskColor="rgba(0,0,0,0.8)"
            />
          </ReactFlow>

          {nodes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-3">
              <GitFork size={36} className="text-surface-700" />
              <p className="text-surface-600 text-sm font-mono">Drag gates from the left panel</p>
              <p className="text-surface-700 text-xs font-mono">or click <span className="text-surface-500">Load Demo</span> to start</p>
            </div>
          )}
        </div>

        <AnimatePresence>
          {showTruthTable && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 248, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-l border-surface-700/50 glass-panel flex-shrink-0 overflow-hidden"
            >
              <div className="w-[248px] h-full flex flex-col">
                <div className="px-4 py-2.5 border-b border-surface-700 flex items-center gap-2 flex-shrink-0">
                  <Table size={13} className="text-primary-400" />
                  <span className="text-xs font-semibold text-surface-300">Truth Table</span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <TruthTablePanel nodes={nodes} edges={edges} inputStates={inputStates} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="h-screen w-screen flex flex-col bg-[#030305] overflow-hidden text-surface-200 font-sans">
      <div className="px-6 py-3 border-b border-surface-700/50 flex items-center justify-between flex-shrink-0 z-10 glass-panel">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-surface-500">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] uppercase font-bold tracking-wider">Logic Design</span>
            <ChevronRight size={12} className="text-surface-700" />
            <span>Experiment 03</span>
          </div>
          <h1 className="font-display font-bold text-lg text-white tracking-wide">Logic Gate Sandbox</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-surface-500">
            <Info size={12} />
            <span>Drag gates • Wire handles • Click inputs • Del to remove</span>
          </div>
          <a href="../sandbox.html" className="ml-4 px-4 py-1.5 rounded-full border border-surface-700 text-xs font-mono font-bold text-surface-300 hover:text-white hover:bg-surface-800 transition-all">
            Exit Sandbox
          </a>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ReactFlowProvider>
          <SandboxCanvas />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
