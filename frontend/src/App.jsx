// src/App.jsx
import { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [description, setDescription] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/parse-requirements', {
        description,
      });
      setParsedData(response.data);
    } catch (error) {
      console.error("Error parsing requirements:", error);
      alert("Failed to parse requirements. Check backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App" style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#333' }}>Mini AI App Builder</h1>

      <div style={{ marginBottom: '2rem' }}>
        <h3>Describe your app idea:</h3>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="5"
          cols="80"
          placeholder="E.g., I want an app to manage student courses and grades. Teachers add courses, students enrol, and admins manage reports."
          style={{
            padding: '0.75rem',
            fontSize: '1rem',
            borderRadius: '6px',
            border: '1px solid #ccc',
            width: '100%',
            maxWidth: '800px',
            fontFamily: 'inherit',
          }}
        />
        <br />
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            transition: 'background-color 0.2s',
          }}
        >
          {loading ? 'Processing...' : 'Generate App UI'}
        </button>
      </div>

      {parsedData && (
        <div style={{ marginTop: '2rem', textAlign: 'left', backgroundColor: '#f8f9fa', padding: '2rem', borderRadius: '8px', border: '1px solid #e9ecef' }}>
          <h2 style={{ borderBottom: '2px solid #007bff', paddingBottom: '0.5rem' }}>AI Extracted Requirements</h2>
          <p><strong>App Name:</strong> <span style={{ fontWeight: 'bold', color: '#007bff' }}>{parsedData.appName}</span></p>
          <p><strong>Entities:</strong> <span style={{ fontWeight: '500' }}>{parsedData.entities.join(', ')}</span></p>
          <p><strong>Roles:</strong> <span style={{ fontWeight: '500' }}>{parsedData.roles.join(', ')}</span></p>
          <p><strong>Features:</strong> <span style={{ fontWeight: '500' }}>{parsedData.features.join(', ')}</span></p>

          <hr style={{ margin: '2rem 0', border: '0', borderTop: '1px solid #ddd' }} />

          <h2 style={{ borderBottom: '2px solid #28a745', paddingBottom: '0.5rem' }}>Generated Mock UI</h2>

          {/* Tabs for Roles */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3>Role Switcher</h3>
            <div>
              {parsedData.roles.map((role) => (
                <button
                  key={role}
                  style={{
                    padding: '0.5rem 1rem',
                    margin: '0 0.25rem 0.5rem 0',
                    cursor: 'pointer',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.95rem',
                  }}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Forms for Entities */}
          <div>
            <h3>Entity Forms</h3>
            {parsedData.entities.map((entity) => (
              <div
                key={entity}
                style={{
                  border: '1px solid #ced4da',
                  padding: '1.5rem',
                  margin: '1.5rem 0',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                }}
              >
                <h4 style={{ margin: '0 0 1rem 0', color: '#495057' }}>{entity} Form</h4>
                <form>
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
                      <div key={idx} style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>
                          {field}:
                        </label>
                        <input
                          type="text"
                          placeholder={`Enter ${field.toLowerCase()}`}
                          style={{
                            width: '100%',
                            maxWidth: '300px',
                            padding: '0.5rem',
                            border: '1px solid #ced4da',
                            borderRadius: '4px',
                            fontSize: '0.95rem',
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
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                    }}
                  >
                    Save {entity}
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;