ComponentRegistry.register({
    "type": "screw-terminal-2",
    "name": "Screw Terminal",
    "category": "Connectors",
    "pins": [
        { "dx": 0, "dy": 0 },
        { "dx": 0, "dy": 2 }
    ],
    "body": {
        "width": 2.5,
        "height": 3.5,
        "offsetX": -1.25,
        "offsetY": -0.75,
        "fill": "#0066cc",
        "stroke": "#003366",
        "rx": 3
    },
    "visuals": [
        { "shape": "circle", "cx": 0, "cy": 0, "r": 5, "fill": "#ccc", "stroke": "#666", "variant": "screw" },
        { "shape": "circle", "cx": 0, "cy": 2, "r": 5, "fill": "#ccc", "stroke": "#666", "variant": "screw" }
    ]
});
