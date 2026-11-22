// Where RSVP answers are sent: the Google Apps Script web app link (ends in /exec), see
// docs/RSVP-SETUP.md. While it is empty, the RSVP button says the form is coming soon.
// (NEXT_PUBLIC_RSVP_ENDPOINT can override it for a local test build.)
export const RSVP_ENDPOINT: string =
  process.env.NEXT_PUBLIC_RSVP_ENDPOINT ||
  "https://script.google.com/macros/s/AKfycbx-FR1LY2Riig-SVaUV6KL9BwsMIYMBwwsX4QZSCzD3XBOYdSh1Eq3PSPYtoLN7h0bm/exec";
