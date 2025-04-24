const express = require('express');
const router = express.Router();
const Book = require('../models/book');

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: API for managing books
 */

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Get all books
 *     tags: [Books]
 *     operationId: getAllBooks
 *     responses:
 *       200:
 *         description: A list of books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    const books = await Book.findAll();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /books/{book_id}:
 *   get:
 *     summary: Get a single book by ID
 *     tags: [Books]
 *     operationId: getBookById
 *     parameters:
 *       - in: path
 *         name: book_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the book to retrieve
 *     responses:
 *       200:
 *         description: Book details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 *       500:
 *         description: Server error
 */
router.get('/:book_id', async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.book_id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 *     operationId: createBook
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               isbn:
 *                 type: string
 *               quantity_available:
 *                 type: integer
 *               author_id:
 *                 type: integer
 *               category_id:
 *                 type: integer
 *             required:
 *               - title
 *               - isbn
 *               - quantity_available
 *               - author_id
 *               - category_id
 *     responses:
 *       201:
 *         description: Book created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         description: Bad request
 */
router.post('/', async (req, res) => {
  try {
    const newBook = await Book.create({
      title: req.body.title,
      isbn: req.body.isbn,
      quantity_available: req.body.quantity_available,
      author_id: req.body.author_id,
      category_id: req.body.category_id
    });
    res.status(201).json(newBook);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /books/{book_id}:
 *   put:
 *     summary: Update a book
 *     tags: [Books]
 *     operationId: updateBook
 *     parameters:
 *       - in: path
 *         name: book_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the book to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               isbn:
 *                 type: string
 *               quantity_available:
 *                 type: integer
 *               author_id:
 *                 type: integer
 *               category_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Book updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 *       400:
 *         description: Bad request
 */
router.put('/:book_id', async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.book_id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    await book.update(req.body);
    res.json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /books/{book_id}:
 *   delete:
 *     summary: Delete a book
 *     tags: [Books]
 *     operationId: deleteBook
 *     parameters:
 *       - in: path
 *         name: book_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the book to delete
 *     responses:
 *       204:
 *         description: Book deleted successfully
 *       404:
 *         description: Book not found
 *       500:
 *         description: Server error
 */
router.delete('/:book_id', async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.book_id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    await book.destroy();
    res.status(204).send(); // 204 = No Content
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; // Export the router