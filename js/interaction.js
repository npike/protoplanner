class InteractionManager {
    constructor(boards, componentManager) {
        this.boards = Array.isArray(boards) ? boards : [boards];
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
            lastPan: { x: 0, y: 0 },
            startMidpoint: { x: 0, y: 0 },
            startTranslate: { x: 0, y: 0 },
            svgMidpoint: { x: 0, y: 0 },
            startRect: null,
            // Global transform state for dual view
            scale: 1,
            translate: { x: 0, y: 0 }
        };

        this.initListeners();
        this.initSidebarControls();
    }

    applyGlobalTransform() {
        const container = document.getElementById('dual-view-container');
        if (container) {
            container.style.willChange = 'transform';
            container.style.transform = `translate(${this.touchState.translate.x}px, ${this.touchState.translate.y}px) scale(${this.touchState.scale})`;
        }
    }

    resetGlobalTransform() {
        this.touchState.scale = 1;
        this.touchState.translate = { x: 0, y: 0 };
        const container = document.getElementById('dual-view-container');
        if (container) {
            container.style.transform = '';
            container.style.willChange = '';
        }
    }

    get primaryBoard() { return this.boards[0]; }

    notifyChange() {
        if (this.onStateChange) this.onStateChange();
    }

    serialize() {
        return this.wires.map(w => ({
            s: w.startHoleId, e: w.endHoleId, c: w.color, d: w.side
        }));
    }

    deserialize(data) {
        this.clear(true);
        data.forEach(d => {
            this.wires.push({ 
                id: `wire_${Date.now()}_${Math.random()}`, 
                startHoleId: d.s, 
                endHoleId: d.e, 
                color: d.c, 
                side: d.d 
            });
        });
        this.renderWires();
    }

    initListeners() {
        // Global Keydown
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));

        // Board Interactions
        this.attachToBoard();
        
        // Sidebar Draggables (New Components) - Use delegation because they are dynamic
        const palette = document.getElementById('component-palette');
        if (palette) {
            palette.addEventListener('dragstart', (e) => {
                const item = e.target.closest('.component-item');
                if (item) {
                    this.isDraggingNew = true;
                    this.draggedType = item.dataset.type;
                    e.dataTransfer.setData('type', item.dataset.type);
                }
            });
            palette.addEventListener('dragend', (e) => {
                const item = e.target.closest('.component-item');
                if (item) {
                    this.isDraggingNew = false;
                    this.draggedType = null;
                }
            });
        }

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
        this.boards.forEach(board => {
            // Remove existing listeners to prevent duplicates
            board.svg.removeEventListener('click', board._clickRef);
            board.svg.removeEventListener('mousedown', board._mdRef);
            board.svg.removeEventListener('mousemove', board._mmRef);
            board.svg.removeEventListener('mouseup', board._muRef);
            board.svg.removeEventListener('dblclick', board._dblRef);
            board.svg.removeEventListener('touchstart', board._tsRef);
            board.svg.removeEventListener('touchmove', board._tmRef);
            board.svg.removeEventListener('touchend', board._teRef);
            
            board.container.removeEventListener('dragover', board._doRef);
            board.container.removeEventListener('dragleave', board._dlRef);
            board.container.removeEventListener('drop', board._drRef);

            // Create and store references for removal
            board._clickRef = (e) => this.handleBoardClick(e, board);
            board._mdRef = (e) => this.handleBoardMouseDown(e, board);
            board._mmRef = (e) => this.handleBoardMouseMove(e, board);
            board._muRef = (e) => this.handleBoardMouseUp(e, board);
            board._dblRef = (e) => {
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
            };
            board._tsRef = (e) => this.handleTouchStart(e, board);
            board._tmRef = (e) => this.handleTouchMove(e, board);
            board._teRef = (e) => this.handleTouchEnd(e, board);

            board._doRef = (e) => this.handleDragOver(e, board);
            board._dlRef = (e) => this.handleDragLeave(e, board);
            board._drRef = (e) => this.handleDrop(e, board);

            // Add listeners
            board.svg.addEventListener('click', board._clickRef);
            board.svg.addEventListener('mousedown', board._mdRef);
            board.svg.addEventListener('mousemove', board._mmRef);
            board.svg.addEventListener('mouseup', board._muRef);
            board.svg.addEventListener('dblclick', board._dblRef);

            // Touch Gestures (Pinch/Pan)
            board.svg.addEventListener('touchstart', board._tsRef, { passive: false });
            board.svg.addEventListener('touchmove', board._tmRef, { passive: false });
            board.svg.addEventListener('touchend', board._teRef);

            // Drop Zones
            board.container.addEventListener('dragover', board._doRef);
            board.container.addEventListener('dragleave', board._dlRef);
            board.container.addEventListener('drop', board._drRef);
        });
    }
    
    initSidebarControls() {
        const btnRotate = document.getElementById('btn-rotate');
        const btnLock = document.getElementById('btn-lock');
        const btnDelete = document.getElementById('btn-delete');
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
        } else if (e.key === 'ArrowUp') {
            this.moveSelectedComponent(0, -1);
            e.preventDefault();
        } else if (e.key === 'ArrowDown') {
            this.moveSelectedComponent(0, 1);
            e.preventDefault();
        } else if (e.key === 'ArrowLeft') {
            this.moveSelectedComponent(-1, 0);
            e.preventDefault();
        } else if (e.key === 'ArrowRight') {
            this.moveSelectedComponent(1, 0);
            e.preventDefault();
        }
    }

    moveSelectedComponent(dx, dy) {
        if (!this.selectedItem || this.selectedItem.type !== 'component') return;
        
        const comp = this.compManager.getComponentById(this.selectedItem.id);
        if (!comp || comp.locked) return;
        
        const board = this.primaryBoard;
        const currentHole = board.getHoleById(comp.anchorId);
        if (!currentHole) return;

        // Logical coordinates movement
        // Note: For 'bottom' side, we still move logical coordinates, 
        // the board.getX/getY handles the visual mirroring.
        const nextLX = currentHole.lx + dx;
        const nextLY = currentHole.ly + dy;
        
        const nextHole = board.getHoleByLogical(nextLX, nextLY);
        if (nextHole) {
            const moved = this.compManager.moveComponent(comp.id, nextHole, board);
            if (moved) {
                this.notifyChange();
            } else {
                // Flash red if it doesn't fit
                this.compManager.renderGhost(comp.type, nextHole, comp.rotation, comp.pitch, board);
                setTimeout(() => this.compManager.clearGhost(), 300);
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
        this.boards.forEach(b => b.svg.style.cursor = this.wireModeEnabled ? 'crosshair' : 'default');
        
        if (!this.wireModeEnabled && this.activeWire) {
            this.cancelWire();
        }
    }

    renderWires() {
        this.boards.forEach(board => {
            const side = board.side;
            board.wireLayer.innerHTML = '';
            this.wires.forEach(wire => {
                if (wire.side === side) {
                    const startHole = board.getHoleById(wire.startHoleId);
                    const endHole = board.getHoleById(wire.endHoleId);
                    if (startHole && endHole) {
                        const line = Utils.createSVGElement('line', {
                            x1: startHole.cx, y1: startHole.cy, x2: endHole.cx, y2: endHole.cy,
                            stroke: wire.color, 'stroke-width': 4, 'stroke-linecap': 'round', class: 'wire'
                        });
                        line.addEventListener('contextmenu', (e) => { e.preventDefault(); this.selectItem('wire', wire.id); });
                        line.addEventListener('click', (e) => { this.selectItem('wire', wire.id); e.stopPropagation(); });
                        if (this.selectedItem && this.selectedItem.type === 'wire' && this.selectedItem.id === wire.id) {
                            line.classList.add('selected');
                        }
                        board.wireLayer.appendChild(line);
                    }
                }
            });
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
        
        const hoverInfo = document.getElementById('hover-info');
        if (hoverInfo) hoverInfo.classList.remove('mobile-visible');

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

    handleTouchStart(e, board) {
        if (e.touches.length === 2) {
            this.isGestureActive = true;
            this.touchState.mode = 'pinch';
            const p1 = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            const p2 = { x: e.touches[1].clientX, y: e.touches[1].clientY };
            this.touchState.startDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
            this.touchState.startScale = this.touchState.scale;
            
            // For focused zoom
            this.touchState.startMidpoint = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
            this.touchState.startTranslate = { ...this.touchState.translate };

            if (!document.body.classList.contains('mobile-mode')) {
                const vb = board.svg.getAttribute('viewBox').split(' ').map(parseFloat);
                this.touchState.startViewBox = { x: vb[0], y: vb[1], w: vb[2], h: vb[3] };
                
                const rect = board.svg.getBoundingClientRect();
                this.touchState.startRect = rect;
                if (rect.width > 0 && rect.height > 0) {
                    this.touchState.svgMidpoint = {
                        x: vb[0] + (this.touchState.startMidpoint.x - rect.left) * (vb[2] / rect.width),
                        y: vb[1] + (this.touchState.startMidpoint.y - rect.top) * (vb[3] / rect.height)
                    };
                }
            }
        } else if (e.touches.length === 1 && !this.touchState.mode) {
            if (e.target.closest('.component') && !document.body.classList.contains('mobile-mode')) return;
             
            this.touchState.mode = 'pan';
            this.touchState.lastPan = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            
            if (!document.body.classList.contains('mobile-mode')) {
                const vb = board.svg.getAttribute('viewBox').split(' ').map(parseFloat);
                this.touchState.startViewBox = { x: vb[0], y: vb[1], w: vb[2], h: vb[3] };
            }
        }
    }

    handleTouchMove(e, board) {
        const isMobile = document.body.classList.contains('mobile-mode');
        
        if (this.touchState.mode === 'pinch' && e.touches.length === 2) {
            e.preventDefault();
            this.isGestureActive = true;
            
            const p1 = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            const p2 = { x: e.touches[1].clientX, y: e.touches[1].clientY };
            const currentDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
            
            if (this.touchState.startDist > 0) {
                const ratio = currentDist / this.touchState.startDist;
                const currentMidX = (p1.x + p2.x) / 2;
                const currentMidY = (p1.y + p2.y) / 2;
                
                if (isMobile) {
                    const newScale = Math.max(0.5, Math.min(5, this.touchState.startScale * ratio));
                    const container = document.getElementById('dual-view-container');
                    const parentRect = container.parentElement.getBoundingClientRect();
                    
                    const mx = currentMidX - parentRect.left;
                    const my = currentMidY - parentRect.top;
                    const smx = this.touchState.startMidpoint.x - parentRect.left;
                    const smy = this.touchState.startMidpoint.y - parentRect.top;
                    
                    const startMidLocalX = (smx - this.touchState.startTranslate.x) / this.touchState.startScale;
                    const startMidLocalY = (smy - this.touchState.startTranslate.y) / this.touchState.startScale;
                    
                    const nextX = mx - startMidLocalX * newScale;
                    const nextY = my - startMidLocalY * newScale;

                    if (!isNaN(nextX) && !isNaN(nextY) && !isNaN(newScale)) {
                        this.touchState.translate.x = nextX;
                        this.touchState.translate.y = nextY;
                        this.touchState.scale = newScale;
                        this.applyGlobalTransform();
                    }
                } else {
                    const scale = 1 / ratio; // Inverse for viewBox
                    const vb = this.touchState.startViewBox;
                    const rect = this.touchState.startRect;
                    const sm = this.touchState.svgMidpoint;

                    if (vb && rect && sm) {
                        const newW = vb.w * scale;
                        const newH = vb.h * scale;
                        const newX = sm.x - (currentMidX - rect.left) * (newW / rect.width);
                        const newY = sm.y - (currentMidY - rect.top) * (newH / rect.height);
                        
                        if (!isNaN(newX) && !isNaN(newY) && !isNaN(newW) && !isNaN(newH) && newW > 0) {
                            board.svg.setAttribute('viewBox', `${newX} ${newY} ${newW} ${newH}`);
                        }
                    }
                }
            }
        } else if (this.touchState.mode === 'pan' && e.touches.length === 1) {
             const x = e.touches[0].clientX;
             const y = e.touches[0].clientY;
             const dx = x - this.touchState.lastPan.x;
             const dy = y - this.touchState.lastPan.y;
             
             if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                 e.preventDefault();
                 this.isGestureActive = true;
                 
                 if (isMobile) {
                     this.touchState.translate.x += dx;
                     this.touchState.translate.y += dy;
                     this.applyGlobalTransform();
                 } else {
                     const vb = board.svg.getAttribute('viewBox').split(' ').map(parseFloat);
                     const ctm = board.svg.getScreenCTM();
                     if (ctm) {
                         const svgDx = dx / ctm.a;
                         const svgDy = dy / ctm.d;
                         if (!isNaN(svgDx) && !isNaN(svgDy)) {
                             board.svg.setAttribute('viewBox', `${vb[0] - svgDx} ${vb[1] - svgDy} ${vb[2]} ${vb[3]}`);
                         }
                     }
                 }
                 this.touchState.lastPan = { x, y };
             }
        }
    }

    handleTouchEnd(e, board) {
        if (e.touches.length === 0) {
            this.touchState.mode = null;
            setTimeout(() => { this.isGestureActive = false; }, 100);
        } else if (e.touches.length === 1 && this.touchState.mode === 'pinch') {
            this.touchState.mode = 'pan';
            this.touchState.lastPan = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
    }

    handleBoardClick(e, board) {
        console.log("Board click triggered. isGestureActive:", this.isGestureActive);
        if (this.isGestureActive) {
            return;
        }
        const target = e.target;

        if (target.tagName === 'line' && target.classList.contains('wire')) {
            const wireId = this.wires.find(w => w.side === board.side && board.getHoleById(w.startHoleId).cx === parseFloat(target.getAttribute('x1')))?.id;
            if (wireId) { 
                e.stopPropagation(); 
                return; 
            }
        }
        
        const compEl = target.closest('.component') || target.closest('.component-pins');
        if (compEl) {
            document.dispatchEvent(new CustomEvent('component-selected-mobile', { 
                detail: { 
                    componentId: compEl.dataset.id,
                    x: e.clientX,
                    y: e.clientY
                } 
            }));
            e.stopPropagation(); 
            return;
        }

        const pt = Utils.getSVGCoordinates(board.svg, e);
        const hole = board.getHoleAt(pt.x, pt.y);
        
        if (hole && this.wireModeEnabled) {
            if (!this.activeWire) { this.startWire(hole, board); this.deselectAll(); }
            else { this.endWire(hole, board); }
        } else {
            if (this.activeWire) { this.cancelWire(); }
            else if (!compEl) { if (!this.wireModeEnabled) this.deselectAll(); }
        }
    }

    handleBoardMouseDown(e, board) {
        if (this.wireModeEnabled) return; 
        const compEl = e.target.closest('.component');
        if (compEl) {
            const id = compEl.dataset.id;
            const comp = this.compManager.getComponentById(id);
            if (comp && !comp.locked && comp.mountedSide === board.side) {
                this.isDraggingExisting = true;
                this.draggedComponentId = id;
                this.selectItem('component', id); 
            }
        }
    }

    handleBoardMouseMove(e, board) {
        const pt = Utils.getSVGCoordinates(board.svg, e);
        const hoverInfo = document.getElementById('hover-info');
        const target = e.target;
        if (target.classList.contains('pin-hover-target')) {
            const compName = target.dataset.compName;
            const pinLabel = target.dataset.pinLabel;
            hoverInfo.style.display = 'block';
            hoverInfo.innerHTML = `<strong>${compName}</strong>` + (pinLabel ? `<span>Pin: ${pinLabel}</span>` : "");
            const workspaceRect = board.container.getBoundingClientRect();
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
            const hole = board.getNearestHole(pt.x, pt.y);
            if (hole) {
                const comp = this.compManager.getComponentById(this.draggedComponentId);
                if (comp.anchorId !== hole.id) {
                    this.compManager.moveComponent(this.draggedComponentId, hole, board);
                }
            }
        }
    }
    
    handleBoardMouseUp(e, board) {
        if (this.isDraggingExisting) {
            this.isDraggingExisting = false;
            this.draggedComponentId = null;
            this.notifyChange();
        }
    }

    startWire(hole, board) {
        const line = Utils.createSVGElement('line', {
            x1: hole.cx, y1: hole.cy, x2: hole.cx, y2: hole.cy,
            stroke: this.currentColor, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0.8, 'pointer-events': 'none' 
        });
        board.wireLayer.appendChild(line);
        this.activeWire = { startHole: hole, line: line, side: board.side, board: board };
    }

    endWire(hole, board) {
        if (hole === this.activeWire.startHole || board !== this.activeWire.board) return; 
        const wireData = { 
            id: `wire_${Date.now()}`, 
            startHoleId: this.activeWire.startHole.id, 
            endHoleId: hole.id, 
            color: this.currentColor, 
            side: this.activeWire.side 
        };
        this.wires.push(wireData);
        this.activeWire = null;
        this.renderWires();
        this.notifyChange();
    }

    cancelWire() {
        if (this.activeWire) { 
            this.activeWire.board.wireLayer.removeChild(this.activeWire.line); 
            this.activeWire = null; 
        }
    }

    removeWire(wire) {
        this.wires = this.wires.filter(w => w.id !== wire.id);
        this.renderWires();
        this.notifyChange();
    }

    clear(silent = false) {
        this.wires = [];
        this.activeWire = null;
        this.deselectAll();
        if (!silent) {
            this.renderWires();
            this.notifyChange();
        }
    }

    handleDragOver(e, board) {
        e.preventDefault();
        if (this.isDraggingNew && this.draggedType) {
            const pt = Utils.getSVGCoordinates(board.svg, e);
            const hole = board.getNearestHole(pt.x, pt.y);
            if (hole) {
                this.compManager.renderGhost(this.draggedType, hole, 0, null, board);
            } else {
                this.compManager.clearGhost();
            }
        }
    }

    handleDragLeave(e, board) {
        if (e.relatedTarget === null || !board.container.contains(e.relatedTarget)) {
            this.compManager.clearGhost();
        }
    }

    handleDrop(e, board) {
        e.preventDefault();
        this.compManager.clearGhost();
        const type = e.dataTransfer.getData('type') || this.draggedType;
        if (type) {
            const pt = Utils.getSVGCoordinates(board.svg, e);
            this.compManager.addComponent(type, pt.x, pt.y, board);
            this.notifyChange();
        }
        this.isDraggingNew = false;
        this.draggedType = null;
    }
}
