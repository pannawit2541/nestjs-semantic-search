import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

function App() {
  return (
    <main className="shell">
      <section className="panel">
        <p className="eyebrow">Semantic Search POC</p>
        <h1>Web app placeholder</h1>
        <p>
          This workspace is ready for a future search UI. The API foundation
          and pgvector database can be developed independently first.
        </p>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
