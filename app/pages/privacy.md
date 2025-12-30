# Privacy Policy

### 1. Who we are

This website is operated by ascenue GmbH, registered at Christaweg 42, 79114 Freiburg. We determine how and why your personal data are processed and are therefore the "data controller" under the EU General Data Protection Regulation (GDPR).

**Contact:** info@ascenue.com

### 2. What data we collect

1. **Contact form submissions** – When you send us a message, we receive your name, email address, and anything you write in the message box. We use this information solely to answer your enquiry or continue the conversation. The legal basis is contractual necessity (Art. 6 (1)(b) GDPR).

2. **Automatic server logs** – Our servers may record your IP address, browser type, date and time of visit, and the pages you view. We rely on these logs to maintain site security and diagnose errors. The legal basis is our legitimate interest in keeping the site safe and functioning (Art. 6 (1)(f) GDPR).

3. **Essential cookies only** – We use only small "necessary" cookies that store a unique session ID so the site can remember page navigation, form state, and other core functions. We do **not** use analytics, marketing, or profiling cookies of any kind.

### 3. No analytics or marketing cookies

We do not use Google Analytics, Facebook Pixel, or any other tracking or profiling technology. We set only essential cookies needed for the site to function; these do not analyse or advertise to visitors.

### 4. How we share data

- **Infrastructure:** Personal data are stored on servers located in the EU/EEA or a country with an adequacy decision.
- We do not sell or rent your information and disclose it only if required by law.

### 5. Retention

- Contact form messages are kept for 12 months to follow up on enquiries, then securely deleted.
- Server logs rotate automatically after 30 days.

### 6. Your rights

Under GDPR you may, at any time, request: access to your data, correction, deletion, restriction of processing, data portability, or to object to processing. Email info@ascenue.com. You also have the right to lodge a complaint with your local supervisory authority.

### 7. Security

We use HTTPS encryption and implement appropriate technical and organisational measures to protect your information.

### 8. Rehydra Browser Extension

If you use our Rehydra browser extension for privacy-preserving AI interactions, the following applies:

#### 8.1 What data the extension processes

The extension detects and anonymises personally identifiable information (PII) in text you submit to ChatGPT. This includes names, email addresses, phone numbers, addresses, and other personal identifiers. **All processing happens locally in your browser**—your original PII is never transmitted to ascenue servers.

#### 8.2 Local data storage

The extension stores:

- **Encrypted PII mappings** – A reversible mapping between anonymised placeholders and your original data, encrypted using AES-256 with a key generated and stored locally on your device. Stored in your browser's IndexedDB.
- **Extension settings** – Your preferences (enabled/disabled state, detection mode, debug logging) stored in your browser's local storage.
- **Encryption key** – A randomly generated 256-bit key stored in your browser's local storage, never transmitted externally.

This data remains on your device and is not accessible to ascenue or any third party.

#### 8.3 Network requests

The extension may make the following network requests:

| Destination | Purpose | When |
|-------------|---------|------|
| huggingface.co / cdn-lfs.hf.co | Download AI model files (~280 MB) for enhanced PII detection | Only if you enable "Full NER" mode; one-time download cached locally |

The extension does **not** contact ascenue servers or any analytics/tracking services.

#### 8.4 Permissions

The extension requests:

- **Storage** – To save your settings and encrypted PII mappings locally
- **Host permissions for Hugging Face** – To download AI model files when Full NER mode is enabled

#### 8.5 Data retention

- PII mappings persist in your browser until you clear browser data or uninstall the extension.
- You can clear all extension data at any time via your browser's extension settings or by uninstalling the extension.

#### 8.6 No remote collection

We do **not** collect, transmit, or have access to:

- Your original (un-anonymised) text
- Your PII mappings or encryption keys
- Your ChatGPT conversations
- Any usage analytics or telemetry

#### 8.7 Third-party services

- **OpenAI (ChatGPT)** – The extension modifies text before it reaches ChatGPT. We do not interact with the internal chatgpt.com API. Rehydra is not affiliated with ChatGPT or Open AI. Your anonymised text is subject to [OpenAI's privacy policy](https://openai.com/policies/privacy-policy).
- **Hugging Face** – If you enable Full NER mode, model files are downloaded from Hugging Face infrastructure, subject to [Hugging Face's privacy policy](https://huggingface.co/privacy).

### 9. Changes to this policy

If we add new features or legal requirements change, we'll update this page and note the revision date.
