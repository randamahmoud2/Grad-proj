import React from 'react'
import Patientoption from '../../componenet/Doctorcomponent/ShowPatientData/Patientoption';
import AddPrsecriptionInfo from "../../componenet/Doctorcomponent/Prescription/AddPrsecriptioninfo"

export const AddPrescription = () => {
    return (
        <div>
            <Patientoption />
            <AddPrsecriptionInfo />
        </div>
    )
}

export default AddPrescription;