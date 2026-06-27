const API_BASE = 'http://localhost:5000/api';

function getToken() {
    return localStorage.getItem('adminToken');
}

function authHeaders(isJSON = true) {
    const headers = { 'Authorization': `Bearer ${getToken()}` };
    if (isJSON) headers['Content-Type'] = 'application/json';
    return headers;
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
    const token = getToken();
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Verify token validity with the backend
    try {
        const verifyRes = await fetch(`${API_BASE}/admin/verify`, {
            headers: authHeaders(false)
        });
        if (!verifyRes.ok) {
            if (verifyRes.status === 401 || verifyRes.status === 403) {
                // Token is genuinely invalid or expired
                localStorage.removeItem('adminToken');
                window.location.href = 'login.html';
                return;
            } else if (verifyRes.status === 404) {
                console.warn('Verify endpoint not found. Please restart your backend server!');
            }
        }
    } catch (err) {
        console.error('Failed to verify token', err);
        // If the server is just down, we might not want to log them out immediately,
        // but for security, it's safer to require re-authentication or just show an error.
    }

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('adminToken');
        window.location.href = 'login.html';
    });

    // Mobile menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // Sidebar Navigation
    const links = document.querySelectorAll('.sidebar-menu a');
    const sections = document.querySelectorAll('.section-content');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            const targetSection = link.getAttribute('data-section');
            sections.forEach(sec => {
                sec.style.display = sec.id === `section-${targetSection}` ? 'block' : 'none';
            });

            // Load data for each section
            switch (targetSection) {
                case 'profile': loadProfile(); break;
                case 'skills': loadSkills(); break;
                case 'education': loadEducation(); break;
                case 'projects': loadProjects(); break;
                case 'certificates': loadCertificates(); break;
                case 'resume': loadResume(); break;
                case 'social-links': loadSocialLinks(); break;
                case 'messages': loadMessages(); break;
            }

            // Close mobile sidebar
            sidebar.classList.remove('open');
        });
    });

    // ===== PROFILE =====
    loadProfile();

    document.getElementById('profile-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('full_name', document.getElementById('prof-name').value);
        formData.append('tagline', document.getElementById('prof-tagline').value);
        formData.append('about_intro', document.getElementById('prof-intro').value);
        formData.append('career_objective', document.getElementById('prof-objective').value);
        formData.append('strengths', document.getElementById('prof-strengths').value);
        formData.append('interests', document.getElementById('prof-interests').value);
        formData.append('languages', document.getElementById('prof-languages').value);

        // Preserve existing profile image path if no new image is selected
        const currentImagePath = document.getElementById('prof-image').getAttribute('data-current-path') || '';
        formData.append('profile_image_path', currentImagePath);

        const imageFile = document.getElementById('prof-image').files[0];
        if (imageFile) {
            formData.append('profile_image', imageFile);
        }

        try {
            const response = await fetch(`${API_BASE}/admin/profile`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${getToken()}` },
                body: formData
            });
            if (response.ok) {
                showToast('Profile updated successfully!');
                loadProfile();
            } else {
                const errData = await response.json().catch(() => ({}));
                showToast('Failed to update profile: ' + (errData.error || 'Unknown error'), 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Network error', 'error');
        }
    });

    // ===== SKILLS =====
    document.getElementById('btn-add-skill').addEventListener('click', () => {
        document.getElementById('skill-form-container').style.display = 'block';
        document.getElementById('skill-form-title').textContent = 'Add New Skill';
        document.getElementById('skill-form').reset();
        document.getElementById('skill-edit-id').value = '';
    });

    document.getElementById('btn-cancel-skill').addEventListener('click', () => {
        document.getElementById('skill-form-container').style.display = 'none';
    });

    document.getElementById('skill-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const editId = document.getElementById('skill-edit-id').value;
        const data = {
            category: document.getElementById('skill-category').value,
            name: document.getElementById('skill-name').value,
            percentage: parseInt(document.getElementById('skill-percentage').value),
            icon_class: document.getElementById('skill-icon').value
        };

        try {
            const url = editId ? `${API_BASE}/admin/skills/${editId}` : `${API_BASE}/admin/skills`;
            const method = editId ? 'PUT' : 'POST';
            const response = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(data) });
            if (response.ok) {
                showToast(editId ? 'Skill updated!' : 'Skill added!');
                document.getElementById('skill-form-container').style.display = 'none';
                loadSkills();
            } else {
                showToast('Failed to save skill.', 'error');
            }
        } catch (err) {
            showToast('Network error', 'error');
        }
    });

    // ===== EDUCATION =====
    document.getElementById('btn-add-edu').addEventListener('click', () => {
        document.getElementById('edu-form-container').style.display = 'block';
        document.getElementById('edu-form-title').textContent = 'Add Education';
        document.getElementById('edu-form').reset();
        document.getElementById('edu-edit-id').value = '';
    });

    document.getElementById('btn-cancel-edu').addEventListener('click', () => {
        document.getElementById('edu-form-container').style.display = 'none';
    });

    document.getElementById('edu-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const editId = document.getElementById('edu-edit-id').value;
        const data = {
            type: document.getElementById('edu-type').value,
            institution_name: document.getElementById('edu-institution').value,
            degree_branch: document.getElementById('edu-degree').value,
            score: document.getElementById('edu-score').value,
            duration: document.getElementById('edu-duration').value
        };

        try {
            const url = editId ? `${API_BASE}/admin/education/${editId}` : `${API_BASE}/admin/education`;
            const method = editId ? 'PUT' : 'POST';
            const response = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(data) });
            if (response.ok) {
                showToast(editId ? 'Education updated!' : 'Education added!');
                document.getElementById('edu-form-container').style.display = 'none';
                loadEducation();
            } else {
                showToast('Failed to save education.', 'error');
            }
        } catch (err) {
            showToast('Network error', 'error');
        }
    });

    // ===== PROJECTS =====
    document.getElementById('btn-add-project').addEventListener('click', () => {
        document.getElementById('project-form-container').style.display = 'block';
        document.getElementById('project-form-title').textContent = 'Add Project';
        document.getElementById('project-form').reset();
        document.getElementById('project-edit-id').value = '';
    });

    document.getElementById('btn-cancel-project').addEventListener('click', () => {
        document.getElementById('project-form-container').style.display = 'none';
    });

    document.getElementById('project-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const editId = document.getElementById('project-edit-id').value;
        const formData = new FormData();
        formData.append('title', document.getElementById('project-title').value);
        formData.append('description', document.getElementById('project-desc').value);
        formData.append('technologies', document.getElementById('project-tech').value);
        formData.append('github_link', document.getElementById('project-github').value);
        formData.append('live_link', document.getElementById('project-live').value);

        const imageFile = document.getElementById('project-image').files[0];
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            const url = editId ? `${API_BASE}/admin/projects/${editId}` : `${API_BASE}/admin/projects`;
            const method = editId ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method,
                headers: { 'Authorization': `Bearer ${getToken()}` },
                body: formData
            });
            if (response.ok) {
                showToast(editId ? 'Project updated!' : 'Project added!');
                document.getElementById('project-form-container').style.display = 'none';
                loadProjects();
            } else {
                showToast('Failed to save project.', 'error');
            }
        } catch (err) {
            showToast('Network error', 'error');
        }
    });

    // ===== CERTIFICATES =====
    document.getElementById('btn-add-cert').addEventListener('click', () => {
        document.getElementById('cert-form-container').style.display = 'block';
        document.getElementById('cert-form-title').textContent = 'Add Certificate';
        document.getElementById('cert-form').reset();
        document.getElementById('cert-edit-id').value = '';
    });

    document.getElementById('btn-cancel-cert').addEventListener('click', () => {
        document.getElementById('cert-form-container').style.display = 'none';
    });

    document.getElementById('cert-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const editId = document.getElementById('cert-edit-id').value;
        const formData = new FormData();
        formData.append('title', document.getElementById('cert-title').value);
        formData.append('issuing_org', document.getElementById('cert-org').value);
        formData.append('issue_date', document.getElementById('cert-date').value);

        const certFile = document.getElementById('cert-file').files[0];
        if (certFile) {
            formData.append('file', certFile);
        }

        try {
            const url = editId ? `${API_BASE}/admin/certificates/${editId}` : `${API_BASE}/admin/certificates`;
            const method = editId ? 'PUT' : 'POST';
            const response = await fetch(url, {
                method,
                headers: { 'Authorization': `Bearer ${getToken()}` },
                body: formData
            });
            if (response.ok) {
                showToast(editId ? 'Certificate updated!' : 'Certificate added!');
                document.getElementById('cert-form-container').style.display = 'none';
                loadCertificates();
            } else {
                showToast('Failed to save certificate.', 'error');
            }
        } catch (err) {
            showToast('Network error', 'error');
        }
    });

    // ===== RESUME =====
    document.getElementById('resume-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData();
        const resumeFile = document.getElementById('resume-file').files[0];
        if (!resumeFile) {
            showToast('Please select a file.', 'error');
            return;
        }
        formData.append('file', resumeFile);

        try {
            const response = await fetch(`${API_BASE}/admin/resume`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${getToken()}` },
                body: formData
            });
            if (response.ok) {
                showToast('Resume uploaded!');
                document.getElementById('resume-form').reset();
                loadResume();
            } else {
                showToast('Failed to upload resume.', 'error');
            }
        } catch (err) {
            showToast('Network error', 'error');
        }
    });
});

// ===== LOAD FUNCTIONS =====

async function loadProfile() {
    try {
        const response = await fetch(`${API_BASE}/portfolio/profile`);
        const data = await response.json();
        if (data) {
            document.getElementById('prof-name').value = data.full_name || '';
            document.getElementById('prof-tagline').value = data.tagline || '';
            document.getElementById('prof-intro').value = data.about_intro || '';
            document.getElementById('prof-objective').value = data.career_objective || '';
            document.getElementById('prof-strengths').value = data.strengths || '';
            document.getElementById('prof-interests').value = data.interests || '';
            document.getElementById('prof-languages').value = data.languages || '';
            // Store current image path on the file input for preservation
            const imageInput = document.getElementById('prof-image');
            imageInput.setAttribute('data-current-path', data.profile_image || '');
            const label = document.getElementById('current-image-label');
            if (data.profile_image) {
                label.textContent = `Current image: ${data.profile_image}`;
                
                // Dynamically set the favicon in the admin dashboard
                let favicon = document.querySelector("link[rel~='icon']");
                if (!favicon) {
                    favicon = document.createElement('link');
                    favicon.rel = 'icon';
                    document.head.appendChild(favicon);
                }
                favicon.href = `http://localhost:5000/${data.profile_image}`;
            } else {
                label.textContent = 'No image uploaded';
            }
        }
    } catch (err) {
        console.error('Error loading profile', err);
    }
}

async function loadSkills() {
    try {
        const response = await fetch(`${API_BASE}/portfolio/skills`);
        const skills = await response.json();
        const tbody = document.getElementById('skills-tbody');

        if (!skills || skills.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-state"><i class="fas fa-cogs"></i><p>No skills added yet.</p></td></tr>';
            return;
        }

        tbody.innerHTML = skills.map(skill => `
            <tr>
                <td><span class="tech-tag" style="display:inline-block">${skill.category}</span></td>
                <td>${skill.name}</td>
                <td>
                    <div class="percentage-bar">
                        <div class="bar"><div class="fill" style="width:${skill.percentage}%"></div></div>
                        <span>${skill.percentage}%</span>
                    </div>
                </td>
                <td><i class="${skill.icon_class || ''}"></i> ${skill.icon_class || '-'}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn-admin btn-warning btn-sm" onclick="editSkill(${skill.id}, '${escapeStr(skill.category)}', '${escapeStr(skill.name)}', ${skill.percentage}, '${escapeStr(skill.icon_class)}')"><i class="fas fa-edit"></i></button>
                        <button class="btn-admin btn-danger btn-sm" onclick="deleteSkill(${skill.id})"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error loading skills', err);
    }
}

async function loadEducation() {
    try {
        const response = await fetch(`${API_BASE}/portfolio/education`);
        const eduList = await response.json();
        const tbody = document.getElementById('education-tbody');

        if (!eduList || eduList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><i class="fas fa-graduation-cap"></i><p>No education entries yet.</p></td></tr>';
            return;
        }

        tbody.innerHTML = eduList.map(edu => `
            <tr>
                <td><span class="tech-tag" style="display:inline-block">${edu.type}</span></td>
                <td>${edu.institution_name}</td>
                <td>${edu.degree_branch || '-'}</td>
                <td>${edu.score || '-'}</td>
                <td>${edu.duration || '-'}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn-admin btn-warning btn-sm" onclick="editEducation(${edu.id}, '${escapeStr(edu.type)}', '${escapeStr(edu.institution_name)}', '${escapeStr(edu.degree_branch)}', '${escapeStr(edu.score)}', '${escapeStr(edu.duration)}')"><i class="fas fa-edit"></i></button>
                        <button class="btn-admin btn-danger btn-sm" onclick="deleteEducation(${edu.id})"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error loading education', err);
    }
}

async function loadProjects() {
    try {
        const response = await fetch(`${API_BASE}/portfolio/projects`);
        const projects = await response.json();
        const grid = document.getElementById('projects-grid');

        if (!projects || projects.length === 0) {
            grid.innerHTML = '<div class="empty-state"><i class="fas fa-project-diagram"></i><p>No projects yet. Click "Add Project" to get started.</p></div>';
            return;
        }

        grid.innerHTML = projects.map(project => {
            const imgSrc = project.image_path ? `http://localhost:5000/${project.image_path}` : 'images/default.jpg';
            const techs = project.technologies ? project.technologies.split(',').map(t => `<span class="tech-tag">${t.trim()}</span>`).join('') : '';
            return `
                <div class="project-card">
                    <img src="${imgSrc}" alt="${escapeStr(project.title)}" onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'300\\' height=\\'160\\'><rect fill=\\'%231a1d2e\\' width=\\'300\\' height=\\'160\\'/><text fill=\\'%23555\\' x=\\'50%25\\' y=\\'50%25\\' text-anchor=\\'middle\\' dy=\\'.3em\\' font-size=\\'14\\'>No Image</text></svg>'">
                    <div class="card-body">
                        <h4>${project.title}</h4>
                        <p>${project.description || ''}</p>
                        <div class="tech-tags">${techs}</div>
                        <div class="card-actions">
                            <button class="btn-admin btn-warning btn-sm" onclick="editProject(${project.id})"><i class="fas fa-edit"></i> Edit</button>
                            <button class="btn-admin btn-danger btn-sm" onclick="deleteProject(${project.id})"><i class="fas fa-trash"></i> Delete</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.error('Error loading projects', err);
    }
}

async function loadCertificates() {
    try {
        const response = await fetch(`${API_BASE}/portfolio/certificates`);
        const certs = await response.json();
        const tbody = document.getElementById('certs-tbody');

        if (!certs || certs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-state"><i class="fas fa-certificate"></i><p>No certificates yet.</p></td></tr>';
            return;
        }

        tbody.innerHTML = certs.map(cert => {
            const dateStr = cert.issue_date ? new Date(cert.issue_date).toLocaleDateString() : '-';
            const fileLink = cert.file_path ? `<a href="http://localhost:5000/${cert.file_path}" target="_blank" style="color:var(--admin-primary)">View</a>` : '-';
            return `
                <tr>
                    <td>${cert.title}</td>
                    <td>${cert.issuing_org || '-'}</td>
                    <td>${dateStr}</td>
                    <td>${fileLink}</td>
                    <td>
                        <div class="action-btns">
                            <button class="btn-admin btn-warning btn-sm" onclick="editCertificate(${cert.id}, '${escapeStr(cert.title)}', '${escapeStr(cert.issuing_org)}', '${cert.issue_date ? cert.issue_date.split('T')[0] : ''}')"><i class="fas fa-edit"></i></button>
                            <button class="btn-admin btn-danger btn-sm" onclick="deleteCertificate(${cert.id})"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.error('Error loading certificates', err);
    }
}

async function loadResume() {
    try {
        const response = await fetch(`${API_BASE}/portfolio/resume`);
        const data = await response.json();
        const container = document.getElementById('current-resume');

        if (data && data.file_path) {
            const uploadDate = data.upload_date ? new Date(data.upload_date).toLocaleDateString() : '';
            container.innerHTML = `
                <div class="file-info">
                    <i class="fas fa-file-pdf"></i>
                    <div>
                        <strong>${data.original_filename || 'Resume'}</strong>
                        <span>Uploaded: ${uploadDate}</span>
                    </div>
                </div>
                <div class="action-btns">
                    <a href="http://localhost:5000/${data.file_path}" target="_blank" class="btn-admin btn-sm"><i class="fas fa-eye"></i> View</a>
                    <button class="btn-admin btn-danger btn-sm" onclick="deleteResume(${data.id})"><i class="fas fa-trash"></i> Delete</button>
                </div>
            `;
        } else {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-file-alt"></i><p>No resume uploaded yet.</p></div>';
        }
    } catch (err) {
        console.error('Error loading resume', err);
    }
}

async function loadSocialLinks() {
    try {
        const response = await fetch(`${API_BASE}/portfolio/social-links`);
        const links = await response.json();
        const container = document.getElementById('social-links-list');

        if (!links || links.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-share-alt"></i><p>No social links yet.</p></div>';
            return;
        }

        container.innerHTML = links.map(link => `
            <div class="social-link-item">
                <span class="platform-label">${link.platform}</span>
                <input type="url" value="${link.url || ''}" id="social-url-${link.id}" placeholder="Enter ${link.platform} URL...">
                <button class="btn-admin btn-sm" onclick="saveSocialLink(${link.id})"><i class="fas fa-save"></i> Save</button>
            </div>
        `).join('');
    } catch (err) {
        console.error('Error loading social links', err);
    }
}

async function loadMessages() {
    try {
        const response = await fetch(`${API_BASE}/admin/messages`, {
            headers: authHeaders(false)
        });
        const messages = await response.json();
        const tbody = document.getElementById('messages-tbody');
        const noMsg = document.getElementById('no-messages');

        if (!messages || messages.length === 0) {
            tbody.innerHTML = '';
            noMsg.style.display = 'block';
            return;
        }

        noMsg.style.display = 'none';
        tbody.innerHTML = messages.map(msg => {
            const dateStr = msg.created_at ? new Date(msg.created_at).toLocaleDateString() : '-';
            return `
                <tr>
                    <td>${msg.name}</td>
                    <td>${msg.email}</td>
                    <td>${msg.subject || '-'}</td>
                    <td>${msg.message}</td>
                    <td>${dateStr}</td>
                    <td><button class="btn-admin btn-danger btn-sm" onclick="deleteMessage(${msg.id})"><i class="fas fa-trash"></i></button></td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.error('Error loading messages', err);
    }
}

// ===== EDIT FUNCTIONS =====

function editSkill(id, category, name, percentage, icon_class) {
    document.getElementById('skill-form-container').style.display = 'block';
    document.getElementById('skill-form-title').textContent = 'Edit Skill';
    document.getElementById('skill-edit-id').value = id;
    document.getElementById('skill-category').value = category;
    document.getElementById('skill-name').value = name;
    document.getElementById('skill-percentage').value = percentage;
    document.getElementById('skill-icon').value = icon_class;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function editEducation(id, type, institution_name, degree_branch, score, duration) {
    document.getElementById('edu-form-container').style.display = 'block';
    document.getElementById('edu-form-title').textContent = 'Edit Education';
    document.getElementById('edu-edit-id').value = id;
    document.getElementById('edu-type').value = type;
    document.getElementById('edu-institution').value = institution_name;
    document.getElementById('edu-degree').value = degree_branch;
    document.getElementById('edu-score').value = score;
    document.getElementById('edu-duration').value = duration;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function editProject(id) {
    // Fetch current project data and populate form
    try {
        const response = await fetch(`${API_BASE}/portfolio/projects`);
        const projects = await response.json();
        const project = projects.find(p => p.id === id);
        if (project) {
            document.getElementById('project-form-container').style.display = 'block';
            document.getElementById('project-form-title').textContent = 'Edit Project';
            document.getElementById('project-edit-id').value = id;
            document.getElementById('project-title').value = project.title || '';
            document.getElementById('project-desc').value = project.description || '';
            document.getElementById('project-tech').value = project.technologies || '';
            document.getElementById('project-github').value = project.github_link || '';
            document.getElementById('project-live').value = project.live_link || '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    } catch (err) {
        showToast('Error loading project', 'error');
    }
}

function editCertificate(id, title, issuing_org, issue_date) {
    document.getElementById('cert-form-container').style.display = 'block';
    document.getElementById('cert-form-title').textContent = 'Edit Certificate';
    document.getElementById('cert-edit-id').value = id;
    document.getElementById('cert-title').value = title;
    document.getElementById('cert-org').value = issuing_org;
    document.getElementById('cert-date').value = issue_date;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== DELETE FUNCTIONS =====

async function deleteSkill(id) {
    if (!confirm('Delete this skill?')) return;
    try {
        const response = await fetch(`${API_BASE}/admin/skills/${id}`, { method: 'DELETE', headers: authHeaders(false) });
        if (response.ok) { showToast('Skill deleted!'); loadSkills(); }
        else showToast('Failed to delete.', 'error');
    } catch (err) { showToast('Network error', 'error'); }
}

async function deleteEducation(id) {
    if (!confirm('Delete this education entry?')) return;
    try {
        const response = await fetch(`${API_BASE}/admin/education/${id}`, { method: 'DELETE', headers: authHeaders(false) });
        if (response.ok) { showToast('Education deleted!'); loadEducation(); }
        else showToast('Failed to delete.', 'error');
    } catch (err) { showToast('Network error', 'error'); }
}

async function deleteProject(id) {
    if (!confirm('Delete this project?')) return;
    try {
        const response = await fetch(`${API_BASE}/admin/projects/${id}`, { method: 'DELETE', headers: authHeaders(false) });
        if (response.ok) { showToast('Project deleted!'); loadProjects(); }
        else showToast('Failed to delete.', 'error');
    } catch (err) { showToast('Network error', 'error'); }
}

async function deleteCertificate(id) {
    if (!confirm('Delete this certificate?')) return;
    try {
        const response = await fetch(`${API_BASE}/admin/certificates/${id}`, { method: 'DELETE', headers: authHeaders(false) });
        if (response.ok) { showToast('Certificate deleted!'); loadCertificates(); }
        else showToast('Failed to delete.', 'error');
    } catch (err) { showToast('Network error', 'error'); }
}

async function deleteResume(id) {
    if (!confirm('Delete the resume?')) return;
    try {
        const response = await fetch(`${API_BASE}/admin/resume/${id}`, { method: 'DELETE', headers: authHeaders(false) });
        if (response.ok) { showToast('Resume deleted!'); loadResume(); }
        else showToast('Failed to delete.', 'error');
    } catch (err) { showToast('Network error', 'error'); }
}

async function deleteMessage(id) {
    if (!confirm('Delete this message?')) return;
    try {
        const response = await fetch(`${API_BASE}/admin/messages/${id}`, { method: 'DELETE', headers: authHeaders(false) });
        if (response.ok) { showToast('Message deleted!'); loadMessages(); }
        else showToast('Failed to delete.', 'error');
    } catch (err) { showToast('Network error', 'error'); }
}

// ===== SOCIAL LINKS SAVE =====

async function saveSocialLink(id) {
    const url = document.getElementById(`social-url-${id}`).value;
    try {
        const response = await fetch(`${API_BASE}/admin/social-links/${id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ url })
        });
        if (response.ok) {
            showToast('Social link updated!');
        } else {
            showToast('Failed to update.', 'error');
        }
    } catch (err) {
        showToast('Network error', 'error');
    }
}

// ===== UTILITY =====

function escapeStr(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}
