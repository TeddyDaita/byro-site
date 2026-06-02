// data.js — BYRO marketplace catalog
// Categories, robots, stats. Pure data, no framework.
// Each robot has a `detail` object used by the product page (description, specs, inBox,
// editorial curator note). Reviews + related products are derived at render time.

(function () {
  const categories = [
    { id: 'cleaning',  name: 'Home cleaning',     count: 184, makers: 47, rating: 4.7, blurb: 'Vacuums, mops, and window bots that quietly handle the floor.' },
    { id: 'lawn',      name: 'Lawn & outdoor',    count: 96,  makers: 22, rating: 4.6, blurb: 'Wire-free mowers and yard helpers you set once a season.' },
    { id: 'companion', name: 'Companions',        count: 47,  makers: 18, rating: 4.5, blurb: 'Desk bots and AI pets that share the room with you.' },
    { id: 'humanoid',  name: 'Humanoid home',     count: 12,  makers: 7,  rating: 4.3, blurb: 'The new class of home humanoids, in early consumer release.' },
    { id: 'petkid',    name: 'Pet & kids',        count: 38,  makers: 14, rating: 4.6, blurb: 'Robot pets and learning kits that grow with the family.' },
    { id: 'security',  name: 'Security & patrol', count: 22,  makers: 9,  rating: 4.4, blurb: 'Indoor watch bots and patrol drones with night vision.' }
  ];

  // 20 robots — every category has 3+ representatives.
  const robots = [
    // ---- Cleaning ----
    { id: 'roborock-s8-pro', brand: 'Roborock',  name: 'S8 Pro Ultra',
      category: 'cleaning', illustration: 'vacuum',
      tagline: 'Vacuum and mop that empties itself.',
      price: 1599, monthly: 89, period: 'one time',
      rating: 4.7, reviewCount: 1284, inStock: true,
      meta: ['LiDAR', '6000 Pa', 'Self-clean dock'],
      detail: {
        description: 'The S8 Pro Ultra is Roborock\'s flagship: LiDAR navigation, 6000 Pa suction, and a dock that empties the bin, refills the mop, and washes the pads automatically. For homes with hard floors and rugs, it is the most-recommended robot vacuum on BYRO.',
        specs: { 'Suction': '6000 Pa', 'Navigation': 'LiDAR + RGB', 'Mop': 'VibraRise sonic, lifts on carpet', 'Dock': 'Empty + wash + refill + dry', 'Battery': '180 min runtime', 'Noise': '67 dB max', 'App': 'iOS / Android, Alexa, Google' },
        inBox: ['S8 Pro Ultra robot', 'RockDock Ultra base', '2× mop pads', 'Power cable', 'Quick-start guide'],
        editorial: 'Pick this if you have hardwood and rugs and want a true set-and-forget. The dock does everything; you empty a dust bag once every two months.'
      } },

    { id: 'irobot-j9', brand: 'iRobot', name: 'Roomba j9+',
      category: 'cleaning', illustration: 'vacuum',
      tagline: 'The classic, now with PrecisionVision.',
      price: 899, monthly: 50, period: 'one time',
      rating: 4.5, reviewCount: 3120, inStock: true,
      meta: ['Genius AI', 'Clean Base', 'Auto-empty'],
      detail: {
        description: 'The j9+ is iRobot\'s mature platform: Genius AI for room-by-room scheduling, PrecisionVision to dodge cords and pet messes, and the Clean Base auto-empty dock that holds up to 60 days of debris.',
        specs: { 'Suction': '4× Power-Lift', 'Navigation': 'vSLAM camera', 'Mop': 'None', 'Dock': 'Clean Base auto-empty', 'Battery': '120 min runtime', 'Noise': '68 dB max', 'App': 'iRobot Home, Alexa, Google' },
        inBox: ['j9+ robot', 'Clean Base dock', '3× AllergenLock bags', 'Power cable', 'Quick-start guide'],
        editorial: 'Best entry point into the iRobot ecosystem. Strong on carpet, smart about avoiding obstacles, and the auto-empty is genuinely 2-month set-and-forget.'
      } },

    { id: 'eufy-x10', brand: 'Eufy', name: 'X10 Pro Omni',
      category: 'cleaning', illustration: 'vacuum',
      tagline: 'Mop-lifting hybrid that handles deep pile.',
      price: 799, monthly: 45, period: 'one time',
      rating: 4.6, reviewCount: 962, inStock: true,
      meta: ['8000 Pa', 'Hot wash', 'Lift mop'],
      detail: {
        description: 'The X10 Pro Omni undercuts the flagships on price without giving up the headline features: 8000 Pa suction, mops that lift 12 mm to clear carpet, and an Omni Station with hot wash and warm-air dry.',
        specs: { 'Suction': '8000 Pa', 'Navigation': 'AI.See + LiDAR', 'Mop': 'Dual rotating, lifts 12mm', 'Dock': 'Omni Station hot wash + dry', 'Battery': '180 min runtime', 'Noise': '63 dB max', 'App': 'eufy Clean, Alexa, Google' },
        inBox: ['X10 Pro Omni robot', 'Omni Station base', '2× mop pads', 'Power cable', 'Side brushes (spare)'],
        editorial: 'Best value pick in cleaning. You give up some polish vs. Roborock but the hardware is competitive and the price difference is real.'
      } },

    { id: 'dreame-x40', brand: 'Dreame', name: 'X40 Ultra',
      category: 'cleaning', illustration: 'vacuum',
      tagline: 'Detachable mop pads and hot-water wash.',
      price: 1499, monthly: 84, period: 'one time',
      rating: 4.6, reviewCount: 540, inStock: true,
      meta: ['12000 Pa', 'AI obstacle', 'Hot dry'],
      detail: {
        description: 'The X40 Ultra raises the suction bar to 12000 Pa and adds detachable mop pads — the robot drops them at the base when it hits carpet, so you never get damp wool again. Hot-water wash, warm-air dry, auto-empty.',
        specs: { 'Suction': '12000 Pa', 'Navigation': 'LiDAR + AI camera', 'Mop': 'Detachable pads', 'Dock': 'Hot wash + warm dry + empty', 'Battery': '210 min runtime', 'Noise': '65 dB max', 'App': 'Dreamehome, Alexa, Google' },
        inBox: ['X40 Ultra robot', 'Base station', '2× detachable mop pads', 'Power cable', 'Cleaning solution sample'],
        editorial: 'Best for big homes with mixed carpet and wood. Detachable mops is the killer feature: you stop choosing between cleaning the rug or the kitchen.'
      } },

    // ---- Lawn ----
    { id: 'mammotion-luba', brand: 'Mammotion', name: 'LUBA AWD 5000',
      category: 'lawn', illustration: 'mower',
      tagline: 'GPS-RTK mower for slopes up to 75%.',
      price: 4699, monthly: 261, period: 'one time',
      rating: 4.4, reviewCount: 410, inStock: true,
      meta: ['Wire-free', '5000 m²', 'AWD'],
      detail: {
        description: 'LUBA AWD 5000 is a true all-wheel-drive robotic mower that uses GPS-RTK positioning instead of a boundary wire. It handles slopes up to 75% — terrain other mowers refuse outright.',
        specs: { 'Cut area': '5000 m² (~1.2 acres)', 'Slope': 'Up to 75%', 'Cut width': '40 cm', 'Navigation': 'GPS-RTK + IMU', 'Power': '60V Li-ion', 'Noise': '60 dB' },
        inBox: ['LUBA AWD 5000 mower', 'RTK reference station', 'Charging dock', 'Spare blades (3)', 'Quick-start guide'],
        editorial: 'The slope king. If your yard has hills that conventional mowers slide on, this is the only robotic option that holds its line.'
      } },

    { id: 'husqvarna-450x', brand: 'Husqvarna', name: 'Automower 450X NERA',
      category: 'lawn', illustration: 'mower',
      tagline: 'Quiet mower for a half-acre lot.',
      price: 4099, monthly: 228, period: 'one time',
      rating: 4.7, reviewCount: 622, inStock: true,
      meta: ['EPOS', '5000 m²', 'Quiet'],
      detail: {
        description: 'The 450X NERA is Husqvarna\'s flagship: EPOS satellite-based virtual boundary (no buried wire), 5000 m² cutting area, near-silent operation at 60 dB. Set it once and forget it for the season.',
        specs: { 'Cut area': '5000 m²', 'Slope': 'Up to 45%', 'Cut width': '24 cm', 'Navigation': 'EPOS satellite + GPS', 'Power': 'Li-ion', 'Noise': '60 dB' },
        inBox: ['Automower 450X NERA', 'Charging station', 'EPOS reference station', 'Power supply', '9× spare blades'],
        editorial: 'The reference mower. Quietest in its class, most reliable software, best-in-class app. Pricey but you do not service it for years.'
      } },

    { id: 'segway-navimow', brand: 'Segway', name: 'Navimow H3000E',
      category: 'lawn', illustration: 'mower',
      tagline: 'Boundary-wire-free with vision AI.',
      price: 2499, monthly: 139, period: 'one time',
      rating: 4.3, reviewCount: 178, inStock: true,
      meta: ['EFLS 2.0', '3000 m²', 'Vision'],
      detail: {
        description: 'The H3000E pairs Segway\'s EFLS 2.0 positioning with a vision camera that recognizes obstacles and pets. Wire-free setup, app-defined zones, 3000 m² range.',
        specs: { 'Cut area': '3000 m²', 'Slope': 'Up to 45%', 'Cut width': '22 cm', 'Navigation': 'EFLS 2.0 + AI vision', 'Power': 'Li-ion', 'Noise': '54 dB' },
        inBox: ['Navimow H3000E', 'GNSS antenna', 'Charging station', 'Power supply', 'Stakes for setup'],
        editorial: 'Best mid-range pick. Vision-aware obstacle handling and wire-free setup at a price that does not feel like buying a tractor.'
      } },

    // ---- Companion ----
    { id: 'loona', brand: 'KEYi', name: 'Loona Petbot',
      category: 'companion', illustration: 'companion',
      tagline: 'Expressive desktop companion with real personality.',
      price: 449, monthly: 25, period: 'one time',
      rating: 4.6, reviewCount: 2240, inStock: true,
      meta: ['Voice', 'Tricks', 'Roams free'],
      detail: {
        description: 'Loona is a mobile companion with an expressive OLED face, voice interaction, and a roaming AI personality. Recognizes faces, learns names, and reacts to gestures.',
        specs: { 'Display': 'OLED expressive face', 'Voice': 'Wake word + free conversation', 'Vision': 'Stereo HD camera', 'Battery': '3 hours active, auto-docks', 'Mobility': '4-wheel free roam', 'Connectivity': 'Wi-Fi, Bluetooth' },
        inBox: ['Loona robot', 'Charging dock', 'USB-C cable', 'Treat token', 'Welcome card'],
        editorial: 'The most genuine "robot pet" feeling on the market. Loona has moods, plays games, and remembers people. Not a vacuum, not a toy — it is its own category.'
      } },

    { id: 'vector-2', brand: 'Digital Dream Labs', name: 'Vector 2.0',
      category: 'companion', illustration: 'companion',
      tagline: 'The cube companion you remember, on new hardware.',
      price: 349, monthly: 20, period: 'one time',
      rating: 4.4, reviewCount: 1530, inStock: true,
      meta: ['Voice', 'Charging dock', 'OLED face'],
      detail: {
        description: 'Vector 2.0 brings back the original Anki Vector on updated hardware: a desk-sized robot that recognizes faces, plays games, answers questions, and patrols when bored.',
        specs: { 'Display': 'OLED face, 100+ animations', 'Voice': 'Always-listening assistant', 'Vision': '720p front camera', 'Battery': '~45 min active, self-docks', 'Mobility': 'Treads, desk-safe edge detect', 'SDK': 'Open developer SDK' },
        inBox: ['Vector 2.0', 'Charging cube', 'USB-C cable', 'Cube companion toy', 'Quick-start guide'],
        editorial: 'For the people who mourned when Anki shut down. Same charm, updated brain, hackable via SDK if you want to teach it new tricks.'
      } },

    { id: 'eilik-energize', brand: 'Energize Lab', name: 'Eilik',
      category: 'companion', illustration: 'companion',
      tagline: 'A pocket-sized desk friend that reacts to you.',
      price: 159, monthly: 9, period: 'one time',
      rating: 4.5, reviewCount: 8420, inStock: true,
      meta: ['Emotive face', 'Touch', 'USB-C'],
      detail: {
        description: 'Eilik is the desk-companion entry point: a palm-sized robot with an animated face, touch sensors, and a stack of mini-games. No app, no setup, USB-C charging.',
        specs: { 'Display': 'Animated emoji face', 'Sensors': 'Touch + tilt', 'Battery': '4-6 hours, USB-C', 'Mobility': 'Stationary, gestures only', 'Voice': 'None (sound effects only)', 'App': 'None required' },
        inBox: ['Eilik robot', 'USB-C charging cable', 'Sticker sheet', 'Quick-start card'],
        editorial: 'Gateway robot pet. Cheap enough to gift, cute enough to keep, simple enough that grandparents can use it.'
      } },

    // ---- Humanoid ----
    { id: 'neo-beta', brand: '1X', name: 'NEO Beta',
      category: 'humanoid', illustration: 'humanoid',
      tagline: 'Bipedal home assistant in early release.',
      price: 24500, monthly: 720, period: 'reserve',
      rating: 4.2, reviewCount: 38, inStock: false,
      meta: ['Bipedal', 'Soft drive', 'Voice control'],
      detail: {
        description: 'NEO Beta is 1X\'s first home humanoid. Soft-drive actuators make it safe around kids and pets; voice control lets it fetch, tidy, and patrol. Early-release: reserve now, ship Q4.',
        specs: { 'Height': '167 cm', 'Weight': '30 kg', 'Payload': '20 kg lift', 'Drive': 'Soft tendon actuators', 'Battery': '4 hours active', 'AI': 'On-device + cloud' },
        inBox: ['NEO Beta humanoid', 'Charging dock', 'White-glove setup voucher', 'Owner\'s onboarding kit', '12-month software updates'],
        editorial: 'First-generation humanoid for serious early adopters. You are buying the future of home robotics; expect software updates monthly, hardware to be evolving.'
      } },

    { id: 'figure-02', brand: 'Figure', name: 'Figure 02 Home',
      category: 'humanoid', illustration: 'humanoid',
      tagline: 'General-purpose humanoid moving into pilot homes.',
      price: null, monthly: null, period: 'waitlist',
      rating: null, reviewCount: 0, inStock: false,
      meta: ['Bipedal', '20 kg lift', 'OpenAI brain'],
      detail: {
        description: 'Figure 02 is the home variant of Figure\'s industrial humanoid. Custom OpenAI partnership powers the language stack. Currently in pilot homes only — join the waitlist for 2027 availability.',
        specs: { 'Height': '170 cm', 'Weight': '70 kg', 'Payload': '20 kg lift', 'Drive': 'Hybrid electric actuators', 'Battery': '5 hours active', 'AI': 'OpenAI custom model' },
        inBox: ['Waitlist confirmation', 'Pilot program enrollment forms', 'BYRO concierge contact'],
        editorial: 'Not for sale yet. Join the waitlist to be notified when Figure opens consumer pilots in your region.'
      } },

    { id: 'unitree-g1', brand: 'Unitree', name: 'G1 Humanoid',
      category: 'humanoid', illustration: 'humanoid',
      tagline: 'Agile bipedal frame for developers and pilots.',
      price: 16000, monthly: 470, period: 'reserve',
      rating: 4.3, reviewCount: 91, inStock: false,
      meta: ['Bipedal', '4 km/h', 'Dev SDK'],
      detail: {
        description: 'G1 is Unitree\'s developer-focused humanoid: agile, affordable, and open. Comes with full SDK and ROS 2 bindings. Reserve for delivery in 6-8 weeks.',
        specs: { 'Height': '127 cm', 'Weight': '35 kg', 'Speed': '4 km/h walking', 'Drive': '23 active joints', 'Battery': '2 hours active, swappable', 'SDK': 'Open Python + ROS 2' },
        inBox: ['G1 humanoid', '2× swappable battery packs', 'Charging dock', 'Developer SDK access', 'Spare end-effectors'],
        editorial: 'Best price-per-joint humanoid on the market. Hackable, agile, and serious about the developer experience. Not turnkey for non-engineers.'
      } },

    // ---- Pet & kids ----
    { id: 'moflin', brand: 'Casio', name: 'Moflin',
      category: 'petkid', illustration: 'pet',
      tagline: 'An AI pet that learns your moods.',
      price: 399, monthly: 22, period: 'one time',
      rating: 4.5, reviewCount: 612, inStock: true,
      meta: ['Tactile', 'Mood AI', 'Quiet'],
      detail: {
        description: 'Moflin is a tactile AI pet with soft synthetic fur, gentle motion, and a mood model that responds to how you hold it. Quiet enough for a bedside table; calming enough to replace a stress ball.',
        specs: { 'Form': 'Soft synthetic fur', 'Sensors': 'Touch + motion + sound', 'AI': 'Mood model, learns owner', 'Battery': '5 days standby', 'Sound': 'Subtle coo, no synthesized voice', 'Charging': 'Nest dock, USB-C' },
        inBox: ['Moflin pet', 'Nest charging dock', 'USB-C cable', 'Care guide', 'Travel pouch'],
        editorial: 'For people who want a pet but cannot have one. Calming, quiet, beautifully made. Reviewers cite real attachment within days.'
      } },

    { id: 'aibo-ers1000', brand: 'Sony', name: 'aibo ERS-1000',
      category: 'petkid', illustration: 'pet',
      tagline: 'The robot dog with a long, well-lived life.',
      price: 2899, monthly: 161, period: 'one time',
      rating: 4.8, reviewCount: 1100, inStock: true,
      meta: ['OLED eyes', 'Memory', 'Tricks'],
      detail: {
        description: 'Sony\'s aibo is the most-loved robot pet in the world. OLED eyes, 22 actuators, a real personality that learns your household over years. Cloud memory means it grows into the family.',
        specs: { 'Form': 'Four-legged, 6 kg', 'Eyes': 'OLED, expressive', 'Joints': '22 actuators', 'Battery': '2 hours active, auto-docks', 'Memory': 'Cloud, persistent over years', 'Voice': 'Recognizes 100+ commands' },
        inBox: ['aibo ERS-1000', 'Charging station', 'Pink ball toy', 'aibone toy', 'aibo cards (5)', 'Owner\'s manual'],
        editorial: 'The reference robot pet. Expensive, but reviewers describe it like a real dog. Cloud subscription required after year one — worth it.'
      } },

    { id: 'miko-3', brand: 'Miko', name: 'Miko 3',
      category: 'petkid', illustration: 'companion',
      tagline: 'A learning robot kids actually keep on.',
      price: 299, monthly: 17, period: 'one time',
      rating: 4.4, reviewCount: 4210, inStock: true,
      meta: ['Ages 5-10', 'Voice', 'Edu suite'],
      detail: {
        description: 'Miko 3 is a kid-focused learning robot: voice conversation, parent-supervised content, and an education suite built with Khan Academy and Disney. Tracks progress, age-appropriate filters baked in.',
        specs: { 'Display': '5" capacitive touch', 'Voice': 'Conversational AI, kid-tuned', 'Content': 'Khan Academy + Disney + Lingokids', 'Battery': '4 hours active', 'Parent app': 'Progress tracking, time limits', 'Ages': '5-10 recommended' },
        inBox: ['Miko 3 robot', 'Charging cable', 'Parent app access code', 'Educational suite trial', 'Quick-start guide'],
        editorial: 'Parents repeatedly say their kids actually use this. Edu content is solid, parental controls are honest, and the voice never feels creepy.'
      } },

    // ---- Security ----
    { id: 'enabot-rola', brand: 'Enabot', name: 'ROLA PetPal',
      category: 'security', illustration: 'patrol',
      tagline: 'Roving cam that watches the house and the dog.',
      price: 549, monthly: 31, period: 'one time',
      rating: 4.3, reviewCount: 870, inStock: true,
      meta: ['1080p', 'Night vision', 'Pet follow'],
      detail: {
        description: 'ROLA PetPal is a roaming home camera that follows your pet, patrols on schedule, and lets you check in from anywhere. Night vision, two-way audio, auto-dock when battery is low.',
        specs: { 'Camera': '1080p, 120° FOV', 'Night vision': 'IR, 8 m range', 'Audio': '2-way, noise-cancelling', 'Battery': '8 hours active', 'Mobility': '4-wheel, doorway-aware', 'App': 'Enabot, iOS/Android' },
        inBox: ['ROLA PetPal', 'Charging dock', 'Power cable', 'Treat-dispense attachment', 'Setup card'],
        editorial: 'Best home camera for pet owners. Follows the dog, checks rooms on schedule, and the treat dispenser actually works as a long-distance training tool.'
      } },

    { id: 'amazon-astro', brand: 'Amazon', name: 'Astro Home Robot',
      category: 'security', illustration: 'patrol',
      tagline: 'Patrols, checks in, and finds people.',
      price: 1599, monthly: 89, period: 'invite only',
      rating: 4.0, reviewCount: 320, inStock: false,
      meta: ['Periscope cam', 'Alexa', 'Auto patrol'],
      detail: {
        description: 'Astro is Amazon\'s home robot: periscope camera, Alexa-integrated voice, scheduled patrols, person-find. Invite only — request access through BYRO and we expedite.',
        specs: { 'Camera': 'Periscope HD, lifts to 42"', 'Voice': 'Alexa built in', 'Mobility': '3-wheel, edge detect', 'Battery': '~2 hours active, auto-docks', 'Privacy': 'Out-of-home zones', 'Subscription': 'Ring Protect Pro recommended' },
        inBox: ['Astro robot', 'Charging dock', 'Power supply', 'Ring Protect Pro 30-day trial', 'Invite confirmation packet'],
        editorial: 'For Alexa households who want a moving security cam with personality. Limited release; expect a 6-8 week invite turnaround.'
      } },

    { id: 'ring-always-home', brand: 'Ring', name: 'Always Home Cam',
      category: 'security', illustration: 'patrol',
      tagline: 'Indoor drone that flies a pre-set path on alert.',
      price: 449, monthly: 25, period: 'waitlist',
      rating: null, reviewCount: 0, inStock: false,
      meta: ['Auto-dock', 'HD video', 'Privacy shutter'],
      detail: {
        description: 'Always Home Cam is Ring\'s indoor autonomous drone: it flies a path you set in the app when an alarm trips, then auto-docks. Privacy shutter physically covers the camera when docked.',
        specs: { 'Camera': '1440p, gimbal-stabilized', 'Flight': 'Pre-mapped paths only', 'Battery': 'Single-flight, 5 min air time', 'Privacy': 'Hardware lens shutter', 'Trigger': 'Ring Alarm integration required', 'Audible': 'Audible-by-design (anti-snoop)' },
        inBox: ['Waitlist confirmation', 'Ring Alarm bundle option', 'BYRO concierge contact'],
        editorial: 'Most polarizing product in security. Brilliant in theory, restricted in practice (pre-mapped paths only). Waitlist now to evaluate when it ships.'
      } }
  ];

  const stats = [
    { v: '1,427',  l: 'Models listed' },
    { v: '84',     l: 'Verified makers' },
    { v: '12,300', l: 'Owner reviews' },
    { v: '4.8',    l: 'Avg rating / 5' }
  ];

  const trustPoints = [
    { k: 'Free shipping',        v: 'On every robot, every order' },
    { k: '30-day try-at-home',   v: 'Return free if it doesn’t click' },
    { k: 'Verified makers',      v: '84 brands, every listing checked' },
    { k: 'Financing from $0',    v: 'As low as $9/mo, soft credit pull' }
  ];

  function fmtMoney(n) {
    if (n == null) return null;
    return '$' + n.toLocaleString('en-US');
  }

  function fmtMonthly(n) {
    if (n == null) return null;
    return '$' + n.toLocaleString('en-US') + '/mo';
  }

  // Find a robot by id
  function findRobot(id) {
    return robots.find(r => r.id === id) || null;
  }

  // Find the category record by id
  function findCategory(id) {
    return categories.find(c => c.id === id) || null;
  }

  // Related robots: same category, excluding the current one. Up to N.
  function relatedRobots(robot, n) {
    if (!robot) return [];
    return robots.filter(r => r.category === robot.category && r.id !== robot.id).slice(0, n || 3);
  }

  // Synthetic reviews — deterministic per-robot so the page is stable on reload.
  // Returns N reviews scaled to the robot's rating.
  const reviewPool = [
    { author: 'Marisa P.',  loc: 'Denver, CO',    body: 'Set it up in ten minutes, runs every other day, never thought about it again. Worth every penny.' },
    { author: 'Devon R.',   loc: 'Austin, TX',    body: 'Better than I expected. The app is the weak link but the hardware is great.' },
    { author: 'Hannah L.',  loc: 'Brooklyn, NY',  body: 'Quiet enough that I forget it is running while I work from home. Two thumbs up.' },
    { author: 'Carlos M.',  loc: 'Phoenix, AZ',   body: 'Does exactly what was advertised. One year in and zero issues.' },
    { author: 'Priya S.',   loc: 'Seattle, WA',   body: 'My partner was skeptical, now they ask if we can get a second one.' },
    { author: 'Brent K.',   loc: 'Portland, OR',  body: 'Solid build, good support when I called once. Has held up to two big dogs and a toddler.' },
    { author: 'Avery T.',   loc: 'Chicago, IL',   body: 'Smartest purchase I made this year. Cleared up an hour of weekly chores.' },
    { author: 'Jordan W.',  loc: 'Miami, FL',     body: 'It is not perfect but the things it gets right matter more than the small misses.' }
  ];

  function reviewsFor(robot) {
    if (!robot || !robot.rating) return [];
    const count = Math.min(4, reviewPool.length);
    // Deterministic offset based on id hash so reviews stay stable
    let offset = 0;
    for (const ch of robot.id) offset = (offset + ch.charCodeAt(0)) % reviewPool.length;
    return Array.from({ length: count }, (_, i) => {
      const r = reviewPool[(offset + i) % reviewPool.length];
      // Star rating per review: spread around the avg
      const dev = (i - 1) * 0.2;
      const stars = Math.min(5, Math.max(3, Math.round((robot.rating - dev) * 2) / 2));
      return { ...r, stars };
    });
  }

  window.BYRO_DATA = {
    categories, robots, stats, trustPoints,
    fmtMoney, fmtMonthly,
    findRobot, findCategory, relatedRobots, reviewsFor
  };
})();
