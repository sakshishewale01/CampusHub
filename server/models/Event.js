// ========================================================
// CampusHub 3.0 - Event Model (Mongoose)
// Represents campus events with categories, schedule,
// venue, capacity, and active status.
// ========================================================

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an event title'],
      trim: true,
      minlength: [3, 'Event title must be at least 3 characters']
    },
    description: {
      type: String,
      required: [true, 'Please provide an event description'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: ['Technical', 'Cultural', 'Sports', 'Workshop']
    },
    date: {
      type: String,
      required: [true, 'Please select an event date']
    },
    time: {
      type: String,
      default: '10:00 AM',
      trim: true
    },
    venue: {
      type: String,
      required: [true, 'Please provide an event venue'],
      trim: true
    },
    capacity: {
      type: Number,
      required: [true, 'Please specify the maximum seat capacity'],
      min: [1, 'Capacity must be at least 1 seat']
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Registration Closed', 'Completed'],
      default: 'Upcoming'
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=500&q=80'
    }
  },
  {
    timestamps: true
  }
);

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

module.exports = Event;
