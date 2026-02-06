const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  
  year: {
    type: Number,
    required: true,
    min: 1888, 
    max: new Date().getFullYear() + 1  
  },
  
  director: {
    type: String,
    required: true,
    trim: true
  },
  
  image: {
    type: String,
    default: 'uploads/images/default-movie.jpg'
  },
  
  rating: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

movieSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;