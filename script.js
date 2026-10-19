document.querySelectorAll('.site-header').forEach((header) => {
  const menuButton = header.querySelector('.menu-toggle');
  const navigation = header.querySelector('.main-nav');
  if (!menuButton || !navigation) return;

  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Abrir menu' : 'Fechar menu');
    navigation.classList.toggle('is-open', !isOpen);
  });

  navigation.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Abrir menu');
      navigation.classList.remove('is-open');
    });
  });
});

if ('IntersectionObserver' in window) {
  const revealTargets = document.querySelectorAll(
    '.intro, .art-card, .timeline-heading, .timeline-item, .places-section .section-heading, .place-card, .legacy-copy, .author-layout, .author-note, .wordsearch-intro, .wordsearch-game, .wordsearch-credit'
  );

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });

  revealTargets.forEach((element, index) => {
    element.classList.add('scroll-reveal');
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && element.matches('.art-card, .timeline-item, .place-card')) {
      element.style.transitionDelay = `${(index % 3) * 70}ms`;
    }
    revealObserver.observe(element);
  });
} else {
  document.querySelectorAll('.intro, .art-card, .timeline-heading, .timeline-item, .places-section .section-heading, .place-card, .legacy-copy, .author-layout, .author-note, .wordsearch-intro, .wordsearch-game, .wordsearch-credit')
    .forEach((element) => element.classList.add('is-visible'));
}
