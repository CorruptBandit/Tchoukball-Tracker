const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET_KEY || "insecure";

const verifyAdmin = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    if (decoded.email !== 'admin@admin.admin') {
      return res.status(403).json({ error: 'Access denied: admin role required' });
    }

    next(); // Proceed to the next middleware/function in the stack
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired' });
    } else {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }
};

module.exports = verifyAdmin;