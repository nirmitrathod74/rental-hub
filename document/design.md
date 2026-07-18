# Odoo‑Style UI/UX Design Guide for Hackathon Prototypes

This document provides a complete, copy‑pasteable design system inspired by Odoo's backend UI. It covers colors, fonts, layout, components, and patterns so you can quickly build a professional, enterprise‑like prototype for your hackathon.

---

## 1. Design Philosophy

Your UI should follow these principles:

- **Data‑dense but readable**: Show lots of information (tables, forms, KPIs) without overwhelming the user.
- **Consistent**: Use the same patterns for lists, forms, search, filters, and buttons across all pages.
- **Professional / enterprise**: Neutral backgrounds, strong accent for actions, minimal decoration.
- **Action‑oriented**: Primary buttons in a strong color, secondary actions in muted styles.

You don't need to copy Odoo exactly. Focus on:
- Similar layout structure (header + sidebar + content).
- Similar component patterns (tables, forms, cards, filters).
- Similar visual tone (clean, minimal, structured).

---

## 2. Color Palette

### 2.1 Core Concept (5‑Color System)

Odoo uses a conceptual 5‑color system:

- `o-color-1` – Primary (brand / main accent)
- `o-color-2` – Secondary
- `o-color-3` – Extra / light
- `o-color-4` – Whitish (backgrounds, light areas)
- `o-color-5` – Blackish (text, dark areas)

You can implement this with CSS variables:

```css
:root {
  --primary: #007bff;        /* or Odoo purple: #714B67 */
  --secondary: #6c757d;
  --extra-light: #f2f2f2;
  --whitish: #ffffff;
  --blackish: #21252b;

  /* Support colors */
  --success: #28a745;
  --warning: #ffc107;
  --danger: #dc3545;
  --info: #17a2b8;

  /* UI helpers */
  --background: #f9f9f9;
  --border: #dee2e6;
  --text-muted: #6c757d;
}
```

### 2.2 Usage Guidelines

- **Primary color**: Primary buttons, active links, selected states, highlights.
- **Secondary color**: Secondary buttons, less important labels, muted icons.
- **Background / whitish**: Page background (`--background`), cards/panels/inputs (`--whitish`).
- **Text**: Main text (`--blackish`), muted text (`--text-muted`).
- **Borders**: All borders use `--border`.
- **Status colors**:
  - Success: green badges, confirmations.
  - Warning: yellow badges, pending states.
  - Danger: red badges, errors, deletions.
  - Info: blue badges, informational messages.

---

## 3. Fonts & Typography

### 3.1 Font Family

Use a clean, modern sans‑serif font. Recommended: **Poppins** (Google Fonts).

```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

body {
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--blackish);
}
```

### 3.2 Font Sizes

| Element    | Size       |
|------------|------------|
| Body       | `14px`     |
| Small text | `12–13px`  |
| h1         | `28–32px`  |
| h2         | `24px`     |
| h3         | `20px`     |
| h4         | `18px`     |
| h5         | `16px`     |
| h6         | `14px`     |

### 3.3 Font Weights

| Usage                       | Weight    |
|-----------------------------|-----------|
| Headings                    | `600–700` |
| Buttons, labels, badges     | `500–600` |
| Body text                   | `400`     |

---

## 4. Layout & Spacing

### 4.1 Global Layout

Use a standard three-part structure: fixed top header, optional left sidebar, and main content area.

```html
<body>
  <header class="navbar"> ... </header>
  <aside class="sidebar"> ... </aside>
  <main class="content">
    <div class="container"> ... </div>
  </main>
</body>
```

```css
body {
  margin: 0;
  background: var(--background);
}

.navbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 52px;
  z-index: 1000;
}

.sidebar {
  position: fixed;
  top: 52px;
  left: 0;
  bottom: 0;
  width: 220px;
  background: var(--whitish);
  border-right: 1px solid var(--border);
  overflow-y: auto;
}

.content {
  margin-top: 52px;
  margin-left: 220px;
  padding: 20px;
}

.container {
  max-width: 1300px;
  margin: 0 auto;
}
```

### 4.2 Spacing Values

| Element                     | Spacing        |
|-----------------------------|----------------|
| Page padding                | `16–24px`      |
| Card padding                | `16px`         |
| Section padding             | `16–24px`      |
| Button padding              | `8px 14–16px`  |
| Gap between fields          | `12–16px`      |
| Margin between cards        | `16px`         |

---

## 5. Navigation

### 5.1 Top Navbar

- Height: `52px`
- Background: `--primary` (or a dark color)
- Text: white
- Font: `14px`, weight `500`

```css
.navbar {
  background: var(--primary);
  color: white;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.navbar .nav-item {
  margin: 0 8px;
  font-weight: 500;
  cursor: pointer;
  padding: 6px 10px;
}

.navbar .nav-item.active {
  background: rgba(255,255,255,0.15);
  border-radius: 4px;
}
```

Content layout:
- **Left**: App name / logo.
- **Center**: Main menu items.
- **Right**: User avatar, notifications, settings.

### 5.2 Sidebar Menu

- Width: `220px`
- Background: white or very light
- Items: icon + label
- Active item: slightly highlighted background

```css
.sidebar .menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  font-size: 14px;
  font-weight: 500;
  color: var(--blackish);
  cursor: pointer;
}

.sidebar .menu-item.active {
  background: var(--extra-light);
  color: var(--primary);
}
```

---

## 6. Tables (List Views)

Odoo's list view is a key pattern for displaying data-dense records.

### 6.1 Structure

- Full‑width table
- Fixed header row
- Sortable columns
- Row selection (checkboxes)
- Hover highlight

### 6.2 CSS

```css
table.list-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

table.list-table th {
  background: var(--extra-light);
  color: var(--blackish);
  font-weight: 600;
  padding: 10px 12px;
  border-bottom: 2px solid var(--border);
  text-align: left;
}

table.list-table td {
  padding: 8px 12px;
  border-bottom: 1px solid var(--border);
}

table.list-table tr:hover {
  background: #f5f7fa;
}

table.list-table tr.selected {
  background: #eef4ff;
}
```

Add small status badges and inline action buttons/dropdowns at row ends.

---

## 7. Forms (Form Views)

### 7.1 Layout

- Header bar with actions (Save, Discard, Create).
- Sections or tabs for grouped fields.
- Two‑column layout: label + input.

```html
<div class="form-card">
  <div class="form-header">
    <button class="btn btn-primary">Save</button>
    <button class="btn btn-secondary">Discard</button>
  </div>

  <div class="form-body">
    <div class="form-row">
      <label>Name</label>
      <input type="text" />
    </div>
    <!-- more rows -->
  </div>
</div>
```

### 7.2 CSS

```css
.form-card {
  background: var(--whitish);
  border: 1px solid var(--border);
  border-radius: 6px;
  margin-bottom: 16px;
}

.form-header {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
}

.form-body {
  padding: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.form-row label {
  font-weight: 500;
  font-size: 14px;
  color: var(--blackish);
}
```

### 7.3 Inputs

```css
input, select, textarea {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 14px;
  background: var(--whitish);
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(0,123,255,0.15);
}
```

---

## 8. Cards & Sections

Cards are used for KPIs, summary panels, related records, and filter panels.

```css
.card {
  background: var(--whitish);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
}
```

---

## 9. Buttons & Actions

### 9.1 Base Button

```css
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 4px;
  border: 1px solid transparent;
  cursor: pointer;
  text-decoration: none;
}
```

### 9.2 Variants

```css
.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-secondary {
  background: var(--secondary);
  color: white;
}

.btn-outline {
  background: var(--whitish);
  border-color: var(--border);
  color: var(--blackish);
}
```

### 9.3 When to Use Each

| Variant     | Use case                              |
|-------------|---------------------------------------|
| Primary     | Save, Create, Confirm                 |
| Secondary   | Discard, Cancel                       |
| Outline     | View details, Edit (tertiary actions) |

---

## 10. Searchbar, Filters & Smartbars

### 10.1 Searchbar

Compact top bar with: search input with icon, filter dropdowns, group by / sort by.

```css
.searchbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: var(--extra-light);
  border-bottom: 1px solid var(--border);
}

.searchbar input {
  flex: 1;
  padding: 8px 10px 8px 32px;
  border: 1px solid var(--border);
  border-radius: 4px;
}
```

```html
<div class="search-icon">🔍</div>
<input type="text" placeholder="Search..." />
```

### 10.2 Filter Pills

```css
.filter-pill {
  padding: 6px 10px;
  font-size: 13px;
  background: var(--whitish);
  border: 1px solid var(--border);
  border-radius: 4px;
  cursor: pointer;
}

.filter-pill.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}
```

Use filter pills for: "My Records", "To Review", "Done", etc.

---

## 11. Status Colors & Badges

### 11.1 Colors

| Status  | Color     |
|---------|-----------|
| Success | `#28a745` |
| Warning | `#ffc107` |
| Danger  | `#dc3545` |
| Info    | `#17a2b8` |

### 11.2 Badge CSS

```css
.badge {
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 4px;
  display: inline-block;
}

.badge-success { background: #28a745; color: white; }
.badge-warning { background: #ffc107; color: #21252b; }
.badge-danger  { background: #dc3545; color: white; }
.badge-info    { background: #17a2b8; color: white; }
```

Use badges for: record status (Draft, In Progress, Done), priority levels, validation states.

---

## 12. Icons & Visual Style

- Use simple, flat SVG icons.
- Recommended libraries: Bootstrap Icons, Remix Icon, or FontAwesome.
- Avoid cartoonish or overly decorative icons.

General style rules:
- Minimal shadows.
- No heavy gradients in backend views.
- Clean lines, subtle borders.

```html
<button class="btn btn-primary">
  <i class="bi bi-check"></i> Save
</button>
```

---

## 13. Example Page Structure

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Hackathon Prototype</title>
  <link rel="stylesheet" href="design.css" />
</head>
<body>
  <header class="navbar">
    <div class="nav-brand">MyApp</div>
    <nav class="nav-menu">
      <a class="nav-item active">Dashboard</a>
      <a class="nav-item">Records</a>
      <a class="nav-item">Settings</a>
    </nav>
    <div class="nav-user">User</div>
  </header>

  <aside class="sidebar">
    <div class="menu-item active">
      <i class="icon"></i> Overview
    </div>
    <div class="menu-item">
      <i class="icon"></i> All Records
    </div>
  </aside>

  <main class="content">
    <div class="container">

      <!-- Searchbar -->
      <div class="searchbar">
        <div class="search-icon">🔍</div>
        <input type="text" placeholder="Search..." />
        <button class="filter-pill active">My Records</button>
        <button class="filter-pill">All</button>
      </div>

      <!-- Summary Card -->
      <div class="card">
        <h4 class="card-title">Summary</h4>
        <p>Some summary text here.</p>
      </div>

      <!-- List Table -->
      <table class="list-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>Record A</td>
            <td><span class="badge badge-success">Done</span></td>
            <td><button class="btn btn-outline">Edit</button></td>
          </tr>
        </tbody>
      </table>

    </div>
  </main>
</body>
</html>
```

---

## 14. Why This Works in a Hackathon

Judges typically evaluate:

1. **Clarity** – Can they understand your app quickly?
2. **Consistency** – Do all pages feel part of the same system?
3. **Professionalism** – Does it look like a real product?

An Odoo‑style UI delivers:
- Clean, structured layouts (tables, forms, cards, filters).
- Clear action flow (primary/secondary buttons, status colors).
- A "business software" vibe that fits many hackathon domains (ERP, CRM, inventory, HR, fintech, etc.).

---

## 15. Implementation Tips

- Put all CSS in a single `design.css` file.
- Use CSS variables for colors and spacing — easy to retheme in seconds.
- Build in order: navbar → content area → sidebar → tables → forms → badges.
- Keep components consistent: same button styles, card styles, and table styles on every page.
- Don't over-engineer — judges care about clarity over complexity.

---

*Generated for hackathon use. Adapt colors, fonts, and layouts to fit your specific domain.*
