import { Handle, Position } from 'reactflow';
import { memo } from 'react';
import { useGateStore } from '../../store/gateStore';
import { Trash2 } from 'lucide-react';

const InputNode = ({ id, data, selected }) => {
  const toggleInput = useGateStore(s => s.toggleInput);
  const val = useGateStore(s => s.inputStates[id] ?? 0);
  
  return (
    <div className={`
      relative min-w-[80px] bg-surface-800/90 backdrop-blur-md 
      border-2 rounded-xl p-2 shadow-panel transition-all flex items-center gap-3
      ${selected ? 'ring-2 ring-white/30 shadow-glow border-emerald-500' : 'border-emerald-600/50'}
    `}>
      {/* Delete Button */}
      <button 
        onClick={() => useGateStore.getState().deleteNode(id)}
        className="absolute -top-3 -right-3 w-5 h-5 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-rose-500 hover:text-white transition-all z-10"
      >
        <Trash2 size={10} />
      </button>

      <button 
        onClick={() => toggleInput(id)}
        className={`w-6 h-6 rounded-full font-mono font-bold text-xs flex items-center justify-center transition-colors
          ${val === 1 ? 'bg-emerald-500 text-surface-900 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-surface-700 text-surface-400'}`}
      >
        {val}
      </button>
      <span className="font-mono font-bold text-sm text-emerald-400 mr-2">{data.label}</span>
      
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        className="w-3 h-3 bg-surface-900 border-2 border-emerald-500"
      />
    </div>
  );
};

export default memo(InputNode);
