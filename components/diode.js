ComponentRegistry.register({
    "type": "diode",
    "name": "Diode",
    "category": "Diodes",
    "isAxial": true,
    "pins": [
        { "dx": 0, "dy": 0, "label": "A" },
        { "dx": 0, "dy": 2, "label": "K" }
    ],
    "body": {
        "width": 0.6,
        "height": 1.2,
        "offsetX": -0.3,
        "offsetY": 0.4,
        "fill": "#f08080",
        "stroke": "#cd5c5c",
        "rx": 1
    },
    "visuals": [
        { "shape": "rect", "x": -0.3, "y": 0.5, "w": 0.6, "h": 0.25, "fill": "#000" },
        { "shape": "line", "x1": 0, "y1": 0, "x2": 0, "y2": 0.4, "stroke": "#aaa", "stroke-width": 2 },
        { "shape": "line", "x1": 0, "y1": 1.6, "x2": 0, "y2": 2, "stroke": "#aaa", "stroke-width": 2 }
    ]
});