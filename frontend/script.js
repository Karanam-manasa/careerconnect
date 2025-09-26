const adminLoginBtn = document.getElementById('adminLoginBtn');
const userLoginBtn = document.getElementById('userLoginBtn');
const getStartedBtn = document.getElementById('getStartedBtn');
const jobSeekerCard = document.getElementById('jobSeekerCard');
const employerCard = document.getElementById('employerCard');

const userModal = document.getElementById('userModal');
const closeUserModal = document.getElementById('closeUserModal');
const closeUserModal2 = document.getElementById('closeUserModal2');

const userLoginForm = document.getElementById('userLoginForm');
const userSignupForm = document.getElementById('userSignupForm');

const userLoginFormContainer = document.getElementById('userLoginFormContainer');
const userSignupFormContainer = document.getElementById('userSignupFormContainer');

const adminDashboard = document.getElementById('adminDashboard');
const logoutBtn = document.getElementById('logoutBtn');
const createJobBtn = document.getElementById('createJobBtn');
const jobFormContainer = document.getElementById('jobFormContainer');
const dashboardContent = document.getElementById('dashboardContent');
const createJobForm = document.getElementById('createJobForm');
const cancelJobForm = document.getElementById('cancelJobForm');

let selectedUserType = null;
let editingJobId = null;
const API_BASE_URL = 'https://careerconnect-backendd.onrender.com/api';

const allSkills = [
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'TypeScript', 'PHP', 'Ruby', 'Go', 'Swift', 'Kotlin', 'Rust',
    'HTML', 'CSS', 'React', 'Angular', 'Vue.js', 'Svelte', 'jQuery', 'Bootstrap', 'Tailwind CSS',
    'Node.js', 'Express.js', 'Django', 'Flask', 'Ruby on Rails', 'ASP.NET', 'Spring Boot',
    'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Oracle',
    'Docker', 'Kubernetes', 'AWS', 'Google Cloud (GCP)', 'Microsoft Azure', 'Terraform', 'CI/CD', 'Jenkins',
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'NLP', 'Computer Vision',
    'Data Analysis', 'Pandas', 'NumPy', 'R', 'Matplotlib', 'Tableau', 'Power BI',
    'React Native', 'Flutter', 'Android (Java/Kotlin)', 'iOS (Swift)',
    'Git', 'REST APIs', 'GraphQL', 'Cybersecurity', 'Linux',
    'Communication', 'Teamwork', 'Problem Solving', 'Project Management', 'Agile Methodologies', 'Leadership'
];

let jobQualificationsChoices = null; 

const jobTitles = ['Software Developer', 'Full Stack Developer', 'Frontend Developer', 'Backend Developer', 'Data Scientist', 'Product Manager', 'UX/UI Designer', 'Digital Marketing', 'Other'];
const locations = ['Remote', 'New York, NY', 'San Francisco, CA', 'Austin, TX', 'Chicago, IL', 'Online', 'PAN INDIA', 'Other'];
const jobCategories = ['Technology', 'Marketing', 'Design', 'Business', 'Data Science', 'Engineering', 'Other'];


/**
 * @param {HTMLElement} selectElement 
 * @param {string[]} optionsArray 
 */
function populateDropdown(selectElement, optionsArray) {

    selectElement.innerHTML = '<option value="">Select an option</option>'; 
    optionsArray.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        selectElement.appendChild(optionElement);
    });
}

/**
 * @param {Event} e 
 */
function handleDropdownChange(e) {
    const selectElement = e.target;
    const otherInputId = selectElement.dataset.otherId;
    const otherInputElement = document.getElementById(otherInputId);

    if (selectElement.value === 'Other') {
        otherInputElement.style.display = 'block';
        otherInputElement.required = true;
    } else {
        otherInputElement.style.display = 'none';
        otherInputElement.required = false;
        otherInputElement.value = ''; 
    }
}

/**

 * @param {string} selectElementId 
 * @returns {string}
 */
function getDynamicSelectValue(selectElementId) {
    const selectElement = document.getElementById(selectElementId);
    if (selectElement.value === 'Other') {
        const otherInputId = selectElement.dataset.otherId;
        return document.getElementById(otherInputId).value.trim();
    }
    return selectElement.value;
}

document.addEventListener('DOMContentLoaded', () => {
    const dynamicSelects = document.querySelectorAll('#createJobForm .dynamic-select');

    dynamicSelects.forEach(select => {
        select.addEventListener('change', handleDropdownChange);
        if (select.id === 'jobTitleSelect') {
            populateDropdown(select, jobTitles);
        } else if (select.id === 'locationSelect') {
            populateDropdown(select, locations);
        } else if (select.id === 'jobCategorySelect') {
            populateDropdown(select, jobCategories); 
        }
    });
});

async function makeApiCall(endpoint, method, body = null, isFormData = false) {
    const options = {
        method,
        headers: {}
    };

    if (isFormData) {
        options.body = body;
    } else if (body) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        return { error: 'Failed to connect to server' };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const jobIdFromUrl = urlParams.get('job');

    if (jobIdFromUrl) {
        localStorage.setItem('deepLinkedJobId', jobIdFromUrl);
        userModal.classList.add('active');
        userLoginFormContainer.style.display = 'block';
        userSignupFormContainer.style.display = 'none';
    }
});

function setActiveMenu(linkSelector) {
    document.querySelectorAll('.admin-sidebar li').forEach(li => li.classList.remove('active'));
    const link = document.querySelector(`a[href="${linkSelector}"]`);
    if (link) link.parentElement.classList.add('active');
}

function attachEditDeleteHandlers() {
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const jobId = e.currentTarget.getAttribute('data-jobid');
            openEditJobForm(jobId);
        });
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const jobId = e.currentTarget.getAttribute('data-jobid');
            deleteJob(jobId);
        });
    });
}

/**
 * @param {object} job 
 * @returns {string} 
 */
function createJobCardHTML(job) {
    const now = new Date();
    const isExpired = new Date(job.applicationDeadline) < now;

    let skillsPreview = '';
    const skillsToShow = job.qualifications.slice(0, 3);
    if (skillsToShow.length > 0) {
        skillsPreview = skillsToShow.map(skill => 
            `<span class="skill-tag-preview">${skill}</span>`
        ).join('');
        if (job.qualifications.length > 3) {
            skillsPreview += `<span class="skill-tag-more">+${job.qualifications.length - 3} more</span>`;
        }
    }

    const matchScoreHTML = job.matchCount && job.matchCount > 0
        ? `<div class="match-score">✅ ${job.matchCount} Skill${job.matchCount > 1 ? 's' : ''} Matched</div>`
        : '';
            return `
            <div class="job-card job-clickable ${isExpired ? 'expired-job' : ''}" data-jobid="${job._id}">
                <div class="job-card-header">
                    <div class="job-card-icon">
                        <i class="fas fa-briefcase"></i>
                    </div>
                    <div class="job-card-title-group">
                        <h3>${job.title}</h3>
                        <p class="job-card-company">${job.company}</p>
                    </div>
                </div>
                <div class="job-card-details">
                    <p><i class="fas fa-map-marker-alt"></i> ${job.location}</p>
                    <p><i class="fas fa-clock"></i> ${job.jobType}</p>
                </div>
                ${matchScoreHTML}
                <div class="skills-preview-container">
                    ${skillsPreview}
                </div>
                <div class="job-card-footer">
                    ${isExpired 
                        ? '<p class="job-status-closed">Application Closed</p>' 
                        : `<p class="posted-date">Posted on ${new Date(job.datePosted).toLocaleDateString()}</p>`
                    }
                </div>
            </div>
            `;
        }

function showHomePage() {
    document.querySelector('header').style.display = 'block';
    document.querySelector('.hero').style.display = 'flex';
    document.querySelector('.features').style.display = 'block';
    document.querySelector('footer').style.display = 'block';
    adminDashboard.style.display = 'none';
    userDashboard.style.display = 'none';
}

function attachJobCardClickHandlers() {
    const container = document.getElementById('jobsDisplayContainer');
    if (!container) return;

    container.querySelectorAll('.job-clickable').forEach(card => {
        card.addEventListener('click', async () => {
            const jobId = card.getAttribute('data-jobid');
            const job = await makeApiCall(`/jobs/${jobId}`, 'GET');
            userAdminContent.innerHTML = `
                <div class="job-detail-card">
                    <h2 class="job-title">${job.title}</h2>
                    <div class="job-info-grid">
                        <p><strong>Company:</strong> ${job.company}</p>
                        <p><strong>Location:</strong> ${job.location}</p>
                        <p><strong>Type:</strong> ${job.jobType}</p>
                        <p><strong>Category:</strong> ${job.jobCategory}</p>
                        <p><strong>Salary:</strong> ${job.salary || 'Not disclosed'}</p>
                        <p><strong>Deadline:</strong> ${new Date(job.applicationDeadline).toLocaleDateString()}</p>
                    </div>
                    <div class="job-description">
                        <h4>Description</h4>
                        <p>${job.description}</p>
                        <h4>Qualifications</h4>
                        <p>${job.qualifications}</p>
                    </div>
                    <div class="job-actions-buttons">
                        <button class="apply-btn" id="applyNowBtn">Apply Now</button>
                        <button class="btn btn-outline" id="backToDashboardJobsBtn">← Back to Dashboard</button>
                    </div>
                </div>
            `;

            document.getElementById('backToDashboardJobsBtn').addEventListener('click', () => {
                userDashboardLink.click();
            });
            document.getElementById('applyNowBtn').addEventListener('click', () => {
                handleApply(job._id, job.applyLink);
            });
        });
    });
}

async function showTopMatches() {
    const jobsListTitle = document.getElementById('jobsListTitle');
    const jobsDisplayContainer = document.getElementById('jobsDisplayContainer');

    if (jobsListTitle) jobsListTitle.innerHTML = '🏆 Top Matches for You';
    if (!jobsDisplayContainer) return; 
    jobsDisplayContainer.innerHTML = '<p>Loading your personalized job recommendations...</p>';

    try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.id) throw new Error("User not logged in");

        const [userData, allJobs] = await Promise.all([
            makeApiCall(`/users/${user.id}`, 'GET'),
            makeApiCall('/jobs', 'GET')
        ]);

        if (userData.error || !userData.skills || userData.skills.length === 0) {
             jobsDisplayContainer.innerHTML = `<p>Add skills to your profile to get personalized recommendations!</p>`;
             return;
        }

        const userSkills = new Set(userData.skills);
        const now = new Date();

        const jobsWithMatchCount = allJobs
            .filter(job => new Date(job.applicationDeadline) >= now)
            .map(job => {
                const requiredSkills = job.qualifications || [];
                const matchedSkills = requiredSkills.filter(skill => userSkills.has(skill));
                return { ...job, matchCount: matchedSkills.length };
            })
            .filter(job => job.matchCount > 0);

        jobsWithMatchCount.sort((a, b) => b.matchCount - a.matchCount);
        const top10Jobs = jobsWithMatchCount;

        if (top10Jobs.length === 0) {
            jobsDisplayContainer.innerHTML = `<p>No jobs currently match your skills. Explore all jobs using the search bar!</p>`;
        } else {
            jobsDisplayContainer.innerHTML = top10Jobs.map(job => createJobCardHTML(job)).join('');
            attachJobCardClickHandlers();
        }
    } catch (error) {
        console.error("Error loading top matches:", error);
        jobsDisplayContainer.innerHTML = `<p class="error">Could not load job recommendations.</p>`;
    }
}

adminLoginBtn.addEventListener('click', () => {
    const adminLoginHTML = `
        <div class="auth-form">
            <button class="close-btn" id="closeAdminModal">&times;</button>
            <h2>Job Poster Login</h2>
            <form id="adminLoginForm">
                <div class="form-group">
                    <label for="adminEmail">Email</label>
                    <input type="email" id="adminEmail" placeholder="Enter admin email" required>
                </div>
                <div class="form-group">
                <label for="AdminPassword">Enter Password</label>
                <div class="input-with-icon">
                    <input type="password" id="adminPassword" placeholder="Enter password" required>
                    <span class="toggle-password" onclick="togglePassword('adminPassword')">
                        <i class="fas fa-eye"></i>
                    </span>
                </div>
            </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">Login</button>
            </form>
        </div>
    `;

    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay active';
    modalOverlay.id = 'adminModal';
    modalOverlay.innerHTML = adminLoginHTML;
    document.body.appendChild(modalOverlay);
    document.getElementById('adminLoginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;
        if (email === 'careerconnect868@gmail.com' && password === 'Admin@123') {
            alert('Admin login successful!');
            document.querySelector('header').style.display = 'none';
            document.querySelector('.hero').style.display = 'none';
            document.querySelector('.features').style.display = 'none';
            document.querySelector('footer').style.display = 'none';
            modalOverlay.remove();
            adminDashboard.style.display = 'block';
            setActiveMenu('#dashboard');
            navigationHistory = [];
            showDashboard();
        } else {
            alert('Invalid admin credentials. Please try again.');
        }
    });

    document.getElementById('closeAdminModal').addEventListener('click', () => modalOverlay.remove());
    modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) modalOverlay.remove(); });
});

function showAdminDashboard() {
    showHomePage(); 
    adminDashboard.style.display = 'block';
    document.querySelector('header').style.display = 'none';
    document.querySelector('.hero').style.display = 'none';
    document.querySelector('.features').style.display = 'none';
    document.querySelector('footer').style.display = 'none';
    setActiveMenu('#dashboard');
    showDashboard();
}

let navigationHistory = [];
function pushToHistory(section, contentFunction) {
    navigationHistory.push({ section, contentFunction });
}
function goBack() {
    if (navigationHistory.length > 1) {
        navigationHistory.pop(); 
        const prevState = navigationHistory[navigationHistory.length - 1];
        prevState.contentFunction();
    }
}

async function showDashboard() {
    pushToHistory('dashboard', showDashboard);
    dashboardContent.innerHTML = 
    `<div class="back-navigation" onclick="goBack()" style="display: ${navigationHistory.length > 1 ? 'block' : 'none'}">
            <i class="fas fa-chevron-left"></i> Back
        </div>
        <h2>Recently Posted Jobs</h2>
        <div class="blue-wrapper">
        <div class="activity-list" id="recentJobsContainer"></div>
    </div>`;
    const response = await makeApiCall('/jobs', 'GET');
    if (response.error) return console.error('Error loading jobs:', response.error);
    const now = new Date();
    const recentJobs = response.sort((a, b) => new Date(b.datePosted) - new Date(a.datePosted)).slice(0, 5);
    const container = document.getElementById('recentJobsContainer');
container.innerHTML = recentJobs.map(job => {
    const postedDate = new Date(job.datePosted);
    const deadline = new Date(job.applicationDeadline);
    const isExpired = deadline < now;

    return `
        <div class="activity-item">
            <div class="activity-icon"><i class="fas fa-briefcase"></i></div>
            <div class="activity-content">
                <h4>${job.title}</h4>
                <p>${job.company} - ${job.location}</p>
                <p>${job.jobType} | ${job.salary || 'Salary not disclosed'}</p>
                ${isExpired ? '<p style="color: red; font-weight: bold;">🔴 Application has ended</p>' : ''}
                <span class="activity-time">Posted on ${new Date(job.datePosted).toLocaleDateString()}</span>
                <div class="job-actions">
                    <button class="btn-edit" data-jobid="${job._id}"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn-delete" data-jobid="${job._id}"><i class="fas fa-trash"></i> Delete</button>
                </div>
            </div>
        </div>
    `;
}).join('');
    attachEditDeleteHandlers();
}

document.querySelector('a[href="#dashboard"]').addEventListener('click', (e) => {
    e.preventDefault();
    setActiveMenu('#dashboard');
    showDashboard();
});

document.querySelector('a[href="#jobs"]').addEventListener('click', async (e) => {
    e.preventDefault();
    setActiveMenu('#jobs');
    pushToHistory('manageJobs', () => {
    document.querySelector('a[href="#jobs"]').click();
});
        dashboardContent.innerHTML = `
            <div class="back-navigation" onclick="goBack()" style="display: ${navigationHistory.length > 1 ? 'block' : 'none'}">
                <i class="fas fa-chevron-left"></i> Back
            </div>
            <h2>All Jobs</h2>
           <div class="blue-wrapper" style="padding: 20px; border-radius: 10px;">
            <div id="allJobsContainer" class="job-cards-grid"></div>
        </div>
    </div>
    `;
    const container = document.getElementById('allJobsContainer');
    const jobs = await makeApiCall('/jobs', 'GET');
    container.innerHTML = jobs.map(job => {
    const deadline = new Date(job.applicationDeadline);
    const isExpired = deadline < new Date();

        return `
            <div class="job-card">
                <h3>${job.title}</h3>
                <p><strong>Company:</strong> ${job.company}</p>
                <p><strong>Location:</strong> ${job.location}</p>
                <p><strong>Type:</strong> ${job.jobType}</p>
                <p><strong>Salary:</strong> ${job.salary || 'Not disclosed'}</p>
                <p class="posted-date">Posted on ${new Date(job.datePosted).toLocaleDateString()}</p>
                ${isExpired ? '<p style="color: red; font-weight: bold;">🔴 Application has ended</p>' : ''}
                <div class="job-actions">
                    <button class="btn-edit" data-jobid="${job._id}"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn-delete" data-jobid="${job._id}"><i class="fas fa-trash"></i> Delete</button>
                </div>
            </div>
        `;
    }).join('');   
    attachEditDeleteHandlers();
});

document.querySelector('a[href="#deletedJobs"]').addEventListener('click', async (e) => {
    e.preventDefault();
    setActiveMenu('#deletedJobs');
    pushToHistory('deletedJobs', () => {
        document.querySelector('a[href="#deletedJobs"]').click();
    });

    dashboardContent.innerHTML = `
        <div class="back-navigation" onclick="goBack()">
            <i class="fas fa-chevron-left"></i> Back
        </div>
        <h2>Deleted Jobs</h2>
        <div class="blue-wrapper">
        <div class="search-bar" style="margin-bottom: 15px;">
            <input type="text" id="deletedJobSearch" placeholder="Search by title, company, location..." style="padding: 8px; width: 300px;">
            <button id="searchDeletedJobsBtn" style="padding: 8px 12px; margin-left: 8px;">Search</button>
        </div>
        <div id="deletedJobsContainer" class="job-cards-grid"></div>
    `;

    const container = document.getElementById('deletedJobsContainer');
    let allDeletedJobs = [];
    try {
        const deletedJobs = await makeApiCall('/deleted-jobs', 'GET');
        allDeletedJobs = deletedJobs;
        renderDeletedJobs(allDeletedJobs);
    } catch (err) {
        console.error('Error loading deleted jobs:', err);
        container.innerHTML = '<p>Error loading deleted jobs.</p>';
    }

    document.getElementById('searchDeletedJobsBtn').addEventListener('click', () => {
        const query = document.getElementById('deletedJobSearch').value.toLowerCase().trim();
        const filtered = allDeletedJobs.filter(job =>
            job.title.toLowerCase().includes(query) ||
            job.company.toLowerCase().includes(query) ||
            job.location.toLowerCase().includes(query)
        );
        renderDeletedJobs(filtered, query);
    });

    document.getElementById('deletedJobSearch').addEventListener('input', () => {
    const query = document.getElementById('deletedJobSearch').value.toLowerCase().trim();
    const filtered = allDeletedJobs.filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query)
    );
    renderDeletedJobs(filtered, query);
});

    function renderDeletedJobs(jobs, query = '') {
        if (jobs.length === 0) {
            container.innerHTML = '<p>No matching deleted jobs found.</p>';
            return;
        }
        const sortedJobs = jobs.sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));
        container.innerHTML = sortedJobs.map(job => `
            <div class="job-card">
                <h3>${highlightMatch(job.title, query)}</h3>
                <p><strong>Company:</strong> ${highlightMatch(job.company, query)}</p>
                <p><strong>Location:</strong> ${highlightMatch(job.location, query)}</p>
                <p><strong>Type:</strong> ${job.jobType}</p>
                <p><strong>Deleted At:</strong> ${new Date(job.deletedAt).toLocaleDateString()}</p>
                <button class="btn btn-primary restore-btn" data-id="${job._id}">Restore</button>
            </div>
        `).join('');
    }

    container.addEventListener('click', async (e) => {
        if (e.target.classList.contains('restore-btn')) {
            const jobId = e.target.getAttribute('data-id');
            const confirmRestore = confirm('Are you sure you want to restore this job?');
            if (!confirmRestore) return;
            const response = await makeApiCall(`/deleted-jobs/${jobId}/restore`, 'POST');
            if (response.error) {
                alert(response.error);
            } else {
                alert('Job restored successfully!');
                document.querySelector('a[href="#jobs"]').click(); 
            }
        }
    });
});

function highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, `<span class="highlight" style="background-color: yellow;">$1</span>`);
}

createJobBtn.addEventListener('click', () => {
    pushToHistory('createJob', () => {
        createJobBtn.click();
    });
    document.getElementById('postingDate').value = new Date().toISOString().split('T')[0];
    jobFormContainer.style.display = 'block';
    dashboardContent.style.display = 'none';
    const qualificationsElement = document.getElementById('qualifications');
    if (jobQualificationsChoices) {
        jobQualificationsChoices.destroy();
    }
    jobQualificationsChoices = new Choices(qualificationsElement, {
        removeItemButton: true,
        placeholder: true,
        placeholderValue: 'Select required skills...'
    });
    jobQualificationsChoices.setChoices(
        allSkills.map(skill => ({ value: skill, label: skill })),
        'value',
        'label',
        false
    );
});

const formHeader = document.querySelector('#jobFormContainer .form-header');
    formHeader.insertAdjacentHTML('afterbegin', `
        <div class="back-navigation" onclick="cancelJobForm.click()">
            <i class="fas fa-chevron-left"></i> Back
        </div>
    `);
        cancelJobForm.addEventListener('click', () => {
            jobFormContainer.style.display = 'none';
            dashboardContent.style.display = 'block';
            createJobForm.reset();
            editingJobId = null;
            goBack(); 
        });
        const today = new Date().toISOString().split('T')[0];

function validateJobForm(form) {
    const patterns = {
        lettersOnly: /^[A-Za-z\s.]+$/,
        location: /^[A-Za-z\s,]+$/,
        description: /^[\w\s.,:;()\/&'-]+$/,
        stipend: /^(\d+(-\d+)?|NA|Not Disclosed|N\/A|Negotiable)$/i,
        validURL: /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/
    };

    const title = getDynamicSelectValue('jobTitleSelect');
    const company = form.company.value.trim();
    const location = getDynamicSelectValue('locationSelect');
    const category = getDynamicSelectValue('jobCategorySelect');

    const description = form.jobDescription.value.trim();
    const qualifications = jobQualificationsChoices.getValue(true);
    
    const stipend = form.salary.value.trim();
    const applyLink = form.applyLink.value.trim();
    const postingDate = new Date(form.postingDate.value);
    const deadline = new Date(form.applicationDeadline.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!patterns.lettersOnly.test(title)) {
        alert("Job title should contain only letters.");
        return false;
    }
    if (!patterns.lettersOnly.test(company)) {
        alert("Company name should contain only letters.");
        return false;
    }
    if (!patterns.location.test(location)) {
        alert("Location should contain only letters and commas.");
        return false;
    }
    if (!patterns.lettersOnly.test(category)) {
        alert("Job category should contain only letters.");
        return false;
    }
    if (!patterns.description.test(description)) {
        alert("Job description can include letters, numbers and (:/,-&).");
        return false;
    }

    if (qualifications.length === 0) {
        alert("Please select at least one qualification/skill.");
        return false;
    }
    if (stipend && !patterns.stipend.test(stipend)) {
        alert("Stipend must be a number, a range like 5000-8000, or a valid term like 'Negotiable'.");
        return false;
    }
    if (!patterns.validURL.test(applyLink)) {
        alert("Please enter a valid apply link.");
        return false;
    }
    if (deadline < postingDate) {
        alert("Application deadline must be after the posting date.");
        return false;
    }
    return true;
}

createJobForm.addEventListener('submit', async (e) => {
    e.preventDefault();
     if (!validateJobForm(createJobForm)) {
        return;
    }
    const selectedQualifications = jobQualificationsChoices.getValue(true);

    const formData = {
        title: getDynamicSelectValue('jobTitleSelect'),
        company: document.getElementById('company').value,
        location: getDynamicSelectValue('locationSelect'),
        jobType: document.getElementById('jobType').value,
        jobCategory: getDynamicSelectValue('jobCategorySelect'),
        description: document.getElementById('jobDescription').value,
        qualifications: selectedQualifications.join(','),
        salary: document.getElementById('salary').value,
        applicationDeadline: document.getElementById('applicationDeadline').value,
        postingDate: document.getElementById('postingDate').value,
        applyLink: document.getElementById('applyLink').value,
        postedBy: 'Admin'
    };

    let response;
    if (editingJobId) {
        response = await makeApiCall(`/jobs/${editingJobId}`, 'PUT', formData);
    } else {
        response = await makeApiCall('/jobs', 'POST', formData);
    }
    
    if (response.error) {
        alert(response.error);
    } else {
        alert(editingJobId ? 'Job updated successfully!' : 'Job created successfully!');
        createJobForm.reset();

        document.querySelectorAll('.other-input').forEach(input => {
            input.style.display = 'none';
            input.required = false;
        });

        editingJobId = null; 
        jobFormContainer.style.display = 'none';
        dashboardContent.style.display = 'block';
        goBack();
        showDashboard();
    }
});

async function openEditJobForm(jobId) {
    editingJobId = jobId; 
    pushToHistory('editJob', () => {
        openEditJobForm(jobId);
    });
    const response = await makeApiCall(`/jobs/${jobId}`, 'GET');
    if (response.error) {
        alert(response.error);
        return;
    }

    const setDynamicSelect = (selectId, optionsArray, value) => {
        const select = document.getElementById(selectId);
        const otherInput = document.getElementById(select.dataset.otherId);
        if (optionsArray.includes(value)) {
            select.value = value;
            otherInput.style.display = 'none';
            otherInput.required = false;
        } else {
            select.value = 'Other';
            otherInput.value = value;
            otherInput.style.display = 'block';
            otherInput.required = true;
        }
    };

    jobFormContainer.style.display = 'block';
    dashboardContent.style.display = 'none';
    const qualificationsElement = document.getElementById('qualifications');
    if (jobQualificationsChoices) {
        jobQualificationsChoices.destroy();
    }
    jobQualificationsChoices = new Choices(qualificationsElement, {
        removeItemButton: true,
        placeholder: true,
        placeholderValue: 'Select required skills...'
    });
    jobQualificationsChoices.setChoices(
        allSkills.map(skill => ({ value: skill, label: skill })),
        'value',
        'label',
        false
    );

    setDynamicSelect('jobTitleSelect', jobTitles, response.title);
    document.getElementById('company').value = response.company;
    setDynamicSelect('locationSelect', locations, response.location);
    document.getElementById('jobType').value = response.jobType;
    setDynamicSelect('jobCategorySelect', jobCategories, response.jobCategory);
    document.getElementById('jobDescription').value = response.description;

    if (response.qualifications && response.qualifications.length > 0) {
        jobQualificationsChoices.setValue(response.qualifications);
    }
    
    document.getElementById('salary').value = response.salary;
    document.getElementById('applicationDeadline').value = response.applicationDeadline?.split('T')[0];
    document.getElementById('postingDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('applyLink').value = response.applyLink;


    jobFormContainer.style.display = 'block';
    dashboardContent.style.display = 'none';
}
        async function deleteJob(jobId) {
            if (confirm('Are you sure you want to delete this job?')) {
                const response = await makeApiCall(`/jobs/${jobId}`, 'DELETE');
                if (response.error) {
                    alert(response.error);
                } else {
                    alert('Job deleted successfully!');
                    document.querySelector('a[href="#jobs"]').click();
                }
            }
        }
logoutBtn.addEventListener('click', () => {
    showHomePage();
});

userLoginBtn.addEventListener('click', () => {
    userModal.classList.add('active');
    userLoginFormContainer.style.display = 'block';
    userSignupFormContainer.style.display = 'none';
});

getStartedBtn.addEventListener('click', () => {
    if (selectedUserType === 'jobSeeker') {
        userModal.classList.add('active');
        userLoginFormContainer.style.display = 'block';
        userSignupFormContainer.style.display = 'none';
    } else if (selectedUserType === 'employer') {
        userModal.classList.add('active');
        userLoginFormContainer.style.display = 'none';
        userSignupFormContainer.style.display = 'block';
    } else {
        alert('Please select whether you are a Job Seeker or Job Poster.');
    }
});

jobSeekerCard.addEventListener('click', () => {
    selectedUserType = 'jobSeeker';
    jobSeekerCard.classList.add('selected');
    employerCard.classList.remove('selected');
});

employerCard.addEventListener('click', () => {
    selectedUserType = 'employer';
    employerCard.classList.add('selected');
    jobSeekerCard.classList.remove('selected');
});

closeUserModal.addEventListener('click', () => userModal.classList.remove('active'));
closeUserModal2.addEventListener('click', () => userModal.classList.remove('active'));

document.getElementById('showSignupForm').addEventListener('click', (e) => {
    e.preventDefault();
    userLoginFormContainer.style.display = 'none';
    userSignupFormContainer.style.display = 'block';
});

document.getElementById('showLoginForm').addEventListener('click', (e) => {
    e.preventDefault();
    userLoginFormContainer.style.display = 'block';
    userSignupFormContainer.style.display = 'none';
});
const phoneInput = document.getElementById('phone');
const phoneError = document.getElementById('phoneError');
const phonePattern = /^[1-9][0-9]{9}$/;
phoneInput.addEventListener('input', () => {
    const value = phoneInput.value;
    const isValid = phonePattern.test(value);

    if (!isValid && value.length > 0) {
        phoneError.textContent = 'Must be a number.';
    } else {
        phoneError.textContent = '';
    }
});

userSignupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('phone').value;
    const userType = document.getElementById('userType').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const usernamePattern = /^[A-Za-z0-9_-]+$/;
    if (!usernamePattern.test(username)) {
        alert('Username should be Valid.');
        return;
    }
    const phonePattern = /^[1-9][0-9]{9}$/;
    if (!phonePattern.test(phone)) {
        alert('Phone number should be Valid.');
        return;
    }if (!usernamePattern.test(username)) {
        alert('Username should be Valid.');
        return;
    }if (!phonePattern.test(phone)) {
        alert('Phone number should be Valid.');
        return;
    }if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
    if (!strongPasswordPattern.test(password)) {
        alert('Password must be at least 8 characters long and include uppercase, lowercase, and a special character.');
        return;
    }
    if (!isEmailVerified) {
    alert('Please verify your email before signing up.');
    return;
}

    const response = await makeApiCall('/signup', 'POST', { username, email, phone, userType, password, confirmPassword });
    if (response.error) {
        alert(response.error);
    } else {
        alert('Account created successfully! You can now login.');
        userLoginFormContainer.style.display = 'block';
        userSignupFormContainer.style.display = 'none';
        userSignupForm.reset();
    }
});

userLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('userEmail').value;
    const password = document.getElementById('userPassword').value;
    const response = await makeApiCall('/login', 'POST', { email, password });

    if (response.error) {
        alert(response.error);
    } else {
        alert('Login successful!');
        localStorage.setItem('user', JSON.stringify({
            id: response.user.id,
            username: response.user.username,
            email: response.user.email
        }));
        userModal.classList.remove('active');
        navigationHistory = [];
        const deepLinkedJobId = localStorage.getItem('deepLinkedJobId');

        if (deepLinkedJobId) {
            console.log(`Deep link action: Showing details for job ${deepLinkedJobId}`);
            showUserJobDetails(deepLinkedJobId);
            localStorage.removeItem('deepLinkedJobId');
        } else {
            showUserDashboard();
        }
    }
});
let isEmailVerified = false;

document.getElementById('sendOtpBtn').addEventListener('click', async () => {
    const email = document.getElementById('signupEmail').value;
    if (!email) return alert("Enter email first");
    const res = await makeApiCall('/send-otp', 'POST', { email });
    if (res.message) {
        document.getElementById('emailOtp').style.display = 'inline-block';
        document.getElementById('verifyOtpBtn').style.display = 'inline-block';
        document.getElementById('otpStatus').textContent = 'OTP sent!';
    }
});

document.getElementById('verifyOtpBtn').addEventListener('click', async () => {
    const email = document.getElementById('signupEmail').value;
    const otp = document.getElementById('emailOtp').value;
    const statusEl = document.getElementById('otpStatus');
    const res = await makeApiCall('/verify-otp', 'POST', { email, otp });
    if (res.message) {
        isEmailVerified = true;
        statusEl.textContent = '✅ Email verified!';
        statusEl.classList.remove('error');
        statusEl.classList.add('success');
        
    } else {
        statusEl.textContent = '❌ Invalid OTP. Please try again.';
        statusEl.classList.remove('success');
        statusEl.classList.add('error');
    }
});
        const passwordField = document.getElementById('signupPassword');
        const confirmPasswordField = document.getElementById('confirmPassword');
        const passwordHelp = document.getElementById('passwordHelpText');

        passwordField.addEventListener('input', function () {
        const password = passwordField.value;
        const ruleLength = document.getElementById('rule-length');
        const ruleUpper = document.getElementById('rule-upper');
        const ruleLower = document.getElementById('rule-lower');
        const ruleSpecial = document.getElementById('rule-special');

        toggleRuleClass(ruleLength, password.length >= 8);
        toggleRuleClass(ruleUpper, /[A-Z]/.test(password));
        toggleRuleClass(ruleLower, /[a-z]/.test(password));
        toggleRuleClass(ruleSpecial, /\W/.test(password));
        });

        function toggleRuleClass(element, condition) {
        if (condition) {
            element.classList.add('valid');
            element.classList.remove('invalid');
        } else {
            element.classList.add('invalid');
            element.classList.remove('valid');
        }
        }

        passwordField.addEventListener('focus', () => {
        passwordHelp.style.display = 'block';
        });

        confirmPasswordField.addEventListener('focus', () => {
        passwordHelp.style.display = 'none';
        });

        document.addEventListener('click', (e) => {
        if (e.target !== passwordField && e.target !== confirmPasswordField) {
            passwordHelp.style.display = 'none';
        }
        });


function showUserDashboard() {
    showHomePage();
    userDashboard.style.display = 'block';
    document.querySelector('header').style.display = 'none';
    document.querySelector('.hero').style.display = 'none';
    document.querySelector('.features').style.display = 'none';
    document.querySelector('footer').style.display = 'none';
    document.querySelector('#userDashboard a[href="#dashboard"]').click();
}

if (userLogoutBtn) {
    userLogoutBtn.addEventListener('click', () => {
        localStorage.removeItem('user');
        location.reload();
    });
}

window.addEventListener('click', (e) => {
    if (e.target === userModal) {
        userModal.classList.remove('active');
    }
});

function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const icon = field.nextElementSibling.querySelector('i');
    if (field.type === "password") {
        field.type = "text";
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        field.type = "password";
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

const userViewJobsLink = document.querySelector('#userDashboard a[href="#jobs"]');
const userAdminContent = document.querySelector('#userDashboard .admin-content');

if (userViewJobsLink) {
    userViewJobsLink.addEventListener('click', async (e) => {
        e.preventDefault();
        pushToHistory('userJobs', () => userViewJobsLink.click());
        document.querySelectorAll('#userDashboard .admin-sidebar li').forEach(li => li.classList.remove('active'));
        userViewJobsLink.parentElement.classList.add('active');

        userAdminContent.innerHTML = `
            <div class="back-navigation" onclick="goBack()" style="display: ${navigationHistory.length > 1 ? 'block' : 'none'}">
                <i class="fas fa-chevron-left"></i> Back
            </div>
            <h2>Available Jobs</h2>
            <div class="search-bar" style="margin-bottom: 20px;">
                <input type="text" id="userJobSearchTitle" placeholder="Search by title, company, or skill...">
                <input type="text" id="userJobSearchLocation" placeholder="Search by location...">
                <select id="userJobSearchType">
                    <option value="">All Types</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Webinar">Webinar</option>
                </select>
            </div>
            <div class="blue-wrapper">
                <div id="userJobsContainer" class="job-cards-grid"></div>
            </div>`;

        const attachClickEventsToJobCards = () => {
            document.querySelectorAll('#userJobsContainer .job-clickable').forEach(card => {
                card.addEventListener('click', () => {
                    const jobId = card.dataset.jobid;
                    showUserJobDetails(jobId);
                });
            });
        };

        const loadAndFilterUserJobs = async () => {
            const container = document.getElementById('userJobsContainer');
            if (!container) return;
            
            const titleQuery = document.getElementById('userJobSearchTitle').value.toLowerCase().trim();
            const locationQuery = document.getElementById('userJobSearchLocation').value.toLowerCase().trim();
            const typeQuery = document.getElementById('userJobSearchType').value;

            container.innerHTML = '<p>Loading jobs...</p>';

            try {
                const jobs = await makeApiCall('/jobs', 'GET');
                if (!jobs || jobs.error) {
                    container.innerHTML = '<p class="error">Could not load jobs.</p>';
                    return;
                }

                const filteredJobs = jobs.filter(job => {
                    const matchesTitle = !titleQuery ||
                        job.title.toLowerCase().includes(titleQuery) ||
                        job.company.toLowerCase().includes(titleQuery) ||
                        job.qualifications.join(' ').toLowerCase().includes(titleQuery);
                    
                    const matchesLocation = !locationQuery ||
                        job.location.toLowerCase().includes(locationQuery);

                    const matchesType = !typeQuery || job.jobType === typeQuery;

                    return matchesTitle && matchesLocation && matchesType;
                });

                if (filteredJobs.length === 0) {
                    container.innerHTML = '<p>No jobs found matching your criteria.</p>';
                } else {
                    container.innerHTML = filteredJobs.map(job => createJobCardHTML(job)).join('');
                    attachClickEventsToJobCards();
                }
            } catch (error) {
                console.error('Error loading user jobs:', error);
                container.innerHTML = '<p class="error">Error loading jobs. Please try again later.</p>';
            }
        };

        document.getElementById('userJobSearchTitle').addEventListener('input', loadAndFilterUserJobs);
        document.getElementById('userJobSearchLocation').addEventListener('input', loadAndFilterUserJobs);
        document.getElementById('userJobSearchType').addEventListener('change', loadAndFilterUserJobs);

        loadAndFilterUserJobs();
    });
}


async function showUserJobDetails(jobId) {
    pushToHistory('jobDetail', () => showUserJobDetails(jobId)); 

    try {
        const job = await makeApiCall(`/jobs/${jobId}`, 'GET');
        if (job.error) {
            userAdminContent.innerHTML = `<p class="error">Could not load job details: ${job.error}</p>`;
            return;
        }

        const qualificationsHTML = job.qualifications && job.qualifications.length > 0
            ? job.qualifications.map(skill => `<span class="skill-tag">${skill}</span>`).join('')
            : '<p>No specific qualifications listed.</p>';

        userAdminContent.innerHTML = `
            <div class="job-detail-card">
                <h2 class="job-title">${job.title}</h2>
                <div class="job-info-grid">
                    <p><strong>Company:</strong> ${job.company}</p>
                    <p><strong>Location:</strong> ${job.location}</p>
                    <p><strong>Type:</strong> ${job.jobType}</p>
                    <p><strong>Category:</strong> ${job.jobCategory}</p>
                    <p><strong>Salary:</strong> ${job.salary || 'Not disclosed'}</p>
                    <p><strong>Deadline:</strong> ${new Date(job.applicationDeadline).toLocaleDateString()}</p>
                </div>
                <div class="job-description">
                    <h4>Description</h4>
                    <p>${job.description.replace(/\n/g, '<br>')}</p>
                    <h4>Required Skills</h4>
                    <div class="skills-list">
                        ${qualificationsHTML}
                    </div>
                </div>
                <div class="job-actions-buttons">
                    <button class="apply-btn" id="detailApplyBtn">Apply Now</button>
                    <button class="btn btn-outline" id="detailBackBtn">← Back to Jobs List</button>
                </div>
            </div>
        `;

        const applyBtn = document.getElementById('detailApplyBtn');
        const isExpired = new Date(job.applicationDeadline) < new Date();
        if(isExpired) {
            applyBtn.textContent = 'Application Closed';
            applyBtn.disabled = true;
        } else {
            applyBtn.addEventListener('click', () => handleApply(job._id, job.applyLink));
        }

        document.getElementById('detailBackBtn').addEventListener('click', () => {
            userViewJobsLink.click();
        });

    } catch (error) {
        console.error("Error showing job details:", error);
        userAdminContent.innerHTML = `<p class="error">An unexpected error occurred.</p>`;
    }
}      

const userApplicationsLink = document.querySelector('#userDashboard a[href="#applications"]');
if (userApplicationsLink) {
    userApplicationsLink.addEventListener('click', async (e) => {
        e.preventDefault();
        pushToHistory('userApplications', () => {
            userApplicationsLink.click();
        });
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.email) return alert('User not logged in');

        userAdminContent.innerHTML = `
            <div class="back-navigation" onclick="goBack()" style="display: ${navigationHistory.length > 1 ? 'block' : 'none'}">
                <i class="fas fa-chevron-left"></i> Back
            </div>
            <h2>My Applications</h2>
            
            <div class="blue-wrapper" style="padding: 20px; border-radius: 12px;"> 
                <div style="max-width: 300px; margin: 20px auto 30px;">
                    <canvas id="applicationStatusChart"></canvas>
                </div>

            <div class="applications-controls">
                <input type="text" id="applicationSearchInput" class="search-input" placeholder="Search by job title or company...">
                <select id="applicationStatusFilter" class="status-filter">
                    <option value="all">All Statuses</option>
                    <option value="Applied">Applied</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>
            
            <div id="userApplicationsContainer"></div>
        </div> 
        `;

        loadApplicationStatsChart(user.email);

        const container = document.getElementById('userApplicationsContainer');
        container.innerHTML = '<p>Loading your applications...</p>';

        let allUserApplications = []; 

        function renderApplicationCards(applicationsToRender) {
            if (!applicationsToRender || applicationsToRender.length === 0) {
                container.innerHTML = '<p>No applications match your search criteria.</p>';
                return;
            }

            container.innerHTML = applicationsToRender.map(app => `
                <div class="job-application-card">
                    <div class="job-icon">
                        <i class="fas fa-briefcase"></i>
                    </div>
                    <div class="job-info">
                        <h3>${app.jobTitle || 'Job Title Not Available'}</h3>
                        <p>${app.company || 'Company Not Available'}</p>
                        <p style="font-size: 0.8rem; margin-top: 5px; color: #888;">Applied on ${new Date(app.appliedAt).toLocaleDateString()}</p>
                    </div>
                    <div class="application-action">
                        <div class="status-badge status-${app.status.toLowerCase()}">${app.status}</div>
                        <button class="view-job-link btn btn-outline" data-jobid="${app.jobId}" ${!app.jobId ? 'disabled' : ''}>
                            ${app.jobId ? 'View Details' : 'Job Deleted'}
                        </button>
                    </div>
                </div>
            `).join('');
            
            document.querySelectorAll('.view-job-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (e.currentTarget.disabled) return;
                    const jobId = e.currentTarget.getAttribute('data-jobid');
                    showUserJobDetails(jobId);
                });
            });
        }
        
        function filterAndDisplayApplications() {
            const query = document.getElementById('applicationSearchInput').value.toLowerCase().trim();
            const status = document.getElementById('applicationStatusFilter').value;

            const filteredApplications = allUserApplications.filter(app => {
                const searchMatch = (
                    (app.jobTitle?.toLowerCase() || '').includes(query) ||
                    (app.company?.toLowerCase() || '').includes(query)
                );
                
                const statusMatch = (status === 'all' || app.status === status);
                return searchMatch && statusMatch;
            });

            renderApplicationCards(filteredApplications);
        }

        try {
            const response = await makeApiCall(`/applications/${user.email}`, 'GET');
            
            allUserApplications = response.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
            
            renderApplicationCards(allUserApplications);
            
            document.getElementById('applicationSearchInput').addEventListener('input', filterAndDisplayApplications);
            document.getElementById('applicationStatusFilter').addEventListener('change', filterAndDisplayApplications);

        } catch (error) {
            console.error('Error loading applications:', error);
            container.innerHTML = '<p class="error">Error loading applications. Please try again later.</p>';
        }
    });
}

const userProfileLink = document.querySelector('#userDashboard a[href="#profile"]');
if (userProfileLink) {
    userProfileLink.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('#userDashboard .admin-sidebar li').forEach(li => li.classList.remove('active'));
        userProfileLink.parentElement.classList.add('active');
        pushToHistory('profile', showUserProfile);
        showUserProfile();
    });
}

const userDashboardLink = document.querySelector('#userDashboard a[href="#dashboard"]');
if (userDashboardLink) {
    userDashboardLink.addEventListener('click', async (e) => {
        e.preventDefault();
        pushToHistory('userDashboard', () => userDashboardLink.click());
        document.querySelectorAll('#userDashboard .admin-sidebar li').forEach(li => li.classList.remove('active'));
        userDashboardLink.parentElement.classList.add('active');
        
        userAdminContent.innerHTML = `
            <div class="search-bar">
                <input type="text" id="searchTitle" placeholder="Filter recommendations by title, skill...">
                <input type="text" id="searchLocation" placeholder="Filter by location...">
                <select id="searchType">
                    <option value="">Filter by Type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Webinar">Webinar</option>
                </select>
            </div>

            <div class="blue-wrapper">
                <div class="dashboard-section">
                    <!-- THIS TITLE HAS BEEN CHANGED -->
                    <h2 id="jobsListTitle">🏆 Recommended For You</h2>
                    <div id="jobsDisplayContainer" class="job-cards-grid"></div>
                </div>
            </div>
        `;
            
        const updateDashboardView = async () => {
            const container = document.getElementById('jobsDisplayContainer');
            if (!container) return;
            
            container.innerHTML = '<p>Loading your recommendations...</p>';

            let topMatches = [];
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                if (!user || !user.id) throw new Error("User not logged in");

                const [userData, allJobs] = await Promise.all([
                    makeApiCall(`/users/${user.id}`, 'GET'),
                    makeApiCall('/jobs', 'GET')
                ]);

                if (userData.error || !userData.skills || userData.skills.length === 0) {
                    container.innerHTML = `<p>Add skills to your profile to get personalized recommendations!</p>`;
                    return;
                }

                const userSkills = new Set(userData.skills);
                const now = new Date();

                const jobsWithMatchCount = allJobs
                    .filter(job => new Date(job.applicationDeadline) >= now)
                    .map(job => ({
                        ...job,
                        matchCount: (job.qualifications || []).filter(skill => userSkills.has(skill)).length
                    }))
                    .filter(job => job.matchCount > 0);

                jobsWithMatchCount.sort((a, b) => b.matchCount - a.matchCount);
                topMatches = jobsWithMatchCount;

            } catch (error) {
                console.error("Error loading top matches:", error);
                container.innerHTML = `<p class="error">Could not load job recommendations.</p>`;
                return;
            }

            const titleQuery = document.getElementById('searchTitle').value.toLowerCase().trim();
            const locationQuery = document.getElementById('searchLocation').value.toLowerCase().trim();
            const typeQuery = document.getElementById('searchType').value;
            
            let filteredMatches = topMatches;
            
            if (titleQuery) {
                filteredMatches = filteredMatches.filter(job =>
                    job.title.toLowerCase().includes(titleQuery) ||
                    job.company.toLowerCase().includes(titleQuery) ||
                    job.qualifications.join(' ').toLowerCase().includes(titleQuery)
                );
            }
            if (locationQuery) {
                filteredMatches = filteredMatches.filter(job => job.location.toLowerCase().includes(locationQuery));
            }
            if (typeQuery) {
                filteredMatches = filteredMatches.filter(job => job.jobType === typeQuery);
            }

            if (filteredMatches.length === 0) {
                container.innerHTML = topMatches.length === 0 
                    ? '<p>No jobs currently match your skills. Explore all jobs in the "View Jobs" section.</p>'
                    : '<p>No recommendations found for your filter criteria.</p>';
            } else {
                container.innerHTML = filteredMatches.map(job => createJobCardHTML(job)).join('');
                attachJobCardClickHandlers();
            }
        };

        document.getElementById('searchTitle').addEventListener('input', updateDashboardView);
        document.getElementById('searchLocation').addEventListener('input', updateDashboardView);
        document.getElementById('searchType').addEventListener('change', updateDashboardView);

        updateDashboardView();
    });
}

function renderUserProfile(userData) {
    const avatar = userData.profilePicture
    ? `<img src="${API_BASE_URL.replace('/api', '')}/uploads/resumes/${userData.profilePicture}?t=${new Date().getTime()}" alt="Profile Picture" class="profile-picture">`
    : `<div class="profile-avatar"><i class="fas fa-user-circle"></i></div>`;

    const skillsHTML = userData.skills && userData.skills.length > 0
        ? userData.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')
        : '<p class="no-data">No skills added yet.</p>';

    const resumeLink = userData.resume
        ? `<a href="${API_BASE_URL.replace('/api', '')}/uploads/resumes/${userData.resume}" target="_blank">View Resume</a>`;
    
    const educationHTML = userData.education && userData.education.length > 0
        ? userData.education.map(edu => `
            <div class="education-card">
                <h4>${edu.degree || 'Degree'} in ${edu.fieldOfStudy || 'Field of Study'}</h4>
                <p>${edu.institution || 'Institution'}</p>
                <p class="education-years">${edu.startYear || 'N/A'} - ${edu.endYear || 'Present'}</p>
            </div>
        `).join('')
        : '<p class="no-data">No education details added yet.</p>';

    userAdminContent.innerHTML = `
        <div class="back-navigation" onclick="goBack()" style="display: ${navigationHistory.length > 1 ? 'block' : 'none'}">
            <i class="fas fa-chevron-left"></i> Back
        </div>
        <div class="profile-wrapper">
            <div class="profile-card">
                <div class="profile-header">
                    <div class="profile-header-info">
                        ${avatar}
                        <div class="profile-header-text">
                            <h2>${userData.fullName || userData.username}</h2>
                            <p>${userData.email}</p>
                        </div>
                    </div>
                    <button id="editProfileBtn" class="btn btn-outline">Edit Profile</button>
                </div>

                <div class="profile-section">
                    <h3>Education</h3>
                    ${educationHTML}
                </div>

                <div class="profile-section">
                    <h3>Contact & Professional Links</h3>
                    <div class="profile-details">
                        <p><strong>Phone:</strong> ${userData.phone || '<span class="no-data">Not provided</span>'}</p>
                        <p><strong>LinkedIn:</strong> ${userData.linkedin ? `<a href="${userData.linkedin}" target="_blank">${userData.linkedin}</a>` : '<span class="no-data">Not provided</span>'}</p>
                        <p><strong>Portfolio:</strong> ${userData.portfolio ? `<a href="${userData.portfolio}" target="_blank">${userData.portfolio}</a>` : '<span class="no-data">Not provided</span>'}</p>
                        <p><strong>Resume:</strong> ${resumeLink}</p>
                    </div>
                </div>

                <div class="profile-section">
                    <h3>Skills</h3>
                    <div class="skills-list">
                        ${skillsHTML}
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('editProfileBtn').addEventListener('click', () => showEditProfileForm(userData));
}

async function showUserProfile() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return alert('User not logged in.');
    const userDataResponse = await makeApiCall(`/users/${user.id}`, 'GET');
    if (userDataResponse.error) {
        userAdminContent.innerHTML = `<p class="error">Could not load profile.</p>`;
        return;
    }
    renderUserProfile(userDataResponse);
}

function showEditProfileForm(user) {
    pushToHistory('editProfile', () => showEditProfileForm(user));

    const createEducationBlock = (edu = {}) => {
        const degreeOptions = ['B.Tech', 'M.Tech', 'Polytechnic', 'Degree'];
        const branchOptions = ['CSE', 'CSE-AIML', 'CSE-AIDS', 'ME', 'Civil', 'ECE', 'EEE'];
        const generateSelectOptions = (options, selectedValue) => options.map(option => `<option value="${option}" ${selectedValue === option ? 'selected' : ''}>${option}</option>`).join('');
        return `<div class="education-entry-form"><input type="text" placeholder="Institution (e.g., XYZ University)" class="edu-institution" value="${edu.institution || ''}"><select class="edu-degree"><option value="">Select Degree</option>${generateSelectOptions(degreeOptions, edu.degree)}</select><select class="edu-field"><option value="">Select Branch</option>${generateSelectOptions(branchOptions, edu.fieldOfStudy)}</select><input type="number" placeholder="Start Year" class="edu-start" value="${edu.startYear || ''}"><input type="number" placeholder="End Year (or Expected)" class="edu-end" value="${edu.endYear || ''}"><button type="button" class="remove-education-btn" title="Remove Education"><i class="fas fa-trash-alt"></i></button></div>`;
    };

    const educationBlocks = user.education && user.education.length > 0 ? user.education.map(createEducationBlock).join('') : createEducationBlock();

    const avatarEditHTML = user.profilePicture
        ? `<img src="${API_BASE_URL.replace('/api', '')}/uploads/resumes/${userData.profilePicture}?t=${new Date().getTime()}" alt="Profile Picture" class="profile-picture">`
        : `<div class="profile-avatar"><i class="fas fa-user-circle"></i></div>`;

    userAdminContent.innerHTML = `
        <div class="back-navigation" onclick="goBack()">
            <i class="fas fa-chevron-left"></i> Back
        </div>
        <div class="profile-edit-container">
            <h2 class="profile-edit-title">Edit Your Profile</h2>
            <form id="editProfileForm" class="profile-edit-form">
                <div class="form-group">
                    <label>Profile Picture</label>
                    <div class="profile-picture-container">
                        ${avatarEditHTML}
                        ${user.profilePicture ? '<button type="button" id="deleteProfilePictureBtn" title="Delete picture"><i class="fas fa-trash-alt"></i></button>' : ''}
                    </div>
                    <input type="file" id="editProfilePicture" accept="image/jpeg, image/png" style="display: none;">
                    <input type="hidden" id="deleteProfilePictureFlag" value="false">
                    <small>Click on the picture to upload a new one.</small>
                </div>

                <div class="form-group">
                    <label for="editFullName">Full Name</label>
                    <input type="text" id="editFullName" value="${user.fullName || ''}" required>
                </div>

                <div class="form-group">
                    <label for="editUserType">Employment Type</label>
                    <select id="editUserType" required>
                        <option value="Undergraduate" ${user.userType === 'Undergraduate' ? 'selected' : ''}>UnderGraduate</option>
                        <option value="fresher" ${user.userType === 'fresher' ? 'selected' : ''}>Fresher</option>
                        <option value="experienced" ${user.userType === 'experienced' ? 'selected' : ''}>Experienced</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="editPhone">Phone Number</label>
                    <input type="tel" id="editPhone" value="${user.phone || ''}" required>
                </div>
                
                <div class="form-group">
                    <label>Education</label>
                    <div id="educationContainer">${educationBlocks}</div>
                    <button type="button" id="addEducationBtn" class="btn-outline">Add Another Education</button>
                </div>

                <div class="form-group">
                    <label for="editSkills">Skills</label>
                    <select id="editSkills" multiple></select>
                </div>
                <div class="form-group">
                    <label for="editLinkedin">LinkedIn Profile URL</label>
                    <input type="url" id="editLinkedin" value="${user.linkedin || ''}" placeholder="https://linkedin.com/in/yourprofile">
                </div>
                <div class="form-group">
                    <label for="editPortfolio">Portfolio/Website URL</label>
                    <input type="url" id="editPortfolio" value="${user.portfolio || ''}" placeholder="https://yourportfolio.com">
                </div>
                <div class="form-group">
                    <label for="editResume">Upload New Resume (PDF)</label>
                    <input type="file" id="editResume" accept=".pdf">
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-outline" onclick="showUserProfile()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
    `;
    
    const skillsElement = document.getElementById('editSkills');
    const skillsChoices = new Choices(skillsElement, { removeItemButton: true, placeholder: true, placeholderValue: 'Select skills...' });
    const allSkills = ['JavaScript', 'Python', 'Java', 'C++', 'C#', 'TypeScript', 'PHP', 'Ruby', 'Go', 'Swift', 'Kotlin', 'Rust', 'HTML', 'CSS', 'React', 'Angular', 'Vue.js', 'Svelte', 'jQuery', 'Bootstrap', 'Tailwind CSS', 'Node.js', 'Express.js', 'Django', 'Flask', 'Ruby on Rails', 'ASP.NET', 'Spring Boot', 'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Oracle', 'Docker', 'Kubernetes', 'AWS', 'Google Cloud (GCP)', 'Microsoft Azure', 'Terraform', 'CI/CD', 'Jenkins', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'NLP', 'Computer Vision', 'Data Analysis', 'Pandas', 'NumPy', 'R', 'Matplotlib', 'Tableau', 'Power BI', 'React Native', 'Flutter', 'Android (Java/Kotlin)', 'iOS (Swift)', 'Git', 'REST APIs', 'GraphQL', 'Cybersecurity', 'Linux', 'Communication', 'Teamwork', 'Problem Solving', 'Project Management', 'Agile Methodologies', 'Leadership'];
    skillsChoices.setChoices(allSkills.map(skill => ({ value: skill, label: skill })), 'value', 'label', false);
    if (user.skills && user.skills.length > 0) skillsChoices.setValue(user.skills);

    const picContainer = document.querySelector('.profile-picture-container');
    const fileInput = document.getElementById('editProfilePicture');
    const deleteFlagInput = document.getElementById('deleteProfilePictureFlag');

    const handleDeletePicture = () => {
        deleteFlagInput.value = 'true';
        fileInput.value = '';
        picContainer.innerHTML = `<div class="profile-avatar"><i class="fas fa-user-circle"></i></div>`;
    };

    picContainer.addEventListener('click', (e) => {
        if (e.target.closest('#deleteProfilePictureBtn')) {
            handleDeletePicture();
        } else {
            fileInput.click();
        }
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files && fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                deleteFlagInput.value = 'false';
                picContainer.innerHTML = `
                    <img src="${e.target.result}" alt="Profile Picture" class="profile-picture">
                    <button type="button" id="deleteProfilePictureBtn" title="Delete picture"><i class="fas fa-trash-alt"></i></button>
                `;
            };
            reader.readAsDataURL(fileInput.files[0]);
        }
    });

    document.getElementById('addEducationBtn').addEventListener('click', () => {
        document.getElementById('educationContainer').insertAdjacentHTML('beforeend', createEducationBlock());
    });
    document.getElementById('educationContainer').addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.remove-education-btn');
        if (removeBtn) {
            removeBtn.closest('.education-entry-form').remove();
        }
    });

    document.getElementById('editProfileForm').addEventListener('submit', async (e) => {
        e.preventDefault(); 
        
        const saveButton = e.target.querySelector('button[type="submit"]');
        saveButton.disabled = true;
        saveButton.textContent = 'Saving...';

        try {
            const educationData = [];
            document.querySelectorAll('.education-entry-form').forEach(block => {
                educationData.push({
                    institution: block.querySelector('.edu-institution').value,
                    degree: block.querySelector('.edu-degree').value,
                    fieldOfStudy: block.querySelector('.edu-field').value,
                    startYear: block.querySelector('.edu-start').value,
                    endYear: block.querySelector('.edu-end').value,
                });
            });
            
            const formData = new FormData();
            formData.append('fullName', document.getElementById('editFullName').value);
            formData.append('phone', document.getElementById('editPhone').value);
            formData.append('userType', document.getElementById('editUserType').value);
            formData.append('linkedin', document.getElementById('editLinkedin').value);
            formData.append('portfolio', document.getElementById('editPortfolio').value);
            formData.append('education', JSON.stringify(educationData));
            formData.append('skills', skillsChoices.getValue(true).join(','));

            if (document.getElementById('deleteProfilePictureFlag').value === 'true') {
                formData.append('deleteProfilePicture', 'true');
            }
            const profilePicFile = document.getElementById('editProfilePicture').files[0];
            if (profilePicFile) {
                formData.append('profilePicture', profilePicFile);
            }
            const resumeFile = document.getElementById('editResume').files[0];
            if (resumeFile) {
                formData.append('resume', resumeFile);
            }
            const response = await makeApiCall(`/users/${user._id}`, 'PUT', formData, true);

            if (response.error) throw new Error(response.error);
            
            alert('Profile updated successfully!');
            showUserProfile();

        } catch (error) {
            console.error('Failed to update profile:', error);
            alert(`Error: Could not update profile. ${error.message}`);
        
        } finally {
            saveButton.disabled = false;
            saveButton.textContent = 'Save Changes';
        }
    });
}
async function handleApply(jobId, applyLink) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.email) {
        alert("You must be logged in to apply.");
        return;
    }
    try {
        const job = await makeApiCall(`/jobs/${jobId}`, 'GET');
        const applyRes = await fetch(`${API_BASE_URL}/apply`,{
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jobId,
                userEmail: user.email,
                status: 'Clicked'
            })
        });
        const result = await applyRes.json();
        if (!applyRes.ok) {
            if (result.error === 'You have already applied for this job') {
                alert("⚠️ You have already applied for this job.");
            } else {
                alert("❌ Failed to apply: " + result.error);
            }
            return;
        }
        window.open(applyLink, '_blank');
        setTimeout(() => {
            const modal = document.getElementById('statusModal');
            modal.classList.add('active');
    const confirmUnload = (e) => {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave without confirming whether you applied or not?';
    };
    window.addEventListener('beforeunload', confirmUnload);
    const cleanUp = () => {
        modal.classList.remove('active');
        window.removeEventListener('beforeunload', confirmUnload);
    };
    document.getElementById('statusYesBtn').onclick = async () => {
        await makeApiCall('/apply/update-status', 'POST', {
                jobId,
                userEmail: user.email,
                status: 'Applied'
            });
            const emailResponse = await fetch(`${API_BASE_URL}/send-confirmation`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userEmail: user.email,
                        userName: user.username,
                        jobTitle: job.title,
                        company: job.company,
                        status: 'Applied'
                    })
                }).then(res => res.json());

                if (emailResponse.error) {
                    console.error('Email failed:', emailResponse.error);
                    alert("Status updated but email failed to send.");
                } else {
                    alert("✅ Application confirmed! Check your email.");
                    cleanUp();
                }
                modal.classList.remove('active');
            };

    document.getElementById('statusNoBtn').onclick = async () => {
        await makeApiCall('/apply/update-status', 'POST', {
                jobId,
                userEmail: user.email,
                status: 'Cancelled'
            });
            await fetch(`${API_BASE_URL}/send-confirmation`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userEmail: user.email,
                        userName: user.username,
                        jobTitle: job.title,
                        company: job.company,
                        status: 'Cancelled'
                    })
                });
                alert("Application status marked as 'Cancelled'");
                cleanUp();
            };
        }, 1000);

    } catch (err) {
        console.error("Error applying to job:", err);
        alert("Something went wrong while applying.");
    }
}

document.querySelector('a[href="#applications"]').addEventListener('click', async (e) => {
    e.preventDefault();
    setActiveMenu('#applications');
    pushToHistory('applications', () => {
        document.querySelector('a[href="#applications"]').click();
    });
    dashboardContent.innerHTML = `
        <div class="back-navigation" onclick="goBack()" style="display: ${navigationHistory.length > 1 ? 'block' : 'none'}">
            <i class="fas fa-chevron-left"></i> Back
        </div>
        <h2>Job Applications</h2>
        <div class="blue-wrapper" style="padding: 20px; border-radius: 10px;">
            <p style="margin-top: 10px; margin-bottom: 20px;">Choose what you want to view:</p>
            <div style="display: flex; gap: 15px; margin-bottom: 30px;">
                <button id="viewUserHistoryBtn" class="btn btn-outline">👤 Users History</button>
                <button id="viewJobCountBtn" class="btn btn-outline">📊 Applications Count</button>
            </div>
        <div class="search-bar" style="margin-bottom: 15px;">
            <input type="text" id="searchApplications" placeholder="Search by email, title, company, status..." style="padding: 8px; width: 300px;">
        </div>
        <div id="applicationsContainer" class="activity-list"></div>
    </div>
    `;

    const container = document.getElementById('applicationsContainer');
    try {
        const response = await makeApiCall('/applications', 'GET');
        if (response.error) {
            container.innerHTML = `<p class="error">${response.error}</p>`;
            return;
        }
        if (response.length === 0) {
            container.innerHTML = '<p>No applications found.</p>';
            return;
        }
        const allApplications = response;
        let currentView = 'user';
        container.addEventListener('click', (event) => {
            const header = event.target.closest('.job-application-header');
            if (!header) return;

            const listId = header.dataset.toggleTarget;
            const list = document.getElementById(listId);
            
            if (list) {
                const isVisible = list.style.display === 'block';
                list.style.display = isVisible ? 'none' : 'block';
            }
        });
        function toggleApplicationList(index) {
            const list = document.getElementById(`appList-${index}`);
            const icon = document.getElementById(`toggleIcon-${index}`);
            if (list) {
                 const isVisible = list.style.display === 'block';
                 list.style.display = isVisible ? 'none' : 'block';
                 if (icon) {
                    icon.classList.toggle('fa-chevron-down', isVisible);
                    icon.classList.toggle('fa-chevron-up', !isVisible);
                 }
            }
        }

        function toggleApplicantList(index) {
            const list = document.getElementById(`applicant-list-${index}`);
            if (list) {
                const isVisible = list.style.display === 'block';
                list.style.display = isVisible ? 'none' : 'block';
            }
        }

        document.getElementById('viewUserHistoryBtn').addEventListener('click', () => {
            currentView = 'user';
            renderUserHistory(allApplications);
        });

        document.getElementById('viewJobCountBtn').addEventListener('click', () => {
            currentView = 'job';
            renderJobWiseCount(allApplications);
        });
        
        const performSearch = () => {
             const query = document.getElementById('searchApplications').value.toLowerCase().trim();
             const filtered = allApplications.filter(app => {
                 const q = query.toLowerCase();
                 return (app.userEmail?.toLowerCase().includes(q) || app.jobTitle?.toLowerCase().includes(q) || app.company?.toLowerCase().includes(q) || app.status?.toLowerCase().includes(q));
             });

             if (currentView === 'job') {
                 renderJobWiseCount(filtered, query);
             } else {
                 renderUserHistory(filtered, query);
             }
        };
        
        document.getElementById('searchApplications').addEventListener('input', performSearch);

        function renderUserHistory(apps, query = '') {
            if (apps.length === 0) {
                container.innerHTML = '<p>No matching user history found.</p>';
                return;
            }
            const userGroups = groupBy(apps, 'userEmail');
            container.innerHTML = Object.entries(userGroups).map(([email, userApps], index) => {

                const profilePicture = userApps[0].userProfilePicture;
                const avatarHTML = profilePicture
                    ? `<img src="${API_BASE_URL.replace('/api', '')}/uploads/resumes/${userData.profilePicture}" alt="Profile" class="user-history-avatar">`
                    : `<div class="job-icon" style="border-radius: 50%;"><i class="fas fa-user-circle"></i></div>`;

                return `
                <div class="job-application-card">
                    <div class="job-application-header" data-toggle-target="user-history-list-${index}">
                        ${avatarHTML}
                        <div class="job-info">
                            <h3>${highlightMatch(email, query)}</h3>
                            
                        </div>
                        <div class="applicant-count-badge">${userApps.length}</div>
                    </div>
                    <div class="applicant-list" id="user-history-list-${index}" style="display: none;">
                        ${userApps.sort((a,b) => new Date(b.appliedAt) - new Date(a.appliedAt)).map(app => `
                            <div class="application-item">
                                <div class="applicant-info">
                                    <span class="applicant-email">${highlightMatch(app.jobTitle, query)}</span>
                                    <span class="application-date">${highlightMatch(app.company, query)}</span>
                                </div>
                                <div style="text-align: right;">
                                <span class="application-status ${app.status.toLowerCase()}">${app.status}</span>
                                <small class="application-date" style="display:block; margin-top:4px;">Applied: ${new Date(app.appliedAt).toLocaleDateString()}</small>
                                </div>
                            </div>
                        `).join('') || '<p>No applications to show.</p>'}
                    </div>
                </div>`;
            }).join('');
        }
        function renderJobWiseCount(apps, query = '') {
            const jobGroups = {};
            apps.forEach(app => {
                const jobTitle = app.jobId?.title || app.jobTitle || 'Unknown Job';
                const company = app.jobId?.company || app.company || 'Unknown Company';
                const jobKey = app.jobId?._id || `${jobTitle}-${company}`;
                if (!jobGroups[jobKey]) {
                    jobGroups[jobKey] = { title: jobTitle, company: company, applicants: [] };
                }
                jobGroups[jobKey].applicants.push(app);
            });

            if (Object.keys(jobGroups).length === 0) {
                container.innerHTML = '<p>No job applications match the criteria.</p>';
                return;
            }

            container.innerHTML = Object.values(jobGroups).map((group, index) => `
                <div class="job-application-card">
                    <div class="job-application-header" data-toggle-target="applicant-list-${index}">
                        <div class="job-icon"><i class="fas fa-briefcase"></i></div>
                        <div class="job-info">
                            <h3>${highlightMatch(group.title, query)}</h3>
                            <p>${highlightMatch(group.company, query)}</p>
                        </div>
                        <div class="applicant-count-badge">${group.applicants.length}</div>
                    </div>
                    <div class="applicant-list" id="applicant-list-${index}" style="display: none;">
                        ${group.applicants.map(applicant => `
                            <div class="application-item">
                                <div class="applicant-info">
                                    <span class="applicant-email">${highlightMatch(applicant.userEmail, query)}</span>
                                    <span class="application-date">Applied: ${new Date(applicant.appliedAt).toLocaleDateString()}</span>
                                </div>
                                <span class="application-status ${applicant.status.toLowerCase()}">${applicant.status}</span>
                            </div>
                        `).join('') || '<p>No applicants to show.</p>'}
                    </div>
                </div>
            `).join('');
        }

        function groupBy(apps, key) {
            return apps.reduce((acc, app) => {
                const k = app[key];
                if (!acc[k]) acc[k] = [];
                acc[k].push(app);
                return acc;
            }, {});
        }
        renderUserHistory(allApplications);

    } catch (error) {
        console.error('Error loading applications:', error);
        container.innerHTML = '<p class="error">Error loading applications. Please try again later.</p>';
    }
});
function highlightMatch(text, query) {
    if (!text || !query) return text;
    const regex = new RegExp(`(${query})`, 'ig');
    return text.replace(regex, `<span class="highlight">$1</span>`);
}

function toggleApplicationList(index) {
    const list = document.getElementById(`appList-${index}`);
    const icon = document.getElementById(`toggleIcon-${index}`);
    const isVisible = list.style.display === 'block';
    list.style.display = isVisible ? 'none' : 'block';
    icon.classList.toggle('fa-chevron-down', isVisible);
    icon.classList.toggle('fa-chevron-up', !isVisible);
}

async function loadApplicationStatsChart(email) {
    try {
        const stats = await makeApiCall(`/applications/stats/${email}`, 'GET');
        
        if (stats.error || stats.length === 0) {
            console.log("No stats to display.");
            const chartElement = document.getElementById('applicationStatusChart');
            if (chartElement) chartElement.style.display = 'none';
            return;
        }

        const labels = stats.map(s => s._id);
        const data = stats.map(s => s.count);

        const backgroundColors = labels.map(label => {
            if (label === 'Applied') return '#2ecc71';   
            if (label === 'Cancelled') return '#e74c3c'; 
            if (label === 'Clicked') return '#f39c12';  
            return '#3498db'; 
        });

        const ctx = document.getElementById('applicationStatusChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Application Status',
                    data: data,
                    backgroundColor: backgroundColors,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Your Application Activity'
                    }
                }
            }
        });

    } catch (error) {
        console.error("Failed to load application chart:", error);
    }
}

const userInterviewTipsLink = document.querySelector('#userDashboard a[href="#interviewTips"]');
if (userInterviewTipsLink) {
    userInterviewTipsLink.addEventListener('click', (e) => {
        e.preventDefault();
        pushToHistory('interviewTips', () => {
            userInterviewTipsLink.click();
        });
        document.querySelectorAll('#userDashboard .admin-sidebar li').forEach(li => li.classList.remove('active'));
        userInterviewTipsLink.parentElement.classList.add('active');
        userAdminContent.innerHTML = `
            <div class="back-navigation" onclick="goBack()" style="display: ${navigationHistory.length > 1 ? 'block' : 'none'}">
                <i class="fas fa-chevron-left"></i> Back
            </div>
            <h2>💬 Common Interview Questions & Answers</h2>
            <div class="tips-container">
                ${generateInterviewTipsHTML()}
            </div>
        `;
        setTimeout(() => {
        const items = document.querySelectorAll('.accordion-item');
        items.forEach(item => {
            const questionBtn = item.querySelector('.accordion-question');
            questionBtn.addEventListener('click', () => {
                items.forEach(i => {
                    if (i !== item) i.classList.remove('active');
                });
                item.classList.toggle('active');
        });
    });
}, 0);
    });
}
function generateInterviewTipsHTML() {
    const tips = [
  {
    question: "Tell Me About Yourself",
    Tip: "Highlight your education, interests, and goals.",
    Sample: "I pursued my Bachelor's in Civil Engineering from PQR University and completed schooling at XYZ School. I discovered my passion for tech while developing a website for our college fest. Since then, I’ve freelanced in web development, gaining skills in front-end coding, SEO, UI/UX design, and debugging. I’m eager to experience a professional work environment. In my free time, I enjoy listening to podcasts and sketching."
  },
  {
    question: "Why Should We Hire You for This Internship?",
    Tip: "Link your past experiences with the current role.",
    Sample: "I interned with XYZ Company in digital marketing for six months. I contributed to brand awareness, lead generation, and engagement strategies. I also led the publicity committee in college, increasing fest participation by 50%. I’m driven, quick to learn, and thrive under deadlines."
  },
  {
    question: "What Are Your Strengths and Weaknesses?",
    Tip: "Be honest but frame your weaknesses positively.",
    Sample: "My strength lies in content writing across formats, with published blogs and listicles. I tailor my tone to the target audience. I also did creative writing training to sharpen my skills. My weakness is public speaking, which I’m addressing by joining my college debate club."
  },
  {
    question: "Why Do You Want to Work at Our Company?",
    Tip: "Research the company and align your goals with theirs.",
    Sample: "I admire the core values and projects of your company. Your commitment to learning and growth aligns with my aspirations. I see this role as a platform to apply my skills and grow professionally."
  },
  {
    question: "What Are Your Career Goals?",
    Sample: "My goal is to become a News Anchor. Working as a reporter will help me understand ground realities. I’m also keen to explore the technical side of broadcasting. I see your organization as a great place to build that foundation."
  },
  {
    question: "What Are Your Salary Expectations?",
    Sample: "Based on industry research and my experience, I believe <salary amount> is appropriate. However, I’m open to negotiation to align with the company’s standards and value offered."
  },
  {
    question: "Describe a Time You Showed Leadership.",
    Sample: "As president of my college's management club, I led the annual fest, resolving disputes calmly and ensuring team cohesion."
  },
  {
    question: "Where Do You See Yourself in 5 Years?",
    Sample: "I envision myself in a managerial role, leading projects confidently. I’m ready to put in the work required to reach that goal."
  },
  {
    question: "What Are Your Expectations from This Job?",
    Sample: "I seek growth, learning, and a fresh perspective in my career. This job offers the right challenges and opportunities."
  },
  {
    question: "What Are Your Hobbies?",
    Sample: "I love reading fiction and poetry. I also enjoy experimenting with food and creating healthy recipes."
  },
  {
    question: "What Motivates You to Do a Good Job?",
    Sample: "I’m driven by growth, purpose, and positive workplace impact. Meeting goals as a team inspires me."
  },
  {
    question: "When Can You Start?",
    Sample: "I’m available to start immediately and excited to begin contributing right away."
  },
  {
    question: "Are You a Team Player?",
    Sample: "Yes. During a college project, I ensured team harmony through open communication and shared responsibilities."
  },
  {
    question: "What Do You Know About Our Organization?",
    Sample: "Your company fosters innovation and learning, which resonates with me. I admire your commitment to impactful work."
  },
  {
    question: "What Is Your Ideal Job?",
    Sample: "A tech-based, creative role in a team environment with scope for continuous learning and meaningful contributions."
  },
  {
    question: "Are You Willing to Relocate?",
    Sample: "Yes, I’m open to relocation and excited for new experiences that align with my career goals."
  },
  {
    question: "Are You Overqualified for This Role?",
    Sample: "No. I’m well-qualified and excited to contribute and grow with the team."
  },
  {
    question: "Toughest Decision You’ve Made?",
    Sample: "I postponed an internship to support my family. It taught me responsibility, empathy, and the value of communication."
  },
  {
    question: "Are You Willing to Work Overtime?",
    Sample: "Yes. I can commit extra time when needed while ensuring a balanced routine."
  },
  {
    question: "How Do You Handle Stress?",
    Sample: "I manage stress through time management and mindfulness. I also talk to peers to navigate tough situations."
  },
  {
    question: "How Do You Handle Criticism?",
    Sample: "I welcome constructive feedback as a growth opportunity and work to improve continuously."
  },
  {
    question: "Are You Planning Higher Studies?",
    Sample: "Currently, I’m focused on gaining experience. I may consider higher studies later, but I’m fully committed to this role."
  },
  {
    question: "Difference Between Confidence and Overconfidence?",
    Sample: "Confidence is grounded in ability; overconfidence ignores limitations. The former drives success; the latter leads to oversight."
  },
  {
    question: "Define Success.",
    Sample: "Success is growth, impact, and personal fulfillment. It’s about learning and contributing meaningfully."
  },
  {
    question: "Who Inspires You?",
    Sample: "My professor’s dedication to excellence inspires me to stay committed and keep improving."
  },
  {
    question: "Why Should We Hire a Fresher Over an Experienced Candidate?",
    Sample: "Freshers like me bring fresh ideas, high energy, and adaptability. I’m enthusiastic and a fast learner."
  },
  {
    question: "Why Did You Choose This Career?",
    Sample: "My passion for design and sustainability led me to pursue fashion design focused on ethical practices."
  },
  {
    question: "Why Are You Switching Domains?",
    Sample: "I discovered a love for digital marketing. My engineering background gives me analytical skills that are valuable in this new field."
  },
  {
    question: "How Did You Hear About This Role?",
    Sample: "I found this opportunity on Internshala. Your company’s values stood out, and I was impressed by your online presence."
  },
  {
    question: "Do You Have Any Questions for Us?",
   Sample: `
    
    <ul class="tip-list">
      <li>What does a typical day in this role look like?</li>
      <li>What are the growth and training opportunities here?</li>
      <li>What is your company’s work culture like?</li>
    </ul>
  `
}
];

    return tips.map((tip, index) => `
  <div class="accordion-item">
    <button class="accordion-question">
      <span class="label-wrapper">
        <span class="badge">${index + 1}</span>
        ${tip.question}
      </span>
      <i class="fas fa-chevron-down icon"></i>
    </button>
    <div class="accordion-answer">
      ${tip.Tip ? `<p><strong>Tip:</strong> ${tip.Tip}</p>` : ''}
      ${tip.Sample ? `<p><strong>Sample Answer:</strong> ${tip.Sample}</p>` : ''}
      
    </div>
  </div>
`).join('');
}

document.querySelector('a[href="#users"]').addEventListener('click', async (e) => {
    e.preventDefault();
    setActiveMenu('#users');
    pushToHistory('dashboard', showDashboard);
    dashboardContent.innerHTML = `
        <div class="back-navigation" onclick="goBack()" style="display: ${navigationHistory.length > 1 ? 'block' : 'none'}">
            <i class="fas fa-chevron-left"></i> Back
        </div>
        <h2>Manage Users</h2>
        <div class="blue-wrapper" style="padding: 20px; border-radius: 10px;">
            <div class="search-bar" style="margin-bottom: 15px;">
                <input type="text" id="userSearch" placeholder="Search users by name or email" style="padding: 8px; width: 300px;">
                <button id="searchUsersBtn" style="padding: 8px 12px; margin-left: 8px;">Search</button>
            </div>
            <div id="usersContainer" class="job-cards-grid"></div>
        </div>

    `;
    const container = document.getElementById('usersContainer');
    loadUsers();
    document.getElementById('userSearch').addEventListener('input', () => {
    const searchTerm = document.getElementById('userSearch').value.toLowerCase().trim();
    loadUsers(searchTerm);
});

    async function loadUsers(searchTerm = '') {
        try {
            const response = await makeApiCall('/users', 'GET');
            if (response.error) {
                container.innerHTML = `<p class="error">${response.error}</p>`;
                return;
            }
            const filteredUsers = searchTerm 
                ? response.filter(user => 
                    user.username.toLowerCase().includes(searchTerm) || 
                    user.email.toLowerCase().includes(searchTerm))
                : response;
            if (filteredUsers.length === 0) {
                container.innerHTML = '<p>No users found.</p>';
                return;
            }
            container.classList.remove('activity-list');
            container.classList.add('job-cards-grid'); 
            container.innerHTML = filteredUsers.map(user => `
                <div class="job-card">
                    <h3>${user.username}</h3>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>User Type:</strong> ${user.userType}</p>
                    <div class="user-actions" style="margin-top: 10px;">
                        <button class="btn btn-primary btn-sm" data-id="${user._id}" data-action="view">View Details</button>
                        <button class="btn btn-danger btn-sm" data-id="${user._id}" data-action="delete">Delete</button>
                    </div>
                </div>
            `).join('');

            document.querySelectorAll('.user-actions button').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const userId = e.currentTarget.getAttribute('data-id');
                    const action = e.currentTarget.getAttribute('data-action');
                    handleUserAction(userId, action);
                });
            });
        } catch (error) {
            console.error('Error loading users:', error);
            container.innerHTML = '<p class="error">Error loading users. Please try again later.</p>';
        }
    }

    function handleUserAction(userId, action) {
        switch(action) {
            case 'view':
                showUserDetails(userId);
                break;
            case 'delete':
                deleteUser(userId);
                break;
        }
    }
    async function editUser(userId) {
        const response = await makeApiCall(`/users/${userId}`, 'GET');
        if (response.error) {
            alert(response.error);
            return;
        }

        const editFormHTML = `
            <div class="edit-form">
                <h3>Edit User</h3>
                <form id="editUserForm">
                    <div class="form-group">
                        <label>Username</label>
                        <input type="text" id="editUsername" value="${response.username}" required>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="editEmail" value="${response.email}" required>
                    </div>
                    <div class="form-group">
                        <label>User Type</label>
                        <select id="editUserType">
                            <option value="Undergraduate" ${response.userType === 'Undergraduate' ? 'selected' : ''}>Undergraduate</option>
                            <option value="fresher" ${response.userType === 'fresher' ? 'selected' : ''}>Fresher</option>
                            <option value="experienced" ${response.userType === 'experienced' ? 'selected' : ''}>Experienced</option>
                        </select>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Save Changes</button>
                        <button type="button" id="cancelEdit" class="btn btn-outline">Cancel</button>
                    </div>
                </form>
            </div>
        `;
        dashboardContent.innerHTML = editFormHTML;
        document.getElementById('editUserForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const updatedData = {
                username: document.getElementById('editUsername').value,
                email: document.getElementById('editEmail').value,
                userType: document.getElementById('editUserType').value
            };
            const updateResponse = await makeApiCall(`/users/${userId}`, 'PUT', updatedData);
            if (updateResponse.error) {
                alert(updateResponse.error);
            } else {
                alert('User updated successfully!');
                setActiveMenu('#users');
                loadUsers();
            }
        });
        document.getElementById('cancelEdit').addEventListener('click', () => {
            setActiveMenu('#users');
            loadUsers();
        });
    }

    async function deleteUser(userId) {
        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            const response = await makeApiCall(`/users/${userId}`, 'DELETE');
            if (response.error) {
                alert(response.error);
            } else {
                alert('User deleted successfully!');
                loadUsers();
            }
        }
    }
});

async function showUserDetails(userId) {
    const modal = document.getElementById('userDetailsModal');
    const contentContainer = document.getElementById('userDetailsContent');
    const closeModalBtn = document.getElementById('closeUserDetailsModal');
    
    contentContainer.innerHTML = '<p>Loading user details...</p>';
    modal.style.display = 'flex';

    const userData = await makeApiCall(`/users/${userId}`, 'GET');

    if (userData.error) {
        contentContainer.innerHTML = `<p class="error">Could not load user details: ${userData.error}</p>`;
        return;
    }

    const avatarHTML = userData.profilePicture
        ? `<div class="user-details-avatar"><img src="${API_BASE_URL.replace('/api', '')}/uploads/resumes/${userData.profilePicture}" alt="Profile"></div>`
        : `<div class="user-details-avatar"><i class="fas fa-user"></i></div>`;

    const skillsHTML = userData.skills && userData.skills.length > 0
        ? userData.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')
        : '<p>No skills listed.</p>';

    const educationHTML = userData.education && userData.education.length > 0
        ? userData.education.map(edu => `
            <div class="user-education-card">
                <h4>${edu.degree || 'N/A'} in ${edu.fieldOfStudy || 'N/A'}</h4>
                <p>${edu.institution || 'N/A'}</p>
                <p><em>${edu.startYear || ''} - ${edu.endYear || 'Present'}</em></p>
            </div>`).join('')
        : '<p>No education details provided.</p>';
    
    const resumeLink = userData.resume 
        ? `<a href="${API_BASE_URL.replace('/api', '')}/uploads/resumes/${userData.resume}" target="_blank">View Resume</a>`
        : '<span>No resume uploaded.</span>';

    const linkedinLink = userData.linkedin
        ? `<a href="${userData.linkedin}" target="_blank">${userData.linkedin}</a>`
        : '<span>Not provided.</span>';

    const portfolioLink = userData.portfolio
        ? `<a href="${userData.portfolio}" target="_blank">${userData.portfolio}</a>`
        : '<span>Not provided.</span>';
    const finalHTML = `
        <div class="user-details-header">
            ${avatarHTML}
            <div class="user-details-info">
                <h2>${userData.fullName || userData.username}</h2>
                <p>${userData.userType}</p>
            </div>
        </div>

        <div class="user-details-section user-details-contact">
            <h3>Contact Information</h3>
            <p><strong>Email:</strong> ${userData.email}</p>
            <p><strong>Phone:</strong> ${userData.phone || 'Not provided'}</p>
        </div>

        <div class="user-details-section user-details-skills">
            <h3>Skills</h3>
            <div class="skills-list">
                ${skillsHTML}
            </div>
        </div>

        <div class="user-details-section user-details-education">
            <h3>Education</h3>
            ${educationHTML}
        </div>

        <div class="user-details-section user-details-links">
            <h3>Links & Resume</h3>
            <p><strong>Resume:</strong> ${resumeLink}</p>
            <p><strong>LinkedIn:</strong> ${linkedinLink}</p>
            <p><strong>Portfolio:</strong> ${portfolioLink}</p>
        </div>
    `;

    contentContainer.innerHTML = finalHTML;

    const closeModal = () => {
        modal.style.display = 'none';
        closeModalBtn.removeEventListener('click', closeModal);
        modal.removeEventListener('click', closeOnOverlay);
    };

    const closeOnOverlay = (e) => {
        if (e.target === modal) {
            closeModal();
        }
    };

    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', closeOnOverlay);
}





