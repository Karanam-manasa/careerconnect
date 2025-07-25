# CareerConnect - Job Board Platform

CareerConnect is a full-featured, modern job board application designed to bridge the gap between talented job seekers and employers. It provides a seamless, interactive, and feature-rich experience for both users looking for their next career opportunity and administrators managing job postings.

The platform is built on the **MERN stack** (MongoDB, Express.js, React-like Vanilla JS, Node.js) and is designed to be robust, scalable, and user-friendly.

---

## 🚀 Key Features

### For Job Seekers (User Dashboard)
*   **Personalized Dashboard:** A dynamic dashboard that displays "Top Matches" based on the user's skills.
*   **Proactive Job Alerts:** Receive instant email notifications when a new job is posted that matches your skills, ensuring you never miss an opportunity.
*   **Advanced Job Filtering:** Users can filter jobs by keywords (title, company, skills), location, job type, and date posted.
*   **Interactive Job Cards:** Clean, attractive, and responsive job cards that provide key information at a glance.
*   **Detailed Job View:** Click on any job to see a comprehensive description, including required skills, location, and application details.
*   **Streamlined Application Process:** A simple "Apply Now" flow that redirects users to the company's application portal and allows them to track their application status (Applied, Clicked, Cancelled).
*   **Application Tracking:** A dedicated "My Applications" section where users can view the history and status of all their job applications.
*   **Profile Management:** Users can create and update a detailed professional profile, including their full name, contact info, education, skills, and links to their resume, LinkedIn, and portfolio.
*   **Profile Picture & Resume Uploads:** Easy-to-use interface for uploading and managing a profile picture and a PDF resume.
*   **Interview Preparation:** A built-in "Interview Tips" section with common questions and sample answers to help users prepare.
*   **Secure Authentication:** Secure signup and login system with email OTP verification for new accounts.

### For Job Posters (Admin Dashboard)
*   **Secure Admin Login:** Separate, secure login portal for administrators.
*   **Comprehensive Admin Dashboard:** An overview of recently posted jobs and key platform statistics.
*   **Full Job Management (CRUD):**
    *   **Create:** Post new jobs with detailed information, including title, company, location, type, category, salary, and required skills (selected from a predefined list).
    *   **Read:** View all active job postings in a clear, card-based layout.
    *   **Update:** Easily edit any existing job posting through a pre-filled form.
    *   **Delete:** Remove job postings. Deleted jobs are moved to a "Deleted Jobs" archive instead of being permanently lost.
*   <!-- NEW -->
    **Automated Candidate Outreach:** When a new job is posted, the system automatically notifies all registered users whose skills match the job requirements via email, maximizing visibility and application rates.
*   **Restore Deleted Jobs:** Admins can view archived jobs and restore them to the active list with a single click.
*   **User Management:** View a list of all registered users, see their detailed profiles, and manage accounts.
*   **Application Insights:** A powerful "View Applications" section to monitor platform activity, view application history by user, and see application counts per job.

---

## 🛠️ Tech Stack

*   **Backend:**
    *   **Node.js:** JavaScript runtime for the server.
    *   **Express.js:** Web application framework for Node.js, used to build the RESTful API.
    *   **MongoDB:** NoSQL database for storing user, job, and application data.
    *   **Mongoose:** Object Data Modeling (ODM) library for MongoDB and Node.js.
*   **Frontend:**
    *   **Vanilla JavaScript (ES6+):** Modern JavaScript used to create a dynamic, single-page application (SPA) experience without a heavy framework.
    *   **HTML5:** For structuring the web pages.
    *   **CSS3:** For modern styling, including Flexbox and Grid for responsive layouts.
*   **Key Libraries & Services:**
    *   `mongoose`: Database modeling.
    *   `express`: Server framework.
    *   `nodemailer`: For sending emails (OTP verification, application confirmations, job alerts).
    *   `multer`: For handling file uploads (resumes, profile pictures).
    *   `body-parser` & `cors`: Standard middleware for Express.
    *   `choices.js`: For advanced, user-friendly multi-select dropdowns.

---

## ⚙️ Getting Started

### Prerequisites

*   **Node.js** (v16 or later recommended)
*   **npm** (Node Package Manager)
*   **MongoDB** (Make sure your MongoDB server is running locally or provide a connection string for a cloud instance like MongoDB Atlas).

### Installation & Setup

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/Karanam-manasa/careerconnect.git
    cd careerconnect
    ```

2.  **Install Server Dependencies:**
    Navigate to the root directory and install the required npm packages.
    ```bash
    npm install
    npm install multer
    ```

3.  **Configure Environment:**
    *   The database connection string is currently set to `mongodb://localhost:27017/careerconnect` in `server.js`. If your MongoDB instance is running elsewhere, update this string.
    *   The email service is configured to use a Gmail account via `nodemailer`. You may need to generate an "App Password" for your Gmail account if you have 2-Factor Authentication enabled. Update the credentials in the `transporter` object in `server.js`.

4.  **Start the Server:**
    Run the following command to start the Express server. By default, it runs on `http://localhost:5000`.
    ```bash
    node server.js
    ```
    You should see `✅ Connected to MongoDB` and `🚀 Server running on http://localhost:5000` in your console.

5.  **Open the Application:**
    Open the `index.html` file in your web browser. You can do this by simply double-clicking the file or by using a live server extension in your code editor (like VS Code's "Live Server"). The application will then connect to your running backend.

### Default Admin Credentials

*   **Email:** `careerconnect868@gmail.com`
*   **Password:** `Admin@123`

