
/**
 * UI Manipulation Logic
 */

export function showSection(sectionName) {
    // Hide all main sections
    document.querySelector('.welcome-section').style.display = 'none';
    document.querySelector('.role-selection').style.display = 'none';
    document.querySelector('.courses-section').style.display = 'none';

    // Hide quiz and analytics cards using IDs
    const quizCard = document.getElementById('quizCard');
    const analyticsCard = document.getElementById('analyticsCard');

    if (quizCard) quizCard.style.display = 'none';
    if (analyticsCard) analyticsCard.style.display = 'none';

    // Show requested section
    if (sectionName === 'home') {
        document.querySelector('.welcome-section').style.display = 'block';
        document.querySelector('.role-selection').style.display = 'flex';
    } else if (sectionName === 'courses') {
        document.querySelector('.courses-section').style.display = 'block';
    } else if (sectionName === 'quiz-area') {
        if (quizCard) quizCard.style.display = 'block';
        // Analytics hidden during quiz, shown only at end
    }
}

export function renderQuestion(question, index, totalQuestions = 10) {
    document.getElementById('qIndex').textContent = index;
    document.getElementById('qTotal').textContent = totalQuestions;
    document.getElementById('qDifficulty').textContent = question.difficulty;
    document.getElementById('questionText').textContent = question.text;

    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = '';

    Object.entries(question.options).forEach(([key, value]) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.dataset.option = key; // Store the option key for later highlighting
        btn.textContent = `${key}: ${value}`;
        btn.onclick = () => {
            const event = new CustomEvent('answer-submitted', {
                detail: {
                    selectedOption: key,
                    correctAnswer: question.correctAnswer
                }
            });
            document.dispatchEvent(event);
        };
        optionsDiv.appendChild(btn);
    });
}

export function highlightAnswers(selectedOption, correctAnswer) {
    const optionsDiv = document.getElementById('options');
    const buttons = optionsDiv.querySelectorAll('.option-btn');

    buttons.forEach(btn => {
        const option = btn.dataset.option;

        // Disable all buttons after submission
        btn.disabled = true;
        btn.style.cursor = 'not-allowed';

        // Highlight correct answer in green
        if (option === correctAnswer) {
            btn.classList.add('correct');
        }

        // Highlight wrong answer in red (only if user selected it)
        if (option === selectedOption && selectedOption !== correctAnswer) {
            btn.classList.add('incorrect');
        }
    });
}

export function updateAnalytics(session) {
    document.getElementById('answeredCount').textContent = session.totalQuestions;
    document.getElementById('correctCount').textContent = session.score;

    const accuracy = session.totalQuestions > 0
        ? Math.round((session.score / session.totalQuestions) * 100)
        : 0;
    document.getElementById('accuracy').textContent = `${accuracy}%`;

    document.getElementById('avgDifficulty').textContent = session.ability.toFixed(2);
}

export function drawPerformanceChart(session) {
    const ctx = document.getElementById('chart').getContext('2d');

    // Destroy existing chart if any to avoid overlays
    if (window.myQuizChart) {
        window.myQuizChart.destroy();
    }

    const labels = session.history.map((_, i) => `Q${i + 1}`);
    const data = session.history.map(h => h.difficulty === 'easy' ? 1 : h.difficulty === 'medium' ? 2 : 3);
    const pointColors = session.history.map(h => h.isCorrect ? '#06b6d4' : '#ec4899');

    window.myQuizChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Question Difficulty',
                data: data,
                borderColor: '#a855f7',
                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                pointBackgroundColor: pointColors,
                pointBorderColor: '#fff',
                pointRadius: 6,
                pointHoverRadius: 8,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 3.5,
                    ticks: {
                        callback: function (value) {
                            if (value === 1) return 'Easy';
                            if (value === 2) return 'Medium';
                            if (value === 3) return 'Hard';
                            return '';
                        },
                        font: {
                            family: 'Inter'
                        },
                        color: '#94a3b8'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                },
                x: {
                    ticks: {
                        color: '#94a3b8',
                        font: {
                            family: 'Inter'
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const val = context.raw;
                            const diff = val === 1 ? 'Easy' : val === 2 ? 'Medium' : 'Hard';
                            return `Difficulty: ${diff}`;
                        }
                    }
                }
            }
        }
    });
}

export function showResults(session) {
    // Hide quiz card, show analytics
    const quizCard = document.getElementById('quizCard');
    const analyticsCard = document.getElementById('analyticsCard');

    if (quizCard) quizCard.style.display = 'none';
    if (analyticsCard) {
        analyticsCard.style.display = 'block';

        // Update analytics stats
        updateAnalytics(session);

        // Draw performance chart
        drawPerformanceChart(session);

        // Add results summary and back button at the top
        const existingResults = analyticsCard.querySelector('.results-summary');
        if (existingResults) existingResults.remove();

        const resultsSummary = document.createElement('div');
        resultsSummary.className = 'results-summary';
        resultsSummary.innerHTML = `
            <h2 style="text-align: center; margin-bottom: 1rem; background: linear-gradient(135deg, #06b6d4, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">🎉 Quiz Completed!</h2>
            <p style="text-align: center; font-size: 1.125rem; margin-bottom: 1.5rem; color: #cbd5e1;">Great job! Here's your performance summary:</p>
        `;

        analyticsCard.insertBefore(resultsSummary, analyticsCard.firstChild);

        // Add back button at the bottom
        const existingBtn = analyticsCard.querySelector('.back-to-courses-btn');
        if (existingBtn) existingBtn.remove();

        const backBtn = document.createElement('button');
        backBtn.className = 'back-to-courses-btn';
        backBtn.textContent = 'Back to Courses';
        backBtn.onclick = () => showSection('courses');
        backBtn.style.cssText = 'width: 100%; margin-top: 1.5rem;';

        analyticsCard.appendChild(backBtn);
    }
}


