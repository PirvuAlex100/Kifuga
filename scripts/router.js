window.socket = io();
const router = {
  currentView: null,
  init() {
    window.addEventListener('popstate', () => this.route());
    this.route();
  },
  async route() {
    const path = window.location.pathname;
    const search = window.location.search;
    if (this.currentView === 'room' && window.socket) {
      window.socket.emit('leaveRoom');
    }
    this.cleanup();
    if (path === '/' || path === '/index.html') {
      const module = await import('/scripts/views/home.js');
      module.renderHomeView();
      this.currentView = 'home';
    } else if (path === '/room') {
      const module = await import('/scripts/views/room/index.js');
      module.renderRoomView(search);
      this.currentView = 'room';
    } else {
      history.replaceState(null, '', '/');
      const module = await import('/scripts/views/home.js');
      module.renderHomeView();
      this.currentView = 'home';
    }
  },
  cleanup() {
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = '';
      app.className = '';
    }
    document.body.classList.add('overflow-x-hidden');
    document.body.classList.remove('h-screen', 'overflow-hidden');
  }
};
window.navigateTo = (url) => {
  history.pushState(null, '', url);
  router.route();
};
router.init();