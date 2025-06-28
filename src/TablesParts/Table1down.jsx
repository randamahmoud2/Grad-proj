import React, { useState, useEffect } from 'react';
import { __dictionnary } from '../variables_dict/dictionnary_en';
import { useToothContext } from '../ToothStatus/ToothContext';
import { TeethController } from '../Structure/TeethController';

const tooth_ids_upper1 = [];
const tooth_ids_lower1 = [];

const Table1Down = (props) => {
  const { toothState } = useToothContext();
  
  // Listen for redraw requests
  useEffect(() => {
    if (toothState.toothToRedraw) {
      const tooth = teethController.Charting.getTeethById(toothState.toothToRedraw);
      if (tooth) {
        // Update the tooth properties if any were passed
        if (toothState.updatedProperties.m_Implant !== undefined) {
          tooth.m_Implant = toothState.updatedProperties.m_Implant;
        }
        
        redraw(toothState.toothToRedraw);
      }
    }
  }, [toothState]);

  useEffect(() => {
    if (!props.id2) return;

    const upperToothCanvas = document.getElementById(`vrc_display${props.id}`);
    const lowerToothCanvas = document.getElementById(`vrc_display${props.id2}`);

    if (!upperToothCanvas || !lowerToothCanvas) return;

    const handleUpperClick = (event) => {
      // Only propagate if this is the original event (not a simulated one)
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
}, [props.id, props.id2]);


    const canvas_id = `vrc_display${props.id}`;
    const [teethController] = useState(new TeethController(props.id));

    const [upperTeeth1, setUpperTeeth1] = useState(tooth_ids_upper1);
    const [lowerTeeth1, setLowerTeeth1] = useState(tooth_ids_lower1);
    const [gingivalDepths1, setGingivalDepths1] = useState({});
    const [probingDepths1, setProbingDepths1] = useState({});

    const [gingivalDepths2, setGingivalDepths2] = useState({});
    const [probingDepths2, setProbingDepths2] = useState({});


    const [isChartReady, setIsChartReady] = useState(false);
    
    const cycleFurca = (x) => {
        teethController.Charting.cycle_furcState(x);
    };
    
    useEffect(() => {
        // Initialize after component mounts
        const timer = setTimeout(() => {
            teethController.initialise();
            
            setUpperTeeth1(teethController.Charting.Maxilla.Teeth);
            setLowerTeeth1(teethController.Charting.Mandibula.Teeth);

            
            setIsChartReady(true);
        }, 100); // Small delay to ensure DOM is ready
        
        return () => clearTimeout(timer);
    }, []);
    
    // Separate effect for component 1 (upperTeeth1 and lowerTeeth1)
    useEffect(() => {
        if (isChartReady) {

            const initialGingivalDepths1 = {};
            const initialProbingDepths1 = {};
            

            const initialGingivalDepths2 = {};
            const initialProbingDepths2 = {};
            // Process upper teeth for component 1
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


        } else {}
    }, [isChartReady, upperTeeth1,lowerTeeth1]);
    

// Handler functions for updating depths
const handleGingivalDepthChange1up = (toothId, position, value) => {

  setGingivalDepths1(prev => ({
    ...prev,
    [toothId]: {
      ...prev[toothId],
      [position]: parseInt(value) || 0
    }
  }));
  
  // Update the tooth object directly for immediate rendering
  const tooth = teethController.Charting.getTeethById(toothId);
  if (tooth) {
    tooth.m_GingivalMargin[position] = parseInt(value) || 0;
    redraw(toothId);
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
  
  try {
      const tooth = teethController.Charting.getTeethById(toothId);
      if (!tooth) {
          console.error(`Tooth ${toothId} not found`);
          return;
      }
      
      // Initialize probing depth if it doesn't exist
      if (!tooth.m_ProbingDepth) {
          tooth.m_ProbingDepth = { a: 0, b: 0, c: 0 };
      }
      
      tooth.m_ProbingDepth[position] = numValue;
      redraw(toothId);
  } catch (error) {
      console.error('Error updating probing depth:', error);
  }
};



    const redraw = (x) => {
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
           <tr>
             <td className="table_title row_title"></td>
             <td colSpan="48">
               <div style={{width: '100%'}}>
                 <canvas id={'vrc_display'+props.id} style={{display: 'inline-block', width: '1150px', maxHeight: '100%'}}></canvas>
               </div>
             </td>
           </tr>
           <tr>
             <td className="table_title row_title">{__dictionnary.probing_depth}</td>

 {upperTeeth1.map(x => (
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
             <td className="table_title row_title">{__dictionnary.gingival_depth}</td>
 {/* Here is the code that change the green line and the redline also */}
 {upperTeeth1.map(x => (
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


  <tr className="cb bop" >
   <td className="table_title row_title">{__dictionnary.bleed_on_probing}</td>
   {upperTeeth1.map(x => (
     <td key={`bop-${x.Id}`+props.id} >
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
   {upperTeeth1.map(x => (
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


      <tr className="furca">
				<td className="table_title row_title">{__dictionnary.furcation}</td>
        <td>
          <div onClick={() => cycleFurca(`_d18${props.id}`)} id={`furca_d18${props.id}`} className="box"></div>
          <div onClick={() => cycleFurca(`_m18${props.id}`)} id={`furca_m18${props.id}`} className="box"></div>
        </td>
        <td>
          <div onClick={() => cycleFurca(`_d17${props.id}`)} id={`furca_d17${props.id}`} className="box"></div>
          <div onClick={() => cycleFurca(`_m17${props.id}`)} id={`furca_m17${props.id}`} className="box"></div>
        </td>
        <td>
          <div onClick={() => cycleFurca(`_d16${props.id}`)} id={`furca_d16${props.id}`} className="box"></div>
          <div onClick={() => cycleFurca(`_m16${props.id}`)} id={`furca_m16${props.id}`} className="box"></div>
        </td>

        <td></td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
				<td></td>
        <td>
          <div onClick={() => cycleFurca(`_m26${props.id}`)} id={`furca_m26${props.id}`} className="box"></div>
          <div onClick={() => cycleFurca(`_d26${props.id}`)} id={`furca_d26${props.id}`} className="box"></div>
        </td>
        <td>
          <div onClick={() => cycleFurca(`_m27${props.id}`)} id={`furca_m27${props.id}`} className="box"></div>
          <div onClick={() => cycleFurca(`_d27${props.id}`)} id={`furca_d27${props.id}`} className="box"></div>
        </td>
        <td>
          <div onClick={() => cycleFurca(`_m28${props.id}`)} id={`furca_m28${props.id}`} className="box"></div>
          <div onClick={() => cycleFurca(`_d28${props.id}`)} id={`furca_d28${props.id}`} className="box"></div>
        </td>
      </tr>
      <tr className="table_title teeth_num">
        <td></td>
        {upperTeeth1.map(x => <td key={x.Id}>{x.Id}</td>)}
      </tr>
    </tbody>
  </table>      
  );
}
export default Table1Down;