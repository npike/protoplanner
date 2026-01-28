ComponentRegistry.register({
    "type": "dip-switch-4",
    "name": "DIP Switch (4-pos)",
    "category": "Switches",
    "pins": [
        // Left side
        { "dx": 0, "dy": 0, "label": "1" },
        { "dx": 0, "dy": 1, "label": "2" },
        { "dx": 0, "dy": 2, "label": "3" },
        { "dx": 0, "dy": 3, "label": "4" },
        // Right side
        { "dx": 3, "dy": 0 },
        { "dx": 3, "dy": 1 },
        { "dx": 3, "dy": 2 },
        { "dx": 3, "dy": 3 }
    ],
    "body": {
        "width": 4.0,
        "height": 4.5,
        "offsetX": -0.5,
        "offsetY": -0.5,
        "fill": "#d32f2f", // Red body
        "stroke": "#b71c1c",
        "rx": 1
    },
    "visuals": [
        // Switch slots (white backgrounds)
        { "shape": "rect", "x": 0.5, "y": 0, "w": 2.0, "h": 0.5, "fill": "#fff", "rx": 0.1 },
        { "shape": "rect", "x": 0.5, "y": 1, "w": 2.0, "h": 0.5, "fill": "#fff", "rx": 0.1 },
        { "shape": "rect", "x": 0.5, "y": 2, "w": 2.0, "h": 0.5, "fill": "#fff", "rx": 0.1 },
        { "shape": "rect", "x": 0.5, "y": 3, "w": 2.0, "h": 0.5, "fill": "#fff", "rx": 0.1 },
        // Slider handles (white squares) - showing them in "OFF" position (top)
        { "shape": "rect", "x": 0.7, "y": 0.05, "w": 0.6, "h": 0.4, "fill": "#eee", "stroke": "#ccc" },
        { "shape": "rect", "x": 0.7, "y": 1.05, "w": 0.6, "h": 0.4, "fill": "#eee", "stroke": "#ccc" },
        { "shape": "rect", "x": 0.7, "y": 2.05, "w": 0.6, "h": 0.4, "fill": "#eee", "stroke": "#ccc" },
        { "shape": "rect", "x": 0.7, "y": 3.05, "w": 0.6, "h": 0.4, "fill": "#eee", "stroke": "#ccc" },
        // "ON" labels
        { "shape": "rect", "x": 2.0, "y": -0.2, "w": 1.0, "h": 0.4, "fill": "transparent" } // Placeholder
    ]
});
