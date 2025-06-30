// ----------------------------nouran w reem ------------------------------

import React, { useState, useEffect, useRef } from 'react';
import { __dictionnary } from '../variables_dict/dictionnary_en';
import $ from 'jquery';
import { useToothContext } from '../ToothStatus/ToothContext';
import { TeethController } from '../Structure/TeethController';
import dentalChartConfig from './dentalChartConfig.json';
import { parseVoiceCommand, postProcessTranscript } from '../utils/voiceCommandParser';
import { updateDentalChart } from '../utils/dentalChartUpdater';
import patientChartManager from '../utils/patientChartManager';

const Table1Up = (props) => {
  const { requestRedraw } = useToothContext();
  const canvasRef = useRef(null);
  const { patientChartManager } = props;
 
  const [teethController, setTeethController] = useState(null);
  const [upperTeeth1, setUpperTeeth1] = useState([]);
  const [lowerTeeth1, setLowerTeeth1] = useState([]);
  const [gingivalDepths1, setGingivalDepths1] = useState({});
  const [probingDepths1, setProbingDepths1] = useState({});
  const [gingivalDepths2, setGingivalDepths2] = useState({});
  const [probingDepths2, setProbingDepths2] = useState({});
  const [isChartReady, setIsChartReady] = useState(false);
  const { toothToRedraw } = useToothContext();

  // --- Enhanced Speech-to-text state and logic ---
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const socketRef = useRef(null);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const animationRef = useRef(null);

  // Use patient-specific chart data instead of static config
  const [table1UpJson, setTable1UpJson] = useState(null);

  const [mobility, setMobility] = useState({});
  const [implant, setImplant] = useState({});
  const [bleedOnProbing, setBleedOnProbing] = useState({});
  const [plaque, setPlaque] = useState({});
  const [furcation, setFurcation] = useState({});

  // Add state for voice command feedback
  const [commandFeedback, setCommandFeedback] = useState('');

  // Add state for current tooth
  const [currentToothId, setCurrentToothId] = useState(18);

  // Add state for navigation feedback
  const [navigationFeedback, setNavigationFeedback] = useState('');

  // Add state for last processed command
  const [lastProcessedCommand, setLastProcessedCommand] = useState('');
  const lastCommandTimeRef = useRef(0);

  // Load patient-specific chart data
  useEffect(() => {
    if (patientChartManager) {
      const chartData = patientChartManager.getCurrentChartData();
      if (chartData && chartData.tables) {
        const table1UpData = chartData.tables.find(t => t.name === "Table1Up");
        if (table1UpData) {
          setTable1UpJson(table1UpData);
        }
      }
    }
  }, [patientChartManager]);

  // Add helper function for tooth navigation feedback
  const getToothDescription = (toothId) => {
    const descriptions = {
      18: 'Upper Right Third Molar (Wisdom)',
      17: 'Upper Right Second Molar',
      16: 'Upper Right First Molar',
      15: 'Upper Right Second Premolar',
      14: 'Upper Right First Premolar',
      13: 'Upper Right Canine',
      12: 'Upper Right Lateral Incisor',
      11: 'Upper Right Central Incisor'
    };
    return descriptions[toothId] || `Tooth ${toothId}`;
  };

  // Add a function to update the dental chart data
  const updateDentalChartData =  (parsedCommand, tooth) => {
    if (!tooth || !table1UpJson) return null;

    // Get the current tooth data from the configuration
    const currentToothData = table1UpJson.teeth.find(t => t.id === parsedCommand.toothId);
    if (!currentToothData) return null;

    // Create a copy of the current tooth data
    const updatedToothData = { ...currentToothData };

    // Update only the specific field mentioned in the command
    if (parsedCommand.updateType === 'single') {
      // For single value fields like mobility and implant
      updatedToothData[parsedCommand.field] = parsedCommand.value;
      
      // Update the UI state
      if (parsedCommand.field === 'mobility') {
        setMobility(prev => ({
          ...prev,
          [parsedCommand.toothId]: parsedCommand.value
        }));
        tooth.mobility = parsedCommand.value;
      } else if (parsedCommand.field === 'implant') {
        setImplant(prev => ({
          ...prev,
          [parsedCommand.toothId]: parsedCommand.value
        }));
        tooth.m_Implant = parsedCommand.value;
      }
    } else if (parsedCommand.updateType === 'position') {
      // For fields with single position updates (a, b, or c)
      updatedToothData[parsedCommand.field][parsedCommand.position] = parsedCommand.value;
      
      // Update the UI state
      if (parsedCommand.field === 'bleed_on_probing') {
        setBleedOnProbing(prev => ({
          ...prev,
          [parsedCommand.toothId]: {
            ...(prev[parsedCommand.toothId] || {}),
            [parsedCommand.position]: parsedCommand.value
          }
        }));
        tooth.m_BleedOnProbing[parsedCommand.position] = parsedCommand.value;
      } else if (parsedCommand.field === 'plaque') {
        setPlaque(prev => ({
          ...prev,
          [parsedCommand.toothId]: {
            ...(prev[parsedCommand.toothId] || {}),
            [parsedCommand.position]: parsedCommand.value
          }
        }));
        tooth.m_HasPlaque[parsedCommand.position] = parsedCommand.value;
      } else if (parsedCommand.field === 'gingival_depth') {
        setGingivalDepths1(prev => ({
          ...prev,
          [parsedCommand.toothId]: {
            ...(prev[parsedCommand.toothId] || {}),
            [parsedCommand.position]: parsedCommand.value
          }
        }));
        tooth.m_GingivalMargin[parsedCommand.position] = parsedCommand.value;
      } else if (parsedCommand.field === 'probing_depth') {
        setProbingDepths1(prev => ({
          ...prev,
          [parsedCommand.toothId]: {
            ...(prev[parsedCommand.toothId] || {}),
            [parsedCommand.position]: parsedCommand.value
          }
        }));
        tooth.m_ProbingDepth[parsedCommand.position] = parsedCommand.value;
      }
    } else if (parsedCommand.updateType === 'all_positions') {
      // For updating all positions at once (a, b, c)
      updatedToothData[parsedCommand.field] = parsedCommand.values;
      
      // Update the UI state
      if (parsedCommand.field === 'gingival_depth') {
        setGingivalDepths1(prev => ({
          ...prev,
          [parsedCommand.toothId]: parsedCommand.values
        }));
        tooth.m_GingivalMargin = { ...parsedCommand.values };
      } else if (parsedCommand.field === 'probing_depth') {
        setProbingDepths1(prev => ({
          ...prev,
          [parsedCommand.toothId]: parsedCommand.values
        }));
        tooth.m_ProbingDepth = { ...parsedCommand.values };
      }
    }

    // Update the patient chart manager with the new data
    if (patientChartManager) {
      const updatedTableData = {
        ...table1UpJson,
        teeth: table1UpJson.teeth.map(t => 
          t.id === parsedCommand.toothId ? updatedToothData : t
        )
      };
      patientChartManager.updateTableData("Table1Up", updatedTableData);
    }

    return updatedToothData;
  };

  // Modify the WebSocket onmessage handler
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:5000/transcribe');
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      socketRef.current = ws;
    };

    ws.onmessage = async (event) => {
      if (event.data.trim()) {
        // Post-process the transcript before parsing
        const rawTranscript = event.data.trim().toLowerCase();
        const newTranscript = postProcessTranscript(rawTranscript);
        
        // Debug logging
        console.log('Normalized transcript:', newTranscript);
        
        // Debounce and check for duplicate commands
        const now = Date.now();
        if (newTranscript === lastProcessedCommand && now - lastCommandTimeRef.current < 2000) {
          return; // Skip if same command within 2 seconds
        }
        
        setTranscript(prev => prev + ' ' + newTranscript);
        
        // Parse and handle voice command
        const parsedCommand = parseVoiceCommand(newTranscript, currentToothId);
        // Debug logging
        console.log('Parsed command:', parsedCommand);
        if (parsedCommand) {
          try {
            // Update last processed command
            setLastProcessedCommand(newTranscript);
            lastCommandTimeRef.current = now;
            
            // Handle navigation commands
            if (parsedCommand.type === 'navigation' || parsedCommand.type === 'navigation_limit') {
              if (parsedCommand.type === 'navigation_limit') {
                setNavigationFeedback(parsedCommand.message);
                return;
              }

              const prevTooth = getToothDescription(parsedCommand.currentToothId);
              const nextTooth = getToothDescription(parsedCommand.nextToothId);
              
              setCurrentToothId(parsedCommand.nextToothId);
              setNavigationFeedback(
                `Moving ${parsedCommand.direction}: ${prevTooth} → ${nextTooth}`
              );
              
              // Clear navigation feedback after 3 seconds
              setTimeout(() => {
                setNavigationFeedback('');
              }, 3000);
              
              return;
            }

            // Rest of the command handling logic...
            const tooth = teethController.Charting.getTeethById(parsedCommand.toothId);
            if (tooth) {
              const updatedToothData = updateDentalChartData(parsedCommand, tooth);
              if (updatedToothData) {
                redraw(parsedCommand.toothId);
                setCommandFeedback(`Updated tooth ${parsedCommand.toothId}: ${parsedCommand.field} ${parsedCommand.position || ''}`);
              }
            }
          } catch (error) {
            console.error('Error handling voice command:', error);
            setCommandFeedback('Error processing command');
          }
        }
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [currentToothId, teethController, lastProcessedCommand]);

  const startRecording = async () => {
    try {
      setTranscript("");
      
      // Setup audio context
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000
      });
      
      // Get microphone stream with optimal settings
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });
      mediaStreamRef.current = stream;
      
      // Create processor node
      processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      // Set up volume analyzer
      const analyser = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 32;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const analyzeVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setVolumeLevel(avg);
        animationRef.current = requestAnimationFrame(analyzeVolume);
      };
      analyzeVolume();
      
      processorRef.current.onaudioprocess = (e) => {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
        
        // Convert Float32 to Int16
        const inputData = e.inputBuffer.getChannelData(0);
        const output = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          output[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
        }
        
        // Send raw audio data
        socketRef.current.send(output);
      };
      
      // Connect nodes
      const sourceNode = audioContextRef.current.createMediaStreamSource(stream);
      sourceNode.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);
      
      setIsRecording(true);

    } catch (error) {
      console.error('Error starting recording:', error);
      setTranscript('Error: ' + error.message);
    }
  };

  const stopRecording = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsRecording(false);
    setVolumeLevel(0);
  };

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
    if (isChartReady && upperTeeth1.length > 0 && table1UpJson && teethController) {
      const initialGingivalDepths1 = {};
      const initialProbingDepths1 = {};
      const initialMobility = {};
      const initialImplant = {};
      const initialBOP = {};
      const initialPlaque = {};
      const initialFurcation = {};

      table1UpJson.teeth.forEach(tooth => {
        initialGingivalDepths1[tooth.id] = tooth.gingival_depth || { a: 0, b: 0, c: 0 };
        initialProbingDepths1[tooth.id] = tooth.probing_depth || { a: 0, b: 0, c: 0 };
        initialMobility[tooth.id] = tooth.mobility || 0;
        initialImplant[tooth.id] = tooth.implant || false;
        initialBOP[tooth.id] = tooth.bleed_on_probing || { a: false, b: false, c: false };
        initialPlaque[tooth.id] = tooth.plaque || { a: false, b: false, c: false };
        initialFurcation[tooth.id] = tooth.furcation || { m: 0, d: 0, c: 0 };
      });

      setGingivalDepths1(initialGingivalDepths1);
      setProbingDepths1(initialProbingDepths1);
      setMobility(initialMobility);
      setImplant(initialImplant);
      setBleedOnProbing(initialBOP);
      setPlaque(initialPlaque);
      setFurcation(initialFurcation);

      // Sync initial values to the actual Teeth objects
      table1UpJson.teeth.forEach(toothData => {
        const toothObj = teethController.Charting.Maxilla.Teeth.find(t => t?.Id === toothData.id);
        if (toothObj) {
          toothObj.m_GingivalMargin = { ...(toothData.gingival_depth || { a: 0, b: 0, c: 0 }) };
          toothObj.m_ProbingDepth = { ...(toothData.probing_depth || { a: 0, b: 0, c: 0 }) };
          toothObj.m_Mobility = toothData.mobility || 0;
          toothObj.m_Implant = toothData.implant || false;
          toothObj.m_BleedOnProbing = { ...(toothData.bleed_on_probing || { a: false, b: false, c: false }) };
          toothObj.m_HasPlaque = { ...(toothData.plaque || { a: false, b: false, c: false }) };
          toothObj.m_Furcation = { ...(toothData.furcation || { m: 0, d: 0, c: 0 }) };
          toothObj.draw(teethController.Charting.Maxilla.Context, false);
        }
      });

      // Redraw the chart after setting initial values
      if (teethController.Charting.Maxilla) {
        teethController.Charting.Maxilla.drawBackground();
      }
    }
  }, [isChartReady, upperTeeth1, table1UpJson, teethController]);

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
    
    // Update patient chart manager
    if (patientChartManager) {
      patientChartManager.updateToothData(tooth.Id, { implant: isImplant });
    }
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
    const numValue = parseInt(value) || 0;
    
    setGingivalDepths1(prev => ({
      ...prev,
      [toothId]: {
        ...prev[toothId],
        [position]: numValue
      }
    }));
    
    if (teethController) {
      const tooth = teethController.Charting.getTeethById(toothId);
      const chartTooth = teethController.Charting.Maxilla.Teeth.find(t => t?.Id === toothId);
      console.log('Handler tooth === chartTooth?', tooth === chartTooth, tooth, chartTooth);
      if (tooth) {
        tooth.m_GingivalMargin[position] = numValue;
        redraw(toothId);
        if (teethController && teethController.Charting && teethController.Charting.Maxilla) {
          teethController.Charting.Maxilla.drawBackground();
        }
      }
    }
    
    // Update patient chart manager
    if (patientChartManager) {
      const currentDepths = gingivalDepths1[toothId] || { a: 0, b: 0, c: 0 };
      const updatedDepths = { ...currentDepths, [position]: numValue };
      patientChartManager.updateToothData(toothId, { gingival_depth: updatedDepths });
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
        const chartTooth = teethController.Charting.Maxilla.Teeth.find(t => t?.Id === toothId);
        console.log('Handler tooth === chartTooth?', tooth === chartTooth, tooth, chartTooth);
        if (!tooth) {
          console.error(`Tooth ${toothId} not found`);
          return;
        }
        
        if (!tooth.m_ProbingDepth) {
          tooth.m_ProbingDepth = { a: 0, b: 0, c: 0 };
        }
        
        tooth.m_ProbingDepth[position] = numValue;
        redraw(toothId);
        if (teethController && teethController.Charting && teethController.Charting.Maxilla) {
          teethController.Charting.Maxilla.drawBackground();
        }
      } catch (error) {
        console.error('Error updating probing depth:', error);
      }
    }
    
    // Update patient chart manager
    if (patientChartManager) {
      const currentDepths = probingDepths1[toothId] || { a: 0, b: 0, c: 0 };
      const updatedDepths = { ...currentDepths, [position]: numValue };
      patientChartManager.updateToothData(toothId, { probing_depth: updatedDepths });
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

  const table1UpData = {
    name: "Table1Up",
    position: "upper",
    teeth: upperTeeth1.map(x => ({
      id: x.Id,
      mobility: 0,
      implant: x.m_Implant,
      furcation: x.m_Furcation || {},
      bleed_on_probing: x.m_BleedOnProbing,
      plaque: x.m_HasPlaque,
      gingival_depth: gingivalDepths1[x.Id] || { a: 0, b: 0, c: 0 },
      probing_depth: probingDepths1[x.Id] || { a: 0, b: 0, c: 0 }
    }))
  };

  return (
    <div>
      {/* Voice Control Panel - Moved to top */}
      <div name="perio_structure" style={{ 
        margin: "0 0 30px 0", 
        padding: "20px", 
        border: "2px solid #e3f2fd", 
        borderRadius: "12px",
        backgroundColor: "linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%)",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        borderLeft: "6px solid #2196F3"
      }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "15px", 
          marginBottom: "20px",
          flexWrap: "wrap"
        }}>
          <button 
            onClick={isRecording ? stopRecording : startRecording}
            style={{
              padding: "12px 24px",
              backgroundColor: isRecording ? "#f44336" : "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
              transition: "all 0.3s ease",
              minWidth: "140px"
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.2)";
            }}
          >
            {isRecording ? "⏹ Stop Recording" : "🎤 Start Recording"}
          </button>
          
          <div style={{ 
            padding: "12px 20px",
            backgroundColor: "#2196F3",
            color: "white",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow: "0 2px 8px rgba(33, 150, 243, 0.3)",
            border: "1px solid #1976d2"
          }}>
            🦷 Current: {getToothDescription(currentToothId)}
          </div>
          
          {isRecording && (
            <div style={{ flexGrow: 1, minWidth: "200px" }}>
              <div style={{
                height: "12px",
                backgroundColor: "#e0e0e0",
                borderRadius: "6px",
                overflow: "hidden",
                boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.2)"
              }}>
                <div 
                  style={{
                    height: "100%",
                    width: `${Math.min(100, volumeLevel)}%`,
                    backgroundColor: volumeLevel > 50 ? "#4CAF50" : "#FFC107",
                    transition: "width 0.1s ease",
                    borderRadius: "6px",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.3)"
                  }}
                />
              </div>
              <div style={{ 
                fontSize: "12px", 
                color: "#666", 
                marginTop: "4px",
                textAlign: "center"
              }}>
                Volume Level: {Math.round(volumeLevel)}%
              </div>
            </div>
          )}
        </div>
        
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 1fr", 
          gap: "20px",
          marginTop: "15px"
        }}>
          <div>
            <h4 style={{ 
              margin: "0 0 10px 0", 
              color: "#1976d2", 
              fontSize: "16px",
              fontWeight: "600",
              borderBottom: "2px solid #e3f2fd",
              paddingBottom: "5px"
            }}>
              🎯 Voice Commands
            </h4>
            <div style={{ 
              padding: "15px",
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              border: "1px solid #e0e0e0",
              maxHeight: "200px",
              overflowY: "auto"
            }}>
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 1fr", 
                gap: "10px",
                fontSize: "13px"
              }}>
                <div>
                  <strong style={{ color: "#1976d2" }}>Navigation:</strong>
                  <ul style={{ margin: "5px 0", paddingLeft: "20px" }}>
                    <li>"next" - Next tooth</li>
                    <li>"previous" - Previous tooth</li>
                  </ul>
                </div>
                <div>
                  <strong style={{ color: "#1976d2" }}>Single Values:</strong>
                  <ul style={{ margin: "5px 0", paddingLeft: "20px" }}>
                    <li>"mobility one" - Set mobility</li>
                    <li>"implant true/false" - Set implant</li>
                  </ul>
                </div>
                <div>
                  <strong style={{ color: "#1976d2" }}>Position Values:</strong>
                  <ul style={{ margin: "5px 0", paddingLeft: "20px" }}>
                    <li>"bleeding A true" - Set bleeding</li>
                    <li>"plaque B false" - Set plaque</li>
                  </ul>
                </div>
                <div>
                  <strong style={{ color: "#1976d2" }}>Depth Values:</strong>
                  <ul style={{ margin: "5px 0", paddingLeft: "20px" }}>
                    <li>"gingival depth is 2 3 1" - All depths</li>
                    <li>"probing depth A is 2" - Single depth</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 style={{ 
              margin: "0 0 10px 0", 
              color: "#1976d2", 
              fontSize: "16px",
              fontWeight: "600",
              borderBottom: "2px solid #e3f2fd",
              paddingBottom: "5px"
            }}>
              📝 Live Transcript
            </h4>
            <div style={{
              padding: "15px",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              minHeight: "120px",
              backgroundColor: "#ffffff",
              fontSize: "14px",
              lineHeight: "1.4",
              overflowY: "auto",
              maxHeight: "200px"
            }}>
              {transcript || (isRecording ? "🎤 Listening for voice input..." : "Press Start Recording to begin")}
            </div>
            {(commandFeedback || navigationFeedback) && (
              <div style={{
                marginTop: "10px",
                padding: "10px 15px",
                backgroundColor: "#e8f5e9",
                borderRadius: "6px",
                color: "#2e7d32",
                border: "1px solid #c8e6c9",
                fontSize: "13px",
                fontWeight: "500"
              }}>
                ✅ {navigationFeedback || commandFeedback}
              </div>
            )}
          </div>
        </div>
      </div>

      <table className="table" style={{border: "none"}}>
        <tbody>
          <tr className="table_title teeth_num">
            <td></td>
            {upperTeeth1.map(x => <td key={x.Id}>{x.Id}</td>)}
          </tr>
          <tr>
            <td className="table_title row_title">{__dictionnary.mobility}</td>
            {upperTeeth1.map(x => (
              <td key={`mobility-${x.Id}`}>
                <input
                  type="number"
                  value={mobility[x.Id] ?? 0}
                  onChange={e => {
                    const value = parseInt(e.target.value) || 0;
                    setMobility(m => ({ ...m, [x.Id]: value }));
                    
                    // Update the tooth object
                    const tooth = teethController?.Charting.getTeethById(x.Id);
                    if (tooth) {
                      tooth.m_Mobility = value;
                      redraw(x.Id);
                    }
                    
                    // Save the change using patientChartManager
                    if (patientChartManager && table1UpJson) {
                      const updatedTableData = {
                        ...table1UpJson,
                        teeth: table1UpJson.teeth.map(t => 
                          t.id === x.Id ? { ...t, mobility: value } : t
                        )
                      };
                      patientChartManager.updateTableData("Table1Up", updatedTableData);
                    }
                  }}
                />
              </td>
            ))}
          </tr>
          <tr>
            <td className="table_title row_title">{__dictionnary.implant}</td>
            {upperTeeth1.map(x => (
              <td key={`implant-${x.Id+props.id}`}>
                <input 
                  data-all_checkbtn={`Table${props.id}up_checkbtn`}
                  id={`implant-${x.Id+props.id}`}
                  type="checkbox" 
                  style={{marginLeft:"30px"}}
                  onChange={e => handleImplantChange(e, x)}
                  checked={x.m_Implant}
                  className={x.m_Implant ? "plq-checkbox checked" : "plq-checkbox"}
                />
                <label htmlFor={`implant-${x.Id}`} className={x.m_Implant ? "checked" : ""}></label>
              </td>
            ))}
          </tr>
          <tr className="furca">
            <td className="table_title row_title">{__dictionnary.furcation}</td>
            <td><div style={{marginLeft:"6px"}} onClick={() => cycleFurca(18+props.id)} id={"furca18"+props.id} className="box"></div></td>
            <td><div style={{marginLeft:"6px"}} onClick={() => cycleFurca(17+props.id)} id={"furca17"+props.id} className="box"></div></td>
            <td><div style={{marginLeft:"6px"}} onClick={() => cycleFurca(16+props.id)} id={"furca16"+props.id} className="box"></div></td>
            <td></td>
            <td><div style={{marginLeft:"6px"}} onClick={() => cycleFurca(14+props.id)} id={ "furca14" + props.id} className="box"></div></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td><div style={{marginLeft:"6px"}} onClick={() => cycleFurca(24+props.id)} id={ "furca24" + props.id} className="box"></div></td>
            <td></td>
            <td><div style={{marginLeft:"6px"}} onClick={() => cycleFurca(26+props.id)} id={ "furca26" + props.id} className="box"></div></td>
            <td><div style={{marginLeft:"6px"}} onClick={() => cycleFurca(27+props.id)} id={ "furca27" + props.id} className="box"></div></td>
            <td><div style={{marginLeft:"6px"}} onClick={() => cycleFurca(28+props.id)} id={ "furca28" + props.id} className="box"></div></td>
          </tr>
          <tr className="cb bop">
            <td className="table_title row_title">{__dictionnary.bleed_on_probing}</td>
            {upperTeeth1.map(x => (
              <td key={`bop-${x.Id}`+props.id}>
                <input 
                  id={`bop${x.Id}a`+props.id} 
                  type="checkbox" 
                  checked={bleedOnProbing[x.Id]?.a ?? false}
                  onChange={e => {
                    const isChecked = e.target.checked;
                    setBleedOnProbing(bop => ({
                      ...bop,
                      [x.Id]: { ...bop[x.Id], a: isChecked }
                    }));
                    
                    // Update the tooth object
                    const tooth = teethController?.Charting.getTeethById(x.Id);
                    if (tooth) {
                      tooth.m_BleedOnProbing = tooth.m_BleedOnProbing || { a: false, b: false, c: false };
                      tooth.m_BleedOnProbing.a = isChecked;
                      redraw(x.Id);
                    }
                    
                    // Save the change using patientChartManager
                    if (patientChartManager && table1UpJson) {
                      const updatedTableData = {
                        ...table1UpJson,
                        teeth: table1UpJson.teeth.map(t => 
                          t.id === x.Id ? { 
                            ...t, 
                            bleed_on_probing: { 
                              ...t.bleed_on_probing, 
                              a: isChecked 
                            } 
                          } : t
                        )
                      };
                      patientChartManager.updateTableData("Table1Up", updatedTableData);
                    }
                  }}
                />
                <label htmlFor={`bop${x.Id}a`+props.id} className={bleedOnProbing[x.Id]?.a ? "checked" : ""}></label>
                <input 
                  id={`bop${x.Id}b`+props.id} 
                  type="checkbox" 
                  checked={bleedOnProbing[x.Id]?.b ?? false}
                  onChange={e => {
                    const isChecked = e.target.checked;
                    setBleedOnProbing(bop => ({
                      ...bop,
                      [x.Id]: { ...bop[x.Id], b: isChecked }
                    }));
                    
                    // Update the tooth object
                    const tooth = teethController?.Charting.getTeethById(x.Id);
                    if (tooth) {
                      tooth.m_BleedOnProbing = tooth.m_BleedOnProbing || { a: false, b: false, c: false };
                      tooth.m_BleedOnProbing.b = isChecked;
                      redraw(x.Id);
                    }
                    
                    // Save the change using patientChartManager
                    if (patientChartManager && table1UpJson) {
                      const updatedTableData = {
                        ...table1UpJson,
                        teeth: table1UpJson.teeth.map(t => 
                          t.id === x.Id ? { 
                            ...t, 
                            bleed_on_probing: { 
                              ...t.bleed_on_probing, 
                              b: isChecked 
                            } 
                          } : t
                        )
                      };
                      patientChartManager.updateTableData("Table1Up", updatedTableData);
                    }
                  }}
                />
                <label htmlFor={`bop${x.Id}b`+props.id} className={bleedOnProbing[x.Id]?.b ? "checked" : ""}></label>	
                <input 
                  id={`bop${x.Id}c`+props.id} 
                  type="checkbox" 
                  checked={bleedOnProbing[x.Id]?.c ?? false}
                  onChange={e => {
                    const isChecked = e.target.checked;
                    setBleedOnProbing(bop => ({
                      ...bop,
                      [x.Id]: { ...bop[x.Id], c: isChecked }
                    }));
                    
                    // Update the tooth object
                    const tooth = teethController?.Charting.getTeethById(x.Id);
                    if (tooth) {
                      tooth.m_BleedOnProbing = tooth.m_BleedOnProbing || { a: false, b: false, c: false };
                      tooth.m_BleedOnProbing.c = isChecked;
                      redraw(x.Id);
                    }
                    
                    // Save the change using patientChartManager
                    if (patientChartManager && table1UpJson) {
                      const updatedTableData = {
                        ...table1UpJson,
                        teeth: table1UpJson.teeth.map(t => 
                          t.id === x.Id ? { 
                            ...t, 
                            bleed_on_probing: { 
                              ...t.bleed_on_probing, 
                              c: isChecked 
                            } 
                          } : t
                        )
                      };
                      patientChartManager.updateTableData("Table1Up", updatedTableData);
                    }
                  }}
                />
                <label htmlFor={`bop${x.Id}c`+props.id} className={bleedOnProbing[x.Id]?.c ? "checked" : ""}></label>
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
                  checked={plaque[x.Id]?.a ?? false}
                  onChange={e => {
                    const isChecked = e.target.checked;
                    setPlaque(p => ({
                      ...p,
                      [x.Id]: { ...p[x.Id], a: isChecked }
                    }));
                    
                    // Update the tooth object
                    const tooth = teethController?.Charting.getTeethById(x.Id);
                    if (tooth) {
                      tooth.m_HasPlaque = tooth.m_HasPlaque || { a: false, b: false, c: false };
                      tooth.m_HasPlaque.a = isChecked;
                      redraw(x.Id);
                    }
                    
                    // Save the change using patientChartManager
                    if (patientChartManager && table1UpJson) {
                      const updatedTableData = {
                        ...table1UpJson,
                        teeth: table1UpJson.teeth.map(t => 
                          t.id === x.Id ? { 
                            ...t, 
                            plaque: { 
                              ...t.plaque, 
                              a: isChecked 
                            } 
                          } : t
                        )
                      };
                      patientChartManager.updateTableData("Table1Up", updatedTableData);
                    }
                  }}
                />
                <label htmlFor={`plq${x.Id}a` +props.id} className={plaque[x.Id]?.a ? "checked" : ""}></label>
                <input 
                  id={`plq${x.Id}b` +props.id} 
                  type="checkbox" 
                  checked={plaque[x.Id]?.b ?? false}
                  onChange={e => {
                    const isChecked = e.target.checked;
                    setPlaque(p => ({
                      ...p,
                      [x.Id]: { ...p[x.Id], b: isChecked }
                    }));
                    
                    // Update the tooth object
                    const tooth = teethController?.Charting.getTeethById(x.Id);
                    if (tooth) {
                      tooth.m_HasPlaque = tooth.m_HasPlaque || { a: false, b: false, c: false };
                      tooth.m_HasPlaque.b = isChecked;
                      redraw(x.Id);
                    }
                    
                    // Save the change using patientChartManager
                    if (patientChartManager && table1UpJson) {
                      const updatedTableData = {
                        ...table1UpJson,
                        teeth: table1UpJson.teeth.map(t => 
                          t.id === x.Id ? { 
                            ...t, 
                            plaque: { 
                              ...t.plaque, 
                              b: isChecked 
                            } 
                          } : t
                        )
                      };
                      patientChartManager.updateTableData("Table1Up", updatedTableData);
                    }
                  }}
                />
                <label htmlFor={`plq${x.Id}b` +props.id} className={plaque[x.Id]?.b ? "checked" : ""}></label>	
                <input 
                  id={`plq${x.Id}c` +props.id} 
                  type="checkbox" 
                  checked={plaque[x.Id]?.c ?? false}
                  onChange={e => {
                    const isChecked = e.target.checked;
                    setPlaque(p => ({
                      ...p,
                      [x.Id]: { ...p[x.Id], c: isChecked }
                    }));
                    
                    // Update the tooth object
                    const tooth = teethController?.Charting.getTeethById(x.Id);
                    if (tooth) {
                      tooth.m_HasPlaque = tooth.m_HasPlaque || { a: false, b: false, c: false };
                      tooth.m_HasPlaque.c = isChecked;
                      redraw(x.Id);
                    }
                    
                    // Save the change using patientChartManager
                    if (patientChartManager && table1UpJson) {
                      const updatedTableData = {
                        ...table1UpJson,
                        teeth: table1UpJson.teeth.map(t => 
                          t.id === x.Id ? { 
                            ...t, 
                            plaque: { 
                              ...t.plaque, 
                              c: isChecked 
                            } 
                          } : t
                        )
                      };
                      patientChartManager.updateTableData("Table1Up", updatedTableData);
                    }
                  }}
                />
                <label htmlFor={`plq${x.Id}c` +props.id} className={plaque[x.Id]?.c ? "checked" : ""}></label>
              </td>
            ))}
          </tr>
          <tr>
            <td className="table_title row_title">{__dictionnary.gingival_depth}</td>
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
            <td className="table_title row_title"></td>
            <td colSpan="48">
              <div style={{width: '100%'}}>
                <canvas ref={canvasRef} id={'vrc_display'+props.id} style={{display: 'inline-block', width:"1400px", maxHeight: '100%'}}></canvas>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Table1Up;