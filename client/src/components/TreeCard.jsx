import { useState } from 'react';

/**
 * TreeNode component for recursive tree node rendering.
 * Displays node with optional toggle for collapsible children.
 */
function TreeNode({ nodeLabel, childrenObj, depth }) {
  const [isOpen, setIsOpen] = useState(true);

  const hasKids = childrenObj && Object.keys(childrenObj).length > 0;

  return (
    <div style={{ paddingLeft: `${depth * 18}px` }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {hasKids && (
          <span
            onClick={() => setIsOpen(!isOpen)}
            style={{
              cursor: 'pointer',
              width: '1rem',
              display: 'inline-block',
              fontSize: '0.9rem',
              color: '#8b949e'
            }}
          >
            {isOpen ? '▼' : '▶'}
          </span>
        )}

        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: depth === 0 ? '#58a6ff' : '#e6edf3',
            fontSize: '0.9rem'
          }}
        >
          {nodeLabel}
        </span>
      </span>

      {isOpen &&
        hasKids &&
        Object.keys(childrenObj).map(childKey => (
          <TreeNode
            key={childKey}
            nodeLabel={childKey}
            childrenObj={childrenObj[childKey]}
            depth={depth + 1}
          />
        ))}
    </div>
  );
}

/**
 * TreeCard component for displaying a hierarchy structure.
 * Shows either a tree visualization or a cycle indicator.
 */
export default function TreeCard({ hierarchy }) {
  const { root, tree, depth, has_cycle } = hierarchy;

  return (
    <div
      style={{
        background: '#161b22',
        border: '1px solid #30363d',
        borderRadius: '8px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}
    >
      {/* Header Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <span style={{ fontSize: '0.9rem' }}>
          <span style={{ color: '#8b949e' }}>root: </span>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '1rem',
              color: '#e6edf3'
            }}
          >
            {root}
          </span>
        </span>

        {/* Badges */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {has_cycle && (
            <span
              style={{
                background: '#2d0f0f',
                border: '1px solid #f85149',
                color: '#f85149',
                borderRadius: '4px',
                padding: '2px 8px',
                fontSize: '0.75rem',
                fontFamily: "'JetBrains Mono', monospace"
              }}
            >
              CYCLE
            </span>
          )}

          {depth !== undefined && (
            <span
              style={{
                background: '#0d1f3c',
                border: '1px solid #58a6ff',
                color: '#58a6ff',
                borderRadius: '4px',
                padding: '2px 8px',
                fontSize: '0.75rem',
                fontFamily: "'JetBrains Mono', monospace"
              }}
            >
              depth {depth}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      {has_cycle ? (
        <div
          style={{
            color: '#8b949e',
            fontStyle: 'italic',
            fontSize: '0.9rem'
          }}
        >
          Circular dependency — no linear tree structure exists
        </div>
      ) : (
        <TreeNode nodeLabel={root} childrenObj={tree[root] || {}} depth={0} />
      )}
    </div>
  );
}
