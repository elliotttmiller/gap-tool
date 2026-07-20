import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(scriptDir, "..")
const sourcePath = path.join(rootDir, "docs", "module-inputs-metrics-wiring.md")
const outputPath = path.join(rootDir, "docs", "module-inputs-metrics-wiring.html")

const source = fs.readFileSync(sourcePath, "utf8").replace(/\r\n/g, "\n")

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function renderInline(value) {
  const code = []
  let html = value.replace(/`([^`]+)`/g, (_, content) => {
    code.push(`<code>${escapeHtml(content)}</code>`)
    return `@@CODE${code.length - 1}@@`
  })

  html = escapeHtml(html)
    .replace(/\*\*([^*]+)\*\*/g, (_, content) => {
      const status = content.match(/^(E2E|CALC|DISPLAY|STORED|LOCAL|UNWIRED(?: UI)?|LEGACY)(.*)$/)
      if (!status) return `<strong>${content}</strong>`
      const key = status[1].replace(" UI", "").toLowerCase()
      return `<span class="status status-${key}">${status[1]}</span>${status[2]}`
    })
    .replace(/-&gt;/g, '<span class="flow-arrow" aria-hidden="true">→</span>')

  return html.replace(/@@CODE(\d+)@@/g, (_, index) => code[Number(index)])
}

function isTableDivider(line) {
  return /^\|(?:\s*:?-+:?\s*\|)+$/.test(line.trim())
}

function tableCells(line) {
  return line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim())
}

function renderMarkdown(markdown) {
  const lines = markdown.split("\n")
  const headings = []
  const output = []
  let index = 0
  let firstHeadingSkipped = false
  let sectionOpen = false

  while (index < lines.length) {
    const line = lines[index]
    const heading = line.match(/^(#{1,3})\s+(.+)$/)

    if (line.startsWith(":::flow")) {
      const title = line.replace(":::flow", "").trim() || "Calculation flow"
      const steps = []
      index += 1
      while (index < lines.length && lines[index].trim() !== ":::") {
        const [stepTitle, ...detailParts] = lines[index].split(" | ")
        if (stepTitle?.trim()) steps.push({ title: stepTitle.trim(), detail: detailParts.join(" | ").trim() })
        index += 1
      }
      if (lines[index]?.trim() === ":::") index += 1
      output.push(`<div class="workflow" aria-label="${escapeHtml(title)}"><div class="workflow-title">${renderInline(title)}</div><div class="workflow-grid">`)
      output.push(steps.map((step, stepIndex) => `<div class="workflow-step"><div class="workflow-index">${String(stepIndex + 1).padStart(2, "0")}</div><div><strong>${renderInline(step.title)}</strong><p>${renderInline(step.detail)}</p></div></div>`).join(""))
      output.push("</div></div>")
      continue
    }

    if (heading) {
      const level = heading[1].length
      const label = heading[2]
      if (level === 1 && !firstHeadingSkipped) {
        firstHeadingSkipped = true
        index += 1
        continue
      }
      const id = slugify(label)
      if (level === 2) headings.push({ id, label: label.replace(/^\d+\.\s*/, "") })
      if (level === 2 && sectionOpen) output.push("</section>")
      if (level === 2) {
        output.push(`<section class="document-section" id="section-${id}" data-search-section>`)
        sectionOpen = true
      }
      output.push(`<h${level} id="${id}">${renderInline(label)}</h${level}>`)
      index += 1
      continue
    }

    if (line.trim().startsWith("|") && index + 1 < lines.length && isTableDivider(lines[index + 1])) {
      const headers = tableCells(line)
      index += 2
      const rows = []
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        rows.push(tableCells(lines[index]))
        index += 1
      }
      output.push('<div class="table-shell" tabindex="0"><table><thead><tr>')
      output.push(headers.map((cell) => `<th scope="col">${renderInline(cell)}</th>`).join(""))
      output.push("</tr></thead><tbody>")
      for (const row of rows) {
        output.push(`<tr>${row.map((cell) => `<td>${renderInline(cell)}</td>`).join("")}</tr>`)
      }
      output.push("</tbody></table></div>")
      continue
    }

    if (/^\d+\.\s+/.test(line)) {
      const items = []
      while (index < lines.length && /^\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\d+\.\s+/, ""))
        index += 1
      }
      output.push(`<ol class="conclusions">${items.map((item) => `<li>${renderInline(item)}</li>`).join("")}</ol>`)
      continue
    }

    if (!line.trim()) {
      index += 1
      continue
    }

    if (line.startsWith("Generated from the current TypeScript implementation")) {
      index += 1
      continue
    }

    const paragraph = [line.trim()]
    index += 1
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^#{1,3}\s+/.test(lines[index]) &&
      !lines[index].trim().startsWith("|") &&
      !/^\d+\.\s+/.test(lines[index])
    ) {
      paragraph.push(lines[index].trim())
      index += 1
    }
    output.push(`<p>${renderInline(paragraph.join(" "))}</p>`)
  }

  if (sectionOpen) output.push("</section>")
  return { body: output.join("\n"), headings }
}

const rendered = renderMarkdown(source)
const nav = rendered.headings
  .map(({ id, label }, index) => `<a href="#${id}" data-nav-link><span>${String(index + 1).padStart(2, "0")}</span>${escapeHtml(label)}</a>`)
  .join("\n")

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>Module Wiring & Metric Inventory | Gap Tool</title>
  <style>
    :root {
      --ink: #172033;
      --muted: #647086;
      --faint: #8f9aae;
      --line: #dce3ed;
      --line-soft: #e9edf3;
      --surface: #ffffff;
      --surface-soft: #f6f8fb;
      --navy: #10294d;
      --blue: #2264d1;
      --cyan: #0e7490;
      --green: #147a55;
      --amber: #a05a00;
      --red: #b4233c;
      --violet: #6a42b8;
      --shadow: 0 18px 50px rgba(20, 42, 75, .10);
      --radius: 16px;
    }

    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; scroll-padding-top: 92px; }
    body {
      margin: 0;
      color: var(--ink);
      background:
        radial-gradient(circle at 82% 0%, rgba(34, 100, 209, .09), transparent 25rem),
        linear-gradient(180deg, #f5f8fc 0, #eef3f8 34rem, #f7f9fc 100%);
      font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 15px;
      line-height: 1.58;
    }

    a { color: inherit; }
    button, input { font: inherit; }
    .topbar {
      position: sticky;
      top: 0;
      z-index: 30;
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 64px;
      padding: 10px max(24px, calc((100vw - 1480px) / 2));
      border-bottom: 1px solid rgba(220, 227, 237, .9);
      background: rgba(255, 255, 255, .88);
      backdrop-filter: blur(16px);
    }
    .brand { display: flex; align-items: center; gap: 11px; font-weight: 750; color: var(--navy); }
    .brand-mark { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 10px; color: #fff; background: linear-gradient(145deg, #123a70, #2871dc); box-shadow: 0 8px 18px rgba(34, 100, 209, .24); }
    .brand small { display: block; margin-top: -2px; color: var(--muted); font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
    .actions { display: flex; align-items: center; gap: 8px; }
    .search-wrap { position: relative; }
    .search-wrap svg { position: absolute; left: 12px; top: 50%; width: 16px; transform: translateY(-50%); color: var(--faint); }
    #search { width: min(29vw, 330px); height: 38px; padding: 0 36px 0 36px; border: 1px solid var(--line); border-radius: 10px; outline: none; color: var(--ink); background: #fff; }
    #search:focus { border-color: #7aa7ed; box-shadow: 0 0 0 3px rgba(34, 100, 209, .12); }
    #clearSearch { position: absolute; right: 7px; top: 6px; display: none; width: 26px; height: 26px; padding: 0; border: 0; background: transparent; color: var(--muted); cursor: pointer; }
    .action-button { height: 38px; padding: 0 14px; border: 1px solid var(--line); border-radius: 10px; color: var(--navy); background: #fff; font-size: 13px; font-weight: 700; cursor: pointer; }
    .action-button:hover { border-color: #a9b8cb; background: var(--surface-soft); }

    .page { width: min(1480px, calc(100% - 40px)); margin: 0 auto; padding: 34px 0 70px; }
    .hero {
      position: relative;
      overflow: hidden;
      padding: clamp(28px, 4vw, 52px);
      border-radius: 24px;
      color: #fff;
      background: linear-gradient(120deg, #0d2342 0%, #123c71 58%, #1e65b7 100%);
      box-shadow: var(--shadow);
    }
    .hero::after { content: ""; position: absolute; width: 340px; height: 340px; right: -100px; top: -170px; border: 62px solid rgba(255,255,255,.065); border-radius: 50%; }
    .eyebrow { margin: 0 0 13px; color: #a9cbff; font-size: 12px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; }
    .hero h1 { max-width: 900px; margin: 0; font-size: clamp(30px, 4vw, 52px); line-height: 1.08; letter-spacing: -.035em; }
    .hero-copy { max-width: 790px; margin: 18px 0 0; color: #d7e5f8; font-size: 16px; }
    .hero-meta { display: flex; flex-wrap: wrap; gap: 8px 18px; margin-top: 24px; color: #bad0ec; font-size: 12px; font-weight: 650; }
    .hero-meta span { display: inline-flex; align-items: center; gap: 7px; }
    .hero-meta span::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: #5ce1a4; box-shadow: 0 0 0 4px rgba(92,225,164,.12); }

    .summary-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin: 18px 0 28px; }
    .summary-card { padding: 19px 20px; border: 1px solid var(--line); border-radius: var(--radius); background: rgba(255,255,255,.92); box-shadow: 0 8px 24px rgba(23,32,51,.05); }
    .summary-card .value { color: var(--navy); font-size: 27px; font-weight: 800; line-height: 1; letter-spacing: -.03em; }
    .summary-card .label { margin-top: 8px; color: var(--muted); font-size: 12px; font-weight: 750; letter-spacing: .06em; text-transform: uppercase; }
    .summary-card .note { margin-top: 5px; color: var(--faint); font-size: 12px; line-height: 1.35; }

    .content-grid { display: grid; grid-template-columns: 238px minmax(0, 1fr); gap: 28px; align-items: start; }
    .sidebar { position: sticky; top: 88px; }
    .sidebar-card { overflow: hidden; border: 1px solid var(--line); border-radius: var(--radius); background: rgba(255,255,255,.94); box-shadow: 0 10px 28px rgba(23,32,51,.055); }
    .sidebar-title { padding: 16px 17px 10px; color: var(--faint); font-size: 10px; font-weight: 800; letter-spacing: .15em; text-transform: uppercase; }
    .sidebar nav { padding: 0 8px 10px; }
    .sidebar a { display: grid; grid-template-columns: 25px 1fr; gap: 4px; align-items: center; padding: 9px 9px; border-radius: 9px; color: var(--muted); font-size: 12px; font-weight: 650; line-height: 1.25; text-decoration: none; }
    .sidebar a span { color: #a1acbc; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 10px; }
    .sidebar a:hover, .sidebar a.active { color: var(--blue); background: #edf4ff; }
    .sidebar a.active span { color: var(--blue); }
    .sidebar-foot { padding: 13px 16px 15px; border-top: 1px solid var(--line-soft); color: var(--faint); font-size: 10px; line-height: 1.45; }

    .document { min-width: 0; }
    .document-section { margin: 0 0 22px; padding: clamp(22px, 3vw, 34px); border: 1px solid var(--line); border-radius: 18px; background: var(--surface); box-shadow: 0 10px 30px rgba(23,32,51,.055); }
    .document-section[hidden] { display: none; }
    .document h2 { margin: 0 0 18px; padding-bottom: 15px; border-bottom: 1px solid var(--line-soft); color: var(--navy); font-size: clamp(22px, 2.3vw, 29px); line-height: 1.2; letter-spacing: -.02em; }
    .document h3 { display: flex; align-items: center; gap: 10px; margin: 30px 0 12px; color: #294262; font-size: 16px; line-height: 1.3; }
    .document h3::before { content: ""; width: 4px; height: 18px; border-radius: 4px; background: linear-gradient(#2c77da, #45a7cc); }
    .document p { max-width: 1000px; margin: 11px 0 16px; color: #4f5d72; }
    .document code { padding: 2px 6px; border: 1px solid #dde5f0; border-radius: 6px; color: #174e92; background: #f3f7fc; font-family: "SFMono-Regular", Consolas, "Liberation Mono", monospace; font-size: .88em; white-space: normal; overflow-wrap: anywhere; }
    .flow-arrow { padding: 0 3px; color: var(--blue); font-weight: 800; }
    .workflow { margin: 17px 0 24px; padding: 18px; border: 1px solid #cddcf0; border-radius: 14px; background: linear-gradient(145deg, #f8fbff, #f2f7fd); }
    .workflow-title { margin-bottom: 13px; color: #395574; font-size: 10px; font-weight: 850; letter-spacing: .13em; text-transform: uppercase; }
    .workflow-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 26px; }
    .workflow-step { position: relative; display: grid; grid-template-columns: 30px 1fr; gap: 10px; min-height: 98px; padding: 14px; border: 1px solid #d9e4f1; border-radius: 12px; background: #fff; box-shadow: 0 6px 16px rgba(25, 62, 106, .055); }
    .workflow-step:not(:last-child)::after { content: "→"; position: absolute; right: -21px; top: 50%; z-index: 2; color: #5b8dca; font-size: 20px; font-weight: 800; transform: translateY(-50%); }
    .workflow-index { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 9px; color: #fff; background: linear-gradient(145deg, #153d70, #2874cf); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 10px; font-weight: 800; }
    .workflow-step strong { display: block; color: #213d60; font-size: 12px; line-height: 1.3; }
    .workflow-step p { margin: 6px 0 0; color: #65758a; font-size: 11px; line-height: 1.45; }
    .table-shell { overflow-x: auto; margin: 16px 0 22px; border: 1px solid var(--line); border-radius: 12px; outline: none; }
    .table-shell:focus { box-shadow: 0 0 0 3px rgba(34,100,209,.12); }
    table { width: 100%; min-width: 680px; border-collapse: separate; border-spacing: 0; font-size: 12.5px; line-height: 1.48; }
    th { position: sticky; top: 0; padding: 11px 13px; color: #42516a; background: #f2f5f9; font-size: 10px; font-weight: 800; letter-spacing: .07em; text-align: left; text-transform: uppercase; }
    td { padding: 11px 13px; border-top: 1px solid var(--line-soft); color: #4a586d; vertical-align: top; }
    tbody tr:nth-child(even) td { background: #fbfcfe; }
    tbody tr:hover td { background: #f3f7fc; }
    td:first-child { color: #263a57; font-weight: 650; }
    .status { display: inline-flex; align-items: center; padding: 2px 7px; border: 1px solid; border-radius: 999px; font-size: 9px; font-weight: 850; letter-spacing: .07em; line-height: 1.45; text-transform: uppercase; white-space: nowrap; }
    .status-e2e, .status-display { color: var(--green); border-color: #a8dbc9; background: #ecf9f4; }
    .status-calc { color: var(--blue); border-color: #b8cff2; background: #eff5ff; }
    .status-stored { color: #56647a; border-color: #cad2de; background: #f3f5f8; }
    .status-local { color: var(--violet); border-color: #d1c2ee; background: #f5f0fd; }
    .status-unwired { color: var(--red); border-color: #edbdc6; background: #fff0f2; }
    .status-legacy { color: var(--amber); border-color: #e8cca7; background: #fff7e9; }
    .conclusions { display: grid; gap: 10px; margin: 14px 0 0; padding: 0; list-style: none; counter-reset: conclusion; }
    .conclusions li { position: relative; padding: 13px 16px 13px 48px; border: 1px solid var(--line-soft); border-radius: 11px; color: #46546a; background: #fafbfd; counter-increment: conclusion; }
    .conclusions li::before { content: counter(conclusion); position: absolute; left: 14px; top: 12px; display: grid; place-items: center; width: 23px; height: 23px; border-radius: 7px; color: #fff; background: var(--navy); font-size: 11px; font-weight: 800; }
    .no-results { display: none; padding: 54px 25px; border: 1px dashed #b8c4d4; border-radius: 16px; color: var(--muted); background: rgba(255,255,255,.7); text-align: center; }
    .no-results.visible { display: block; }
    mark { padding: 0 2px; border-radius: 3px; color: inherit; background: #fff0a8; }

    @media (max-width: 980px) {
      .summary-grid { grid-template-columns: repeat(2, 1fr); }
      .content-grid { grid-template-columns: 1fr; }
      .sidebar { position: static; }
      .sidebar-card { display: none; }
      .workflow-step::after { display: none; }
    }
    @media (max-width: 680px) {
      .topbar { padding: 9px 14px; }
      .brand div { display: none; }
      #search { width: min(52vw, 260px); }
      .action-button { width: 38px; padding: 0; font-size: 0; }
      .action-button::after { content: "Print"; font-size: 10px; }
      .page { width: min(100% - 24px, 1480px); padding-top: 16px; }
      .hero { border-radius: 18px; }
      .summary-grid { grid-template-columns: 1fr 1fr; gap: 9px; }
      .summary-card { padding: 15px; }
      .document-section { padding: 19px 15px; border-radius: 14px; }
      table { min-width: 620px; }
    }

    @media print {
      @page { size: letter landscape; margin: .42in; }
      body { color: #111827; background: #fff; font-size: 10px; }
      .topbar, .sidebar, .summary-grid { display: none !important; }
      .page { width: 100%; margin: 0; padding: 0; }
      .hero { margin-bottom: 14px; padding: 24px; border-radius: 0; box-shadow: none; print-color-adjust: exact; }
      .hero h1 { font-size: 27px; }
      .hero-copy { font-size: 11px; }
      .content-grid { display: block; }
      .document-section { margin-bottom: 14px; padding: 18px; border-radius: 0; box-shadow: none; break-inside: auto; }
      .document h2 { font-size: 19px; break-after: avoid; }
      .document h3 { font-size: 13px; break-after: avoid; }
      .table-shell { overflow: visible; break-inside: auto; }
      .workflow { break-inside: avoid; }
      .workflow-grid { grid-template-columns: repeat(3, 1fr); gap: 8px; }
      .workflow-step { min-height: 0; padding: 9px; box-shadow: none; }
      .workflow-step::after { display: none; }
      table { min-width: 0; font-size: 8px; }
      thead { display: table-header-group; }
      tr { break-inside: avoid; }
      th, td { padding: 6px 7px; }
      .status { font-size: 7px; print-color-adjust: exact; }
      .document-section[hidden] { display: block; }
    }
  </style>
</head>
<body>
  <header class="topbar">
    <div class="brand">
      <span class="brand-mark">G</span>
      <div>Gap Tool <small>Technical reference</small></div>
    </div>
    <div class="actions">
      <label class="search-wrap" aria-label="Search document">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>
        <input id="search" type="search" placeholder="Search fields, metrics, wiring…" autocomplete="off">
        <button id="clearSearch" type="button" aria-label="Clear search">×</button>
      </label>
      <button class="action-button" type="button" onclick="window.print()">Print / PDF</button>
    </div>
  </header>

  <main class="page">
    <header class="hero">
      <p class="eyebrow">System documentation · Calculation audit</p>
      <h1>Module Inputs, Metrics & End-to-End Wiring</h1>
      <p class="hero-copy">A reader-friendly, tab-by-tab trace of every scenario input, formula, intermediate value, visible metric, chart transformation, persisted result, and correctness risk in the Gap Tool.</p>
      <div class="hero-meta"><span>Verified against current TypeScript</span><span>Generated June 19, 2026</span><span>Source: module-inputs-metrics-wiring.md</span></div>
    </header>

    <section class="summary-grid" aria-label="Document summary">
      <article class="summary-card"><div class="value">7</div><div class="label">Visible workflows</div><div class="note">Every reachable module tab/view traced end to end.</div></article>
      <article class="summary-card"><div class="value">4</div><div class="label">Primary modules</div><div class="note">Life, Disability, Unemployment, and Liability.</div></article>
      <article class="summary-card"><div class="value">4</div><div class="label">Unwired tools</div><div class="note">Implemented calculators without a current application route.</div></article>
      <article class="summary-card"><div class="value">!</div><div class="label">Live output risks</div><div class="note">Stale state, scope conflicts, and visualization defects identified.</div></article>
    </section>

    <div class="content-grid">
      <aside class="sidebar">
        <div class="sidebar-card">
          <div class="sidebar-title">Document contents</div>
          <nav>${nav}</nav>
          <div class="sidebar-foot">Use search to filter whole sections. Tables scroll horizontally on narrow screens.</div>
        </div>
      </aside>
      <article class="document" id="document">
        ${rendered.body}
        <div class="no-results" id="noResults"><strong>No matching sections</strong><br>Try a field name, output metric, module, or wiring status.</div>
      </article>
    </div>
  </main>

  <script>
    const search = document.getElementById("search")
    const clearSearch = document.getElementById("clearSearch")
    const sections = [...document.querySelectorAll("[data-search-section]")]
    const noResults = document.getElementById("noResults")
    const navLinks = [...document.querySelectorAll("[data-nav-link]")]

    function filterDocument() {
      const query = search.value.trim().toLowerCase()
      let visible = 0
      for (const section of sections) {
        const matches = !query || section.textContent.toLowerCase().includes(query)
        section.hidden = !matches
        if (matches) visible += 1
      }
      clearSearch.style.display = query ? "block" : "none"
      noResults.classList.toggle("visible", visible === 0)
    }

    search.addEventListener("input", filterDocument)
    clearSearch.addEventListener("click", () => {
      search.value = ""
      filterDocument()
      search.focus()
    })

    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (!visible) return
      const heading = visible.target.querySelector("h2")
      navLinks.forEach((link) => link.classList.toggle("active", link.hash === "#" + heading?.id))
    }, { rootMargin: "-15% 0px -68% 0px", threshold: [0, .2, .5] })

    sections.forEach((section) => observer.observe(section))
  </script>
</body>
</html>
`

fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(outputPath, html, "utf8")
console.log(`Generated ${path.relative(rootDir, outputPath)} from ${path.relative(rootDir, sourcePath)}`)
