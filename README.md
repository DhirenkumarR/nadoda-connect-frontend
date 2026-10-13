# Nadoda Connect — Web Frontend Application

A responsive, high-performance community directory and hierarchy web application for the **Nadoda Rajput Community**. Built using **React 19**, **Vite**, and **Lucide Icons**.

---

## 🌟 Features

- **Intuitive Hierarchy View (વંશાવળી)**:
  - **Level 1**: Explore villages and browse families grouped by Atak with Kuldevi names and family counts.
  - **Level 2**: Browse family cards showing house numbers, head of household, address, and member counts.
  - **Level 3**: Complete family roster with crown badge for family head, quick contact, and member editing.
- **Directory & Fast Fuzzy Search (તમામ સભ્યો)**:
  - Instant bilingual search across Gujarati & English names, phone numbers, ataks, occupations, and cities.
  - Quick filter buttons: Gender (Male / Female), Family Heads only, Marital status, and Ataks.
  - 1-click direct Phone call and WhatsApp links.
  - "કુટુંબ જુઓ" (View Family) jump-button navigating straight to the family's Level 3 hierarchy view.
- **My Family View (મારું કુટુંબ)**:
  - Self-service portal for logged-in members to view and update their own family information.
- **Demographics & Statistics (આંકડા)**:
  - Village Stats Summary Bar: Total Houses, Population, Male, Female, Sex Ratio, and Average Family Size.
  - Interactive distribution charts for Age brackets (0-18, 19-35, 36-60, 60+), Top Occupations, Work Locations, and Marital Status.
  - Recalculate database statistics button.
- **Admin Portal (વહીવટ)**:
  - Super Admin & Village Admin panels.
  - User Management: create login accounts for verified members, assign roles (`super_admin`, `village_admin`, `member`), set/reset passwords.
  - Active Session Monitoring: see live sessions, browser, device, and 1-click remote session termination.
- **Comprehensive Profile Modal**:
  - Full details modal displaying personal, contact, education, career, matrimonial, and directory verification status.

---

## 🛠️ Tech Stack

- **Framework**: React 19
- **Bundler**: Vite
- **Icons**: Lucide React (`lucide-react`)
- **Styling**: Vanilla CSS (Dark theme with custom color tokens and glassmorphism)
- **Deployment**: GitHub Pages (`gh-pages`)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Backend API URL (Optional)
By default, the frontend connects to the production Render backend (`https://nadoda-connect-backend.onrender.com/api`).
To point to your local backend server, you can set the API URL in your code or configure the local proxy in `vite.config.js`:
```
http://localhost:5000/api
```

### 3. Run Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000` (or the port indicated in your terminal).

### 4. Build for Production
```bash
npm run build
```
Creates an optimized production bundle in the `dist/` directory.

### 5. Deploy to GitHub Pages
```bash
npm run deploy
```
Automatically builds and publishes the production bundle to the `gh-pages` branch.

---

## 📁 Project Structure

```
frontend/
├── index.html               # Main HTML entry file
├── package.json             # Project dependencies and build scripts
├── vite.config.js           # Vite configuration
└── src/
    ├── App.jsx              # Main application router and state coordinator
    ├── index.css            # Design tokens, dark theme styles, animations
    ├── main.jsx             # React DOM root entry
    └── components/
        ├── AdminPortal.jsx          # Admin tools & active session monitor
        ├── ChangePasswordModal.jsx  # Password change dialog
        ├── DemographicsView.jsx     # Charts & statistical breakdown
        ├── FamilyFormModal.jsx      # Add/edit family modal
        ├── Header.jsx               # Navigation bar, village selector & profile popup
        ├── HierarchyView.jsx        # 3-Level hierarchy tree navigation
        ├── LoginScreen.jsx          # Mobile & password login screen
        ├── MemberDetailModal.jsx    # Full member profile modal
        ├── MemberFormModal.jsx      # Add/edit member modal
        ├── MembersDirectory.jsx     # Searchable members directory
        ├── MoveMembersModal.jsx     # Transfer members between families
        ├── MyFamilyView.jsx         # Logged-in user's family view
        ├── NotFoundScreen.jsx       # 404 fallback screen
        └── VillageStatsBar.jsx      # Village overview summary metrics bar
```
