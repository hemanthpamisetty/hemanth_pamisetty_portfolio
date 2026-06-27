const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
const portfolioRoutes = require('./routes/portfolio');
const adminRoutes = require('./routes/admin');

app.use('/api/portfolio', portfolioRoutes);
app.use('/api/admin', adminRoutes);

// Catch-all route to serve index.html for frontend navigation
app.get('{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
