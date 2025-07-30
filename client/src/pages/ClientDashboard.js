import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ClientDashboard() {
  const [files, setFiles] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [requestStatus, setRequestStatus] = useState(null); // 'none', 'pending', 'accepted', 'rejected'
  const [messageInput, setMessageInput] = useState('');

  useEffect(() => {
    checkRequestStatus();
  }, []);

  useEffect(() => {
    if (requestStatus === 'accepted') {
      fetchFiles();
      fetchMessages();
    }
  }, [requestStatus]);

  const checkRequestStatus = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:5000/api/client/request-status', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequestStatus(res.data.status); // 'none', 'pending', 'accepted', 'rejected'
    } catch (err) {
      setRequestStatus('none');
    }
  };

  const handleRequestAdmin = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:5000/api/client/request-admin', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequestStatus('pending');
    } catch (err) {
      alert('Failed to send request.');
    }
  };

  const fetchFiles = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:5000/api/client/files', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFiles(res.data);
    } catch (err) {
      console.error('Failed to fetch files:', err);
    }
  };

  const fetchMessages = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:5000/api/client/messages', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    setUploading(true);
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await axios.post('http://localhost:5000/api/client/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setSelectedFile(null);
      fetchFiles();
    } catch (err) {
      alert('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:5000/api/client/messages', { content: messageInput }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessageInput('');
      fetchMessages();
    } catch (err) {
      alert('Failed to send message.');
    }
  };

  const goHome = () => {
    window.location.href = '/';
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <button onClick={goHome} style={{
        display: 'inline-block',
        margin: '0 1rem 2rem 0',
        padding: '0.75rem 1.5rem',
        backgroundColor: '#007bff',
        color: '#fff',
        textDecoration: 'none',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
      }}>
        Home
      </button>
      <h1>Welcome Client</h1>
      {requestStatus === 'none' && (
        <div>
          <p>You have not requested to work with an admin yet.</p>
          <button onClick={handleRequestAdmin}>Request to Work with Admin</button>
        </div>
      )}
      {requestStatus === 'pending' && (
        <p>Your request to work with an admin is pending approval.</p>
      )}
      {requestStatus === 'rejected' && (
        <p>Your request was rejected. Please contact support or try again later.</p>
      )}
      {requestStatus === 'accepted' && (
        <>
          <form onSubmit={handleUpload} style={{ marginBottom: '2rem' }}>
            <input type="file" onChange={handleFileChange} />
            <button type="submit" disabled={uploading || !selectedFile}>
              {uploading ? 'Uploading...' : 'Upload File'}
            </button>
          </form>
          <h2>Your Uploaded Files</h2>
          <ul>
            {files.map((file) => (
              <li key={file._id}>
                <a
                  href={`http://localhost:5000${file.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {file.name}
                </a>
              </li>
            ))}
          </ul>
          <h2>Messages</h2>
          <form onSubmit={handleSendMessage} style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              value={messageInput}
              onChange={e => setMessageInput(e.target.value)}
              placeholder="Type your message"
              style={{ width: '60%', marginRight: '1rem' }}
            />
            <button type="submit">Send</button>
          </form>
          <ul>
            {messages.map((msg) => (
              <li key={msg._id}>
                <strong>{msg.sender?.name || 'You'}:</strong> {msg.content}
                <span style={{ fontSize: '0.9em', color: '#aaa', marginLeft: 8 }}>
                  {new Date(msg.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default ClientDashboard;