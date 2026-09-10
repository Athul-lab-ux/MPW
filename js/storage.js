/**
 * MPW - Storage & Persistence Engine
 * Handles user profiles, subjects, file hierarchy, notes, flashcards, and backup/restore.
 */

class StorageManager {
    constructor() {
        this.PREFIX = 'mpw_v1_';
    }

    _getKey(userId, key) {
        return `${this.PREFIX}${userId}_${key}`;
    }

    getCurrentUserId() {
        const session = window.authManager ? window.authManager.getCurrentUser() : null;
        return session ? session.userId : 'MCP-user-000001';
    }

    // Theme Colors
    getThemeColors() {
        const raw = localStorage.getItem('mpw_custom_theme');
        if (raw) {
            try { return JSON.parse(raw); } catch { return null; }
        }
        // Default White-Orange-Blue signature palette
        return {
            primary: '#FFFFFF',
            secondary: '#F97316',
            tertiary: '#1E3A8A'
        };
    }

    saveThemeColors(colors) {
        localStorage.setItem('mpw_custom_theme', JSON.stringify(colors));
    }

    // Onboarding Status
    hasCompletedOnboarding(sessionType, userId = this.getCurrentUserId()) {
        if (sessionType === 'personal') return true; // PW has zero popups!
        const profile = sessionType === 'school' ? this.getSchoolProfile(userId) : this.getCollegeProfile(userId);
        return !!(profile && profile.isConfigured);
    }

    // School Profile
    getSchoolProfile(userId = this.getCurrentUserId()) {
        const raw = localStorage.getItem(this._getKey(userId, 'school_profile'));
        if (raw) {
            try { return JSON.parse(raw); } catch { return null; }
        }
        return {
            isConfigured: false,
            className: 'Class 10',
            stream: ''
        };
    }

    saveSchoolProfile(profile, userId = this.getCurrentUserId()) {
        profile.isConfigured = true;
        localStorage.setItem(this._getKey(userId, 'school_profile'), JSON.stringify(profile));
    }

    // College Profile
    getCollegeProfile(userId = this.getCurrentUserId()) {
        const raw = localStorage.getItem(this._getKey(userId, 'college_profile'));
        if (raw) {
            try { return JSON.parse(raw); } catch { return null; }
        }
        return {
            isConfigured: false,
            branch: 'B.Tech',
            batchYears: '2022-2026',
            isIntegrated: false,
            year: '2nd Year',
            semester: 'Semester 3'
        };
    }

    saveCollegeProfile(profile, userId = this.getCurrentUserId()) {
        profile.isConfigured = true;
        localStorage.setItem(this._getKey(userId, 'college_profile'), JSON.stringify(profile));
    }

    // Subjects by Session (school, college, personal)
    getSubjects(sessionType = 'college', userId = this.getCurrentUserId()) {
        const key = this._getKey(userId, `subjects_${sessionType}`);
        const raw = localStorage.getItem(key);
        if (raw) {
            try { return JSON.parse(raw); } catch { return []; }
        }

        // Default initial curriculum subjects for immediate out-of-the-box delight
        let seed = [];
        if (sessionType === 'college') {
            seed = [
                {
                    id: 'subj_dsa',
                    name: 'Data Structures & Algorithms',
                    color: '#6366F1',
                    icon: 'code',
                    units: [
                        {
                            id: 'u1',
                            name: 'Unit 1: Stacks, Queues & Trees',
                            chapters: [
                                {
                                    id: 'c1',
                                    name: 'Chapter 1: Stacks & Queues Overview',
                                    topics: ['Stack LIFO Principle', 'Expression Evaluation', 'Queue Ring Buffer'],
                                    files: [
                                        {
                                            id: 'f1',
                                            name: 'DSA_Unit1_LectureNotes.pdf',
                                            type: 'pdf',
                                            size: '2.4 MB',
                                            pages: 18,
                                            isStarred: true,
                                            label: 'Exam-VVIP',
                                            content: `DATA STRUCTURES & ALGORITHMS - UNIT 1\n\n1. STACKS:\nA stack is a linear data structure that adheres to the LIFO (Last In, First Out) principle.\nKey Operations:\n- push(e): Adds element to top in O(1)\n- pop(): Removes top element in O(1)\n- peek(): Views top element in O(1)\nApplications:\n- Undo/Redo mechanisms in graphic editors\n- Function call stacks and recursion\n- Bracket matching and postfix evaluation\n\n2. QUEUES:\nA queue adheres to the FIFO (First In, First Out) principle.\nUsed heavily in BFS graph traversal and asynchronous job schedulers.`
                                        },
                                        {
                                            id: 'f2',
                                            name: 'Tree_Traversals_CheatSheet.docx',
                                            type: 'docx',
                                            size: '1.2 MB',
                                            pages: 8,
                                            isStarred: false,
                                            label: 'Formula Sheet',
                                            content: `BINARY TREE TRAVERSALS SUMMARY\n\n1. Inorder: Left -> Root -> Right (Yields sorted order in BST)\n2. Preorder: Root -> Left -> Right (Used for serialization)\n3. Postorder: Left -> Right -> Root (Used for deleting trees & postfix expressions)\n4. Level Order: Breadth-first traversal using a Queue - O(V)`
                                        }
                                    ]
                                },
                                {
                                    id: 'c2',
                                    name: 'Chapter 2: Heaps & Priority Queues',
                                    topics: ['Min-Heap Property', 'Max-Heap Sift-Down', 'HeapSort Algorithm'],
                                    files: [
                                        {
                                            id: 'f3',
                                            name: 'PriorityQueue_Implementation.ppt',
                                            type: 'ppt',
                                            size: '3.1 MB',
                                            pages: 14,
                                            isStarred: true,
                                            label: 'VVIP',
                                            content: `SLIDE 1: BINARY HEAP FUNDAMENTALS\nA complete binary tree stored compactly in a single continuous array.\n\nSLIDE 2: Complexities\n- Insert: O(log n) via sift-up\n- Extract-Min: O(log n) via sift-down\n- Peek: O(1)`
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    id: 'subj_math',
                    name: 'Discrete Mathematics',
                    color: '#EC4899',
                    icon: 'calculator',
                    units: [
                        {
                            id: 'um1',
                            name: 'Unit 1: Graph Theory & Relations',
                            chapters: [
                                {
                                    id: 'cm1',
                                    name: 'Chapter 1: Graphs, Paths & Trees',
                                    topics: ['Eulerian & Hamiltonian Paths', 'Spanning Trees', 'Planar Graphs'],
                                    files: [
                                        {
                                            id: 'fm1',
                                            name: 'Discrete_Math_Graphs_Complete.pdf',
                                            type: 'pdf',
                                            size: '1.8 MB',
                                            pages: 22,
                                            isStarred: true,
                                            label: 'Exam-VVIP',
                                            content: `DISCRETE MATHEMATICS: GRAPH THEORY\n\nTheorem: In any non-directed graph, the sum of all degrees equals twice the number of edges.\nDirected Acyclic Graphs (DAG) enable topological sorting.`
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    id: 'subj_cn',
                    name: 'Computer Networks',
                    color: '#10B981',
                    icon: 'wifi',
                    units: [
                        {
                            id: 'ucn1',
                            name: 'Unit 1: OSI & TCP/IP Architecture',
                            chapters: [
                                {
                                    id: 'ccn1',
                                    name: 'Chapter 1: Transport Layer & Routing',
                                    topics: ['TCP 3-Way Handshake', 'Congestion Control', 'Dijkstra Routing'],
                                    files: [
                                        {
                                            id: 'fcn1',
                                            name: 'Computer_Networks_OSI_Model.pdf',
                                            type: 'pdf',
                                            size: '2.9 MB',
                                            pages: 26,
                                            isStarred: false,
                                            label: 'Reference',
                                            content: `COMPUTER NETWORKS ARCHITECTURE\n\nLayers of OSI:\n1. Physical\n2. Data Link\n3. Network (IP)\n4. Transport (TCP / UDP)\n5. Session\n6. Presentation\n7. Application (HTTP, DNS)`
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ];
        } else if (sessionType === 'school') {
            seed = [
                {
                    id: 'subj_phy',
                    name: 'Physics',
                    color: '#3B82F6',
                    icon: 'atom',
                    units: [
                        {
                            id: 'u_phy_1',
                            name: 'Unit 1: Mechanics & Gravitation',
                            chapters: [
                                {
                                    id: 'c_phy_1',
                                    name: 'Chapter 1: Laws of Motion',
                                    topics: ['Newton First Law', 'Conservation of Momentum', 'Friction'],
                                    files: [
                                        {
                                            id: 'f_phy_1',
                                            name: 'Physics_Newton_Laws_Notes.pdf',
                                            type: 'pdf',
                                            size: '1.5 MB',
                                            pages: 12,
                                            isStarred: true,
                                            label: 'Exam-VVIP',
                                            content: `NEWTON LAWS OF MOTION\n\n1. First Law: An object remains at rest or in uniform motion unless acted upon by an external net force.\n2. Second Law: F = m * a\n3. Third Law: For every action, there is an equal and opposite reaction.`
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    id: 'subj_chem',
                    name: 'Chemistry',
                    color: '#F59E0B',
                    icon: 'flask',
                    units: [
                        {
                            id: 'u_chem_1',
                            name: 'Unit 1: Chemical Reactions',
                            chapters: [
                                {
                                    id: 'c_chem_1',
                                    name: 'Chapter 1: Acids, Bases & Salts',
                                    topics: ['pH Scale', 'Neutralization', 'Salts Formation'],
                                    files: [
                                        {
                                            id: 'f_chem_1',
                                            name: 'Acids_Bases_Formula_Summary.pdf',
                                            type: 'pdf',
                                            size: '1.1 MB',
                                            pages: 9,
                                            isStarred: true,
                                            label: 'Formula Sheet',
                                            content: `ACIDS, BASES & SALTS\n\nAcids produce H+ ions in aqueous solution. pH < 7.\nBases produce OH- ions in aqueous solution. pH > 7.\nNeutralization: Acid + Base -> Salt + Water`
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ];
        } else {
            // Personal Work (PW)
            seed = [
                {
                    id: 'subj_pw_proj',
                    name: 'Startup MVP & Tech Projects',
                    color: '#8B5CF6',
                    icon: 'briefcase',
                    units: [
                        {
                            id: 'upw1',
                            name: 'Phase 1: Architecture & DSA Core',
                            chapters: [
                                {
                                    id: 'cpw1',
                                    name: 'Sprint 1: Multi-Purpose Engine',
                                    topics: ['Frontend Wireframes', 'Client-Side DB', 'Offline Export'],
                                    files: [
                                        {
                                            id: 'fpw1',
                                            name: 'Product_Roadmap_2026.docx',
                                            type: 'docx',
                                            size: '850 KB',
                                            pages: 5,
                                            isStarred: true,
                                            label: 'High Priority',
                                            content: `MPW PRODUCT ROADMAP\n\n- Phase 1: Deploy Academic Core & In-App Viewer\n- Phase 2: Add File Conversion & 1-to-1 Document Editing\n- Phase 3: Teacher & Professor Assignment Gradebook`
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ];
        }

        this.saveSubjects(sessionType, seed, userId);
        return seed;
    }

    saveSubjects(sessionType, subjects, userId = this.getCurrentUserId()) {
        const key = this._getKey(userId, `subjects_${sessionType}`);
        localStorage.setItem(key, JSON.stringify(subjects));
    }

    // Flashcards
    getFlashcards(subjectId, userId = this.getCurrentUserId()) {
        const raw = localStorage.getItem(this._getKey(userId, `flashcards_${subjectId}`));
        if (raw) {
            try { return JSON.parse(raw); } catch { return []; }
        }
        return [
            { id: 'fc1', front: 'What is the time complexity of pushing into a Stack?', back: 'O(1) constant time complexity.', interval: 1 },
            { id: 'fc2', front: 'Which two data structures create an O(1) LRU Cache?', back: 'A Hash Map for O(1) lookup + a Doubly Linked List for O(1) eviction.', interval: 3 },
            { id: 'fc3', front: 'What is the advantage of a Trie over a Hash Map for search?', back: 'Trie provides O(L) prefix search and auto-complete without hash collisions.', interval: 2 }
        ];
    }

    saveFlashcards(subjectId, cards, userId = this.getCurrentUserId()) {
        localStorage.setItem(this._getKey(userId, `flashcards_${subjectId}`), JSON.stringify(cards));
    }

    // Notes Scratchpad (Blank / Ruled)
    getNotes(subjectId, userId = this.getCurrentUserId()) {
        const raw = localStorage.getItem(this._getKey(userId, `notes_${subjectId}`));
        if (raw) {
            try { return JSON.parse(raw); } catch { return null; }
        }
        return {
            pages: [
                `# Study Notes - Page 1\n\n- Subject Key Formulas:\n  1. Inorder Traversal: Left -> Root -> Right\n  2. Min-Heap Root: Always minimum element\n  3. DAG: No cycles permitted\n\nRemember: Revise slides before Friday exam!`
            ],
            style: 'ruled' // 'ruled' or 'blank'
        };
    }

    saveNotes(subjectId, notesObj, userId = this.getCurrentUserId()) {
        localStorage.setItem(this._getKey(userId, `notes_${subjectId}`), JSON.stringify(notesObj));
    }

    // Digital Ruled Typed Notepad (Strictly Typed Line-by-Line)
    getNotepad(subjectId, userId = this.getCurrentUserId()) {
        const raw = localStorage.getItem(this._getKey(userId, `notepad_${subjectId}`));
        if (raw) {
            try { return JSON.parse(raw); } catch { return null; }
        }
        return {
            pages: [
                `Line 1: MPW Digital Ruled Notepad (Typed Edition)\nLine 2: Line-by-line keyboard notes for clean study summaries.\nLine 3: 1. Lecture definitions are kept strictly organized.\nLine 4: 2. Tap + to add the next page when full.\nLine 5: 3. Tap - to remove a page.\nLine 6: 4. Click the top-right X to exit anytime.`
            ]
        };
    }

    saveNotepad(subjectId, notepadObj, userId = this.getCurrentUserId()) {
        localStorage.setItem(this._getKey(userId, `notepad_${subjectId}`), JSON.stringify(notepadObj));
    }

    // Whiteboard Sketches
    getWhiteboardPages(subjectId, userId = this.getCurrentUserId()) {
        const raw = localStorage.getItem(this._getKey(userId, `whiteboard_${subjectId}`));
        if (raw) {
            try { return JSON.parse(raw); } catch { return []; }
        }
        return []; // Array of Base64 canvas dataURLs
    }

    saveWhiteboardPages(subjectId, pages, userId = this.getCurrentUserId()) {
        localStorage.setItem(this._getKey(userId, `whiteboard_${subjectId}`), JSON.stringify(pages));
    }

    // Exam Timetable
    getExamTimetable(userId = this.getCurrentUserId()) {
        const raw = localStorage.getItem(this._getKey(userId, 'exam_timetable'));
        if (raw) {
            try { return JSON.parse(raw); } catch { return []; }
        }
        return [
            { id: 'ex1', subject: 'Data Structures & Algorithms', date: '2026-09-22', type: 'Midterm Exam', urgency: 'high' },
            { id: 'ex2', subject: 'Discrete Mathematics', date: '2026-09-28', type: 'Theory Test', urgency: 'medium' },
            { id: 'ex3', subject: 'Computer Networks', date: '2026-10-05', type: 'Lab Practical', urgency: 'low' }
        ];
    }

    // CGPA Matrix Courses
    getCGPACourses(userId = this.getCurrentUserId()) {
        const raw = localStorage.getItem(this._getKey(userId, 'cgpa_courses'));
        if (raw) {
            try { return JSON.parse(raw); } catch { return []; }
        }
        return [
            { id: 'cg1', code: 'CS201', name: 'Data Structures & Algorithms', credits: 4, gradePoint: 10, targetGrade: 'O (Outstanding)', completed: true },
            { id: 'cg2', code: 'MA201', name: 'Discrete Mathematics', credits: 4, gradePoint: 9, targetGrade: 'A+ (Excellent)', completed: true },
            { id: 'cg3', code: 'EC204', name: 'Digital Electronics', credits: 3, gradePoint: 9, targetGrade: 'A (Very Good)', completed: true },
            { id: 'cg4', code: 'CS202', name: 'Data Structures Lab', credits: 2, gradePoint: 10, targetGrade: 'O (Outstanding)', completed: true },
            { id: 'cg5', code: 'CS203', name: 'Computer Networks', credits: 4, gradePoint: 8, targetGrade: 'B+ (Good)', completed: false }
        ];
    }

    saveCGPACourses(courses, userId = this.getCurrentUserId()) {
        localStorage.setItem(this._getKey(userId, 'cgpa_courses'), JSON.stringify(courses));
    }

    // Full Backup & Restore
    exportFullBackup(userId = this.getCurrentUserId()) {
        const backup = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            userId,
            user: window.authManager ? window.authManager.getCurrentUser() : null,
            theme: this.getThemeColors(),
            schoolProfile: this.getSchoolProfile(userId),
            collegeProfile: this.getCollegeProfile(userId),
            collegeSubjects: this.getSubjects('college', userId),
            schoolSubjects: this.getSubjects('school', userId),
            personalSubjects: this.getSubjects('personal', userId),
            cgpaCourses: this.getCGPACourses(userId),
            exams: this.getExamTimetable(userId)
        };
        return JSON.stringify(backup, null, 2);
    }

    importFullBackup(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (!data.userId) return { success: false, message: 'Invalid backup file format.' };

            const uid = data.userId;
            if (data.theme) this.saveThemeColors(data.theme);
            if (data.schoolProfile) this.saveSchoolProfile(data.schoolProfile, uid);
            if (data.collegeProfile) this.saveCollegeProfile(data.collegeProfile, uid);
            if (data.collegeSubjects) this.saveSubjects('college', data.collegeSubjects, uid);
            if (data.schoolSubjects) this.saveSubjects('school', data.schoolSubjects, uid);
            if (data.personalSubjects) this.saveSubjects('personal', data.personalSubjects, uid);
            if (data.cgpaCourses) this.saveCGPACourses(data.cgpaCourses, uid);

            return { success: true };
        } catch (e) {
            return { success: false, message: e.message };
        }
    }

    // Natural Alphanumeric Sorting for Folders & Files
    sortItems(items, criteria = 'number') {
        if (!Array.isArray(items)) return [];
        const copy = [...items];
        if (criteria === 'number') {
            return copy.sort((a, b) => {
                const numA = (a.name || '').match(/\d+/);
                const numB = (b.name || '').match(/\d+/);
                if (numA && numB) {
                    const diff = parseInt(numA[0], 10) - parseInt(numB[0], 10);
                    if (diff !== 0) return diff;
                }
                return (a.name || '').localeCompare(b.name || '', undefined, { numeric: true, sensitivity: 'base' });
            });
        } else if (criteria === 'name') {
            return copy.sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
        } else if (criteria === 'starred') {
            return copy.sort((a, b) => (b.isStarred ? 1 : 0) - (a.isStarred ? 1 : 0));
        } else if (criteria === 'recent') {
            return copy.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        }
        return copy;
    }

    // Star / Favorite File Toggle
    toggleStarFile(sessionOrFile, subjectId, unitId, fileId, userId = this.getCurrentUserId()) {
        if (sessionOrFile && typeof sessionOrFile === 'object') {
            sessionOrFile.isStarred = !sessionOrFile.isStarred;
            return sessionOrFile.isStarred;
        }
        const subjects = this.getSubjects(sessionOrFile, userId);
        const subj = subjects.find(s => s.id === subjectId);
        if (!subj) return false;
        const unit = subj.units.find(u => u.id === unitId);
        if (!unit) return false;
        let file = null;
        for (const chap of (unit.chapters || [])) {
            file = (chap.files || []).find(f => f.id === fileId);
            if (file) break;
        }
        if (file) {
            file.isStarred = !file.isStarred;
            this.saveSubjects(sessionOrFile, subjects, userId);
            return file.isStarred;
        }
        return false;
    }

    // Google Gemini API Key Storage
    getGeminiApiKey() {
        return localStorage.getItem('mpw_gemini_api_key') || '';
    }

    saveGeminiApiKey(key) {
        localStorage.setItem('mpw_gemini_api_key', (key || '').trim());
    }

    // Audio Study Memos (GoodNotes / Notability inspired)
    saveAudioMemo(subjectId, unitId, memoData, userId = this.getCurrentUserId()) {
        const key = this._getKey(userId, `audio_memos_${subjectId}_${unitId}`);
        let memos = [];
        try { memos = JSON.parse(localStorage.getItem(key)) || []; } catch {}
        memoData.id = 'memo_' + Date.now();
        memoData.createdAt = Date.now();
        memos.unshift(memoData);
        localStorage.setItem(key, JSON.stringify(memos));
        return memos;
    }

    getAudioMemos(subjectId, unitId, userId = this.getCurrentUserId()) {
        const key = this._getKey(userId, `audio_memos_${subjectId}_${unitId}`);
        try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
    }

    // Daily Study Progress & Pomodoro Time Tracker
    logStudyMinutes(minutes, userId = this.getCurrentUserId()) {
        const key = this._getKey(userId, 'daily_study_stats');
        const today = new Date().toDateString();
        let stats = { date: today, totalMinutes: 0, completedSessions: 0 };
        try {
            const raw = localStorage.getItem(key);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed.date === today) stats = parsed;
            }
        } catch {}
        stats.totalMinutes += minutes;
        stats.completedSessions += 1;
        stats.minutesToday = stats.totalMinutes;
        stats.sessionsCompleted = stats.completedSessions;
        localStorage.setItem(key, JSON.stringify(stats));
        return stats;
    }

    getDailyStudyStats(userId = this.getCurrentUserId()) {
        const key = this._getKey(userId, 'daily_study_stats');
        const today = new Date().toDateString();
        try {
            const raw = localStorage.getItem(key);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed.date === today) {
                    parsed.minutesToday = parsed.totalMinutes;
                    parsed.sessionsCompleted = parsed.completedSessions;
                    return parsed;
                }
            }
        } catch {}
        return { date: today, totalMinutes: 0, completedSessions: 0, minutesToday: 0, sessionsCompleted: 0 };
    }
}

window.storageManager = new StorageManager();
