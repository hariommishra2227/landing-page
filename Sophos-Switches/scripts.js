(function () {
  window.dataLayer = window.dataLayer || [];

function pushEvent(name, details) {
    window.dataLayer.push(Object.assign({ event: name }, details || {}));
  }

  function getProduct() {
    return document.body.dataset.product || document.title || 'Sophos product';
  }

  function getUtmParams() {
    var params = new URLSearchParams(window.location.search);

    return {
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || '',
      utm_term: params.get('utm_term') || '',
      utm_content: params.get('utm_content') || ''
    };
  }

  function getReferenceText(productName) {
    var referenceMap = {
      'Sophos MDR': 'Reference: Sophos MDR Quote Request',
      'Sophos XDR': 'Reference: Sophos XDR Quote Request',
      'Sophos Firewall': 'Reference: Sophos Firewall Sizing Request',
      'Sophos Email Security': 'Reference: Sophos Email Security Quote Request',
      'Sophos Wireless': 'Reference: Sophos Wireless Consultation Request',
      'Sophos Wireless Access Points': 'Reference: Sophos Wireless Consultation Request',
      'Sophos Switches': 'Reference: Sophos Switches Consultation Request',
      'Sophos Network Switches': 'Reference: Sophos Switches Consultation Request'
    };

    return referenceMap[productName] || 'Reference: ' + productName + ' Request';
  }

  function getSubjectText(productName) {
    var subjectMap = {
      'Sophos MDR': 'New Sophos MDR Lead',
      'Sophos XDR': 'New Sophos XDR Lead',
      'Sophos Firewall': 'New Sophos Firewall Sizing Lead',
      'Sophos Email Security': 'New Sophos Email Security Lead',
      'Sophos Wireless': 'New Sophos Wireless Consultation Lead',
      'Sophos Wireless Access Points': 'New Sophos Wireless Consultation Lead',
      'Sophos Switches': 'New Sophos Switches Consultation Lead',
      'Sophos Network Switches': 'New Sophos Switches Consultation Lead'
    };

    return subjectMap[productName] || 'New ' + productName + ' Lead';
  }

  function createLeadSubmissionHandler(options) {
    var form = options.form;
    var product = options.product;
    var businessEmailField = options.businessEmailField;
    var validateBusinessEmail = options.validateBusinessEmail;
    var pageUrlField = form.querySelector('[data-page-url-field]');
    var submitButton = form.querySelector('button[type="submit"]');
    var originalButtonText = submitButton ? submitButton.innerHTML : '';
    var submissionInProgress = false;

    return function handleZohoLeadSubmit(event) {
      if (submissionInProgress) {
        event.preventDefault();
        return;
      }

      document.charset = 'UTF-8';
      validateBusinessEmail();

      ['Last Name', 'Company'].forEach(function (fieldName) {
        var field = form.elements[fieldName];
        if (field) {
          field.setCustomValidity(field.value.trim() ? '' : 'This field is required.');
        }
      });

      if (!form.checkValidity()) {
        event.preventDefault();
        form.reportValidity();
        return;
      }

      if (pageUrlField) {
        pageUrlField.value = window.location.href;
      }

      submissionInProgress = true;
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = 'Submitting...';
      }

      window.dataLayer.push({
        event: 'form_submit_primary',
        product: product,
        customer_type: (new FormData(form).get('LEADCF8') === 'Yes') ? 'existing' : 'new'
      });

      if (businessEmailField) {
        businessEmailField.setCustomValidity('');
      }
    };
  }
  document.addEventListener('DOMContentLoaded', function () {
    var product = getProduct();

    var caseStudyButton = document.querySelector('.case-study-open');
    var caseStudyModal = document.querySelector('.case-study-modal');
    var caseStudyBackdrop = caseStudyModal ? caseStudyModal.querySelector('[data-case-study-close]') : null;
    var caseStudyClose = caseStudyModal ? caseStudyModal.querySelector('.case-study-modal__close') : null;
    var caseStudyPreviouslyFocused = null;

    if (caseStudyButton && caseStudyModal && caseStudyClose) {
      function openCaseStudyModal() {
        caseStudyPreviouslyFocused = document.activeElement;
        caseStudyModal.hidden = false;
        caseStudyModal.setAttribute('aria-hidden', 'false');
        caseStudyModal.classList.add('is-open');
        document.body.classList.add('case-study-modal-open');
        caseStudyClose.focus();
      }

      function closeCaseStudyModal() {
        caseStudyModal.classList.remove('is-open');
        caseStudyModal.setAttribute('aria-hidden', 'true');
        caseStudyModal.hidden = true;
        document.body.classList.remove('case-study-modal-open');

        if (caseStudyPreviouslyFocused && typeof caseStudyPreviouslyFocused.focus === 'function') {
          caseStudyPreviouslyFocused.focus();
        }
      }

      caseStudyButton.addEventListener('click', function () {
        openCaseStudyModal();
      });

      caseStudyClose.addEventListener('click', function () {
        closeCaseStudyModal();
      });

      if (caseStudyBackdrop) {
        caseStudyBackdrop.addEventListener('click', function () {
          closeCaseStudyModal();
        });
      }

      document.addEventListener('keydown', function (event) {
        if (!caseStudyModal.classList.contains('is-open')) {
          return;
        }

        if (event.key === 'Escape' || event.key === 'Esc') {
          closeCaseStudyModal();
        }
      });
    }

    pushEvent('page_view', Object.assign({
      product: product,
      page_url: window.location.href,
      referrer: document.referrer || ''
    }, getUtmParams()));

    var scrollDepthMarks = [25, 50, 75, 100];
    var firedScrollDepths = {};

    function trackScrollDepth() {
      var scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      var scrollPercent = scrollableHeight > 0 ? Math.round((window.scrollY / scrollableHeight) * 100) : 100;

      scrollDepthMarks.forEach(function (mark) {
        if (scrollPercent >= mark && !firedScrollDepths[mark]) {
          firedScrollDepths[mark] = true;
          pushEvent('scroll_depth', {
            product: product,
            scroll_depth: mark
          });
        }
      });
    }

    trackScrollDepth();
    window.addEventListener('scroll', trackScrollDepth, { passive: true });

    document.querySelectorAll('[data-track-cta]').forEach(function (cta) {
      cta.addEventListener('click', function () {
        pushEvent('cta_click', {
          product: product,
          cta_label: cta.textContent.trim(),
          cta_position: cta.dataset.trackCta || ''
        });
      });
    });

    document.querySelectorAll('a[href="#lead-form"]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        var leadForm = document.getElementById('lead-form');

        if (!leadForm) {
          return;
        }

        event.preventDefault();
        leadForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    var logoCards = Array.prototype.slice.call(document.querySelectorAll('.logo-wall__item'));

    if (logoCards.length) {
      var activeLogoCard = null;
      var logoPopup = document.createElement('div');

      logoPopup.className = 'logo-popup';
      logoPopup.setAttribute('aria-hidden', 'true');
      logoPopup.innerHTML = [
        '<div class="logo-popup__backdrop" data-logo-close></div>',
        '<div class="logo-popup__panel" role="dialog" aria-modal="true" aria-labelledby="logo-popup-title">',
        '<button class="logo-popup__close" type="button" data-logo-close aria-label="Close logo preview">&times;</button>',
        '<div class="logo-popup__image-wrap">',
        '<img class="logo-popup__image" src="" alt="" />',
        '</div>',
        '<h2 id="logo-popup-title">Client logo</h2>',
        '</div>'
      ].join('');
      document.body.appendChild(logoPopup);

      var logoPopupTitle = logoPopup.querySelector('#logo-popup-title');
      var logoPopupImage = logoPopup.querySelector('.logo-popup__image');
      var logoPopupImageWrap = logoPopup.querySelector('.logo-popup__image-wrap');
      var logoPopupClose = logoPopup.querySelector('.logo-popup__close');

      function getLogoName(card, image) {
        return card.dataset.logoName || card.getAttribute('aria-label') || (image ? image.getAttribute('alt') : '') || 'Client logo';
      }

      function openLogoPopup(card) {
        var image = card.querySelector('img');
        var logoName = getLogoName(card, image).replace(/\s+logo$/i, '');

        if (!image) {
          return;
        }

        activeLogoCard = card;
        logoPopupTitle.textContent = logoName;
        logoPopupImage.setAttribute('src', image.currentSrc || image.getAttribute('src'));
        logoPopupImage.setAttribute('alt', logoName + ' logo');
        logoPopupImageWrap.classList.toggle('logo-popup__image-wrap--dark', /azure-power/i.test(image.getAttribute('src') || ''));
        logoPopup.classList.add('is-open');
        logoPopup.setAttribute('aria-hidden', 'false');
        document.body.classList.add('logo-popup-open');
        logoPopupClose.focus();
      }

      function closeLogoPopup() {
        logoPopup.classList.remove('is-open');
        logoPopup.setAttribute('aria-hidden', 'true');
        logoPopupImage.setAttribute('src', '');
        logoPopupImageWrap.classList.remove('logo-popup__image-wrap--dark');
        document.body.classList.remove('logo-popup-open');

        if (activeLogoCard) {
          activeLogoCard.focus();
        }
      }

      logoCards.forEach(function (card) {
        var image = card.querySelector('img');
        var logoName = getLogoName(card, image).replace(/\s+logo$/i, '');

        card.dataset.logoName = logoName;
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', 'View ' + logoName + ' logo');

        card.addEventListener('click', function () {
          openLogoPopup(card);
        });

        card.addEventListener('keydown', function (event) {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openLogoPopup(card);
          }
        });
      });

      logoPopup.querySelectorAll('[data-logo-close]').forEach(function (closeControl) {
        closeControl.addEventListener('click', closeLogoPopup);
      });

      document.addEventListener('keydown', function (event) {
        if (logoPopup.classList.contains('is-open') && event.key === 'Escape') {
          closeLogoPopup();
        }
      });
    }

    function getCertificateUrl(card) {
      var preview = card.querySelector('.certificate-preview object');
      var fallbackLink = card.querySelector('.certificate-preview a, .certificate-card > a');
      var url = preview ? preview.getAttribute('data') : '';

      if (!url && fallbackLink) {
        url = fallbackLink.getAttribute('href') || '';
      }

      return url.split('#')[0];
    }

    function getCertificatePreviewUrl(certificateUrl) {
      return certificateUrl
        .replace(/#.*$/, '')
        .replace('/certificates/', '/certificates/previews/')
        .replace(/([^/]+)\.pdf$/i, '$1.png');
    }

    var certificateCards = Array.prototype.slice.call(document.querySelectorAll('.certificate-card'));

    if (certificateCards.length) {
      var activeCertificateIndex = 0;
      var certificatePopup = document.createElement('div');

      certificatePopup.className = 'certificate-popup';
      certificatePopup.setAttribute('aria-hidden', 'true');
      certificatePopup.innerHTML = [
        '<div class="certificate-popup__backdrop" data-certificate-close></div>',
        '<button class="certificate-popup__close" type="button" data-certificate-close aria-label="Close certificate preview">&times;</button>',
        '<button class="certificate-popup__nav certificate-popup__nav--prev" type="button" data-certificate-prev aria-label="Previous certificate">&lsaquo;</button>',
        '<div class="certificate-popup__panel" role="dialog" aria-modal="true" aria-labelledby="certificate-popup-title">',
        '<h2 id="certificate-popup-title">Certificate preview</h2>',
        '<img class="certificate-popup__frame" src="" alt="" />',
        '</div>',
        '<button class="certificate-popup__nav certificate-popup__nav--next" type="button" data-certificate-next aria-label="Next certificate">&rsaquo;</button>'
      ].join('');
      document.body.appendChild(certificatePopup);

      var popupTitle = certificatePopup.querySelector('#certificate-popup-title');
      var popupFrame = certificatePopup.querySelector('.certificate-popup__frame');
      var popupClose = certificatePopup.querySelector('.certificate-popup__close');
      var touchStartX = 0;
      var touchStartY = 0;

      function showCertificate(index) {
        var card = certificateCards[index];
        var certificateUrl = getCertificateUrl(card);
        var certificateName = (card.querySelector('strong') || {}).textContent || 'Certificate preview';

        if (!certificateUrl) {
          return;
        }

        activeCertificateIndex = index;
        popupTitle.textContent = certificateName;
        popupFrame.setAttribute('src', getCertificatePreviewUrl(certificateUrl));
        popupFrame.setAttribute('alt', certificateName);
      }

      function openCertificatePopup(index) {
        showCertificate(index);
        certificatePopup.classList.add('is-open');
        certificatePopup.setAttribute('aria-hidden', 'false');
        document.body.classList.add('certificate-popup-open');
        popupClose.focus();
      }

      function closeCertificatePopup() {
        certificatePopup.classList.remove('is-open');
        certificatePopup.setAttribute('aria-hidden', 'true');
        popupFrame.setAttribute('src', '');
        document.body.classList.remove('certificate-popup-open');
      }

      function moveCertificate(direction) {
        var nextIndex = (activeCertificateIndex + direction + certificateCards.length) % certificateCards.length;
        showCertificate(nextIndex);
      }

      certificateCards.forEach(function (card, index) {
        var certificateName = (card.querySelector('strong') || {}).textContent || 'Certificate preview';
        var certificateUrl = getCertificateUrl(card);
        var preview = card.querySelector('.certificate-preview');

        if (certificateUrl && preview) {
          preview.innerHTML = '<img src="' + getCertificatePreviewUrl(certificateUrl) + '" alt="" loading="lazy" />';
        }

        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', 'View ' + certificateName);

        card.addEventListener('click', function (event) {
          if (event.target.closest('a')) {
            return;
          }

          openCertificatePopup(index);
        });

        card.addEventListener('keydown', function (event) {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openCertificatePopup(index);
          }
        });
      });

      certificatePopup.querySelectorAll('[data-certificate-close]').forEach(function (closeControl) {
        closeControl.addEventListener('click', closeCertificatePopup);
      });

      certificatePopup.querySelector('[data-certificate-prev]').addEventListener('click', function () {
        moveCertificate(-1);
      });

      certificatePopup.querySelector('[data-certificate-next]').addEventListener('click', function () {
        moveCertificate(1);
      });

      certificatePopup.addEventListener('touchstart', function (event) {
        if (!event.touches || event.touches.length !== 1) {
          return;
        }

        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
      }, { passive: true });

      certificatePopup.addEventListener('touchend', function (event) {
        if (!event.changedTouches || event.changedTouches.length !== 1) {
          return;
        }

        var deltaX = event.changedTouches[0].clientX - touchStartX;
        var deltaY = event.changedTouches[0].clientY - touchStartY;

        if (Math.abs(deltaX) < 48 || Math.abs(deltaY) > 60) {
          return;
        }

        moveCertificate(deltaX < 0 ? 1 : -1);
      }, { passive: true });

      document.addEventListener('keydown', function (event) {
        if (!certificatePopup.classList.contains('is-open')) {
          return;
        }

        if (event.key === 'Escape') {
          closeCertificatePopup();
        }

        if (event.key === 'ArrowLeft') {
          moveCertificate(-1);
        }

        if (event.key === 'ArrowRight') {
          moveCertificate(1);
        }
      });
    }

    document.querySelectorAll('[data-lead-form]').forEach(function (form) {
      var started = false;
      var productField = form.querySelector('input[name="LEADCF10"]');
      var businessEmailField = form.querySelector('[data-business-email]');
      var formId = form.dataset.formId || form.id || 'lead-form';
      var freeEmailDomains = [
        'gmail.com',
        'googlemail.com',
        'yahoo.com',
        'outlook.com',
        'hotmail.com',
        'live.com',
        'icloud.com',
        'aol.com',
        'proton.me',
        'protonmail.com'
      ];


      function validateBusinessEmail() {
        if (!businessEmailField) {
          return;
        }

        var emailValue = businessEmailField.value.trim().toLowerCase();
        var domain = emailValue.split('@')[1] || '';
        var isFreeEmail = freeEmailDomains.indexOf(domain) !== -1;

        businessEmailField.setCustomValidity(isFreeEmail ? 'Please use your work email address.' : '');
      }

      function markFormStarted() {
        if (!started) {
          started = true;
          pushEvent('form_start', {
            product: product,
            form_id: formId
          });
        }
      }

      form.addEventListener('input', markFormStarted);
      form.addEventListener('change', markFormStarted);

      if (businessEmailField) {
        businessEmailField.addEventListener('input', validateBusinessEmail);
        businessEmailField.addEventListener('blur', validateBusinessEmail);
      }

      form.addEventListener('submit', createLeadSubmissionHandler({
        form: form,
        product: product,
        formId: formId,
        productField: productField,
        businessEmailField: businessEmailField,
        validateBusinessEmail: validateBusinessEmail
      }));
    });
  });
})();


