ComponentRegistry.register({
    "type": "ne555",
    "name": "NE555 Timer",
    "category": "ICs",
    "pins": [
        // Left Row (Top to Bottom)
        { "dx": 0, "dy": 0, "label": "GND" },
        { "dx": 0, "dy": 1, "label": "TRIG" },
        { "dx": 0, "dy": 2, "label": "OUT" },
        { "dx": 0, "dy": 3, "label": "RESET" },
        // Right Row (Top to Bottom) - Note: standard DIP numbering is counter-clockwise
        { "dx": 3, "dy": 0, "label": "VCC" },
        { "dx": 3, "dy": 1, "label": "DISCH" },
        { "dx": 3, "dy": 2, "label": "THRES" },
        { "dx": 3, "dy": 3, "label": "CONT" }
    ],
    "body": {
        "width": 4.0,
        "height": 4.5,
        "offsetX": -0.5,
        "offsetY": -0.5,
        "fill": "#222", // Matte Black Plastic
        "stroke": "#111",
        "rx": 1
    },
    "visuals": [
        // Orientation Notch (half circle at top)
        { "shape": "circle", "cx": 1.5, "cy": -0.5, "r": 0.4, "fill": "#111", "stroke": "#111" },
        // Dot near pin 1
        { "shape": "circle", "cx": 0.2, "cy": 0.2, "r": 0.15, "fill": "#444" }
    ]
});
