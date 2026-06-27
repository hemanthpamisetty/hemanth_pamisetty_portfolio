const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const verifyToken = require('../middleware/auth');
const upload = require('../middleware/upload');

// Admin Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM admin WHERE username = ?', [username]);
        if (rows.length === 0) {
            // Check if it's the first time and admin table is empty
            const [adminCount] = await db.query('SELECT COUNT(*) as count FROM admin');
            if (adminCount[0].count === 0) {
                 const hashedPassword = await bcrypt.hash(password, 10);
                 await db.query('INSERT INTO admin (username, password_hash) VALUES (?, ?)', [username, hashedPassword]);
                 const token = jwt.sign({ id: 1, username }, process.env.JWT_SECRET, { expiresIn: '1d' });
                 return res.json({ token, message: 'First admin created and logged in successfully.' });
            }
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const admin = rows[0];
        const isMatch = await bcrypt.compare(password, admin.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: admin.id, username: admin.username }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Protect all routes below this middleware
router.use(verifyToken);

// Verify Token Endpoint
router.get('/verify', (req, res) => {
    res.json({ valid: true });
});

// Update Profile
router.put('/profile', upload.single('profile_image'), async (req, res) => {
    const { full_name, tagline, about_intro, career_objective, strengths, interests, languages } = req.body;
    let profile_image = req.body.profile_image_path; // Keep old path if no new image
    if (req.file) {
        profile_image = 'uploads/profile/' + req.file.filename;
    }
    try {
        await db.query(`
            UPDATE profile 
            SET full_name=?, tagline=?, about_intro=?, career_objective=?, strengths=?, interests=?, languages=?, profile_image=? 
            WHERE id=1`, 
            [full_name, tagline, about_intro, career_objective, strengths, interests, languages, profile_image]
        );
        res.json({ success: true, message: 'Profile updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Manage Skills
router.post('/skills', async (req, res) => {
    const { category, name, percentage, icon_class } = req.body;
    try {
        await db.query('INSERT INTO skills (category, name, percentage, icon_class) VALUES (?, ?, ?, ?)', [category, name, percentage, icon_class]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/skills/:id', async (req, res) => {
    const { category, name, percentage, icon_class } = req.body;
    try {
        await db.query('UPDATE skills SET category=?, name=?, percentage=?, icon_class=? WHERE id=?', [category, name, percentage, icon_class, req.params.id]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/skills/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM skills WHERE id=?', [req.params.id]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// Manage Education
router.post('/education', async (req, res) => {
    const { type, institution_name, degree_branch, score, duration } = req.body;
    try {
        await db.query('INSERT INTO education (type, institution_name, degree_branch, score, duration) VALUES (?, ?, ?, ?, ?)', [type, institution_name, degree_branch, score, duration]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/education/:id', async (req, res) => {
    const { type, institution_name, degree_branch, score, duration } = req.body;
    try {
        await db.query('UPDATE education SET type=?, institution_name=?, degree_branch=?, score=?, duration=? WHERE id=?', [type, institution_name, degree_branch, score, duration, req.params.id]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/education/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM education WHERE id=?', [req.params.id]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// Manage Projects
router.post('/projects', upload.single('image'), async (req, res) => {
    const { title, description, technologies, github_link, live_link } = req.body;
    const image_path = req.file ? 'uploads/projects/' + req.file.filename : '';
    try {
        await db.query('INSERT INTO projects (title, description, technologies, image_path, github_link, live_link) VALUES (?, ?, ?, ?, ?, ?)', [title, description, technologies, image_path, github_link, live_link]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/projects/:id', upload.single('image'), async (req, res) => {
    const { title, description, technologies, github_link, live_link } = req.body;
    let image_path = req.body.image_path; 
    if (req.file) image_path = 'uploads/projects/' + req.file.filename;
    try {
        await db.query('UPDATE projects SET title=?, description=?, technologies=?, image_path=?, github_link=?, live_link=? WHERE id=?', [title, description, technologies, image_path, github_link, live_link, req.params.id]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/projects/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM projects WHERE id=?', [req.params.id]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// Manage Certificates
router.post('/certificates', upload.single('file'), async (req, res) => {
    const { title, issuing_org, issue_date } = req.body;
    const file_path = req.file ? 'uploads/certificates/' + req.file.filename : '';
    // Simplifying thumbnail path to use the same file for now if it's an image
    const thumbnail_path = file_path; 
    try {
        await db.query('INSERT INTO certificates (title, issuing_org, issue_date, file_path, thumbnail_path) VALUES (?, ?, ?, ?, ?)', [title, issuing_org, issue_date, file_path, thumbnail_path]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/certificates/:id', upload.single('file'), async (req, res) => {
    const { title, issuing_org, issue_date } = req.body;
    let file_path = req.body.file_path; 
    if (req.file) file_path = 'uploads/certificates/' + req.file.filename;
    const thumbnail_path = file_path;
    try {
        await db.query('UPDATE certificates SET title=?, issuing_org=?, issue_date=?, file_path=?, thumbnail_path=? WHERE id=?', [title, issuing_org, issue_date, file_path, thumbnail_path, req.params.id]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/certificates/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM certificates WHERE id=?', [req.params.id]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// Manage Resume
router.post('/resume', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const file_path = 'uploads/resume/' + req.file.filename;
    const original_filename = req.file.originalname;
    try {
        await db.query('INSERT INTO resume (file_path, original_filename) VALUES (?, ?)', [file_path, original_filename]);
        res.json({ success: true, message: 'Resume uploaded' });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/resume/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM resume WHERE id=?', [req.params.id]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// Manage Social Links
router.put('/social-links/:id', async (req, res) => {
    const { url, icon_class } = req.body;
    try {
        await db.query('UPDATE social_links SET url=?, icon_class=? WHERE id=?', [url, icon_class, req.params.id]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// Messages
router.get('/messages', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/messages/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM contact_messages WHERE id=?', [req.params.id]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
