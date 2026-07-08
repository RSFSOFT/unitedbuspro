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

    // 1c. DESKTOP DROPDOWN HOVER & CLICK CONTROLLER (with closing buffer to prevent jumpiness)
    const desktopDropdowns = document.querySelectorAll('.nav-item-dropdown');
    desktopDropdowns.forEach(item => {
        let closeTimeout = null;
        
        const openMenu = () => {
            if (closeTimeout) clearTimeout(closeTimeout);
            
            // Close other dropdowns first
            desktopDropdowns.forEach(other => {
                if (other !== item) {
                    other.classList.remove('desktop-open');
                    const otherMenu = other.querySelector('.dropdown-menu, .mega-menu');
                    if (otherMenu) {
                        otherMenu.style.display = 'none';
                    }
                }
            });
            
            item.classList.add('desktop-open');
            const menu = item.querySelector('.dropdown-menu, .mega-menu');
            if (menu) {
                menu.style.display = 'block';
            }
        };
        
        const closeMenu = () => {
            if (closeTimeout) clearTimeout(closeTimeout);
            closeTimeout = setTimeout(() => {
                item.classList.remove('desktop-open');
                const menu = item.querySelector('.dropdown-menu, .mega-menu');
                if (menu) {
                    menu.style.display = 'none';
                }
            }, 250); // 250ms buffer prevents accidental hover loss closures
        };
        
        // Hover listeners
        item.addEventListener('mouseenter', function() {
            if (window.innerWidth > 1150) openMenu();
        });
        item.addEventListener('mouseleave', function() {
            if (window.innerWidth > 1150) closeMenu();
        });
        
        // Also listen inside dropdown menu to prevent gap issues
        const menu = item.querySelector('.dropdown-menu, .mega-menu');
        if (menu) {
            menu.addEventListener('mouseenter', function() {
                if (window.innerWidth > 1150) openMenu();
            });
            menu.addEventListener('mouseleave', function() {
                if (window.innerWidth > 1150) closeMenu();
            });
        }
        
        // Click listener to toggle on desktop (e.g. touch/hybrid screen, or direct clicks)
        const link = item.querySelector('.nav-link');
        if (link) {
            link.addEventListener('click', function(e) {
                if (window.innerWidth > 1150) {
                    e.preventDefault();
                    e.stopPropagation();
                    const menu = item.querySelector('.dropdown-menu, .mega-menu');
                    if (menu) {
                        const isVisible = menu.style.display === 'block';
                        if (isVisible) {
                            closeMenu();
                        } else {
                            openMenu();
                        }
                    }
                }
            });
        }
    });
    
    // Click outside closes desktop dropdowns
    document.addEventListener('click', function(e) {
        if (window.innerWidth > 1150) {
            desktopDropdowns.forEach(item => {
                if (!item.contains(e.target)) {
                    item.classList.remove('desktop-open');
                    const menu = item.querySelector('.dropdown-menu, .mega-menu');
                    if (menu) {
                        menu.style.display = 'none';
                    }
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

        const helpTexts = window.quoteHelpTexts || {
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
            let initialCenter = [38.8512, -77.0402]; // Default DCA Airport
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
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
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

        const AMERICAN_AIRPORTS = [
            { code: 'ATL', name: 'Hartsfield-Jackson Atlanta International Airport (ATL)', city: 'Atlanta, GA', coords: [33.6407, -84.4277] },
            { code: 'LAX', name: 'Los Angeles International Airport (LAX)', city: 'Los Angeles, CA', coords: [33.9416, -118.4085] },
            { code: 'ORD', name: 'O\'Hare International Airport (ORD)', city: 'Chicago, IL', coords: [41.9742, -87.9073] },
            { code: 'DFW', name: 'Dallas/Fort Worth International Airport (DFW)', city: 'Dallas, TX', coords: [32.8998, -97.0403] },
            { code: 'DEN', name: 'Denver International Airport (DEN)', city: 'Denver, CO', coords: [39.8561, -104.6737] },
            { code: 'JFK', name: 'John F. Kennedy International Airport (JFK)', city: 'New York, NY', coords: [40.6413, -73.7781] },
            { code: 'SFO', name: 'San Francisco International Airport (SFO)', city: 'San Francisco, CA', coords: [37.6213, -122.3790] },
            { code: 'SEA', name: 'Seattle-Tacoma International Airport (SEA)', city: 'Seattle, WA', coords: [47.4502, -122.3088] },
            { code: 'MCO', name: 'Orlando International Airport (MCO)', city: 'Orlando, FL', coords: [28.4312, -81.3081] },
            { code: 'LAS', name: 'Harry Reid International Airport (LAS)', city: 'Las Vegas, NV', coords: [36.0840, -115.1537] },
            { code: 'EWR', name: 'Newark Liberty International Airport (EWR)', city: 'Newark, NJ', coords: [40.6895, -74.1745] },
            { code: 'CLT', name: 'Charlotte Douglas International Airport (CLT)', city: 'Charlotte, NC', coords: [35.2144, -80.9473] },
            { code: 'PHX', name: 'Phoenix Sky Harbor International Airport (PHX)', city: 'Phoenix, AZ', coords: [33.4343, -112.0083] },
            { code: 'IAH', name: 'George Bush Intercontinental Airport (IAH)', city: 'Houston, TX', coords: [29.9902, -95.3368] },
            { code: 'MIA', name: 'Miami International Airport (MIA)', city: 'Miami, FL', coords: [25.7959, -80.2870] },
            { code: 'BOS', name: 'Boston Logan International Airport (BOS)', city: 'Boston, MA', coords: [42.3656, -71.0096] },
            { code: 'MSP', name: 'Minneapolis-Saint Paul International Airport (MSP)', city: 'Minneapolis, MN', coords: [44.8848, -93.2223] },
            { code: 'DTW', name: 'Detroit Metropolitan Airport (DTW)', city: 'Detroit, MI', coords: [42.2162, -83.3554] },
            { code: 'FLL', name: 'Fort Lauderdale-Hollywood International Airport (FLL)', city: 'Fort Lauderdale, FL', coords: [26.0742, -80.1506] },
            { code: 'PHL', name: 'Philadelphia International Airport (PHL)', city: 'Philadelphia, PA', coords: [39.8729, -75.2437] },
            { code: 'LGA', name: 'LaGuardia Airport (LGA)', city: 'New York, NY', coords: [40.7769, -73.8740] },
            { code: 'BWI', name: 'Baltimore/Washington International Thurgood Marshall Airport (BWI)', city: 'Baltimore, MD', coords: [39.1774, -76.6684] },
            { code: 'SLC', name: 'Salt Lake City International Airport (SLC)', city: 'Salt Lake City, UT', coords: [40.7899, -111.9791] },
            { code: 'SAN', name: 'San Diego International Airport (SAN)', city: 'San Diego, CA', coords: [32.7338, -117.1933] },
            { code: 'IAD', name: 'Washington Dulles International Airport (IAD)', city: 'Washington, DC', coords: [38.9531, -77.4565] },
            { code: 'DCA', name: 'Ronald Reagan Washington National Airport (DCA)', city: 'Washington, DC', coords: [38.8512, -77.0377] },
            { code: 'TPA', name: 'Tampa International Airport (TPA)', city: 'Tampa, FL', coords: [27.9772, -82.5311] },
            { code: 'MDW', name: 'Chicago Midway International Airport (MDW)', city: 'Chicago, IL', coords: [41.7868, -87.7524] },
            { code: 'PDX', name: 'Portland International Airport (PDX)', city: 'Portland, OR', coords: [45.5898, -122.5951] },
            { code: 'HNL', name: 'Daniel K. Inouye International Airport (HNL)', city: 'Honolulu, HI', coords: [21.3187, -157.9225] },
            { code: 'BNA', name: 'Nashville International Airport (BNA)', city: 'Nashville, TN', coords: [36.1263, -86.6774] },
            { code: 'AUS', name: 'Austin-Bergstrom International Airport (AUS)', city: 'Austin, TX', coords: [30.1975, -97.6664] },
            { code: 'DAL', name: 'Dallas Love Field (DAL)', city: 'Dallas, TX', coords: [32.8471, -96.8518] },
            { code: 'STL', name: 'St. Louis Lambert International Airport (STL)', city: 'St. Louis, MO', coords: [38.7477, -90.3597] },
            { code: 'HOU', name: 'William P. Hobby Airport (HOU)', city: 'Houston, TX', coords: [29.6454, -95.2789] },
            { code: 'IND', name: 'Indianapolis International Airport (IND)', city: 'Indianapolis, IN', coords: [39.7173, -86.2944] },
            { code: 'CVG', name: 'Cincinnati/Northern Kentucky International Airport (CVG)', city: 'Cincinnati, OH', coords: [39.0461, -84.6621] },
            { code: 'PIT', name: 'Pittsburgh International Airport (PIT)', city: 'Pittsburgh, PA', coords: [40.4915, -80.2329] },
            { code: 'CLE', name: 'Cleveland Hopkins International Airport (CLE)', city: 'Cleveland, OH', coords: [41.4108, -81.8498] },
            { code: 'CMH', name: 'John Glenn Columbus International Airport (CMH)', city: 'Columbus, OH', coords: [39.9980, -82.8919] },
            { code: 'RDU', name: 'Raleigh-Durham International Airport (RDU)', city: 'Raleigh, NC', coords: [35.8801, -78.7880] },
            { code: 'MCI', name: 'Kansas City International Airport (MCI)', city: 'Kansas City, MO', coords: [39.2976, -94.7139] },
            { code: 'SMF', name: 'Sacramento International Airport (SMF)', city: 'Sacramento, CA', coords: [38.6954, -121.5908] },
            { code: 'SJC', name: 'San Jose International Airport (SJC)', city: 'San Jose, CA', coords: [37.3618, -121.9290] },
            { code: 'SNA', name: 'John Wayne Airport (SNA)', city: 'Santa Ana, CA', coords: [33.6762, -117.8675] },
            { code: 'SAT', name: 'San Antonio International Airport (SAT)', city: 'San Antonio, TX', coords: [29.5337, -98.4697] },
            { code: 'RSW', name: 'Southwest Florida International Airport (RSW)', city: 'Fort Myers, FL', coords: [26.5362, -81.7551] },
            { code: 'PBI', name: 'Palm Beach International Airport (PBI)', city: 'West Palm Beach, FL', coords: [26.6832, -80.0956] },
            { code: 'BDL', name: 'Bradley International Airport (BDL)', city: 'Hartford, CT', coords: [41.9389, -72.6832] },
            { code: 'BUF', name: 'Buffalo Niagara International Airport (BUF)', city: 'Buffalo, NY', coords: [42.9405, -78.7322] },
            { code: 'OAK', name: 'Oakland International Airport (OAK)', city: 'Oakland, CA', coords: [37.7126, -122.2197] },
            { code: 'MEM', name: 'Memphis International Airport (MEM)', city: 'Memphis, TN', coords: [35.0424, -89.9767] },
            { code: 'ABQ', name: 'Albuquerque International Sunport (ABQ)', city: 'Albuquerque, NM', coords: [35.0402, -106.6092] },
            { code: 'OKC', name: 'Will Rogers World Airport (OKC)', city: 'Oklahoma City, OK', coords: [35.3931, -97.6007] },
            { code: 'TUL', name: 'Tulsa International Airport (TUL)', city: 'Tulsa, OK', coords: [36.1984, -95.8881] },
            { code: 'PVD', name: 'T. F. Green International Airport (PVD)', city: 'Providence, RI', coords: [41.7240, -71.4278] },
            { code: 'CHS', name: 'Charleston International Airport (CHS)', city: 'Charleston, SC', coords: [32.8986, -80.0405] },
            { code: 'SAV', name: 'Savannah/Hilton Head International Airport (SAV)', city: 'Savannah, GA', coords: [32.1276, -81.2021] },
            { code: 'ORF', name: 'Norfolk International Airport (ORF)', city: 'Norfolk, VA', coords: [36.8946, -76.2012] },
            { code: 'RIC', name: 'Richmond International Airport (RIC)', city: 'Richmond, VA', coords: [37.5052, -77.3197] },
            { code: 'SDF', name: 'Louisville Muhammad Ali International Airport (SDF)', city: 'Louisville, KY', coords: [38.1744, -85.7360] },
            { code: 'LEX', name: 'Blue Grass Airport (LEX)', city: 'Lexington, KY', coords: [38.0365, -84.6059] },
            { code: 'TYS', name: 'McGhee Tyson Airport (TYS)', city: 'Knoxville, TN', coords: [35.8110, -83.9940] },
            { code: 'GRR', name: 'Gerald R. Ford International Airport (GRR)', city: 'Grand Rapids, MI', coords: [42.8808, -85.5228] },
            { code: 'MKE', name: 'Milwaukee Mitchell International Airport (MKE)', city: 'Milwaukee, WI', coords: [42.9472, -87.8967] },
            { code: 'MSY', name: 'Louis Armstrong New Orleans International Airport (MSY)', city: 'New Orleans, LA', coords: [29.9934, -90.2580] },
            { code: 'JAX', name: 'Jacksonville International Airport (JAX)', city: 'Jacksonville, FL', coords: [30.4941, -81.6879] },
            { code: 'SRQ', name: 'Sarasota Bradenton International Airport (SRQ)', city: 'Sarasota, FL', coords: [27.3954, -82.5543] },
            { code: 'PNS', name: 'Pensacola International Airport (PNS)', city: 'Pensacola, FL', coords: [30.4734, -87.1874] },
            { code: 'MOB', name: 'Mobile Regional Airport (MOB)', city: 'Mobile, AL', coords: [30.6914, -88.2428] },
            { code: 'HSV', name: 'Huntsville International Airport (HSV)', city: 'Huntsville, AL', coords: [34.6372, -86.7751] },
            { code: 'BHM', name: 'Birmingham-Shuttlesworth International Airport (BHM)', city: 'Birmingham, AL', coords: [33.5629, -86.7535] },
            { code: 'LIT', name: 'Bill and Hillary Clinton National Airport (LIT)', city: 'Little Rock, AR', coords: [34.7294, -92.2247] },
            { code: 'DSM', name: 'Des Moines International Airport (DSM)', city: 'Des Moines, IA', coords: [41.5340, -93.6631] },
            { code: 'OMA', name: 'Eppley Airfield (OMA)', city: 'Omaha, NE', coords: [41.3025, -95.8941] },
            { code: 'ICT', name: 'Wichita Dwight D. Eisenhower National Airport (ICT)', city: 'Wichita, KS', coords: [37.6499, -97.4331] },
            { code: 'GEG', name: 'Spokane International Airport (GEG)', city: 'Spokane, WA', coords: [47.6186, -117.5338] },
            { code: 'BOI', name: 'Boise Airport (BOI)', city: 'Boise, ID', coords: [43.5644, -116.2228] },
            { code: 'HLN', name: 'Helena Regional Airport (HLN)', city: 'Helena, MT', coords: [46.6068, -111.9827] },
            { code: 'BIL', name: 'Billings Logan International Airport (BIL)', city: 'Billings, MT', coords: [45.8076, -108.5429] },
            { code: 'RNO', name: 'Reno-Tahoe International Airport (RNO)', city: 'Reno, NV', coords: [39.4985, -119.7681] },
            { code: 'ANC', name: 'Ted Stevens Anchorage International Airport (ANC)', city: 'Anchorage, AK', coords: [61.1744, -150.0167] },
            { code: 'FAT', name: 'Fresno Yosemite International Airport (FAT)', city: 'Fresno, CA', coords: [36.7762, -119.7181] },
            { code: 'PSP', name: 'Palm Springs International Airport (PSP)', city: 'Palm Springs, CA', coords: [33.8292, -116.5065] },
            { code: 'SBA', name: 'Santa Barbara Municipal Airport (SBA)', city: 'Santa Barbara, CA', coords: [34.4262, -119.8403] },
            { code: 'TUS', name: 'Tucson International Airport (TUS)', city: 'Tucson, AZ', coords: [32.1161, -110.9410] },
            { code: 'ELP', name: 'El Paso International Airport (ELP)', city: 'El Paso, TX', coords: [31.8072, -106.3778] },
            { code: 'LBB', name: 'Lubbuck Preston Smith International Airport (LBB)', city: 'Lubbock, TX', coords: [33.6625, -101.8233] },
            { code: 'AMA', name: 'Rick Husband Amarillo International Airport (AMA)', city: 'Amarillo, TX', coords: [35.2194, -101.7059] },
            { code: 'MAF', name: 'Midland International Air and Space Port (MAF)', city: 'Midland, TX', coords: [31.9425, -102.2019] },
            { code: 'CRP', name: 'Corpus Christi International Airport (CRP)', city: 'Corpus Christi, TX', coords: [27.7704, -97.5011] },
            { code: 'MFE', name: 'McAllen International Airport (MFE)', city: 'McAllen, TX', coords: [26.1758, -98.2386] },
            { code: 'BRO', name: 'Brownsville South Padre Island International Airport (BRO)', city: 'Brownsville, TX', coords: [25.9068, -97.4258] }
        ];

        const geocodeCache = {};

        function setupAirportAutocomplete(inputId) {
            const input = document.getElementById(inputId);
            if (!input) return;

            const dropdown = document.createElement('div');
            dropdown.className = 'airport-autocomplete-dropdown';
            dropdown.style.position = 'absolute';
            dropdown.style.backgroundColor = '#ffffff';
            dropdown.style.border = '1px solid rgba(0,0,0,0.1)';
            dropdown.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            dropdown.style.borderRadius = '6px';
            dropdown.style.zIndex = '10000';
            dropdown.style.maxHeight = '250px';
            dropdown.style.overflowY = 'auto';
            dropdown.style.display = 'none';
            
            if (input.parentElement) {
                input.parentElement.style.position = 'relative';
                input.parentElement.appendChild(dropdown);
            }

            function adjustWidth() {
                dropdown.style.width = input.offsetWidth + 'px';
            }
            adjustWidth();
            window.addEventListener('resize', adjustWidth);

            input.addEventListener('input', function () {
                const val = input.value.trim().toLowerCase();
                if (!val || val.length < 2) {
                    dropdown.innerHTML = '';
                    dropdown.style.display = 'none';
                    return;
                }

                const matches = AMERICAN_AIRPORTS.filter(a => 
                    a.code.toLowerCase().includes(val) || 
                    a.name.toLowerCase().includes(val) || 
                    a.city.toLowerCase().includes(val)
                ).slice(0, 8);

                if (matches.length === 0) {
                    dropdown.innerHTML = '';
                    dropdown.style.display = 'none';
                    return;
                }

                dropdown.innerHTML = '';
                matches.forEach(a => {
                    const item = document.createElement('div');
                    item.className = 'airport-autocomplete-item';
                    item.style.padding = '10px 14px';
                    item.style.cursor = 'pointer';
                    item.style.borderBottom = '1px solid rgba(0,0,0,0.03)';
                    item.style.transition = 'background 0.15s ease';
                    item.style.display = 'flex';
                    item.style.flexDirection = 'column';

                    item.addEventListener('mouseenter', () => {
                        item.style.backgroundColor = 'rgba(212, 175, 55, 0.08)';
                    });
                    item.addEventListener('mouseleave', () => {
                        item.style.backgroundColor = '';
                    });

                    const nameSpan = document.createElement('span');
                    nameSpan.className = 'airport-name';
                    nameSpan.style.fontWeight = '700';
                    nameSpan.style.color = '#1f2937';
                    nameSpan.style.fontSize = '0.88rem';
                    nameSpan.innerText = a.name;

                    const locSpan = document.createElement('span');
                    locSpan.className = 'airport-location';
                    locSpan.style.fontSize = '0.75rem';
                    locSpan.style.color = '#6b7280';
                    locSpan.style.marginTop = '2px';
                    locSpan.innerText = a.city;

                    item.appendChild(nameSpan);
                    item.appendChild(locSpan);

                    item.addEventListener('click', function () {
                        input.value = a.name;
                        dropdown.innerHTML = '';
                        dropdown.style.display = 'none';
                        input.dispatchEvent(new Event('input'));
                        input.dispatchEvent(new Event('change'));
                        if (typeof updateMapAndOverview === 'function') {
                            updateMapAndOverview();
                        }
                    });

                    dropdown.appendChild(item);
                });

                dropdown.style.display = 'block';
                adjustWidth();
            });

            document.addEventListener('click', function (e) {
                if (e.target !== input && e.target !== dropdown && !dropdown.contains(e.target)) {
                    dropdown.innerHTML = '';
                    dropdown.style.display = 'none';
                }
            });
        }

        async function geocodeAddress(address) {
            if (!address) return null;
            const clean = address.toLowerCase().trim();
            if (geocodeCache[clean]) return geocodeCache[clean];

            // Check hardcoded American Airports list first
            const airportMatch = AMERICAN_AIRPORTS.find(a => 
                clean === a.code.toLowerCase() || 
                clean === a.name.toLowerCase() || 
                clean.includes(a.name.toLowerCase()) || 
                clean.includes('(' + a.code.toLowerCase() + ')')
            );
            if (airportMatch) {
                geocodeCache[clean] = airportMatch.coords;
                return airportMatch.coords;
            }

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

                function parseCapacity(capacityStr) {
                    if (!capacityStr) return 0;
                    const matches = capacityStr.match(/\d+/g);
                    if (!matches) return 0;
                    return Math.max(...matches.map(Number));
                }
                
                function parseRate(rateStr) {
                    if (!rateStr) return 0;
                    const match = rateStr.match(/\d+/);
                    return match ? parseFloat(match[0]) : 0;
                }

                if (window.fleetData && window.fleetData.length > 0) {
                    const sortedFleet = [...window.fleetData].sort((a, b) => parseCapacity(a.capacity) - parseCapacity(b.capacity));
                    let recommended = sortedFleet.find(v => parseCapacity(v.capacity) >= passengersVal);
                    if (!recommended) {
                        recommended = sortedFleet[sortedFleet.length - 1];
                    }
                    
                    recVehicle = recommended.name;
                    startingRate = parseRate(recommended.starting_rate);
                    
                    const cap = parseCapacity(recommended.capacity);
                    if (cap <= 6) {
                        minHrs = 3;
                    } else if (cap <= 14) {
                        minHrs = 3;
                    } else if (cap > 40) {
                        minHrs = 5;
                    }
                } else {
                    if (passengersVal <= 14) {
                        recVehicle = 'Luxury Sprinter Van';
                        startingRate = 85;
                        minHrs = 3;
                    } else if (passengersVal <= 36) {
                        recVehicle = '36 Passenger Bus';
                        startingRate = 125;
                        minHrs = 4;
                    } else {
                        recVehicle = 'Full-Sized Charter Bus';
                        startingRate = 150;
                        minHrs = 5;
                    }
                }

                if (elRecBlock && elRec) {
                    elRecBlock.style.display = 'block';
                    if (startingRate > 0) {
                        elRec.innerHTML = `
                            <div style="font-weight: 700; color: var(--accent-gold-light);">${recVehicle}</div>
                            <div style="font-size: 0.75rem; color: var(--text-light); font-weight: normal; margin-top: 2px;">
                                Capacity: ${passengersVal} Pax | Rates: from $${startingRate}/hr (min ${minHrs}h)
                            </div>
                        `;
                    } else {
                        elRec.innerHTML = `
                            <div style="font-weight: 700; color: var(--accent-gold-light);">${recVehicle}</div>
                            <div style="font-size: 0.75rem; color: var(--text-light); font-weight: normal; margin-top: 2px;">
                                Capacity: ${passengersVal} Pax | Rates: Custom Quote (Pending Review)
                            </div>
                        `;
                    }
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
                }                if (activeCoords.length === 1) {
                    map.setView(activeCoords[0], 12);
                }
            }
            window.calculatedRouteCoords = activeCoords;
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

        // Setup Airport Autocomplete
        setupAirportAutocomplete('pickup_address');
        setupAirportAutocomplete('stop_address');
        setupAirportAutocomplete('dropoff_address');

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
            let perMileRate = 0;
            let minHours = 4;

            function parseCapacity(capacityStr) {
                if (!capacityStr) return 0;
                const matches = capacityStr.match(/\d+/g);
                if (!matches) return 0;
                return Math.max(...matches.map(Number));
            }
            let minPrice = 300.00;
            let perMileRate_1_10 = 4.00;
            let perMileRate_11_50 = 3.50;
            let perMileRate_51 = 3.00;

            function parseRate(rateStr) {
                if (!rateStr) return 0;
                const match = rateStr.match(/\d+/);
                return match ? parseFloat(match[0]) : 0;
            }

            if (window.fleetData && window.fleetData.length > 0) {
                const sortedFleet = [...window.fleetData].sort((a, b) => parseCapacity(a.capacity) - parseCapacity(b.capacity));
                let recommended = sortedFleet.find(v => parseCapacity(v.capacity) >= passengers);
                if (!recommended) {
                    recommended = sortedFleet[sortedFleet.length - 1];
                }
                
                recommendedVehicle = recommended.name + ' (' + recommended.capacity + ')';
                baseRate = parseRate(recommended.starting_rate);
                minPrice = parseFloat(recommended.min_price) || 300.00;
                perMileRate_1_10 = parseFloat(recommended.per_mile_rate_1_10) || parseFloat(recommended.per_mile_rate) || 4.00;
                perMileRate_11_50 = parseFloat(recommended.per_mile_rate_11_50) || 3.50;
                perMileRate_51 = parseFloat(recommended.per_mile_rate_51) || 3.00;
                
                const cap = parseCapacity(recommended.capacity);
                if (cap <= 6) {
                    minHours = 3;
                } else if (cap <= 14) {
                    minHours = 3;
                } else if (cap > 40) {
                    minHours = 5;
                }
            } else {
                if (passengers <= 14) {
                    recommendedVehicle = 'Luxury Sprinter Van (14 Passengers)';
                    baseRate = 85; 
                    minHours = 3;
                    minPrice = 300.00;
                    perMileRate_1_10 = 4.00;
                    perMileRate_11_50 = 3.50;
                    perMileRate_51 = 3.00;
                } else if (passengers <= 36) {
                    recommendedVehicle = '36 Passenger Bus (36 Passengers)';
                    baseRate = 125;
                    minHours = 4;
                    minPrice = 300.00;
                    perMileRate_1_10 = 4.50;
                    perMileRate_11_50 = 4.00;
                    perMileRate_51 = 3.50;
                } else {
                    recommendedVehicle = 'Full-Sized Charter Bus (50 Passengers)';
                    baseRate = 150;
                    minHours = 5;
                    minPrice = 300.00;
                    perMileRate_1_10 = 5.00;
                    perMileRate_11_50 = 4.50;
                    perMileRate_51 = 4.00;
                }
            }

            let priceDisplay = '';
            let subtitleDisplay = 'Pending booking coordinator confirmation.';
            
            if (baseRate > 0) {
                let estPrice = baseRate * minHours;
                
                // Enforce minimum booking price
                if (estPrice < minPrice) {
                    estPrice = minPrice;
                }
                
                // Calculate distance in miles if coordinates exist
                let estMiles = 0;
                if (window.calculatedRouteCoords && window.calculatedRouteCoords.length >= 2) {
                    const c1 = window.calculatedRouteCoords[0];
                    const c2 = window.calculatedRouteCoords[window.calculatedRouteCoords.length - 1];
                    
                    const R = 3958.8; // earth radius in miles
                    const dLat = (c2[0] - c1[0]) * Math.PI / 180;
                    const dLon = (c2[1] - c1[1]) * Math.PI / 180;
                    const a = 
                        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                        Math.cos(c1[0] * Math.PI / 180) * Math.cos(c2[0] * Math.PI / 180) * 
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
                    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    estMiles = R * c * 1.25; // 1.25x road winding factor
                }
                
                // Add tiered distance charge
                let distanceCharge = 0;
                if (estMiles > 0) {
                    if (estMiles <= 10) {
                        distanceCharge = estMiles * perMileRate_1_10;
                    } else if (estMiles <= 50) {
                        distanceCharge = (10 * perMileRate_1_10) + ((estMiles - 10) * perMileRate_11_50);
                    } else {
                        distanceCharge = (10 * perMileRate_1_10) + (40 * perMileRate_11_50) + ((estMiles - 50) * perMileRate_51);
                    }
                }
                estPrice += distanceCharge;
                
                // Adjust price based on trip type
                const type = tripTypeInput.value;
                if (type === 'round-trip') {
                    estPrice = estPrice * 1.6; // 1.6x multiplier for round-trip return leg estimation
                } else if (type === 'large-event') {
                    estPrice = estPrice * 2.0; // 2.0x multiplier for large event loops/conventions
                }
                
                priceDisplay = `$${estPrice.toFixed(2)}`;
                if (estMiles > 0) {
                    subtitleDisplay = `Estimated route: ${estMiles.toFixed(1)} miles. Pending coordinator confirmation.`;
                }
            } else {
                priceDisplay = 'Custom Quote';
                subtitleDisplay = 'Our representative will contact you with a custom quote shortly.';
            }

            document.getElementById('recommendedVehicle').innerHTML = `<strong>Recommended Vehicle:</strong> ${recommendedVehicle}`;
            document.getElementById('quoteEstPrice').innerText = priceDisplay;
            
            const estSubtitle = document.querySelector('#step4 p');
            if (estSubtitle) {
                estSubtitle.innerText = subtitleDisplay;
            }

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

            const priceEl = document.getElementById('quoteEstPrice');
            const priceVal = priceEl ? priceEl.innerText : 'Custom Quote';

            const payload = {
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value,
                service_type: document.getElementById('service_type').value,
                pickup_loc: pickupLocCombined,
                dropoff_loc: dropoffAddress,
                trip_date: pickupDate,
                passengers: passengers,
                message: itineraryDetails,
                price: priceVal
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
                message: document.getElementById('message').value,
                price: 'Custom Quote'
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
        const pickupParam = urlParams.get('pickup');

        if (serviceParam) {
            const selectEl = document.getElementById('service_type');
            if (selectEl) {
                const targetText = serviceParam.replace(/-/g, ' ').toLowerCase();
                for (let i = 0; i < selectEl.options.length; i++) {
                    if (selectEl.options[i].value.toLowerCase().includes(targetText) || targetText.includes(selectEl.options[i].value.toLowerCase())) {
                        selectEl.selectedIndex = i;
                        break;
                    }
                }
            }
        } else if (vehicleParam) {
            const selectEl = document.getElementById('service_type');
            if (selectEl) {
                if (vehicleParam.includes('coach') || vehicleParam.includes('charter')) {
                    for (let i = 0; i < selectEl.options.length; i++) {
                        if (selectEl.options[i].value.toLowerCase().includes('charter')) {
                            selectEl.selectedIndex = i;
                            break;
                        }
                    }
                } else if (vehicleParam.includes('minibus')) {
                    for (let i = 0; i < selectEl.options.length; i++) {
                        if (selectEl.options[i].value.toLowerCase().includes('minibus')) {
                            selectEl.selectedIndex = i;
                            break;
                        }
                    }
                } else if (vehicleParam.includes('sprinter') || vehicleParam.includes('van')) {
                    for (let i = 0; i < selectEl.options.length; i++) {
                        if (selectEl.options[i].value.toLowerCase().includes('shuttle')) {
                            selectEl.selectedIndex = i;
                            break;
                        }
                    }
                } else if (vehicleParam.includes('limo')) {
                    for (let i = 0; i < selectEl.options.length; i++) {
                        if (selectEl.options[i].value.toLowerCase().includes('limousine')) {
                            selectEl.selectedIndex = i;
                            break;
                        }
                    }
                } else if (vehicleParam.includes('suburban') || vehicleParam.includes('towncar')) {
                    for (let i = 0; i < selectEl.options.length; i++) {
                        if (selectEl.options[i].value.toLowerCase().includes('suv') || selectEl.options[i].value.toLowerCase().includes('sedan')) {
                            selectEl.selectedIndex = i;
                            break;
                        }
                    }
                }
            }
        }

        if (pickupParam) {
            const pickupEl = document.getElementById('pickup_loc');
            if (pickupEl) {
                pickupEl.value = decodeURIComponent(pickupParam);
            }
        }
    }
});
