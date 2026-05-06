import { Wand2, Trash2 } from 'lucide-react';
import { useGateStore } from '../../store/gateStore';

const GatePalette = ({ onTidy }) => {
  const onDragStart = (event, nodeType, gateType = null) => {
    event.dataTransfer.setData('application/reactflow/type', nodeType);
    if (gateType) {
      event.dataTransfer.setData('application/reactflow/gateType', gateType);
    }
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 border-r border-surface-700/50 glass-panel flex flex-col h-full flex-shrink-0 overflow-y-auto custom-scroll">
      <div className="p-4">
        
        <div className="mb-6">
          <h3 className="text-[10px] font-mono text-surface-500 font-bold tracking-widest mb-3">I/O NODES</h3>
          <div className="space-y-2">
            <div 
              className="px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm font-mono flex items-center gap-2 cursor-grab hover:bg-surface-700/50 hover:border-emerald-500/50 transition-all text-emerald-400"
              onDragStart={(e) => onDragStart(e, 'inputNode')} draggable
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div> INPUT
            </div>
            <div 
              className="px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm font-mono flex items-center gap-2 cursor-grab hover:bg-surface-700/50 hover:border-amber-500/50 transition-all text-amber-400"
              onDragStart={(e) => onDragStart(e, 'outputNode')} draggable
            >
              <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div> OUTPUT
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-[10px] font-mono text-surface-500 font-bold tracking-widest mb-3">LOGIC GATES</h3>
          <div className="space-y-2">
            {[
              { type: 'AND', color: 'text-blue-400', bg: 'bg-blue-500/20', abbr: 'AN' },
              { type: 'OR', color: 'text-emerald-400', bg: 'bg-emerald-500/20', abbr: 'OR' },
              { type: 'NOT', color: 'text-purple-400', bg: 'bg-purple-500/20', abbr: '¬' },
              { type: 'NAND', color: 'text-amber-400', bg: 'bg-amber-500/20', abbr: 'NA' },
              { type: 'NOR', color: 'text-rose-400', bg: 'bg-rose-500/20', abbr: 'NO' },
              { type: 'XOR', color: 'text-cyan-400', bg: 'bg-cyan-500/20', abbr: 'XO' },
              { type: 'XNOR', color: 'text-indigo-400', bg: 'bg-indigo-500/20', abbr: 'XN' },
            ].map(gate => (
              <div 
                key={gate.type}
                className="px-3 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm font-mono flex items-center gap-2 cursor-grab hover:bg-surface-700/50 hover:border-surface-500 transition-all text-surface-300"
                onDragStart={(e) => onDragStart(e, 'gateNode', gate.type)} draggable
              >
                <div className={`px-1.5 py-0.5 rounded ${gate.bg} ${gate.color} text-[10px] font-bold w-6 text-center`}>{gate.abbr}</div> {gate.type}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-surface-700 pt-6">
          <h3 className="text-[10px] font-mono text-surface-500 font-bold tracking-widest mb-3">CANVAS</h3>
          <div className="space-y-2 mb-6">
            <button 
              onClick={onTidy}
              className="w-full flex items-center gap-2 px-3 py-2 bg-surface-800 border border-surface-600 rounded-lg text-sm font-mono text-surface-300 hover:text-white hover:bg-surface-700 hover:border-surface-500 transition-all"
            >
              <Wand2 size={16} className="text-surface-400" /> Tidy Layout
            </button>
            
            <button 
              onClick={() => useGateStore.getState().clearCanvas()}
              className="w-full flex items-center gap-2 px-3 py-2 bg-rose-950/20 border border-rose-900/50 rounded-lg text-sm font-mono text-rose-400 hover:text-rose-300 hover:bg-rose-900/40 hover:border-rose-500/50 transition-all"
            >
              <Trash2 size={16} /> Clear Canvas
            </button>
          </div>

          <div className="text-xs font-mono text-surface-500 space-y-1.5 opacity-80">
            <div className="flex items-center gap-1.5 font-bold text-surface-400 mb-2">
              <span className="text-amber-400">💡</span> How to use:
            </div>
            <p>1. Drag gates onto canvas</p>
            <p>2. Connect handles to wire</p>
            <p>3. Click INPUT to toggle</p>
            <p>4. Watch signal propagate</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GatePalette;
