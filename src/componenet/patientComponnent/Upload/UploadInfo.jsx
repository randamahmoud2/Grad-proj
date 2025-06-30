import React, { useState, useEffect } from 'react';
import './UploadInfo.css';
import Delete from "../../../image/delete.png";
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE_URL = "http://localhost:5068/api";

const UpladInfo = () => {
  const navigate = useNavigate();
  const { docId } = useParams(); // docId هنا هو patientId
  const [storedFiles, setStoredFiles] = useState([]);
  const [notification, setNotification] = useState({ message: '', type: '' });

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/Documents/patient/${docId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch files');
        }
        const files = await response.json();
        setStoredFiles(files);
      } catch (error) {
        setNotification({ message: error.message || 'Error fetching files', type: 'error' });
        setTimeout(() => setNotification({ message: '', type: '' }), 3000);
      }
    };
    fetchFiles();
  }, [docId]);

  const remove = async (fileId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/Documents/${fileId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete file');
      }
      setStoredFiles((prev) => prev.filter((file) => file.id !== fileId));
      setNotification({ message: 'File deleted successfully', type: 'success' });
      setTimeout(() => setNotification({ message: '', type: '' }), 3000);
    } catch (error) {
      setNotification({ message: error.message || 'Error deleting file', type: 'error' });
      setTimeout(() => setNotification({ message: '', type: '' }), 3000);
    }
  };

  return (
    <div className='Uplaoding'>
      {notification.message && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      <div className='data2'>
        <div className='title2'>
          <p>Uploaded Files for Patient #{docId}</p>
        </div>
        <button className='adding' onClick={() => navigate(`/Patient/Doctors/${docId}/Upload`)}>
          Upload New File
        </button>
      </div>
      <hr id="split" />
      {storedFiles.length === 0 && (
        <div className='error-message'>
          No Documents or Images uploaded yet.
        </div>
      )}
      {storedFiles.length > 0 && (
        <table className='table3'>
          <thead>
            <tr style={{ background: "rgba(216, 211, 211, 0.851)" }}>
              <th style={{ width: "100px" }}></th>
              <th style={{ width: "250px" }}>Date</th>
              <th>Document Name</th>
              <th>Document Type</th>
              <th>Size (KB)</th>
              <th>Uploaded By</th>
            </tr>
          </thead>
          <tbody>
            {storedFiles.map((file, index) => (
              <tr key={index} className='special' style={{ fontWeight: "800", fontSize: "12px" }}>
                <td>
                  <img
                    src={Delete}
                    alt="delete"
                    style={{ width: "15px", display: "flex", alignItems: "center", cursor: "pointer" }}
                    onClick={() => remove(file.id)}
                  />
                </td>
                <td>{new Date(file.uploadedDate).toLocaleDateString()}</td>
                <td>
                  <a
                    href={`${API_BASE_URL}/Documents/${file.id}/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none', color: 'rgba(3, 3, 116, 0.577)' }}
                  >
                    {file.name}
                  </a>
                </td>
                <td>{file.documentType}</td>
                <td>{(file.size / 1024).toFixed(2)}</td>
                <td>{file.uploadedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UpladInfo;