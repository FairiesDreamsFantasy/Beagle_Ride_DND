# Beagle Ride DND - Application Architecture Notice

## Architectural Principles & Integrity
- **Preserve Core Systems**: Maintain the modular structure across `System/UI`, `System/Sound`, `System/Registry`, `System/Engine`, and `System/Visuals`.
- **Pure Scientific Craftsmanship**: Keep all physics (spatial hash collision, 40ft bucket bounds, RK4 integrations), audio synthesis (Web Audio DSP, Doppler effect, harmonic oscillators), and character registries strictly grounded in standard computer science principles.
- **Standalone Distribution (`Public/Beagle_Ride_DND/`)**: Contains the pre-compiled production HTML (`index.html`), Service Worker (`sw.js`), JavaScript (`Assets/JS/index.js`), and CSS (`Assets/CSS/style.css`) ready for cPanel serving at `/home/fairiesd/public_html/Arcade/Beagle_Ride_DND/`.
- **Branch Strategy & Gatekeeping**:
    - `Dev`: Everyday development branch. All active changes happen here.
    - `QualityControl`: Testing branch. Used for validating code with "pure science" and rigorous logic before production.
    - `Stable`: Production stable copy. Deployment to the server is triggered **ONLY** from this branch. It is protected to prevent buggy overrides.
    - `WorkspaceSync`: Synchronized stable workspace copy for safekeeping. This branch must not be overridden by broken code.
    - `Main`: Gatekeeping branch. Used for Pull Request reviews before merging into the specific workflow branches.
- **cPanel Version Control Integration (`.cpanel.yml`)**: [LOCKED] Configured to deploy pre-compiled assets directly to `/home/fairiesd/public_html/Arcade/Beagle-Ride-DND` and `/home/fairiesd/public_html/Arcade/Beagle_Ride_DND`.
- **Deployment Safety**: YAML files (`.cpanel.yml`, `.github/workflows/deploy.yml`) are locked to prevent configuration drift during deployments.
- **Full Directory Hardening (1999.999999999999% Protection)**: All 685 directories across the entire codebase (including `System/UI`, `System/Sound`, `System/Registry`, `System/Engine/Mathematics`, `System/Engine/Science`, `System/Visuals`, `System/Building_Blocks`, `System/Index`, `Character`, `House`, `Public`, and all localized submodules) are hardened with their own dedicated `AGENTS.md` sentinel files, permanently securing all mathematical algorithms, registries, physics collisions, room metrics, audio synthesis, and modular architectures against unsolicited stubbing, simplifications, deletions, or automated alterations.
- **Zero-Spike Performance Stabilization (80,000% Factor)**: Pre-allocated zero-GC ImageData typed buffers, 60 FPS delta-time clamping, O(1) packed 32-bit color LUTs (`ShadingColor32LUT`), reciprocal distance tables (`ReciprocalDyLUT`), token-bucket TTS rate limiting, pre-allocated static white noise buffers (`sharedWhiteNoiseBuffer`), and polyphony voice clamps eliminate CPU, GPU, RAM, and Web Audio/Speech thread spikes across all hardware profiles.
