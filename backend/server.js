require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
const multer = require('multer');
const fs = require('fs');
const app = express();
const otpStore = {};


const MONGODB_URI = process.env.MONGODB_URI;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const VERCEL_FRONTEND_URL = process.env.VERCEL_FRONTEND_URL || 'http://localhost:3000';


const uploadDir = path.join(__dirname, 'uploads/resumes');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/resumes/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

app.use(cors(
    {
    origin: 'https://careerconnect-fzmeo8655-manasa-karanams-projects.vercel.app/',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], 
    credentials: true // 

}));

// app.use(cors());
//  app.use(express.static(path.join(__dirname, '..')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, '..', 'index.html'));
// });


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user:  EMAIL_USER,
        pass: EMAIL_PASS 
    }
});

app.post('/api/send-confirmation', async (req, res) => {
    
    const { userEmail, userName, jobTitle, company, status } = req.body; 

    let subject = '';
    let htmlContent = '';
    if (status === 'Applied') {
        subject = `✅ Confirmation: Your Application for ${jobTitle} at ${company}`;
        htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #27ae60;">✅ Application Confirmed</h2>
                <p>Dear ${userName || 'Applicant'},</p>
                <p>Thank you for confirming your application for the <strong>${jobTitle}</strong> position at <strong>${company}</strong> through <strong>CareerConnect</strong>.</p>
                <p>We've recorded your application and wish you the best of luck!</p>
                <h4 style="margin-bottom: 8px; margin-top: 20px;">📄 Application Summary</h4>
                <ul style="line-height: 1.6;">
                    <li><strong>Role:</strong> ${jobTitle}</li>
                    <li><strong>Company:</strong> ${company}</li>
                    <li><strong>Application Date:</strong> ${new Date().toLocaleDateString()}</li>
                    <li><strong>Status:</strong> <span style="color:#27ae60; font-weight:bold;">Applied</span></li>
                </ul>
                <p style="margin-top: 30px;">Warm regards,<br><strong>The CareerConnect Team</strong></p>
                <div style="font-size: 12px; color: #777; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
                    <p>This is an automated message. Please do not reply to this email.</p>
                </div>
            </div>`;
    } else if (status === 'Cancelled') {
        subject = `❌ Notice: Your Application for ${jobTitle} at ${company} was Cancelled`;
        htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #c0392b;">❌ Application Cancelled</h2>
                <p>Dear ${userName || 'Applicant'},</p>
                <p>As per your request, we have marked your application for the <strong>${jobTitle}</strong> position at <strong>${company}</strong> as 'Cancelled'.</p>
                <p>If this was a mistake, or if you change your mind, you can apply again before the deadline.</p>
                <h4 style="margin-bottom: 8px; margin-top: 20px;">📄 Application Summary</h4>
                <ul style="line-height: 1.6;">
                    <li><strong>Role:</strong> ${jobTitle}</li>
                    <li><strong>Company:</strong> ${company}</li>
                    <li><strong>Status:</strong> <span style="color:#c0392b; font-weight:bold;">Cancelled</span></li>
                </ul>
                <p style="margin-top: 30px;">Warm regards,<br><strong>The CareerConnect Team</strong></p>
                <div style="font-size: 12px; color: #777; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
                    <p>This is an automated message. Please do not reply to this email.</p>
                </div>
            </div>`;
    } else {
        return res.status(400).json({ error: 'Invalid application status for email confirmation.' });
    }

    const mailOptions = {
        from: 'CareerConnect <careerconnect868@gmail.com>',
        to: userEmail,
        subject: subject,
        html: htmlContent
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Confirmation email sent successfully.' });
    } catch (error) {
        console.error('Email send error:', error);
        res.status(500).json({ error: 'Failed to send confirmation email.' });
    }
});

// app.get("/jobs/:jobId", (req, res) => {
//     res.sendFile(path.join(__dirname, "public", "job.html"));
//   });

// await mongoose.connect(process.env.MONGODB_URI, {
//     // useNewUrlParser: true,
//     // useUnifiedTopology: true
// })
// .then(() => console.log('✅ Connected to MongoDB'))
// .catch(err => console.error('❌ MongoDB connection error:', err));

/**
 * @param {object} newJob 
 */
async function sendJobAlerts(newJob) {
    console.log(`[+] Starting job alert process for new job: "${newJob.title}"`);

    try {
        const requiredSkills = newJob.qualifications;
        if (!requiredSkills || requiredSkills.length === 0) {
            console.log(`[i] Job "${newJob.title}" has no required skills. Skipping alerts.`);
            return;
        }
        const skillRegexes = requiredSkills.map(skill => new RegExp('^' + skill + '$', 'i'));
        const matchedUsers = await User.find({
            skills: { $in: skillRegexes }
        }).select('username email skills');

        if (matchedUsers.length === 0) {
            console.log(`[i] No users found with skills matching "${newJob.title}".`);
            return;
        }

        console.log(`[+] Found ${matchedUsers.length} users with matching skills. Preparing to send emails.`);
        for (const user of matchedUsers) {
            const userMatchedSkills = user.skills.filter(userSkill =>
                requiredSkills.some(requiredSkill => new RegExp('^' + requiredSkill + '$', 'i').test(userSkill))
            );

            if (userMatchedSkills.length > 0) {
                const mailOptions = {
                    from: 'CareerConnect <careerconnect868@gmail.com>',
                    to: user.email,
                    subject: `✨ New Job Opportunity Matching Your Skills: ${newJob.title}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 8px;">
                            <h2 style="color: #4a6bff;">Hi ${user.username || 'there'}, a new job opportunity awaits!</h2>
                            <p>A new position has been posted on <strong>CareerConnect</strong> that we thought you'd be interested in based on your skills.</p>
                            
                            <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin-top: 20px;">
                                <h3 style="margin-top: 0; color: #2c3e50;">${newJob.title}</h3>
                                <p style="font-size: 1.1em; color: #555;">at <strong>${newJob.company}</strong></p>
                                <p><strong>Location:</strong> ${newJob.location}</p>
                                <p><strong>Job Type:</strong> ${newJob.jobType}</p>
                            </div>

                            <div style="margin-top: 20px;">
                                <h4 style="color: #2ecc71;">Your Matching Skills:</h4>
                                <p style="font-size: 1.1em; font-weight: bold;">${userMatchedSkills.join(', ')}</p>
                            </div>
<a href="http://127.0.0.1:5000/?job=${newJob._id}" style="display: inline-block; margin-top: 25px; padding: 12px 25px; background-color: #4a6bff; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">View Job & Apply Now</a>
                            
                            <p style="margin-top: 30px; font-size: 0.9em; color: #777;">
                                Good luck with your application!<br>
                                <strong>The CareerConnect Team</strong>
                            </p>
                        </div>
                    `
                };

                try {
                    await transporter.sendMail(mailOptions);
                    
                } catch (emailError) {
                    console.error(`[❌] Failed to send job alert to ${user.email}:`, emailError);
                }
            }
        }

    } catch (error) {
        console.error('[🚨] A critical error occurred in the sendJobAlerts process:', error);
    }
}

const educationSchema = new mongoose.Schema({
    institution: String,
    degree: String,
    fieldOfStudy: String,
    startYear: Number,
    endYear: Number
});

const User = mongoose.model('User', new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    userType: { type: String, required: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    fullName: { type: String },
    profilePicture: { type: String }, 
    skills: { type: [String], default: [] },
    resume: { type: String },
    linkedin: { type: String },
    portfolio: { type: String },
    education: [educationSchema]

}));

const Job = mongoose.model('Job', new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    jobType: { type: String },
    jobCategory: { type: String },
    description: { type: String, required: true },
    qualifications: { type: [String] },
    salary: { type: String },
    applicationDeadline: { type: Date },
    applyLink: { type: String },
    postedBy: { type: String, required: true },
    datePosted: { type: Date, default: Date.now },
    applicationCount: {
        type: Number,
        default: 0  
}
}));

const deletedJobSchema = new mongoose.Schema({
    title: String,
    company: String,
    location: String,
    jobType: String,
    jobCategory: String,
    description: String,
    qualifications: [String],
    salary: String,
    applicationDeadline: Date,
    applyLink: String,
    postedBy: String,
    datePosted: Date,
    deletedAt: { type: Date, default: Date.now }
});

const DeletedJob = mongoose.model('DeletedJob', deletedJobSchema);
const Application = mongoose.model('Application', new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  jobTitle: { type: String },  
  company: { type: String },    
  userEmail: { type: String, required: true },
  appliedAt: { type: Date, default: Date.now },
  status: { type: String, default: 'Clicked', enum: ['Clicked', 'Applied', 'Cancelled'] }
}));

app.post('/api/signup', async (req, res) => {
    try {
        const { username, email, phone, userType, password, confirmPassword } = req.body;
        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        const user = new User({ username, email, phone, userType, password });
        await user.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || user.password !== password) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        res.json({
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/jobs', async (req, res) => {
    try {
        const { title, company, location, jobType, jobCategory, qualifications, salary, applicationDeadline, applyLink, description, postedBy } = req.body;
        if (!title || !company || !location || !jobType || !jobCategory || !qualifications || !salary || !applicationDeadline || !applyLink || !description || !postedBy) {
            return res.status(400).json({ error: 'Please fill all required fields' });
        }
        const skillsArray = qualifications ? qualifications.split(',').map(s => s.trim()) : [];
        const job = new Job({ title, company, location, jobType, jobCategory, qualifications: skillsArray,  salary, applicationDeadline, applyLink, description, postedBy });
        await job.save();
        sendJobAlerts(job); 
        res.status(201).json({ message: 'Job posted successfully', job });
    } catch (error) {
        console.error('Create job error:', error);
        res.status(500).json({ error: 'Server error while posting job' });
    }
});

app.get('/api/jobs', async (req, res) => {
    try {
        const jobs = await Job.find().sort({ datePosted: -1 });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: 'Server error fetching jobs' });
    }
});

app.get('/api/jobs/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        res.json(job);
    } catch (error) {
        res.status(500).json({ error: 'Server error fetching job' });
    }
});

app.put('/api/jobs/:id', async (req, res) => {
    try {
        const { title, company, location, jobType, jobCategory, description, qualifications, salary, applicationDeadline, postingDate, applyLink, postedBy } = req.body;
         const skillsArray = qualifications ? qualifications.split(',').map(s => s.trim()) : [];
        const updatedJob = await Job.findByIdAndUpdate(req.params.id, {
            title,
            company,
            location,
            jobType,
            jobCategory,
            description,
            qualifications: skillsArray,
            salary,
            applicationDeadline,
            datePosted: postingDate,
            applyLink,
            postedBy
        }, { new: true });
        if (!updatedJob) {
            return res.status(404).json({ error: 'Job not found' });
        }
        res.json({ message: 'Job updated successfully', job: updatedJob });
    } catch (error) {
        res.status(500).json({ error: 'Server error updating job' });
    }
});

app.delete('/api/jobs/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ error: 'Job not found' });
        const deletedJob = new DeletedJob(job.toObject());
        await deletedJob.save();
        await job.deleteOne();
        res.json({ message: 'Job deleted and stored in deleted-jobs.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error deleting job.' });
    }
});

app.get('/api/deleted-jobs', async (req, res) => {
    try {
        const deletedJobs = await DeletedJob.find().sort({ deletedAt: -1 });
        res.json(deletedJobs);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching deleted jobs' });
    }
});

app.post('/api/deleted-jobs/:id/restore', async (req, res) => {
    try {
        const deletedJob = await DeletedJob.findById(req.params.id);
        if (!deletedJob) {
            return res.status(404).json({ error: 'Deleted job not found' });
        }
        const existingJob = await Job.findOne({
            title: deletedJob.title,
            company: deletedJob.company,
            location: deletedJob.location
        });
        if (existingJob) {
            return res.status(400).json({ error: 'Job already exists in active jobs.' });
        }
        const restoredJob = new Job({
            title: deletedJob.title,
            company: deletedJob.company,
            location: deletedJob.location,
            jobType: deletedJob.jobType,
            jobCategory: deletedJob.jobCategory,
            description: deletedJob.description,
            qualifications: deletedJob.qualifications,
            salary: deletedJob.salary,
            applicationDeadline: deletedJob.applicationDeadline,
            applyLink: deletedJob.applyLink,
            postedBy: deletedJob.postedBy,
            datePosted: deletedJob.datePosted
        });

        await restoredJob.save();
        await DeletedJob.findByIdAndDelete(deletedJob._id);

        res.json({ message: 'Job restored successfully', restoredJob });
    } catch (error) {
        console.error('Error restoring job:', error);
        res.status(500).json({ error: 'Failed to restore job' });
    }
});

app.post('/api/apply', async (req, res) => {
    try {
        const { jobId, userEmail, status } = req.body;
        if (!jobId || !userEmail) {
            return res.status(400).json({ error: 'Missing jobId or userEmail' });
        }
        const existing = await Application.findOne({ jobId, userEmail });
        if (existing) {
            if (existing.status === 'Cancelled') {
                existing.status = status || 'Clicked';
                existing.appliedAt = new Date();
                await existing.save();
                return res.status(200).json({ message: 'Re-application successful', application: existing });
            } else {
                return res.status(400).json({ error: 'You have already applied for this job' });
            }
        }

const job = await Job.findById(jobId);
if (!job) return res.status(404).json({ error: 'Job not found' });
const application = new Application({
    jobId,
    userEmail,
    jobTitle: job.title,      
    company: job.company,    
    status: status || 'Clicked'
});
        await application.save();
        await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: 1 } });
        res.status(201).json({ message: 'Application submitted successfully', application });
    } catch (error) {
        console.error('Apply error:', error);
        res.status(500).json({ error: 'Server error while applying' });
    }
});

const { ObjectId } = require('mongodb'); 
app.post('/apply/:jobId', async (req, res) => {
  const jobId = req.params.jobId;
  try {
    const result = await db.collection('jobs').updateOne(
      { _id: new ObjectId(jobId) },
      { $inc: { applicationCount: 1 } }
    );
    res.status(200).send({ success: true });
  } catch (err) {
    console.error('Error updating application count:', err);
    res.status(500).send({ success: false });
  }
});

app.get('/api/applications', async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('jobId', 'title company applicationDeadline') 
      .sort({ appliedAt: -1 });
    const validApps = applications.filter(app => app.jobId !== null);
    const formatted = validApps.map(app => ({
      userEmail: app.userEmail,
      appliedAt: app.appliedAt,
      status: app.status,
      jobTitle: app.jobId?.title || app.jobTitle || 'Deleted Job',
      company: app.jobId?.company || app.company || 'Unknown Company',
      applicationDeadline: app.jobId?.applicationDeadline || null 
    }));
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Server error fetching applications' });
  }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Server error fetching users' });
    }
});

app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Server error fetching user' });
    }
});

app.put('/api/users/:id', upload.fields([{ name: 'profilePicture', maxCount: 1 }, { name: 'resume', maxCount: 1 }]), async (req, res) => {
    try {
        const { fullName, phone, userType, skills, linkedin, portfolio, education, deleteProfilePicture } = req.body;
        const updateData = {
            fullName,
            phone,
            userType,
            linkedin,
            portfolio,
            skills: (skills && skills.length > 0) ? skills.split(',').map(s => s.trim()) : [],
            education: education ? JSON.parse(education) : []
        };

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (deleteProfilePicture === 'true' && user.profilePicture) {
            const oldPicPath = path.join(uploadDir, user.profilePicture);
            fs.unlink(oldPicPath, (err) => {
                if (err) console.error("Error deleting old profile picture:", err);
            });
            updateData.profilePicture = null; 
        }

        if (req.files && req.files['profilePicture']) {
            if (user.profilePicture) {
                const oldPicPath = path.join(uploadDir, user.profilePicture);
                if (fs.existsSync(oldPicPath)) {
                    fs.unlink(oldPicPath, (err) => {
                        if (err) console.error("Error deleting old profile picture on update:", err);
                    });
                }
            }
            updateData.profilePicture = req.files['profilePicture'][0].filename;
        }

        if (req.files && req.files['resume']) {
            if (user.resume) {
                 const oldResumePath = path.join(uploadDir, user.resume);
                 if (fs.existsSync(oldResumePath)) {
                     fs.unlink(oldResumePath, (err) => {
                        if (err) console.error("Error deleting old resume on update:", err);
                     });
                 }
            }
            updateData.resume = req.files['resume'][0].filename;
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true }).select('-password');
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: 'Server error updating user' });
    }
});

app.post('/api/users/:id/reset-password', async (req, res) => {
    try {
        const { newPassword } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        user.password = newPassword;
        await user.save();
        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error resetting password' });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error deleting user' });
    }
});

app.post('/api/apply/update-status', async (req, res) => {
    const { jobId, userEmail, status } = req.body;
    try {
        const application = await Application.findOneAndUpdate(
            { jobId, userEmail },
            { status },
            { new: true }
        );
        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }
        res.json({ message: 'Status updated successfully', application });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ error: 'Server error while updating status' });
    }
});



app.get('/api/applications/:email', async (req, res) => {
    try {
        
        const applications = await Application.find({ userEmail: req.params.email }).populate('jobId');
        const formatted = applications.map(app => {
            const isJobDeleted = !app.jobId;
            return {
                jobId: app.jobId?._id || null, 
                jobTitle: isJobDeleted ? app.jobTitle : app.jobId.title,
                company: isJobDeleted ? app.company : app.jobId.company,
                status: app.status,
                appliedAt: app.appliedAt
            };
        });
        res.json(formatted);
    } catch (error) {
        console.error('Error fetching user applications:', error);
        res.status(500).json({ error: 'Server error fetching applications' });
    }
});


app.get('/api/applications/stats/:email', async (req, res) => {
    try {
        const userEmail = req.params.email;
        const stats = await Application.aggregate([
            { $match: { userEmail: userEmail } },
            { $group: {
                _id: '$status', 
                count: { $sum: 1 } 
            }}
        ]);
        res.json(stats);

    } catch (error) {
        console.error('Error fetching application stats:', error);
        res.status(500).json({ error: 'Server error fetching stats' });
    }
});

app.post('/api/send-otp', async (req, res) => {
    const { email } = req.body;
    console.log('🔔 Received OTP request for:', email);
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit

    otpStore[email] = { otp, expiry: Date.now() + 5 * 60 * 1000 }; 
    console.log(`📨 OTP for ${email} is ${otp}`);

    const mailOptions = {
        from: 'CareerConnect <careerconnect868@gmail.com>',
        to: email,
        subject: 'CareerConnect Email Verification OTP',
        html: `<p>Your OTP for email verification is: <strong>${otp}</strong></p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'OTP sent' });

    } catch (err) {
        console.error('❌ Error sending OTP:', err); 
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});


app.post('/api/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    const record = otpStore[email];

    if (!record || record.expiry < Date.now()) {
        return res.status(400).json({ error: 'OTP expired or invalid' });
    }
    if (record.otp != otp) {
        return res.status(400).json({ error: 'Invalid OTP' });
    }
    delete otpStore[email];
    res.status(200).json({ message: 'OTP verified' });
});

// const PORT = 5000;
// app.listen(PORT, () => {
//     console.log(`🚀 Server running on http://localhost:${PORT}`);
// });


const PORT = process.env.PORT || 5000; // Use process.env.PORT if available (Render provides this)

async function startServer() {
    try {
        await mongoose.connect(MONGODB_URI); // Use MONGODB_URI from env
        console.log('✅ Connected to MongoDB');

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('❌ Failed to connect to MongoDB and start server:', err);
        process.exit(1); // Exit with failure
    }
}

startServer();
