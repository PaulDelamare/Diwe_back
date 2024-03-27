// Required the .env to have sensitive information
require('dotenv').config();

// Configuration for email
module.exports = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  };