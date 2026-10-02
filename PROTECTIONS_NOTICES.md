# Beagle Ride DND - Application Architecture Notice

## Architectural Principles & Integrity
- **Preserve Core Systems**: Maintain the modular structure across `System/UI`, `System/Sound`, `System/Registry`, `System/Engine`, and `System/Visuals`.
- **Pure Scientific Craftsmanship**: Keep all physics (spatial hash collision, 40ft bucket bounds, RK4 integrations), audio synthesis (Web Audio DSP, Doppler effect, harmonic oscillators), and character registries strictly grounded in standard computer science principles.
- **Immutable Stable Fallback Snapshot (`.stablefallback/`)**: A read-only (`chmod 444`) backup archive containing the known-good production state of `src/`, `Public/`, `package.json`, `vite.config.ts`, `index.html`, and `tsconfig.json` to prevent accidental overwrites or regression.
- **Standalone Distribution (`Public/Beagle_Ride_DND/`)**: Contains the pre-compiled production HTML (`index.html`), Service Worker (`sw.js`), JavaScript (`Assets/JS/index.js`), and CSS (`Assets/CSS/style.css`) ready for cPanel serving at `/home/fairiesd/public_html/Arcade/Beagle_Ride_DND/` (and hyphenated alias).
- **cPanel Version Control Integration (`.cpanel.yml`)**: Configured to deploy pre-compiled assets directly to `/home/fairiesd/public_html/Arcade/Beagle-Ride-DND` and `/home/fairiesd/public_html/Arcade/Beagle_Ride_DND`.
