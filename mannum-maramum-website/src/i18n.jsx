import React, { createContext, useContext, useState } from "react";

// ---------------------------------------------------------------------------
// All site copy lives here, in English and Tamil, keyed by section.
// Edit this file to change any wording on the site.
// ---------------------------------------------------------------------------

export const content = {
  nav: {
    home: { en: "Home", ta: "முகப்பு" },
    about: { en: "About Us", ta: "எங்களைப் பற்றி" },
    activities: { en: "Our Activities", ta: "எங்கள் செயல்பாடுகள்" },
    goGreen: { en: "Go Green", ta: "இயற்கையுடன்" },
    impact: { en: "Our Impact", ta: "எங்கள் தாக்கம்" },
    projects: { en: "Projects", ta: "திட்டங்கள்" },
    palmTrees: { en: "Palm Trees", ta: "பனை மரங்கள்" },
    locations: { en: "Locations", ta: "இடங்கள்" },
    team: { en: "Our Team", ta: "எங்கள் குழு" },
    awards: { en: "Awards", ta: "விருதுகள்" },
    upcoming: { en: "Upcoming", ta: "வரும் திட்டங்கள்" },
    join: { en: "Join Us", ta: "எங்களுடன் இணையுங்கள்" },
    contact: { en: "Contact", ta: "தொடர்பு" },
  },

  hero: {
    org: { en: "Mannum Maramum Iyakkam", ta: "மண்ணும் மரமும் இயக்கம்" },
    headline: { en: "Let's Heal the Earth", ta: "பூமியை மீட்டெடுப்போம்" },
    sub: {
      en: "Together, we can grow a greener future.",
      ta: "நாம் அனைவரும் சேர்ந்து பசுமையான எதிர்காலத்தை உருவாக்கலாம்.",
    },
    ctaPrimary: { en: "Explore Our Work", ta: "எங்கள் பணியைப் பார்க்க" },
    ctaSecondary: { en: "Join an Activity", ta: "ஒரு செயலில் இணைய" },
    since: { en: "Since 2019", ta: "2019 முதல்" },
  },

  stats: {
    seeds: { en: "Palm Tree Seeds", ta: "பனை விதைகள்" },
    seedsValue: { en: "14 Lakhs+", ta: "14 லட்சத்திற்கும் மேல்" },
    trees: { en: "Trees Planted", ta: "நடப்பட்ட மரங்கள்" },
    treesValue: { en: "42,500+", ta: "42,500+" },
    since: { en: "Working Since", ta: "செயல்பாட்டில்" },
    sinceValue: { en: "2019", ta: "2019" },
    locations: { en: "Plantation Locations", ta: "நடவு செய்யப்பட்ட இடங்கள்" },
    locationsValue: { en: "9+", ta: "9+" },
    note: {
      en: "Figures as documented by Mannum Maramum Iyakkam.",
      ta: "மண்ணும் மரமும் இயக்கம் பதிவு செய்த புள்ளிவிவரங்கள்.",
    },
  },

  about: {
    eyebrow: { en: "Who we are", ta: "நாங்கள் யார்" },
    title: { en: "A movement rooted in the soil of Trichy", ta: "திருச்சி மண்ணில் வேரூன்றிய ஓர் இயக்கம்" },
    body: {
      en: "Mannum Maramum Iyakkam (Registration No. 16/2023) is a non-profit environmental organisation based in Tiruchirappalli, Tamil Nadu. Since 2019, we've worked with local communities to plant trees, restore lakes, and bring back native greenery — one seed at a time.",
      ta: "மண்ணும் மரமும் இயக்கம் (பதிவு எண். 16/2023) திருச்சிராப்பள்ளியை மையமாகக் கொண்ட ஒரு தன்னார்வ சுற்றுச்சூழல் அமைப்பு. 2019 முதல், உள்ளூர் மக்களுடன் இணைந்து மரங்கள் நடுதல், ஏரிகளை புத்துயிர் பெறச் செய்தல், நாட்டு மரங்களை மீண்டும் வளர்த்தல் ஆகியவற்றைச் செய்து வருகிறோம்.",
    },
    visionLabel: { en: "Vision", ta: "நோக்கம்" },
    vision: {
      en: "PRISM — Promoting Rapid Greeneries for Sustainable Development through Mass Plantations.",
      ta: "PRISM — வெகுஜன நடவு மூலம் நிலையான வளர்ச்சிக்கான விரைவான பசுமையை மேம்படுத்துதல்.",
    },
    missionLabel: { en: "Mission", ta: "பணி" },
    mission: {
      en: "1 crore palm tree seeds and 1 lakh trees, by 2030.",
      ta: "2030-க்குள் 1 கோடி பனை விதைகளும் 1 லட்சம் மரங்களும்.",
    },
    valuesLabel: { en: "What guides us", ta: "எங்களை வழிநடத்துவது" },
    values: [
      { en: "Dedication", ta: "அர்ப்பணிப்பு" },
      { en: "Teamwork", ta: "குழுப்பணி" },
      { en: "Striving for new challenges", ta: "புதிய சவால்களை எதிர்கொள்ளுதல்" },
    ],
  },

  activities: {
    eyebrow: { en: "Documented work", ta: "பதிவு செய்யப்பட்ட பணி" },
    title: { en: "What we do on the ground", ta: "நாங்கள் நிலத்தில் செய்வது" },
    items: [
      {
        icon: "sprout",
        title: { en: "Tree Sapling Plantation", ta: "மர நாற்று நடவு" },
        desc: { en: "Growing and planting native tree saplings across the region.", ta: "பிராந்தியம் முழுவதும் நாட்டு மர நாற்றுகளை வளர்த்து நடுதல்." },
      },
      {
        icon: "palm",
        title: { en: "Palm Seed Plantation", ta: "பனை விதை நடவு" },
        desc: { en: "Collecting and planting palm seeds along rivers, lakes and canals.", ta: "ஆறுகள், ஏரிகள், கால்வாய்கள் ஓரமாக பனை விதைகளை சேகரித்து நடுதல்." },
      },
      {
        icon: "water-drop",
        title: { en: "Sapling Maintenance & Watering", ta: "நாற்று பராமரிப்பு & நீர்ப்பாசனம்" },
        desc: { en: "Regular watering, nurturing and organic care for young saplings.", ta: "இளம் நாற்றுகளுக்கு தொடர்ந்து நீர் ஊற்றுதல் மற்றும் இயற்கை பராமரிப்பு." },
      },
      {
        icon: "lake",
        title: { en: "Lake Rejuvenation", ta: "ஏரி புத்துயிர்ப்பு" },
        desc: { en: "Desilting, bund strengthening and creating islands for tree planting.", ta: "வண்டல் அகற்றுதல், கரை வலுப்படுத்துதல், மரம் நடும் தீவுகள் உருவாக்குதல்." },
      },
      {
        icon: "leaf",
        title: { en: "Soil & Water Conservation", ta: "மண் & நீர் பாதுகாப்பு" },
        desc: { en: "Protecting soil health and water bodies through native plantation.", ta: "நாட்டு நடவு மூலம் மண் வளத்தையும் நீர்நிலைகளையும் பாதுகாத்தல்." },
      },
      {
        icon: "no-plastic",
        title: { en: "Single-Use Plastic Awareness", ta: "ஒரு முறை பயன்பாட்டு பிளாஸ்டிக் விழிப்புணர்வு" },
        desc: { en: "Community campaigns to reduce single-use plastic.", ta: "ஒரு முறை பயன்பாட்டு பிளாஸ்டிக்கைக் குறைக்க சமூக பிரச்சாரங்கள்." },
      },
      {
        icon: "people",
        title: { en: "Community & Student Participation", ta: "சமூகம் & மாணவர் பங்கேற்பு" },
        desc: { en: "Involving students and local residents in every plantation drive.", ta: "ஒவ்வொரு நடவு பணியிலும் மாணவர்களையும் உள்ளூர் மக்களையும் இணைத்தல்." },
      },
    ],
  },

  genz: {
    eyebrow: { en: "A new way to experience nature", ta: "இயற்கையை அனுபவிக்க ஒரு புதிய வழி" },
    title: { en: "Go Green — Live Nature", ta: "இயற்கையுடன் வாழுங்கள்" },
    tagline: { en: "Don't just scroll. Step outside.", ta: "ஸ்க்ரோல் செய்யாதே. வெளியே வா." },
    disclaimer: {
      en: "These are proposed experiences we'd love our community to try — not official Mannum Maramum Iyakkam programs.",
      ta: "இவை எங்கள் சமூகம் முயற்சிக்க வேண்டும் என்று நினைக்கும் யோசனைகள் — மண்ணும் மரமும் இயக்கத்தின் அதிகாரப்பூர்வ திட்டங்கள் அல்ல.",
    },
    items: [
      { icon: "☀️", title: { en: "Sun Bathing", ta: "வெயில் குளியல்" }, desc: { en: "A few peaceful minutes in the morning sun.", ta: "காலை வெயிலில் சில அமைதியான நிமிடங்கள்." } },
      { icon: "🥾", title: { en: "Green Trekking", ta: "பசுமை நடைபயணம்" }, desc: { en: "Walk through green spaces and enjoy the journey.", ta: "பசுமையான இடங்களில் நடந்து பயணத்தை அனுபவியுங்கள்." } },
      { icon: "🌬️", title: { en: "Good Breathing", ta: "நல்ல சுவாசம்" }, desc: { en: "A slow walk among trees, breathing calm outdoor air.", ta: "மரங்களுக்கு இடையே மெதுவாக நடந்து சுவாசியுங்கள்." } },
      { icon: "🌳", title: { en: "Tree Hugging", ta: "மரத்தை அணைத்தல்" }, desc: { en: "A quiet moment with a tree, reconnecting with nature.", ta: "ஒரு மரத்துடன் அமைதியான தருணம்." } },
      { icon: "🌱", title: { en: "Plant a Tree", ta: "ஒரு மரம் நடுங்கள்" }, desc: { en: "Make your own green contribution and watch it grow.", ta: "உங்கள் சொந்த பசுமை பங்களிப்பைச் செய்யுங்கள்." } },
      { icon: "🌴", title: { en: "Palm Seed Walk", ta: "பனை விதை நடை" }, desc: { en: "Explore nature while learning to plant palm seeds.", ta: "பனை விதைகளை நடவு செய்யக் கற்றுக்கொள்ளுங்கள்." } },
      { icon: "📸", title: { en: "Nature Photography", ta: "இயற்கை புகைப்படம்" }, desc: { en: "Capture trees, birds and beautiful natural moments.", ta: "மரங்கள், பறவைகள், இயற்கை தருணங்களைப் படம் பிடியுங்கள்." } },
      { icon: "🐦", title: { en: "Bird Watching", ta: "பறவை பார்வையிடல்" }, desc: { en: "Observe birds and the life trees support.", ta: "பறவைகளையும் மரங்கள் ஆதரிக்கும் வாழ்க்கையையும் கவனியுங்கள்." } },
      { icon: "🌅", title: { en: "Sunrise Walk", ta: "சூரிய உதய நடை" }, desc: { en: "Start your day with a peaceful outdoor walk.", ta: "அமைதியான நடையுடன் உங்கள் நாளைத் தொடங்குங்கள்." } },
      { icon: "💧", title: { en: "Water & Nature", ta: "நீரும் இயற்கையும்" }, desc: { en: "Visit lakes and learn why protecting them matters.", ta: "ஏரிகளைப் பாதுகாப்பதன் முக்கியத்துவத்தை அறியுங்கள்." } },
      { icon: "🧹", title: { en: "Green Cleanup", ta: "பசுமை சுத்தம்" }, desc: { en: "Join friends to clean up a natural area.", ta: "நண்பர்களுடன் ஒரு இயற்கை இடத்தைச் சுத்தம் செய்யுங்கள்." } },
      { icon: "👥", title: { en: "Plant With Friends", ta: "நண்பர்களுடன் நடவு" }, desc: { en: "Turn tree planting into a group activity.", ta: "மர நடவை ஒரு குழு செயலாக மாற்றுங்கள்." } },
    ],
  },

  registration: {
    eyebrow: { en: "Proposed feature", ta: "முன்மொழியப்பட்ட அம்சம்" },
    title: { en: "Join an Activity", ta: "ஒரு செயலில் இணையுங்கள்" },
    desc: {
      en: "Pick an activity near you and sign up. Registration is a planned website feature.",
      ta: "உங்களுக்கு அருகில் உள்ள ஒரு செயலைத் தேர்ந்தெடுத்து பதிவு செய்யுங்கள். இது இணையதளத்தில் திட்டமிடப்பட்ட அம்சம்.",
    },
    fields: {
      name: { en: "Name", ta: "பெயர்" },
      phone: { en: "Phone", ta: "தொலைபேசி எண்" },
      email: { en: "Email", ta: "மின்னஞ்சல்" },
      activity: { en: "Activity", ta: "செயல்பாடு" },
      location: { en: "Location", ta: "இடம்" },
      date: { en: "Preferred date", ta: "விருப்பமான தேதி" },
    },
    submit: { en: "Join Activity", ta: "செயலில் இணை" },
    success: { en: "You're part of the Green Team! 🌱", ta: "நீங்கள் பசுமைக் குழுவின் ஒரு பகுதி! 🌱" },
  },

  proof: {
    eyebrow: { en: "Proposed feature", ta: "முன்மொழியப்பட்ட அம்சம்" },
    title: { en: "Share Your Activity", ta: "உங்கள் செயலைப் பகிருங்கள்" },
    desc: {
      en: "Finished an activity? Upload a photo and tell us about it.",
      ta: "ஒரு செயலை முடித்துவிட்டீர்களா? புகைப்படத்துடன் எங்களுக்குச் சொல்லுங்கள்.",
    },
    fields: {
      photo: { en: "Upload Photo", ta: "புகைப்படத்தைப் பதிவேற்று" },
      activity: { en: "Activity Details", ta: "செயல் விவரங்கள்" },
      location: { en: "Location", ta: "இடம்" },
      date: { en: "Date", ta: "தேதி" },
    },
    submit: { en: "Submit", ta: "சமர்ப்பிக்க" },
    success: { en: "Thanks for sharing — well done! 🌿", ta: "பகிர்ந்ததற்கு நன்றி — அருமை! 🌿" },
  },

  greenPoints: {
    eyebrow: { en: "Proposed feature", ta: "முன்மொழியப்பட்ட அம்சம்" },
    title: { en: "Green Points", ta: "பசுமை புள்ளிகள்" },
    desc: {
      en: "A friendly way to track your contribution — a proposed feature, not a current official programme.",
      ta: "உங்கள் பங்களிப்பைக் கண்காணிக்க ஒரு எளிய வழி — இது முன்மொழியப்பட்ட அம்சம், தற்போதைய அதிகாரப்பூர்வ திட்டம் அல்ல.",
    },
    scoring: [
      { label: { en: "Tree Planting", ta: "மர நடவு" }, points: "+100" },
      { label: { en: "Palm Seed Activity", ta: "பனை விதை செயல்" }, points: "+50" },
      { label: { en: "Lake Cleanup", ta: "ஏரி சுத்தம்" }, points: "+100" },
      { label: { en: "Nature Walk", ta: "இயற்கை நடை" }, points: "+20" },
    ],
    badgesLabel: { en: "Badges", ta: "பேட்ஜ்கள்" },
    badges: [
      { en: "Green Starter", ta: "பசுமை தொடக்கநிலை" },
      { en: "Nature Friend", ta: "இயற்கை நண்பன்" },
      { en: "Green Champion", ta: "பசுமை சாம்பியன்" },
      { en: "Earth Guardian", ta: "பூமி காவலன்" },
    ],
  },

  impact: {
    eyebrow: { en: "Documented impact", ta: "பதிவு செய்யப்பட்ட தாக்கம்" },
    title: { en: "Our impact so far", ta: "இதுவரையிலான எங்கள் தாக்கம்" },
    highlightsLabel: { en: "Project highlights", ta: "திட்ட சிறப்பம்சங்கள்" },
    highlights: [
      { en: "Cauvery bank palm seed plantation", ta: "காவிரி கரை பனை விதை நடவு" },
      { en: "BHEL plantation", ta: "BHEL நடவு" },
      { en: "JJ Polytechnic College plantation", ta: "JJ பாலிடெக்னிக் கல்லூரி நடவு" },
      { en: "Koothappar activities", ta: "கூத்தப்பர் செயல்பாடுகள்" },
      { en: "Uyyakondan Canal", ta: "உய்யக்கொண்டான் கால்வாய்" },
      { en: "Government Arts College", ta: "அரசு கலைக் கல்லூரி" },
      { en: "Thiruverumbur Railway Station", ta: "திருவெறும்பூர் ரயில் நிலையம்" },
      { en: "Thirunedungulam Lake", ta: "திருநெடுங்குளம் ஏரி" },
      { en: "Kambarasampettai", ta: "கம்பராசம்பேட்டை" },
    ],
  },

  projects: {
    eyebrow: { en: "On the ground", ta: "களத்தில்" },
    title: { en: "Projects", ta: "திட்டங்கள்" },
    note: {
      en: "Details shown only where documented; dates and numbers are not estimated.",
      ta: "பதிவு செய்யப்பட்டவை மட்டுமே காட்டப்படுகின்றன; தேதிகள் மற்றும் எண்கள் யூகிக்கப்படவில்லை.",
    },
    items: [
      { name: { en: "Cauvery Bank Plantation", ta: "காவிரி கரை நடவு" }, location: { en: "Trichy", ta: "திருச்சி" }, work: { en: "Palm seed plantation along the riverbank.", ta: "ஆற்றின் கரையோரம் பனை விதை நடவு." } },
      { name: { en: "BHEL Plantation", ta: "BHEL நடவு" }, location: { en: "Trichy", ta: "திருச்சி" }, work: { en: "Native tree sapling plantation drive.", ta: "நாட்டு மர நாற்று நடவு பணி." } },
      { name: { en: "JJ Polytechnic College", ta: "JJ பாலிடெக்னிக் கல்லூரி" }, location: { en: "Trichy", ta: "திருச்சி" }, work: { en: "Student-participated plantation.", ta: "மாணவர் பங்கேற்புடன் நடவு." } },
      { name: { en: "Thiruverumbur Railway Station", ta: "திருவெறும்பூர் ரயில் நிலையம்" }, location: { en: "Trichy", ta: "திருச்சி" }, work: { en: "Ongoing maintenance of ~175 native saplings.", ta: "சுமார் 175 நாட்டு நாற்றுகளின் தொடர் பராமரிப்பு." } },
      { name: { en: "Thirunedungulam Lake", ta: "திருநெடுங்குளம் ஏரி" }, location: { en: "Trichy district", ta: "திருச்சி மாவட்டம்" }, work: { en: "Lake rejuvenation activity.", ta: "ஏரி புத்துயிர்ப்பு செயல்பாடு." } },
      { name: { en: "2024–25 Project", ta: "2024–25 திட்டம்" }, location: { en: "Trichy region", ta: "திருச்சி பகுதி" }, work: { en: "3 lakh palm seeds and 2,500 native tree saplings planted, with community participation.", ta: "3 லட்சம் பனை விதைகள் மற்றும் 2,500 நாட்டு மர நாற்றுகள் சமூக பங்கேற்புடன் நடப்பட்டன." } },
    ],
  },

  palmTrees: {
    eyebrow: { en: "Learn more", ta: "மேலும் அறிய" },
    title: { en: "Why palm trees?", ta: "ஏன் பனை மரங்கள்?" },
    reasons: [
      { title: { en: "Environment", ta: "சுற்றுச்சூழல்" }, desc: { en: "Hardy, low-maintenance trees suited to Tamil Nadu's climate.", ta: "தமிழ்நாட்டின் காலநிலைக்கு ஏற்ற, எளிதில் வளரக்கூடிய மரங்கள்." } },
      { title: { en: "Biodiversity", ta: "பல்லுயிர் தன்மை" }, desc: { en: "Support birds and local ecosystems along waterways.", ta: "நீர்நிலைகள் வழியே பறவைகள் மற்றும் உள்ளூர் சூழலுக்கு ஆதரவு." } },
      { title: { en: "Soil & Water", ta: "மண் & நீர்" }, desc: { en: "Deep roots help prevent erosion and support groundwater.", ta: "ஆழமான வேர்கள் மண் அரிப்பைத் தடுத்து நிலத்தடி நீரை பாதுகாக்கும்." } },
      { title: { en: "Rural Livelihood", ta: "கிராமப்புற வாழ்வாதாரம்" }, desc: { en: "A source of income through palm-based products.", ta: "பனை பொருட்கள் மூலம் வருமான ஆதாரம்." } },
    ],
    productsLabel: { en: "Palm products", ta: "பனை பொருட்கள்" },
    products: [
      { en: "Neera", ta: "நீரா" },
      { en: "Palm Jaggery", ta: "பனை வெல்லம்" },
      { en: "Palm Sugar", ta: "பனை சர்க்கரை" },
      { en: "Palm Candy", ta: "பனை கற்கண்டு" },
      { en: "Nungu", ta: "நுங்கு" },
      { en: "Palm Fruit Jam", ta: "பனம்பழ ஜாம்" },
      { en: "Palm Chocolate", ta: "பனை சாக்லேட்" },
      { en: "Palm Leaf & Fibre Products", ta: "பனை ஓலை & நார் பொருட்கள்" },
    ],
  },

  locations: {
    eyebrow: { en: "Where we work", ta: "நாங்கள் பணிபுரியும் இடங்கள்" },
    title: { en: "Plantation locations", ta: "நடவு செய்யப்பட்ட இடங்கள்" },
    list: [
      { en: "Trichy", ta: "திருச்சி" },
      { en: "Ranipet", ta: "ராணிப்பேட்டை" },
      { en: "Vellore", ta: "வேலூர்" },
      { en: "Pudukkottai", ta: "புதுக்கோட்டை" },
      { en: "Chennai", ta: "சென்னை" },
      { en: "Coimbatore", ta: "கோயம்புத்தூர்" },
      { en: "Thanjavur", ta: "தஞ்சாவூர்" },
      { en: "Vedaranyam", ta: "வேதாரண்யம்" },
      { en: "Ariyalur", ta: "அரியலூர்" },
    ],
  },

  team: {
    eyebrow: { en: "Behind the work", ta: "பணியின் பின்னணி" },
    title: { en: "Our team", ta: "எங்கள் குழு" },
    note: {
      en: "Team structure as documented for Trichy operations.",
      ta: "திருச்சி செயல்பாடுகளுக்கான குழு அமைப்பு பதிவு செய்யப்பட்டவாறு.",
    },
    groups: [
      { title: { en: "Lake Renovation Coordination", ta: "ஏரி புனரமைப்பு ஒருங்கிணைப்பு" }, desc: { en: "Seemai karuvelam removal, bund strengthening, desilting, island creation.", ta: "சீமை கருவேலம் அகற்றுதல், கரை வலுப்படுத்துதல், தீவு உருவாக்கம்." } },
      { title: { en: "Tree Sapling Rearing & Nursery", ta: "மர நாற்று வளர்ப்பு & நர்சரி" }, desc: { en: "Selecting native seedlings, growing, watering, organic nutrients.", ta: "நாட்டு நாற்றுகள் தேர்வு, வளர்ப்பு, நீர்ப்பாசனம், இயற்கை உரம்." } },
      { title: { en: "Palm Seed Collection", ta: "பனை விதை சேகரிப்பு" }, desc: { en: "Collecting seeds around Trichy, preserving until rainy season.", ta: "திருச்சி சுற்றுவட்டாரத்தில் விதை சேகரிப்பு, மழைக்காலம் வரை பாதுகாப்பு." } },
      { title: { en: "Palm Seed Planting", ta: "பனை விதை நடவு" }, desc: { en: "Planting along rivers, lakes, ponds, canals; supplying seeds to other districts.", ta: "ஆறு, ஏரி, குளம், கால்வாய் ஓரம் நடவு; பிற மாவட்டங்களுக்கு விதை வழங்குதல்." } },
      { title: { en: "Railway Station Maintenance", ta: "ரயில் நிலைய பராமரிப்பு" }, desc: { en: "Maintaining around 175 native saplings at Thiruverumbur.", ta: "திருவெறும்பூரில் சுமார் 175 நாட்டு நாற்றுகளின் பராமரிப்பு." } },
      { title: { en: "IT Team", ta: "தகவல் தொழில்நுட்பக் குழு" }, desc: { en: "Website development & maintenance, event photography, award-submission prep.", ta: "இணையதள மேம்பாடு & பராமரிப்பு, நிகழ்வு புகைப்படம், விருது விண்ணப்பங்கள்." } },
    ],
  },

  awards: {
    eyebrow: { en: "Recognition", ta: "அங்கீகாரம்" },
    title: { en: "Awards & recognition", ta: "விருதுகள் & அங்கீகாரம்" },
    items: [
      { en: "Green Champion Award — 2021", ta: "கிரீன் சாம்பியன் விருது — 2021" },
      { en: "Nammalvar Award — 2022", ta: "நம்மாழ்வார் விருது — 2022" },
      { en: "Thamizagathin Thanigarilla Thanarvalar — 2022", ta: "தமிழகத்தின் தனிகரில்லா தளர்வாளர் — 2022" },
      { en: "Nature & Humanity Award — 2023", ta: "இயற்கை & மனிதநேய விருது — 2023" },
      { en: "Recognition from Vellore Corporation Mayor", ta: "வேலூர் மாநகராட்சி மேயர் பாராட்டு" },
      { en: "Recognition from Abdul Kalam Kanavugal Team", ta: "அப்துல் கலாம் கனவுகள் குழு பாராட்டு" },
      { en: "Recognition from Abdul Kalam Pasumai Iyakkam", ta: "அப்துல் கலாம் பசுமை இயக்கம் பாராட்டு" },
      { en: "Collaboration with Kumunting Tamil School, Malaysia", ta: "மலேசியா கும்திங் தமிழ்ப் பள்ளியுடன் ஒத்துழைப்பு" },
    ],
  },

  gallery: {
    eyebrow: { en: "In pictures", ta: "படங்களில்" },
    title: { en: "Gallery", ta: "படத்தொகுப்பு" },
    placeholder: {
      en: "Event and plantation photos will appear here.",
      ta: "நிகழ்வு மற்றும் நடவு புகைப்படங்கள் இங்கே இடம்பெறும்.",
    },
  },

  upcoming: {
    eyebrow: { en: "What's next", ta: "அடுத்து என்ன" },
    title: { en: "Upcoming projects", ta: "வரவிருக்கும் திட்டங்கள்" },
    items: [
      { en: "Lake rejuvenation at Sooriyur, Trichy", ta: "சூரியூர், திருச்சியில் ஏரி புத்துயிர்ப்பு" },
      { en: "4 lakh palm tree seeds planting", ta: "4 லட்சம் பனை விதைகள் நடவு" },
      { en: "5,000 tree saplings plantation", ta: "5,000 மர நாற்றுகள் நடவு" },
      { en: "Awareness for 5,000 students/public on single-use plastic", ta: "5,000 மாணவர்கள்/பொதுமக்களுக்கு பிளாஸ்டிக் விழிப்புணர்வு" },
      { en: "Lake rejuvenation at Koothappar, Trichy", ta: "கூத்தப்பர், திருச்சியில் ஏரி புத்துயிர்ப்பு" },
    ],
  },

  join: {
    eyebrow: { en: "Get involved", ta: "பங்களியுங்கள்" },
    title: { en: "Join us", ta: "எங்களுடன் இணையுங்கள்" },
    options: [
      { icon: "hand", title: { en: "Volunteer", ta: "தன்னார்வலராக" }, desc: { en: "Join plantation and environmental activities.", ta: "நடவு மற்றும் சுற்றுச்சூழல் செயல்பாடுகளில் இணையுங்கள்." } },
      { icon: "heart", title: { en: "Support", ta: "ஆதரவளிக்க" }, desc: { en: "Contribute financially to plantation projects.", ta: "நடவு திட்டங்களுக்கு நிதி உதவி செய்யுங்கள்." } },
      { icon: "megaphone", title: { en: "Propagate", ta: "பரப்புரை செய்ய" }, desc: { en: "Spread awareness and spot local greenery opportunities.", ta: "விழிப்புணர்வைப் பரப்பி, உள்ளூர் பசுமை வாய்ப்புகளைக் கண்டறியுங்கள்." } },
    ],
  },

  contact: {
    eyebrow: { en: "Reach us", ta: "எங்களை அடைய" },
    title: { en: "Contact", ta: "தொடர்பு" },
    org: { en: "Mannum Maramum Iyakkam", ta: "மண்ணும் மரமும் இயக்கம்" },
    founderLabel: { en: "Founder & Organiser", ta: "நிறுவனர் & ஏற்பாட்டாளர்" },
    founder: { en: "K. Raju", ta: "கே. ராஜு" },
    addressLabel: { en: "Address", ta: "முகவரி" },
    address: {
      en: "4th Cross West, Balaji Nagar, Trichy – 620019, Tamil Nadu, India",
      ta: "4வது குறுக்குத் தெரு மேற்கு, பாலாஜி நகர், திருச்சி – 620019, தமிழ்நாடு, இந்தியா",
    },
    phone: "+91 94422 08894",
    email: "krajubhel01@gmail.com",
  },

  footer: {
    tagline: { en: "Let's heal the earth, together.", ta: "பூமியை ஒன்றாக மீட்டெடுப்போம்." },
    quickLinks: { en: "Quick Links", ta: "விரைவு இணைப்புகள்" },
    rights: { en: "All rights reserved.", ta: "அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை." },
  },
};

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState("en");
  const toggleLang = () => setLang((l) => (l === "en" ? "ta" : "en"));

  // t(node) resolves a { en, ta } object (or array of them) to the current language.
  const t = (node) => {
    if (node == null) return "";
    if (typeof node === "string") return node;
    return node[lang] ?? node.en ?? "";
  };

  return (
    <LangContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within a LangProvider");
  return ctx;
}
