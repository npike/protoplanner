ComponentRegistry.register({
    "type": "cap-ceramic",
    "name": "Ceramic Capacitor",
    "category": "Passive",
    "pins": [
        { "dx": 0, "dy": 0 },
        { "dx": 1, "dy": 0 }
    ],
    "body": {
        "width": 1.2,
        "height": 0.6,
        "offsetX": -0.1,
        "offsetY": -0.3,
        "fill": "#ffcc80", // Light orange
        "stroke": "#ef6c00", // Dark orange
        "rx": 2
    },
    "visuals": [
        // Small center circle decoration
        { "shape": "circle", "cx": 0.5, "cy": 0, "r": 0.1, "fill": "rgba(0,0,0,0.1)" }
    ]
});
