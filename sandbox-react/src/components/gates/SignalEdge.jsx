import { BaseEdge, getBezierPath } from 'reactflow';
import { useGateStore } from '../../store/gateStore';
import { memo } from 'react';

const SignalEdge = ({
  id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, source,
}) => {
  const [edgePath] = getBezierPath({
    sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition,
  });
  
  // Try to find the signal value at the source of this edge
  const outputStates = useGateStore(s => s.outputStates);
  const inputStates = useGateStore(s => s.inputStates);
  
  // It could be an output from a gate, or an input from an InputNode
  const val = outputStates[source] ?? inputStates[source] ?? 0;
  
  const isHigh = val === 1;

  return (
    <>
      <BaseEdge
        path={edgePath}
        style={{
          strokeWidth: isHigh ? 4 : 3,
          stroke: isHigh ? '#10b981' : '#475569',
          filter: isHigh ? 'drop-shadow(0 0 4px rgba(16,185,129,0.5))' : 'none',
          transition: 'stroke 0.2s, stroke-width 0.2s',
        }}
      />
      {/* Invisible thicker path for easier selection/hover */}
      <BaseEdge
        path={edgePath}
        style={{ strokeWidth: 15, stroke: 'transparent', cursor: 'crosshair' }}
      />
    </>
  );
};

export default memo(SignalEdge);
