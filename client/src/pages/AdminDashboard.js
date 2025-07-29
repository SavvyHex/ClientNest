import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editStates, setEditStates] = useState({});
  const [addUser, setAddUser] = useState({ name: '', email: '', password: '', role: 'client', plan: 'free' });
  const [deleteQueue, setDeleteQueue] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [addQueue, setAddQueue] = useState([]);

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

    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
        setLoading(false);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.clear();
          window.location.href = '/';
        }
      }
    };

    fetchUsers();
  }, []);

  const handleEditChange = (userId, field, value) => {
    setEditStates((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], [field]: value },
    }));
  };

  const handleAddUserChange = (field, value) => {
    setAddUser((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    setAddQueue((prev) => [...prev, { ...addUser }]);
    setAddUser({ name: '', email: '', password: '', role: 'client', plan: 'free' });
  };

  const handleDelete = (userId) => {
    setDeleteQueue((prev) => [...prev, userId]);
  };

  const handleConfirmChanges = async () => {
    const token = localStorage.getItem('token');
    // Apply edits
    for (const userId of Object.keys(editStates)) {
      const updates = editStates[userId];
      try {
        await axios.put(
          `http://localhost:5000/api/admin/users/${userId}`,
          updates,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        alert(`Failed to update user ${userId}`);
      }
    }
    // Apply additions
    for (const user of addQueue) {
      try {
        await axios.post(
          `http://localhost:5000/api/admin/users`,
          user,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        alert(`Failed to add user ${user.email}`);
      }
    }
    // Apply deletions
    for (const userId of deleteQueue) {
      try {
        await axios.delete(
          `http://localhost:5000/api/admin/users/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        alert(`Failed to delete user ${userId}`);
      }
    }
    // Refresh
    setEditStates({});
    setAddQueue([]);
    setDeleteQueue([]);
    setShowConfirm(false);
    setLoading(true);
    // Refetch users
    const res = await axios.get('http://localhost:5000/api/admin/users', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers(res.data);
    setLoading(false);
  };

  // Prepare confirmation data
  const pendingEdits = Object.entries(editStates).map(([id, changes]) => ({
    id,
    changes,
    email: users.find(u => u._id === id)?.email || id
  }));
  const pendingAdds = addQueue;
  const pendingDeletes = deleteQueue.map(id => users.find(u => u._id === id)?.email || id);

  return (
    <div style={styles.container}>
      <button onClick={goHome} style={styles.button}>Home</button>
      <h2 style={styles.title}>Admin Dashboard</h2>

      {/* Add User Form */}
      <form onSubmit={handleAddUser} style={styles.addForm}>
        <input
          style={styles.input}
          type="text"
          placeholder="Name"
          value={addUser.name}
          onChange={e => handleAddUserChange('name', e.target.value)}
          required
        />
        <input
          style={styles.input}
          type="email"
          placeholder="Email"
          value={addUser.email}
          onChange={e => handleAddUserChange('email', e.target.value)}
          required
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={addUser.password}
          onChange={e => handleAddUserChange('password', e.target.value)}
          required
        />
        <select
          style={styles.select}
          value={addUser.role}
          onChange={e => handleAddUserChange('role', e.target.value)}
        >
          <option value="client">Client</option>
          <option value="admin">Admin</option>
        </select>
        <select
          style={styles.select}
          value={addUser.plan}
          onChange={e => handleAddUserChange('plan', e.target.value)}
        >
          <option value="free">Free</option>
          <option value="premium">Premium</option>
        </select>
        <button type="submit" style={styles.saveButton}>Add User</button>
      </form>

      <button
        style={{ ...styles.saveButton, backgroundColor: '#ffc107', color: '#333', marginBottom: '1rem' }}
        onClick={() => setShowConfirm(true)}
        disabled={
          Object.keys(editStates).length === 0 &&
          addQueue.length === 0 &&
          deleteQueue.length === 0
        }
      >
        Review Changes
      </button>

      {loading ? (
        <p style={styles.subtitle}>Loading users...</p>
      ) : users.length === 0 ? (
        <p style={styles.subtitle}>No users found.</p>
      ) : (
        <div style={{ overflowX: 'auto', marginTop: '2rem' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Plan</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} style={deleteQueue.includes(u._id) ? { opacity: 0.5, textDecoration: 'line-through' } : {}}>
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}>
                    <select
                      style={styles.select}
                      value={
                        editStates[u._id]?.role !== undefined
                          ? editStates[u._id].role
                          : u.role
                      }
                      onChange={(e) =>
                        handleEditChange(u._id, 'role', e.target.value)
                      }
                      disabled={deleteQueue.includes(u._id)}
                    >
                      <option value="admin">Admin</option>
                      <option value="client">Client</option>
                    </select>
                  </td>
                  <td style={styles.td}>
                    <select
                      style={styles.select}
                      value={
                        editStates[u._id]?.plan !== undefined
                          ? editStates[u._id].plan
                          : u.plan
                      }
                      onChange={(e) =>
                        handleEditChange(u._id, 'plan', e.target.value)
                      }
                      disabled={deleteQueue.includes(u._id)}
                    >
                      <option value="free">Free</option>
                      <option value="premium">Premium</option>
                    </select>
                  </td>
                  <td style={styles.td}>
                    <button
                      style={{ ...styles.saveButton, backgroundColor: '#dc3545' }}
                      onClick={() => handleDelete(u._id)}
                      disabled={deleteQueue.includes(u._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Review Changes</h3>
            <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
              {pendingEdits.length > 0 && (
                <>
                  <strong>Edits:</strong>
                  <ul>
                    {pendingEdits.map(({ id, changes, email }) => (
                      <li key={id}>
                        {email}: {Object.entries(changes).map(([k, v]) => `${k} → ${v}`).join(', ')}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {pendingAdds.length > 0 && (
                <>
                  <strong>Additions:</strong>
                  <ul>
                    {pendingAdds.map((u, idx) => (
                      <li key={u.email + idx}>{u.email} ({u.role}, {u.plan})</li>
                    ))}
                  </ul>
                </>
              )}
              {pendingDeletes.length > 0 && (
                <>
                  <strong>Deletions:</strong>
                  <ul>
                    {pendingDeletes.map((email, idx) => (
                      <li key={email + idx}>{email}</li>
                    ))}
                  </ul>
                </>
              )}
              {(pendingEdits.length === 0 && pendingAdds.length === 0 && pendingDeletes.length === 0) && (
                <p>No changes to confirm.</p>
              )}
            </div>
            <button style={styles.saveButton} onClick={handleConfirmChanges}>Confirm</button>
            <button style={{ ...styles.saveButton, backgroundColor: '#6c757d', marginLeft: '1rem' }} onClick={() => setShowConfirm(false)}>Cancel</button>
          </div>
        </div>
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
  addForm: {
    margin: '2rem auto 1rem auto',
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  input: {
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ccc'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#fff',
    margin: '0 auto'
  },
  th: {
    backgroundColor: '#007bff',
    color: '#fff',
    padding: '0.75rem'
  },
  td: {
    padding: '0.75rem',
    borderBottom: '1px solid #eee'
  },
  select: {
    padding: '0.4rem',
    borderRadius: '4px',
    border: '1px solid #ccc'
  },
  saveButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  footer: {
    marginTop: '4rem',
    color: '#999',
    fontSize: '0.9rem'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    background: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    minWidth: '320px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.2)',
    textAlign: 'center'
  }
};

export default AdminDashboard;
