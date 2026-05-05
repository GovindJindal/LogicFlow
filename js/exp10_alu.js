// js/exp10_alu.js

document.addEventListener('DOMContentLoaded', () => {

  // State
  let state = {
    A: 0,
    B: 0,
    S: 0,
    M: 0,
    Y: 0
  };
  
  let observationData = [];

  // DOM Elements
  const inputA_btns = document.querySelectorAll('#inputA .toggle-btn');
  const inputB_btns = document.querySelectorAll('#inputB .toggle-btn');
  const inputS_btns = document.querySelectorAll('#inputS .toggle-btn');
  const inputM_btn = document.querySelector('#inputM .toggle-btn');
  
  const outputY_inds = [
    document.getElementById('y0'),
    document.getElementById('y1'),
    document.getElementById('y2'),
    document.getElementById('y3')
  ];

  const traceArith = document.getElementById('traceArith');
  const traceLogic = document.getElementById('traceLogic');
  const traceOut = document.getElementById('traceOut');

  const theoryContent = document.getElementById('theoryContent');
  const tableBody = document.getElementById('tableBody');
  const btnAddReading = document.getElementById('btnAddReading');
  const btnExportCsv = document.getElementById('exportCsvBtn');
  
  const btnResetAlu = document.getElementById('btnResetAlu');
  const btnExportReport = document.getElementById('btnExportReport');
  const printDate = document.getElementById('printDate');
  const prTable = document.getElementById('prTable');

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

  // Feedback Stars
  const stars = document.querySelectorAll(".star");
  stars.forEach((star, idx) => {
      star.addEventListener("click", () => {
          stars.forEach((s, i) => s.textContent = i <= idx ? "★" : "☆");
      });
  });

  // Operation Map
  function getOperationDetails(M, S) {
    if (M === 0) {
      // Arithmetic Mode
      switch(S) {
        case 0: return { op: "Transfer A", text: "Y = A" };
        case 1: return { op: "Addition", text: "Y = A + B" };
        case 2: return { op: "Subtraction", text: "Y = A - B" };
        case 3: return { op: "Decrement A", text: "Y = A - 1" };
        case 4: return { op: "Increment A", text: "Y = A + 1" };
        default: return { op: "Transfer A", text: "Y = A" };
      }
    } else {
      // Logic Mode
      switch(S) {
        case 0: return { op: "NOT A", text: "Y = ~A" };
        case 1: return { op: "AND", text: "Y = A & B" };
        case 2: return { op: "OR", text: "Y = A | B" };
        case 3: return { op: "XOR", text: "Y = A ^ B" };
        case 4: return { op: "NAND", text: "Y = ~(A & B)" };
        case 5: return { op: "NOR", text: "Y = ~(A | B)" };
        case 6: return { op: "XNOR", text: "Y = ~(A ^ B)" };
        default: return { op: "Zero", text: "Y = 0" };
      }
    }
  }

  function getLaymanTheory(M, S, A, B, Y) {
    if (M === 0) {
      switch(S) {
        case 0: return `You've set the Mode to <strong>Arithmetic (M=0)</strong> and Select lines to <strong>Transfer A</strong>. The Arithmetic Unit completely bypasses any mathematical transformation and routes the value of Input A (<strong>${A}</strong>) straight through.<br><br><strong>Therefore, the output Y is ${Y}.</strong>`;
        case 1: return `You've set the Mode to <strong>Arithmetic (M=0)</strong> and Select lines to <strong>Addition</strong>. The ALU takes the value from Input A (<strong>${A}</strong>) and adds it to Input B (<strong>${B}</strong>).<br><br><strong>Therefore, the output Y is ${Y}.</strong>`;
        case 2: return `You've set the Mode to <strong>Arithmetic (M=0)</strong> and Select lines to <strong>Subtraction</strong>. The ALU takes the value from Input A (<strong>${A}</strong>) and subtracts Input B (<strong>${B}</strong>) from it using Two's Complement arithmetic.<br><br><strong>Therefore, the output Y is ${Y}.</strong>`;
        case 3: return `You've set the Mode to <strong>Arithmetic (M=0)</strong> and Select lines to <strong>Decrement A</strong>. This operation subtracts exactly 1 from the value currently held in Input A (<strong>${A}</strong>).<br><br><strong>Therefore, the output Y is ${Y}.</strong>`;
        case 4: return `You've set the Mode to <strong>Arithmetic (M=0)</strong> and Select lines to <strong>Increment A</strong>. This operation adds exactly 1 to the current value of Input A (<strong>${A}</strong>).<br><br><strong>Therefore, the output Y is ${Y}.</strong>`;
        default: return `The ALU is safely falling back to a default Transfer state, pushing the raw A input (<strong>${A}</strong>) straight to the output bus.<br><br><strong>Therefore, the output Y is ${Y}.</strong>`;
      }
    } else {
      switch(S) {
        case 0: return `You've set the Mode to <strong>Logic (M=1)</strong> and Select lines to <strong>NOT A</strong>. Every single bit of Input A (<strong>${A}</strong>) is flipped. 0s become 1s, and 1s become 0s.<br><br><strong>Therefore, the output Y is ${Y}.</strong>`;
        case 1: return `You've set the Mode to <strong>Logic (M=1)</strong> and Select lines to <strong>AND</strong>. Every bit in Input A (<strong>${A}</strong>) is paired with the corresponding bit in Input B (<strong>${B}</strong>). The output bit is '1' only if both input bits are '1'.<br><br><strong>Therefore, the output Y is ${Y}.</strong>`;
        case 2: return `You've set the Mode to <strong>Logic (M=1)</strong> and Select lines to <strong>OR</strong>. The output bit becomes '1' if at least one of the input bits from A (<strong>${A}</strong>) or B (<strong>${B}</strong>) is '1'.<br><br><strong>Therefore, the output Y is ${Y}.</strong>`;
        case 3: return `You've set the Mode to <strong>Logic (M=1)</strong> and Select lines to <strong>XOR</strong>. The output bit is '1' strictly when the bits from A (<strong>${A}</strong>) and B (<strong>${B}</strong>) are different.<br><br><strong>Therefore, the output Y is ${Y}.</strong>`;
        case 4: return `You've set the Mode to <strong>Logic (M=1)</strong> and Select lines to <strong>NAND</strong>. It calculates the standard AND operation on A (<strong>${A}</strong>) and B (<strong>${B}</strong>), and immediately inverts the result.<br><br><strong>Therefore, the output Y is ${Y}.</strong>`;
        case 5: return `You've set the Mode to <strong>Logic (M=1)</strong> and Select lines to <strong>NOR</strong>. It calculates the OR condition on A (<strong>${A}</strong>) and B (<strong>${B}</strong>), and immediately flips the result.<br><br><strong>Therefore, the output Y is ${Y}.</strong>`;
        case 6: return `You've set the Mode to <strong>Logic (M=1)</strong> and Select lines to <strong>XNOR</strong>. The output bit is '1' if and only if the bits from Input A (<strong>${A}</strong>) and Input B (<strong>${B}</strong>) perfectly match.<br><br><strong>Therefore, the output Y is ${Y}.</strong>`;
        default: return `An unmapped Select line combination has been entered in Logic Mode. The ALU defaults to pulling all output lines low to logic zero.<br><br><strong>Therefore, the output Y is ${Y}.</strong>`;
      }
    }
  }

  function computeY() {
    let Y = 0;
    if (state.M === 0) {
      switch(state.S) {
        case 0: Y = state.A; break;
        case 1: Y = state.A + state.B; break;
        case 2: Y = state.A - state.B; break;
        case 3: Y = state.A - 1; break;
        case 4: Y = state.A + 1; break;
        default: Y = state.A; break;
      }
    } else {
      switch(state.S) {
        case 0: Y = ~state.A; break;
        case 1: Y = state.A & state.B; break;
        case 2: Y = state.A | state.B; break;
        case 3: Y = state.A ^ state.B; break;
        case 4: Y = ~(state.A & state.B); break;
        case 5: Y = ~(state.A | state.B); break;
        case 6: Y = ~(state.A ^ state.B); break;
        default: Y = 0; break;
      }
    }
    // Constrain to 4 bits
    state.Y = Y & 0b1111;
  }

  function to4BitStr(val) {
    return val.toString(2).padStart(4, '0');
  }

  function setWireState(id, isActive, activeClass) {
      const el = document.getElementById(id);
      if (el) {
          el.className.baseVal = `trace bit-trace ${isActive ? activeClass : 'trace-dimmed'}`;
      }
  }

  function updateUI() {
    // 1. Update output indicators
    const yStr = to4BitStr(state.Y);
    for (let i = 0; i < 4; i++) {
      const bit = parseInt(yStr[3 - i]);
      outputY_inds[i].textContent = bit;
      outputY_inds[i].classList.toggle('on', bit === 1);
    }

    // 2. Update SVG Routing Blocks (Arithmetic vs Logic)
    traceOut.className.baseVal = 'trace trace-out trace-active';
    if (state.M === 0) {
      traceArith.className.baseVal = 'trace dynamic-trace trace-arith trace-active-a';
      traceLogic.className.baseVal = 'trace dynamic-trace trace-logic trace-dimmed';
    } else {
      traceLogic.className.baseVal = 'trace dynamic-trace trace-logic trace-active-b';
      traceArith.className.baseVal = 'trace dynamic-trace trace-arith trace-dimmed';
    }

    // 3. Update individual bit wires for A, B, and S
    for (let i = 0; i < 4; i++) {
      const bitA = (state.A >> i) & 1;
      const bitB = (state.B >> i) & 1;
      const bitS = (state.S >> i) & 1;

      // Arithmetic Block paths
      setWireState(`t-a-${i}-arith`, bitA, 'trace-active-a');
      setWireState(`t-b-${i}-arith`, bitB, 'trace-active-b');
      setWireState(`t-s-${i}-arith`, bitS, 'trace-active-s');

      // Logic Block paths
      setWireState(`t-a-${i}-logic`, bitA, 'trace-active-a');
      setWireState(`t-b-${i}-logic`, bitB, 'trace-active-b');
      setWireState(`t-s-${i}-logic`, bitS, 'trace-active-s');
    }

    // 4. Update Theory Flashcard
    theoryContent.innerHTML = getLaymanTheory(state.M, state.S, state.A, state.B, state.Y);
  }

  function handleToggle(e, type) {
    const btn = e.currentTarget;
    const bit = parseInt(btn.dataset.bit);
    const currentVal = parseInt(btn.dataset.val);
    const newVal = currentVal === 0 ? 1 : 0;
    
    // Update button visually
    btn.dataset.val = newVal;
    btn.textContent = newVal;
    btn.classList.toggle('on', newVal === 1);

    // Update state
    if (newVal === 1) {
      state[type] |= (1 << bit);
    } else {
      state[type] &= ~(1 << bit);
    }

    // Recompute and render
    computeY();
    updateUI();
  }

  // Attach Listeners
  inputA_btns.forEach(btn => btn.addEventListener('click', (e) => handleToggle(e, 'A')));
  inputB_btns.forEach(btn => btn.addEventListener('click', (e) => handleToggle(e, 'B')));
  inputS_btns.forEach(btn => btn.addEventListener('click', (e) => handleToggle(e, 'S')));
  inputM_btn.addEventListener('click', (e) => handleToggle(e, 'M'));

  // Add Reading to Truth Table
  btnAddReading.addEventListener('click', () => {
    const details = getOperationDetails(state.M, state.S);
    const reading = {
      sNo: observationData.length + 1,
      M: state.M,
      S: to4BitStr(state.S),
      A: to4BitStr(state.A),
      B: to4BitStr(state.B),
      Y: to4BitStr(state.Y),
      Op: details.op
    };
    
    observationData.push(reading);
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${reading.sNo}</td>
      <td style="color: var(--cyan); font-weight: bold;">${reading.M}</td>
      <td style="color: var(--blue); font-weight: bold;">${reading.S}</td>
      <td style="color: var(--green); font-weight: bold;">${reading.A}</td>
      <td style="color: var(--rose); font-weight: bold;">${reading.B}</td>
      <td style="font-weight: bold; color: var(--text);">${reading.Y}</td>
      <td>${reading.Op}</td>
    `;
    
    Array.from(tableBody.children).forEach(r => r.classList.remove("row-active"));
    row.classList.add("row-active");
    tableBody.appendChild(row);
    
    // Auto-scroll to bottom
    const container = document.querySelector('.table-scroll');
    container.scrollTop = container.scrollHeight;
  });

  // Reset ALU
  btnResetAlu.addEventListener('click', () => {
    state = { A: 0, B: 0, S: 0, M: 0, Y: 0 };
    observationData = [];
    document.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.dataset.val = "0";
      btn.textContent = "0";
      btn.classList.remove('on');
    });
    tableBody.innerHTML = '';
    computeY();
    updateUI();
  });

  // Download CSV
  btnExportCsv.addEventListener('click', () => {
    if(observationData.length === 0) {
        alert("No readings to export to CSV. Please add readings to the table first.");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "S.No,M,S,A,B,Y,Operation\r\n";

    observationData.forEach(row => {
        csvContent += `${row.sNo},${row.M},${row.S},${row.A},${row.B},${row.Y},${row.Op}\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `LogicFlow_Exp10_ALU_observations.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // Export Lab Report (Print)
  btnExportReport.addEventListener('click', () => {
    if(observationData.length === 0) {
        alert("No readings to export. Please add readings to the table first.");
        return;
    }

    const d = new Date();
    printDate.textContent = d.toLocaleDateString() + " " + d.toLocaleTimeString();
    
    prTable.innerHTML = '';
    const thead = document.createElement("thead");
    thead.innerHTML = `<tr><th>S.No</th><th>M</th><th>S</th><th>A</th><th>B</th><th>Y</th><th>Operation</th></tr>`;
    prTable.appendChild(thead);
    
    const tbody = document.createElement("tbody");
    observationData.forEach(row => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${row.sNo}</td><td>${row.M}</td><td>${row.S}</td><td>${row.A}</td><td>${row.B}</td><td><strong>${row.Y}</strong></td><td>${row.Op}</td>`;
        tbody.appendChild(tr);
    });
    prTable.appendChild(tbody);

    window.print();
  });

  // Initial render
  computeY();
  updateUI();

});
