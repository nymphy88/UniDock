import React from 'react';
import { CanvasDemo } from './components/CanvasDemo';

export const App: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <CanvasDemo />
    </div>
  );
};

export default App;
