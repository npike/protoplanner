class Board {
    constructor(containerId, boardTypeId = "electro-cookie-30") {
        this.container = document.getElementById(containerId);
        this.pitch = 20; 
        this.holeRadius = 3;
        this.padRadius = 7;
        this.side = 'top'; 
        this.holes = []; 
        
        this.loadBoardDefinition(boardTypeId);
        this.init();
    }

    loadBoardDefinition(id) {
        const def = BoardRegistry[id];
        if (!def) return this.loadBoardDefinition("electro-cookie-30");
        
        this.currentDefId = id;
        this.def = def;
        this.widthUnits = def.widthUnits;
        this.heightUnits = def.heightUnits;
        this.rows = def.rows;

        this.width = (this.widthUnits - 1) * this.pitch;
        this.height = (this.heightUnits - 1) * this.pitch;
    }

    setBoardType(id) {
        this.loadBoardDefinition(id);
        this.container.innerHTML = '';
        this.init();
    }

    init() {
        const margin = 60; // Larger workspace margin
        this.svg = Utils.createSVGElement('svg', {
            width: this.width + margin * 2, 
            height: this.height + margin * 2, 
            viewBox: `${-margin} ${-margin} ${this.width + margin * 2} ${this.height + margin * 2}`
        });
        
        this.container.appendChild(this.svg);
        this.pcbLayer = Utils.createSVGElement('g', { id: 'pcb-layer' });
        this.copperLayer = Utils.createSVGElement('g', { id: 'copper-layer' });
        this.holeLayer = Utils.createSVGElement('g', { id: 'holes-layer' });
        this.labelLayer = Utils.createSVGElement('g', { id: 'labels-layer' });
        this.wireLayer = Utils.createSVGElement('g', { id: 'wire-layer' });
        this.componentLayer = Utils.createSVGElement('g', { id: 'component-layer' });
        this.ghostLayer = Utils.createSVGElement('g', { id: 'ghost-layer', style: 'pointer-events: none;' });
        
        this.svg.appendChild(this.pcbLayer);
        this.svg.appendChild(this.copperLayer);
        this.svg.appendChild(this.holeLayer);
        this.svg.appendChild(this.labelLayer);
        this.svg.appendChild(this.wireLayer);
        this.svg.appendChild(this.componentLayer);
        this.svg.appendChild(this.ghostLayer);

        const overlay = document.getElementById('view-overlay');
        const isMobile = document.body.classList.contains('mobile-mode');
        if (overlay && !isMobile) overlay.textContent = this.side.toUpperCase() + ' VIEW';

        this.render();
    }
    
    setSide(side) {
        if (this.side !== side) {
            this.side = side;
            const overlay = document.getElementById('view-overlay');
            const isMobile = document.body.classList.contains('mobile-mode');
            if (overlay && !isMobile) overlay.textContent = side.toUpperCase() + ' VIEW';
            this.render();
        }
    }
    
    getX(gridX, side = this.side) {
        const x = gridX * this.pitch;
        return side === 'bottom' ? (this.width - x) : x;
    }

    getVisualY(ly) {
        const offset = this.def.isSnappable ? 0 : 2.0;
        return (ly + offset) * this.pitch;
    }

    render() {
        this.pcbLayer.innerHTML = '';
        this.copperLayer.innerHTML = '';
        this.holeLayer.innerHTML = '';
        this.labelLayer.innerHTML = '';
        this.holes = [];

        this.renderPCB();
        if (this.side === 'bottom') this.renderCopper();
        this.renderHoles();
        this.renderLabels();
    }

    renderPCB() {
        const padding = 35; // Increased PCB padding to clear M3 holes
        this.pcbLayer.appendChild(Utils.createSVGElement('rect', {
            x: -padding, y: -padding, width: this.width + padding * 2, height: this.height + padding * 2, rx: 10, ry: 10,
            fill: this.side === 'top' ? '#1a1a1a' : '#222', stroke: '#333', 'stroke-width': 2
        }));

        if (this.def.grooveX) {
            const gX = this.getX(this.def.grooveX);
            this.pcbLayer.appendChild(Utils.createSVGElement('rect', {
                x: gX - 10, y: this.getVisualY(0) - 10, width: 20, height: (this.rows * this.pitch) + 20, fill: '#111', rx: 2
            }));
        }

        (this.def.mountingHoles || []).forEach(h => {
            this.pcbLayer.appendChild(Utils.createSVGElement('circle', {
                cx: this.getX(h.lx), cy: this.getVisualY(h.ly), r: h.r || 12, fill: '#1e1e1e', stroke: '#444', 'stroke-width': 2
            }));
        });
    }

    renderHoles() {
        if (this.def.isSnappable) {
            this.renderSnappableHoles();
        } else {
            this.renderBreadboardHoles();
        }
    }

    renderSnappableHoles() {
        for (let lx = 0; lx < 19; lx++) {
            for (let ly = 0; ly < 17; ly++) {
                if (this.isMountingHole(lx, ly)) continue;
                let isValid = false;
                if ((ly === 0 || ly === 16) && (lx >= 2 && lx <= 16)) isValid = true;
                if (ly >= 1 && ly <= 15) {
                    const isEdge = (lx === 0 || lx === 18), rank = Math.floor((ly - 1) / 3), subY = (ly - 1) % 3;
                    if (!isEdge) isValid = true;
                    else {
                        if (rank === 0 && subY >= 1) isValid = true;
                        else if (rank === 4 && subY <= 1) isValid = true;
                        else if (rank >= 1 && rank <= 3) isValid = true;
                    }
                }
                if (isValid) this.createHole(this.getX(lx), this.getVisualY(ly), `${lx}_${ly}`, lx, ly);
            }
        }
    }

    isMountingHole(lx, ly) {
        // Only clear holes that overlap the physical M3 mounting circle radius
        const dist = (x1, y1, x2, y2) => Math.sqrt((x1-x2)**2 + (y1-y2)**2);
        return (this.def.mountingHoles || []).some(m => dist(lx, ly, m.lx, m.ly) < 1.1);
    }

    renderBreadboardHoles() {
        for (let r = 0; r < this.rows; r++) {
            const cy = this.getVisualY(r);
            this.def.colsLayout.forEach((gridX, colIdx) => {
                this.createHole(this.getX(gridX), cy, `${colIdx}_${r}`, gridX, r);
            });
        }
        (this.def.extraHoles || []).forEach(h => {
            this.createHole(this.getX(h.lx), this.getVisualY(h.ly), h.id, h.lx, h.ly);
        });

        if (this.def.extraHoles && this.def.extraHoles.length > 0) {
            this.drawTrace(this.getVisualY(this.def.extraHoles[0].ly), '#ff4444');
            this.drawTrace(this.getVisualY(this.def.extraHoles[2].ly), '#4444ff');
        }
    }

    createHole(cx, cy, id, lx, ly) {
        this.holeLayer.appendChild(Utils.createSVGElement('circle', { cx, cy, r: this.padRadius, fill: '#d4af37', opacity: 0.8 }));
        const hEl = Utils.createSVGElement('circle', { cx, cy, r: this.holeRadius, fill: '#000', class: 'hole', 'data-id': id });
        this.holes.push({ id, lx, ly, cx, cy, element: hEl });
        this.holeLayer.appendChild(hEl);
    }

    renderCopper() {
        const copperColor = '#d4af37', traceWidth = 8;
        if (this.def.isSnappable) {
            [0, 16].forEach(ly => {
                this.copperLayer.appendChild(Utils.createSVGElement('line', { x1: this.getX(2), y1: this.getVisualY(ly), x2: this.getX(16), y2: this.getVisualY(ly), stroke: copperColor, 'stroke-width': traceWidth, 'stroke-linecap': 'round', opacity: 0.6 }));
            });
            for (let lx = 0; lx < 19; lx++) {
                const vx = this.getX(lx), isEdge = (lx === 0 || lx === 18);
                for (let rank = 0; rank < 5; rank++) {
                    const sY = 1 + (rank * 3);
                    if (isEdge) {
                        if (rank === 0) this.drawCopperLine(vx, this.getVisualY(2), this.getVisualY(3));
                        else if (rank === 4) this.drawCopperLine(vx, this.getVisualY(13), this.getVisualY(14));
                        else this.drawCopperLine(vx, this.getVisualY(sY), this.getVisualY(sY + 2));
                    } else this.drawCopperLine(vx, this.getVisualY(sY), this.getVisualY(sY + 2));
                }
            }
        } else {
            this.def.rails.forEach(rail => {
                const x = this.getX(rail.lx);
                this.copperLayer.appendChild(Utils.createSVGElement('line', { x1: x, y1: this.getVisualY(0) - 10, x2: x, y2: this.getVisualY(this.rows - 1) + 10, stroke: copperColor, 'stroke-width': traceWidth, 'stroke-linecap': 'round', opacity: 0.6 }));
            });
            for (let r = 0; r < this.rows; r++) {
                const vy = this.getVisualY(r);
                this.def.strips.forEach(s => {
                    this.copperLayer.appendChild(Utils.createSVGElement('line', { x1: this.getX(s.startLX), y1: vy, x2: this.getX(s.endLX), y2: vy, stroke: copperColor, 'stroke-width': traceWidth, 'stroke-linecap': 'round', opacity: 0.6 }));
                });
            }
        }
    }

    drawCopperLine(vx, vy1, vy2) {
        this.copperLayer.appendChild(Utils.createSVGElement('line', { x1: vx, y1: vy1, x2: vx, y2: vy2, stroke: '#d4af37', 'stroke-width': 8, 'stroke-linecap': 'round', opacity: 0.5 }));
    }

    drawTrace(y, color) {
        const line = Utils.createSVGElement('line', { x1: this.getX(1), y1: y, x2: this.getX(this.widthUnits - 2), y2: y, stroke: color, 'stroke-width': 2, opacity: 0.4 });
        this.holeLayer.insertBefore(line, this.holeLayer.firstChild);
    }

    renderLabels() {
        this.labelLayer.setAttribute('fill', '#fff');
        this.labelLayer.setAttribute('font-family', 'sans-serif');
        if (this.def.hideLabels) {
            if (this.def.isSnappable) {
                const yTop = this.getVisualY(0), yBot = this.getVisualY(16);
                const x = this.getX((this.widthUnits - 1) / 2);
                [{y:yTop, t:'+'}, {y:yBot, t:'+'}].forEach(r => {
                    const t = Utils.createSVGElement('text', { x, y: r.y, fill: '#f44', 'text-anchor':'middle', 'font-weight':'bold', 'font-size': 14, opacity: 0.3, 'dominant-baseline': 'central' });
                    t.textContent = r.t.repeat(10); this.labelLayer.appendChild(t);
                });
            }
            return;
        }
        
        const topY = this.getVisualY(-1), botY = this.getVisualY(this.rows);

        // 1. Row Numbers
        const colAIdx = this.def.colNames.indexOf('A');
        const colJIdx = this.def.colNames.indexOf('J');
        const xL = this.getX(this.def.colsLayout[colAIdx] - 1);
        const xR = this.getX(this.def.colsLayout[colJIdx] + 1);

        for (let r = 0; r < this.rows; r++) {
            const y = this.getVisualY(r) + 3;
            [xL, xR].forEach(x => {
                const t = Utils.createSVGElement('text', { x, y, 'text-anchor': 'middle', 'font-size': '9px' });
                t.textContent = r + 1; this.labelLayer.appendChild(t);
            });
        }
        this.def.colNames.forEach((name, ci) => {
            if (name.length > 1) return; 
            const x = this.getX(this.def.colsLayout[ci]);
            [topY, botY].forEach(y => {
                const t = Utils.createSVGElement('text', { x, y, 'text-anchor': 'middle', 'font-weight': 'bold', 'font-size': '10px', 'dominant-baseline': 'central' });
                t.textContent = name; this.labelLayer.appendChild(t);
            });
        });
        this.def.rails.forEach(rail => {
            const x = this.getX(rail.lx), color = rail.type === '+' ? '#f44' : '#44f';
            this.labelLayer.appendChild(Utils.createSVGElement('line', { x1: x, y1: this.getVisualY(0)-10, x2: x, y2: this.getVisualY(this.rows-1)+10, stroke: color, 'stroke-width': 2, opacity: 0.5 }));
            [{y:topY, side:'Top'}, {y:botY, side:'Bot'}].forEach(row => {
                const t = Utils.createSVGElement('text', { x, y: row.y, fill: color, 'text-anchor':'middle', 'font-weight':'bold', 'dominant-baseline': 'central' });
                t.textContent = rail.type; this.labelLayer.appendChild(t);
            });
        });
    }

    getHoleAt(vx, vy) {
        let closest = null, minDist = 15;
        this.holes.forEach(h => {
            const dx = h.cx - vx, dy = h.cy - vy;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < minDist) { minDist = dist; closest = h; }
        });
        return closest;
    }

    getHoleByLogical(lx, ly) {
        return this.holes.find(h => Math.abs(h.lx - lx) < 0.1 && Math.abs(h.ly - ly) < 0.1);
    }

    getNearestHole(vx, vy) {
        let closest = null, minDist = Infinity;
        this.holes.forEach(h => {
            const dx = h.cx - vx, dy = h.cy - vy;
            const d = Math.sqrt(dx*dx + dy*dy);
            if (d < minDist) { minDist = d; closest = h; }
        });
        return closest;
    }
    
    getHoleById(id) { return this.holes.find(h => h.id === id); }

    getHoleCoords(id, side) {
        const h = this.holes.find(x => x.id === id);
        if (!h) return null;
        const vx = side === 'bottom' ? (this.width - (h.lx * this.pitch)) : (h.lx * this.pitch);
        const vy = this.getVisualY(h.ly);
        return { cx: vx, cy: vy };
    }
}
