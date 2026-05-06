import { Handle, Position } from 'reactflow';
import { memo } from 'react';
import { useGateStore } from '../../store/gateStore';
import { Trash2 } from 'lucide-react';

const OutputNode = ({ id, data, selected }) => {
  const val = useGateStore(s => s.outputStates[id]);
  const active = val === 1;
  const error = val === undefined;
  
  return (
    <div className={`
      relative min-w-[80px] bg-surface-800/90 backdrop-blur-md 
      border-2 rounded-xl p-2 shadow-panel transition-all flex items-center gap-3
      ${selected ? 'ring-2 ring-white/30 shadow-glow border-amber-500' : 'border-amber-600/50'}
    `}>
      {/* Delete Button */}
      <button 
        onClick={() => useGateStore.getState().deleteNode(id)}
        className="absolute -top-3 -right-3 w-5 h-5 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-rose-500 hover:text-white transition-all z-10"
      >
        <Trash2 size={10} />
      </button>

      <Handle
        type="target"
        position={Position.Left}
        id="in"
        className="w-3 h-3 bg-surface-900 border-2 border-amber-500"
      />
      
      <span className="font-mono font-bold text-sm text-amber-400 ml-2">{data.label}</span>
      <div className={`
        w-6 h-6 rounded-full font-mono font-bold text-xs flex items-center justify-center transition-colors
        ${active ? 'bg-amber-500 text-surface-900 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 
          error ? 'bg-surface-700 text-surface-500 border border-dashed border-surface-500' : 'bg-surface-800 text-surface-500 border border-surface-600'}
      `}>
        {active ? '1' : error ? '?' : '0'}
      </div>
    </div>
  );
};

export default memo(OutputNode);
