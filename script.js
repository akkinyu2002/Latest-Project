const revealTargets = document.querySelectorAll('[data-reveal]');
const navLinks = Array.from(document.querySelectorAll('.site-nav a'));
const yearNode = document.getElementById('year');
const headerNode = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const primaryNav = document.getElementById('primary-nav');
const themeToggle = document.querySelector('.theme-toggle');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

const getStoredTheme = () => {
  try {
    return localStorage.getItem('theme');
  } catch {
    return null;
  }
};

const saveTheme = (theme) => {
  try {
    localStorage.setItem('theme', theme);
  } catch {
    // Storage can be unavailable in strict privacy modes.
  }
};

const syncThemeButton = () => {
  if (!themeToggle) {
    return;
  }

  const isDark = document.documentElement.dataset.theme === 'dark';
  themeToggle.setAttribute('aria-pressed', String(isDark));
  themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  themeToggle.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
};

const setTheme = (theme, shouldSave = true) => {
  const nextTheme = theme === 'dark' ? 'dark' : 'light';

  document.documentElement.dataset.theme = nextTheme;

  if (shouldSave) {
    saveTheme(nextTheme);
  }

  syncThemeButton();
};

if (!document.documentElement.dataset.theme) {
  setTheme(getStoredTheme() || (systemTheme.matches ? 'dark' : 'light'), false);
} else {
  syncThemeButton();
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  });

  const handleSystemThemeChange = (event) => {
    if (!getStoredTheme()) {
      setTheme(event.matches ? 'dark' : 'light', false);
    }
  };

  if ('addEventListener' in systemTheme) {
    systemTheme.addEventListener('change', handleSystemThemeChange);
  } else if ('addListener' in systemTheme) {
    systemTheme.addListener(handleSystemThemeChange);
  }
}

const setMenuState = (isOpen) => {
  if (!headerNode || !menuToggle) {
    return;
  }

  headerNode.classList.toggle('is-menu-open', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
};

if (headerNode && menuToggle && primaryNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    setMenuState(!isOpen);
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => setMenuState(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setMenuState(false);
    }
  });

  window.addEventListener('resize', () => {
    if (window.matchMedia('(min-width: 1081px)').matches) {
      setMenuState(false);
    }
  });
}

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    },
    {
      threshold: 0.2,
      rootMargin: '0px 0px -10% 0px',
    }
  );

  revealTargets.forEach((element) => observer.observe(element));
} else {
  revealTargets.forEach((element) => element.classList.add('is-visible'));
}

const sections = navLinks
  .map((link) => {
    const href = link.getAttribute('href');

    if (!href || !href.startsWith('#')) {
      return null;
    }

    return document.querySelector(href);
  })
  .filter(Boolean);

const setActiveNav = (sectionId) => {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute('href') === `#${sectionId}`;

    link.classList.toggle('is-active', isActive);

    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
};

if (sections[0]) {
  setActiveNav(sections[0].id);
}

if ('IntersectionObserver' in window && sections.length) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries.find((entry) => entry.isIntersecting);

      if (!visibleEntry) {
        return;
      }

      setActiveNav(visibleEntry.target.id);
    },
    {
      threshold: 0.45,
    }
  );

  sections.forEach((section) => navObserver.observe(section));
}
