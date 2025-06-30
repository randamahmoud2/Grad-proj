import React, { useState, useEffect, useRef } from 'react';
import { __dictionnary } from '../variables_dict/dictionnary_en.jsx';
import $ from 'jquery';
import { useToothContext } from '../ToothStatus/ToothContext';
import { TeethController } from '../Structure/TeethController';
import dentalChartConfig from './dentalChartConfig.json';
import patientChartManager from '../utils/patientChartManager';

const Table2Up = (props) => {
  const { requestRedraw } = useToothContext();
  const canvasRef = useRef(null);
 
  const [teethController, setTeethController] = useState(null);
  const [lowerTeeth, setLowerTeeth] = useState([]);
  const [gingivalDepths, setGingivalDepths] = useState({});
  const [probingDepths, setProbingDepths] = useState({});
  const [isChartReady, setIsChartReady] = useState(false);
  const { toothToRedraw } = useToothContext();

  const table2UpJson = dentalChartConfig.tables.find(t => t.name === "Table2Up");

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
      setLowerTeeth(teethController.Charting.Mandibula.Teeth);
      setIsChartReady(true);
    }
  }, [teethController]);

  // Set up initial values
  useEffect(() => {
    if (isChartReady && lowerTeeth.length > 0 && table2UpJson && teethController) {
      const initialGingivalDepths = {};
      const initialProbingDepths = {};
      const initialMobility = {};
      const initialImplant = {};
      const initialBOP = {};
      const initialPlaque = {};
      const initialFurcation = {};

      table2UpJson.teeth.forEach(tooth => {
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
      table2UpJson.teeth.forEach(toothData => {
        const toothObj = teethController.Charting.Mandibula.Teeth.find(t => t?.Id === toothData.id);
        if (toothObj) {
          toothObj.m_GingivalMargin = { ...toothData.gingival_depth };
          toothObj.m_ProbingDepth = { ...toothData.probing_depth };
          toothObj.m_Mobility = toothData.mobility;
          toothObj.m_Implant = toothData.implant;
          toothObj.m_BleedOnProbing = { ...toothData.bleed_on_probing };
          toothObj.m_HasPlaque = { ...toothData.plaque };
          toothObj.m_Furcation = toothData.furcation;
          toothObj.draw(teethController.Charting.Mandibula.Context, false);
        }
      });

      if (teethController.Charting.Mandibula) {
        teethController.Charting.Mandibula.drawBackground();
      }
    }
  }, [isChartReady, lowerTeeth, table2UpJson, teethController]);

  const handleImplantChange = (e, toothId) => {
    const isChecked = e.target.checked;
    setImplant(prev => ({ ...prev, [toothId]: isChecked }));

    const tooth = teethController.Charting.getTeethById(toothId);
    if (tooth) {
      tooth.m_Implant = isChecked;
      redraw(toothId);
    }

    // Save the change using patientChartManager
    if (patientChartManager && table2UpJson) {
      const updatedTableData = {
        ...table2UpJson,
        teeth: table2UpJson.teeth.map(t => 
          t.id === toothId ? { ...t, implant: isChecked } : t
        )
      };
      patientChartManager.updateTableData("Table2Up", updatedTableData);
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
    if (patientChartManager && table2UpJson) {
      const updatedTableData = {
        ...table2UpJson,
        teeth: table2UpJson.teeth.map(t => 
          t.id === toothId ? { ...t, mobility: value } : t
        )
      };
      patientChartManager.updateTableData("Table2Up", updatedTableData);
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
    if (patientChartManager && table2UpJson) {
      const updatedTableData = {
        ...table2UpJson,
        teeth: table2UpJson.teeth.map(t => 
          t.id === toothId ? { 
            ...t, 
            bleed_on_probing: { 
              ...t.bleed_on_probing, 
              [position]: isChecked 
            } 
          } : t
        )
      };
      patientChartManager.updateTableData("Table2Up", updatedTableData);
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
    if (patientChartManager && table2UpJson) {
      const updatedTableData = {
        ...table2UpJson,
        teeth: table2UpJson.teeth.map(t => 
          t.id === toothId ? { 
            ...t, 
            plaque: { 
              ...t.plaque, 
              [position]: isChecked 
            } 
          } : t
        )
      };
      patientChartManager.updateTableData("Table2Up", updatedTableData);
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
    if (patientChartManager && table2UpJson) {
      const updatedTableData = {
        ...table2UpJson,
        teeth: table2UpJson.teeth.map(t => 
          t.id === toothId ? { 
            ...t, 
            furcation: { 
              ...t.furcation, 
              [position]: value 
            } 
          } : t
        )
      };
      patientChartManager.updateTableData("Table2Up", updatedTableData);
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
    if (patientChartManager && table2UpJson) {
      const updatedTableData = {
        ...table2UpJson,
        teeth: table2UpJson.teeth.map(t => 
          t.id === toothId ? { 
            ...t, 
            gingival_depth: { 
              ...t.gingival_depth, 
              [position]: numValue 
            } 
          } : t
        )
      };
      patientChartManager.updateTableData("Table2Up", updatedTableData);
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
    if (patientChartManager && table2UpJson) {
      const updatedTableData = {
        ...table2UpJson,
        teeth: table2UpJson.teeth.map(t => 
          t.id === toothId ? { 
            ...t, 
            probing_depth: { 
              ...t.probing_depth, 
              [position]: numValue 
            } 
          } : t
        )
      };
      patientChartManager.updateTableData("Table2Up", updatedTableData);
    }
  };

  const redraw = (x) => {
    if (!teethController) return;
    
    const tooth = teethController.Charting.getTeethById(x);
    if (!tooth) return;
    
    tooth.draw(teethController.Charting.Mandibula.Context, teethController.Charting.Mandibula.WireframeOnly, teethController.Charting);
  };

  return (
    <table className="table" style={{border: "none"}}>
      <tbody>
        <tr className="table_title teeth_num">
          <td></td>
          {lowerTeeth.map(x => <td key={x.Id}>{x.Id}</td>)}
        </tr>
        <tr>
          <td className="table_title row_title">{__dictionnary.mobility}</td>
          {lowerTeeth.map(x => (
            <td key={`mobility-${x.Id}`}>
              <input
                id={`mob${x.Id}`+props.id}
                type="number"
                value={mobility[x.Id] || 0}
                onChange={e => handleMobilityChange(e, x.Id)}
                min="0"
                max="3"
              />
            </td>
          ))}
        </tr>
        <tr>
          <td className="table_title row_title">{__dictionnary.implant}</td>
          {lowerTeeth.map(x => (
            <td key={`implant-${x.Id}`}>
              <input
                id={`imp${x.Id}`+props.id}
                type="checkbox"
                checked={implant[x.Id] || false}
                onChange={e => handleImplantChange(e, x.Id)}
              />
            </td>
          ))}
        </tr>
        <tr className="furca">
          <td className="table_title row_title">{__dictionnary.furcation}</td>
          {lowerTeeth.map(x => (
            <td key={`furcation-${x.Id}`} style={{whiteSpace: 'nowrap'}}>
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
          {lowerTeeth.map(x => (
            <td key={`bleed-${x.Id}`} style={{whiteSpace: 'nowrap'}}>
              <input 
                id={`blp${x.Id}a` +props.id} 
                type="checkbox" 
                checked={bleedOnProbing[x.Id]?.a ?? false}
                onChange={e => handleBOPChange(e, x.Id, 'a')}
              />
              <label htmlFor={`blp${x.Id}a` +props.id} className={bleedOnProbing[x.Id]?.a ? "checked" : ""}></label>
              <input 
                id={`blp${x.Id}b` +props.id} 
                type="checkbox" 
                checked={bleedOnProbing[x.Id]?.b ?? false}
                onChange={e => handleBOPChange(e, x.Id, 'b')}
              />
              <label htmlFor={`blp${x.Id}b` +props.id} className={bleedOnProbing[x.Id]?.b ? "checked" : ""}></label>
              <input 
                id={`blp${x.Id}c` +props.id} 
                type="checkbox" 
                checked={bleedOnProbing[x.Id]?.c ?? false}
                onChange={e => handleBOPChange(e, x.Id, 'c')}
              />
              <label htmlFor={`blp${x.Id}c` +props.id} className={bleedOnProbing[x.Id]?.c ? "checked" : ""}></label>
            </td>
          ))}
        </tr>
        <tr className="cb plq">
          <td className="table_title row_title">{__dictionnary.plaque}</td>
          {lowerTeeth.map(x => (
            <td key={`plaque-${x.Id}`} style={{whiteSpace: 'nowrap'}}>
              <input 
                id={`plq${x.Id}a` +props.id} 
                type="checkbox" 
                checked={plaque[x.Id]?.a ?? false}
                onChange={e => handlePlaqueChange(e, x.Id, 'a')}
              />
              <label htmlFor={`plq${x.Id}a` +props.id} className={plaque[x.Id]?.a ? "checked" : ""}></label>
              <input 
                id={`plq${x.Id}b` +props.id} 
                type="checkbox" 
                checked={plaque[x.Id]?.b ?? false}
                onChange={e => handlePlaqueChange(e, x.Id, 'b')}
              />
              <label htmlFor={`plq${x.Id}b` +props.id} className={plaque[x.Id]?.b ? "checked" : ""}></label>
              <input 
                id={`plq${x.Id}c` +props.id} 
                type="checkbox" 
                checked={plaque[x.Id]?.c ?? false}
                onChange={e => handlePlaqueChange(e, x.Id, 'c')}
              />
              <label htmlFor={`plq${x.Id}c` +props.id} className={plaque[x.Id]?.c ? "checked" : ""}></label>
            </td>
          ))}
        </tr>
        <tr>
          <td className="table_title row_title">{__dictionnary.gingival_depth}</td>
          {lowerTeeth.map(x => (
            <td key={`gingival-${x.Id}`} style={{whiteSpace: 'nowrap'}}>
              <input
                id={`${x.Id}Ga`+props.id}
                size="1"
                type="number"
                value={gingivalDepths[x.Id]?.a || 0}
                onChange={e => handleGingivalDepthChange(x.Id, 'a', e.target.value)}
              />
              <input
                id={`${x.Id}Gb`+props.id}
                size="1"
                type="number"
                value={gingivalDepths[x.Id]?.b || 0}
                onChange={e => handleGingivalDepthChange(x.Id, 'b', e.target.value)}
              />
              <input
                id={`${x.Id}Gc`+props.id}
                size="1"
                type="number"
                value={gingivalDepths[x.Id]?.c || 0}
                onChange={e => handleGingivalDepthChange(x.Id, 'c', e.target.value)}
              />
            </td>
          ))}
        </tr>
        <tr>
          <td className="table_title row_title">{__dictionnary.probing_depth}</td>
          {lowerTeeth.map(x => (
            <td key={`probing-${x.Id}`} style={{whiteSpace: 'nowrap'}}>
              <input
                id={`${x.Id}a`+props.id}
                type="number"
                value={probingDepths[x.Id]?.a || 0}
                onChange={e => handleProbingDepthChange(x.Id, 'a', e.target.value)}
              />
              <input
                id={`${x.Id}b`+props.id}
                type="number"
                value={probingDepths[x.Id]?.b || 0}
                onChange={e => handleProbingDepthChange(x.Id, 'b', e.target.value)}
              />
              <input
                id={`${x.Id}c`+props.id}
                type="number"
                value={probingDepths[x.Id]?.c || 0}
                onChange={e => handleProbingDepthChange(x.Id, 'c', e.target.value)}
              />
            </td>
          ))}
        </tr>
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
      </tbody>
    </table>
  );
};

export default Table2Up;