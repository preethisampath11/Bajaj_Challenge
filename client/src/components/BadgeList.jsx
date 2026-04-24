/**
 * BadgeList component for displaying a list of items as styled badges.
 * Supports error and warning variants with distinct visual styling.
 */
export default function BadgeList({ title, items, variant }) {
  // Variant-specific styles
  const variantStyles = {
    error: {
      background: '#2d0f0f',
      color: '#f85149',
      border: '1px solid #f85149'
    },
    warning: {
      background: '#2d1f00',
      color: '#d29922',
      border: '1px solid #d29922'
    }
  };

  const badgeStyle = variantStyles[variant] || variantStyles.error;

  const hasItems = items && Array.isArray(items) && items.length > 0;

  return (
    <div style={{ marginBottom: '1rem' }}>
      {/* Title */}
      <div
        style={{
          fontSize: '0.75rem',
          letterSpacing: '0.08em',
          color: '#8b949e',
          marginBottom: '0.5rem',
          fontFamily: "'JetBrains Mono', monospace",
          textTransform: 'uppercase'
        }}
      >
        {title}
      </div>

      {/* Items or Empty State */}
      {!hasItems ? (
        <span style={{ color: '#8b949e', fontStyle: 'italic' }}>None</span>
      ) : (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.25rem'
          }}
        >
          {items.map((item, idx) => (
            <span
              key={idx}
              style={{
                display: 'inline-block',
                padding: '2px 10px',
                borderRadius: '12px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.8rem',
                margin: '0.25rem',
                ...badgeStyle
              }}
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
