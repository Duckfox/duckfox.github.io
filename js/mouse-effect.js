document.addEventListener('DOMContentLoaded', () => {
  // 配置参数（新增透明度与模糊设置）
  const config = {
    lineWidth: 4,
    maxPoints: 60,
    minPoints: 3,
    speed: 0.18,
    fadeInDuration: 300,
    fadeOutDuration: 1500,
    hueSpeed: 0.6,
    noiseIntensity: 0.2,
    baseAlpha: 0.7,          // 基础透明度 (0-1)
    blurAmount: 2            // 模糊程度 (像素)
  };

  // 创建画布（添加CSS模糊滤镜）
  const canvas = document.createElement('canvas');
  Object.assign(canvas.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    pointerEvents: 'none',
    zIndex: '9999',
    opacity: '0',
    transition: `opacity ${config.fadeInDuration/1000}s ease-out`,
    filter: `blur(${config.blurAmount}px)`  // 添加模糊效果
  });
  document.body.appendChild(canvas);

  // 精确设置画布尺寸
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();

  // 状态变量
  const ctx = canvas.getContext('2d');
  let points = [];
  let lastMoveTime = 0;
  let isActive = false;
  let animationId;
  let currentHue = 0;
  let mouseX = window.innerWidth/2;
  let mouseY = window.innerHeight/2;

  // HSL颜色生成（带透明度）
  function getColor(hue) {
    return `hsla(${hue % 360}, 100%, 60%, ${config.baseAlpha})`; // 添加alpha通道
  }

  // 鼠标移动处理
  document.addEventListener('mousemove', (e) => {
    mouseX = Math.max(0, Math.min(e.clientX, window.innerWidth));
    mouseY = Math.max(0, Math.min(e.clientY, window.innerHeight));

    if (!isActive) {
      points = Array(config.maxPoints).fill().map(() => ({
        x: mouseX,
        y: mouseY,
        life: 1
      }));
      fadeIn();
    }
    
    lastMoveTime = Date.now();
    
    if (points.length < config.maxPoints) {
      points.push({ x: mouseX, y: mouseY, life: 1 });
    } else {
      points[points.length - 1] = { x: mouseX, y: mouseY, life: 1 };
    }
    
    if (!animationId) animateLine();
  });

  // 淡入淡出效果
  function fadeIn() { 
    isActive = true; 
    canvas.style.opacity = config.baseAlpha.toString(); // 使用配置的透明度
  }
  
  function fadeOut() { 
    isActive = false; 
    canvas.style.opacity = '0'; 
  }

  // 窗口大小调整
  window.addEventListener('resize', resizeCanvas);

  // 动画循环（带透明度衰减）
  function animateLine() {
    const now = Date.now();
    const timeSinceLastMove = now - lastMoveTime;

    // 状态检测
    if (timeSinceLastMove > config.fadeOutDuration && isActive) fadeOut();
    else if (timeSinceLastMove < config.fadeInDuration && !isActive) fadeIn();

    // 清除画布（带当前透明度）
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (points.length > 1) {
      currentHue += config.hueSpeed;
      
      // 鼠标静止时逐渐减少拖尾
      if (timeSinceLastMove > config.fadeInDuration) {
        points.shift();
      }

      // 更新点位置（带生命周期透明度）
      for (let i = 0; i < points.length - 1; i++) {
        const nextPoint = points[i+1];
        points[i].x += (nextPoint.x - points[i].x) * config.speed;
        points[i].y += (nextPoint.y - points[i].y) * config.speed;
        
        // 添加有机波动
        if (i % 3 === 0) {
          points[i].x += (Math.random() - 0.5) * config.noiseIntensity * 2;
          points[i].y += (Math.random() - 0.5) * config.noiseIntensity * 2;
          points[i].x = Math.max(0, Math.min(points[i].x, canvas.width));
          points[i].y = Math.max(0, Math.min(points[i].y, canvas.height));
        }
      }

      // 绘制平滑曲线（带透明度渐变）
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      
      for (let i = 1; i < points.length; i++) {
        const prev = points[i-1];
        const curr = points[i];
        const cpx = (prev.x + curr.x) / 2;
        const cpy = (prev.y + curr.y) / 2;
        ctx.quadraticCurveTo(prev.x, prev.y, cpx, cpy);
      }
      
      // 创建渐变效果（带透明度）
      const gradient = ctx.createLinearGradient(
        points[0].x, points[0].y, 
        points[Math.floor(points.length/2)].x, 
        points[Math.floor(points.length/2)].y
      );
      
      // 根据点的位置调整透明度
      gradient.addColorStop(0, `hsla(${currentHue % 360}, 100%, 60%, ${config.baseAlpha * 0.8})`);
      gradient.addColorStop(0.5, `hsla(${(currentHue + 60) % 360}, 100%, 60%, ${config.baseAlpha})`);
      gradient.addColorStop(1, `hsla(${(currentHue + 120) % 360}, 100%, 60%, ${config.baseAlpha * 0.6})`);
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = config.lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    // 重置条件
    if (!isActive && points.length <= config.minPoints) {
      points = [];
      cancelAnimationFrame(animationId);
      animationId = null;
      return;
    }

    animationId = requestAnimationFrame(animateLine);
  }
});