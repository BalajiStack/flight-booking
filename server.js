const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const duffelService = require('./services/duffelService');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve frontend files

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Flight booking API is running' });
});

// Airport suggestions endpoint
app.get('/api/airports', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }
    const suggestions = await duffelService.getAirportSuggestions(q);
    res.json(suggestions);
  } catch (error) {
    console.error('Airport suggestions error:', error);
    res.status(500).json({ error: 'Failed to fetch airport suggestions', details: error.message });
  }
});

// Flight search endpoint
app.post('/api/flights/search', async (req, res) => {
  try {
    const { origin, destination, departureDate, returnDate, passengers } = req.body;
    
    // Validate required fields
    if (!origin || !destination || !departureDate || !passengers) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await duffelService.searchFlights({
      origin,
      destination,
      departureDate,
      returnDate,
      passengers: parseInt(passengers),
    });

    res.json(result);
  } catch (error) {
    console.error('Flight search error:', error);
    res.status(500).json({ error: 'Failed to search flights', details: error.message });
  }
});

// Get offer details
app.get('/api/offers/:id', async (req, res) => {
  try {
    const offer = await duffelService.getOffer(req.params.id);
    res.json(offer);
  } catch (error) {
    console.error('Offer fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch offer', details: error.message });
  }
});

// Create booking
app.post('/api/bookings', async (req, res) => {
  try {
    const { offerId, passengers, payment } = req.body;
    
    if (!offerId || !passengers) {
      return res.status(400).json({ error: 'Missing offerId or passengers' });
    }

    const booking = await duffelService.createBooking(offerId, passengers, payment);

    res.json({
      bookingId: booking.id,
      booking,
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ error: 'Failed to create booking', details: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
