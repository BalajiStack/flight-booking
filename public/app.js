// Flight Booking Frontend Application
document.addEventListener('DOMContentLoaded', function() {
    // State
    let state = {
        currentStep: 1,
        searchParams: {},
        offers: [],
        selectedOffer: null,
        passengers: [],
        bookingResult: null
    };

    let given_name_array = ['John', 'Jane', 'Alex', 'Emily', 'Michael', 'Sarah', 'David', 'Laura', 'Chris', 'Anna'];
    let family_name_array = ['Smith', 'Johnson', 'Brown', 'Taylor', 'Miller', 'Wilson', 'Moore', 'Anderson', 'Thomas', 'Jackson'];

    // DOM Elements
    const stepContents = document.querySelectorAll('.step-content');
    const steps = document.querySelectorAll('.step');
    const searchForm = document.getElementById('search-form');
    const originInput = document.getElementById('origin');
    const destinationInput = document.getElementById('destination');
    const departureDateInput = document.getElementById('departure-date');
    const returnDateInput = document.getElementById('return-date');
    const passengersSelect = document.getElementById('passengers');
    const offersContainer = document.getElementById('offers-container');
    const backToSearchBtn = document.getElementById('back-to-search');
    const backToOffersBtn = document.getElementById('back-to-offers');
    const proceedToBookingBtn = document.getElementById('proceed-to-booking');
    const passengerForm = document.getElementById('passenger-form');
    const paymentForm = document.getElementById('payment-form');
    const confirmBookingBtn = document.getElementById('confirm-booking');
    const newSearchBtn = document.getElementById('new-search');
    const searchSummary = document.getElementById('search-summary');

    // Set default dates
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    departureDateInput.valueAsDate = tomorrow;
    departureDateInput.min = today.toISOString().split('T')[0];
    returnDateInput.valueAsDate = nextWeek;
    returnDateInput.min = tomorrow.toISOString().split('T')[0];

    // Event Listeners
    searchForm.addEventListener('submit', handleSearch);
    backToSearchBtn.addEventListener('click', () => showStep(1));
    backToOffersBtn.addEventListener('click', () => showStep(2));
    proceedToBookingBtn.addEventListener('click', handleProceedToBooking);
    paymentForm.addEventListener('submit', handleBooking);
    newSearchBtn.addEventListener('click', resetToSearch);

    // Airport suggestions
    setupAutocomplete(originInput, 'origin-suggestions');
    setupAutocomplete(destinationInput, 'destination-suggestions');

    // Functions
    function showStep(stepNumber) {
        // Update step indicator
        steps.forEach(step => {
            if (parseInt(step.dataset.step) === stepNumber) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        // Show corresponding content
        stepContents.forEach(content => {
            if (content.id === `step-${getStepName(stepNumber)}`) {
                content.classList.add('active');
            } else {
                content.classList.remove('active');
            }
        });

        state.currentStep = stepNumber;

        // Update UI based on step
        if (stepNumber === 2) {
            updateSearchSummary();
            renderOffers();
        } else if (stepNumber === 3) {
            renderPassengerForm();
        } else if (stepNumber === 4) {
            renderBookingSummary();
        }
    }

    function getStepName(stepNumber) {
        switch(stepNumber) {
            case 1: return 'search';
            case 2: return 'offers';
            case 3: return 'passengers';
            case 4: return 'booking';
            default: return 'search';
        }
    }

    function setupAutocomplete(inputElement, suggestionsId) {
        let timeoutId;
        
        inputElement.addEventListener('input', function() {
            clearTimeout(timeoutId);
            const query = this.value.trim();
            if (query.length < 2) {
                hideSuggestions(suggestionsId);
                return;
            }

            timeoutId = setTimeout(async () => {
                try {
                    const response = await fetch(`/api/airports?q=${encodeURIComponent(query)}`);
                    const airports = await response.json();
                    showSuggestions(suggestionsId, airports, inputElement);
                } catch (error) {
                    console.error('Failed to fetch airports:', error);
                }
            }, 300);
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest(`#${suggestionsId}`) && event.target !== inputElement) {
                hideSuggestions(suggestionsId);
            }
        });
    }

    function showSuggestions(containerId, airports, inputElement) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';
        if (airports.length === 0) {
            container.style.display = 'none';
            return;
        }

        airports.forEach(airport => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.textContent = `${airport.iata_code} - ${airport.name}, ${airport.city}`;
            div.addEventListener('click', () => {
                inputElement.value = airport.iata_code;
                container.style.display = 'none';
            });
            container.appendChild(div);
        });

        container.style.display = 'block';
    }

    function hideSuggestions(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.style.display = 'none';
        }
    }

    async function handleSearch(e) {
        e.preventDefault();
        
        // Show loading
        document.getElementById('search-loading').style.display = 'block';
        
        // Collect search parameters
        const searchParams = {
            origin: originInput.value.toUpperCase(),
            destination: destinationInput.value.toUpperCase(),
            departureDate: departureDateInput.value,
            returnDate: returnDateInput.value || null,
            passengers: parseInt(passengersSelect.value)
        };

        state.searchParams = searchParams;

        try {
            const response = await fetch('/api/flights/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(searchParams)
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Search failed');
            }

            state.offers = data.offers || [];
            showStep(2);
        } catch (error) {
            alert(`Search error: ${error.message}`);
            console.error(error);
        } finally {
            document.getElementById('search-loading').style.display = 'none';
        }
    }

    function updateSearchSummary() {
        const params = state.searchParams;
        if (!params.origin) return;

        const summary = `
            ${params.origin} → ${params.destination} | 
            ${formatDate(params.departureDate)}${params.returnDate ? ` - ${formatDate(params.returnDate)}` : ''} | 
            ${params.passengers} passenger${params.passengers > 1 ? 's' : ''}
        `;
        searchSummary.innerHTML = summary;
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    function renderOffers() {
        if (!state.offers.length) {
            offersContainer.innerHTML = `
                <div class="no-offers">
                    <h3>No flights found</h3>
                    <p>Try adjusting your search criteria.</p>
                </div>
            `;
            return;
        }

        offersContainer.innerHTML = '';
        state.offers.forEach(offer => {
            const card = document.createElement('div');
            card.className = 'offer-card';
            if (state.selectedOffer && state.selectedOffer.id === offer.id) {
                card.classList.add('selected');
            }

            // Extract flight details
            const slice = offer.slices[0];
            const segment = slice.segments[0];
            const airline = segment.marketing_carrier?.name || 'Unknown Airline';
            const airlineCode = segment.marketing_carrier?.iata_code || 'XX';
            const origin = segment.origin;
            const destination = segment.destination;
            const departureTime = new Date(segment.departing_at);
            const arrivalTime = new Date(segment.arriving_at);
            const duration = segment.duration;
            const price = offer.total_amount;
            const currency = offer.total_currency;

            card.innerHTML = `
                <div class="offer-airline">
                    <div class="airline-logo">${airlineCode}</div>
                    <div class="airline-name">${airline}</div>
                </div>
                <div class="offer-details">
                    <div class="route">
                        <div class="origin">
                            <div class="city">${origin.city_name}</div>
                            <div class="code">${origin.iata_code}</div>
                        </div>
                        <div class="duration">${formatDuration(duration)}</div>
                        <div class="destination">
                            <div class="city">${destination.city_name}</div>
                            <div class="code">${destination.iata_code}</div>
                        </div>
                    </div>
                    <div class="flight-times">
                        <div>${formatTime(departureTime)}</div>
                        <div>${formatTime(arrivalTime)}</div>
                    </div>
                </div>
                <div class="offer-price">
                    <div class="price">${price} <span class="currency">${currency}</span></div>
                </div>
                <button class="btn-primary select-offer-btn" data-offer-id="${offer.id}">
                    Select This Flight
                </button>
            `;

            const selectBtn = card.querySelector('.select-offer-btn');
            selectBtn.addEventListener('click', () => {
                state.selectedOffer = offer;
                renderOffers();
                showStep(3);
            });

            offersContainer.appendChild(card);
        });
    }

    function formatDuration(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    }

    function formatTime(date) {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }

    function renderPassengerForm() {
        const passengerCount = state.searchParams.passengers;
        passengerForm.innerHTML = '';

        for (let i = 0; i < passengerCount; i++) {
            const passengerCard = document.createElement('div');
            passengerCard.className = 'passenger-card';
            passengerCard.innerHTML = `
                <div class="passenger-title">
                    <i class="fas fa-user"></i>
                    <h3>Passenger ${i + 1}</h3>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="passenger-${i}-given">First Name</label>
                        <input type="text" id="passenger-${i}-given" required>
                    </div>
                    <div class="form-group">
                        <label for="passenger-${i}-family">Last Name</label>
                        <input type="text" id="passenger-${i}-family" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="passenger-${i}-email">Email</label>
                        <input type="email" id="passenger-${i}-email" required>
                    </div>
                    <div class="form-group">
                        <label for="passenger-${i}-phone">Phone</label>
                        <input type="tel" id="passenger-${i}-phone" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="passenger-${i}-dob">Date of Birth</label>
                        <input type="date" id="passenger-${i}-dob" required>
                    </div>
                    <div class="form-group">
                        <label for="passenger-${i}-gender">Gender</label>
                        <select id="passenger-${i}-gender" required>
                            <option value="m">Male</option>
                            <option value="f">Female</option>
                            <option value="x">Other</option>
                        </select>
                    </div>
                </div>
            `;
            passengerForm.appendChild(passengerCard);
        }

        // Set default values for test
        for (let i = 0; i < passengerCount; i++) {
            document.getElementById(`passenger-${i}-given`).value = `${given_name_array[i]}`;
            document.getElementById(`passenger-${i}-family`).value = `${family_name_array[i]}`;
            document.getElementById(`passenger-${i}-email`).value = `${given_name_array[i]}@gmail.com`;
            document.getElementById(`passenger-${i}-phone`).value = `+44123456789${i}`; // Valid UK phone number in E.164 format
            document.getElementById(`passenger-${i}-dob`).value = `1990-01-0${i+1}`;
        }
    }

    function handleProceedToBooking() {
        // Validate passenger form
        const passengerCount = state.searchParams.passengers;
        const passengers = [];

        for (let i = 0; i < passengerCount; i++) {
            const given = document.getElementById(`passenger-${i}-given`).value;
            const family = document.getElementById(`passenger-${i}-family`).value;
            const email = document.getElementById(`passenger-${i}-email`).value;
            const phone = document.getElementById(`passenger-${i}-phone`).value;
            const dob = document.getElementById(`passenger-${i}-dob`).value;
            const gender = document.getElementById(`passenger-${i}-gender`).value;

            if (!given || !family || !email || !phone || !dob) {
                alert(`Please fill all fields for Passenger ${i + 1}`);
                return;
            }

            // Determine title based on gender
            let title = 'mr';
            if (gender === 'f') {
                title = 'mrs';
            } else if (gender === 'x') {
                title = 'mx';
            }

            passengers.push({
                given_name: given.trim(),
                family_name: family.trim(),
                email: email.trim(),
                phone_number: phone.trim(),
                born_on: dob,
                gender,
                title,
                type: 'adult'
            });
        }

        state.passengers = passengers;
        showStep(4);
    }

    function renderBookingSummary() {
        const bookingDetails = document.getElementById('booking-details');
        if (!state.selectedOffer) return;

        const slice = state.selectedOffer.slices[0];
        const segment = slice.segments[0];
        const price = state.selectedOffer.total_amount;
        const currency = state.selectedOffer.total_currency;

        bookingDetails.innerHTML = `
            <div class="booking-details-card">
                <h3><i class="fas fa-plane"></i> Flight Details</h3>
                <p><strong>Route:</strong> ${segment.origin.iata_code} → ${segment.destination.iata_code}</p>
                <p><strong>Date:</strong> ${formatDate(segment.departing_at)}</p>
                <p><strong>Time:</strong> ${formatTime(new Date(segment.departing_at))} - ${formatTime(new Date(segment.arriving_at))}</p>
                <p><strong>Duration:</strong> ${formatDuration(segment.duration)}</p>
                <p><strong>Airline:</strong> ${segment.marketing_carrier.name}</p>
                <p><strong>Passengers:</strong> ${state.passengers.length}</p>
                <hr>
                <h3><i class="fas fa-receipt"></i> Price Summary</h3>
                <p><strong>Total:</strong> ${price} ${currency}</p>
            </div>
        `;
    }

    async function handleBooking(e) {
        e.preventDefault();
        
        // Validate payment form
        const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
        const expiry = document.getElementById('expiry').value;
        const cvc = document.getElementById('cvc').value;

        if (!cardNumber || !expiry || !cvc) {
            alert('Please fill all payment fields');
            return;
        }

        // Show loading
        document.getElementById('booking-loading').style.display = 'block';

        // Prepare payment object (simplified for test)
        const payment = {
            type: 'balance',
            amount: state.selectedOffer.total_amount,
            currency: state.selectedOffer.total_currency
        };

        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    offerId: state.selectedOffer.id,
                    passengers: state.passengers,
                    payment
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Booking failed');
            }

            state.bookingResult = data;
            showBookingSuccess(data);
        } catch (error) {
            alert(`Booking error: ${error.message}`);
            console.error(error);
        } finally {
            document.getElementById('booking-loading').style.display = 'none';
        }
    }

    function showBookingSuccess(bookingData) {
        document.getElementById('booking-success').style.display = 'block';
        document.getElementById('booking-id').textContent = bookingData.bookingId;
        paymentForm.style.display = 'none';
    }

    function resetToSearch() {
        // Reset state
        state = {
            currentStep: 1,
            searchParams: {},
            offers: [],
            selectedOffer: null,
            passengers: [],
            bookingResult: null
        };

        // Reset form
        originInput.value = '';
        destinationInput.value = '';
        departureDateInput.valueAsDate = tomorrow;
        returnDateInput.valueAsDate = nextWeek;
        passengersSelect.value = '2';

        // Reset UI
        document.getElementById('booking-success').style.display = 'none';
        paymentForm.style.display = 'block';
        paymentForm.reset();

        showStep(1);
    }

    // Initialize
    showStep(1);
});