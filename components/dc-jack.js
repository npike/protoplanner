ComponentRegistry.register({
    "type": "dc-jack",
    "name": "DC Barrel Jack",
    "category": "Power",
    "pins": [
        { "dx": 0, "dy": 0, "label": "+" },
        { "dx": 0, "dy": 2 },
        { "dx": 0, "dy": 4, "label": "-" }
    ],
    "body": {
        "width": 4,
        "height": 6,
        "offsetX": -2,
        "offsetY": -0.5,
        "fill": "#111",
        "stroke": "#000",
        "rx": 2
    },
    "visuals": [
        { "shape": "rect", "x": -1.4, "y": 5, "w": 2.8, "h": 1, "fill": "#444" },
        { "shape": "circle", "cx": 0, "cy": 5.5, "r": 0.8, "fill": "#222", "stroke": "#555" }
    ]
});
