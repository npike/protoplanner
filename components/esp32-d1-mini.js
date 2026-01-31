ComponentRegistry.register({
    "type": "esp32-d1-mini",
    "name": "ESP32 D1 Mini (Type-C)",
    "category": "Microcontrollers",
    "pins": [
        // Outer Left Row (GPIOs)
        { "dx": 0, "dy": 0, "label": "22" }, { "dx": 0, "dy": 1, "label": "21" }, { "dx": 0, "dy": 2, "label": "17" }, { "dx": 0, "dy": 3, "label": "16" },
        { "dx": 0, "dy": 4, "label": "19" }, { "dx": 0, "dy": 5, "label": "23" }, { "dx": 0, "dy": 6, "label": "5" }, { "dx": 0, "dy": 7, "label": "3V3" },

        // Inner Left Row (D1 Mini Compatible)
        { "dx": 1, "dy": 0, "label": "RST" }, { "dx": 1, "dy": 1, "label": "A0" }, { "dx": 1, "dy": 2, "label": "D0" }, { "dx": 1, "dy": 3, "label": "D5" },
        { "dx": 1, "dy": 4, "label": "D6" }, { "dx": 1, "dy": 5, "label": "D7" }, { "dx": 1, "dy": 6, "label": "D8" }, { "dx": 1, "dy": 7, "label": "3V3" },

        // Inner Right Row (D1 Mini Compatible)
        { "dx": 10, "dy": 0, "label": "TX" }, { "dx": 10, "dy": 1, "label": "RX" }, { "dx": 10, "dy": 2, "label": "D1" }, { "dx": 10, "dy": 3, "label": "D2" },
        { "dx": 10, "dy": 4, "label": "D3" }, { "dx": 10, "dy": 5, "label": "D4" }, { "dx": 10, "dy": 6, "label": "G" }, { "dx": 10, "dy": 7, "label": "5V" },

        // Outer Right Row (GPIOs)
        { "dx": 11, "dy": 0, "label": "27" }, { "dx": 11, "dy": 1, "label": "14" }, { "dx": 11, "dy": 2, "label": "12" }, { "dx": 11, "dy": 3, "label": "13" },
        { "dx": 11, "dy": 4, "label": "15" }, { "dx": 11, "dy": 5, "label": "2" }, { "dx": 11, "dy": 6, "label": "4" }, { "dx": 11, "dy": 7, "label": "G" }
    ],
    "body": {
        "width": 12.1,
        "height": 14.5,
        "offsetX": -0.55,
        "offsetY": -2.0,
        "fill": "#333", // Black PCB commonly
        "stroke": "#111",
        "rx": 2
    },
    "visuals": [
        // ESP32-WROOM-32 Module (Gold/Silver Shield)
        { "shape": "rect", "x": 1.5, "y": -1.5, "w": 7, "h": 9, "fill": "#ccc", "stroke": "#999", "rx": 1 },
        { "shape": "rect", "x": 4.0, "y": -1.5, "w": 2, "h": 1, "fill": "#000", "stroke": "none" }, // Antenna area (black usually)
        
        // USB-C Connector (Silver, Oval-ish)
        { "shape": "rect", "x": 3.5, "y": 10.5, "w": 3, "h": 1.5, "fill": "#ddd", "stroke": "#aaa", "rx": 0.5 },
        
        // Reset Button (Side or Top, usually small silver/black rect)
        { "shape": "rect", "x": 10.5, "y": 8.0, "w": 1, "h": 1, "fill": "#fff", "stroke": "#999", "rx": 0.2 }
    ]
});
