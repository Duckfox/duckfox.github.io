document.addEventListener('DOMContentLoaded', function() {
  // 自动处理所有卡片
  const cards = document.querySelectorAll('.page-card');
  
  cards.forEach(card => {
    // 添加点击事件
    card.addEventListener('click', function() {
      const link = card.querySelector('a.page-card-link');
      if (link) {
        window.location.href = link.href;
      }
    });
  });
});