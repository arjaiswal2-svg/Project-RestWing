// This is for all pages
// import puppetteer

const puppeteer = require("puppeteer");

async function go() {
  // launch the browser
  const browser = await puppeteer.launch({
    headless: false,
  });
}
