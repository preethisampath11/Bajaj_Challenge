import { useState } from 'react';
import { useApi } from './hooks/useApi';
import InputPanel from './components/InputPanel';
import TreeCard from './components/TreeCard';
import SummaryCard from './components/SummaryCard';
import BadgeList from './components/BadgeList';
import './index.css';

export default function App() {
  const { resultData, isFetching, fetchError, submitEdges } = useApi();
  const [animationKey, setAnimationKey] = useState(0);

  // Re-trigger animation when results change
  if (resultData) {
    if (animationKey === 0) {
      setAnimationKey(1);
    }
  }

  const sectionHeadingStyle = {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#8b949e',
    marginBottom: '1rem'
  };

  return (
    <>
      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div
        style={{
          minHeight: '100vh',
          background: '#0d0f14'
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            background: '#161b22',
            borderBottom: '1px solid #30363d',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          {/* Logo Square */}
          <div
            style={{
              width: '28px',
              height: '28px',
              background: '#39d353',
              borderRadius: '4px'
            }}
          />

          {/* Title */}
          <h1
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '1rem',
              color: '#e6edf3',
              margin: 0,
              fontWeight: 500
            }}
          >
            BFHL Tree Analyser
          </h1>

          {/* Endpoint Label */}
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.75rem',
              color: '#8b949e',
              background: '#0d0f14',
              border: '1px solid #30363d',
              padding: '2px 8px',
              borderRadius: '4px',
              marginLeft: 'auto'
            }}
          >
            POST /bfhl
          </span>
        </div>

        {/* Main Content */}
        <div
          style={{
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '2rem 1.5rem',
            color: '#e6edf3'
          }}
        >
          {/* Input Panel */}
          <InputPanel onSubmit={submitEdges} isFetching={isFetching} />

          {/* Loading State */}
          {isFetching && (
            <div
              style={{
                padding: '3rem',
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  border: '2px solid #30363d',
                  borderTopColor: '#39d353',
                  borderRadius: '50%',
                  margin: '0 auto',
                  animation: 'spin 0.8s linear infinite'
                }}
              />
              <p
                style={{
                  color: '#8b949e',
                  marginTop: '1rem',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.85rem'
                }}
              >
                Analysing graph...
              </p>
            </div>
          )}

          {/* Error State */}
          {fetchError && !isFetching && (
            <div
              style={{
                background: '#2d0f0f',
                border: '1px solid #f85149',
                borderRadius: '8px',
                padding: '1rem 1.25rem',
                color: '#f85149',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.875rem',
                marginTop: '1.5rem'
              }}
            >
              Error: {fetchError}
            </div>
          )}

          {/* Results State */}
          {resultData && !isFetching && (
            <div
              key={animationKey}
              style={{
                animation: 'slideUp 0.4s ease forwards',
                marginTop: '2rem'
              }}
            >
              {/* Summary */}
              <SummaryCard summary={resultData.summary} />

              {/* Hierarchies Section */}
              {resultData.hierarchies && resultData.hierarchies.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h2 style={sectionHeadingStyle}>Hierarchies</h2>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
                      gap: '1rem'
                    }}
                  >
                    {resultData.hierarchies.map((hierarchy, idx) => (
                      <TreeCard key={idx} hierarchy={hierarchy} />
                    ))}
                  </div>
                </div>
              )}

              {/* Flagged Entries Section */}
              <div>
                <h2 style={sectionHeadingStyle}>Flagged Entries</h2>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem'
                  }}
                >
                  <BadgeList
                    title="Invalid Entries"
                    items={resultData.invalid_entries}
                    variant="error"
                  />
                  <BadgeList
                    title="Duplicate Edges"
                    items={resultData.duplicate_edges}
                    variant="warning"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
