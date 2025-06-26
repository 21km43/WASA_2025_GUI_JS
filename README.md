# WASA 2025 Flight Data GUI - JavaScript Version

A modern web-based flight data display application built with JavaScript, featuring real-time flight instruments, interactive maps, and data visualization.

## Features

- **Primary Flight Display (PFD)**: Real-time artificial horizon, heading indicator, altitude and speed tapes
- **Interactive Map**: Flight path tracking with Leaflet.js maps
- **Data Charts**: Real-time flight data visualization with Chart.js
- **WebSocket Support**: Real-time data streaming capability
- **Simulation Mode**: Built-in flight data simulation for testing
- **Data Export/Import**: Save and load flight data in JSON format
- **Responsive Design**: Works on desktop and mobile devices
- **Keyboard Shortcuts**: Quick access to common functions

## Quick Start

### Web Browser
1. Open `index.html` in a modern web browser
2. The application will start in simulation mode automatically
3. You'll see the PFD, map, and charts updating in real-time

### Local Web Server (Recommended)
For the best experience, serve the files through a local web server:

```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## File Structure

```
WASA_2025_GUI_JS/
├── index.html              # Main HTML file
├── js/
│   ├── flight-data-manager.js  # Data management and WebSocket handling
│   ├── pfd-widget.js           # Primary Flight Display rendering
│   ├── map-manager.js          # Interactive map management
│   ├── chart-manager.js        # Data visualization charts
│   └── main.js                 # Main application controller
└── README.md                   # This file
```

## Components

### FlightDataManager
- Handles data processing and communication
- WebSocket connection management
- Built-in simulation mode
- Data history management
- Export/import functionality

### PFDWidget
- Renders primary flight instruments
- Artificial horizon with pitch and roll
- Heading indicator
- Altitude and speed tapes
- Real-time updates

### MapManager
- Interactive map using Leaflet.js
- Flight path tracking
- Aircraft position marker
- Waypoint and polygon support
- GeoJSON export/import

### ChartManager
- Real-time data visualization with Chart.js
- Multiple data series (altitude, speed, heading)
- Configurable chart types
- Data export/import
- Statistical analysis

## Keyboard Shortcuts

- `Ctrl+R`: Reset all data
- `Ctrl+S`: Save flight data
- `Ctrl+L`: Load flight data
- `Ctrl+C`: Clear all data
- `Escape`: Toggle fullscreen mode

## WebSocket Integration

To connect to a real flight data source:

1. Set up a WebSocket server on `ws://localhost:8080`
2. Send JSON data in the following format:
```json
{
  "altitude": 100.5,
  "speed": 25.3,
  "heading": 180.0,
  "pitch": 2.1,
  "roll": -1.5,
  "latitude": 35.1234,
  "longitude": 135.5678,
  "gps_fix": true
}
```

## Data Export/Import

The application can export and import flight data in JSON format, including:
- Flight data history
- Chart data
- Map flight path (GeoJSON)

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Dependencies

- **Leaflet.js**: Interactive maps
- **Chart.js**: Data visualization
- **WebSocket API**: Real-time communication

All dependencies are loaded from CDN, so an internet connection is required for the first load.

## Development

### Adding New Features
1. Create new JavaScript modules in the `js/` directory
2. Import them in `index.html`
3. Initialize them in `main.js`

### Customizing the UI
- Modify CSS styles in `index.html`
- Update component classes for new layouts
- Add new HTML elements as needed

### Extending Data Sources
- Modify `FlightDataManager` to support new data formats
- Add new WebSocket endpoints
- Implement custom data processing

## Troubleshooting

### Map Not Loading
- Check internet connection (required for map tiles)
- Ensure Leaflet.js is loaded correctly
- Check browser console for errors

### Charts Not Updating
- Verify Chart.js is loaded
- Check data format in console
- Ensure canvas elements exist

### WebSocket Connection Issues
- Verify server is running on correct port
- Check firewall settings
- Ensure data format matches expected JSON structure

## License

This project is part of the WASA 2025 project. Please refer to the main project documentation for licensing information.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions, please refer to the main WASA 2025 project documentation or contact the development team. 
>>>>>>> 78a676a (Initial commit for GitHub Pages)
