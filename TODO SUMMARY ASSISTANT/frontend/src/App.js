import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL;

function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState(null);

  const fetchTodos = async () => {
    const res = await axios.get(`${API}/todo`);
    setTodos(res.data);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async () => {
    if (!title) return;
    await axios.post(`${API}/todos`, { title });
    setTitle('');
    fetchTodos();
  };

  const deleteTodo = async (id) => {
    await axios.delete(`${API}/todos/${id}`);
    fetchTodos();
  };

  const summarize = async () => {
    try {
      await axios.post(`${API}/summarize`);
      setMessage('Summary sent to Slack!');
    } catch {
      setMessage('Failed to send summary.');
    }
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div style={ styles.container }>
      <h1 style={styles.heading}>Todo Summary Assistant</h1>
      <div style={styles.inputContainer}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter todo"
      />
      <button style={styles.button} onClick={addTodo}>Add</button>
    </div>
      <ul style={styles.list}>
        {todos.map(todo => (
          <li key={todo.id} style={styles.listItem}>
            {todo.title} <button style={styles.deleteButton} onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <button style={styles.summaryButton} onClick={summarize}>Summarize and Send to Slack</button>
      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 600,
    margin: '40px auto',
    padding: 20,
    border: '1px solid #ccc',
    borderRadius: 10,
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9f9f9',
  },
  heading: {
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    display: 'flex',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    border: '1px solid #ccc',
    marginRight: 10,
  },
  button: {
    padding: '10px 15px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: 5,
    cursor: 'pointer',
  },
  list: {
    listStyle: 'none',
    padding: 0,
  },
  listItem: {
    padding: '10px 0',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteButton: {
    padding: '5px 10px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: 5,
    cursor: 'pointer',
  },
  summaryButton: {
    marginTop: 20,
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: 5,
    cursor: 'pointer',
    width: '100%',
  },
  message: {
    marginTop: 15,
    textAlign: 'center',
    color: '#333',
    fontWeight: 'bold',
  },
};

export default App;
