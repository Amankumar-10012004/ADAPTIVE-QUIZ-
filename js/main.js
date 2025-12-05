
import { openDB, addQuestion, getQuestionsBySubject, getAllQuestions, deleteQuestion } from './db.js';
import { startQuiz, submitAnswer, endQuiz } from './session.js';
import { showSection } from './ui.js';
import { questionBank } from './questionBank.js';

// Seed Data
// Using imported questionBank directly

async function seedData() {
    const db = await openDB();
    const tx = db.transaction('questions', 'readonly');
    const store = tx.objectStore('questions');
    const countRequest = store.count();

    countRequest.onsuccess = async () => {
        // If DB is empty OR has fewer questions than the bank (indicating partial/old data), re-seed
        if (countRequest.result === 0 || countRequest.result < questionBank.length) {
            console.log('Seeding/Updating database...');
            for (const q of questionBank) {
                await addQuestion(q);
            }
            console.log('Database seeded/updated with ' + questionBank.length + ' questions.');
        }
    };
}

// renderQuestionList removed as UI element is hidden

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    console.log('App Initializing...');
    await seedData();

    // Course Selection
    const studentCard = document.getElementById('studentCard');
    if (studentCard) {
        studentCard.addEventListener('click', () => {
            showSection('courses');
        });
    }

    const backToHomeBtn = document.getElementById('backToHome');
    if (backToHomeBtn) {
        backToHomeBtn.addEventListener('click', () => {
            showSection('home');
        });
    }

    document.querySelectorAll('.course-card').forEach(card => {
        card.addEventListener('click', () => {
            const subject = card.querySelector('h3').textContent;
            console.log('Starting quiz for:', subject);
            startQuiz(subject);
        });
    });

    // Answer Submission (Custom Event from UI)
    document.addEventListener('answer-submitted', (e) => {
        submitAnswer(e.detail.selectedOption);
    });

    // Skip Button
    const skipBtn = document.getElementById('skipBtn');
    if (skipBtn) {
        skipBtn.addEventListener('click', () => {
            submitAnswer(null); // Pass null to indicate skipped
        });
    }

    // Finish Test Button
    const finishBtn = document.getElementById('finishBtn');
    if (finishBtn) {
        finishBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to finish the test?')) {
                endQuiz();
            }
        });
    }

    // Teacher: Add Question
    const addBtn = document.getElementById('addQ');
    const subjectSelect = document.getElementById('subject');

    // subjectSelect listener removed as list display is hidden

    if (addBtn) {
        addBtn.addEventListener('click', async () => {
            const text = document.getElementById('qTextIn').value;
            const optA = document.getElementById('optA').value;
            const optB = document.getElementById('optB').value;
            const optC = document.getElementById('optC').value;
            const optD = document.getElementById('optD').value;
            const correct = document.getElementById('correct').value.toUpperCase();
            const difficulty = document.getElementById('difficulty').value;
            const subject = document.getElementById('subject').value;

            if (!text || !optA || !optB || !optC || !optD || !correct) {
                alert('Please fill all fields');
                return;
            }

            const question = {
                id: Date.now().toString(),
                text,
                options: { A: optA, B: optB, C: optC, D: optD },
                correctAnswer: correct,
                difficulty,
                subject: subject
            };

            await addQuestion(question);
            alert('Question added!');

            // Clear inputs
            document.getElementById('qTextIn').value = '';
            document.getElementById('optA').value = '';
            document.getElementById('optB').value = '';
            document.getElementById('optC').value = '';
            document.getElementById('optD').value = '';
            document.getElementById('correct').value = '';

            // Refresh list - removed
            // renderQuestionList(subject);
        });
    }

    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to remove the last added question?')) {
                try {
                    const allQuestions = await getAllQuestions();
                    if (allQuestions.length === 0) {
                        alert('No questions to remove.');
                        return;
                    }

                    // Sort by ID (timestamp) descending to find the last added
                    // IDs are strings of timestamps, so string comparison works for recent dates, 
                    // but better to parse if needed. Since they are Date.now().toString(), 
                    // lexicographical sort usually works for same length, but let's be safe.
                    allQuestions.sort((a, b) => {
                        if (a.id > b.id) return -1;
                        if (a.id < b.id) return 1;
                        return 0;
                    });

                    const lastQuestion = allQuestions[0];
                    await deleteQuestion(lastQuestion.id);
                    alert('Last question removed!');

                    // Refresh list - removed
                    // const subject = document.getElementById('subject').value;
                    // renderQuestionList(subject);
                } catch (error) {
                    console.error('Error removing question:', error);
                    alert('Failed to remove question.');
                }
            }
        });
    }

    // Initial View
    showSection('home');

    // Initial render of question list - removed
    // if (subjectSelect) {
    //    renderQuestionList(subjectSelect.value);
    // }
});
