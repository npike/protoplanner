ComponentRegistry.register({
    "type": "tactile-switch",
    "name": "Tactile Switch",
    "category": "Buttons",
    "pins": [
        // Standard 6x6mm tactile button has 4 pins. 
        // Pins 1 & 2 are connected, Pins 3 & 4 are connected.
        // Horizontal spacing: 0.2" (2 units), Vertical spacing: 0.2" (2 units)
        { "dx": 0, "dy": 0, "label": "1" },
        { "dx": 2, "dy": 0, "label": "2" },
        { "dx": 0, "dy": 2, "label": "3" },
        { "dx": 2, "dy": 2, "label": "4" }
    ],
    "body": {
        "width": 3.0,
        "height": 3.0,
        "offsetX": -0.5,
        "offsetY": -0.5,
        "fill": "#444", // Dark grey body
        "stroke": "#222",
        "rx": 1
    },
    "visuals": [
        // Main button plunger (Circle in center)
        { "shape": "circle", "cx": 1.0, "cy": 1.0, "r": 0.8, "fill": "#111", "stroke": "#000" },
        // Decorative corner metal tabs
        { "shape": "rect", "x": -0.2, "y": -0.2, "w": 0.4, "h": 0.4, "fill": "#aaa", "rx": 0.1 },
        { "shape": "rect", "x": 1.8, "y": -0.2, "w": 0.4, "h": 0.4, "fill": "#aaa", "rx": 0.1 },
        { "shape": "rect", "x": -0.2, "y": 1.8, "w": 0.4, "h": 0.4, "fill": "#aaa", "rx": 0.1 },
        { "shape": "rect", "x": 1.8, "y": 1.8, "w": 0.4, "h": 0.4, "fill": "#aaa", "rx": 0.1 }
    ]
});
