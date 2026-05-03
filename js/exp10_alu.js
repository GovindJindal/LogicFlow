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

  // DOM Elements
  const inputA_btns = document.querySelectorAll('#inputA .toggle-btn');
  const inputB_btns = document.querySelectorAll('#inputB .toggle-btn');
  const inputS_btns = document.querySelectorAll('#inputS .toggle-btn');
  const inputM_btn = document.querySelector('#inputM .toggle-btn');
  
  const outputY_spans = [
    document.getElementById('y0'),
    document.getElementById('y1'),
    document.getElementById('y2'),
    document.getElementById('y3')
  ];

  const traceArith = document.getElementById('traceArith');
  const traceLogic = document.getElementById('traceLogic');
  const traceOut = document.getElementById('traceOut');

  const flashMode = document.getElementById('flashMode');
  const flashOp = document.getElementById('flashOp');
  const flashDesc = document.getElementById('flashDesc');

  const btnAddReading = document.getElementById('btnAddReading');
  const tableBody = document.getElementById('tableBody');
  let readingCount = 0;

  const btnResetAlu = document.getElementById('btnResetAlu');
  const btnExportReport = document.getElementById('btnExportReport');
  const printDate = document.getElementById('printDate');

  // Operation Map
  function getOperationDetails(M, S) {
    if (M === 0) {
      // Arithmetic Mode
      switch(S) {
        case 0: return { op: "Transfer A", text: "Y = A", desc: "This mode configures the ALU to act as a direct pass-through for the A input bus. The Arithmetic Logic Unit completely bypasses any mathematical transformation and routes the 4-bit binary value of A straight into the Multiplexer, leaving it untouched. This is fundamentally useful when data simply needs to be moved from one register to another across the processor's internal data bus without modification." };
        case 1: return { op: "Addition", text: "Y = A + B", desc: "The ALU engages its internal Full Adder circuits to perform true binary arithmetic addition. It takes the 4 bits from Input A and the 4 bits from Input B, combining them mathematically. Carry bits cascade from the Least Significant Bit (LSB) to the Most Significant Bit (MSB). This is the absolute core operation of any CPU, used constantly for calculating memory addresses, updating loop counters, and processing raw numerical data." };
        case 2: return { op: "Subtraction", text: "Y = A - B", desc: "The ALU performs binary subtraction by utilizing the Two's Complement method. Behind the scenes, the internal circuitry first inverts every bit of Input B (creating the One's Complement), and then forces a Carry-In bit of 1 into the very first adder stage (completing the Two's Complement). The hardware then simply adds this negative version of B to A, perfectly computing A - B using the exact same adder hardware used for addition." };
        case 3: return { op: "Decrement A", text: "Y = A - 1", desc: "This operation subtracts exactly 1 from the value currently held in Input A. At the hardware level, this is achieved by adding a constant block of all 1s (which equals -1 in Two's complement) to A, or by asserting a subtract operation with a hardwired B input of 1. Decrementing is one of the most frequently used hardware instructions in computer science, heavily relied upon for counting down loops and traversing backwards through arrays." };
        case 4: return { op: "Increment A", text: "Y = A + 1", desc: "This operation adds exactly 1 to the current value of Input A. Instead of using the B input bus, the ALU forces a '1' into the Carry-In of the very first Full Adder stage while keeping the B input essentially zeroed out. Incrementing is critical to computer architecture; it is the exact mechanical process the processor uses to update its Program Counter to point to the very next instruction in memory." };
        default: return { op: "Arithmetic Default", text: "Y = A", desc: "An unmapped Select line combination has been entered. The ALU safely falls back to a default Transfer state, pushing the raw A input straight to the output bus." };
      }
    } else {
      // Logic Mode
      switch(S) {
        case 0: return { op: "NOT A", text: "Y = ~A", desc: "The ALU performs a bitwise logical NOT, also known as Inversion or One's Complement. The circuit routes every single bit of Input A through an internal inverter gate, flipping 0s to 1s, and 1s to 0s independently. This operation does not cascade across bits like addition does. It is primarily used in generating masks, flipping polarities, and is the crucial first step in generating negative numbers in binary hardware." };
        case 1: return { op: "AND", text: "Y = A & B", desc: "The ALU applies a bitwise logical AND operation. Every bit in Input A is paired with the corresponding bit in Input B and pushed through an AND gate. The resulting output bit is '1' only if both input bits are '1'; otherwise, it outputs a '0'. This operation is famously used in software for 'Bit Masking'—allowing programmers to purposefully erase specific bits by ANDing them with 0, while keeping others intact by ANDing them with 1." };
        case 2: return { op: "OR", text: "Y = A | B", desc: "The ALU executes a bitwise logical OR operation. Corresponding bits from Input A and Input B are passed through OR gates. The output bit becomes '1' if at least one of the input bits is '1'. The OR operation is typically used by systems to aggressively set specific configuration flags to '1' without accidentally disturbing the neighboring bits in a status register." };
        case 3: return { op: "XOR", text: "Y = A ^ B", desc: "The ALU executes an Exclusive-OR (XOR) logic operation. The output bit is '1' strictly when the bits from A and B are different. If they are exactly the same (both 0s or both 1s), the output is '0'. XOR is an incredibly powerful hardware function used for comparing numbers (if A^B is 0, the numbers are identical), generating parity bits for error checking, and forms the mathematical backbone of modern cryptographic ciphers." };
        case 4: return { op: "NAND", text: "Y = ~(A & B)", desc: "The ALU performs a Not-AND logic operation. It calculates the standard AND operation and immediately inverts the result. The NAND gate holds a special place in digital electronics because it is 'Universally Complete'—meaning you can physically build any other logic gate, memory cell, or processor entirely out of nothing but NAND gates." };
        case 5: return { op: "NOR", text: "Y = ~(A | B)", desc: "The ALU calculates a Not-OR logic operation. This involves evaluating the OR condition and immediately flipping the result through an inverter. Like NAND, the NOR logic gate is also a 'Universal Gate'. It outputs a '1' only in the highly specific scenario where absolutely every single input is '0'." };
        case 6: return { op: "XNOR", text: "Y = ~(A ^ B)", desc: "The ALU performs an Exclusive-NOR operation. This is the exact inverse of the XOR logic. The output bit is '1' if and only if the bits from Input A and Input B perfectly match. Because of this property, XNOR circuits are frequently used deep inside hardware comparators to detect digital equality between two different memory registers." };
        default: return { op: "Logic Default", text: "Y = 0", desc: "An unmapped Select line combination has been entered in Logic Mode. The ALU defaults to pulling all output lines low to logic zero." };
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

  function updateUI() {
    // 1. Update output spans
    const yStr = to4BitStr(state.Y);
    for (let i = 0; i < 4; i++) {
      outputY_spans[i].textContent = yStr[3 - i];
    }

    // 2. Update SVG Routing Blocks (Arithmetic vs Logic)
    traceOut.classList.add('trace-active');
    if (state.M === 0) {
      traceArith.classList.add('trace-active');
      traceArith.classList.remove('trace-dimmed');
      traceLogic.classList.remove('trace-active');
      traceLogic.classList.add('trace-dimmed');
    } else {
      traceLogic.classList.add('trace-active');
      traceLogic.classList.remove('trace-dimmed');
      traceArith.classList.remove('trace-active');
      traceArith.classList.add('trace-dimmed');
    }

    // 3. Update individual bit wires for A, B, and S
    for (let i = 0; i < 4; i++) {
      const bitA = (state.A >> i) & 1;
      const bitB = (state.B >> i) & 1;
      const bitS = (state.S >> i) & 1;

      // Arithmetic Block paths
      document.getElementById(`t-a-${i}-arith`).className = `trace bit-trace ${bitA ? 'trace-active-a' : 'trace-dimmed'}`;
      document.getElementById(`t-b-${i}-arith`).className = `trace bit-trace ${bitB ? 'trace-active-b' : 'trace-dimmed'}`;
      document.getElementById(`t-s-${i}-arith`).className = `trace bit-trace ${bitS ? 'trace-active-s' : 'trace-dimmed'}`;

      // Logic Block paths
      document.getElementById(`t-a-${i}-logic`).className = `trace bit-trace ${bitA ? 'trace-active-a' : 'trace-dimmed'}`;
      document.getElementById(`t-b-${i}-logic`).className = `trace bit-trace ${bitB ? 'trace-active-b' : 'trace-dimmed'}`;
      document.getElementById(`t-s-${i}-logic`).className = `trace bit-trace ${bitS ? 'trace-active-s' : 'trace-dimmed'}`;
    }

    // 4. Update Flashcard
    const modeName = state.M === 0 ? "Arithmetic" : "Logic";
    flashMode.textContent = `Mode: ${modeName} (M=${state.M})`;
    
    const details = getOperationDetails(state.M, state.S);
    flashOp.textContent = details.text;
    flashDesc.textContent = details.desc;
  }

  function handleToggle(e, type) {
    const btn = e.currentTarget;
    const bit = parseInt(btn.dataset.bit);
    const currentVal = parseInt(btn.dataset.val);
    const newVal = currentVal === 0 ? 1 : 0;
    
    // Update button visually
    btn.dataset.val = newVal;
    btn.textContent = newVal;

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
    readingCount++;
    const row = document.createElement('tr');
    const details = getOperationDetails(state.M, state.S);
    
    row.innerHTML = `
      <td>${readingCount}</td>
      <td style="color: var(--cyan); font-weight: bold;">${state.M}</td>
      <td style="color: var(--purple); font-weight: bold;">${to4BitStr(state.S)}</td>
      <td>${to4BitStr(state.A)}</td>
      <td>${to4BitStr(state.B)}</td>
      <td style="font-weight: bold; color: var(--text);">${to4BitStr(state.Y)}</td>
      <td>${details.op} (${details.text})</td>
    `;
    
    tableBody.appendChild(row);
    
    // Auto-scroll to bottom
    const container = document.querySelector('.table-container');
    container.scrollTop = container.scrollHeight;
  });

  // Reset ALU
  btnResetAlu.addEventListener('click', () => {
    state = { A: 0, B: 0, S: 0, M: 0, Y: 0 };
    document.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.dataset.val = "0";
      btn.textContent = "0";
    });
    tableBody.innerHTML = '';
    readingCount = 0;
    computeY();
    updateUI();
  });

  // Export Lab Report (Print)
  btnExportReport.addEventListener('click', () => {
    const d = new Date();
    printDate.textContent = d.toLocaleDateString() + " " + d.toLocaleTimeString();
    window.print();
  });

  // Initial render
  computeY();
  updateUI();

});
