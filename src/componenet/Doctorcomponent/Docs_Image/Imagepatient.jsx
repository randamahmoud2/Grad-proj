import './Imagepatient.css'
import DatePicker from "react-datepicker";
import Delete from "../../../image/delete.png"
import upload from "../../../image/upload.png"
import React, { useState, useRef } from 'react'
import { FaCalendarAlt } from "react-icons/fa";
import Patients from '../../../PatientData.json';
import { useParams, useNavigate } from 'react-router-dom';

export const Imagepatient = () => {
    const dateTimeRef = useRef(null);
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const navigate = useNavigate();
    const { id } = useParams();
    const patient = Patients.find((p) => String(p.id) === id);

    function addPhoto(e) {
        const file = e.target.files[0];
        if (file) {
            const newImage = URL.createObjectURL(file);
            setImages([...images, newImage]);
        }
    }

    function deletePhoto(id) {
        setImages(images.filter(image => image.id !== id));
    }
    
    return (
        <div className='imagePatient'>
            <div className='data2'>
                <div className='title2'>
                    <p>Image</p>
                    <p id="name">{patient.name} / {patient.id} </p>
                </div>
            </div>
            <hr id="split"/>
            
            <div className='uploadphoto'>
                <div className='photo'>
                    <div>
                        <img src={upload} alt="" />
                        <h3>Upload Images</h3>
                    </div>
                    <button className='addPhoto'><label className="custom-file-label" htmlFor="fileInput">Select Image</label></button>
                    <input type="file" id="fileInput" className="file-upload" onChange={addPhoto}/>
                </div>
                
                <div className='imageInfo'>
                    <div className='info'>
                        <p>Image Information</p>
                        <hr className='split'/>
                    </div>
                    <div className='info2'>
                        <p>Uploaded On</p>
                        <div className='picker'>
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date) => setSelectedDate(date)}
                                dateFormat="dd/MM/yyyy"
                                className="datetime" 
                                ref={dateTimeRef} 
                            />
                            <FaCalendarAlt
                                className="calender"
                                onClick={() => dateTimeRef.current.setOpen(true)}
                            />
                        </div>
                        <div className='photo1'>
                            <p>Uploaded By <span>Doctor name</span></p> 
                            {images.map((img, index) => (
                                <div>
                                    <p>Size   <span style={{marginLeft:"110px"}}>{(images.size / 1024).toFixed(2)} KB</span></p> 
                                    <p>Format <span style={{marginLeft:"85px"}}>{(images.type)}JPG</span></p>
                                </div>
                            ))}
                        </div>  

                    </div>
                </div>
            </div>    

            <div  className='uploadphoto display'>
                <hr className='split' />
                    <div className='photo1'>
                        {images.map((img, index) => (
                            <div className="container">
                                <img src={img} alt={`Uploaded ${index}`} key={index} 
                                onClick={() => setSelectedImage(img)}
                                className='img' />
                                <div className='middle'>
                                    <img src={Delete} className="delete" alt="" onClick={() => deletePhoto(img.id)}/>
                                </div>
                            </div>
                        ))}
                    </div>
            </div>

            {selectedImage && (
                <div className="modal" onClick={() => setSelectedImage(null)}>
                    <div className="modal-content">
                        <img src={selectedImage} alt="Enlarged" />
                    </div>
                </div>
            )}
        </div>
    )
}
export default Imagepatient;