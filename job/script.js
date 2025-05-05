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
const API_BASE_URL = 'http://127.0.0.1:5000/api';


// Helper Functions
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

// UI Helpers (Show / Hide Sections)
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
            <h2>Admin Login</h2>
            <form id="adminLoginForm">
                <div class="form-group">
                    <label for="adminEmail">Email</label>
                    <input type="email" id="adminEmail" placeholder="Enter admin email" required>
                </div>
                <div class="form-group">
                    <label for="adminPassword">Password</label>
                    <input type="password" id="adminPassword" placeholder="Enter password" required>
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

        if (email === 'admin@gmail.com' && password === 'admin@123' || email=='careerconnect@gmail.com' && password=='careerconnect@123') {
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
        <div class="activity-list" id="recentJobsContainer"></div>
    `;
    const response = await makeApiCall('/jobs', 'GET');
    if (response.error) return console.error('Error loading jobs:', response.error);

    const recentJobs = response.sort((a, b) => new Date(b.datePosted) - new Date(a.datePosted)).slice(0, 3);
    const container = document.getElementById('recentJobsContainer');
    container.innerHTML = recentJobs.map(job => `
        <div class="activity-item">
            <div class="activity-icon"><i class="fas fa-briefcase"></i></div>
            <div class="activity-content">
                <h4>${job.title}</h4>
                <p>${job.company} - ${job.location}</p>
                <p>${job.jobType} | ${job.salary || 'Salary not disclosed'}</p>
                <span class="activity-time">Posted on ${new Date(job.datePosted).toLocaleDateString()}</span>
                <div class="job-actions">
                    <button class="btn-edit" data-jobid="${job._id}"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn-delete" data-jobid="${job._id}"><i class="fas fa-trash"></i> Delete</button>
                </div>
            </div>
        </div>
    `).join('');
    attachEditDeleteHandlers();
}

// Manage Jobs (All Jobs Tab)
document.querySelector('a[href="#dashboard"]').addEventListener('click', (e) => {
    e.preventDefault();
    setActiveMenu('#dashboard');
    showDashboard();
});

document.querySelector('a[href="#jobs"]').addEventListener('click', async (e) => {
    e.preventDefault();
    setActiveMenu('#jobs');
    pushToHistory('jobs', () => {
        document.querySelector('a[href="#jobs"]').click();
    });

    dashboardContent.innerHTML = `
        <div class="back-navigation" onclick="goBack()" style="display: ${navigationHistory.length > 1 ? 'block' : 'none'}">
            <i class="fas fa-chevron-left"></i> Back
        </div>
        <h2>All Jobs</h2>
        <div id="allJobsContainer" class="job-cards-grid"></div>
    `;
    const container = document.getElementById('allJobsContainer');

    const jobs = await makeApiCall('/jobs', 'GET');
    container.innerHTML = jobs.map(job => `
        <div class="job-card">
            <h3>${job.title}</h3>
            <p><strong>Company:</strong> ${job.company}</p>
            <p><strong>Location:</strong> ${job.location}</p>
            <p><strong>Type:</strong> ${job.jobType}</p>
            <p><strong>Salary:</strong> ${job.salary || 'Not disclosed'}</p>
            <p class="posted-date">Posted on ${new Date(job.datePosted).toLocaleDateString()}</p>
            <div class="job-actions">
                <button class="btn-edit" data-jobid="${job._id}"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn-delete" data-jobid="${job._id}"><i class="fas fa-trash"></i> Delete</button>
            </div>
        </div>
    `).join('');
    
    attachEditDeleteHandlers();
});

// Admin - Create Job
createJobBtn.addEventListener('click', () => {
    pushToHistory('createJob', () => {
        createJobBtn.click();
    });
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
    goBack(); 
});

createJobForm.addEventListener('submit', async (e) => {
    e.preventDefault();
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

    const response = await makeApiCall('/jobs', 'POST', formData);
    if (response.error) {
        alert(response.error);
    } else {
        alert('Job created successfully!');
        createJobForm.reset();
        jobFormContainer.style.display = 'none';
        dashboardContent.style.display = 'block';
        goBack(); 
        showDashboard();
    }
});

// Admin - Edit/Delete Job
async function openEditJobForm(jobId) {
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
    document.getElementById('postingDate').value = response.datePosted?.split('T')[0];
    document.getElementById('applyLink').value = response.applyLink;

    jobFormContainer.style.display = 'block';
    dashboardContent.style.display = 'none';
    const formHeader = document.querySelector('#jobFormContainer .form-header');
    formHeader.insertAdjacentHTML('afterbegin', `
        <div class="back-navigation" onclick="cancelJobForm.click()">
            <i class="fas fa-chevron-left"></i> Back
        </div>
    `);

    createJobForm.onsubmit = async (e) => {
        e.preventDefault();
        const updatedData = {
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

        const updateResponse = await makeApiCall(`/jobs/${jobId}`, 'PUT', updatedData);
        if (updateResponse.error) {
            alert(updateResponse.error);
        } else {
            alert('Job updated successfully!');
            createJobForm.reset();
            jobFormContainer.style.display = 'none';
            dashboardContent.style.display = 'block';
            goBack();
            showDashboard();
        }
    };
}

async function deleteJob(jobId) {
    if (confirm('Are you sure you want to delete this job?')) {
        const response = await makeApiCall(`/jobs/${jobId}`, 'DELETE');
        if (response.error) {
            alert(response.error);
        } else {
            alert('Job deleted successfully!');
            showDashboard();
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

userSignupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('phone').value;
    const userType = document.getElementById('userType').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
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

function showUserDashboard() {
    showHomePage();
    userDashboard.style.display = 'block';
    document.querySelector('header').style.display = 'none';
    document.querySelector('.hero').style.display = 'none';
    document.querySelector('.features').style.display = 'none';
    document.querySelector('footer').style.display = 'none';
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

// USER DASHBOARD - View Jobs functionality (with CARD VIEW)
const userViewJobsLink = document.querySelector('#userDashboard a[href="#jobs"]');
const userAdminContent = document.querySelector('#userDashboard .admin-content');

if (userViewJobsLink) {
    userViewJobsLink.addEventListener('click', async (e) => {
        e.preventDefault();
        pushToHistory('userJobs', () => {
            userViewJobsLink.click();
        });

        userAdminContent.innerHTML = `
        <div class="back-navigation" onclick="goBack()" style="display: ${navigationHistory.length > 1 ? 'block' : 'none'}">
                <i class="fas fa-chevron-left"></i> Back
            </div>
            <h2>Available Jobs</h2><div id="userJobsContainer" class="job-cards-grid"></div>`;
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

                    <button class="apply-btn" onclick="handleApply('${job._id}', '${job.applyLink}')">Apply Now</button>
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
            </div><h2>My Applications</h2><div id="userApplicationsContainer" class="activity-list"></div>`;
        const container = document.getElementById('userApplicationsContainer');
        try {
            const response = await makeApiCall(`/applications/${user.email}`, 'GET');
            if (!response || response.length === 0) {
                container.innerHTML = '<p>You have not applied to any jobs yet.</p>';
                return;
            }
            container.innerHTML = response.map(app => `
                <div class="application-card">
                    <div class="application-info">
                        <h4>${app.jobTitle || 'Job Title Not Available'}</h4>
                        <p>Status: <span class="status-${app.status.toLowerCase()}">${app.status || 'Pending'}</span></p>
                        <span class="activity-time">Applied on ${new Date(app.appliedAt).toLocaleDateString()}</span>
                    </div>
                    <div class="application-action">
            <a href="#" class="view-job-link btn btn-primary" data-jobid="${app.jobId}">View Job Details</a>
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
                    <h2>${job.title}</h2>
                    <p><strong>Company:</strong> ${job.company}</p>
                    <p><strong>Location:</strong> ${job.location}</p>
                    <p><strong>Job Type:</strong> ${job.jobType}</p>
                    <p><strong>Category:</strong> ${job.jobCategory}</p>
                    <p><strong>Salary:</strong> ${job.salary || 'Not disclosed'}</p>
                    <p><strong>Description:</strong><br>${job.description}</p>
                    <p><strong>Qualifications:</strong><br>${job.qualifications}</p>
                    <p><strong>Deadline:</strong> ${new Date(job.applicationDeadline).toLocaleDateString()}</p>
                    <br><br>
                    <button class="btn btn-outline" id="backToApplicationsBtn">← Back to Applications</button>
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
        
        userAdminContent.innerHTML = `
        <div class="back-navigation" onclick="goBack()" style="display: ${navigationHistory.length > 1 ? 'block' : 'none'}">
                <i class="fas fa-chevron-left"></i> Back
            </div>
            <h2>Find Jobs</h2>
            <div class="search-bar">
                <input type="text" id="searchTitle" placeholder="Job title, keywords, or company">
                <input type="text" id="searchLocation" placeholder="City, state, or 'remote'">
                <button id="findJobsBtn">Find jobs</button>
            </div>
            <div id="searchResults" class="job-cards-grid" style="margin-top: 30px;"></div>
        `;
        loadAndRenderJobs();

        document.getElementById('findJobsBtn').addEventListener('click', () => {
            const title = document.getElementById('searchTitle').value.toLowerCase();
            const location = document.getElementById('searchLocation').value.toLowerCase();
            loadAndRenderJobs(title, location);
        });
    });
}

async function loadAndRenderJobs(title = '', location = '') {
    const container = document.getElementById('searchResults');
    container.innerHTML = 'Loading...';
    try {
        const jobs = await makeApiCall('/jobs', 'GET');
        const filteredJobs = jobs.filter(job =>
            (!title || job.title.toLowerCase().includes(title) || job.company.toLowerCase().includes(title)) &&
            (!location || job.location.toLowerCase().includes(location))
        );
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
                    <div class="back-navigation" onclick="goBack()">
                        <i class="fas fa-chevron-left"></i> Back to Job List
                    </div>
                        <h2>${job.title}</h2>
                        <p><strong>Company:</strong> ${job.company}</p>
                        <p><strong>Location:</strong> ${job.location}</p>
                        <p><strong>Type:</strong> ${job.jobType}</p>
                        <p><strong>Category:</strong> ${job.jobCategory}</p>
                        <p><strong>Salary:</strong> ${job.salary || 'Not disclosed'}</p>
                        <p><strong>Description:</strong><br>${job.description}</p>
                        <p><strong>Qualifications:</strong><br>${job.qualifications}</p>
                        <p><strong>Deadline:</strong> ${new Date(job.applicationDeadline).toLocaleDateString()}</p>
                        <br><br>
                        <button class="apply-btn" id="applyNowBtn">Apply Now</button>
                        <button class="btn btn-outline" id="backToDashboardJobsBtn">← Back to Job List</button>
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
            <h2>My Profile</h2>
            <div class="profile-card">
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

// User Dashboard Functions

async function handleApply(jobId, applyLink) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.email) {
        alert("You must be logged in to apply.");
        return;
    }
    const response = await makeApiCall('/apply', 'POST', {
        jobId,
        userEmail: user.email,
        status: 'Clicked' 
    });
    if (response.error) {
        alert(response.error);
        return;
    }
    window.open(applyLink, '_blank');
    setTimeout(() => {
        const modal = document.getElementById('statusModal');
        modal.classList.add('active');
        document.getElementById('statusYesBtn').onclick = async () => {
            await makeApiCall('/apply/update-status', 'POST', {
                jobId,
                userEmail: user.email,
                status: 'Applied'
            });
            alert("Application status updated to 'Applied'");
            modal.classList.remove('active');
        };

        document.getElementById('statusNoBtn').onclick = async () => {
            await makeApiCall('/apply/update-status', 'POST', {
                jobId,
                userEmail: user.email,
                status: 'Cancelled'
            });
            alert("Application status marked as 'Cancelled'");
            modal.classList.remove('active');
        };
    }, 1000);    
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
        container.innerHTML = response.map(app => `
            <div class="activity-item">
                <div class="activity-icon"><i class="fas fa-file-alt"></i></div>
                <div class="activity-content">
                    <h4>${app.jobTitle}</h4>
                    <p>Applicant: ${app.userEmail}</p>
                    
                    <span class="activity-time">Applied on ${new Date(app.appliedAt).toLocaleDateString()}</span>
                    </div>
            <div class="application-count">
                Applications: ${app.applicationCount || 1}
            </div>
        </div>
        `).join('');
    } catch (error) {
        console.error('Error loading applications:', error);
        container.innerHTML = '<p class="error">Error loading applications. Please try again later.</p>';
    }
});

document.querySelector('a[href="#users"]').addEventListener('click', async (e) => {
    e.preventDefault();
    setActiveMenu('#users');
    pushToHistory('users', () => {
        document.querySelector('a[href="#users"]').click();
    });
    dashboardContent.innerHTML = `
        <div class="back-navigation" onclick="goBack()" style="display: ${navigationHistory.length > 1 ? 'block' : 'none'}">
            <i class="fas fa-chevron-left"></i> Back
        </div>
        <h2>Manage Users</h2>
        <div class="search-bar">
            <input type="text" id="userSearch" placeholder="Search users by name or email">
            <button id="searchUsersBtn">Search</button>
        </div>
        <div id="usersContainer" class="activity-list"></div>
    `;
    const container = document.getElementById('usersContainer');
    loadUsers();
    document.getElementById('searchUsersBtn').addEventListener('click', () => {
        const searchTerm = document.getElementById('userSearch').value.toLowerCase();
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



// document.querySelector('a[href="#settings"]').addEventListener('click', async (e) => {
//     e.preventDefault();
//     setActiveMenu('#settings');
//     pushToHistory('settings', () => {
//         document.querySelector('a[href="#settings"]').click();
//     });

//     dashboardContent.innerHTML = `
//     <div class="back-navigation" onclick="goBack()" style="display: ${navigationHistory.length > 1 ? 'block' : 'none'}">
//             <i class="fas fa-chevron-left"></i> Back
//         </div>
//         <h2>Admin Settings</h2>
//         <div class="settings-container">
//             <div class="settings-card">
//                 <h3><i class="fas fa-cog"></i> General Settings</h3>
//                 <form id="generalSettingsForm">
//                     <div class="form-group">
//                         <label>Site Title</label>
//                         <input type="text" id="siteTitle" value="CareerConnect">
//                     </div>
//                     <div class="form-group">
//                         <label>Admin Email</label>
//                         <input type="email" id="adminEmail" value="admin@careerconnect.com">
//                     </div>
//                     <div class="form-group">
//                         <label>Jobs Per Page</label>
//                         <input type="number" id="jobsPerPage" value="10" min="5" max="50">
//                     </div>
//                     <button type="submit" class="btn btn-primary">Save General Settings</button>
//                 </form>
//             </div>

//             <div class="settings-card">
//                 <h3><i class="fas fa-bell"></i> Notification Settings</h3>
//                 <form id="notificationSettingsForm">
//                     <div class="form-group">
//                         <label>
//                             <input type="checkbox" id="emailNotifications" checked>
//                             Enable Email Notifications
//                         </label>
//                     </div>
//                     <div class="form-group">
//                         <label>
//                             <input type="checkbox" id="newJobAlerts" checked>
//                             New Job Posting Alerts
//                         </label>
//                     </div>
//                     <div class="form-group">
//                         <label>
//                             <input type="checkbox" id="applicationAlerts" checked>
//                             New Application Alerts
//                         </label>
//                     </div>
//                     <button type="submit" class="btn btn-primary">Save Notification Settings</button>
//                 </form>
//             </div>

//             <div class="settings-card danger-zone">
//                 <h3><i class="fas fa-exclamation-triangle"></i> Danger Zone</h3>
//                 <div class="danger-actions">
//                     <button id="clearTestData" class="btn btn-outline">Clear Test Data</button>
//                     <button id="resetAllSettings" class="btn btn-outline">Reset All Settings</button>
//                     <button id="backupDatabase" class="btn btn-primary">Backup Database</button>
//                 </div>
//             </div>
//         </div>
//     `;

//     // Form submissions
//     document.getElementById('generalSettingsForm').addEventListener('submit', async (e) => {
//         e.preventDefault();
//         const settings = {
//             siteTitle: document.getElementById('siteTitle').value,
//             adminEmail: document.getElementById('adminEmail').value,
//             jobsPerPage: document.getElementById('jobsPerPage').value
//         };
        
//         const response = await makeApiCall('/settings/general', 'POST', settings);
//         if (response.error) {
//             alert(response.error);
//         } else {
//             alert('General settings saved successfully!');
//         }
//     });

//     document.getElementById('notificationSettingsForm').addEventListener('submit', async (e) => {
//         e.preventDefault();
//         const settings = {
//             emailNotifications: document.getElementById('emailNotifications').checked,
//             newJobAlerts: document.getElementById('newJobAlerts').checked,
//             applicationAlerts: document.getElementById('applicationAlerts').checked
//         };
        
//         const response = await makeApiCall('/settings/notifications', 'POST', settings);
//         if (response.error) {
//             alert(response.error);
//         } else {
//             alert('Notification settings saved successfully!');
//         }
//     });

//     // Danger zone actions
//     document.getElementById('clearTestData').addEventListener('click', async () => {
//         if (confirm('This will delete all test data. Are you sure?')) {
//             const response = await makeApiCall('/clear-test-data', 'POST');
//             if (response.error) {
//                 alert(response.error);
//             } else {
//                 alert('Test data cleared successfully!');
//             }
//         }
//     });

//     document.getElementById('resetAllSettings').addEventListener('click', async () => {
//         if (confirm('This will reset all settings to default. Are you sure?')) {
//             const response = await makeApiCall('/settings/reset', 'POST');
//             if (response.error) {
//                 alert(response.error);
//             } else {
//                 alert('Settings reset to default!');
//                 location.reload();
//             }
//         }
//     });

//     document.getElementById('backupDatabase').addEventListener('click', async () => {
//         const response = await makeApiCall('/backup', 'POST');
//         if (response.error) {
//             alert(response.error);
//         } else {
//             alert('Database backup created successfully!');
//             window.open(response.downloadUrl, '_blank');
//         }
//     });
// });


