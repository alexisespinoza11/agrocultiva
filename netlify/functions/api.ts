import serverless from 'serverless-http';
import { app } from '../../server'; // Import the Express app

// Create a handler from the Express app
export const handler = serverless(app);
