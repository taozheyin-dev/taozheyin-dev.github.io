(() => {
  'use strict';
  const root = document.documentElement;
  const projectDialog = document.getElementById('project-dialog');
  const nav = document.getElementById('main-nav');
  const menuButton = document.querySelector('.menu-toggle');
  const content = document.getElementById('project-dialog-content');
  const cards = [...document.querySelectorAll('.project-card')];
  let opener = null;
  let returnHash = '';

  function toggleMenu(open) {
    nav.classList.toggle('is-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.querySelector('span').textContent = open ? '−' : '+';
  }

  function openDialog(dialog, trigger) {
    opener = trigger;
    toggleMenu(false);
    dialog.showModal();
    document.body.classList.add('dialog-open');
    dialog.scrollTop = 0;
    dialog.querySelector('[data-close-dialog]').focus();
  }

  function showProject(id, trigger, updateHash = true) {
    const detail = document.getElementById(id + '-detail');
    if (!detail) return;
    content.replaceChildren(detail.querySelector('.detail-content').cloneNode(true));
    content.querySelector('h2').id = 'detail-title';
    if (updateHash) {
      returnHash = location.hash;
      history.replaceState(null, '', '#' + id + '-detail');
    }
    if (!projectDialog.open) openDialog(projectDialog, trigger);
    projectDialog.scrollTop = 0;
  }

  menuButton.addEventListener('click', () => toggleMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => toggleMenu(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      toggleMenu(false);
      menuButton.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header')) toggleMenu(false);
  });
  window.matchMedia('(max-width: 700px)').addEventListener('change', () => toggleMenu(false));

  document.querySelectorAll('[data-project]').forEach(link => link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    showProject(link.dataset.project, link);
  }));
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelector('[data-close-dialog]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      const bounds = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
    });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('dialog-open');
      if (dialog === projectDialog && location.hash.endsWith('-detail')) history.replaceState(null, '', location.pathname + location.search + returnHash);
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    });
  });

  const filterStatus = document.createElement('p');
  filterStatus.className = 'filter-status';
  filterStatus.setAttribute('role', 'status');
  filterStatus.setAttribute('aria-live', 'polite');
  document.querySelector('.project-filters').after(filterStatus);
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(item => {
      item.setAttribute('aria-pressed', String(item === button));
      item.classList.toggle('is-active', item === button);
    });
    cards.forEach(card => { card.hidden = filter !== 'all' && !card.dataset.categories.split(' ').includes(filter); });
    document.querySelector('[data-project-list]').classList.toggle('is-filtered', filter !== 'all');
    filterStatus.textContent = `${button.textContent.trim()} · ${cards.filter(card => !card.hidden).length} 个项目`;
  }));

  const demoTabs = [...document.querySelectorAll('[data-demo-step]')];
  function selectDemo(index, focus = false) {
    demoTabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = i !== index;
    });
    if (focus) demoTabs[index].focus();
  }
  demoTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectDemo(index));
    tab.addEventListener('keydown', event => {
      const targets = { ArrowRight: (index + 1) % demoTabs.length, ArrowLeft: (index + demoTabs.length - 1) % demoTabs.length, Home: 0, End: demoTabs.length - 1 };
      if (!(event.key in targets)) return;
      event.preventDefault();
      selectDemo(targets[event.key], true);
    });
  });

  root.classList.add('is-enhanced');
  function openHash() {
    if (location.hash.endsWith('-detail')) {
      const id = location.hash.slice(1, -7);
      showProject(id, document.querySelector(`[data-project="${CSS.escape(id)}"]`), false);
    } else if (projectDialog.open) projectDialog.close();
  }
  openHash();
  window.addEventListener('hashchange', openHash);
})();
