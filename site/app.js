const repoRoot = 'https://github.com/WeiJiLab/xixi-release';
const rawRoot = `${repoRoot}/raw/refs/heads/main`;

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
    const folder = encodeURIComponent(build.version || 'nightly');
    const label = build.stable
      ? `最新稳定版 ${build.version}`
      : `最新测试版 ${build.versionName || build.version || 'nightly'}`;
    document.querySelectorAll('[data-version-label]').forEach((node) => { node.textContent = label; });
    document.querySelectorAll('.js-download-free').forEach((link) => {
      link.href = `${rawRoot}/releases/${folder}/xixifree-ai.apk`;
    });
    document.querySelectorAll('.js-download-desktop').forEach((link) => {
      link.href = `${rawRoot}/releases/${folder}/xixi-Desktop-Node-macOS.dmg`;
    });
  } catch (error) {
    document.querySelectorAll('[data-version-label]').forEach((node) => { node.textContent = '最新测试版可下载'; });
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
