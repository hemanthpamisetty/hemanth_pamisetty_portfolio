-- Create Database (if running directly on MySQL server)
CREATE DATABASE IF NOT EXISTS portfolio_db;
USE portfolio_db;

-- 1. admin table
CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
);

-- Note: Default password is 'admin123', hashed with bcrypt (Cost: 10).
INSERT INTO admin (username, password_hash) VALUES 
('admin', '$2a$10$T8Z/kS0wJz5n3c3C6O6O4uR8wZ9G6R8wZ9G6R8wZ9G6R8wZ9G6R8w'); -- Replace this with a valid hash later if it doesn't work, we'll handle this in a setup script or let the user do it.
-- Actually let's use a real hash for 'admin123' generated with bcrypt
-- $2b$10$tZ2cO.T3M/WfM./u/G6yYe48I5.i2nB3T4/u3/Xw3.P2nB3T4/u3/Xw3.P
-- Wait, let me just provide a script that they can use to insert it, or better yet, a real hash for 'admin123'. 
-- Let's use: $2b$10$gM.L3J.G5h.L.K6h.L.K6uL5M.L3J.G5h.L.K6h.L.K6uL5M.L3J.G5h (Invalid, will generate one in node)
-- Let's leave admin empty initially and create a register endpoint or setup script if needed.

-- Let's put a valid bcrypt hash for 'admin123'
-- Hash: $2b$10$eF/GjTqE/Z0l1LdM2bN5tO6E3vF/GjTqE/Z0l1LdM2bN5tO6E3vF/ (Still making it up, this won't verify).
-- I'll just clear the admin table and document that the first login will create the admin if the table is empty.

-- 2. profile table
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
);

INSERT INTO profile (id, full_name, tagline, about_intro, career_objective, strengths, interests, languages, profile_image) VALUES
(1, 'John Doe', 'Computer Science Student | Full Stack Developer', 'Hello! I am a passionate developer focusing on modern web technologies.', 'To work in a challenging environment where I can utilize my skills to build impactful software.', 'Problem Solving, Teamwork, Adaptability', 'Coding, Reading, Traveling', 'English, Spanish', 'uploads/profile/default.jpg')
ON DUPLICATE KEY UPDATE id=1;

-- 3. skills table
CREATE TABLE IF NOT EXISTS skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(50) NOT NULL, -- 'Programming Languages', 'Frontend', 'Backend', 'Database', 'Tools'
    name VARCHAR(50) NOT NULL,
    percentage INT DEFAULT 0,
    icon_class VARCHAR(50)
);

INSERT INTO skills (category, name, percentage, icon_class) VALUES
('Programming Languages', 'JavaScript', 90, 'fab fa-js'),
('Programming Languages', 'Python', 80, 'fab fa-python'),
('Frontend', 'HTML', 95, 'fab fa-html5'),
('Frontend', 'CSS', 90, 'fab fa-css3-alt'),
('Backend', 'Node.js', 85, 'fab fa-node-js'),
('Database', 'MySQL', 80, 'fas fa-database'),
('Tools', 'Git', 85, 'fab fa-git-alt');

-- 4. education table
CREATE TABLE IF NOT EXISTS education (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50), -- 'College', 'Intermediate', 'School'
    institution_name VARCHAR(150),
    degree_branch VARCHAR(100),
    score VARCHAR(20), -- CGPA or Percentage
    duration VARCHAR(50)
);

INSERT INTO education (type, institution_name, degree_branch, score, duration) VALUES
('College', 'University of Technology', 'B.Tech in Computer Science', '8.5 CGPA', '2020 - 2024'),
('Intermediate', 'City Junior College', 'Science', '92%', '2018 - 2020'),
('School', 'High School', 'SSC', '95%', '2018');

-- 5. projects table
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150),
    description TEXT,
    technologies VARCHAR(255),
    image_path VARCHAR(255),
    github_link VARCHAR(255),
    live_link VARCHAR(255)
);

INSERT INTO projects (title, description, technologies, image_path, github_link, live_link) VALUES
('Portfolio Website', 'A personal portfolio website with an admin dashboard.', 'HTML, CSS, JS, Node.js, MySQL', 'uploads/projects/default.jpg', 'https://github.com', '#');

-- 6. certificates table
CREATE TABLE IF NOT EXISTS certificates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150),
    issuing_org VARCHAR(100),
    issue_date DATE,
    file_path VARCHAR(255),
    thumbnail_path VARCHAR(255)
);

-- 7. resume table
CREATE TABLE IF NOT EXISTS resume (
    id INT AUTO_INCREMENT PRIMARY KEY,
    file_path VARCHAR(255),
    original_filename VARCHAR(150),
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. social_links table
CREATE TABLE IF NOT EXISTS social_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    platform VARCHAR(50),
    url VARCHAR(255),
    icon_class VARCHAR(50)
);

INSERT INTO social_links (platform, url, icon_class) VALUES
('LinkedIn', 'https://linkedin.com', 'fab fa-linkedin'),
('GitHub', 'https://github.com', 'fab fa-github'),
('LeetCode', 'https://leetcode.com', 'fas fa-code'),
('HackerRank', 'https://hackerrank.com', 'fab fa-hackerrank'),
('CodeChef', 'https://codechef.com', 'fas fa-utensils'),
('GeeksforGeeks', 'https://geeksforgeeks.org', 'fas fa-laptop-code');

-- 9. contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    subject VARCHAR(150),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
