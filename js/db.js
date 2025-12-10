
const DB_NAME = 'quiz-engine';
const DB_VERSION = 4;

/**
 * Open (or create) the IndexedDB database for the quiz app.
 * Returns a Promise that resolves to the db instance.
 */
export function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;

            // Questions Store
            // Questions Store
            // Version 2: Force re-creation to ensure all questions are loaded correctly
            if (db.objectStoreNames.contains('questions')) {
                db.deleteObjectStore('questions');
            }

            const questionsStore = db.createObjectStore('questions', { keyPath: 'id' });
            questionsStore.createIndex('bySubject', 'subject');
            questionsStore.createIndex('byDifficulty', 'difficulty');

            // Attempts Store
            if (!db.objectStoreNames.contains('attempts')) {
                const attemptsStore = db.createObjectStore('attempts', { keyPath: 'id' });
                attemptsStore.createIndex('bySessionId', 'sessionId');
            }

            // Sessions Store
            if (!db.objectStoreNames.contains('sessions')) {
                const sessionsStore = db.createObjectStore('sessions', { keyPath: 'id' });
                sessionsStore.createIndex('byStartTime', 'startedAt');
            }
        };

        request.onerror = () => {
            console.error('IndexedDB open error', request.error);
            reject(request.error);
        };

        request.onsuccess = () => {
            resolve(request.result);
        };
    });
}

/**
 * Add a question to the database.
 */
export async function addQuestion(question) {
    const db = await openDB();
    const tx = db.transaction('questions', 'readwrite');
    const store = tx.objectStore('questions');
    await store.put(question);
    return tx.complete;
}

/**
 * Get all questions for a specific subject.
 */
export async function getQuestionsBySubject(subject) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('questions', 'readonly');
        const store = tx.objectStore('questions');
        const index = store.index('bySubject');
        const request = index.getAll(subject);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Save a user attempt (answer to a question).
 */
export async function saveAttempt(attempt) {
    const db = await openDB();
    const tx = db.transaction('attempts', 'readwrite');
    const store = tx.objectStore('attempts');
    await store.put(attempt);
    return tx.complete;
}

/**
 * Save or update a quiz session.
 */
export async function saveSession(session) {
    const db = await openDB();
    const tx = db.transaction('sessions', 'readwrite');
    const store = tx.objectStore('sessions');
    await store.put(session);
    return tx.complete;
}

/**
 * Get all past attempts.
 */
export async function getAllAttempts() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('attempts', 'readonly');
        const store = tx.objectStore('attempts');
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Get all questions from database
 */
export async function getAllQuestions() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('questions', 'readonly');
        const store = tx.objectStore('questions');
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Delete a question by ID
 */
export async function deleteQuestion(questionId) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('questions', 'readwrite');
        const store = tx.objectStore('questions');
        const request = store.delete(questionId);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}


