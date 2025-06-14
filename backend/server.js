const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(__dirname));

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'careerconnect868@gmail.com',
        pass: 'vjyp sice cfbv vhbz' 
    }
});

app.post('/api/send-confirmation', async (req, res) => {
    console.log("📦 Received request body:", req.body); 
    const { userEmail, userName, jobTitle, company } = req.body;
    const mailOptions = {
        from: 'CareerConnect <careerconnect868@gmail.com>',
        to: userEmail,
        subject: `Confirmation: ${jobTitle} Role at ${company}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #2c3e50;">✅ Application Confirmation</h2>
                <p>Dear ${userName || 'Applicant'},</p>
                <p>Thank you for applying for the <strong>${jobTitle}</strong> position at <strong>${company}</strong> through <strong>CareerConnect</strong>.</p>
                <h4 style="margin-bottom: 8px;">📄 Application Summary</h4>
                <ul style="line-height: 1.6;">
                    <li><strong>Role:</strong> ${jobTitle}</li>
                    <li><strong>Company:</strong> ${company}</li>
                    <li><strong>Application Date:</strong> ${new Date().toLocaleDateString()}</li>
                </ul>
                <p style="margin-top: 20px;">We wish you the best of luck with your application.</p>
                <p style="margin-top: 30px;">Warm regards,<br><strong>The CareerConnect Team</strong></p>
                <div style="font-size: 12px; color: #777; margin-top: 30px;">
                    <p>This is an automated message. Please do not reply to this email.</p>
                </div>
            </div>
      `
    };
    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Confirmation email sent successfully.' });
    } catch (error) {
        console.error('Email send error:', error);
        res.status(500).json({ error: 'Failed to send confirmation email.' });
    }
});

app.get("/jobs/:jobId", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "job.html"));
  });

mongoose.connect('mongodb://localhost:27017/careerconnect', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

const User = mongoose.model('User', new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    userType: { type: String, required: true },
    password: { type: String, required: true }
}));

const Job = mongoose.model('Job', new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    jobType: { type: String },
    jobCategory: { type: String },
    description: { type: String, required: true },
    qualifications: { type: String },
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
    qualifications: String,
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
                email: user.email,
                phone: user.phone,
                userType: user.userType
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
        const job = new Job({ title, company, location, jobType, jobCategory, qualifications, salary, applicationDeadline, applyLink, description, postedBy });
        await job.save();
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
        const updatedJob = await Job.findByIdAndUpdate(req.params.id, {
            title,
            company,
            location,
            jobType,
            jobCategory,
            description,
            qualifications,
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
app.put('/api/users/:id', async (req, res) => {
    try {
        const { username, email, userType } = req.body;
        const updatedUser = await User.findByIdAndUpdate(req.params.id, {
            username,
            email,
            userType
        }, { new: true }).select('-password');
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
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
        const formatted = applications.map(app => ({
            jobId: app.jobId?._id, 
            jobTitle: app.jobId?.title || 'Deleted Job',
            status: app.status,
            appliedAt: app.appliedAt,
            userEmail: app.userEmail
        }));
        res.json(formatted);
    } catch (error) {
        console.error('Error fetching user applications:', error);
        res.status(500).json({ error: 'Server error fetching applications' });
    }
});


const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
