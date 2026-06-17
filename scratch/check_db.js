const db = require('../database');
const customers = db.getCustomerUsers();
console.log("Total Customers Seeded:", customers.length);

const plans = {};
customers.forEach(c => {
    plans[c.plan] = (plans[c.plan] || 0) + 1;
});

console.log("Commuter Plans distribution:");
console.log(JSON.stringify(plans, null, 2));

// Test login/signup api functions
const testUser = "test.pricing" + Date.now() + "@unitedbuspro.com";
const testPass = "testPassword123";
const testPlan = "Starter Plan";

const reg = db.signupCustomer(testUser, testPass, testPlan);
if (reg) {
    console.log("Signup test passed! Created user:", reg.username, "with plan:", reg.plan);
    const auth = db.authenticateCustomer(testUser, testPass);
    if (auth && auth.plan === testPlan) {
        console.log("Auth test passed! Logged in as:", auth.username, "with plan:", auth.plan);
    } else {
        console.error("Auth test failed.");
    }
} else {
    console.error("Signup test failed.");
}
