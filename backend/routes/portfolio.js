const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get Profile
router.get('/profile', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM profile LIMIT 1');
        res.json(rows[0] || {});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Skills
router.get('/skills', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM skills ORDER BY category, percentage DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Education
router.get('/education', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM education');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Projects
router.get('/projects', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM projects');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Certificates
router.get('/certificates', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM certificates');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Resume
router.get('/resume', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM resume ORDER BY id DESC LIMIT 1');
        res.json(rows[0] || {});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Social Links
router.get('/social-links', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM social_links');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Submit Contact Message
router.post('/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required.' });
    }
    try {
        await db.query('INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)', [name, email, subject, message]);
        res.status(201).json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
