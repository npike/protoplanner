class InteractionManager {
    constructor(board, componentManager) {
        this.board = board;
        this.compManager = componentManager;
        
        this.activeWire = null; 
        this.wires = [];
        this.currentColor = '#ff0000'; 

        // Dragging State
        this.isDraggingNew = false; // From sidebar
        this.draggedType = null;
        
        this.isDraggingExisting = false; // On board
        this.draggedComponentId = null;
        this.dragStartPos = { x: 0, y: 0 }; // Mouse pos
        
        // Selection State
        this.selectedItem = null; // { type: 'component'|'wire', id: '...' }
        this.wireModeEnabled = false;
        this.onStateChange = null;
        
        // Mobile Gesture State
        this.isGestureActive = false;
        this.touchState = {
            mode: null, // 'pan', 'pinch'
            startDist: 0,
            startViewBox: null,
            lastPan: { x: 0, y: 0 }
        };

        this.initListeners();
        this.initSidebarControls();
    }

    get wireLayer() { return this.board.wireLayer; }

    notifyChange() {
        if (this.onStateChange) this.onStateChange();
    }

    serialize() {
        return this.wires.map(w => ({
            s: w.start.id, e: w.end.id, c: w.element.getAttribute('stroke'), d: w.side
        }));
    }

    deserialize(data) {
        this.clear(true);
        data.forEach(d => {
            const startHole = this.board.getHoleById(d.s);
            const endHole = this.board.getHoleById(d.e);
            if (startHole && endHole) {
                const line = Utils.createSVGElement('line', {
                    x1: startHole.cx, y1: startHole.cy, x2: endHole.cx, y2: endHole.cy,
                    stroke: d.c, 'stroke-width': 4, 'stroke-linecap': 'round', class: 'wire'
                });
                const wireData = { id: `wire_${Date.now()}_${Math.random()}`, start: startHole, end: endHole, element: line, side: d.d };
                line.addEventListener('contextmenu', (e) => { e.preventDefault(); this.selectItem('wire', wireData.id); });
                this.wires.push(wireData);
                this.wireLayer.appendChild(line);
            }
        });
        this.renderWires();
    }

    initListeners() {
        // Global Keydown
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));

        // Board Interactions
        this.attachToBoard();
        
        // Sidebar Draggables (New Components)
        const draggables = document.querySelectorAll('.component-item');
        draggables.forEach(d => {
            d.addEventListener('dragstart', (e) => {
                this.isDraggingNew = true;
                this.draggedType = d.dataset.type;
                e.dataTransfer.setData('type', d.dataset.type);
            });
        });

        // Drop Zone
        this.board.container.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.board.container.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.board.container.addEventListener('drop', (e) => this.handleDrop(e));

        // Color Palette
        document.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.addEventListener('click', (e) => {
                document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
                swatch.classList.add('active');
                this.currentColor = swatch.dataset.color;
            });
        });

        // Custom Label Input
        const labelInput = document.getElementById('comp-label-input');
        if (labelInput) {
            labelInput.addEventListener('input', (e) => {
                if (this.selectedItem && this.selectedItem.type === 'component') {
                    this.compManager.setCustomLabel(this.selectedItem.id, e.target.value);
                    this.notifyChange();
                }
            });
        }
    }

    attachToBoard() {
        this.board.svg.addEventListener('click', (e) => this.handleBoardClick(e));
        this.board.svg.addEventListener('mousedown', (e) => this.handleBoardMouseDown(e));
        this.board.svg.addEventListener('mousemove', (e) => this.handleBoardMouseMove(e));
        this.board.svg.addEventListener('mouseup', (e) => this.handleBoardMouseUp(e));
        this.board.svg.addEventListener('dblclick', (e) => {
            const componentEl = e.target.closest('.component');
            if (componentEl) {
                const id = componentEl.dataset.id;
                const comp = this.compManager.getComponentById(id);
                if (comp && !comp.locked) {
                    this.compManager.rotateComponent(id);
                    this.notifyChange();
                }
                e.stopPropagation();
            }
        });

        // Touch Gestures (Pinch/Pan)
        this.board.svg.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.board.svg.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.board.svg.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    }
    
    initSidebarControls() {
        const btnRotate = document.getElementById('btn-rotate');
        const btnLock = document.getElementById('btn-lock');
        const btnDelete = document.getElementById('btn-delete');
        const btnFlip = document.getElementById('btn-flip');
        const btnWireMode = document.getElementById('btn-wire-mode');
        const btnPitchInc = document.getElementById('btn-pitch-inc');
        const btnPitchDec = document.getElementById('btn-pitch-dec');

        if(btnRotate) btnRotate.addEventListener('click', () => {
            if (this.selectedItem && this.selectedItem.type === 'component') {
                this.compManager.rotateComponent(this.selectedItem.id);
                this.notifyChange();
            }
        });
        if(btnLock) btnLock.addEventListener('click', () => {
            if (this.selectedItem && this.selectedItem.type === 'component') {
                const locked = this.compManager.toggleLock(this.selectedItem.id);
                this.updateSelectionUI(); 
                this.notifyChange();
            }
        });
        if(btnDelete) btnDelete.addEventListener('click', () => {
            this.deleteSelected();
        });
        if(btnFlip) btnFlip.addEventListener('click', () => {
            this.flipBoard();
        });
        if(btnWireMode) btnWireMode.addEventListener('click', () => {
            this.toggleWireMode();
        });
        if(btnPitchInc) btnPitchInc.addEventListener('click', () => {
            if (this.selectedItem && this.selectedItem.type === 'component') {
                this.compManager.adjustPitch(this.selectedItem.id, 1);
                this.notifyChange();
            }
        });
        if(btnPitchDec) btnPitchDec.addEventListener('click', () => {
            if (this.selectedItem && this.selectedItem.type === 'component') {
                this.compManager.adjustPitch(this.selectedItem.id, -1);
                this.notifyChange();
            }
        });
    }

    handleKeyDown(e) {
        if (e.key === 'Escape') {
            if (this.activeWire) {
                this.cancelWire();
            } else {
                this.deselectAll();
            }
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
            if (document.activeElement.tagName !== 'INPUT') {
                this.deleteSelected();
            }
        } else if (e.key.toLowerCase() === 'r') {
            if (this.selectedItem && this.selectedItem.type === 'component') {
                this.compManager.rotateComponent(this.selectedItem.id);
                this.notifyChange();
            }
        } else if (e.key.toLowerCase() === 'l') {
            if (this.selectedItem && this.selectedItem.type === 'component') {
                this.compManager.toggleLock(this.selectedItem.id);
                this.notifyChange();
            }
        } else if (e.key.toLowerCase() === 'f') {
            this.flipBoard();
        } else if (e.key.toLowerCase() === 'w') {
            this.toggleWireMode();
        } else if (e.key === '+' || e.key === '=') {
            if (this.selectedItem && this.selectedItem.type === 'component') {
                this.compManager.adjustPitch(this.selectedItem.id, 1);
                this.notifyChange();
            }
        } else if (e.key === '-' || e.key === '_') {
            if (this.selectedItem && this.selectedItem.type === 'component') {
                this.compManager.adjustPitch(this.selectedItem.id, -1);
                this.notifyChange();
            }
        }
    }

    toggleWireMode() {
        this.wireModeEnabled = !this.wireModeEnabled;
        const btn = document.getElementById('btn-wire-mode');
        if (btn) {
            btn.textContent = `Wire Mode: ${this.wireModeEnabled ? 'ON' : 'OFF'} (W)`;
            btn.style.background = this.wireModeEnabled ? '#007acc' : '#444';
        }
        this.board.svg.style.cursor = this.wireModeEnabled ? 'crosshair' : 'default';
        
        if (!this.wireModeEnabled && this.activeWire) {
            this.cancelWire();
        }
    }

    flipBoard() {
        const newSide = this.board.side === 'top' ? 'bottom' : 'top';
        this.board.setSide(newSide);
        this.compManager.renderAll(newSide);
        this.renderWires();
        this.deselectAll();
    }

    renderWires() {
        const currentSide = this.board.side;
        this.wires.forEach(wire => {
            if (wire.side === currentSide) {
                wire.element.style.display = 'block';
                const startHole = this.board.getHoleById(wire.start.id);
                const endHole = this.board.getHoleById(wire.end.id);
                wire.element.setAttribute('x1', startHole.cx);
                wire.element.setAttribute('y1', startHole.cy);
                wire.element.setAttribute('x2', endHole.cx);
                wire.element.setAttribute('y2', endHole.cy);
            } else {
                wire.element.style.display = 'none';
            }
        });
    }

    selectItem(type, id) {
        this.deselectAll();
        this.selectedItem = { type, id };
        if (type === 'component') {
            this.compManager.setSelection(id, true);
        } else if (type === 'wire') {
            const wire = this.wires.find(w => w.id === id);
            if (wire) wire.element.classList.add('selected');
        }
        this.updateSelectionUI();
    }

    deselectAll() {
        if (this.selectedItem) {
            if (this.selectedItem.type === 'component') {
                this.compManager.setSelection(this.selectedItem.id, false);
            } else if (this.selectedItem.type === 'wire') {
                const wire = this.wires.find(w => w.id === this.selectedItem.id);
                if (wire) wire.element.classList.remove('selected');
            }
        }
        this.selectedItem = null;
        this.updateSelectionUI();
    }

    updateSelectionUI() {
        const panel = document.getElementById('selection-panel');
        if (!panel) return;
        if (this.selectedItem) {
            panel.classList.add('visible');
            const isComp = this.selectedItem.type === 'component';
            const btnRotate = document.getElementById('btn-rotate');
            const btnLock = document.getElementById('btn-lock');
            const pitchControls = document.getElementById('pitch-controls');
            const typeLabel = document.getElementById('selected-type');
            const labelInput = document.getElementById('comp-label-input');
            const labelControl = document.getElementById('label-control');
            if (typeLabel) {
                if (isComp) {
                    const comp = this.compManager.getComponentById(this.selectedItem.id);
                    const def = ComponentRegistry.get(comp.type);
                    typeLabel.textContent = def.name;
                } else {
                    typeLabel.textContent = "Wire";
                }
            }
            if(btnRotate) btnRotate.style.display = isComp ? 'block' : 'none';
            if(btnLock) btnLock.style.display = isComp ? 'block' : 'none';
            if(labelControl) labelControl.style.display = isComp ? 'block' : 'none';
            if (isComp) {
                const comp = this.compManager.getComponentById(this.selectedItem.id);
                const def = ComponentRegistry.get(comp.type);
                if (pitchControls) pitchControls.style.display = def.isAxial ? 'block' : 'none';
                if (labelInput) labelInput.value = comp.customLabel || "";
            } else {
                if (pitchControls) pitchControls.style.display = 'none';
            }
        } else {
            panel.classList.remove('visible');
        }
    }

    deleteSelected() {
        if (!this.selectedItem) return;
        if (this.selectedItem.type === 'component') {
             const comp = this.compManager.getComponentById(this.selectedItem.id);
             if (comp && !comp.locked) {
                 this.compManager.removeComponent(this.selectedItem.id);
                 this.deselectAll();
                 this.notifyChange();
             }
        } else if (this.selectedItem.type === 'wire') {
            const wire = this.wires.find(w => w.id === this.selectedItem.id);
            if (wire) {
                this.removeWire(wire);
                this.deselectAll();
                this.notifyChange();
            }
        }
    }

    handleTouchStart(e) {
        if (e.touches.length === 2) {
            this.isGestureActive = true;
            this.touchState.mode = 'pinch';
            const p1 = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            const p2 = { x: e.touches[1].clientX, y: e.touches[1].clientY };
            this.touchState.startDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
            
            const vb = this.board.svg.getAttribute('viewBox').split(' ').map(parseFloat);
            this.touchState.startViewBox = { x: vb[0], y: vb[1], w: vb[2], h: vb[3] };
        } else if (e.touches.length === 1 && !this.touchState.mode) {
            // Only pan if not already pinching
             // Check if we are starting a drag on a component
             if (e.target.closest('.component') && !document.body.classList.contains('mobile-mode')) return;
             
             // In mobile mode, we prioritize pan over component drag unless it's a specific "long press" or handle, 
             // but for now, let's allow panning if we touch background.
             // If we touch a component in mobile mode, we might want to select it (tap). 
             // We'll differentiate tap vs pan by movement distance.
             
            this.touchState.mode = 'pan';
            this.touchState.lastPan = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            
            const vb = this.board.svg.getAttribute('viewBox').split(' ').map(parseFloat);
            this.touchState.startViewBox = { x: vb[0], y: vb[1], w: vb[2], h: vb[3] };
        }
    }

    handleTouchMove(e) {
        if (this.touchState.mode === 'pinch' && e.touches.length === 2) {
            e.preventDefault();
            this.isGestureActive = true;
            
            const p1 = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            const p2 = { x: e.touches[1].clientX, y: e.touches[1].clientY };
            const currentDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
            
            if (this.touchState.startDist > 0) {
                const scale = this.touchState.startDist / currentDist;
                const vb = this.touchState.startViewBox;
                
                const newW = vb.w * scale;
                const newH = vb.h * scale;
                const dx = (vb.w - newW) / 2;
                const dy = (vb.h - newH) / 2;
                
                // Simple center zoom
                const newX = vb.x + dx;
                const newY = vb.y + dy;
                
                this.board.svg.setAttribute('viewBox', `${newX} ${newY} ${newW} ${newH}`);
            }
        } else if (this.touchState.mode === 'pan' && e.touches.length === 1) {
             const x = e.touches[0].clientX;
             const y = e.touches[0].clientY;
             const dx = x - this.touchState.lastPan.x;
             const dy = y - this.touchState.lastPan.y;
             
             // Threshold to consider it a pan gesture (vs a sloppy tap)
             if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
                 e.preventDefault();
                 this.isGestureActive = true;
                 
                 const vb = this.board.svg.getAttribute('viewBox').split(' ').map(parseFloat);
                 const ctm = this.board.svg.getScreenCTM();
                 
                 // Convert screen pixels to SVG units
                 // scaleX = vbWidth / screenWidth roughly, effectively 1 / ctm.a
                 const svgDx = dx / ctm.a;
                 const svgDy = dy / ctm.d;
                 
                 const newX = vb[0] - svgDx;
                 const newY = vb[1] - svgDy;
                 
                 this.board.svg.setAttribute('viewBox', `${newX} ${newY} ${vb[2]} ${vb[3]}`);
                 
                 this.touchState.lastPan = { x, y };
             }
        }
    }

    handleTouchEnd(e) {
        if (e.touches.length === 0) {
            this.touchState.mode = null;
            setTimeout(() => { this.isGestureActive = false; }, 100);
        } else if (e.touches.length === 1 && this.touchState.mode === 'pinch') {
            // Transition from pinch to pan or just end pinch
            this.touchState.mode = 'pan';
            this.touchState.lastPan = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
    }

    handleBoardClick(e) {
        if (this.isGestureActive) return;
        const isMobile = document.body.classList.contains('mobile-mode');
        const target = e.target;

        if (target.tagName === 'line' && target.classList.contains('wire')) {
            const wire = this.wires.find(w => w.element === target);
            if (wire) { 
                if (!isMobile) this.selectItem('wire', wire.id); 
                e.stopPropagation(); 
                return; 
            }
        }
        
        const compEl = target.closest('.component') || target.closest('.component-pins');
        if (compEl) {
            if (isMobile) {
                document.dispatchEvent(new CustomEvent('component-selected-mobile', { 
                    detail: { componentId: compEl.dataset.id } 
                }));
            } else if (!this.wireModeEnabled && compEl.classList.contains('component')) {
                this.selectItem('component', compEl.dataset.id);
            }
            e.stopPropagation(); 
            return;
        }

        const pt = Utils.getSVGCoordinates(this.board.svg, e);
        const hole = this.board.getHoleAt(pt.x, pt.y);
        
        if (isMobile) {
            // Tap on empty space flips the board
            this.flipBoard();
            return;
        }

        if (hole && this.wireModeEnabled) {
            if (!this.activeWire) { this.startWire(hole); this.deselectAll(); }
            else { this.endWire(hole); }
        } else {
            if (this.activeWire) { this.cancelWire(); }
            else if (!compEl) { if (!this.wireModeEnabled) this.deselectAll(); }
        }
    }

    handleBoardMouseDown(e) {
        if (this.wireModeEnabled) return; 
        const compEl = e.target.closest('.component');
        if (compEl) {
            const id = compEl.dataset.id;
            const comp = this.compManager.getComponentById(id);
            if (comp && !comp.locked) {
                this.isDraggingExisting = true;
                this.draggedComponentId = id;
                this.selectItem('component', id); 
                comp.element.style.opacity = '0.5';
            }
        }
    }

    handleBoardMouseMove(e) {
        const pt = Utils.getSVGCoordinates(this.board.svg, e);
        const hoverInfo = document.getElementById('hover-info');
        const target = e.target;
        if (target.classList.contains('pin-hover-target')) {
            const compName = target.dataset.compName;
            const pinLabel = target.dataset.pinLabel;
            hoverInfo.style.display = 'block';
            hoverInfo.innerHTML = `<strong>${compName}</strong>` + (pinLabel ? `<span>Pin: ${pinLabel}</span>` : "");
            const workspaceRect = this.board.container.getBoundingClientRect();
            let x = e.clientX - workspaceRect.left + 10;
            let y = e.clientY - workspaceRect.top + 10;
            const tooltipRect = hoverInfo.getBoundingClientRect();
            if (x + tooltipRect.width > workspaceRect.width - 10) x = e.clientX - workspaceRect.left - tooltipRect.width - 10;
            if (y + tooltipRect.height > workspaceRect.height - 10) y = e.clientY - workspaceRect.top - tooltipRect.height - 10;
            hoverInfo.style.left = x + 'px'; hoverInfo.style.top = y + 'px';
        } else {
            hoverInfo.style.display = 'none';
        }
        if (this.activeWire) {
            this.activeWire.line.setAttribute('x2', pt.x);
            this.activeWire.line.setAttribute('y2', pt.y);
        }
        if (this.isDraggingExisting && this.draggedComponentId && !this.wireModeEnabled) {
            const hole = this.board.getNearestHole(pt.x, pt.y);
            if (hole) {
                const comp = this.compManager.getComponentById(this.draggedComponentId);
                if (comp.anchorId !== hole.id) {
                    this.compManager.moveComponent(this.draggedComponentId, hole);
                }
            }
        }
    }
    
    handleBoardMouseUp(e) {
        if (this.isDraggingExisting) {
            const comp = this.compManager.getComponentById(this.draggedComponentId);
            if (comp) comp.element.style.opacity = '1';
            this.isDraggingExisting = false;
            this.draggedComponentId = null;
            this.notifyChange();
        }
    }

    startWire(hole) {
        const line = Utils.createSVGElement('line', {
            x1: hole.cx, y1: hole.cy, x2: hole.cx, y2: hole.cy,
            stroke: this.currentColor, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0.8, 'pointer-events': 'none' 
        });
        this.wireLayer.appendChild(line);
        this.activeWire = { startHole: hole, line: line, side: this.board.side };
    }

    endWire(hole) {
        if (hole === this.activeWire.startHole) return; 
        this.activeWire.line.setAttribute('x2', hole.cx);
        this.activeWire.line.setAttribute('y2', hole.cy);
        this.activeWire.line.style.pointerEvents = 'stroke'; 
        this.activeWire.line.classList.add('wire');
        const wireData = { id: `wire_${Date.now()}`, start: this.activeWire.startHole, end: hole, element: this.activeWire.line, side: this.activeWire.side };
        wireData.element.addEventListener('contextmenu', (e) => { e.preventDefault(); this.selectItem('wire', wireData.id); });
        this.wires.push(wireData);
        this.activeWire = null;
        this.notifyChange();
    }

    cancelWire() {
        if (this.activeWire) { this.wireLayer.removeChild(this.activeWire.line); this.activeWire = null; }
    }

    removeWire(wire) {
        this.wireLayer.removeChild(wire.element);
        this.wires = this.wires.filter(w => w !== wire);
        this.notifyChange();
    }

    clear(silent = false) {
        this.wires.forEach(w => this.wireLayer.removeChild(w.element));
        this.wires = [];
        this.cancelWire();
        this.deselectAll();
        if (!silent) this.notifyChange();
    }

    handleDragOver(e) {
        e.preventDefault();
        if (this.isDraggingNew && this.draggedType) {
            const pt = Utils.getSVGCoordinates(this.board.svg, e);
            const hole = this.board.getNearestHole(pt.x, pt.y);
            if (hole) {
                this.compManager.renderGhost(this.draggedType, hole);
            } else {
                this.compManager.clearGhost();
            }
        }
    }

    handleDragLeave(e) {
        // Only clear if we actually left the board container
        if (e.relatedTarget === null || !this.board.container.contains(e.relatedTarget)) {
            this.compManager.clearGhost();
        }
    }

    handleDrop(e) {
        e.preventDefault();
        this.compManager.clearGhost();
        const type = e.dataTransfer.getData('type');
        if (type) {
            const pt = Utils.getSVGCoordinates(this.board.svg, e);
            this.compManager.addComponent(type, pt.x, pt.y);
            this.notifyChange();
        }
        this.isDraggingNew = false;
        this.draggedType = null;
    }
}
