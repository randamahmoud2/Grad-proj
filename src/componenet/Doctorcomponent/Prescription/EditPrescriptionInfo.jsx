import Drug from '../../../Drug.json';
import Doctors from '../../../Doctor.json';
import DatePicker from "react-datepicker";
import Delete from "../../../image/delete.png";
import { FaCalendarAlt } from "react-icons/fa";
import Patients from '../../../PatientData.json';
import "react-datepicker/dist/react-datepicker.css";
import { Errormodal } from '../errorModal/Errormodal';
import { useNavigate, useParams } from 'react-router-dom';
import React, { useState, useRef, useEffect } from 'react';

import './AddPrescriptioninfo.css';
import './EditPrescriptionInfo.css';

export const EditprescriptionInfo = () => {
    const dateTimeRef = useRef(null);
    const [error, setError] = useState(null);
    const [modal, setModal] = useState(false);
    const [selectDrugs, setSelectDrugs] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const { id } = useParams();
    const navigate = useNavigate();
    const patient = Patients.find((p) => String(p.id) === id);

    const [submit, setSubmit] = useState({
        id: "",
        drug: "",
        patientInstruct: "",
        expiration: "",
        strength: "",
        refill: "",
        dispense: "",
    });

    // Load stored prescriptions from localStorage when component mounts
    useEffect(() => {
        const storedDrugs = JSON.parse(localStorage.getItem("prescriptions")) || [];
        setSelectDrugs(storedDrugs);
    }, []);

    function handlediv() {
        if (modal === true) {
            setModal(false);
        }
    }

    let errors = [];
    function handlesubmit() {
        const { drug, patientInstruct, expiration } = submit;
    
        if (!drug) errors.push("Drug is required");
        if (!patientInstruct) errors.push("Patient Instructions are required");
        if (!expiration) errors.push("Expiration must be greater than 0");
    
        if (errors.length > 0) {
          setError(errors);
          setModal(true);
          return;
        }
        const newDrug = {
          ...submit,
          patientId: id
        };
    
        const updatedDrugs = [...selectDrugs, newDrug];
        setSelectDrugs(updatedDrugs);
        
        const allDrugs = JSON.parse(localStorage.getItem("prescriptions")) || [];
        const newAllDrugs = [...allDrugs, newDrug];
        localStorage.setItem("prescriptions", JSON.stringify(newAllDrugs));
    
        setSubmit({
          drug: "",
          patientInstruct: "",
          expiration: "",
          strength: "",
          refill: "",
          dispense: "",
        });
      }

    function handleDrugChange(event) {
        const selectedDrugName = event.target.value;
        const selectedDrug = Drug.find((drug) => drug.name === selectedDrugName);

        if (selectedDrug) {
            setSubmit({
                id: Math.floor(Math.random() * 3001),
                drug: selectedDrug.name,
                strength: selectedDrug.strength || "",
                refill: selectedDrug.refill !== null ? selectedDrug.refill : "",
                dispense: selectedDrug.dispense !== null ? selectedDrug.dispense : "",
                patientInstruct: selectedDrug.patientInstruction || "",
                expiration: selectedDrug.expiration !== null ? selectedDrug.expiration : "",
            });
        } else {
            setSubmit((prevSubmit) => ({ ...prevSubmit, drug: selectedDrugName }));
        }
    }

    function handleSave() {
        if (selectDrugs.length === 0) {
            errors = ["Add at least one drug"];
            setError(errors);
            setModal(true);
            return;
        }

        // Navigate to the patient's prescription page using patientId from params
        navigate(`/Doctor/Patient/${id}/Prescription`);
    }

    // Delete single drug by id
    function handleDelete(id) {
        const updatedDrugs = selectDrugs.filter((drug) => drug.id !== id);
        setSelectDrugs(updatedDrugs);
        localStorage.setItem("prescriptions", JSON.stringify(updatedDrugs));
    }


    function deleteAll() {
        setSelectDrugs([]);
        localStorage.removeItem("prescriptions");
        console.log("All prescriptions deleted");
    }


    function handleEdit(index, field, value) {
        const updatedDrugs = [...selectDrugs];
        updatedDrugs[index][field] = value;
        setSelectDrugs(updatedDrugs);
        localStorage.setItem("prescriptions", JSON.stringify(updatedDrugs));
    }

    return (
        <div>
            <div className='prescription'>
                <div className='data2'>
                    <div className='title2'>
                        <p>Edit Prescription</p>
                        <p id="name">{patient.name} / {patient.id} </p>
                    </div>
                    <div className='buttons'>
                        <button className='add' style={{ width: "80px" }} onClick={handleSave}>
                            Save
                        </button>
                        <button className='delete' style={{ width: "80px" }} onClick={deleteAll}>
                            Delete
                        </button>
                    </div>
                </div>
                <hr id="split" />

                <Errormodal isvisible={modal} errormessage={error} />
                <div className='pres-data1'>
                    <div className='provider'>
                        <label htmlFor="provider">Provider</label>
                        <input list="providers" name="provider" id="provider"></input>
                        <datalist id='providers'>
                            {
                                Doctors.map(Doctor => (
                                    <option key={Doctor.id} value={Doctor.firstName}></option>
                                ))
                            }
                        </datalist>
                    </div>

                    <div className='date'>
                        <label>Date</label>
                        <div className='picker'>
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date) => setSelectedDate(date)}
                                showTimeSelect
                                dateFormat="dd/MM/yyyy   h:mm aa"
                                className="datetime"
                                ref={dateTimeRef}
                            />
                            <FaCalendarAlt
                                className="calender"
                                onClick={() => dateTimeRef.current.setOpen(true)}
                            />
                        </div>
                        <div className='status'>
                            <label htmlFor="status">Status</label>
                            <select id="status">
                                <option value="Active">Active</option>
                                <option value="Expired">Expired</option>
                            </select>
                        </div>
                    </div>
                    <hr id="split" />
                </div>

                <div className='drug' onClick={handlediv}>
                    <div className='form-group'>
                        <div className='select-drug'>
                            <label htmlFor="drug">Drug</label>
                            <input
                                list="drugs"
                                name="drug"
                                id="drug"
                                placeholder='Select Drug'
                                value={submit.drug}
                                onChange={handleDrugChange}
                            />
                            <datalist id='drugs'>
                                {
                                    Drug.map(drug => (
                                        <option key={drug.id} value={drug.name}></option>
                                    ))
                                }
                            </datalist>
                        </div>
                        <button
                            className='add'
                            disabled={
                              submit.drug === " " &&
                              submit.expiration === " " &&
                              submit.patientInstruct === " "
                            }
                            onClick={handlesubmit}
                        >
                          ADD
                        </button>
                    </div>

                    <div className='form-group'>
                      <div className='strength'>
                        <label>Strength</label>
                        <input
                          id='strength'
                          type="text"
                          value={submit.strength}
                          onChange={(e) => setSubmit({ ...submit, strength: e.target.value })}
                        />
                      </div>
                      <div className='dispense'>
                        <label>Dispense</label>
                        <input
                          id='dispense'
                          type="number"
                          min="0"
                          value={submit.dispense}
                          onChange={(e) => setSubmit({ ...submit, dispense: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className='form-group'>
                      <div className='refill'>
                        <label>Refill</label>
                        <input
                          id='refill'
                          type="number"
                          min="0"
                          value={submit.refill}
                          onChange={(e) => setSubmit({ ...submit, refill: e.target.value })}
                        />
                      </div>
                      <div className='expiration'>
                        <label>Expiration</label>
                        <input
                          id='expiration'
                          type="number"
                          min="1"
                          value={submit.expiration}
                          onChange={(e) => setSubmit({ ...submit, expiration: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                        <label>Substitute</label>
                        <input type="checkbox" id='checked' />
                    </div>

                    <div className="form-group">
                        <label>Patient Instructions</label>
                        <input
                            className='instruction'
                            value={submit.patientInstruct}
                            onChange={(e) => setSubmit({ ...submit, patientInstruct: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Pharmacy Instructions</label>
                        <input className='instruction' id="pharmacy" />
                    </div>
                    <p id='para'>Selected Drugs</p>
                    <hr id="split" />
                </div>

                <div className='selecteDrugs'>
                <table style={{ marginTop: "20px", width: "55%" }} className='table3'>
                    <thead>
                      <tr style={{ background: "rgba(216, 211, 211, 0.851)" }} key={submit.id}>
                        <th><div></div></th>
                        <th>Name</th>
                        <th>Instruction</th>
                        <th>Expiration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectDrugs.map((drug, index) => (
                        <tr className='special' key={index} style={{ fontWeight: "800", fontSize: "12px" }}>
                          <td>
                            <img
                              src={Delete}
                              alt="Delete"
                              style={{ width: "15px", display: "flex", alignItems: "center" }}
                              onClick={() => handleDelete(drug.id)}
                            />
                          </td>
                          <td>{drug.drug}</td>
                          <td>{drug.patientInstruct}</td>
                          <td>{drug.expiration}</td>
                        </tr>
                      ))}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
    );
}

export default EditprescriptionInfo;
