import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

function ProjectPage() {
  const [project, setProject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [files, setFiles] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchProject = useCallback(async () => {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    };
    const res = await axios.get("http://localhost:5000/api/client/project", {
      headers,
    });
    setProject(res.data);
  }, []);

  const fetchMessages = useCallback(async () => {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    };
    const res = await axios.get(
      "http://localhost:5000/api/client/project/messages",
      { headers }
    );
    setMessages(res.data);
  }, []);

  const fetchFiles = useCallback(async () => {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    };
    const res = await axios.get(
      "http://localhost:5000/api/client/project/files",
      { headers }
    );
    setFiles(res.data);
  }, []);

  useEffect(() => {
    fetchProject();
    fetchMessages();
    fetchFiles();
  }, [fetchProject, fetchMessages, fetchFiles]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    await axios.post(
      "http://localhost:5000/api/client/messages",
      { content: newMessage },
      { headers }
    );
    setNewMessage("");
    fetchMessages();
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const uploadFile = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    await axios.post("http://localhost:5000/api/client/upload", formData, {
      headers: {
        ...headers,
        "Content-Type": "multipart/form-data",
      },
    });
    setSelectedFile(null);
    fetchFiles();
    setUploading(false);
  };

  if (!project)
    return <div style={{ padding: "2rem" }}>Loading project...</div>;

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h2>Project: {project.name}</h2>
      <p>{project.description}</p>

      <section style={{ marginTop: "2rem" }}>
        <h3>Send a Message</h3>
        <form onSubmit={sendMessage}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message"
            style={{ width: "70%", marginRight: "1rem" }}
          />
          <button type="submit">Send</button>
        </form>
        <ul>
          {messages.map((msg) => (
            <li key={msg._id}>
              <strong>{msg.sender?.name || "You"}:</strong> {msg.content}
              <span style={{ fontSize: "0.8em", color: "#888", marginLeft: 6 }}>
                {new Date(msg.createdAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h3>Upload a File</h3>
        <form onSubmit={uploadFile}>
          <input type="file" onChange={handleFileChange} />
          <button type="submit" disabled={uploading || !selectedFile}>
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </form>
        <ul>
          {files.map((f) => (
            <li key={f._id}>
              <a
                href={`http://localhost:5000${f.url}`}
                target="_blank"
                rel="noreferrer"
              >
                {f.name}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default ProjectPage;
