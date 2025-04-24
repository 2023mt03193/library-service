
const express = require('express');
const router = express.Router();
const User = require('../models/user');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API for managing users
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     operationId: getAllUsers
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     operationId: createUser
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password_hash:
 *                 type: string
 *               email:
 *                 type: string
 *             required:
 *               - username
 *               - password_hash
 *               - email
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /user/{user_id}/books:
 *   get:
 *     summary: Get books borrowed by a user
 *     tags: [Users]
 *     operationId: getUserBorrowedBooks
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: A list of borrowed books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Borrow'
 *       500:
 *         description: Server error
 */

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
    try {
      const { username, password_hash, email } = req.body;
  
      // Basic validation
      if (!username || !password_hash || !email) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
  
      const newUser = await User.create({ username, password_hash, email });
  
      res.status(201).json(newUser);
    } catch (err) {
      console.error('Error creating user:', err);
      res.status(400).json({ error: err.message });
    }
  });

  
// Example route to get user's borrowed books
router.get('/user/:user_id/books', async (req, res) => {
  try {
    const borrowings = await Borrow.findAll({
      where: { user_id: req.params.user_id },
      include: [{ 
        model: Book,
        attributes: ['title', 'author_id', 'isbn'] 
      }]
    });
    res.json(borrowings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});  

module.exports = router;