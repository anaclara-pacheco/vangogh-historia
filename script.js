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

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch((error) => {
      console.error('Não foi possível preparar o modo offline:', error);
    });
  });
}

const installButton = document.createElement('button');
installButton.className = 'install-app-button';
installButton.type = 'button';
installButton.textContent = 'Instalar app';
installButton.setAttribute('aria-label', 'Instalar o site como aplicativo');
document.body.append(installButton);

let deferredInstallPrompt = null;
const installDialog = document.createElement('dialog');
installDialog.className = 'install-help-dialog';
installDialog.innerHTML = '<form method="dialog"><button class="install-dialog-close" aria-label="Fechar">×</button><span class="puzzle-label">VAN GOGH · UMA VIDA EM CORES</span><h2>Leve o site com você.</h2><p class="install-help-text"></p><button class="button button-dark install-dialog-ok">Entendi</button></form>';
document.body.append(installDialog);

const isAppleMobile = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
const isRunningInstalled = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
if (isAppleMobile && !isRunningInstalled) installButton.hidden = false;

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  if (!isRunningInstalled) installButton.hidden = false;
});

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  installButton.hidden = true;
});

installButton.addEventListener('click', async () => {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    installButton.hidden = true;
    return;
  }

  const helpText = installDialog.querySelector('.install-help-text');
  helpText.textContent = isAppleMobile
    ? 'No Safari, toque em Compartilhar e escolha “Adicionar à Tela de Início”. Depois toque em Adicionar.'
    : 'No menu do navegador, escolha “Instalar app” ou “Adicionar à tela inicial”. O site precisa estar publicado em um endereço HTTPS.';
  installDialog.showModal();
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reducedMotion && 'IntersectionObserver' in window) {
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
    const bounds = element.getBoundingClientRect();
    if (bounds.top < window.innerHeight && bounds.bottom > 0) {
      element.classList.add('is-visible');
      return;
    }

    element.classList.add('scroll-reveal');
    if (element.matches('.art-card, .timeline-item, .place-card')) {
      element.style.transitionDelay = `${(index % 3) * 70}ms`;
    }
    revealObserver.observe(element);
  });
} else {
  document.querySelectorAll('.intro, .art-card, .timeline-heading, .timeline-item, .places-section .section-heading, .place-card, .legacy-copy, .author-layout, .author-note, .wordsearch-intro, .wordsearch-game, .wordsearch-credit')
    .forEach((element) => element.classList.add('is-visible'));
}
