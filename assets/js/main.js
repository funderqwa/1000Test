(function () {
  const root = document.documentElement;
  const storedTheme = localStorage.getItem('pulseforge-theme');
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

  function setTheme(theme) {
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
    }
    localStorage.setItem('pulseforge-theme', theme);
  }

  setTheme(storedTheme || (prefersLight ? 'light' : 'dark'));

  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isLight = root.getAttribute('data-theme') === 'light';
      setTheme(isLight ? 'dark' : 'light');
    });
  }

  const nav = document.getElementById('primary-nav');
  const navToggle = document.querySelector('.nav-toggle');

  if (nav && navToggle) {
    const toggleNav = () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      if (!expanded) {
        nav.dataset.open = 'true';
        const firstLink = nav.querySelector('a');
        if (firstLink) firstLink.focus({ preventScroll: true });
      } else {
        delete nav.dataset.open;
        navToggle.focus({ preventScroll: true });
      }
    };

    navToggle.addEventListener('click', toggleNav);

    nav.addEventListener('click', (event) => {
      if (event.target.matches('.nav__link')) {
        navToggle.setAttribute('aria-expanded', 'false');
        delete nav.dataset.open;
      }
    });

    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav.dataset.open) {
        navToggle.setAttribute('aria-expanded', 'false');
        delete nav.dataset.open;
        navToggle.focus({ preventScroll: true });
      }
    });
  }

  const statElements = document.querySelectorAll('[data-count]');
  if (statElements.length) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const targetValue = parseFloat(el.dataset.count || '0');
            const isPercent = el.textContent?.includes('%');
            const suffix = el.textContent?.replace(/^[0-9.]+/, '') || '';
            const startTime = performance.now();
            const duration = 1200;

            const animate = (currentTime) => {
              const progress = Math.min((currentTime - startTime) / duration, 1);
              const value = targetValue * progress;
              const formatted = isPercent ? Math.round(value) : value.toFixed(1).replace(/\.0$/, '');
              el.textContent = `${formatted}${suffix}`;
              if (progress < 1) requestAnimationFrame(animate);
            };

            requestAnimationFrame(animate);
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    statElements.forEach((el) => observer.observe(el));
  }

  const yearSpan = document.querySelector('[data-year]');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  const form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const name = data.get('name');
      const email = data.get('email');

      form.reset();

      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      toast.textContent = `Thanks${name ? `, ${name}` : ''}! We'll be in touch at ${email}.`;
      document.body.appendChild(toast);

      requestAnimationFrame(() => {
        toast.dataset.visible = 'true';
      });

      setTimeout(() => {
        toast.dataset.visible = 'false';
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
      }, 3200);
    });
  }
})();
