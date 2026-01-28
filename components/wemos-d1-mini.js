ComponentRegistry.register({
    "type": "wemos-d1-mini",
    "name": "Wemos D1 Mini",
    "category": "Microcontrollers",
    "pins": [
        { "dx": 0, "dy": 0, "label": "RST" }, { "dx": 0, "dy": 1, "label": "A0" }, { "dx": 0, "dy": 2, "label": "D0" }, { "dx": 0, "dy": 3, "label": "D5" }, 
        { "dx": 0, "dy": 4, "label": "D6" }, { "dx": 0, "dy": 5, "label": "D7" }, { "dx": 0, "dy": 6, "label": "D8" }, { "dx": 0, "dy": 7, "label": "G" },
        { "dx": 9, "dy": 0, "label": "TX" }, { "dx": 9, "dy": 1, "label": "RX" }, { "dx": 9, "dy": 2, "label": "D1" }, { "dx": 9, "dy": 3, "label": "D2" }, 
        { "dx": 9, "dy": 4, "label": "D3" }, { "dx": 9, "dy": 5, "label": "D4" }, { "dx": 9, "dy": 6, "label": "G" }, { "dx": 9, "dy": 7, "label": "5V" }
    ],
    "body": {
        "width": 10.1,
        "height": 13.5,
        "offsetX": -0.55,
        "offsetY": -1.5,
        "fill": "#0055aa",
        "stroke": "#003388",
        "rx": 4
    },
    "visuals": [
        // Coordinates relative to anchor (0,0)
        { "shape": "rect", "x": 1.5, "y": -1.0, "w": 6, "h": 8, "fill": "#cccccc", "stroke": "#999", "rx": 2 },
        { "shape": "rect", "x": 2.0, "y": 9.5, "w": 5, "h": 2, "fill": "#aaa", "stroke": "#777", "rx": 1 }
    ]
});
