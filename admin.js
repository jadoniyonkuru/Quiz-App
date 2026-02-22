let questions = [];
let editingQuestionId = null;

// DOM elements
const questionForm = document.getElementById('questionForm');
const questionText = document.getElementById('questionText');
const questionId = document.getElementById('questionId');
const formTitle = document.getElementById('formTitle');
const questionsList = document.getElementById('questionsList');
const messageDiv = document.getElementById('message');

// Fetch all questions
async function fetchQuestions() {
  try {
    const response = await fetch('http://localhost:3000/api/admin/questions');
    if (!response.ok) throw new Error('Failed to fetch questions');
    questions = await response.json();
    displayQuestions();
  } catch (error) {
    showMessage('Error loading questions: ' + error.message, 'error');
  }
}

// Display all questions
function displayQuestions() {
  questionsList.innerHTML = '';
  
  questions.sort((a, b) => a.id - b.id).forEach(question => {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-item';
    
    const answersHtml = question.answers.map((answer, index) => 
      `<div class="answer ${answer.correct ? 'correct' : ''}">
        ${answer.text} ${answer.correct ? '(✓ Correct)' : ''}
      </div>`
    ).join('');
    
    questionDiv.innerHTML = `
      <h3>Question ${question.id}: ${question.question}</h3>
      <div class="answers">${answersHtml}</div>
      <button class="btn btn-warning" onclick="editQuestion(${question.id})">Edit</button>
      <button class="btn btn-danger" onclick="deleteQuestion(${question.id})">Delete</button>
    `;
    
    questionsList.appendChild(questionDiv);
  });
}

// Show message
function showMessage(text, type) {
  messageDiv.innerHTML = `<div class="${type}-message">${text}</div>`;
  setTimeout(() => {
    messageDiv.innerHTML = '';
  }, 3000);
}

// Handle form submission
questionForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const answerTexts = Array.from(document.querySelectorAll('.answer-text')).map(input => input.value);
  const correctAnswerIndex = parseInt(document.querySelector('input[name="correctAnswer"]:checked').value);
  
  const answers = answerTexts.map((text, index) => ({
    text,
    correct: index === correctAnswerIndex
  }));
  
  const questionData = {
    question: questionText.value,
    answers
  };
  
  try {
    let response;
    if (editingQuestionId) {
      // Update existing question
      response = await fetch(`http://localhost:3000/api/admin/questions/${editingQuestionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData)
      });
      showMessage('Question updated successfully!', 'success');
    } else {
      // Add new question
      response = await fetch('http://localhost:3000/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData)
      });
      showMessage('Question added successfully!', 'success');
    }
    
    if (!response.ok) throw new Error('Failed to save question');
    
    resetForm();
    await fetchQuestions();
  } catch (error) {
    showMessage('Error saving question: ' + error.message, 'error');
  }
});

// Edit question
async function editQuestion(id) {
  const question = questions.find(q => q.id === id);
  if (!question) return;
  
  editingQuestionId = id;
  formTitle.textContent = 'Edit Question';
  questionId.value = id;
  questionText.value = question.question;
  
  // Fill answer fields
  const answerInputs = document.querySelectorAll('.answer-text');
  const correctAnswerRadios = document.querySelectorAll('input[name="correctAnswer"]');
  
  question.answers.forEach((answer, index) => {
    answerInputs[index].value = answer.text;
    if (answer.correct) {
      correctAnswerRadios[index].checked = true;
    }
  });
  
  // Scroll to form
  document.querySelector('.question-form').scrollIntoView({ behavior: 'smooth' });
}

// Delete question
async function deleteQuestion(id) {
  if (!confirm('Are you sure you want to delete this question?')) return;
  
  try {
    const response = await fetch(`http://localhost:3000/api/admin/questions/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Failed to delete question');
    
    showMessage('Question deleted successfully!', 'success');
    await fetchQuestions();
  } catch (error) {
    showMessage('Error deleting question: ' + error.message, 'error');
  }
}

// Cancel edit
function cancelEdit() {
  resetForm();
}

// Reset form
function resetForm() {
  editingQuestionId = null;
  formTitle.textContent = 'Add New Question';
  questionForm.reset();
  questionId.value = '';
}

// Initialize
fetchQuestions();
