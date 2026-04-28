// app.js — Puppeteer test for RestWing
// tests the waitlist signup on the homepage

// import puppetteer

const puppeteer = require("puppeteer");

// change this to your Firebase hosting URL once deployed
const BASE_URL = "https://project-restwing.web.app";

// test email we'll type into the waitlist form
const TEST_EMAIL = "testuser@restwing.com";

// open the homepage, sign up for the waitlist, check the success message appears
async function testWaitlistSignup(page) {
  console.log("=== RestWing: Waitlist Signup Test ===");

  // go to the homepage
  console.log("\n[1] Opening homepage...");
  await page.goto(`${BASE_URL}/index.html`, { waitUntil: "networkidle2" });
  console.log("    ✓ Homepage loaded.");

 // scroll down slowly so the audience can follow along
console.log("\n[2] Scrolling to waitlist form...");
await page.evaluate(async () => {
  await new Promise(resolve => {
    let total = 0;
    const target = document.getElementById("waitlist-form").offsetTop;
    const timer = setInterval(() => {
      window.scrollBy(0, 13);
      total += 13;
      if (total >= target) {
        clearInterval(timer);
        resolve();
      }
    }, 15);
  });
});
await new Promise(resolve => setTimeout(resolve, 800));
console.log("    ✓ Scrolled to waitlist.");

  // type an email into the waitlist input
  console.log("\n[2] Entering email...");
  await page.type("#waitlist-email", TEST_EMAIL);
  console.log(`    ✓ Typed: ${TEST_EMAIL}`);

  // click the submit button
  console.log("\n[3] Clicking 'Get Early Access'...");
  await page.click("#waitlist-form button[type='submit']");
  console.log("    ✓ Button clicked.");

  // wait for the success message to show up
  console.log("\n[4] Waiting for success message...");
  await page.waitForSelector("#waitlist-msg", { visible: true, timeout: 8000 });

  const msgText = await page.$eval("#waitlist-msg", el => el.textContent.trim());
  console.log(`    Message shown: "${msgText}"`);

  if (!msgText.includes("You're on the list")) {
    throw new Error(`Unexpected message: ${msgText}`);
  }

  console.log("\n✅ Test passed — waitlist signup is working.\n");
}

// launch the browser, run the test, close when done
async function go() {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50, 
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    await testWaitlistSignup(page);
  } catch (err) {
    console.error(`\n❌ Test failed: ${err.message}\n`);
  } finally {
    // pause so you can see the result before the browser closes
    await new Promise(resolve => setTimeout(resolve, 3000));
    await browser.close();
  }
}

// run it
go();