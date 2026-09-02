const repoRoot = 'https://github.com/WeiJiLab/xixi-release';

const header = document.querySelector('[data-header]');
const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 24);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const parallax = document.querySelector('[data-parallax]');
if (parallax && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.addEventListener('pointermove', (event) => {
    const x = (event.clientX / window.innerWidth - .5) * 9;
    const y = (event.clientY / window.innerHeight - .5) * 7;
    parallax.style.setProperty('--mx', `${x}px`);
    parallax.style.setProperty('--my', `${y}px`);
  }, { passive: true });
}

async function loadLatestBuild() {
  try {
    const response = await fetch('./releases/latest.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const build = await response.json();
    const version = build.version || 'v0.3.0';
    const folder = encodeURIComponent(version);
    const label = `最新版本 ${version}`;
    document.querySelectorAll('[data-version-label]').forEach((node) => { node.textContent = label; });
    document.querySelectorAll('.js-download-free').forEach((link) => {
      link.href = `${repoRoot}/releases/download/${folder}/xixifree-ai.apk`;
    });
    document.querySelectorAll('.js-download-desktop').forEach((link) => {
      link.href = `${repoRoot}/releases/download/${folder}/xixi-Desktop-Node-macOS.dmg`;
    });
    document.querySelectorAll('[data-release-version]').forEach((node) => { node.textContent = version; });
    document.querySelectorAll('[data-release-date]').forEach((node) => { node.textContent = build.releasedAt || ''; });
    document.querySelectorAll('[data-release-link]').forEach((link) => { link.href = `${repoRoot}/releases/tag/${folder}`; });
    if (Array.isArray(build.highlights) && build.highlights.length) {
      document.querySelectorAll('[data-changelog]').forEach((list) => {
        list.replaceChildren(...build.highlights.map((highlight) => {
          const item = document.createElement('li'); item.textContent = highlight; return item;
        }));
      });
    }
  } catch (error) {
    document.querySelectorAll('[data-version-label]').forEach((node) => { node.textContent = '当前正式版 v0.3.0'; });
  }
}
loadLatestBuild();

const tabs = [...document.querySelectorAll('[role="tab"]')];
tabs.forEach((tab) => tab.addEventListener('click', () => {
  tabs.forEach((candidate) => {
    const selected = candidate === tab;
    candidate.setAttribute('aria-selected', String(selected));
    candidate.tabIndex = selected ? 0 : -1;
    const panel = document.getElementById(candidate.getAttribute('aria-controls'));
    if (panel) panel.hidden = !selected;
  });
}));

document.querySelector('[data-copy-command]')?.addEventListener('click', async (event) => {
  const button = event.currentTarget;
  const command = button.parentElement?.querySelector('code')?.textContent || '';
  try {
    await navigator.clipboard.writeText(command);
    button.textContent = '已复制';
    window.setTimeout(() => { button.textContent = '复制'; }, 1600);
  } catch {
    button.textContent = '请手动复制';
  }
});
