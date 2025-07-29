import React, { useState } from 'react';
import axios from 'axios';

function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'client' });

  const register = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', form);
      alert('Registered! Please log in.');
    } catch (err) {
      alert(err.response.data.error);
    }
  };

  return (
    <form onSubmit={register}>
      <h2>Register</h2>
      <input placeholder="Name" onChange={e => setForm({ ...form, name: e.target.value })} required />
      <input type="email" placeholder="Email" onChange={e => setForm({ ...form, email: e.target.value })} required />
      <input type="password" placeholder="Password" onChange={e => setForm({ ...form, password: e.target.value })} required />
      <select onChange={e => setForm({ ...form, role: e.target.value })}>
        <option value="client">Client</option>
        <option value="admin">Admin</option>
      </select>
      <button type="submit">Register</button>
    </form>
  );
}

export default Register;