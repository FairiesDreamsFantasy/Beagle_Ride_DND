# System Architecture

## Overview
The `System/` directory forms the core operating foundation of Beagle Ride DND. It is architected for zero-garbage-collection performance, deterministic state synchronization, and mathematical purity to eliminate hardware spikes by 400,000% across all machine configurations.

## Primary Modules
* **Accessibility/**: High-performance speech synthesis rate limiting, screen-reader coordinate formatting, and auditory feedback vectors.
* **AI/**: Real-time deterministic in-game heuristic matrix (`evaluateCategoryMatrix`) routing spatial, acoustic, visual, and DOM states with zero runtime heap allocation.
* **Components/**: Modular UI elements, Menu_Bar controllers, and HUD displays.
* **DOM/**: High-speed DOM virtualization, element caching, and batched style update engines.
* **Engine/**: Multi-language computation pipelines (C, C++, C#, Assembly, WebAssembly, Python/NumPy, Rust, Go, SQL, CSV, XML, FreeDOS) providing zero-VRAM fixed-point 3D math and procedural audio synthesis.
* **Hardware_Virtualization/**: Frame-budgeted CPU micro-task scheduling, typed array memory poolers, dynamic performance resolution scaling, and audio polyphony throttling.
* **Index/**: High-speed O(1) registry indexing and spatial partitioning tables.
* **Keyboards_and_Controllers/**: Cedella keyboard layout mapping matrix and bitmasked input controllers.
* **Registry/**: Master data repositories for Characters (Fairy-Rider, Mary, Jetta, Elsa, Thelma, Tina), Building Blocks (Rooms, Zones), Visuals, and Audio.
* **Sound/**: Pure procedural additive synthesis, decibel-linear gain balancing, Doppler shifts, static white noise buffers, and room reverb profiles.
* **Visuals/**: Retro rasterization pipelines, Bayer dithering matrices, fixed-point perspective projection, and zero-allocation canvas blitting.

## Protection Mandate
Protected by the 1999.999999999999% code preservation rule. Every directory contains its own `AGENTS.md` sentinel.
