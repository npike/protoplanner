ComponentRegistry.register({
    "type": "mosfet-n",
    "name": "N-MOSFET (TO-220)",
    "category": "Transistors",
    "pins": [
        { "dx": 0, "dy": 0, "label": "G" },
        { "dx": 1, "dy": 0, "label": "D" },
        { "dx": 2, "dy": 0, "label": "S" }
    ],
    "body": {
        "width": 3.0,
        "height": 1.2,
        "offsetX": -0.5,
        "offsetY": -0.6,
        "fill": "#333",
        "stroke": "#111",
        "rx": 1
    },
    "visuals": [
        // Metal Tab (Heatsink) - Center on body which is 3 wide starting at -0.5
        { "shape": "rect", "x": -0.5, "y": -1.0, "w": 3.0, "h": 0.4, "fill": "#aaa", "stroke": "#888" },
        // Hole in tab
        { "shape": "circle", "cx": 1, "cy": -0.7, "r": 0.3, "fill": "#1a1a1a", "stroke": "#444" }
    ]
});
