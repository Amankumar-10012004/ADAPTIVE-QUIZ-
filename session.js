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
            history: []
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

export async function nextQuestion() {
    if (!currentSession) return;

    // Check if we should end (e.g., max 10 questions)
    if (currentSession.totalQuestions >= 10) {
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
    renderQuestion(question, currentSession.totalQuestions + 1);
}

export async function submitAnswer(selectedOption) {
    if (!currentSession || !currentSession.currentQuestion) return;

    const question = currentSession.currentQuestion;
    const isCorrect = selectedOption === question.correctAnswer;

    // Update stats
    currentSession.totalQuestions++;
    if (isCorrect) currentSession.score++;

    // Update ability
    const oldAbility = currentSession.ability;
    // Always calculate new ability (even if skipped/null) to allow downgrade
    currentSession.ability = calculateNewAbility(oldAbility, isCorrect, question.difficulty);

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
