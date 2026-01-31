ComponentRegistry.register({
    "type": "mp1584",
    "name": "MP1584 Buck Converter",
    "category": "Power",
    "pins": [
        // Inputs on the LEFT (Single Column)
        { "dx": 0, "dy": 0, "label": "IN-" },
        { "dx": 0, "dy": 1, "label": "IN-" },
        { "dx": 0, "dy": 5, "label": "IN+" },
        { "dx": 0, "dy": 6, "label": "IN+" },
        
        // Outputs on the RIGHT (Single Column)
        { "dx": 7, "dy": 0, "label": "OUT-" },
        { "dx": 7, "dy": 1, "label": "OUT-" },
        { "dx": 7, "dy": 5, "label": "OUT+" },
        { "dx": 7, "dy": 6, "label": "OUT+" }
    ],
    "body": {
        "width": 8.0,
        "height": 7.0,
        "offsetX": -0.5,
        "offsetY": -0.5,
        "fill": "#1b5e20", // Dark Green PCB
        "stroke": "#003300",
        "rx": 2
    },
    "visuals": [
        // Large Inductor (Grey Square)
        { "shape": "rect", "x": 2.5, "y": 1.5, "w": 3, "h": 3, "fill": "#555", "rx": 1 },
        // Potentiometer (Blue Square) - Near Output
        { "shape": "rect", "x": 5.5, "y": 3.5, "w": 2, "h": 2, "fill": "#0277bd", "rx": 1 },
        // Potentiometer Screw (Silver)
        { "shape": "circle", "cx": 6.5, "cy": 4.5, "r": 0.4, "fill": "#ccc", "stroke": "#999" },
        // Main IC (Black) - Near Input
        { "shape": "rect", "x": 1.5, "y": 1.5, "w": 1.5, "h": 1.5, "fill": "#111" },
        // Input Caps
        { "shape": "rect", "x": 0.5, "y": 2.0, "w": 0.8, "h": 2.0, "fill": "#aaa", "rx": 0.5 },
        // Output Caps
        { "shape": "rect", "x": 6.5, "y": 2.0, "w": 0.8, "h": 2.0, "fill": "#aaa", "rx": 0.5 }
    ]
});