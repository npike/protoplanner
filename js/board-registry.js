const BoardRegistry = {
    "electro-cookie-30": {
        "name": "ElectroCookie 30-Row Breadboard Style",
        "rows": 30,
        "colsLayout": [1, 2, 4, 5, 6, 7, 8, 11, 12, 13, 14, 15, 17, 18],
        "colNames": ['L+', 'L-', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'R+', 'R-'],
        "widthUnits": 19, 
        "heightUnits": 33,
        "grooveX": 9.5,
        "rails": [
            { "lx": 1, "type": "+", "orientation": "v" }, { "lx": 2, "type": "-", "orientation": "v" },
            { "lx": 17, "type": "+", "orientation": "v" }, { "lx": 18, "type": "-", "orientation": "v" }
        ],
        "extraHoles": [
            { "lx": 9, "ly": -2.5, "id": "top_1" }, { "lx": 10, "ly": -2.5, "id": "top_2" },
            { "lx": 9, "ly": 31.5, "id": "bottom_1" }, { "lx": 10, "ly": 31.5, "id": "bottom_2" }
        ],
        "strips": [
            { "type": "h", "startLX": 4, "endLX": 8 },
            { "type": "h", "startLX": 11, "endLX": 15 }
        ],
        "mountingHoles": [
            { "lx": 9.5, "ly": 0, "r": 12 }, 
            { "lx": 9.5, "ly": 29, "r": 12 },
            { "lx": 3, "ly": -1, "r": 8 }, { "lx": 16, "ly": -1, "r": 8 },
            { "lx": 3, "ly": 30, "r": 8 }, { "lx": 16, "ly": 30, "r": 8 }
        ],
        "isBreadboard": true
    },
    "electro-cookie-snappable": {
        "name": "ElectroCookie Snappable Mini (20x20)",
        "rows": 17,
        "cols": 19,
        "hideLabels": true,
        "widthUnits": 19, 
        "heightUnits": 17,
        "mountingHoles": [
            { "lx": -0.2, "ly": -0.2, "r": 8 }, { "lx": 18.2, "ly": -0.2, "r": 8 },
            { "lx": -0.2, "ly": 16.2, "r": 8 }, { "lx": 18.2, "ly": 16.2, "r": 8 }
        ],
        "isSnappable": true
    },
    "electro-cookie-mini": {
        "name": "ElectroCookie Mini (17-Row)",
        "rows": 17,
        "colsLayout": [1, 2, 3, 4, 5, 8, 9, 10, 11, 12],
        "colNames": ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
        "widthUnits": 14, 
        "heightUnits": 20,
        "grooveX": 6.5,
        "rails": [],
        "extraHoles": [],
        "strips": [
            { "type": "h", "startLX": 1, "endLX": 5 },
            { "type": "h", "startLX": 8, "endLX": 12 }
        ],
        "mountingHoles": [
            { "lx": 0, "ly": -1, "r": 8 }, { "lx": 13, "ly": -1, "r": 8 },
            { "lx": 0, "ly": 17, "r": 8 }, { "lx": 13, "ly": 17, "r": 8 }
        ],
        "isBreadboard": true
    }
};