import React, {useEffect, useState, Suspense} from 'react';

// Client-only lazy loader for @splinetool/react-spline to avoid SSR errors
export default function SplineClient(props) {
  const [Spline, setSpline] = useState(null);

  useEffect(() => {
    let mounted = true;
    // Dynamically import only on client
    import('@splinetool/react-spline')
      .then((mod) => {
        if (mounted) setSpline(() => mod.default || mod);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Failed to load @splinetool/react-spline', err);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (typeof window === 'undefined') return null;
  if (!Spline) return null;

  return (
    // render the Spline component once loaded
    <Suspense fallback={null}>
      <Spline {...props} />
    </Suspense>
  );
}
