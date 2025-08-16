import serverless from "serverless-http";

// Import the actual server with all routes
// Note: This requires all server dependencies to be in the root package.json
const app = require("../../server/server");

// Export the serverless handler
export const handler = serverless(app, {
  // Configure serverless-http options
  request: {
    // Preserve the original URL
    url: true,
  },
  response: {
    // Set CORS headers
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    },
  },
});
