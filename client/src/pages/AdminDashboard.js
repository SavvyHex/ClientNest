import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminDashboard() {
  const [projects, setProjects] = useState([]);
  const [files, setFiles] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedReceiverId, setSelectedReceiverId] = useState('');

  const goHome = () => {
    window.location.href = '/';
  };

  const fetchAll = async () => {
    const token = localStorage.getItem('token');
    try {
      const [projRes, fileRes, msgRes, notifRes, userRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/projects', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/admin/files', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/admin/messages', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/admin/notifications', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/admin/users', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setProjects(projRes.data);
      setFiles(fileRes.data);
      setMessages(msgRes.data);
      setNotifications(notifRes.data);
      setUsers(userRes.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.clear();
        window.location.href = '/';
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSendMessage = async () => {
    const token = localStorage.getItem('token');
    if (!newMessage || !selectedProjectId || !selectedReceiverId) return;

    try {
      await axios.post('http://localhost:5000/api/admin/messages', {
        content: newMessage,
        projectId: selectedProjectId,
        receiverId: selectedReceiverId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNewMessage('');
      fetchAll();
    } catch (err) {
      alert("❌ Failed to send message");
      console.error(err);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', selectedFile);

    await axios.post('http://localhost:5000/api/admin/files', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    setSelectedFile(null);
    fetchAll();
  };

  return (
    <div style={styles.container}>
      <button onClick={goHome} style={styles.button}>Home</button>
      <h2 style={styles.title}>Admin Dashboard</h2>

      {loading ? (
        <p style={styles.subtitle}>Loading...</p>
      ) : (
        <>
          {/* Notifications */}
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>Notifications</h3>
            {notifications.length === 0 ? (
              <div style={styles.subtitle}>No notifications.</div>
            ) : (
              <div style={styles.notificationGrid}>
                {notifications.map(n => (
                  <div key={n._id} style={{
                    ...styles.notificationCard,
                    background: n.type === 'admin-request' ? '#fffbe6' : '#f5f5f5',
                    borderLeft: n.type === 'admin-request' ? '4px solid #ffc107' : '4px solid #007bff'
                  }}>
                    <div><strong>{n.type === 'admin-request' ? 'Client Request' : 'Notification'}</strong></div>
                    <div>{n.message}</div>
                    <div style={{ fontSize: '0.9em', color: '#aaa' }}>{new Date(n.createdAt).toLocaleString()}</div>
                    {n.type === 'admin-request' && !n.read && (
                      <button
                        style={styles.acceptButton}
                        onClick={async () => {
                          const token = localStorage.getItem('token');
                          await axios.post(
                            `http://localhost:5000/api/admin/accept-request/${n._id}`,
                            {},
                            { headers: { Authorization: `Bearer ${token}` } }
                          );
                          setLoading(true);
                          await fetchAll();
                          setLoading(false);
                        }}
                      >
                        Accept
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Projects */}
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>Projects</h3>
            <ul>
              {projects.length === 0 ? (
                <li style={styles.subtitle}>No projects found.</li>
              ) : (
                projects.map(p => (
                  <li key={p._id}>
                    <strong>{p.name}</strong> — {p.status}
                    <br />
                    <span style={{ fontSize: '0.95em', color: '#666' }}>{p.description}</span>
                  </li>
                ))
              )}
            </ul>
          </section>

          {/* File Upload */}
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>Files</h3>
            <input type="file" onChange={e => setSelectedFile(e.target.files[0])} />
            <button onClick={handleFileUpload} style={styles.button}>Upload File</button>
            <ul>
              {files.length === 0 ? (
                <li style={styles.subtitle}>No files uploaded.</li>
              ) : (
                files.map(f => (
                  <li key={f._id}>
                    <a href={`http://localhost:5000${f.url}`} target="_blank" rel="noopener noreferrer">{f.name}</a>
                  </li>
                ))
              )}
            </ul>
          </section>

          {/* Messages */}
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>Messages</h3>
            <label>Select Project:</label>
            <select
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
              style={{ display: 'block', padding: '0.5rem', marginBottom: 8 }}
            >
              <option value="">-- Select a Project --</option>
              {projects.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>

            <label>Select Receiver:</label>
            <select
              value={selectedReceiverId}
              onChange={e => setSelectedReceiverId(e.target.value)}
              style={{ display: 'block', padding: '0.5rem', marginBottom: 8 }}
            >
              <option value="">-- Select a User --</option>
              {users.map(u => (
                <option key={u._id} value={u._id}>{u.name || u.email}</option>
              ))}
            </select>

            <textarea
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type your message here"
              style={{ width: '100%', height: 80, marginBottom: 10 }}
            />
            <button
              onClick={handleSendMessage}
              style={styles.button}
              disabled={!newMessage || !selectedProjectId || !selectedReceiverId}
            >
              Send Message
            </button>
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
    margin: '0.5rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#007bff',
    color: '#fff',
    textDecoration: 'none',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  acceptButton: {
    marginTop: '0.5rem',
    background: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '0.5rem 1rem',
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
  },
  notificationGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  notificationCard: {
    flex: '1 1 250px',
    minWidth: 220,
    background: '#f5f5f5',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    borderLeft: '4px solid #007bff',
  },
};

export default AdminDashboard;