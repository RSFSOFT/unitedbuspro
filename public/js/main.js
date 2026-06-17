// ==========================================
// CLIENT-SIDE LOGIC - UNITED BUS PRO
// ==========================================

document.addEventListener('DOMContentLoaded', function () {
    // 1. MOBILE MENU TOGGLE
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navMenu = document.getElementById('navMenu');

    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener('click', function () {
            navMenu.classList.toggle('active');
            if (navMenu.classList.contains('active')) {
                navMenu.style.display = 'flex';
                navMenu.style.flexDirection = 'column';
                navMenu.style.position = 'absolute';
                navMenu.style.top = '75px';
                navMenu.style.left = '0';
                navMenu.style.right = '0';
                navMenu.style.backgroundColor = 'rgba(17, 24, 39, 0.95)';
                navMenu.style.padding = '20px';
                navMenu.style.gap = '15px';
                navMenu.style.borderTop = '1px solid rgba(255, 255, 255, 0.1)';
            } else {
                navMenu.style.display = '';
            }
        });
    }

    // 1b. MOBILE DROPDOWN TOGGLER
    const dropdownItems = document.querySelectorAll('.nav-item-dropdown');
    dropdownItems.forEach(item => {
        const link = item.querySelector('.nav-link');
        if (link) {
            link.addEventListener('click', function(e) {
                if (window.innerWidth <= 1150) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    dropdownItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.classList.remove('open');
                        }
                    });
                    
                    item.classList.toggle('open');
                }
            });
        }
    });

    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 1150) {
            dropdownItems.forEach(item => {
                if (!item.contains(e.target)) {
                    item.classList.remove('open');
                }
            });
        }
    });

    // 2. MULTI-STEP INSTANT QUOTE CALCULATOR WITH INTERACTIVE MAP
    const form = document.getElementById('quoteCalculatorForm');
    if (form) {
        const step1 = document.getElementById('step1');
        const step2 = document.getElementById('step2');
        const step3 = document.getElementById('step3');
        const step4 = document.getElementById('step4');

        const btnNext1 = document.getElementById('btnNext1');
        const btnNext2 = document.getElementById('btnNext2');
        const btnNext3 = document.getElementById('btnNext3');
        const btnBack2 = document.getElementById('btnBack2');
        const btnBack3 = document.getElementById('btnBack3');
        const btnBack4 = document.getElementById('btnBack4');

        const progStep1 = document.getElementById('progStep1');
        const progStep2 = document.getElementById('progStep2');
        const progStep3 = document.getElementById('progStep3');
        const progStep4 = document.getElementById('progStep4');

        // Trip Type Selection
        const tripTypeCards = document.querySelectorAll('.trip-type-card');
        const tripTypeInput = document.getElementById('trip_type');
        const tripTypeHelpText = document.getElementById('tripTypeHelpText');
        const itineraryHelpText = document.getElementById('itineraryHelpText');

        const stopItemBlock = document.getElementById('stopItemBlock');
        const dropoffBadge = document.getElementById('dropoffBadge');
        const dropoffTitle = document.getElementById('dropoffTitle');
        const tripDetailsBlock = document.getElementById('tripDetailsBlock');

        const whatsThisStop = document.getElementById('whatsThisStop');

        const helpTexts = {
            'one-way': "A one way trip is pretty self-explanatory.",
            'round-trip': "A round trip includes a return or additional stop. The Stop address serves as your return departure origin or stopover location.",
            'large-event': "Planning a major gathering, convention, or corporate shuttle loop? Let us coordinate high-capacity routing for your attendees."
        };

        // Inject map styles and pulse animations
        const mapStyle = document.createElement('style');
        mapStyle.innerHTML = `
            @keyframes marker-pulse {
                0% { transform: scale(0.5); opacity: 0.8; }
                100% { transform: scale(2.2); opacity: 0; }
            }
            .custom-map-marker {
                background: none !important;
                border: none !important;
            }
            .leaflet-container {
                background: #111827 !important;
            }
            .leaflet-bar a {
                background-color: #1f2937 !important;
                color: #f3f4f6 !important;
                border-bottom: 1px solid rgba(255,255,255,0.1) !important;
            }
            .leaflet-bar a:hover {
                background-color: #374151 !important;
                color: #d97706 !important;
            }
            .leaflet-control-attribution {
                display: none !important;
            }
        `;
        document.head.appendChild(mapStyle);

        // Served City Coordinates Dictionary
        const CITY_COORDS = {
            "dallas": [32.7767, -96.7970],
            "fort worth": [32.7555, -97.3308],
            "arlington": [32.7357, -97.1081],
            "plano": [33.0198, -96.6989],
            "frisco": [33.1507, -96.8236],
            "new york city": [40.7128, -74.0060],
            "new york": [40.7128, -74.0060],
            "houston": [29.7604, -95.3698],
            "chicago": [41.8781, -87.6298],
            "washington dc": [38.9072, -77.0369],
            "washington": [38.9072, -77.0369],
            "los angeles": [34.0522, -118.2437],
            "albany": [42.6526, -73.7562],
            "albuquerque": [35.0844, -106.6504],
            "alexandria": [38.8048, -77.0469],
            "anaheim": [33.8366, -117.9143],
            "ann arbor": [42.2808, -83.7430],
            "atlanta": [33.7490, -84.3880],
            "augusta": [33.4735, -82.0105],
            "austin": [30.2672, -97.7431],
            "bakersfield": [35.3733, -119.0187],
            "baltimore": [39.2904, -76.6122],
            "baton rouge": [30.4515, -91.1871],
            "berkeley": [37.8715, -122.2730],
            "birmingham": [33.5186, -86.8104],
            "boston": [42.3601, -71.0589]
        };

        const STATE_COORDS = {
            "texas": [31.9686, -99.9018],
            "california": [36.7783, -119.4179],
            "florida": [27.6648, -81.5158],
            "maryland": [39.0458, -76.6413],
            "michigan": [44.3148, -85.6024],
            "new jersey": [40.0583, -74.4057],
            "new york": [43.2994, -74.2179],
            "north carolina": [35.7596, -79.0193],
            "pennsylvania": [41.2033, -77.1945],
            "connecticut": [41.6032, -73.0877]
        };

        // Initialize Map
        let map = null;
        let pickupMarker = null;
        let stopMarker = null;
        let dropoffMarker = null;
        let routeLine = null;

        const mapContainer = document.getElementById('calculatorMap');
        if (mapContainer && typeof L !== 'undefined') {
            let initialCenter = [32.7767, -96.7970]; // Default Dallas
            let initialZoom = 11;

            const initialPickup = document.getElementById('pickup_address')?.value || '';
            const cleanPickup = initialPickup.toLowerCase().trim();
            if (cleanPickup) {
                for (const [city, coords] of Object.entries(CITY_COORDS)) {
                    if (cleanPickup.includes(city)) {
                        initialCenter = coords;
                        initialZoom = 11;
                        break;
                    }
                }
                for (const [state, coords] of Object.entries(STATE_COORDS)) {
                    if (cleanPickup.includes(state)) {
                        initialCenter = coords;
                        initialZoom = 7;
                        break;
                    }
                }
            }

            map = L.map('calculatorMap', {
                zoomControl: true,
                scrollWheelZoom: false,
                attributionControl: false
            }).setView(initialCenter, initialZoom);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '',
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(map);
        }

        // Custom div-based markers
        const createMarkerIcon = (color, delay) => {
            return L.divIcon({
                className: 'custom-map-marker',
                html: `
                    <div style="position: relative; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">
                        <div style="position: absolute; width: 20px; height: 20px; background-color: ${color}; border-radius: 50%; opacity: 0.4; animation: marker-pulse 1.5s infinite ease-in-out; animation-delay: ${delay}s;"></div>
                        <div style="position: relative; width: 10px; height: 10px; background-color: ${color}; border: 2px solid #ffffff; border-radius: 50%; box-shadow: 0 0 8px rgba(0,0,0,0.5);"></div>
                    </div>
                `,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });
        };

        let pickupIcon = null;
        let stopIcon = null;
        let dropoffIcon = null;

        if (typeof L !== 'undefined') {
            pickupIcon = createMarkerIcon('#10B981', 0);
            stopIcon = createMarkerIcon('#3B82F6', 0.5);
            dropoffIcon = createMarkerIcon('#D97706', 1);
        }

        const geocodeCache = {};

        async function geocodeAddress(address) {
            if (!address) return null;
            const clean = address.toLowerCase().trim();
            if (geocodeCache[clean]) return geocodeCache[clean];

            // 1. Check local city coords first
            for (const [cityName, coords] of Object.entries(CITY_COORDS)) {
                if (clean === cityName || clean.startsWith(cityName + ',') || clean.endsWith(', ' + cityName) || (clean.includes(cityName) && clean.length < cityName.length + 10)) {
                    geocodeCache[clean] = coords;
                    return coords;
                }
            }

            // 2. Check local state coords
            for (const [stateName, coords] of Object.entries(STATE_COORDS)) {
                if (clean === stateName || clean.includes(stateName)) {
                    geocodeCache[clean] = coords;
                    return coords;
                }
            }

            // 3. Fallback to client-side Nominatim lookup for specific address strings
            const isSpecific = /\d/.test(clean) || 
                               clean.includes('airport') || 
                               clean.includes('hotel') || 
                               clean.includes('st') || 
                               clean.includes('ave') || 
                               clean.includes('road') || 
                               clean.includes('rd') || 
                               clean.includes('terminal') || 
                               clean.includes('plaza') || 
                               clean.includes('way') ||
                               clean.includes('center') ||
                               clean.includes('hall') ||
                               clean.includes('park') ||
                               clean.includes('drive') ||
                               clean.includes('dr');
            
            if (isSpecific) {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 2000);
                    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`;
                    const res = await fetch(url, {
                        signal: controller.signal,
                        headers: { 'Accept-Language': 'en' }
                    });
                    clearTimeout(timeoutId);
                    const data = await res.json();
                    if (data && data.length > 0) {
                        const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
                        geocodeCache[clean] = coords;
                        return coords;
                    }
                } catch (e) {
                    console.warn("Nominatim fetch failed, using dict fallback", e);
                }
            }

            // Generic dictionary contains check
            for (const [cityName, coords] of Object.entries(CITY_COORDS)) {
                if (clean.includes(cityName)) {
                    geocodeCache[clean] = coords;
                    return coords;
                }
            }

            return null;
        }

        let currentSequenceId = 0;

        async function updateMapAndOverview() {
            const seqId = ++currentSequenceId;

            // Form inputs
            const tripType = tripTypeInput?.value || 'one-way';
            const pickupVal = document.getElementById('pickup_address')?.value || '';
            const stopVal = document.getElementById('stop_address')?.value || '';
            const dropoffVal = document.getElementById('dropoff_address')?.value || '';
            const passengersVal = parseInt(document.getElementById('passengers')?.value) || 0;
            const serviceVal = document.getElementById('service_type')?.value || '';

            // 1. Textual Overview
            const typeLabels = {
                'one-way': 'One Way',
                'round-trip': 'Round Trip',
                'large-event': 'Large Event'
            };
            
            const elType = document.getElementById('overviewTripType');
            const elPickup = document.getElementById('overviewPickup');
            const elStop = document.getElementById('overviewStop');
            const elDropoff = document.getElementById('overviewDropoff');
            const elPassengers = document.getElementById('overviewPassengers');

            if (elType) elType.innerText = typeLabels[tripType] || 'One Way';
            if (elPickup) elPickup.innerText = pickupVal || '-';
            if (elDropoff) elDropoff.innerText = dropoffVal || '-';
            if (elPassengers) elPassengers.innerText = passengersVal ? `${passengersVal} Passengers` : '-';

            const blockStop = document.getElementById('overviewStopBlock');
            if (tripType === 'round-trip') {
                if (blockStop) blockStop.style.display = 'block';
                if (elStop) elStop.innerText = stopVal || '-';
            } else {
                if (blockStop) blockStop.style.display = 'none';
            }

            const elRecBlock = document.getElementById('overviewRecommendationBlock');
            const elRec = document.getElementById('overviewRecommendation');
            if (passengersVal > 0) {
                let recVehicle = '';
                let startingRate = 0;
                let minHrs = 4;

                if (passengersVal <= 14) {
                    recVehicle = 'Luxury Sprinter Van';
                    startingRate = 85;
                    minHrs = 3;
                } else if (passengersVal <= 28) {
                    if (serviceVal.includes('School')) {
                        recVehicle = 'Standard School Bus';
                        startingRate = 90;
                        minHrs = 4;
                    } else {
                        recVehicle = 'Standard Minibus';
                        startingRate = 110;
                        minHrs = 4;
                    }
                } else if (passengersVal <= 35) {
                    if (serviceVal.includes('School')) {
                        recVehicle = 'Standard School Bus';
                        startingRate = 90;
                        minHrs = 4;
                    } else {
                        recVehicle = 'Executive Minibus';
                        startingRate = 125;
                        minHrs = 4;
                    }
                } else {
                    if (serviceVal.includes('School')) {
                        recVehicle = 'Standard School Bus';
                        startingRate = 95;
                        minHrs = 4;
                    } else {
                        recVehicle = 'Full-Sized Charter Bus';
                        startingRate = 150;
                        minHrs = 5;
                    }
                }

                if (elRecBlock && elRec) {
                    elRecBlock.style.display = 'block';
                    elRec.innerHTML = `
                        <div style="font-weight: 700; color: var(--accent-gold-light);">${recVehicle}</div>
                        <div style="font-size: 0.75rem; color: var(--text-light); font-weight: normal; margin-top: 2px;">
                            Capacity: ${passengersVal} Pax | Rates: from $${startingRate}/hr (min ${minHrs}h)
                        </div>
                    `;
                }
            } else {
                if (elRecBlock) elRecBlock.style.display = 'none';
            }

            // 2. Map coordinates
            if (!map) return;

            const pickupCoords = await geocodeAddress(pickupVal);
            const stopCoords = (tripType === 'round-trip') ? await geocodeAddress(stopVal) : null;
            const dropoffCoords = await geocodeAddress(dropoffVal);

            if (seqId !== currentSequenceId) return; // Prevent race conditions

            const activeCoords = [];

            // Pickup Marker
            if (pickupCoords) {
                if (!pickupMarker) {
                    pickupMarker = L.marker(pickupCoords, { icon: pickupIcon }).addTo(map);
                } else {
                    pickupMarker.setLatLng(pickupCoords);
                }
                pickupMarker.bindPopup(`<b>Pickup Location</b><br>${pickupVal}`).openPopup();
                activeCoords.push(pickupCoords);
            } else {
                if (pickupMarker) {
                    map.removeLayer(pickupMarker);
                    pickupMarker = null;
                }
            }

            // Stop Marker
            if (tripType === 'round-trip' && stopCoords) {
                if (!stopMarker) {
                    stopMarker = L.marker(stopCoords, { icon: stopIcon }).addTo(map);
                } else {
                    stopMarker.setLatLng(stopCoords);
                }
                stopMarker.bindPopup(`<b>Stopover Location</b><br>${stopVal}`);
                activeCoords.push(stopCoords);
            } else {
                if (stopMarker) {
                    map.removeLayer(stopMarker);
                    stopMarker = null;
                }
            }

            // Dropoff Marker
            if (dropoffCoords) {
                let adjustedCoords = [dropoffCoords[0], dropoffCoords[1]];
                if (pickupCoords && Math.abs(pickupCoords[0] - dropoffCoords[0]) < 0.001 && Math.abs(pickupCoords[1] - dropoffCoords[1]) < 0.001) {
                    adjustedCoords[0] += 0.005;
                    adjustedCoords[1] += 0.005;
                }

                if (!dropoffMarker) {
                    dropoffMarker = L.marker(adjustedCoords, { icon: dropoffIcon }).addTo(map);
                } else {
                    dropoffMarker.setLatLng(adjustedCoords);
                }
                dropoffMarker.bindPopup(`<b>Dropoff Location</b><br>${dropoffVal}`);
                activeCoords.push(adjustedCoords);
            } else {
                if (dropoffMarker) {
                    map.removeLayer(dropoffMarker);
                    dropoffMarker = null;
                }
            }

            // Draw Route Polyline
            if (activeCoords.length >= 2) {
                if (!routeLine) {
                    routeLine = L.polyline(activeCoords, {
                        color: '#D97706',
                        weight: 4,
                        opacity: 0.8,
                        dashArray: '5, 10'
                    }).addTo(map);
                } else {
                    routeLine.setLatLngs(activeCoords);
                }
                map.fitBounds(L.latLngBounds(activeCoords), { padding: [30, 30] });
            } else {
                if (routeLine) {
                    map.removeLayer(routeLine);
                    routeLine = null;
                }
                if (activeCoords.length === 1) {
                    map.setView(activeCoords[0], 12);
                }
            }
        }

        let mapDebounceTimer;
        const triggerUpdate = (immediate = false) => {
            if (immediate) {
                updateMapAndOverview();
            } else {
                clearTimeout(mapDebounceTimer);
                mapDebounceTimer = setTimeout(updateMapAndOverview, 500);
            }
        };

        // Event listeners
        const pickupInput = document.getElementById('pickup_address');
        const stopInput = document.getElementById('stop_address');
        const dropoffInput = document.getElementById('dropoff_address');
        const passengersInput = document.getElementById('passengers');
        const serviceInput = document.getElementById('service_type');

        [pickupInput, stopInput, dropoffInput].forEach(input => {
            if (input) {
                input.addEventListener('input', () => triggerUpdate(false));
                input.addEventListener('change', () => triggerUpdate(true));
            }
        });

        [passengersInput, serviceInput].forEach(input => {
            if (input) {
                input.addEventListener('input', () => triggerUpdate(true));
                input.addEventListener('change', () => triggerUpdate(true));
            }
        });

        // Handle trip type card click
        tripTypeCards.forEach(card => {
            card.addEventListener('click', function () {
                // Remove active class from all cards
                tripTypeCards.forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked card
                this.classList.add('active');
                
                // Set hidden input value
                const type = this.getAttribute('data-type');
                tripTypeInput.value = type;

                // Update Help sidebar text
                if (tripTypeHelpText) tripTypeHelpText.innerText = helpTexts[type];
                if (itineraryHelpText) itineraryHelpText.innerText = helpTexts[type];

                // Dynamically update Step 2 layouts
                if (type === 'round-trip') {
                    stopItemBlock.style.display = 'block';
                    document.getElementById('stop_address').required = true;
                    document.getElementById('stop_date').required = true;
                    document.getElementById('stop_time').required = true;

                    dropoffBadge.innerText = '3';
                    dropoffTitle.innerText = 'Dropoff';
                } else {
                    stopItemBlock.style.display = 'none';
                    document.getElementById('stop_address').required = false;
                    document.getElementById('stop_date').required = false;
                    document.getElementById('stop_time').required = false;

                    dropoffBadge.innerText = '2';
                    dropoffTitle.innerText = 'Dropoff';
                }

                if (type === 'large-event') {
                    tripDetailsBlock.style.display = 'block';
                    document.getElementById('trip_name').required = true;
                    document.getElementById('event_type').required = true;
                } else {
                    tripDetailsBlock.style.display = 'none';
                    document.getElementById('trip_name').required = false;
                    document.getElementById('event_type').required = false;
                }

                triggerUpdate(true);
            });
        });

        // "What's this?" link click handler
        if (whatsThisStop) {
            whatsThisStop.addEventListener('click', function (e) {
                e.stopPropagation();
                alert("What's this?\nThe Stop address serves as your return departure origin or secondary destination on round trips. Fill in the return pickup date and time here.");
            });
        }

        // Step 1 -> Step 2
        btnNext1.addEventListener('click', function () {
            const currentType = tripTypeInput.value;
            if (!currentType) {
                alert('Please select a trip type.');
                return;
            }

            step1.classList.remove('active');
            step2.classList.add('active');
            progStep2.classList.add('active');
            progStep1.classList.add('completed');
        });

        // Step 2 -> Step 1
        btnBack2.addEventListener('click', function () {
            step2.classList.remove('active');
            step1.classList.add('active');
            progStep2.classList.remove('active');
            progStep1.classList.remove('completed');
        });

        // Step 2 -> Step 3
        btnNext2.addEventListener('click', function () {
            const currentType = tripTypeInput.value;
            
            // Validate pickup fields
            const pickupAddr = document.getElementById('pickup_address').value.trim();
            const pickupDate = document.getElementById('pickup_date').value;
            const pickupTime = document.getElementById('pickup_time').value;

            if (!pickupAddr || !pickupDate || !pickupTime) {
                alert('Please fill in all Pickup details.');
                return;
            }

            // Validate stop details if round trip
            if (currentType === 'round-trip') {
                const stopAddr = document.getElementById('stop_address').value.trim();
                const stopDate = document.getElementById('stop_date').value;
                const stopTime = document.getElementById('stop_time').value;

                if (!stopAddr || !stopDate || !stopTime) {
                    alert('Please fill in all Stop/Return details for your Round Trip.');
                    return;
                }
            }

            // Validate dropoff
            const dropoffAddr = document.getElementById('dropoff_address').value.trim();
            if (!dropoffAddr) {
                alert('Please fill in the Dropoff location address.');
                return;
            }

            // Validate Trip Details if Large Event
            if (currentType === 'large-event') {
                const tripName = document.getElementById('trip_name').value.trim();
                const eventType = document.getElementById('event_type').value;

                if (!tripName || !eventType) {
                    alert('Please fill in the Trip Details (Name and Event Type).');
                    return;
                }
            }

            step2.classList.remove('active');
            step3.classList.add('active');
            progStep3.classList.add('active');
            progStep2.classList.add('completed');
        });

        // Step 3 -> Step 2
        btnBack3.addEventListener('click', function () {
            step3.classList.remove('active');
            step2.classList.add('active');
            progStep3.classList.remove('active');
            progStep2.classList.remove('completed');
        });

        // Step 3 -> Step 4 (Calculate Estimate)
        btnNext3.addEventListener('click', function () {
            const passengers = parseInt(document.getElementById('passengers').value);
            const service = document.getElementById('service_type').value;
            const name = document.getElementById('name').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const email = document.getElementById('email').value.trim();

            if (!passengers || !service || !name || !phone || !email) {
                alert('Please complete all contact and coordinator details.');
                return;
            }

            // Estimate calculation & recommendation logic
            let recommendedVehicle = '';
            let baseRate = 0;
            let minHours = 4;

            if (passengers <= 14) {
                recommendedVehicle = 'Luxury Sprinter Van (14 Passengers)';
                baseRate = 85; 
                minHours = 3;
            } else if (passengers <= 28) {
                if (service.includes('School')) {
                    recommendedVehicle = 'Standard School Bus (47 Passengers)';
                    baseRate = 90;
                    minHours = 4;
                } else {
                    recommendedVehicle = 'Standard Minibus (28 Passengers)';
                    baseRate = 110;
                    minHours = 4;
                }
            } else if (passengers <= 35) {
                if (service.includes('School')) {
                    recommendedVehicle = 'Standard School Bus (47 Passengers)';
                    baseRate = 90;
                    minHours = 4;
                } else {
                    recommendedVehicle = 'Executive Minibus (35 Passengers)';
                    baseRate = 125;
                    minHours = 4;
                }
            } else {
                if (service.includes('School')) {
                    recommendedVehicle = 'Standard School Bus (47 Passengers)';
                    baseRate = 95;
                    minHours = 4;
                } else {
                    recommendedVehicle = 'Full-Sized Charter Bus (56 Passengers)';
                    baseRate = 150;
                    minHours = 5;
                }
            }

            let estPrice = baseRate * minHours;
            
            // Adjust price based on trip type
            const type = tripTypeInput.value;
            if (type === 'round-trip') {
                estPrice = estPrice * 1.6; // 1.6x multiplier for round-trip return leg estimation
            } else if (type === 'large-event') {
                estPrice = estPrice * 2.0; // 2.0x multiplier for large event loops/conventions
            }

            // Populate quote details in Step 4
            document.getElementById('recommendedVehicle').innerHTML = `<strong>Recommended Vehicle:</strong> ${recommendedVehicle}`;
            document.getElementById('quoteEstPrice').innerText = `$${estPrice.toFixed(2)}`;

            step3.classList.remove('active');
            step4.classList.add('active');
            progStep4.classList.add('active');
            progStep3.classList.add('completed');
        });

        // Step 4 -> Step 3
        btnBack4.addEventListener('click', function () {
            step4.classList.remove('active');
            step3.classList.add('active');
            progStep4.classList.remove('active');
            progStep3.classList.remove('completed');
        });

        // Form Submit Handler via AJAX
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const type = tripTypeInput.value;
            const pickupAddress = document.getElementById('pickup_address').value.trim();
            const pickupDate = document.getElementById('pickup_date').value;
            const pickupTime = document.getElementById('pickup_time').value;
            const dropoffAddress = document.getElementById('dropoff_address').value.trim();
            const passengers = document.getElementById('passengers').value;

            // Construct readable pickup string
            const pickupLocCombined = `${pickupAddress} on ${pickupDate} at ${pickupTime}`;

            // Create customized message content incorporating itinerary
            let customNotes = document.getElementById('message') ? document.getElementById('message').value.trim() : '';
            let itineraryDetails = `[Trip Type: ${type.toUpperCase()}]\n`;
            itineraryDetails += `- Pickup: ${pickupAddress} on ${pickupDate} at ${pickupTime}\n`;
            
            if (type === 'round-trip') {
                const stopAddr = document.getElementById('stop_address').value.trim();
                const stopDate = document.getElementById('stop_date').value;
                const stopTime = document.getElementById('stop_time').value;
                itineraryDetails += `- Stop/Return: ${stopAddr} on ${stopDate} at ${stopTime}\n`;
            }

            itineraryDetails += `- Dropoff: ${dropoffAddress}\n`;

            if (type === 'large-event') {
                const tripName = document.getElementById('trip_name').value.trim();
                const eventType = document.getElementById('event_type').value;
                const reqAccessible = document.getElementById('req_accessible').checked ? 'Yes' : 'No';
                const reqADA = document.getElementById('req_ada').checked ? 'Yes' : 'No';

                itineraryDetails += `[Trip Details]\n`;
                itineraryDetails += `- Event Name: ${tripName}\n`;
                itineraryDetails += `- Event Type: ${eventType}\n`;
                itineraryDetails += `- Accessible Vehicle Needed: ${reqAccessible}\n`;
                itineraryDetails += `- ADA Standards Compliant: ${reqADA}\n`;
            }

            if (customNotes) {
                itineraryDetails += `\n[Special Instructions]\n${customNotes}`;
            }

            const payload = {
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value,
                service_type: document.getElementById('service_type').value,
                pickup_loc: pickupLocCombined,
                dropoff_loc: dropoffAddress,
                trip_date: pickupDate,
                passengers: passengers,
                message: itineraryDetails
            };

            const btnSubmit = document.getElementById('btnSubmit');
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = 'Sending... <i class="fa fa-spinner fa-spin"></i>';

            fetch('/api/book', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    window.location.href = '/thank-you';
                } else {
                    alert('Error: ' + data.message);
                    btnSubmit.disabled = false;
                    btnSubmit.innerHTML = 'Reserve Booking <i class="fa fa-check-circle"></i>';
                }
            })
            .catch(err => {
                console.error('AJAX Error:', err);
                alert('Failed to connect to reservation server. Please try again.');
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = 'Reserve Booking <i class="fa fa-check-circle"></i>';
            });
        });

        // Initialize state-aware map/overview values immediately on load
        triggerUpdate(true);
    }

    // 3. DEDICATED RESERVATION FORM AJAX (If on reservation page)
    const reservationForm = document.getElementById('reservationBookingForm');
    if (reservationForm) {
        const formStatusBox = document.getElementById('formStatusBox');
        
        reservationForm.addEventListener('submit', function (e) {
            e.preventDefault();
            
            const payload = {
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value,
                service_type: document.getElementById('service_type').value,
                pickup_loc: document.getElementById('pickup_loc').value,
                dropoff_loc: document.getElementById('dropoff_loc').value,
                trip_date: document.getElementById('trip_date').value,
                passengers: document.getElementById('passengers').value,
                message: document.getElementById('message').value
            };

            const submitBtn = reservationForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Sending... <i class="fa fa-spinner fa-spin"></i>';
            
            formStatusBox.style.display = 'none';

            fetch('/api/book', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    window.location.href = '/thank-you';
                } else {
                    formStatusBox.style.backgroundColor = '#fde8e8';
                    formStatusBox.style.color = '#9b1c1c';
                    formStatusBox.innerText = 'Error: ' + data.message;
                    formStatusBox.style.display = 'block';
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Submit Reservation Request <i class="fa fa-paper-plane" style="margin-left: 5px;"></i>';
                }
            })
            .catch(err => {
                console.error('AJAX Error:', err);
                formStatusBox.style.backgroundColor = '#fde8e8';
                formStatusBox.style.color = '#9b1c1c';
                formStatusBox.innerText = 'Failed to connect to reservation server. Please try again.';
                formStatusBox.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Submit Reservation Request <i class="fa fa-paper-plane" style="margin-left: 5px;"></i>';
            });
        });

        // Autofill service from query parameter
        const urlParams = new URLSearchParams(window.location.search);
        const serviceParam = urlParams.get('service');
        const vehicleParam = urlParams.get('vehicle');

        if (serviceParam) {
            const selectEl = document.getElementById('service_type');
            for (let i = 0; i < selectEl.options.length; i++) {
                if (selectEl.options[i].value.toLowerCase().includes(serviceParam.replace(/-/g, ' '))) {
                    selectEl.selectedIndex = i;
                    break;
                }
            }
        } else if (vehicleParam) {
            const selectEl = document.getElementById('service_type');
            if (vehicleParam.includes('coach') || vehicleParam.includes('charter')) {
                selectEl.value = 'Charter Bus Rental';
            } else if (vehicleParam.includes('minibus')) {
                selectEl.value = 'Minibus Hires';
            } else if (vehicleParam.includes('sprinter')) {
                selectEl.value = 'Corporate Shuttle Service';
            } else if (vehicleParam.includes('school')) {
                selectEl.value = 'School Field Trips';
            }
        }
    }
});
