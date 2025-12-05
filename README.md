# QUIZERA.an 📚

**Adaptive Quiz Engine** - An intelligent quiz platform that dynamically adjusts question difficulty based on your performance.

![QUIZERA Banner](images/banner.png)

## 🌟 Features

### Adaptive Learning Algorithm

- **Smart Question Selection**: Automatically adjusts question difficulty based on your responses
- **Ability Tracking**: Tracks your current ability level (1.0 - 3.0 scale) and adapts in real-time
- **Session Memory**: Prevents duplicate questions within the same session
- **Progressive Learning**: Gradually increases or decreases difficulty to match your skill level

### Dual Modes

- 🎓 **Student Mode**: Take quizzes and track your performance
- 👨‍🏫 **Teacher Mode**: Create and manage quiz questions

### Multiple Subjects

- 📐 **Mathematics**: Algebra, Geometry, and Calculus
- 🔬 **Science**: Physics, Chemistry, and Biology
- 📖 **English**: Grammar, Vocabulary, and Reading Comprehension
- 💻 **Programming**: Python, JavaScript, and C++

### Real-Time Analytics

- Track answered questions
- Monitor accuracy percentage
- View average difficulty progression
- Interactive charts powered by Chart.js

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- No server installation required - runs entirely in the browser!

### Installation

1. **Clone or Download** the repository:

   ```bash
   git clone <your-repo-url>
   cd HYT
   ```

2. **Open the Application**:

   - Simply open `index.html` in your web browser
   - Or use a local server for better performance:

     ```bash
     # Using Python
     python -m http.server 8000

     # Using Node.js
     npx http-server
     ```

3. **Access the App**:
   - Open your browser and navigate to the file or local server URL

## 📖 How to Use

### For Students

1. **Select Student Mode**: Click on the "Student" card on the home page
2. **Choose a Subject**: Select from Mathematics, Science, English, or Programming
3. **Start Quiz**: The engine will begin with questions matched to your ability
4. **Answer Questions**:
   - Select your answer from the multiple-choice options
   - The system adapts based on your performance
   - Skip questions if needed
5. **View Analytics**: Check your real-time performance metrics at the bottom
6. **Finish**: Click "Finish Test" to complete and review your results

### For Teachers

1. **Select Teacher Mode**: Click on the "Teacher" card on the home page
2. **Add Questions**:
   - Enter the question text
   - Provide four options (A, B, C, D)
   - Specify the correct answer
   - Select subject and difficulty level
3. **Manage Questions**: Use "Remove Last Question" to delete recently added questions
4. **Questions are Auto-Saved**: All questions are stored in browser local storage

## 🏗️ Project Structure

```
HYT/
│
├── index.html              # Main HTML file
├── README.md              # This file
│
├── css/
│   └── styles.css         # Application styles
│
├── js/
│   ├── main.js           # Main application entry point
│   ├── engine.js         # Adaptive quiz engine logic
│   ├── ui.js             # UI rendering and interactions
│   ├── db.js             # Local storage database handler
│   ├── session.js        # Session management
│   └── questionBank.js   # Default question repository
│
└── images/
    ├── teacher_icon.png
    ├── student_icon.png
    ├── math_icon.jpg
    ├── science_icon.jpg
    ├── english_icon.jpg
    └── programming_icon.jpg
```

## 🧠 How the Adaptive Engine Works

### Ability Calculation

- Initial ability starts at **2.0** (medium difficulty)
- **Correct answer**: Ability increases by 0.5
- **Incorrect answer**: Ability decreases by 0.5
- Ability is clamped between 1.0 (easy) and 3.0 (hard)

### Question Selection Algorithm

1. Filters out questions already answered in current session
2. Prioritizes new questions over previously answered ones
3. Selects questions closest to your current ability level
4. Randomly picks from top 5 best-matched questions to avoid predictability

### Difficulty Levels

- **Easy**: Level 1.0
- **Medium**: Level 2.0
- **Hard**: Level 3.0

## 💾 Data Storage

All data is stored locally in your browser using **localStorage**:

- Custom questions added by teachers
- Session history (previously answered questions)
- No server or database required

## 🛠️ Technologies Used

- **HTML5**: Semantic structure
- **CSS3**: Modern styling with custom properties and animations
- **Vanilla JavaScript (ES6+)**: Modular architecture
- **Chart.js**: Performance visualization
- **Google Fonts**: Inter and Poppins font families

## 🎨 Design Features

- Clean, modern interface
- Responsive design for all screen sizes
- Smooth animations and transitions
- Color-coded feedback (green for correct, red for incorrect)
- Accessible UI with proper ARIA labels

## 📊 Analytics Metrics

The application tracks:

- **Answered**: Total questions answered
- **Correct**: Number of correct answers
- **Accuracy**: Percentage of correct answers
- **Avg Difficulty**: Average difficulty level of questions you've faced

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Chart.js for the analytics visualization
- Google Fonts for typography
- All contributors and users of QUIZERA

## 📞 Support

For questions or support, please open an issue in the repository.

---

**Made with ❤️ for adaptive learning**
