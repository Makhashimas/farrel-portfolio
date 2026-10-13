/* ============================================================
   FARREL.OS - project detail data
   One entry per quest card. project.html reads ?p=<slug> and
   renders the matching entry. Keep the copy in English and the
   facts in sync with the cards on the home page.
   ============================================================ */
window.PROJECTS = [
  {
    slug: 'mp3-player',
    tag: 'HARDWARE',
    name: 'Offline MP3 Player',
    cmd: 'C:\\> open quests\\mp3_player',
    sub: 'A fully offline music player built from scratch, from the first jumper wire to the star-ground fix that killed the noise.',
    art: { type: 'photo', src: 'assets/photos/mp3-hero.jpg', alt: 'Offline MP3 player breadboard build with ESP32-S3, OLED display, and audio modules' },
    body: [
      'The player runs on an ESP32-S3, with a PCM5102A DAC over I2S and a custom NE5532 amplifier stage sized for 8.5-ohm in-ear monitors. Tracks live on a microSD card, the UI on a 1.3 inch OLED, and everything works with no network connection at all.',
      'The firmware is C++: MP3 decoding from microSD, I2S streaming, a spectrum visualizer, and a Wi-Fi file manager for loading music. The hardest bug was a persistent ground noise. I traced it through the return paths and fixed it by rebuilding the grounding into a star ground, with analog, digital and power returns joined at a single point.',
      'AI tools were my rubber duck for the driver and timing bugs that would have cost me days. The fixes were mine. Next step: the pocket-sized PCB layout in KiCad.'
    ],
    specs: [
      ['MCU', 'ESP32-S3'],
      ['DAC', 'PCM5102A over I2S'],
      ['Amplifier', 'NE5532 stage, tuned for 8.5 Ω IEMs'],
      ['Display', '1.3 inch OLED'],
      ['Storage', 'microSD, fully offline playback'],
      ['Firmware', 'C++ · MP3 decode · spectrum visualizer · Wi-Fi file manager'],
      ['Grounding', 'Star ground: analog, digital and power returns joined at one point'],
      ['Status', 'Working on breadboard · pocket PCB layout in KiCad next']
    ],
    chips: ['ESP32-S3', 'KiCad', 'PCM5102A', 'NE5532', 'Star Ground', 'I2S', 'Arduino'],
    gallery: [
      { src: 'assets/photos/mp3-1.jpg', cap: 'The breadboard build mid-debug: ESP32-S3, DAC, amplifier stage and the OLED.' }
    ]
  },
  {
    slug: 'stepdown',
    tag: 'PCB',
    name: 'Step-Down Converter Board',
    cmd: 'C:\\> open quests\\stepdown_board',
    sub: 'A fully through-hole LM2575 buck converter, routed, checked and exported for fabrication in KiCad.',
    art: { type: 'photo', src: 'assets/photos/stepdown-hero.jpg', alt: '3D render of the LM2575 step-down converter PCB with toroid inductor and electrolytic capacitors' },
    body: [
      'I designed and routed this board in KiCad around the LM2575-ADJ: adjustable output from 1.23 to 9.43 V, a switchable ON/OFF pin, and 0.8 mm minimum traces. Two copper layers with a ground pour on both, joined by via stitching.',
      'The feedback divider is where the math matters. Vref is 1.23 V, R1 is 10k, and the calculated R2 came out at 1402 ohm. Since 1.4k is rare on the market, I used the standard 1.5k and verified the real output: about 9.43 V. The schematic notes and the calculation live right next to the circuit.',
      'The board passed ERC and DRC clean, and the fabrication outputs are exported. It is ready to order and solder.'
    ],
    specs: [
      ['Regulator', 'LM2575BT-ADJ, through-hole'],
      ['Output', '1.23 – 9.43 V adjustable'],
      ['Feedback', 'R1 10k / R2 1.5k · Vref 1.23 V'],
      ['Traces', '0.8 mm minimum'],
      ['Layers', '2-layer, ground pour + via stitching'],
      ['Extras', 'Switchable ON/OFF pin · 1N5822 Schottky · 300 µH inductor'],
      ['Verification', 'ERC and DRC clean · fabrication outputs exported']
    ],
    chips: ['KiCad', 'LM2575', 'PCB Layout', 'Power Electronics', 'ERC / DRC'],
    gallery: [
      { src: 'assets/photos/stepdown-1.jpg', cap: 'Board render: the through-hole layout with the toroid inductor and electrolytic caps.' },
      { src: 'assets/photos/stepdown-2.jpg', cap: 'The schematic with the feedback divider math in the margin: 1402 Ω computed, 1.5k used, Vout ≈ 9.43 V.' },
      { src: 'assets/photos/stepdown-3.jpg', cap: 'Copper view: ground pour on both layers, stitched with vias.' }
    ]
  },
  {
    slug: 'cooling-pad',
    tag: 'POWER',
    name: 'Laptop Cooling Pad',
    cmd: 'C:\\> open quests\\cooling_pad',
    sub: 'A high-airflow laptop cooler built from discrete parts, including a repurposed buck module as the fan controller.',
    art: { type: 'photo', src: 'assets/photos/cooling-hero.jpg', alt: 'Finished laptop cooling pad with two 80 mm server fans mounted inside the frame' },
    body: [
      'Two 80 mm server fans that spin up to 9100 RPM, a 12 V 3 A supply, and a hand-wired control chain. The fans move serious air, so the pad is less about looks and more about keeping a laptop under control during long sessions.',
      'The speed controller is an XL4015 buck module I repurposed: I swapped its trimpot for an external 10-kilohm potentiometer, so the fans are adjustable from the outside instead of with a screwdriver.',
      'Every connection is soldered and wired by hand. The photos show the process: fans first, then the control board, then the finished pad.'
    ],
    specs: [
      ['Fans', '2× 80 mm server fans, up to 9100 RPM'],
      ['Supply', '12 V 3 A'],
      ['Controller', 'XL4015 buck module, external 10k pot'],
      ['Assembly', 'Hand-soldered and wired']
    ],
    chips: ['XL4015', 'Server Fans', 'Soldering', 'Wiring'],
    gallery: [
      { src: 'assets/photos/cooling-2.jpg', cap: 'Both 80 mm server fans mounted in the pad.' },
      { src: 'assets/photos/cooling-3.jpg', cap: 'Inside the pad: the control board with its toroid inductor and the fan wiring.' },
      { src: 'assets/photos/cooling-1.jpg', cap: 'A single server fan on the bench before mounting.' },
      { src: 'assets/photos/cooling-4.jpg', cap: 'On the desk with the laptop, testing airflow.' }
    ]
  },
  {
    slug: 'wall-of-dream',
    tag: 'MECHATRONICS',
    name: 'Wall of Dream',
    cmd: 'C:\\> open quests\\wall_of_dream',
    sub: 'A rotating photo board for a kids class, driven by a bicycle chain and a geared motor.',
    art: { type: 'photo', src: 'assets/photos/wod-hero.jpg', alt: 'Wall of Dream rotating photo board with the lookout tower and children photo badges' },
    body: [
      'The Wall of Dream is a rotating photo board I built for a kids class I help teach. Photos ride a rail built from a bicycle chain, driven by a 300:1 geared motor. The whole thing runs on three 18650 cells with a TP4056 charger, and an MT3608 step-up module doubles as the speed control.',
      'It was built to survive kids: simple mechanics, replaceable parts, and a battery pack that recharges from USB. Finished and running in class.'
    ],
    specs: [
      ['Drive', 'Bicycle-chain rail · 300:1 geared motor'],
      ['Power', '3× 18650 cells · TP4056 charger'],
      ['Control', 'MT3608 step-up as speed control'],
      ['Status', 'Finished and running']
    ],
    chips: ['18650 Cells', 'TP4056', 'MT3608', 'Motor Drive', 'Chain Drive'],
    gallery: [
      { src: 'assets/photos/wod-1.jpg', cap: 'Close-up of the tower: the chain rail and the photo shields hanging from it.' },
      { src: 'assets/photos/wod-2.jpg', cap: 'Full front view on the floor, checking the photo layout and chain symmetry.' },
      { src: 'assets/photos/wod-3.jpg', cap: 'Low angle: the full height of the tower and the class sign on top.' }
    ]
  },
  {
    slug: 'agentic-ai',
    tag: 'AI',
    name: 'Agentic AI Assistant',
    cmd: 'C:\\> open quests\\agentic_assistant',
    sub: 'A personal agentic assistant that runs real work: memory, tools, schedules and multi-step tasks.',
    art: { type: 'pixel', cls: 'quest__art--agent', html: '<div class="px-core"><span class="px-core__ring"></span><span class="px-core__dot"></span><span class="px-core__dot"></span><span class="px-core__dot"></span></div>' },
    body: [
      'I built and run an agentic assistant that handles real work: long-term memory, tool use, scheduled automations, and multi-step task execution across terminal, browser, email, calendar and GitHub.',
      'The automation layer is mine: 6 scheduled jobs backed by 23 Python scripts (~2,200 lines) that pull from my inbox and calendar, the campus Moodle, Instagram and competition sites, then filter, deduplicate and deliver to the right place.',
      'Every model call is routed through 9Router, an OpenAI-compatible gateway I run locally that unifies 41 models across 6 provider nodes behind a single endpoint, so it can pick the best model per task and fail over between providers. In production it has handled 1,594 LLM requests and ~43.8M tokens across 18 distinct models, plus 22 custom skills developed along the way.'
    ],
    specs: [
      ['Automation', '6 scheduled jobs · 23 Python scripts (~2,200 lines)'],
      ['Sources', 'Inbox, calendar, campus Moodle, Instagram, competition sites'],
      ['Routing', '9Router gateway · 41 models · 6 provider nodes'],
      ['Production', '1,594 LLM requests · ~43.8M tokens · 18 models'],
      ['Skills', '22 custom skills developed along the way']
    ],
    chips: ['9Router', 'Multi-Provider', 'Agents', 'Automation', 'Python', 'Tool Use', 'Custom Skills'],
    gallery: []
  },
  {
    slug: 'mkh-player',
    tag: 'MOBILE',
    name: 'MKH Player: Lossless Music App',
    cmd: 'C:\\> open quests\\mkh_player',
    sub: 'An Android player for lossless and hi-res audio, aimed at headphones and external DACs rather than casual listening.',
    art: { type: 'pixel', cls: 'quest__art--chip', html: '<div class="px-chip"><span class="px-chip__pin"></span><span class="px-chip__pin"></span><span class="px-chip__pin"></span><span class="px-chip__pin"></span><span class="px-chip__core">AI</span><span class="px-chip__pin"></span><span class="px-chip__pin"></span><span class="px-chip__pin"></span><span class="px-chip__pin"></span></div>' },
    body: [
      'Kotlin with Jetpack Compose and Jetpack Media3 (ExoPlayer), background playback through a MediaSessionService, and a Room + DataStore layer for the library and preferences.',
      'The audiophile side is the point: FLAC, ALAC, WAV and DSD support, a bit-perfect / hi-res status readout, live USB DAC detection and routing, a multi-band equalizer with tuning presets (bass boost, treble, DSP envelope shaping), and a custom visualizer I drew on a Compose canvas and bound to the audio session.',
      'I used AI design and coding assistants to move fast, the same way I would use a framework or a smart autocomplete. The feature set, the architecture, the choice of Media3, the state model, and the long iteration until it actually played were mine.'
    ],
    specs: [
      ['Stack', 'Kotlin · Jetpack Compose · Media3 / ExoPlayer'],
      ['Playback', 'MediaSessionService, background playback'],
      ['Formats', 'FLAC · ALAC · WAV · DSD'],
      ['Audio', 'USB DAC detection and routing · multi-band EQ with presets'],
      ['Storage', 'Room + DataStore'],
      ['Extras', 'Bit-perfect / hi-res readout · custom Compose visualizer']
    ],
    chips: ['Kotlin', 'Jetpack Compose', 'Media3 / ExoPlayer', 'Android Audio', 'USB DAC'],
    gallery: []
  },
  {
    slug: 'ecometh-flobric',
    tag: 'RESEARCH',
    name: 'EcoMeth & FLOBRIC Solar Still',
    cmd: 'C:\\> open quests\\ecometh_flobric',
    sub: 'Two full research projects from high school, both taken from problem to measured result.',
    art: { type: 'pixel', cls: 'quest__art--leaf', html: '<div class="px-leaf"><span class="px-leaf__drop"></span><span class="px-leaf__vein"></span></div>' },
    body: [
      'EcoMeth (Toyota Eco Youth 13): an anaerobic home digester that turns organic household waste into methane biogas and liquid fertiliser, cutting methane emissions (a greenhouse gas 25x more potent than CO2). Started with field surveys at TPS 3R Gunung Anyar and interviews with residents, then compared four waste-handling options and built the one the community chose.',
      'FLOBRIC Solar Still (National Scientific Writing Competition XVII, Ministry of Public Works and Housing): a solar water distiller using a floating black fabric wick on polystyrene foam. Five days of experiments showed TDS dropping from 448 to 127 PPM, well inside the 600 PPM safe-drinking threshold, at up to 11.3% efficiency. I measured temperature, mass, TDS and pH, then analysed it all in Excel.',
      'Neither won. Both taught me how to research a real problem properly.'
    ],
    specs: [
      ['EcoMeth', 'Anaerobic home digester · organic waste to biogas + liquid fertiliser'],
      ['EcoMeth context', 'Toyota Eco Youth 13 · field surveys at TPS 3R Gunung Anyar'],
      ['EcoMeth impact', 'Cuts methane emissions, a greenhouse gas 25× more potent than CO2'],
      ['FLOBRIC', 'Solar still · floating black fabric wick on polystyrene foam'],
      ['FLOBRIC result', 'TDS 448 → 127 PPM over 5 days · up to 11.3% efficiency'],
      ['FLOBRIC context', 'National Scientific Writing Competition XVII, Ministry of Public Works and Housing']
    ],
    chips: ['Biogas', 'Water Treatment', 'Solar Energy', 'Field Research', 'Data Analysis'],
    gallery: []
  }
];
