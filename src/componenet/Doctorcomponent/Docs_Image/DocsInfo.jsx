import "./DocsInfo.css";
import "./Imagepatient.css";
import DatePicker from "react-datepicker";
import Delete from "../../../image/delete.png";
import { FaCalendarAlt } from "react-icons/fa";
import React, { useState, useRef, useEffect } from "react";
import upload from "../../../image/upload-file.png";
import { useParams } from "react-router-dom";

export const DocsInfo = () => {
  const dateTimeRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [files, setFiles] = useState([]);
  const [patientName, setPatientName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [documentType, setDocumentType] = useState("EOB");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const { id } = useParams();

  const allowedExtensions = [".pdf", ".png", ".jpg", ".jpeg", ".doc", ".docx"];
  const maxFileSize = 10 * 1024 * 1024; // 10 MB

  useEffect(() => {
    async function fetchPatientName() {
      try {
        const response = await fetch(`http://localhost:5068/api/Patients/${id}/name`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setPatientName(data.name);
        } else {
          const errorText = await response.text();
          console.error("Failed to fetch patient name:", errorText);
          setError(`Failed to fetch patient name: ${errorText}`);
        }
      } catch (err) {
        console.error("Error fetching patient name:", err);
        setError("Error fetching patient name: " + err.message);
      }
    }

    async function fetchDocuments() {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:5068/api/Documents/patient/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setFiles(
            data.map((doc) => ({
              id: doc.id,
              file: { name: doc.fileName, size: doc.fileSize },
              uploadedDate: new Date(doc.uploadedDate),
            }))
          );
        } else {
          const errorText = await response.text();
          console.error("Failed to fetch documents:", errorText);
          setError(`No documents found: ${errorText}`);
        }
      } catch (err) {
        console.error("Error fetching documents:", err);
        setError("Error fetching documents: " + err.message);
      }
      setIsLoading(false);
    }

    if (id && !isNaN(parseInt(id))) {
      fetchPatientName();
      fetchDocuments();
    } else {
      setError("Invalid Patient ID");
    }
  }, [id]);

  function handleFileSelection(e) {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      const extension = file.name.toLowerCase().match(/\.[^.]+$/)[0];
      if (!allowedExtensions.includes(extension)) {
        setError(`Invalid file type: ${file.name}. Allowed types: ${allowedExtensions.join(", ")}`);
        return false;
      }
      if (file.size > maxFileSize) {
        setError(`File too large: ${file.name}. Max size is 10MB`);
        return false;
      }
      return true;
    });
    setSelectedFiles(validFiles);
  }

  async function handleSubmitUpload() {
    if (!selectedFiles.length) {
      setError("Please select at least one file.");
      return;
    }
    if (!documentType) {
      setError("Please select a valid document type.");
      return;
    }
    if (isNaN(parseInt(id))) {
      setError("Invalid Patient ID");
      return;
    }

    setIsLoading(true);
    setError(null);

    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append("File", file);
      formData.append("PatientId", id);
      formData.append("UploadedBy", "Doctor name");
      formData.append("DocumentType", documentType);

      try {
        const response = await fetch(`http://localhost:5068/api/Documents`, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const responseBody = await response.text();
        if (response.ok) {
          const newDoc = JSON.parse(responseBody);
          setFiles([
            ...files,
            {
              id: newDoc.id,
              file: { name: newDoc.fileName, size: newDoc.fileSize },
              uploadedDate: new Date(newDoc.uploadedDate),
            },
          ]);
        } else {
          console.error("Upload failed (status:", response.status, "):", responseBody);
          try {
            const errorData = JSON.parse(responseBody);
            setError(`Failed to upload document: ${errorData.message || response.statusText}`);
          } catch {
            setError(`Failed to upload document: ${responseBody || response.statusText}`);
          }
        }
      } catch (err) {
        console.error("Error uploading document:", err);
        setError("Error uploading document: " + err.message);
      }
    }
    setIsLoading(false);
    setSelectedFiles([]);
  }

  return (
    <div className="docsPatient">
      {isLoading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div className="data2">
        <div className="title2">
          <p>Document</p>
          <p id="name">{patientName} / {id}</p>
        </div>
      </div>
      <hr id="split" />

      <div className="uploadphoto">
        <div className="photo">
          <div>
            <img src={upload} alt="Upload" />
            <h3>Upload Document</h3>
          </div>
          <button className="addPhoto">
            <label className="custom-file-label" htmlFor="fileInput">
              Select Files
            </label>
          </button>
          <input
            type="file"
            id="fileInput"
            className="file-upload"
            multiple
            onChange={handleFileSelection}
          />
          <button
            className="submitbutton"
            onClick={handleSubmitUpload}
            disabled={isLoading || !selectedFiles.length}
            style={{ marginTop: "10px", padding: "8px 16px" }}
          >
            Upload
          </button>
        </div>

        <div className="imageInfo">
          <div className="info">
            <p>Document Information</p>
            <hr className="split" />
          </div>

          <div className="info2">
            <p>Uploaded On</p>
            <div className="picker">
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat="dd/MM/yyyy"
                className="datetime"
                ref={dateTimeRef}
                readOnly
              />
              <FaCalendarAlt
                className="calender"
                onClick={() => dateTimeRef.current?.setOpen(true)}
              />
            </div>

            <p>
              Uploaded By <span style={{ marginLeft: "66px" }}>Doctor name</span>
            </p>

            <div
              className="doctype"
              style={{
                display: "flex",
                gap: "44px",
                paddingBottom: "15px",
                color: "#042d6687",
                fontSize: "16px",
                fontWeight: "600",
                alignItems: "center",
              }}
            >
              <label htmlFor="docType">Document Type</label>
              <select
                id="docType"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                style={{
                  width: "195px",
                  height: "30px",
                  padding: "4px",
                  fontSize: "15px",
                  fontWeight: "600",
                  color: "#042d6687",
                  border: "1px solid gray",
                }}
              >
                <option value="EOB">EOB</option>
                <option value="Forms">Forms</option>
                <option value="Patient Treatment">Patient Treatment</option>
                <option value="Patient Information">Patient Information</option>
                <option value="Patient Health History">Patient Health History</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="display">
        <table className="table3">
          <thead>
            <tr style={{ background: "rgba(216, 211, 211, 0.851)" }}>
              <th>
                <div></div>
              </th>
              <th>Name</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {files.map((fileData, index) => (
              <tr key={fileData.id || index}>
                <td>
                  <img
                    src={Delete}
                    alt="Delete"
                    style={{ cursor: "pointer" }}
                  />
                </td>
                <td>
                  {fileData.file.name} - {(fileData.file.size / 1024).toFixed(1)} KB
                </td>
                <td>
                  <DatePicker
                    selected={fileData.uploadedDate}
                    showTimeSelect
                    dateFormat="hh:mm:ss aa"
                    className="datetime"
                    readOnly
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocsInfo;