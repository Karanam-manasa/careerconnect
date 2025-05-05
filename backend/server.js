const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const path = require('path');
app.use(express.static(__dirname));

app.get("/jobs/:jobId", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "job.html"));
  });

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/careerconnect', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Models
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

const Application = mongoose.model('Application', new mongoose.Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    userEmail: { type: String, required: true },
    appliedAt: { type: Date, default: Date.now },
    status: { type: String, default: 'Clicked', enum: ['Clicked', 'Applied', 'Cancelled'] }
}));

// User Signup
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

// User Login
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

// Create Job
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

// Get All Jobs
app.get('/api/jobs', async (req, res) => {
    try {
        const jobs = await Job.find().sort({ datePosted: -1 });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: 'Server error fetching jobs' });
    }
});

// Get Single Job
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

// Update Job
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

// Delete Job
app.delete('/api/jobs/:id', async (req, res) => {
    try {
        const deletedJob = await Job.findByIdAndDelete(req.params.id);
        if (!deletedJob) {
            return res.status(404).json({ error: 'Job not found' });
        }
        res.json({ message: 'Job deleted successfully', deletedJob });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Server error deleting job' });
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

        // No application yet — create one
        const application = new Application({
            jobId,
            userEmail,
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
        const applications = await Application.find().populate('jobId');
        const formatted = applications.map(app => ({
            userEmail: app.userEmail,
            appliedAt: app.appliedAt,
            jobTitle: app.jobId ? app.jobId.title : 'Deleted Job',
            applicationCount: app.jobId?.applicationCount ?? 0  
        }));
        res.json(formatted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching applications' });
    }
});

// Get all users (Admin only)
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Server error fetching users' });
    }
});

// Get single user
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

// Update user
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

// Reset password
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

// Delete user
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

// Settings routes
app.post('/api/settings/general', async (req, res) => {
    try {
        res.json({ message: 'General settings saved successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error saving settings' });
    }
});

app.post('/api/settings/notifications', async (req, res) => {
    try {
        res.json({ message: 'Notification settings saved successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error saving settings' });
    }
});

app.post('/api/clear-test-data', async (req, res) => {
    try {
        res.json({ message: 'Test data cleared successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error clearing test data' });
    }
});

app.post('/api/settings/reset', async (req, res) => {
    try {
        res.json({ message: 'Settings reset to default' });
    } catch (error) {
        res.status(500).json({ error: 'Server error resetting settings' });
    }
});

app.post('/api/backup', async (req, res) => {
    try {
        res.json({ 
            message: 'Backup created successfully',
            downloadUrl: '/backup-file.sql' 
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error creating backup' });
    }
});


// Update application status
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

// Get applications for a specific user by email
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



// Start Server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
