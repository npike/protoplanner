ComponentRegistry.register({
    "type": "screw-terminal-3",
    "name": "Screw Terminal (3-pin)",
    "category": "Connectors",
    "pins": [
        { "dx": 0, "dy": 0 },
        { "dx": 0, "dy": 2 },
        { "dx": 0, "dy": 4 }
    ],
    "body": {
        "width": 2.5,
        "height": 5.5,
        "offsetX": -1.25,
        "offsetY": -0.75,
        "fill": "#0066cc",
        "stroke": "#003366",
        "rx": 3
    },
    "visuals": [
        { "shape": "circle", "cx": 0, "cy": 0, "r": 5, "fill": "#ccc", "stroke": "#666", "variant": "screw" },
        { "shape": "circle", "cx": 0, "cy": 2, "r": 5, "fill": "#ccc", "stroke": "#666", "variant": "screw" },
        { "shape": "circle", "cx": 0, "cy": 4, "r": 5, "fill": "#ccc", "stroke": "#666", "variant": "screw" }
    ]
});
