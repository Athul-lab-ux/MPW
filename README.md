# 🎓 MPW (Multipurpose Work) — Academic Study & Productivity Platform

> An academic multipurpose ecosystem powered natively by **14 real-world Data Structures & Algorithms (DSA)** under the hood. Built for School Students, College Students, and Personal Knowledge Workers.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![DSA Engine](https://img.shields.io/badge/14_DSA_Engine-Active-F97316?style=for-the-badge)

---

## 🌟 Key Highlights & Features

### 🔒 W1: Enterprise-Grade Authentication
* **Dual Identifier Login:** Accepts either **Permanent User ID** (e.g. `MCP-user-000001`) OR **Email** + Password.
* **Permanent Lifetime User ID:** Sequential zero-padded counter (`MCP-user-000001`, `MCP-user-000002`...) stored permanently.
* **5-Second Countdown Toast:** Displays newly generated User ID with an animated countdown progress bar, auto-fill, and 1-click clipboard copy.
* **Security:** Cryptographic salted SHA-256 password hashing & brute-force protection (5 failed attempts lockout with 60s timer).

### 🎒 WW1: Smart Academic Onboarding
* **1-Time Setup Rule:** Onboarding details are permanently saved to the user's account and never prompt again on subsequent visits.
* **School Session:** Class 1–10 starts directly; Class 11–12 prompts for Stream (*Science, Commerce, Arts, Humanities, Psychology, Custom*).
* **College Session:** Degree/Branch selection, Batch Year validation (*Standard 4-year duration check with 5-year Integrated Dual-Degree modal*), and auto-synchronized Semester & Year.
* **Personal Work (PW) Session:** Direct, instantaneous access with zero onboarding popups for freelance and custom projects.
* **Teacher & Professor Sessions:** Preview cards with sleek **"Coming Soon"** badges.

### 🖥️ W2: Master Workspace & 3-Tier Theme
* **Top Navigation Bar:** Daily Study Streak (🔥), Exam Countdown Radar, 3-Tier Color Customizer, and Profile Pill (DP + Name + Permanent ID).
* **3-Tier Signature Theme:**
  * **Primary:** White (`#FFFFFF`)
  * **Secondary:** Orange (`#F97316`)
  * **Tertiary:** Blue (`#1E3A8A`)
  * *Fully customizable with 6 designer presets and live custom color pickers.*
* **Bottom-Right Corner:** Floating circular pulsing **AI Study Copilot (FAB)** with responsive chat drawer.

### 🎨 The Left-Side Creative Studio Suite
1. **Freeform Drawing Canvas:** Diagrams, sketches, pen, eraser, brush slider, and **Special Lasso / Circle Erase**.
2. **Notes Writing Studio:** Choice of **Blank** OR **Ruled (Lined)** notebook paper background with handwriting tools.
3. **Digital Ruled Notepad:** **Ruled paper ONLY**, **Strictly Keyboard Typing ONLY** line-by-line (no drawing tools), multi-page (`+`/`-`), top-right `✕` cross button to exit.
4. **Flashcard Studio 3D:** Double-sided flip cards with spaced repetition intervals (scheduled by Binary Min-Heap).
5. **Split-Screen Transparent Whiteboard:** Floating reference PDF/PPT on left with **Transparency Slider (10%–100%)**, contained zoom, eye toggle (`👁️`), and 1-click **Save to Unit Folder**.

### 📖 In-App Document & Image Reader
* Seamlessly renders PDF, PPT, DOCX, and images in-app without redirecting to external software.
* **4-Color Highlighters:** 🟡 Yellow (Key points), 🟢 Green (Formulas), 🔴 Pink (Exam-VVIP), 🔵 Cyan (Examples).
* Text selection actions: Copy text, Add Sticky Note, 1-Click "Make Flashcard", 1-Click "Generate Quiz".

---

## 🧠 The 14 Data Structures & Algorithms Under the Hood

| # | Data Structure / Algorithm | Practical Feature Powered in MPW | Time Complexity |
| :---: | :--- | :--- | :---: |
| 1 | **Trie (Prefix Tree)** | Real-time search bar auto-complete & breadcrumb paths | $O(L)$ |
| 2 | **N-ary Tree** | Hierarchical file tree (Subject $\to$ Unit $\to$ Chapter $\to$ File) | $O(N)$ |
| 3 | **Binary Max/Min Heap** | Priority search relevance & spaced repetition flashcard scheduler | $O(\log n)$ |
| 4 | **Lexical Tokenizer & FSM** | Parses complex subject strings (`physics,chemistry<maths?cs`) | $O(N)$ |
| 5 | **Hash Table (Chaining)** | User store, tag index, and quick color lookups | $O(1)$ avg |
| 6 | **LRU Cache (DLL + Map)** | Instant switching between recently opened documents & pages | $O(1)$ |
| 7 | **DAG & Topological Sort** | Subject prerequisite roadmap & study flowcharts | $O(V + E)$ |
| 8 | **Dual-Stack Engine (LIFO)** | Canvas, highlighters, and notes Undo/Redo | $O(1)$ |
| 9 | **Queue / Deque (FIFO)** | Background file upload queue & recent activity feed | $O(1)$ |
| 10 | **Segment Tree** | Range queries for syllabus completion percentages | $O(\log n)$ |
| 11 | **Disjoint Set Union (DSU)** | Links cross-subject concept clusters (e.g. Physics $\leftrightarrow$ Math) | $O(\alpha(n))$ |
| 12 | **MergeSort** | Multi-criteria sorting for documents by date, size, or stars | $O(n \log n)$ |
| 13 | **Levenshtein Distance (DP)**| Fuzzy search matching for typos (e.g. *kemistry* $\to$ *Chemistry*) | $O(m \cdot n)$ |
| 14 | **Bitmasking** | Ultra-compact binary flag tracking for completed/starred items | $O(1)$ |

---

## 📁 Project Architecture

```
Downloads/MPW/
├── index.html              # Responsive single-page application (Laptop & Phone)
├── styles.css              # 3-Tier Theme variables, Ruled notebook paper, Highlighters
├── README.md               # Complete documentation & GitHub guide
└── js/
    ├── dsa_engine.js       # All 14 DSA implementations
    ├── auth.js             # W1 Auth (Dual Login, Permanent ID, 5s Toast)
    ├── storage.js          # Persistent local storage & Full Backup/Restore
    ├── whiteboard.js       # 4 Studio Modes & Split Transparent Whiteboard
    └── app.js              # Master UI controller, Lexer, In-App Reader & Search
```

---

## 🚀 How to Run & Test Locally

### 1. Run the Automated 3-Pass Test Suite
Verify all 14 DSA algorithms, W1 Auth, and Storage engines with zero external dependencies:
```bash
node test_suite.js
```
*Output: All 12 automated verification passes test 100% green.*

### 2. Direct Browser Open
Simply double-click `index.html` in your file explorer (`Downloads/MPW/index.html`) or open it in any modern browser (Chrome, Edge, Firefox, Safari).

### 3. Lightweight Local Server (Laptop & Phone Testing)
Run with Python from the `Downloads/MPW` directory:
```bash
python -m http.server 8000
```
* Open `http://localhost:8000` on your laptop.
* Open `http://<your-laptop-ip>:8000` on your mobile phone connected to the same Wi-Fi!

---

## 📦 Ready for GitHub Push

When you're ready to push to GitHub in your next session:
```bash
git init
git add .
git commit -m "Initial commit: MPW (Multipurpose Work) v1.0 complete with 14 DSA algorithms"
git branch -M main
git remote add origin https://github.com/<your-username>/MPW.git
git push -u origin main
```

---
*Crafted with passion by Athul V.R. & Antigravity.*
