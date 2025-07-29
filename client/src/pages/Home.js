import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Welcome to ClientNest</h1>
      <p style={styles.subtitle}>Your lightweight client portal</p>

      <div style={styles.buttons}>
      <Link to="/login-client" style={styles.button}>Client Login</Link>
      <Link to="/login-admin" style={styles.button}>Admin Login</Link>
        <Link to="/register" style={styles.button}>Register</Link>
      </div>

      <footer style={styles.footer}>
        <p>&copy; {new Date().getFullYear()} ClientNest</p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    textAlign: 'center',
    padding: '3rem',
    fontFamily: 'sans-serif',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh'
  },
  title: {
    fontSize: '3rem',
    marginBottom: '1rem',
    color: '#333'
  },
  subtitle: {
    fontSize: '1.25rem',
    color: '#666'
  },
  buttons: {
    marginTop: '2rem'
  },
  button: {
    display: 'inline-block',
    margin: '0 1rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#007bff',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '5px'
  },
  footer: {
    marginTop: '4rem',
    color: '#999',
    fontSize: '0.9rem'
  }
};

export default Home;