const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Read questions from JSON file
async function getQuestions() {
  try {
    const data = await fs.readFile(path.join(__dirname, 'questions.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading questions:', error);
    return [];
  }
}

// Write questions to JSON file
async function saveQuestions(questions) {
  try {
    await fs.writeFile(path.join(__dirname, 'questions.json'), JSON.stringify(questions, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving questions:', error);
    return false;
  }
}

// Get next available ID
function getNextId(questions) {
  if (questions.length === 0) return 1;
  return Math.max(...questions.map(q => q.id)) + 1;
}

// API Routes

// Get all questions (without correct answers)
app.get('/api/questions', async (req, res) => {
  try {
    const questions = await getQuestions();
    // Remove correct answers for security
    const questionsForClient = questions.map(q => ({
      id: q.id,
      question: q.question,
      answers: q.answers.map(a => ({ text: a.text }))
    }));
    res.json(questionsForClient);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Submit answers for validation
app.post('/api/submit', async (req, res) => {
  try {
    const { answers } = req.body;
    const questions = await getQuestions();
    
    let score = 0;
    const results = [];
    
    answers.forEach((userAnswer, index) => {
      const question = questions.find(q => q.id === userAnswer.questionId);
      if (question) {
        const correctAnswer = question.answers.find(a => a.correct);
        const isCorrect = userAnswer.selectedAnswer === correctAnswer.text;
        
        if (isCorrect) score++;
        
        results.push({
          questionId: userAnswer.questionId,
          correct: isCorrect,
          correctAnswer: correctAnswer.text
        });
      }
    });
    
    res.json({
      score,
      total: questions.length,
      results
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit answers' });
  }
});

// ADMIN ROUTES

// Get all questions (with correct answers for admin)
app.get('/api/admin/questions', async (req, res) => {
  try {
    const questions = await getQuestions();
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Add new question
app.post('/api/admin/questions', async (req, res) => {
  try {
    const questions = await getQuestions();
    const newQuestion = {
      id: getNextId(questions),
      question: req.body.question,
      answers: req.body.answers
    };
    
    questions.push(newQuestion);
    const saved = await saveQuestions(questions);
    
    if (saved) {
      res.status(201).json(newQuestion);
    } else {
      res.status(500).json({ error: 'Failed to save question' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to add question' });
  }
});

// Update question
app.put('/api/admin/questions/:id', async (req, res) => {
  try {
    const questions = await getQuestions();
    const questionIndex = questions.findIndex(q => q.id === parseInt(req.params.id));
    
    if (questionIndex === -1) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    questions[questionIndex] = {
      id: parseInt(req.params.id),
      question: req.body.question,
      answers: req.body.answers
    };
    
    const saved = await saveQuestions(questions);
    
    if (saved) {
      res.json(questions[questionIndex]);
    } else {
      res.status(500).json({ error: 'Failed to update question' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update question' });
  }
});

// Delete question
app.delete('/api/admin/questions/:id', async (req, res) => {
  try {
    const questions = await getQuestions();
    const questionIndex = questions.findIndex(q => q.id === parseInt(req.params.id));
    
    if (questionIndex === -1) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    questions.splice(questionIndex, 1);
    const saved = await saveQuestions(questions);
    
    if (saved) {
      res.status(204).send();
    } else {
      res.status(500).json({ error: 'Failed to delete question' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '..')));

// Start server
app.listen(PORT, () => {
  console.log(`Quiz app backend running on http://localhost:${PORT}`);
  console.log(`Admin panel available at http://localhost:${PORT}/admin.html`);
});
