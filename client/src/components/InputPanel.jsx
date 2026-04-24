import { useState } from 'react';

/**
 * InputPanel component for entering and parsing edge strings.
 * Allows users to input edges via textarea and submit for analysis.
 */
export default function InputPanel({ onSubmit, isFetching }) {
  const [edgeInput, setEdgeInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Parse input into edge entries
  const parsedEntries = edgeInput
    .split(/[\n,]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const entryCount = parsedEntries.length;

  function handleSubmit() {
    if (entryCount === 0 || isFetching) return;
    onSubmit(parsedEntries);
  }

  const isDisabled = entryCount === 0 || isFetching;

  return (
    <div style={{ padding: '1.5rem', maxWidth: '860px', margin: '0 auto' }}>
      <h2
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.85rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--muted)',
          marginBottom: '0.75rem'
        }}
      >
        Node Input
      </h2>

      <textarea
        value={edgeInput}
        onChange={(e) => setEdgeInput(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={`Paste edges here — one per line or comma-separated
Example: A->B, A->C, B->D`}
        style={{
          width: '100%',
          minHeight: '160px',
          padding: '1rem',
          background: '#161b22',
          border: `1px solid ${isFocused ? '#58a6ff' : '#30363d'}`,
          borderRadius: '8px',
          color: '#e6edf3',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.9rem',
          resize: 'vertical',
          outline: 'none',
          transition: 'border-color 0.2s ease'
        }}
      />

      <div
        style={{
          color: '#8b949e',
          fontSize: '0.8rem',
          marginTop: '0.5rem'
        }}
      >
        {entryCount} {entryCount === 1 ? 'entry' : 'entries'} detected
      </div>

      <button
        onClick={handleSubmit}
        disabled={isDisabled}
        style={{
          marginTop: '1rem',
          padding: '0.6rem 1.5rem',
          background: '#39d353',
          color: '#0d0f14',
          border: 'none',
          borderRadius: '6px',
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: '500',
          fontSize: '0.9rem',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          opacity: isDisabled ? 0.45 : 1,
          transition: 'opacity 0.2s ease'
        }}
      >
        {isFetching ? 'Analysing...' : 'Run Analysis'}
      </button>
    </div>
  );
}
