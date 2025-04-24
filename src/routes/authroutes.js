const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User, Role } = require('../models/user'); // Assuming Role model exists
const jwt = require('jsonwebtoken');

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     operationId: registerUser
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username for the new user
 *               password:
 *                 type: string
 *                 description: Password for the new user
 *               email:
 *                 type: string
 *                 description: Email of the new user
 *               role:
 *                 type: string
 *                 description: >
 *                   Role of the user. Defaults to "STUDENT" if not provided.
 *             required:
 *               - username
 *               - password
 *               - email
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Missing required fields or invalid role
 *       409:
 *         description: Username already exists
 *       500:
 *         description: Server error
 */

// Register a user (default: STUDENT role)
router.post('/register', async (req, res) => {
  const { username, password, email, role = 'STUDENT' } = req.body;

  try {
    // Validate input
    if (!username || !password || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Find role_id (e.g., STUDENT or ADMIN)
    const userRole = await Role.findOne({ where: { role_name: role } });
    if (!userRole) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await User.create({
      username,
      password_hash: hashedPassword,
      email,
      role_id: userRole.role_id,
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ 
      where: { username },
      include: [{ model: Role, attributes: ['role_name'] }], // Include role
    });

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT with role
    const token = jwt.sign(
      { userId: user.user_id, role: user.Role.role_name },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
