// Questions will be fetched from backend
let questions = [];

// Select elements
const questionElement = document.getElementById('question');
const answerButtons = document.getElementById('answer-buttons');
const nextButton = document.getElementById('next-btn');
const scoreElement = document.getElementById('score');

let currentQuestionIndex = 0;
let score = 0;
let userAnswers = [];

// Fetch questions from backend
async function fetchQuestions() {
  try {
    const response = await fetch('http://localhost:3000/api/questions');
    if (!response.ok) {
      throw new Error('Failed to fetch questions');
    }
    questions = await response.json();
    return true;
  } catch (error) {
    console.error('Error fetching questions:', error);
    questionElement.innerText = 'Error loading questions. Please make sure the backend server is running.';
    return false;
  }
}

// Start the quiz
async function startQuiz() {
  const questionsLoaded = await fetchQuestions();
  if (!questionsLoaded) return;
  
  currentQuestionIndex = 0;
  score = 0;
  userAnswers = [];
  scoreElement.innerText = '';
  nextButton.style.display = 'none';
  showQuestion();
}

// Show question and answers
function showQuestion() {
  resetState();
  const currentQuestion = questions[currentQuestionIndex];
  questionElement.innerText = currentQuestion.question;

  currentQuestion.answers.forEach(answer => {
    const button = document.createElement('button');
    button.innerText = answer.text;
    button.classList.add('btn');
    button.addEventListener('click', () => selectAnswer(answer.text));
    answerButtons.appendChild(button);
  });
}

// Reset previous question state
function resetState() {
  nextButton.style.display = 'none';
  while(answerButtons.firstChild) {
    answerButtons.removeChild(answerButtons.firstChild);
  }
}

// Handle answer selection
function selectAnswer(selectedAnswerText) {
  const currentQuestion = questions[currentQuestionIndex];
  
  // Store user's answer
  userAnswers.push({
    questionId: currentQuestion.id,
    selectedAnswer: selectedAnswerText
  });

  // Disable all buttons and show selection
  Array.from(answerButtons.children).forEach(button => {
    button.disabled = true;
    if (button.innerText === selectedAnswerText) {
      button.style.backgroundColor = '#3498db'; // blue for selected
    }
  });

  nextButton.style.display = 'block';
}

// Go to next question or finish
nextButton.addEventListener('click', () => {
  currentQuestionIndex++;
  if(currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    submitAnswers();
  }
});

// Submit answers to backend for validation
async function submitAnswers() {
  try {
    const response = await fetch('http://localhost:3000/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ answers: userAnswers })
    });
    
    if (!response.ok) {
      throw new Error('Failed to submit answers');
    }
    
    const result = await response.json();
    showScore(result);
  } catch (error) {
    console.error('Error submitting answers:', error);
    questionElement.innerText = 'Error submitting answers. Please try again.';
  }
}

// Show final score
function showScore(result) {
  questionElement.innerText = 'Quiz Completed!';
  answerButtons.innerHTML = '';
  nextButton.style.display = 'none';
  scoreElement.innerText = `Your Score: ${result.score} / ${result.total}`;
  
  // Show detailed results
  if (result.results) {
    const resultsDiv = document.createElement('div');
    resultsDiv.style.marginTop = '20px';
    resultsDiv.innerHTML = '<h3>Results:</h3>';
    
    result.results.forEach((result, index) => {
      const resultItem = document.createElement('p');
      resultItem.textContent = `Question ${index + 1}: ${result.correct ? '✓ Correct' : '✗ Incorrect'}`;
      if (!result.correct) {
        resultItem.textContent += ` (Correct answer: ${result.correctAnswer})`;
      }
      resultsDiv.appendChild(resultItem);
    });
    
    answerButtons.appendChild(resultsDiv);
  }
}

// Initialize quiz
startQuiz();
