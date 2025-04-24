const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { User, Role } = require('../models/user');
const Book = require('../models/book');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: API for admin operations
 */

/**
 * @swagger
 * /admin/register-admin:
 *   post:
 *     summary: Register a new admin
 *     tags: [Admin]
 *     operationId: registerAdmin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username for the new admin
 *               password:
 *                 type: string
 *                 description: Password for the new admin
 *               email:
 *                 type: string
 *                 description: Email of the new admin
 *             required:
 *               - username
 *               - password
 *               - email
 *     responses:
 *       201:
 *         description: Admin registered successfully
 *       500:
 *         description: Server error
 */
router.post('/register-admin', async (req, res) => {
  const { username, password, email } = req.body;

  try {
    const adminRole = await Role.findOne({ where: { role_name: 'ADMIN' } });
    if (!adminRole) {
      return res.status(500).json({ error: "Admin role not found in database" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await User.create({
      username,
      password_hash: hashedPassword,
      email,
      role_id: adminRole.role_id, // Assign ADMIN role
    });

    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
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
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /admin/users/{user_id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Admin]
 *     operationId: deleteUser
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the user to delete
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete('/users/:user_id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.user_id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await user.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /admin/register-book:
 *   post:
 *     summary: Register a new book
 *     tags: [Admin]
 *     operationId: registerBook
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               admin_id:
 *                 type: integer
 *                 description: ID of the admin registering the book
 *               title:
 *                 type: string
 *                 description: Title of the book
 *               isbn:
 *                 type: string
 *                 description: ISBN of the book
 *               quantity:
 *                 type: integer
 *                 description: Quantity of the book available
 *               author_name:
 *                 type: string
 *                 description: Name of the author
 *               category_name:
 *                 type: string
 *                 description: Name of the category
 *             required:
 *               - admin_id
 *               - title
 *               - isbn
 *               - quantity
 *               - author_name
 *               - category_name
 *     responses:
 *       201:
 *         description: Book registered successfully
 *       403:
 *         description: Only admins can register books
 *       409:
 *         description: Book with this ISBN already exists
 *       500:
 *         description: Server error
 */
router.post('/register-book', async (req, res) => {
  const { admin_id, title, isbn, quantity, author_name, category_name } = req.body;

  try {
    const admin = await User.findOne({
      where: { user_id: admin_id },
      include: {
        model: Role,
        where: { role_name: 'ADMIN' }
      }
    });

    if (!admin) {
      return res.status(403).json({ error: "Only admins can register books" });
    }

    if (!title || !isbn || !quantity || !author_name || !category_name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingBook = await Book.findOne({ where: { isbn } });
    if (existingBook) {
      return res.status(409).json({ error: "Book with this ISBN already exists" });
    }

    const newBook = await Book.create({
      title,
      isbn,
      quantity_available: quantity,
      author_name,
      category_name
    });

    res.status(201).json({
      message: "Book registered successfully",
      book: {
        id: newBook.book_id,
        title: newBook.title,
        available: newBook.quantity_available
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;