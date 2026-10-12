(function () {
  var STORAGE_KEY = 'srmp-tuto-progress';
  var steps = Array.prototype.slice.call(document.querySelectorAll('[data-step]'));
  var fill = document.getElementById('progress-fill');
  var text = document.getElementById('progress-text');
  var toast = document.getElementById('toast');
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll('.toc a'));

  function load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch (e) { return {}; }
  }
  function save(state) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* stockage indisponible */ }
  }

  function render() {
    var done = 0;
    steps.forEach(function (step) {
      var checked = step.querySelector('.done input').checked;
      step.classList.toggle('is-done', checked);
      var link = document.querySelector('.toc a[href="#' + step.id + '"]');
      if (link) link.classList.toggle('checked', checked);
      if (checked) done++;
    });
    fill.style.width = (done / steps.length * 100) + '%';
    text.textContent = done + ' / ' + steps.length + ' étapes terminées' + (done === steps.length ? ' – bon jeu ! 🎉' : '');
  }

  var state = load();
  steps.forEach(function (step) {
    var box = step.querySelector('.done input');
    box.checked = !!state[step.id];
    box.addEventListener('change', function () {
      state[step.id] = box.checked;
      save(state);
      render();
    });
  });
  render();

  document.getElementById('reset').addEventListener('click', function () {
    state = {};
    save(state);
    steps.forEach(function (step) { step.querySelector('.done input').checked = false; });
    render();
    window.scrollTo({ top: 0 });
  });

  // Copier dans le presse-papiers
  var toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 1800);
  }
  function copy(value) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = value;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) { /* ignoré */ }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).catch(fallback);
    } else {
      fallback();
    }
    showToast('« ' + value + ' » copié !');
  }
  document.querySelectorAll('[data-copy], code.copy').forEach(function (el) {
    el.addEventListener('click', function () {
      copy(el.getAttribute('data-copy') || el.textContent.trim());
    });
  });

  // Sommaire : surligner la section visible
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        tocLinks.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { observer.observe(s); });
  }
})();
