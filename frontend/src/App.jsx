// src/App.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [description, setDescription] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedApps, setSavedApps] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Use VITE_API_BASE in production, fallback to localhost in dev
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

  // Load saved apps on mount
  useEffect(() => {
    loadSavedApps();
  }, []);

  const loadSavedApps = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/load-apps`);
      setSavedApps(response.data);
    } catch (error) {
      console.error("Error loading saved apps:", error);
    }
  };

  const showTemporaryToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type });
    }, 3000);
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      showTemporaryToast("Please enter an app description.", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/api/parse-requirements`, {
        description,
      });
      setParsedData(response.data);

      // Save to MongoDB
      await axios.post(`${API_BASE}/api/save-app`, {
        ...response.data,
        description
      });

      showTemporaryToast("App design saved successfully!", "success");
      loadSavedApps();

    } catch (error) {
      console.error("Error:", error);
      showTemporaryToast("Failed to generate or save app design.", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadApp = (app) => {
    setParsedData({
      appName: app.appName,
      entities: app.entities,
      roles: app.roles,
      features: app.features
    });
    showTemporaryToast(`Loaded: ${app.appName}`, "info");
  };

  return (
    <div className="App" style={{
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto',
      backgroundColor: '#1a202c', // Dark background for readability
      minHeight: '100vh',
      color: '#e2e8f0' // Light text for contrast
    }}>
      {/* Toast Notification */}
      {toast.show && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '12px 24px',
          backgroundColor: toast.type === 'error' ? '#f8d7da' : toast.type === 'info' ? '#d1ecf1' : '#d4edda',
          color: toast.type === 'error' ? '#721c24' : toast.type === 'info' ? '#0c5460' : '#155724',
          border: toast.type === 'error' ? '1px solid #f5c6cb' : toast.type === 'info' ? '1px solid #bee5eb' : '1px solid #c3e6cb',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
        }}>
          {toast.message}
        </div>
      )}

      <h1 style={{
        color: '#e2e8f0',
        fontSize: '2.2rem',
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: '1.5rem'
      }}>
        Mini AI App Builder
      </h1>

      <div style={{
        background: '#2d3748', // Dark card background
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
        marginBottom: '2rem'
      }}>
        <h3 style={{ color: '#e2e8f0', marginBottom: '1rem' }}>Describe your app idea:</h3>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="5"
          placeholder="E.g., I want an app to manage student courses and grades..."
          style={{
            width: '100%',
            padding: '1rem',
            fontSize: '1rem',
            borderRadius: '8px',
            border: '1px solid #4a5568',
            fontFamily: 'inherit',
            resize: 'vertical',
            marginBottom: '1rem',
            backgroundColor: '#2d3748',
            color: '#e2e8f0'
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            padding: '0.75rem 2rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            backgroundColor: loading ? '#4a5568' : '#3182ce',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            transition: 'background-color 0.2s',
          }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '16px', height: '16px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
              Processing...
            </span>
          ) : 'Generate App UI'}
        </button>
      </div>

      {parsedData && (
        <div style={{
          background: '#2d3748',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            borderBottom: '2px solid #3182ce',
            paddingBottom: '0.5rem',
            color: '#e2e8f0',
            marginBottom: '1.5rem'
          }}>AI Extracted Requirements</h2>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            <div><strong>App Name:</strong> {parsedData.appName}</div>
            <div><strong>Entities:</strong> {parsedData.entities.join(', ')}</div>
            <div><strong>Roles:</strong> {parsedData.roles.join(', ')}</div>
            <div><strong>Features:</strong> {parsedData.features.join(', ')}</div>
          </div>

          <hr style={{ margin: '2rem 0', border: '0', borderTop: '1px solid #4a5568' }} />

          <h2 style={{
            borderBottom: '2px solid #38a169',
            paddingBottom: '0.5rem',
            color: '#e2e8f0',
            marginBottom: '1.5rem'
          }}>Generated Mock UI</h2>

          {/* Role Tabs */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#e2e8f0', marginBottom: '0.5rem' }}>Role Switcher</h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {parsedData.roles.map((role) => (
                <button
                  key={role}
                  style={{
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    backgroundColor: '#38a169',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    transition: 'background-color 0.2s'
                  }}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Entity Forms */}
          <div>
            <h3 style={{ color: '#e2e8f0', marginBottom: '1rem' }}>Entity Forms</h3>
            <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
              {parsedData.entities.map((entity) => (
                <div
                  key={entity}
                  style={{
                    border: '1px solid #4a5568',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    background: '#1a202c',
                  }}
                >
                  <h4 style={{ margin: '0 0 1rem 0', color: '#e2e8f0' }}>{entity} Form</h4>
                  {(() => {
                    const fieldMap = {
                      student: ['name', 'email', 'age'],
                      course: ['title', 'code', 'credits'],
                      grade: ['student', 'course', 'score'],
                      pet: ['name', 'species', 'breed'],
                      adopter: ['name', 'email', 'phone'],
                      application: ['pet', 'adopter', 'status'],
                      volunteer: ['name', 'email', 'skills'],
                      admin: ['name', 'email', 'role'],
                      teacher: ['name', 'subject', 'email'],
                      report: ['title', 'generatedBy', 'date']
                    };

                    const normalizedEntity = entity.toLowerCase();
                    let fields = ['name', 'description', 'createdAt'];

                    for (const [key, value] of Object.entries(fieldMap)) {
                      if (normalizedEntity.includes(key)) {
                        fields = value;
                        break;
                      }
                    }

                    return fields.map((field, idx) => (
                      <div key={idx} style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem', color: '#e2e8f0' }}>
                          {field.charAt(0).toUpperCase() + field.slice(1)}:
                        </label>
                        <input
                          type="text"
                          placeholder={`Enter ${field}`}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #4a5568',
                            borderRadius: '4px',
                            fontSize: '0.95rem',
                            backgroundColor: '#2d3748',
                            color: '#e2e8f0'
                          }}
                        />
                      </div>
                    ));
                  })()}
                  <button
                    type="button"
                    style={{
                      marginTop: '1rem',
                      padding: '0.5rem 1.5rem',
                      backgroundColor: '#3182ce',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                    }}
                  >
                    Save {entity}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Saved Apps */}
      {savedApps.length > 0 && (
        <div style={{
          background: '#2d3748',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
        }}>
          <h2 style={{
            color: '#e2e8f0',
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            Saved App Designs ({savedApps.length})
          </h2>
          <div style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))'
          }}>
            {savedApps.map((app) => (
              <div
                key={app._id}
                onClick={() => loadApp(app)}
                style={{
                  border: '1px solid #4a5568',
                  padding: '1.25rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: '#1a202c'
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.2)'}
              >
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#e2e8f0', fontSize: '1.1rem' }}>
                  {app.appName}
                </h4>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#a0aec0' }}>
                  <strong>Entities:</strong> {app.entities.join(', ')}
                </p>
                <p style={{ margin: '0', fontSize: '0.8rem', color: '#718096' }}>
                  {app.description.substring(0, 60)}...
                </p>
              </div>
            ))}
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