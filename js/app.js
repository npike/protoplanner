document.addEventListener('DOMContentLoaded', () => {
    try {
        const VERSION = "v1.1";
        document.getElementById('app-version').textContent = VERSION;
        if (document.getElementById('mobile-version')) {
            document.getElementById('mobile-version').textContent = VERSION;
        }

        console.log("Initializing...");
        
        // 0. Initialize Board Selection
        const boardSelect = document.getElementById('board-type-select');
        Object.keys(BoardRegistry).forEach(id => {
            const opt = document.createElement('option');
            opt.value = id;
            opt.textContent = BoardRegistry[id].name;
            boardSelect.appendChild(opt);
        });

        const board = new Board('board-container');
        console.log("Board initialized");
        
        const compManager = new ComponentManager(board);
        console.log("ComponentManager initialized");
        
        // 1. Initialize Component Palette (Dynamic Sidebar)
        const palette = document.getElementById('component-palette');
        const filterContainer = document.getElementById('category-filters');
        const searchInput = document.getElementById('component-search');
        
        let activeCategory = "All";
        let searchQuery = "";

        const applyFilters = () => {
            document.querySelectorAll('.component-item').forEach(item => {
                const def = ComponentRegistry.get(item.dataset.type);
                const matchesCategory = activeCategory === "All" || def.category === activeCategory;
                const matchesSearch = def.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                    def.type.toLowerCase().includes(searchQuery.toLowerCase());
                
                item.style.display = (matchesCategory && matchesSearch) ? 'flex' : 'none';
            });
        };

        const categories = new Set(["All"]);
        ComponentRegistry.list().forEach(def => {
            if (def.category) categories.add(def.category);
        });

        categories.forEach(cat => {
            const tag = document.createElement('div');
            tag.className = 'category-tag' + (cat === "All" ? ' active' : '');
            tag.textContent = cat;
            tag.onclick = () => {
                activeCategory = cat;
                document.querySelectorAll('.category-tag').forEach(t => t.classList.remove('active'));
                tag.classList.add('active');
                applyFilters();
            };
            filterContainer.appendChild(tag);
        });

        searchInput.oninput = (e) => {
            searchQuery = e.target.value;
            applyFilters();
        };

        ComponentRegistry.list().forEach(def => {
            const item = document.createElement('div');
            item.className = 'component-item';
            item.draggable = true;
            item.dataset.type = def.type;
            const icon = document.createElement('div');
            icon.className = 'icon';
            icon.appendChild(compManager.getPreviewSVG(def.type));
            const span = document.createElement('span');
            span.textContent = def.name;
            item.appendChild(icon);
            item.appendChild(span);
            palette.appendChild(item);
        });

        // 2. Initialize InteractionManager
        const interactionManager = new InteractionManager(board, compManager);
        console.log("InteractionManager initialized");

        // 3. State Sync Logic (URL Persistence)
        const nameInput = document.getElementById('project-name');
        const modifiedLabel = document.getElementById('last-modified');

        const updateURL = () => {
            const timestamp = new Date().toLocaleString();
            const state = {
                n: nameInput.value,
                m: timestamp,
                b: board.currentDefId,
                c: compManager.serialize(),
                w: interactionManager.serialize()
            };
            modifiedLabel.textContent = `Modified: ${timestamp}`;
            if (document.getElementById('mobile-project-name')) {
                document.getElementById('mobile-project-name').textContent = nameInput.value || "Untitled Project";
            }
            
            const encoded = btoa(JSON.stringify(state));
            const url = new URL(window.location);
            url.searchParams.set('state', encoded);
            window.history.replaceState({}, '', url);
        };

        const loadFromURL = () => {
            const params = new URLSearchParams(window.location.search);
            const encoded = params.get('state');
            if (encoded) {
                try {
                    const state = JSON.parse(atob(encoded));
                    if (state.n) {
                        nameInput.value = state.n;
                        if (document.getElementById('mobile-project-name')) {
                            document.getElementById('mobile-project-name').textContent = state.n;
                        }
                    }
                    if (state.m) modifiedLabel.textContent = `Modified: ${state.m}`;
                    if (state.b) {
                        boardSelect.value = state.b;
                        board.setBoardType(state.b);
                        // Re-attach listeners to new board SVG
                        interactionManager.attachToBoard();
                    }
                    if (state.c) compManager.deserialize(state.c);
                    if (state.w) interactionManager.deserialize(state.w);
                    console.log("State loaded from URL");
                } catch (e) {
                    console.error("Failed to parse state from URL", e);
                }
            }
        };

        boardSelect.onchange = () => {
            const hasContent = compManager.components.length > 0 || interactionManager.wires.length > 0;
            const proceed = !hasContent || confirm('Changing board type will clear your current project. Continue?');
            
            if (proceed) {
                board.setBoardType(boardSelect.value);
                compManager.clear(true);
                interactionManager.clear(true);
                // Re-attach listeners to new board SVG
                interactionManager.attachToBoard();
                updateURL();
            } else {
                boardSelect.value = board.currentDefId;
            }
        };

        interactionManager.onStateChange = updateURL;
        nameInput.addEventListener('input', updateURL);

        // Load initial state
        loadFromURL();

        // 4. BOM Logic
        const bomModal = document.getElementById('bom-modal');
        const bomList = document.getElementById('bom-list');
        const btnBOM = document.getElementById('btn-bom');
        const btnCopyBOM = document.getElementById('btn-copy-bom');
        const closeModal = document.querySelector('.close-modal');

        const generateBOM = () => {
            const components = compManager.components;
            const groups = {};
            components.forEach(c => {
                const def = ComponentRegistry.get(c.type);
                const key = `${def.name}|${c.customLabel || ""}`;
                if (!groups[key]) groups[key] = { name: def.name, label: c.customLabel, qty: 0 };
                groups[key].qty++;
            });
            bomList.innerHTML = '';
            if (Object.keys(groups).length === 0) {
                bomList.innerHTML = '<p style="color: #888;">No components placed on board.</p>';
            } else {
                Object.values(groups).forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'bom-item';
                    div.innerHTML = `<span><strong>${item.name}</strong> ${item.label ? `<span class="labels">(${item.label})</span>` : ""}</span><span>x${item.qty}</span>`;
                    bomList.appendChild(div);
                });
            }
            bomModal.style.display = 'block';
        };

        btnBOM.onclick = generateBOM;
        closeModal.onclick = () => bomModal.style.display = 'none';
        window.onclick = (event) => { 
            if (event.target == bomModal) bomModal.style.display = 'none'; 
            if (event.target == document.getElementById('component-details-modal')) document.getElementById('component-details-modal').style.display = 'none';
        };
        btnCopyBOM.onclick = () => {
            const text = Array.from(bomList.querySelectorAll('.bom-item')).map(el => el.innerText).join('\n');
            navigator.clipboard.writeText(text).then(() => {
                const originalText = btnCopyBOM.textContent;
                btnCopyBOM.textContent = 'Copied!';
                btnCopyBOM.style.background = '#2e7d32';
                setTimeout(() => {
                    btnCopyBOM.textContent = originalText;
                    btnCopyBOM.style.background = '';
                }, 2000);
            });
        };

        document.getElementById('clear-btn').addEventListener('click', () => {
            if(confirm('Clear entire board?')) {
                interactionManager.clear();
                compManager.clear();
                updateURL();
            }
        });

        // Mobile Mode Handling
        const checkMobile = () => {
            // Simple check: User Agent or Screen Width
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 800;
            if (isMobile) {
                document.body.classList.add('mobile-mode');
                console.log("Mobile mode detected");
            } else {
                document.body.classList.remove('mobile-mode');
            }
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);

        // Mobile Component Modal Logic
        const compModal = document.getElementById('component-details-modal');
        const compDetailName = document.getElementById('comp-detail-name');
        const compDetailPins = document.getElementById('comp-detail-pins');
        const closeCompModal = document.getElementById('close-comp-modal');

        document.addEventListener('component-selected-mobile', (e) => {
            const compId = e.detail.componentId;
            const comp = compManager.getComponentById(compId);
            if (!comp) return;

            const def = ComponentRegistry.get(comp.type);
            compDetailName.textContent = def.name;
            if (comp.customLabel) {
                compDetailName.textContent += ` (${comp.customLabel})`;
            }

            compDetailPins.innerHTML = '';
            // If component has defined pins with labels
            if (def.pins && def.pins.length > 0) {
                def.pins.forEach((pin, index) => {
                    const row = document.createElement('div');
                    row.className = 'pin-row';
                    const pinLabel = pin.label || `Pin ${index + 1}`;
                    row.innerHTML = `<span class="pin-num">${index + 1}</span><span class="pin-name">${pinLabel}</span>`;
                    compDetailPins.appendChild(row);
                });
            } else {
                compDetailPins.innerHTML = '<p style="color: #888;">No pin details available.</p>';
            }

            compModal.style.display = 'block';
        });

        if (closeCompModal) {
            closeCompModal.onclick = () => compModal.style.display = 'none';
        }

        console.log("Proto Planner Initialized");
    } catch (e) {
        console.error("Initialization Error:", e);
        alert("Error initializing app: " + e.message + "\nCheck console for details.");
    }
});