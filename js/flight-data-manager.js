class FlightDataManager {
    constructor() {
        this.data = {
            altitude: 0,
            speed: 0,
            heading: 0,
            pitch: 0,
            roll: 0,
            latitude: 0,
            longitude: 0,
            gps_fix: false,
            timestamp: Date.now()
        };
        
        this.history = [];
        this.maxHistoryLength = 1000;
        this.isConnected = false;
        this.connectionStatus = 'disconnected';
        
        // Event listeners
        this.onDataUpdate = null;
        this.onConnectionChange = null;
        
        // WebSocket connection
        this.ws = null;
        this.reconnectInterval = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    // Initialize the data manager
    init() {
        console.log('FlightDataManager: Initializing...');
        this.startWebSocket();
        this.startSimulation(); // For testing without real data
    }

    // WebSocket connection management
    startWebSocket() {
        try {
            // Try to connect to WebSocket server (if available)
            this.ws = new WebSocket('ws://localhost:8080');
            
            this.ws.onopen = () => {
                console.log('FlightDataManager: WebSocket connected');
                this.setConnectionStatus('connected');
                this.reconnectAttempts = 0;
            };
            
            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.updateData(data);
                } catch (error) {
                    console.error('FlightDataManager: Error parsing WebSocket data:', error);
                }
            };
            
            this.ws.onclose = () => {
                console.log('FlightDataManager: WebSocket disconnected');
                this.setConnectionStatus('disconnected');
                this.scheduleReconnect();
            };
            
            this.ws.onerror = (error) => {
                console.error('FlightDataManager: WebSocket error:', error);
                this.setConnectionStatus('error');
            };
            
        } catch (error) {
            console.log('FlightDataManager: WebSocket not available, using simulation mode');
            this.setConnectionStatus('simulation');
        }
    }

    scheduleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
            
            this.reconnectInterval = setTimeout(() => {
                console.log(`FlightDataManager: Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                this.startWebSocket();
            }, delay);
        } else {
            console.log('FlightDataManager: Max reconnection attempts reached');
        }
    }

    setConnectionStatus(status) {
        this.connectionStatus = status;
        this.isConnected = status === 'connected';
        
        if (this.onConnectionChange) {
            this.onConnectionChange(status);
        }
    }

    // Data update methods
    updateData(newData) {
        // Merge new data with existing data
        this.data = { ...this.data, ...newData, timestamp: Date.now() };
        
        // Add to history
        this.history.push({ ...this.data });
        
        // Limit history size
        if (this.history.length > this.maxHistoryLength) {
            this.history.shift();
        }
        
        // Notify listeners
        if (this.onDataUpdate) {
            this.onDataUpdate(this.data);
        }
    }

    // Get current data
    getCurrentData() {
        return { ...this.data };
    }

    // Get historical data
    getHistory() {
        return [...this.history];
    }

    // Get data for specific time range
    getDataForTimeRange(startTime, endTime) {
        return this.history.filter(entry => 
            entry.timestamp >= startTime && entry.timestamp <= endTime
        );
    }

    // Simulation mode for testing
    startSimulation() {
        if (this.connectionStatus === 'simulation') {
            this.simulationInterval = setInterval(() => {
                const simulatedData = this.generateSimulatedData();
                this.updateData(simulatedData);
            }, 100); // 10 FPS
        }
    }

    generateSimulatedData() {
        const time = Date.now() / 1000;
        
        return {
            altitude: 100 + 50 * Math.sin(time * 0.1),
            speed: 20 + 5 * Math.sin(time * 0.2),
            heading: (time * 10) % 360,
            pitch: 5 * Math.sin(time * 0.3),
            roll: 10 * Math.sin(time * 0.4),
            latitude: 35.0 + 0.001 * Math.sin(time * 0.1),
            longitude: 135.0 + 0.001 * Math.cos(time * 0.1),
            gps_fix: true
        };
    }

    // Stop simulation
    stopSimulation() {
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = null;
        }
    }

    // Cleanup
    destroy() {
        this.stopSimulation();
        
        if (this.reconnectInterval) {
            clearTimeout(this.reconnectInterval);
        }
        
        if (this.ws) {
            this.ws.close();
        }
    }

    // Export data
    exportData(format = 'json') {
        switch (format.toLowerCase()) {
            case 'json':
                return JSON.stringify(this.history, null, 2);
            case 'csv':
                return this.convertToCSV();
            default:
                throw new Error(`Unsupported format: ${format}`);
        }
    }

    convertToCSV() {
        if (this.history.length === 0) return '';
        
        const headers = Object.keys(this.history[0]).join(',');
        const rows = this.history.map(entry => 
            Object.values(entry).join(',')
        );
        
        return [headers, ...rows].join('\n');
    }
} 