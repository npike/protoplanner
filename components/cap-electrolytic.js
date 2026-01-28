ComponentRegistry.register({
    "type": "cap-electrolytic",
    "name": "Electrolytic Capacitor",
    "category": "Passive",
    "pins": [
        { "dx": 0, "dy": 0, "label": "+" },
        { "dx": 1, "dy": 0, "label": "-" }
    ],
    "body": {
        "width": 2.0,
        "height": 2.0,
        "offsetX": -0.5,
        "offsetY": -1.0,
        "fill": "#333",
        "stroke": "#111",
        "rx": 10 // Circular body
    },
    "visuals": [
        // Negative stripe
        { "shape": "rect", "x": 0.5, "y": -1.0, "w": 0.5, "h": 2.0, "fill": "#888" },
        // Minus signs on stripe
        { "shape": "line", "x1": 0.6, "y1": -0.5, "x2": 0.9, "y2": -0.5, "stroke": "#333", "stroke-width": 1 },
        { "shape": "line", "x1": 0.6, "y1": 0.5, "x2": 0.9, "y2": 0.5, "stroke": "#333", "stroke-width": 1 }
    ]
});
