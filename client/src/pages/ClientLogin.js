import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ClientLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form:', form); // Debug
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      console.log('Response:', res.data); // Debug
      const { token, user } = res.data;

      if (user.role !== 'client') {
        alert('Only clients can log in here.');
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/client');
    } catch (err) {
      console.error(err);
      alert('Login failed.');
    }
  };

  return (
    <div>
      <h2>Client Login</h2>
      <form onSubmit={handleSubmit}>
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default ClientLogin;