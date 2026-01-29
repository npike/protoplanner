class ComponentManager {
    constructor(boards) {
        this.boards = Array.isArray(boards) ? boards : [boards];
        this.components = [];
    }

    get primaryBoard() { return this.boards[0]; }

    addComponent(type, x, y, board = this.primaryBoard) {
        const def = ComponentRegistry.get(type);
        if (!def) return;
        const h = board.getNearestHole(x, y);
        if (h) this.createComponent(def, h, board);
    }

    createComponent(def, anchorHole, board = this.primaryBoard) {
        const mountedSide = board.side;
        const initialPitch = def.pins.length > 1 ? (def.pins[1].dy - def.pins[0].dy) : 0;
        
        const pinIds = this.calculatePinIds(def, anchorHole, 0, initialPitch, mountedSide, board);
        if (!pinIds) return console.warn("Doesn't fit");

        const compId = `comp_${Date.now()}`;
        this.components.push({ 
            id: compId, type: def.type, pinIds, 
            rotation: 0, pitch: initialPitch, anchorId: anchorHole.id, mountedSide, locked: false,
            customLabel: "", selected: false 
        });
        
        this.renderAll();
    }

    calculatePinIds(def, anchorHole, rotation, pitch, side, board = this.primaryBoard) {
        const pinIds = [];
        const lxAnchor = anchorHole.lx;
        const lyAnchor = anchorHole.ly;
        
        for (let i = 0; i < def.pins.length; i++) {
            const off = { ...def.pins[i] };
            if (def.isAxial && i === 1) off.dy = pitch;
            const rot = this.rotateVector(off.dx, off.dy, rotation);
            const h = board.getHoleByLogical(lxAnchor + rot.x, lyAnchor + rot.y);
            if (!h) return null;
            pinIds.push(h.id);
        }
        return pinIds;
    }

    renderComponent(comp, board) {
        const def = ComponentRegistry.get(comp.type);
        const g = Utils.createSVGElement('g', { class: 'component', 'data-id': comp.id, cursor: 'grab' });
        const vPos = board.getHoleCoords(comp.anchorId, comp.mountedSide);
        
        const bX = vPos.cx + (def.body.offsetX * board.pitch);
        const bY = vPos.cy + (def.body.offsetY * board.pitch);
        
        g.appendChild(Utils.createSVGElement('rect', {
            x: bX, y: bY, width: def.body.width * board.pitch, height: def.body.height * board.pitch,
            fill: def.body.fill, stroke: def.body.stroke, rx: def.body.rx || 0
        }));

        def.visuals.forEach(vis => {
            if (vis.shape === 'rect') {
                const vx = comp.mountedSide === 'top' ? vis.x : (-vis.x - vis.w);
                g.appendChild(Utils.createSVGElement('rect', {
                    x: vPos.cx + (vx * board.pitch), y: vPos.cy + (vis.y * board.pitch),
                    width: vis.w * board.pitch, height: vis.h * board.pitch, fill: vis.fill, rx: vis.rx || 0
                }));
            } else if (vis.shape === 'circle') {
                const cx = vPos.cx + ((comp.mountedSide === 'top' ? vis.cx : -vis.cx) * board.pitch);
                g.appendChild(Utils.createSVGElement('circle', { cx, cy: vPos.cy + (vis.cy * board.pitch), r: vis.variant === 'screw' ? 5 : (vis.r * board.pitch), fill: vis.fill, stroke: vis.stroke }));
            } else if (vis.shape === 'line') {
                const vx1 = comp.mountedSide === 'top' ? vis.x1 : -vis.x1;
                const vx2 = comp.mountedSide === 'top' ? vis.x2 : -vis.x2;
                let vy2 = vis.y2; if (def.isAxial && vis.y2 === def.pins[1].dy) vy2 = comp.pitch;
                g.appendChild(Utils.createSVGElement('line', {
                    x1: vPos.cx + (vx1 * board.pitch), y1: vPos.cy + (vis.y1 * board.pitch),
                    x2: vPos.cx + (vx2 * board.pitch), y2: vPos.cy + (vy2 * board.pitch),
                    stroke: vis.stroke, 'stroke-width': vis['stroke-width'] || 1
                }));
            }
        });

        def.pins.forEach((off, i) => {
            let dy = off.dy; if (def.isAxial && i === 1) dy = comp.pitch;
            const cx = vPos.cx + ((comp.mountedSide === 'top' ? off.dx : -off.dx) * board.pitch);
            const cy = vPos.cy + (dy * board.pitch);
            g.appendChild(Utils.createSVGElement('circle', { cx, cy, r: 3, fill: off.label === '5V' ? '#f00' : '#ffd700', opacity: 0.5 }));
            if (off.label) {
                const isR = off.dx > 4;
                const tx = cx + (comp.mountedSide === 'top' ? (isR ? -8 : 8) : (isR ? 8 : -8));
                const text = Utils.createSVGElement('text', { x: tx, y: cy+2, fill: 'white', 'font-size': '6px', 'text-anchor': (comp.mountedSide === 'top' ? (isR ? 'end' : 'start') : (isR ? 'start' : 'end')), 'font-family': 'sans-serif' });
                text.textContent = off.label;
                const vRot = comp.mountedSide === 'top' ? comp.rotation : -comp.rotation;
                text.setAttribute('transform', `rotate(${-vRot}, ${tx}, ${cy+2})`);
                g.appendChild(text);
            }
        });

        if (comp.customLabel) {
            const labelY = bY - 5, labelX = bX + (def.body.width * board.pitch / 2);
            const t = Utils.createSVGElement('text', { x: labelX, y: labelY, fill: '#00aaff', 'font-weight': 'bold', 'font-size': '10px', 'text-anchor': 'middle', 'font-family': 'sans-serif' });
            t.textContent = comp.customLabel;
            const vRot = comp.mountedSide === 'top' ? comp.rotation : -comp.rotation;
            t.setAttribute('transform', `rotate(${-vRot}, ${labelX}, ${labelY})`);
            g.appendChild(t);
        }

        const vRot = comp.mountedSide === 'top' ? comp.rotation : -comp.rotation;
        g.setAttribute('transform', `rotate(${vRot}, ${vPos.cx}, ${vPos.cy})`);
        
        if (comp.locked) g.classList.add('locked');
        if (comp.selected) g.classList.add('selected');

        return g;
    }

    renderAll() {
        this.boards.forEach(board => {
            const side = board.side;
            board.componentLayer.innerHTML = '';
            this.components.forEach(comp => {
                if (comp.mountedSide === side) {
                    const el = this.renderComponent(comp, board);
                    board.componentLayer.appendChild(el);
                } else {
                    const g = Utils.createSVGElement('g', { class: 'component-pins', 'data-id': comp.id });
                    const def = ComponentRegistry.get(comp.type);
                    comp.pinIds.forEach((id, i) => {
                        const h = board.getHoleCoords(id, side);
                        if (h) {
                            const pin = Utils.createSVGElement('circle', { 
                                cx: h.cx, cy: h.cy, r: 4, fill: '#aaa', stroke: '#666',
                                class: 'pin-hover-target',
                                'data-comp-name': def.name,
                                'data-pin-label': def.pins[i].label || ""
                            });
                            if (comp.selected) {
                                pin.classList.add('pin-highlight');
                            }
                            g.appendChild(pin);
                        }
                    });
                    board.componentLayer.appendChild(g);
                }
            });
        });
    }

    renderGhost(type, anchorHole, rotation = 0, pitch = null, board = this.primaryBoard) {
        this.clearGhost();
        const def = ComponentRegistry.get(type);
        if (!def || !anchorHole) return;

        const effectivePitch = pitch !== null ? pitch : (def.pins.length > 1 ? (def.pins[1].dy - def.pins[0].dy) : 0);
        const pinIds = this.calculatePinIds(def, anchorHole, rotation, effectivePitch, board.side, board);
        const isValid = !!pinIds;

        const g = Utils.createSVGElement('g', { class: 'component-ghost', opacity: 0.6 });
        const vPos = board.getHoleCoords(anchorHole.id, board.side);
        
        // Body
        const fill = isValid ? def.body.fill : '#ff0000';
        const stroke = isValid ? def.body.stroke : '#990000';

        g.appendChild(Utils.createSVGElement('rect', {
            x: vPos.cx + (def.body.offsetX * board.pitch), 
            y: vPos.cy + (def.body.offsetY * board.pitch), 
            width: def.body.width * board.pitch, height: def.body.height * board.pitch,
            fill: fill, stroke: stroke, rx: def.body.rx || 0
        }));

        const vRot = board.side === 'top' ? rotation : -rotation;
        g.setAttribute('transform', `rotate(${vRot}, ${vPos.cx}, ${vPos.cy})`);
        board.ghostLayer.appendChild(g);
    }

    clearGhost() {
        this.boards.forEach(b => b.ghostLayer.innerHTML = '');
    }

    moveComponent(id, anchor, board = this.primaryBoard) {
        const comp = this.getComponentById(id);
        if (!comp || comp.locked) return false;
        const def = ComponentRegistry.get(comp.type);
        const pinIds = this.calculatePinIds(def, anchor, comp.rotation, comp.pitch, board.side, board);
        if (!pinIds) return false;
        comp.anchorId = anchor.id; comp.pinIds = pinIds;
        this.renderAll();
        return true;
    }

    rotateComponent(id) {
        const comp = this.getComponentById(id);
        if (!comp || comp.locked) return;
        const def = ComponentRegistry.get(comp.type);
        const anchor = this.primaryBoard.getHoleById(comp.anchorId);
        const nextRot = (comp.rotation + 90) % 360;
        const pinIds = this.calculatePinIds(def, anchor, nextRot, comp.pitch, comp.mountedSide, this.primaryBoard);
        if (!pinIds) return;
        comp.rotation = nextRot; comp.pinIds = pinIds;
        this.renderAll();
    }

    adjustPitch(id, delta) {
        const comp = this.getComponentById(id);
        if (!comp || comp.locked) return;
        const def = ComponentRegistry.get(comp.type);
        if (!def.isAxial) return;
        const nextP = Math.max(1, Math.min(15, comp.pitch + delta));
        const anchor = this.primaryBoard.getHoleById(comp.anchorId);
        const pinIds = this.calculatePinIds(def, anchor, comp.rotation, nextP, comp.mountedSide, this.primaryBoard);
        if (!pinIds) return;
        comp.pitch = nextP; comp.pinIds = pinIds;
        this.renderAll();
    }

    setCustomLabel(id, label) {
        const comp = this.getComponentById(id);
        if (comp) { comp.customLabel = label; this.renderAll(); }
    }

    serialize() {
        return this.components.map(c => ({
            t: c.type, a: c.anchorId, r: c.rotation, p: c.pitch, s: c.mountedSide, l: c.customLabel, k: c.locked
        }));
    }

    deserialize(data) {
        this.clear(true);
        data.forEach(d => {
            const def = ComponentRegistry.get(d.t);
            const anchor = this.primaryBoard.getHoleById(d.a);
            if (def && anchor) {
                const pinIds = this.calculatePinIds(def, anchor, d.r, d.p, d.s, this.primaryBoard);
                if (pinIds) {
                    this.components.push({
                        id: `comp_${Date.now()}_${Math.random()}`,
                        type: d.t, pinIds,
                        rotation: d.r, pitch: d.p, anchorId: d.a, mountedSide: d.s, locked: !!d.k,
                        customLabel: d.l || "", selected: false
                    });
                }
            }
        });
        this.renderAll();
    }

    rotateVector(x, y, deg) {
        if (deg === 90) return { x: -y, y: x };
        if (deg === 180) return { x: -x, y: -y };
        if (deg === 270) return { x: y, y: -x };
        return { x, y };
    }

    getComponentById(id) { return this.components.find(c => c.id === id); }
    setSelection(id, isSel) {
        const comp = this.getComponentById(id);
        if (comp) {
            comp.selected = isSel;
            this.renderAll();
        }
    }
    toggleLock(id) {
        const comp = this.getComponentById(id);
        if (comp) { 
            comp.locked = !comp.locked; 
            this.renderAll();
            return comp.locked; 
        }
        return false;
    }
    removeComponent(id) {
        const index = this.components.findIndex(c => c.id === id);
        if (index > -1) {
            this.components.splice(index, 1);
            this.renderAll();
        }
    }
    clear(silent = false) {
        this.components = [];
        if (!silent) this.renderAll();
    }

    getPreviewSVG(type) {
        const def = ComponentRegistry.get(type);
        const svg = Utils.createSVGElement('svg', { width: '100%', height: '100%', viewBox: '0 0 100 100', preserveAspectRatio: 'xMidYMid meet' });
        const g = Utils.createSVGElement('g'), p = 15;
        const bX = 50 + (def.body.offsetX * p), bY = 50 + (def.body.offsetY * p);
        g.appendChild(Utils.createSVGElement('rect', { x: bX, y: bY, width: def.body.width * p, height: def.body.height * p, fill: def.body.fill, stroke: def.body.stroke, rx: def.body.rx || 0 }));
        def.visuals.forEach(v => {
            if (v.shape === 'rect') g.appendChild(Utils.createSVGElement('rect', { x: bX + (v.x * p), y: bY + (v.y * p), width: v.w * p, height: v.h * p, fill: v.fill }));
            if (v.shape === 'circle') g.appendChild(Utils.createSVGElement('circle', { cx: 50 + (v.cx * p), cy: 50 + (v.cy * p), r: v.variant === 'screw' ? 4 : (v.r * p), fill: v.fill, stroke: v.stroke }));
            if (v.shape === 'line') g.appendChild(Utils.createSVGElement('line', { x1: 50 + (v.x1 * p), y1: 50 + (v.y1 * p), x2: 50 + (v.x2 * p), y2: 50 + (v.y2 * p), stroke: v.stroke, 'stroke-width': v['stroke-width'] || 1 }));
        });
        svg.appendChild(g);
        svg.setAttribute('viewBox', `${bX-5} ${bY-5} ${def.body.width*p + 10} ${def.body.height*p + 10}`);
        return svg;
    }
}