class DailyTip {
    constructor() {
      this.tipElement = document.getElementById('daily-tip-content');
      this.refreshBtn = document.getElementById('refresh-tip-btn');
      this.apiUrl = 'https://v1.hitokoto.cn/';
      this.init();
    }
  
    async fetchTip() {
      try {
        const response = await fetch(this.apiUrl);
        const data = await response.json();
        return `${data.hitokoto} —— ${data.from || '未知'}`;
      } catch (error) {
        console.error('获取每日一言失败:', error);
        return "获取失败，点击重试";
      }
    }
  
    async updateTip() {
      this.tipElement.textContent = "加载中...";
      this.refreshBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> 加载中';
      
      const tip = await this.fetchTip();
      this.tipElement.textContent = tip;
      
      this.refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> 换一句';
    }
  
    init() {
      this.updateTip();
      this.refreshBtn.addEventListener('click', () => this.updateTip());
    }
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    new DailyTip();
  });