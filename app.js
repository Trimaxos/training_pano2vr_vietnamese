/* =====================================================
   Pano2VR Training – app.js
   Fetch markdown từ GitHub, parse, render, navigation
   ===================================================== */

var REPO_BASE = 'https://raw.githubusercontent.com/Trimaxos/training_pano2vr_vietnamese/master/';
var MAP_URL   = 'content-map.json';

var contentMap       = null;
var flatLessons      = [];      // [{section, lesson, globalIdx}]
var currentIdx       = -1;

/* Màu badge theo index section */
var SECTION_COLORS = ['#6366f1','#ff6b6b','#16a34a','#0284c7','#d97706','#7c3aed','#059669'];

/* =====================================================
   KHỞI ĐỘNG
   ===================================================== */
window.addEventListener('DOMContentLoaded', function () {
  /* Cấu hình marked */
  marked.setOptions({ breaks: true, gfm: true });

  /* Tải danh sách bài học, luôn fetch fresh (không cache) */
  fetch(MAP_URL + '?t=' + Date.now())
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function (data) {
      contentMap = data;
      buildFlatIndex();
      buildSidebar();
      loadFromHash();
    })
    .catch(function (err) {
      document.getElementById('nav-list').innerHTML =
        '<p style="color:#f87;padding:16px;font-size:.85rem;">Không thể tải danh sách bài học.<br>' + err.message + '</p>';
    });

  /* Nút back/forward browser */
  window.addEventListener('popstate', loadFromHash);

  /* Mobile: toggle sidebar */
  document.getElementById('menu-toggle').addEventListener('click', toggleSidebar);
  document.getElementById('overlay').addEventListener('click', closeSidebar);

  /* Search */
  var searchBox = document.getElementById('search-box');
  searchBox.addEventListener('input', handleSearch);
  searchBox.addEventListener('keydown', handleSearchKey);
  searchBox.addEventListener('blur', function () {
    setTimeout(closeSuggestions, 150);
  });
});

/* =====================================================
   MẢNG PHẲNG cho prev/next
   ===================================================== */
function buildFlatIndex() {
  flatLessons = [];
  contentMap.sections.forEach(function (section, sIdx) {
    section.lessons.forEach(function (lesson) {
      flatLessons.push({ section: section, lesson: lesson, sectionIdx: sIdx });
    });
  });
}

/* =====================================================
   XÂY DỰNG SIDEBAR
   ===================================================== */
function buildSidebar() {
  var nav = document.getElementById('nav-list');
  nav.innerHTML = '';

  contentMap.sections.forEach(function (section, idx) {
    var details = document.createElement('details');
    if (idx === 0) details.setAttribute('open', '');

    var summary = document.createElement('summary');
    /* Arrow icon */
    var arrowSvg = '<svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>';
    summary.innerHTML = arrowSvg + escapeHtml(section.title);
    details.appendChild(summary);

    var ul = document.createElement('ul');
    section.lessons.forEach(function (lesson) {
      var li = document.createElement('li');
      var a  = document.createElement('a');
      a.href             = '#' + lesson.id;
      a.textContent      = lesson.title;
      a.dataset.lessonId = lesson.id;
      a.addEventListener('click', function (e) {
        e.preventDefault();
        history.pushState(null, '', '#' + lesson.id);
        loadLesson(lesson.id);
        closeSidebar();
      });
      li.appendChild(a);
      ul.appendChild(li);
    });

    details.appendChild(ul);
    nav.appendChild(details);
  });
}

/* =====================================================
   TẢI BÀI HỌC
   ===================================================== */
function loadLesson(lessonId) {
  /* Tìm bài trong flatLessons */
  var entry = null;
  for (var i = 0; i < flatLessons.length; i++) {
    if (flatLessons[i].lesson.id === lessonId) { entry = flatLessons[i]; currentIdx = i; break; }
  }
  if (!entry) return;

  var section = entry.section;
  var lesson  = entry.lesson;

  /* Ẩn welcome, hiện lesson-view */
  document.getElementById('welcome').hidden     = true;
  document.getElementById('lesson-view').hidden = false;

  /* Loading state */
  document.getElementById('lesson-body').innerHTML   = '<p class="loading-msg">Đang tải bài học...</p>';
  document.getElementById('meta-bar').innerHTML      = '';
  document.getElementById('related-section').innerHTML  = '';
  document.getElementById('comments-section').innerHTML = '';

  /* Cuộn lên đầu ngay lập tức */
  document.getElementById('scroll-area').scrollTop = 0;

  /* Update sidebar + bottom nav ngay (không chờ fetch) */
  updateActiveLink(lessonId);
  renderBottomNav();

  /* Fetch markdown từ GitHub */
  var url = REPO_BASE + section.folder + '/' + lesson.file + '?t=' + Date.now();
  fetch(url)
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    })
    .then(function (rawText) {
      var parsed = parseFrontmatter(rawText);
      renderMetaBar(parsed.meta);
      document.getElementById('lesson-body').innerHTML = marked.parse(parsed.body);
      renderRelated(entry);
      renderComments();
      document.title = lesson.title + ' – Pano2VR Training';
    })
    .catch(function (err) {
      document.getElementById('lesson-body').innerHTML =
        '<p class="error-msg">Không thể tải bài học.<br><small>' + err.message + '</small></p>';
    });
}

/* =====================================================
   PARSE YAML FRONTMATTER
   ===================================================== */
function parseFrontmatter(text) {
  var meta = {}, body = text;
  var m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return { meta: meta, body: body };

  var yaml = m[1];
  body = m[2];

  var pick = function (key) {
    var r = yaml.match(new RegExp('^' + key + ':\\s*["\']?(.+?)["\']?\\s*$', 'm'));
    return r ? r[1] : null;
  };

  meta.title         = pick('title');
  meta.time_estimate = pick('time_estimate');
  meta.version       = pick('version');
  meta.last_update   = pick('last_update');

  var prereqBlock = yaml.match(/^prerequisites:\s*\r?\n((?:[ \t]*-[ \t]*.+\r?\n?)*)/m);
  if (prereqBlock) {
    meta.prerequisites = prereqBlock[1]
      .split(/\r?\n/)
      .filter(function (l) { return /^\s*-/.test(l); })
      .map(function (l) { return l.replace(/^\s*-\s*["']?/, '').replace(/["']?\s*$/, ''); })
      .filter(Boolean);
  }

  return { meta: meta, body: body };
}

/* =====================================================
   META BAR
   ===================================================== */
function renderMetaBar(meta) {
  var bar = document.getElementById('meta-bar');
  var html = '';

  if (meta.time_estimate) {
    html += badge('meta-time',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
      escapeHtml(meta.time_estimate));
  }
  if (meta.prerequisites && meta.prerequisites.length) {
    html += badge('meta-prereq',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
      'Yêu cầu: ' + escapeHtml(meta.prerequisites.join(', ')));
  }
  if (meta.version) {
    html += badge('meta-ver',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>',
      escapeHtml(meta.version));
  }

  bar.innerHTML = html;
}

function badge(cls, svgHtml, text) {
  return '<span class="meta-badge ' + cls + '">' + svgHtml + text + '</span>';
}

/* =====================================================
   RELATED LESSONS
   ===================================================== */
function renderRelated(currentEntry) {
  var section = currentEntry.section;
  var lesson  = currentEntry.lesson;
  var sIdx    = currentEntry.sectionIdx;

  /* Lấy các bài cùng section (trừ bài hiện tại) */
  var siblings = section.lessons.filter(function (l) { return l.id !== lesson.id; });
  /* Ưu tiên lấy 2 bài liền kề trước/sau, nếu không đủ lấy ngẫu nhiên */
  var lessonPos = section.lessons.indexOf(lesson);
  var picks = [];
  if (lessonPos > 0) picks.push(section.lessons[lessonPos - 1]);
  if (lessonPos < section.lessons.length - 1) picks.push(section.lessons[lessonPos + 1]);
  /* Bổ sung từ section khác nếu chưa đủ 3 */
  if (picks.length < 3 && flatLessons.length > section.lessons.length) {
    for (var i = 0; i < flatLessons.length && picks.length < 3; i++) {
      var e = flatLessons[i];
      if (e.lesson.id !== lesson.id && picks.indexOf(e.lesson) === -1) {
        if (e.sectionIdx !== sIdx) picks.push(e.lesson);
      }
    }
  }
  picks = picks.slice(0, 3);
  if (!picks.length) { document.getElementById('related-section').innerHTML = ''; return; }

  var color = SECTION_COLORS[sIdx % SECTION_COLORS.length];
  var sectionLabel = section.title.split('–')[0].trim(); /* "Phần 1" */

  var cards = picks.map(function (l) {
    return '<a class="related-card" href="#' + l.id + '" data-lesson-id="' + l.id + '">'
      + '<span class="rc-tag rc-color-' + (sIdx % 7) + '">' + escapeHtml(sectionLabel) + '</span>'
      + '<div class="rc-title">' + escapeHtml(l.title) + '</div>'
      + '</a>';
  }).join('');

  document.getElementById('related-section').innerHTML =
    '<div class="section-title">'
    + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>'
    + 'Bài liên quan</div>'
    + '<div class="related-cards">' + cards + '</div>';

  /* Gắn click event */
  document.querySelectorAll('#related-section .related-card').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var id = a.dataset.lessonId;
      history.pushState(null, '', '#' + id);
      loadLesson(id);
    });
  });
}

/* =====================================================
   COMMENTS
   ===================================================== */
function renderComments() {
  var html = '<div class="comments-header">'
    + '<div class="section-title">'
    + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
    + 'Hỏi đáp &amp; Nhận xét</div>'
    + '</div>'
    + '<div class="comment-input-wrap">'
    + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>'
    + '<input type="text" placeholder="Đặt câu hỏi hoặc để lại nhận xét..." />'
    + '</div>'
    + '<p class="cmt-empty">Chưa có nhận xét nào. Hãy là người đầu tiên!</p>';

  document.getElementById('comments-section').innerHTML = html;
}

/* =====================================================
   BOTTOM NAVIGATION
   ===================================================== */
function renderBottomNav() {
  var prevBtn  = document.getElementById('btn-prev');
  var nextBtn  = document.getElementById('btn-next');
  var progress = document.getElementById('lesson-progress');
  var idx = currentIdx;

  prevBtn.disabled = (idx <= 0);
  nextBtn.disabled = (idx >= flatLessons.length - 1);
  progress.textContent = (idx >= 0) ? (idx + 1) + ' / ' + flatLessons.length : '';

  prevBtn.onclick = function () {
    if (idx > 0) {
      var prev = flatLessons[idx - 1];
      history.pushState(null, '', '#' + prev.lesson.id);
      loadLesson(prev.lesson.id);
    }
  };
  nextBtn.onclick = function () {
    if (idx < flatLessons.length - 1) {
      var next = flatLessons[idx + 1];
      history.pushState(null, '', '#' + next.lesson.id);
      loadLesson(next.lesson.id);
    }
  };
}

/* =====================================================
   ACTIVE LINK + AUTO-EXPAND SECTION
   ===================================================== */
function updateActiveLink(lessonId) {
  document.querySelectorAll('#nav-list a').forEach(function (a) {
    a.classList.remove('active');
  });
  var active = document.querySelector('#nav-list a[data-lesson-id="' + lessonId + '"]');
  if (active) {
    active.classList.add('active');
    var details = active.closest('details');
    if (details) details.setAttribute('open', '');
    /* Cuộn sidebar để active item visible */
    active.scrollIntoView({ block: 'nearest' });
  }
}

/* =====================================================
   LOAD TỪ URL HASH (deep link / back-forward)
   ===================================================== */
function loadFromHash() {
  var hash = window.location.hash.replace('#', '').trim();
  if (!hash) { showWelcome(); return; }
  for (var i = 0; i < flatLessons.length; i++) {
    if (flatLessons[i].lesson.id === hash) {
      loadLesson(hash);
      return;
    }
  }
  showWelcome();
}

function showWelcome() {
  document.getElementById('lesson-view').hidden = true;
  document.getElementById('welcome').hidden     = false;
  document.querySelectorAll('#nav-list a').forEach(function (a) { a.classList.remove('active'); });
  document.title = 'Pano2VR Training';
}

/* =====================================================
   SEARCH AUTO-SUGGEST
   ===================================================== */
var suggestFocusIdx = -1;

function handleSearch(e) {
  var query = e.target.value.trim().toLowerCase();
  var box   = document.getElementById('search-suggestions');

  if (!query || !flatLessons.length) { closeSuggestions(); return; }

  var matches = flatLessons.filter(function (entry) {
    return entry.lesson.title.toLowerCase().includes(query)
        || entry.section.title.toLowerCase().includes(query);
  }).slice(0, 8);

  if (!matches.length) {
    box.innerHTML = '<div class="suggest-empty">Không tìm thấy bài học phù hợp</div>';
    box.classList.add('open');
    suggestFocusIdx = -1;
    return;
  }

  box.innerHTML = matches.map(function (entry, i) {
    var tag   = entry.section.title.split('–')[0].trim();
    var title = highlightMatch(entry.lesson.title, query);
    return '<div class="suggest-item" data-lesson-id="' + entry.lesson.id + '" data-idx="' + i + '">'
      + '<span class="suggest-tag">' + escapeHtml(tag) + '</span>'
      + '<span class="suggest-title">' + title + '</span>'
      + '</div>';
  }).join('');

  /* Click trên item */
  box.querySelectorAll('.suggest-item').forEach(function (item) {
    item.addEventListener('mousedown', function () {
      var id = item.dataset.lessonId;
      history.pushState(null, '', '#' + id);
      loadLesson(id);
      document.getElementById('search-box').value = '';
      closeSuggestions();
    });
  });

  box.classList.add('open');
  suggestFocusIdx = -1;
}

function handleSearchKey(e) {
  var box = document.getElementById('search-suggestions');
  if (!box.classList.contains('open')) return;
  var items = box.querySelectorAll('.suggest-item');

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    suggestFocusIdx = Math.min(suggestFocusIdx + 1, items.length - 1);
    updateSuggestFocus(items);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    suggestFocusIdx = Math.max(suggestFocusIdx - 1, 0);
    updateSuggestFocus(items);
  } else if (e.key === 'Enter') {
    if (suggestFocusIdx >= 0 && items[suggestFocusIdx]) {
      var id = items[suggestFocusIdx].dataset.lessonId;
      history.pushState(null, '', '#' + id);
      loadLesson(id);
      document.getElementById('search-box').value = '';
      closeSuggestions();
    }
  } else if (e.key === 'Escape') {
    closeSuggestions();
  }
}

function updateSuggestFocus(items) {
  items.forEach(function (item, i) {
    item.classList.toggle('focused', i === suggestFocusIdx);
  });
  if (items[suggestFocusIdx]) items[suggestFocusIdx].scrollIntoView({ block: 'nearest' });
}

function closeSuggestions() {
  var box = document.getElementById('search-suggestions');
  box.classList.remove('open');
  suggestFocusIdx = -1;
}

function highlightMatch(text, query) {
  var escaped = escapeHtml(text);
  var escapedQ = escapeHtml(query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return escaped.replace(new RegExp('(' + escapedQ + ')', 'gi'), '<mark>$1</mark>');
}

/* =====================================================
   MOBILE SIDEBAR
   ===================================================== */
function toggleSidebar() {
  var open = document.getElementById('sidebar').classList.contains('open');
  open ? closeSidebar() : openSidebar();
}
function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('overlay').classList.add('visible');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('visible');
}

/* =====================================================
   UTILS
   ===================================================== */
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
