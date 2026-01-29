# Proto Planner
**Version: v1.3**


Proto Planner is a simple utility designed to assist in transferring circuits from a breadboard to a protoboard. While there are numerous tools available for transitioning projects from breadboards to schematics or printed circuit boards (PCBs), finding a simple solution for the intermediate step of using protoboards proved difficult. This utility aims to fill that gap.

### Key Features

*   **Side-by-Side Dual View:** View both Top and Bottom sides of your board simultaneously for efficient planning of component placement and complex wiring.
*   **Customizable Wiring:** Draw wires in a variety of colors to organize and distinguish different signal paths.
*   **Component Management:** Rotate components for optimal layout and lock them in place to prevent accidental movement.
*   **URL-Based Sharing:** Project state is encoded directly into the URL. Simply copy and share the link to save your progress or send it to others.
*   **Privacy First:** Entirely local. No data is stored server-side; your designs live only in your browser and the URLs you create.

### Supported Protoboards

*   **ElectroCookie 30-row** breadboard style
*   **ElectroCookie Snappable Mini** (20x20)
*   **ElectroCookie Mini** (17 row)

### Component Library

A growing selection of common through-hole components is available:

*   **Passives:** Resistors, Ceramic Capacitors, Electrolytic Capacitors, Potentiometers
*   **Semiconductors & ICs:** Diodes, N-MOSFET (TO-220), NE555 Timer
*   **LEDs:** Red, Green, Blue, Yellow, and White
*   **Power:** DC Barrel Jacks, MP1584 Buck Converters
*   **Connectors & Switches:** Screw Terminals, Tactile Switches, 4-position DIP Switches
*   **Microcontrollers:** Wemos D1 Mini

## Screenshots

![Proto Planner Screenshot](screenshots/Screenshot%202026-01-28%20at%208.26.47%E2%80%AFPM.png)

## Usage and Limitations

This application is a single-page web app intended solely for planning the physical placement and wiring/soldering of components.

*   **No Validation:** The application does not perform any electrical validation of your circuit. It is a visual planning tool.
*   **Browser Support:** The application has been tested on Firefox. There are no guarantees regarding its performance or functionality on other web browsers.

## Development Note

This project was created with significant assistance from Gemini 3.

## Feedback

Please use the Issues section of this repository to report bugs or request new features.
