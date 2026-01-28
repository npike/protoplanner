ComponentRegistry.register({
    "type": "potentiometer",
    "name": "Potentiometer",
    "category": "Passive",
    "pins": [
        { "dx": 0, "dy": 0, "label": "1" },
        { "dx": 1, "dy": 0, "label": "2" },
        { "dx": 2, "dy": 0, "label": "3" }
    ],
    "body": {
        "width": 3.0,
        "height": 3.0,
        "offsetX": -0.5,
        "offsetY": -1.5,
        "fill": "#0277bd", // Blue body
        "stroke": "#01579b",
        "rx": 30 // Circular shape
    },
    "visuals": [
        // Shaft base
        { "shape": "circle", "cx": 1.0, "cy": 0, "r": 0.8, "fill": "#eee", "stroke": "#ccc" },
        // Shaft
        { "shape": "circle", "cx": 1.0, "cy": 0, "r": 0.5, "fill": "#ccc", "stroke": "#aaa" },
        // Indicator notch
        { "shape": "line", "x1": 1.0, "y1": -0.2, "x2": 1.0, "y2": -0.6, "stroke": "#333", "stroke-width": 2 }
    ]
});
