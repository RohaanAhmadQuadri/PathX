const express = require('express');
const crypto = require('crypto');
const Grid = require('../models/Grid');

const router = express.Router();

// In-memory fallback cache in case local MongoDB is temporarily unavailable
const inMemoryGrids = new Map();

/**
 * Generates a clean, URL-safe 6-character alphanumeric short ID.
 * Example: "a9k2f4"
 */
function generateShortId() {
  return crypto.randomBytes(3).toString('hex');
}

/**
 * Checks if Mongoose is connected to MongoDB (readyState === 1).
 */
function isMongoConnected() {
  const mongoose = require('mongoose');
  return mongoose.connection.readyState === 1;
}

/**
 * POST /api/grids
 * Saves a new grid layout (start, end, walls, weights, name) and returns its short ID.
 */
router.post('/', async (req, res) => {
  try {
    const { name, start, end, walls = [], weights = [] } = req.body;

    if (start === undefined || end === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: start and end are mandatory.',
      });
    }

    const shortId = generateShortId();
    const gridData = {
      shortId,
      name: name && name.trim() ? name.trim() : 'Untitled Grid',
      start: Number(start),
      end: Number(end),
      walls: Array.isArray(walls) ? walls.map(Number) : [],
      weights: Array.isArray(weights)
        ? weights.map((w) => (typeof w === 'object' ? w : { cell: Number(w), weight: 5 }))
        : [],
      createdAt: new Date(),
    };

    if (isMongoConnected()) {
      const newGrid = await Grid.create(gridData);
      return res.status(201).json({
        success: true,
        id: newGrid.shortId,
        grid: newGrid,
      });
    } else {
      // In-memory fallback
      inMemoryGrids.set(shortId, gridData);
      return res.status(201).json({
        success: true,
        id: shortId,
        grid: gridData,
        notice: 'Saved to in-memory store (MongoDB service offline)',
      });
    }
  } catch (error) {
    console.error('Error saving grid:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to save grid layout',
      details: error.message,
    });
  }
});

/**
 * GET /api/grids
 * Returns the latest 20 saved grids.
 */
router.get('/', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const grids = await Grid.find()
        .sort({ createdAt: -1 })
        .limit(20)
        .select('shortId name start end walls weights createdAt');
      return res.status(200).json({
        success: true,
        grids,
      });
    } else {
      // In-memory fallback: sort latest by createdAt descending, limit 20
      const list = Array.from(inMemoryGrids.values())
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 20);
      return res.status(200).json({
        success: true,
        grids: list,
      });
    }
  } catch (error) {
    console.error('Error fetching grids:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve grids',
      details: error.message,
    });
  }
});

/**
 * GET /api/grids/:id
 * Loads a specific grid by its short ID.
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      const grid = await Grid.findOne({ shortId: id });
      if (!grid) {
        return res.status(404).json({
          success: false,
          error: `Grid with ID "${id}" was not found.`,
        });
      }
      return res.status(200).json({
        success: true,
        grid,
      });
    } else {
      // In-memory fallback
      const grid = inMemoryGrids.get(id);
      if (!grid) {
        return res.status(404).json({
          success: false,
          error: `Grid with ID "${id}" was not found.`,
        });
      }
      return res.status(200).json({
        success: true,
        grid,
      });
    }
  } catch (error) {
    console.error('Error loading grid by ID:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to load grid',
      details: error.message,
    });
  }
});

module.exports = router;
