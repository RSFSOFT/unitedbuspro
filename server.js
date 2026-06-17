const express = require('express');
const session = require('express-session');
const compression = require('compression');
const path = require('path');
const nodemailer = require('nodemailer');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable GZIP compression (Critical for PageSpeed optimization)
app.use(compression());

// Parse incoming request payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup Session Middleware
app.use(session({
    secret: 'united_bus_pro_secret_session_key_2026',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Configure Templating Engine EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve Static Assets with cache headers
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '30d',
    setHeaders: (res, path) => {
        if (path.endsWith('.html') || path.endsWith('.xml') || path.endsWith('.txt')) {
            res.setHeader('Cache-Control', 'public, max-age=0');
        } else {
            res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30 days
        }
    }
}));

// Create Mock WebP Assets if not present to avoid 404 errors during testing
const fs = require('fs');
const imageDir = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
}
const mockImages = [
    'hero-home.webp', 'hero-about.webp', 'hero-contact.webp', 'hero-thank-you.webp', 
    'fleet-coach.webp', 'fleet-minibus.webp', 'fleet-standard-minibus.webp', 'fleet-sprinter.webp', 'fleet-school-bus.webp',
    'blog-guide.webp', 'blog-corporate.webp', 'logo.png', 'hero-bg.webp', 'cta-bg.webp'
];
mockImages.forEach(img => {
    const imgPath = path.join(imageDir, img);
    if (!fs.existsSync(imgPath)) {
        if (img.endsWith('.png')) {
            // Write a tiny transparent png
            const transparentPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
            fs.writeFileSync(imgPath, transparentPng);
        } else {
            // Write a tiny webp
            const transparentWebp = Buffer.from('UklGRiQAAABXRUJQVlA4TBAAAAAvAAAAAEYQkQAAPwAAAAAA', 'base64');
            fs.writeFileSync(imgPath, transparentWebp);
        }
    }
});

// Middleware: Expose global contact info, services, fleet, locations, and settings to all templates
app.use((req, res, next) => {
    const settings = db.getSettings();
    res.locals.settings = settings;
    res.locals.canonicalUrl = `${req.protocol}://${req.get('host')}${req.path}`;
    res.locals.services = db.getServices();
    res.locals.fleet = db.getFleet();
    res.locals.blogs = db.getBlogs();
    res.locals.cities = db.getCities();
    res.locals.states = db.getStates();
    next();
});

// Authentication Guard Helper
function requireAuth(req, res, next) {
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect('/admin/login');
    }
}

// ==========================================
// TECHNICAL SEO ROUTING
// ==========================================

// robots.txt Route
app.get('/robots.txt', (req, res) => {
    const host = `${req.protocol}://${req.get('host')}`;
    res.type('text/plain');
    res.send(`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: ${host}/sitemap.xml
`);
});

// llm.txt Route (LLM Crawler Instructions)
app.get('/llm.txt', (req, res) => {
    res.type('text/plain');
    res.send(`Title: United Bus Pro
Description: Premium charter bus rentals, corporate shuttles, minibus hires, and group ground transportation services across Dallas-Fort Worth, Texas, and nationwide.
Owner: United Bus Pro Operations Team
Established: 2014
Contact Phone: +1 (800) 495-8017
Services: Charter Bus Rental, Corporate Shuttle Service, Minibus Hires, Wedding Guest Shuttles, School Field Trips, Event Transportation.
`);
});

// sitemap.xml Route
app.get('/sitemap.xml', (req, res) => {
    const host = `${req.protocol}://${req.get('host')}`;
    const services = db.getServices();
    const fleet = db.getFleet();
    const blogs = db.getBlogs();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Static Pages
    const staticPages = ['', 'about', 'contact', 'blog', 'fleet', 'reservation', 'privacy-policy', 'terms-conditions', 'careers', 'reviews', 'sustainability'];
    staticPages.forEach(p => {
        xml += `
  <url>
    <loc>${host}/${p}</loc>
    <priority>${p === '' ? '1.0' : '0.8'}</priority>
    <changefreq>weekly</changefreq>
  </url>`;
    });

    // Dynamic Services
    services.forEach(s => {
        xml += `
  <url>
    <loc>${host}/services/${s.slug}</loc>
    <priority>0.8</priority>
    <changefreq>monthly</changefreq>
  </url>`;
    });

    // Dynamic Fleet
    fleet.forEach(f => {
        xml += `
  <url>
    <loc>${host}/fleet/${f.slug}</loc>
    <priority>0.7</priority>
    <changefreq>monthly</changefreq>
  </url>`;
    });

    // Dynamic Blogs
    blogs.forEach(b => {
        xml += `
  <url>
    <loc>${host}/blog/${b.slug}</loc>
    <priority>0.6</priority>
    <changefreq>monthly</changefreq>
  </url>`;
    });

    // Dynamic Cities
    const cities = db.getCities();
    cities.forEach(c => {
        xml += `
  <url>
    <loc>${host}/locations/${c.slug}</loc>
    <priority>0.8</priority>
    <changefreq>monthly</changefreq>
  </url>`;
    });

    // Dynamic States
    const states = db.getStates();
    states.forEach(s => {
        xml += `
  <url>
    <loc>${host}/locations/states/${s.slug}</loc>
    <priority>0.8</priority>
    <changefreq>monthly</changefreq>
  </url>`;
    });

    xml += `\n</urlset>`;
    res.header('Content-Type', 'application/xml');
    res.status(200).send(xml);
});

// ==========================================
// CORE PAGES ROUTING
// ==========================================

// Homepage
app.get('/', (req, res) => {
    const homeCopy = db.getPage('home');
    const services = db.getServices();
    const fleet = db.getFleet();

    const schema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": ["LocalBusiness", "BusReservationService"],
                "@id": "https://unitedbuspro.com/#organization",
                "name": "United Bus Pro",
                "url": "https://unitedbuspro.com/",
                "telephone": res.locals.settings.phone || "+1 (800) 495-8017",
                "email": res.locals.settings.email || "reservations@unitedbuspro.com",
                "priceRange": "$$$",
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Dallas",
                    "addressRegion": "TX",
                    "addressCountry": "US"
                },
                "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "4.9",
                    "reviewCount": "580"
                }
            },
            {
                "@type": "WebSite",
                "@id": "https://unitedbuspro.com/#website",
                "url": "https://unitedbuspro.com/",
                "name": "United Bus Pro",
                "description": "Premium Charter Bus & Shuttle Service in Dallas-Fort Worth, Texas.",
                "publisher": {
                    "@id": "https://unitedbuspro.com/#organization"
                }
            }
        ]
    };

    res.render('index', {
        title: homeCopy.title,
        meta_description: homeCopy.meta_description,
        header_h1: homeCopy.header_h1,
        body_content: homeCopy.body_content,
        services,
        fleet,
        schema_json: schema
    });
});

// Fleet Page
app.get('/fleet', (req, res) => {
    const fleetList = db.getFleet();
    res.render('fleet', {
        title: 'Our Charter Bus & Minibus Fleet | United Bus Pro',
        meta_description: 'Explore the United Bus Pro group transport fleet. Compare passenger capacity, luggage space, and on-board amenities for our motorcoaches and shuttles.',
        fleetList,
        schema_json: {
            "@context": "https://schema.org",
            "@type": "ProductCollection",
            "name": "United Bus Pro Charter Fleet",
            "description": "Premium group travel vehicles including full-sized charter buses, minibuses, and executive Sprinters."
        }
    });
});

// Individual Fleet Detail Page
app.get('/fleet/:slug', (req, res) => {
    const vehicle = db.getVehicle(req.params.slug);
    if (!vehicle) return res.status(404).render('404', { title: 'Vehicle Not Found | United Bus Pro', meta_description: 'Vehicle not found' });

    res.render('vehicle-view', {
        title: `${vehicle.name} Rental | United Bus Pro`,
        meta_description: vehicle.description.substring(0, 150) + '...',
        vehicle,
        schema_json: {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": vehicle.name,
            "description": vehicle.description,
            "offers": {
                "@type": "Offer",
                "priceCurrency": "USD",
                "price": vehicle.starting_rate.replace(/[^0-9]/g, '') || "150.00",
                "availability": "https://schema.org/InStock"
            }
        }
    });
});

// Reservation Page
app.get('/reservation', (req, res) => {
    res.render('reservation', {
        title: 'Book Group Transportation Dallas | Online Reservation Desk',
        meta_description: 'Request a charter bus, corporate shuttle, or private event bus rental online. Our coordinators provide custom quotes in under 2 hours.',
        schema_json: {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Reservation Portal",
            "url": "https://unitedbuspro.com/reservation/",
            "description": "Request a charter bus, corporate shuttle, or private event bus rental online."
        }
    });
});

// About Us Page
app.get('/about', (req, res) => {
    const page = db.getPage('about');
    res.render('service', {
        title: page.title,
        meta_description: page.meta_description,
        service: {
            name: 'About United Bus Pro',
            capacity: '12 Years of Excellence',
            description: page.body_content,
            price: 'Quality Transportation',
            parsedDetails: [
                'State-of-the-art commercial charter coaches and minibuses',
                'Comprehensive DOT certification and commercial insurance coverage',
                'Pre-trip vehicle diagnostics and rigorous sanitation checks',
                '24/7 client dispatch and dedicated logistics planners'
            ]
        },
        schema_json: null
    });
});

// Contact Page
app.get('/contact', (req, res) => {
    const page = db.getPage('contact');
    res.render('service', {
        title: page.title,
        meta_description: page.meta_description,
        service: {
            name: 'Contact & Booking Desk',
            capacity: 'Open 24/7/365',
            description: page.body_content,
            price: 'Instant Quotations',
            parsedDetails: [
                'Call +1 (800) 495-8017 for urgent dispatch and reservation adjustments',
                'Online booking requests processed with instant SQLite database backup',
                'Highly scalable options for major sports events, conventions, and festivals',
                'Flat-rate group quotes with absolutely zero hidden surcharges'
            ]
        },
        schema_json: null
    });
});

// Careers Page
app.get('/careers', (req, res) => {
    const page = db.getPage('careers');
    res.render('service', {
        title: page.title,
        meta_description: page.meta_description,
        service: {
            name: page.header_h1,
            capacity: 'Active Recruitment 2026',
            description: page.body_content,
            price: 'Competitive Compensation',
            parsedDetails: [
                'Full-time commercial drivers (Class A/B CDL required)',
                'Logistics and dispatch specialists (Dallas operations)',
                'Premium healthcare benefits and 401(k) retirement options',
                'Modern, safety-vetted charter buses and minibuses',
                'Continual training schedules and advancement pathways'
            ]
        },
        schema_json: null
    });
});

// Reviews Page
app.get('/reviews', (req, res) => {
    const page = db.getPage('reviews');
    res.render('service', {
        title: page.title,
        meta_description: page.meta_description,
        service: {
            name: page.header_h1,
            capacity: '580+ Verified Customers',
            description: page.body_content,
            price: '4.9/5.0 Overall Rating',
            parsedDetails: [
                'Sarah M.: "Early driver, extremely professional, motorcoach clean and quiet." (5 Stars)',
                'Jason K.: "Wedding guest shuttles managed hotel routes seamlessly. Amazing coordination!" (5 Stars)',
                'Principal Henderson: "Background-checked drivers, GPS tracking make them preferred choice." (5 Stars)',
                'Mark D.: "Best shuttle service we\'ve used for our Plano corporate office." (5 Stars)',
                'Angela B.: "Fast online quote process, driver very courteous, beautiful minibus." (5 Stars)'
            ]
        },
        schema_json: null
    });
});

// Sustainability Page
app.get('/sustainability', (req, res) => {
    const page = db.getPage('sustainability');
    res.render('service', {
        title: page.title,
        meta_description: page.meta_description,
        service: {
            name: page.header_h1,
            capacity: 'Eco-Friendly Travel Solutions',
            description: page.body_content,
            price: 'Carbon Reduction Initiatives',
            parsedDetails: [
                'Modern EPA-compliant clean diesel motorcoach fleets',
                'Up to 36 single-occupant passenger cars removed per bus trip',
                'Route optimization software to reduce idle times and fuel waste',
                'Transitioning to hybrid and low-emission sprinter shuttles',
                'Active carbon-offset program integration for corporate bookings'
            ]
        },
        schema_json: null
    });
});

// Thank You Page
app.get('/thank-you', (req, res) => {
    const page = db.getPage('thank-you');
    res.render('thank-you', {
        title: page.title,
        meta_description: page.meta_description,
        header_h1: page.header_h1,
        body_content: page.body_content
    });
});

// Services Detail Page Routing
app.get('/services/:slug', (req, res) => {
    const service = db.getService(req.params.slug);
    if (!service) return res.status(404).render('404', { title: 'Service Not Found | United Bus Pro', meta_description: 'Page not found' });

    res.render('service', {
        title: `${service.name} | United Bus Pro`,
        meta_description: service.description.substring(0, 150) + '...',
        service,
        schema_json: {
            "@context": "https://schema.org",
            "@type": "Service",
            "name": service.name,
            "description": service.description,
            "provider": {
                "@type": "LocalBusiness",
                "name": "United Bus Pro"
            }
        }
    });
});

// Individual City Landing Page Routing
app.get('/locations/:slug', (req, res) => {
    const location = db.getCity(req.params.slug);
    if (!location) return res.status(404).render('404', { title: 'Location Not Found | United Bus Pro', meta_description: 'Location not found' });

    res.render('location-view', {
        title: location.title,
        meta_description: location.meta_description,
        location,
        schema_json: {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": location.name,
            "description": location.meta_description,
            "provider": {
                "@type": "LocalBusiness",
                "name": "United Bus Pro"
            }
        }
    });
});

// Individual State Landing Page Routing
app.get('/locations/states/:slug', (req, res) => {
    const state = db.getState(req.params.slug);
    if (!state) return res.status(404).render('404', { title: 'State Not Found | United Bus Pro', meta_description: 'State not found' });

    // Find cities served within this state
    const citiesInState = db.getCities().filter(c => c.stateName === state.name);

    res.render('state-view', {
        title: state.title,
        meta_description: state.meta_description,
        state,
        citiesInState,
        schema_json: {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": state.name,
            "description": state.meta_description,
            "provider": {
                "@type": "LocalBusiness",
                "name": "United Bus Pro"
            }
        }
    });
});

// Blog List
app.get('/blog', (req, res) => {
    const blogs = db.getBlogs();
    res.render('blog-list', {
        title: 'Group Travel Guides & Charter Bus Blogs | United Bus Pro',
        meta_description: 'Read professional recommendations on chartering buses, planning corporate events, and organizing group transportation.',
        blogs
    });
});

// Blog Detail
app.get('/blog/:slug', (req, res) => {
    const blog = db.getBlog(req.params.slug);
    if (!blog) return res.status(404).render('404', { title: 'Blog Post Not Found | United Bus Pro', meta_description: 'Blog not found' });

    const related = db.getBlogs().filter(b => b.slug !== blog.slug).slice(0, 3);
    res.render('blog-view', {
        title: `${blog.title} | United Bus Pro Blog`,
        meta_description: blog.content.substring(0, 150) + '...',
        blog,
        relatedBlogs: related
    });
});

// Legal templates
app.get('/privacy-policy', (req, res) => {
    res.render('service', {
        title: 'Privacy Policy | United Bus Pro',
        meta_description: 'Read our customer privacy policies regarding travel bookings and passenger data.',
        service: {
            name: 'Privacy Policy',
            capacity: 'Data Protection Compliant',
            description: 'We prioritize client privacy. All personal booking records, addresses, itineraries, and payment logs are securely hosted and are never shared with third parties.',
            price: 'Security assurance',
            parsedDetails: [
                'Fully encrypted communications on all request forms',
                'Session variables cleared and protected via secure cookies',
                'Compliant with data regulation guidelines and standards',
                'Simple opt-out capability for analytical tags and cookies'
            ]
        },
        schema_json: null
    });
});

app.get('/terms-conditions', (req, res) => {
    res.render('service', {
        title: 'Terms & Conditions | United Bus Pro',
        meta_description: 'Read the terms and conditions for booking charter coach and minibus rentals.',
        service: {
            name: 'Terms & Conditions',
            capacity: 'Standard Charter Agreement',
            description: 'Please review our charter terms. Confirmations require a deposit, and cancellation timelines vary by trip distance and vehicle type.',
            price: 'Booking Agreement',
            parsedDetails: [
                'Cancellations made 14 days or more prior to departure receive deposit back',
                'Overtime charters charged dynamically at scheduled hourly rates',
                'Clients are responsible for driver lodging on multi-day itineraries',
                'United Bus Pro reserves the right to substitute vehicles for scheduling safety'
            ]
        },
        schema_json: null
    });
});


// ==========================================
// AJAX BOOKING API
// ==========================================
app.post('/api/book', (req, res) => {
    const { name, phone, email, service_type, pickup_loc, dropoff_loc, trip_date, passengers, message } = req.body;

    if (!name || !phone || !email || !pickup_loc || !dropoff_loc || !trip_date || !passengers) {
        return res.status(400).json({ success: false, message: 'All required booking details must be filled.' });
    }

    const inquiry = db.createInquiry({ name, phone, email, service_type, pickup_loc, dropoff_loc, trip_date, passengers, message });

    // SMTP Mailer Notification
    const settings = db.getSettings();
    if (settings.smtp_host && settings.smtp_port && settings.smtp_user && settings.smtp_pass) {
        const transporter = nodemailer.createTransport({
            host: settings.smtp_host,
            port: parseInt(settings.smtp_port),
            secure: parseInt(settings.smtp_port) === 465,
            auth: {
                user: settings.smtp_user,
                pass: settings.smtp_pass
            }
        });

        const htmlToOwner = `
            <h2>New Charter Booking Request</h2>
            <table border="1" cellpadding="8" style="border-collapse: collapse;">
                <tr><td><strong>Client Name</strong></td><td>${name}</td></tr>
                <tr><td><strong>Phone</strong></td><td>${phone}</td></tr>
                <tr><td><strong>Email</strong></td><td>${email}</td></tr>
                <tr><td><strong>Service Category</strong></td><td>${service_type || 'General Charter'}</td></tr>
                <tr><td><strong>Pickup Location</strong></td><td>${pickup_loc}</td></tr>
                <tr><td><strong>Drop-off Location</strong></td><td>${dropoff_loc}</td></tr>
                <tr><td><strong>Trip Date</strong></td><td>${trip_date}</td></tr>
                <tr><td><strong>Passengers</strong></td><td>${passengers}</td></tr>
                <tr><td><strong>Itinerary details</strong></td><td>${message || '-'}</td></tr>
            </table>
        `;

        const htmlToClient = `
            <h2>Quote Request Received - United Bus Pro</h2>
            <p>Dear ${name},</p>
            <p>Thank you for requesting a charter quote with United Bus Pro. Our logistics team is checking local coach availability and calculating rates for your itinerary.</p>
            <h3>Requested Itinerary:</h3>
            <ul>
                <li><strong>Pickup:</strong> ${pickup_loc}</li>
                <li><strong>Destination:</strong> ${dropoff_loc}</li>
                <li><strong>Date of Service:</strong> ${trip_date}</li>
                <li><strong>Passengers:</strong> ${passengers}</li>
            </ul>
            <p>If you have any questions or require immediate support, please contact our dispatch team at +1 (800) 495-8017.</p>
        `;

        try {
            transporter.sendMail({
                from: settings.smtp_from || settings.smtp_user,
                to: settings.smtp_to || settings.email,
                subject: `New Lead: ${name} - ${passengers} Pax`,
                html: htmlToOwner
            });

            transporter.sendMail({
                from: settings.smtp_from || settings.smtp_user,
                to: email,
                subject: `We Have Received Your Quote Request - United Bus Pro`,
                html: htmlToClient
            });
        } catch (mailErr) {
            console.error('SMTP Mail notification failure:', mailErr);
        }
    }

    res.status(200).json({ success: true, inquiry });
});

// ==========================================
// CUSTOMER PORTAL PAGES
// ==========================================
app.get('/customer/portal', (req, res) => {
    if (req.session && req.session.customer) {
        const customer = req.session.customer;
        // Fetch inquiries belonging to this customer
        const inquiries = db.getInquiries().filter(inq => inq.email === customer.username);
        res.render('customer-portal', {
            title: 'Customer Portal | United Bus Pro',
            meta_description: 'Manage your corporate shuttle packages, view your scheduled trips, and check driver assignments.',
            customer,
            inquiries,
            error: null,
            success: null
        });
    } else {
        res.redirect('/customer/login');
    }
});

app.get('/customer/login', (req, res) => {
    if (req.session && req.session.customer) {
        return res.redirect('/customer/portal');
    }
    res.render('customer-portal', {
        title: 'Customer Login & Packages | United Bus Pro',
        meta_description: 'Sign in to manage your group transportation plans and view driver coordinates.',
        customer: null,
        inquiries: [],
        error: req.query.error || null,
        success: req.query.success || null
    });
});

app.get('/customer/logout', (req, res) => {
    if (req.session) {
        req.session.customer = null;
    }
    res.redirect('/customer/login?success=logged_out');
});

// Customer Signup API
app.post('/api/customer/signup', (req, res) => {
    const { username, password, plan } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }
    const customer = db.signupCustomer(username, password, plan);
    if (customer) {
        res.status(200).json({ success: true, customer: { id: customer.id, username: customer.username, plan: customer.plan } });
    } else {
        res.status(400).json({ success: false, message: 'Username already registered.' });
    }
});

// Customer Login API
app.post('/api/customer/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }
    const customer = db.authenticateCustomer(username, password);
    if (customer) {
        req.session.customer = customer;
        res.status(200).json({ success: true, customer });
    } else {
        res.status(400).json({ success: false, message: 'Invalid customer credentials.' });
    }
});

// Admin Assignment API
app.post('/api/admin/assign', (req, res) => {
    const { inquiry_id, driver_name, team_name } = req.body;
    if (!inquiry_id || !driver_name || !team_name) {
        return res.status(400).json({ success: false, message: 'Inquiry ID, driver name, and team name are required.' });
    }
    const inquiry = db.assignInquiry(inquiry_id, driver_name, team_name);
    if (inquiry) {
        res.status(200).json({ success: true, inquiry });
    } else {
        res.status(400).json({ success: false, message: 'Inquiry not found.' });
    }
});

// ==========================================
// ADMIN DASHBOARD / CMS PORTAL
// ==========================================

// Login Portal
app.get('/admin/login', (req, res) => {
    res.render('admin/login', { error: null });
});

app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.authenticate(username, password);
    if (user) {
        req.session.user = user;
        res.redirect('/admin/dashboard');
    } else {
        res.render('admin/login', { error: 'Invalid username or password credentials.' });
    }
});

// Logout
app.get('/admin/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});

// Dashboard Overview
app.get('/admin/dashboard', requireAuth, (req, res) => {
    const inquiries = db.getInquiries();
    const pages = db.getPages();
    const services = db.getServices();
    const fleet = db.getFleet();
    const blogs = db.getBlogs();
    const cities = db.getCities();
    const states = db.getStates();

    // Chart analytics (seeded or actual)
    const dayLabels = [];
    const visualCounts = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dayLabels.push(label);
        
        const dateString = d.toDateString();
        const count = inquiries.filter(inq => {
            const inqDate = new Date(inq.created_at || Date.now());
            return inqDate.toDateString() === dateString;
        }).length;
        visualCounts.push(count);
    }

    let finalCounts = [...visualCounts];
    let isDemoData = false;
    if (inquiries.length === 0) {
        finalCounts = [2, 4, 1, 6, 5, 8, 3];
        isDemoData = true;
    }

    const drivers = db.getDrivers();
    const teams = db.getTeams();
    const customerUsers = db.getCustomerUsers();

    res.render('admin/dashboard', {
        user: req.session.user,
        inquiries,
        pages,
        services,
        fleet,
        blogs,
        cities,
        states,
        drivers,
        teams,
        customerUsers,
        dayLabels,
        visualCounts: finalCounts,
        isDemoData,
        success: req.query.success || null,
        err: req.query.err || null
    });
});

// Mark inquiry Read
app.get('/admin/inquiry/read/:id', requireAuth, (req, res) => {
    db.updateInquiryStatus(req.params.id, 'read');
    res.redirect('/admin/dashboard?success=inquiry_marked_read');
});

// Assign inquiry to Driver and Team
app.post('/admin/inquiry/assign/:id', requireAuth, (req, res) => {
    const { driver_name, team_name } = req.body;
    db.assignInquiry(req.params.id, driver_name, team_name);
    res.redirect('/admin/dashboard?success=booking_assigned_successfully');
});

// Delete inquiry
app.get('/admin/inquiry/delete/:id', requireAuth, (req, res) => {
    db.deleteInquiry(req.params.id);
    res.redirect('/admin/dashboard?success=inquiry_deleted');
});

// Edit Standard Page Copy
app.get('/admin/page/edit/:slug', requireAuth, (req, res) => {
    const page = db.getPage(req.params.slug);
    if (!page) return res.redirect('/admin/dashboard');

    res.render('admin/page-edit', {
        user: req.session.user,
        type: 'page',
        slug: req.params.slug,
        item: {
            title: page.title,
            meta_description: page.meta_description,
            header_h1: page.header_h1,
            body_content: page.body_content
        },
        actionUrl: `/admin/page/edit/${req.params.slug}`,
        success: req.query.success === '1'
    });
});

app.post('/admin/page/edit/:slug', requireAuth, (req, res) => {
    const { title, meta_description, header_h1, body_content } = req.body;
    db.updatePage(req.params.slug, { title, meta_description, header_h1, body_content });
    res.redirect(`/admin/page/edit/${req.params.slug}?success=1`);
});

// Edit Service Details
app.get('/admin/service/edit/:slug', requireAuth, (req, res) => {
    const service = db.getService(req.params.slug);
    if (!service) return res.redirect('/admin/dashboard');

    res.render('admin/page-edit', {
        user: req.session.user,
        type: 'service',
        slug: req.params.slug,
        item: {
            title: `${service.name} | United Bus Pro`,
            meta_description: service.description,
            name: service.name,
            capacity: service.capacity,
            price: service.price,
            body_content: service.description,
            details: service.parsedDetails
        },
        actionUrl: `/admin/service/edit/${req.params.slug}`,
        success: req.query.success === '1'
    });
});

app.post('/admin/service/edit/:slug', requireAuth, (req, res) => {
    const { name, capacity, price, body_content, details } = req.body;
    
    let parsedDetails = [];
    if (details) {
        if (Array.isArray(details)) {
            parsedDetails = details.filter(Boolean);
        } else {
            parsedDetails = details.split('\n').map(d => d.trim()).filter(Boolean);
        }
    }

    db.updateService(req.params.slug, {
        name,
        capacity,
        price,
        description: body_content,
        details: JSON.stringify(parsedDetails)
    });

    res.redirect(`/admin/service/edit/${req.params.slug}?success=1`);
});

// Edit Vehicle Specs
app.get('/admin/fleet/edit/:slug', requireAuth, (req, res) => {
    const vehicle = db.getVehicle(req.params.slug);
    if (!vehicle) return res.redirect('/admin/dashboard');

    res.render('admin/page-edit', {
        user: req.session.user,
        type: 'fleet',
        slug: req.params.slug,
        item: {
            title: `${vehicle.name} Rental | United Bus Pro`,
            meta_description: vehicle.description,
            name: vehicle.name,
            capacity: vehicle.capacity,
            bags: vehicle.bags,
            price: vehicle.starting_rate,
            body_content: vehicle.description,
            details: vehicle.parsedAmenities
        },
        actionUrl: `/admin/fleet/edit/${req.params.slug}`,
        success: req.query.success === '1'
    });
});

app.post('/admin/fleet/edit/:slug', requireAuth, (req, res) => {
    const { name, capacity, bags, price, body_content, details } = req.body;

    let parsedAmenities = [];
    if (details) {
        if (Array.isArray(details)) {
            parsedAmenities = details.filter(Boolean);
        } else {
            parsedAmenities = details.split('\n').map(d => d.trim()).filter(Boolean);
        }
    }

    db.updateVehicle(req.params.slug, {
        name,
        capacity,
        bags,
        starting_rate: price,
        description: body_content,
        amenities: JSON.stringify(parsedAmenities)
    });

    res.redirect(`/admin/fleet/edit/${req.params.slug}?success=1`);
});

// Edit City Details
app.get('/admin/city/edit/:slug', requireAuth, (req, res) => {
    const city = db.getCity(req.params.slug);
    if (!city) return res.redirect('/admin/dashboard');

    res.render('admin/page-edit', {
        user: req.session.user,
        type: 'city',
        slug: req.params.slug,
        item: {
            title: city.title,
            meta_description: city.meta_description,
            name: city.name,
            header_h1: city.header_h1,
            body_content: city.body_content,
            airport_code: city.airport_code,
            popular_destinations: city.popular_destinations
        },
        actionUrl: `/admin/city/edit/${req.params.slug}`,
        success: req.query.success === '1'
    });
});

app.post('/admin/city/edit/:slug', requireAuth, (req, res) => {
    const { name, title, meta_description, header_h1, body_content, airport_code, popular_destinations } = req.body;
    
    db.updateCity(req.params.slug, {
        name,
        title,
        meta_description,
        header_h1,
        body_content,
        airport_code,
        popular_destinations
    });

    res.redirect(`/admin/city/edit/${req.params.slug}?success=1`);
});

// Edit State Details
app.get('/admin/state/edit/:slug', requireAuth, (req, res) => {
    const state = db.getState(req.params.slug);
    if (!state) return res.redirect('/admin/dashboard');

    res.render('admin/page-edit', {
        user: req.session.user,
        type: 'state',
        slug: req.params.slug,
        item: {
            title: state.title,
            meta_description: state.meta_description,
            name: state.name,
            header_h1: state.header_h1,
            body_content: state.body_content,
            popular_destinations: state.popular_destinations
        },
        actionUrl: `/admin/state/edit/${req.params.slug}`,
        success: req.query.success === '1'
    });
});

app.post('/admin/state/edit/:slug', requireAuth, (req, res) => {
    const { name, title, meta_description, header_h1, body_content, popular_destinations } = req.body;
    
    db.updateState(req.params.slug, {
        name,
        title,
        meta_description,
        header_h1,
        body_content,
        popular_destinations
    });

    res.redirect(`/admin/state/edit/${req.params.slug}?success=1`);
});

// Update System Settings
app.post('/admin/settings/edit', requireAuth, (req, res) => {
    const { phone, email, address, smtp_host, smtp_port, smtp_user, smtp_pass, smtp_from, smtp_to } = req.body;
    db.updateSettings({
        phone, email, address, smtp_host, smtp_port, smtp_user, smtp_pass, smtp_from, smtp_to
    });
    res.redirect('/admin/dashboard?success=settings_updated');
});

// Add Travel Blog
app.post('/admin/blog/add', requireAuth, (req, res) => {
    const { title, content, category, tags } = req.body;
    if (!title || !content) {
        return res.redirect('/admin/dashboard?err=missing_blog_fields');
    }
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    db.createBlog({
        title,
        content,
        category: category || 'Travel Guide',
        tags: tags || '',
        slug,
        image: '/images/blog-guide.webp',
        author: 'United Bus Pro Team'
    });
    res.redirect('/admin/dashboard?success=blog_added');
});

// Delete Travel Blog
app.post('/admin/blog/delete/:slug', requireAuth, (req, res) => {
    db.deleteBlog(req.params.slug);
    res.redirect('/admin/dashboard?success=blog_deleted');
});

// Handle 404 Route
app.use((req, res) => {
    res.status(404).render('404', { title: 'Page Not Found | United Bus Pro', meta_description: 'Page not found' });
});

// Run Dev Server locally
if (!process.env.NETLIFY && require.main === module) {
    app.listen(PORT, () => {
        console.log(`United Bus Pro Server is live at: http://localhost:${PORT}`);
    });
}

// Export Express App for Netlify Serverless handler wrapping
module.exports = app;
