// 1. Import all your packages
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// --- IMPORT YOUR ROUTES ---
const authRoutes = require('./routes/auth.routes'); 
const templateRoutes = require('./routes/template.routes');
const submissionRoutes = require('./routes/submission.routes');
const uploadsRouter = require('./routes/upload.routes');
const reportsRouter = require('./routes/report.routes');
const exportsRouter = require('./routes/export.routes');
const superAdminRoutes = require('./routes/superAdminRoutes');
const deptAdminRoutes = require('./routes/deptAdminRoutes');

// 2. Load environment variables
dotenv.config();

// 3. Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// 4. Middleware
app.use(express.json());

// ✅ FIX: REMOVE THE OLD cors()
app.use(
  cors({
    origin: [
      "https://campus-activity-tracker.onrender.com",
      "https://campus-activity-trackerr.onrender.com"
    ],
    credentials: true
  })
);

// --- CONNECT TO MONGODB ---
mongoose.connect(process.env.MONGO_DB_URI)
  .then(() => console.log('Connected to MongoDB successfully!'))
  .catch((err) => console.error('Failed to connect to MongoDB:', err));

// --- USE YOUR ROUTES ---
app.use('/api/auth', authRoutes); 
app.use('/api/templates', templateRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/uploads', uploadsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/exports', exportsRouter);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/dept', deptAdminRoutes);

// Error handler
app.use((err, req, res, next) => {
  if (err.message?.includes('Unsupported file type')) {
    return res.status(400).json({ message: err.message });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File too large. Max 5MB.' });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
