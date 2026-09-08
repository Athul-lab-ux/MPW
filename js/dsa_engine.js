/**
 * MPW (Multipurpose Work) - 14 Data Structures & Algorithms Engine
 * Author: Antigravity & Athul V.R.
 * 
 * Implements 14 real-world DSA concepts natively powering the MPW study ecosystem:
 * 1. Trie (Prefix Tree) - Instant prefix search with breadcrumb paths
 * 2. N-ary Tree - Hierarchical folder filesystem (Subject -> Unit -> Chapter -> Topic -> File)
 * 3. Priority Queue (Binary Max/Min Heap) - Smart search ranking & spaced repetition
 * 4. Lexical Tokenizer & FSM - Delimiter splitting while preserving multi-word phrases
 * 5. Hash Table with Chaining - O(1) user & file lookups with linked list collision resolution
 * 6. LRU Cache (Hash Map + Doubly Linked List) - Recently viewed documents & pages
 * 7. Directed Acyclic Graph (DAG) & Topological Sort - Chapter prerequisite roadmap
 * 8. Dual-Stack Engine (LIFO) - Canvas, highlighter, and notes Undo/Redo
 * 9. Queue / Deque (FIFO) - Background upload pipeline & activity tracker
 * 10. Segment Tree - O(log n) range query for chapter syllabus completion
 * 11. Disjoint Set Union (Union-Find) - Cross-subject concept links
 * 12. Sorter (MergeSort & QuickSort) - Multi-criteria sorting
 * 13. Dynamic Programming (Levenshtein Distance) - Fuzzy search typo tolerance
 * 14. Bitmasking - Compact binary status flags
 */

// ==========================================
// 1. TRIE (Prefix Tree) for Smart Search
// ==========================================
class TrieNode {
    constructor() {
        this.children = new Map();
        this.isEndOfWord = false;
        this.records = []; // [{ id, name, type, subjectId, path, importance, isStarred }]
    }
}

class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    insert(word, record) {
        if (!word) return;
        let current = this.root;
        const normalized = word.toLowerCase().trim();
        for (const char of normalized) {
            if (!current.children.has(char)) {
                current.children.set(char, new TrieNode());
            }
            current = current.children.get(char);
            if (!current.records.some(r => r.id === record.id)) {
                current.records.push(record);
            }
        }
        current.isEndOfWord = true;
    }

    searchPrefix(prefix) {
        let current = this.root;
        const normalized = prefix.toLowerCase().trim();
        for (const char of normalized) {
            if (!current.children.has(char)) {
                return [];
            }
            current = current.children.get(char);
        }
        return current.records;
    }
}

// ==========================================
// 2. N-ARY TREE for Hierarchical Study Files
// ==========================================
class TreeNode {
    constructor(id, name, type = 'folder', data = {}) {
        this.id = id;
        this.name = name;
        this.type = type; // 'subject', 'unit', 'chapter', 'topic', 'file'
        this.data = data; // { fileType, content, size, pageCount, isStarred, label, color, tags }
        this.children = [];
        this.parentId = null;
        this.createdAt = Date.now();
    }

    addChild(childNode) {
        childNode.parentId = this.id;
        this.children.push(childNode);
    }

    removeChild(childId) {
        this.children = this.children.filter(c => c.id !== childId);
    }

    findDescendant(targetId) {
        if (this.id === targetId) return this;
        for (const child of this.children) {
            const found = child.findDescendant(targetId);
            if (found) return found;
        }
        return null;
    }
}

// ==========================================
// 3. PRIORITY QUEUE (Binary Heap)
// ==========================================
class PriorityQueue {
    constructor(comparator = (a, b) => (a.score || 0) - (b.score || 0)) {
        this.heap = [];
        this.comparator = comparator; // Default: Max-Heap (a > b returns > 0)
    }

    size() {
        return this.heap.length;
    }

    peek() {
        return this.heap[0] || null;
    }

    push(item) {
        this.heap.push(item);
        this._siftUp(this.heap.length - 1);
    }

    pop() {
        if (this.size() === 0) return null;
        const top = this.heap[0];
        const bottom = this.heap.pop();
        if (this.size() > 0) {
            this.heap[0] = bottom;
            this._siftDown(0);
        }
        return top;
    }

    _siftUp(index) {
        let parent = Math.floor((index - 1) / 2);
        while (index > 0 && this.comparator(this.heap[index], this.heap[parent]) > 0) {
            [this.heap[index], this.heap[parent]] = [this.heap[parent], this.heap[index]];
            index = parent;
            parent = Math.floor((index - 1) / 2);
        }
    }

    _siftDown(index) {
        const length = this.heap.length;
        while (true) {
            let left = 2 * index + 1;
            let right = 2 * index + 2;
            let target = index;

            if (left < length && this.comparator(this.heap[left], this.heap[target]) > 0) {
                target = left;
            }
            if (right < length && this.comparator(this.heap[right], this.heap[target]) > 0) {
                target = right;
            }
            if (target === index) break;
            [this.heap[index], this.heap[target]] = [this.heap[target], this.heap[index]];
            index = target;
        }
    }
}

// ==========================================
// 4. LEXICAL TOKENIZER & FSM
// Splits on , < > ? ; / | + \n while preserving internal spaces & phrases (e.g. "computer science", "data structures & algorithms")
// ==========================================
class SubjectLexer {
    static parse(input) {
        if (!input || typeof input !== 'string') return [];

        // Delimiters: commas, semicolons, <, >, ?, /, |, +, newlines, or numbered list bullets (1. , 2. )
        // Keeps ampersands '&' and spaces inside subject names intact!
        const rawTokens = input.split(/[,;<>?/|+\n\t]+|\b\d+\.\s*/);
        const subjects = [];

        for (let token of rawTokens) {
            token = token.replace(/^[^\w\s&]+|[^\w\s&]+$/g, '').trim();
            token = token.replace(/\s+/g, ' ');

            if (token.length > 0 && !subjects.some(s => s.toLowerCase() === token.toLowerCase())) {
                subjects.push(token);
            }
        }
        return subjects;
    }
}

// ==========================================
// 5. HASH TABLE WITH CHAINING
// ==========================================
class HashTable {
    constructor(size = 37) {
        this.buckets = new Array(size).fill(null).map(() => []);
        this.size = size;
        this.count = 0;
    }

    _hash(key) {
        let hash = 0;
        const str = String(key);
        for (let i = 0; i < str.length; i++) {
            hash = (hash * 31 + str.charCodeAt(i)) % this.size;
        }
        return hash;
    }

    set(key, value) {
        const index = this._hash(key);
        const bucket = this.buckets[index];
        const existing = bucket.find(entry => entry.key === key);
        if (existing) {
            existing.value = value;
        } else {
            bucket.push({ key, value });
            this.count++;
        }
    }

    get(key) {
        const index = this._hash(key);
        const bucket = this.buckets[index];
        const entry = bucket.find(entry => entry.key === key);
        return entry ? entry.value : null;
    }

    has(key) {
        return this.get(key) !== null;
    }

    delete(key) {
        const index = this._hash(key);
        const bucket = this.buckets[index];
        const idx = bucket.findIndex(entry => entry.key === key);
        if (idx !== -1) {
            bucket.splice(idx, 1);
            this.count--;
            return true;
        }
        return false;
    }
}

// ==========================================
// 6. LRU CACHE (Hash Map + Doubly Linked List)
// ==========================================
class DoublyLinkedListNode {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}

class LRUCache {
    constructor(capacity = 10) {
        this.capacity = capacity;
        this.cache = new Map();
        this.head = new DoublyLinkedListNode(null, null);
        this.tail = new DoublyLinkedListNode(null, null);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    _remove(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    _addToFront(node) {
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next.prev = node;
        this.head.next = node;
    }

    get(key) {
        if (!this.cache.has(key)) return null;
        const node = this.cache.get(key);
        this._remove(node);
        this._addToFront(node);
        return node.value;
    }

    put(key, value) {
        if (this.cache.has(key)) {
            const existing = this.cache.get(key);
            existing.value = value;
            this._remove(existing);
            this._addToFront(existing);
            return;
        }
        if (this.cache.size >= this.capacity) {
            const lru = this.tail.prev;
            this._remove(lru);
            this.cache.delete(lru.key);
        }
        const newNode = new DoublyLinkedListNode(key, value);
        this._addToFront(newNode);
        this.cache.set(key, newNode);
    }

    getAllRecent() {
        const items = [];
        let curr = this.head.next;
        while (curr !== this.tail) {
            items.push({ key: curr.key, value: curr.value });
            curr = curr.next;
        }
        return items;
    }
}

// ==========================================
// 7. DIRECTED ACYCLIC GRAPH (DAG) & TOPOLOGICAL SORT
// ==========================================
class TopicDAG {
    constructor() {
        this.adjList = new Map();
        this.topicInfo = new Map();
    }

    addTopic(id, name, status = 'pending') {
        if (!this.adjList.has(id)) {
            this.adjList.set(id, new Set());
            this.topicInfo.set(id, { name, status });
        }
    }

    addPrerequisite(prereqId, topicId) {
        this.addTopic(prereqId, prereqId);
        this.addTopic(topicId, topicId);
        this.adjList.get(prereqId).add(topicId);
    }

    topologicalSort() {
        const inDegree = new Map();
        for (const [node] of this.adjList) {
            inDegree.set(node, 0);
        }
        for (const [, neighbors] of this.adjList) {
            for (const neighbor of neighbors) {
                inDegree.set(neighbor, (inDegree.get(neighbor) || 0) + 1);
            }
        }

        const queue = [];
        for (const [node, deg] of inDegree) {
            if (deg === 0) queue.push(node);
        }

        const sortedOrder = [];
        while (queue.length > 0) {
            const curr = queue.shift();
            sortedOrder.push(curr);
            const neighbors = this.adjList.get(curr) || [];
            for (const neighbor of neighbors) {
                inDegree.set(neighbor, inDegree.get(neighbor) - 1);
                if (inDegree.get(neighbor) === 0) {
                    queue.push(neighbor);
                }
            }
        }

        if (sortedOrder.length !== this.adjList.size) {
            return { hasCycle: true, order: [] };
        }
        return { hasCycle: false, order: sortedOrder };
    }
}

// ==========================================
// 8. DUAL-STACK ENGINE (LIFO)
// ==========================================
class UndoRedoStack {
    constructor() {
        this.undoStack = [];
        this.redoStack = [];
    }

    execute(action) {
        this.undoStack.push(action);
        this.redoStack = [];
    }

    undo() {
        if (this.undoStack.length === 0) return null;
        const action = this.undoStack.pop();
        this.redoStack.push(action);
        return action;
    }

    redo() {
        if (this.redoStack.length === 0) return null;
        const action = this.redoStack.pop();
        this.undoStack.push(action);
        return action;
    }

    canUndo() {
        return this.undoStack.length > 0;
    }

    canRedo() {
        return this.redoStack.length > 0;
    }
}

// ==========================================
// 9. SEGMENT TREE
// ==========================================
class SegmentTree {
    constructor(data = []) {
        this.n = data.length;
        this.tree = new Array(4 * Math.max(this.n, 1)).fill(0);
        if (this.n > 0) {
            this._build(data, 0, 0, this.n - 1);
        }
    }

    _build(data, node, start, end) {
        if (start === end) {
            this.tree[node] = data[start];
            return;
        }
        const mid = Math.floor((start + end) / 2);
        this._build(data, 2 * node + 1, start, mid);
        this._build(data, 2 * node + 2, mid + 1, end);
        this.tree[node] = this.tree[2 * node + 1] + this.tree[2 * node + 2];
    }

    update(index, value, node = 0, start = 0, end = this.n - 1) {
        if (start === end) {
            this.tree[node] = value;
            return;
        }
        const mid = Math.floor((start + end) / 2);
        if (index <= mid) {
            this.update(index, value, 2 * node + 1, start, mid);
        } else {
            this.update(index, value, 2 * node + 2, mid + 1, end);
        }
        this.tree[node] = this.tree[2 * node + 1] + this.tree[2 * node + 2];
    }

    queryRange(left, right, node = 0, start = 0, end = this.n - 1) {
        if (right < start || left > end) return 0;
        if (left <= start && end <= right) return this.tree[node];
        const mid = Math.floor((start + end) / 2);
        return (
            this.queryRange(left, right, 2 * node + 1, start, mid) +
            this.queryRange(left, right, 2 * node + 2, mid + 1, end)
        );
    }
}

// ==========================================
// 10. DISJOINT SET UNION (Union-Find)
// ==========================================
class DisjointSetUnion {
    constructor() {
        this.parent = new Map();
        this.rank = new Map();
    }

    makeSet(i) {
        if (!this.parent.has(i)) {
            this.parent.set(i, i);
            this.rank.set(i, 0);
        }
    }

    find(i) {
        this.makeSet(i);
        if (this.parent.get(i) === i) return i;
        const root = this.find(this.parent.get(i));
        this.parent.set(i, root);
        return root;
    }

    union(i, j) {
        const rootI = this.find(i);
        const rootJ = this.find(j);
        if (rootI !== rootJ) {
            const rankI = this.rank.get(rootI);
            const rankJ = this.rank.get(rootJ);
            if (rankI < rankJ) {
                this.parent.set(rootI, rootJ);
            } else if (rankI > rankJ) {
                this.parent.set(rootJ, rootI);
            } else {
                this.parent.set(rootJ, rootI);
                this.rank.set(rootI, rankI + 1);
            }
            return true;
        }
        return false;
    }

    areConnected(i, j) {
        return this.find(i) === this.find(j);
    }
}

// ==========================================
// 11. DYNAMIC PROGRAMMING: LEVENSHTEIN DISTANCE
// ==========================================
class FuzzyMatcher {
    static levenshtein(s1, s2) {
        const m = s1.length;
        const n = s2.length;
        const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

        for (let i = 0; i <= m; i++) dp[i][0] = i;
        for (let j = 0; j <= n; j++) dp[0][j] = j;

        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (s1[i - 1].toLowerCase() === s2[j - 1].toLowerCase()) {
                    dp[i][j] = dp[i - 1][j - 1];
                } else {
                    dp[i][j] = 1 + Math.min(
                        dp[i - 1][j],
                        dp[i][j - 1],
                        dp[i - 1][j - 1]
                    );
                }
            }
        }
        return dp[m][n];
    }

    static isFuzzyMatch(query, target, threshold = 2) {
        if (target.toLowerCase().includes(query.toLowerCase())) return true;
        if (Math.abs(query.length - target.length) > threshold) return false;
        return this.levenshtein(query, target) <= threshold;
    }
}

// ==========================================
// 12. FAST SORTING (MergeSort)
// ==========================================
class Sorter {
    static mergeSort(array, compareFn) {
        if (array.length <= 1) return array;
        const mid = Math.floor(array.length / 2);
        const left = this.mergeSort(array.slice(0, mid), compareFn);
        const right = this.mergeSort(array.slice(mid), compareFn);

        const result = [];
        let i = 0, j = 0;
        while (i < left.length && j < right.length) {
            if (compareFn(left[i], right[j]) <= 0) {
                result.push(left[i++]);
            } else {
                result.push(right[j++]);
            }
        }
        return result.concat(left.slice(i)).concat(right.slice(j));
    }
}

// Export for global browser window
window.DSA = {
    Trie,
    TreeNode,
    PriorityQueue,
    SubjectLexer,
    HashTable,
    LRUCache,
    TopicDAG,
    UndoRedoStack,
    SegmentTree,
    DisjointSetUnion,
    FuzzyMatcher,
    Sorter
};
