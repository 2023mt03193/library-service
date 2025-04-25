const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userroutes');
const bookRoutes = require('./routes/bookroutes');
const authRoutes = require('./routes/authroutes');
const adminRoutes = require('./routes/adminroutes');
const borrowRoutes = require('./routes/borrowroutes');
const app = express();
const { swaggerUi, swaggerDocs } = require('./swaggerdoc'); // Import swaggerUi and swaggerDocs

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api/users', userroutes);
app.use('/api/books', bookroutes);
app.use('/api/auth', authroutes);
app.use('/api/admin', adminroutes);
app.use('/api/borrow', borrowroutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


// Error handling
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

module.exports = app;