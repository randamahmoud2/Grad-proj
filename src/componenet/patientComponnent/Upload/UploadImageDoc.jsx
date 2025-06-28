// import './UploadImageDoc.css'
import upload from "../../../image/upload.png"
import React, { useState, useEffect } from 'react';

const UploadImg_Doc = () => {
    const [imagesDocs, setImagesDocs] = useState([]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const newFile = {
                id: crypto.randomUUID(),
                name: file.name,
                url: URL.createObjectURL(file),
                type: file.type
            };
            const updatedList = [...imagesDocs, newFile];
            setImagesDocs(updatedList);
            localStorage.setItem("imagesDocs", JSON.stringify(updatedList));
        }
    };
    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("imagesDocs")) || [];
        setImagesDocs(stored);
    }, []);

    return (
        <div className='Uplaoding'>
            <div className='data2'>
                <div className='title2'>
                    <p>Upload Image and Document</p>
                </div>
            </div>
            <hr id="split" />
            <div className='AddDoc-Img'>
            <div className='photo'>
                <div>
                    <img src={upload} alt="" />
                    <h3>Choose Images and Documents</h3>
                </div>
                <button className='addPhoto'><label className="custom-file-label" htmlFor="fileInput">Upload</label></button>
                <input type="file" id="fileInput" onChange={handleFileChange} accept=".jpg,.jpeg,.png,.doc,.docx,.pdf" className="file-upload"/>
                </div>
            </div>
        </div>
    )
}

export default UploadImg_Doc