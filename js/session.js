import { getQuestionsBySubject, getAllAttempts, saveAttempt, saveSession } from './db.js';
import { selectNextQuestion, calculateNewAbility } from './engine.js';
import { showSection, renderQuestion, updateAnalytics, showResults, highlightAnswers } from './ui.js';

let allQuestions = [];
let currentSession = null;
let currentSessionAnsweredIds = new Set();
let pastAnsweredIds = new Set();

export async function startQuiz(subject) {
    try {
        allQuestions = await getQuestionsBySubject(subject);
        if (allQuestions.length === 0) {
            alert('No questions found for this subject.');
            return;
        }

        currentSession = {
            id: Date.now().toString(),
            subject: subject,
            startedAt: new Date().toISOString(),
            ability: 1.0, // Always start at Easy (1.0) for every subject, every time
            score: 0,
            totalQuestions: 0,
            history: [],
            correctStreakAtCurrentLevel: 0, // Track consecutive correct answers at current difficulty
            thresholdToNextLevel: Math.floor(Math.random() * 2) + 2 // Random threshold: 2 or 3
        };

        // Fetch past attempts to filter out old questions if possible
        const allAttempts = await getAllAttempts();
        pastAnsweredIds = new Set(allAttempts.map(a => a.questionId));

        currentSessionAnsweredIds.clear();

        showSection('quiz-area');
        nextQuestion();
        updateAnalytics(currentSession);

    } catch (err) {
        console.error('Failed to start quiz:', err);
        alert('Error starting quiz.');
    }
}

const MAX_QUESTIONS = 10; // Maximum questions per quiz session

export async function nextQuestion() {
    if (!currentSession) return;

    // Check if we should end (e.g., max 10 questions)
    if (currentSession.totalQuestions >= MAX_QUESTIONS) {
        endQuiz();
        return;
    }

    const question = selectNextQuestion(allQuestions, currentSessionAnsweredIds, currentSession.ability, pastAnsweredIds);

    if (!question) {
        // No more suitable questions
        endQuiz();
        return;
    }

    currentSession.currentQuestion = question;
    renderQuestion(question, currentSession.totalQuestions + 1, MAX_QUESTIONS);
}

export async function submitAnswer(selectedOption) {
    if (!currentSession || !currentSession.currentQuestion) return;

    const question = currentSession.currentQuestion;
    const isCorrect = selectedOption === question.correctAnswer;

    // Update stats
    currentSession.totalQuestions++;
    if (isCorrect) currentSession.score++;

    // Update ability using threshold-based progression
    const oldAbility = currentSession.ability;

    if (isCorrect) {
        // Increment correct streak at current level
        currentSession.correctStreakAtCurrentLevel++;

        // Check if threshold is met to advance difficulty
        if (currentSession.correctStreakAtCurrentLevel >= currentSession.thresholdToNextLevel) {
            // Increase difficulty
            currentSession.ability = calculateNewAbility(oldAbility, true, question.difficulty);
            // Reset streak and set new random threshold for next level
            currentSession.correctStreakAtCurrentLevel = 0;
            currentSession.thresholdToNextLevel = Math.floor(Math.random() * 2) + 2; // 2 or 3
        }
        // else: keep ability the same (don't increase yet)
    } else {
        // Incorrect or skipped: reset streak but keep difficulty the same
        currentSession.correctStreakAtCurrentLevel = 0;
        // Ability stays the same (no decrease)
    }

    // Record attempt
    const attempt = {
        id: Date.now().toString(),
        sessionId: currentSession.id,
        questionId: question.id,
        selectedOption,
        isCorrect,
        difficulty: question.difficulty,
        timestamp: new Date().toISOString(),
        abilityAfter: currentSession.ability
    };

    currentSessionAnsweredIds.add(question.id);
    currentSession.history.push(attempt);

    // Save asynchronously
    saveAttempt(attempt);

    // Update UI
    updateAnalytics(currentSession);

    // Highlight correct and incorrect answers
    highlightAnswers(selectedOption, question.correctAnswer);

    // Wait 2 seconds before moving to next question
    setTimeout(() => {
        nextQuestion();
    }, 2000);
}

export async function endQuiz(redirect = false) {
    if (!currentSession) return;

    currentSession.endedAt = new Date().toISOString();
    await saveSession(currentSession);

    if (redirect) {
        showSection('courses');
    } else {
        showResults(currentSession);
    }
    currentSession = null;
}


