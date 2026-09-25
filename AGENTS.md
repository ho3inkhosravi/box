# 🤖 AI HANDOVER & SYSTEM INSTRUCTIONS MANUAL (AGENTS.md)

> **MANDATORY DIRECTIVE FOR ALL FUTURE AI AGENTS (CODING ASSISTANTS):**
> Read this entire document BEFORE performing any refactoring, adding features, modifying styling, or touching the Supabase database schema. This file contains the complete project lineage, user persona, strict architectural boundaries, and historical changelogs.
>
> **⚠️ RULE NUMBER 1 FOR AI AGENTS:** Whenever you make ANY change to this codebase, you **MUST** update the `📝 CHANGELOG & WORK HISTORY` section at the bottom of this file before finishing your turn. Keep this file updated forever.

---

## 👤 1. USER PERSONA & WORKPLACE CONTEXT

* **Owner / Domain:** **Manufacturer of Silent Boxes for Crypto Mining Rigs (سازنده سایلنت باکس دستگاه‌های ماینر رمز ارز)**.
* **CRITICAL MANDATE - NOT A PROGRAMMER:** The owner is **NOT a software engineer or programmer**. He is an industrial manufacturer building acoustic enclosures (Silent Boxes) for cryptocurrency miners. All future AI coding assistants **MUST STRICTLY adhere to extreme simplicity**:
  1. **Zero CLI / Zero Terminal Commands:** Never ask the user to open terminal, type commands, install global packages, or edit environment variables.
  2. **1-Click Windows Automation:** All execution, installation, or build workflows MUST be packaged into simple double-click Windows Batch scripts (`.bat` files like `RUN_APP.bat` and `START_ON_WINDOWS.bat`).
  3. **Auto-Recovery & Clarity:** If something can fail (missing Node.js, CMD pause, Supabase timeout), the app or batch script must handle it automatically or show a clear, humble Persian explanation.
* **Language:** Native Persian (Farsi). All user-facing text, guides, tables, notifications, and summaries **MUST** be strictly in Persian with standard RTL layout (`dir="rtl"`).
* **Domain Vocabulary & Mapping:**
  * `box_models`: Miner Silent Box Models (مدل‌های باکس سایلنت ماینر بر اساس ظرفیت تعداد دستگاه یا ابعاد).
  * `materials`: Raw Materials & Components (متریال‌ها: فن حلزونی، فوم شانه تخم‌مرغی عایق صدا، کنتاکتور، فیوز، ورق فلزی یا MDF، سنسور دما، پریز و...).
  * `bom_items`: Bill of Materials (فرمول ساخت هر باکس سایلنت ماینر).
* **Background:** The user previously built and maintained an **Android application (written in Kotlin/Jetpack Compose)** that managed their Box Models, Raw Materials, and BOM connected to a **Supabase Cloud Database**.
* **Goal:** Rewrite the Android project as a **modern Full-Stack Web Application (TypeScript + React + Tailwind CSS)** running locally on Windows PC (`http://localhost:3000`) that completely replaces the Android app while retaining **100% Supabase database compatibility**.

---

## 🏛️ 2. CORE ARCHITECTURE & SYSTEM BOUNDARIES

### A. Tech Stack
* **Frontend:** React 18 (TypeScript), Vite, Tailwind CSS (loaded via `@import "tailwindcss";` in `src/index.css`).
* **Icons:** `lucide-react` (Strict requirement: DO NOT use custom SVGs or generic emoji replacements).
* **Database / Backend:** Supabase (PostgreSQL). Handled via REST API call wrapper in `src/services/supabase.ts`.
* **Desktop Windows Integration:** Batch runners (`RUN_APP.bat` and `START_ON_WINDOWS.bat`) automate `where node`, `npm install`, and `npm run dev` for Windows CMD.

### B. Structural Mandates (DO NOT VIOLATE)
1. **Single-Page Application (SPA) Layout:** The app is structured as a unified dashboard with clean top navigation tabs:
   * `models`: Box Model Manager (مدیریت مدل‌های باکس سایلنت).
   * `materials`: Raw Material Manager (متریال خام و قیمت‌گذاری).
   * `bom`: BOM Formula Calculator (فرمول ساخت و محاسبه مصرف).
   * `database`: Universal Table Inspector (مشاهده کل داده‌ها با قابلیت حذف).
   * `guide`: Interactive Windows Execution & Supabase Connection Guide (راهنمای گام به گام).
2. **Offline-First & Hybrid Fallback:** If Supabase connection fails or keys are missing (`isConnected === false`), the app **MUST NOT CRASH**. It must gracefully fall back to local in-memory/localStorage mock data and show an informational warning banner.
3. **No Unsolicited Complexity:** Do not add backend Express servers, secondary SQL ORMs (Drizzle/Prisma), or unsolicited AI playgrounds unless explicitly requested by the user. Keep it industrial, fast, and responsive.

---

## 🔌 3. SUPABASE DATABASE SCHEMA & KOTLIN PARITY

The old Kotlin app (`SupabaseClient.kt`) relied on 3 core tables. The TypeScript service (`src/services/supabase.ts`) maps directly to these tables:

1. **`box_models`**
   * `id` (text / uuid, Primary Key)
   * `capacity` (numeric / integer - e.g., 12, 24, 36 Liters or capacity units)
   * `panel_type` (text - e.g., 'تک فاز ساده آنالوگ', 'کنترل فاز هوشمند')

2. **`materials`**
   * `id` (text / uuid, Primary Key)
   * `name` (text - Persian material name like فن حلزونی، فوم عایق صوتی)
   * `unit_price` (numeric - price in Tomans/Rials)

3. **`bom_items`**
   * `id` (text / uuid, Primary Key)
   * `model_id` (text, Foreign Key -> `box_models.id`)
   * `material_id` (text, Foreign Key -> `materials.id`)
   * `quantity` (numeric - consumption rate per box)

*Note:* When querying `bom_items`, the service performs relational join `select('*, box_models(*), materials(*)')`.

---

## 🖥️ 4. WINDOWS EXECUTION & SUPABASE DEBUGGING MANUAL

### A. Windows CMD Quick-Close / `vite not found`
* **Root Cause:** Missing `node_modules` or CMD closing on error.
* **Our Engineered Solution:** Both `RUN_APP.bat` and `START_ON_WINDOWS.bat` use `cd /d "%~dp0"`, check `where node`, automatically execute `npm install`, launch `http://localhost:3000` in browser, and **end with `pause`** so the console stays open if any error occurs.

### B. The Windows CMD "QuickEdit Freeze" Trap (Captured in User Screenshot)
* **User Symptom:** User runs `.bat` file. CMD opens, starts `npm install` or printing logs, then suddenly freezes forever. Look at the CMD title bar: it says **`Select ...`** (e.g. `Select npm install`).
* **Root Cause:** In Windows CMD, clicking inside the terminal window highlights text and activates **QuickEdit Mode**, which **completely suspends process execution** until the user presses `Enter` or right-clicks.
* **Our Engineered Solution:** We added a bold Persian warning at the very top of `RUN_APP.bat` and `START_ON_WINDOWS.bat` instructing the user: *"اگر روی صفحه سیاه کلیک کردید و برنامه ایستاد، یکبار دکمه Enter کیبورد را بزنید تا ادامه دهد!"* Furthermore, the script explicitly outputs `[چک کردن پوشه کتابخانه‌ها: موجود است -> عبور سریع]` so users verify that subsequent startups skip re-installation.

### C. Why does the app say «عدم دسترسی به سرور Supabase (آفلاین)»?
* **Root Cause:** The default API key hardcoded in `src/services/supabase.ts` (`DEFAULT_CONFIG`) is just a mock test string (`sb_secret_...`), which Supabase rejects as unauthorized (`401`).
* **How the user fixes this in 10 seconds:**
  1. Open the app (`http://localhost:3000`).
  2. Click the **«تنظیمات اتصال»** button in the top left corner.
  3. Paste the real **Supabase Project URL** (`https://xxxx.supabase.co`) and real **public / anon Key** (which starts with `eyJ...`) from Supabase Dashboard -> Project Settings -> API.
  4. Click Save. The credentials are saved to browser `localStorage` (`supabase_config_web`) and the app connects instantly to live cloud data.

---

## 📝 5. CHANGELOG & WORK HISTORY (KEEP FOREVER UPDATED)

### [Phase 1: Kotlin to React Rewrite] - 2026-06-25
* **Done by:** Antigravity AI Coding Agent.
* **Actions:**
  * Analyzed old Android archive (`SupabaseClient.kt`, `PanelModel.kt`, etc.).
  * Created complete TypeScript architecture (`App.tsx`, `types.ts`, `services/supabase.ts`).
  * Built dark industrial UI (Slate + Amber + Indigo theme) with RTL support.

### [Phase 2: Universal Table Inspector & Batch BOM Editing] - 2026-06-25
* **Done by:** Antigravity AI Coding Agent.
* **Actions:**
  * Created `DatabaseViewer.tsx` allowing the user to view all Supabase rows in unified tables and delete items.
  * Added Batch Consumption Formula Editor (`BomManager.tsx`) allowing simultaneous consumption updates across all panels of a specific capacity.

### [Phase 3: Windows Guide Tab, 1-Click Automation & Handover Manual] - 2026-06-26
* **Done by:** Antigravity AI Coding Agent.
* **Actions:**
  * Created dedicated `WindowsGuide.tsx` tab (`guide`) explaining 1-click Windows PC execution and Supabase API key acquisition.
  * Created `RUN_APP.bat` and `START_ON_WINDOWS.bat` with automated `npm install` and auto-browser launch.
  * Created permanent handover file (`AGENTS.md`).

### [Phase 4: Domain Alignment (Miner Silent Box) & QuickEdit Trap Fix] - 2026-06-26
* **Done by:** Antigravity AI Coding Agent (Current Session).
* **Actions:**
  * **Major Persona Alignment:** Corrected project domain from generic electrical panels to **Silent Boxes for Crypto Mining Rigs (سایلنت باکس دستگاه‌های ماینر)**.
  * **Analyzed User Screenshot:** Diagnosed process freeze caused by Windows CMD QuickEdit mode selection (`Select npm install` in title bar).
  * Refined `RUN_APP.bat` and `START_ON_WINDOWS.bat` with explicit QuickEdit escape guides and visible `[node_modules check -> SKIP]` logs.
  * Updated `WindowsGuide.tsx` and UI texts to reflect Miner Silent Box production management.

### [Phase 5: Live Supabase Cloud Connection & Credentials Configuration] - 2026-06-26
* **Done by:** Antigravity AI Coding Agent (Current Session).
* **Actions:**
  * **Supabase Credentials Injection:** Configured `src/services/supabase.ts` with the user's real Supabase Project REST endpoint (`https://vuzjtxtzhkgvfqufywcq.supabase.co/rest/v1/`) and authenticated `anon` JWT API Key.
  * **Automatic Config Upgrade:** Updated `getConfig()` logic in `supabase.ts` to automatically detect and replace legacy mock keys (`sb_publishable_...` or `sb_secret_...`) in browser `localStorage` with the live cloud credentials.
  * **Database Verification:** Verified zero-touch connectivity to live Cloud PostgreSQL tables (`box_models`, `materials`, `bom_items`).

### [Phase 6: Single Windows Runner Consolidation & Batch Parsing Crash Fix] - 2026-06-26
* **Done by:** Antigravity AI Coding Agent (Current Session).
* **Actions:**
  * **Consolidated Batch Runners:** Removed `RUN_APP.bat` completely to eliminate user confusion. Retained solely `START_ON_WINDOWS.bat` as the single execution entry point.
  * **Batch Trap Elimination:** Rewrote `START_ON_WINDOWS.bat` using explicit `goto` labels instead of parenthesized blocks `(...)` to prevent CMD parse-time variable expansion crashes when checking `%errorlevel%` after `npm install`.
  * **Explicit Pause Prompts:** Ensured console windows remain open (`pause` without `>nul`) upon any failure so users can read diagnostic messages in Persian.

### [Phase 7: Pagination, Advanced UI, and Terminology Corrections] - 2026-06-26
* **Done by:** Antigravity AI Coding Agent (Current Session).
* **Actions:**
  * **Removed 1000-Record Limit:** Refactored Supabase fetch methods (`fetchBomItems`, `fetchBoxModels`, `fetchMaterials`) in `src/services/supabase.ts` to use a `while` loop and pagination (`Range: 0-999`, etc.), eliminating the hardcoded 1000 limit.
  * **Unified Grouped BOM View:** Redesigned the third tab inside `DatabaseViewer.tsx` into a "Pricing & BOM Report" grouped by Box Model, showing total price and an inline edit capability for material consumption.
  * **Strict Confirmation Dialogs:** Added `window.confirm` dialogues (with fully Persian descriptive messages) across all database mutating handlers in `App.tsx` and `DatabaseViewer.tsx` before allowing additions, modifications, or deletions.
  * **Terminology Fix (Liters -> Miner Capacity):** Replaced all erroneous mentions of "لیتر" or "لیتری" (Liters) with "دستگاه ماینر" or "ظرفیت ماینر" (Miner Capacity) across UI elements and backend alerts.

### [Phase 8: Interactive BOM Grouping & Master Material Editor] - 2026-06-26
* **Done by:** Antigravity AI Coding Agent (Current Session).
* **Actions:**
  * **Nested Accordion Architecture:** Overhauled the BOM View table to use a collapsible tree structure: `Capacity -> Box Model -> Materials`.
  * **Zero-Usage Material Toggle:** Added a dynamic checkbox allowing users to view and add materials that previously had `0` consumption into the BOM formula.
  * **Inline Master Editing:** Users can now directly edit, add, or delete the consumption quantity of any material inside the nested Box Model view without needing to leave the reporting screen.

### [Phase 9: 3D Smart Cabinet Calculations Tool Integration] - 2026-06-26
* **Done by:** Antigravity AI Coding Agent.
* **Actions:**
  * **Three.js Integration:** Installed `three` and implemented a fully functional 3D Cabinet Viewer.
  * **CabinetCalculator Component:** Migrated the legacy HTML/VanillaJS Smart Cabinet App into a modern React Component (`CabinetCalculator.tsx`) utilizing `three.js` directly within a `useEffect` rendering loop to guarantee 1:1 functionality matching.
  * **Dynamic Layout Fixes:** Adjusted the global `App.tsx` container padding exclusively for the cabinet tab to allow full-width canvas rendering without breaking the dashboard layout. Fixed flex-height collapse bug causing 0x0 WebGL canvas rendering.
  * **Print Views:** Refactored the calculation lists to support Tailwind-native print utilities (`print:hidden`, `print:block`) for seamless physical printing.

### [Phase 10: Dark Industrial UI Overhaul for 3D Viewer] - 2026-06-26
* **Done by:** Antigravity AI Coding Agent (Current Session).
* **Actions:**
  * **Dark Theme Synchronization:** Repainted the 3D canvas and `CabinetCalculator.tsx` UI to fully integrate with the app's `slate-950` dark mode.
  * **Mesh Materials & Lighting:** Upgraded from `MeshPhongMaterial` to realistic `MeshStandardMaterial` with tweaked roughness and metalness. Replaced single lighting with a multi-directional ambient + point lighting setup.
  * **Wireframe Improvements:** Configured translucent slate wireframes on the 3D meshes for higher visibility.
  * **Print-Specific Styling:** Enforced stark white background and distinct text colors exclusively during print mode using Tailwind `print:` modifiers, guaranteeing that the dark mode UI does not consume printer ink.

### [Phase 11: 3D Visibility & Full-Screen Layout Fixes] - 2026-06-26
* **Done by:** Antigravity AI Coding Agent (Current Session).
* **Actions:**
  * **Material Overhaul:** Reverted to `MeshBasicMaterial` after discovering `MeshPhongMaterial` and `MeshStandardMaterial` failed to render visibly on dark mode without a complex environment map/lighting rig in newer ThreeJS versions. `MeshBasicMaterial` combined with `EdgesGeometry` creates a perfect CAD-like industrial wireframe look that is guaranteed to render brightly regardless of lighting.
  * **Full-Screen Canvas Expansion:** Removed the top Header navigation and all dashboard padding when the user switches to the Cabinet Tab, allowing the 3D canvas to truly be `100vh` ("گسترده") with no layout interference. Added a dedicated "بازگشت به پنل" (Back) button inside the 3D scene to escape.

### [Phase 12: Zero-Height Canvas Collision Fix] - 2026-06-26
* **Done by:** Antigravity AI Coding Agent (Current Session).
* **Actions:**
  * **Absolute Viewport Override:** Completely detached the `<CabinetCalculator>` component from the dashboard's flexbox DOM tree by applying `fixed inset-0 z-50`. This ensures it ignores any collapsed or zero-height parent containers in `App.tsx` and forcibly renders at exactly 100% of the screen width and height.
  * **Window Dimension Fallbacks:** Added `window.innerWidth` and `window.innerHeight` fallbacks to the Three.js camera and renderer initializations to prevent `0x0` canvas dimensions if `clientWidth` isn't immediately resolvable by React at mount time.

### [Phase 13: 3D Engine Monolithic Rewrite & Strict Mode Collision Fix] - 2026-06-26
* **Done by:** Antigravity AI Coding Agent (Current Session).
* **Actions:**
  * **React Strict Mode Bug Triage:** Diagnosed a severe race condition where React 18 Strict Mode's double-mount lifecycle caused the initial ThreeJS canvas to be disposed, while the asynchronous mesh generation `useEffect` injected objects into a detached, non-rendered Scene, resulting in a completely black canvas for the user.
  * **Monolithic Engine Initialization:** Rewrote the entire ThreeJS setup in `CabinetCalculator.tsx`. Removed all disconnected `useRef` states and merged scene initialization, camera configuration, lighting, material generation, and raycasting into a single, synchronous, monolithic `useEffect` block.
  * **Foolproof Reconstruction:** The 3D engine is now completely destroyed and rebuilt synchronously from scratch whenever the `width` or `mode` changes. This ensures absolute DOM attachment and camera tracking without state desynchronization.
  * **Debug Helpers:** Added `GridHelper` and `AxesHelper` to the scene floor to permanently guarantee the user has spatial context and orientation, even if a cabinet material completely fails to load.

### [Phase 14: 3D Visualization Refinements & Ghost Material] - 2026-06-26
* **Done by:** Antigravity AI Coding Agent (Current Session).
* **Actions:**
  * **Debugging Helpers Removed:** Removed `GridHelper` and `AxesHelper` from the 3D scene to keep the visualization clean and professional per user request.
  * **Ghost / Glass Material Simulation:** Updated `MeshBasicMaterial` opacity to `0.85` (and doors to `0.3`) while increasing wireframe opacity to `0.8`. This ensures that users can see through the solid MDF sheets to clearly understand inner structures, dividers, and which panel is layered on top/inside another.

### [Phase 15: 2D Bin Packing & Domain Specific Restyling] - 2026-06-26
* **Done by:** Antigravity AI Coding Agent.
* **Actions:**
  * **Domain Correction:** Renamed all structural references from "Cabinet" to "Miner Box" per the user's manufacturing domain request.
  * **Color Differentiation:** Assigned unique vibrant colors (blue, emerald, amber, pink, violet, cyan) to different functional panels (Doors, Backs, Sides, Dividers) inside the 3D scene for instant visual identification. Set body opacity to 0.5 and door opacity to 0.3 for perfect structural transparency and wireframe overlap visibility.
  * **Unified Cut List:** Consolidated the separate top/bottom Box lists into a single, unified flattened materials list grouped by identical panels to streamline the physical CNC cutting workflow.
  * **Cut Master Integration:** Developed a bespoke 2D Bin Packing algorithm (`src/utils/binPacker.ts`) based on Guillotine splits with a 3mm saw kerf adjustment.
  * **Visual Maps:** Created a new interactive `CutMapViewer.tsx` overlay that dynamically places the required panels onto 360x180cm MDF sheets, automatically calculates waste percentage, and provides a print-ready visual nesting map.

  * **OptiCut PDF Styling:** Completely restyled the CutMaster layout to strictly mimic the exact layout, colors, tables, and spacing of the OptiCut 5.22e PDF requested by the user.
  * **Bin Packing Bug Fixes:** Fixed severe type coercion issues in `binPacker.ts` where floating point string dimensions caused `NaN` logic failures resulting in 15 empty MDF sheets. Fixed layout aspect-ratio for perfect 366x183 proportions.
  * **Offcuts Visualization:** Free space (Off-cuts) are now visibly mapped and calculated in grey, matching the structural style of the PDF, alongside global usage statistics.

### [Phase 16: Optimal Guillotine Bin Packing & CNC Kerf/Margin Specs] - 2026-06-26
* **Done by:** Antigravity AI Coding Agent (Current Session).
* **Actions:**
  * **Optimal Heuristics:** Rewrote the `binPacker.ts` Guillotine algorithm to use **Longest-Edge First** sorting combined with **Best Area Fit / Best Short Side Fit**. Changed the Guillotine split logic to strictly maximize the area of the largest free rectangle (MINAS strategy), ensuring that off-cuts (پرتی‌ها) remain as massive, contiguous, and reusable blocks as possible.
  * **CNC Specs:** Increased blade kerf (خوراک اره) to `4mm` (`0.4cm`).
  * **Sheet Margin:** Implemented a strict 2cm edge trim (حاشیه ورق) on all 4 sides of the 366x183 MDF sheet. Usable area is now dynamically calculated as `362x179`. Added a visible red dashed safety zone in the UI to indicate the trimmed edges.

### [Phase 17: PVC Edge Banding Logic & Insulation Area Tracking] - 2026-06-26
* **Done by:** Antigravity AI Coding Agent (Current Session).
* **Actions:**
  * **Dynamic PVC Reassignment:** Fixed a critical physical-to-UI mapping bug where setting the internal box width smaller than its depth would invert the PVC edge banding instructions. The algorithm now strictly sorts final dimensions to guarantee that "طول" (Length) always receives the PVC count for the physically longest edge, and "عرض" (Width) receives the count for the shortest edge, regardless of base orientation.
  * **Sound Insulation Surface Tracking:** Implemented a real-time `Total Area (m²)` calculator across both the unified parts list and the OptiCut viewer. This calculates the exact net square meterage of all MDF pieces to allow the manufacturer to cut the exact required amount of Rockwool (پشم سنگ) acoustic insulation.

### [Phase 18: Cabinet Dimensions & PVC Manufacturing Rules] - 2026-06-27
* **Done by:** Antigravity AI Coding Agent (Current Session).
* **Actions:**
  * **Lower Door & Filler Adjustment:** Corrected the vertical clearance of the lower box by increasing the Front Door (`HR`) height by `2cm` (to `29.2cm`) and simultaneously reducing the Bottom Fixed Panel (`RC`) height by `2cm` (to `19.0cm`), preserving the total structural span.
  * **Component Nomenclature:** Cleaned up overlapping component designations. `RH/HR` renamed to `HR`, `HC/RC` renamed to `RC`, and `CD/DC` renamed to `DC` for streamlined cutting lists.
  * **BOM Dynamic Grouping:** Upgraded the unified parts list engine to automatically detect and group identical panels. If any components share the exact same final Cut Length, Cut Width, and PVC requirements (such as matching Dividers `xy` and `NM`), they are now merged into a single list item with combined names and an incremented count, radically reducing cut list verbosity.
  * **Advanced PVC Edge Hiding Logic:** Reprogrammed the raw PVC layout assignments (`pL`, `pW`) across all panels based on strict cabinet assembly rules. Edges that butt against or rest upon the flat face of another board (e.g., Side panels `ABEK` resting on the lower box, or internal partitions `xy` sandwiched between roof and shelf) are mathematically stripped of their PVC edge-banding assignments (`0`), preventing wasted material and CNC machining time.

### [Phase 19: Strict PVC Edge Banding Rules & Lower Box Height Increase] - 2026-06-27
* **Done by:** Antigravity AI Coding Agent (Current Session).
* **Actions:**
  * **Strict PVC Application Logic:** Overruled the previous edge hiding logic. Re-implemented the strict manufacturing rule: *Any edge that does not sit flush or screw into another board MUST receive PVC edge banding.* 
  * **Exposed Edge Corrections:** Restored full PVC banding to the top and bottom of side walls (`ABEK`, `GHDC`) as they become exposed when the upper and lower boxes are delivered to the customer separately. Fully banded the internal dividers (`xy`, `NM`) to prevent raw MDF edges from being visible when doors are opened.
  * **Lower Box Height Extension:** Increased the overall height of the Lower Box side panels (`GHDC`) by `2cm` (from `45.0cm` to `47.0cm`). 
  * **Lower Box Front Panel Compensation:** Restored the `2cm` previously deducted from the bottom fixed panel (`RC`), increasing its height back to `21.0cm`. The lower front door (`HR`) remains intact at `29.2cm`. Recalculated all internal 3D Z/Y placements (`GH`, `NM`, `RC`, `HR`) to properly match the newly extended 50.2cm total lower box structure.

### [Phase 20: Strict PVC Attachment Rules Reverted] - 2026-06-27
* **Done by:** Antigravity AI Coding Agent (Current Session).
* **Actions:**
  * **PVC Edge Logic Correction:** Reverted the over-application of PVC from Phase 19. Applied the strict physical attachment rule provided by the manufacturer: "Any edge that sits flush against or is screwed to another board MUST NOT receive PVC."
  * **Dividers (`xy`, `NM`):** Stripped all PVC (`pL: 0, pW: 0`) as they are completely enclosed and attached to the roof, floor, or shelf.
  * **Upper Sides (`ABEK`):** Removed PVC from the top edge as it is screwed to the roof. Retained PVC on the bottom edge (which is exposed when separated from the lower box) and the front edge (`pL: 1, pW: 1`).
  * **Lower Sides (`GHDC`):** Removed PVC from both top and bottom edges, as they sit directly between and are screwed to the lower roof (`GH`) and lower floor (`CD`). Front and back edges remain exposed (`pL: 0, pW: 2`).
  * **Height Check:** Verified that the +2cm height increase requested for the lower box (`GHDC` = 47.0cm, `RC` = 21.0cm) was already accurately completed in the prior phase.

### [Phase 21: 3D Inner Transparency, Point Labels, & Vertical Silencer] - 2026-06-27
* **Done by:** Antigravity AI Coding Agent (Current Session).
* **Actions:**
  * **Free Edge PVC Correction:** Rewrote PVC logic for internal dividers (`xy` and `NM`). Because their bottom edges are completely free-hanging and not screwed to any other board, they now correctly receive PVC edge banding (`pL: 1, pW: 0`).
  * **Interactive X-Ray Toggles:** Added UI checkboxes for "مخفی کردن درب‌ها" (Hide Doors) and "مخفی کردن دیواره راست" (Hide Right Wall). This completely removes the specific meshes from the 3D raycaster logic, finally allowing the user to click on and inspect internal parts.
  * **New Vertical Silencer (UZ):** Added a new vertical sound-dampening board ("صداگیر عمودی پشت") positioned directly on the free rear edge (Z-axis) of the shelf (`yz`). The board height is mathematically locked to perfectly maintain an 18cm gap between its top edge and the roof (`ab`).
  * **CSS2D Corner Labels:** Engineered a 3D-to-2D projection mapping system in the render loop. Floating labels (A, B, E, K, X, Y, U, Z) now dynamically track the 3D coordinates of the right wall, inner dividers, and the new silencer, maintaining perfect perspective as the user rotates the camera.

### [Phase 22: Point Naming Alignment & Lower Box PVC Fix] - 2026-06-27
* **Done by:** Antigravity AI Coding Agent (Current Session).
* **Actions:**
  * **Lower Box DC/CD Panel PVC Fix:** The front edge of the lower floor panel (`DC` / `CD`) is entirely covered by the fixed front-bottom board (`RC` / `HC`). Since `RC` is fixed and not a door, it never exposes the inner edge of `DC`. Reduced `pL` of `DC` from `2` to `1` (only the back edge gets PVC now).
  * **Dynamic 3D Labels for Both Boxes:** Restructured the CSS2D coordinate label mapping system to conditionally swap the displayed intersection points depending on which box is selected.
    * **Upper Box (`upper`):** Now properly tags points `A`, `B`, `E`, `K` for sides, `x`, `y` for vertical dividers, `U`, `Z` for silencers, and `F` for front framing.
    * **Lower Box (`lower`):** Dynamically injects labels `G`, `H`, `D`, `C` for sides, `N`, `M` for dividers, and `R` for front fixed panels, completely matching the user's explicit part name intersection requests.

### [Phase 23: 3D Inner Transparency & Mathematical Non-Intersection] - 2026-06-27
* **Done by:** Antigravity AI Coding Agent (Current Session).
* **Actions:**
  * **Shelf (yz) and Divider (xy) Intersection Fix:** Mathematically corrected the Z-axis depth of the horizontal shelf (`yz`). Its center Z is now exactly `29.2` (spanning Z: 9.2 to 49.2), which makes its front edge butt perfectly against the back face of the vertical divider (`xy` at Z=49.2) without any overlapping or clipping, satisfying the user's requirement.
  * **Silencer (UZ) Re-anchoring:** Adjusted the vertical silencer (`UZ`) height to strictly 10.4cm and anchored its back Z coordinate exactly to the back edge of `yz` (Z: 9.2), ensuring zero intersections while maintaining the strict 18cm distance to the roof (`AB`).
  * **Precise Corner Naming:** Rewrote the 3D label generator. The labels `A`, `B`, `E`, `K`, `G`, `H`, `D`, `C` now mathematically track the exact 8 bounding corners of the side walls as dictated by the naming convention of the panels themselves, satisfying the user's logic requirements for both upper and lower boxes.
  * **Inner Selection (Click-Through raycaster):** Implemented a 3D raycast cycler! When the user clicks repeatedly on the same overlapping area in the 3D scene, the selection dynamically cycles through all intersecting panels (e.g. Roof -> Shelf -> Floor). Additionally, clicking any row in the "ابعاد و برش" List now instantly selects and highlights the respective panel inside the 3D scene.
  * **Lower Box (DC/RC) Edge Banding Verification:** Re-verified that the front edge of `DC` (which connects to `RC`) has its PVC successfully removed (`pL` reduced to 1 for the back exposed edge).

### [Phase 24: Memory Feature for Box Capacities & PVC Bug Fix] - 2026-06-28
* **Done by:** Antigravity AI Coding Agent (Current Session).
* **Actions:**
  * **Memory Storage System:** Added a custom preset save system to the "طول داخلی باکس" section, allowing the manufacturer to save frequently used lengths with custom names (e.g., "۲۴ دستگاه") utilizing `localStorage` to keep the memory across reloads.
  * **Interactive Preset List:** Built a sleek side panel UI where saved lengths can be applied instantly with one click, or deleted when obsolete.
  * **PVC Overlay Display Fix:** Repaired a variable typo (`pvcText` vs `pvc`) in the 3D model raycaster handler that prevented the PVC status from displaying properly inside the hover info card when clicking on a panel in the 3D viewer.

### [Phase 25: AI Label Scanner & Optical Recognition Integration] - 2026-06-28
* **Done by:** Antigravity AI Coding Agent (Current Session).
* **Actions:**
  * **AI Label Recognition Subsystem:** Built `AILabelScanner.tsx` allowing the user to take a photo of a physical CNC label (such as those generated by OptiCut) and instantly match it to the logical part name in the cut list.
  * **Robust API Failover System:** Implemented a full API management panel where the user can store multiple API keys (Google AI Studio, OpenRouter) and define exact target models (e.g. `gemini-1.5-flash`, `anthropic/claude-3.5-sonnet`). The system automatically cascades through the keys sequentially if one fails or hits a rate limit.
  * **Automatic BOM Sync:** Connected the `CabinetCalculator` to the main `App.tsx` state to automatically stream the currently generated cut list directly into the AI scanner's context window, eliminating the need to manually copy-paste the reference cut list.

### [Phase 26: React State Rendering Crash Fix] - 2026-06-28
* **Done by:** Antigravity AI Coding Agent (Current Session).
* **Actions:**
  * **Render Crash Fix:** Fixed a critical React warning and application crash (`Cannot update a component while rendering a different component`) caused by calling the parent `App` state setter (`onCutListUpdate`) directly inside the `useMemo` render phase of `CabinetCalculator`. The synchronization now correctly fires within a dedicated `useEffect` hook.
  * **TypeScript Enhancements:** Added proper interface types and fixed generic inheritance errors on the `ErrorBoundary` wrapper to ensure safe recovery and strict typing across the app.

### [Phase 27: PDF Cut List Upload Support] - 2026-06-28
* **Done by:** Antigravity AI Coding Agent.
* **Actions:**
  * **PDF Extraction Integration:** Installed `pdfjs-dist` to enable client-side parsing of PDF files.
  * **File Upload UI:** Added a dedicated PDF upload button in the "AI Label Scanner" tab above the Cut List textarea.
  * **Automatic OptiCut Parsing:** Users can now select an OptiCut PDF report (or any software PDF), and the app will instantly extract all text and dimension data and populate the reference list for the AI Scanner.

### [Phase 28: PDF Worker URL Fix] - 2026-06-28
* **Done by:** Antigravity AI Coding Agent.
* **Actions:**
  * **PDF.js Worker Crash Fix:** Changed the PDF.js Web Worker URL strategy to use local Vite `?url` imports instead of relying on external CDNs which caused cross-origin and 404 fetching errors during the dynamic module import.

### [Phase 29: AI Scanner Connection Testing & Dynamic Model Fetching] - 2026-06-28
* **Done by:** Antigravity AI Coding Agent (Current Session).
* **Actions:**
  * **Interactive API Testing:** Added a "بررسی اتصال و دریافت مدل‌ها" (Check Connection & Fetch Models) button to each API configuration card in the Scanner settings.
  * **Dynamic Model Dropdown:** The app now queries the respective endpoints (Google AI Studio or OpenRouter) to fetch the live list of available AI models, allowing the user to select them from a dropdown instead of typing them manually.
  * **Connection Status UI:** Added visual indicators (green checkmark for success, red alert for error) and explicit error message rendering to help the user diagnose bad API keys or network restrictions.

### [Phase 30: AI-Powered Cut List Extraction & True API Verification] - 2026-06-28
* **Done by:** Antigravity AI Coding Agent.
* **Actions:**
  * **AI Vision Document Extraction:** Completely overhauled the PDF extraction feature. Instead of relying on unreliable local text parsing, uploading a PDF or Image now converts the document into a visual representation and sends it directly to the active Vision AI model with a specialized prompt to accurately extract and format the cut list.
  * **True API Authentication Check:** Fixed a bug where OpenRouter API keys would always report as successful. The test function now hits the explicit `/auth/key` endpoint first to guarantee the key is genuinely authorized before proceeding.
  * **Dynamic Model Dropdowns:** Reprogrammed the API settings so that upon successful connection verification, it dynamically fetches the live list of models from the provider (Gemini or OpenRouter) and converts the text input into an easy-to-use Dropdown select menu, preventing typos and manual entry errors.

### [Phase 31: Advanced API Error Tracking & Connection Naming] - 2026-06-28
* **Done by:** Antigravity AI Coding Agent (Current Session).
* **Actions:**
  * **Explicit Google API Errors:** Refactored the Gemini connection test to correctly parse and extract Google's JSON error payload (e.g., location restrictions or invalid key errors), displaying the real cause of failure to the user instead of a generic HTTP error.
  * **Connection Naming Support:** Introduced a new "نام اتصال" (Connection Name) input field to the API settings, allowing the user to organize and label their keys (e.g., "My Default Key", "Backup OpenRouter").
  * **Provider Traceability:** The AI Label Scanner and PDF Extraction functions now track exactly which API configuration successfully fulfilled the request. Added UI indicators in the extraction and result areas that explicitly show the name and model of the connection that was used (e.g., "پردازش شده توسط: کلید اصلی من (gemini) - gemini-1.5-flash").

### [Phase 32: API Key URL Encoding & UI Refinement] - 2026-06-28
* **Done by:** Antigravity AI Coding Agent (Current Session).
* **Actions:**
  * **Gemini API Format Fix:** Added strict `.trim()` and `encodeURIComponent()` to the Google API Key string prior to passing it to the REST endpoint. This prevents 400 Bad Request errors caused by hidden whitespace or new token formats (like the `AQ.` prefix) which may contain special characters.
  * **Layout Refinements:** Reorganized the API Configuration cards to move the "Check Connection" button directly adjacent to the API Key input, preventing it from squishing the dropdown headers and making the flow much more intuitive.

### [Phase 33: Ultimate Gemini API Header Auth Fix] - 2026-06-28
* **Done by:** Antigravity AI Coding Agent (Current Session).
* **Actions:**
  * **x-goog-api-key Implementation:** Completely removed the URL query parameter `?key=` approach for all Google AI Studio (Gemini) API calls. We now inject the API key explicitly into the HTTP Headers using `x-goog-api-key`. This permanently resolves `HTTP 400: Request contains an invalid argument` errors caused by Google's newer API keys which include special characters (like `AQ.`) that break standard URL parameter parsing.
  * **Global Authorization:** Applied this robust header-auth fix to both the Connection Tester and the actual Image/PDF Content Generation pipelines.

---
*(End of AGENTS.md - Next AI Assistant: Please append your work below this line when your turn completes)*

### [Phase 20: Cut Map Multi-Sheet Optimization & Component Identification] - 2026-07-09
* **Done by:** Antigravity AI Coding Agent (Current Session).
* **Actions:**
  * **Box Source Identification:** Implemented strict separation of components based on their source (Upper Box vs. Lower Box) in the main cutting list table. Added a dedicated "بخش" column to explicitly indicate origin.
  * **Multi-Sheet Sequencing Layout:** Rewrote `CutMapViewer.tsx` to handle chained layout logic. When a user unchecks a part from Map 1, it automatically creates Map 2 with its own independent settings. This allows assigning different sizes of MDF to different subgroups of parts seamlessly.
  * **Custom Sheet Dimension Engine:** Added a UI block that allows the manufacturer to dynamically input custom sheet dimensions (طول و عرض دلخواه) and instantly append it to the sheet selection dropdown.

### [Phase 21: Cut Map Viewer UI/UX Tweaks] - 2026-07-09
* **Done by:** Antigravity AI Coding Agent (Current Session).
* **Actions:**
  * **Unchecked Items Visibility:** Refactored the array assignment state. Unchecking an item in Map 1 no longer deletes it from Map 1's list; it simply leaves it unchecked and simultaneously makes it available in Map 2. This prevents the list from collapsing unexpectedly and allows easy re-checking.
  * **Color Coding:** Applied two distinct colors to both the list text and the cut-map boxes: Blue for Upper Box parts (باکس بالا) and Emerald Green for Lower Box parts (باکس پایین) for rapid visual identification.
  * **Full Text Display:** Removed CSS truncation limits (`truncate max-w-[120px]`) from the side list to ensure long combined material names (e.g., "سقف باکس (AB)") are fully legible and wrap gracefully.

### [Phase 22: Transparency, Wireframes & PVC Visualization] - 2026-07-09
* **Done by:** Antigravity AI Coding Agent (Current Session).
* **Actions:**
  * **3D Transparency Boost:** Reduced the `MeshBasicMaterial` opacity for structural components from `0.5` to `0.25` (and doors from `0.3` to `0.15`), making the "glass/ghost" effect much more transparent per user request.
  * **Color-Coded Wireframes:** Upgraded the 3D `EdgesGeometry` to match the exact vibrant color of its parent mesh instead of a generic gray, drastically improving the distinctness and readability of overlapping parts in 3D.
  * **2D PVC Visualization:** Integrated a visual PVC edge tracker in the `CutMapViewer`. Rectangles on the cut map now dynamically display a thick **Red Border (3.5px)** precisely on the edges that require PVC banding (`pL` / `pW` logic mapped to screen orientation via Guillotine rotation).
  * **Cut Map Color Grouping:** Parts placed on the MDF sheet are now lightly shaded (Blue for Upper Box, Emerald for Lower Box) for instant visual differentiation on the factory floor, with a responsive legend added to the UI.

### [Phase 23: 3D PVC Edge Visualization] - 2026-07-09
* **Done by:** Antigravity AI Coding Agent (Current Session).
* **Actions:**
  * **3D Assembly PVC Planes:** Extracted the precise PVC edge orientation logic (`pL`, `pW`) for every single panel and translated it into 3D space vectors (`+x, -x, +y, -y, +z, -z`).
  * **Visual Highlighting:** The 3D engine now dynamically generates bright red, semi-transparent planes directly on the exposed thickness edges of the MDF sheets where PVC banding is required. This allows the manufacturer to rotate the 3D model and immediately know which edge needs to be banded before assembly.

### [Phase 24: Gemini API Payload Fix] - 2026-07-09
* **Done by:** Antigravity AI Coding Agent (Current Session).
* **Actions:**
  * **API Parameter Correction:** Fixed a critical bug in `AILabelScanner.tsx` where the Gemini vision API requests were failing because the JSON payload used snake_case (`inline_data`, `mime_type`) instead of the required camelCase format (`inlineData`, `mimeType`) expected by the Google Gen AI REST API endpoint. 
  * Google AI Studio API connections will now successfully process images and return parts lists exactly like the OpenRouter integration.

### [Phase 25: Unlocking Full Gemini Model Capabilities] - 2026-07-09
* **Done by:** Antigravity AI Coding Agent (Current Session).
* **Actions:**
  * **Model Filter Expansion:** Updated the Google AI Studio model fetching logic in `AILabelScanner.tsx` to include all models containing `gemini` in their name. This removes the hardcoded limitation that only allowed `gemini-1.5` and `gemini-2.0` models, immediately unlocking access to newer and more powerful models like `gemini-2.5-pro`, `gemini-3.1-pro-preview`, `gemini-3.5-flash`, and their respective lite/vision variants.

### [Phase 26: Deprecating Legacy Android Codebase] - 2026-07-09
* **Done by:** Antigravity AI Coding Agent (Current Session).
* **Actions:**
  * **Codebase Cleanup:** Completely deleted the legacy Android project directories (`app`, `اپ اندروید`) and their associated build configurations (`build.gradle.kts`, `gradle.properties`, `settings.gradle.kts`).
  * The repository is now strictly a standalone, purely web-based application (TypeScript + React + Vite).

### [Phase 27: Web Migration, Type Safety & Build Cleanup] - 2026-09-25
* **Done by:** Antigravity AI Coding Agent (Current Session).
* **Actions:**
  * **GitHub Import Migration Triage:** Executed Web migration per `github-import-migration` skill specifications.
  * **Removed Stale Files:** Removed orphaned Next.js artifacts (`next.config.ts`, `next-env.d.ts`) and unused uninstalled shadcn utilities (`lib/utils.ts`, `hooks/use-mobile.ts`).
  * **Type Definitions & Error Resolution:**
    * Extended `CabinetPart` interface in `src/components/CabinetCalculator.tsx` with optional `pvcFaces?: string[]` to resolve TypeScript compilation errors.
    * Added `@ts-expect-error` and typed canvas rendering fallback in `src/components/AILabelScanner.tsx` for `pdfjs-dist` worker URL import and `page.render` options.
  * **Metadata & RTL Synchronization:** Synchronized `<title>`, `<meta name="description">`, `og:title`, and `og:description` in `index.html` with Persian title and metadata from `metadata.json`, and set `<html lang="fa" dir="rtl">`.
  * **Environment Configuration:** Added `.env.example` documenting `GEMINI_API_KEY`.
  * **Build & Lint Verification:** Verified 100% clean passes for both `tsc --noEmit` (`npm run lint`) and Vite production bundle (`npm run build`).
