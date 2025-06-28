import { __dictionnary } from './variables_dict/dictionnary_en'; 
import { ToothProvider } from './ToothStatus/ToothContext';
import React, { useState } from 'react';
import icon from './icons/ic_settings_voice_black_24dp_2x.png';
import Table1Up from './TablesParts/Table1up';
import Table1Down from './TablesParts/Table1down';
import Table2Up from './TablesParts/Table2up';
import Table2Down from './TablesParts/Table2down';

const Layout = () => {
  const [recording, setRecording] = useState(false); // الحالة: false = نعرض start فقط


  const handleStart = () => {
    setRecording(true);
  };

  const handleStop = () => {
    setRecording(false);
  };

  return (
    <ToothProvider>
        <div id="vr_charting" style={{ width: '100%', height: '100%',overflow: "auto"  }}>
          <div id="main_controller">
          <div id="vr_charting" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <p
              style={{
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '20px'
              }}
              className="no-print"
            >
              <span>
                <img id="rec_icon" style={{ height: '28px' }} src={icon} alt="" />
              </span>

              {!recording && (
                <input
                  type="button"
                  value={__dictionnary.start}
                  id="StartBut"
                  onClick={handleStart}
                />
              )}

              {recording && (
                <input
                  type="button"
                  value={__dictionnary.stop}
                  id="StopBut"
                  onClick={handleStop}
                />
              )}
            </p>
            <br />
          </div>
          <br />

          <Table1Up id="0" id2="1" style={{ width: '100%' }} />
          <Table1Down id="1" id2="0" style={{ width: '100%' }} />
          <Table2Up id="2" id2="3" style={{ width: '100%' }} />
          <Table2Down id="3" id2="2" style={{ width: '100%' }} />
        </div>
      </div>
    </ToothProvider>
  );
};

export default Layout;
