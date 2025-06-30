// -----------------------------------------------nouran w reem --------------

import React, { useState, useEffect, useRef } from 'react';
import { __dictionnary } from '../variables_dict/dictionnary_en';
import $ from 'jquery';
import { useToothContext } from '../ToothStatus/ToothContext';
import { TeethController } from '../Structure/TeethController';
import dentalChartConfig from './dentalChartConfig.json';
import patientChartManager from '../utils/patientChartManager';

const Table1Down = (props) => {
  const { requestRedraw } = useToothContext();
  const canvasRef = useRef(null);
 
  const [teethController, setTeethController] = useState(null);
  const [upperTeeth, setUpperTeeth] = useState([]); // Will hold upper teeth for Table1Down
  const [gingivalDepths, setGingivalDepths] = useState({});
  const [probingDepths, setProbingDepths] = useState({});
  const [isChartReady, setIsChartReady] = useState(false);
  const { toothToRedraw } = useToothContext();

  const table1DownJson = dentalChartConfig.tables.find(t => t.name === "Table1Down");

  const [mobility, setMobility] = useState({});
  const [implant, setImplant] = useState({});
  const [bleedOnProbing, setBleedOnProbing] = useState({});
  const [plaque, setPlaque] = useState({});
  const [furcation, setFurcation] = useState({});

  // Initialize teeth controller
  useEffect(() => {
    if (canvasRef.current) {
      const canvas_id = `vrc_display${props.id}`;
      const ctl = new TeethController(props.id);
      ctl.initialise();
      setTeethController(ctl);
    }
  }, [props.id]);

  // Once teethController is ready, set up teeth data
  useEffect(() => {
    if (teethController) {
      setUpperTeeth(teethController.Charting.Maxilla.Teeth); // Table1Down uses upper teeth
      setIsChartReady(true);
    }
  }, [teethController]);

  // Set up gingival and probing depths once teeth data is ready
  useEffect(() => {
    if (isChartReady && upperTeeth.length > 0 && table1DownJson && teethController) {
      const initialGingivalDepths = {};
      const initialProbingDepths = {};
      const initialMobility = {};
      const initialImplant = {};
      const initialBOP = {};
      const initialPlaque = {};
      const initialFurcation = {};

      table1DownJson.teeth.forEach(tooth => {
        initialGingivalDepths[tooth.id] = tooth.gingival_depth;
        initialProbingDepths[tooth.id] = tooth.probing_depth;
        initialMobility[tooth.id] = tooth.mobility;
        initialImplant[tooth.id] = tooth.implant;
        initialBOP[tooth.id] = tooth.bleed_on_probing;
        initialPlaque[tooth.id] = tooth.plaque;
        initialFurcation[tooth.id] = tooth.furcation;
      });

      setGingivalDepths(initialGingivalDepths);
      setProbingDepths(initialProbingDepths);
      setMobility(initialMobility);
      setImplant(initialImplant);
      setBleedOnProbing(initialBOP);
      setPlaque(initialPlaque);
      setFurcation(initialFurcation);

      // Sync initial values to the actual Teeth objects
      table1DownJson.teeth.forEach(toothData => {
        const toothObj = teethController.Charting.Maxilla.Teeth.find(t => t?.Id === toothData.id);
        if (toothObj) {
          toothObj.m_GingivalMargin = { ...toothData.gingival_depth };
          toothObj.m_ProbingDepth = { ...toothData.probing_depth };
          toothObj.m_Mobility = toothData.mobility; // Set mobility
          toothObj.m_Implant = toothData.implant; // Set implant
          toothObj.m_BleedOnProbing = { ...toothData.bleed_on_probing }; // Set BOP
          toothObj.m_HasPlaque = { ...toothData.plaque }; // Set plaque
          toothObj.m_Furcation = { ...toothData.furcation }; // Set furcation
          // Explicitly redraw the tooth after updating its properties
          toothObj.draw(teethController.Charting.Maxilla.Context, false);
        }
      });

      // Redraw the chart after setting initial values
      // This might not be strictly necessary if individual tooth.draw() calls handle it
      // but keeping it for now as a fallback or for background elements.
      if (teethController.Charting.Maxilla) {
        teethController.Charting.Maxilla.drawBackground();
      }
    }
  }, [isChartReady, upperTeeth, table1DownJson, teethController]);

  // Handle redraw requests
  useEffect(() => {
    if (toothToRedraw && teethController) {
      const tooth = teethController.Charting.getTeethById(toothToRedraw);
      if (tooth) {
        redraw(toothToRedraw);
      }
    }
  }, [toothToRedraw, teethController]);

  // Sync click events between upper and lower teeth - not applicable for Table1Down, can remove or adjust if needed
    useEffect(() => {
    // if (!props.id2 || !teethController) return;
    // Example: If Table1Down needs to interact with another table's canvas
    // const otherTableCanvas = document.getElementById(`vrc_display${props.id2}`);
    // ... add interaction logic here ...
  }, [props.id2, teethController]);

  const handleImplantChange = (e, toothId) => {
    const isChecked = e.target.checked;
    setImplant(prev => ({ ...prev, [toothId]: isChecked }));

    const tooth = teethController.Charting.getTeethById(toothId);
    if (tooth) {
      tooth.m_Implant = isChecked;
      redraw(toothId);
    }

    // Save the change using patientChartManager
    if (patientChartManager && table1DownJson) {
      const updatedTableData = {
        ...table1DownJson,
        teeth: table1DownJson.teeth.map(t => 
          t.id === toothId ? { ...t, implant: isChecked } : t
        )
      };
      patientChartManager.updateTableData("Table1Down", updatedTableData);
    }
  };

  const handleMobilityChange = (e, toothId) => {
    const value = parseInt(e.target.value) || 0;
    setMobility(prev => ({ ...prev, [toothId]: value }));

    const tooth = teethController.Charting.getTeethById(toothId);
    if (tooth) {
      tooth.m_Mobility = value;
      redraw(toothId);
    }

    // Save the change using patientChartManager
    if (patientChartManager && table1DownJson) {
      const updatedTableData = {
        ...table1DownJson,
        teeth: table1DownJson.teeth.map(t => 
          t.id === toothId ? { ...t, mobility: value } : t
        )
      };
      patientChartManager.updateTableData("Table1Down", updatedTableData);
    }
  };

  const handleBOPChange = (e, toothId, position) => {
    const isChecked = e.target.checked;
    setBleedOnProbing(prev => ({
      ...prev,
      [toothId]: {
        ...prev[toothId],
        [position]: isChecked
      }
    }));

    const tooth = teethController.Charting.getTeethById(toothId);
    if (tooth) {
      tooth.m_BleedOnProbing = tooth.m_BleedOnProbing || { a: false, b: false, c: false };
      tooth.m_BleedOnProbing[position] = isChecked;
      redraw(toothId);
    }

    // Save the change using patientChartManager
    if (patientChartManager && table1DownJson) {
      const updatedTableData = {
        ...table1DownJson,
        teeth: table1DownJson.teeth.map(t => 
          t.id === toothId ? { 
            ...t, 
            bleed_on_probing: { 
              ...t.bleed_on_probing, 
              [position]: isChecked 
            } 
          } : t
        )
      };
      patientChartManager.updateTableData("Table1Down", updatedTableData);
    }
  };

  const handlePlaqueChange = (e, toothId, position) => {
    const isChecked = e.target.checked;
    setPlaque(prev => ({
    ...prev,
    [toothId]: {
      ...prev[toothId],
        [position]: isChecked
    }
  }));
  
    const tooth = teethController.Charting.getTeethById(toothId);
    if (tooth) {
      tooth.m_HasPlaque = tooth.m_HasPlaque || { a: false, b: false, c: false };
      tooth.m_HasPlaque[position] = isChecked;
      redraw(toothId);
    }

    // Save the change using patientChartManager
    if (patientChartManager && table1DownJson) {
      const updatedTableData = {
        ...table1DownJson,
        teeth: table1DownJson.teeth.map(t => 
          t.id === toothId ? { 
            ...t, 
            plaque: { 
              ...t.plaque, 
              [position]: isChecked 
            } 
          } : t
        )
      };
      patientChartManager.updateTableData("Table1Down", updatedTableData);
    }
  };

  const handleFurcationChange = (e, toothId, position) => {
    const value = parseInt(e.target.value) || 0;
    setFurcation(prev => ({
      ...prev,
      [toothId]: {
        ...prev[toothId],
        [position]: value
      }
    }));

  const tooth = teethController.Charting.getTeethById(toothId);
  if (tooth) {
      tooth.m_Furcation = tooth.m_Furcation || {};
      tooth.m_Furcation[position] = value;
    redraw(toothId);
  }

    // Save the change using patientChartManager
    if (patientChartManager && table1DownJson) {
      const updatedTableData = {
        ...table1DownJson,
        teeth: table1DownJson.teeth.map(t => 
          t.id === toothId ? { 
            ...t, 
            furcation: { 
              ...t.furcation, 
              [position]: value 
            } 
          } : t
        )
      };
      patientChartManager.updateTableData("Table1Down", updatedTableData);
    }
};

  const handleGingivalDepthChange = (toothId, position, value) => {
  const numValue = parseInt(value) || 0;
    setGingivalDepths(prev => ({
      ...prev,
      [toothId]: {
          ...prev[toothId],
          [position]: numValue
      }
  }));
  
      const tooth = teethController.Charting.getTeethById(toothId);
    if (tooth) {
      tooth.m_GingivalMargin = tooth.m_GingivalMargin || { a: 0, b: 0, c: 0 };
      tooth.m_GingivalMargin[position] = numValue;
      redraw(toothId);
    }

    // Save the change using patientChartManager
    if (patientChartManager && table1DownJson) {
      const updatedTableData = {
        ...table1DownJson,
        teeth: table1DownJson.teeth.map(t => 
          t.id === toothId ? { 
            ...t, 
            gingival_depth: { 
              ...t.gingival_depth, 
              [position]: numValue 
            } 
          } : t
        )
      };
      patientChartManager.updateTableData("Table1Down", updatedTableData);
    }
  };

  const handleProbingDepthChange = (toothId, position, value) => {
    const numValue = parseInt(value) || 0;
    setProbingDepths(prev => ({
      ...prev,
      [toothId]: {
        ...prev[toothId],
        [position]: numValue
      }
    }));

    const tooth = teethController.Charting.getTeethById(toothId);
    if (tooth) {
      tooth.m_ProbingDepth = tooth.m_ProbingDepth || { a: 0, b: 0, c: 0 };
      tooth.m_ProbingDepth[position] = numValue;
      redraw(toothId);
  }

    // Save the change using patientChartManager
    if (patientChartManager && table1DownJson) {
      const updatedTableData = {
        ...table1DownJson,
        teeth: table1DownJson.teeth.map(t => 
          t.id === toothId ? { 
            ...t, 
            probing_depth: { 
              ...t.probing_depth, 
              [position]: numValue 
            } 
          } : t
        )
      };
      patientChartManager.updateTableData("Table1Down", updatedTableData);
    }
};

    const redraw = (x) => {
        const tooth = teethController.Charting.getTeethById(x);
    if (tooth) {
      // Since Table1Down is for upper teeth (Maxilla), draw on Maxilla context
      teethController.Charting.Maxilla.drawBackground();
      // Consider if specific tooth redraw is sufficient, or if full background redraw is needed for all changes
    }
  };

  // Using upperTeeth to map over as Table1Down uses upper teeth
      return (
         <table className="table" style={{border: "none"}}>
           <tbody>
           <tr>
             <td className="table_title row_title"></td>
             <td colSpan="48">
               <div style={{width: '100%'}}>
              <canvas 
                ref={canvasRef}
                id={`vrc_display${props.id}`}
                width="1400"
                height="300"
                style={{
                  display: 'inline-block', 
                  width: '1400px', 
                  maxHeight: '100%',
                  backgroundColor: '#f9f9f9'
                }}
              >
                Your browser does not support the HTML5 canvas tag.
              </canvas>
               </div>
             </td>
           </tr>
           <tr>
          <td className="table_title row_title">{__dictionnary.mobility}</td>
          {upperTeeth.map(x => (
            <td key={`mobility-${x.Id}-${props.id}`} style={{whiteSpace: 'nowrap'}}>
       <input
                id={`mobility${x.Id}`+props.id}
         type="number"
                value={mobility[x.Id] !== undefined ? mobility[x.Id] : 0}
                onChange={e => handleMobilityChange(e, x.Id)}
                min="0"
                max="3"
              />
            </td>
          ))}
        </tr>
        <tr>
          <td className="table_title row_title">{__dictionnary.implant}</td>
          {upperTeeth.map(x => (
            <td key={`implant-${x.Id}-${props.id}`} style={{whiteSpace: 'nowrap'}}>
       <input
                id={`implant${x.Id}`+props.id}
                type="checkbox"
                checked={implant[x.Id] || false}
                onChange={e => handleImplantChange(e, x.Id)}
       />
     </td>
   ))}
           </tr>
        <tr>
          <td className="table_title row_title">{__dictionnary.furcation}</td>
          {upperTeeth.map(x => (
            <td key={`furcation-${x.Id}-${props.id}`} style={{whiteSpace: 'nowrap'}}>
              <input
                id={`furcation${x.Id}d`+props.id}
                type="number"
                value={furcation[x.Id]?.d !== undefined ? furcation[x.Id]?.d : ''}
                onChange={e => handleFurcationChange(e, x.Id, 'd')}
                min="0"
                max="3"
                placeholder="D"
                style={{
                  width: '30px',
                  height: '25px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  textAlign: 'center',
                  marginRight: '2px'
                }}
              />
              <input
                id={`furcation${x.Id}m`+props.id}
                type="number"
                value={furcation[x.Id]?.m !== undefined ? furcation[x.Id]?.m : ''}
                onChange={e => handleFurcationChange(e, x.Id, 'm')}
                min="0"
                max="3"
                placeholder="M"
                style={{
                  width: '30px',
                  height: '25px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  textAlign: 'center'
                }}
              />
            </td>
          ))}
        </tr>
        <tr className="cb bop">
   <td className="table_title row_title">{__dictionnary.bleed_on_probing}</td>
          {upperTeeth.map(x => (
            <td key={`bop-${x.Id}-${props.id}`}>
       <input 
         id={`bop${x.Id}a`+props.id} 
         type="checkbox" 
                checked={bleedOnProbing[x.Id]?.a || false}
                onChange={e => handleBOPChange(e, x.Id, 'a')}
              />
              <label htmlFor={`bop${x.Id}a`+props.id} className={bleedOnProbing[x.Id]?.a ? "checked" : ""}></label>
       <input 
         id={`bop${x.Id}b`+props.id} 
         type="checkbox" 
                checked={bleedOnProbing[x.Id]?.b || false}
                onChange={e => handleBOPChange(e, x.Id, 'b')}
              />
              <label htmlFor={`bop${x.Id}b`+props.id} className={bleedOnProbing[x.Id]?.b ? "checked" : ""}></label>	
       <input 
         id={`bop${x.Id}c`+props.id} 
         type="checkbox" 
                checked={bleedOnProbing[x.Id]?.c || false}
                onChange={e => handleBOPChange(e, x.Id, 'c')}
              />
              <label htmlFor={`bop${x.Id}c`+props.id} className={bleedOnProbing[x.Id]?.c ? "checked" : ""}></label>
     </td>
   ))}
 </tr>
 <tr className="cb plq">
   <td className="table_title row_title">{__dictionnary.plaque}</td>
          {upperTeeth.map(x => (
            <td key={`plq-${x.Id}-${props.id}`}>
       <input 
         id={`plq${x.Id}a` +props.id} 
         type="checkbox" 
                checked={plaque[x.Id]?.a || false}
                onChange={e => handlePlaqueChange(e, x.Id, 'a')}
              />
              <label htmlFor={`plq${x.Id}a`+props.id} className={plaque[x.Id]?.a ? "checked" : ""}></label>
       <input 
         id={`plq${x.Id}b` +props.id} 
         type="checkbox" 
                checked={plaque[x.Id]?.b || false}
                onChange={e => handlePlaqueChange(e, x.Id, 'b')}
              />
              <label htmlFor={`plq${x.Id}b`+props.id} className={plaque[x.Id]?.b ? "checked" : ""}></label>
       <input 
         id={`plq${x.Id}c` +props.id} 
         type="checkbox" 
                checked={plaque[x.Id]?.c || false}
                onChange={e => handlePlaqueChange(e, x.Id, 'c')}
              />
              <label htmlFor={`plq${x.Id}c`+props.id} className={plaque[x.Id]?.c ? "checked" : ""}></label>
     </td>
   ))}
 </tr>
        <tr>
          <td className="table_title row_title">{__dictionnary.gingival_depth}</td>
          {upperTeeth.map(x => (
            <td key={`gingival-${x.Id}-${props.id}`} style={{whiteSpace: 'nowrap'}}>
              <input
                id={`${x.Id}Ga`+props.id}
                size="1"
                type="number"
                value={gingivalDepths[x.Id]?.a !== undefined ? gingivalDepths[x.Id]?.a : ''}
                onChange={e => handleGingivalDepthChange(x.Id, 'a', e.target.value)}
                min="0"
                max="10"
              />
              <input
                id={`${x.Id}Gb`+props.id}
                size="1"
                type="number"
                value={gingivalDepths[x.Id]?.b !== undefined ? gingivalDepths[x.Id]?.b : ''}
                onChange={e => handleGingivalDepthChange(x.Id, 'b', e.target.value)}
                min="0"
                max="10"
              />
              <input
                id={`${x.Id}Gc`+props.id}
                size="1"
                type="number"
                value={gingivalDepths[x.Id]?.c !== undefined ? gingivalDepths[x.Id]?.c : ''}
                onChange={e => handleGingivalDepthChange(x.Id, 'c', e.target.value)}
                min="0"
                max="10"
              />
        </td>
          ))}
        </tr>
        <tr>
          <td className="table_title row_title">{__dictionnary.probing_depth}</td>
          {upperTeeth.map(x => (
            <td key={`probing-${x.Id}-${props.id}`} style={{whiteSpace: 'nowrap'}}>
              <input
                id={`${x.Id}a`+props.id}
                type="number"
                value={probingDepths[x.Id]?.a !== undefined ? probingDepths[x.Id]?.a : ''}
                onChange={e => handleProbingDepthChange(x.Id, 'a', e.target.value)}
                min="0"
                max="10"
              />
              <input
                id={`${x.Id}b`+props.id}
                type="number"
                value={probingDepths[x.Id]?.b !== undefined ? probingDepths[x.Id]?.b : ''}
                onChange={e => handleProbingDepthChange(x.Id, 'b', e.target.value)}
                min="0"
                max="10"
              />
              <input
                id={`${x.Id}c`+props.id}
                type="number"
                value={probingDepths[x.Id]?.c !== undefined ? probingDepths[x.Id]?.c : ''}
                onChange={e => handleProbingDepthChange(x.Id, 'c', e.target.value)}
                min="0"
                max="10"
              />
            </td>
          ))}
        </tr>
        <tr className="table_title teeth_num">
          <td></td>
          {upperTeeth.map(x => <td key={x.Id}>{x.Id}</td>)}
        </tr>
      </tbody>
    </table>      
  );
};

export default Table1Down;

