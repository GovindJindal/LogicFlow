// js/motherboard.js

document.addEventListener('DOMContentLoaded', () => {
  const viewer = document.querySelector('#motherboard-viewer');
  const infoCard = document.getElementById('infoCard');
  const infoBadge = document.getElementById('infoBadge');
  const infoTitle = document.getElementById('infoTitle');
  const infoDesc = document.getElementById('infoDesc');
  const btnCloseCard = document.getElementById('btnCloseCard');
  const btnReset = document.getElementById('btnReset');
  const coordinateOutput = document.getElementById('coordinateOutput');

  // We MUST cache original material colors here because the model uses 
  // baseColorFactor to define component colors, not just textures!
  let originalMaterials = new Map();

  // Story and feature content for each hotspot
  const componentData = {
    processor: {
      title: "Processor Socket",
      badge: "Core Processing",
      desc: "The central hub (like the Intel Core i7 socket). This is where the CPU seats, connecting directly to the high-speed Northbridge or internal memory controller. It's the brain of the motherboard."
    },
    memory: {
      title: "Memory Slots (RAM)",
      badge: "Volatile Storage",
      desc: "These alternating slots hold the RAM modules. They provide high-speed, volatile storage for data the CPU needs immediately. Alternating colors indicate dual-channel memory configurations."
    },
    pci: {
      title: "PCI Expansion Slots",
      badge: "Extensibility",
      desc: "Peripheral Component Interconnect slots. These black slots allow you to add discrete graphics cards, network cards, or custom interface boards to extend the system's capabilities."
    },
    cmos: {
      title: "CMOS Battery",
      badge: "Power Backup",
      desc: "This small round battery keeps the real-time clock ticking and preserves the BIOS/UEFI settings in the volatile CMOS RAM when the main power is disconnected."
    },
    ports: {
      title: "Rear I/O Ports",
      badge: "External Interfaces",
      desc: "The black connectors along the top edge provide external interfaces for USB, networking, displays, and legacy peripherals, bridging the outside world to the motherboard."
    }
  };

  // Maps logical targets to actual GLB material names
  // Use the Dev Mode Helper on screen to find these!
  const materialMap = {
    processor: [],
    memory: [],
    pci: [],
    cmos: [],
    ports: []
  };

  // Initialize materials once the model is fully loaded
  viewer.addEventListener('load', () => {
    const materials = viewer.model.materials;
    materials.forEach(mat => {
      // Deep copy the original baseColorFactor [r, g, b, a] so we don't permanently lose the model's native colors.
      if (mat.pbrMetallicRoughness && mat.pbrMetallicRoughness.baseColorFactor) {
        originalMaterials.set(mat.name, [...mat.pbrMetallicRoughness.baseColorFactor]);
      }
    });
    
    // Enable on-screen dev mode for finding coordinates
    setupDevMode();
  });

  function applyDimmingFocus(targetComponentKey) {
    if (!viewer.model) return;
    
    const targetMaterialNames = materialMap[targetComponentKey] || [];
    
    viewer.model.materials.forEach(mat => {
      if (!mat.pbrMetallicRoughness) return;

      if (targetMaterialNames.includes(mat.name)) {
        // Keep it vibrant by restoring its TRUE native color
        const originalColor = originalMaterials.get(mat.name);
        if (originalColor) {
          mat.pbrMetallicRoughness.setBaseColorFactor(originalColor);
        }
      } else {
        // Heavily dim into the shadows
        mat.pbrMetallicRoughness.setBaseColorFactor([0.1, 0.1, 0.1, 1]);
      }
    });
  }

  function resetView() {
    if (!viewer.model) return;
    
    // Reset Camera
    viewer.setAttribute('camera-target', 'auto auto auto');
    viewer.setAttribute('camera-orbit', '45deg 55deg auto');
    
    // Reset Materials back to their cached native full-color state
    viewer.model.materials.forEach(mat => {
      if (mat.pbrMetallicRoughness) {
        const originalColor = originalMaterials.get(mat.name);
        if (originalColor) {
          mat.pbrMetallicRoughness.setBaseColorFactor(originalColor);
        }
      }
    });

    // Hide UI
    infoCard.classList.remove('active');
    hotspots.forEach(h => h.classList.remove('active'));
  }

  // Handle Hotspot Clicks
  const hotspots = document.querySelectorAll('.hotspot');
  
  hotspots.forEach(hotspot => {
    hotspot.addEventListener('click', (e) => {
      // Prevent model-viewer from treating this as a general canvas interaction
      e.stopPropagation();

      // Reset old active hotspots
      hotspots.forEach(h => h.classList.remove('active'));
      hotspot.classList.add('active');

      // Cinematic Zoom
      const pos = hotspot.dataset.position;
      if (pos && pos !== "REPLACE_ME_WITH_EDITOR_COORDINATES") {
        viewer.setAttribute('camera-target', pos);
      }

      // Visual Focus (Dimming)
      const targetKey = hotspot.dataset.target;
      applyDimmingFocus(targetKey);

      // Populate Info Card
      const data = componentData[targetKey];
      if (data) {
        infoTitle.textContent = data.title;
        infoBadge.textContent = data.badge;
        infoDesc.textContent = data.desc;
        
        // Add a slight delay before showing card so camera starts moving first
        setTimeout(() => {
          infoCard.classList.add('active');
        }, 300);
      }
    });
  });

  // Reset View on Button Click
  btnReset.addEventListener('click', (e) => {
    e.stopPropagation();
    resetView();
  });

  // Reset View on Background/Model Click
  viewer.addEventListener('click', (event) => {
    // If the click is on a hotspot, ignore it (handled above)
    if (event.target.classList.contains('hotspot') || event.target.closest('.hotspot')) {
      return;
    }
    resetView();
  });

  btnCloseCard.addEventListener('click', (e) => {
    e.stopPropagation();
    infoCard.classList.remove('active');
  });

  // DEV MODE UTILITY:
  // Shows coordinates and material names directly on screen when you click the model
  function setupDevMode() {
    const devBox = document.createElement('div');
    devBox.style.cssText = "position: absolute; bottom: 20px; left: 20px; background: rgba(0,0,0,0.85); color: #00ff00; padding: 15px; border-radius: 8px; font-family: monospace; z-index: 999; max-width: 400px;";
    devBox.innerHTML = `<strong>Setup Mode:</strong> Click the motherboard to get coordinates.<br><br><span id="devOut">Waiting for click...</span>`;
    document.querySelector('.viewer-container').appendChild(devBox);

    viewer.addEventListener('click', (event) => {
      if (event.target.classList.contains('hotspot') || event.target.closest('.hotspot')) return;

      const rect = viewer.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const hit = viewer.positionAndNormalFromPoint(x, y);
      if (hit) {
        const material = viewer.materialFromPoint(x, y);
        const posStr = `${hit.position.x.toFixed(3)} ${hit.position.y.toFixed(3)} ${hit.position.z.toFixed(3)}`;
        const normStr = `${hit.normal.x.toFixed(3)} ${hit.normal.y.toFixed(3)} ${hit.normal.z.toFixed(3)}`;
        const matName = material ? material.name : "Unknown";
        
        document.getElementById('devOut').innerHTML = `
          data-position="${posStr}"<br>
          data-normal="${normStr}"<br>
          Material Name: "${matName}"
        `;
      }
    });
  }

});
