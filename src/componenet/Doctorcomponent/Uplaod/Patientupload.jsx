import React, { useState } from "react";
import "./Patientupload.css";
import { useParams } from "react-router-dom";
import Patients from "../../../PatientData.json";
import { FaFileAlt, FaImage, FaFilePdf, FaFileWord, FaFileExcel, FaEye, FaDownload, FaTrashAlt, FaPlus, FaCloudUploadAlt } from "react-icons/fa";

export const Patientupload = () => {
    const { id } = useParams();
    const patient = Patients.find((p) => String(p.id) === id);
    
    // State for active tab
    const [activeTab, setActiveTab] = useState('images');
    

    
    // State for image preview modal
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewItem, setPreviewItem] = useState(null);
    
    const [patientImages, setPatientImages] = useState([]);
    
    const [patientDocuments, setPatientDocuments] = useState([]);
    
    
    
    const openPreview = (item) => {
        setPreviewItem(item);
        setShowPreviewModal(true);
    };
    
    const getFileIcon = (fileType) => {
        if (fileType.includes('pdf')) return <FaFilePdf className="file-icon pdf" />;
        if (fileType.includes('doc')) return <FaFileWord className="file-icon word" />;
        if (fileType.includes('xls')) return <FaFileExcel className="file-icon excel" />;
        return <FaFileAlt className="file-icon" />;
    };
    
    return (
        <div className="docsPatient">
            <div className="data2">
                <div className='title2'>
                    <p>Patient Upload</p>
                    <p id="name">{patient.name} / {patient.id}</p>
                </div>
            </div>
            <hr id="split" />
            
            {/* Upload Controls */}
            <div className="upload-controls">
                <div className="tab-buttons">
                    <button 
                        className={`tab-btn ${activeTab === 'images' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('images')}
                    >
                        <FaImage /> Images
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('documents')}
                    >
                        <FaFileAlt /> Documents
                    </button>
                </div>
                
            </div>
            
            {/* Content Area */}
            <div className="content-area">
                {activeTab === 'images' && (
                    <div className="images-grid">
                        {patientImages.length > 0 ? (
                            patientImages.map(image => (
                                <div className="image-item" key={image.id}>
                                    <div className="image-thumbnail" onClick={() => openPreview(image)}>
                                        <img src={image.url} alt={image.name} />
                                    </div>
                                    <div className="image-details">
                                        <div className="image-name">{image.name}</div>
                                        <div className="image-date">{image.date}</div>
                                    </div>
                                    <div className="image-actions">
                                        <button onClick={() => openPreview(image)}>
                                            <FaEye /> View
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <FaImage className="empty-icon" />
                                <p>No images uploaded for this patient yet</p>
                                
                            </div>
                        )}
                    </div>
                )}
                
                {activeTab === 'documents' && (
                    <div className="documents-list">
                        {patientDocuments.length > 0 ? (
                            <table className="documents-table">
                                <thead>
                                    <tr>
                                        <th>Type</th>
                                        <th>File Name</th>
                                        <th>Date</th>
                                        <th>Size</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {patientDocuments.map(doc => (
                                        <tr key={doc.id}>
                                            <td>{getFileIcon(doc.type)}</td>
                                            <td>{doc.name}</td>
                                            <td>{doc.date}</td>
                                            <td>{doc.size}</td>
                                            <td className="action-buttons">
                                                <a href={doc.url} download={doc.name} className="btn-download">
                                                    <FaDownload /> Download
                                                </a>   
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="empty-state">
                                <FaFileAlt className="empty-icon" />
                                <p>No documents uploaded for this patient yet</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            {showPreviewModal && previewItem && (
                <div className="modal-overlay" onClick={() => setShowPreviewModal(false)}>
                    <div className="preview-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{previewItem.name}</h3>
                            <button className="close-btn" onClick={() => setShowPreviewModal(false)}>×</button>
                        </div>
                        <div className="preview-content">
                            <img src={previewItem.url} alt={previewItem.name} />
                        </div>
                        <div className="modal-footer">
                            <p>Uploaded on {previewItem.date}</p>
                            <div className="modal-actions">
                                <a href={previewItem.url} download={previewItem.name} className="btn-download">
                                    <FaDownload /> Download
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Patientupload;
