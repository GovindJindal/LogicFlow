// js/exp8_mux_demux.js

document.addEventListener("DOMContentLoaded", () => {
    // Safety timeout: show error if initialization hangs
    const _expSafetyTimer = setTimeout(function() {
      if (document.body) {
        var err = document.createElement('div');
        err.style.cssText = 'position:fixed;inset:0;background:rgba(255,255,255,0.95);z-index:99999;display:flex;align-items:center;justify-content:center;flex-direction:column;font-family:sans-serif;';
        err.innerHTML = '<h2 style="color:#dc3545;margin:0 0 12px;">This experiment failed to load</h2><p style="color:#424848;margin:0 0 24px;">Please refresh or go back.</p><a href="index.html" style="padding:10px 20px;background:#1a56db;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">Go Back</a>';
        document.body.appendChild(err);
      }
    }, 8000);

    // DOM Elements
    const modeSwitch = document.getElementById("modeSwitch");
    const simModeTitle = document.getElementById("simModeTitle");
    const dataInputGroup = document.getElementById("dataInputGroup");
    const selectGroup = document.getElementById("selectGroup");
    const outputGroup = document.getElementById("outputGroup");
    const simCanvas = document.getElementById("simCanvas");
    const theoryContent = document.getElementById("theoryContent");
    const ttHeader = document.getElementById("ttHeader");
    const ttBody = document.getElementById("ttBody");
    const addReadingBtn = document.getElementById("addReadingBtn");
    const resetBtn = document.getElementById("resetBtn");
    const exportBtn = document.getElementById("exportBtn");
    const exportCsvBtn = document.getElementById("exportCsvBtn");
    const tabNavLinks = document.querySelectorAll("#tabNav a");
    const tabPanels = document.querySelectorAll(".core-tab-panel");

    // Print Elements
    const prMode = document.getElementById("prMode");
    const prDate = document.getElementById("prDate");
    const prTable = document.getElementById("prTable");

    // Feedback Stars
    const stars = document.querySelectorAll(".star");
    stars.forEach((star, idx) => {
        star.addEventListener("click", () => {
            stars.forEach((s, i) => s.textContent = i <= idx ? "★" : "☆");
        });
    });

    // Core State
    let mode = 'mux'; // 'mux' or 'demux'
    let state = {
        s1: 0, s0: 0,
        d0: 0, d1: 0, d2: 0, d3: 0, // MUX
        d: 0 // DEMUX
    };
    let observationData = [];

    // --- Tab Switching Logic ---
    tabNavLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            // Remove active from all links
            tabNavLinks.forEach(l => l.classList.remove("active"));
            link.classList.add("active");

            // Hide all panels
            tabPanels.forEach(panel => {
                panel.style.display = "none";
                panel.classList.remove("active");
            });

            // Show target
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

    function initUI() {
        buildControls();
        buildCanvasSVG();
        updateLogic();
        renderTableHeaders();
    }

    modeSwitch.addEventListener("change", (e) => {
        mode = e.target.checked ? 'demux' : 'mux';
        simModeTitle.textContent = mode === 'mux' ? "Circuit: 4:1 MULTIPLEXER" : "Circuit: 1:4 DEMULTIPLEXER";
        observationData = []; // Clear data on mode switch
        ttBody.innerHTML = '';
        state = { s1: 0, s0: 0, d0: 0, d1: 0, d2: 0, d3: 0, d: 0 };
        initUI();
    });

    function buildControls() {
        dataInputGroup.innerHTML = '';
        selectGroup.innerHTML = '';
        outputGroup.innerHTML = '';

        // Select Lines
        ['S1', 'S0'].forEach(s => {
            const wrap = document.createElement("div");
            wrap.className = "io-switch";
            const btn = document.createElement("button");
            btn.className = "toggle-btn";
            btn.textContent = "0";
            btn.onclick = () => {
                state[s.toLowerCase()] = state[s.toLowerCase()] === 0 ? 1 : 0;
                btn.textContent = state[s.toLowerCase()];
                btn.classList.toggle("on", state[s.toLowerCase()] === 1);
                updateLogic();
            };
            wrap.innerHTML = `<span>${s}</span>`;
            wrap.appendChild(btn);
            selectGroup.appendChild(wrap);
        });

        if (mode === 'mux') {
            ['D0', 'D1', 'D2', 'D3'].forEach(d => {
                const wrap = document.createElement("div");
                wrap.className = "io-switch";
                const btn = document.createElement("button");
                btn.className = "toggle-btn";
                btn.textContent = "0";
                btn.onclick = () => {
                    state[d.toLowerCase()] = state[d.toLowerCase()] === 0 ? 1 : 0;
                    btn.textContent = state[d.toLowerCase()];
                    btn.classList.toggle("on", state[d.toLowerCase()] === 1);
                    updateLogic();
                };
                wrap.innerHTML = `<span>${d}</span>`;
                wrap.appendChild(btn);
                dataInputGroup.appendChild(wrap);
            });
            
            const outWrap = document.createElement("div");
            outWrap.className = "io-switch";
            outWrap.innerHTML = `<span>Y</span><div class="output-ind" id="outY">0</div>`;
            outputGroup.appendChild(outWrap);
        } else {
            const wrap = document.createElement("div");
            wrap.className = "io-switch";
            const btn = document.createElement("button");
            btn.className = "toggle-btn";
            btn.textContent = "0";
            btn.onclick = () => {
                state.d = state.d === 0 ? 1 : 0;
                btn.textContent = state.d;
                btn.classList.toggle("on", state.d === 1);
                updateLogic();
            };
            wrap.innerHTML = `<span>D</span>`;
            wrap.appendChild(btn);
            dataInputGroup.appendChild(wrap);

            ['Y0', 'Y1', 'Y2', 'Y3'].forEach(y => {
                const outWrap = document.createElement("div");
                outWrap.className = "io-switch";
                outWrap.innerHTML = `<span>${y}</span><div class="output-ind" id="out${y}">0</div>`;
                outputGroup.appendChild(outWrap);
            });
        }
    }

    function buildCanvasSVG() {
        simCanvas.innerHTML = '';
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        svg.setAttribute("viewBox", "0 0 600 400");
        svg.style.overflow = "visible";

        const defs = document.createElementNS(svgNS, "defs");
        // GATES with embedded `<title>` tags for tooltips.
        defs.innerHTML += `
            <g id="andGate">
               <title>AND Gate: Multiplies inputs. Acts like a lock that only opens if ALL connected select lines are active.</title>
               <path d="M0,0 L15,0 Q30,0 30,15 Q30,30 15,30 L0,30 Z" class="gates" />
               <text x="5" y="18" class="gate-label">AND</text>
            </g>
            <g id="orGate">
               <title>OR Gate: Adds inputs. Funnels any active branch down into a single comprehensive output.</title>
               <path d="M0,0 Q10,15 0,30 C20,30 35,20 35,15 C35,10 20,0 0,0 Z" class="gates" />
               <text x="8" y="18" class="gate-label">OR</text>
            </g>
            <g id="notGate">
               <title>NOT Gate: Inverts the signal. Transforms a High (1) into a Low (0) or vice versa.</title>
               <polygon points="0,0 20,10 0,20" class="gates" />
               <circle cx="23" cy="10" r="3" fill="none" stroke="#1e293b" stroke-width="2"/>
               <text x="2" y="13" class="gate-label" style="font-size:6px;">NOT</text>
            </g>
        `;
        svg.appendChild(defs);

        const wiresGroup = document.createElementNS(svgNS, "g");
        wiresGroup.setAttribute("class", "wires");
        const gatesGroup = document.createElementNS(svgNS, "g");

        if (mode === 'mux') {
            addWire(wiresGroup, "wD0", 50, 50, 200, 50);
            addWire(wiresGroup, "wD1", 50, 150, 200, 150);
            addWire(wiresGroup, "wD2", 50, 250, 200, 250);
            addWire(wiresGroup, "wD3", 50, 350, 200, 350);

            addWire(wiresGroup, "wS1", 100, 380, 100, 25);
            addWire(wiresGroup, "wS0", 140, 380, 140, 25);

            addGate(gatesGroup, "andGate", 200, 35);
            addGate(gatesGroup, "andGate", 200, 135);
            addGate(gatesGroup, "andGate", 200, 235);
            addGate(gatesGroup, "andGate", 200, 335);

            addWire(wiresGroup, "wS1_0", 100, 35, 200, 35, true); 
            addWire(wiresGroup, "wS0_0", 140, 65, 200, 65, true); 
            addWire(wiresGroup, "wS1_1", 100, 135, 200, 135, true); 
            addWire(wiresGroup, "wS0_1", 140, 165, 200, 165); 
            addWire(wiresGroup, "wS1_2", 100, 235, 200, 235); 
            addWire(wiresGroup, "wS0_2", 140, 265, 200, 265, true); 
            addWire(wiresGroup, "wS1_3", 100, 335, 200, 335); 
            addWire(wiresGroup, "wS0_3", 140, 365, 200, 365); 

            addGate(gatesGroup, "orGate", 400, 185);
            addWire(wiresGroup, "wOut0", 230, 50, 400, 190);
            addWire(wiresGroup, "wOut1", 230, 150, 400, 195);
            addWire(wiresGroup, "wOut2", 230, 250, 400, 205);
            addWire(wiresGroup, "wOut3", 230, 350, 400, 210);
            addWire(wiresGroup, "wY", 435, 200, 550, 200);

            addText(gatesGroup, "D0", 30, 55);
            addText(gatesGroup, "D1", 30, 155);
            addText(gatesGroup, "D2", 30, 255);
            addText(gatesGroup, "D3", 30, 355);
            addText(gatesGroup, "S1", 95, 395);
            addText(gatesGroup, "S0", 135, 395);
            addText(gatesGroup, "Y", 560, 205);
        } else {
            addWire(wiresGroup, "wD_demux", 50, 200, 200, 200);
            addWire(wiresGroup, "wD_b0", 200, 200, 200, 50); addWire(wiresGroup, "wD_in0", 200, 50, 300, 50);
            addWire(wiresGroup, "wD_b1", 200, 200, 200, 150); addWire(wiresGroup, "wD_in1", 200, 150, 300, 150);
            addWire(wiresGroup, "wD_b2", 200, 200, 200, 250); addWire(wiresGroup, "wD_in2", 200, 250, 300, 250);
            addWire(wiresGroup, "wD_b3", 200, 200, 200, 350); addWire(wiresGroup, "wD_in3", 200, 350, 300, 350);

            addWire(wiresGroup, "wS1_d", 240, 380, 240, 25);
            addWire(wiresGroup, "wS0_d", 270, 380, 270, 25);

            addGate(gatesGroup, "andGate", 300, 35);
            addGate(gatesGroup, "andGate", 300, 135);
            addGate(gatesGroup, "andGate", 300, 235);
            addGate(gatesGroup, "andGate", 300, 335);

            addWire(wiresGroup, "wS1_d0", 240, 35, 300, 35, true); addWire(wiresGroup, "wS0_d0", 270, 65, 300, 65, true); 
            addWire(wiresGroup, "wS1_d1", 240, 135, 300, 135, true); addWire(wiresGroup, "wS0_d1", 270, 165, 300, 165); 
            addWire(wiresGroup, "wS1_d2", 240, 235, 300, 235); addWire(wiresGroup, "wS0_d2", 270, 265, 300, 265, true); 
            addWire(wiresGroup, "wS1_d3", 240, 335, 300, 335); addWire(wiresGroup, "wS0_d3", 270, 365, 300, 365); 

            addWire(wiresGroup, "wY0", 330, 50, 500, 50);
            addWire(wiresGroup, "wY1", 330, 150, 500, 150);
            addWire(wiresGroup, "wY2", 330, 250, 500, 250);
            addWire(wiresGroup, "wY3", 330, 350, 500, 350);

            addText(gatesGroup, "D", 30, 205);
            addText(gatesGroup, "S1", 235, 395);
            addText(gatesGroup, "S0", 265, 395);
            addText(gatesGroup, "Y0", 510, 55);
            addText(gatesGroup, "Y1", 510, 155);
            addText(gatesGroup, "Y2", 510, 255);
            addText(gatesGroup, "Y3", 510, 355);
        }

        svg.appendChild(wiresGroup);
        svg.appendChild(gatesGroup);
        simCanvas.appendChild(svg);
    }

    function addWire(group, id, x1, y1, x2, y2, isInv = false) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("id", id);
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        if(isInv) {
            line.setAttribute("data-inv", "true");
            line.className.baseVal = "wire-inv";
        }
        group.appendChild(line);
    }

    function addGate(group, href, x, y) {
        const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
        use.setAttribute("href", "#" + href);
        use.setAttribute("x", x);
        use.setAttribute("y", y);
        group.appendChild(use);
    }

    function addText(group, text, x, y) {
        const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
        t.textContent = text;
        t.setAttribute("x", x);
        t.setAttribute("y", y);
        t.setAttribute("fill", "#64748b");
        t.style.fontFamily = "monospace";
        t.style.fontWeight = "bold";
        t.style.fontSize = "14px";
        group.appendChild(t);
    }

    function setWireState(id, isActive, type = "data") {
        const el = document.getElementById(id);
        if (el) {
            let isInv = el.getAttribute("data-inv") === "true";
            if (isInv) {
                el.className.baseVal = "wire-inv"; // Stays solid red forever
            } else {
                let activeClass = type === "sel" ? "wire-active-sel" : "wire-active";
                el.className.baseVal = isActive ? activeClass : "";
            }
        }
    }

    let currentOutput = {};

    function getLaymanTheory(mode, s1, s0, dataState, finalY) {
        const combo = `${s1}${s0}`;
        if (mode === 'mux') {
            const map = {
                "00": { dId: "D0", val: dataState.d0, gate: "1st" },
                "01": { dId: "D1", val: dataState.d1, gate: "2nd" },
                "10": { dId: "D2", val: dataState.d2, gate: "3rd" },
                "11": { dId: "D3", val: dataState.d3, gate: "4th" }
            };
            const route = map[combo];
            return `You've set the Select lines to <strong>${combo}</strong>. This electrically opens up the <strong>${route.gate} AND gate</strong> while keeping all others closed. 
                    <br><br>The data currently sitting at <strong>${route.dId} is ${route.val}</strong>. Because the ${route.gate} gate is open, it allows that the data (${route.val}) to flow straight through to the OR gate and to the final Output Y. 
                    <br><br><strong>Therefore, the output Y is ${finalY}.</strong>`;
        } else {
            const map = {
                "00": { yId: "Y0", gate: "1st" },
                "01": { yId: "Y1", gate: "2nd" },
                "10": { yId: "Y2", gate: "3rd" },
                "11": { yId: "Y3", gate: "4th" }
            };
            const route = map[combo];
            return `You've set the Select lines to <strong>${combo}</strong>. This directs the incoming data to flow specifically towards <strong>Output ${route.yId}</strong> by opening the ${route.gate} AND gate.
                    <br><br>Since the main Data Input D is currently <strong>${dataState.d}</strong>, that value travels down the active green path directly to Output ${route.yId}. All other outputs remain idle (0).`;
        }
    }

    function updateLogic() {
        const { s1, s0 } = state;
        
        if (mode === 'mux') {
            const and0 = (s1 === 0 && s0 === 0) ? state.d0 : 0;
            const and1 = (s1 === 0 && s0 === 1) ? state.d1 : 0;
            const and2 = (s1 === 1 && s0 === 0) ? state.d2 : 0;
            const and3 = (s1 === 1 && s0 === 1) ? state.d3 : 0;
            
            const Y = and0 | and1 | and2 | and3;
            currentOutput = { Y };

            const indY = document.getElementById("outY");
            indY.textContent = Y;
            indY.classList.toggle("on", Y === 1);

            setWireState("wS1", s1 === 1, "sel");
            setWireState("wS0", s0 === 1, "sel");
            setWireState("wD0", state.d0 === 1);
            setWireState("wD1", state.d1 === 1);
            setWireState("wD2", state.d2 === 1);
            setWireState("wD3", state.d3 === 1);

            setWireState("wS1_0", s1 === 0, "sel"); setWireState("wS0_0", s0 === 0, "sel");
            setWireState("wS1_1", s1 === 0, "sel"); setWireState("wS0_1", s0 === 1, "sel");
            setWireState("wS1_2", s1 === 1, "sel"); setWireState("wS0_2", s0 === 0, "sel");
            setWireState("wS1_3", s1 === 1, "sel"); setWireState("wS0_3", s0 === 1, "sel");

            setWireState("wOut0", and0 === 1);
            setWireState("wOut1", and1 === 1);
            setWireState("wOut2", and2 === 1);
            setWireState("wOut3", and3 === 1);
            
            setWireState("wY", Y === 1);

            theoryContent.innerHTML = getLaymanTheory('mux', s1, s0, state, Y);

        } else {
            const y0 = (s1 === 0 && s0 === 0) ? state.d : 0;
            const y1 = (s1 === 0 && s0 === 1) ? state.d : 0;
            const y2 = (s1 === 1 && s0 === 0) ? state.d : 0;
            const y3 = (s1 === 1 && s0 === 1) ? state.d : 0;
            currentOutput = { y0, y1, y2, y3 };

            document.getElementById("outY0").textContent = y0; document.getElementById("outY0").classList.toggle("on", y0 === 1);
            document.getElementById("outY1").textContent = y1; document.getElementById("outY1").classList.toggle("on", y1 === 1);
            document.getElementById("outY2").textContent = y2; document.getElementById("outY2").classList.toggle("on", y2 === 1);
            document.getElementById("outY3").textContent = y3; document.getElementById("outY3").classList.toggle("on", y3 === 1);

            setWireState("wS1_d", s1 === 1, "sel");
            setWireState("wS0_d", s0 === 1, "sel");
            
            const isD = state.d === 1;
            setWireState("wD_demux", isD);
            ["wD_b0","wD_in0","wD_b1","wD_in1","wD_b2","wD_in2","wD_b3","wD_in3"].forEach(id => setWireState(id, isD));

            setWireState("wS1_d0", s1 === 0, "sel"); setWireState("wS0_d0", s0 === 0, "sel");
            setWireState("wS1_d1", s1 === 0, "sel"); setWireState("wS0_d1", s0 === 1, "sel");
            setWireState("wS1_d2", s1 === 1, "sel"); setWireState("wS0_d2", s0 === 0, "sel");
            setWireState("wS1_d3", s1 === 1, "sel"); setWireState("wS0_d3", s0 === 1, "sel");

            setWireState("wY0", y0 === 1);
            setWireState("wY1", y1 === 1);
            setWireState("wY2", y2 === 1);
            setWireState("wY3", y3 === 1);

            theoryContent.innerHTML = getLaymanTheory('demux', s1, s0, state, 0);
        }
    }

    function renderTableHeaders() {
        if (mode === 'mux') {
            ttHeader.innerHTML = `<th>S.No</th><th>S1</th><th>S0</th><th>D0</th><th>D1</th><th>D2</th><th>D3</th><th>Y</th>`;
        } else {
            ttHeader.innerHTML = `<th>S.No</th><th>S1</th><th>S0</th><th>D</th><th>Y0</th><th>Y1</th><th>Y2</th><th>Y3</th>`;
        }
    }

    addReadingBtn.addEventListener("click", () => {
        const tr = document.createElement("tr");
        const srNo = observationData.length + 1;
        let rowHtml = `<td>${srNo}</td>
                       <td>${state.s1}</td>
                       <td>${state.s0}</td>`;
        
        if (mode === 'mux') {
            rowHtml += `<td>${state.d0}</td><td>${state.d1}</td><td>${state.d2}</td><td>${state.d3}</td>
                        <td style="font-weight:bold;color:var(--green)">${currentOutput.Y}</td>`;
        } else {
            rowHtml += `<td>${state.d}</td>
                        <td style="font-weight:bold;color:var(--green)">${currentOutput.y0}</td>
                        <td style="font-weight:bold;color:var(--green)">${currentOutput.y1}</td>
                        <td style="font-weight:bold;color:var(--green)">${currentOutput.y2}</td>
                        <td style="font-weight:bold;color:var(--green)">${currentOutput.y3}</td>`;
        }

        tr.innerHTML = rowHtml;
        Array.from(ttBody.children).forEach(row => row.classList.remove("row-active"));
        tr.classList.add("row-active");
        ttBody.appendChild(tr);
        
        observationData.push({ ...state, ...currentOutput });
    });

    resetBtn.addEventListener("click", () => {
        state = { s1: 0, s0: 0, d0: 0, d1: 0, d2: 0, d3: 0, d: 0 };
        observationData = [];
        ttBody.innerHTML = '';
        buildControls();
        updateLogic();
    });

    // Lab Report Export
    exportBtn.addEventListener("click", () => {
        if(observationData.length === 0) {
            alert("No readings to export. Please add readings to the table first.");
            return;
        }

        prMode.textContent = mode === 'mux' ? '4:1 Multiplexer' : '1:4 Demultiplexer';
        prDate.textContent = new Date().toLocaleString();
        
        prTable.innerHTML = '';
        const thead = document.createElement("thead");
        thead.innerHTML = ttHeader.innerHTML;
        prTable.appendChild(thead);
        
        const tbody = document.createElement("tbody");
        observationData.forEach((row, i) => {
            const tr = document.createElement("tr");
            if(mode === 'mux') {
                tr.innerHTML = `<td>${i+1}</td><td>${row.s1}</td><td>${row.s0}</td>
                                <td>${row.d0}</td><td>${row.d1}</td><td>${row.d2}</td><td>${row.d3}</td>
                                <td><strong>${row.Y}</strong></td>`;
            } else {
                tr.innerHTML = `<td>${i+1}</td><td>${row.s1}</td><td>${row.s0}</td><td>${row.d}</td>
                                <td><strong>${row.y0}</strong></td><td><strong>${row.y1}</strong></td><td><strong>${row.y2}</strong></td><td><strong>${row.y3}</strong></td>`;
            }
            tbody.appendChild(tr);
        });
        prTable.appendChild(tbody);

        window.print();
    });

    // CSV Download Mechanism
    exportCsvBtn.addEventListener("click", () => {
        if(observationData.length === 0) {
            alert("No readings to export to CSV. Please add readings to the table first.");
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8,";
        let headers = [];
        
        if (mode === 'mux') {
            headers = ["S.No", "S1", "S0", "D0", "D1", "D2", "D3", "Y"];
        } else {
            headers = ["S.No", "S1", "S0", "D", "Y0", "Y1", "Y2", "Y3"];
        }
        
        csvContent += headers.join(",") + "\r\n";

        observationData.forEach((row, i) => {
            let rowData = [];
            if(mode === 'mux') {
               rowData = [i+1, row.s1, row.s0, row.d0, row.d1, row.d2, row.d3, row.Y];
            } else {
               rowData = [i+1, row.s1, row.s0, row.d, row.y0, row.y1, row.y2, row.y3];
            }
            csvContent += rowData.join(",") + "\r\n";
        });

        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `LogicFlow_Exp8_${mode}_observations.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Initial boot
    initUI();
    clearTimeout(_expSafetyTimer);
});
