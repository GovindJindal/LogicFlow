# LogicFlow — Interactive Virtual Electronics Lab

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)

> **A browser-based electronics and digital-logic learning environment for students, hobbyists, and educators.**  
> Built for **Chitkara University BE-AIML 2nd Semester (Evening) FEE ETE Project Submission**

🌐 **Live Demo:** [logic-flow-tau.vercel.app](https://logic-flow-tau.vercel.app)

---

## Table of Contents

- [Overview](#overview)
- [How to Access the App — Complete Process Flow](#how-to-access-the-app--complete-process-flow)
  - [1. Landing Page & Login Options](#1-landing-page--login-options)
  - [2. Faculty Login & Admin Panel](#2-faculty-login--admin-panel)
  - [3. Student Login](#3-student-login)
  - [4. Guest Login](#4-guest-login)
- [Experiments (10 Labs)](#experiments-10-labs)
- [Logic Gate Sandbox](#logic-gate-sandbox)
- [Computer Architecture](#computer-architecture)
- [Student Tasks Dashboard](#student-tasks-dashboard)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Getting Started (Local)](#getting-started-local)
- [Sandbox Setup (React)](#sandbox-setup-react)
- [Design System](#design-system)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

LogicFlow is a frontend-only virtual electronics lab. It provides students with interactive simulations of real laboratory experiments — without requiring physical hardware, a lab booking, or any backend infrastructure.

Every experiment mirrors a real university lab syllabus entry, complete with interactive controls, live waveform/graph rendering, measurement readouts, and observation panels. The platform includes:

- 10 guided experiments (analog + digital)
- A Logic Gate Sandbox (drag-and-drop circuit builder)
- A COA Pipeline Stepper
- A Student Tasks Dashboard
- A Faculty Admin Panel with batch/student management, task assignment, and evaluation

---

## How to Access the App — Complete Process Flow

### 1. Landing Page & Login Options

The main landing page is the entry point. Clicking **"Enter Lab"** opens a login dialog with **three access modes**:

| Login Type                      | Who is it for?                | Features Available                                     |
| ------------------------------- | ----------------------------- | ------------------------------------------------------ |
| 🏫 **Faculty Login**            | Department admin / instructor | Full admin panel: batches, students, tasks, evaluation |
| 🎓 **University Student Login** | Enrolled students             | All labs + My Tasks + Curriculum tab                   |
| 🔓 **Guest Login**              | Anyone / public visitor       | All labs (no Tasks, no Curriculum tab)                 |

---

### 2. Faculty Login & Admin Panel

#### Step 1 — Log in as Faculty

Use the fixed institutional credentials:

```
Institution Code : CHIT2026
Department Email : faculty@chitkara.edu.in
Password         : CUFaculty
```

#### Step 2 — Admin Panel Overview

After login, you land on the **Admin Dashboard**:

![Admin Panel Overview](images/Readme_info%20Images/overview_adminPanel.png)

The sidebar includes: **Overview · Batches · Students · Experiments · Evaluation · Assign Task · Faculty · System Logs · Support**

---

#### Step 3 — Create a Batch

Before adding students, you must create at least one batch.

Go to **Batches → New Batch**:

![Create Batch](images/Readme_info%20Images/create_batch.png)

Fill in:

- Batch Name / Code (e.g., `G-13`)
- Description (e.g., `Morning Cohort F`)
- Year, Section, Department

Click **Save Batch**.

---

#### Step 4 — Add a Student

Go to **Students → Add Student**:

![Add Student](images/Readme_info%20Images/add_student.png)

Fill in:

- Full Name
- Roll Number (e.g., `EL-24-001`)
- Email (`student@chitkara.edu.in`)
- Password — **auto-generated from the roll number** and stored in `localStorage`
- Assign to Batch (select from created batches)

Click **Save Student**.

> ⚠️ **Important:** Student credentials are stored in `localStorage` of the browser. The **University Student Login** reads directly from this storage, so both the faculty admin and student must use the **same browser** (or at least the same browser profile/device).

---

#### Step 5 — Assign a Task

Go to **Assign Task** in the sidebar:

![Assign Task](images/Readme_info%20Images/assign_task.png)

Configure:

- **Assignment Type** — Batch or Individual Student
- **Search** for the batch or student
- **Select Experiment** from the library
- Set **Deadline**, **Priority** (Low / Med / High)
- Add optional instructions
- Toggle **Send Notifications** (students see it on next login)

Click **Assign Task**. The Summary panel on the right updates live.

---

#### Step 6 — Evaluation

Once students complete and submit tasks, submissions appear in the **Evaluation** tab. Faculty can:

- View student submissions (stored via `localStorage`)
- Grade and evaluate responses

---

### 3. Student Login

Students log in using the credentials that were **created by the faculty** and stored in `localStorage`.

After login, the student sees their **My Tasks dashboard**:

![Student Tasks](images/Readme_info%20Images/tasks.png)

This includes:

- Active course and overall completion %
- Time on platform breakdown (Guided labs / Practice & quizzes / Reviews & prep)
- Assigned experiments from the department
- "From your instructor" notes panel
- Quick Open links (Component Inspector, Rectifier Lab, COA Pipeline, Curriculum Map)

> **Student vs. Guest:** The only difference is that Student login shows the **"My Tasks"** tab and **Curriculum** tab. Guest login skips both.

---

### 4. Guest Login

Click **"Enter Lab → Guest Access"** — no credentials needed.

Guests get full access to all 10 experiments, Logic Gates, and Computer Architecture sections. The "My Tasks" and Curriculum tabs are hidden.

---

## Experiments (10 Labs)

All experiments are accessible from the **Experiments** tab in the navigation.

---

### Experiment 01 — Electronic Components Lab

![Exp 1 – Components](images/Readme_info%20Images/exp_1.png)

Interactive familiarization with resistors, capacitors, inductors, diodes, LEDs, transistors, multimeters, and breadboards. Includes a **live 5-band resistor color-code calculator**.

---

### Experiment 02 — Virtual Oscilloscope & Function Generator

![Exp 2 – CRO](images/Readme_info%20Images/exp_2.png)

Simulate a Cathode Ray Oscilloscope (CRO) with a real-time function generator. Supports Sine, Square, Triangle, and Sawtooth waveforms. Adjust frequency, amplitude, DC offset, phase, volts/div, and time/div. Includes **Simple Mode** and **Wiring Mode**.

---

### Experiment 03 — PN Junction Diode

![Exp 3 – PN Junction](images/Readme_info%20Images/exp_3.png)

Physics-accurate simulation using the Shockley diode equation. Toggle Forward / Reverse bias. Adjust amplitude, frequency, series resistor, and temperature. View live V-I characteristic curve, waveforms, and ammeter/voltmeter readings. Export lab report.

---

### Experiment 04 — Zener Diode Voltage Regulator

![Exp 4 – Zener](images/Readme_info%20Images/exp_4.png)

Simulate a Zener shunt regulator (IN4733A, Vz = 5.1 V). Adjust input voltage, series resistance (Rs), and load resistance (RL). View live voltage transfer curve and key observations (breakdown voltage, regulation principle).

---

### Experiment 05 — Rectifier & Filter Circuits

![Exp 5 – Rectifier](images/Readme_info%20Images/exp_5.png)

Toggle between **Half-Wave** and **Full-Wave Bridge** rectifier topologies. Enable a capacitor filter and vary filter cap and load resistance. View simultaneous AC input and DC output waveforms with computed Vdc and ripple voltage.

---

### Experiment 06 — Flip-Flop Architecture

![Exp 6 – Flip-Flops](images/Readme_info%20Images/exp_6.png)

Simulate **D Flip-Flop (7474)** and **J-K Flip-Flop (7476)**. Toggle logic inputs, push the manual clock (rising-edge triggered), and watch the live timing diagram update in real time with CLK, J, K, Q, Q̄ traces.

---

### Experiment 07 — BCD to 7-Segment Decoder

![Exp 7 – BCD Decoder](images/Readme_info%20Images/exp_7.png)

Simulate IC 7447 driving a common-anode 7-segment LED display. Set 4-bit BCD input via data switches (D, C, B, A) and watch the display and truth table update instantly.

---

### Experiment 08 — 4:1 Multiplexer & 1:4 Demultiplexer

![Exp 8 – MUX/DEMUX](images/Readme_info%20Images/exp_8.png)

Implement and study a 4:1 MUX and 1:4 DEMUX using basic logic gates. Includes a full **Lab Lifecycle** panel (Aim → Theory → Pretest → Procedure → Simulation → Posttest → Feedback), live circuit diagram, progressive theory, observation table, and CSV export.

---

### Experiment 09 — Motherboard Anatomy

![Exp 9 – Motherboard](images/Readme_info%20Images/exp_9.png)

Explore the physical foundation of computer architecture. Interact with a 3D annotated motherboard model to learn about Processor Socket, Memory, PCI Slots, CMOS Battery, and I/O Ports.

---

### Experiment 10 — Arithmetic Logic Unit (ALU)

![Exp 10 – ALU](images/Readme_info%20Images/exp_10.png)

Design and simulate an ALU. Configure 4-bit inputs A and B, select mode and operation, and observe data routing through arithmetic and logic sub-units via the multiplexer. Includes observation table and CSV export.

---

## Logic Gate Sandbox

![Sandbox Landing](images/Readme_info%20Images/sandbox_landing.png)

The Logic Gate Sandbox is a **Raptor-style drag-and-drop circuit builder** where students can:

- Drag logic gates (AND, OR, NOT, NAND, NOR, XOR, XNOR) onto the canvas
- Wire inputs and outputs together
- Click INPUT nodes to toggle HIGH/LOW
- Watch signal propagation in real time
- Auto-generate a **Truth Table** from INPUT + OUTPUT nodes
- Use **Tidy Layout**, **Undo**, and **Share** features

![Sandbox](images/Readme_info%20Images/sandbox.png)

> ⚠️ **The Sandbox runs as a separate React app.** See [Sandbox Setup](#sandbox-setup-react) below.

---

## Computer Architecture

![Computer Architecture / COA Pipeline](images/Readme_info%20Images/comp_architecture.png)

The **Pipeline Stepper** traces instruction execution through all 4 stages:

**Fetch → Decode → Execute → WriteBack**

For each instruction, it shows:

- Register Bank (PC, IR, MAR, MDR, ACC)
- Flag Register
- Program Memory with current instruction highlighted
- Stage-by-stage explanation of what the CPU is doing

---

## Student Tasks Dashboard

![Tasks](images/Readme_info%20Images/tasks.png)

The student dashboard shows:

- Current active course and department
- Overall completion percentage
- Time breakdown across lab types
- Assigned tasks from the instructor
- Quick open links to recently assigned experiments

---

## Project Structure

```
logicflow/

│
├── index.html                  # Landing page
├── curriculum.html             # Curriculum mapping (4 universities)
├── sandbox.html                # Logic Gate Sandbox entry (links to React app)
├── coa.html                    # COA Pipeline Stepper
├── student-tasks.html          # Student task board
├── eval1.html                  # Continuous Evaluation 1.1 (quiz)
├── eval2.html                  # Continuous Evaluation 1.2 (quiz)
│
├── exp1_components.html        # Experiment 01: Components Lab
├── exp2_equipments.html        # Experiment 02: CRO & Function Generator
├── exp3_diode.html             # Experiment 03: PN Junction Diode
├── exp4_zener.html             # Experiment 04: Zener Diode Regulator
├── exp5_rectifier.html         # Experiment 05: Rectifier Circuits
├── exp6_flipflops.html         # Experiment 06: Flip-Flop Architecture
├── exp7_bcd_decoder.html       # Experiment 07: BCD to 7-Segment
├── exp8_mux.html               # Experiment 08: MUX & DEMUX
├── exp9_motherboard.html       # Experiment 09: Motherboard Anatomy
├── exp10_alu.html              # Experiment 10: ALU Simulation
│
├── css/
│   ├── global.css              # Shared nav, mesh background, CSS variables
│   └── ...                     # Per-page CSS files
│
├── js/
│   ├── nav-shared.js           # Shared nav logic (auth state, active links)
│   └── ...                     # Per-page JS files
│
├── sandbox-react/              # ⚛️ Logic Gate Sandbox (React app — run separately)
│   ├── package.json
│   └── src/
│
└── logicflow-admin/                      # Faculty Admin Panel
    └── index.html
```

---

## Tech Stack

| Layer            | Technology                                                      |
| ---------------- | --------------------------------------------------------------- |
| Markup           | HTML5 (semantic)                                                |
| Styling          | Vanilla CSS (custom properties, grid, flexbox, backdrop-filter) |
| Logic            | Vanilla JavaScript (ES6+, no frameworks)                        |
| Sandbox UI       | React (Vite)                                                    |
| Charting         | Chart.js 4.4.0 (CDN)                                            |
| Canvas rendering | Native Canvas 2D API                                            |
| Fonts            | Google Fonts — Playfair Display, JetBrains Mono                 |
| State / Auth     | `sessionStorage` (role) + `localStorage` (student credentials)  |
| Build            | None for main app — file-based, zero build step                 |
| Hosting          | Vercel                                                          |

---

## Getting Started (Local)

No build tools required for the main app.

**Option 1 — Open directly**

```bash
git clone https://github.com/your-username/logicflow.git
cd logicflow
open index.html
```

> Some browsers block `backdrop-filter` or Canvas on `file://` URLs. Use a local server for the best experience.

**Option 2 — Local server (recommended)**

```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve .

# VS Code
# Install "Live Server" extension → click "Go Live"
```

Open `http://localhost:8000` in your browser.

---

## Sandbox Setup (React)

The Logic Gate Sandbox is a **separate React application** inside the `sandbox-react/` folder. It must be started independently.

```bash
cd sandbox-react
npm install
npm run dev
```

Then open the URL shown in the terminal (typically `http://localhost:5173`).

> The main app's Sandbox page links to this local React dev server when running locally, or to the deployed version on Vercel.

---

## Design System

All pages share a consistent visual language.

### Color Palette

| Token       | Hex                      | Usage                               |
| ----------- | ------------------------ | ----------------------------------- |
| `--bg`      | `#eceeff`                | Page background                     |
| `--surface` | `rgba(255,255,255,0.55)` | Glassmorphic panels                 |
| `--cyan`    | `#06b6d4`                | Primary accent (CRO, BCD)           |
| `--amber`   | `#F59E0B`                | Secondary accent (sliders, Q-point) |
| `--green`   | `#22c55e`                | Active/running states               |
| `--purple`  | `#8b5cf6`                | Logic gates, flip-flops             |

### Typography

| Variable         | Font              | Usage                 |
| ---------------- | ----------------- | --------------------- |
| `--font-display` | Playfair Display  | Page/section headings |
| `--font-body`    | System sans-serif | Body prose            |
| `--font-mono`    | JetBrains Mono    | Labels, values, code  |

---

## Roadmap

- [ ] Backend integration for real student auth and gradebook sync
- [ ] Lab report PDF export for all experiments
- [ ] Mobile-optimized CRO canvas layout
- [ ] Dark mode
- [ ] Shareable experiment configs via URL parameters
- [ ] Full System Logs and Support panels (currently "Coming Soon")

---

## License

This project is a frontend educational demonstration built for university coursework. All simulation physics and circuit models are implemented from first principles. Chart.js is used under its MIT license.

---

_Built for the classroom — and beyond. 🔬_
