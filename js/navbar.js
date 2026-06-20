/**
 * navbar.js — Anime Nexus 全站共用脚本 v2
 * 修复：登录状态全站同步、收藏系统、Toast、筛选器
 */

// ─────────────────────────────────────────
// Store：localStorage 读写
// ─────────────────────────────────────────
const Store = {
  get(key, def = null) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; }
  },
  set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  }
};

// ─────────────────────────────────────────
// Auth：登录状态
// ─────────────────────────────────────────
const Auth = {
  isLoggedIn() { return !!Store.get('anUser'); },
  getUser()    { return Store.get('anUser', { name: '访客', avatar: '', bio: '' }); },
  login(name) {
    Store.set('anUser', {
      name,
      avatar: '',
      bio: '这个人很懒，什么都没写…',
      joined: new Date().toLocaleDateString('zh-CN'),
      avatarColor: '#ff4fa3,#a04fff'
    });
  },
  logout() { localStorage.removeItem('anUser'); }
};

// ─────────────────────────────────────────
// Favorites：收藏系统
// ─────────────────────────────────────────
const Favorites = {
  getAll()  { return Store.get('anFavs', []); },
  has(id)   { return this.getAll().some(f => f.id === id); },
  toggle(item) {
    let favs = this.getAll();
    const idx = favs.findIndex(f => f.id === item.id);
    if (idx >= 0) { favs.splice(idx, 1); showToast('已取消收藏'); }
    else { favs.unshift({ ...item, savedAt: new Date().toISOString() }); showToast('✓ 收藏成功'); }
    Store.set('anFavs', favs);
    return idx < 0;
  }
};

// ─────────────────────────────────────────
// Posts：帖子系统
// ─────────────────────────────────────────
const Posts = {
  getAll() { return Store.get('anPosts', []); },
  add(post) {
    const posts = this.getAll();
    const newPost = {
      id: 'p' + Date.now(),
      author: Auth.getUser().name,
      time: '刚刚',
      votes: 0,
      comments: 0,
      ...post
    };
    posts.unshift(newPost);
    Store.set('anPosts', posts);
    return newPost;
  },
  get(id) { return this.getAll().find(p => p.id === id); }
};

// ─────────────────────────────────────────
// Toast 全局提示
// ─────────────────────────────────────────
function showToast(msg, duration = 2200) {
  let t = document.getElementById('an-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'an-toast';
    t.style.cssText = [
      'position:fixed;bottom:32px;left:50%;',
      'transform:translateX(-50%) translateY(20px);',
      'background:rgba(15,15,20,0.97);',
      'border:1px solid rgba(255,79,163,0.5);',
      'color:#fff;padding:12px 30px;border-radius:999px;font-size:14px;',
      'opacity:0;transition:all .28s cubic-bezier(0.34,1.56,0.64,1);',
      'pointer-events:none;z-index:99999;',
      'white-space:nowrap;font-family:"Arial","PingFang SC",sans-serif;',
      'box-shadow:0 8px 32px rgba(0,0,0,0.4),0 0 0 1px rgba(255,79,163,0.1);',
      'backdrop-filter:blur(12px);'
    ].join('');
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  t.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateX(-50%) translateY(12px)';
  }, duration);
}

// ─────────────────────────────────────────
// 渲染导航栏右侧用户区（登录/头像）
// ─────────────────────────────────────────
function renderNavUser() {
  const wrap = document.getElementById('nav-user-area');
  if (!wrap) return;

  if (!Auth.isLoggedIn()) {
    wrap.innerHTML = `<a href="login.html" class="login-btn">登录</a>`;
    return;
  }

  const user = Auth.getUser();
  const initial = (user.name || '?')[0].toUpperCase();
  const colorParts = (user.avatarColor || '#ff4fa3,#a04fff').split(',');
  const gradStyle = `background:linear-gradient(135deg,${colorParts[0]},${colorParts[1] || colorParts[0]})`;

  wrap.innerHTML = `
    <div class="nav-avatar-wrap" id="nav-avatar-wrap">
      <div class="nav-avatar" id="nav-avatar" style="${gradStyle}">${initial}</div>
      <div class="nav-dropdown" id="nav-dropdown">
        <div class="nav-dd-user">
          <div class="nav-dd-avatar" style="${gradStyle}">${initial}</div>
          <div>
            <div class="nav-dd-name">${user.name}</div>
            <div class="nav-dd-sub">已登录 · Anime Nexus 成员</div>
          </div>
        </div>
        <div class="nav-dd-divider"></div>
        <a href="profile.html" class="nav-dd-item"><i class="fa-solid fa-user"></i> 个人空间</a>
        <a href="profile.html#favorites" class="nav-dd-item"><i class="fa-solid fa-bookmark"></i> 我的收藏</a>
        <a href="profile.html#posts" class="nav-dd-item"><i class="fa-solid fa-comment-dots"></i> 我的帖子</a>
        <div class="nav-dd-divider"></div>
        <a href="login.html" class="nav-dd-item" onclick="switchAccount(event)"><i class="fa-solid fa-rotate"></i> 更换账号</a>
        <a href="#" class="nav-dd-item nav-dd-logout" onclick="doLogout(event)"><i class="fa-solid fa-right-from-bracket"></i> 退出登录</a>
      </div>
    </div>`;

  const dropdown = document.getElementById('nav-dropdown');
  document.getElementById('nav-avatar').addEventListener('click', e => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
  });
  document.addEventListener('click', () => dropdown.classList.remove('open'), { once: false });
  dropdown.addEventListener('click', e => e.stopPropagation());
}

function doLogout(e) {
  e.preventDefault();
  Auth.logout();
  showToast('已退出登录');
  setTimeout(() => location.href = 'world.html', 1000);
}

function switchAccount(e) {
  e.preventDefault();
  Auth.logout();
  location.href = 'login.html';
}

// ─────────────────────────────────────────
// 筛选chip点击（bar内互斥）
// ─────────────────────────────────────────
function bindFilterChips() {
  document.querySelectorAll('.filter-bar').forEach(bar => {
    // 只绑定没有 data-filter 属性的普通chip（有 data-filter 的由各页面自己绑）
    bar.querySelectorAll('.filter-chip:not([data-filter])').forEach(chip => {
      chip.addEventListener('click', () => {
        bar.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      });
    });
  });
}

// ─────────────────────────────────────────
// 初始化
// ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderNavUser();
  bindFilterChips();
});
