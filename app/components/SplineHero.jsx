import React, {useRef} from 'react';
import SplineClient from './SplineClient';

export default function SplineHero({scene = '/3d-models/scene.splinecode', className = '', style = {}}) {
  // Keep component safe for SSR by delegating to a client-only loader
  const containerRef = useRef(null);

  return (
    <div ref={containerRef} className={`spline-hero ${className}`} style={{width: '100%', height: '600px', ...style}}>
      <SplineClient scene={scene} />
    </div>
  );
}
