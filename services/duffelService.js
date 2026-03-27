const dotenv = require('dotenv');
dotenv.config();



const { Duffel } = require('@duffel/api');

console.log('Initializing DuffelService with token:', process.env.DUFFEL_ACCESS_TOKEN ? '****' : 'No token found');
class DuffelService {
  constructor() {
    this.client = new Duffel({
      token: process.env.DUFFEL_ACCESS_TOKEN,
    });
  }

  /**
   * Search for flights
   * @param {Object} params - Search parameters
   * @param {string} params.origin - Origin airport IATA code
   * @param {string} params.destination - Destination airport IATA code
   * @param {string} params.departureDate - Departure date (YYYY-MM-DD)
   * @param {string} params.returnDate - Return date (optional)
   * @param {number} params.passengers - Number of adult passengers
   * @returns {Promise<Object>} - Offer request and offers
   */
  async searchFlights({ origin, destination, departureDate, returnDate, passengers }) {
    try {
      const slices = [
        {
          origin,
          destination,
          departure_date: departureDate,
        },
      ];
      if (returnDate) {
        slices.push({
          origin: destination,
          destination: origin,
          departure_date: returnDate,
        });
      }

      const offerRequest = await this.client.offerRequests.create({
        slices,
        passengers: Array(passengers).fill({ type: 'adult' }),
        cabin_class: 'economy',
      });

      const offers = await this.client.offers.list({
        offer_request_id: offerRequest.data.id,
        sort: 'total_amount',
      });

      return {
        requestId: offerRequest.data.id,
        offers: offers.data,
      };
    } catch (error) {
      console.error('Duffel search error:', error);
      throw new Error(`Flight search failed: ${error.message}`);
    }
  }

  /**
   * Get offer details by ID
   * @param {string} offerId - Duffel offer ID
   * @returns {Promise<Object>} - Offer details
   */
  async getOffer(offerId) {
    try {
      const offer = await this.client.offers.get(offerId);
      return offer.data;
    } catch (error) {
      console.error('Duffel get offer error:', error);
      throw new Error(`Failed to fetch offer: ${error.message}`);
    }
  }

  /**
   * Create a booking (order)
   * @param {string} offerId - Selected offer ID
   * @param {Array} passengers - Passenger details
   * @param {Object} payment - Payment details (optional for test)
   * @returns {Promise<Object>} - Created order
   */
  async createBooking(offerId, passengers, payment = null) {
    try {
      // Fetch the offer to get passenger IDs
      const offer = await this.client.offers.get(offerId);
      const offerPassengers = offer.data.passengers;
      
      if (offerPassengers.length !== passengers.length) {
        throw new Error(`Passenger count mismatch: offer has ${offerPassengers.length} passengers, but ${passengers.length} provided`);
      }

      // Merge passenger details with IDs from the offer
      const mergedPassengers = passengers.map((passenger, index) => {
        const offerPassenger = offerPassengers[index];
        
        // Validate required fields
        if (!passenger.given_name || passenger.given_name.trim() === '') {
          throw new Error(`Passenger ${index + 1}: given_name is required and cannot be empty`);
        }
        if (!passenger.family_name || passenger.family_name.trim() === '') {
          throw new Error(`Passenger ${index + 1}: family_name is required and cannot be empty`);
        }
        if (!passenger.phone_number || passenger.phone_number.trim() === '') {
          throw new Error(`Passenger ${index + 1}: phone_number is required for booking`);
        }

        // Determine title based on gender if not provided
        let title = passenger.title;
        if (!title) {
          if (passenger.gender === 'f') {
            title = 'mrs';
          } else {
            title = 'mr';
          }
        }

        return {
          id: offerPassenger.id,
          given_name: passenger.given_name.trim(),
          family_name: passenger.family_name.trim(),
          email: passenger.email || '',
          phone_number: passenger.phone_number.trim(),
          born_on: passenger.born_on || '',
          gender: passenger.gender || 'm',
          title,
          type: passenger.type || 'adult'
        };
      });

      const order = await this.client.orders.create({
        selected_offers: [offerId],
        passengers: mergedPassengers,
        payments: payment ? [payment] : [],
      });
      
      return order.data;
    } catch (error) {
      console.error('Duffel booking error:', error);
      throw new Error(`Booking failed: ${error.errors?.[0]?.message || error.message}`);
    }
  }

  /**
   * Get airport suggestions (mock - Duffel doesn't have direct airport search)
   * For simplicity, we'll return a static list
   */
  async getAirportSuggestions(query) {
    // In a real app, you'd call Duffel's airports endpoint or use a separate service
    const airports = [
      { iata_code: 'LHR', name: 'London Heathrow', city: 'London' },
      { iata_code: 'JFK', name: 'John F Kennedy', city: 'New York' },
      { iata_code: 'CDG', name: 'Charles de Gaulle', city: 'Paris' },
      { iata_code: 'DXB', name: 'Dubai International', city: 'Dubai' },
      { iata_code: 'SIN', name: 'Changi', city: 'Singapore' },
      { iata_code: 'BOM', name: 'Mumbai', city: 'Mumbai' },
      { iata_code: 'DEL', name: 'Indira Gandhi', city: 'Delhi' },
      { iata_code: 'LAX', name: 'Los Angeles', city: 'Los Angeles' },
    ];
    return airports.filter(airport =>
      airport.iata_code.toLowerCase().includes(query.toLowerCase()) ||
      airport.city.toLowerCase().includes(query.toLowerCase())
    );
  }
}

module.exports = new DuffelService();