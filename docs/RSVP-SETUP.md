# RSVP setup (5 minutes, once)

The RSVP form on noriandmax.com sends each answer to a small Google Apps Script that lives in
**your own Google account**. The script adds the answer as a row in a Google Sheet (your guest list)
and emails a summary to both of you. Your email addresses stay inside the script: they never appear
on the public site or in the GitHub repo.

Until the script's link is set, the RSVP button just says the form is coming soon.

## 1. Create the sheet

1. Signed in to your personal Google account, open **https://sheets.new**.
2. Name it, for example *RSVP — Nóri & Max*. Leave it empty: the script adds the header row itself.

## 2. Add the script

1. In the sheet: **Extensions → Apps Script**.
2. Delete the sample code, and paste the whole content of [`tools/rsvp/Code.gs`](../tools/rsvp/Code.gs).
3. On the line `const RECIPIENTS = "you@domain.com";`, put the address that should get each
   answer (several, separated by a comma, if you both want it).
4. Save (the disk icon), and name the project *RSVP*.

## 3. Publish it as a web app

1. **Deploy → New deployment**. Click the gear next to *Select type* and choose **Web app**.
2. *Description*: RSVP · *Execute as*: **Me** · *Who has access*: **Anyone**. Click **Deploy**.
3. Google asks you to authorise the script (it's yours: it needs to write to the sheet and send
   email as you): **Authorize access** → pick your account → *Google hasn't verified this app* →
   **Advanced** → **Go to RSVP (unsafe)** → **Allow**.
4. Copy the **Web app URL** (it ends in `/exec`). Opening it in a browser should say
   *Nóri & Max RSVP endpoint is running.*

## 4. Connect the site

Send that link to Claude, or paste it yourself in
[`components/invitation/rsvp-config.ts`](../components/invitation/rsvp-config.ts), replacing `""`:

```ts
export const RSVP_ENDPOINT: string = process.env.NEXT_PUBLIC_RSVP_ENDPOINT || "https://script.google.com/macros/s/…/exec";
```

Push, and the RSVP button opens the form. Send yourselves a test answer: a row appears in the sheet
and both of you get the email (you can then delete the test row).

## Good to know

- **Share the sheet** with Nóri (Share button) so you both see the live guest list.
- The emails come from your Gmail address; *Reply* goes straight to the guest.
- A personal Google account can send about 100 emails a day: plenty.
- **Changing the script later** (other addresses, wording): edit, save, then **Deploy → Manage
  deployments → ✏️ → Version: New version → Deploy**. The link stays the same.
- The form's fields and texts (in the three languages) are in
  `components/invitation/RsvpDialog.tsx` and `components/invitation/i18n.ts`.
