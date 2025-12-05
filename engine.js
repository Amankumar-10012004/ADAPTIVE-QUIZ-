
/**
 * Adaptive Quiz Engine Logic
 */

const DIFFICULTY_MAP = {
    'easy': 1,
    'medium': 2,
    'hard': 3
};

/**
 * Selects the next question based on current ability and available questions.
 * @param {Array} candidateQuestions - List of available questions for the subject.
 * @param {Set} currentSessionAnsweredIds - Set of IDs of questions answered in THIS session.
 * @param {Number} currentAbility - Current estimated ability level (1-3 scale).
 * @param {Set} pastAnsweredIds - Set of IDs of questions answered in PAST sessions.
 * @returns {Object|null} - The selected question or null if no suitable question found.
 */
export function selectNextQuestion(candidateQuestions, currentSessionAnsweredIds, currentAbility, pastAnsweredIds = new Set()) {
    // 1. Filter out questions answered in the CURRENT session (absolute rule)
    const available = candidateQuestions.filter(q => !currentSessionAnsweredIds.has(q.id));

    if (available.length === 0) return null;

    // 2. Separate into "New" (never answered) and "Old" (answered in past sessions)
    const newQuestions = available.filter(q => !pastAnsweredIds.has(q.id));
    const oldQuestions = available.filter(q => pastAnsweredIds.has(q.id));

    // 3. Prefer New questions if available
    let pool = newQuestions.length > 0 ? newQuestions : oldQuestions;

    // 4. Sort by closeness to ability
    pool.sort((a, b) => {
        const diffA = Math.abs(DIFFICULTY_MAP[a.difficulty] - currentAbility);
        const diffB = Math.abs(DIFFICULTY_MAP[b.difficulty] - currentAbility);

        if (diffA !== diffB) {
            return diffA - diffB; // Closest match first
        }

        // If distance is same (e.g. ability 2, options 1 and 3), prefer LOWER difficulty
        return DIFFICULTY_MAP[a.difficulty] - DIFFICULTY_MAP[b.difficulty];
    });

    // 5. Shuffle candidates with similar suitability to avoid deterministic order
    // Get the best difficulty difference
    const bestDiff = Math.abs(DIFFICULTY_MAP[pool[0].difficulty] - currentAbility);

    // Filter pool to keep only those with similar difficulty (e.g., within 0.5 range or just exact match?)
    // Let's keep top 5 or all within a small range to shuffle.
    // Simple approach: Take top 5 best matches and shuffle them.
    const topCandidates = pool.slice(0, 5);

    // Random selection from top candidates
    const randomIndex = Math.floor(Math.random() * topCandidates.length);
    return topCandidates[randomIndex];
}

/**
 * Calculates the new ability level based on the answer.
 * @param {Number} currentAbility - Current ability level.
 * @param {Boolean} isCorrect - Whether the answer was correct.
 * @param {String} questionDifficulty - Difficulty of the question ('easy', 'medium', 'hard').
 * @returns {Number} - New ability level.
 */
export function calculateNewAbility(currentAbility, isCorrect, questionDifficulty) {
    const qDiffValue = DIFFICULTY_MAP[questionDifficulty];
    const step = 0.5; // Adjustment step for ability changes

    let newAbility = currentAbility;

    if (isCorrect) {
        // If correct, increase ability (move towards harder questions)
        newAbility += step;
    } else {
        // If incorrect, decrease ability (move towards easier questions)
        newAbility -= step;
    }

    // Clamp ability between 1.0 (easy) and 3.0 (hard)
    // Start at 1.0 means we always begin with easy questions
    return Math.max(1.0, Math.min(3.0, newAbility));
}

