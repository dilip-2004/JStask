const express=require('express');
const cors=require('cors');
const mongoose=require('mongoose');
const bodyParser=require('body-parser');
const bcrypt=require('bcrypt');
const connectionToDatabase=require('./mongoose');
require('dotenv').config();

const app=express();

// db connection
connectionToDatabase.connection;

app.use(bodyParser.json());
app.use(cors());

// User Schema and Model
const userSchema = new mongoose.Schema({
  userName: String,
  userEmail: String,
  userPassword: String
});

const User = mongoose.model('User', userSchema);

// Task Schema and Model
const taskSchema = new mongoose.Schema({
  taskName: String,
  taskDescription: String,
  taskStatus: String,
  taskDueDate: Date,
  taskUserId: String
});

const Task = mongoose.model('Task', taskSchema);

// User Signup
app.post('/api/user/signup', async (req, res) => {
  const { userName, userEmail, userPassword } = req.body;

  try {
    const existingUser = await User.findOne({ userEmail });
    if (existingUser) {
      return res.status(422).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(userPassword, 12);
    const newUser = new User({ userName, userEmail, userPassword: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Could not signup, please try again' });
  }
});

// User Login
app.post('/api/user/login', async (req, res) => {
  const { userEmail, userPassword } = req.body;

  try {
    const user = await User.findOne({ userEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isValidPassword = await bcrypt.compare(userPassword, user.userPassword);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    res.status(200).json({ message: 'User login successfully', userId: user._id });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create Task
app.post('/api/task/create', async (req, res) => {
  const { taskName, taskDescription, taskStatus, taskDueDate, taskUserId } = req.body;

  try {
    const newTask = new Task({ taskName, taskDescription, taskStatus, taskDueDate, taskUserId });
    await newTask.save();
    res.status(201).json({ message: 'Task created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get Tasks
app.get('/api/task/:taskUserId', async (req, res) => {
  const { taskUserId } = req.params;

  try {
    const tasks = await Task.find({ taskUserId });
    res.status(200).json({ tasks });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update Task
app.put('/api/task/update/:taskId', async (req, res) => {
  const { taskId } = req.params;
  const { taskName, taskDescription, taskStatus, taskDueDate, taskUserId } = req.body;

  try {
    const updatedTask = await Task.findByIdAndUpdate(taskId, {
      taskName, taskDescription, taskStatus, taskDueDate, taskUserId
    }, { new: true });

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({ message: 'Task updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete Task
app.delete('/api/task/delete/:taskId', async (req, res) => {
  const { taskId } = req.params;

  try {
    const deletedTask = await Task.findByIdAndDelete(taskId);
    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start Server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});