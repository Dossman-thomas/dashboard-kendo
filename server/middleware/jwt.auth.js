import jwt from "jsonwebtoken";

// Use the environment variable JWT_SECRET or a default value
const JWT_SECRET = process.env.JWT_SECRET || "jwt_secret";

export const authenticateJWT = (req, res, next) => {
  // Get the Authorization header and split it to get the token
  const authHeader = req.headers["authorization"];

  // Extract the token from the Bearer token format
  const token = authHeader.split(" ")[1];

  console.log("Token:", token); // Log the token for debugging

  // Verify the token
  jwt.verify(token, JWT_SECRET, (err, decoded) => {

    if (err) {
      // If token is expired or invalid
      if (err.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "Unauthorized: Token has expired." });
      } else {
        return res
          .status(401)
          .json({ message: "Unauthorized: Invalid token." });
      }
    }

    // Token is valid, store the decoded payload in the request for future use
    req.user = decoded;

    next(); // Proceed to the next middleware or route handler

  });
};
