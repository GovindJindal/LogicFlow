(function () {
  const root = document.documentElement;
  
  let maxRadius = Math.max(window.innerWidth, window.innerHeight) * 1.5;
  if (maxRadius < 2000) maxRadius = 2500;
  
  let cx = window.innerWidth / 2;
  let cy = window.innerHeight / 2;
  
  root.style.setProperty('--cursor-x', `${cx}px`);
  root.style.setProperty('--cursor-y', `${cy}px`);
  root.style.setProperty('--cursor-radius', `${maxRadius}px`);
  
  let animationStart = null;
  let phase = 0; 

  function animateRipple(timestamp) {
    if (!animationStart) animationStart = timestamp;
    const elapsed = timestamp - animationStart;
    
    // Phase 0: Flash time reduced to a fraction of a second (300ms)
    if (phase === 0) {
      if (elapsed > 300) { 
        phase = 1;
        animationStart = timestamp; 
      }
    } else if (phase === 1) {
      // Phase 1: Ripple/aperture closes sharply over 700ms
      const duration = 700;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeProgress = Math.pow(progress, 3); // Cubic ease inward
      const currentRadius = maxRadius * (1 - easeProgress);
      root.style.setProperty('--cursor-radius', `${currentRadius}px`);
      
      if (progress >= 1) {
        phase = 2; // Blackout complete
        root.style.setProperty('--cursor-radius', `0px`);
      }
    }
    
    if (phase < 2) {
      requestAnimationFrame(animateRipple);
    }
  }
  
  requestAnimationFrame(animateRipple);
  
  document.addEventListener('mousemove', (e) => {
    if (phase >= 2) {
      root.style.setProperty('--cursor-x', `${e.clientX}px`);
      root.style.setProperty('--cursor-y', `${e.clientY}px`);
      root.style.setProperty('--cursor-radius', `250px`); 
    }
  });

  // METAMORPHOSIS NAV LINK SWAP
  // Triggered when CSS animation is at `50%` (nav is tiny)
  // Overall anim is 2.0s with 0.5s delay. Midpoint is 1.5s
  setTimeout(() => {
    const navLinks = document.querySelector('.nav-links');
    const navActions = document.querySelector('.nav-actions');
    const navLogo = document.querySelector('.nav-logo');
    
    if (navLinks) {
      navLinks.innerHTML = `
        <li><a href="sandbox.html" style="color:white; text-decoration:none; opacity:0.75; font-family:var(--lf-font-body);" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.75'">Logic Gates</a></li>
        <li><a href="coa.html" style="color:white; text-decoration:none; opacity:0.75; font-family:var(--lf-font-body);" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.75'">Registers & Micro-Ops</a></li>
      `;
    }
    
    if (navActions) {
      navActions.innerHTML = `
         <a href="index.html" class="btn-enter" style="background:rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color:white; padding:8px 16px; border-radius:50px; text-decoration:none; font-weight:600;">Exit Sandbox</a>
      `;
    }
    
    if (navLogo) {
       navLogo.style.color = "white";
    }
  }, 1500);

})();