// This is for all pages
// import puppetteer

const puppeteer = require("puppeteer");

async function go() {
  // LAUNCH THE BROWSER
  const browser = await puppeteer.launch({
    headless: false,
  });
  //   OPEN A NEW TAB
  const page = await browser.newPage();
}

// CALL THE FUNCTION
go();
