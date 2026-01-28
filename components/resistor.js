ComponentRegistry.register({
    "type": "resistor",
    "name": "Resistor",
    "category": "Passive",
    "isAxial": true,
    "pins": [
        { "dx": 0, "dy": 0 },
        { "dx": 0, "dy": 3 }
    ],
    "body": {
        "width": 0.8,
        "height": 2.0,
        "offsetX": -0.4,
        "offsetY": 0.5,
        "fill": "#d2b48c",
        "stroke": "#8b4513",
        "rx": 2
    },
    "visuals": [
        { "shape": "rect", "x": -0.4, "y": 0.8, "w": 0.8, "h": 0.2, "fill": "#8b4513" },
        { "shape": "rect", "x": -0.4, "y": 1.2, "w": 0.8, "h": 0.2, "fill": "#ff0000" },
        { "shape": "rect", "x": -0.4, "y": 1.6, "w": 0.8, "h": 0.2, "fill": "#ff00ff" },
        { "shape": "line", "x1": 0, "y1": 0, "x2": 0, "y2": 0.5, "stroke": "#aaa", "stroke-width": 2 },
        { "shape": "line", "x1": 0, "y1": 2.5, "x2": 0, "y2": 3, "stroke": "#aaa", "stroke-width": 2 }
    ]
});