// Patient-specific chart data (managing patient-specific chart data and auto-saving)
class PatientChartManager {
    constructor() {
        this.currentPatientId = null;
        this.currentChartData = null;
        this.autoSaveEnabled = true;
        this.autoSaveInterval = null;
        this.lastSavedData = null;
    }

    // Initialize chart manager for a specific patient
    async initializeForPatient(patientId) {
        try {
            this.currentPatientId = patientId;
            
            // Load patient-specific chart data
            const response = await fetch(`http://localhost:5068/api/PerioCharts/${patientId}/chart-data`);
            if (!response.ok) {
                throw new Error(`Failed to load chart data: ${response.status}`);
            }
            
            this.currentChartData = await response.json();
            this.lastSavedData = JSON.stringify(this.currentChartData);
            
            // Start auto-save if enabled
            this.startAutoSave();
            
            console.log(`Chart manager initialized for patient ${patientId}`);
            return this.currentChartData;
        } catch (error) {
            console.error('Error initializing chart manager:', error);
            throw error;
        }
    }

    // Get current chart data
    getCurrentChartData() {
        return this.currentChartData;
    }

    // Update chart data and trigger auto-save
    updateChartData(newData) {
        this.currentChartData = newData;
        
        // Trigger immediate save if auto-save is enabled
        if (this.autoSaveEnabled) {
            this.saveChartData();
        }
    }

    // Save chart data to server
    async saveChartData() {
        if (!this.currentPatientId || !this.currentChartData) {
            console.warn('No patient ID or chart data to save');
            return;
        }

        try {
            const currentDataString = JSON.stringify(this.currentChartData);
            
            // Only save if data has changed
            if (currentDataString === this.lastSavedData) {
                return;
            }

            const response = await fetch(`http://localhost:5068/api/PerioCharts/${this.currentPatientId}/chart-data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: currentDataString,
            });

            if (!response.ok) {
                throw new Error(`Failed to save chart data: ${response.status}`);
            }

            this.lastSavedData = currentDataString;
            console.log(`Chart data saved for patient ${this.currentPatientId}`);
        } catch (error) {
            console.error('Error saving chart data:', error);
            throw error;
        }
    }

    // Reset chart data to default empty state
    async resetChartData() {
        if (!this.currentPatientId) {
            console.warn('No patient ID to reset');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5068/api/PerioCharts/${this.currentPatientId}/chart-data`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`Failed to reset chart data: ${response.status}`);
            }

            // Reload the default data
            await this.initializeForPatient(this.currentPatientId);
            console.log(`Chart data reset for patient ${this.currentPatientId}`);
        } catch (error) {
            console.error('Error resetting chart data:', error);
            throw error;
        }
    }

    // Start auto-save functionality
    startAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }

        this.autoSaveInterval = setInterval(() => {
            if (this.autoSaveEnabled && this.currentPatientId) {
                this.saveChartData().catch(error => {
                    console.error('Auto-save failed:', error);
                });
            }
        }, 5000); // Auto-save every 5 seconds
    }

    // Stop auto-save functionality
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }

    // Enable/disable auto-save
    setAutoSaveEnabled(enabled) {
        this.autoSaveEnabled = enabled;
        if (enabled) {
            this.startAutoSave();
        } else {
            this.stopAutoSave();
        }
    }

    // Clean up when switching patients or unmounting
    cleanup() {
        this.stopAutoSave();
        this.currentPatientId = null;
        this.currentChartData = null;
        this.lastSavedData = null;
    }

    // Get table data by name
    getTableData(tableName) {
        if (!this.currentChartData || !this.currentChartData.tables) {
            return null;
        }
        
        return this.currentChartData.tables.find(table => table.name === tableName);
    }

    // Update specific table data
    updateTableData(tableName, newTableData) {
        if (!this.currentChartData || !this.currentChartData.tables) {
            return;
        }

        const tableIndex = this.currentChartData.tables.findIndex(table => table.name === tableName);
        if (tableIndex !== -1) {
            this.currentChartData.tables[tableIndex] = newTableData;
            this.updateChartData(this.currentChartData);
        }
    }

    // Get tooth data by ID
    getToothData(toothId) {
        if (!this.currentChartData || !this.currentChartData.tables) {
            return null;
        }

        for (const table of this.currentChartData.tables) {
            if (table.teeth) {
                const tooth = table.teeth.find(t => t.id === toothId);
                if (tooth) {
                    return { tooth, tableName: table.name };
                }
            }
        }
        return null;
    }

    // Update specific tooth data
    updateToothData(toothId, newToothData) {
        if (!this.currentChartData || !this.currentChartData.tables) {
            return;
        }

        for (const table of this.currentChartData.tables) {
            if (table.teeth) {
                const toothIndex = table.teeth.findIndex(t => t.id === toothId);
                if (toothIndex !== -1) {
                    table.teeth[toothIndex] = { ...table.teeth[toothIndex], ...newToothData };
                    this.updateChartData(this.currentChartData);
                    return;
                }
            }
        }
    }
}

// Create a singleton instance
const patientChartManager = new PatientChartManager();

export default patientChartManager; 