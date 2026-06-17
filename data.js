/* =====================================================================
   Sarawak Digital Champion — Business Activation Portal (Beta)
   data.js — shared reference data (districts, categories, options)
   Loaded before app.js / admin.js. Exposes window.SDC_DATA.
   ===================================================================== */
(function () {
  "use strict";

  // 45 administrative districts across Sarawak's 12 divisions.
  const DISTRICTS = [
    "Kuching", "Bau", "Lundu", "Siburan", "Padawan",
    "Samarahan", "Asajaya", "Simunjan", "Sebuyau",
    "Serian", "Tebedu", "Sri Aman", "Lubok Antu",
    "Betong", "Saratok", "Pusa", "Kabong",
    "Sarikei", "Maradong", "Daro", "Julau", "Pakan",
    "Sibu", "Kanowit", "Selangau",
    "Mukah", "Dalat", "Matu", "Tanjung Manis",
    "Kapit", "Song", "Belaga", "Bukit Mabong",
    "Bintulu", "Tatau", "Sebauh",
    "Miri", "Marudi", "Subis", "Beluru", "Telang Usan",
    "Limbang", "Lawas",
    "Bario", "Mulu"
  ];

  const CATEGORIES = [
    "Restaurant", "Catering", "Retail", "Services", "Construction",
    "Training", "Consultant", "NGO", "Others"
  ];

  const STAGES = [
    "Idea Stage", "Startup", "Operating", "Growing", "Established"
  ];

  const OPERATING_AREAS = [
    "Kuching", "Samarahan", "Serian", "Bintulu",
    "Miri", "Sibu", "Sarawak Wide", "Malaysia Wide"
  ];

  const CHALLENGES = [
    "Getting customers", "Branding", "Marketing", "Website", "Sales",
    "Recruitment", "Operations", "AI adoption", "Others"
  ];

  const NEEDS = [
    "Website", "Sales Page", "AI Chatbot", "Booking System", "E-Commerce",
    "CRM", "AI Agent", "SEO", "Social Media",
    "Branding", "Logo", "Business Email", "Hosting", "Domain Name",
    "Google Business Profile"
  ];

  const FILE_CATEGORIES = [
    "Business Profile", "Logo", "Product Photos", "Company Photos",
    "Certificates", "Proposal", "Marketing Materials", "Others"
  ];

  // High-value needs carry more weight in lead scoring (budget signals).
  const HIGH_VALUE_NEEDS = [
    "E-Commerce", "AI Agent", "AI Chatbot", "CRM", "Booking System"
  ];

  // Simple 4-stage pipeline (A → D), mirrors the KSA/KSB build flow.
  const STATUSES = [
    "A · Analyze", "B · Building", "C · Preview & Pay", "D · Deploy"
  ];

  // What every business receives — straight from the SDC poster offer.
  // Shown on the landing as proof of capability ("seeing is believing").
  const OFFERINGS = [
    { t: "Professional Business Website", d: "Built around your business goals." },
    { t: "Mobile Responsive Design", d: "Looks sharp on every device." },
    { t: "WhatsApp Click-to-Chat Button", d: "One-tap chat button for customers." },
    { t: "Contact & Enquiry Form", d: "Leads land straight in your inbox." },
    { t: "Google Map Integration", d: "Your location shown on your site." },
    { t: "Domain Name (1 Year)", d: "Your own .com or .my address." },
    { t: "Hosting (1 Year)", d: "Reliable and secure, handled for you." },
    { t: "SSL Security", d: "Trusted https:// padlock included." },
    { t: "Basic SEO Setup", d: "Indexed by Google, ready to be found." },
    { t: "Easy Dashboard Access", d: "Edit content yourself, no code." },
    { t: "Fast Loading Pages", d: "Better experience, better results." },
    { t: "4-Language Support", d: "EN · BM · 中文 · Iban." },
    // Free bonuses — included at no extra cost.
    { t: "Professional Copywriting", d: "Clear, persuasive, business-focused.", free: true },
    { t: "Photo Gallery Module", d: "Showcase products and services.", free: true },
    { t: "Promotion Module", d: "Highlight your latest offers and deals.", free: true }
  ];

  // Activation offer + upsell add-ons shown on the checkout (pay) page.
  const CURRENCY = "RM";
  const ACTIVATION_PRICE = 500;
  const ACTIVATION_WAS = 1000;
  const ADDONS = [
    { k: "AI Chatbot", p: 200, d: "24/7 AI staff for your website. Answers visitor questions and assists enquiries." },
    { k: "E-Commerce Store", p: 600, d: "Online product catalogue, shopping cart and checkout system." },
    { k: "Booking System", p: 150, d: "Allow customers to book appointments, consultations or services online." },
    { k: "Google Business Profile", p: 150, d: "Setup and optimisation of Google Business Profile." },
    { k: "Business Email", p: 100, d: "1 business email account (example: you@yourbusiness.com)." },
    { k: "News & Updates Module", p: 100, d: "Publish company news, announcements, articles and updates." }
  ];
  // Khaaliq's WhatsApp number for orders (international format, no + or spaces).
  const KHAALIQ_WA = "601128465813";

  const STORAGE_KEY = "sdc_submissions_v1";
  const DRAFT_KEY = "sdc_draft_v2";
  const DRIVE_ROOT = "SDC — Client Intake"; // shared Google Drive home

  // Automatic email sending (EmailJS — free, no backend needed).
  // Leave blank to fall back to opening the team member's mail app.
  // To turn ON fully-automatic background email:
  //   1. Sign up free at https://www.emailjs.com
  //   2. Add an Email Service (e.g. connect Gmail) -> copy its Service ID
  //   3. Create an Email Template using these variables:
  //        {{to_email}} {{to_name}} {{subject}} {{message}}
  //        {{business_name}} {{preview_link}} {{pay_link}}
  //      (set the template "To" field to {{to_email}}) -> copy its Template ID
  //   4. Account -> General -> copy your Public Key
  //   5. Paste the three values below. Done — emails now send automatically.
  const EMAILJS = {
    publicKey: "",
    serviceId: "",
    templateId: ""
  };

  // Team panel passcode. Change this to your own secret before sharing.
  // NOTE: this is a lightweight gate for beta — it keeps clients & casual
  // visitors out, but is not bank-grade security. Real auth arrives with
  // the shared backend phase.
  const ADMIN_PASS = "Khaaliq#Kuching2026";
  const ADMIN_KEY = "sdc_admin_ok";

  window.SDC_DATA = {
    DISTRICTS, CATEGORIES, STAGES, OPERATING_AREAS, CHALLENGES,
    NEEDS, FILE_CATEGORIES, HIGH_VALUE_NEEDS, STATUSES, OFFERINGS,
    CURRENCY, ACTIVATION_PRICE, ACTIVATION_WAS, ADDONS, KHAALIQ_WA,
    STORAGE_KEY, DRAFT_KEY, DRIVE_ROOT, ADMIN_PASS, ADMIN_KEY, EMAILJS
  };
})();
