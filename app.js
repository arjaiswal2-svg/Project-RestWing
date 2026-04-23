// This is for all pages
// import puppetteer

const puppeteer = require("puppeteer");

async function go() {
  // launch the browser
  const browser = await puppeteer.launch({
    headless: false,
  });
  //   open a new tab
  const page = await browser.newPage();
}

// call the function
go();
