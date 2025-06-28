import './AddPrescriptioninfo.css';
import DatePicker from "react-datepicker";
import { FaCalendarAlt } from "react-icons/fa";
import React, { useState, useEffect, useRef } from 'react';
import "react-datepicker/dist/react-datepicker.css";
import { Errormodal } from '../errorModal/Errormodal';
import { useParams, useNavigate } from 'react-router-dom';
import Delete from "../../../image/delete.png";

export const AddPrescriptionInfo = () => {
  const dateTimeRef = useRef(null);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(false);
  const [drugs, setDrugs] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patient, setPatient] = useState(null);
  const [selectDrugs, setSelectDrugs] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const navigate = useNavigate();
  const { id } = useParams();

  const [submit, setSubmit] = useState({
    id: "",
    drug: "",
    patientInstruct: "",
    expiration: "",
    strength: "",
    refill: "",
    dispense: "",
  });

  const [prescription, setPrescription] = useState({
    patientId: parseInt(id),
    doctorId: "",
    status: "Active",
    allowSubstitution: false,
    pharmacyInstructions: "",
  });

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch patient
        const patientResponse = await fetch(`http://localhost:5068/api/Patients/${id}`);
        if (!patientResponse.ok) throw new Error("Failed to fetch patient");
        const patientData = await patientResponse.json();
        setPatient(patientData);

        // Fetch doctors
        const doctorsResponse = await fetch('http://localhost:5068/api/Doctors');
        if (!doctorsResponse.ok) throw new Error("Failed to fetch doctors");
        const doctorsData = await doctorsResponse.json();
        setDoctors(doctorsData);

        // Fetch drugs
        const drugsResponse = await fetch('http://localhost:5068/api/Drugs');
        if (!drugsResponse.ok) throw new Error("Failed to fetch drugs");
        const drugsData = await drugsResponse.json();
        setDrugs(drugsData);
      } catch (err) {
        setError([err.message]);
        setModal(true);
      }
    };
    fetchData();
  }, [id]);

  function handlediv() {
    if (modal) {
      setModal(false);
    }
  }

  function handlesubmit() {
    const { drug, patientInstruct, expiration } = submit;
    let errors = [];

    if (!drug) errors.push("Drug is required");
    if (!patientInstruct) errors.push("Patient Instructions are required");
    if (!expiration || parseInt(expiration) <= 0) errors.push("Expiration must be greater than 0");

    if (errors.length > 0) {
      setError(errors);
      setModal(true);
      return;
    }

    const updatedDrugs = [...selectDrugs, { ...submit, id: Math.floor(Math.random() * 3001) }];
    setSelectDrugs(updatedDrugs);

    setSubmit({
      id: "",
      drug: "",
      patientInstruct: "",
      expiration: "",
      strength: "",
      refill: "",
      dispense: "",
    });
  }

  async function handleSave() {
    let errors = [];
    if (selectDrugs.length === 0) {
      errors.push("Add at least one drug");
      setError(errors);
      setModal(true);
      return;
    }

    if (!prescription.doctorId) {
      errors.push("Provider is required");
      setError(errors);
      setModal(true);
      return;
    }

    try {
      const prescriptionData = {
        patientId: prescription.patientId,
        doctorId: parseInt(prescription.doctorId),
        date: selectedDate.toISOString(),
        status: prescription.status,
        allowSubstitution: prescription.allowSubstitution,
        pharmacyInstructions: prescription.pharmacyInstructions,
        modifiedBy: "System", // Added to match backend model
        medications: selectDrugs.map(drug => ({
          drug: drug.drug,
          strength: drug.strength,
          dispense: parseInt(drug.dispense) || 0,
          refill: parseInt(drug.refill) || 0,
          expiration: parseInt(drug.expiration) || 1,
          patientInstruct: drug.patientInstruct
        }))
      };

      console.log("Sending prescriptionData:", JSON.stringify(prescriptionData, null, 2));

      const response = await fetch('http://localhost:5068/api/Prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prescriptionData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to save prescription: ${errorData}`);
      }

      setSelectDrugs([]);
      navigate(`/Doctor/Patient/${id}/Prescription/update`);
    } catch (err) {
      setError([err.message]);
      setModal(true);
    }
  }

  function handleDrugChange(event) {
    const selectedDrugName = event.target.value;
    const selectedDrug = drugs.find((drug) => drug.name === selectedDrugName);

    if (selectedDrug) {
      setSubmit({
        id: Math.floor(Math.random() * 3001),
        drug: selectedDrug.name,
        strength: selectedDrug.strength || "",
        refill: selectedDrug.refill !== null ? selectedDrug.refill : "",
        dispense: selectedDrug.dispense !== null ? selectedDrug.dispense : "",
        patientInstruct: selectedDrug.patientInstruct || "",
        expiration: selectedDrug.expiration !== null ? selectedDrug.expiration : "",
      });
    } else {
      setSubmit((prevSubmit) => ({ ...prevSubmit, drug: selectedDrugName }));
    }
  }

  function handleDelete(drugId) {
    const updatedDrugs = selectDrugs.filter((drug) => drug.id !== drugId);
    setSelectDrugs(updatedDrugs);
  }

  return (
    <div className='prescription'>
      <div className='data2'>
        <div className='title2'>
          <p>Add Prescription</p>
          <p id="name">
            {patient ? `${patient.name} / ${patient.id}` : "Patient not found"}
          </p>
        </div>
        <button className='add' style={{ width: "80px" }} onClick={handleSave}>
          Save
        </button>
      </div>

      <hr id="split" />
      <Errormodal isvisible={modal} errormessage={error} />

      <div className='pres-data1'>
        <div className='provider'>
          <label htmlFor="provider">Provider</label>
          <select
            id="provider"
            value={prescription.doctorId}
            onChange={(e) => setPrescription({ ...prescription, doctorId: e.target.value })}
          >
            <option value="">Select Provider</option>
            {doctors.map(doctor => (
              <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
            ))}
          </select>
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
            <select
              id="status"
              value={prescription.status}
              onChange={(e) => setPrescription({ ...prescription, status: e.target.value })}
            >
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
              {drugs.map(drug => (
                <option key={drug.id} value={drug.name} />
              ))}
            </datalist>
          </div>
          <button
            className='add'
            disabled={
              !submit.drug || !submit.patientInstruct || !submit.expiration
            }
            onClick={handlesubmit}
            style={{ marginTop: "-5px" }}
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
          <input
            type="checkbox"
            id='checked'
            checked={prescription.allowSubstitution}
            onChange={(e) => setPrescription({ ...prescription, allowSubstitution: e.target.checked })}
          />
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
          <input
            className='instruction'
            id="pharmacy"
            value={prescription.pharmacyInstructions}
            onChange={(e) => setPrescription({ ...prescription, pharmacyInstructions: e.target.value })}
          />
        </div>
        <p id='para'>Selected Drugs</p>
        <hr id="split" />
      </div>

      <div className='selecteDrugs'>
        <table style={{ marginTop: "20px", width: "55%" }} className='table3'>
          <thead>
            <tr style={{ background: "rgba(216, 211, 211, 0.851)" }}>
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
  );
};

export default AddPrescriptionInfo;