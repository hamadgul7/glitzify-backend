//mongodb+srv://<db_username>:<db_password>@glitzify-backend.hhmin58.mongodb.net/?appName=glitzify-backend

const mongoose = require('mongoose');

async function connectToDatabase() {
  try {
    await mongoose.connect('mongodb+srv://hamad:Hamad07%40@glitzify-backend.hhmin58.mongodb.net/?appName=glitzify-backend');
        
    console.log('Connected to the database successfully!');
  } catch (error) {
    console.error('Failed to connect to the database:', error);
  }
};


module.exports = {connectToDatabase: connectToDatabase};

