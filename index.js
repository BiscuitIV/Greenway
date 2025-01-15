// Import dependencies
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Initialize the Express app
const app = express();
const port = 3000;  // You can change the port

// Middleware to parse incoming form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Connect to MongoDB (replace <db-uri> with your MongoDB URI)
mongoose.connect('<your-mongodb-uri>', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define the schema for the form data
const formSchema = new mongoose.Schema({
  email: String,
  fullName: String,
  studentId: String,
  transportation: [String],  // Array of selected transportation modes
  agreement: Boolean,
});

// Create a model based on the schema
const FormData = mongoose.model('FormData', formSchema);

// Serve the static HTML file
app.use(express.static('public'));

// Handle form submissions
app.post('/submit', async (req, res) => {
  const { email, fullName, studentId, transportation, agreement } = req.body;

  if (transportation.length > 3) {
    return res.status(400).json({ message: 'You can select up to 3 transportation options only.' });
  }

  if (!agreement) {
    return res.status(400).json({ message: 'You must agree to the terms before submitting.' });
  }

  // Create a new document with the form data
  const formData = new FormData({
    email,
    fullName,
    studentId,
    transportation,
    agreement,
  });

  try {
    await formData.save();
    res.status(200).json({ message: 'Form submitted successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Error saving data', error: err });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
