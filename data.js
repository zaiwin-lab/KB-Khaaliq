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
    "CRM", "WhatsApp Automation", "AI Agent", "SEO", "Social Media",
    "Branding", "Logo", "Business Email", "Hosting", "Domain Name",
    "Google Business Profile"
  ];

  const FILE_CATEGORIES = [
    "Business Profile", "Logo", "Product Photos", "Company Photos",
    "Certificates", "Proposal", "Marketing Materials", "Others"
  ];

  // High-value needs carry more weight in lead scoring (budget signals).
  const HIGH_VALUE_NEEDS = [
    "E-Commerce", "AI Agent", "AI Chatbot", "CRM",
    "WhatsApp Automation", "Booking System"
  ];

  // Simple 4-stage pipeline (A → D), mirrors the KSA/KSB build flow.
  const STATUSES = [
    "A · Analyze", "B · Building", "C · Preview & Pay", "D · Deploy"
  ];

  // What every business receives — straight from the SDC poster offer.
  // Shown on the landing as proof of capability ("seeing is believing").
  const OFFERINGS = [
    { t: "Smart Business Website", d: "Built around your business goals." },
    { t: "Mobile-Friendly Design", d: "Looks sharp on every device." },
    { t: "Professional Copywriting", d: "Clear, persuasive, business-focused." },
    { t: "Google Search Ready", d: "Customers find you online." },
    { t: "WhatsApp Integration", d: "Connect with customers instantly." },
    { t: "Contact & Enquiry Forms", d: "Leads land straight in your inbox." },
    { t: "Photo Gallery", d: "Showcase products and services." },
    { t: "Google Map Listing", d: "Easy for customers to reach you." },
    { t: "Domain Name Included", d: "Your own .com or .my address." },
    { t: "1-Year Hosting", d: "Reliable and secure, handled for you." },
    { t: "SSL Security", d: "Trusted https:// padlock included." },
    { t: "4-Language Support", d: "EN · BM · 中文 · Iban." },
    { t: "News & Updates Module", d: "Share promos and announcements." },
    { t: "Fast-Loading Pages", d: "Better experience, better results." },
    { t: "Easy Dashboard", d: "Edit content yourself, no code." },
    { t: "AI Chatbot & Automation", d: "Answer customers around the clock." }
  ];

  // Activation offer + upsell add-ons shown on the checkout (pay) page.
  const CURRENCY = "RM";
  const ACTIVATION_PRICE = 500;
  const ACTIVATION_WAS = 1000;
  const ADDONS = [
    { k: "AI Chatbot", p: 300, d: "Answers customers 24/7 on your site." },
    { k: "WhatsApp Automation", p: 250, d: "Auto-replies, order alerts & follow-ups." },
    { k: "E-Commerce Store", p: 600, d: "Sell online with cart & checkout." },
    { k: "Booking System", p: 350, d: "Let customers book and pay online." },
    { k: "Logo & Branding Kit", p: 200, d: "Professional logo + brand colours." },
    { k: "SEO Setup", p: 300, d: "Rank higher and get found on Google." },
    { k: "Google Business Profile", p: 150, d: "Show up on Google Maps & Search." },
    { k: "Social Media Kit", p: 200, d: "Profile, covers & post templates." },
    { k: "Business Email", p: 120, d: "you@yourbusiness.com (1 year)." },
    { k: "Extra Language", p: 150, d: "Add BM / 中文 / Iban to your site." }
  ];
  // Khaaliq's WhatsApp number for orders (international format, no + or spaces).
  // TODO: replace with the real number, e.g. "60128889999".
  const KHAALIQ_WA = "";

  const STORAGE_KEY = "sdc_submissions_v1";
  const DRAFT_KEY = "sdc_draft_v2";
  const DRIVE_ROOT = "SDC — Client Intake"; // shared Google Drive home

  window.SDC_DATA = {
    DISTRICTS, CATEGORIES, STAGES, OPERATING_AREAS, CHALLENGES,
    NEEDS, FILE_CATEGORIES, HIGH_VALUE_NEEDS, STATUSES, OFFERINGS,
    CURRENCY, ACTIVATION_PRICE, ACTIVATION_WAS, ADDONS, KHAALIQ_WA,
    STORAGE_KEY, DRAFT_KEY, DRIVE_ROOT
  };
})();
