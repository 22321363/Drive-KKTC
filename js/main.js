document.addEventListener('DOMContentLoaded', () => {
  const isTurkish = document.documentElement.lang === 'tr';
  const menuBtn = document.querySelector('.menu-btn');
  const navLinks = document.querySelector('.nav-links');
  if (menuBtn && navLinks) {
    const menuLabelClosed = isTurkish ? 'menü' : 'menu';
    const menuLabelOpen = isTurkish ? 'kapat' : 'close';
    menuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('is-active');
      menuBtn.textContent = navLinks.classList.contains('is-active') ? menuLabelOpen : menuLabelClosed;
    });
  }

  const shareButtons = document.querySelectorAll('[data-share]');
  const shareFallbackText = isTurkish ? 'Drive KKTC üzerinde bu rotayı keşfedin!' : 'Explore this route on Drive KKTC!';
  const linkCopiedText = isTurkish ? 'Bağlantı Kopyalandı! 📋' : 'Link Copied! 📋';
  shareButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const shareData = {
        title: btn.getAttribute('data-title') || document.title,
        text: btn.getAttribute('data-text') || shareFallbackText,
        url: window.location.href
      };
      if (navigator.share) {
        try { await navigator.share(shareData); } catch (err) { console.log('Shared cancelled'); }
      } else {
        navigator.clipboard.writeText(shareData.url);
        const originalText = btn.textContent;
        btn.textContent = linkCopiedText;
        setTimeout(() => btn.textContent = originalText, 2000);
      }
    });
  });

 
  const mapElement = document.getElementById('route-map');
  if (mapElement && window.ROUTE_STOPS && window.ROUTE_CENTER) {
    const map = L.map('route-map').setView(window.ROUTE_CENTER, window.ROUTE_ZOOM || 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const viewDetailsLabel = isTurkish ? 'Detayları Gör' : 'View Details';

    window.ROUTE_STOPS.forEach((stop, index) => {
      L.marker([stop.lat, stop.lng])
        .bindPopup(`<strong>${index + 1}. ${stop.name}</strong><br><a href="#${stop.id}">${viewDetailsLabel}</a>`)
        .addTo(map);
    });

  
    if (window.ROUTE_STOPS.length > 1) {
      const routePoints = window.ROUTE_STOPS.map(stop => [stop.lat, stop.lng]);
      L.polyline(routePoints, {
        color: window.ROUTE_ACCENT || '#e30a17',
        weight: 4,
        opacity: 0.85,
        dashArray: '6, 8',
        lineJoin: 'round'
      }).addTo(map);
    }
  }

  
  const overviewMapEl = document.getElementById('overview-map');
  if (overviewMapEl && window.OVERVIEW_ROUTES) {
    const overviewMap = L.map('overview-map').setView(window.OVERVIEW_CENTER || [35.3, 33.6], window.OVERVIEW_ZOOM || 9);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(overviewMap);

    const ctaLabel = window.OVERVIEW_CTA_LABEL || 'View route →';

    window.OVERVIEW_ROUTES.forEach(route => {
      const points = route.stops.map(s => [s.lat, s.lng]);

      L.polyline(points, {
        color: route.accent,
        weight: 4,
        opacity: 0.85,
        dashArray: '6, 8',
        lineJoin: 'round'
      }).addTo(overviewMap);

      L.marker(points[0])
        .bindPopup(`<strong>${route.name}</strong><br><a href="${route.url}">${ctaLabel}</a>`)
        .addTo(overviewMap);
    });
  }

  
  const saveButtons = document.querySelectorAll('.save-btn');
  saveButtons.forEach(button => {
    const saveId = button.getAttribute('data-save-id');

    if (localStorage.getItem(saveId) === 'true') {
      button.classList.add('is-saved');
    }

    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isSaved = button.classList.toggle('is-saved');
      localStorage.setItem(saveId, isSaved);
    });
  });


  const progressBar = document.createElement('div');
  progressBar.className = 'progress-bar';
  document.body.appendChild(progressBar);
  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

 
  const moreDetailsLabel = isTurkish ? 'Daha fazla detay' : 'More details';
  const lessDetailsLabel = isTurkish ? 'Daha az detay' : 'Less details';
  document.querySelectorAll('.more-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.stop-card');
      if (!card) return;
      const expanded = card.classList.toggle('expanded');
      btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      btn.querySelector('.label').textContent = expanded ? lessDetailsLabel : moreDetailsLabel;
    });
  });

  
  const jumpLinks = document.querySelectorAll('.jump-nav a');
  const stopSections = Array.from(document.querySelectorAll('.stop-card[id]'));
  if (jumpLinks.length && stopSections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          jumpLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });
    stopSections.forEach(section => spy.observe(section));
  }

 
  const fadeTargets = document.querySelectorAll('.route-card, .stop-card, .panel, .related-card, .gallery img, .overview-card, .stat');
  fadeTargets.forEach(el => el.classList.add('fade-up'));
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  fadeTargets.forEach(el => fadeObserver.observe(el));

  
  const closeImageLabel = isTurkish ? 'Görseli kapat' : 'Close image';
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `<button class="lightbox-close" aria-label="${closeImageLabel}">&times;</button><img alt="" />`;
  document.body.appendChild(lightbox);
  const lightboxImg = lightbox.querySelector('img');

  const openLightbox = (src, alt) => {
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('open');
  };
  const closeLightbox = () => lightbox.classList.remove('open');

  document.querySelectorAll('.stop-card .cover, .gallery img, .route-card .cover').forEach(img => {
    img.addEventListener('click', () => openLightbox(img.src, img.alt));
  });
  lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
});
