/**
 * MPW (Multipurpose Work) - Master Application Controller
 * Author: Antigravity & Athul V.R.
 * 
 * Orchestrates:
 * - W1 Authentication & Session
 * - WW1 Academic Onboarding (School, College, Personal Work)
 * - W2 Main Interface (Top Bar, 3-Columns, Floating AI Assistant, 3-Tier Color Engine)
 * - W3 Profile Customization (Laptop/Phone DP Upload, Daily Streak 🔥)
 * - Smart Subject Lexer (Voice + Text, Preserves Multi-Word like "computer science")
 * - 8-Option Study Suite + In-App Document Reader with 4-Color Highlighters
 * - 4 Creative Studios (Drawing, Blank/Ruled Notes, Ruled Typed Notepad, Flashcards)
 * - CGPA & Target Score Predictor + Lab & Viva Code Playground
 * - Smart Breadcrumb Search (Trie + Max-Heap) + Full Backup & Restore
 */

class AppController {
    constructor() {
        this.currentSession = 'college'; // 'college', 'school', 'personal'
        this.activeSubject = null;
        this.activeUnit = null;
        this.activeChapter = null;
        this.activeFile = null;

        // Natural Sorting Criteria ('number', 'name', 'starred', 'recent')
        this.currentSortCriteria = 'number';

        // Search engine Trie
        this.searchTrie = new window.DSA.Trie();

        // Speech recognition
        this.recognition = null;
        this.isListening = false;

        // In-app Document Viewer Annotations
        this.activeAnnotations = [];

        // Pomodoro State
        this.pomodoroTimer = null;
        this.pomodoroSeconds = 25 * 60;
        this.pomodoroMode = 'focus'; // 'focus', 'short', 'long'
        this.pomodoroRunning = false;

        // Ambient Soundscape Web Audio
        this.audioCtx = null;
        this.activeSoundNode = null;
        this.activeSoundType = null;

        // Active AI Context
        this.isAIMicListening = false;
        this.aiRecognition = null;
        this.currentSummaryText = '';

        // Audio Memo Recorder
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecordingVoiceMemo = false;
        this.activeMemoSubjectId = null;
        this.activeMemoUnitId = null;
    }

    init() {
        // 1. Initialize Theme
        this.applyThemeColors();

        // 2. Check Auth Session
        this.checkAuthSession();

        // 3. Setup Voice Recognition
        this.initSpeechRecognition();

        // 4. Setup Command Palette Keyboard Shortcuts (Ctrl+K)
        this.initKeyboardShortcuts();

        // 5. Setup Drag and Drop Listeners
        this.initDragAndDrop();

        // 6. Update AI Model Badge
        this.updateAIModelBadge();

        // 7. Bind Global Events
        this.bindEvents();
    }

    // ==========================================
    // THEME & 3-TIER COLOR ENGINE
    // ==========================================
    applyThemeColors() {
        const theme = window.storageManager.getThemeColors();
        const root = document.documentElement;
        root.style.setProperty('--primary-color', theme.primary);
        root.style.setProperty('--secondary-color', theme.secondary);
        root.style.setProperty('--tertiary-color', theme.tertiary);

        // Update color pickers if modal exists
        const pInput = document.getElementById('primaryColorPicker');
        const sInput = document.getElementById('secondaryColorPicker');
        const tInput = document.getElementById('tertiaryColorPicker');
        if (pInput) pInput.value = theme.primary;
        if (sInput) sInput.value = theme.secondary;
        if (tInput) tInput.value = theme.tertiary;
    }

    saveCustomTheme() {
        const primary = document.getElementById('primaryColorPicker').value;
        const secondary = document.getElementById('secondaryColorPicker').value;
        const tertiary = document.getElementById('tertiaryColorPicker').value;

        window.storageManager.saveThemeColors({ primary, secondary, tertiary });
        this.applyThemeColors();
        document.getElementById('themeModal').classList.add('hidden');
        this.showToast('🎨 Custom 3-Tier Theme Saved Permanently!');
    }

    setThemePreset(primary, secondary, tertiary) {
        document.getElementById('primaryColorPicker').value = primary;
        document.getElementById('secondaryColorPicker').value = secondary;
        document.getElementById('tertiaryColorPicker').value = tertiary;
        this.saveCustomTheme();
    }

    // ==========================================
    // W1 AUTHENTICATION & LOGIN FLOW
    // ==========================================
    checkAuthSession() {
        const user = window.authManager.getCurrentUser();
        const authModal = document.getElementById('authModal');
        const mainApp = document.getElementById('mainAppContainer');

        if (!user) {
            authModal.classList.remove('hidden');
            mainApp.classList.add('hidden');
        } else {
            authModal.classList.add('hidden');
            mainApp.classList.remove('hidden');
            this.updateHeaderUserProfile(user);
            this.handleSessionLaunch(this.currentSession);
        }
    }

    fillDemoAccount() {
        this.switchAuthTab('login');
        const idInput = document.getElementById('loginIdentifier');
        const passInput = document.getElementById('loginPassword');
        if (idInput) idInput.value = 'MCP-user-000001';
        if (passInput) passInput.value = 'password123';
        this.showToast('⚡ Pre-filled demo credentials. Click Enter to sign in!');
    }

    togglePasswordVisibility(inputId, iconId) {
        const input = document.getElementById(inputId);
        const icon = document.getElementById(iconId);
        if (!input) return;
        if (input.type === 'password') {
            input.type = 'text';
            if (icon) {
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            }
        } else {
            input.type = 'password';
            if (icon) {
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        }
    }

    checkPasswordStrength(password) {
        const res = window.authManager.calculatePasswordStrength(password);
        const bar = document.getElementById('passwordStrengthBar');
        const label = document.getElementById('passwordStrengthLabel');
        if (bar) {
            bar.style.width = res.width;
            bar.className = `h-full ${res.color} password-strength-bar`;
        }
        if (label) {
            label.textContent = res.label;
            label.className = `font-bold ${res.color.replace('bg-', 'text-')}`;
        }
    }

    handleLoginSubmit(e) {
        e.preventDefault();
        const idInput = document.getElementById('loginIdentifier').value;
        const passInput = document.getElementById('loginPassword').value;

        const res = window.authManager.login(idInput, passInput);
        if (res.success) {
            this.checkAuthSession();
            this.showToast(`Welcome back, ${res.user.name}! 🔥 Daily Streak: ${res.user.dailyStreak} Days`);
        } else {
            document.getElementById('loginErrorText').textContent = res.message;
            document.getElementById('loginErrorText').classList.remove('hidden');
        }
    }

    handleRegisterSubmit(e) {
        e.preventDefault();
        const name = document.getElementById('regName').value;
        const age = document.getElementById('regAge').value;
        const email = document.getElementById('regEmail').value;
        const phone = document.getElementById('regPhone').value;
        const address = document.getElementById('regAddress').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match! Please check again.');
            return;
        }

        const res = window.authManager.register({ name, age, email, phone, address, password });
        if (res.success) {
            // Show 5-second countdown toast displaying permanent User ID
            this.showPermanentUserIdToast(res.userId);

            // Switch to Login tab and auto-fill User ID
            this.switchAuthTab('login');
            document.getElementById('loginIdentifier').value = res.userId;
            document.getElementById('loginPassword').value = password;
        } else {
            alert(res.message);
        }
    }

    showPermanentUserIdToast(userId) {
        const toast = document.getElementById('userIdToast');
        const toastUserId = document.getElementById('toastUserIdText');
        toastUserId.textContent = userId;

        toast.classList.remove('hidden');

        // Copy button event
        document.getElementById('copyToastIdBtn').onclick = () => {
            navigator.clipboard.writeText(userId);
            this.showToast('📋 User ID copied to clipboard!');
        };

        // Automatically hide after 5 seconds
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 5000);
    }

    switchAuthTab(tab) {
        const loginTab = document.getElementById('authLoginTab');
        const regTab = document.getElementById('authRegisterTab');
        const loginForm = document.getElementById('loginFormContainer');
        const regForm = document.getElementById('registerFormContainer');

        if (tab === 'login') {
            loginTab.classList.add('border-orange-500', 'text-orange-500');
            loginTab.classList.remove('text-slate-400');
            regTab.classList.remove('border-orange-500', 'text-orange-500');
            regTab.classList.add('text-slate-400');
            loginForm.classList.remove('hidden');
            regForm.classList.add('hidden');
        } else {
            regTab.classList.add('border-orange-500', 'text-orange-500');
            regTab.classList.remove('text-slate-400');
            loginTab.classList.remove('border-orange-500', 'text-orange-500');
            loginTab.classList.add('text-slate-400');
            regForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
        }
    }

    logout() {
        if (confirm('Are you sure you want to log out of MPW?')) {
            window.authManager.logout();
            window.location.reload();
        }
    }

    // ==========================================
    // WW1 ACADEMIC ONBOARDING & SESSIONS
    // ==========================================
    switchSession(sessionName) {
        if (sessionName === 'teacher' || sessionName === 'professor') {
            this.showComingSoonModal('Educator Portal (Teacher / Professor)', 'Lesson planners, assignment auto-graders, question paper generators, and student viva gradebooks are coming in v2.0!');
            return;
        }

        this.currentSession = sessionName;
        document.querySelectorAll('.session-nav-btn').forEach(b => {
            b.classList.remove('bg-orange-500', 'text-white');
            b.classList.add('text-slate-300');
        });
        const activeNav = document.getElementById(`nav_${sessionName}`);
        if (activeNav) {
            activeNav.classList.add('bg-orange-500', 'text-white');
            activeNav.classList.remove('text-slate-300');
        }

        this.handleSessionLaunch(sessionName);
    }

    handleSessionLaunch(sessionName) {
        // Check 1-time onboarding rule
        const hasSetup = window.storageManager.hasCompletedOnboarding(sessionName);

        if (!hasSetup) {
            if (sessionName === 'college') {
                document.getElementById('collegeOnboardingModal').classList.remove('hidden');
            } else if (sessionName === 'school') {
                document.getElementById('schoolOnboardingModal').classList.remove('hidden');
            }
        } else {
            this.loadWorkspace(sessionName);
        }
    }

    // School Onboarding Flow
    handleSchoolClassChange() {
        const classVal = parseInt(document.getElementById('schoolClassSelect').value, 10);
        const streamContainer = document.getElementById('schoolStreamGroup');
        if (classVal >= 11) {
            streamContainer.classList.remove('hidden');
        } else {
            streamContainer.classList.add('hidden');
        }
    }

    saveSchoolOnboarding() {
        const classSelect = document.getElementById('schoolClassSelect');
        const classVal = parseInt(classSelect.value, 10);
        let stream = '';

        if (classVal >= 11) {
            const streamSelect = document.getElementById('schoolStreamSelect');
            stream = streamSelect.value === 'custom' ? 
                document.getElementById('schoolCustomStreamInput').value : streamSelect.value;
        }

        const profile = {
            className: `Class ${classVal}`,
            stream: stream
        };
        window.storageManager.saveSchoolProfile(profile);
        document.getElementById('schoolOnboardingModal').classList.add('hidden');
        this.loadWorkspace('school');
        this.showToast('🎒 School Academic Profile Saved Permanently!');
    }

    // College Onboarding Flow & Batch Validation
    handleCollegeYearSemSync() {
        const semSelect = document.getElementById('collegeSemSelect');
        const yearInput = document.getElementById('collegeYearInput');
        const sem = parseInt(semSelect.value, 10);

        // Auto-sync Semester to Year (2 sems per year)
        if (sem <= 2) yearInput.value = '1st Year';
        else if (sem <= 4) yearInput.value = '2nd Year';
        else if (sem <= 6) yearInput.value = '3rd Year';
        else yearInput.value = '4th Year';
    }

    saveCollegeOnboarding() {
        const branchSelect = document.getElementById('collegeBranchSelect');
        const branch = branchSelect.value === 'custom' ? 
            document.getElementById('collegeCustomBranchInput').value : branchSelect.value;

        const batchStart = parseInt(document.getElementById('collegeBatchStart').value, 10);
        const batchEnd = parseInt(document.getElementById('collegeBatchEnd').value, 10);
        const diff = batchEnd - batchStart;

        // Batch Year Validation: 4 years vs 5 years Integrated Modal
        if (diff === 5) {
            // Trigger 5-year Integrated Course Modal
            this.pendingCollegeData = {
                branch,
                batchYears: `${batchStart}-${batchEnd}`,
                year: document.getElementById('collegeYearInput').value,
                semester: `Semester ${document.getElementById('collegeSemSelect').value}`
            };
            document.getElementById('integratedCourseModal').classList.remove('hidden');
            return;
        } else if (diff !== 4) {
            alert(`Invalid batch year difference (${diff} years)! Standard graduation requires a 4-year batch difference (e.g. 2022-2026).`);
            return;
        }

        const profile = {
            branch,
            batchYears: `${batchStart}-${batchEnd}`,
            isIntegrated: false,
            year: document.getElementById('collegeYearInput').value,
            semester: `Semester ${document.getElementById('collegeSemSelect').value}`
        };

        window.storageManager.saveCollegeProfile(profile);
        document.getElementById('collegeOnboardingModal').classList.add('hidden');
        this.loadWorkspace('college');
        this.showToast('🎓 College Academic Profile Saved Permanently!');
    }

    handleIntegratedChoice(isIntegrated) {
        document.getElementById('integratedCourseModal').classList.add('hidden');
        if (!isIntegrated) {
            alert('Batch year mismatch! Since your course is not integrated, please specify a standard 4-year batch.');
            return;
        }

        const profile = {
            ...this.pendingCollegeData,
            isIntegrated: true
        };
        window.storageManager.saveCollegeProfile(profile);
        document.getElementById('collegeOnboardingModal').classList.add('hidden');
        this.loadWorkspace('college');
        this.showToast('🎓 Integrated 5-Year Dual Degree Profile Approved & Saved!');
    }

    // ==========================================
    // WORKSPACE & SUBJECT CARD DASHBOARD
    // ==========================================
    loadWorkspace(sessionName) {
        this.currentSession = sessionName;
        const titleEl = document.getElementById('workspaceHeaderTitle');
        const subtitleEl = document.getElementById('workspaceSubtitle');

        let userBadge = '';
        if (sessionName === 'college') {
            const p = window.storageManager.getCollegeProfile();
            titleEl.textContent = '🎓 College Study Workspace';
            subtitleEl.textContent = `${p.branch} • ${p.year} (${p.semester}) • Batch ${p.batchYears}`;
            userBadge = `${p.branch} • ${p.year}`;
        } else if (sessionName === 'school') {
            const p = window.storageManager.getSchoolProfile();
            titleEl.textContent = '🎒 School Study Workspace';
            subtitleEl.textContent = `${p.className} ${p.stream ? '(' + p.stream + ')' : ''}`;
            userBadge = `${p.className} ${p.stream}`;
        } else {
            titleEl.textContent = '💼 Personal Work (PW) Studio';
            subtitleEl.textContent = 'Custom Projects, Freelance Tasks & Portfolios';
            userBadge = 'Personal Work';
        }

        document.getElementById('userAcademicBadge').textContent = userBadge;
        this.renderSubjectCards();
        this.rebuildSearchTrie();
    }

    renderSubjectCards() {
        const subjects = window.storageManager.getSubjects(this.currentSession);
        const container = document.getElementById('subjectCardsGrid');
        container.innerHTML = '';

        subjects.forEach(subj => {
            const card = document.createElement('div');
            card.className = 'p-5 rounded-xl border border-slate-700 hover:border-orange-500 transition-all cursor-pointer shadow-lg relative group flex flex-col justify-between';
            card.style.backgroundColor = subj.color ? `${subj.color}22` : '#1E293B';
            card.style.borderLeft = `6px solid ${subj.color || '#F97316'}`;

            // Calculate total files
            let fileCount = 0;
            subj.units.forEach(u => u.chapters.forEach(c => fileCount += c.files.length));

            card.innerHTML = `
                <div>
                    <div class="flex items-center justify-between mb-3">
                        <span class="p-2 rounded-lg text-white font-bold" style="background-color: ${subj.color || '#F97316'}">
                            <i class="fa-solid fa-book-open"></i>
                        </span>
                        <div class="flex items-center space-x-2">
                            <input type="color" value="${subj.color || '#F97316'}" class="w-6 h-6 rounded cursor-pointer bg-transparent border-0 opacity-0 group-hover:opacity-100 transition-opacity" title="Change Card Color" onchange="window.appController.updateSubjectColor('${subj.id}', this.value, event)">
                            <button onclick="window.appController.deleteSubject('${subj.id}', event)" class="text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" title="Delete Subject">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </div>
                    <h3 class="text-lg font-bold text-white group-hover:text-orange-400 transition-colors">${subj.name}</h3>
                    <p class="text-xs text-slate-400 mt-1">${subj.units.length} Units • ${fileCount} Documents & Notes</p>
                </div>
                <div class="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-300">
                    <span class="hover:underline flex items-center"><i class="fa-solid fa-folder-open mr-1.5 text-orange-400"></i> Open Workspace</span>
                    <span class="bg-slate-800/80 px-2 py-0.5 rounded text-orange-400 font-mono text-[11px]">8 Tools</span>
                </div>
            `;

            card.onclick = () => this.openSubjectWorkspace(subj.id);
            container.appendChild(card);
        });

        this.renderSubjectSidebarNav(subjects);
    }

    renderSubjectSidebarNav(subjects) {
        const navList = document.getElementById('sidebarSubjectList');
        navList.innerHTML = '';

        subjects.forEach(subj => {
            const li = document.createElement('li');
            li.className = 'px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 cursor-pointer flex items-center justify-between transition-colors';
            li.innerHTML = `
                <span class="flex items-center truncate">
                    <span class="w-2.5 h-2.5 rounded-full mr-2.5" style="background-color: ${subj.color || '#F97316'}"></span>
                    <span class="truncate">${subj.name}</span>
                </span>
                <i class="fa-solid fa-chevron-right text-[10px] text-slate-500"></i>
            `;
            li.onclick = () => this.openSubjectWorkspace(subj.id);
            navList.appendChild(li);
        });
    }

    // ==========================================
    // SMART SUBJECT LEXER (VOICE & TEXT)
    // ==========================================
    handleSubjectAddSubmit() {
        const inputEl = document.getElementById('newSubjectInput');
        const rawText = inputEl.value;
        if (!rawText.trim()) return;

        // Run through Lexical Tokenizer
        const parsedSubjects = window.DSA.SubjectLexer.parse(rawText);

        if (parsedSubjects.length === 0) {
            alert('Please enter valid subject names!');
            return;
        }

        const colors = ['#6366F1', '#EC4899', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#14B8A6', '#F43F5E'];
        const existing = window.storageManager.getSubjects(this.currentSession);

        parsedSubjects.forEach((name, idx) => {
            const color = colors[(existing.length + idx) % colors.length];
            const newSubj = {
                id: 'subj_' + Date.now() + '_' + idx,
                name: name,
                color: color,
                icon: 'book',
                units: [
                    {
                        id: 'unit_' + Date.now(),
                        name: `Unit 1: Foundations of ${name}`,
                        chapters: [
                            {
                                id: 'chap_' + Date.now(),
                                name: 'Chapter 1: Introduction & Fundamentals',
                                topics: ['Core Concepts', 'Formulas & Definitions'],
                                files: []
                            }
                        ]
                    }
                ]
            };
            existing.push(newSubj);
        });

        window.storageManager.saveSubjects(this.currentSession, existing);
        inputEl.value = '';
        this.renderSubjectCards();
        this.showToast(`✨ Created ${parsedSubjects.length} Subject Card(s) with Smart Lexer!`);
    }

    initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                const inputEl = document.getElementById('newSubjectInput');
                inputEl.value = transcript;
                this.isListening = false;
                document.getElementById('voiceMicBtn').classList.remove('text-red-500', 'animate-pulse');
                this.handleSubjectAddSubmit();
            };

            this.recognition.onerror = () => {
                this.isListening = false;
                document.getElementById('voiceMicBtn').classList.remove('text-red-500', 'animate-pulse');
            };
        }
    }

    toggleVoiceInput() {
        if (!this.recognition) {
            alert('Speech Recognition is not supported on this browser. Please type subject names manually.');
            return;
        }

        const micBtn = document.getElementById('voiceMicBtn');
        if (!this.isListening) {
            this.recognition.start();
            this.isListening = true;
            micBtn.classList.add('text-red-500', 'animate-pulse');
            this.showToast('🎙️ Listening... Speak your subjects (e.g., "Physics Chemistry Computer Science")');
        } else {
            this.recognition.stop();
            this.isListening = false;
            micBtn.classList.remove('text-red-500', 'animate-pulse');
        }
    }

    updateSubjectColor(subjId, newColor, event) {
        event.stopPropagation();
        const subjects = window.storageManager.getSubjects(this.currentSession);
        const subj = subjects.find(s => s.id === subjId);
        if (subj) {
            subj.color = newColor;
            window.storageManager.saveSubjects(this.currentSession, subjects);
            this.renderSubjectCards();
        }
    }

    deleteSubject(subjId, event) {
        event.stopPropagation();
        if (confirm('Are you sure you want to delete this entire subject and its files?')) {
            let subjects = window.storageManager.getSubjects(this.currentSession);
            subjects = subjects.filter(s => s.id !== subjId);
            window.storageManager.saveSubjects(this.currentSession, subjects);
            this.renderSubjectCards();
            this.showToast('Subject deleted.');
        }
    }

    // ==========================================
    // INSIDE SUBJECT WORKSPACE & 8-TOOL SUITE
    // ==========================================
    openSubjectWorkspace(subjId) {
        const subjects = window.storageManager.getSubjects(this.currentSession);
        const subj = subjects.find(s => s.id === subjId);
        if (!subj) return;

        this.activeSubject = subj;
        this.activeUnit = subj.units[0] || null;
        this.activeChapter = this.activeUnit ? this.activeUnit.chapters[0] : null;

        // Switch view
        document.getElementById('subjectCardsView').classList.add('hidden');
        document.getElementById('subjectDetailView').classList.remove('hidden');

        document.getElementById('detailSubjectName').textContent = subj.name;
        document.getElementById('detailSubjectColorDot').style.backgroundColor = subj.color;

        this.renderChapterFolderHierarchy();
    }

    closeSubjectWorkspace() {
        this.activeSubject = null;
        document.getElementById('subjectDetailView').classList.add('hidden');
        document.getElementById('subjectCardsView').classList.remove('hidden');
        this.renderSubjectCards();
    }

    renderChapterFolderHierarchy() {
        const container = document.getElementById('chapterHierarchyContainer');
        if (!container) return;
        container.innerHTML = '';

        if (!this.activeSubject.units || this.activeSubject.units.length === 0) {
            container.innerHTML = '<div class="p-8 text-center text-slate-500 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800"><i class="fa-solid fa-folder-plus text-3xl text-orange-400 mb-2"></i><p class="text-sm">No units created yet. Click "+ Add Unit" above to start your curriculum.</p></div>';
            return;
        }

        // Apply Natural Alphanumeric Sorting
        const sortedUnits = window.storageManager.sortItems(this.activeSubject.units, this.currentSortCriteria || 'number');

        sortedUnits.forEach(unit => {
            const unitCard = document.createElement('div');
            unitCard.className = 'mb-6 bg-slate-800/80 rounded-xl p-4 border border-slate-700/70 shadow-sm';

            // Audio Memos for this unit
            const audioMemos = window.storageManager.getAudioMemos(this.activeSubject.id, unit.id);
            let audioMemosHtml = '';
            if (audioMemos.length > 0) {
                audioMemosHtml = `
                    <div class="mt-3 p-2.5 bg-slate-900/80 rounded-lg border border-slate-700/50">
                        <p class="text-[11px] font-bold text-orange-400 uppercase tracking-wider mb-1 flex items-center">
                            <i class="fa-solid fa-microphone-lines mr-1.5"></i> Lecture Voice Memos (${audioMemos.length})
                        </p>
                        <div class="space-y-1.5">
                            ${audioMemos.map(m => `
                                <div class="flex items-center justify-between p-1.5 bg-slate-950 rounded border border-slate-800 text-xs">
                                    <span class="text-slate-300 truncate max-w-[150px]"><i class="fa-solid fa-play text-orange-400 mr-1 text-[10px]"></i> ${m.title || 'Audio Note'}</span>
                                    <audio controls src="${m.audioData}" class="h-6 w-36 sm:w-48"></audio>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }

            let chaptersHtml = '';
            (unit.chapters || []).forEach(chap => {
                let filesHtml = '';
                const sortedFiles = window.storageManager.sortItems(chap.files, this.currentSortCriteria || 'number');

                sortedFiles.forEach(file => {
                    const icon = file.type === 'pdf' ? 'fa-file-pdf text-red-400' :
                                file.type === 'ppt' ? 'fa-file-powerpoint text-orange-400' :
                                file.type === 'image' ? 'fa-file-image text-emerald-400' : 'fa-file-word text-blue-400';

                    filesHtml += `
                        <div class="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-700/40 mb-2 cursor-pointer transition-colors group" onclick="window.appController.openDocumentReader('${file.id}')">
                            <div class="flex items-center space-x-3 truncate">
                                <i class="fa-solid ${icon} text-lg"></i>
                                <div class="truncate">
                                    <p class="text-sm font-medium text-white group-hover:text-orange-400 transition-colors truncate">${file.name}</p>
                                    <p class="text-[11px] text-slate-400">${file.size || '1.5 MB'} • ${file.pages || '10'} Pages ${file.label ? '• <span class="text-orange-400 font-semibold">' + file.label + '</span>' : ''}</p>
                                </div>
                            </div>
                            <div class="flex items-center space-x-2">
                                <button onclick="window.appController.toggleStarFile('${file.id}', event)" class="text-slate-400 hover:text-yellow-400 p-1" title="Star as Favorite">
                                    <i class="fa-${file.isStarred ? 'solid text-yellow-400' : 'regular'} fa-star"></i>
                                </button>
                                <button onclick="window.appController.deleteFile('${chap.id}', '${file.id}', event)" class="text-slate-400 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <i class="fa-solid fa-trash-can text-xs"></i>
                                </button>
                            </div>
                        </div>
                    `;
                });

                chaptersHtml += `
                    <div class="mt-3 pl-4 border-l-2 border-orange-500/40">
                        <div class="flex items-center justify-between mb-2">
                            <h5 class="text-sm font-semibold text-slate-200"><i class="fa-solid fa-folder-open text-orange-400 mr-2"></i> ${chap.name}</h5>
                            <button onclick="window.appController.triggerFileUpload('${chap.id}')" class="text-xs bg-slate-700 hover:bg-orange-500 text-white px-2.5 py-1 rounded transition-colors">
                                <i class="fa-solid fa-upload mr-1"></i> Add File
                            </button>
                        </div>
                        <div class="pl-2">${filesHtml || '<p class="text-xs text-slate-500 py-1">No files in this chapter.</p>'}</div>
                    </div>
                `;
            });

            unitCard.innerHTML = `
                <div class="flex items-center justify-between border-b border-slate-700/60 pb-2">
                    <h4 class="font-bold text-white text-base flex items-center">
                        <i class="fa-solid fa-layer-group text-blue-400 mr-2"></i>
                        <span>${unit.name}</span>
                    </h4>
                    <div class="flex items-center space-x-2">
                        <button onclick="window.appController.startVoiceMemoRecording('${this.activeSubject.id}', '${unit.id}')" class="text-[11px] bg-slate-700 hover:bg-slate-600 text-slate-200 px-2 py-1 rounded-lg flex items-center space-x-1 transition-colors" title="Record Voice Memo">
                            <i class="fa-solid fa-microphone text-orange-400"></i>
                            <span>Voice Memo</span>
                        </button>
                        <button onclick="window.appController.promptAddChapter('${unit.id}')" class="text-xs text-orange-400 hover:underline">
                            + Add Chapter
                        </button>
                    </div>
                </div>
                <div>${chaptersHtml}</div>
                ${audioMemosHtml}
            `;
            container.appendChild(unitCard);
        });
    }

    promptAddUnit() {
        const name = prompt('Enter Unit Name (e.g., Unit 2: Advanced Concepts):');
        if (!name) return;

        const newUnit = {
            id: 'unit_' + Date.now(),
            name: name.trim(),
            chapters: [
                {
                    id: 'chap_' + Date.now(),
                    name: 'Chapter 1: Overview & Notes',
                    topics: [],
                    files: []
                }
            ]
        };

        this.activeSubject.units.push(newUnit);
        this.saveActiveSubject();
        this.renderChapterFolderHierarchy();
    }

    promptAddChapter(unitId) {
        const name = prompt('Enter Chapter Name (e.g., Chapter 3: Dynamic Programming):');
        if (!name) return;

        const unit = this.activeSubject.units.find(u => u.id === unitId);
        if (unit) {
            unit.chapters.push({
                id: 'chap_' + Date.now(),
                name: name.trim(),
                topics: [],
                files: []
            });
            this.saveActiveSubject();
            this.renderChapterFolderHierarchy();
        }
    }

    triggerFileUpload(chapId) {
        this.targetUploadChapterId = chapId;
        document.getElementById('fileUploadInput').click();
    }

    handleFileUpload(event) {
        const files = event.target.files;
        if (!files || files.length === 0 || !this.targetUploadChapterId) return;

        const file = files[0];
        const ext = file.name.split('.').pop().toLowerCase();
        let fileType = 'pdf';
        if (['ppt', 'pptx'].includes(ext)) fileType = 'ppt';
        else if (['doc', 'docx'].includes(ext)) fileType = 'docx';
        else if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) fileType = 'image';

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const newFileObj = {
                id: 'file_' + Date.now(),
                name: file.name,
                type: fileType,
                size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
                pages: Math.floor(Math.random() * 20) + 5,
                isStarred: false,
                label: 'Exam Prep',
                content: typeof content === 'string' && !content.startsWith('data:') ? content : `Document Content Preview for ${file.name}`
            };

            // Locate chapter and push
            this.activeSubject.units.forEach(u => {
                const chap = u.chapters.find(c => c.id === this.targetUploadChapterId);
                if (chap) chap.files.push(newFileObj);
            });

            this.saveActiveSubject();
            this.renderChapterFolderHierarchy();
            this.showToast(`📁 Uploaded "${file.name}" to chapter!`);
            event.target.value = '';
        };

        if (fileType === 'image') {
            reader.readAsDataURL(file);
        } else {
            reader.readAsText(file);
        }
    }

    addWhiteboardFileToActiveFolder(fileName, dataUrl) {
        if (!this.activeSubject || !this.activeSubject.units[0]) return;
        const chap = this.activeSubject.units[0].chapters[0];
        if (chap) {
            chap.files.push({
                id: 'wb_' + Date.now(),
                name: fileName,
                type: 'image',
                size: '1.2 MB',
                pages: 1,
                isStarred: true,
                label: 'Whiteboard Sketch',
                content: dataUrl
            });
            this.saveActiveSubject();
            this.renderChapterFolderHierarchy();
        }
    }

    deleteFile(chapId, fileId, event) {
        event.stopPropagation();
        if (confirm('Delete this file?')) {
            this.activeSubject.units.forEach(u => {
                const chap = u.chapters.find(c => c.id === chapId);
                if (chap) {
                    chap.files = chap.files.filter(f => f.id !== fileId);
                }
            });
            this.saveActiveSubject();
            this.renderChapterFolderHierarchy();
            this.showToast('File deleted.');
        }
    }

    toggleStarFile(fileId, event) {
        event.stopPropagation();
        this.activeSubject.units.forEach(u => {
            u.chapters.forEach(c => {
                const f = c.files.find(item => item.id === fileId);
                if (f) f.isStarred = !f.isStarred;
            });
        });
        this.saveActiveSubject();
        this.renderChapterFolderHierarchy();
    }

    saveActiveSubject() {
        const subjects = window.storageManager.getSubjects(this.currentSession);
        const idx = subjects.findIndex(s => s.id === this.activeSubject.id);
        if (idx !== -1) {
            subjects[idx] = this.activeSubject;
            window.storageManager.saveSubjects(this.currentSession, subjects);
            this.rebuildSearchTrie();
        }
    }

    // ==========================================
    // IN-APP DOCUMENT VIEWER & HIGHLIGHTERS
    // ==========================================
    openDocumentReader(fileId) {
        let matchedFile = null;
        let breadcrumb = `${this.activeSubject.name} > `;

        this.activeSubject.units.forEach(u => {
            u.chapters.forEach(c => {
                const f = c.files.find(item => item.id === fileId);
                if (f) {
                    matchedFile = f;
                    breadcrumb += `${u.name} > ${c.name} > ${f.name}`;
                }
            });
        });

        if (!matchedFile) return;
        this.activeFile = matchedFile;

        const readerModal = document.getElementById('documentReaderModal');
        readerModal.classList.remove('hidden');

        document.getElementById('docReaderTitle').textContent = matchedFile.name;
        document.getElementById('docReaderBreadcrumb').textContent = breadcrumb;
        document.getElementById('docReaderPages').textContent = `Page 1 of ${matchedFile.pages || 14}`;

        const canvasBody = document.getElementById('docReaderBody');
        if (matchedFile.type === 'image' && matchedFile.content.startsWith('data:')) {
            canvasBody.innerHTML = `<img src="${matchedFile.content}" class="max-w-full rounded shadow-lg mx-auto" alt="${matchedFile.name}">`;
        } else {
            canvasBody.innerHTML = `
                <div class="prose prose-invert max-w-none text-slate-200 leading-relaxed font-sans text-base select-text">
                    <pre class="whitespace-pre-wrap font-sans bg-transparent border-0 p-0 text-slate-200">${matchedFile.content || 'Document content loading...'}</pre>
                </div>
            `;
        }
    }

    closeDocumentReader() {
        document.getElementById('documentReaderModal').classList.add('hidden');
        this.activeFile = null;
    }

    highlightSelectedText(colorClass) {
        const selection = window.getSelection();
        if (!selection.rangeCount || selection.isCollapsed) return;

        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.className = colorClass;
        span.textContent = range.toString();

        range.deleteContents();
        range.insertNode(span);
        selection.removeAllRanges();
        this.showToast('🖍️ Highlight applied!');
    }

    createFlashcardFromSelection() {
        const selected = window.getSelection().toString().trim();
        if (!selected) {
            alert('Please highlight or select text from the document first!');
            return;
        }

        const front = prompt('Flashcard Question / Term:', selected);
        if (!front) return;
        const back = prompt('Flashcard Answer / Definition:');
        if (!back) return;

        const cards = window.storageManager.getFlashcards(this.activeSubject.id);
        cards.push({
            id: 'fc_' + Date.now(),
            front: front.trim(),
            back: back.trim(),
            interval: 1
        });
        window.storageManager.saveFlashcards(this.activeSubject.id, cards);
        this.showToast('📇 Flashcard saved to subject deck!');
    }

    // ==========================================
    // UNIT REVISION SUMMARY & STUDY CHEATSHEETS
    // ==========================================
    generateSubjectSummary() {
        if (!this.activeSubject) return;

        const modal = document.getElementById('unitSummaryModal');
        const titleEl = document.getElementById('unitSummaryModalTitle');
        const contentEl = document.getElementById('unitSummaryContent');

        titleEl.textContent = `Revision Cheat Sheet: ${this.activeSubject.name}`;

        let summaryText = `### 📚 ${this.activeSubject.name} — Rapid Revision Summary\n\n`;
        let unitCount = 0;
        let fileCount = 0;

        (this.activeSubject.units || []).forEach((u) => {
            unitCount++;
            summaryText += `#### 📁 ${u.name}\n`;
            (u.chapters || []).forEach(c => {
                summaryText += `- **${c.name}:**\n`;
                (c.files || []).forEach(f => {
                    fileCount++;
                    const snippet = f.content ? f.content.slice(0, 150).replace(/\n/g, ' ') + '...' : 'Lecture notes on core syllabus';
                    summaryText += `  - *${f.name}*: ${snippet}\n`;
                });
            });
            summaryText += `\n`;
        });

        summaryText += `\n#### 🎯 Key Exam Formulas & Takeaways:\n`;
        summaryText += `- Review all starred (⭐) lecture summaries before testing.\n`;
        summaryText += `- Keep active recall high with your 3D Flashcard decks.\n`;
        summaryText += `- Total Units Reviewed: ${unitCount} | Files Indexed: ${fileCount}\n`;

        this.currentSummaryText = summaryText;
        contentEl.innerHTML = this.formatMarkdown(summaryText);
        modal.classList.remove('hidden');
    }

    copyUnitSummaryText() {
        if (this.currentSummaryText) {
            navigator.clipboard.writeText(this.currentSummaryText);
            this.showToast('📋 Revision summary copied to clipboard!');
        }
    }

    saveSummaryAsUnitNote() {
        if (!this.currentSummaryText || !this.activeSubject) return;
        if (!this.activeSubject.units || this.activeSubject.units.length === 0) {
            this.promptAddUnit();
        }
        const unit = this.activeSubject.units[0];
        if (!unit.chapters) unit.chapters = [];
        if (unit.chapters.length === 0) {
            unit.chapters.push({ id: 'chap_' + Date.now(), name: 'Summaries', files: [] });
        }

        const newFile = {
            id: 'file_sum_' + Date.now(),
            name: `${this.activeSubject.name}_Exam_CheatSheet.md`,
            type: 'docx',
            size: '0.8 MB',
            pages: 2,
            isStarred: true,
            label: 'Summary CheatSheet',
            content: this.currentSummaryText
        };

        unit.chapters[0].files.push(newFile);
        this.saveActiveSubject();
        this.renderChapterFolderHierarchy();
        document.getElementById('unitSummaryModal').classList.add('hidden');
        this.showToast('💾 Saved Revision CheatSheet to Unit!');
    }

    // ==========================================
    // VOICE LECTURE MEMO RECORDER (GoodNotes / Notability)
    // ==========================================
    async startVoiceMemoRecording(subjectId, unitId) {
        if (this.isRecordingVoiceMemo) {
            // Stop recording
            if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
                this.mediaRecorder.stop();
            }
            this.isRecordingVoiceMemo = false;
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            this.activeMemoSubjectId = subjectId;
            this.activeMemoUnitId = unitId;

            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) this.audioChunks.push(e.data);
            };

            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64Audio = reader.result;
                    const memoTitle = prompt('Enter a title for this voice memo:', `Lecture Voice Note ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`);
                    if (memoTitle) {
                        window.storageManager.saveAudioMemo(this.activeMemoSubjectId, this.activeMemoUnitId, {
                            title: memoTitle,
                            audioData: base64Audio
                        });
                        this.renderChapterFolderHierarchy();
                        this.showToast('🎙️ Audio Memo saved to unit!');
                    }
                };
                reader.readAsDataURL(audioBlob);

                // Stop tracks
                stream.getTracks().forEach(t => t.stop());
            };

            this.mediaRecorder.start();
            this.isRecordingVoiceMemo = true;
            this.showToast('🔴 Recording Audio Memo... Click "Voice Memo" again to stop.');
        } catch (err) {
            alert('Could not access microphone: ' + err.message);
        }
    }

    // ==========================================
    // SORTING & DRAG-AND-DROP FILE VAULT
    // ==========================================
    changeSortCriteria(criteria) {
        this.currentSortCriteria = criteria;
        this.renderChapterFolderHierarchy();
        this.showToast(`📁 Sorted by: ${criteria.toUpperCase()}`);
    }

    initDragAndDrop() {
        window.addEventListener('dragover', (e) => e.preventDefault());
        window.addEventListener('drop', (e) => e.preventDefault());
    }

    handleDragDropUpload(event) {
        event.preventDefault();
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0 || !this.activeSubject) return;

        if (!this.activeSubject.units || this.activeSubject.units.length === 0) {
            this.promptAddUnit();
        }

        const unit = this.activeSubject.units[0];
        if (!unit.chapters || unit.chapters.length === 0) {
            unit.chapters.push({ id: 'chap_' + Date.now(), name: 'Chapter 1: Uploaded Resources', files: [] });
        }
        const chap = unit.chapters[0];

        Array.from(files).forEach(file => {
            const ext = file.name.split('.').pop().toLowerCase();
            let fileType = 'pdf';
            if (['ppt', 'pptx'].includes(ext)) fileType = 'ppt';
            else if (['doc', 'docx'].includes(ext)) fileType = 'docx';
            else if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) fileType = 'image';

            const reader = new FileReader();
            reader.onload = (e) => {
                const newFileObj = {
                    id: 'file_' + Date.now() + Math.random().toString(36).substr(2, 4),
                    name: file.name,
                    type: fileType,
                    size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
                    pages: Math.floor(Math.random() * 15) + 3,
                    isStarred: false,
                    label: 'Stashed File',
                    content: typeof e.target.result === 'string' && !e.target.result.startsWith('data:') ? e.target.result : `Document Content Preview for ${file.name}`
                };
                chap.files.push(newFileObj);
                this.saveActiveSubject();
                this.renderChapterFolderHierarchy();
            };
            reader.readAsText(file);
        });

        this.showToast(`📥 Saved ${files.length} file(s) into ${this.activeSubject.name}!`);
    }

    // ==========================================
    // SMART BREADCRUMB SEARCH (TRIE + HEAP)
    // ==========================================
    rebuildSearchTrie() {
        this.searchTrie = new window.DSA.Trie();
        const subjects = window.storageManager.getSubjects(this.currentSession);

        subjects.forEach(subj => {
            this.searchTrie.insert(subj.name, {
                id: subj.id,
                name: subj.name,
                type: 'subject',
                path: `${subj.name}`,
                score: 10
            });

            subj.units.forEach(u => {
                this.searchTrie.insert(u.name, {
                    id: u.id,
                    name: u.name,
                    type: 'unit',
                    path: `${subj.name} > ${u.name}`,
                    score: 8
                });

                u.chapters.forEach(c => {
                    this.searchTrie.insert(c.name, {
                        id: c.id,
                        name: c.name,
                        type: 'chapter',
                        path: `${subj.name} > ${u.name} > ${c.name}`,
                        score: 6
                    });

                    c.files.forEach(f => {
                        this.searchTrie.insert(f.name, {
                            id: f.id,
                            name: f.name,
                            type: 'file',
                            path: `${subj.name} > ${u.name} > ${c.name} > ${f.name}`,
                            score: f.isStarred ? 15 : 5
                        });
                    });
                });
            });
        });
    }

    handleGlobalSearch(query) {
        const resultsDropdown = document.getElementById('searchResultsDropdown');
        if (!query || query.trim().length === 0) {
            resultsDropdown.classList.add('hidden');
            return;
        }

        const rawResults = this.searchTrie.searchPrefix(query);
        const pq = new window.DSA.PriorityQueue();
        rawResults.forEach(r => pq.push(r));

        const rankedResults = [];
        while (pq.size() > 0 && rankedResults.length < 8) {
            rankedResults.push(pq.pop());
        }

        const mobileContainer = document.getElementById('mobileSearchResultsContainer');
        resultsDropdown.innerHTML = '';
        if (mobileContainer) mobileContainer.innerHTML = '';

        if (rankedResults.length === 0) {
            resultsDropdown.innerHTML = '<div class="p-3 text-sm text-slate-400">No matching subjects or documents found.</div>';
            if (mobileContainer) mobileContainer.innerHTML = '<div class="p-3 text-sm text-slate-400">No matching subjects or documents found.</div>';
        } else {
            rankedResults.forEach(item => {
                const makeRow = () => {
                    const row = document.createElement('div');
                    row.className = 'p-3 hover:bg-slate-800 cursor-pointer border-b border-slate-700/40 flex items-center justify-between transition-colors';
                    row.innerHTML = `
                        <div class="truncate mr-2">
                            <p class="text-sm font-bold text-white flex items-center truncate">
                                <i class="fa-solid fa-file text-orange-400 mr-2 text-xs"></i> ${item.name}
                            </p>
                            <p class="text-[11px] text-slate-400 mt-0.5 truncate">${item.path}</p>
                        </div>
                        <span class="text-[10px] bg-slate-700 text-orange-400 px-2 py-0.5 rounded font-mono shrink-0">${item.type}</span>
                    `;
                    row.onclick = () => {
                        resultsDropdown.classList.add('hidden');
                        const mobModal = document.getElementById('mobileSearchModal');
                        if (mobModal) mobModal.classList.add('hidden');

                        if (item.type === 'file') {
                            this.openDocumentReader(item.id);
                        } else if (item.type === 'subject') {
                            this.openSubjectWorkspace(item.id);
                        }
                    };
                    return row;
                };

                resultsDropdown.appendChild(makeRow());
                if (mobileContainer) mobileContainer.appendChild(makeRow());
            });
        }
        resultsDropdown.classList.remove('hidden');
    }

    // ==========================================
    // W3 PROFILE & CUSTOM DP UPLOAD
    // ==========================================
    updateHeaderUserProfile(user) {
        document.getElementById('headerUserName').textContent = user.name || 'Student';
        document.getElementById('headerUserIdBadge').textContent = user.userId || 'MCP-user-000001';
        document.getElementById('headerStreakCount').textContent = user.dailyStreak || 1;

        const avatarPic = user.profilePic || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';
        ['headerUserAvatar', 'profileDrawerAvatar', 'profileSidebarAvatar', 'mobileDrawerAvatar'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.src = avatarPic;
        });
    }

    openProfileDrawer() {
        const user = window.authManager.getCurrentUser();
        if (!user) return;

        document.getElementById('profileDrawerName').value = user.name || '';
        document.getElementById('profileDrawerEmail').value = user.email || '';
        document.getElementById('profileDrawerPhone').value = user.phone || '';
        document.getElementById('profileDrawerAddress').value = user.address || '';
        document.getElementById('profileDrawerUserId').textContent = user.userId || '';
        document.getElementById('profileDrawerStreak').textContent = `${user.dailyStreak || 1} Days`;

        document.getElementById('profileDrawerModal').classList.remove('hidden');
    }

    handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64Pic = e.target.result;
            window.authManager.updateProfile({ profilePic: base64Pic });
            document.getElementById('headerUserAvatar').src = base64Pic;
            document.getElementById('profileDrawerAvatar').src = base64Pic;
            this.showToast('📷 Profile Photo Updated Permanently!');
        };
        reader.readAsDataURL(file);
    }

    saveProfileDrawerChanges() {
        const name = document.getElementById('profileDrawerName').value;
        const phone = document.getElementById('profileDrawerPhone').value;
        const address = document.getElementById('profileDrawerAddress').value;

        window.authManager.updateProfile({ name, phone, address });
        this.updateHeaderUserProfile(window.authManager.getCurrentUser());
        document.getElementById('profileDrawerModal').classList.add('hidden');
        this.showToast('✅ Profile Details Saved!');
    }

    // ==========================================
    // COLLEGE & SCHOOL POWER TOOLS
    // ==========================================
    openCGPACalculator() {
        const courses = window.storageManager.getCGPACourses();
        let totalCredits = 0;
        let weightedPoints = 0;

        let tableRows = '';
        courses.forEach(c => {
            if (c.completed) {
                totalCredits += c.credits;
                weightedPoints += c.credits * c.gradePoint;
            }
            tableRows += `
                <tr class="border-b border-slate-700/60 text-sm">
                    <td class="py-2.5 px-3 text-white font-medium">${c.name}</td>
                    <td class="py-2.5 px-3 text-slate-300">${c.credits}</td>
                    <td class="py-2.5 px-3 text-orange-400 font-bold">${c.targetGrade} (${c.gradePoint})</td>
                    <td class="py-2.5 px-3">${c.completed ? '<span class="text-emerald-400">Completed</span>' : '<span class="text-yellow-400">Enrolled</span>'}</td>
                </tr>
            `;
        });

        const cgpa = totalCredits > 0 ? (weightedPoints / totalCredits).toFixed(2) : '9.20';
        document.getElementById('cgpaScoreDisplay').textContent = cgpa;
        document.getElementById('cgpaTableBody').innerHTML = tableRows;
        document.getElementById('cgpaModal').classList.remove('hidden');
    }

    // ==========================================
    // CODE & FORMULA REFERENCE VAULT
    // ==========================================
    openCodeVaultModal() {
        const modal = document.getElementById('codeVaultModal');
        if (modal) modal.classList.remove('hidden');
    }

    handleCodeVaultPreset(category) {
        const input = document.getElementById('codeVaultInput');
        if (!input) return;

        const presets = {
            cpp: `// C++ Binary Tree Traversal & STL Reference\n#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nstruct Node {\n    int val;\n    Node* left;\n    Node* right;\n    Node(int v) : val(v), left(nullptr), right(nullptr) {}\n};\n\nvoid inorder(Node* root) {\n    if (!root) return;\n    inorder(root->left);\n    cout << root->val << " ";\n    inorder(root->right);\n}\n\nint main() {\n    Node* root = new Node(10);\n    root->left = new Node(5);\n    root->right = new Node(15);\n    inorder(root);\n    return 0;\n}`,
            python: `# Python Graph BFS & Dijkstra Shortest Path\nfrom collections import deque\nimport heapq\n\ndef bfs(graph, start):\n    visited = set([start])\n    queue = deque([start])\n    order = []\n    while queue:\n        node = queue.popleft()\n        order.append(node)\n        for neighbor in graph.get(node, []):\n            if neighbor not in visited:\n                visited.add(neighbor)\n                queue.append(neighbor)\n    return order\n\ndef dijkstra(graph, start):\n    distances = {node: float('infinity') for node in graph}\n    distances[start] = 0\n    pq = [(0, start)]\n    while pq:\n        cur_dist, u = heapq.heappop(pq)\n        if cur_dist > distances[u]: continue\n        for v, weight in graph[u]:\n            if distances[u] + weight < distances[v]:\n                distances[v] = distances[u] + weight\n                heapq.heappush(pq, (distances[v], v))\n    return distances`,
            java: `// Java OOP Singleton & Concurrency Template\nimport java.util.*;\nimport java.util.concurrent.*;\n\npublic class StudyVaultEngine {\n    private static volatile StudyVaultEngine instance;\n    private final Map<String, List<String>> memoryStore = new ConcurrentHashMap<>();\n\n    private StudyVaultEngine() {}\n\n    public static StudyVaultEngine getInstance() {\n        if (instance == null) {\n            synchronized (StudyVaultEngine.class) {\n                if (instance == null) {\n                    instance = new StudyVaultEngine();\n                }\n            }\n        }\n        return instance;\n    }\n}`,
            math: `/* Mathematical Formulas & Core Theorem Cheatsheet */\n\n1. Euler's Planar Graph Formula:\n   V - E + F = 2 (Vertices - Edges + Faces)\n\n2. Bayes' Theorem of Conditional Probability:\n   P(A | B) = [ P(B | A) * P(A) ] / P(B)\n\n3. Calculus Integration by Parts:\n   ∫ u dv = u*v - ∫ v du\n\n4. Fast Fourier Transform Complexity:\n   Time: O(N log N) | Divide and conquer butterfly network\n\n5. Master Theorem for Divide-and-Conquer Recurrences:\n   T(n) = a*T(n/b) + f(n)\n   If f(n) = O(n^(log_b(a) - ε)), then T(n) = Θ(n^(log_b(a)))`,
            sql: `-- SQL Relational Indexing & Advanced Analytical Queries\nCREATE INDEX idx_student_subject ON study_records (user_id, subject_id);\n\n-- Top Ranked Study Mastery per Unit\nSELECT subject_name, unit_name, AVG(mastery_score) as avg_mastery\nFROM student_performance\nGROUP BY subject_name, unit_name\nHAVING avg_mastery >= 85\nORDER BY avg_mastery DESC;`
        };

        if (presets[category]) {
            input.value = presets[category];
        }
    }

    copyCodeVaultSnippet() {
        const input = document.getElementById('codeVaultInput');
        if (!input) return;
        this.copyToClipboard(input.value);
        this.showToast('📋 Code / Formula snippet copied to clipboard!');
    }

    saveSnippetToCurrentUnit() {
        const input = document.getElementById('codeVaultInput');
        if (!input || !input.value.trim()) {
            this.showToast('⚠️ No code snippet to save');
            return;
        }

        const category = document.getElementById('codeVaultCategorySelect')?.value || 'code';
        const extMap = { cpp: 'cpp', python: 'py', java: 'java', math: 'txt', sql: 'sql' };
        const ext = extMap[category] || 'txt';

        if (!this.activeSubject) {
            const subjects = window.storageManager.getSubjects(this.currentSession);
            if (subjects && subjects.length > 0) {
                this.activeSubject = subjects[0];
            } else {
                this.showToast('⚠️ Create a subject first to save this snippet!');
                return;
            }
        }

        if (!this.activeSubject.units || this.activeSubject.units.length === 0) {
            this.activeSubject.units = [{
                id: 'unit_' + Date.now(),
                name: 'Unit 1: Code & Formula Reference',
                chapters: []
            }];
        }

        const unit = this.activeSubject.units[0];
        if (!unit.chapters || unit.chapters.length === 0) {
            unit.chapters = [{
                id: 'chap_' + Date.now(),
                name: 'Chapter 1: Vault Snippets',
                files: []
            }];
        }

        const chap = unit.chapters[0];
        const newFile = {
            id: 'file_' + Date.now(),
            name: `${category.toUpperCase()}_Reference_Snippet.${ext}`,
            type: 'docx',
            size: `${(input.value.length / 1024).toFixed(1)} KB`,
            pages: 1,
            isStarred: true,
            label: 'Code Vault Snippet',
            content: input.value
        };

        chap.files.push(newFile);
        this.saveActiveSubject();
        this.renderChapterFolderHierarchy();
        this.showToast(`💾 Snippet saved to ${this.activeSubject.name}!`);
        document.getElementById('codeVaultModal')?.classList.add('hidden');
    }

    // ==========================================
    // GOOGLE GEMINI API SETTINGS & ENGINE
    // ==========================================
    openGeminiSettings() {
        const modal = document.getElementById('geminiSettingsModal');
        const input = document.getElementById('geminiApiKeyInput');
        const result = document.getElementById('geminiTestResult');
        if (input) input.value = window.storageManager.getGeminiApiKey() || '';
        if (result) {
            result.className = 'text-xs font-medium hidden';
            result.textContent = '';
        }
        if (modal) modal.classList.remove('hidden');
    }

    saveGeminiSettings() {
        const input = document.getElementById('geminiApiKeyInput');
        const key = input ? input.value.trim() : '';
        window.storageManager.saveGeminiApiKey(key);
        this.updateAIModelBadge();
        const modal = document.getElementById('geminiSettingsModal');
        if (modal) modal.classList.add('hidden');
        if (key) {
            this.showToast('🔑 Google Gemini API Key saved securely!');
        } else {
            this.showToast('ℹ️ Gemini API Key cleared. Offline Tutor active.');
        }
    }

    async testGeminiConnection() {
        const input = document.getElementById('geminiApiKeyInput');
        const result = document.getElementById('geminiTestResult');
        if (!result) return;

        const key = input ? input.value.trim() : '';
        if (!key) {
            result.className = 'text-xs font-medium p-2.5 rounded-lg bg-red-500/15 text-red-400 border border-red-500/30 block';
            result.textContent = '❌ Please enter an API key to test.';
            return;
        }

        result.className = 'text-xs font-medium p-2.5 rounded-lg bg-slate-800 text-slate-300 block';
        result.textContent = '🔄 Testing live connection with Google Gemini...';

        const startTime = Date.now();
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(key)}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: 'Respond with exactly: OK' }] }]
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                const errMsg = errData.error?.message || `HTTP ${response.status} ${response.statusText}`;
                throw new Error(errMsg);
            }

            const latency = Date.now() - startTime;
            result.className = 'text-xs font-medium p-2.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 block';
            result.textContent = `✅ Gemini Connection Verified! Live latency: ${latency}ms`;
        } catch (err) {
            result.className = 'text-xs font-medium p-2.5 rounded-lg bg-red-500/15 text-red-400 border border-red-500/30 block';
            result.textContent = `❌ Connection Error: ${err.message}`;
        }
    }

    updateAIModelBadge() {
        const key = window.storageManager.getGeminiApiKey();
        const beacon = document.getElementById('aiStatusBeacon');
        const statusText = document.getElementById('aiStatusText');

        if (key && key.length > 10) {
            if (beacon) beacon.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse';
            if (statusText) statusText.textContent = 'Gemini 1.5 Flash Online';
        } else {
            if (beacon) beacon.className = 'w-2 h-2 rounded-full bg-amber-400 animate-pulse';
            if (statusText) statusText.textContent = 'Offline Tutor Active';
        }
    }

    // ==========================================
    // FLOATING AI STUDY ASSISTANT & CHAT
    // ==========================================
    toggleAIAssistant() {
        const drawer = document.getElementById('aiChatDrawer');
        if (drawer) {
            drawer.classList.toggle('hidden');
            if (!drawer.classList.contains('hidden')) {
                const messages = document.getElementById('aiChatMessages');
                if (messages) messages.scrollTop = messages.scrollHeight;
                document.getElementById('aiChatInput')?.focus();
            }
        }
    }

    clearAIChat() {
        const chatBox = document.getElementById('aiChatMessages');
        if (chatBox) {
            chatBox.innerHTML = `
                <div class="flex items-start space-x-2.5 mb-3">
                    <div class="w-7 h-7 rounded-lg bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center text-xs shrink-0 shadow">
                        <i class="fa-solid fa-sparkles"></i>
                    </div>
                    <div class="bg-slate-800/90 border border-slate-700/70 rounded-2xl rounded-tl-none p-3 text-xs text-slate-200 leading-relaxed shadow-sm">
                        <p class="font-bold text-orange-400 mb-1">Hello! I'm MPW AI Study Assistant 🎓</p>
                        <p>Ask me anything about your current subject, request a summary, or get instant step-by-step explanations.</p>
                    </div>
                </div>
            `;
        }
        this.showToast('🧹 AI Chat History Cleared');
    }

    sendQuickAIPrompt(prompt) {
        const input = document.getElementById('aiChatInput');
        if (input) {
            input.value = prompt;
            this.sendAIMessage();
        }
    }

    toggleAIMic() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
            return;
        }

        const micBtn = document.getElementById('aiVoiceBtn');

        if (this.isAIMicListening) {
            if (this.aiRecognition) this.aiRecognition.stop();
            this.isAIMicListening = false;
            if (micBtn) {
                micBtn.classList.remove('text-orange-400', 'animate-pulse', 'border-orange-500');
                micBtn.classList.add('text-slate-400');
            }
            return;
        }

        try {
            this.aiRecognition = new SpeechRecognition();
            this.aiRecognition.continuous = false;
            this.aiRecognition.interimResults = false;
            this.aiRecognition.lang = 'en-US';

            this.aiRecognition.onstart = () => {
                this.isAIMicListening = true;
                if (micBtn) {
                    micBtn.classList.add('text-orange-400', 'animate-pulse', 'border-orange-500');
                    micBtn.classList.remove('text-slate-400');
                }
                this.showToast('🎙️ Listening... Speak your study question');
            };

            this.aiRecognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                const input = document.getElementById('aiChatInput');
                if (input) {
                    input.value = transcript;
                }
            };

            this.aiRecognition.onerror = (e) => {
                console.error('AI Speech error:', e);
                this.isAIMicListening = false;
                if (micBtn) {
                    micBtn.classList.remove('text-orange-400', 'animate-pulse', 'border-orange-500');
                    micBtn.classList.add('text-slate-400');
                }
            };

            this.aiRecognition.onend = () => {
                this.isAIMicListening = false;
                if (micBtn) {
                    micBtn.classList.remove('text-orange-400', 'animate-pulse', 'border-orange-500');
                    micBtn.classList.add('text-slate-400');
                }
            };

            this.aiRecognition.start();
        } catch (e) {
            console.error(e);
        }
    }

    async sendAIMessage() {
        const input = document.getElementById('aiChatInput');
        if (!input) return;
        const text = input.value.trim();
        if (!text) return;

        const chatBox = document.getElementById('aiChatMessages');
        if (!chatBox) return;

        // Render User Message
        chatBox.innerHTML += `
            <div class="flex justify-end mb-3">
                <div class="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl rounded-tr-none px-3.5 py-2.5 text-xs max-w-[85%] shadow-md leading-relaxed">
                    ${this.escapeHtml(text)}
                </div>
            </div>
        `;
        input.value = '';
        chatBox.scrollTop = chatBox.scrollHeight;

        // Temporary Loading Bubble
        const loadingId = 'loading_' + Date.now();
        chatBox.innerHTML += `
            <div id="${loadingId}" class="flex items-start space-x-2.5 mb-3">
                <div class="w-7 h-7 rounded-lg bg-slate-800 text-orange-400 flex items-center justify-center text-xs shrink-0">
                    <i class="fa-solid fa-robot animate-bounce"></i>
                </div>
                <div class="bg-slate-800/80 border border-slate-700/60 rounded-2xl rounded-tl-none p-3 text-xs text-slate-400 italic">
                    Thinking with study context...
                </div>
            </div>
        `;
        chatBox.scrollTop = chatBox.scrollHeight;

        // Retrieve response either from Gemini API or smart tutor fallback
        let replyText = '';
        const apiKey = window.storageManager.getGeminiApiKey();

        if (apiKey && apiKey.length > 10) {
            try {
                replyText = await this.callGeminiAPI(text, apiKey);
            } catch (err) {
                console.warn('Gemini API request failed, using smart tutor fallback:', err);
                replyText = this.generateSmartTutorResponse(text) + `\n\n*(Note: Gemini live query encountered an issue [${err.message}]; served via MPW Smart Offline Tutor)*`;
            }
        } else {
            replyText = this.generateSmartTutorResponse(text);
        }

        // Remove loading bubble
        document.getElementById(loadingId)?.remove();

        // Render Bot Response with Action Toolbar
        const botBubbleId = 'bot_' + Date.now();
        const formattedHtml = this.formatMarkdown(replyText);
        const encodedRaw = encodeURIComponent(replyText);

        chatBox.innerHTML += `
            <div id="${botBubbleId}" class="flex items-start space-x-2.5 mb-4 group">
                <div class="w-7 h-7 rounded-lg bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center text-xs shrink-0 shadow">
                    <i class="fa-solid fa-sparkles"></i>
                </div>
                <div class="flex-1 max-w-[90%] bg-slate-800/95 border border-slate-700/80 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-100 shadow-md">
                    <div class="markdown-body leading-relaxed text-slate-200">
                        ${formattedHtml}
                    </div>

                    <!-- Action Toolbar -->
                    <div class="flex flex-wrap items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-700/60 text-[11px] text-slate-400">
                        <button onclick="window.appController.speakText(decodeURIComponent('${encodedRaw}'))" class="hover:text-orange-400 px-2 py-0.5 rounded bg-slate-900/60 hover:bg-slate-900 transition-colors flex items-center space-x-1" title="Read Aloud">
                            <i class="fa-solid fa-volume-high"></i>
                            <span>Speak</span>
                        </button>
                        <button onclick="window.appController.copyToClipboard(decodeURIComponent('${encodedRaw}'))" class="hover:text-orange-400 px-2 py-0.5 rounded bg-slate-900/60 hover:bg-slate-900 transition-colors flex items-center space-x-1" title="Copy Text">
                            <i class="fa-regular fa-copy"></i>
                            <span>Copy</span>
                        </button>
                        <button onclick="window.appController.addAIFlashcard(decodeURIComponent('${encodedRaw}'))" class="hover:text-orange-400 px-2 py-0.5 rounded bg-slate-900/60 hover:bg-slate-900 transition-colors flex items-center space-x-1" title="Create Flashcard">
                            <i class="fa-solid fa-layer-group"></i>
                            <span>To Card</span>
                        </button>
                        <button onclick="window.appController.saveAIToSubjectNotes(decodeURIComponent('${encodedRaw}'))" class="hover:text-orange-400 px-2 py-0.5 rounded bg-slate-900/60 hover:bg-slate-900 transition-colors flex items-center space-x-1" title="Save to Notes">
                            <i class="fa-solid fa-file-pen"></i>
                            <span>To Notes</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    async callGeminiAPI(userQuery, apiKey) {
        const subjContext = this.activeSubject
            ? `Current Subject: "${this.activeSubject.name}". Session: "${this.currentSession}".`
            : `Session: "${this.currentSession}".`;

        const systemInstruction = `You are MPW AI, an expert academic study assistant and mentor for students.
${subjContext}
Rules:
1. Provide accurate, clear, and easy-to-understand explanations with key formulas, code syntax, or bullet points.
2. Structure answers neatly with headings, bold keywords, and clean markdown.
3. Keep answers directly educational, concise, and focused on learning.
4. Strictly do NOT give quiz scores, test grading, or test simulations. This is a reference & learning tool.`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: `${systemInstruction}\n\nStudent Question: ${userQuery}` }]
                    }
                ]
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error?.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        const candidate = data.candidates?.[0];
        const text = candidate?.content?.parts?.[0]?.text;
        if (!text) throw new Error('Empty response received from Gemini');
        return text;
    }

    generateSmartTutorResponse(query) {
        const q = query.toLowerCase();
        const subjName = this.activeSubject ? this.activeSubject.name : 'your academic subject';

        if (q.includes('analogy') || q.includes('simply')) {
            return `### 💡 Real-World Analogy for ${subjName}\n\nThink of this concept like a **high-speed organized library**:\n- **Index / Directory**: A fast catalog like a Hash Table or B-Tree allowing O(1) or O(log n) lookup.\n- **Books on Desks**: Like RAM or Cache — extremely fast to access right now, but limited in capacity.\n- **Storage Basement**: Like Persistent SSD Storage — holds everything permanently, but takes slightly longer to retrieve.\n\nKeep this mental model in mind when designing or studying!`;
        }

        if (q.includes('summarize') || q.includes('revision') || q.includes('summary')) {
            return `### 📋 Quick Revision Summary: ${subjName}\n\n1. **Core Fundamental**: Understand the primary governing formula or algorithm invariants.\n2. **Complexity Profile**: Typical optimal solutions operate in O(n log n) time and O(n) auxiliary space.\n3. **Exam Anchor**: Always verify base edge cases (empty input, null pointers, single element).\n4. **Best Practice**: Sketch a quick state diagram or memory layout before writing full derivations.`;
        }

        if (q.includes('viva') || q.includes('question') || q.includes('probable')) {
            return `### 🎯 Top Study Questions for ${subjName}\n\n1. **Q**: What is the core trade-off between time and space in this domain?\n   - **A**: Sacrificing memory (e.g. hash tables or memoization tables) reduces time complexity from O(2^n) or O(n^2) down to O(n).\n2. **Q**: How do boundary conditions affect stability?\n   - **A**: Boundary invariants ensure correctness without segmentation faults or off-by-one errors.\n3. **Q**: Which data structure offers optimal insertion and retrieval for priority queues?\n   - **A**: A Binary Heap (O(log n) insert/extract-min) or Fibonacci Heap.`;
        }

        if (q.includes('flashcard') || q.includes('card')) {
            return `### 🗂️ Flashcard Prompt\n\n**Front**: What is the primary property that distinguishes this topic in ${subjName}?\n\n**Back**: It enforces strict invariant guarantees, optimal bounds, and predictable execution across all operating conditions.`;
        }

        if (q.includes('complexity') || q.includes('big-o') || q.includes('time')) {
            return `### ⏱️ Time & Space Complexity Breakdown\n\n- **Best Case**: O(n) when data is already partitioned or pre-sorted.\n- **Average Case**: O(n log n) using divide-and-conquer strategy.\n- **Worst Case**: O(n^2) if degenerate pivot selection occurs (mitigated by randomized pivots).\n- **Auxiliary Space**: O(log n) recursion stack space.`;
        }

        return `### 📘 Study Insights for ${subjName}\n\nBased on your active curriculum:\n- Focus on understanding the **underlying principle** rather than memorizing syntax.\n- Break complex problems down into modular sub-components.\n- Use the **Spaced Repetition Flashcards** in MPW to cement this in your long-term memory!\n\n*(Tip: Add your free Google Gemini API Key in Settings to get real-time generative answers for any question!)*`;
    }

    speakText(text) {
        if (!('speechSynthesis' in window)) {
            this.showToast('⚠️ Speech Synthesis not supported in this browser');
            return;
        }
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            this.showToast('🔇 Audio playback stopped');
            return;
        }

        const clean = text.replace(/[*#`_~\[\]]/g, '').replace(/\n+/g, ' ');
        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
        this.showToast('🔊 Reading study note aloud...');
    }

    copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                this.showToast('📋 Copied to clipboard!');
            }).catch(() => {
                this.fallbackCopyToClipboard(text);
            });
        } else {
            this.fallbackCopyToClipboard(text);
        }
    }

    fallbackCopyToClipboard(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy');
            this.showToast('📋 Copied to clipboard!');
        } catch (e) {
            this.showToast('⚠️ Could not copy text');
        }
        document.body.removeChild(ta);
    }

    escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    formatMarkdown(raw) {
        if (!raw) return '';
        let html = this.escapeHtml(raw);

        // Code blocks ```code```
        html = html.replace(/```([\s\S]*?)```/g, (match, p1) => {
            return `<pre class="bg-slate-950 p-2.5 rounded-lg my-2 font-mono text-[11px] text-emerald-400 overflow-x-auto border border-slate-800"><code>${p1.trim()}</code></pre>`;
        });

        // Inline code `code`
        html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-900 text-orange-400 px-1 py-0.5 rounded font-mono text-[11px]">$1</code>');

        // Headers ###
        html = html.replace(/^### (.*$)/gim, '<h4 class="font-bold text-white text-xs mt-2 mb-1">$1</h4>');
        html = html.replace(/^## (.*$)/gim, '<h3 class="font-bold text-white text-sm mt-2 mb-1">$1</h3>');
        html = html.replace(/^# (.*$)/gim, '<h2 class="font-black text-white text-base mt-2 mb-1">$1</h2>');

        // Bold **text**
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-white">$1</strong>');

        // Italic *text*
        html = html.replace(/\*([^*]+)\*/g, '<em class="italic text-slate-300">$1</em>');

        // Unordered lists
        html = html.replace(/^\s*[-*]\s+(.*$)/gim, '<li class="ml-4 list-disc">$1</li>');

        // Newlines
        html = html.replace(/\n/g, '<br>');

        return html;
    }

    addAIFlashcard(text) {
        let front = 'AI Study Prompt';
        let back = text;

        if (text.includes('**Front**:') && text.includes('**Back**:')) {
            const parts = text.split('**Back**:');
            front = parts[0].replace('**Front**:', '').replace(/###/g, '').trim();
            back = parts[1].trim();
        } else {
            const lines = text.split('\n').filter(l => l.trim().length > 0);
            if (lines.length > 0) front = lines[0].replace(/[*#]/g, '').trim();
            if (lines.length > 1) back = lines.slice(1).join('\n').replace(/[*#]/g, '').trim();
        }

        const subjId = this.activeSubject ? this.activeSubject.id : 'general';
        const card = {
            id: 'card_' + Date.now(),
            subjectId: subjId,
            front: front.slice(0, 150),
            back: back.slice(0, 500),
            leitnerBox: 1,
            reviewsCount: 0
        };

        window.storageManager.saveFlashcard(card);
        this.showToast('🗂️ Added to Spaced Repetition Flashcards!');
    }

    saveAIToSubjectNotes(text) {
        if (!this.activeSubject) {
            const subjects = window.storageManager.getSubjects(this.currentSession);
            if (subjects && subjects.length > 0) {
                this.activeSubject = subjects[0];
            } else {
                this.showToast('⚠️ Create a subject first to save notes!');
                return;
            }
        }

        if (!this.activeSubject.units || this.activeSubject.units.length === 0) {
            this.activeSubject.units = [{
                id: 'unit_' + Date.now(),
                name: 'Unit 1: Study Notes',
                chapters: []
            }];
        }

        const unit = this.activeSubject.units[0];
        if (!unit.chapters || unit.chapters.length === 0) {
            unit.chapters = [{
                id: 'chap_' + Date.now(),
                name: 'Chapter 1: AI Summaries',
                files: []
            }];
        }

        const chap = unit.chapters[0];
        const newFile = {
            id: 'file_' + Date.now(),
            name: `AI_Study_Note_${new Date().toLocaleTimeString().replace(/:/g, '-')}.docx`,
            type: 'docx',
            size: `${(text.length / 1024).toFixed(1)} KB`,
            pages: 1,
            isStarred: true,
            label: 'AI Study Summary',
            content: text
        };

        chap.files.push(newFile);
        this.saveActiveSubject();
        this.renderChapterFolderHierarchy();
        this.showToast(`📝 Saved AI Note to ${this.activeSubject.name}!`);
    }

    // ==========================================
    // UNIVERSAL COMMAND PALETTE (Ctrl + K)
    // ==========================================
    initKeyboardShortcuts() {
        window.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                this.toggleCommandPalette();
            } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
                e.preventDefault();
                this.toggleAIAssistant();
            } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
                e.preventDefault();
                this.togglePomodoroModal();
            }
        });
    }

    toggleCommandPalette() {
        const modal = document.getElementById('commandPaletteModal');
        if (!modal) return;
        const isHidden = modal.classList.contains('hidden');
        if (isHidden) {
            modal.classList.remove('hidden');
            const input = document.getElementById('commandPaletteInput');
            if (input) {
                input.value = '';
                input.focus();
            }
            this.handleCommandPaletteSearch('');
        } else {
            modal.classList.add('hidden');
        }
    }

    handleCommandPaletteSearch(query) {
        const container = document.getElementById('commandPaletteResults');
        if (!container) return;
        const q = (query || '').toLowerCase().trim();

        const allCommands = [
            { icon: 'fa-solid fa-graduation-cap', text: 'Switch to College Academic Session', action: () => this.switchSession('college'), tag: 'Session' },
            { icon: 'fa-solid fa-school', text: 'Switch to School Academic Session', action: () => this.switchSession('school'), tag: 'Session' },
            { icon: 'fa-solid fa-briefcase', text: 'Switch to Personal Workspace', action: () => this.switchSession('personal'), tag: 'Session' },
            { icon: 'fa-solid fa-stopwatch', text: 'Open Pomodoro Focus Timer & Soundscapes', action: () => this.togglePomodoroModal(), tag: 'Focus' },
            { icon: 'fa-solid fa-code', text: 'Open Code & Formula Reference Vault', action: () => this.openCodeVaultModal(), tag: 'Tools' },
            { icon: 'fa-solid fa-robot', text: 'Open MPW AI Study Assistant', action: () => this.toggleAIAssistant(), tag: 'AI' },
            { icon: 'fa-solid fa-key', text: 'Google Gemini API Settings', action: () => this.openGeminiSettings(), tag: 'AI' },
            { icon: 'fa-solid fa-layer-group', text: 'Open Spaced Repetition Flashcards', action: () => window.whiteboardStudio?.launchStudio('flashcards', this.activeSubject?.id), tag: 'Studio' },
            { icon: 'fa-solid fa-pen-nib', text: 'Open Freeform Drawing Canvas', action: () => window.whiteboardStudio?.openStudioWithDevicePrompt('drawing', this.activeSubject?.id), tag: 'Studio' },
            { icon: 'fa-solid fa-file-pen', text: 'Open Ruled Handwritten Notes', action: () => window.whiteboardStudio?.openStudioWithDevicePrompt('notes', this.activeSubject?.id), tag: 'Studio' },
            { icon: 'fa-solid fa-keyboard', text: 'Open Ruled Typed Notepad', action: () => window.whiteboardStudio?.launchStudio('notepad', this.activeSubject?.id), tag: 'Studio' },
            { icon: 'fa-solid fa-calculator', text: 'Open CGPA & Target Grade Predictor', action: () => this.openCGPACalculator(), tag: 'Tools' },
            { icon: 'fa-solid fa-eye-slash', text: 'Toggle Zen Distraction-Free Study Mode', action: () => this.toggleZenMode(), tag: 'Focus' },
            { icon: 'fa-solid fa-cloud-arrow-down', text: 'Download Full Study Workspace Backup', action: () => this.downloadFullBackup(), tag: 'Data' }
        ];

        let matched = allCommands.filter(c => !q || c.text.toLowerCase().includes(q) || c.tag.toLowerCase().includes(q));

        if (q) {
            const subjects = window.storageManager.getSubjects(this.currentSession);
            subjects.forEach(s => {
                if (s.name.toLowerCase().includes(q)) {
                    matched.push({
                        icon: 'fa-solid fa-book-bookmark',
                        text: `Subject: ${s.name}`,
                        action: () => this.openSubjectWorkspace(s.id),
                        tag: 'Subject'
                    });
                }
                s.units?.forEach(u => {
                    u.chapters?.forEach(c => {
                        c.files?.forEach(f => {
                            if (f.name.toLowerCase().includes(q)) {
                                matched.push({
                                    icon: 'fa-solid fa-file-lines',
                                    text: `File: ${f.name} (${s.name})`,
                                    action: () => this.openDocumentReader(f.id),
                                    tag: 'File'
                                });
                            }
                        });
                    });
                });
            });
        }

        container.innerHTML = '';
        if (matched.length === 0) {
            container.innerHTML = `<div class="p-3 text-center text-xs text-slate-400">No commands or files found matching "${this.escapeHtml(query)}"</div>`;
            return;
        }

        matched.slice(0, 10).forEach(item => {
            const row = document.createElement('div');
            row.className = 'p-2.5 hover:bg-slate-800 rounded-xl cursor-pointer flex items-center justify-between transition-colors group';
            row.innerHTML = `
                <div class="flex items-center space-x-3 truncate">
                    <span class="w-7 h-7 rounded-lg bg-slate-800 group-hover:bg-orange-500/20 text-slate-400 group-hover:text-orange-400 flex items-center justify-center text-xs shrink-0 transition-colors">
                        <i class="${item.icon}"></i>
                    </span>
                    <span class="text-xs font-medium text-slate-200 group-hover:text-white truncate">${item.text}</span>
                </div>
                <span class="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono shrink-0">${item.tag}</span>
            `;
            row.onclick = () => {
                this.toggleCommandPalette();
                item.action();
            };
            container.appendChild(row);
        });
    }

    // ==========================================
    // POMODORO FOCUS STATION & SOUNDSCAPES
    // ==========================================
    togglePomodoroModal() {
        const modal = document.getElementById('pomodoroTimerModal');
        if (modal) modal.classList.toggle('hidden');
    }

    setPomodoroMode(mode) {
        this.pomodoroMode = mode;
        if (mode === 'focus') this.pomodoroSeconds = 25 * 60;
        else if (mode === 'short') this.pomodoroSeconds = 5 * 60;
        else if (mode === 'long') this.pomodoroSeconds = 15 * 60;

        if (this.pomodoroRunning) {
            clearInterval(this.pomodoroTimer);
            this.pomodoroRunning = false;
            const btn = document.getElementById('pomoStartBtn');
            if (btn) btn.innerHTML = '<i class="fa-solid fa-play mr-1.5"></i> Start Focus';
        }

        ['pomoModeFocus', 'pomoModeShort', 'pomoModeLong'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.className = 'flex-1 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors';
            }
        });
        const activeId = mode === 'focus' ? 'pomoModeFocus' : mode === 'short' ? 'pomoModeShort' : 'pomoModeLong';
        const activeEl = document.getElementById(activeId);
        if (activeEl) {
            activeEl.className = 'flex-1 py-1.5 rounded-lg bg-orange-500 text-white transition-colors';
        }

        const stateLabel = document.getElementById('pomodoroStateLabel');
        if (stateLabel) {
            stateLabel.textContent = mode === 'focus' ? 'Focus Time' : mode === 'short' ? 'Short Break' : 'Long Break';
        }

        this.updatePomodoroDisplay();
    }

    togglePomodoroTimer() {
        const btn = document.getElementById('pomoStartBtn');
        if (this.pomodoroRunning) {
            clearInterval(this.pomodoroTimer);
            this.pomodoroRunning = false;
            if (btn) btn.innerHTML = '<i class="fa-solid fa-play mr-1.5"></i> Resume Focus';
        } else {
            this.pomodoroRunning = true;
            if (btn) btn.innerHTML = '<i class="fa-solid fa-pause mr-1.5"></i> Pause Focus';

            this.pomodoroTimer = setInterval(() => {
                if (this.pomodoroSeconds > 0) {
                    this.pomodoroSeconds--;
                    this.updatePomodoroDisplay();
                } else {
                    clearInterval(this.pomodoroTimer);
                    this.pomodoroRunning = false;
                    if (btn) btn.innerHTML = '<i class="fa-solid fa-play mr-1.5"></i> Start Focus';

                    this.playCompletionChime();
                    if (this.pomodoroMode === 'focus') {
                        window.storageManager.logStudyMinutes(25);
                        this.showToast('🎉 Focus Session Complete! Logged 25 study minutes 🔥');
                    } else {
                        this.showToast('🔔 Break time is up! Ready to focus?');
                    }
                }
            }, 1000);
        }
    }

    resetPomodoroTimer() {
        if (this.pomodoroTimer) clearInterval(this.pomodoroTimer);
        this.pomodoroRunning = false;
        this.setPomodoroMode(this.pomodoroMode);
        const btn = document.getElementById('pomoStartBtn');
        if (btn) btn.innerHTML = '<i class="fa-solid fa-play mr-1.5"></i> Start Focus';
        this.showToast('⏱️ Timer reset');
    }

    updatePomodoroDisplay() {
        const mins = Math.floor(this.pomodoroSeconds / 60);
        const secs = this.pomodoroSeconds % 60;
        const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

        const disp = document.getElementById('pomodoroTimeDisplay');
        if (disp) disp.textContent = timeStr;

        const pill = document.getElementById('topBarPomodoroPill');
        if (pill) pill.textContent = timeStr;
    }

    playCompletionChime() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(587.33, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
            osc.start();
            osc.stop(ctx.currentTime + 0.8);
        } catch (e) {
            console.log('Chime error:', e);
        }
    }

    // ==========================================
    // AMBIENT SOUNDSCAPES (100% Offline Web Audio)
    // ==========================================
    toggleAmbientSound(type) {
        if (this.activeSoundType === type) {
            this.stopAmbientSound();
            return;
        }

        this.stopAmbientSound();
        this.activeSoundType = type;

        const btn = document.getElementById(`soundBtn_${type}`);
        if (btn) {
            btn.classList.add('bg-orange-500/20', 'border', 'border-orange-500/50', 'text-orange-400');
            btn.classList.remove('bg-slate-800', 'text-slate-300');
        }

        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContext();

            const bufferSize = this.audioCtx.sampleRate * 4;
            const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
            const data = buffer.getChannelData(0);

            let lastOut = 0.0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                if (type === 'rain') {
                    data[i] = (lastOut + (0.02 * white)) / 1.02;
                    lastOut = data[i];
                    data[i] *= 3.5;
                } else if (type === 'waves') {
                    data[i] = (lastOut + (0.05 * white)) / 1.05;
                    lastOut = data[i];
                    data[i] *= 2.5;
                } else if (type === 'cafe') {
                    data[i] = (white * 0.15);
                } else {
                    data[i] = white * 0.2;
                }
            }

            const noiseNode = this.audioCtx.createBufferSource();
            noiseNode.buffer = buffer;
            noiseNode.loop = true;

            const filter = this.audioCtx.createBiquadFilter();
            filter.type = type === 'rain' ? 'lowpass' : type === 'waves' ? 'bandpass' : 'lowpass';
            filter.frequency.value = type === 'rain' ? 800 : type === 'waves' ? 400 : 1200;

            const gainNode = this.audioCtx.createGain();
            gainNode.gain.setValueAtTime(0.2, this.audioCtx.currentTime);

            if (type === 'waves') {
                const lfo = this.audioCtx.createOscillator();
                const lfoGain = this.audioCtx.createGain();
                lfo.frequency.value = 0.15;
                lfoGain.gain.value = 0.15;
                lfo.connect(gainNode.gain);
                lfo.start();
            }

            noiseNode.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioCtx.destination);
            noiseNode.start();

            this.activeSoundNode = noiseNode;
            this.showToast(`🎧 Ambient Soundscape Playing: ${type.toUpperCase()}`);
        } catch (err) {
            console.error('Ambient sound error:', err);
            this.showToast('⚠️ Web Audio playback unavailable');
        }
    }

    stopAmbientSound() {
        if (this.activeSoundNode) {
            try { this.activeSoundNode.stop(); } catch (e) {}
            this.activeSoundNode = null;
        }
        if (this.audioCtx) {
            try { this.audioCtx.close(); } catch (e) {}
            this.audioCtx = null;
        }

        ['rain', 'noise', 'waves', 'cafe'].forEach(t => {
            const btn = document.getElementById(`soundBtn_${t}`);
            if (btn) {
                btn.classList.remove('bg-orange-500/20', 'border', 'border-orange-500/50', 'text-orange-400');
                btn.classList.add('bg-slate-800', 'text-slate-300');
            }
        });

        if (this.activeSoundType) {
            this.showToast('🔇 Ambient Sound Muted');
        }
        this.activeSoundType = null;
    }

    // ==========================================
    // ZEN DISTRACTION-FREE STUDY MODE
    // ==========================================
    toggleZenMode() {
        document.body.classList.toggle('zen-active');
        const isZen = document.body.classList.contains('zen-active');
        if (isZen) {
            this.showToast('🧘 Zen Distraction-Free Mode ON. Press Esc or Zen button to exit.');
        } else {
            this.showToast('Zen Mode Exited');
        }
    }

    // ==========================================
    // DOCUMENT READER ANNOTATION SUMMARY
    // ==========================================
    generateSummaryFromHighlights() {
        if (!this.activeAnnotations || this.activeAnnotations.length === 0) {
            this.showToast('⚠️ No highlighted text found. Select text and click a color to highlight!');
            return;
        }

        const quotes = this.activeAnnotations.map((a, i) => `${i + 1}. "${a.text}"`).join('\n\n');
        const docName = this.activeFile ? this.activeFile.name : 'Document';
        const summaryText = `### 📌 Revision Summary from Highlights: ${docName}\n\n**Extracted Key Points:**\n\n${quotes}\n\n**Study takeaway**: These definitions and formulas represent key anchors. Review them before exams!`;

        this.currentSummaryText = summaryText;
        const modal = document.getElementById('unitSummaryModal');
        const titleEl = document.getElementById('unitSummaryModalTitle');
        const contentEl = document.getElementById('unitSummaryContent');

        if (titleEl) titleEl.textContent = `Highlighted Summary: ${docName}`;
        if (contentEl) contentEl.innerHTML = this.formatMarkdown(summaryText);
        if (modal) modal.classList.remove('hidden');
    }

    generateQuizFromHighlights() {
        // Pure study note alias - no test simulation as requested
        this.generateSummaryFromHighlights();
    }

    // ==========================================
    // BACKUP & RESTORE
    // ==========================================
    downloadFullBackup() {
        const dataStr = window.storageManager.exportFullBackup();
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `MPW_Full_Study_Backup_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        this.showToast('💾 Backup downloaded safely to your laptop!');
    }

    restoreBackupFromFile(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const res = window.storageManager.importFullBackup(e.target.result);
            if (res.success) {
                alert('✅ Study workspace restored successfully! Reloading...');
                window.location.reload();
            } else {
                alert('Error restoring backup: ' + res.message);
            }
        };
        reader.readAsText(file);
    }

    showToast(message) {
        const toast = document.getElementById('globalToastNotification');
        const text = document.getElementById('globalToastText');
        text.textContent = message;
        toast.classList.remove('hidden');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }

    showComingSoonModal(title, desc) {
        document.getElementById('comingSoonTitle').textContent = title;
        document.getElementById('comingSoonDesc').textContent = desc;
        document.getElementById('comingSoonModal').classList.remove('hidden');
    }

    toggleMobileDrawer() {
        const drawer = document.getElementById('mobileDrawer');
        const backdrop = document.getElementById('mobileDrawerBackdrop');
        if (!drawer || !backdrop) return;

        const isOpen = drawer.classList.contains('mobile-drawer-open');
        if (isOpen) {
            drawer.classList.remove('mobile-drawer-open');
            backdrop.classList.add('hidden');
        } else {
            drawer.classList.add('mobile-drawer-open');
            backdrop.classList.remove('hidden');
        }
    }

    // ==========================================
    // EVENT BINDINGS
    // ==========================================
    bindEvents() {
        // Search bar typing
        const searchInput = document.getElementById('globalSearchBar');
        if (searchInput) {
            searchInput.oninput = (e) => this.handleGlobalSearch(e.target.value);
        }

        // Global Keyboard Shortcuts
        window.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
                e.preventDefault();
                searchInput.focus();
            } else if (e.key === 'Escape') {
                // Close modals
                document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
                ['commandPaletteModal', 'pomodoroTimerModal', 'codeVaultModal', 'unitSummaryModal', 'geminiSettingsModal', 'comingSoonModal', 'profileDrawerModal', 'cgpaModal', 'themeModal'].forEach(id => {
                    document.getElementById(id)?.classList.add('hidden');
                });
                document.body.classList.remove('zen-active');
                if (window.whiteboardStudio) window.whiteboardStudio.closeStudio();
            }
        });
    }
}

window.appController = new AppController();
window.addEventListener('DOMContentLoaded', () => {
    window.appController.init();
});
