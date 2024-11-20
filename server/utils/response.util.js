// Import the environment variables from the configuration file
import { env } from '../config/index.js';

// Determine if the application is running in production mode
const production = env.nodeEnv === 'prod';

// Define an asynchronous function to handle responses
const response = async (res, returnResponse) => {
  // Destructure properties from the returnResponse object
  let { statusCode, message, data, count, error } = returnResponse;

  // Check if the response status code indicates an internal server error
  if (statusCode === 500) {
    // Handle 500 error here (e.g., logging the error)
  }

  // Check if the response status code indicates a bad request
  if (statusCode === 400 && error) {
    // In production, hide specific error messages and show a generic message
    if (production) message = 'Bad request';
  }

  // Send the JSON response with the status code and data
  return res.status(statusCode).json({
    status: statusCode,
    message,
    data,
    count,
    error,
  });
};

// Export the response function for use in other modules
export { response };
