---
name: Commercial Utility
colors:
  surface: '#f8f9fb'
  surface-dim: '#d9dadc'
  surface-bright: '#f8f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f6'
  surface-container: '#edeef0'
  surface-container-high: '#e7e8ea'
  surface-container-highest: '#e1e2e4'
  on-surface: '#191c1e'
  on-surface-variant: '#45474b'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f3'
  outline: '#75777c'
  outline-variant: '#c5c6cb'
  surface-tint: '#595f68'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#161c24'
  on-primary-container: '#7e848e'
  inverse-primary: '#c1c7d2'
  secondary: '#845403'
  on-secondary: '#ffffff'
  secondary-container: '#febd69'
  on-secondary-container: '#774b00'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#3d0600'
  on-tertiary-container: '#e94e2b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde3ee'
  primary-fixed-dim: '#c1c7d2'
  on-primary-fixed: '#161c24'
  on-primary-fixed-variant: '#414750'
  secondary-fixed: '#ffddb7'
  secondary-fixed-dim: '#fbba67'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#ffdad2'
  tertiary-fixed-dim: '#ffb4a3'
  on-tertiary-fixed: '#3d0600'
  on-tertiary-fixed-variant: '#8b1a00'
  background: '#f8f9fb'
  on-background: '#191c1e'
  surface-variant: '#e1e2e4'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: '0'
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.005em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: '0'
  price-display:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  price-display-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 22px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.02em
  code-tabular:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: -0.01em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.25rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2rem
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-base: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system drives a high-conversion retail and operations ecosystem. It prioritizes information density, purchase velocity, and frictionless administrative control. Balancing the sheer utility and immediate recognizability of global retail leaders with contemporary UI refinement, the system projects unwavering reliability, logistical clarity, and commercial momentum.

The design movement is **Corporate / Modern Utility**:
- **Information-Dense Architecture:** Eliminates unnecessary decorative flourishes in favor of structured data, crisp product merchandising, and decisive calls-to-action.
- **Zonal Color Logic:** Structural chrome uses dark navigational navy anchors to establish global orientation; transactional content sits on ultra-clean canvas neutrals; high-energy warm ambers and alert carmines guide purchase choices and track order status.
- **Physical Feedback:** Micro-interactions emphasize tactile confidence through subtle card lifts, clear active states on controls, and unmistakable status tags.

## Colors

The palette establishes clear visual tiers across navigation, transaction, deals, and transactional state management.

### Hierarchy & Functional Roles
- **Structural Anchors (Primary):** `#131921` anchors top global utility bars, footers, and critical data headers. The secondary structural tone `#232f3e` serves as secondary navigation ribbons, categorization flyouts, and administrative sidebars.
- **Transactional Accents (Secondary):** `#febd69` is dedicated to primary purchase triggers ("Adicionar ao Carrinho", "Comprar Agora"). For secondary conversions, `#f08804` provides depth, transitioning to `#e47911` on hover/active states.
- **Urgency & Merchandising (Tertiary):** `#b12704` flags high-stakes incentives, including lightning deals ("Oferta Relâmpago"), countdown timers, stock scarcity, and discount percentage pills (`-20%`).
- **Surfaces & Layout (Neutrals):** Canvas background is fixed at `#f3f4f6`, providing soft structural contrast against pure white `#ffffff` cards and data panels. Border tokens resolve to `#e5e7eb` (subtle) and `#d1d5db` (structural). Text hierarchy uses `#0f1111` for high-emphasis content, `#565959` for secondary metadata, and `#767676` for placeholders and tertiary notes.

### Order Status & Administrative Tones
- **Pago / Concluído (Success):** Background `#ecfdf5`, Border `#a7f3d0`, Text `#065f46`.
- **Pendente / Em Processamento (Warning):** Background `#fffbeb`, Border `#fde68a`, Text `#92400e`.
- **Cancelado / Reembolsado (Destructive):** Background `#fef2f2`, Border `#fecaca`, Text `#991b1b`.
- **Logística / Enviado (Info):** Background `#eff6ff`, Border `#bfdbfe`, Text `#1e40af`.

## Typography

The type scale uses Inter across headlines, tabular admin tables, and product copy to deliver crisp legibility across varying densities.

### Rules & Hierarchy
- **Prices & Currency:** Always format monetary amounts using `price-display` or `price-display-sm` with tabular numerals (`font-feature-settings: "tnum"`). Currency symbols (`R$`) sit superscripted or aligned with baseline at 60% font size.
- **Product Titles:** Set product list titles to `body-md` with 2-line clamping (`line-clamp-2`), expanding to `headline-md` or `headline-lg` exclusively on Product Detail Pages (PDP).
- **Administrative Tables:** Enforce `body-sm` and `code-tabular` for SKUs, order IDs, timestamps, and inventory units to maintain tight vertical rhythm.

## Layout & Spacing

The layout model uses a responsive fluid grid bound by a maximum shell width of `1440px` for consumer-facing storefronts, and a 100% fluid edge-to-edge layout with a fixed `240px` collapsible sidebar for administrative portals.

### Breakpoints & Columns
- **Mobile (0 - 639px):** 4-column grid. Margins `1rem`, Gutters `0.75rem`. Product grids collapse to 2 columns with reduced horizontal card padding.
- **Tablet (640px - 1023px):** 8-column grid. Margins `1.5rem`, Gutters `1rem`. Product listings reflow to 3 or 4 columns.
- **Desktop (1024px+):** 12-column grid. Margins `2rem`, Gutters `1.25rem`. Standard storefront product grids scale to 4, 5, or 6 items per row depending on sidebar filter presence.

### Spacing Model
Vertical stacking within cards and listing modules follows tight 4px and 8px cadence (`space-xs` and `space-sm`) to support high density. Section-level separation between storefront carousels and table controls strictly uses `space-xl` (32px).

## Elevation & Depth

Visual hierarchy combines low-contrast borders with ambient, light-diffused shadows to support rapid product scanning without visual clutter.

### Elevation Levels
- **Canvas Base (`elevation-0`):** `#f3f4f6`. Flat background for overall views and back-office workspaces.
- **Surface Rest (`elevation-1`):** Pure `#ffffff` framed by a 1px solid border in `#e5e7eb`. Shadow: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`. Applied to resting product cards, table bodies, and category shelves.
- **Hover Lift (`elevation-hover`):** Used when hovering interactive cards. The card elevates using `transform: translateY(-2px)`, shadow increases to `0 8px 16px -2px rgba(19, 25, 33, 0.08), 0 2px 4px -1px rgba(19, 25, 33, 0.04)`, and border shifts subtly to `#d1d5db`.
- **Dropdown & Flyout (`elevation-2`):** `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)`. Used for category mega-menus, search auto-complete, and filter popovers.
- **Modals & Drawers (`elevation-3`):** `0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)`. Accompanied by a 50% opacity neutral-900 `#131921` backdrop blur overlay.

## Shapes

The design system employs a **Soft (`1`)** shape language, reflecting utility and structured enterprise-grade reliability over consumer playfulness.

- **Base Radius (0.25rem / 4px):** Applied to form inputs, search fields, promotional badges, data table rows, and standard action buttons.
- **Card & Surface Radius (`rounded-md` / 6px to 8px):** Applied to product cards, administrative panels, and flyout menus.
- **Pill Exceptions:** Reserved solely for micro-indicators: numeric notification counters and flash promotion flags (`-20%`, `Oferta Relâmpago`), which use full rounded boundaries (`9999px`) to immediately catch attention against angular UI grids.

## Components

### Buttons
- **Primary Transactional ("Comprar Agora", "Finalizar Compra"):** Surface `#febd69` transitioning to `#f08804`, border `1px solid #a88734 #9c7e31 #846a29`, text `#111827`, font weight 600. On hover: background `#f08804`, border-color `#846a29`. Height: 36px (desktop/table), 44px (touch mobile).
- **Secondary Transactional ("Adicionar ao Carrinho"):** Surface `#ffd814`, hover `#f7ca00`, border `1px solid #fcd200`.
- **Administrative Primary:** Surface `#131921`, text `#ffffff`, hover `#232f3e`.
- **Secondary / Outline:** Background `#ffffff`, border `1px solid #d1d5db`, text `#1f2937`, hover `#f9fafb`.

### Promotional Badges & Deal Timers
- **Discount Flag:** Background `#cc0c39`, text `#ffffff`, font size 11px, weight 700, padding `2px 6px`, border-radius 2px.
- **Oferta Relâmpago:** Dual tag featuring an icon with badge background `#b12704`, text `#ffffff`, accompanied by timer text in `#b12704` ("Termina em 02:45:12").

### Product Cards
- **Structure:** White card `#ffffff` with 1px `#e5e7eb` boundary. Padding: `12px`.
- **Elements:** Product image (1:1 aspect ratio, centered against white canvas), promotional pill top-left, title (max 2 lines, `#0f1111`), star rating block with review count in `#007185`, price row (`price-display`), prime/delivery eligibility tag, and quick-add button appearing or sliding up on hover.
- **Transition:** `all 150ms cubic-bezier(0.4, 0, 0.2, 1)` on translateY and shadow.

### Input Fields & Global Search
- **Global Storefront Search:** Height 40px. Left category selector button (subtle gray), middle text input with 0px radius, right submit button in `#febd69` with dark icon. Focus ring: `2px solid #e47911`.
- **Form Inputs:** Border `1px solid #d1d5db`, padding `8px 12px`, font-size `14px`. Focus: border `#e47911`, box-shadow `0 0 0 3px rgba(240, 136, 4, 0.2)`.

### Status Tags (Orders & Operations)
- **Tag Structure:** Border-radius `4px`, padding `2px 8px`, typography `label-sm`.
- **Status Types:**
  - `Pago`: Background `#ecfdf5`, border `#a7f3d0`, text `#065f46`.
  - `Pendente`: Background `#fffbeb`, border `#fde68a`, text `#92400e`.
  - `Cancelado`: Background `#fef2f2`, border `#fecaca`, text `#991b1b`.
  - `Enviado`: Background `#eff6ff`, border `#bfdbfe`, text `#1e40af`.

### Administrative Data Tables
- **Header:** Background `#f9fafb`, border-bottom `2px solid #e5e7eb`, typography `label-sm` in `#6b7280`, uppercase with sort indicator carets.
- **Rows:** Alternating transparent and `#ffffff` surfaces, height 48px, horizontal cell padding `16px`. Hover state: `#f3f4f6`.
- **Integrations:** Real-time Supabase status hooks rendered via inline status tags, monospaced order IDs, and quick-action menu dropdowns.