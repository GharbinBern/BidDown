import Job from './models/Job.js';
import Bid from './models/Bid.js';
import User from './models/User.js';

const MIN_OPEN_JOBS = 15;

const CATEGORIES = [
  'Home Repairs', 'Tutoring', 'Photography', 'Cleaning',
  'Delivery', 'Design & Print', 'Catering', 'IT & Tech Support',
];

const GHANA_LOCATIONS = [
  'East Legon, Accra', 'Labone, Accra', 'Airport Residential, Accra',
  'Cantonments, Accra', 'Dzorwulu, Accra', 'Adenta, Accra',
  'Tema Community 7', 'Tema Community 18', 'Spintex Road, Accra',
  'Haatso, Accra', 'Tesano, Accra', 'Dansoman, Accra',
  'Achimota, Accra', 'Madina, Accra', 'Ashaiman, Greater Accra',
  'Kasoa, Central Region', 'Adum, Kumasi', 'KNUST Area, Kumasi',
  'Nhyiaeso, Kumasi', 'Asokwa, Kumasi', 'Bantama, Kumasi',
  'Takoradi, Western Region', 'Cape Coast, Central Region',
  'Tamale, Northern Region', 'Koforidua, Eastern Region',
  'Osu, Accra', 'North Ridge, Accra', 'Roman Ridge, Accra',
];

const CATEGORY_TEMPLATES = {
  'Home Repairs': [
    { title: 'Repair leaking polytank and replace float valve', description: 'The 5,000-litre overhead polytank has been dripping for three weeks and developed a visible crack near the base fitting. The float valve no longer shuts off flow properly, so the overflow pipe runs all night. I need a qualified plumber to inspect the tank, replace the float valve with a quality brass unit, seal the crack with polytank repair compound, check all inlet and outlet pipework, and do a pressure test before handoff. All materials should be included in the quote. Work must be completed within two working days.', budgetRange: [280, 950] },
    { title: 'Replaster cracked bedroom walls and repaint', description: 'Two bedroom walls have developed hairline and structural cracks from building settlement. The master bedroom has three cracks about 1.5 metres long running from window corners. The second bedroom has minor surface cracks near the cornice. I need a skilled tradesman to chip out all damaged sections, apply bonding agent, replaster to a smooth finish, sand back, prime, and apply two coats of Dulux emulsion in the existing off-white shade. The house is occupied so dustsheets and careful cleanup are essential.', budgetRange: [450, 1600] },
    { title: 'Full service of split AC unit, cooling performance reduced', description: 'A 1.5-tonne Midea inverter split AC has been running two years and cooling has dropped noticeably over the past month. The unit blows slightly warm air during peak afternoon hours and the outdoor compressor sounds louder than usual. I need a certified technician to do a full diagnostic, deep clean the indoor and outdoor coils, check and top up refrigerant as needed, inspect all electrical connections and capacitors, and test the unit under load for at least 30 minutes. A written service report is required before payment.', budgetRange: [320, 1200] },
    { title: 'Fabricate and install burglar bars on six windows', description: 'A ground-floor apartment needs iron burglar bars on six windows and a steel security grill on the back utility door. The windows are wooden-frame louvre type approximately 90cm by 120cm each. I need a metalwork fabricator to measure all openings on site, fabricate bars using at least 16mm round iron rods with welded cross bracing at 30cm intervals, and install all pieces securely using rawlbolts. Finish should be black hammered paint over anti-rust red oxide primer. Include all materials, fabrication, and installation.', budgetRange: [900, 3000] },
    { title: 'Fix roof leak above master bedroom during rainy season', description: 'The corrugated iron roof above the master bedroom and adjacent bathroom leaks during heavy rain. There are two clear entry points visible from outside where the roofing sheets have lifted slightly at the ridge and where a flashing has corroded away. I need an experienced roofing technician to access the roof safely, identify all leak points, replace corroded flashings, reseat lifted roofing sheets, seal all ridge and hip joints with appropriate roofing sealant, and test with water before leaving the site. Please include materials and confirm your safety equipment is in good order.', budgetRange: [400, 1500] },
  ],
  Tutoring: [
    { title: 'WASSCE elective maths intensive, series and calculus', description: 'My daughter is in Form 3 and struggling with elective maths units covering arithmetic and geometric progressions, three-dimensional vectors, and introductory calculus. Her internal exam scores average 38 percent and her WASSCE is six months away. I need a tutor to assess her current level, build an eight-week study plan, deliver two-hour sessions twice weekly, provide worked example sheets for every topic, assign weekly practice questions, and run two full mock test sessions in the final two weeks. Familiarity with the WAEC marking scheme is essential.', budgetRange: [350, 1400] },
    { title: 'JHS Science and Mathematics coaching, three evenings weekly', description: 'My son is in JHS 2 and falling behind in Integrated Science and Core Mathematics. His science teacher moves too fast through topics like light refraction, electricity, and nutrition. In maths he struggles with directed numbers, fractions, ratios, and algebraic word problems. I need a patient tutor to visit our home three evenings per week for 90-minute sessions. The tutor should set and mark assignments between sessions, keep a progress log, and provide a brief written update every two weeks.', budgetRange: [300, 1100] },
    { title: 'BECE full preparation, all core subjects, Kumasi', description: 'My son is in JHS 3 and sitting the BECE in four months. His terminal mock results were unsatisfactory: English 52 percent, Maths 44 percent, Social Studies 48 percent. He is a capable student but lacks exam technique and time management. I need a tutor with BECE preparation experience to work across all three core subjects, focusing on past paper practice, time-allocation strategy, and filling key knowledge gaps. Sessions should be four evenings per week, two hours each.', budgetRange: [450, 1700] },
    { title: 'IELTS preparation intensive, target band 7.0', description: 'I am preparing for the IELTS Academic test in eight weeks and am targeting a band score of 7.0 for a UK university application. My current estimated level is around 5.5. I need an experienced IELTS tutor to deliver sessions covering all four skills: listening, reading, writing, and speaking. Special focus on Task 1 and Task 2 writing and the speaking interview format. I want at least two full timed mock tests during the preparation period with detailed score feedback. Sessions twice a week, 2 hours each, at my Accra home or online.', budgetRange: [500, 1800] },
  ],
  Photography: [
    { title: 'Traditional Akan engagement ceremony photography, full day', description: 'We are planning a traditional engagement ceremony for approximately 150 guests at a family compound in Kumasi. The event runs from approximately 10am to 8pm. I need a photographer who understands the cultural significance of the Ghanaian knocking ceremony and can capture the family presentations, schnapps sharing, gift exchange, prayers, kente cloth moments, dancing, and family interactions naturally. I want at least 200 edited photographs and a thoughtfully arranged photo story of the day. A portfolio showing previous Ghanaian traditional events is preferred.', budgetRange: [1200, 4000] },
    { title: 'Product photography for 30 fashion accessories, white background', description: 'I am launching an online accessories shop and need professional product photographs of 30 items including beaded handbags, jewellery sets, and woven scarves. All photos must be shot on a pure white background with consistent lighting. Each item needs a minimum of three angles plus one lifestyle shot. All images should be colour-corrected and delivered within seven business days at 300 DPI minimum. Photographer must have their own portable studio lighting setup and diffusers.', budgetRange: [800, 3000] },
    { title: 'Naming ceremony and family portrait photography, East Legon', description: 'We are hosting an outdoor naming ceremony for our newborn at our home in East Legon with approximately 80 guests. The event runs from 7am to approximately 2pm. I need a photographer experienced with naming ceremonies to capture the naming ritual, family blessings, outdoor gathering moments, and candid interactions throughout. I also want formal family portrait photographs taken at a selected moment during the event. Minimum 150 edited images delivered within a week, plus a selection of 10 prints.', budgetRange: [700, 2800] },
  ],
  Cleaning: [
    { title: 'Deep clean of 3-bedroom apartment before new tenants', description: 'A recently vacated three-bedroom apartment in Labone requires a thorough deep clean before new tenants arrive in five days. The flat was occupied for three years. Work required includes full kitchen degreasing behind the cooker and inside all cupboards, descaling of taps, showerheads, tiles, and toilet fittings in both bathrooms, window cleaning inside and out, thorough vacuuming and mopping of every room, and proper disposal of any rubbish. Approximately 140 square metres. Cleaning team must bring all materials and equipment. A formal walkthrough on completion is required.', budgetRange: [350, 1400] },
    { title: 'Post-renovation deep clean, five-bedroom house in Achimota', description: 'A five-bedroom house has just completed a major renovation involving plastering, repainting, tiling, and extensive joinery work. There is construction dust on all surfaces, cement and paint droppings on tile floors, paint overspray on window frames, and building debris in the compound. I need a professional cleaning crew of at least four to do a systematic post-construction clean: dust removal from all surfaces, tile scrubbing, window and frame cleaning, compound sweeping and washing, and proper debris disposal. Approximately 320 square metres.', budgetRange: [700, 2500] },
    { title: 'Move-out deep clean for 4-bedroom house in Tema', description: 'I am vacating a four-bedroom detached house in Tema Community 18 and need a comprehensive move-out clean to return the property to excellent condition. The job covers four bedrooms, two bathrooms, a guest toilet, the kitchen, open-plan living and dining area, a study, and the external compound. Thorough cleaning required throughout: kitchen behind appliances and inside all cupboards, bathrooms fully descaled including grout, ceiling fans and light fixtures cleaned, and all tile grout scrubbed throughout.', budgetRange: [450, 1700] },
  ],
  Delivery: [
    { title: 'Full house removal from Tema to Adenta, one day', description: 'I am relocating from a three-bedroom house in Tema Community 18 to a house in Adenta and need a professional moving service for a full household. Items include a king-size bed, two single beds, wardrobes, a dining table with six chairs, a three-piece sofa set, a 450-litre refrigerator, a washing machine, a 65-inch television, and approximately 25 packed boxes. I need a covered truck of at least five tonnes with three experienced handlers who can wrap fragile items, dismantle and reassemble all bed frames, and complete the move in one day.', budgetRange: [600, 2500] },
    { title: 'Inter-city cargo delivery, Accra to Kumasi by Thursday', description: 'I have a time-sensitive consignment of trade show merchandise that must be delivered to a hotel in Kumasi by 10am on Thursday for a product launch. The goods comprise four roll-up banners in carry cases, ten medium boxes of promotional items weighing approximately 80kg total, and two folding display stands. I need a contact with a covered vehicle making the Accra-to-Kumasi run Wednesday evening or very early Thursday. I require a signed waybill on collection, WhatsApp confirmation of delivery, and a photo of the goods at the destination.', budgetRange: [550, 2000] },
    { title: 'Office relocation across Accra, full equipment move', description: 'Our company is relocating from Tesano to a new office in Airport Residential. We have 15 workstations including monitors, CPUs, and peripherals, a large conference table, 20 chairs, two filing cabinets, a server rack, a large-format printer, and approximately 30 boxes of documents. I need a professional office moving company with appropriate vehicle and at least four experienced handlers who can disconnect, move, and reconnect all IT equipment carefully. Move must be completed over a Saturday to minimise business disruption.', budgetRange: [700, 2800] },
  ],
  'Design & Print': [
    { title: 'Brand identity for new tailoring business, logo and cards', description: 'I am launching a bespoke tailoring and alterations business in Kumasi and need a complete brand identity package including a modern and versatile logo in three colour variations, a professional two-sided business card design for 500 copies, a simple letterhead and invoice template in Microsoft Word format, and a design file for a shop signage board. The brand should feel premium and contemporary while reflecting Ghanaian textile craft. At least three distinct initial logo concepts required, followed by two rounds of revisions. Final delivery in print-ready PDF, AI, and high-resolution PNG formats.', budgetRange: [600, 2500] },
    { title: '30 branded social media posts for product launch campaign', description: 'I am launching a new skincare and wellness product range and need 30 professionally designed social media posts for a four-week campaign across Instagram and Facebook. Each post should be 1080 by 1080 pixels and adhere to the brand colour palette of terracotta, cream, and forest green with clean modern typography. The set should include product feature posts, testimonial quote graphics, promotional offer posts, and countdown posts. All 30 graphics must be delivered in JPEG and PNG format within 10 working days.', budgetRange: [600, 2200] },
    { title: 'Restaurant menu redesign for relaunch, Osu eatery', description: 'A restaurant in Osu is relaunching after renovation and wants its menus redesigned with a fresh modern identity that still feels warm and Ghanaian. The full menu covers 60 items across starters, mains, specials, drinks, and desserts. Deliverables include an A3 laminated table menu, an A1 chalkboard-style wall menu, and digital menu files for WhatsApp and Instagram stories. The aesthetic should use rich earth tones, confident typography, and spaces for food photography that I will supply.', budgetRange: [800, 3000] },
  ],
  Catering: [
    { title: 'Full catering for 80-person engagement party in Cantonments', description: 'I am organising a traditional Ghanaian engagement party for approximately 80 guests at a private family residence in Cantonments. The event runs from 2pm to approximately 8pm on a Saturday in three weeks. I need a professional catering team to provide a comprehensive traditional Ghanaian buffet including party jollof rice, fried rice, kenkey with fried tilapia, goat light soup with fufu, waakye, assorted salads, kelewele, fried chicken, and grilled fish, plus a drinks station and dessert table. The team handles all preparation, cooking, serving, and complete cleanup.', budgetRange: [1500, 6000] },
    { title: 'Outdoor wedding reception full catering, 180 guests', description: 'We are planning a traditional outdoor wedding reception for approximately 180 guests at a private compound in Kumasi. The event runs from 2pm to approximately 9pm. I need a professional catering team to provide a comprehensive full-service meal: a hot and cold starter display, a main course buffet with at least five Ghanaian and two continental options, a dessert table, and a non-alcoholic drinks station throughout. A minimum of six serving staff, full setup, and complete post-reception cleanup are required.', budgetRange: [2500, 9000] },
    { title: 'Daily office lunch for 15 staff, Dzorwulu, trial week included', description: 'A small technology company in Dzorwulu is looking for a reliable daily lunch caterer for 15 staff members Monday to Friday, starting next month with a paid one-week trial. I want a rotating weekly menu of freshly prepared Ghanaian home-style meals delivered in individually labelled portions to our office by 12:30pm. Each portion should include a main dish, a small side, and a 330ml bottle of water. The caterer must hold a valid food handler certificate, operate from a certified kitchen, and be willing to accommodate dietary requirements with advance notice.', budgetRange: [800, 3000] },
  ],
  'IT & Tech Support': [
    { title: 'New office network setup with cabling and NAS storage', description: 'We are moving into a new 200-square-metre office space on two floors in Tesano and need a complete network infrastructure setup. The work includes a business-grade dual-band router with separate authenticated staff and guest networks, a managed network switch, structured Cat6 cabling for 10 workstation drops across both floors, a basic NAS device configured for shared folder access with user permissions, and a configured hardware firewall. Wi-Fi coverage must be strong throughout both floors. A one-page network diagram at handover and a training session for the office administrator are required.', budgetRange: [800, 3000] },
    { title: 'CCTV installation, 4 cameras for home in Madina', description: 'I want a professional 4-camera CCTV system installed at my home in Madina. The four cameras should cover the front gate, the back of the house near the generator, the main interior entrance door, and the car park. I want 2-megapixel HD night-vision cameras with a DVR that stores at least 14 days of footage on a 2TB hard drive. The installer supplies and installs all cameras, cables all runs neatly with conduit where exposed, sets up the DVR with correct settings and motion alerts, and configures remote viewing on my smartphone.', budgetRange: [1200, 4500] },
    { title: 'Shopify store for Ghanaian food products brand, mobile money', description: 'I produce traditionally prepared Ghanaian food products and want to launch an online shop with mobile money payment integration. I need a Shopify developer to set up a complete store with a clean professional theme, configure 12 initial product listings, integrate MTN Mobile Money and Vodafone Cash as payment options, set up standard shipping zones for Accra, Kumasi, and nationwide delivery, and configure order confirmation emails. I also need a brief operations training session covering how to add new products, process orders, and update stock.', budgetRange: [1000, 4000] },
  ],
};

const INTAKE_FIELDS_BY_CATEGORY = {
  'Home Repairs': { location: true, issue_type: true, access_window: true },
  Tutoring: { subject: true, level: true, sessions_per_week: true },
  Photography: { shoot_type: true, event_date: true, deliverables: true },
  Cleaning: {},
  Delivery: { pickup_location: true, dropoff_location: true, load_type: true },
  'Design & Print': { asset_type: true, quantity: true, print_deadline: true },
  Catering: { guest_count: true, event_type: true, location: true },
  'IT & Tech Support': { service_type: true, location: true, timeline: true },
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFrom(list) {
  return list[randomInt(0, list.length - 1)];
}

function sampleIntakeDetails(category) {
  switch (category) {
    case 'Home Repairs':
      return {
        location: randomFrom(GHANA_LOCATIONS),
        issue_type: randomFrom(['Plumbing', 'Electrical', 'Carpentry', 'Tiling', 'AC Service', 'Metalwork', 'Roofing', 'Waterproofing']),
        access_window: randomFrom(['Weekdays 8am to 5pm', 'Saturday morning', 'Any day after 2pm', 'Weekends only', 'Flexible']),
      };
    case 'Tutoring':
      return {
        subject: randomFrom(['Elective Mathematics', 'Core Maths', 'Integrated Science', 'English Language', 'Python and Data', 'French', 'Social Studies', 'Physics', 'Accounting']),
        level: randomFrom(['Primary', 'JHS', 'SHS', 'University', 'Adult Professional']),
        sessions_per_week: String(randomInt(2, 4)),
      };
    case 'Photography':
      return {
        shoot_type: randomFrom(['Graduation', 'Product', 'Corporate Event', 'Traditional Wedding', 'Naming Ceremony', 'Restaurant and Food', 'Fashion', 'Real Estate', 'School Event']),
        event_date: new Date(Date.now() + randomInt(3, 28) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        deliverables: randomFrom(['80 or more edited photos', '150 edited photos and gallery link', 'Web and print formats', 'Same-day social media preview']),
      };
    case 'Cleaning':
      return {};
    case 'Delivery':
      return {
        pickup_location: randomFrom(['Tema', 'Spintex', 'Dansoman', 'Darkuman', 'Madina', 'Accra CBD', 'Osu', 'Cantonments']),
        dropoff_location: randomFrom(['Adenta', 'Labone', 'Kumasi', 'Kasoa', 'East Legon', 'KIA Airport', 'Roman Ridge', 'Tamale']),
        load_type: randomFrom(['Full household furniture', 'Parcel deliveries', 'Event equipment', 'Branded cargo', 'Office equipment', 'Cold chain pharmaceuticals']),
      };
    case 'Design & Print':
      return {
        asset_type: randomFrom(['Brand identity package', 'Event flyer and banner', 'Menu design', 'Social media content', 'Product labels', 'Annual report', 'Wedding stationery', 'Vehicle branding']),
        quantity: randomFrom(['500 copies', '1000 copies', 'Digital only', '200 copies and digital']),
        print_deadline: randomFrom(['5 working days', '8 working days', '10 working days', 'Flexible']),
      };
    case 'Catering':
      return {
        guest_count: String(randomInt(15, 200)),
        event_type: randomFrom(['Engagement and Knocking', 'Office daily lunch', 'Birthday party', 'Boardroom lunch', 'Funeral reception', 'Naming ceremony', 'Wedding reception', 'Corporate cocktail']),
        location: randomFrom(GHANA_LOCATIONS),
      };
    case 'IT & Tech Support':
      return {
        service_type: randomFrom(['Network setup', 'Device cleanup and antivirus', 'Website development', 'Accounting software setup', 'CCTV installation', 'E-commerce setup', 'IT support retainer', 'Custom software build']),
        location: randomFrom(GHANA_LOCATIONS),
        timeline: randomFrom(['Urgent, within 48 hours', '3 to 5 working days', '1 week', 'Flexible']),
      };
    default:
      return {};
  }
}

function sampleBidProposal(category) {
  const detailByCategory = {
    'Home Repairs': 'All materials and consumables included in bid price',
    Tutoring: 'Weekly progress quizzes with tracked performance data',
    Photography: 'Professional lighting setup and colour-corrected gallery delivery',
    Cleaning: 'Detailed room-by-room completion checklist provided',
    Delivery: 'Live delivery updates via WhatsApp and signed proof of delivery',
    'Design & Print': 'Minimum three concept options plus two revision rounds included',
    Catering: 'Full traditional Ghanaian menu with serving staff and cleanup included',
    'IT & Tech Support': 'Full installation with documentation and handover training session',
  };

  return {
    timeline_days: randomInt(1, 12),
    supervision_plan: randomFrom(['Daily WhatsApp updates throughout the job', 'Milestone check-ins every two days', 'Before and after photos at each stage']),
    milestone_plan: randomFrom(['Kickoff, draft, final handoff', 'Inspection, execution, quality check, handoff', 'Phase 1 draft, phase 2 revisions, final delivery']),
    category_detail: detailByCategory[category] || 'Full delivery details provided on request',
  };
}

function freshDeadline() {
  const days = randomFrom([7, 7, 14, 14, 21, 30]);
  const jitter = randomInt(-2, 2);
  return new Date(Date.now() + (days + jitter) * 24 * 60 * 60 * 1000);
}

async function reopenExpiredJobs(needed) {
  const expired = await Job.find({
    status: 'closed',
    winning_bid_id: null,
  }).limit(needed).lean();

  if (!expired.length) return 0;

  const now = new Date();
  const ids = expired.map((j) => j._id);
  const deadlines = expired.map(() => freshDeadline());

  const bulkOps = expired.map((job, i) => ({
    updateOne: {
      filter: { _id: job._id },
      update: {
        $set: {
          status: 'open',
          workflow_stage: 'bidding',
          deadline: deadlines[i],
          sealed_until: deadlines[i],
          updatedAt: now,
        },
      },
    },
  }));

  await Job.bulkWrite(bulkOps);

  // Reset bids on re-opened jobs back to pending/sealed so the auction looks fresh
  await Bid.updateMany(
    { job_id: { $in: ids }, status: { $in: ['rejected', 'withdrawn'] } },
    { $set: { status: 'pending', sealed: true, updatedAt: now } }
  );

  return expired.length;
}

async function createFreshJobs(needed) {
  const buyers = await User.find({ roles: 'buyer' }).select('_id').lean();
  const sellers = await User.find({ roles: 'seller' }).select('_id').lean();

  if (!buyers.length || !sellers.length) return 0;

  const now = Date.now();
  const jobDocs = [];

  for (let i = 0; i < needed; i++) {
    const category = CATEGORIES[i % CATEGORIES.length];
    const templates = CATEGORY_TEMPLATES[category] || [];
    const template = randomFrom(templates);
    const budget = randomInt(template.budgetRange[0], template.budgetRange[1]);
    const deadline = freshDeadline();
    const owner = randomFrom(buyers);

    jobDocs.push({
      title: template.title,
      description: template.description,
      category,
      intake_details: sampleIntakeDetails(category),
      budget,
      owner_id: owner._id,
      deadline,
      sealed_until: deadline,
      status: 'open',
      workflow_stage: 'bidding',
      bids_count: 0,
      escrow_released: false,
      rating_given: false,
      createdAt: new Date(now - randomInt(0, 3) * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    });
  }

  const inserted = await Job.insertMany(jobDocs);

  // Add bids from sellers for each new job
  const bidDocs = [];
  for (const job of inserted) {
    const sellerCount = randomInt(4, Math.min(7, sellers.length));
    const chosen = [...sellers].sort(() => Math.random() - 0.5).slice(0, sellerCount);

    for (const seller of chosen) {
      const pct = 0.72 + Math.random() * 0.21;
      const amount = Math.max(80, Math.round(Number(job.budget) * pct));
      bidDocs.push({
        job_id: job._id,
        seller_id: seller._id,
        amount,
        note: `Experienced ${job.category.toLowerCase()} provider. My quote of GH₵ ${amount.toLocaleString()} covers all agreed deliverables as described.`,
        proposal: sampleBidProposal(job.category),
        sealed: true,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await Job.findByIdAndUpdate(job._id, { bids_count: chosen.length });
  }

  if (bidDocs.length) await Bid.insertMany(bidDocs);

  return inserted.length;
}

export async function refreshOpenJobs() {
  try {
    const openCount = await Job.countDocuments({
      status: 'open',
      deadline: { $gte: new Date() },
    });

    if (openCount >= MIN_OPEN_JOBS) return;

    const needed = MIN_OPEN_JOBS - openCount;
    console.log(`[jobRefresh] Open jobs: ${openCount}. Topping up ${needed} job(s).`);

    const reopened = await reopenExpiredJobs(needed);
    const stillNeeded = needed - reopened;

    if (stillNeeded > 0) {
      const created = await createFreshJobs(stillNeeded);
      console.log(`[jobRefresh] Reopened ${reopened}, created ${created} fresh job(s).`);
    } else {
      console.log(`[jobRefresh] Reopened ${reopened} expired job(s).`);
    }
  } catch (err) {
    console.error('[jobRefresh] Error during refresh:', err.message);
  }
}

export function startJobRefreshSchedule(intervalHours = 6) {
  const ms = intervalHours * 60 * 60 * 1000;
  setInterval(refreshOpenJobs, ms);
  console.log(`[jobRefresh] Scheduled every ${intervalHours}h.`);
}
