import dotenv from 'dotenv';
dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'dev'; // Set the node environment to development if it is not set
dotenv.config({ path: `.env.${nodeEnv}` }); // Load the environment variables from the .env file

export const env = { // Environment configuration object
  nodeEnv: nodeEnv,
  db: {
    database: process.env.DB_DATABASE,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
  },
  server: {
    port: process.env.SERVER_PORT,
    jwtSecret: process.env.JWT_SECRET, 
  },
};
