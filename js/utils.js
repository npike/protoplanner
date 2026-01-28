const Utils = {
    // SVG Namespace
    SVG_NS: "http://www.w3.org/2000/svg",

    // Create an SVG element with attributes
    createSVGElement: (type, attributes = {}) => {
        const el = document.createElementNS(Utils.SVG_NS, type);
        for (const key in attributes) {
            el.setAttribute(key, attributes[key]);
        }
        return el;
    },

    // Convert screen coordinates to SVG coordinates
    getSVGCoordinates: (svgElement, event) => {
        const pt = svgElement.createSVGPoint();
        pt.x = event.clientX;
        pt.y = event.clientY;
        return pt.matrixTransform(svgElement.getScreenCTM().inverse());
    },
    
    // Snap to grid (if we need to enforce arbitrary snapping, though we mostly snap to holes)
    snapToGrid: (value, gridSize) => {
        return Math.round(value / gridSize) * gridSize;
    }
};
