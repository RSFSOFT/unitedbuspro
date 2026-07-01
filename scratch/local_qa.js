const { spawn } = require('child_process');
const http = require('http');

function get(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
        }).on('error', reject);
    });
}

async function runQa() {
    console.log("==========================================");
    console.log("STARTING PROGRAMMATIC QA VERIFICATION");
    console.log("==========================================");

    // Start server on port 3009 to avoid conflicts
    const env = { ...process.env, PORT: '3009' };
    const server = spawn('node', ['server.js'], { env, cwd: 'c:\\Users\\HP\\Desktop\\unitedbuspro' });

    server.stdout.on('data', (data) => {
        console.log(`[SERVER]: ${data.toString().trim()}`);
    });

    server.stderr.on('data', (data) => {
        console.error(`[SERVER ERROR]: ${data.toString().trim()}`);
    });

    // Wait 3 seconds for server to boot
    await new Promise(r => setTimeout(r, 3000));

    let passed = true;

    try {
        // 1. Check Homepage
        console.log("\n1. Verifying Homepage (http://localhost:3009/)...");
        const home = await get('http://localhost:3009/');
        
        if (home.statusCode !== 200) {
            console.error("[-] Homepage status code is not 200. Got:", home.statusCode);
            passed = false;
        }

        // Verify Phone number
        if (home.body.includes('(202) 991-1203')) {
            console.log("[+] Phone number (202) 991-1203 is present on Homepage.");
        } else {
            console.error("[-] Phone number (202) 991-1203 is MISSING on Homepage.");
            passed = false;
        }

        // Verify old phone is gone
        if (home.body.includes('800-495-8017') || home.body.includes('800) 495-8017')) {
            console.error("[-] Old phone number 800-495-8017 is still present on Homepage.");
            passed = false;
        } else {
            console.log("[+] Old phone number is successfully removed/not found.");
        }

        // Verify DC monuments tour service is listed in SOLUTIONS mega menu or services
        if (home.body.includes('DC Monuments Private Tour') || home.body.includes('dc-monuments-private-tour')) {
            console.log("[+] 'DC Monuments Private Tour' service link/text is present on Homepage.");
        } else {
            console.error("[-] 'DC Monuments Private Tour' service is MISSING on Homepage.");
            passed = false;
        }

        // Verify yellow school bus image is gone/school image map points to service-school.png
        if (home.body.includes('service-school.png')) {
            console.log("[+] Premium school minibus image 'service-school.png' is mapped on Homepage.");
        } else {
            console.error("[-] Premium school minibus image 'service-school.png' was not found on Homepage.");
            passed = false;
        }

        // 2. Check Fleet Page
        console.log("\n2. Verifying Fleet Page (http://localhost:3009/fleet)...");
        const fleet = await get('http://localhost:3009/fleet');
        
        if (fleet.statusCode !== 200) {
            console.error("[-] Fleet Page status code is not 200. Got:", fleet.statusCode);
            passed = false;
        }

        // Verify fleet capacities
        const capacities = [
            "14 Passenger Bus",
            "24 Passenger Bus",
            "36 Passenger Bus",
            "32 Passenger Bus",
            "40 Passenger Bus",
            "ADA 24 Passenger Bus",
            "50 Passenger Coach Bus",
            "Chevrolet Suburban",
            "Town Car",
            "Limousine",
            "Hummer Limousine"
        ];

        capacities.forEach(cap => {
            if (fleet.body.includes(cap)) {
                console.log(`[+] Fleet capacity '${cap}' is displayed.`);
            } else {
                console.error(`[-] Fleet capacity '${cap}' is MISSING on Fleet Page.`);
                passed = false;
            }
        });

        // Verify no yellow bus images
        if (fleet.body.includes('yellow_school_bus') || fleet.body.includes('school-bus') || fleet.body.includes('school_bus')) {
            // Note: service-school.png contains school, but we mean school bus images in fleet
            if (fleet.body.includes('fleet_school_bus') || fleet.body.includes('yellow_school_bus')) {
                console.error("[-] Legacy school/yellow bus fleet images are still referenced in fleet page!");
                passed = false;
            } else {
                console.log("[+] School/yellow bus fleet images are not present.");
            }
        } else {
            console.log("[+] School/yellow bus fleet images are not present.");
        }

        // 3. Check DC Monuments Tour Page
        console.log("\n3. Verifying DC Monument Tour Page (http://localhost:3009/services/dc-monuments-private-tour)...");
        const tourPage = await get('http://localhost:3009/services/dc-monuments-private-tour');
        
        if (tourPage.statusCode !== 200) {
            console.error("[-] DC Monument Tour Page status is not 200. Got:", tourPage.statusCode);
            passed = false;
        } else {
            console.log("[+] DC Monument Tour Page loads successfully.");
        }

    } catch (err) {
        console.error("[-] Request error during QA:", err);
        passed = false;
    } finally {
        console.log("\nStopping local server...");
        server.kill();
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log("==========================================");
    if (passed) {
        console.log("ALL PROGRAMMATIC QA CHECKS PASSED!");
    } else {
        console.error("QA CHECKS FAILED! PLEASE REVIEW ERRORS.");
    }
    console.log("==========================================");
    process.exit(passed ? 0 : 1);
}

runQa();
