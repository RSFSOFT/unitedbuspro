// ==========================================
// END-TO-END BUSINESS SIMULATION RUNNER
// ==========================================

const db = require('../database');

console.log("==========================================");
console.log("STARTING UNITED BUS PRO LOGISTICS SIMULATION");
console.log("==========================================");

// 1. Mock Names Generator
const firstNames = ["John", "Mary", "Robert", "Patricia", "Michael", "Jennifer", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Garcia", "Rodriguez", "Wilson", "Martinez", "Anderson", "Taylor", "Thomas", "Hernandez", "Moore", "Martin", "Jackson", "Thompson", "White"];
const addresses = [
    "Kay Bailey Hutchison Convention Center, Dallas, TX",
    "AT&T Stadium, Arlington, TX",
    "Toyota Stadium, Frisco, TX",
    "Sundance Square, Fort Worth, TX",
    "JFK Airport, Terminal 4, New York, NY",
    "Times Square Marriott Marquis, New York, NY",
    "Space Center Houston, Houston, TX",
    "McCormick Place, Chicago, IL",
    "LA Convention Center, Los Angeles, CA",
    "Walt Disney World Resort, Orlando, FL",
    "National Mall, Washington, DC",
    "Fenway Park, Boston, MA",
    "Legacy West, Plano, TX",
    "Old Town Alexandria, VA",
    "LSU Tiger Stadium, Baton Rouge, LA"
];
const plans = [
    "Starter Plan"
];

// Helper to get random item
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
// Helper to get random number
const randomRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Get seeded services, drivers, and teams
const services = db.getServices();
const drivers = db.getDrivers();
const teams = db.getTeams();

console.log(`- Seeded Services Available: ${services.length}`);
console.log(`- Seeded Drivers Available: ${drivers.length}`);
console.log(`- Seeded Dispatch Teams Available: ${teams.length}\n`);

console.log("STEP 1: Simulating 100 Customer Signups & Plan Subscriptions...");
const customers = [];
for (let i = 1; i <= 100; i++) {
    const fn = randomItem(firstNames);
    const ln = randomItem(lastNames);
    const username = `${fn.toLowerCase()}.${ln.toLowerCase()}${randomRange(10, 99)}@gmail.com`;
    const password = `passCustomer${i}`;
    const plan = randomItem(plans);
    
    const signedUp = db.signupCustomer(username, password, plan);
    if (signedUp) {
        customers.push({
            id: signedUp.id,
            name: `${fn} ${ln}`,
            username: signedUp.username,
            password: password,
            plan: signedUp.plan
        });
    }
}
console.log(`[OK] Successfully signed up ${customers.length} customer accounts and subscribed them to plans.\n`);

console.log("STEP 2: Simulating 100 Customer Log-ins & Bookings submissions...");
const bookings = [];
for (let i = 0; i < customers.length; i++) {
    const customer = customers[i];
    
    // Simulate Login authentication
    const loggedIn = db.authenticateCustomer(customer.username, customer.password);
    if (!loggedIn) {
        console.error(`[ERROR] Auth failed for customer: ${customer.username}`);
        continue;
    }

    // Generate random booking details
    const service = randomItem(services);
    const pickup = randomItem(addresses);
    let dropoff = randomItem(addresses);
    while (dropoff === pickup) {
        dropoff = randomItem(addresses);
    }
    const passengers = randomRange(8, 56);
    const tripDate = `2026-07-${String(randomRange(1, 31)).padStart(2, '0')}`;
    const tripTime = `${String(randomRange(6, 21)).padStart(2, '0')}:00`;
    
    // Random trip type
    const tripType = randomItem(['one-way', 'round-trip', 'large-event']);
    
    let itineraryDetails = `[Trip Type: ${tripType.toUpperCase()}]\n`;
    itineraryDetails += `- Pickup: ${pickup} on ${tripDate} at ${tripTime}\n`;
    
    if (tripType === 'round-trip') {
        const stopAddr = randomItem(addresses);
        itineraryDetails += `- Stop/Return: ${stopAddr} on ${tripDate} at 21:00\n`;
    }
    
    itineraryDetails += `- Dropoff: ${dropoff}\n`;
    
    if (tripType === 'large-event') {
        itineraryDetails += `[Trip Details]\n`;
        itineraryDetails += `- Event Name: ${customer.name}'s Group Loop\n`;
        itineraryDetails += `- Event Type: Private Gathering\n`;
        itineraryDetails += `- Accessible Vehicle Needed: No\n`;
        itineraryDetails += `- ADA Standards Compliant: Yes\n`;
    }

    const baseRate = passengers <= 14 ? 85 : (passengers <= 36 ? 125 : 150);
    const hours = randomRange(3, 8);
    let simulatedPrice = baseRate * hours;
    if (tripType === 'round-trip') simulatedPrice *= 1.6;
    if (tripType === 'large-event') simulatedPrice *= 2.0;

    const payload = {
        name: customer.name,
        phone: `(${randomRange(200, 999)}) 555-${String(randomRange(1000, 9999))}`,
        email: customer.username,
        service_type: service.name,
        pickup_loc: `${pickup} at ${tripTime}`,
        dropoff_loc: dropoff,
        trip_date: tripDate,
        passengers: passengers,
        plan: customer.plan,
        message: itineraryDetails,
        price: `$${simulatedPrice.toFixed(2)}`
    };

    const newBooking = db.createInquiry(payload);
    bookings.push(newBooking);
}
console.log(`[OK] Successfully authenticated and logged ${bookings.length} custom quotes/bookings in database.\n`);

console.log("STEP 3: Simulating 100 Company Staff Members checking bookings & assigning drivers/teams...");
let assignmentsCount = 0;
for (let i = 0; i < bookings.length; i++) {
    const booking = bookings[i];
    
    // Choose a random driver & dispatch team
    const driver = randomItem(drivers);
    const team = randomItem(teams);
    
    const assigned = db.assignInquiry(booking.id, driver.name, team.name);
    if (assigned) {
        assignmentsCount++;
        // Randomly mark 30% of simulated bookings as paid
        if (Math.random() < 0.3) {
            db.updateInquiryStatus(booking.id, 'paid');
        }
    }
}
console.log(`[OK] Successfully completed ${assignmentsCount} dispatch assignments.`);
console.log(`- Staff members assigned commercial drivers to motorcoach logs.`);
console.log(`- Staff members assigned dispatch teams to check coordinates.`);
console.log("==========================================");
console.log("SIMULATION RUN SUCCESSFULLY COMPLETED");
console.log("==========================================");
