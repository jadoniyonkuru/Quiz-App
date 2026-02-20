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

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '..')));

// Start server
app.listen(PORT, () => {
  console.log(`Quiz app backend running on http://localhost:${PORT}`);
});
