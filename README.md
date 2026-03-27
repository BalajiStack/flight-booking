# Flight Booking Website

A simple, single-page responsive flight booking website with a Node.js backend that integrates with Duffel API in test mode. The site allows customers to search flights, view offers, fill passenger details, and complete a booking using Duffel's test payment flow.

## Features

- **Responsive Single-Page Application**: Clean, modern UI that works on desktop and mobile
- **Flight Search**: Search flights by origin, destination, dates, and number of passengers
- **Real-time Airport Suggestions**: Type-ahead airport search with IATA code and city names
- **Flight Offers Display**: View available flights with details (airline, times, duration, price)
- **Passenger Details Form**: Collect passenger information with validation
- **Test Booking Flow**: Complete booking with test payment (using Duffel test mode)
- **Step-by-Step Process**: Clear 4-step process: Search → Select → Passengers → Booking

## Technology Stack

### Backend
- Node.js with Express
- Duffel API client (`@duffel/api`)
- CORS enabled
- Environment variables for configuration

### Frontend
- Vanilla HTML5, CSS3, JavaScript (ES6)
- Responsive design with CSS Grid and Flexbox
- Font Awesome icons
- Google Fonts (Poppins)

## Project Structure

```
flight-booking/
├── server.js                 # Main Express server
├── services/
│   └── duffelService.js     # Duffel API service layer
├── public/                  # Frontend static files
│   ├── index.html          # Main HTML page
│   ├── styles.css          # CSS styles
│   └── app.js              # Frontend JavaScript
├── package.json            # Dependencies and scripts
├── .env                    # Environment variables (template)
└── README.md               # This file
```

## Prerequisites

- Node.js (v14 or higher)
- Duffel API account (test mode)
- npm or yarn

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd flight-booking
npm install
```

### 2. Configure Duffel API

1. Sign up for a Duffel account at [https://duffel.com](https://duffel.com)
2. Get your test access token from the Duffel dashboard
3. Create a `.env` file in the project root:

```env
PORT=3000
DUFFEL_ACCESS_TOKEN=duffel_test_your_test_token_here
```

### 3. Run the Application

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/airports?q=query` | Airport suggestions |
| POST | `/api/flights/search` | Search flights |
| GET | `/api/offers/:id` | Get offer details |
| POST | `/api/bookings` | Create booking |

## Usage Guide

### 1. Search Flights
- Enter origin and destination airport codes (e.g., LHR, JFK)
- Select departure and optional return dates
- Choose number of passengers (1-6 adults)
- Click "Search Flights"

### 2. Select Flight
- Browse available flight offers
- Compare prices, airlines, and timings
- Click "Select This Flight" on your preferred option

### 3. Passenger Details
- Fill in passenger information for each traveler
- Required fields: name, email, phone, date of birth
- Click "Proceed to Booking"

### 4. Confirm Booking
- Review flight details and price
- Use test payment details:
  - Card: `4242 4242 4242 4242`
  - Expiry: `12/34`
  - CVC: `123`
- Click "Confirm Booking"
- Receive booking confirmation with Duffel booking ID

## Testing with Duffel Test Mode

- All bookings are made in Duffel's test environment
- No real payments are processed
- Test flights are simulated
- Use test airport codes: LHR, JFK, CDG, DXB, SIN, etc.

## Deployment

### Heroku
```bash
heroku create
heroku config:set DUFFEL_ACCESS_TOKEN=your_token
git push heroku main
```

### Railway
```bash
railway init
railway variables set DUFFEL_ACCESS_TOKEN=your_token
railway up
```

### Environment Variables
Ensure these environment variables are set in your deployment:
- `PORT` (optional, defaults to 3000)
- `DUFFEL_ACCESS_TOKEN` (required)

## Code Quality

- Clean, documented JavaScript with comments
- Modular service layer for API integration
- Error handling on both frontend and backend
- Responsive CSS with mobile-first approach
- Accessible HTML markup

## Limitations & Future Enhancements

### Current Limitations
- Only supports adult passengers (no children/infants)
- Single cabin class (economy)
- Mock airport suggestions (not real-time from Duffel)
- Basic payment simulation (real integration would need PCI compliance)

### Possible Enhancements
1. **Real airport search** using Duffel's airports endpoint
2. **Multiple cabin classes** (economy, premium, business)
3. **Advanced filters** (stops, airlines, price range)
4. **User authentication** and booking history
5. **Email confirmation** after booking
6. **Seat selection** and additional services
7. **Multi‑currency support**
8. **PWA capabilities** for offline access

## Troubleshooting

### Common Issues

1. **"Failed to search flights" error**
   - Check Duffel token is valid and has test permissions
   - Verify airport codes are valid IATA codes
   - Ensure dates are in the future

2. **No flights found**
   - Try popular routes (LHR-JFK, CDG-SIN)
   - Ensure departure date is at least tomorrow

3. **CORS errors**
   - Backend CORS is configured for all origins
   - Ensure frontend is served from same origin as backend

4. **Server not starting**
   - Check if port 3000 is already in use
   - Verify Node.js version compatibility

### Debugging
- Check server console logs for API errors
- Use browser developer tools to inspect network requests
- Verify `.env` file is in the correct location

## License

MIT License - see LICENSE file (if provided)

## Acknowledgments

- [Duffel API](https://duffel.com) for flight booking infrastructure
- Font Awesome for icons
- Google Fonts for typography

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Duffel API documentation at [https://duffel.com/docs](https://duffel.com/docs)
3. Ensure you're using the latest version of the code

---

**Note**: This is a demonstration project for educational purposes. Not intended for production use without proper security, testing, and compliance measures.