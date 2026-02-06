// Questions array
const questions = [
  {
    question: "What is the capital of France?",
    answers: [
      { text: "Paris", correct: true },
      { text: "London", correct: false },
      { text: "Rome", correct: false },
      { text: "Berlin", correct: false },
    ]
  },
  {
    question: "Which language runs in a web browser?",
    answers: [
      { text: "JavaScript", correct: true },
      { text: "Python", correct: false },
      { text: "C++", correct: false },
      { text: "Java", correct: false },
    ]
  },
  {
    question: "Who painted the Mona Lisa?",
    answers: [
      { text: "Leonardo da Vinci", correct: true },
      { text: "Vincent Van Gogh", correct: false },
      { text: "Pablo Picasso", correct: false },
      { text: "Claude Monet", correct: false },
    ]
  }
];

// Select elements
const questionElement = document.getElementById('question');
const answerButtons = document.getElementById('answer-buttons');
const nextButton = document.getElementById('next-btn');
const scoreElement = document.getElementById('score');

let currentQuestionIndex = 0;
let score = 0;

// Start the quiz
function startQuiz() {
  currentQuestionIndex = 0;
  score = 0;
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
    if(answer.correct) {
      button.dataset.correct = answer.correct;
    }
    button.addEventListener('click', selectAnswer);
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
function selectAnswer(e) {
  const selectedButton = e.target;
  const correct = selectedButton.dataset.correct === 'true';

  if(correct) {
    selectedButton.style.backgroundColor = '#2ecc71'; // green
    score++;
  } else {
    selectedButton.style.backgroundColor = '#e74c3c'; // red
  }

  Array.from(answerButtons.children).forEach(button => {
    if(button.dataset.correct === 'true') {
      button.style.backgroundColor = '#2ecc71';
    }
    button.disabled = true;
  });

  nextButton.style.display = 'block';
}

// Go to next question or finish
nextButton.addEventListener('click', () => {
  currentQuestionIndex++;
  if(currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showScore();
  }
});

// Show final score
function showScore() {
  questionElement.innerText = 'Quiz Completed!';
  answerButtons.innerHTML = '';
  nextButton.style.display = 'none';
  scoreElement.innerText = `Your Score: ${score} / ${questions.length}`;
}

// Initialize quiz
startQuiz();
