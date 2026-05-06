// ══════════════════════════════════════════════════════════════════════════════
//  LogicFlow — Visual Effects Library
//  Particle effects, glowing animations, and impressive UI interactions
// ══════════════════════════════════════════════════════════════════════════════

const VisualEffects = {
  // ── Particle System for Circuit Interactions ────────────────────────────────
  particles: [],
  
  createParticle(x, y, color, type = 'spark') {
    const particle = {
      x, y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 1.0,
      decay: 0.02 + Math.random() * 0.03,
      color,
      size: 2 + Math.random() * 3,
      type
    };
    this.particles.push(particle);
    return particle;
  },
  
  createExplosion(x, y, color, count = 8) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        this.createParticle(x, y, color, 'explosion');
      }, i * 30);
    }
  },
  
  createWireFlow(x1, y1, x2, y2, color = '#10B981') {
    // Create flowing particles along a wire
    const steps = 10;
    for (let i = 0; i < steps; i++) {
      setTimeout(() => {
        const t = i / steps;
        const x = x1 + (x2 - x1) * t;
        const y = y1 + (y2 - y1) * t;
        const particle = this.createParticle(x, y, color, 'flow');
        particle.vx *= 0.3;
        particle.vy *= 0.3;
        particle.decay = 0.05;
      }, i * 50);
    }
  },
  
  update() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      p.size *= 0.98;
      
      if (p.life > 0) {
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return true;
      }
      return false;
    });
    
    requestAnimationFrame(() => this.update());
  },
  
  // ── Glow Effects ─────────────────────────────────────────────────────────────
  addGlowEffect(element, color = '#10B981', intensity = '20px') {
    element.style.transition = 'all 0.3s ease';
    element.style.boxShadow = `0 0 ${intensity} ${color}, 0 0 ${intensity} ${color}`;
    
    setTimeout(() => {
      element.style.boxShadow = '';
    }, 500);
  },
  
  // ── Ripple Effect for Clicks ─────────────────────────────────────────────────
  createRipple(x, y, color = 'rgba(16, 185, 129, 0.4)') {
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: ${color};
      transform: translate(-50%, -50%) scale(0);
      pointer-events: none;
      z-index: 9999;
    `;
    document.body.appendChild(ripple);
    
    ripple.animate([
      { transform: 'translate(-50%, -50%) scale(0)', opacity: 1 },
      { transform: 'translate(-50%, -50%) scale(4)', opacity: 0 }
    ], {
      duration: 600,
      easing: 'ease-out'
    }).onfinish = () => ripple.remove();
  },
  
  // ── Magnetic Button Effect ───────────────────────────────────────────────────
  initMagneticButtons() {
    document.querySelectorAll('.magnetic-btn').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
      });
      
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  },
  
  // ── Neon Text Effect ─────────────────────────────────────────────────────────
  initNeonText(selector, color = '#10B981') {
    document.querySelectorAll(selector).forEach(el => {
      el.style.textShadow = `
        0 0 5px ${color},
        0 0 10px ${color},
        0 0 20px ${color},
        0 0 40px ${color}
      `;
    });
  },
  
  // ── Smooth Scroll with Progress ─────────────────────────────────────────────
  initSmoothScroll() {
    let ticking = false;
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
          document.documentElement.style.setProperty('--scroll-progress', scrollPercent);
          ticking = false;
        });
        ticking = true;
      }
    });
  },
  
  // ── 3D Tilt Effect for Cards ─────────────────────────────────────────────────
  init3DTilt(selector) {
    document.querySelectorAll(selector).forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  },
  
  // ── Initialize All Effects ──────────────────────────────────────────────────
  init() {
    // Create particle canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9998;
    `;
    document.body.appendChild(canvas);
    
    // Resize canvas
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    
    // Start particle loop
    this.update();
    
    // Initialize other effects
    this.initMagneticButtons();
    this.initSmoothScroll();
    this.init3DTilt('.tilt-card');
    
    // Add click ripples
    document.addEventListener('click', (e) => {
      if (e.target.closest('button, .component-item')) {
        this.createRipple(e.clientX, e.clientY);
      }
    });
    
    console.log('✨ Visual Effects initialized');
  }
};

// ── Circuit Animation Effects ─────────────────────────────────────────────────
const CircuitAnimations = {
  // Animate current flow through wires
  animateCurrentFlow(svgElement, connectionPoints, color = '#10B981') {
    const svg = typeof svgElement === 'string' ? document.getElementById(svgElement) : svgElement;
    if (!svg) return;
    
    // Create animated dots along wires
    const wires = svg.querySelectorAll('line[stroke="#334155"]');
    wires.forEach((wire, index) => {
      const x1 = parseFloat(wire.getAttribute('x1'));
      const y1 = parseFloat(wire.getAttribute('y1'));
      const x2 = parseFloat(wire.getAttribute('x2'));
      const y2 = parseFloat(wire.getAttribute('y2'));
      
      // Create flowing dot
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('r', '3');
      dot.setAttribute('fill', color);
      dot.setAttribute('filter', 'url(#glow)');
      dot.style.opacity = '0';
      
      // Animate along the wire
      const duration = 1000 + Math.random() * 500;
      const delay = index * 100;
      
      setTimeout(() => {
        dot.style.opacity = '1';
        dot.style.transition = `all ${duration}ms linear`;
        
        let progress = 0;
        const animate = () => {
          progress += 0.02;
          if (progress > 1) progress = 0;
          
          const x = x1 + (x2 - x1) * progress;
          const y = y1 + (y2 - y1) * progress;
          dot.setAttribute('cx', x);
          dot.setAttribute('cy', y);
          
          if (dot.parentNode) {
            requestAnimationFrame(animate);
          }
        };
        animate();
      }, delay);
      
      svg.appendChild(dot);
    });
  },
  
  // Pulse effect for active components
  pulseComponent(componentElement, color = '#10B981') {
    const element = typeof componentElement === 'string' 
      ? document.querySelector(`[data-id="${componentElement}"]`)
      : componentElement;
    
    if (!element) return;
    
    element.style.animation = 'none';
    element.offsetHeight; // Trigger reflow
    element.style.animation = `componentPulse 1s ease-in-out 3`;
    element.style.setProperty('--pulse-color', color);
  },
  
  // Glow effect for meters
  glowMeter(meterId, color) {
    const meter = document.getElementById(meterId);
    if (!meter) return;
    
    meter.style.animation = 'meterGlow 0.5s ease-in-out 2';
    meter.style.setProperty('--meter-glow-color', color);
  }
};

// ── Initialize on DOM Ready ───────────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => VisualEffects.init());
} else {
  VisualEffects.init();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { VisualEffects, CircuitAnimations };
}
