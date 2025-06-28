import './UploadInfo.css'
import React, {useState, useEffect} from 'react'
import Delete from "../../../image/delete.png"
import all_product from '../../Assets/all_product'
import { useNavigate, useParams } from 'react-router-dom'

const UpladInfo = () => {
    const navigate = useNavigate();
    const { docId } = useParams();
    const doctor = all_product.find((item) => item.id.toString() === docId);

    
    const [storedFiles, setStoredFiles] = useState([]);

    useEffect(() => {
        const files = JSON.parse(localStorage.getItem("imagesDocs")) || [];
        setStoredFiles(files);
    }, []);

    function remove(e){
        console.log(e)
        const keepFile = storedFiles.filter((file)=> (file.id !== e)); 
        setStoredFiles(keepFile);
        localStorage.setItem("imagesDocs", JSON.stringify(keepFile))
    }

    return (
        <div className='Uplaoding'>
            <div className='data2'>
                <div className='title2'>
                    <p>Upload</p>
                </div>
                <button className='adding' onClick={() => navigate(`/Patient/Doctors/${doctor.id}/Upload`)}>Select</button>
            </div>
            <hr id="split" />
            {storedFiles.length === 0 && (
                <div className='error-message'>
                  No Documents or Images uploaded yet.
                </div>
)           }

            {storedFiles.length > 0 && (
                <table className='table3'>
                    <thead>
                        <tr style={{ background: "rgba(216, 211, 211, 0.851)" }}>
                            <th style={{ width: "100px" }}></th>
                            <th style={{ width: "250px" }}>Date</th>
                            <th>Documents</th>
                        </tr>
                    </thead>
                    <tbody>
                        {storedFiles.map((file, index) => (
                          <tr key={index} className='special' style={{ fontWeight: "800", fontSize: "12px" }}>
                            <td>
                              <img
                                src={Delete}
                                alt="delete"
                                style={{ width: "15px", display: "flex", alignItems: "center" }}
                                onClick={() => remove(file.id)}
                              />
                            </td>
                            <td>{new Date().toLocaleDateString()}</td>
                            <td>
                              <a
                                href={file.url}
                                target="_self"
                                rel="noopener noreferrer"
                                style={{ textDecoration: 'none', color: 'rgba(3, 3, 116, 0.577)' }}
                              >
                                {file.name}
                              </a>
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
            )}
        </div>
    )
}

export default UpladInfo
