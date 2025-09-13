/*
postman alternative test. (not needed if postman is working)
*/

// test-request.mjs
import axios from 'axios';

const testBackend = async () => {
  try {
    console.log('Sending request to backend...');

    const response = await axios.post('http://localhost:5000/api/parse-requirements', {
      description: "I want an app to manage student courses and grades."
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Success!');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Full Error Object:', error); // ← Log FULL error

    if (error.response) {
      // Server responded with a status code outside 2xx
      console.error('Server responded with status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received. Is backend running?');
      console.error('Request:', error.request);
    } else {
      // Something else happened
      console.error('Error setting up request:', error.message);
    }
  }
};

testBackend();