# Using Spline in Vastara Loja 2

This document explains how to integrate Spline scenes into the Hydrogen-powered Vastara Loja 2 storefront.

Overview
- Spline is a web-based 3D design tool. The editor is hosted at `https://app.spline.design` and is not a full local editor.
- You can export scenes from the Spline editor as a `.splinecode` file and self-host them inside your project.

Two main options to embed Spline in React/Hydrogen:

1) React integration (easiest)
- Library: `@splinetool/react-spline`
- Usage:

```jsx
import Spline from '@splinetool/react-spline';

export default function Hero() {
  return <Spline scene="/3d-models/scene.splinecode" />;
}
```

2) Runtime (self-hosted, more control)
- Library: `@splinetool/runtime`
- Usage (vanilla JS):

```js
import { Application } from '@splinetool/runtime';

const canvas = document.getElementById('canvas3d');
const app = new Application(canvas);
app.load('/3d-models/scene.splinecode');
```

Self-hosting workflow
1. Design your scene at `app.spline.design`.
2. Export → "Download bundle" and extract the zip.
3. Copy the `scene.splinecode` (and any assets) into `public/3d-models/`.
4. Use the `@splinetool/react-spline` component, or `@splinetool/runtime` to load locally.

Notes for Hydrogen (SSR)
- `@splinetool/react-spline` expects a browser environment. Wrap it so it doesn't render during SSR:

```jsx
if (typeof window === 'undefined') return null;
```

- Alternatively, dynamically import the component on the client.

Performance tips
- Keep scene polygon counts low for hero/landing experiences.
- Use compressed textures when possible.
- Lazy-load the Spline scene after the hero content is visible.

Examples
- `app/components/SplineHero.jsx` is provided as a minimal example component.

Security & Licensing
- Spline editor is not fully open-source. The runtime + react integration packages are available on GitHub under their respective repos.

