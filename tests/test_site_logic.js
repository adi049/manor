"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const validationSource = fs.readFileSync("assets/js/site-validation.js", "utf8");
const helperSandbox = { window: {} };
vm.runInNewContext(validationSource, helperSandbox, { filename: "site-validation.js" });
const validate = helperSandbox.window.NDMValidateOccupancy;
assert.equal(typeof validate, "function", "occupancy validator is exported for the browser");

const occupancyCases = [
  ["1", "", true, 1],
  ["3", "0", true, 3],
  ["1", "2", true, 3],
  ["2", "2", false, 4],
  ["4", "0", false, 4],
  ["", "0", false, null],
  ["1", "1.5", false, null],
  ["1", "-1", false, null]
];
for (const [adults, children, expectedValid, expectedTotal] of occupancyCases) {
  const result = validate(adults, children, 3);
  assert.equal(result.valid, expectedValid, `occupancy ${adults}+${children || 0}`);
  assert.equal(result.total, expectedTotal, `total for ${adults}+${children || 0}`);
}

const configSandbox = { window: {} };
vm.runInNewContext(fs.readFileSync("assets/js/site-config.js", "utf8"), configSandbox, { filename: "site-config.js" });
const config = JSON.parse(JSON.stringify(configSandbox.window.NDM_CONFIG));
const siteJS = fs.readFileSync("assets/js/site.js", "utf8");
const servicesHTML = fs.readFileSync("services.html", "utf8");
const bookingHTML = fs.readFileSync("booking.html", "utf8");
const galleryHTML = fs.readFileSync("gallery.html", "utf8");

assert.equal(config.hotel.name, "HOTEL ND MANOR");
assert.equal(config.occupancy.maxGuestsPerRoom, 3);
assert.equal(config.occupancy.quotedRateGuestCount, 2);
assert.equal(config.occupancy.additionalPersonChargeApplies, true);
assert.deepEqual(config.hotel.calls.map((item) => item.tel), ["+919968407707", "+917078944451"]);
assert.deepEqual(config.hotel.whatsapps.map((item) => item.url), ["https://wa.me/917417774451", "https://wa.me/917078944451"]);
assert.equal(config.hotel.email, "ndmanorhotel@gmail.com");
assert.equal(config.hotel.instagram, "https://www.instagram.com/hotelndmanordehradun/?hl=en");

const roomNames = ["Deluxe Room", "Super Deluxe Room With Balcony", "Royal Suite With Bathtub"];
assert.deepEqual(config.roomCatalog.map((room) => room.name), roomNames);
assert.equal(config.roomCatalog.length, 3, "the public room catalogue has exactly three categories");
assert.equal([...servicesHTML.matchAll(/data-room-id="([^"]+)"/g)].length, 3, "Services renders exactly three room cards");
assert.ok(servicesHTML.includes("Three room <em>categories.</em>"), "Services copy reflects the three-category catalogue");
assert.match(fs.readFileSync("about.html", "utf8"), /A Welcoming Base in <em>ND Manor Hotel<\/em>/, "About Us subheading has the approved exact wording");
const roomSelect = bookingHTML.match(/<select id="roomType"[\s\S]*?<\/select>/);
assert.ok(roomSelect, "booking form has a room category selector");
assert.deepEqual([...roomSelect[0].matchAll(/<option value="([^"]*)"/g)].map((match) => match[1]), ["", "Not sure yet", ...roomNames], "booking selection contains only the three published room categories");
assert.ok(servicesHTML.includes("Contact the hotel for current rates"), "current rate enquiries point to the hotel");
assert.ok(config.roomCatalog.every((room) => room.name && room.description && room.meta.includes("Maximum 3 guests per room")), "room categories keep descriptions and occupancy");
assert.deepEqual(
  config.roomCatalog.map((room) => room.id),
  [...servicesHTML.matchAll(/data-room-id="([^"]+)"/g)].map((match) => match[1]),
  "Services card IDs match the centralized room catalogue in order"
);
for (const room of config.roomCatalog) {
  assert.ok(servicesHTML.includes(`booking.html?room=${room.id}#enquiry`), `room URL preselection exists for ${room.id}`);
}
assert.ok(bookingHTML.includes('id="adultCount"') && bookingHTML.includes('id="childCount"'));
assert.match(bookingHTML, /id="adultCount"[^>]*max="3"/);
assert.match(bookingHTML, /id="childCount"[^>]*max="3"/);
assert.ok(bookingHTML.includes("Maximum three guests per room"));
assert.ok(bookingHTML.includes("Additional-person charges apply"));
assert.ok(siteJS.includes("NDMValidateOccupancy"), "booking logic calls the shared occupancy validator");
assert.ok(siteJS.includes("applyQueryPreselection"), "booking query preselection remains available");
assert.ok(siteJS.includes("window.NDMOpenContactChoice"), "forms open the WhatsApp destination chooser");
assert.ok(bookingHTML.includes('data-submit-whatsapp disabled'), "booking submit stays disabled until its safe draft handler loads");
assert.ok(servicesHTML.includes('type="submit" disabled'), "event submit stays disabled until its safe draft handler loads");
assert.ok(siteJS.includes("if (submitButton) submitButton.disabled = false;"), "forms enable submission only after their handlers are attached");
assert.ok(bookingHTML.includes("This form will not send your entries"), "no-script form path does not claim to send or submit data");
assert.ok(siteJS.includes("I will review this draft and press Send in WhatsApp."), "form messages remain drafts for user review and sending");
assert.ok(siteJS.includes("not a confirmed reservation or event booking"), "form copy does not claim a confirmed booking");

assert.equal(new Set(config.galleryItems.map((item) => item.id)).size, config.galleryItems.length, "gallery records have unique IDs");
assert.equal(config.galleryItems.length, 8, "eight existing distinct image records are centrally configured");
assert.ok(config.galleryItems.every((item) => config.images[item.imageKey]), "each gallery record resolves to a configured image");
const standardPages = ["index.html", "about.html", "services.html", "gallery.html", "booking.html", "privacy-policy.html", "terms-and-conditions.html"];
for (const page of standardPages) {
  const html = fs.readFileSync(page, "utf8");
  for (const match of html.matchAll(/data-media="([^"]+)"/g)) {
    assert.ok(config.images[match[1]], `${page} data-media key ${match[1]} exists in the central image map`);
  }
  assert.equal((html.match(/class="site-header"/g) || []).length, 1, `${page} has exactly one desktop header`);
  assert.equal((html.match(/class="mobile-menu"/g) || []).length, 1, `${page} has one separate mobile menu`);
  assert.equal((html.match(/class="floating-contact"/g) || []).length, 1, `${page} has one floating contact group`);
  const widget = html.match(/<nav class="floating-contact"[\s\S]*?<\/nav>/);
  assert.ok(widget, `${page} floating contacts are a named navigation group`);
  assert.equal((widget[0].match(/<a\b/g) || []).length, 3, `${page} floating group has exactly three actions`);
  assert.ok(widget[0].includes('href="tel:+919968407707"'), `${page} floating call destination is exact`);
  assert.ok(widget[0].includes('href="https://wa.me/917417774451"'), `${page} floating WhatsApp destination is exact`);
  assert.ok(!widget[0].includes("data-whatsapp-link") && !/[?&]text=/.test(widget[0]), `${page} floating WhatsApp opens a direct chat without a draft or chooser`);
  assert.ok(widget[0].includes('href="https://www.instagram.com/hotelndmanordehradun/?hl=en" target="_blank" rel="noopener noreferrer"'), `${page} Instagram uses the approved URL and safe new-tab attributes`);
  assert.equal((widget[0].match(/<svg\b/g) || []).length, 3, `${page} floating actions use inline SVG icons`);
  assert.match(widget[0], /aria-label="Call HOTEL ND MANOR"/);
  assert.match(widget[0], /aria-label="WhatsApp HOTEL ND MANOR"/);
  assert.match(widget[0], /aria-label="Visit HOTEL ND MANOR on Instagram"/);
  assert.match(html, /<nav class="mobile-menu"[^>]*aria-hidden="true"[^>]*inert/);
  assert.ok(!html.includes("intro-pending"), `${page} never hides the page behind an inactive intro screen`);
}
for (const imagePath of Object.values(config.images)) {
  assert.ok(fs.existsSync(imagePath), `configured image exists: ${imagePath}`);
}
assert.ok(config.galleryItems.every((item) => !/Royal Suite|Super Deluxe|Deluxe Room/.test(item.caption)), "uncertain room photos use neutral captions");
assert.ok(config.galleryItems.some((item) => item.category === "lounge" && !/banquet/i.test(item.caption)), "lounge photo is not classified or captioned as a banquet scene");
assert.ok(galleryHTML.includes('data-gallery-filter="lounge"'), "gallery has a neutral lounge filter");
assert.ok(siteJS.includes("touchstart") && siteJS.includes("touchend"), "gallery lightbox supports touch swipes");
assert.ok(siteJS.includes("data-gallery-caption") || siteJS.includes("data-lightbox-caption"), "lightbox caption remains connected to its live region");
assert.ok(siteJS.includes("function initScrollReveals") && siteJS.includes("function initMediaReveals"), "one-time text and image entrance observers are present");
assert.ok(siteJS.includes('menu.setAttribute("inert", "")') && siteJS.includes('menu.removeAttribute("inert")'), "closed mobile navigation is inert and becomes available when opened");
assert.ok(siteJS.includes("function initFloatingContact") && siteJS.includes("getBoundingClientRect"), "floating actions yield when they would overlap form or footer content");
const siteCSS = fs.readFileSync("assets/css/site.css", "utf8");
assert.match(siteCSS, /\.mobile-menu\s*\{\s*display:\s*none;/, "mobile navigation is hidden at desktop by default");
assert.match(siteCSS, /\.mobile-menu\s*\{\s*display:\s*block;/, "mobile navigation is restored at the mobile breakpoint");
assert.ok(siteCSS.includes(".floating-contact__link:focus-visible"), "floating actions keep a visible keyboard focus ring");
assert.ok(siteCSS.includes("env(safe-area-inset-bottom") && siteCSS.includes("env(safe-area-inset-right"), "floating actions respect mobile safe areas");
assert.ok(siteCSS.includes("@keyframes contentSoftReveal") && siteCSS.includes("@keyframes imageSoftReveal"), "restrained text and photo entrances are defined");
assert.ok(siteCSS.includes(".is-text-revealing, .is-image-revealing { animation: none !important"), "reduced motion disables new reveal animations");
assert.equal(config.videoSlots.deluxeRoom.available, false, "unverified room video association remains inactive");
assert.ok(Object.values(config.videoSlots).every((slot) => slot.available === false), "unavailable or unverified video slots remain inactive");

console.log(`Logic checks passed: ${occupancyCases.length} occupancy cases, room IDs and preselection, contact destinations, existing gallery metadata and inactive unverified clips.`);
