require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const gridRoutes = require('./routes/gridRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pathx';

// Enable CORS for frontend integration
app.use(cors());

// Parse incoming JSON payloads
app.use(express.json());

// API Routes
app.use('/api/grids', gridRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    mongoConnected: mongoose.connection.readyState === 1,
  });
});

// Connect to MongoDB
mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 3000, // Timeout quickly if MongoDB is offline
  })
  .then(() => {
    console.log(`[Database] Successfully connected to MongoDB at ${MONGO_URI}`);
  })
  .catch((err) => {
    console.warn(`[Database Warning] Could not connect to MongoDB: ${err.message}`);
    console.warn(`[Database Notice] Operating with in-memory fallback. Server is fully operational!`);
  });

// Start Express server
const server = app.listen(PORT, () => {
  console.log(`[PathX Backend] Server is running on http://localhost:${PORT}`);
});

module.exports = { app, server };
