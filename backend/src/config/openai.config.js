import OpenAI from 'openai';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// Debug: Log to check if API key is loaded
console.log('OpenAI API Key loaded:', process.env.OPENAI_API_KEY ? 'Yes' : 'No');

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is not set. Please check your .env file.');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default openai;
