import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminDashboard() {
  const [projects, setProjects] = useState([]);
  const [files, setFiles] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const goHome = () => {
    window.location.href = '/';
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    if (!(token && user?.role === 'admin')) {
      localStorage.clear();
      window.location.href = '/';
      return;
    }

    const fetchAll = async () => {
      try {
        const [projRes, fileRes, msgRes, notifRes] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/projects', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/admin/files', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/admin/messages', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/admin/notifications', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setProjects(projRes.data);
        setFiles(fileRes.data);
        setMessages(msgRes.data);
        setNotifications(notifRes.data);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.clear();
          window.location.href = '/';
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  return (
    <div style={styles.container}>
      <button onClick={goHome} style={styles.button}>Home</button>
      <h2 style={styles.title}>Admin Dashboard</h2>
      {loading ? (
        <p style={styles.subtitle}>Loading...</p>
      ) : (
        <>
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>Notifications</h3>
            <ul>
              {notifications.length === 0 ? (
                <li style={styles.subtitle}>No notifications.</li>
              ) : (
                notifications.map(n => (
                  <li key={n._id} style={{ color: n.read ? '#666' : '#007bff' }}>
                    {n.message} <span style={{ fontSize: '0.9em', color: '#aaa' }}>{new Date(n.createdAt).toLocaleString()}</span>
                  </li>
                ))
              )}
            </ul>
          </section>
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>Projects</h3>
            <ul>
              {projects.length === 0 ? (
                <li style={styles.subtitle}>No projects found.</li>
              ) : (
                projects.map(p => (
                  <li key={p._id}>
                    <strong>{p.name}</strong> — {p.status} <br />
                    <span style={{ fontSize: '0.95em', color: '#666' }}>{p.description}</span>
                  </li>
                ))
              )}
            </ul>
          </section>
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>Files Uploaded by Clients</h3>
            <ul>
              {files.length === 0 ? (
                <li style={styles.subtitle}>No files uploaded.</li>
              ) : (
                files.map(f => (
                  <li key={f._id}>
                    <a href={`http://localhost:5000${f.url}`} target="_blank" rel="noopener noreferrer">{f.name}</a>
                    {f.project && <span style={{ marginLeft: 8, color: '#888' }}>({f.project.name || f.project})</span>}
                  </li>
                ))
              )}
            </ul>
          </section>
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>Recent Messages</h3>
            <ul>
              {messages.length === 0 ? (
                <li style={styles.subtitle}>No messages.</li>
              ) : (
                messages.map(m => (
                  <li key={m._id}>
                    <strong>{m.sender?.name || 'Unknown'}:</strong> {m.content}
                    <span style={{ fontSize: '0.9em', color: '#aaa', marginLeft: 8 }}>{new Date(m.createdAt).toLocaleString()}</span>
                  </li>
                ))
              )}
            </ul>
          </section>
        </>
      )}
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
    fontSize: '2.5rem',
    marginBottom: '1rem',
    color: '#333'
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#666'
  },
  button: {
    display: 'inline-block',
    margin: '0 1rem 2rem 0',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#007bff',
    color: '#fff',
    textDecoration: 'none',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  section: {
    background: '#fff',
    borderRadius: '8px',
    margin: '2rem auto',
    padding: '1.5rem',
    maxWidth: '700px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    textAlign: 'left'
  },
  sectionTitle: {
    color: '#007bff',
    marginBottom: '1rem'
  },
  footer: {
    marginTop: '4rem',
    color: '#999',
    fontSize: '0.9rem'
  }
};

export default AdminDashboard;
