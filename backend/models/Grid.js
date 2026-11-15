const mongoose = require('mongoose');

/**
 * Grid Schema
 * 
 * Represents a saved pathfinding grid layout:
 * - shortId: Unique short URL identifier (e.g. "a3f8c1")
 * - name: User-friendly grid name (e.g. "Difficult Maze")
 * - start: Start cell ID (0 to 799)
 * - end: Target cell ID (0 to 799)
 * - walls: Array of cell IDs that act as obstacles
 * - weights: Array of { cell, weight } objects representing mud cells
 * - createdAt: Timestamp of when the grid was saved
 */
const gridSchema = new mongoose.Schema({
  shortId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    default: 'Untitled Grid',
    trim: true,
    maxlength: 100,
  },
  start: {
    type: Number,
    required: true,
  },
  end: {
    type: Number,
    required: true,
  },
  walls: {
    type: [Number],
    default: [],
  },
  weights: {
    type: [
      {
        cell: { type: Number, required: true },
        weight: { type: Number, default: 5 },
      },
    ],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Grid', gridSchema);
