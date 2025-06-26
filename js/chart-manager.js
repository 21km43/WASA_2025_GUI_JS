class ChartManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.chart = null;
        this.dataPoints = 100; // Number of data points to display
        this.updateInterval = null;
        
        this.init();
    }

    init() {
        this.createChart();
        this.startAutoUpdate();
    }

    createChart() {
        const ctx = this.canvas.getContext('2d');
        
        // Create datasets
        const datasets = [
            {
                label: 'Altitude (m)',
                data: [],
                borderColor: '#ff6384',
                backgroundColor: 'rgba(255, 99, 132, 0.1)',
                borderWidth: 2,
                fill: false,
                yAxisID: 'y-altitude'
            },
            {
                label: 'Speed (m/s)',
                data: [],
                borderColor: '#36a2eb',
                backgroundColor: 'rgba(54, 162, 235, 0.1)',
                borderWidth: 2,
                fill: false,
                yAxisID: 'y-speed'
            },
            {
                label: 'Heading (°)',
                data: [],
                borderColor: '#ffce56',
                backgroundColor: 'rgba(255, 206, 86, 0.1)',
                borderWidth: 2,
                fill: false,
                yAxisID: 'y-heading'
            }
        ];

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 0 // Disable animations for real-time updates
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Time',
                            color: '#ffffff'
                        },
                        ticks: {
                            color: '#ffffff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    'y-altitude': {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Altitude (m)',
                            color: '#ff6384'
                        },
                        ticks: {
                            color: '#ff6384'
                        },
                        grid: {
                            color: 'rgba(255, 99, 132, 0.1)'
                        }
                    },
                    'y-speed': {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Speed (m/s)',
                            color: '#36a2eb'
                        },
                        ticks: {
                            color: '#36a2eb'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    },
                    'y-heading': {
                        type: 'linear',
                        display: false,
                        min: 0,
                        max: 360,
                        ticks: {
                            color: '#ffce56'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: '#ffffff'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Flight Data',
                        color: '#ffffff',
                        font: {
                            size: 16
                        }
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false
                }
            }
        });
    }

    updateChart(data) {
        if (!this.chart) return;

        const timestamp = new Date().toLocaleTimeString();
        
        // Add new data point
        this.chart.data.labels.push(timestamp);
        this.chart.data.datasets[0].data.push(data.altitude);
        this.chart.data.datasets[1].data.push(data.speed);
        this.chart.data.datasets[2].data.push(data.heading);
        
        // Remove old data points if exceeding limit
        if (this.chart.data.labels.length > this.dataPoints) {
            this.chart.data.labels.shift();
            this.chart.data.datasets[0].data.shift();
            this.chart.data.datasets[1].data.shift();
            this.chart.data.datasets[2].data.shift();
        }
        
        // Update chart
        this.chart.update('none'); // Disable animations for performance
    }

    updateWithHistory(history) {
        if (!this.chart || !history || history.length === 0) return;

        // Clear existing data
        this.chart.data.labels = [];
        this.chart.data.datasets[0].data = [];
        this.chart.data.datasets[1].data = [];
        this.chart.data.datasets[2].data = [];

        // Add historical data
        history.forEach((entry, index) => {
            const timestamp = new Date(entry.timestamp).toLocaleTimeString();
            
            this.chart.data.labels.push(timestamp);
            this.chart.data.datasets[0].data.push(entry.altitude);
            this.chart.data.datasets[1].data.push(entry.speed);
            this.chart.data.datasets[2].data.push(entry.heading);
        });

        // Update chart
        this.chart.update();
    }

    startAutoUpdate() {
        // Update chart every 100ms for smooth real-time display
        this.updateInterval = setInterval(() => {
            // This will be called by the main app when new data arrives
        }, 100);
    }

    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    // Add new dataset
    addDataset(label, data, color = '#4bc0c0') {
        if (!this.chart) return;

        const newDataset = {
            label: label,
            data: data,
            borderColor: color,
            backgroundColor: color + '20',
            borderWidth: 2,
            fill: false
        };

        this.chart.data.datasets.push(newDataset);
        this.chart.update();
    }

    // Remove dataset by label
    removeDataset(label) {
        if (!this.chart) return;

        const index = this.chart.data.datasets.findIndex(dataset => dataset.label === label);
        if (index !== -1) {
            this.chart.data.datasets.splice(index, 1);
            this.chart.update();
        }
    }

    // Clear all data
    clearData() {
        if (!this.chart) return;

        this.chart.data.labels = [];
        this.chart.data.datasets.forEach(dataset => {
            dataset.data = [];
        });
        this.chart.update();
    }

    // Export chart data
    exportData() {
        if (!this.chart) return null;

        const data = {
            labels: this.chart.data.labels,
            datasets: this.chart.data.datasets.map(dataset => ({
                label: dataset.label,
                data: dataset.data
            }))
        };

        return JSON.stringify(data, null, 2);
    }

    // Import chart data
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            
            if (this.chart) {
                this.chart.data.labels = data.labels || [];
                data.datasets.forEach((dataset, index) => {
                    if (this.chart.data.datasets[index]) {
                        this.chart.data.datasets[index].data = dataset.data || [];
                    }
                });
                this.chart.update();
            }
        } catch (error) {
            console.error('Error importing chart data:', error);
        }
    }

    // Change chart type
    changeChartType(type) {
        if (!this.chart) return;

        this.chart.config.type = type;
        this.chart.update();
    }

    // Set data points limit
    setDataPointsLimit(limit) {
        this.dataPoints = limit;
        
        if (this.chart && this.chart.data.labels.length > limit) {
            const excess = this.chart.data.labels.length - limit;
            this.chart.data.labels.splice(0, excess);
            this.chart.data.datasets.forEach(dataset => {
                dataset.data.splice(0, excess);
            });
            this.chart.update();
        }
    }

    // Get chart statistics
    getStatistics() {
        if (!this.chart) return null;

        const stats = {};
        
        this.chart.data.datasets.forEach(dataset => {
            const data = dataset.data.filter(d => d !== null && d !== undefined);
            if (data.length > 0) {
                stats[dataset.label] = {
                    min: Math.min(...data),
                    max: Math.max(...data),
                    avg: data.reduce((a, b) => a + b, 0) / data.length
                };
            }
        });

        return stats;
    }

    // Destroy chart
    destroy() {
        this.stopAutoUpdate();
        
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }
} 