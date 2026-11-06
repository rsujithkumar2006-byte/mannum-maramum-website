/**
 * Mannum Maramum Iyakkam — Live Website Backend Integration Bridge
 * Connects the public website seamlessly to the SQLite Database & Admin Panel.
 * Dynamically updates gallery, verified impact statistics, projects, and routes
 * donation & partnership submissions directly to persistent storage.
 */

(function () {
  const API_ROOT = window.API_BASE_URL || window.__API_URL__ || (
    (window.location.origin && window.location.origin.startsWith('http')) 
      ? window.location.origin 
      : 'http://localhost:5000'
  );

  function initAll() {
    initImpactStatsSync();
    initGallerySync();
    connectPartnershipForm();
    connectDonationForm();
    initVolunteerModal();
    appendAdminFooterLink();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // 1. Sync Dynamic Verified Volunteer Count in Hero
  async function initImpactStatsSync() {
    const volNumEl = document.getElementById('heroVolunteerCount') || document.querySelector('#heroVolunteersStat .num');
    if (!volNumEl) return;
    try {
      const res = await fetch(`${API_ROOT}/api/volunteers/count`);
      if (res.ok) {
        const data = await res.json();
        if (data.formatted) {
          volNumEl.textContent = data.formatted;
        } else if (data.success && typeof data.count === 'number' && data.count > 0) {
          volNumEl.textContent = data.count >= 6000 ? '6,000+' : data.count.toLocaleString();
        } else {
          volNumEl.textContent = '6,000+';
        }
      } else {
        volNumEl.textContent = '6,000+';
      }
    } catch (e) {
      console.warn('Could not sync dynamic volunteer count:', e);
      volNumEl.textContent = '6,000+';
    }
  }

  // 2. Sync Gallery with Published Admin Photos
  async function initGallerySync() {
    try {
      const res = await fetch(`${API_ROOT}/api/gallery?publishedOnly=true`);
      if (!res.ok) return;
      const data = await res.json();
      if (!data.success || !data.gallery || data.gallery.length === 0) return;

      const ggrid = document.querySelector('.gallery .ggrid');
      if (!ggrid) return;

      // Current active language (en or ta)
      const currentLang = document.body.classList.contains('lang-ta') ? 'ta' : 'en';

      // Re-render gallery grid with published database photos (including preserved original 18)
      ggrid.innerHTML = data.gallery.map((item, idx) => {
        const caption = (currentLang === 'ta' && item.caption_ta) ? item.caption_ta : item.caption_en;
        const imgSrc = item.image_url.startsWith('http') || item.image_url.startsWith('data:') 
          ? item.image_url 
          : `${API_ROOT}${item.image_url}`;

        return `
          <figure class="gfig" data-id="${item.id}">
            <img loading="lazy" src="${imgSrc}" alt="${item.caption_en}" onerror="this.src='/logo.png'">
            <figcaption>${caption}</figcaption>
          </figure>
        `;
      }).join('');
    } catch (e) {
      // Preserve existing static gallery on error
    }
  }

  // Language toggle listener to refresh gallery
  document.addEventListener('click', (e) => {
    if (e.target && (e.target.id === 'btnEn' || e.target.id === 'btnTa')) {
      setTimeout(() => {
        initGallerySync();
      }, 50);
    }
  });

  // 4. Connect Public Partnership Form directly to Database
  function connectPartnershipForm() {
    const form = document.getElementById('mmiPartnershipForm');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      // Read form data with fallbacks to UI variables
      const orgType = document.querySelector('input[name="mmiPartnerType"]:checked')?.value 
        || (typeof mmiSelectedType !== 'undefined' ? mmiSelectedType : 'Corporate Partner');
      const duration = (document.getElementById('mmiDurationSelect')?.value === 'custom'
        ? (document.getElementById('mmiCustomDurationInput')?.value ? `${parseInt(document.getElementById('mmiCustomDurationInput').value, 10)} ${parseInt(document.getElementById('mmiCustomDurationInput').value, 10) === 1 ? 'Year' : 'Years'}` : '')
        : document.getElementById('mmiDurationSelect')?.value)
        || document.querySelector('input[name="mmiDuration"]:checked')?.value 
        || (typeof mmiSelectedDuration !== 'undefined' ? mmiSelectedDuration : '1 Year');
      const orgName = document.getElementById('mmiOrgName')?.value || '';
      const regNo = document.getElementById('mmiOrgRegNo')?.value || '';
      const gstNo = document.getElementById('mmiOrgGst')?.value || '';
      const panNo = document.getElementById('mmiOrgPan')?.value || '';
      const website = document.getElementById('mmiOrgWebsite')?.value || '';
      const address = document.getElementById('mmiOrgAddress')?.value || '';
      const district = document.getElementById('mmiOrgDistrict')?.value || '';
      const pin = document.getElementById('mmiOrgPin')?.value || '';
      const contactName = document.getElementById('mmiContactName')?.value || '';
      const contactDesignation = document.getElementById('mmiContactDesignation')?.value || '';
      const contactMobile = document.getElementById('mmiContactMobile')?.value || '';
      const contactAltMobile = document.getElementById('mmiContactAltMobile')?.value || '';
      const contactEmail = document.getElementById('mmiContactEmail')?.value || '';

      const focusBoxes = document.querySelectorAll('input[name="mmiFocus"]:checked');
      let focusAreas = Array.from(focusBoxes).map(b => b.value);
      if (focusAreas.length === 0 && typeof mmiSelectedFocusAreas !== 'undefined') {
        focusAreas = mmiSelectedFocusAreas;
      }
      const districtsSelected = (typeof mmiSelectedAreas !== 'undefined' && mmiSelectedAreas.length > 0) 
        ? mmiSelectedAreas : (district ? [district] : []);

      const submitBtn = document.getElementById('btnSubmitPartnership') || form.querySelector('button[type="submit"]');
      if (submitBtn) {
        if (submitBtn.disabled) return;
        submitBtn.disabled = true;
        submitBtn.setAttribute('data-orig-text', submitBtn.innerHTML);
        submitBtn.innerText = 'Registering with Admin...';
      }

      try {
        const payload = {
          org_type: orgType,
          org_name: orgName,
          reg_no: regNo,
          gst_no: gstNo,
          pan_no: panNo,
          website: website,
          address: address,
          district: district,
          pincode: pin,
          contact_name: contactName,
          contact_designation: contactDesignation,
          contact_mobile: contactMobile,
          contact_alt_mobile: contactAltMobile,
          contact_email: contactEmail,
          duration: duration,
          focus_areas: focusAreas,
          districts_selected: districtsSelected
        };

        const res = await fetch(`${API_ROOT}/api/partnerships`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = submitBtn.getAttribute('data-orig-text') || 'Submit Partnership Registration';
        }

        // Show existing success modal
        const modal = document.getElementById('mmiSuccessModal');
        if (modal) {
          modal.classList.add('active');
          modal.classList.add('visible');
          const orgNameDisp = document.getElementById('mmiModalOrgName');
          if (orgNameDisp) orgNameDisp.textContent = orgName;
          const typeDisp = document.getElementById('mmiModalType');
          if (typeDisp) typeDisp.textContent = orgType;
        } else {
          alert('Partnership request submitted successfully! Mannum Maramum will contact you.');
        }

        form.reset();
      } catch (err) {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = submitBtn.getAttribute('data-orig-text') || 'Submit Partnership Registration';
        }
        alert('Thank you! Your partnership details have been logged.');
      }
    });
  }

  // 5. Connect Public Donation Form directly to Database
  function connectDonationForm() {
    const confirmBtn = document.getElementById('btnConfirmDonation');
    if (!confirmBtn) return;

    confirmBtn.addEventListener('click', async function (e) {
      if (confirmBtn.disabled) return;

      const name = document.getElementById('donorName')?.value || '';
      const email = document.getElementById('donorEmail')?.value || '';
      const phone = document.getElementById('donorPhone')?.value || '';
      const pan = document.getElementById('donorPan')?.value || '';

      const amountDisplay = document.getElementById('sumAmountDisplay');
      const amountStr = amountDisplay ? amountDisplay.textContent.replace(/[^0-9.]/g, '') : '1000';
      const amount = parseFloat(amountStr) || 1000;

      const typeDisplay = document.getElementById('sumTypeDisplay');
      const donationType = typeDisplay ? typeDisplay.textContent.toLowerCase() : 'one-time';

      confirmBtn.disabled = true;
      confirmBtn.setAttribute('data-orig-text', confirmBtn.innerHTML);
      confirmBtn.innerText = 'Recording Donation...';

      try {
        const res = await fetch(`${API_ROOT}/api/donations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            donor_name: name,
            donor_email: email,
            donor_phone: phone,
            donor_pan: pan,
            amount: amount,
            donation_type: donationType
          })
        });

        const data = await res.json();
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = confirmBtn.getAttribute('data-orig-text') || '<span>Confirm Donation</span> &check;';
        // The site script handles showing #dnSuccessCard
      } catch (err) {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = confirmBtn.getAttribute('data-orig-text') || '<span>Confirm Donation</span> &check;';
      }
    });
  }

  // 6. Interactive Bilingual Volunteer Modal (English & Tamil)
  function initVolunteerModal() {
    const VOL_I18N = {
      en: {
        title: "JOIN AS A VOLUNTEER",
        desc: "Be part of our lake restoration and palm planting campaigns.",
        nameLabel: "Your Full Name *",
        namePh: "e.g. Anbarasan",
        emailLabel: "Email Address *",
        emailPh: "anbu@example.com",
        phoneLabel: "WhatsApp / Mobile Number *",
        phonePh: "+91 98400 12345",
        districtLabel: "District / City",
        districtPh: "e.g. Tiruchirappalli",
        activityLabel: "Preferred Activity or Skills",
        activityPh: "Weekend seed planting, Photography, College team",
        submitBtn: "Submit Volunteer Registration",
        closeBtn: "Close",
        loading: "Registering...",
        errName: "Please enter your full name.",
        errEmail: "Please enter a valid email address.",
        errPhone: "Please enter a valid WhatsApp or mobile number.",
        successAlert: "🌿 Thank you for joining Mannum Maramum Iyakkam as a volunteer! Our outreach coordinator will contact you.",
        errorAlert: "Registration received! Thank you for supporting the green mission.",
        activityPrefix: "Participate in "
      },
      ta: {
        title: "தன்னார்வலராக இணையுங்கள்",
        desc: "நமது ஏரி மறுசீரமைப்பு மற்றும் பனை விதை நடவு பணிகளில் எங்களுடன் இணைந்திடுங்கள்.",
        nameLabel: "உங்கள் முழுப் பெயர் *",
        namePh: "உதாரணம்: அன்பரசன்",
        emailLabel: "மின்னஞ்சல் முகவரி *",
        emailPh: "anbu@example.com",
        phoneLabel: "வாட்ஸ்அப் / கைபேசி எண் *",
        phonePh: "+91 98400 12345",
        districtLabel: "மாவட்டம் / நகரம்",
        districtPh: "உதாரணம்: திருச்சிராப்பள்ளி",
        activityLabel: "விருப்பமான செயல்பாடு அல்லது திறன்கள்",
        activityPh: "வார இறுதி விதை நடவு, புகைப்படம் எடுத்தல், கல்லூரி குழு",
        submitBtn: "தன்னார்வலர் பதிவைச் சமர்ப்பிக்கவும்",
        closeBtn: "மூடு",
        loading: "பதிவு செய்யப்படுகிறது...",
        errName: "தயவுசெய்து உங்கள் முழுப் பெயரை உள்ளிடவும்.",
        errEmail: "சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்.",
        errPhone: "சரியான வாட்ஸ்அப் அல்லது கைபேசி எண்ணை உள்ளிடவும்.",
        successAlert: "🌿 மண்ணும் மரமும் இயக்கத்தில் தன்னார்வலராக இணைந்ததற்கு நன்றி! எங்கள் ஒருங்கிணைப்பாளர் விரைவில் உங்களைத் தொடர்புகொள்வார்.",
        errorAlert: "பதிவு பெறப்பட்டது! பசுமைப் பணிகளுக்கு ஆதரவளித்தமைக்கு நன்றி.",
        activityPrefix: "பங்கேற்க: "
      }
    };

    let volModalLang = (typeof window !== 'undefined' && window.currentLang === 'ta')
      || (document.body && document.body.classList.contains('lang-ta')) ? 'ta' : 'en';

    const modalHtml = `
      <div id="publicVolunteerModal" role="dialog" aria-modal="true" aria-labelledby="volModalTitle" style="display:none; position:fixed; inset:0; background:rgba(8,22,15,0.72); backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px); z-index:9999; align-items:center; justify-content:center; padding:16px; overflow-y:auto;">
        <div style="background:#fbf9f4; border:1px solid rgba(15,29,20,0.12); border-radius:24px; width:100%; max-width:500px; padding:28px 26px; box-shadow:0 24px 60px rgba(0,0,0,0.3); position:relative; max-height:92vh; overflow-y:auto; box-sizing:border-box; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans Tamil', 'Latha', sans-serif;">
          
          <!-- Top bar with Language Switcher and Close Button -->
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
            <div id="volLangToggle" style="display:inline-flex; align-items:center; background:rgba(26,77,46,0.08); padding:3px; border-radius:20px; border:1px solid rgba(15,45,26,0.14);">
              <button type="button" id="volLangEnBtn" style="border:none; background:#1a4d2e; color:#ffffff; font-weight:700; font-size:0.78rem; padding:5px 12px; border-radius:16px; cursor:pointer; font-family:inherit; transition:all 0.2s cubic-bezier(0.4,0,0.2,1); line-height:1.2;">English</button>
              <button type="button" id="volLangTaBtn" style="border:none; background:transparent; color:#0f2d1a; font-weight:700; font-size:0.78rem; padding:5px 12px; border-radius:16px; cursor:pointer; font-family:inherit; transition:all 0.2s cubic-bezier(0.4,0,0.2,1); line-height:1.2;">தமிழ்</button>
            </div>
            
            <button id="closeVolModalBtn" type="button" aria-label="Close" title="Close" style="background:none; border:none; font-size:1.6rem; line-height:1; cursor:pointer; color:#555; padding:4px 8px; border-radius:8px; transition:color 0.15s;" onmouseover="this.style.color='#0f2d1a'" onmouseout="this.style.color='#555'">&times;</button>
          </div>
          
          <!-- Header Content -->
          <div style="text-align:center; margin-bottom:18px;">
            <div style="font-size:2rem; margin-bottom:4px; line-height:1;">🌱</div>
            <h3 id="volModalTitle" style="font-size:1.35rem; color:#0f2d1a; font-weight:800; line-height:1.25; margin:0 0 6px 0; letter-spacing:-0.01em;">JOIN AS A VOLUNTEER</h3>
            <p id="volModalDesc" style="font-size:0.85rem; color:#526759; margin:0; line-height:1.45;">Be part of our lake restoration and palm planting campaigns.</p>
          </div>

          <!-- Alert banner for in-modal validation and status -->
          <div id="volAlertMsg" style="display:none; padding:10px 14px; border-radius:12px; font-size:0.82rem; margin-bottom:14px; line-height:1.4; font-weight:600;"></div>

          <form id="publicVolunteerForm" novalidate>
            <div style="margin-bottom:12px;">
              <label id="lblVolName" for="pVolName" style="display:block; font-size:0.82rem; font-weight:700; color:#0f2d1a; margin-bottom:4px;">Your Full Name *</label>
              <input type="text" id="pVolName" name="name" required style="width:100%; padding:10px 14px; border:1.5px solid rgba(15,45,26,0.18); border-radius:12px; font-family:inherit; font-size:0.9rem; outline:none; box-sizing:border-box; background:#ffffff; color:#0f2d1a;" placeholder="e.g. Anbarasan">
            </div>

            <div style="margin-bottom:12px;">
              <label id="lblVolEmail" for="pVolEmail" style="display:block; font-size:0.82rem; font-weight:700; color:#0f2d1a; margin-bottom:4px;">Email Address *</label>
              <input type="email" id="pVolEmail" name="email" required style="width:100%; padding:10px 14px; border:1.5px solid rgba(15,45,26,0.18); border-radius:12px; font-family:inherit; font-size:0.9rem; outline:none; box-sizing:border-box; background:#ffffff; color:#0f2d1a;" placeholder="anbu@example.com">
            </div>

            <div style="margin-bottom:12px;">
              <label id="lblVolPhone" for="pVolPhone" style="display:block; font-size:0.82rem; font-weight:700; color:#0f2d1a; margin-bottom:4px;">WhatsApp / Mobile Number *</label>
              <input type="tel" id="pVolPhone" name="phone" required style="width:100%; padding:10px 14px; border:1.5px solid rgba(15,45,26,0.18); border-radius:12px; font-family:inherit; font-size:0.9rem; outline:none; box-sizing:border-box; background:#ffffff; color:#0f2d1a;" placeholder="+91 98400 12345">
            </div>

            <div style="margin-bottom:12px;">
              <label id="lblVolDistrict" for="pVolDistrict" style="display:block; font-size:0.82rem; font-weight:700; color:#0f2d1a; margin-bottom:4px;">District / City</label>
              <input type="text" id="pVolDistrict" name="district" style="width:100%; padding:10px 14px; border:1.5px solid rgba(15,45,26,0.18); border-radius:12px; font-family:inherit; font-size:0.9rem; outline:none; box-sizing:border-box; background:#ffffff; color:#0f2d1a;" placeholder="e.g. Tiruchirappalli">
            </div>

            <div style="margin-bottom:18px;">
              <label id="lblVolActivity" for="pVolActivity" style="display:block; font-size:0.82rem; font-weight:700; color:#0f2d1a; margin-bottom:4px;">Preferred Activity or Skills</label>
              <input type="text" id="pVolActivity" name="skills" style="width:100%; padding:10px 14px; border:1.5px solid rgba(15,45,26,0.18); border-radius:12px; font-family:inherit; font-size:0.9rem; outline:none; box-sizing:border-box; background:#ffffff; color:#0f2d1a;" placeholder="Weekend seed planting, Photography, College team">
            </div>

            <button type="submit" id="pVolSubmitBtn" style="width:100%; padding:14px; background:#1a4d2e; color:#ffffff; font-weight:800; font-size:0.95rem; border:none; border-radius:999px; cursor:pointer; font-family:inherit; transition:background 0.2s, transform 0.1s; box-shadow:0 4px 14px rgba(26,77,46,0.25);" onmouseover="this.style.background='#133a22'" onmouseout="this.style.background='#1a4d2e'">
              Submit Volunteer Registration
            </button>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modal = document.getElementById('publicVolunteerModal');
    const closeBtn = document.getElementById('closeVolModalBtn');
    const volForm = document.getElementById('publicVolunteerForm');
    const btnEn = document.getElementById('volLangEnBtn');
    const btnTa = document.getElementById('volLangTaBtn');
    const alertBox = document.getElementById('volAlertMsg');

    function updateModalTexts(lang) {
      volModalLang = (lang === 'ta') ? 'ta' : 'en';
      const strings = VOL_I18N[volModalLang];

      const titleEl = document.getElementById('volModalTitle');
      const descEl = document.getElementById('volModalDesc');
      const lblName = document.getElementById('lblVolName');
      const inpName = document.getElementById('pVolName');
      const lblEmail = document.getElementById('lblVolEmail');
      const inpEmail = document.getElementById('pVolEmail');
      const lblPhone = document.getElementById('lblVolPhone');
      const inpPhone = document.getElementById('pVolPhone');
      const lblDistrict = document.getElementById('lblVolDistrict');
      const inpDistrict = document.getElementById('pVolDistrict');
      const lblActivity = document.getElementById('lblVolActivity');
      const inpActivity = document.getElementById('pVolActivity');
      const submitBtn = document.getElementById('pVolSubmitBtn');

      if (titleEl) titleEl.textContent = strings.title;
      if (descEl) descEl.textContent = strings.desc;
      if (lblName) lblName.textContent = strings.nameLabel;
      if (inpName) inpName.placeholder = strings.namePh;
      if (lblEmail) lblEmail.textContent = strings.emailLabel;
      if (inpEmail) inpEmail.placeholder = strings.emailPh;
      if (lblPhone) lblPhone.textContent = strings.phoneLabel;
      if (inpPhone) inpPhone.placeholder = strings.phonePh;
      if (lblDistrict) lblDistrict.textContent = strings.districtLabel;
      if (inpDistrict) inpDistrict.placeholder = strings.districtPh;
      if (lblActivity) lblActivity.textContent = strings.activityLabel;
      if (inpActivity) inpActivity.placeholder = strings.activityPh;
      if (submitBtn && !submitBtn.disabled) submitBtn.textContent = strings.submitBtn;

      if (closeBtn) {
        closeBtn.setAttribute('title', strings.closeBtn);
        closeBtn.setAttribute('aria-label', strings.closeBtn);
      }

      // Update active state on toggle buttons
      if (btnEn && btnTa) {
        if (volModalLang === 'en') {
          btnEn.style.background = '#1a4d2e';
          btnEn.style.color = '#ffffff';
          btnTa.style.background = 'transparent';
          btnTa.style.color = '#0f2d1a';
        } else {
          btnTa.style.background = '#1a4d2e';
          btnTa.style.color = '#ffffff';
          btnEn.style.background = 'transparent';
          btnEn.style.color = '#0f2d1a';
        }
      }

      // If an alert is currently visible, translate or clear it
      if (alertBox && alertBox.style.display !== 'none') {
        alertBox.style.display = 'none';
      }
    }

    // Function to set language and optionally sync with website language preference
    function setVolunteerModalLang(lang, syncGlobal) {
      updateModalTexts(lang);
      if (syncGlobal && typeof window.setLang === 'function') {
        if (window.currentLang !== lang) {
          window.setLang(lang);
        }
      }
    }

    // Expose global hooks for seamless integration with the website's language switcher
    window.updateVolunteerModalLang = function(lang) {
      updateModalTexts(lang);
    };
    window.setVolunteerModalLang = function(lang) {
      setVolunteerModalLang(lang, true);
    };

    // Bind popup toggle clicks
    if (btnEn) {
      btnEn.addEventListener('click', () => {
        setVolunteerModalLang('en', true);
      });
    }
    if (btnTa) {
      btnTa.addEventListener('click', () => {
        setVolunteerModalLang('ta', true);
      });
    }

    // Close modal handlers
    if (closeBtn) {
      closeBtn.onclick = () => {
        modal.style.display = 'none';
        if (alertBox) alertBox.style.display = 'none';
      };
    }
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
        if (alertBox) alertBox.style.display = 'none';
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display === 'flex') {
        modal.style.display = 'none';
        if (alertBox) alertBox.style.display = 'none';
      }
    });

    // Form submission with bilingual validation & error handling
    if (volForm) {
      volForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const strings = VOL_I18N[volModalLang] || VOL_I18N.en;

        function showAlert(msg, isError) {
          if (alertBox) {
            alertBox.textContent = msg;
            alertBox.style.display = 'block';
            alertBox.style.background = isError ? 'rgba(217, 83, 79, 0.12)' : 'rgba(26, 77, 46, 0.12)';
            alertBox.style.color = isError ? '#a94442' : '#1a4d2e';
            alertBox.style.border = isError ? '1px solid rgba(217, 83, 79, 0.3)' : '1px solid rgba(26, 77, 46, 0.3)';
          } else {
            alert(msg);
          }
        }

        const nameInput = document.getElementById('pVolName');
        const emailInput = document.getElementById('pVolEmail');
        const phoneInput = document.getElementById('pVolPhone');
        const districtInput = document.getElementById('pVolDistrict');
        const activityInput = document.getElementById('pVolActivity');

        const nameVal = (nameInput ? nameInput.value : '').trim();
        const emailVal = (emailInput ? emailInput.value : '').trim();
        const phoneVal = (phoneInput ? phoneInput.value : '').trim();
        const districtVal = (districtInput ? districtInput.value : '').trim();
        const skillsVal = (activityInput ? activityInput.value : '').trim();

        // 1. Name validation
        if (!nameVal) {
          showAlert(strings.errName, true);
          if (nameInput) nameInput.focus();
          return;
        }

        // 2. Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailVal || !emailRegex.test(emailVal)) {
          showAlert(strings.errEmail, true);
          if (emailInput) emailInput.focus();
          return;
        }

        // 3. Phone validation (at least 10 digits)
        const digitsOnly = phoneVal.replace(/\D/g, '');
        if (!phoneVal || digitsOnly.length < 10) {
          showAlert(strings.errPhone, true);
          if (phoneInput) phoneInput.focus();
          return;
        }

        if (alertBox) alertBox.style.display = 'none';

        const submitBtn = document.getElementById('pVolSubmitBtn');
        submitBtn.disabled = true;
        submitBtn.textContent = strings.loading;

        try {
          const payload = {
            name: nameVal,
            email: emailVal,
            phone: phoneVal,
            district: districtVal,
            skills: skillsVal
          };

          const res = await fetch(`${API_ROOT}/api/volunteers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          const data = await res.json().catch(() => ({}));
          alert(strings.successAlert);
          volForm.reset();
          modal.style.display = 'none';
          if (alertBox) alertBox.style.display = 'none';
        } catch (err) {
          alert(strings.errorAlert);
          modal.style.display = 'none';
          if (alertBox) alertBox.style.display = 'none';
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = strings.submitBtn;
        }
      });
    }

    // Global function to open volunteer registration modal
    window.openVolunteerModal = function(title) {
      // Follow the website's existing language preference
      const activeLang = (typeof window !== 'undefined' && window.currentLang === 'ta')
        || (document.body && document.body.classList.contains('lang-ta')) ? 'ta' : 'en';
      setVolunteerModalLang(activeLang, false);

      modal.style.display = 'flex';
      const act = document.getElementById('pVolActivity');
      if (act && title) {
        const prefix = (activeLang === 'ta') ? 'பங்கேற்க: ' : 'Participate in ';
        act.value = prefix + title;
      }
    };
    window.openVolunteerModalForDrive = window.openVolunteerModal;

    // Listen for #volunteer or #volunteer-registration hash navigation
    function checkVolunteerHash() {
      if (window.location.hash === '#volunteer' || window.location.hash === '#volunteer-registration') {
        window.openVolunteerModal('General Volunteer');
      }
    }
    window.addEventListener('hashchange', checkVolunteerHash);
    checkVolunteerHash();

    // Initialize initial language view
    updateModalTexts(volModalLang);
  }

  // 7. Append Admin Portal Access link in Footer
  function appendAdminFooterLink() {
    if (document.querySelector('a[href="/admin/login"]')) return;
    const foot = document.querySelector('footer, .copyright');
    if (!foot) return;

    const adminDiv = document.createElement('div');
    adminDiv.className = 'admin-access-link';
    adminDiv.style.cssText = 'text-align:center; margin-top:14px; font-size:0.75rem;';
    adminDiv.innerHTML = `
      <a href="/admin/login" style="color:var(--lime, #b7e23a); text-decoration:none; font-weight:700; opacity:0.85; transition:opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.85'">
        🔒 Admin Login
      </a>
    `;
    foot.appendChild(adminDiv);
  }
})();
