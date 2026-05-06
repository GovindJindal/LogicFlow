// ══════════════════════════════════════════════════════════════════════════════
//  LogicFlow — Circuit Sandbox Engine
//  Unified circuit builder for experiments 4, 5, 6, 7
// ══════════════════════════════════════════════════════════════════════════════

class CircuitSandbox {
  constructor(config) {
    this.svgId = config.svgId;
    this.readingsId = config.readingsId;
    this.experiment = config.experiment;
    this.components = [];
    this.connections = [];
    this.selectedPort = null;
    this.isErasing = false;
    this.eraserCursor = null;
    this.eraserTimer = null;
    
    this.init();
  }

  init() {
    this.setupDefs();
    this.setupEventListeners();
    this.render();
  }

  setupDefs() {
    this.defs = {
      dcSource: {
        icon: `<circle cx="25" cy="25" r="8" fill="none" stroke="#F43F5E" stroke-width="2"/><text x="25" y="28" text-anchor="middle" font-size="6" fill="#F43F5E" font-weight="bold">DC</text>`,
        svg: (x, y) => `<g class="component-on-canvas" data-id="${this.genId()}" transform="translate(${x},${y})">
          <circle cx="25" cy="25" r="10" fill="rgba(244,63,94,0.1)" stroke="#F43F5E" stroke-width="2"/>
          <text x="25" y="28" text-anchor="middle" font-size="7" fill="#F43F5E" font-weight="bold">DC</text>
          <circle class="connection-point" cx="15" cy="15" r="4" fill="#3B82F6" data-side="top"/>
          <circle class="connection-point" cx="35" cy="15" r="4" fill="#3B82F6" data-side="top"/>
          <circle class="connection-point" cx="15" cy="35" r="4" fill="#3B82F6" data-side="bottom"/>
          <circle class="connection-point" cx="35" cy="35" r="4" fill="#3B82F6" data-side="bottom"/>
        </g>`
      },
      generator: {
        icon: `<circle cx="25" cy="25" r="8" fill="none" stroke="#F43F5E" stroke-width="2"/><path d="M20,25 L30,25 M25,20 L25,30" stroke="#F43F5E" stroke-width="1.5"/>`,
        svg: (x, y) => `<g class="component-on-canvas" data-id="${this.genId()}" transform="translate(${x},${y})">
          <circle cx="25" cy="25" r="10" fill="rgba(244,63,94,0.1)" stroke="#F43F5E" stroke-width="2"/>
          <path d="M20,25 L30,25 M25,20 L25,30" stroke="#F43F5E" stroke-width="1.5"/>
          <circle class="connection-point" cx="15" cy="25" r="4" fill="#3B82F6" data-side="left"/>
          <circle class="connection-point" cx="35" cy="25" r="4" fill="#3B82F6" data-side="right"/>
        </g>`
      },
      resistor: {
        icon: `<rect x="15" y="20" width="20" height="10" fill="none" stroke="#F59E0B" stroke-width="2"/>`,
        svg: (x, y) => `<g class="component-on-canvas" data-id="${this.genId()}" transform="translate(${x},${y})">
          <rect x="15" y="20" width="20" height="10" fill="rgba(245,158,11,0.1)" stroke="#F59E0B" stroke-width="2"/>
          <circle class="connection-point" cx="15" cy="25" r="4" fill="#3B82F6" data-side="left"/>
          <circle class="connection-point" cx="35" cy="25" r="4" fill="#3B82F6" data-side="right"/>
        </g>`
      },
      zener: {
        icon: `<polygon points="20,25 30,15 30,35" fill="none" stroke="#7C3AED" stroke-width="2"/><line x1="30" y1="15" x2="30" y2="35" stroke="#7C3AED" stroke-width="3"/>`,
        svg: (x, y) => `<g class="component-on-canvas" data-id="${this.genId()}" transform="translate(${x},${y})">
          <polygon points="20,25 30,15 30,35" fill="rgba(124,58,237,0.1)" stroke="#7C3AED" stroke-width="2"/>
          <line x1="30" y1="15" x2="30" y2="35" stroke="#7C3AED" stroke-width="3"/>
          <circle class="connection-point" cx="15" cy="25" r="4" fill="#3B82F6" data-side="left"/>
          <circle class="connection-point" cx="35" cy="25" r="4" fill="#3B82F6" data-side="right"/>
        </g>`
      },
      diode: {
        icon: `<polygon points="20,25 30,15 30,35" fill="none" stroke="#10B981" stroke-width="2"/>`,
        svg: (x, y) => `<g class="component-on-canvas" data-id="${this.genId()}" transform="translate(${x},${y})">
          <polygon points="20,25 30,15 30,35" fill="rgba(16,185,129,0.1)" stroke="#10B981" stroke-width="2"/>
          <circle class="connection-point" cx="15" cy="25" r="4" fill="#3B82F6" data-side="left"/>
          <circle class="connection-point" cx="35" cy="25" r="4" fill="#3B82F6" data-side="right"/>
        </g>`
      },
      capacitor: {
        icon: `<line x1="20" y1="15" x2="20" y2="35" stroke="#06B6D4" stroke-width="2"/><line x1="30" y1="15" x2="30" y2="35" stroke="#06B6D4" stroke-width="2"/>`,
        svg: (x, y) => `<g class="component-on-canvas" data-id="${this.genId()}" transform="translate(${x},${y})">
          <line x1="20" y1="15" x2="20" y2="35" stroke="#06B6D4" stroke-width="2"/>
          <line x1="30" y1="15" x2="30" y2="35" stroke="#06B6D4" stroke-width="2"/>
          <circle class="connection-point" cx="15" cy="25" r="4" fill="#3B82F6" data-side="left"/>
          <circle class="connection-point" cx="35" cy="25" r="4" fill="#3B82F6" data-side="right"/>
        </g>`
      },
      ammeter: {
        icon: `<circle cx="25" cy="25" r="8" fill="none" stroke="#1A56DB" stroke-width="2"/><text x="25" y="28" text-anchor="middle" font-size="6" fill="#1A56DB" font-weight="bold">A</text>`,
        svg: (x, y) => `<g class="component-on-canvas" data-id="${this.genId()}" transform="translate(${x},${y})">
          <circle cx="25" cy="25" r="10" fill="rgba(26,86,219,0.1)" stroke="#1A56DB" stroke-width="2"/>
          <text x="25" y="28" text-anchor="middle" font-size="7" fill="#1A56DB" font-weight="bold">A</text>
          <circle class="connection-point" cx="15" cy="25" r="4" fill="#3B82F6" data-side="left"/>
          <circle class="connection-point" cx="35" cy="25" r="4" fill="#3B82F6" data-side="right"/>
        </g>`
      },
      voltmeter: {
        icon: `<circle cx="25" cy="25" r="8" fill="none" stroke="#F59E0B" stroke-width="2"/><text x="25" y="28" text-anchor="middle" font-size="6" fill="#F59E0B" font-weight="bold">V</text>`,
        svg: (x, y) => `<g class="component-on-canvas" data-id="${this.genId()}" transform="translate(${x},${y})">
          <circle cx="25" cy="25" r="10" fill="rgba(245,158,11,0.1)" stroke="#F59E0B" stroke-width="2"/>
          <text x="25" y="28" text-anchor="middle" font-size="7" fill="#F59E0B" font-weight="bold">V</text>
          <circle class="connection-point" cx="15" cy="25" r="4" fill="#3B82F6" data-side="left"/>
          <circle class="connection-point" cx="35" cy="25" r="4" fill="#3B82F6" data-side="right"/>
        </g>`
      },
      ground: {
        icon: `<line x1="25" y1="20" x2="25" y2="30" stroke="#64748B" stroke-width="2"/><line x1="20" y1="30" x2="30" y2="30" stroke="#64748B" stroke-width="2"/>`,
        svg: (x, y) => `<g class="component-on-canvas" data-id="${this.genId()}" transform="translate(${x},${y})">
          <line x1="25" y1="20" x2="25" y2="30" stroke="#64748B" stroke-width="2"/>
          <line x1="20" y1="30" x2="30" y2="30" stroke="#64748B" stroke-width="2"/>
          <circle class="connection-point" cx="25" cy="20" r="4" fill="#3B82F6" data-side="top"/>
        </g>`
      }
    };
  }

  genId() {
    return 'comp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  setupEventListeners() {
    const svg = document.getElementById(this.svgId);
    if (!svg) return;

    // Drag and drop
    svg.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });

    svg.addEventListener('drop', (e) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('csb-type');
      if (type && this.defs[type]) {
        const rect = svg.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (800 / rect.width) - 25;
        const y = (e.clientY - rect.top) * (400 / rect.height) - 25;
        this.addComponent(type, x, y);
      }
    });

    // Connection points
    svg.addEventListener('click', (e) => {
      if (this.isErasing) return;
      
      const point = e.target.closest('.connection-point');
      if (point) {
        this.handleConnectionPoint(point);
      }
    });

    // Component deletion (right-click)
    svg.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const component = e.target.closest('.component-on-canvas');
      if (component) {
        this.deleteComponent(component.dataset.id);
      }
    });

    // Component editing (double-click)
    svg.addEventListener('dblclick', (e) => {
      const component = e.target.closest('.component-on-canvas');
      if (component) {
        this.editComponent(component.dataset.id);
      }
    });
  }

  addComponent(type, x, y) {
    const component = {
      id: this.genId(),
      type: type,
      x: Math.max(0, Math.min(750, x)),
      y: Math.max(0, Math.min(350, y)),
      values: {}
    };
    this.components.push(component);
    this.render();
  }

  deleteComponent(id) {
    this.components = this.components.filter(c => c.id !== id);
    this.connections = this.connections.filter(conn => 
      conn.fromComp !== id && conn.toComp !== id
    );
    this.render();
  }

  editComponent(id) {
    const component = this.components.find(c => c.id === id);
    if (!component) return;

    const value = prompt(`Enter value for ${component.type}:`, 
      Object.values(component.values)[0] || '');
    if (value !== null) {
      if (component.type === 'resistor') {
        component.values.resistance = parseFloat(value) || 1000;
      } else if (component.type === 'capacitor') {
        component.values.capacitance = parseFloat(value) || 100;
      } else if (component.type === 'dcSource' || component.type === 'generator') {
        component.values.voltage = parseFloat(value) || 5;
      } else if (component.type === 'zener') {
        component.values.vz = parseFloat(value) || 5.1;
      }
      this.render();
    }
  }

  handleConnectionPoint(point) {
    const component = point.closest('.component-on-canvas');
    const componentId = component.dataset.id;
    const side = point.dataset.side;

    if (!this.selectedPort) {
      this.selectedPort = { componentId, side };
      point.style.fill = '#10B981';
    } else {
      if (this.selectedPort.componentId !== componentId) {
        this.connections.push({
          fromComp: this.selectedPort.componentId,
          fromPort: this.getPortIndex(this.selectedPort.side),
          toComp: componentId,
          toPort: this.getPortIndex(side)
        });
      }
      this.selectedPort = null;
      this.render();
    }
  }

  getPortIndex(side) {
    const portMap = { left: 0, right: 1, top: 0, bottom: 1 };
    return portMap[side] || 0;
  }

  getPortPosition(component, portIndex) {
    const x = component.x + 25;
    const y = component.y + 25;
    
    if (component.type === 'ground') {
      return { x, y: component.y + 20 };
    }
    
    // Simple port positioning
    if (portIndex === 0) { // left or top
      return component.type === 'dcSource' || component.type === 'generator' 
        ? { x: component.x + 15, y }
        : { x, y: component.y + 15 };
    } else { // right or bottom
      return { x: component.x + 35, y };
    }
  }

  render() {
    const svg = document.getElementById(this.svgId);
    if (!svg) return;

    let svgContent = `
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="800" height="400" fill="url(#grid)"/>
    `;

    // Render components
    this.components.forEach(component => {
      const template = this.defs[component.type];
      if (template) {
        svgContent += template.svg(component.x, component.y);
      }
    });

    // Render connections
    this.connections.forEach(conn => {
      const fromComp = this.components.find(c => c.id === conn.fromComp);
      const toComp = this.components.find(c => c.id === conn.toComp);
      
      if (fromComp && toComp) {
        const from = this.getPortPosition(fromComp, conn.fromPort);
        const to = this.getPortPosition(toComp, conn.toPort);
        svgContent += `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="#F59E0B" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      }
    });

    svg.innerHTML = svgContent;
  }

  loadTemplate(template) {
    this.components = [...template.components];
    this.connections = [...template.connections];
    this.render();
  }

  clearAll() {
    this.components = [];
    this.connections = [];
    this.selectedPort = null;
    this.render();
  }

  activateEraser() {
    this.isErasing = true;
    if (!this.eraserCursor) {
      this.eraserCursor = document.createElement('div');
      this.eraserCursor.style.cssText = `
        position: fixed;
        width: 30px;
        height: 30px;
        border: 2px solid #ef4444;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(239, 68, 68, 0.3), rgba(239, 68, 68, 0.1));
        pointer-events: none;
        z-index: 10000;
        transform: translate(-50%, -50%);
        transition: all 0.1s ease;
        box-shadow: 0 0 15px rgba(239, 68, 68, 0.4);
      `;
      document.body.appendChild(this.eraserCursor);
    }
    this.eraserCursor.style.display = 'block';
    document.body.style.cursor = 'none';
    
    document.addEventListener('mousemove', this.handleEraserMove);
    document.addEventListener('click', this.handleEraserClick);
  }

  deactivateEraser() {
    this.isErasing = false;
    if (this.eraserCursor) {
      this.eraserCursor.style.display = 'none';
    }
    document.body.style.cursor = '';
    
    document.removeEventListener('mousemove', this.handleEraserMove);
    document.removeEventListener('click', this.handleEraserClick);
  }

  handleEraserMove = (e) => {
    if (!this.isErasing) return;
    
    if (this.eraserCursor) {
      this.eraserCursor.style.left = e.clientX + 'px';
      this.eraserCursor.style.top = e.clientY + 'px';
    }
  }

  handleEraserClick = (e) => {
    if (!this.isErasing) return;
    e.preventDefault();
    
    const svg = document.getElementById(this.svgId);
    if (!svg) return;
    
    const rect = svg.getBoundingClientRect();
    // Check if click is within SVG bounds
    if (e.clientX < rect.left || e.clientX > rect.right || 
        e.clientY < rect.top || e.clientY > rect.bottom) {
      return;
    }
    
    const x = (e.clientX - rect.left) * (800 / rect.width);
    const y = (e.clientY - rect.top) * (400 / rect.height);
    
    // Check for wire deletion
    const elements = document.elementsFromPoint(e.clientX, e.clientY);
    for (const element of elements) {
      if (element.tagName === 'line' && element.closest(`#${this.svgId}`)) {
        const x1 = parseFloat(element.getAttribute('x1'));
        const y1 = parseFloat(element.getAttribute('y1'));
        const x2 = parseFloat(element.getAttribute('x2'));
        const y2 = parseFloat(element.getAttribute('y2'));
        
        this.connections = this.connections.filter(conn => {
          const fromComp = this.components.find(c => c.id === conn.fromComp);
          const toComp = this.components.find(c => c.id === conn.toComp);
          
          if (!fromComp || !toComp) return true;
          
          const from = this.getPortPosition(fromComp, conn.fromPort);
          const to = this.getPortPosition(toComp, conn.toPort);
          
          const tolerance = 2;
          const match1 = Math.abs(from.x - x1) < tolerance && Math.abs(from.y - y1) < tolerance && 
                        Math.abs(to.x - x2) < tolerance && Math.abs(to.y - y2) < tolerance;
          const match2 = Math.abs(from.x - x2) < tolerance && Math.abs(from.y - y2) < tolerance && 
                        Math.abs(to.x - x1) < tolerance && Math.abs(to.y - y1) < tolerance;
          
          return !match1 && !match2;
        });
        
        this.render();
        return;
      }
    }
    
    // Check for component deletion
    const component = document.elementFromPoint(e.clientX, e.clientY)?.closest('.component-on-canvas');
    if (component && component.closest(`#${this.svgId}`)) {
      this.deleteComponent(component.dataset.id);
    }
  }

  runSimulation() {
    const readings = document.getElementById(this.readingsId);
    if (!readings) return;

    if (this.components.length === 0) {
      readings.innerHTML = '<p style="color:#475569;font-size:.8rem;font-family:\'JetBrains Mono\',monospace">No components to simulate.</p>';
      return;
    }

    // Basic simulation based on experiment type
    if (this.experiment === 'zener') {
      this.runZenerSimulation(readings);
    } else if (this.experiment === 'rectifier') {
      this.runRectifierSimulation(readings);
    } else {
      readings.innerHTML = '<p style="color:#475569;font-size:.8rem;font-family:\'JetBrains Mono\',monospace">Simulation running...</p>';
    }
  }

  runZenerSimulation(readings) {
    const dcSource = this.components.find(c => c.type === 'dcSource');
    const resistor = this.components.find(c => c.type === 'resistor');
    const zener = this.components.find(c => c.type === 'zener');

    if (!dcSource || !resistor || !zener) {
      readings.innerHTML = '<p style="color:#F59E0B;font-size:.8rem;font-family:\'JetBrains Mono\',monospace">Add DC Source, Resistor, and Zener diode for simulation.</p>';
      return;
    }

    const vin = dcSource.values.voltage || 5;
    const rs = resistor.values.resistance || 220;
    const vz = zener.values.vz || 5.1;
    const rl = 1000; // Default load

    let vout = vin * (rl / (rs + rl));
    let iz = 0;

    if (vout > vz) {
      vout = vz;
      iz = ((vin - vz) / rs) - (vz / rl);
    }

    const il = vout / rl;
    const pz = vout * Math.max(0, iz) * 1000;

    readings.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;font-family:'JetBrains Mono',monospace;font-size:.8rem">
        <div><strong>Input Voltage:</strong> ${vin.toFixed(1)}V</div>
        <div><strong>Output Voltage:</strong> ${vout.toFixed(2)}V</div>
        <div><strong>Zener Current:</strong> ${(iz*1000).toFixed(2)}mA</div>
        <div><strong>Load Current:</strong> ${(il*1000).toFixed(2)}mA</div>
        <div><strong>Power Dissipation:</strong> ${pz.toFixed(1)}mW</div>
        <div><strong>Status:</strong> ${iz > 0.001 ? 'Regulating' : 'Not regulating'}</div>
      </div>
    `;
  }

  runRectifierSimulation(readings) {
    const generator = this.components.find(c => c.type === 'generator');
    const diode = this.components.find(c => c.type === 'diode');
    const resistor = this.components.find(c => c.type === 'resistor');
    const ammeter = this.components.find(c => c.type === 'ammeter');
    const ground = this.components.find(c => c.type === 'ground');

    // Check for power source
    if (!generator) {
      readings.innerHTML = '<p style="color:#F59E0B;font-size:.8rem;font-family:\'JetBrains Mono\',monospace">❌ Missing AC Generator.</p>';
      return;
    }
    
    // Check for at least one load component
    if (!resistor && !ammeter) {
      readings.innerHTML = '<p style="color:#F59E0B;font-size:.8rem;font-family:\'JetBrains Mono\',monospace">❌ Missing Load (add Resistor or Ammeter).</p>';
      return;
    }

    // Check if components are connected
    if (this.connections.length < 2) {
      readings.innerHTML = '<p style="color:#F59E0B;font-size:.8rem;font-family:\'JetBrains Mono\',monospace">⚠️ Components not properly connected. Need at least 2 wires to form a circuit.</p>';
      return;
    }

    const vin = generator.values.voltage || 10;
    const vf = diode?.values.vf || 0;
    const rl = (resistor?.values.resistance || 1000);
    const freq = generator.values.frequency || 50;

    // Simple AC circuit physics (generator + load)
    let vpeak = vin;
    let vdc = 0;
    let vrms = 0;
    let ipeak = 0;
    let idc = 0;
    let efficiency = 0;
    let circuitType = '';

    if (diode) {
      // Half-wave rectifier
      vpeak = vin - vf;
      vdc = vpeak / Math.PI;
      vrms = vpeak / 2;
      ipeak = vpeak / rl;
      idc = ipeak / Math.PI;
      efficiency = (vdc / vin) * 40.6;
      circuitType = 'Half-Wave Rectifier';
    } else {
      // Pure AC circuit
      vrms = vin / Math.sqrt(2);
      ipeak = vin / rl;
      vdc = 0;
      idc = 0;
      efficiency = 0;
      circuitType = 'Pure AC Circuit';
    }

    const power_dc = vdc * idc;
    const power_rms = vrms * (vrms / rl);

    readings.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;font-family:'JetBrains Mono',monospace;font-size:.8rem">
        <div><strong>Circuit Type:</strong> ${circuitType}</div>
        <div><strong>Frequency:</strong> ${freq}Hz</div>
        <div><strong>AC Input (RMS):</strong> ${(vin/Math.sqrt(2)).toFixed(1)}V</div>
        <div><strong>Peak Input:</strong> ${vin.toFixed(1)}V</div>
        ${diode ? `
        <div><strong>Peak Output:</strong> ${vpeak.toFixed(1)}V</div>
        <div><strong>DC Output:</strong> ${vdc.toFixed(2)}V</div>
        <div><strong>RMS Output:</strong> ${vrms.toFixed(2)}V</div>
        ` : `
        <div><strong>Output (RMS):</strong> ${vrms.toFixed(2)}V</div>
        <div><strong>DC Output:</strong> 0.00V</div>
        <div><strong>-</strong></div>
        `}
        <div><strong>Load Current:</strong> ${diode ? (idc*1000).toFixed(2)+'mA (DC)' : (vrms/rl*1000).toFixed(2)+'mA (RMS)'}</div>
        <div><strong>Peak Current:</strong> ${(ipeak*1000).toFixed(2)}mA</div>
        <div><strong>Load Power:</strong> ${diode ? (power_dc*1000).toFixed(2)+'mW (DC)' : (power_rms*1000).toFixed(2)+'mW (RMS)'}</div>
        <div><strong>Efficiency:</strong> ${efficiency > 0 ? efficiency.toFixed(1)+'%' : 'N/A'}</div>
        <div><strong>Load:</strong> ${resistor ? 'Resistor ('+rl+'Ω)' : 'Ammeter'}</div>
        <div style="color:#10B981;font-weight:700">✅ Circuit Active - Power Flowing</div>
      </div>
    `;
  }
}
