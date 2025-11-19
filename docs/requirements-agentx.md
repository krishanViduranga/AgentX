# agentX – MVP Requirements

## 1. Project overview

**Product name:** agentX  
**Tagline:** AI Insurance.Agent – Build smarter insurance and life plans instantly — powered by AI.  
**Type:** Web app (Next.js)  
**MVP mode:** No login, everything client-side for now.

### Problem

Most people have no idea:
- How make personaly customized Financial plan
- How much life insurance they need  
- Whether their current coverage is enough  
- Whether their savings/retirement plan is on track  

They Google random calculators and get confused, or they have to talk to a salesperson.

### Solution (MVP)

agentX provides a simple, guided “life planning” flow:

- User answers a few questions  
- agentX explains, in simple language:
  - How much coverage they might need  
  - Rough gaps vs current situation  
  - Simple suggestions (e.g., “You may be under-insured if…”)

---

## 2. Target users & usage

### Primary user

Adults with job/income, thinking about:
- Financial freedom
- Life insurance  
- Family protection  
- Retirement readiness  

### Usage style

- Quick, anonymous tool  
- Mobile + desktop friendly  
- 5–10 minutes per session  

---

## 3. Scope for MVP

### 3.1 Pages / routes

#### Landing page (`/`)

**Hero section:**

- Title/tag: `AI Insurance.Agent`
- Subtext: `Build smarter insurance and life plans instantly — powered by AI.`
- CTA button: **Start Life Planning**
- Privacy line: `🔒 No sign-up required. Your data stays private.`
- Right side: “agentX Planner” preview card (like already started).

#### Planner workspace (`/planner` or same page via state)

**Layout:**

- Left: summary / step progress  
- Right: toolbox + active tool panel / popup  

No auth; state in memory for now.

---

### 3.2 Core features (MVP)

---
### F1. Start Life Planning – AI-powered life plan brief

**Goal:**  
Provide a simple input form that collects key parameters for an AI-generated life plan document.
After the user completes the Life Plan Parameters form (Start Life Planning), 
allow them to download a structured life plan document as either DOCX or PDF.

When the user clicks **"Start Life Planning"**, open a panel/popup with the following sections:

**Trigger:**  
- User submits the Life Plan Parameters form successfully.
- A result/confirmation view is shown with two buttons:
  - `Download DOCX`
  - `Download PDF`
---

#### Life Plan Parameters

1. **Life plan topic**

   - Label: `Life plan topic`
   - Helper text: `Provide a clear and specific life plan topic.`
   - Type: single-line text input
   - Examples:  
        - “Financial security plan for a family living and working abroad”  
        - “Early retirement plan by age 50 with potential relocation in the future”

2. **Additional details / focus areas**

   - Label: `What should we focus on in your life plan?`
   - Helper text: `Include any specific aspects you want to focus on in your life plan.`
   - Type: multi-line textarea
   - Examples:  
     - “Focus on mortgage repayment + kids’ education + basic retirement.”  
     - “Prioritize risk management and emergency fund size.”

3. **Approximate length**

   - Label: `Approximate length of your document`
   - Control: radio buttons or select
   - MVP options:
     - `Short (2–3 pages)`
     - `Medium (5–10 pages)` ← default
     - `Long (10–15 pages)` (optional)

4. **Financial literacy level**

   - Label: `Your financial literacy level`
   - Helper text: `This helps agentX adjust explanations to your comfort level.`
   - Control: select/dropdown
   - Options:
     - `Beginner – I’m new to financial concepts`
     - `Intermediate – I understand basics like savings, loans, and insurance`
     - `Advanced – I’m comfortable with investing, insurance products, and risk`
     - `Expert – I’m well experienced with investing, insurance products, and risk`
---

**Acceptance criteria:**

- [ ] Clicking **Start Life Planning** opens a panel/popup titled `Life Plan Parameters`.
- [ ] All four fields (topic, details, length, literacy level) are visible and usable on desktop and mobile.
- [ ] Basic validation:
  - [ ] Topic is required.
  - [ ] Length has a default value (Medium).
  - [ ] Financial literacy level has a default value (Beginner or user choice).
- [ ] Submitting the form triggers an internal handler that builds a structured payload (suitable for future AI API calls).
- [ ] No page reload on submit.
- [ ] On successful submit, show a short confirmation or “preview of generated plan”.
- [ ] Download option by clicking Download DOCX or Download PDF

### F2. Toolbox with planning tools

**Description:**  
Right-side toolbox listing available tools as cards.

**Initial tools:**

- Insurance Needs Estimator  
- Retirement Readiness Checker (skeleton in MVP OK)  
- Placeholder slots (e.g. “Education Planning – coming soon”)  

**Requirements:**

- Clicking a tool:
  - Opens a compact popup/panel (not full-screen dialog)
  - Shows tool description and input form
- Only one tool active at a time.

**Acceptance criteria:**

- [ ] Toolbox visible on planner screen.  
- [ ] Each tool card shows title + short description.  
- [ ] Clicking a card opens a popup/panel with that tool.  
- [ ] Close button hides popup.

---

### F3. Insurance Needs Estimator (first “real” tool)

**Goal:**  
Given user’s basic info, estimate a recommended life insurance coverage range.

**Inputs (simple for MVP):**

- Age  
- Annual income  
- Number of dependents (e.g., 0 / 1–2 / 3+)  
- Years to support dependents (e.g., 10 / 20 / custom)  
- Existing life insurance coverage (optional)  

**Logic (MVP – simple formula is OK):**

Some basic calculation like:

- `Base coverage = annual income × years to support × factor`  
- Adjust for dependents (e.g., +10–30%)  
- Compare with existing coverage to show gap.  

**Outputs:**

- Suggested coverage range (e.g., ¥30M–¥40M)
- Short explanation text, in friendly language:
  - “Based on your income and dependents, you may want at least X–Y in coverage.”
- If existing coverage < suggested → show “possible gap”.

**Acceptance criteria:**

- [ ] Form validation: required fields, reasonable ranges.  
- [ ] On submit, result is shown below the form in the popup.  
- [ ] No page reload.  
- [ ] If existing coverage is entered, show “You might be under-insured/over-insured/about right” message.

---

### F4. Retirement Readiness Checker (MVP skeleton)

**Goal:**  
Not full-blown, but at least a working first version.

**Inputs (simple):**

- Current age  
- Target retirement age  
- Current savings  
- Monthly investment amount  
- Expected return (%) – can use a safe default value.  

**Outputs:**

- Projected savings at retirement (simple compound interest).  
- Friendly status text:
  - “On track / Needs improvement / At risk” based on rough thresholds.

**Acceptance criteria:**

- [ ] Form with basic inputs and validation.  
- [ ] Clicking “Calculate” shows projected amount.  
- [ ] Simple text label for status.

---

### F5. Global state management

**Goal:**  
Behavior feels like a real app, not random components.

**Requirements:**

Use Redux (or Zustand) to manage:

- Active tool (id)  
- Tool results (so they can be shown in summary later)  

Provide a `Providers` wrapper in `layout.tsx`.

**Acceptance criteria:**

- [ ] Changing pages or components doesn’t lose active tool state immediately (for now, only within the session).  
- [ ] Summary section can read from state to show last results (even simple “last used tool: Insurance Needs Estimator, result: …”).

---

### F6. UX & UI polish (MVP level)

**Requirements:**

- Consistent theme: agentX branding (dark, modern).  

**Mobile-friendly:**

- Stack sections vertically on small screens.  
- Buttons and inputs usable on mobile.  

**Acceptance criteria:**

- [ ] Layout doesn’t break on 360px width.  
- [ ] Fonts not too tiny on mobile.  
- [ ] Start Life Planning button is visible without scrolling on most screens.

---

## 4. Non-functional requirements

### Tech stack

- Next.js 15 (App Router)  
- TypeScript  
- Tailwind CSS  
- Redux Toolkit (or Zustand) for global state  

### Performance

- Lighthouse: basic performance > 80 on desktop.

### Security / privacy (MVP level)

- No backend yet → calculations all client-side.  
- No data stored server-side.  
- No 3rd-party analytics for MVP.

### Code quality

- Lint clean (ESLint).  
- Basic folder structure:
  - `src/app/` (pages)  
  - `src/components/` (UI, toolbox, popups)  
  - `src/store/` (state)  
  - `src/lib/` (calculation helpers)  
