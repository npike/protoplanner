const ledColors = [
    { type: 'led-red', name: 'LED (Red)', fill: '#ff4444', stroke: '#cc0000' },
    { type: 'led-green', name: 'LED (Green)', fill: '#44ff44', stroke: '#00cc00' },
    { type: 'led-blue', name: 'LED (Blue)', fill: '#4444ff', stroke: '#0000cc' },
    { type: 'led-yellow', name: 'LED (Yellow)', fill: '#ffff44', stroke: '#cccc00' },
    { type: 'led-white', name: 'LED (White)', fill: '#ffffff', stroke: '#cccccc' }
];

ledColors.forEach(color => {
    ComponentRegistry.register({
        "type": color.type,
        "name": color.name,
        "category": "LEDs",
        "pins": [
            { "dx": 0, "dy": 0, "label": "+" },
            { "dx": 1, "dy": 0, "label": "-" }
        ],
        "body": {
            "width": 1.4,
            "height": 1.4,
            "offsetX": -0.2,
            "offsetY": -0.7,
            "fill": color.fill,
            "stroke": color.stroke,
            "rx": 10 
        },
        "visuals": [
            // Flat side for Cathode (-) at dx=1. Scale to fit smaller body.
            { "shape": "rect", "x": 0.65, "y": -0.5, "w": 0.1, "h": 1.0, "fill": color.stroke },
            // Lens highlight. Scale to match.
            { "shape": "circle", "cx": 0.2, "cy": -0.2, "r": 0.25, "fill": "rgba(255,255,255,0.4)" }
        ]
    });
});
