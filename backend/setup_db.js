const db = require('./config/db.js');

async function setup() {
    try {
        console.log('Setting up database tables...\n');

        // 1. admin table
        await db.query(`
            CREATE TABLE IF NOT EXISTS admin (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL
            )
        `);
        console.log('✓ admin table created');

        // 2. profile table
        await db.query(`
            CREATE TABLE IF NOT EXISTS profile (
                id INT AUTO_INCREMENT PRIMARY KEY,
                full_name VARCHAR(100),
                tagline VARCHAR(150),
                about_intro TEXT,
                career_objective TEXT,
                strengths TEXT,
                interests TEXT,
                languages TEXT,
                profile_image VARCHAR(255)
            )
        `);
        console.log('✓ profile table created');

        // 3. skills table
        await db.query(`
            CREATE TABLE IF NOT EXISTS skills (
                id INT AUTO_INCREMENT PRIMARY KEY,
                category VARCHAR(50) NOT NULL,
                name VARCHAR(50) NOT NULL,
                percentage INT DEFAULT 0,
                icon_class VARCHAR(50)
            )
        `);
        console.log('✓ skills table created');

        // 4. education table
        await db.query(`
            CREATE TABLE IF NOT EXISTS education (
                id INT AUTO_INCREMENT PRIMARY KEY,
                type VARCHAR(50),
                institution_name VARCHAR(150),
                degree_branch VARCHAR(100),
                score VARCHAR(20),
                duration VARCHAR(50)
            )
        `);
        console.log('✓ education table created');

        // 5. projects table
        await db.query(`
            CREATE TABLE IF NOT EXISTS projects (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(150),
                description TEXT,
                technologies VARCHAR(255),
                image_path VARCHAR(255),
                github_link VARCHAR(255),
                live_link VARCHAR(255)
            )
        `);
        console.log('✓ projects table created');

        // 6. certificates table
        await db.query(`
            CREATE TABLE IF NOT EXISTS certificates (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(150),
                issuing_org VARCHAR(100),
                issue_date DATE,
                file_path VARCHAR(255),
                thumbnail_path VARCHAR(255)
            )
        `);
        console.log('✓ certificates table created');

        // 7. resume table
        await db.query(`
            CREATE TABLE IF NOT EXISTS resume (
                id INT AUTO_INCREMENT PRIMARY KEY,
                file_path VARCHAR(255),
                original_filename VARCHAR(150),
                upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ resume table created');

        // 8. social_links table
        await db.query(`
            CREATE TABLE IF NOT EXISTS social_links (
                id INT AUTO_INCREMENT PRIMARY KEY,
                platform VARCHAR(50),
                url VARCHAR(255),
                icon_class VARCHAR(50)
            )
        `);
        console.log('✓ social_links table created');

        // 9. contact_messages table
        await db.query(`
            CREATE TABLE IF NOT EXISTS contact_messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100),
                email VARCHAR(100),
                subject VARCHAR(150),
                message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ contact_messages table created');

        // --- Insert default/seed data ---
        console.log('\nInserting seed data...\n');

        // Admin user (password: admin123)
        const bcrypt = require('bcrypt');
        const hash = await bcrypt.hash('admin123', 10);
        const [existingAdmin] = await db.query('SELECT id FROM admin LIMIT 1');
        if (existingAdmin.length === 0) {
            await db.query('INSERT INTO admin (username, password_hash) VALUES (?, ?)', ['admin', hash]);
            console.log('✓ admin user created (username: admin, password: admin123)');
        } else {
            console.log('- admin user already exists, skipping');
        }

        // Profile
        const [existingProfile] = await db.query('SELECT id FROM profile LIMIT 1');
        if (existingProfile.length === 0) {
            await db.query(`INSERT INTO profile (full_name, tagline, about_intro, career_objective, strengths, interests, languages, profile_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                ['John Doe', 'Computer Science Student | Full Stack Developer',
                 'Hello! I am a passionate developer focusing on modern web technologies.',
                 'To work in a challenging environment where I can utilize my skills to build impactful software.',
                 'Problem Solving, Teamwork, Adaptability',
                 'Coding, Reading, Traveling',
                 'English, Spanish',
                 'uploads/profile/default.jpg']);
            console.log('✓ default profile inserted');
        } else {
            console.log('- profile already exists, skipping');
        }

        // Skills
        const [existingSkills] = await db.query('SELECT id FROM skills LIMIT 1');
        if (existingSkills.length === 0) {
            await db.query(`INSERT INTO skills (category, name, percentage, icon_class) VALUES 
                ('Programming Languages', 'JavaScript', 90, 'fab fa-js'),
                ('Programming Languages', 'Python', 80, 'fab fa-python'),
                ('Frontend', 'HTML', 95, 'fab fa-html5'),
                ('Frontend', 'CSS', 90, 'fab fa-css3-alt'),
                ('Backend', 'Node.js', 85, 'fab fa-node-js'),
                ('Database', 'MySQL', 80, 'fas fa-database'),
                ('Tools', 'Git', 85, 'fab fa-git-alt')`);
            console.log('✓ default skills inserted');
        } else {
            console.log('- skills already exist, skipping');
        }

        // Education
        const [existingEdu] = await db.query('SELECT id FROM education LIMIT 1');
        if (existingEdu.length === 0) {
            await db.query(`INSERT INTO education (type, institution_name, degree_branch, score, duration) VALUES 
                ('College', 'University of Technology', 'B.Tech in Computer Science', '8.5 CGPA', '2020 - 2024'),
                ('Intermediate', 'City Junior College', 'Science', '92%', '2018 - 2020'),
                ('School', 'High School', 'SSC', '95%', '2018')`);
            console.log('✓ default education inserted');
        } else {
            console.log('- education already exists, skipping');
        }

        // Projects
        const [existingProjects] = await db.query('SELECT id FROM projects LIMIT 1');
        if (existingProjects.length === 0) {
            await db.query(`INSERT INTO projects (title, description, technologies, image_path, github_link, live_link) VALUES 
                ('Portfolio Website', 'A personal portfolio website with an admin dashboard.', 'HTML, CSS, JS, Node.js, MySQL', 'uploads/projects/default.jpg', 'https://github.com', '#')`);
            console.log('✓ default projects inserted');
        } else {
            console.log('- projects already exist, skipping');
        }

        // Social Links
        const [existingLinks] = await db.query('SELECT id FROM social_links LIMIT 1');
        if (existingLinks.length === 0) {
            await db.query(`INSERT INTO social_links (platform, url, icon_class) VALUES 
                ('LinkedIn', 'https://linkedin.com', 'fab fa-linkedin'),
                ('GitHub', 'https://github.com', 'fab fa-github'),
                ('LeetCode', 'https://leetcode.com', 'fas fa-code'),
                ('HackerRank', 'https://hackerrank.com', 'fab fa-hackerrank'),
                ('CodeChef', 'https://codechef.com', 'fas fa-utensils'),
                ('GeeksforGeeks', 'https://geeksforgeeks.org', 'fas fa-laptop-code')`);
            console.log('✓ default social links inserted');
        } else {
            console.log('- social links already exist, skipping');
        }

        console.log('\n✅ Database setup complete!');
        console.log('\n--- Login Credentials ---');
        console.log('Username: admin');
        console.log('Password: admin123');
        console.log('-------------------------\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    }
}

setup();
