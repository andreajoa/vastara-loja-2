import React from 'react';
import SplineHero from '../components/SplineHero';

export default function SplineDemo() {
  return (
    <div style={{padding: '32px'}}>
      <h1>Spline Demo</h1>
      <p>Place your exported `scene.splinecode` in <code>/public/3d-models/</code> and it will load below.</p>
      <SplineHero />
    </div>
  );
}
