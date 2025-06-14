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
const API_BASE_URL = 'http://127.0.0.1:5000/api';

async function makeApiCall(endpoint, method, body = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };
    if (body) options.body = JSON.stringify(body);

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        return { error: 'Failed to connect to server' };
    }
}

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

function showHomePage() {
    document.querySelector('header').style.display = 'block';
    document.querySelector('.hero').style.display = 'flex';
    document.querySelector('.features').style.display = 'block';
    document.querySelector('footer').style.display = 'block';
    adminDashboard.style.display = 'none';
    userDashboard.style.display = 'none';
}

// Admin Login
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
            <div id="allJobsWrapper" style="background-color: #f0f8ff; padding: 20px; border-radius: 10px;">
        <div id="allJobsContainer" class="job-cards-grid"></div>
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

// Admin - Create Job
createJobBtn.addEventListener('click', () => {
    pushToHistory('createJob', () => {
        createJobBtn.click();
    });
    document.getElementById('postingDate').value = new Date().toISOString().split('T')[0];
    jobFormContainer.style.display = 'block';
    dashboardContent.style.display = 'none';
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
                stipend: /^(\d+(-\d+)?|NA|Not Disclosed|N\/A)$/i,
                validURL: /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/
            };

            const title = form.jobTitle.value.trim();
            const company = form.company.value.trim();
            const location = form.location.value.trim();
            const category = form.jobCategory.value.trim();
            const description = form.jobDescription.value.trim();
            const qualifications = form.qualifications.value.trim();
            const stipend = form.salary.value.trim();
            const applyLink = form.applyLink.value.trim();
            const postingDate = new Date(form.postingDate.value);
            const deadline = new Date(form.applicationDeadline.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (!patterns.lettersOnly.test(title)) {
                alert("Job title should contain only letters.");
                return false;
            }if (!patterns.lettersOnly.test(company)) {
                alert("Company name should contain only letters.");
                return false;
            }if (!patterns.location.test(location)) {
                alert("Location should contain only letters and commas.");
                return false;
            }if (!patterns.lettersOnly.test(category)) {
                alert("Job category should contain only letters.");
                return false;
            }if (!patterns.description.test(description)) {
                alert("Job description can include letters, numbers and (:/,-&).");
                return false;
            }if (!patterns.description.test(qualifications)) {
                alert("Qualifications can include letters, numbers and (:/,-&)");
                return false;
            }if (stipend && !patterns.stipend.test(stipend)) {
                alert("Stipend must be a number or a range like 5000-8000.");
                return false;
            }if (!patterns.validURL.test(applyLink)) {
                alert("Please enter a valid apply link.");
                return false;
            }if (deadline < postingDate) {
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
    const formData = {
        title: document.getElementById('jobTitle').value,
        company: document.getElementById('company').value,
        location: document.getElementById('location').value,
        jobType: document.getElementById('jobType').value,
        jobCategory: document.getElementById('jobCategory').value,
        description: document.getElementById('jobDescription').value,
        qualifications: document.getElementById('qualifications').value,
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
        editingJobId = null; 
        jobFormContainer.style.display = 'none';
        dashboardContent.style.display = 'block';
        goBack();
        showDashboard();
    }
});

// Admin - Edit/Delete Job
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
    document.getElementById('jobTitle').value = response.title;
    document.getElementById('company').value = response.company;
    document.getElementById('location').value = response.location;
    document.getElementById('jobType').value = response.jobType;
    document.getElementById('jobCategory').value = response.jobCategory;
    document.getElementById('jobDescription').value = response.description;
    document.getElementById('qualifications').value = response.qualifications;
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

// Admin Logout
logoutBtn.addEventListener('click', () => {
    showHomePage();
});

// User Login/Signup
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
            email: response.user.email,
            phone: response.user.phone, 
            userType: response.user.userType
        }));
        userModal.classList.remove('active');
        navigationHistory = [];
        showUserDashboard();
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

// USER DASHBOARD 
const userViewJobsLink = document.querySelector('#userDashboard a[href="#jobs"]');
const userAdminContent = document.querySelector('#userDashboard .admin-content');
if (userViewJobsLink) {
    userViewJobsLink.addEventListener('click', async (e) => {
        e.preventDefault();
        pushToHistory('userJobs', () => {
            userViewJobsLink.click();
        });
        document.querySelectorAll('#userDashboard .admin-sidebar li').forEach(li => li.classList.remove('active'));
        userViewJobsLink.parentElement.classList.add('active');
        userAdminContent.innerHTML = `
        <div class="back-navigation" onclick="goBack()" style="display: ${navigationHistory.length > 1 ? 'block' : 'none'}">
                <i class="fas fa-chevron-left"></i> Back
            </div>
            <h2>Available Jobs</h2>
            <div class="blue-wrapper"><div id="userJobsContainer" class="job-cards-grid"></div>`;
        const container = document.getElementById('userJobsContainer');
        try {
            const jobs = await makeApiCall('/jobs', 'GET');
            if (!jobs || jobs.length === 0) {
                container.innerHTML = '<p>No jobs available at the moment.</p>';
                return;
            }
            container.innerHTML = jobs.map(job => `
                <div class="job-card">
                    <h3>${job.title}</h3>
                    <p><strong>Company:</strong> ${job.company}</p>
                    <p><strong>Location:</strong> ${job.location}</p>
                    <p><strong>Type:</strong> ${job.jobType}</p>
                    <p><strong>Salary:</strong> ${job.salary || 'Not disclosed'}</p>
                    ${new Date(job.applicationDeadline) < new Date() ? '<p style="color: red; font-weight: bold;">Application Closed</p>'
                    : `<button class="apply-btn" onclick="handleApply('${job._id}', '${job.applyLink}')">Apply Now</button>`}
                    <p class="posted-date">Posted on ${new Date(job.datePosted).toLocaleDateString()}</p>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading user jobs:', error);
            container.innerHTML = '<p>Error loading jobs. Please try again later.</p>';
        }
    });
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
        userAdminContent.innerHTML = `<div class="back-navigation" onclick="goBack()" style="display: ${navigationHistory.length > 1 ? 'block' : 'none'}">
                                        <i class="fas fa-chevron-left"></i> Back
                                        </div><h2>My Applications</h2>
                                    <div class="blue-wrapper"><div id="userApplicationsContainer" class="activity-list"></div>`;
        const container = document.getElementById('userApplicationsContainer');
        try {
            const response = await makeApiCall(`/applications/${user.email}`, 'GET');
            if (!response || response.length === 0) {
                container.innerHTML = '<p>You have not applied to any jobs yet.</p>';
                return;
            }
            response.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
            container.innerHTML = response.map(app => `
                <div class="application-card">
                    <div class="application-info">
                        <h4>${app.jobTitle || 'Job Title Not Available'}</h4>
                        <p>Status: <span class="status-${app.status.toLowerCase()}">${app.status || 'Pending'}</span></p>
                        ${new Date(app.applicationDeadline) < new Date() ? '<p style="color: red; font-weight: bold;">🔴 Deadline has ended</p>' : ''}
                        <span class="activity-time">Applied on ${new Date(app.appliedAt).toLocaleDateString()}</span>
                    </div>
                    <div class="application-action">
            <a href="#" class="view-job-link btn btn-primary" data-jobid="${app.jobId}">View Job Details</a>
            </div>
        </div> 
    </div>
`).join('');
            
       document.querySelectorAll('.view-job-link').forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            const jobId = e.currentTarget.getAttribute('data-jobid');
            try {
                const job = await makeApiCall(`/jobs/${jobId}`, 'GET');
                if (job.error) {
                    alert(job.error);
                    return;
                }
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
                    <button class="btn btn-outline" id="backToApplicationsBtn">← Back to Applications</button>
                </div>
            </div>
        `;
        document.getElementById('backToApplicationsBtn').addEventListener('click', () => {
            userApplicationsLink.click(); 
                });
            } catch (err) {
                console.error('Failed to fetch job:', err);
            }
        });
    });
} catch (error) {
    console.error('Error loading applications:', error);
    container.innerHTML = '<p>Error loading applications. Please try again later.</p>';
                }
    });
}

const userDashboardLink = document.querySelector('#userDashboard a[href="#dashboard"]');
if (userDashboardLink) {
    userDashboardLink.addEventListener('click', async (e) => {
        e.preventDefault();
        pushToHistory('userDashboard', () => {
            userDashboardLink.click();
        });
        document.querySelectorAll('#userDashboard .admin-sidebar li').forEach(li => li.classList.remove('active'));
        userDashboardLink.parentElement.classList.add('active');
        userAdminContent.innerHTML = `
        
            <h2>Find Jobs</h2>
            <div class="blue-wrapper">
            <div class="search-bar">
                <input type="text" id="searchTitle" placeholder="Job title, keywords, or company">
                <input type="text" id="searchLocation" placeholder="City, state, or 'remote'">
                <button id="findJobsBtn">Find jobs</button>
            </div>
            <div id="searchResults" class="job-cards-grid" style="margin-top: 30px;"></div>
            </div>
        `;
        loadAndRenderJobs();

        document.getElementById('findJobsBtn').addEventListener('click', () => {
            const title = document.getElementById('searchTitle').value.toLowerCase();
            const location = document.getElementById('searchLocation').value.toLowerCase();
            loadAndRenderJobs(title, location);
        });
        ['searchTitle', 'searchLocation'].forEach(id => {
        document.getElementById(id).addEventListener('input', () => {
            const title = document.getElementById('searchTitle').value.toLowerCase();
            const location = document.getElementById('searchLocation').value.toLowerCase();
            loadAndRenderJobs(title, location);
    });
});
});
}

async function loadAndRenderJobs(title = '', location = '') {
    const container = document.getElementById('searchResults');
    container.innerHTML = 'Loading...';
    try {
        const jobs = await makeApiCall('/jobs', 'GET');
        const now = new Date();
        const filteredJobs = jobs.filter(job => {
        const deadline = new Date(job.applicationDeadline);
        const isNotExpired = deadline >= now;
        const matchesTitle = !title || job.title.toLowerCase().includes(title) || job.company.toLowerCase().includes(title);
        const matchesLocation = !location || job.location.toLowerCase().includes(location);
    return isNotExpired && matchesTitle && matchesLocation;
});
        if (filteredJobs.length === 0) {
            container.innerHTML = '<p>No jobs found matching your criteria.</p>';
        } else {
            container.innerHTML = filteredJobs.map(job => `
                <div class="job-card job-clickable" data-jobid="${job._id}">
                    <h3>${job.title}</h3>
                    <p><strong>Company:</strong> ${job.company}</p>
                    <p><strong>Location:</strong> ${job.location}</p>
                    <p><strong>Type:</strong> ${job.jobType}</p>
                    <p class="posted-date">Posted on ${new Date(job.datePosted).toLocaleDateString()}</p>
                </div>
            `).join('');

            document.querySelectorAll('.job-clickable').forEach(card => {
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
                                <button class="btn btn-outline" id="backToDashboardJobsBtn">← Back to Job List</button>
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
    } catch (error) {
        console.error('Error loading jobs:', error);
        container.innerHTML = '<p>Error loading jobs. Please try again later.</p>';
    }
}

const userProfileLink = document.querySelector('#userDashboard a[href="#profile"]');
if (userProfileLink) {
    userProfileLink.addEventListener('click', (e) => {
        e.preventDefault();
        pushToHistory('profile', () => {
            userProfileLink.click();
        });
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) return alert('User not logged in.');

        userAdminContent.innerHTML = `
        <div class="back-navigation" onclick="goBack()" style="display: ${navigationHistory.length > 1 ? 'block' : 'none'}">
            <i class="fas fa-chevron-left"></i> Back
        </div>
        <div class="profile-wrapper">
        <div class="profile-card">
            <div class="profile-header">
            <div class="profile-logo">
                <i class="fas fa-user-circle"></i>
            </div>
            <h2>My Profile</h2>
            </div>
                <form id="editProfileForm">
                    <div class="form-group">
                        <label for="editUsername">Username</label>
                        <input type="text" id="editUsername" value="${user.username}" required>
                    </div>
                    <div class="form-group">
                        <label for="editEmail">Email</label>
                        <input type="email" id="editEmail" value="${user.email}" disabled>
                    </div>
                    <div class="form-group">
                        <label for="editPhone">Phone Number</label>
                        <input type="tel" id="editPhone" value="${user.phone || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="editUserType">User Type</label>
                        <select id="editUserType" required>
                            <option value="Undergraduate" ${user.userType === 'Undergraduate' ? 'selected' : ''}>Undergraduate</option>
                            <option value="fresher" ${user.userType === 'fresher' ? 'selected' : ''}>Fresher</option>
                            <option value="experienced" ${user.userType === 'experienced' ? 'selected' : ''}>Experienced</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </form>
            </div>
        </div>
        `;
        document.getElementById('editProfileForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const updatedUser = {
                username: document.getElementById('editUsername').value,
                phone: document.getElementById('editPhone').value,
                userType: document.getElementById('editUserType').value,
            };
            try {
                const response = await makeApiCall(`/users/${user.id}`, 'PUT', updatedUser);
                if (response.error) {
                    alert(response.error);
                    return;
                }
                const newUserData = {
                    ...user,
                    ...updatedUser
                };
                localStorage.setItem('user', JSON.stringify(newUserData));
                alert('Profile updated successfully!');
            } catch (error) {
                console.error('Profile update error:', error);
                alert('Failed to update profile. Please try again.');
            }
        });
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
        const applyRes = await fetch('http://localhost:5000/api/apply', {
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
            const emailResponse = await fetch('http://localhost:5000/api/send-confirmation', {
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
            await fetch('http://localhost:5000/api/send-confirmation', {
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
        <p style="margin-top: 10px; margin-bottom: 20px;">Choose what you want to view:</p>
        <div style="display: flex; gap: 15px; margin-bottom: 30px;">
            <button id="viewUserHistoryBtn" class="btn btn-outline">👤 Users History</button>
            <button id="viewJobCountBtn" class="btn btn-outline">📊 Applications Count</button>
        </div>
        <div class="search-bar" style="margin-bottom: 15px;">
            <input type="text" id="searchApplications" placeholder="Search by email, title, company, status..." style="padding: 8px; width: 300px;">
            <button id="searchApplicationsBtn" style="padding: 8px 12px; margin-left: 8px;">Search</button>
        </div>
        <div id="applicationsContainer" class="activity-list"></div>
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
        const jobAppCount = {};
        allApplications.forEach(app => {
            const jobKey = app.jobId?._id || app.jobTitle || 'unknown';
            jobAppCount[jobKey] = (jobAppCount[jobKey] || 0) + 1;
        });
        let currentView = ''; 

    document.getElementById('viewUserHistoryBtn').addEventListener('click', () => {
        currentView = 'user';
        renderUserHistory(allApplications);
    });

    document.getElementById('viewJobCountBtn').addEventListener('click', () => {
        currentView = 'job';
        renderJobWiseCount(allApplications);
    });

    document.getElementById('searchApplications').addEventListener('input', () => {
        const query = document.getElementById('searchApplications').value.toLowerCase().trim();
        const filtered = allApplications.filter(app => {
        const q = query.toLowerCase();
        return (
                    app.userEmail?.toLowerCase().includes(q) ||
                    app.jobTitle?.toLowerCase().includes(q) ||
                    app.company?.toLowerCase().includes(q) ||
                    app.status?.toLowerCase().includes(q) ||
                    app.jobId?.title?.toLowerCase().includes(q) ||
                    app.jobId?.company?.toLowerCase().includes(q) ||
                    app.jobId?.location?.toLowerCase().includes(q) ||
                    app.jobId?.jobType?.toLowerCase().includes(q) ||
                    app.jobId?.qualifications?.toLowerCase().includes(q)
                );
            });

            if (currentView === 'job') {
                renderJobWiseCount(filtered, query);
            } else {
                renderUserHistory(filtered, query);
            }
        });

    document.getElementById('searchApplications').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('searchApplicationsBtn').click();
            }
        });

    function renderUserHistory(apps,query = '') {
            container.innerHTML = Object.entries(groupBy(apps, 'userEmail')).map(([email, userApps], index) => `
                <div class="application-group-card">
                    <div class="group-header" onclick="toggleApplicationList('${index}')">
                        <i class="fas fa-chevron-down" id="toggleIcon-${index}"></i>
                        <h3>${highlightMatch(email, query)}</h3>
                        <span style="margin-left:auto;">${userApps.length} applications</span>
                    </div>
                    <div class="group-body" id="appList-${index}" style="display: none;">
                        ${userApps.map(app => `
                            <div class="application-entry">
                                <div class="app-info">
                                    <strong>${highlightMatch(app.jobId?.title || app.jobTitle || 'Unknown Job', query)}</strong>
                                    <p>${highlightMatch(app.jobId?.company || app.company || 'Unknown Company', query)}</p>
                                    <p>Status: <span class="status-${app.status.toLowerCase()}">${app.status || 'Pending'}</span></p>
                                        
                                    </span>
                                </div>
                                <div class="app-meta">
                                    <small style="font-weight: 600;">
                                        <i class="fas fa-calendar-alt" style="margin-right: 5px;"></i>
                                        Applied on: ${new Date(app.appliedAt).toLocaleDateString()}
                                    </small>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('');
        }

    function renderJobWiseCount(apps,query = ''){
            const container = document.getElementById('applicationsContainer');
            const jobCounts = {};
            apps.forEach(app => {
                const key = app.jobId?.title || app.jobTitle || 'Unknown Job';
                const company = app.jobId?.company || app.company || 'Unknown Company';
                 const jobKey = `${key} | ${company}`;
                if (!jobCounts[jobKey]) jobCounts[jobKey] = 0;
                jobCounts[jobKey]++;
            });

            container.innerHTML = Object.entries(jobCounts).map(([job, count]) => `
                <div class="activity-item">
                    <div class="activity-icon"><i class="fas fa-briefcase"></i></div>
                    <div class="activity-content">
                        <h4>${job}</h4>
                        <p><strong>${count}</strong> applications</p>
                    </div>
                </div>
            `).join('');
        }

    function renderApplications(apps, query = '') {
            if (apps.length === 0) {
                container.innerHTML = '<p style="padding: 15px; font-style: italic;">No matching applications found.</p>';
                return;
            }

            container.innerHTML = Object.entries(groupBy(apps, 'userEmail')).map(([email, userApps], index) => {
                return `
                    <div class="application-group-card">
                        <div class="group-header" onclick="toggleApplicationList('${index}')">
                            <i class="fas fa-chevron-down" id="toggleIcon-${index}"></i>
                            <h3>${highlightMatch(email, query)}</h3>
                            <span style="margin-left:auto; font-size: 0.85rem; color: #555;">
                                ${userApps.length} application(s)
                            </span>
                        </div>
                        <div class="group-body" id="appList-${index}" style="display: none;">
                            ${userApps.map(app => {
                                const jobTitle = app.jobId?.title || app.jobTitle || 'Deleted Job';
                                const company = app.jobId?.company || app.company || 'Unknown Company';
                                const jobKey = app.jobId?._id || app.jobTitle || 'unknown';
                                const count = jobAppCount[jobKey] || 1;
                                return `
                                    <div class="application-entry">
                                        <div class="app-info">
                                            <strong>
                                                ${highlightMatch(jobTitle, query)}
                                                <span class="badge">${count}</span>
                                            </strong>
                                            <p>${highlightMatch(company, query)}</p>
                                            <span class="badge status-${(app.status || 'unknown').toLowerCase()}">
                                                ${highlightMatch(app.status || 'Not Available', query)}
                                            </span>
                                        </div>
                                        <div class="app-meta">
                                            <small style="color: #222; font-weight: 600;">
                                                <i class="fas fa-calendar-alt" style="margin-right: 5px;"></i>
                                                Applied on: ${new Date(app.appliedAt).toLocaleDateString()}
                                            </small>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `;
            }).join('');
        }

        function groupBy(apps, key) {
            return apps.reduce((acc, app) => {
                const k = app[key];
                if (!acc[k]) acc[k] = [];
                acc[k].push(app);
                return acc;
            }, {});
        }
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
        <div id="usersWrapper" style="background-color: #e6f2ff; padding: 20px; border-radius: 10px;">
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
                        <button class="btn btn-danger btn-sm" data-id="${user._id}">Delete</button>
                    </div>
                </div>
            `).join('');

            document.querySelectorAll('.user-actions button').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const userId = e.currentTarget.getAttribute('data-id');
                    const action = e.currentTarget.textContent.trim();
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
            case 'Delete':
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



