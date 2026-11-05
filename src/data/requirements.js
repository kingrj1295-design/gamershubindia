// System requirements, copied from each game's official Steam store page.
// Rules for this file:
//  * Text fields (cpu, gpu) are the Steam wording, nothing added. They are what users see.
//  * Numbers (ramGb, storageGb) are read from that same text (500 MB = 0.5 GB).
//  * cpuSpec / gpuSpec / gpuLegacy are optional helpers the checker uses when the wording is generic
//    (for example "Dual-Core 2.2 GHz"). They only restate numbers that are in the wording.
//  * A missing field (or null) means "not listed / unavailable". Never fill a gap with a guess.
//  * "recommended: null" means the store page lists no recommended tier.
const checkedOn = "2026-11-04";
const steam = (appId) => ({ name: "Steam store page", url: `https://store.steampowered.com/app/${appId}/`, checkedOn });
const winNote = "Steam notes that from 1 January 2024 the Steam client supports only Windows 10 and later.";

export const requirements = {
  "counter-strike-2": {
    source: steam(730),
    windows: {
      minimum: {
        os: ["Windows® 10"],
        cpu: "4 hardware CPU threads - Intel® Core™ i5 750 or higher",
        ramGb: 8,
        gpu: "Video card must be 1 GB or more and should be a DirectX 11-compatible with support for Shader Model 5.0",
        gpuSpec: { vramMb: 1024 },
        storageGb: 85,
      },
      recommended: null,
    },
    linux: {
      minimum: {
        os: ["Ubuntu 20.04"],
        cpu: "4 hardware CPU threads - Intel® Core™ i5 750 or higher",
        ramGb: 8,
        gpu: "AMD GCN+ or NVIDIA Kepler+ with up-to-date Vulkan drivers. Support for VK_EXT_graphics_pipeline_library highly recommended.",
        storageGb: 85,
      },
      recommended: null,
    },
  },

  "dota-2": {
    source: steam(570),
    notes: [winNote],
    windows: {
      minimum: {
        os: ["Windows 7 or newer"],
        cpu: "Dual core from Intel or AMD at 2.8 GHz",
        cpuSpec: [{ cores: 2, ghz: 2.8 }],
        ramGb: 4,
        gpu: "NVIDIA GeForce 8600/9600GT, ATI/AMD Radeon HD2600/3600",
        gpuLegacy: true,
        storageGb: 60,
      },
      recommended: null,
    },
    linux: {
      minimum: {
        os: ["Ubuntu 12.04 or newer"],
        cpu: "Dual core from Intel or AMD at 2.8 GHz",
        cpuSpec: [{ cores: 2, ghz: 2.8 }],
        ramGb: 4,
        gpu: "AMD GCN+, NVIDIA Kepler+, or Intel HD 5000-series or newer",
        storageGb: 60,
      },
      recommended: null,
    },
  },

  "portal-2": {
    source: steam(620),
    notes: [winNote],
    windows: {
      minimum: {
        os: ["Windows 7 / Vista / XP"],
        cpu: "3.0 GHz P4, Dual Core 2.0 (or higher) or AMD64X2 (or higher)",
        cpuSpec: [{ cores: 1, ghz: 3.0 }, { cores: 2, ghz: 2.0 }],
        ramGb: 2,
        gpu: "Video card must be 128 MB or more and with support for Pixel Shader 2.0b (ATI Radeon X800 or higher / NVIDIA GeForce 7600 or higher / Intel HD Graphics 2000 or higher).",
        gpuSpec: { vramMb: 128 },
        storageGb: 8,
      },
      recommended: null,
    },
    linux: {
      minimum: {
        os: ["Ubuntu 12.04"],
        cpu: "Dual core from Intel or AMD at 2.8 GHz",
        cpuSpec: [{ cores: 2, ghz: 2.8 }],
        ramGb: 2,
        gpu: "nVidia GeForce 8600/9600GT, ATI/AMD Radeon HD2600/3600 (Graphic Drivers: nVidia 310, AMD 12.11), OpenGL 2.1",
        gpuLegacy: true,
        storageGb: 8,
      },
      recommended: null,
    },
  },

  "war-thunder": {
    source: steam(236390),
    windows: {
      minimum: {
        os: ["Windows 10 (64bit)"],
        cpu: "Dual-Core 2.2 GHz",
        cpuSpec: [{ cores: 2, ghz: 2.2 }],
        ramGb: 4,
        gpu: "DirectX 11 level video card: AMD Radeon 77XX / NVIDIA GeForce GTX 660. The minimum supported resolution for the game is 720p.",
        storageGb: 70,
      },
      recommended: {
        os: ["Windows 10/11 (64bit)"],
        cpu: "Intel Core i5 or Ryzen 5 3600 or better",
        ramGb: 16,
        gpu: "DirectX 11 level video card or higher and drivers: Nvidia GeForce 1060 and higher, Radeon RX 570 and higher",
        storageGb: 95,
      },
    },
    linux: {
      minimum: {
        os: ["Most modern 64bit Linux distributions"],
        cpu: "Dual-Core 2.4 GHz",
        cpuSpec: [{ cores: 2, ghz: 2.4 }],
        ramGb: 4,
        gpu: "NVIDIA 660 with latest proprietary drivers (not older than 6 months) / similar AMD with latest proprietary drivers (not older than 6 months; the minimum supported resolution for the game is 720p) with Vulkan support.",
        storageGb: 70,
      },
      recommended: {
        os: ["Ubuntu 20.04 64bit"],
        cpu: "Intel Core i7",
        ramGb: 16,
        gpu: "NVIDIA 1060 with latest proprietary drivers (not older than 6 months) / similar AMD (Radeon RX 570) with latest proprietary drivers (not older than 6 months) with Vulkan support.",
        storageGb: 95,
      },
    },
  },

  "stardew-valley": {
    source: steam(413150),
    notes: [winNote],
    windows: {
      minimum: {
        os: ["Windows Vista or greater"],
        cpu: "2 Ghz",
        cpuSpec: [{ ghz: 2 }],
        ramGb: 2,
        gpu: "256 mb video memory, shader model 3.0+",
        gpuSpec: { vramMb: 256 },
        storageGb: 0.5,
      },
      recommended: null,
    },
    linux: {
      minimum: {
        os: ["Ubuntu 12.04 LTS"],
        cpu: "2 Ghz",
        cpuSpec: [{ ghz: 2 }],
        ramGb: 2,
        gpu: "256 mb video memory, OpenGL 2",
        gpuSpec: { vramMb: 256 },
        storageGb: 0.5,
      },
      recommended: null,
    },
  },
};

// macOS requirements exist on Steam for some of these games but are not included yet, because the
// checker's operating-system choices are Windows 10, Windows 11, Linux and Other.
