// src/App.jsx
import { useState } from 'react';
import axios from 'axios';

function App() {
  const [description, setDescription] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [chatInput, setChatInput] = useState('');

  // Dynamic UI style overrides
  const [uiStyle, setUiStyle] = useState({
    formBackground: '#2a2a2a',
    buttonColor: '#4ade80',
    fontSize: '1.1rem',
    borderRadius: '14px'
  });

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

  const showFeedback = (message, type = 'success') => {
    if (type === 'success') {
      setSuccess(message);
      setError(null);
    } else {
      setError(message);
      setSuccess(null);
    }
    setTimeout(() => {
      if (type === 'success') setSuccess(null);
      else setError(null);
    }, 3000);
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      showFeedback("Please describe your app idea.", "error");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post(`${API_BASE}/api/parse-requirements`, {
        description,
      });
      setParsedData(response.data);

      await axios.post(`${API_BASE}/api/save-app`, {
        ...response.data,
        description
      });

      showFeedback("✅ App design generated and saved!", "success");
    } catch (err) {
      console.error("Error:", err);
      showFeedback("❌ Failed to generate app. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || !parsedData) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/api/customize-ui`, {
        instruction: chatInput,
        currentUI: uiStyle
      });

      if (response.data?.styleOverrides) {
        setUiStyle(prev => ({ ...prev, ...response.data.styleOverrides }));
        showFeedback("🎨 UI updated!", "success");
      } else {
        throw new Error("Invalid response from AI");
      }
    } catch (err) {
      console.error("Chat error:", err);
      showFeedback("❌ Could not apply change. Try rephrasing.", "error");
    } finally {
      setLoading(false);
      setChatInput('');
    }
  };

  const handleReset = () => {
    setDescription('');
    setParsedData(null);
    setError(null);
    setSuccess(null);
    setChatInput('');
  };

  return (
    <div style={{
      padding: '3rem 2rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto',
      backgroundColor: '#121212',
      color: '#e0e0e0',
      minHeight: '100vh',
      width: '100%',
    }}>
      {/* Feedback Toast */}
      {(error || success) && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '1rem 2rem',
          backgroundColor: error ? '#f87171' : '#4ade80',
          color: '#121212',
          borderRadius: '12px',
          fontWeight: '600',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          {error ? '❌' : '✅'} {error || success}
        </div>
      )}

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{
          fontSize: '2.8rem',
          fontWeight: '800',
          color: '#ffffff',
          letterSpacing: '-0.02em',
          margin: '0 0 0.5rem 0',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          Mini AI App Builder
        </h1>
        <p style={{
          fontSize: '1.2rem',
          color: '#a0a0a0',
          fontWeight: '500'
        }}>
          Describe your app. We’ll generate a mock UI — then customize it with AI!
        </p>
      </div>

      {/* Input Section */}
      <div style={{
        background: '#1e1e1e',
        padding: '3rem',
        borderRadius: '20px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
        marginBottom: '3rem',
        border: '1px solid #2d2d2d'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <label style={{
            fontSize: '1.3rem',
            fontWeight: '700',
            color: '#ffffff',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            ✍️ Describe your app idea
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="6"
            placeholder="E.g., I want a coffee shop app. Baristas take orders, customers view menu, managers see sales reports."
            style={{
              width: '100%',
              maxWidth: '900px',
              padding: '1.25rem',
              fontSize: '1.1rem',
              borderRadius: '14px',
              border: '2px solid #2d2d2d',
              fontFamily: 'inherit',
              backgroundColor: '#2a2a2a',
              color: '#e0e0e0',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#4facfe';
              e.target.style.boxShadow = '0 0 0 3px rgba(79, 172, 254, 0.2)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#2d2d2d';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: '1rem 2.5rem',
              fontSize: '1.2rem',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              backgroundColor: loading ? '#2d2d2d' : '#4facfe',
              color: '#121212',
              border: 'none',
              borderRadius: '14px',
              transition: 'all 0.2s',
              boxShadow: '0 4px 15px rgba(79, 172, 254, 0.3)',
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ width: '18px', height: '18px', border: '3px solid #121212', borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
                Generating...
              </span>
            ) : '🚀 Generate App UI'}
          </button>

          {parsedData && (
            <button
              onClick={handleReset}
              style={{
                padding: '1rem 2.5rem',
                fontSize: '1.2rem',
                fontWeight: '700',
                cursor: 'pointer',
                backgroundColor: '#2a2a2a',
                color: '#e0e0e0',
                border: '2px solid #2d2d2d',
                borderRadius: '14px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#333333';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#2a2a2a';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              🔄 Start Over
            </button>
          )}
        </div>
      </div>

      {/* Generated UI Section */}
      {parsedData && (
        <div style={{
          background: '#1e1e1e',
          padding: '3rem',
          borderRadius: '20px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
          border: '1px solid #2d2d2d',
          marginBottom: '3rem'
        }}>
          {/* Requirements Summary */}
          <div style={{ marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: '2.2rem',
              fontWeight: '800',
              color: '#ffffff',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              ✅ AI Extracted Requirements
            </h2>
            <div style={{
              display: 'grid',
              gap: '2rem',
              gridTemplateColumns: 'repeat(2, 1fr)'
            }}>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#a0a0a0', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>App Name</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ffffff' }}>{parsedData.appName}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#a0a0a0', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Entities</div>
                <div style={{ fontSize: '1.25rem', color: '#e0e0e0' }}>{parsedData.entities.join(', ')}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#a0a0a0', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Roles</div>
                <div style={{ fontSize: '1.25rem', color: '#e0e0e0' }}>{parsedData.roles.join(', ')}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#a0a0a0', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Features</div>
                <div style={{ fontSize: '1.25rem', color: '#e0e0e0' }}>{parsedData.features.join(', ')}</div>
              </div>
            </div>
          </div>

          <hr style={{ margin: '3rem 0', border: '0', borderTop: '1px solid #2d2d2d' }} />

          {/* Mock UI */}
          <div>
            <h2 style={{
              fontSize: '2.2rem',
              fontWeight: '800',
              color: '#ffffff',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              🎨 Generated Mock UI
            </h2>

            {/* Role Tabs */}
            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>👤 Role Switcher</h3>
              <div style={{
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                {parsedData.roles.map((role) => (
                  <button
                    key={role}
                    style={{
                      padding: '0.875rem 2rem',
                      fontSize: uiStyle.fontSize,
                      fontWeight: '600',
                      cursor: 'pointer',
                      backgroundColor: '#2a2a2a',
                      color: '#00f2fe',
                      border: '2px solid #00f2fe',
                      borderRadius: uiStyle.borderRadius,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#00f2fe';
                      e.target.style.color = '#121212';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#2a2a2a';
                      e.target.style.color = '#00f2fe';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Entity Forms */}
            <div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>📋 Entity Forms</h3>
              <div style={{
                display: 'grid',
                gap: '3rem',
                gridTemplateColumns: 'repeat(2, 1fr)'
              }}>
                {parsedData.entities.map((entity) => (
                  <div
                    key={entity}
                    style={{
                      border: '2px solid #2d2d2d',
                      padding: '2.5rem',
                      borderRadius: uiStyle.borderRadius,
                      background: uiStyle.formBackground,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)'}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)'}
                  >
                    <h4 style={{
                      fontSize: uiStyle.fontSize,
                      fontWeight: '700',
                      color: '#ffffff',
                      margin: '0 0 2rem 0',
                      borderBottom: `3px solid ${uiStyle.buttonColor}`,
                      paddingBottom: '0.5rem',
                      display: 'inline-block'
                    }}>{entity} Form</h4>
                    {(() => {
                      const fieldMap = {
                        Student: ['Name', 'Email', 'Age'],
                        Course: ['Title', 'Code', 'Credits'],
                        Grade: ['Student', 'Course', 'Score'],
                        Teacher: ['Name', 'Subject', 'Email'],
                        Admin: ['Name', 'Role', 'Permissions']
                      };
                      const fields = fieldMap[entity] || ['Name', 'Email', 'Age'];
                      return fields.map((field, idx) => (
                        <div key={idx} style={{ marginBottom: '1.5rem' }}>
                          <label style={{
                            fontSize: uiStyle.fontSize,
                            fontWeight: '600',
                            color: '#e0e0e0',
                            marginBottom: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            📍 {field}
                          </label>
                          <input
                            type="text"
                            placeholder={`Enter ${field.toLowerCase()}`}
                            style={{
                              width: '100%',
                              maxWidth: '350px',
                              padding: '0.875rem',
                              fontSize: uiStyle.fontSize,
                              border: '2px solid #2d2d2d',
                              borderRadius: uiStyle.borderRadius,
                              backgroundColor: '#333333',
                              color: '#e0e0e0',
                            }}
                          />
                        </div>
                      ));
                    })()}
                    <button
                      type="button"
                      style={{
                        marginTop: '1.5rem',
                        padding: '0.875rem 2.5rem',
                        fontSize: uiStyle.fontSize,
                        fontWeight: '700',
                        backgroundColor: '#2a2a2a',
                        color: uiStyle.buttonColor,
                        border: `2px solid ${uiStyle.buttonColor}`,
                        borderRadius: uiStyle.borderRadius,
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = uiStyle.buttonColor;
                        e.target.style.color = '#121212';
                        e.target.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#2a2a2a';
                        e.target.style.color = uiStyle.buttonColor;
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      💾 Save {entity}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Chat Customizer */}
      {parsedData && (
        <div style={{
          background: '#1e1e1e',
          padding: '2rem',
          borderRadius: '16px',
          border: '1px solid #2d2d2d'
        }}>
          <h3 style={{ color: '#ffffff', marginBottom: '1rem', fontSize: '1.4rem' }}>🎨 Customize UI with AI</h3>
          <p style={{ color: '#a0a0a0', marginBottom: '1rem', fontSize: '0.95rem' }}>
            Try: <em>"Make forms darker"</em>, <em>"Green save buttons"</em>, <em>"Larger font"</em>
          </p>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="e.g., Make background black and buttons red..."
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '10px',
                border: '2px solid #2d2d2d',
                backgroundColor: '#2a2a2a',
                color: '#e0e0e0',
                fontSize: '1rem'
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()}
            />
            <button
              onClick={handleChatSubmit}
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#4facfe',
                color: '#121212',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Global Styles */}
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default App;