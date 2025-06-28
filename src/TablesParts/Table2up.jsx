import React, { useState, useEffect, useRef } from 'react';
import { __dictionnary } from '../variables_dict/dictionnary_en';
import $ from 'jquery';
import { useToothContext } from '../ToothStatus/ToothContext';
import { TeethController } from '../Structure/TeethController';

const Table2Up = (props) => {
  const { requestRedraw } = useToothContext();
  const canvasRef = useRef(null);
 
  const [teethController, setTeethController] = useState(null);
  const [upperTeeth1, setUpperTeeth1] = useState([]);
  const [lowerTeeth1, setLowerTeeth1] = useState([]);
  const [gingivalDepths1, setGingivalDepths1] = useState({});
  const [probingDepths1, setProbingDepths1] = useState({});
  const [gingivalDepths2, setGingivalDepths2] = useState({});
  const [probingDepths2, setProbingDepths2] = useState({});
  const [isChartReady, setIsChartReady] = useState(false);
  const { toothToRedraw } = useToothContext();

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
      setUpperTeeth1(teethController.Charting.Maxilla.Teeth);
      setLowerTeeth1(teethController.Charting.Mandibula.Teeth);
      setIsChartReady(true);
    }
  }, [teethController]);

  // Set up gingival and probing depths once teeth data is ready
  useEffect(() => {
    if (isChartReady) {
      const initialGingivalDepths1 = {};
      const initialProbingDepths1 = {};
      const initialGingivalDepths2 = {};
      const initialProbingDepths2 = {};

      upperTeeth1.forEach(tooth => {
        if (tooth?.Id) {
          initialGingivalDepths1[tooth.Id] = {
            a: tooth.m_GingivalMargin.a,
            b: tooth.m_GingivalMargin.b,
            c: tooth.m_GingivalMargin.c
          };
          initialProbingDepths1[tooth.Id] = {
            a: tooth.m_ProbingDepth.a,
            b: tooth.m_ProbingDepth.b,
            c: tooth.m_ProbingDepth.c
          };
        }
      });

      lowerTeeth1.forEach(tooth => {
        if (tooth?.Id) {
          initialGingivalDepths2[tooth.Id] = {
            a: tooth.m_GingivalMargin.a,
            b: tooth.m_GingivalMargin.b,
            c: tooth.m_GingivalMargin.c
          };
          initialProbingDepths2[tooth.Id] = {
            a: tooth.m_ProbingDepth.a,
            b: tooth.m_ProbingDepth.b,
            c: tooth.m_ProbingDepth.c
          };
        }
      });

      setGingivalDepths1(initialGingivalDepths1);
      setProbingDepths1(initialProbingDepths1);
      setGingivalDepths2(initialGingivalDepths2);
      setProbingDepths2(initialProbingDepths2);
    }
  }, [isChartReady, upperTeeth1, lowerTeeth1]);

  // Handle redraw requests
  useEffect(() => {
    if (toothToRedraw && teethController) {
      const tooth = teethController.Charting.getTeethById(toothToRedraw);
      if (tooth) {
        redraw(toothToRedraw);
      }
    }
  }, [toothToRedraw, teethController]);

  // Sync click events between upper and lower teeth
  useEffect(() => {
    if (!props.id2 || !teethController) return;

    const upperToothCanvas = document.getElementById(`vrc_display${props.id}`);
    const lowerToothCanvas = document.getElementById(`vrc_display${props.id2}`);

    if (!upperToothCanvas || !lowerToothCanvas) return;

    const handleUpperClick = (event) => {
      if (event.isTrusted) {
        const rect = upperToothCanvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const simulatedClick = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: rect.left + x,
          clientY: rect.top + y
        });

        lowerToothCanvas.dispatchEvent(simulatedClick);
      }
    };

    upperToothCanvas.addEventListener('click', handleUpperClick);
    return () => {
      upperToothCanvas.removeEventListener('click', handleUpperClick);
    };
  }, [props.id, props.id2, teethController]);

  const handleImplantChange = (e, tooth) => {
    const isImplant = e.target.checked;
    tooth.m_Implant = isImplant;
    redraw(tooth.Id);
    requestRedraw(tooth.Id, { m_Implant: isImplant });
  };

  const handleCheckBtnClick = (event) => {
    const $button = $(event.currentTarget);
    const isChecked = $button.hasClass('checked');
    
    $button.toggleClass('checked');
    const newState = $button.hasClass('checked');
    $button.css('background-color', newState ? 'green' : 'lightblue');
    
    const toothId = event.currentTarget.id.replace(`implant-`, '').replace(props.id, '');
    requestRedraw(toothId);
  };

  const cycleFurca = (x) => {
    if (teethController) {
      teethController.Charting.cycle_furcState(x);
    }
  };

  const handleGingivalDepthChange1up = (toothId, position, value) => {
    setGingivalDepths1(prev => ({
      ...prev,
      [toothId]: {
        ...prev[toothId],
        [position]: parseInt(value) || 0
      }
    }));
    
    if (teethController) {
      const tooth = teethController.Charting.getTeethById(toothId);
      if (tooth) {
        tooth.m_GingivalMargin[position] = parseInt(value) || 0;
        redraw(toothId);
      }
    }
  };

  const handleProbingDepthChange1down = (toothId, position, value) => {
    const numValue = parseInt(value) || 0;
    
    setProbingDepths1(prev => ({
      ...prev,
      [toothId]: {
        ...prev[toothId],
        [position]: numValue
      }
    }));
    
    if (teethController) {
      try {
        const tooth = teethController.Charting.getTeethById(toothId);
        if (!tooth) {
          console.error(`Tooth ${toothId} not found`);
          return;
        }
        
        if (!tooth.m_ProbingDepth) {
          tooth.m_ProbingDepth = { a: 0, b: 0, c: 0 };
        }
        
        tooth.m_ProbingDepth[position] = numValue;
        redraw(toothId);
      } catch (error) {
        console.error('Error updating probing depth:', error);
      }
    }
  };

  const redraw = (x) => {
    if (!teethController) return;
    
    const tooth = teethController.Charting.getTeethById(x);
    if (!tooth) return;
    
    if (tooth.Id > 30) {
      tooth.draw(teethController.Charting.Mandibula.Context, teethController.Charting.Mandibula.WireframeOnly, teethController.Charting);
    } else {
      tooth.draw(teethController.Charting.Maxilla.Context, teethController.Charting.Mandibula.WireframeOnly, teethController.Charting);
    }
  };

  

return (
   
         <table className="table1" style={{border: "none"}}>
           <tbody>

             <tr className="table_title teeth_num">
               <td></td>
               {lowerTeeth1.map(x => <td key={x.Id}>{x.Id}</td>)}
             </tr>
             <tr>
               <td className="table_title row_title">{__dictionnary.mobility}</td>
               {lowerTeeth1.map(x => (
                 <td key={`mobility-${x.Id}`}>
                   <input type="number" defaultValue="0" s/>
                 </td>
             ))}
           </tr>
           <tr>
             <td className="table_title row_title">{__dictionnary.implant}</td>
             {lowerTeeth1.map(x => (
             <td key={`implant-${x.Id+props.id}`}>
             <input 
                data-all_checkbtn={`Table${props.id}up_checkbtn`}

                 id={`implant-${x.Id+props.id}`}
                 type="checkbox" 
                 onChange={e => handleImplantChange(e, x)}
                  style={{marginLeft:"30px"}}
                 className={x.m_Implant ? "plq-checkbox checked" : "plq-checkbox"}
             />
             <label htmlFor={`implant-${x.Id}`} className={x.m_Implant ? "checked" : ""}></label>
             </td>
             ))}
           </tr>
         <tr className="furca">
                     <td className="table_title row_title">{__dictionnary.furcation}</td>
                     <td><div  style={{marginLeft:"6px"}} onClick={() => cycleFurca(18+props.id)} id={"furca18"+props.id} className="box"></div></td>
                     <td><div  style={{marginLeft:"6px"}} onClick={() => cycleFurca(17+props.id)} id={"furca17"+props.id} className="box"></div></td>
                     <td><div  style={{marginLeft:"6px"}} onClick={() => cycleFurca(16+props.id)} id={"furca16"+props.id} className="box"></div></td>
                     <td></td>
                     <td><div  style={{marginLeft:"6px"}} onClick={() => cycleFurca(14+props.id)} id={ "furca14" + props.id} className="box"></div></td>
                     <td></td>
                     <td></td>
                     <td></td>
                     <td></td>
                     <td></td>
                     <td></td>
                     <td><div  style={{marginLeft:"6px"}} onClick={() => cycleFurca(24+props.id)} id={ "furca24" + props.id} className="box"></div></td>
                     <td></td>
                     <td><div  style={{marginLeft:"6px"}} onClick={() => cycleFurca(26+props.id)} id={ "furca26" + props.id} className="box"></div></td>
                     <td><div  style={{marginLeft:"6px"}} onClick={() => cycleFurca(27+props.id)} id={ "furca27" + props.id} className="box"></div></td>
                     <td><div  style={{marginLeft:"6px"}} onClick={() => cycleFurca(28+props.id)} id={ "furca28" + props.id} className="box"></div></td>
                   </tr>
        
 
         <tr className="cb bop">
   <td className="table_title row_title">{__dictionnary.bleed_on_probing}</td>
   {lowerTeeth1.map(x => (
     <td key={`bop-${x.Id}`+props.id}>
       <input 
         id={`bop${x.Id}a`+props.id} 
         type="checkbox" 
         onChange={e => {
           x.m_BleedOnProbing.a = e.target.checked;
           redraw(x.Id);
         }}
       />
       <label htmlFor={`bop${x.Id}a`+props.id} className={x.m_BleedOnProbing.a ? "checked" : ""}></label>
       <input 
         id={`bop${x.Id}b`+props.id} 
         type="checkbox" 
         onChange={e => {
           x.m_BleedOnProbing.b = e.target.checked;
           redraw(x.Id);
         }}
       />
       <label htmlFor={`bop${x.Id}b`+props.id} className={x.m_BleedOnProbing.b ? "checked" : ""}></label>	
       <input 
         id={`bop${x.Id}c`+props.id} 
         type="checkbox" 
         onChange={e => {
           x.m_BleedOnProbing.c = e.target.checked;
           redraw(x.Id);
         }}
       />
       <label htmlFor={`bop${x.Id}c`+props.id} className={x.m_BleedOnProbing.c ? "checked" : ""}></label>
     </td>
   ))}
 </tr>




 <tr className="cb plq">
   <td className="table_title row_title">{__dictionnary.plaque}</td>
   {lowerTeeth1.map(x => (
     <td key={`plq-${x.Id}` +props.id}>
       <input 
         id={`plq${x.Id}a` +props.id} 
         type="checkbox" 
         onChange={e => {
           x.m_HasPlaque.a = e.target.checked;
           redraw(x.Id);
         }}
       />
       <label htmlFor={`plq${x.Id}a` +props.id} className={x.m_HasPlaque.a ? "checked" : ""}></label>
       <input 
         id={`plq${x.Id}b` +props.id} 
         type="checkbox" 
         onChange={e => {
           x.m_HasPlaque.b = e.target.checked;
           redraw(x.Id);
         }}
       />
       <label htmlFor={`plq${x.Id}b` +props.id} className={x.m_HasPlaque.b ? "checked" : ""}></label>	
       <input 
         id={`plq${x.Id}c` +props.id} 
         type="checkbox" 
         onChange={e => {
           x.m_HasPlaque.c = e.target.checked;
           redraw(x.Id);
         }}
       />
       <label htmlFor={`plq${x.Id}c` +props.id} className={x.m_HasPlaque.c ? "checked" : ""}></label>
     </td>
   ))}
 </tr>
            <tr>
                        <td className="table_title row_title">{__dictionnary.gingival_depth}</td>
            {/* Here is the code that change the green line and the redline also */}
            {lowerTeeth1.map(x => (
                <td key={`gingival-${x.Id}`} style={{whiteSpace: 'nowrap'}}>
                  <input
                    id={`${x.Id}Ga`+props.id}
                    size="1"
                    type="number"
                    value={gingivalDepths1[x.Id]?.a || 0}
                    onChange={e => handleGingivalDepthChange1up(x.Id, 'a', e.target.value)}
                  />
                  <input
                    id={`${x.Id}Gb`+props.id}
                    size="1"
                    type="number"
                    value={gingivalDepths1[x.Id]?.b || 0}
                    onChange={e => handleGingivalDepthChange1up(x.Id, 'b', e.target.value)}
                  />
                  <input
                    id={`${x.Id}Gc`}
                    size="1"
                    type="number"
                    value={gingivalDepths1[x.Id]?.c || 0}
                    onChange={e => handleGingivalDepthChange1up(x.Id, 'c', e.target.value)}
                  />
                </td>
              ))}
            
            
                      </tr>
                 <tr>
                       <td className="table_title row_title">{__dictionnary.probing_depth}</td>
          
           {lowerTeeth1.map(x => (
               <td key={`probing-${x.Id+props.id}`} style={{whiteSpace: 'nowrap'}}>
                 <input
                   id={`${x.Id}a`+props.id}
                   type="number"
                   value={probingDepths1[x.Id]?.a || 0}
                   onChange={e => handleProbingDepthChange1down(x.Id, 'a', e.target.value)}
                 />
                 <input
                   id={`${x.Id}b`+props.id}
                   type="number"
                   value={probingDepths1[x.Id]?.b || 0}
                   onChange={e => handleProbingDepthChange1down(x.Id, 'b', e.target.value)}
                 />
                 <input
                   id={`${x.Id}c`+props.id}
                   type="number"
                   value={probingDepths1[x.Id]?.c || 0}
                   onChange={e => handleProbingDepthChange1down(x.Id, 'c', e.target.value)}
                 />
               </td>
             ))}
           
                     </tr>
          





















           <tr>
             <td className="table_title row_title"></td>
             <td colSpan="48">
               <div style={{width: '100%'}}>
                 <canvas ref={canvasRef} id={'vrc_display'+props.id} style={{display: 'inline-block', width: '1150px', maxHeight: '100%'}}></canvas>
               </div>
             </td>
           </tr>
    
         </tbody>
         </table>      

   );
  }
export default Table2Up;