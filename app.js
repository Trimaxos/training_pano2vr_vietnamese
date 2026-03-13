/* =====================================================
   Pano2VR Training – app.js
   Fetch markdown từ GitHub, parse frontmatter, render nội dung
   ===================================================== */

var REPO_BASE = 'https://raw.githubusercontent.com/Trimaxos/training_pano2vr_vietnamese/master/';
var MAP_URL   = 'content-map.json';

var contentMap        = null;   // dữ liệu từ content-map.json
var flatLessons       = [];     // mảng phẳng tất cả bài học cho prev/next
var currentLessonIdx  = -1;     // vị trí hiện tại trong flatLessons

/* =====================================================
   KHỞI ĐỘNG
   ===================================================== */
window.addEventListener('DOMContentLoaded', function () {
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
        '<p class="nav-loading" style="color:#f87">Không thể tải danh sách bài học.<br>' + err.message + '</p>';
    });

  // Hỗ trợ nút back/forward của trình duyệt
  window.addEventListener('popstate', loadFromHash);

  // Mobile: menu toggle
  document.getElementById('menu-toggle').addEventListener('click', toggleSidebar);
  document.getElementById('overlay').addEventListener('click', closeSidebar);

  // Tìm kiếm
  document.getElementById('search-box').addEventListener('input', handleSearch);
});

/* =====================================================
   XÂY DỰNG MẢNG PHẲNG (cho prev/next)
   ===================================================== */
function buildFlatIndex() {
  flatLessons = [];
  contentMap.sections.forEach(function (section) {
    section.lessons.forEach(function (lesson) {
      flatLessons.push({ section: section, lesson: lesson });
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
    if (idx === 0) details.setAttribute('open', ''); // mở phần đầu mặc định

    var summary = document.createElement('summary');
    summary.textContent = section.title;
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
        loadLesson(section, lesson);
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
   TẢI BÀI HỌC TỪ GITHUB
   ===================================================== */
function loadLesson(section, lesson) {
  var url = REPO_BASE + section.folder + '/' + lesson.file + '?t=' + Date.now();

  // Ẩn welcome, hiện lesson layout
  document.getElementById('welcome').hidden       = true;
  document.getElementById('lesson-header').hidden = false;
  document.getElementById('lesson-body').hidden   = false;
  document.getElementById('lesson-nav').hidden    = false;

  // Trạng thái loading
  var body = document.getElementById('lesson-body');
  body.innerHTML = '<p class="loading-msg">&#8987; Đang tải bài học...</p>';

  // Xoá meta cũ
  clearMeta();

  fetch(url)
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status + ' – ' + url);
      return r.text();
    })
    .then(function (rawText) {
      var parsed = parseFrontmatter(rawText);
      renderMeta(parsed.meta);
      body.innerHTML = marked.parse(parsed.body);
      updateActiveLink(lesson.id);
      updatePrevNext(lesson.id);
      // Cuộn lên đầu nội dung
      document.getElementById('content-area').scrollTop = 0;
      // Cập nhật tiêu đề tab
      document.title = lesson.title + ' – Pano2VR Training';
    })
    .catch(function (err) {
      body.innerHTML = '<p class="error-msg">&#10060; Không thể tải bài học.<br><small>' + err.message + '</small></p>';
    });
}

/* =====================================================
   PARSE YAML FRONTMATTER
   Trích xuất: title, time_estimate, version, last_update, prerequisites
   ===================================================== */
function parseFrontmatter(text) {
  var meta = {};
  var body = text;

  var match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { meta: meta, body: body };

  var yaml = match[1];
  body = match[2];

  // title
  var m = yaml.match(/^title:\s*["']?(.+?)["']?\s*$/m);
  if (m) meta.title = m[1];

  // time_estimate
  m = yaml.match(/^time_estimate:\s*["']?(.+?)["']?\s*$/m);
  if (m) meta.time_estimate = m[1];

  // version
  m = yaml.match(/^version:\s*["']?(.+?)["']?\s*$/m);
  if (m) meta.version = m[1];

  // last_update
  m = yaml.match(/^last_update:\s*["']?(.+?)["']?\s*$/m);
  if (m) meta.last_update = m[1];

  // prerequisites (YAML list: - "item")
  var prereqBlock = yaml.match(/^prerequisites:\s*\r?\n((?:[ \t]*-[ \t]*.+\r?\n?)*)/m);
  if (prereqBlock) {
    meta.prerequisites = prereqBlock[1]
      .split(/\r?\n/)
      .filter(function (l) { return /^\s*-/.test(l); })
      .map(function (l) { return l.replace(/^\s*-\s*["']?/, '').replace(/["']?\s*$/, ''); })
      .filter(function (s) { return s.length > 0; });
  }

  return { meta: meta, body: body };
}

/* =====================================================
   HIỂN THỊ META BAR
   ===================================================== */
function renderMeta(meta) {
  var timeEl   = document.getElementById('meta-time');
  var prereqEl = document.getElementById('meta-prereqs');
  var verEl    = document.getElementById('meta-version');

  timeEl.textContent = meta.time_estimate ? '⏱ ' + meta.time_estimate : '';

  if (meta.prerequisites && meta.prerequisites.length > 0) {
    prereqEl.textContent = '📋 Yêu cầu: ' + meta.prerequisites.join(', ');
  } else {
    prereqEl.textContent = '';
  }

  if (meta.version) {
    verEl.textContent = '📦 ' + meta.version;
  } else {
    verEl.textContent = '';
  }
}

function clearMeta() {
  document.getElementById('meta-time').textContent   = '';
  document.getElementById('meta-prereqs').textContent = '';
  document.getElementById('meta-version').textContent = '';
}

/* =====================================================
   PREV / NEXT NAVIGATION
   ===================================================== */
function updatePrevNext(lessonId) {
  var idx = -1;
  for (var i = 0; i < flatLessons.length; i++) {
    if (flatLessons[i].lesson.id === lessonId) { idx = i; break; }
  }
  currentLessonIdx = idx;

  var prevBtn  = document.getElementById('btn-prev');
  var nextBtn  = document.getElementById('btn-next');
  var progress = document.getElementById('lesson-progress');

  prevBtn.disabled = (idx <= 0);
  nextBtn.disabled = (idx >= flatLessons.length - 1);

  progress.textContent = (idx >= 0)
    ? (idx + 1) + ' / ' + flatLessons.length
    : '';

  prevBtn.onclick = function () {
    if (idx > 0) {
      var prev = flatLessons[idx - 1];
      history.pushState(null, '', '#' + prev.lesson.id);
      loadLesson(prev.section, prev.lesson);
    }
  };

  nextBtn.onclick = function () {
    if (idx < flatLessons.length - 1) {
      var next = flatLessons[idx + 1];
      history.pushState(null, '', '#' + next.lesson.id);
      loadLesson(next.section, next.lesson);
    }
  };
}

/* =====================================================
   HIGHLIGHT LINK ĐANG ACTIVE
   ===================================================== */
function updateActiveLink(lessonId) {
  document.querySelectorAll('#nav-list a').forEach(function (a) {
    a.classList.remove('active');
  });

  var active = document.querySelector('#nav-list a[data-lesson-id="' + lessonId + '"]');
  if (active) {
    active.classList.add('active');
    // Đảm bảo phần chứa bài đang mở được expand
    var details = active.closest('details');
    if (details) details.setAttribute('open', '');
  }
}

/* =====================================================
   LOAD BÀI HỌC TỪ URL HASH (deep link)
   ===================================================== */
function loadFromHash() {
  var hash = window.location.hash.replace('#', '').trim();
  if (!hash) {
    // Không có hash → hiển thị màn hình chào
    showWelcome();
    return;
  }

  // Tìm bài học khớp với hash
  for (var i = 0; i < flatLessons.length; i++) {
    if (flatLessons[i].lesson.id === hash) {
      loadLesson(flatLessons[i].section, flatLessons[i].lesson);
      return;
    }
  }
}

function showWelcome() {
  document.getElementById('welcome').hidden       = false;
  document.getElementById('lesson-header').hidden = true;
  document.getElementById('lesson-body').hidden   = true;
  document.getElementById('lesson-nav').hidden    = true;
  document.querySelectorAll('#nav-list a').forEach(function (a) {
    a.classList.remove('active');
  });
  document.title = 'Tài liệu Training Pano2VR';
}

/* =====================================================
   TÌM KIẾM – lọc tiêu đề trong sidebar
   ===================================================== */
function handleSearch(e) {
  var query = e.target.value.trim().toLowerCase();

  document.querySelectorAll('#nav-list a').forEach(function (a) {
    var text = a.textContent.toLowerCase();
    var li   = a.parentElement;
    li.style.display = (!query || text.includes(query)) ? '' : 'none';
  });

  document.querySelectorAll('#nav-list details').forEach(function (details) {
    var anyVisible = Array.from(details.querySelectorAll('li')).some(function (li) {
      return li.style.display !== 'none';
    });
    details.style.display = anyVisible ? '' : 'none';
    // Mở rộng tất cả khi đang tìm kiếm
    if (query) details.setAttribute('open', '');
  });
}

/* =====================================================
   MOBILE SIDEBAR
   ===================================================== */
function toggleSidebar() {
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('overlay');
  var isOpen  = sidebar.classList.contains('open');
  if (isOpen) {
    closeSidebar();
  } else {
    sidebar.classList.add('open');
    overlay.classList.add('visible');
  }
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('visible');
}
