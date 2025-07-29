import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editStates, setEditStates] = useState({}); // Track edits per user

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

  const handleSave = async (userId) => {
    const token = localStorage.getItem('token');
    const updates = editStates[userId];
    if (!updates) return;
    try {
      await axios.put(
        `http://localhost:5000/api/admin/users/${userId}`,
        updates,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, ...updates } : u
        )
      );
      setEditStates((prev) => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
    } catch (err) {
      alert('Failed to update user.');
    }
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
      {loading ? (
        <p>Loading users...</p>
      ) : users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Plan</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.email}</td>
                <td>
                  <select
                    value={
                      editStates[u._id]?.role !== undefined
                        ? editStates[u._id].role
                        : u.role
                    }
                    onChange={(e) =>
                      handleEditChange(u._id, 'role', e.target.value)
                    }
                  >
                    <option value="admin">Admin</option>
                    <option value="client">Client</option>
                  </select>
                </td>
                <td>
                  <select
                    value={
                      editStates[u._id]?.plan !== undefined
                        ? editStates[u._id].plan
                        : u.plan
                    }
                    onChange={(e) =>
                      handleEditChange(u._id, 'plan', e.target.value)
                    }
                  >
                    <option value="free">Free</option>
                    <option value="premium">Premium</option>
                  </select>
                </td>
                <td>
                  <button onClick={() => handleSave(u._id)}>
                    Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminDashboard;
