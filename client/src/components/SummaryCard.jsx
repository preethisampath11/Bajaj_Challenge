/**
 * SummaryCard component for displaying hierarchy analysis summary statistics.
 * Shows counts of valid trees, cycles, and the deepest root node.
 */
export default function SummaryCard({ summary }) {
  if (!summary) {
    return null;
  }

  const { total_trees, total_cycles, largest_tree_root } = summary;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}
    >
      {/* Tile 1: Valid Trees */}
      <div
        style={{
          background: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '8px',
          padding: '1rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem'
        }}
      >
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '2rem',
            color: '#58a6ff',
            fontWeight: '500'
          }}
        >
          {total_trees}
        </div>
        <div
          style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#8b949e'
          }}
        >
          Valid Trees
        </div>
      </div>

      {/* Tile 2: Cycles Detected */}
      <div
        style={{
          background: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '8px',
          padding: '1rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem'
        }}
      >
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '2rem',
            color: '#58a6ff',
            fontWeight: '500'
          }}
        >
          {total_cycles}
        </div>
        <div
          style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#8b949e'
          }}
        >
          Cycles Detected
        </div>
      </div>

      {/* Tile 3: Deepest Root */}
      <div
        style={{
          background: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '8px',
          padding: '1rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem'
        }}
      >
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '2rem',
            color: '#58a6ff',
            fontWeight: '500'
          }}
        >
          {largest_tree_root || '—'}
        </div>
        <div
          style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#8b949e'
          }}
        >
          Deepest Root
        </div>
      </div>
    </div>
  );
}
