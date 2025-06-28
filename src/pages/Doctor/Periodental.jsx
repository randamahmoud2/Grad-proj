import React from 'react'
import Patientoption from '../../componenet/Doctorcomponent/ShowPatientData/Patientoption';
import PeriodentalChart from "../../componenet/Doctorcomponent/Periodentalchart/PeriodentalChart";

export const Docs = () => {
  return (
    <div>
      <Patientoption />
      <PeriodentalChart />
    </div>
  )
}

export default Docs;