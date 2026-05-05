// js/exp9_new.js

document.addEventListener('DOMContentLoaded', () => {

  // --- Tab Switching Logic ---
  const tabNavLinks = document.querySelectorAll("#tabNav a");
  const tabPanels = document.querySelectorAll(".core-tab-panel");

  tabNavLinks.forEach(link => {
      link.addEventListener("click", (e) => {
          e.preventDefault();
          tabNavLinks.forEach(l => l.classList.remove("active"));
          link.classList.add("active");

          tabPanels.forEach(panel => {
              panel.style.display = "none";
              panel.classList.remove("active");
          });

          const targetId = link.getAttribute("data-target");
          const target = document.getElementById(targetId);
          if(target) {
              if(targetId === "tab-simulation") {
                  target.style.display = "flex";
              } else {
                  target.style.display = "block";
              }
              target.classList.add("active");
          }
      });
  });

  // --- 3D Model Interactivity ---
  const viewer = document.querySelector('#motherboard-viewer');
  if (typeof motherboardGlbData !== 'undefined') {
    viewer.src = motherboardGlbData;
  }
  const componentDetails = document.getElementById('componentDetails');
  const btnResetView = document.getElementById('btnResetView');

  // Component Information
  const componentData = {
    processor: {
      title: "Processor Socket",
      badge: "Core Processing",
      desc: "The central hub of the motherboard. This is where the Central Processing Unit (CPU) physically seats. It connects directly to the system's memory controller and PCIe lanes for ultra-high-speed data transfer."
    },
    memory: {
      title: "Memory Slots (RAM)",
      badge: "Volatile Storage",
      desc: "These slots hold the Random Access Memory (RAM) modules. They provide high-speed, volatile storage for data the CPU needs immediately. Installing identical pairs enables dual-channel memory speeds."
    },
    pci: {
      title: "PCI Expansion Slots",
      badge: "Extensibility",
      desc: "Peripheral Component Interconnect slots. These high-bandwidth interfaces allow you to add discrete graphics cards (GPUs), network adapters, or high-speed NVMe storage cards to extend the system's capabilities."
    },
    cmos: {
      title: "CMOS Battery",
      badge: "Power Backup",
      desc: "This small coin-cell battery keeps the motherboard's real-time clock ticking and preserves the low-level UEFI/BIOS settings in volatile CMOS memory even when the main PC power is physically disconnected."
    },
    ports: {
      title: "Rear I/O Ports",
      badge: "External Interfaces",
      desc: "This cluster provides external interfaces for USB devices, networking (Ethernet), audio, displays, and legacy peripherals. It essentially acts as the bridge from the outside world into the motherboard."
    }
  };

  function showComponentDetails(target) {
    const data = componentData[target];
    if (!data) return;

    componentDetails.innerHTML = `
      <span class="badge" style="display:inline-block; margin-bottom:0.75rem;">${data.badge}</span>
      <h2 style="font-family: var(--font-display, serif); font-size: 1.5rem; margin-top:0; margin-bottom: 0.5rem; color: var(--text);">${data.title}</h2>
      <p class="theory-text">${data.desc}</p>
    `;
  }

  // Component Selection Button Click Event Listener
  const compBtns = document.querySelectorAll('.comp-btn');
  compBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Clear active states
      compBtns.forEach(b => b.classList.remove('active'));
      
      const targetId = btn.getAttribute('data-target');
      btn.classList.add('active');
      showComponentDetails(targetId);
      
      // Rotate camera to focus on specific zones while keeping text readable from the front
      switch(targetId) {
        case 'processor': viewer.cameraOrbit = "0deg 45deg 80%"; break;
        case 'memory': viewer.cameraOrbit = "45deg 45deg 80%"; break;
        case 'pci': viewer.cameraOrbit = "-30deg 50deg 80%"; break;
        case 'cmos': viewer.cameraOrbit = "15deg 55deg 80%"; break;
        case 'ports': viewer.cameraOrbit = "90deg 55deg 80%"; break;
        default: viewer.cameraOrbit = "45deg 55deg auto";
      }
    });
  });

  // Reset Camera View Button
  btnResetView.addEventListener('click', () => {
    viewer.cameraOrbit = "45deg 55deg auto";
    viewer.cameraTarget = "auto auto auto";
    compBtns.forEach(b => b.classList.remove('active'));
    componentDetails.innerHTML = `
      <div style="text-align: center; padding: 2rem 0; opacity: 0.6;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 1rem;">
           <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"/>
        </svg>
        <p>Select a component from the list below to reveal its function and architectural details.</p>
      </div>
    `;
  });

  // --- Feedback Star Rating ---
  const stars = document.querySelectorAll("#feedbackStars .star");
  stars.forEach((star, index) => {
    star.addEventListener("click", () => {
      stars.forEach((s, i) => {
        if(i <= index) {
          s.style.color = "#fbbf24"; // gold
          s.textContent = "★";
        } else {
          s.style.color = "inherit";
          s.textContent = "☆";
        }
      });
    });
  });

});
