/**
 * MPW - Creative Studio Suite & Whiteboard Engine
 * Optimized for Laptop, Tablet, and Mobile Touchscreens
 * 
 * Supports:
 * 1. Drawing Canvas (Pen, Eraser, Lasso/Circle Erase, Multi-Page, + / -, Top-Right X)
 * 2. Notes Writing (Blank/Ruled toggle, Stylus/Handwriting, Lasso Erase, + / -, Top-Right X)
 * 3. Digital Ruled Notepad (Strictly Typed Line-by-Line, + / -, Top-Right X, NO draw tools)
 * 4. Flashcard Studio (3D Flip, Spaced Repetition, + / -, Top-Right X)
 * 5. Split-Screen Transparent Reference Doc (Opacity 10%-100%, Zoom, Eye Toggle, Save to Folder)
 */

class WhiteboardStudio {
    constructor() {
        this.activeMode = null; // 'drawing', 'notes', 'notepad', 'flashcards'
        this.activeSubjectId = null;
        this.activeFolderId = null;

        // Multi-page state
        this.currentPage = 0;
        this.pages = [];

        // Canvas & Drawing Tools State
        this.canvas = null;
        this.ctx = null;
        this.isDrawing = false;
        this.currentTool = 'pen'; // 'pen', 'eraser', 'lasso'
        this.currentColor = '#000000';
        this.lineWidth = 3;
        this.paperStyle = 'blank'; // 'blank' or 'ruled'

        // Lasso / Circle Erase points
        this.lassoPoints = [];

        // Flashcards state
        this.flashcards = [];
        this.currentCardIndex = 0;
        this.isCardFlipped = false;

        // Transparent Reference Doc state
        this.docOpacity = 0.85;
        this.isDocVisible = true;
        this.docZoom = 100;
        this.currentRefDoc = null;
    }

    // Launch with device compatibility prompt
    openStudioWithDevicePrompt(mode, subjectId, folderId, refDoc = null) {
        this.pendingLaunch = { mode, subjectId, folderId, refDoc };
        const isMobile = window.innerWidth < 768;

        if (isMobile && (mode === 'drawing' || mode === 'notes')) {
            document.getElementById('deviceCompatibilityModal').classList.remove('hidden');
        } else {
            this.launchStudio(mode, subjectId, folderId, refDoc);
        }
    }

    launchStudio(mode, subjectId, folderId, refDoc = null) {
        document.getElementById('deviceCompatibilityModal').classList.add('hidden');
        this.activeMode = mode;
        this.activeSubjectId = subjectId;
        this.activeFolderId = folderId;
        this.currentRefDoc = refDoc;

        const studioModal = document.getElementById('studioModal');
        studioModal.classList.remove('hidden');

        this.setupStudioUI(mode);
    }

    setupStudioUI(mode) {
        const titleEl = document.getElementById('studioTitle');
        const drawToolbar = document.getElementById('drawToolbar');
        const paperToggle = document.getElementById('paperToggleBtn');
        const canvasContainer = document.getElementById('canvasWorkspace');
        const typedContainer = document.getElementById('typedNotepadWorkspace');
        const flashcardContainer = document.getElementById('flashcardWorkspace');
        const splitDocDock = document.getElementById('splitDocDock');

        // Reset containers
        canvasContainer.classList.add('hidden');
        typedContainer.classList.add('hidden');
        flashcardContainer.classList.add('hidden');

        // Handle Split Doc Dock
        if (this.currentRefDoc) {
            splitDocDock.classList.remove('hidden');
            this.renderSplitDoc(this.currentRefDoc);
        } else {
            splitDocDock.classList.add('hidden');
        }

        if (mode === 'drawing') {
            titleEl.innerHTML = `<i class="fa-solid fa-paintbrush text-orange-500 mr-2"></i> Drawing Canvas`;
            drawToolbar.classList.remove('hidden');
            paperToggle.classList.add('hidden');
            canvasContainer.classList.remove('hidden');
            this.paperStyle = 'blank';
            this.initCanvas();
            this.loadDrawingPages();

        } else if (mode === 'notes') {
            titleEl.innerHTML = `<i class="fa-solid fa-pen-nib text-orange-500 mr-2"></i> Notes Writing`;
            drawToolbar.classList.remove('hidden');
            paperToggle.classList.remove('hidden');
            canvasContainer.classList.remove('hidden');
            this.paperStyle = 'ruled';
            this.initCanvas();
            this.loadDrawingPages();

        } else if (mode === 'notepad') {
            titleEl.innerHTML = `<i class="fa-solid fa-align-left text-orange-500 mr-2"></i> Ruled Notepad (Typed)`;
            drawToolbar.classList.add('hidden'); // NO drawing tools on typed notepad
            typedContainer.classList.remove('hidden');
            this.loadNotepadPages();

        } else if (mode === 'flashcards') {
            titleEl.innerHTML = `<i class="fa-solid fa-layer-group text-orange-500 mr-2"></i> Flashcards 3D`;
            drawToolbar.classList.add('hidden');
            flashcardContainer.classList.remove('hidden');
            this.loadFlashcards();
        }

        this.updatePageIndicator();
    }

    // ==========================================
    // RESPONSIVE CANVAS & DRAWING ENGINE
    // ==========================================
    initCanvas() {
        this.canvas = document.getElementById('studioCanvas');
        this.ctx = this.canvas.getContext('2d');

        const container = document.getElementById('canvasWorkspace');
        const isMobile = window.innerWidth < 768;

        // Dynamic responsive dimensions for laptop vs phone
        const targetWidth = isMobile ? Math.min(window.innerWidth - 20, 480) : Math.min(container.clientWidth || 920, 1000);
        const targetHeight = isMobile ? Math.min(window.innerHeight - 150, 600) : Math.max(container.clientHeight - 40, 750);

        this.canvas.width = targetWidth;
        this.canvas.height = targetHeight;

        this.applyPaperBackground();
        this.bindCanvasEvents();
    }

    applyPaperBackground() {
        this.ctx.fillStyle = this.paperStyle === 'ruled' ? '#FFFDF8' : '#FFFFFF';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.paperStyle === 'ruled') {
            this.ctx.strokeStyle = '#BFDBFE';
            this.ctx.lineWidth = 1;
            const lineHeight = 32;
            for (let y = 32; y < this.canvas.height; y += lineHeight) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, y);
                this.ctx.lineTo(this.canvas.width, y);
                this.ctx.stroke();
            }

            // Left red margin line
            this.ctx.strokeStyle = '#FCA5A5';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            const marginX = window.innerWidth < 768 ? 40 : 60;
            this.ctx.moveTo(marginX, 0);
            this.ctx.lineTo(marginX, this.canvas.height);
            this.ctx.stroke();
        }
    }

    togglePaperStyle() {
        this.paperStyle = this.paperStyle === 'ruled' ? 'blank' : 'ruled';
        const btn = document.getElementById('paperToggleBtn');
        btn.innerHTML = this.paperStyle === 'ruled' ? 
            `<i class="fa-solid fa-sheet-plastic mr-1"></i> Ruled` : 
            `<i class="fa-regular fa-square mr-1"></i> Blank`;
        
        this.restoreCanvasPage(this.currentPage);
    }

    bindCanvasEvents() {
        const getPos = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;
            
            // Adjust for canvas scale
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;

            return {
                x: (clientX - rect.left) * scaleX,
                y: (clientY - rect.top) * scaleY
            };
        };

        const startDraw = (e) => {
            e.preventDefault();
            this.isDrawing = true;
            const pos = getPos(e);

            if (this.currentTool === 'lasso') {
                this.lassoPoints = [pos];
            } else {
                this.ctx.beginPath();
                this.ctx.moveTo(pos.x, pos.y);
            }
        };

        const drawMove = (e) => {
            if (!this.isDrawing) return;
            e.preventDefault();
            const pos = getPos(e);

            if (this.currentTool === 'lasso') {
                this.lassoPoints.push(pos);
                this.ctx.save();
                this.ctx.strokeStyle = '#F97316';
                this.ctx.setLineDash([4, 4]);
                this.ctx.lineWidth = 2;
                this.ctx.lineTo(pos.x, pos.y);
                this.ctx.stroke();
                this.ctx.restore();
            } else if (this.currentTool === 'eraser') {
                this.ctx.save();
                this.ctx.strokeStyle = this.paperStyle === 'ruled' ? '#FFFDF8' : '#FFFFFF';
                this.ctx.lineWidth = this.lineWidth * 3.5;
                this.ctx.lineCap = 'round';
                this.ctx.lineTo(pos.x, pos.y);
                this.ctx.stroke();
                this.ctx.restore();
            } else {
                this.ctx.save();
                this.ctx.strokeStyle = this.currentColor;
                this.ctx.lineWidth = this.lineWidth;
                this.ctx.lineCap = 'round';
                this.ctx.lineJoin = 'round';
                this.ctx.lineTo(pos.x, pos.y);
                this.ctx.stroke();
                this.ctx.restore();
            }
        };

        const endDraw = (e) => {
            if (!this.isDrawing) return;
            this.isDrawing = false;

            if (this.currentTool === 'lasso') {
                this.executeLassoErase();
            } else {
                this.ctx.closePath();
            }
            this.saveCurrentPageSnapshot();
        };

        // Desktop Mouse Events
        this.canvas.onmousedown = startDraw;
        this.canvas.onmousemove = drawMove;
        this.canvas.onmouseup = endDraw;

        // Mobile & Tablet Touch Events (passive: false to prevent mobile pull-to-refresh)
        this.canvas.addEventListener('touchstart', startDraw, { passive: false });
        this.canvas.addEventListener('touchmove', drawMove, { passive: false });
        this.canvas.addEventListener('touchend', endDraw, { passive: false });
    }

    // Special Lasso / Circle Erase Tool
    executeLassoErase() {
        if (this.lassoPoints.length < 3) return;

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.moveTo(this.lassoPoints[0].x, this.lassoPoints[0].y);
        for (let i = 1; i < this.lassoPoints.length; i++) {
            this.ctx.lineTo(this.lassoPoints[i].x, this.lassoPoints[i].y);
        }
        this.ctx.closePath();
        this.ctx.clip();

        this.ctx.fillStyle = this.paperStyle === 'ruled' ? '#FFFDF8' : '#FFFFFF';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();

        if (this.paperStyle === 'ruled') {
            this.reapplyRuledLines();
        }
        this.lassoPoints = [];
    }

    reapplyRuledLines() {
        this.ctx.save();
        this.ctx.strokeStyle = '#BFDBFE';
        this.ctx.lineWidth = 1;
        for (let y = 32; y < this.canvas.height; y += 32) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
        this.ctx.strokeStyle = '#FCA5A5';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        const marginX = window.innerWidth < 768 ? 40 : 60;
        this.ctx.moveTo(marginX, 0);
        this.ctx.lineTo(marginX, this.canvas.height);
        this.ctx.stroke();
        this.ctx.restore();
    }

    setTool(tool) {
        this.currentTool = tool;
        document.querySelectorAll('.draw-tool-btn').forEach(b => b.classList.remove('bg-orange-500', 'text-white'));
        const activeBtn = document.getElementById(`tool_${tool}`);
        if (activeBtn) activeBtn.classList.add('bg-orange-500', 'text-white');
    }

    setColor(colorHex) {
        this.currentColor = colorHex;
        this.setTool('pen');
    }

    setStrokeWidth(w) {
        this.lineWidth = parseInt(w, 10);
    }

    clearCanvas() {
        this.applyPaperBackground();
        this.saveCurrentPageSnapshot();
    }

    // ==========================================
    // MULTI-PAGE MANAGEMENT (+ / -)
    // ==========================================
    addPage() {
        if (this.activeMode === 'drawing' || this.activeMode === 'notes') {
            this.saveCurrentPageSnapshot();
            this.pages.push(null);
            this.currentPage = this.pages.length - 1;
            this.clearCanvas();
        } else if (this.activeMode === 'notepad') {
            this.saveNotepadCurrentPage();
            this.pages.push('');
            this.currentPage = this.pages.length - 1;
            this.renderNotepadPage();
        } else if (this.activeMode === 'flashcards') {
            this.addEmptyFlashcard();
        }
        this.updatePageIndicator();
    }

    decrementPage() {
        if (this.pages.length <= 1) return;

        if (this.activeMode === 'drawing' || this.activeMode === 'notes') {
            this.pages.splice(this.currentPage, 1);
            this.currentPage = Math.max(0, this.currentPage - 1);
            this.restoreCanvasPage(this.currentPage);
        } else if (this.activeMode === 'notepad') {
            this.pages.splice(this.currentPage, 1);
            this.currentPage = Math.max(0, this.currentPage - 1);
            this.renderNotepadPage();
        }
        this.updatePageIndicator();
    }

    updatePageIndicator() {
        const ind = document.getElementById('pageIndicatorText');
        const count = Math.max(this.pages.length, 1);
        const curr = this.currentPage + 1;
        ind.textContent = `Page ${curr} of ${count}`;
    }

    saveCurrentPageSnapshot() {
        if (this.canvas) {
            this.pages[this.currentPage] = this.canvas.toDataURL();
            if (this.activeSubjectId) {
                window.storageManager.saveWhiteboardPages(this.activeSubjectId, this.pages);
            }
        }
    }

    restoreCanvasPage(pageIndex) {
        this.applyPaperBackground();
        if (this.pages[pageIndex]) {
            const img = new Image();
            img.src = this.pages[pageIndex];
            img.onload = () => {
                this.ctx.drawImage(img, 0, 0);
            };
        }
    }

    loadDrawingPages() {
        if (!this.activeSubjectId) return;
        const saved = window.storageManager.getWhiteboardPages(this.activeSubjectId);
        this.pages = saved && saved.length > 0 ? saved : [null];
        this.currentPage = 0;
        this.restoreCanvasPage(0);
    }

    // ==========================================
    // DIGITAL RULED NOTEPAD (TYPED ONLY)
    // ==========================================
    loadNotepadPages() {
        if (!this.activeSubjectId) return;
        const data = window.storageManager.getNotepad(this.activeSubjectId);
        this.pages = data && data.pages && data.pages.length > 0 ? data.pages : [''];
        this.currentPage = 0;
        this.renderNotepadPage();
    }

    renderNotepadPage() {
        const textarea = document.getElementById('ruledNotepadInput');
        textarea.value = this.pages[this.currentPage] || '';
    }

    saveNotepadCurrentPage() {
        const textarea = document.getElementById('ruledNotepadInput');
        if (textarea) {
            this.pages[this.currentPage] = textarea.value;
            window.storageManager.saveNotepad(this.activeSubjectId, { pages: this.pages });
        }
    }

    // ==========================================
    // FLASHCARDS STUDIO (3D FLIP & MIN-HEAP)
    // ==========================================
    loadFlashcards() {
        this.flashcards = window.storageManager.getFlashcards(this.activeSubjectId);
        this.currentCardIndex = 0;
        this.isCardFlipped = false;
        this.renderFlashcard();
    }

    renderFlashcard() {
        const card = this.flashcards[this.currentCardIndex];
        const cardFront = document.getElementById('cardFrontText');
        const cardBack = document.getElementById('cardBackText');
        const cardInner = document.getElementById('flashcardInner');
        const counterEl = document.getElementById('flashcardCounter');

        counterEl.textContent = `Card ${this.currentCardIndex + 1} of ${this.flashcards.length}`;
        cardInner.classList.remove('rotate-y-180');
        this.isCardFlipped = false;

        if (card) {
            cardFront.textContent = card.front;
            cardBack.textContent = card.back;
        } else {
            cardFront.textContent = 'No cards available. Click + to add one!';
            cardBack.textContent = '';
        }
    }

    flipCard() {
        const cardInner = document.getElementById('flashcardInner');
        this.isCardFlipped = !this.isCardFlipped;
        if (this.isCardFlipped) {
            cardInner.classList.add('rotate-y-180');
        } else {
            cardInner.classList.remove('rotate-y-180');
        }
    }

    nextCard() {
        if (this.flashcards.length === 0) return;
        this.currentCardIndex = (this.currentCardIndex + 1) % this.flashcards.length;
        this.renderFlashcard();
    }

    prevCard() {
        if (this.flashcards.length === 0) return;
        this.currentCardIndex = (this.currentCardIndex - 1 + this.flashcards.length) % this.flashcards.length;
        this.renderFlashcard();
    }

    addEmptyFlashcard() {
        const front = prompt('Enter Flashcard Front (Question/Concept):');
        if (!front) return;
        const back = prompt('Enter Flashcard Back (Answer/Definition):');
        if (!back) return;

        const newCard = {
            id: 'fc_' + Date.now(),
            front: front.trim(),
            back: back.trim(),
            interval: 1
        };
        this.flashcards.push(newCard);
        this.currentCardIndex = this.flashcards.length - 1;
        window.storageManager.saveFlashcards(this.activeSubjectId, this.flashcards);
        this.renderFlashcard();
    }

    deleteCurrentFlashcard() {
        if (this.flashcards.length <= 1) return;
        this.flashcards.splice(this.currentCardIndex, 1);
        this.currentCardIndex = Math.max(0, this.currentCardIndex - 1);
        window.storageManager.saveFlashcards(this.activeSubjectId, this.flashcards);
        this.renderFlashcard();
    }

    // ==========================================
    // SPLIT-SCREEN TRANSPARENT REFERENCE DOCK
    // ==========================================
    renderSplitDoc(doc) {
        const titleEl = document.getElementById('splitDocTitle');
        const contentEl = document.getElementById('splitDocContent');
        titleEl.textContent = doc.name || 'Reference Document';
        contentEl.textContent = doc.content || 'Document preview loading...';
        this.setDocOpacity(this.docOpacity);
    }

    setDocOpacity(val) {
        this.docOpacity = parseFloat(val);
        const dock = document.getElementById('splitDocDock');
        if (dock) {
            dock.style.opacity = this.isDocVisible ? this.docOpacity : '0';
        }
    }

    toggleDocVisibility() {
        this.isDocVisible = !this.isDocVisible;
        const btn = document.getElementById('docEyeBtn');
        btn.innerHTML = this.isDocVisible ? 
            `<i class="fa-solid fa-eye text-orange-500"></i>` : 
            `<i class="fa-solid fa-eye-slash text-slate-400"></i>`;
        this.setDocOpacity(this.docOpacity);
    }

    // Save Whiteboard drawing to Chapter Folder
    saveToCurrentFolder() {
        if (!this.canvas) return;
        const dataUrl = this.canvas.toDataURL('image/png');
        const fileName = `Whiteboard_Practice_${new Date().toLocaleDateString().replace(/\//g, '-')}.png`;

        if (window.appController) {
            window.appController.addWhiteboardFileToActiveFolder(fileName, dataUrl);
            alert(`✅ Saved "${fileName}" directly into your chapter folder!`);
        }
    }

    // Close studio
    closeStudio() {
        if (this.activeMode === 'notepad') {
            this.saveNotepadCurrentPage();
        } else if (this.activeMode === 'drawing' || this.activeMode === 'notes') {
            this.saveCurrentPageSnapshot();
        }

        document.getElementById('studioModal').classList.add('hidden');
        this.activeMode = null;
    }
}

window.whiteboardStudio = new WhiteboardStudio();
