const express = require('express');
const router = express.Router();
const { User, Role } = require('../models/user'); // Correct import
const Book = require('../models/book');
const Borrow = require('../models/borrow');

/**
 * @swagger
 * tags:
 *   name: Borrow
 *   description: API for borrowing books
 */

/**
 * @swagger
 * /borrow:
 *   post:
 *     summary: Borrow a book
 *     tags: [Borrow]
 *     operationId: borrowBook
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: ID of the user borrowing the book
 *               book_id:
 *                 type: integer
 *                 description: ID of the book to be borrowed
 *             required:
 *               - user_id
 *               - book_id
 *     responses:
 *       201:
 *         description: Book borrowed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 due_date:
 *                   type: string
 *                   format: date
 *                   description: Due date for returning the book
 *       400:
 *         description: Book not available or bad request
 *       403:
 *         description: Only students can borrow books
 *       404:
 *         description: Book not found
 *       500:
 *         description: Server error
 */

// Borrow a book (user_id passed explicitly)
router.post('/borrow', async (req, res) => {
  console.log("testing ")
  const { user_id, book_id } = req.body;

  try {
    // 1. Verify user exists and is a student
    const user = await User.findOne({
      where: { user_id },
      include: {
        model: Role,
        where: { role_name: 'STUDENT' }
      }
    });

    if (!user) {
      return res.status(403).json({ error: "Only students can borrow books" });
    }

    // 2. Check book availability
    const book = await Book.findByPk(book_id);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }
    if (book.quantity_available <= 0) {
      return res.status(400).json({ error: "Book not available" });
    }

    // 3. Create borrow record (14-day loan period)
    const due_date = new Date();
    due_date.setDate(due_date.getDate() + 14);

    await Borrow.create({
      user_id,
      book_id,
      borrow_date: new Date(),
      due_date,
      status: 'BORROWED'
    });

    // 4. Update book quantity
    await book.decrement('quantity_available');

    res.status(201).json({
      message: "Book borrowed successfully",
      due_date: due_date.toISOString().split('T')[0] // Format as YYYY-MM-DD
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;