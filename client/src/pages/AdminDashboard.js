import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  const fetchUsers = useCallback(async () => {
    const res = await axios.get("http://localhost:5000/api/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUsers(res.data);
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const deleteUser = async (id) => {
    if (window.confirm("Delete this user?")) {
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    }
  };

  const updateUser = async (id, field, value) => {
    await axios.put(
      `http://localhost:5000/api/admin/users/${id}`,
      {
        [field]: value,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    fetchUsers();
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Admin Dashboard</h2>
      <input
        placeholder="Search by name or email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: "1rem", padding: "0.5rem", width: "100%" }}
      />

      {filteredUsers.map((user) => (
        <div
          key={user._id}
          style={{ borderBottom: "1px solid #ccc", padding: "1rem 0" }}
        >
          <p>
            <strong>{user.name}</strong> — {user.email}
          </p>

          <div style={{ display: "flex", gap: "1rem" }}>
            <label>
              Role:
              <select
                value={user.role}
                onChange={(e) => updateUser(user._id, "role", e.target.value)}
              >
                <option value="client">Client</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            <label>
              Plan:
              <select
                value={user.plan}
                onChange={(e) => updateUser(user._id, "plan", e.target.value)}
              >
                <option value="free">Free</option>
                <option value="premium">Premium</option>
              </select>
            </label>

            <button
              onClick={() => deleteUser(user._id)}
              style={{ color: "red" }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AdminDashboard;
