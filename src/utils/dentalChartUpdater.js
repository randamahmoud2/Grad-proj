// import fs from 'fs';
// import path from 'path';

// let ws = null;
// let connectionPromise = null;
// let currentConfig = null;
// let messageCallbacks = new Map();

// const loadInitialConfig = async () => {
//     try {
//         const response = await fetch('http://localhost:5000/get_chart');
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const config = await response.json();
//         console.log('Loaded initial config:', config);
        
//         // Verify the config has the correct structure
//         if (!config.tables || config.tables.length === 0) {
//             console.error('Invalid config structure received from server');
//             throw new Error('Invalid config structure');
//         }
        
//         // Find Table1Up data
//         const table1UpData = config.tables.find(table => table.name === "Table1Up");
//         if (!table1UpData) {
//             console.error('Table1Up data not found in config');
//             throw new Error('Table1Up data not found');
//         }
        
//         currentConfig = config;
//         return config;
//     } catch (error) {
//         console.error('Error loading initial config:', error);
//         throw error;
//     }
// };

// const connectWebSocket = () => {
//     if (!connectionPromise) {
//         connectionPromise = new Promise((resolve, reject) => {
//             if (ws && ws.readyState === WebSocket.OPEN) {
//                 resolve(ws);
//                 return;
//             }

//             ws = new WebSocket('ws://localhost:5000/transcribe');
            
//             ws.onopen = () => {
//                 console.log('WebSocket connected');
//                 // Load initial config when WebSocket connects
//                 loadInitialConfig().then(config => {
//                     if (config) {
//                         currentConfig = config;
//                     }
//                 });
//                 resolve(ws);
//             };
            
//             ws.onerror = (error) => {
//                 console.error('WebSocket error:', error);
//                 reject(error);
//                 connectionPromise = null;
//             };
            
//             ws.onclose = () => {
//                 console.log('WebSocket disconnected');
//                 connectionPromise = null;
//                 // Try to reconnect after a delay
//                 setTimeout(() => {
//                     connectWebSocket();
//                 }, 1000);
//             };

//             ws.onmessage = (event) => {
//                 try {
//                     const response = JSON.parse(event.data);
//                     console.log('Received WebSocket response:', response);
                    
//                     if (response.type === 'dental_chart_update') {
//                         // Update our local config
//                         if (response.data) {
//                             currentConfig = response.data;
//                             console.log('Updated local config:', currentConfig);
//                         }
                        
//                         // Resolve any pending callbacks
//                         const callback = messageCallbacks.get(response.messageId);
//                         if (callback) {
//                             callback(response);
//                             messageCallbacks.delete(response.messageId);
//                         }
//                     }
//                 } catch (error) {
//                     console.log('Received WebSocket message:', event.data);
//                 }
//             };
//         });
//     }
//     return connectionPromise;
// };

// const sendWebSocketMessage = async (data) => {
//     try {
//         const socket = await connectWebSocket();
//         return new Promise((resolve, reject) => {
//             if (socket.readyState === WebSocket.OPEN) {
//                 // Generate a unique message ID
//                 const messageId = Date.now().toString();
//                 const message = {
//                     ...data,
//                     messageId
//                 };
                
//                 console.log('Sending WebSocket message:', message);
                
//                 // Store the callback
//                 messageCallbacks.set(messageId, (response) => {
//                     if (response.status === 'success') {
//                         resolve(response.data);
//                     } else {
//                         reject(new Error(response.message || 'Update failed'));
//                     }
//                 });
                
//                 // Send the message
//                 socket.send(JSON.stringify(message));
                
//                 // Set a timeout for the response
//                 setTimeout(() => {
//                     if (messageCallbacks.has(messageId)) {
//                         messageCallbacks.delete(messageId);
//                         reject(new Error('Response timeout'));
//                     }
//                 }, 10000); // Increased timeout to 10 seconds
//             } else {
//                 reject(new Error('WebSocket not connected'));
//             }
//         });
//     } catch (error) {
//         console.error('Error sending WebSocket message:', error);
//         throw error;
//     }
// };

// /**
//  * Saves the dental chart state to the backend
//  * @param {Object} updateData - The data to update
//  * @returns {Promise<Object>} - The updated data from the server
//  */
// export const saveDentalChartState = async (updateData) => {
//   try {
//     const response = await fetch('http://localhost:5000/update_chart', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(updateData),
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const result = await response.json();
//     if (result.error) {
//       throw new Error(result.error);
//     }

//     return result.data;
//   } catch (error) {
//     console.error('Error saving dental chart state:', error);
//     throw error;
//   }
// };

// /**
//  * Loads the dental chart data from the backend
//  * @returns {Promise<Object>} - The dental chart data
//  */
// export const loadDentalChartData = async () => {
//   try {
//     const response = await fetch('http://localhost:5000/get_chart');
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const result = await response.json();
//     if (result.error) {
//       throw new Error(result.error);
//     }

//     return result;
//   } catch (error) {
//     console.error('Error loading dental chart data:', error);
//     throw error;
//   }
// };

// export const updateDentalChart = async (parsedCommand) => {
//   try {
//     if (!parsedCommand) return null;

//     // Create the update message
//     const updateMessage = {
//       type: 'dental_chart_update',
//       data: {
//         name: 'Table1Up',
//         teeth: [{
//           id: parsedCommand.toothId,
//           [parsedCommand.field]: parsedCommand.updateType === 'position' 
//             ? { [parsedCommand.position]: parsedCommand.value }
//             : parsedCommand.updateType === 'all_positions'
//               ? parsedCommand.values
//               : parsedCommand.value
//         }]
//       }
//     };

//     // Save the changes to the JSON file
//     const savedData = await saveDentalChartState(updateMessage);
//     if (!savedData) {
//       throw new Error('Failed to save changes to JSON file');
//     }

//     // Send the update through WebSocket for real-time updates
//     const response = await sendWebSocketMessage(updateMessage);
    
//     if (response && response.status === 'success') {
//       // Update local config if available
//       if (currentConfig) {
//         const tables = currentConfig.tables;
//         for (const table of tables) {
//           const tooth = table.teeth.find(t => t.id === parsedCommand.toothId);
//           if (tooth) {
//             if (parsedCommand.updateType === 'position') {
//               if (!tooth[parsedCommand.field]) {
//                 tooth[parsedCommand.field] = {};
//               }
//               tooth[parsedCommand.field][parsedCommand.position] = parsedCommand.value;
//             } else if (parsedCommand.updateType === 'all_positions') {
//               tooth[parsedCommand.field] = parsedCommand.values;
//             } else {
//               tooth[parsedCommand.field] = parsedCommand.value;
//             }
//             return tooth;
//           }
//         }
//       }
//       return response.data;
//     }

//     return null;
//   } catch (error) {
//     console.error('Error updating dental chart:', error);
//     return null;
//   }
// };

// export const getCurrentConfig = () => currentConfig;

// // Initialize the connection and load initial config
// connectWebSocket();



// /////////////////////////////////////////////////////reem////////////////////////////////
// // import fs from 'fs';
// // import path from 'path';

// // export const updateDentalChart = async (parsedCommand) => {
// //   try {
// //     if (!parsedCommand) return null;

// //     const configPath = path.join(process.cwd(), 'src', 'TablesParts', 'dentalChartConfig.json');
// //     const configData = JSON.parse(await fs.promises.readFile(configPath, 'utf8'));

// //     // Find the tooth in the configuration
// //     const tables = configData.tables;
// //     let updatedTooth = null;

// //     for (const table of tables) {
// //       const tooth = table.teeth.find(t => t.id === parsedCommand.toothId);
// //       if (tooth) {
// //         // Update the tooth based on the command
// //         if (parsedCommand.position) {
// //           // For fields with positions (a, b, c)
// //           tooth[parsedCommand.field][parsedCommand.position] = parsedCommand.value;
// //         } else {
// //           // For simple fields (mobility, implant)
// //           tooth[parsedCommand.field] = parsedCommand.value;
// //         }
// //         updatedTooth = tooth;
// //         break;
// //       }
// //     }

// //     if (updatedTooth) {
// //       // Write the updated configuration back to the file
// //       await fs.promises.writeFile(configPath, JSON.stringify(configData, null, 2));
// //       return updatedTooth;
// //     }

// //     return null;
// //   } catch (error) {
// //     console.error('Error updating dental chart:', error);
// //     return null;
// //   }
// // }; 

import fs from 'fs';
import path from 'path';

export const updateDentalChart = async (parsedCommand) => {
  try {
    if (!parsedCommand) return null;

    const configPath = path.join(process.cwd(), 'src', 'TablesParts', 'dentalChartConfig.json');
    const configData = JSON.parse(await fs.promises.readFile(configPath, 'utf8'));

    // Find the tooth in the configuration
    const tables = configData.tables;
    let updatedTooth = null;

    for (const table of tables) {
      const tooth = table.teeth.find(t => t.id === parsedCommand.toothId);
      if (tooth) {
        // Update the tooth based on the command
        if (parsedCommand.position) {
          // For fields with positions (a, b, c)
          tooth[parsedCommand.field][parsedCommand.position] = parsedCommand.value;
        } else {
          // For simple fields (mobility, implant)
          tooth[parsedCommand.field] = parsedCommand.value;
        }
        updatedTooth = tooth;
        break;
      }
    }

    if (updatedTooth) {
      // Write the updated configuration back to the file
      await fs.promises.writeFile(configPath, JSON.stringify(configData, null, 2));
      return updatedTooth;
    }

    return null;
  } catch (error) {
    console.error('Error updating dental chart:', error);
    return null;
  }
}; 