const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const mongoose = require('mongoose');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors())
// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/calculation-history', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(error => console.error('Failed to connect to MongoDB:', error));

// Define a schema for calculation history
const calculationSchema = new mongoose.Schema({
  userName: String,
  expression: String,
  result: Number,
});

// Create a model based on the schema
const Calculation = mongoose.model('Calculation', calculationSchema);

//const calculationHistory = [];

// app.post('/calculate', (req, res) => {
//   const expression = req.body.expression;

//   try {
//     const result = evaluateExpression(expression);
//     calculationHistory.push({ expression, result });
//     res.json({ result });
//   } catch (error) {
//     res.status(400).json({ error: 'Invalid expression' });
//   }
// });
// app.get('/history', (req, res) => {
//     res.json({ history: calculationHistory });
//   });
app.post('/calculate', async(req, res) => {
    const { userName, expression } = req.body;
  
    try {
      const result = evaluateExpression(expression);
      const calculation = new Calculation({
        userName,
        expression,
        result,
      });
  
      await calculation.save();
      res.json({ result });
    } catch (error) {
      res.status(400).json({ error: 'Invalid expression' });
    }
  });
  app.get('/history/clear', async(req, res) => {
    try {
        // Fetch all calculations from the database
        const calculations = await Calculation.find();
    
        res.json({ history: calculations });
      } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve history' });
      }
  });
  app.delete("/history/delete/:id", async (req, res) => {
    const id = req.params.id;
  
    try {
      // Delete the history entry by ID using Mongoose
      const result = await History.deleteOne({ _id: id });
  
      if (result.deletedCount === 1) {
        res.sendStatus(200); // Success response
      } else {
        res.status(404).send("History entry not found"); // Entry not found, send error response
      }
    } catch (error) {
      res.status(500).send("Error deleting history entry"); // Error occurred, send error response
    }
  });
  
function evaluateExpression(expression) {
  const tokens = expression.split(/(\+|-|\*|\/)/);
  let result = parseFloat(tokens[0]);

  for (let i = 1; i < tokens.length; i += 2) {
    const operator = tokens[i];
    const operand = parseFloat(tokens[i + 1]);

    if (isNaN(operand)) {
      throw new Error('Invalid expression');
    }

    switch (operator) {
      case '+':
        result += operand;
        break;
      case '-':
        result -= operand;
        break;
      case '*':
        result *= operand;
        break;
      case '/':
        result /= operand;
        break;
      default:
        throw new Error('Invalid operator');
    }
  }

  return result;
}
// function saveCalculation(userName, expression, result) {
//     const calculation = new Calculation({ userName, expression, result });
//     calculation.save((err) => {
//       if (err) {
//         console.error('Failed to save calculation:', err);
//       } else {
//         console.log('Calculation saved successfully');
//       }
//     });
//   }

app.listen(5000)
