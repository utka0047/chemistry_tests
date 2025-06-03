// Элементы DOM
const loadingScreen = document.getElementById('loadingScreen');
const welcomeScreen = document.getElementById('welcomeScreen');
const quizScreen = document.getElementById('quizScreen');
const resultsScreen = document.getElementById('resultsScreen');
const startBtn = document.getElementById('startBtn');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const restartBtn = document.getElementById('restartBtn');
const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const progressFill = document.getElementById('progressFill');
const currentQuestion = document.getElementById('currentQuestion');
const totalQuestions = document.getElementById('totalQuestions');
const scorePercent = document.getElementById('scorePercent');
const finalGrade = document.getElementById('finalGrade');
const gradeComment = document.getElementById('gradeComment');
const explanationContent = document.getElementById('explanationContent');
const scoreCircle = document.getElementById('scoreCircle');
const themeToggle = document.getElementById('themeToggle');
const grade2 = document.getElementById('grade2');
const grade3 = document.getElementById('grade3');
const grade4 = document.getElementById('grade4');
const grade5 = document.getElementById('grade5');

// Переменные состояния игры
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedOption = null;
let userAnswers = [];

// Инициализация темы
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
}

// Переключение темы
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
});

// Загрузка вопросов из JSON
async function loadQuestions() {
    try {
        const response = await fetch('questions.json');
        if (!response.ok) {
            throw new Error('Не удалось загрузить вопросы');
        }
        questions = await response.json();
        
        // Перемешиваем вопросы для защиты от фарма
        shuffleQuestions();
        
        // Обновляем счетчики вопросов
        totalQuestions.textContent = questions.length;
        
        // Показываем приветственный экран
        loadingScreen.classList.remove('active');
        welcomeScreen.classList.add('active');
    } catch (error) {
        console.error('Ошибка загрузки вопросов:', error);
        loadingScreen.innerHTML = `
            <div style="color: var(--error);">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 20px;"></i>
                <h3>Ошибка загрузки вопросов</h3>
                <p>Пожалуйста, проверьте наличие файла questions.json</p>
                <button class="btn" onclick="location.reload()">Попробовать снова</button>
            </div>
        `;
    }
}

// Перемешивание вопросов
function shuffleQuestions() {
    for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
    }
}

// Начало игры
startBtn.addEventListener('click', startGame);

function startGame() {
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = [];
    updateProgress();
    showQuestion();
    welcomeScreen.classList.remove('active');
    quizScreen.classList.add('active');
}

// Отображение вопроса
function showQuestion() {
    const question = questions[currentQuestionIndex];
    questionText.textContent = question.question;
    
    optionsContainer.innerHTML = '';
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.classList.add('option');
        optionElement.innerHTML = `
            <div class="option-label"></div>
            <div class="option-text">${option}</div>
        `;
        optionElement.addEventListener('click', () => selectOption(optionElement, index));
        optionsContainer.appendChild(optionElement);
    });
    
    currentQuestion.textContent = currentQuestionIndex + 1;
    prevBtn.classList.toggle('hidden', currentQuestionIndex === 0);
    
    // Восстановление предыдущего выбора, если есть
    if (userAnswers[currentQuestionIndex] !== undefined) {
        const options = optionsContainer.querySelectorAll('.option');
        options[userAnswers[currentQuestionIndex]].classList.add('selected');
        selectedOption = userAnswers[currentQuestionIndex];
    }
}

// Выбор варианта ответа
function selectOption(optionElement, index) {
    const options = optionsContainer.querySelectorAll('.option');
    options.forEach(opt => opt.classList.remove('selected'));
    
    optionElement.classList.add('selected');
    selectedOption = index;
    userAnswers[currentQuestionIndex] = index;
}

// Переход к следующему вопросу
nextBtn.addEventListener('click', () => {
    if (selectedOption === null) {
        alert('Пожалуйста, выберите ответ!');
        return;
    }
    
    // Переход к следующему вопросу или результатам
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        selectedOption = null;
        updateProgress();
        showQuestion();
    } else {
        calculateResults();
    }
});

// Переход к предыдущему вопросу
prevBtn.addEventListener('click', () => {
    currentQuestionIndex--;
    updateProgress();
    showQuestion();
});

// Обновление прогресс-бара
function updateProgress() {
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    progressFill.style.width = `${progress}%`;
}

// Расчет результатов
function calculateResults() {
    score = 0;
    
    // Проверка всех ответов
    questions.forEach((question, index) => {
        if (userAnswers[index] === question.answer) {
            score++;
        }
    });
    
    showResults();
}

// Показ результатов
function showResults() {
    // Вычисление процента и оценки
    const percentage = Math.round((score / questions.length) * 100);
    let grade, comment;
    
    if (percentage <= 50) {
        grade = '2';
        comment = 'Неудовлетворительный результат. Рекомендуем внимательно изучить тему химических связей.';
    } else if (percentage <= 74) {
        grade = '3';
        comment = 'Удовлетворительный результат. Есть что улучшить - повторите основные понятия.';
    } else if (percentage <= 89) {
        grade = '4';
        comment = 'Хороший результат! Вы хорошо понимаете тему, но есть что повторить.';
    } else {
        grade = '5';
        comment = 'Отличный результат! Вы прекрасно разбираетесь в типах химических связей.';
    }
    
    // Обновление UI
    scorePercent.textContent = `${percentage}%`;
    finalGrade.textContent = grade;
    gradeComment.textContent = comment;
    
    // Анимация круга с результатом
    scoreCircle.style.background = `conic-gradient(var(--college-color) ${percentage}%, var(--bg-secondary) ${percentage}% 100%)`;
    
    // Подсветка текущей оценки
    grade2.classList.toggle('active', grade === '2');
    grade3.classList.toggle('active', grade === '3');
    grade4.classList.toggle('active', grade === '4');
    grade5.classList.toggle('active', grade === '5');
    
    // Генерация объяснений
    generateExplanations();
    
    // Переход на экран результатов
    quizScreen.classList.remove('active');
    resultsScreen.classList.add('active');
}

// Генерация объяснений
function generateExplanations() {
    explanationContent.innerHTML = '';
    
    questions.forEach((question, index) => {
        const userAnswerIndex = userAnswers[index];
        const isCorrect = userAnswerIndex === question.answer;
        
        const explanationItem = document.createElement('div');
        explanationItem.classList.add('explanation-item');
        
        explanationItem.innerHTML = `
            <p><strong>Вопрос ${index + 1}:</strong> ${question.question}</p>
            <p><strong>Ваш ответ:</strong> <span class="${isCorrect ? 'correct' : 'incorrect'}">${question.options[userAnswerIndex]}</span></p>
            ${!isCorrect ? `<p><strong>Правильный ответ:</strong> <span class="right-answer">${question.options[question.answer]}</span></p>` : ''}
            <p><strong>Объяснение:</strong> ${question.explanation}</p>
            <div class="answer-status">${isCorrect ? '<span class="correct-icon">✅ Правильно</span>' : '<span class="incorrect-icon">❌ Неправильно</span>'}</div>
        `;
        
        explanationContent.appendChild(explanationItem);
    });
}

// Перезапуск игры
restartBtn.addEventListener('click', () => {
    resultsScreen.classList.remove('active');
    welcomeScreen.classList.add('active');
});

// Инициализация при загрузке
window.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadQuestions();
});