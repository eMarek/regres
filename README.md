# Izračun sorazmernega dela regresa

Calculator for the proportional part of the Slovenian holiday allowance owed to an employee who worked only part of a calendar year. It covers both allowances:

- **Letni regres** (regres za letni dopust, ZDR-1) — the default
- **Zimski regres** (ZPZR, from 2025)

Pick the allowance and year, confirm the full-year amount (prefilled with the statutory minimum, editable), enter the first and last day of employment, and the app shows the amount owed in EUR.

## Commands

```sh
npm install
npm run dev     # start the app locally
npm test        # unit tests for the calculation and the amounts table
npm run build   # type-check + production build
npm run preview # serve the production build at http://localhost:4173/
```

## Deployment

Live at **https://regres.bregant.si/** (GitHub Pages with a custom domain). The old address, emarek.github.io/regres/, redirects there.

Every push to `main` runs [.github/workflows/deploy.yml](.github/workflows/deploy.yml): lint → tests → build → publish. If a test fails, nothing is published. The workflow can also be started by hand from the Actions tab.

Setup that lives outside this repository:

- **DNS**: `regres.bregant.si` is a `CNAME` to `emarek.github.io`.
- **GitHub** (Settings → Pages): Source = "GitHub Actions", Custom domain = `regres.bregant.si`, Enforce HTTPS on. With an Actions deployment the domain is stored in this setting, so no `CNAME` file is needed in the repo.

The app is served from the root of the domain, so Vite's default `base: '/'` applies. If the custom domain is ever removed, the site falls back to the `/regres/` subfolder and [vite.config.ts](vite.config.ts) needs `base: '/regres/'`, otherwise the page loads blank.

## Statutory amounts

The table lives in [src/data/regresAmounts.ts](src/data/regresAmounts.ts) — add one line per allowance each January when the new minimum wage is published.

| Allowance | Minimum amount | Years |
|---|---|---|
| Letni regres | gross minimum wage for the year (ZDR-1, čl. 131) | 2015 → |
| Zimski regres | half of the minimum wage (ZPZR) | 2025 → |

## Calculation methods

**Letni regres.** ZDR-1 grants 1/12 of the annual entitlement per month of employment, but court practice on incomplete months is not uniform, so the method is selectable:

| Method | Formula |
|---|---|
| Polni meseci + sorazmerni dnevi (default) | `(full months + remaining days / days in that month) / 12` |
| Samo polni meseci | `full months / 12` (VDSS PDP 64/2022) |
| Koledarski dnevi | `days employed / days in year` |

A month of employment is counted from the start date (15.1.–14.2. is one full month).

**Zimski regres.** ZPZR defines no month rule; the proportional part goes by calendar days of employment, so the method is fixed to `days employed / days in year`.

The last day of employment is inclusive. Logic: [src/lib/calculateRegres.ts](src/lib/calculateRegres.ts).

## Accessibility

The app is used by a visually impaired person, so accessibility is a requirement, not a nice-to-have:

- **Light / dark theme toggle**: an icon-only button (moon / sun) in the top right corner ([ThemeToggle.tsx](src/components/ThemeToggle.tsx)). Because it has no visible text it is a toggle button named "Temna tema" with `aria-pressed`, and it is the first Tab stop. Defaults to the system setting, the choice is remembered, and it is applied before first paint (inline script in [index.html](index.html)).
- Both palettes in [src/index.css](src/index.css) meet **WCAG AAA (7:1)** for all text and 3:1 for control borders and focus rings. Re-check contrast when changing a color.
- The allowance switch is a native radio group in a `fieldset`/`legend` ([SegmentedControl.tsx](src/components/SegmentedControl.tsx)), so screen readers announce the group, the option and its state, and arrow keys work.
- The result is announced through a debounced `role="status"` live region; errors are tied to their inputs with `aria-invalid` and `aria-describedby`.
- Selected and error states never rely on color alone (✓ / ⚠ marks, hidden from the spoken name), targets are at least 44px, and the layout reflows down to 320px without horizontal scrolling.

Amounts are gross. The result is informational and not legal advice.
