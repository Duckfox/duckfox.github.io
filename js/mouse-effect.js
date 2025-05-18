document.addEventListener('DOMContentLoaded', () => {
  // 配置参数
  const config = {
    lineWidth: 2,
    lineLength: 60,
    colors: ['#ff4d4d', '#6be585', '#33c9dc', '#ffb347'],
    speed: 0.3,
    fadeInDuration: 300,  // 淡入时间（ms）
    fadeOutDuration: 500  // 淡出时间（ms）
  };

  // 创建画布
  const canvas = document.createElement('canvas');
  canvas.id = 'mouse-line-canvas';
  Object.assign(canvas.style, {
    position: 'fixed',
    top: 0,
    left: 0,
    pointerEvents: 'none',
    zIndex: '9999',
    opacity: 0, // 初始透明
    transition: `opacity ${config.fadeInDuration/1000}s ease-out` // CSS过渡
  });
  document.body.appendChild(canvas);

  // 初始化画布
  const ctx = canvas.getContext('2d');
  let width = window.innerWidth;
  let height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;

  // 状态控制
  let points = [];
  let lastMoveTime = 0;
  let isActive = false;
  let animationId;
  let currentOpacity = 0;

  // 鼠标移动处理
  document.addEventListener('mousemove', (e) => {
    if (!isActive) {
      // 首次移动时初始化线条节点
      for (let i = 0; i < config.lineLength; i++) {
        points.push({ x: e.clientX, y: e.clientY });
      }
      fadeIn(); // 触发淡入
    }
    lastMoveTime = Date.now();
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!animationId) animateLine();
  });

  // 淡入效果
  function fadeIn() {
    isActive = true;
    canvas.style.opacity = 1;
    currentOpacity = 1;
  }

  // 淡出效果
  function fadeOut() {
    isActive = false;
    canvas.style.opacity = 0;
    currentOpacity = 0;
  }

  // 窗口大小调整
  window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  });

  // 线条动画
  function animateLine() {
    const now = Date.now();
    const timeSinceLastMove = now - lastMoveTime;

    // 自动淡出检测
    if (timeSinceLastMove > config.fadeOutDuration && isActive) {
      fadeOut();
    } 
    // 重新激活检测
    else if (timeSinceLastMove < config.fadeInDuration && !isActive) {
      fadeIn();
    }

    // 清除画布（带当前透明度）
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = currentOpacity; // 应用全局透明度

    if (isActive || currentOpacity > 0) {
      // 更新节点位置
      for (let i = 0; i < points.length - 1; i++) {
        points[i].x += (points[i+1].x - points[i].x) * config.speed;
        points[i].y += (points[i+1].y - points[i].y) * config.speed;
      }
      points[points.length-1].x = mouseX;
      points[points.length-1].y = mouseY;

      // 绘制渐变线条
      for (let i = 0; i < points.length - 1; i++) {
        const colorIdx = Math.floor(i / (points.length / config.colors.length));
        ctx.beginPath();
        ctx.moveTo(points[i].x, points[i].y);
        ctx.lineTo(points[i+1].x, points[i+1].y);
        ctx.strokeStyle = config.colors[colorIdx % config.colors.length];
        ctx.lineWidth = config.lineWidth * (1 - i/points.length);
        ctx.stroke();
      }
    }

    // 完全透明后重置
    if (currentOpacity <= 0 && points.length > 0) {
      points = [];
    }

    animationId = requestAnimationFrame(animateLine);
  }
});