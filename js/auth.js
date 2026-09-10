/**
 * MPW - W1 Authentication System
 * 
 * Features:
 * - Dual Login (User ID e.g., 'MCP-user-000001' OR Email)
 * - Auto-increment permanent lifetime User ID sequence
 * - 5-Second Toast with countdown progress bar & Copy button
 * - Salted password hashing
 * - Brute-force protection (5 failed attempts lockout)
 * - Persona persistence (School, College, Personal Work)
 */

class AuthManager {
    constructor() {
        this.STORAGE_USERS_KEY = 'mpw_registered_users_db';
        this.STORAGE_COUNTER_KEY = 'mpw_user_id_counter';
        this.STORAGE_SESSION_KEY = 'mpw_active_session';
        this.FAILED_ATTEMPTS_KEY = 'mpw_failed_login_attempts';
        this.LOCKOUT_KEY = 'mpw_lockout_until';

        this.initDatabase();
    }

    initDatabase() {
        // Guarantee clean start for fresh deployment cycle
        if (!localStorage.getItem('mpw_v3_session_cleared')) {
            localStorage.removeItem(this.STORAGE_SESSION_KEY);
            localStorage.removeItem(this.STORAGE_USERS_KEY);
            localStorage.removeItem(this.STORAGE_COUNTER_KEY);
            localStorage.setItem('mpw_v3_session_cleared', 'true');
        }

        if (!localStorage.getItem(this.STORAGE_COUNTER_KEY)) {
            localStorage.setItem(this.STORAGE_COUNTER_KEY, '1');
        }
        if (!localStorage.getItem(this.STORAGE_USERS_KEY)) {
            // Pre-seed demo student account
            const demoSalt = this._generateSalt();
            const demoHashedPassword = this._hashPassword('password123', demoSalt);
            const demoUser = {
                userId: 'MCP-user-000001',
                name: 'Athul V.R.',
                age: 20,
                email: 'athul@example.com',
                phone: '9876543210',
                address: 'Main Campus, Tech Block',
                salt: demoSalt,
                passwordHash: demoHashedPassword,
                role: 'College Student',
                dailyStreak: 5,
                lastLoginDate: new Date().toDateString(),
                profilePic: '', // Base64
                createdAt: Date.now()
            };
            localStorage.setItem(this.STORAGE_USERS_KEY, JSON.stringify([demoUser]));
            localStorage.setItem(this.STORAGE_COUNTER_KEY, '2');
            // Deliberately do NOT set STORAGE_SESSION_KEY so app always starts on the Authentication Panel!
        }
    }

    clearAllAuthData() {
        localStorage.removeItem(this.STORAGE_SESSION_KEY);
        localStorage.removeItem(this.STORAGE_USERS_KEY);
        localStorage.removeItem(this.STORAGE_COUNTER_KEY);
        localStorage.removeItem(this.FAILED_ATTEMPTS_KEY);
        localStorage.removeItem(this.LOCKOUT_KEY);
        this.initDatabase();
    }

    getUsers() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_USERS_KEY)) || [];
        } catch {
            return [];
        }
    }

    saveUsers(users) {
        localStorage.setItem(this.STORAGE_USERS_KEY, JSON.stringify(users));
    }

    _generateSalt() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    _hashPassword(password, salt) {
        let str = password + ':' + salt;
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            let char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0;
        }
        return 'hash_' + Math.abs(hash).toString(16) + '_' + str.length;
    }

    generatePermanentUserId() {
        let currentCounter = parseInt(localStorage.getItem(this.STORAGE_COUNTER_KEY) || '1', 10);
        const formatted = 'MCP-user-' + String(currentCounter).padStart(6, '0');
        localStorage.setItem(this.STORAGE_COUNTER_KEY, String(currentCounter + 1));
        return formatted;
    }

    register(formData) {
        const { name, age, email, phone, address, password, role } = formData;
        const users = this.getUsers();

        const normalizedEmail = email.toLowerCase().trim();
        if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
            return { success: false, message: 'This email is already registered. Please log in.' };
        }

        const userId = this.generatePermanentUserId();
        const salt = this._generateSalt();
        const passwordHash = this._hashPassword(password, salt);

        const newUser = {
            userId,
            name: (name || 'Student').trim(),
            age: age ? parseInt(age, 10) : 18,
            email: normalizedEmail,
            phone: phone ? phone.trim() : '',
            address: address ? address.trim() : '',
            salt,
            passwordHash,
            role: role || 'College Student',
            dailyStreak: 1,
            lastLoginDate: new Date().toDateString(),
            profilePic: '',
            isFirstLogin: true,
            createdAt: Date.now()
        };

        users.push(newUser);
        this.saveUsers(users);

        return {
            success: true,
            userId,
            user: newUser
        };
    }

    calculatePasswordStrength(password) {
        if (!password) return { score: 0, label: 'Enter password', color: 'bg-slate-700', width: '0%' };
        let score = 0;
        if (password.length >= 6) score++;
        if (password.length >= 8 && /[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        switch (score) {
            case 1: return { score: 1, label: 'Weak', color: 'bg-red-500', width: '25%' };
            case 2: return { score: 2, label: 'Moderate', color: 'bg-amber-500', width: '50%' };
            case 3: return { score: 3, label: 'Strong', color: 'bg-emerald-500', width: '75%' };
            case 4: return { score: 4, label: 'Military-Grade 🔒', color: 'bg-cyan-400', width: '100%' };
            default: return { score: 0, label: 'Very Weak', color: 'bg-red-400', width: '15%' };
        }
    }

    login(identifier, password) {
        const lockoutUntil = parseInt(localStorage.getItem(this.LOCKOUT_KEY) || '0', 10);
        const now = Date.now();
        if (lockoutUntil > now) {
            const secondsLeft = Math.ceil((lockoutUntil - now) / 1000);
            return {
                success: false,
                message: `Account temporarily locked. Try again in ${secondsLeft}s.`
            };
        }

        const users = this.getUsers();
        const normalizedInput = identifier.trim().toLowerCase();

        // Dual Login: matches by User ID OR Email
        const matchedUser = users.find(u => 
            u.userId.toLowerCase() === normalizedInput || 
            u.email.toLowerCase() === normalizedInput
        );

        if (!matchedUser) {
            this._recordFailedAttempt();
            return { success: false, message: 'Invalid User ID or Email. Please check your credentials.' };
        }

        const inputHash = this._hashPassword(password, matchedUser.salt);
        if (inputHash !== matchedUser.passwordHash) {
            const attempts = this._recordFailedAttempt();
            const remaining = Math.max(0, 5 - attempts);
            return { 
                success: false, 
                message: `Incorrect password! (${remaining} attempts remaining before lockout)` 
            };
        }

        // Reset lockout on successful login
        localStorage.removeItem(this.FAILED_ATTEMPTS_KEY);
        localStorage.removeItem(this.LOCKOUT_KEY);

        // Update Daily Streak if logging in on a new day
        this._updateStreak(matchedUser);

        // Save active session
        localStorage.setItem(this.STORAGE_SESSION_KEY, JSON.stringify(matchedUser));

        return {
            success: true,
            user: matchedUser
        };
    }

    _updateStreak(user) {
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        if (user.lastLoginDate === yesterday) {
            user.dailyStreak = (user.dailyStreak || 0) + 1;
        } else if (user.lastLoginDate !== today) {
            user.dailyStreak = 1; // Reset if missed a day
        }
        user.lastLoginDate = today;

        const users = this.getUsers();
        const idx = users.findIndex(u => u.userId === user.userId);
        if (idx !== -1) {
            users[idx] = user;
            this.saveUsers(users);
        }
    }

    _recordFailedAttempt() {
        let attempts = parseInt(localStorage.getItem(this.FAILED_ATTEMPTS_KEY) || '0', 10) + 1;
        localStorage.setItem(this.FAILED_ATTEMPTS_KEY, String(attempts));

        if (attempts >= 5) {
            localStorage.setItem(this.LOCKOUT_KEY, String(Date.now() + 60000));
            localStorage.removeItem(this.FAILED_ATTEMPTS_KEY);
        }
        return attempts;
    }

    getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_SESSION_KEY));
        } catch {
            return null;
        }
    }

    updateProfile(updatedFields) {
        const current = this.getCurrentUser();
        if (!current) return null;

        const updated = { ...current, ...updatedFields };
        localStorage.setItem(this.STORAGE_SESSION_KEY, JSON.stringify(updated));

        const users = this.getUsers();
        const idx = users.findIndex(u => u.userId === current.userId);
        if (idx !== -1) {
            users[idx] = updated;
            this.saveUsers(users);
        }
        return updated;
    }

    logout() {
        localStorage.removeItem(this.STORAGE_SESSION_KEY);
    }
}

window.authManager = new AuthManager();
