import { Handle, Position } from 'reactflow';
import { memo } from 'react';
import { useGateStore } from '../../store/gateStore';
import { Trash2 } from 'lucide-react';

const GateNode = ({ id, data, selected }) => {
  const { gateType } = data;
  const deleteNode = useGateStore(s => s.deleteNode);
  
  const getGateColor = () => {
    switch (gateType) {
      case 'AND': return { stroke: '#3b82f6', fill: 'rgba(59, 130, 246, 0.1)', shadow: 'rgba(59, 130, 246, 0.5)', text: 'text-blue-500' };
      case 'OR': return { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.1)', shadow: 'rgba(16, 185, 129, 0.5)', text: 'text-emerald-500' };
      case 'NOT': return { stroke: '#a855f7', fill: 'rgba(168, 85, 247, 0.1)', shadow: 'rgba(168, 85, 247, 0.5)', text: 'text-purple-500' };
      case 'NAND': return { stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.1)', shadow: 'rgba(245, 158, 11, 0.5)', text: 'text-amber-500' };
      case 'NOR': return { stroke: '#f43f5e', fill: 'rgba(244, 63, 94, 0.1)', shadow: 'rgba(244, 63, 94, 0.5)', text: 'text-rose-500' };
      case 'XOR': return { stroke: '#06b6d4', fill: 'rgba(6, 182, 212, 0.1)', shadow: 'rgba(6, 182, 212, 0.5)', text: 'text-cyan-500' };
      case 'XNOR': return { stroke: '#6366f1', fill: 'rgba(99, 102, 241, 0.1)', shadow: 'rgba(99, 102, 241, 0.5)', text: 'text-indigo-500' };
      default: return { stroke: '#475569', fill: 'transparent', shadow: 'transparent', text: 'text-surface-500' };
    }
  };

  const colors = getGateColor();
  const isNot = gateType === 'NOT';

  // Render specific SVG paths based on gate type
  const renderShape = () => {
    const strokeProps = {
      stroke: colors.stroke,
      strokeWidth: "3",
      fill: colors.fill,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      style: { filter: `drop-shadow(0 0 6px ${colors.shadow})` }
    };

    switch (gateType) {
      case 'AND':
        return <path d="M 10 10 L 40 10 A 25 25 0 0 1 40 60 L 10 60 Z" {...strokeProps} />;
      case 'OR':
        return <path d="M 10 10 Q 50 10 65 35 Q 50 60 10 60 Q 25 35 10 10 Z" {...strokeProps} />;
      case 'NOT':
        return (
          <g>
            <path d="M 15 15 L 55 35 L 15 55 Z" {...strokeProps} />
            <circle cx="61" cy="35" r="4" {...strokeProps} />
          </g>
        );
      case 'NAND':
        return (
          <g>
            <path d="M 10 10 L 35 10 A 25 25 0 0 1 35 60 L 10 60 Z" {...strokeProps} />
            <circle cx="66" cy="35" r="4" {...strokeProps} />
          </g>
        );
      case 'NOR':
        return (
          <g>
            <path d="M 10 10 Q 50 10 60 35 Q 50 60 10 60 Q 25 35 10 10 Z" {...strokeProps} />
            <circle cx="66" cy="35" r="4" {...strokeProps} />
          </g>
        );
      case 'XOR':
        return (
          <g>
            <path d="M 5 10 Q 20 35 5 60" stroke={colors.stroke} strokeWidth="3" fill="none" style={strokeProps.style} />
            <path d="M 15 10 Q 55 10 70 35 Q 55 60 15 60 Q 30 35 15 10 Z" {...strokeProps} />
          </g>
        );
      case 'XNOR':
        return (
          <g>
            <path d="M 5 10 Q 20 35 5 60" stroke={colors.stroke} strokeWidth="3" fill="none" style={strokeProps.style} />
            <path d="M 15 10 Q 50 10 65 35 Q 50 60 15 60 Q 30 35 15 10 Z" {...strokeProps} />
            <circle cx="71" cy="35" r="4" {...strokeProps} />
          </g>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`relative group w-[100px] h-[80px] flex items-center justify-center ${selected ? 'ring-2 ring-white/50 rounded-lg' : ''}`}>
      
      {/* Label */}
      <div className={`absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold tracking-widest ${colors.text} opacity-80`}>
        {gateType}
      </div>

      {/* Delete Button */}
      <button 
        onClick={() => deleteNode(id)}
        className="absolute -top-3 -right-3 w-5 h-5 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-rose-500 hover:text-white transition-all z-10"
      >
        <Trash2 size={10} />
      </button>

      {/* SVG Canvas */}
      <svg width="80" height="70" viewBox="0 0 80 70" className="drop-shadow-lg">
        {renderShape()}
      </svg>

      {/* ReactFlow Handles */}
      {!isNot && (
        <>
          <Handle
            type="target"
            position={Position.Left}
            id="a"
            className="w-2.5 h-2.5 bg-surface-900 border-2"
            style={{ top: '28%', left: '8px', borderColor: colors.stroke }}
          />
          <Handle
            type="target"
            position={Position.Left}
            id="b"
            className="w-2.5 h-2.5 bg-surface-900 border-2"
            style={{ top: '72%', left: '8px', borderColor: colors.stroke }}
          />
        </>
      )}

      {isNot && (
        <Handle
          type="target"
          position={Position.Left}
          id="a"
          className="w-2.5 h-2.5 bg-surface-900 border-2"
          style={{ top: '50%', left: '12px', borderColor: colors.stroke }}
        />
      )}

      <Handle
        type="source"
        position={Position.Right}
        id="out"
        className="w-2.5 h-2.5 bg-surface-900 border-2"
        style={{ top: '50%', right: ['NAND', 'NOR', 'XNOR'].includes(gateType) ? '1px' : '6px', borderColor: colors.stroke }}
      />
    </div>
  );
};

export default memo(GateNode);
