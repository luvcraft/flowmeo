import { useCallback } from 'react';
import { Handle, Position } from 'react-flow-renderer';

function MultiHandleNode({ data }) {
  const handlesPerSide = 8;
  const handleSpacing = 16;

  const handles = () => {
    var positions = [];

    for(var i=0;i<handlesPerSide;i++) {
      var x = (i+1) * handleSpacing;
      positions.push(x);
    }

    return positions.map((x,i) => {
      var style = {left: x};
      return (
        <div key={i}>
        <Handle type="target" position={Position.Top} id={'t'+i} style={style} />
        <Handle type="source" position={Position.Bottom} id={'s'+i} style={style} />
        </div>
      )
    });
  }

  return (
    <>
      {data.label}
      {handles()}
    </>
  );
}

export default MultiHandleNode;
