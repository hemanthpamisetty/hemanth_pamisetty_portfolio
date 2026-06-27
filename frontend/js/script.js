document.addEventListener('DOMContentLoaded', () => {
    // Current Year for Footer
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const icon = themeToggle.querySelector('i');
    
    // Check local storage for theme
    if (localStorage.getItem('theme') === 'dark') {
        body.classList.replace('light-mode', 'dark-mode');
        icon.classList.replace('fa-moon', 'fa-sun');
    }

    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('light-mode')) {
            body.classList.replace('light-mode', 'dark-mode');
            icon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.replace('dark-mode', 'light-mode');
            icon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('theme', 'light');
        }
    });

    // Mobile Hamburger Menu
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links li a');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = hamburger.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.replace('fa-bars', 'fa-times');
        } else {
            icon.classList.replace('fa-times', 'fa-bars');
        }
    });

    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.querySelector('i').classList.replace('fa-times', 'fa-bars');
        });
    });

    // Fetch and Load Data
    loadPortfolioData();

    // About Section Tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            // Add active class to clicked
            btn.classList.add('active');
            const targetId = `pane-${btn.getAttribute('data-target')}`;
            document.getElementById(targetId).classList.add('active');
        });
    });

    // Contact form submission
    document.getElementById('contact-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const statusDiv = document.getElementById('form-status');
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending... <i class="fas fa-spinner fa-spin"></i>';

        const data = {
            name: form.name.value,
            email: form.email.value,
            subject: form.subject.value,
            message: form.message.value
        };

        const response = await postToAPI('/portfolio/contact', data);
        
        if (response.success) {
            statusDiv.innerHTML = `<div class="alert alert-success">${response.message}</div>`;
            form.reset();
        } else {
            statusDiv.innerHTML = `<div class="alert alert-error">Failed to send message. Please try again.</div>`;
        }

        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Send Message <i class="fas fa-paper-plane"></i>';
        
        setTimeout(() => {
            statusDiv.innerHTML = '';
        }, 5000);
    });
});

async function loadPortfolioData() {
    // Load Profile
    const profile = await fetchFromAPI('/portfolio/profile');
    if (profile) {
        document.getElementById('home-name').textContent = profile.full_name || 'Your Name';
        document.getElementById('footer-name').textContent = profile.full_name || 'Your Name';
        document.getElementById('home-tagline').textContent = profile.tagline || 'Your Tagline';
        document.getElementById('home-intro').textContent = profile.about_intro || '';
        document.getElementById('about-objective').textContent = profile.career_objective || '';
        document.getElementById('about-strengths').textContent = profile.strengths || '';
        document.getElementById('about-interests').textContent = profile.interests || '';
        document.getElementById('about-languages').textContent = profile.languages || '';
        
        const imgSrc = getImageUrl(profile.profile_image);
        document.getElementById('home-profile-img').src = imgSrc;
        document.getElementById('about-profile-img').src = imgSrc;

        // Dynamically set the favicon to the profile image
        let favicon = document.querySelector("link[rel~='icon']");
        if (!favicon) {
            favicon = document.createElement('link');
            favicon.rel = 'icon';
            document.head.appendChild(favicon);
        }
        favicon.href = imgSrc;
    }

    // Load Social Links
    const socials = await fetchFromAPI('/portfolio/social-links');
        let socialHTML = '';
        socials.forEach(link => {
            if(link.url && link.url !== '#') {
                if (link.icon_class) {
                    socialHTML += `<a href="${link.url}" target="_blank" aria-label="${link.platform}"><i class="${link.icon_class}"></i></a>`;
                } else {
                    socialHTML += `<a href="${link.url}" target="_blank" class="social-text-link" aria-label="${link.platform}">${link.platform}</a>`;
                }
            }
        });
        document.getElementById('home-social').innerHTML = socialHTML;
        document.getElementById('contact-social').innerHTML = socialHTML;

    // Load Resume
    const resume = await fetchFromAPI('/portfolio/resume');
    if (resume && resume.file_path) {
        document.getElementById('home-resume-btn').href = getImageUrl(resume.file_path);
    } else {
        document.getElementById('home-resume-btn').style.display = 'none';
    }

    // Load Skills
    const skills = await fetchFromAPI('/portfolio/skills');
    if (skills) {
        const skillsContainer = document.getElementById('skills-container');
        // Group by category
        const categories = {};
        skills.forEach(skill => {
            if (!categories[skill.category]) categories[skill.category] = [];
            categories[skill.category].push(skill);
        });

        let skillsHTML = '';
        for (const [category, items] of Object.entries(categories)) {
            skillsHTML += `<div class="skill-category"><h3>${category}</h3>`;
            items.forEach(item => {
                skillsHTML += `
                    <div class="skill-item">
                        <div class="skill-info">
                            <span><i class="${item.icon_class || 'fas fa-check'}"></i> ${item.name}</span>
                            <span>${item.percentage}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress" style="width: ${item.percentage}%"></div>
                        </div>
                    </div>`;
            });
            skillsHTML += `</div>`;
        }
        skillsContainer.innerHTML = skillsHTML;
    }

    // Load Education
    const education = await fetchFromAPI('/portfolio/education');
    if (education) {
        const eduTimeline = document.getElementById('education-timeline');
        let eduHTML = '';
        education.forEach((edu, index) => {
            const side = index % 2 === 0 ? 'left' : 'right';
            eduHTML += `
                <div class="timeline-item ${side}">
                    <div class="timeline-content">
                        <h3>${edu.degree_branch}</h3>
                        <h4>${edu.institution_name}</h4>
                        <span class="score">${edu.score}</span>
                        <div class="date"><i class="far fa-calendar-alt"></i> ${edu.duration}</div>
                    </div>
                </div>`;
        });
        eduTimeline.innerHTML = eduHTML;
    }

    // Load Projects
    const projects = await fetchFromAPI('/portfolio/projects');
    if (projects) {
        const projectsGrid = document.getElementById('projects-grid');
        let projHTML = '';
        projects.forEach(proj => {
            const techs = (proj.technologies || '').split(',').map(t => `<span class="tech-tag">${t.trim()}</span>`).join('');
            const liveLink = proj.live_link && proj.live_link !== '#' ? `<a href="${proj.live_link}" target="_blank" class="btn btn-primary">Live Demo <i class="fas fa-external-link-alt"></i></a>` : '';
            const gitLink = proj.github_link && proj.github_link !== '#' ? `<a href="${proj.github_link}" target="_blank" class="btn btn-secondary"><i class="fab fa-github"></i> Code</a>` : '';
            
            projHTML += `
                <div class="project-card">
                    <div class="project-img">
                        <img src="${getImageUrl(proj.image_path)}" alt="${proj.title}">
                    </div>
                    <div class="project-info">
                        <h3>${proj.title}</h3>
                        <p>${proj.description}</p>
                        <div class="tech-stack">${techs}</div>
                        <div class="project-links">
                            ${liveLink}
                            ${gitLink}
                        </div>
                    </div>
                </div>`;
        });
        projectsGrid.innerHTML = projHTML;
    }

    // Load Certificates
    const certificates = await fetchFromAPI('/portfolio/certificates');
    if (certificates && certificates.length > 0) {
        const certGrid = document.getElementById('certificates-grid');
        let certHTML = '';
        certificates.forEach(cert => {
            const fileUrl = getImageUrl(cert.file_path);
            const isPdf = cert.file_path && cert.file_path.toLowerCase().endsWith('.pdf');
            
            let thumbnail = '';
            if (isPdf) {
                thumbnail = `<div class="cert-icon"><i class="fas fa-file-pdf"></i></div>`;
            } else {
                thumbnail = `<img src="${getImageUrl(cert.thumbnail_path)}" alt="${cert.title}" class="cert-thumbnail">`;
            }

            certHTML += `
                <div class="cert-card">
                    ${thumbnail}
                    <h4>${cert.title}</h4>
                    <p>${cert.issuing_org} | ${new Date(cert.issue_date).toLocaleDateString()}</p>
                    <a href="${fileUrl}" target="_blank" class="btn btn-secondary btn-block">View <i class="fas fa-eye"></i></a>
                </div>`;
        });
        certGrid.innerHTML = certHTML;
    } else {
        document.getElementById('certificates').style.display = 'none';
    }
}
