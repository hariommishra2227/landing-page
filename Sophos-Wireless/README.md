# Sophos Wireless Landing Page

## Delivery Contents
This ZIP contains one standalone folder: `Sophos-Wireless`. Keep `index.html`, `styles.css`, `product-pages.css`, `scripts.js`, and `assets/` together.

## Opening the Page
Extract the ZIP, open the `Sophos-Wireless` folder, and double-click `index.html`.

## Local Server Option
For a browser-server test, open PowerShell in the extracted `Sophos-Wireless` folder and run:

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000/`.

## Receiving Email Configuration
The form endpoint is configured in `scripts.js` with `RECEIVING_EMAIL = "hariom.mishra@itsipl.com"`.

The first FormSubmit submission may send an activation email to `hariom.mishra@itsipl.com`, and that activation must be approved before live leads are delivered.

## Asset Structure
Only locally required assets are included under `assets/brand`, `assets/client-logos`, and `assets/certificates`.

## Browser Requirements
Use a current version of Chrome, Edge, Firefox, or Safari. Internet access is required for Google Fonts and live FormSubmit delivery.

## Basic Testing Checklist
- Open `index.html` after extraction.
- Confirm Sophos and I.T. Solutions logos display.
- Confirm client logos and certificate previews display.
- Confirm certificate popup opens and closes.
- Confirm the form renders and requires business email fields.
- Confirm the product interest is `Sophos Wireless`.
- Confirm the FormSubmit subject is `New Sophos Wireless Consultation Lead`.

## Client Delivery Status
Client delivery validation is recorded in `validation-report.txt`.
