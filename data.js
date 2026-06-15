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

  const STATUSES = [
    "New", "Reviewing", "Contacted", "Approved",
    "Website In Progress", "Website Delivered", "Activated"
  ];

  const STORAGE_KEY = "sdc_submissions_v1";
  const DRAFT_KEY = "sdc_draft_v1";

  window.SDC_DATA = {
    DISTRICTS, CATEGORIES, STAGES, OPERATING_AREAS, CHALLENGES,
    NEEDS, FILE_CATEGORIES, HIGH_VALUE_NEEDS, STATUSES,
    STORAGE_KEY, DRAFT_KEY
  };
})();
