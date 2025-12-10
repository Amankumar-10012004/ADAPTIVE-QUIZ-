
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
 * Every subject starts with easy difficulty. If current difficulty has no questions,
 * automatically switches to next available difficulty.
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

    // 4. Determine target difficulty based on current ability
    // 1.0 - 1.4 = easy, 1.5 - 2.4 = medium, 2.5 - 3.0 = hard
    let targetDifficulty;
    if (currentAbility < 1.5) {
        targetDifficulty = 'easy';
    } else if (currentAbility < 2.5) {
        targetDifficulty = 'medium';
    } else {
        targetDifficulty = 'hard';
    }

    // 5. Try to get questions at target difficulty
    let targetPool = pool.filter(q => q.difficulty === targetDifficulty);

    // 6. If current difficulty is empty, auto-switch to next available difficulty
    // Priority: try next higher difficulty first, then lower
    if (targetPool.length === 0) {
        const difficultyOrder = ['easy', 'medium', 'hard'];
        const currentIndex = difficultyOrder.indexOf(targetDifficulty);

        // Try higher difficulties first (progression)
        for (let i = currentIndex + 1; i < difficultyOrder.length; i++) {
            targetPool = pool.filter(q => q.difficulty === difficultyOrder[i]);
            if (targetPool.length > 0) {
                console.log(`No ${targetDifficulty} questions available, switching to ${difficultyOrder[i]}`);
                break;
            }
        }

        // If still empty, try lower difficulties
        if (targetPool.length === 0) {
            for (let i = currentIndex - 1; i >= 0; i--) {
                targetPool = pool.filter(q => q.difficulty === difficultyOrder[i]);
                if (targetPool.length > 0) {
                    console.log(`No ${targetDifficulty} questions available, switching to ${difficultyOrder[i]}`);
                    break;
                }
            }
        }

        // Final fallback: use any available question
        if (targetPool.length === 0) {
            targetPool = pool;
        }
    }

    // 7. Random selection from available questions
    const randomIndex = Math.floor(Math.random() * Math.min(5, targetPool.length));
    return targetPool[randomIndex];
}

/**
 * Calculates the new ability level for threshold-based progression.
 * NOTE: This quiz uses threshold-based difficulty progression:
 * - Difficulty increases ONLY when a threshold (2-3) of correct answers is reached
 * - Incorrect/skipped answers keep difficulty the same (no decrease)
 * - This function is only called when threshold is met (from session.js)
 * @param {Number} currentAbility - Current ability level.
 * @param {Boolean} isCorrect - Whether the answer was correct (should be true when called).
 * @param {String} questionDifficulty - Difficulty of the question ('easy', 'medium', 'hard').
 * @returns {Number} - New ability level.
 */
export function calculateNewAbility(currentAbility, isCorrect, questionDifficulty) {
    const step = 0.5; // Adjustment step for ability changes

    let newAbility = currentAbility;

    if (isCorrect) {
        // Increase ability when threshold is met
        newAbility += step;
    }
    // Note: This function should only be called with isCorrect=true from session.js

    // Clamp ability between 1.0 (easy) and 3.0 (hard)
    // 1.0 = easy, 1.5-2.4 = medium, 2.5-3.0 = hard
    return Math.max(1.0, Math.min(3.0, newAbility));
}



