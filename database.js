const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

let DB_PATH = path.join(__dirname, 'data', 'db.json');

// Serverless writable /tmp check for Netlify environment
if (process.env.NETLIFY || process.env.LAMBDA_TASK_ROOT) {
    const tempDbPath = path.join('/tmp', 'db.json');
    if (!fs.existsSync(tempDbPath)) {
        try {
            if (fs.existsSync(DB_PATH)) {
                fs.copyFileSync(DB_PATH, tempDbPath);
            } else {
                 const initialDb = { users: [], pages: [], services: [], fleet: [], blogs: [], inquiries: [], cities: [], states: [], settings: { phone: "(202) 991-1203", email: "reservations@unitedbuspro.com", address: "Washington, DC", smtp_host: "", smtp_port: "", smtp_user: "", smtp_pass: "", smtp_from: "", smtp_to: "reservations@unitedbuspro.com" } };
                fs.writeFileSync(tempDbPath, JSON.stringify(initialDb, null, 2));
            }
        } catch (copyErr) {
            console.error("Temp DB initialization error:", copyErr);
        }
    }
    DB_PATH = tempDbPath;
} else {
    // Ensure data folder exists locally
    if (!fs.existsSync(path.join(__dirname, 'data'))) {
        fs.mkdirSync(path.join(__dirname, 'data'));
    }
}

// Initial Database Structure
const initialDb = {
    users: [],
    pages: [],
    services: [],
    fleet: [],
    blogs: [],
    inquiries: [],
    cities: [],
    states: [],
    settings: {
        phone: "(202) 991-1203",
        email: "reservations@unitedbuspro.com",
        address: "Washington, DC",
        smtp_host: "",
        smtp_port: "",
        smtp_user: "",
        smtp_pass: "",
        smtp_from: "",
        smtp_to: "reservations@unitedbuspro.com"
    }
};

// Seed function
function seedData(db) {
    // 1. Seed admin user if empty
    if (db.users.length === 0) {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync('admin123', salt);
        db.users.push({
            id: 1,
            username: 'admin',
            password: hashedPassword
        });
    }

    // 2. Seed Pages
    if (db.pages.length === 0) {
        db.pages = [
            {
                slug: 'home',
                title: 'United Bus Pro | Premium Charter Bus & Shuttle Service Washington, DC',
                meta_description: 'Book premium charter bus rentals, corporate shuttles, minibus hires, and group transportation across Washington, DC, and nationwide. Instant online quotes.',
                header_h1: 'Reliable Group Transportation & Charter Bus Services',
                body_content: 'Welcome to United Bus Pro, the leading provider of premium charter bus rentals, executive shuttle logistics, and minibus charter services in the Washington, DC metro area and nationwide. For over 12 years, we have delivered secure, reliable, and comfortable group transport for corporate events, conventions, wedding parties, sports leagues, and school trips. With a modern fleet ranging from 14-passenger luxury Sprinter vans to 50-passenger full-sized coach buses, we ensure your group arrives together and on schedule. Our vetted, professional drivers and 24/7 dispatch operations guarantee a seamless experience. Try our instant online quote builder today to see transparent group travel rates.'
            },
            {
                slug: 'about',
                title: 'About Us | United Bus Pro | Premium Group Transportation',
                meta_description: 'Learn about United Bus Pro. Over 12 years of delivering safe, reliable, and luxury group transport services across Washington, DC and nationwide.',
                header_h1: 'Setting the Standard in Group Travel',
                body_content: 'United Bus Pro was founded with a clear mission: to provide the highest standard of safety, comfort, and reliability in group ground transportation. Based in Washington, DC, we have grown into a premier fleet provider servicing corporate clients, event planners, schools, and private groups nationwide. Our commitment to safety is absolute. Every coach and minibus in our network undergoes rigorous preventative maintenance, and our background-checked, commercially licensed chauffeurs are trained in defensive driving and customer service. Whether you require a short shuttle for a corporate meeting, wedding guest logistics, or a multi-day cross-country tour, United Bus Pro delivers outstanding logistics management.'
            },
            {
                slug: 'contact',
                title: 'Contact Us | United Bus Pro | 24/7 Booking Desk',
                meta_description: 'Contact United Bus Pro for custom group travel rates, recurring corporate shuttle plans, or immediate dispatch inquiries.',
                header_h1: 'Contact Our Group Booking Desk',
                body_content: 'Planning group logistics can be complex, but booking your bus doesn\'t have to be. The United Bus Pro customer service desk is open 24 hours a day, 7 days a week, 365 days a year to support your itinerary planning, coordinates, and reservations. Speak directly to an event transportation coordinator or submit your details online to receive a custom quote.'
            },
            {
                slug: 'thank-you',
                title: 'Request Received | United Bus Pro',
                meta_description: 'Thank you for requesting a quote from United Bus Pro. Our group travel coordinators will review your details shortly.',
                header_h1: 'Thank You for Requesting a Quote',
                body_content: 'Your group transportation inquiry has been successfully logged. An email confirmation has been dispatched to your address, and one of our dedicated reservation specialists is currently calculating exact rates for your itinerary. We will contact you shortly with a formal quote and vehicle availability. For immediate assistance or urgent bookings, please contact our 24/7 dispatch desk directly.'
            }
        ];
    }

    // 3. Seed Services (Auto-upgraded to 22 services)
    if (db.services.length === 0) {
        const rawServices = [
            // Category: Bus Charters
            { name: 'Airport Charter Bus Rentals', category: 'Bus Charters', desc: 'Seamless group transfers to and from major airports with ample luggage space and flight tracking.' },
            { name: 'Camps', category: 'Bus Charters', desc: 'Safe, reliable transportation for summer camps, outdoor excursions, and recreational trips.' },
            { name: 'Corporate Events', category: 'Bus Charters', desc: 'Premium executive coaches for company events, executive dinners, team outings, and conventions.' },
            { name: 'K12 Schools', category: 'Bus Charters', desc: 'DOT-certified bus charters for field trips, sports matches, and school events with vetted drivers.' },
            { name: 'Nonprofits', category: 'Bus Charters', desc: 'Budget-friendly travel rates for community centers, volunteer groups, and charitable events.' },
            { name: 'Religious Groups', category: 'Bus Charters', desc: 'Dependable transportation for church youth retreats, conferences, and community gatherings.' },
            { name: 'Sports Teams', category: 'Bus Charters', desc: 'Large athletic travel logistics with under-coach compartments for heavy gear and spacious reclining seating.' },
            { name: 'Travel Agents', category: 'Bus Charters', desc: 'Professional charter partnerships providing dedicated coaches and custom itineraries for tour agencies.' },
            { name: 'University Bus Rentals', category: 'Bus Charters', desc: 'Collegiate travel services for sports tournaments, admissions events, and student organization tours.' },

            // Category: Continuous Shuttles
            { name: 'Airport Shuttles', category: 'Continuous Shuttles', desc: 'Scheduled terminal shuttles for airports, hotels, flight crews, and parking facilities.' },
            { name: 'Campus Shuttles', category: 'Continuous Shuttles', desc: 'Continuous student and faculty loops around university campuses, student housing, and campus structures.' },
            { name: 'Construction Shuttles', category: 'Continuous Shuttles', desc: 'Safe off-site employee transport to job sites, manufacturing units, and refinery coordinates.' },
            { name: 'Employee Shuttles', category: 'Continuous Shuttles', desc: 'Daily corporate shuttle networks connecting transit stations to business offices to improve commutes.' },
            { name: 'Hospitals & Healthcare', category: 'Continuous Shuttles', desc: 'Continuous transit for doctors, visitors, and patients between medical campuses.' },
            { name: 'K12 Districts', category: 'Continuous Shuttles', desc: 'Regular and safe daily transport routes for school districts with certified drivers.' },
            { name: 'Wedding Shuttles', category: 'Continuous Shuttles', desc: 'Dedicated hotel-to-venue shuttle loops for wedding guest logistics and safety.' },

            // Category: Large Events
            { name: 'Emergency Response', category: 'Large Events', desc: 'Immediate group dispatch and logistics support for hurricane evacuations, emergency response, and critical operations.' },
            { name: 'Government & Military', category: 'Large Events', desc: 'GSA-compliant, secure transportation for military exercises, agency conferences, and logistics.' },
            { name: 'Large Events', category: 'Large Events', desc: 'Comprehensive traffic management and multi-bus fleet networks for music festivals, conventions, and rallies.' },
            { name: 'Private Events', category: 'Large Events', desc: 'Charter packages for family reunions, birthdays, concert events, and custom itineraries.' },
            { name: 'Trade Shows & Conferences', category: 'Large Events', desc: 'High-volume shuttle programs to manage convention center and hotel routing cycles.' },
            { name: 'Workforce Contingency', category: 'Large Events', desc: 'Standby transit and workforce commuter solutions to ensure operational stability during public transit outages.' },

            // Category: DC Private Tours
            { name: 'DC Monuments Private Tour', category: 'DC Private Tours', desc: 'Bespoke guided coach and minibus tours of DC\'s iconic monuments, including the Lincoln Memorial, Washington Monument, and US Capitol.' },
            { name: 'Mount Vernon Historical Tour', category: 'DC Private Tours', desc: 'Premium private transportation to George Washington\'s Mount Vernon estate with customized schedules.' },
            { name: 'Smithsonian Museum Tour', category: 'DC Private Tours', desc: 'Shuttle logistics and private group charters for visiting the Smithsonian museums along the National Mall.' }
        ];

        db.services = rawServices.map((s, i) => {
            const slug = s.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            return {
                id: i + 1,
                name: s.name,
                slug: slug,
                category: s.category,
                capacity: s.category === 'Continuous Shuttles' ? '14-35 Passengers' : (s.category === 'DC Private Tours' ? '14-50 Passengers' : 'Up to 56 Passengers'),
                description: s.desc,
                price: s.category === 'Continuous Shuttles' ? 'From $110/hr' : (s.category === 'DC Private Tours' ? 'From $120/hr' : 'From $135/hr'),
                details: JSON.stringify([
                    'Rigorous pre-trip vehicle diagnostics and mechanical checkouts',
                    'Background-checked, commercially licensed chauffeurs',
                    'Climate-controlled passenger cabins with premium seating positions',
                    '24/7 dedicated client dispatch support and tracking updates',
                    'Fully customized routes tailored to your group schedule'
                ])
            };
        });
    }

    // 4. Seed Fleet
    if (db.fleet.length === 0) {
        db.fleet = [
            {
                id: 1,
                name: '14 Passenger Bus',
                slug: '14-passenger-bus',
                capacity: '14 Passengers',
                bags: '14 Bags',
                amenities: JSON.stringify(['Leather Seating', 'Wi-Fi', 'USB Outlets', 'Premium Sound']),
                image: '/images/fleet-sprinter.webp',
                description: 'Luxury passenger van perfect for airport transfers, business teams, and boutique tours.',
                starting_rate: '$85/hr'
            },
            {
                id: 2,
                name: '24 Passenger Bus',
                slug: '24-passenger-bus',
                capacity: '24 Passengers',
                bags: '20 Bags',
                amenities: JSON.stringify(['Climate Control', 'High-Back Seats', 'Bluetooth Audio', 'PA System', 'Rear Storage']),
                image: '/images/fleet-standard-minibus.webp',
                description: 'Premium Grech minibus offering comfort and reliability for corporate events, shuttle routes, and DC private tours.',
                starting_rate: '$100/hr'
            },
            {
                id: 3,
                name: '28 Passenger Bus',
                slug: '28-passenger-bus',
                capacity: '28 Passengers',
                bags: '25 Bags',
                amenities: JSON.stringify(['Wi-Fi', 'Leather Seats', 'USB Outlets', 'PA System', 'Rear Storage']),
                image: '/images/fleet-minibus.webp',
                description: 'Mid-sized executive minibus equipped with comfortable seating and connectivity features for group transport.',
                starting_rate: '$110/hr'
            },
            {
                id: 4,
                name: '32 Passenger Bus',
                slug: '32-passenger-bus',
                capacity: '32 Passengers',
                bags: '30 Bags',
                amenities: JSON.stringify(['Wi-Fi', 'Leather Seats', 'USB Outlets', 'PA System', 'TV Screens', 'Rear Storage']),
                image: '/images/fleet_minibus_32.png',
                description: 'Spacious executive minibus providing an elevated passenger experience for corporate events and private excursions.',
                starting_rate: '$120/hr'
            },
            {
                id: 5,
                name: '40 Passenger Bus',
                slug: '40-passenger-bus',
                capacity: '40 Passengers',
                bags: '40 Bags',
                amenities: JSON.stringify(['Wi-Fi', 'Leather Seats', 'USB Outlets', 'PA System', 'TV Screens', 'Luggage Compartment']),
                image: '/images/fleet_minibus_40.png',
                description: 'High-capacity luxury minibus ideal for larger group logistics, corporate shuttles, and private tours.',
                starting_rate: '$130/hr'
            },
            {
                id: 6,
                name: 'ADA 24 Passenger Bus (Wheelchair Accessible)',
                slug: 'ada-24-passenger-bus',
                capacity: '24 Passengers',
                bags: '15 Bags',
                amenities: JSON.stringify(['Wheelchair Lift', 'ADA Compliant Securement', 'Climate Control', 'High-Back Seats', 'PA System']),
                image: '/images/fleet_minibus_ada.png',
                description: 'Fully ADA-compliant wheelchair-accessible minibus ensuring comfortable and safe transit for all passengers.',
                starting_rate: '$115/hr'
            },
            {
                id: 7,
                name: '50 Passenger Coach Bus',
                slug: '50-passenger-coach-bus',
                capacity: '50 Passengers',
                bags: '50 Bags',
                amenities: JSON.stringify(['Restroom', 'Wi-Fi', 'Power Outlets', 'PA System', 'Luggage Bay', 'Reclining Seats']),
                image: '/images/fleet_coach_50.png',
                description: 'Premium full-sized motorcoach for long-distance group tours, conventions, and large-scale shuttle loops.',
                starting_rate: '$150/hr'
            },
            {
                id: 8,
                name: 'Chevrolet Suburban SUV – 6 Passengers',
                slug: 'chevrolet-suburban-suv',
                capacity: '6 Passengers',
                bags: '6 Bags',
                amenities: JSON.stringify(['Leather Seating', 'Climate Control', 'Rear Seat Entertainment', 'Tinted Windows', 'Premium Sound']),
                image: '/images/fleet_suburban.png',
                description: 'Executive black SUV providing premium private rides, airport transfers, and VIP transport.',
                starting_rate: '$75/hr'
            },
            {
                id: 9,
                name: 'Town Car – 4 Passengers',
                slug: 'town-car',
                capacity: '4 Passengers',
                bags: '3 Bags',
                amenities: JSON.stringify(['Leather Seating', 'Climate Control', 'USB Outlets', 'Smooth Ride Suspension']),
                image: '/images/fleet_towncar.png',
                description: 'Classic executive town car perfect for business travelers, private events, and airport transport.',
                starting_rate: '$60/hr'
            },
            {
                id: 10,
                name: 'Limousine – 8 to 10 Passengers',
                slug: 'limousine',
                capacity: '8 to 10 Passengers',
                bags: '4 Bags',
                amenities: JSON.stringify(['Bar Console', 'Fiber Optic Lighting', 'Premium Sound', 'Leather Wrap-Around Seating', 'Privacy Partition']),
                image: '/images/fleet_limo.png',
                description: 'Elegant stretch limousine for weddings, VIP events, executive transport, and celebratory excursions.',
                starting_rate: '$130/hr'
            },
            {
                id: 11,
                name: 'Hummer Limousine – 14 Passengers',
                slug: 'hummer-limousine',
                capacity: '14 Passengers',
                bags: '6 Bags',
                amenities: JSON.stringify(['Premium Sound', 'Strobe & Laser Lighting', 'Multi-Color Bar', 'Wrap-Around Leather Seating', 'Privacy Glass']),
                image: '/images/fleet_hummer.png',
                description: 'Stunning stretch Hummer limousine offering a high-impact, luxury party atmosphere for larger groups.',
                starting_rate: '$160/hr'
            }
        ];
    }

    // 5. Seed Blogs
    if (db.blogs.length === 0) {
        db.blogs = [
            {
                id: 1,
                title: 'The Ultimate Guide to Renting a Charter Bus in Washington, DC',
                slug: 'ultimate-guide-charter-bus-rental-dc',
                content: 'Renting a charter bus for a large group can seem challenging, but understanding the logistics makes it simple. In this guide, we break down everything you need to know about booking a coach bus in the Washington, DC area: how to choose the right size (from 14-passenger Sprinters to 50-passenger coaches), estimating rental costs, navigating local logistics at the National Mall or FedexField, and planning passenger pick-ups. Choosing the right vehicle with correct amenities like restrooms and power outlets ensures a comfortable, stress-free road trip.',
                tags: 'Travel Tips, Washington DC, Group Logistics',
                publish_date: 'June 10, 2026',
                author: 'United Bus Pro Team',
                image: '/images/blog-guide.webp',
                category: 'Logistics'
            },
            {
                id: 2,
                title: 'Corporate Shuttle Programs: Improving Employee Commutes in 2026',
                slug: 'corporate-shuttle-commute-programs-2026',
                content: 'As corporate offices in Washington, DC, Arlington, and Alexandria adapt to modern work styles, employee transportation programs have become a powerful recruitment and retention tool. Custom shuttle routes between transit stations and office parks reduce commuter stress, bypass highway traffic, and give employees a productive environment with on-board Wi-Fi and USB power. Here, we outline the steps to design, launch, and manage a reliable employee shuttle program for your company.',
                tags: 'Corporate Travel, Shuttles, Employee Commute',
                publish_date: 'June 11, 2026',
                author: 'United Bus Pro Team',
                image: '/images/blog-corporate.webp',
                category: 'Corporate'
            }
        ];
    }

    // 6. Seed Cities (original DFW cities + user's cities)
    if (!db.cities || db.cities.length === 0) {
        const rawCities = [
            { name: 'Dallas', state: 'Texas', stateCode: 'TX', airport: 'DFW, DAL', destinations: 'Kay Bailey Hutchison Convention Center, Dealey Plaza, American Airlines Center' },
            { name: 'Fort Worth', state: 'Texas', stateCode: 'TX', airport: 'DFW', destinations: 'Fort Worth Stockyards, Sundance Square, Fort Worth Water Gardens' },
            { name: 'Arlington', state: 'Texas', stateCode: 'TX', airport: 'DFW', destinations: 'AT&T Stadium, Globe Life Field, Six Flags Over Texas' },
            { name: 'Plano', state: 'Texas', stateCode: 'TX', airport: 'DFW, DAL', destinations: 'Legacy West, Oak Point Park, The Shops at Legacy' },
            { name: 'Frisco', state: 'Texas', stateCode: 'TX', airport: 'DFW', destinations: 'The Star in Frisco, Toyota Stadium, Frisco Commons Park' },
            { name: 'New York City', state: 'New York', stateCode: 'NY', airport: 'JFK, LGA, EWR', destinations: 'Times Square, Central Park, Broadway, Javits Center' },
            { name: 'Houston', state: 'Texas', stateCode: 'TX', airport: 'IAH, HOU', destinations: 'Space Center Houston, Minute Maid Park, Museum District' },
            { name: 'Chicago', state: 'Illinois', stateCode: 'IL', airport: 'ORD, MDW', destinations: 'Millennium Park, Navy Pier, McCormick Place' },
            { name: 'Washington DC', state: 'District of Columbia', stateCode: 'DC', airport: 'DCA, IAD, BWI', destinations: 'National Mall, US Capitol, White House' },
            { name: 'Los Angeles', state: 'California', stateCode: 'CA', airport: 'LAX, SNA, BUR', destinations: 'Hollywood Walk of Fame, Getty Center, LA Convention Center' },
            { name: 'Albany', state: 'New York', stateCode: 'NY', airport: 'ALB', destinations: 'New York State Capitol, Times Union Center, Washington Park' },
            { name: 'Albuquerque', state: 'New Mexico', stateCode: 'NM', airport: 'ABQ', destinations: 'Old Town Plaza, Sandia Peak Tramway, Balloon Fiesta Park' },
            { name: 'Alexandria', state: 'Virginia', stateCode: 'VA', airport: 'DCA', destinations: 'Old Town Alexandria, Torpedo Factory Art Center' },
            { name: 'Anaheim', state: 'California', stateCode: 'CA', airport: 'SNA, LAX', destinations: 'Disneyland Resort, Anaheim Convention Center' },
            { name: 'Ann Arbor', state: 'Michigan', stateCode: 'MI', airport: 'DTW', destinations: 'University of Michigan, Michigan Stadium' },
            { name: 'Atlanta', state: 'Georgia', stateCode: 'GA', airport: 'ATL', destinations: 'Georgia Aquarium, World of Coca-Cola, Mercedes-Benz Stadium' },
            { name: 'Augusta', state: 'Georgia', stateCode: 'GA', airport: 'AGS', destinations: 'Augusta National Golf Club, Riverwalk Augusta' },
            { name: 'Austin', state: 'Texas', stateCode: 'TX', airport: 'AUS', destinations: 'Texas State Capitol, Sixth Street, Circuit of The Americas' },
            { name: 'Bakersfield', state: 'California', stateCode: 'CA', airport: 'BFL', destinations: 'Buck Owens\' Crystal Palace, Kern County Museum' },
            { name: 'Baltimore', state: 'Maryland', stateCode: 'MD', airport: 'BWI', destinations: 'Inner Harbor, National Aquarium, Fort McHenry' },
            { name: 'Baton Rouge', state: 'Louisiana', stateCode: 'LA', airport: 'BTR', destinations: 'Louisiana State Capitol, LSU Tiger Stadium' },
            { name: 'Berkeley', state: 'California', stateCode: 'CA', airport: 'OAK, SFO', destinations: 'UC Berkeley, Greek Theatre, Tilden Regional Park' },
            { name: 'Birmingham', state: 'Alabama', stateCode: 'AL', airport: 'BHM', destinations: 'Vulcan Park, Birmingham Civil Rights Institute' },
            { name: 'Boston', state: 'Massachusetts', stateCode: 'MA', airport: 'BOS', destinations: 'Fenway Park, Freedom Trail, Faneuil Hall' }
        ];

        db.cities = rawCities.map((c, i) => {
            const cleanSlug = c.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            const hasStateSuffix = (c.name === 'Dallas' || c.name === 'Fort Worth' || c.name === 'Arlington' || c.name === 'Plano' || c.name === 'Frisco');
            const slug = hasStateSuffix ? `charter-bus-${cleanSlug}-tx` : `charter-bus-${cleanSlug}`;
            
            return {
                id: i + 1,
                name: `${c.name}, ${c.stateCode}`,
                cityName: c.name,
                stateName: c.state,
                stateCode: c.stateCode,
                slug: slug,
                title: `${c.name} Charter Bus Rental & Shuttle Services | United Bus Pro`,
                meta_description: `Book a charter bus rental or corporate shuttle in ${c.name}, ${c.stateCode}. Clean motorcoaches, minibuses, and Sprinter vans with certified drivers.`,
                header_h1: `Charter Bus Rentals & Group Shuttles in ${c.name}`,
                body_content: `United Bus Pro is the leading provider of group ground transportation and motorcoach charters in the ${c.name} area. We support corporate commutes, business conventions, wedding guest shuttling, university outings, and private tours. Our commercially licensed chauffeurs, modern clean vehicles, and 24/7 client dispatch ensure a seamless travel experience for your passengers.`,
                airport_code: c.airport,
                popular_destinations: c.destinations
            };
        });
    }

    // 7. Seed States
    if (!db.states || db.states.length === 0) {
        const rawStates = [
            { name: 'California', code: 'CA', destinations: 'Disneyland, Golden Gate Bridge, Hollywood, Yosemite National Park' },
            { name: 'Connecticut', code: 'CT', destinations: 'Yale University, Mystic Seaport, Foxwoods Resort' },
            { name: 'Florida', code: 'FL', destinations: 'Walt Disney World, South Beach, Universal Studios, Florida Keys' },
            { name: 'Maryland', code: 'MD', destinations: 'Inner Harbor Baltimore, Annapolis Historic District, Ocean City' },
            { name: 'Michigan', code: 'MI', destinations: 'Mackinac Island, Henry Ford Museum, Detroit Institute of Arts' },
            { name: 'New Jersey', code: 'NJ', destinations: 'Atlantic City, Liberty State Park, Cape May, Jersey Shore' },
            { name: 'New York', code: 'NY', destinations: 'Times Square NYC, Central Park, Statue of Liberty, Niagara Falls' },
            { name: 'North Carolina', code: 'NC', destinations: 'Outer Banks, Biltmore Estate, Great Smoky Mountains' },
            { name: 'Pennsylvania', code: 'PA', destinations: 'Liberty Bell, Gettysburg National Park, Hersheypark' },
            { name: 'Texas', code: 'TX', destinations: 'The Alamo, Space Center Houston, San Antonio River Walk' }
        ];

        db.states = rawStates.map((s, i) => {
            const cleanSlug = s.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            return {
                id: i + 1,
                name: s.name,
                code: s.code,
                slug: `charter-bus-${cleanSlug}`,
                title: `${s.name} Charter Bus Rentals & Group Transportation | United Bus Pro`,
                meta_description: `Rent a charter bus, minibus, or executive shuttle van in ${s.name}. Reliable group transportation for corporate events, tours, and weddings statewide.`,
                header_h1: `Statewide Charter Bus Rentals in ${s.name}`,
                body_content: `United Bus Pro provides executive-class group travel, minibus rentals, and custom shuttle networks across the state of ${s.name}. We support corporate meetings, university shuttle routes, athletic event transfers, and private group excursions with our modern, DOT-compliant fleet. From local daily shuttles to long-distance motorcoach travel, our logistics coordinators make group transportation simple.`,
                popular_destinations: s.destinations
            };
        });
    }
}

// Read DB helper
function readDb() {
    try {
        if (!fs.existsSync(DB_PATH)) {
            fs.writeFileSync(DB_PATH, JSON.stringify(initialDb, null, 2), 'utf8');
        }
        const fileContent = fs.readFileSync(DB_PATH, 'utf8');
        const db = JSON.parse(fileContent);
        
        let updated = false;
        if (!db.users || db.users.length === 0) {
            db.users = [];
            seedData(db);
            updated = true;
        }
        if (!db.pages || db.pages.length === 0) {
            db.pages = [];
            seedData(db);
            updated = true;
        } else {
            const requiredPages = ['careers', 'reviews', 'sustainability'];
            const existingPages = db.pages.map(p => p.slug);
            let pagesAdded = false;
            
            if (!existingPages.includes('careers')) {
                db.pages.push({
                    slug: 'careers',
                    title: 'Careers at United Bus Pro | Group Travel Careers',
                    meta_description: 'Join the United Bus Pro team. View active driver jobs, logistics coordinator openings, and corporate roles in Washington, DC and nationwide.',
                    header_h1: 'Join the United Bus Pro Team',
                    body_content: 'At United Bus Pro, we are building the future of group transit. We are always looking for background-checked, safety-first commercial drivers, logistics managers, and customer coordinators to join our team. We offer competitive salaries, modern training schedules, and comprehensive insurance coverage.'
                });
                pagesAdded = true;
            }
            if (!existingPages.includes('reviews')) {
                db.pages.push({
                    slug: 'reviews',
                    title: 'Client Reviews & Testimonials | United Bus Pro',
                    meta_description: 'Read verified customer testimonials for United Bus Pro. Over 580 reviews detailing our safe, professional charter bus rental services.',
                    header_h1: 'Verified Client Testimonials',
                    body_content: 'Read honest feedback from our corporate clients, wedding planners, event organizers, and school administrators. We hold a 4.9-star average across over 580 charter bus trips.'
                });
                pagesAdded = true;
            }
            if (!existingPages.includes('sustainability')) {
                db.pages.push({
                    slug: 'sustainability',
                    title: 'Corporate Sustainability & Eco-Friendly Travel | United Bus Pro',
                    meta_description: 'Learn about our green initiatives. United Bus Pro operates modern fuel-efficient engines and carbon-neutral transit options for corporate groups.',
                    header_h1: 'Corporate Sustainability Program',
                    body_content: 'United Bus Pro is committed to reducing our environmental footprint. Moving 50+ passengers in a single modern clean diesel coach removes up to 36 single-occupant cars from the highway, reducing traffic congestion and emissions. Our fleet is equipped with modern fuel-injection variables that comply with strict EPA emission standards.'
                });
                pagesAdded = true;
            }
            
            if (pagesAdded) {
                updated = true;
            }
        }
        if (!db.services || db.services.length === 0) {
            db.services = [];
            seedData(db);
            updated = true;
        }
        if (!db.fleet || db.fleet.length === 0) {
            db.fleet = [];
            seedData(db);
            updated = true;
        }
        if (!db.blogs || db.blogs.length === 0) {
            db.blogs = [];
            seedData(db);
            updated = true;
        }
        if (!db.cities || db.cities.length === 0) {
            db.cities = [];
            seedData(db);
            updated = true;
        }
        if (!db.states || db.states.length === 0) {
            db.states = [];
            seedData(db);
            updated = true;
        }
        if (!db.drivers || db.drivers.length === 0) {
            db.drivers = [
                { id: 1, name: "Driver John Smith", license: "CDL-A-9817", status: "Active" },
                { id: 2, name: "Driver Sarah Connor", license: "CDL-B-2938", status: "Active" },
                { id: 3, name: "Driver David Miller", license: "CDL-A-1029", status: "Active" },
                { id: 4, name: "Driver James Wilson", license: "CDL-A-8761", status: "Active" },
                { id: 5, name: "Driver Robert Davis", license: "CDL-B-5412", status: "Active" },
                { id: 6, name: "Driver Emily Taylor", license: "CDL-A-3349", status: "Active" },
                { id: 7, name: "Driver Michael Brown", license: "CDL-A-2109", status: "Active" },
                { id: 8, name: "Driver William Anderson", license: "CDL-B-8971", status: "Active" },
                { id: 9, name: "Driver Linda Jackson", license: "CDL-A-4521", status: "Active" },
                { id: 10, name: "Driver Richard White", license: "CDL-A-7789", status: "Active" }
            ];
            updated = true;
        }
        if (!db.teams || db.teams.length === 0) {
            db.teams = [
                { id: 1, name: "Washington Dispatch Team", region: "DC Metro", supervisor: "Supervisor Thomas" },
                { id: 2, name: "Houston Logistics Unit", region: "Texas", supervisor: "Supervisor Melissa" },
                { id: 3, name: "California Coast Route Team", region: "California", supervisor: "Supervisor Ronald" },
                { id: 4, name: "Northeast Corridor Dispatch", region: "New York", supervisor: "Supervisor Robert" },
                { id: 5, name: "Midwest Operations Group", region: "Illinois", supervisor: "Supervisor Sandra" }
            ];
            updated = true;
        }
        if (!db.customerUsers) {
            db.customerUsers = [];
            updated = true;
        }
        if (!db.settings) {
            db.settings = initialDb.settings;
            updated = true;
        }
        if (updated) {
            writeDb(db);
        }
        return db;
    } catch (e) {
        console.error('Error reading JSON DB:', e);
        return initialDb;
    }
}

// Write DB helper
function writeDb(db) {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
        return true;
    } catch (e) {
        console.error('Error writing JSON DB:', e);
        return false;
    }
}

module.exports = {
    // Users Authentication
    authenticate: (username, password) => {
        const db = readDb();
        const user = db.users.find(u => u.username === username);
        if (user && bcrypt.compareSync(password, user.password)) {
            return { id: user.id, username: user.username };
        }
        return null;
    },
    updateAdminPassword: (username, oldPassword, newPassword) => {
        const db = readDb();
        const userIdx = db.users.findIndex(u => u.username === username);
        if (userIdx > -1 && bcrypt.compareSync(oldPassword, db.users[userIdx].password)) {
            const salt = bcrypt.genSaltSync(10);
            db.users[userIdx].password = bcrypt.hashSync(newPassword, salt);
            writeDb(db);
            return true;
        }
        return false;
    },

    // Settings
    getSettings: () => {
        const db = readDb();
        return db.settings || initialDb.settings;
    },
    updateSettings: (newSettings) => {
        const db = readDb();
        db.settings = { ...db.settings, ...newSettings };
        writeDb(db);
        return db.settings;
    },

    // Pages content
    getPages: () => readDb().pages,
    getPage: (slug) => {
        const db = readDb();
        return db.pages.find(p => p.slug === slug) || null;
    },
    updatePage: (slug, updatedFields) => {
        const db = readDb();
        const idx = db.pages.findIndex(p => p.slug === slug);
        if (idx > -1) {
            db.pages[idx] = { ...db.pages[idx], ...updatedFields };
            writeDb(db);
            return db.pages[idx];
        }
        return null;
    },

    // Services
    getServices: () => {
        const db = readDb();
        return db.services.map(s => {
            let parsedDetails = [];
            try {
                parsedDetails = JSON.parse(s.details);
            } catch (err) {
                parsedDetails = [];
            }
            return { ...s, parsedDetails };
        });
    },
    getService: (slug) => {
        const db = readDb();
        const s = db.services.find(s => s.slug === slug);
        if (s) {
            let parsedDetails = [];
            try {
                parsedDetails = JSON.parse(s.details);
            } catch (err) {
                parsedDetails = [];
            }
            return { ...s, parsedDetails };
        }
        return null;
    },
    updateService: (slug, fields) => {
        const db = readDb();
        const idx = db.services.findIndex(s => s.slug === slug);
        if (idx > -1) {
            db.services[idx] = { ...db.services[idx], ...fields };
            writeDb(db);
            return db.services[idx];
        }
        return null;
    },

    // Fleet
    getFleet: () => {
        const db = readDb();
        return db.fleet.map(f => {
            let parsedAmenities = [];
            try {
                parsedAmenities = JSON.parse(f.amenities);
            } catch (err) {
                parsedAmenities = [];
            }
            return { ...f, parsedAmenities };
        });
    },
    getVehicle: (slug) => {
        const db = readDb();
        const f = db.fleet.find(f => f.slug === slug);
        if (f) {
            let parsedAmenities = [];
            try {
                parsedAmenities = JSON.parse(f.amenities);
            } catch (err) {
                parsedAmenities = [];
            }
            return { ...f, parsedAmenities };
        }
        return null;
    },
    updateVehicle: (slug, fields) => {
        const db = readDb();
        const idx = db.fleet.findIndex(f => f.slug === slug);
        if (idx > -1) {
            db.fleet[idx] = { ...db.fleet[idx], ...fields };
            writeDb(db);
            return db.fleet[idx];
        }
        return null;
    },

    // Inquiries
    getInquiries: () => readDb().inquiries.sort((a, b) => b.id - a.id),
    createInquiry: (inquiryData) => {
        const db = readDb();
        const newId = db.inquiries.length > 0 ? Math.max(...db.inquiries.map(i => i.id)) + 1 : 1;
        const newInquiry = {
            id: newId,
            ...inquiryData,
            status: 'unread',
            created_at: new Date().toISOString()
        };
        db.inquiries.push(newInquiry);
        writeDb(db);
        return newInquiry;
    },
    updateInquiryStatus: (id, status) => {
        const db = readDb();
        const idx = db.inquiries.findIndex(i => i.id === parseInt(id));
        if (idx > -1) {
            db.inquiries[idx].status = status;
            writeDb(db);
            return true;
        }
        return false;
    },
    deleteInquiry: (id) => {
        const db = readDb();
        const lenBefore = db.inquiries.length;
        db.inquiries = db.inquiries.filter(i => i.id !== parseInt(id));
        writeDb(db);
        return db.inquiries.length < lenBefore;
    },

    // Blogs
    getBlogs: () => readDb().blogs.sort((a, b) => b.id - a.id),
    getBlog: (slug) => readDb().blogs.find(b => b.slug === slug) || null,
    createBlog: (blogData) => {
        const db = readDb();
        const newId = db.blogs.length > 0 ? Math.max(...db.blogs.map(b => b.id)) + 1 : 1;
        const newBlog = {
            id: newId,
            ...blogData,
            publish_date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            created_at: new Date().toISOString()
        };
        db.blogs.push(newBlog);
        writeDb(db);
        return newBlog;
    },
    deleteBlog: (slug) => {
        const db = readDb();
        const lenBefore = db.blogs.length;
        db.blogs = db.blogs.filter(b => b.slug !== slug);
        writeDb(db);
        return db.blogs.length < lenBefore;
    },

    // Cities CRUD
    getCities: () => readDb().cities.sort((a, b) => a.id - b.id),
    getCity: (slug) => readDb().cities.find(c => c.slug === slug) || null,
    createCity: (cityData) => {
        const db = readDb();
        const newId = db.cities.length > 0 ? Math.max(...db.cities.map(c => c.id)) + 1 : 1;
        const newCity = {
            id: newId,
            ...cityData
        };
        db.cities.push(newCity);
        writeDb(db);
        return newCity;
    },
    updateCity: (slug, fields) => {
        const db = readDb();
        const idx = db.cities.findIndex(c => c.slug === slug);
        if (idx > -1) {
            db.cities[idx] = { ...db.cities[idx], ...fields };
            writeDb(db);
            return db.cities[idx];
        }
        return null;
    },
    deleteCity: (slug) => {
        const db = readDb();
        const lenBefore = db.cities.length;
        db.cities = db.cities.filter(c => c.slug !== slug);
        writeDb(db);
        return db.cities.length < lenBefore;
    },

    // States CRUD
    getStates: () => readDb().states.sort((a, b) => a.id - b.id),
    getState: (slug) => readDb().states.find(s => s.slug === slug) || null,
    createState: (stateData) => {
        const db = readDb();
        const newId = db.states.length > 0 ? Math.max(...db.states.map(s => s.id)) + 1 : 1;
        const newState = {
            id: newId,
            ...stateData
        };
        db.states.push(newState);
        writeDb(db);
        return newState;
    },
    updateState: (slug, fields) => {
        const db = readDb();
        const idx = db.states.findIndex(s => s.slug === slug);
        if (idx > -1) {
            db.states[idx] = { ...db.states[idx], ...fields };
            writeDb(db);
            return db.states[idx];
        }
        return null;
    },
    deleteState: (slug) => {
        const db = readDb();
        const lenBefore = db.states.length;
        db.states = db.states.filter(s => s.slug !== slug);
        writeDb(db);
        return db.states.length < lenBefore;
    },

    // Drivers & Teams CRUD
    getDrivers: () => readDb().drivers || [],
    getTeams: () => readDb().teams || [],
    assignInquiry: (id, driver, team) => {
        const db = readDb();
        const idx = db.inquiries.findIndex(i => i.id === parseInt(id));
        if (idx > -1) {
            db.inquiries[idx].assigned_driver = driver;
            db.inquiries[idx].assigned_team = team;
            db.inquiries[idx].status = 'assigned';
            writeDb(db);
            return db.inquiries[idx];
        }
        return null;
    },

    // Customers CRUD & Plans Signup
    signupCustomer: (username, password, plan) => {
        const db = readDb();
        if (!db.customerUsers) db.customerUsers = [];
        const exists = db.customerUsers.find(cu => cu.username === username);
        if (exists) return null;
        
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);
        const newId = db.customerUsers.length > 0 ? Math.max(...db.customerUsers.map(cu => cu.id)) + 1 : 1;
        const newCustomer = {
            id: newId,
            username,
            password: hashedPassword,
            plan: plan || 'Starter Plan',
            created_at: new Date().toISOString()
        };
        db.customerUsers.push(newCustomer);
        writeDb(db);
        return newCustomer;
    },
    authenticateCustomer: (username, password) => {
        const db = readDb();
        if (!db.customerUsers) return null;
        const customer = db.customerUsers.find(cu => cu.username === username);
        if (customer && bcrypt.compareSync(password, customer.password)) {
            return { id: customer.id, username: customer.username, plan: customer.plan };
        }
        return null;
    },
    getCustomerUsers: () => readDb().customerUsers || []
};
