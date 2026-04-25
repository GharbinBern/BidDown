import dotenv from 'dotenv';
import mongoose from 'mongoose';

import User from './models/User.js';
import Job from './models/Job.js';
import Bid from './models/Bid.js';
import Review from './models/Review.js';
import ProviderProfile from './models/ProviderProfile.js';

dotenv.config();

const PASSWORD = 'password123';

const CATEGORIES = [
  'Home Repairs', 'Tutoring', 'Photography', 'Cleaning',
  'Delivery', 'Design & Print', 'Catering', 'IT & Tech Support',
];

const BUYER_NAMES = [
  'Abena Mensah', 'Kwame Asante', 'Efua Darko', 'Yaw Boateng',
  'Akosua Owusu', 'Kofi Amponsah', 'Adwoa Asamoah', 'Kwesi Acheampong',
  'Ama Frimpong', 'Nana Yaw Osei', 'Adjoa Quainoo', 'Kojo Antwi',
  'Maame Serwaa Asante', 'Fiifi Benson',
];

const SELLER_NAMES = [
  'Kwabena Twumasi', 'Akua Bonsu', 'Emmanuel Agyemang', 'Abigail Tetteh',
  'Samuel Ofori', 'Priscilla Asiedu', 'Bright Amoah', 'Cecilia Dankwa',
  'Joseph Mensah', 'Benedicta Quaye', 'Kweku Baffour', 'Nana Ama Darko',
  'Prince Ofosu', 'Vivian Opoku', 'Aaron Kwarteng', 'Elsie Boampong',
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
    {
      title: 'Fix leaking polytank and replace float valve — urgent',
      description: 'The 5,000-litre overhead polytank on the third floor has been dripping for three weeks and has now developed a visible crack near the base fitting. The float valve inside the tank no longer shuts off water flow properly, so the overflow pipe runs continuously overnight causing significant water bill increases. I need a qualified plumber to inspect the tank from the rooftop, replace the float valve assembly with a quality brass unit, seal the crack using appropriate polytank repair compound, check all inlet and outlet pipework for additional wear, and conduct a full pressure test before handoff. All materials should be sourced and included in your quote. Work must be completed within two working days.',
      budgetRange: [280, 950],
    },
    {
      title: 'Replaster cracked bedroom walls and apply fresh emulsion paint',
      description: 'Two bedroom walls in a four-year-old townhouse have developed hairline and structural cracks from building settlement. The master bedroom is worst — three cracks approximately 1.5 metres long running diagonally from window corners. The second bedroom has minor surface cracks near the ceiling cornice. I need a skilled tradesman to chip out all damaged sections to sound concrete, apply bonding agent, replaster to a smooth finish, sand back, prime with alkali-resistant primer, and apply two coats of Dulux emulsion in the existing off-white shade. Please quote separately for materials and labour. The house is occupied so dustsheets and careful cleanup are essential throughout.',
      budgetRange: [450, 1600],
    },
    {
      title: 'Full service of split AC unit — cooling performance has dropped significantly',
      description: 'A 1.5-tonne Midea inverter split AC has been running for two years and the cooling output in the master bedroom has dropped noticeably over the past month. The unit blows slightly warm air during peak afternoon hours and the outdoor compressor sounds louder than normal. I suspect the refrigerant is low or the coils need deep cleaning. I need a certified air-conditioning technician to do a full diagnostic, deep clean the indoor and outdoor coils using coil cleaner and a pressure washer, check and top up refrigerant as needed, inspect all electrical connections and capacitors, and test the unit under load for at least 30 minutes. A written service report with findings is required before payment.',
      budgetRange: [320, 1200],
    },
    {
      title: 'Replace water-damaged POP ceiling boards across two rooms',
      description: 'Water stains from an old roof leak have damaged approximately 15 square metres of POP ceiling boards across the living room and a guest bedroom. The roof has been repaired but the boards remain discoloured, some have bowed, and two sections have small cracks. I need a ceiling contractor to remove and replace only the affected sections, confirm that the framing timber underneath is dry and sound, install matching white POP boards with clean joins at existing board edges, apply two coats of white ceiling paint, and leave all surfaces and floors spotless. Please bring your own tools and arrange disposal of all removed material on completion.',
      budgetRange: [600, 2200],
    },
    {
      title: 'Fabricate and install burglar bars on six ground floor windows',
      description: 'A newly rented three-bedroom ground-floor apartment in Tema needs standard iron burglar bars on all six ground-floor windows and a steel security grill on the back utility door. The windows are wooden-frame louvre type approximately 90cm by 120cm each. I need a qualified metalwork fabricator to measure all openings on-site, fabricate bars using at least 16mm round iron rods with welded cross bracing at 30cm intervals, and install all pieces securely using rawlbolts into the concrete window frame rebates. Finish should be black hammered paint over anti-rust red oxide primer. Include all materials, fabrication, and installation. Work must be done within four days of award.',
      budgetRange: [900, 3000],
    },
    {
      title: 'Full bathroom retile with new toilet and wall-hung basin',
      description: 'A 4-square-metre bathroom in a Labone home requires complete ceramic tile replacement from floor to ceiling. Existing tiles are cracked in multiple locations and the grout lines are badly moulded. I also want to replace the old low-cistern toilet with a modern close-couple unit and swap the pedestal basin for a wall-hung basin with chrome bottle-trap fittings. I need a tiler and plumber team that can handle both works simultaneously to minimise bathroom downtime. Quote should include labour, tile adhesive, grout, plumbing fittings, and disposal of all old fixtures. A portfolio or photos of previous bathroom projects is strongly preferred.',
      budgetRange: [2500, 7000],
    },
    {
      title: 'Repair garden borehole pump — low pressure and frequent circuit tripping',
      description: 'A one-inch borehole pump at a property in Adenta has been problematic for three months. The pump trips the circuit breaker every few days and when it does run, pressure is noticeably lower than normal. We suspect bearing wear, a failing pressure switch, or a drop in the water table level. I need a borehole technician to pull the pump for inspection, check the motor windings and bearings, test the pressure switch and starter capacitor, reinstall or replace the pump as needed, and adjust the pressure switch to the correct cut-in and cut-out settings. Please include a diagnosis visit in your quote and advise whether the pump needs to be sent to a workshop.',
      budgetRange: [500, 2000],
    },
  ],
  Tutoring: [
    {
      title: 'WASSCE elective maths intensive — series, vectors and calculus prep',
      description: 'My daughter is in Form 3 at a senior high school in Accra and is struggling with the elective maths units covering arithmetic and geometric progressions, three-dimensional vectors, and introductory calculus. Her internal exam scores average 38 percent and her WASSCE is approximately six months away. I need an experienced SHS elective maths tutor to assess her current level in the first session, build a personalised eight-week study plan, deliver two-hour sessions twice weekly at our East Legon home, provide worked example sheets for every topic covered, assign weekly practice questions with solutions, and run two full mock test sessions in the final two weeks. Familiarity with the WAEC marking scheme and common examiner preferences is essential.',
      budgetRange: [350, 1400],
    },
    {
      title: 'JHS Integrated Science and Mathematics coaching — three evenings weekly',
      description: 'My son is in JHS 2 at a private school in Tema and is falling behind in both Integrated Science and Core Mathematics. His science teacher moves too fast through topics like light refraction, electricity, and nutrition. In maths, he struggles with directed numbers, fractions, ratios, and algebraic word problems. I need a patient and engaging tutor to visit our Tema Community 7 home three evenings per week for 90-minute sessions covering both subjects. The tutor should set and mark short assignments between sessions, keep a progress log, and provide a brief written update every two weeks. Experience working with learners aged 13 to 15 is required.',
      budgetRange: [300, 1100],
    },
    {
      title: 'Python and data analysis bootcamp for working professional — beginner level',
      description: 'I am a 32-year-old marketing analyst at a media company in Cantonments and want to learn Python specifically for data analysis work. I have no prior coding experience but understand spreadsheet formulas and basic statistics from my role. I need a tutor who can teach me Python fundamentals through practical exercises using pandas and matplotlib, with examples drawn from marketing data like campaign performance, audience segmentation, and sales trend visualisation. Sessions should be two hours each, twice a week for eight weeks, at my Labone home or via Google Meet. The tutor must provide structured notes after each session and set project assignments between sessions.',
      budgetRange: [500, 2000],
    },
    {
      title: 'Primary school reading and comprehension support — Grade 4 learner',
      description: 'My daughter in Grade 4 at an international school in Accra is having difficulty with reading comprehension, vocabulary development, and writing structured paragraphs in English. Her classroom teachers have recommended additional one-on-one support as she is falling behind her peers. She communicates well verbally but loses confidence with longer passages or written tasks. I need a warm and patient tutor with primary education experience who can work with her for 60 minutes twice per week, use age-appropriate reading materials, build vocabulary through games and shared reading, and track her progress clearly. Sessions will be at our Cantonments home in the late afternoon.',
      budgetRange: [250, 900],
    },
    {
      title: 'University economics and statistics tutoring — Stata and regression analysis',
      description: 'I am a second-year economics student at the University of Ghana, Legon, and am struggling with my quantitative economics and statistics modules. I specifically need help with hypothesis testing, confidence intervals, multiple regression analysis, and interpreting econometric output from Stata. My mid-semester examinations are in three weeks and my grades this semester have been poor. I need a tutor with a strong quantitative background — ideally a graduate student or junior lecturer — who can explain these concepts clearly, work through past examination papers, and help me build a structured revision plan. Sessions can be on the Legon campus or at a nearby café.',
      budgetRange: [400, 1600],
    },
    {
      title: 'French conversation lessons for adult beginner — Francophone Africa relocation',
      description: 'I have accepted a new professional role in Abidjan, Côte d\'Ivoire, and will be relocating within four months. I have no prior knowledge of French beyond basic travel phrases. I need a fluent French speaker — ideally a native or someone who has lived in Francophone West Africa — to teach me practical conversational French from the ground up. Topics should include workplace vocabulary, courtesy expressions, numbers and currency, asking for directions, and basic social conversation. I want 90-minute sessions twice weekly, either at my Dzorwulu home or via video call. Monthly progress reviews to assess speaking confidence are important.',
      budgetRange: [350, 1300],
    },
    {
      title: 'BECE preparation — comprehensive revision for JHS 3 student in Kumasi',
      description: 'My son is in JHS 3 at a school in Kumasi and will be sitting the BECE in four months. His terminal mock exam results were unsatisfactory — English 52 percent, Maths 44 percent, Social Studies 48 percent. He is a capable student but lacks exam technique and time management under test conditions. I need a tutor with BECE preparation experience to work with him intensively across all three core subjects, focusing on past paper practice, time-allocation strategy, and filling key knowledge gaps. Sessions should be four evenings per week, two hours each. A written end-of-month assessment of his readiness is required.',
      budgetRange: [450, 1700],
    },
  ],
  Photography: [
    {
      title: 'Outdoor graduation portrait session with edited digital album — KNUST',
      description: 'My son is graduating from KNUST this coming weekend and I want professional graduation portraits captured at the university campus and at a scenic outdoor location in Kumasi. I want a minimum of 80 edited high-resolution photographs delivered within five business days via an online gallery link. The shoot should last two to three hours and should include at least two outfit changes. The photographer must bring professional lighting equipment suitable for shaded and indoor campus locations. A preview set of 10 images within 24 hours of the shoot is very important to us. Final gallery should be delivered in both web-optimised and full-resolution print formats.',
      budgetRange: [600, 2200],
    },
    {
      title: 'Product photography for 30 fashion accessories — white background studio',
      description: 'I am launching an online accessories shop and need professional product photographs of 30 items including beaded handbags, jewellery sets, and woven scarves. All photos must be shot on a pure white or very light grey background with consistent lighting to meet the technical requirements of my website and Instagram shop. Each item needs a minimum of three angles — front-facing, three-quarter side, and a detail close-up — plus one lifestyle shot per product. All images should be colour-corrected and delivered within seven business days in JPEG at 300 DPI minimum. Photographer must have their own portable studio lighting setup and diffusers.',
      budgetRange: [800, 3000],
    },
    {
      title: 'Two-day corporate conference photography — Airport Residential, Accra',
      description: 'Our company is hosting a two-day leadership conference at a hotel in Airport Residential, Accra for approximately 120 delegates. I need an experienced corporate photographer to cover both full days from 8am to 6pm, capturing keynote sessions, panel discussions, breakout groups, networking moments, and formal group photographs. Deliverables include a minimum of 300 edited images, a curated highlight set of 30 images delivered within 24 hours for social media, and the full edited gallery within five business days. The photographer must be professional and unobtrusive, comfortable in conference settings, and able to produce consistently edited images.',
      budgetRange: [1500, 5000],
    },
    {
      title: 'Traditional Ghanaian engagement ceremony photography — full day coverage',
      description: 'We are planning a traditional Akan engagement ceremony for approximately 150 guests at a family compound in Kumasi. The event runs from approximately 10am to 8pm. I need a photographer who understands the cultural significance of the Ghanaian knocking ceremony and can capture the family presentations, schnapps sharing, gift exchange, prayers, kente cloth moments, dancing, and emotional exchanges between families naturally and with skill. I want at least 200 edited photographs and a thoughtfully arranged photo story of the day. Final delivery within two weeks. A portfolio showing previous Ghanaian traditional event work is strongly preferred.',
      budgetRange: [1200, 4000],
    },
    {
      title: 'Restaurant interior and food photography for new menu launch in Osu',
      description: 'A well-established restaurant in Osu, Accra is updating its physical menu, website, and social media content. I need a skilled food and interior photographer to shoot approximately 40 styled menu items and 15 interior ambience shots during a single closed-day session. All food shots must use professional soft or natural lighting with clean contemporary styling and full focus on the food. Interior shots should showcase the atmosphere and seating quality. The complete edited photo set should be delivered within four working days in both web and print formats. A portfolio showing previous restaurant and food photography work is required before selection.',
      budgetRange: [900, 3500],
    },
    {
      title: 'Naming ceremony and family portrait photography — East Legon, Accra',
      description: 'We are hosting an outdoor naming ceremony for our newborn at our family home in East Legon with approximately 80 guests. The event runs from 7am to approximately 2pm. I need a photographer experienced with naming ceremonies who can capture the naming ritual, family blessings, outdoor gathering moments, food sharing, and candid family interactions throughout the morning. I also want formal family portrait photographs taken at a selected moment during the event. Minimum 150 edited images delivered within a week. Package should include edited digital gallery and a selection of 10 prints.',
      budgetRange: [700, 2800],
    },
  ],
  Cleaning: [
    {
      title: 'Deep clean of 3-bedroom apartment before new tenants arrive',
      description: 'A recently vacated three-bedroom apartment in Labone requires a thorough deep clean before new tenants arrive in five days. The flat was occupied for three years. Work required includes full kitchen degreasing including behind the cooker, inside the oven, and inside all cupboards. Both bathrooms need descaling of taps, showerheads, tiles, and toilet fittings. All windows must be cleaned inside and out. Every room needs thorough vacuuming and mopping, all built-in wardrobes cleaned inside, and any rubbish properly disposed of. Approximately 140 square metres. Cleaning team must bring all materials and equipment. A formal walkthrough on completion is required.',
      budgetRange: [350, 1400],
    },
    {
      title: 'Weekly office cleaning for co-working space — Tesano, Accra',
      description: 'A shared co-working office in Tesano, Accra with approximately 180 square metres of open-plan workspace, two private offices, two washrooms, a small kitchen, and a boardroom needs professional cleaning every Saturday morning from 7am to approximately 12pm. The weekly job includes thorough vacuuming and mopping, cleaning and disinfecting both washrooms, emptying all waste bins, wiping down all desks and workstations, cleaning the kitchen including sink and microwave, and washing glass partitions and windows as needed. We are looking for a reliable professional or small team who can commit to a consistent weekly schedule. We provide a cleaning supplies store on-site.',
      budgetRange: [600, 2200],
    },
    {
      title: 'Post-renovation deep clean — five-bedroom house in Achimota',
      description: 'A five-bedroom house in Achimota has just completed a major renovation involving full plastering, repainting, tiling of all floors, and extensive joinery work. There is significant construction dust settled on all surfaces, cement and paint droppings on tile floors, paint overspray on window frames, and general building debris in the compound. I need a professional cleaning crew of at least four to complete the full post-construction clean systematically — dust removal from all surfaces, tile scrubbing, window and frame cleaning inside and out, compound sweeping and washing, and proper disposal of all debris. Approximately 320 square metres across two floors. Team must supply all equipment and materials.',
      budgetRange: [700, 2500],
    },
    {
      title: 'Carpet and upholstery steam cleaning — 60sqm living and dining area',
      description: 'A large living and dining room area in a Cantonments home has fitted carpets and a full upholstered suite that have accumulated significant dust, pet hair, and one prominent red wine stain from an event last month. Total fitted carpet area is approximately 60 square metres. Furniture includes a three-piece sofa, two armchairs, and four dining chairs with upholstered seats. I need a professional with a commercial-grade hot water extraction steam cleaning machine to clean all carpets, treat and lift the wine stain, clean all upholstered furniture, and apply a deodorising treatment. Job should be completable in one working day. Professional machine only — no home rental equipment.',
      budgetRange: [400, 1600],
    },
    {
      title: 'Monthly common area cleaning for 24-unit residential estate in Spintex',
      description: 'A gated residential estate of 24 townhouses in Spintex Road requires monthly professional cleaning of all shared common areas. Scope covers the perimeter internal road, central landscaped garden, guard post and entry gate area, communal pool deck and changing area, stairwells of two four-storey apartment blocks, and the communal waste zone. The full service takes two consecutive days and should be scheduled for the last weekend of each month. A team of at least six experienced cleaners is required. Estate management provides a detailed checklist and conducts a formal walkthrough inspection after each clean. Bidders should quote a per-monthly-cycle rate.',
      budgetRange: [1200, 4000],
    },
    {
      title: 'Move-out deep clean — 4-bedroom detached house in Tema Community 18',
      description: 'I am vacating a four-bedroom detached house in Tema Community 18 at the end of the month and need a comprehensive move-out clean to return the property to the landlord in excellent condition. The job covers four bedrooms, two bathrooms, a guest toilet, the kitchen, an open-plan living and dining area, a study, and the external compound. Exceptionally thorough cleaning is required: kitchen behind appliances and inside all cupboards, bathrooms fully descaled including grout, ceiling fans and light fixtures cleaned, and all tile grout scrubbed throughout. Please provide a per-room breakdown as well as a total package quote.',
      budgetRange: [450, 1700],
    },
  ],
  Delivery: [
    {
      title: 'Full house furniture removal from Tema to Adenta — one day',
      description: 'I am relocating from a three-bedroom house in Tema Community 18 to a house in Adenta, approximately 35 kilometres away, and need a professional moving service for a full household. Items include a king-size divan bed, two single beds, one large double wardrobe, two single wardrobes, one dining table with six chairs, a three-piece sofa set, a 450-litre refrigerator, a washing machine, a 65-inch television and unit, and approximately 25 packed boxes. I need a covered truck of at least five tonnes capacity plus three experienced handlers who can wrap fragile items, dismantle and reassemble all bed frames, and complete the move in one day. Date is flexible within the next two weeks.',
      budgetRange: [600, 2500],
    },
    {
      title: 'Same-day parcel delivery across Greater Accra — 20 customer orders',
      description: 'I operate a small online retail business and have an unusually high order volume to fulfil this Saturday — approximately 20 customer deliveries spread across Accra, Tema, and Spintex. I need one or two reliable riders with strong local knowledge who can pick up all parcels from my Dansoman dispatch point at 8am, follow an efficient route, collect a customer signature or WhatsApp delivery confirmation for each drop, send me live status updates throughout the day, and return any failed deliveries by 6pm. All parcels are light items — clothing and cosmetics — each weighing under 3kg. All riders must have a working smartphone with active data and a valid commercial bike licence.',
      budgetRange: [400, 1600],
    },
    {
      title: 'Airport VIP transfer service over a long weekend — KIA Accra',
      description: 'I need a reliable and highly professional private vehicle hire for airport transfers over a long weekend in Accra. The schedule involves two international arrivals at Kotoka International Airport on Friday evening and one departure early Sunday morning. The vehicle must be a clean air-conditioned executive saloon or SUV no older than 2020, and the driver must be well-presented, strictly punctual, and hold a valid commercial driving licence. Professional name signage must be displayed for all arrival pickups. The driver must be prepared to wait for passengers delayed by customs or baggage reclaim. Quote should include fuel, any applicable tolls, and airport parking.',
      budgetRange: [450, 1800],
    },
    {
      title: 'Wedding event equipment delivery and return — Kasoa venue',
      description: 'I am coordinating a Saturday wedding reception in Kasoa and need a reliable enclosed van to transport rented event equipment from a hire company in Darkuman to the venue by 7am, and to collect and return all equipment to the supplier by 9pm the same evening. The load includes 100 plastic chairs, 12 folding tables, one large canopy frame, a PA system with speaker stands, and LED fairy lights on reels. The hire supplier will assist with loading and offloading at both ends but I need two additional handlers to assist with the evening return. Vehicle must be covered and clean. Please confirm vehicle size and availability with your bid.',
      budgetRange: [500, 1900],
    },
    {
      title: 'Inter-city cargo delivery — Accra to Kumasi by Thursday morning',
      description: 'I have a time-sensitive consignment of branded trade show merchandise that must be delivered to a hotel in Kumasi by 10am on Thursday for a product launch. The goods comprise four large branded roll-up banners in carry cases, ten medium boxes of promotional items weighing approximately 80kg total, and two folding display stands. I need a reliable contact with a covered vehicle or cargo van making the Accra-to-Kumasi run Wednesday evening or very early Thursday morning. Cargo insurance preferred. I require a signed waybill on collection, WhatsApp confirmation of delivery, and a brief photo of the goods at the destination. Quote should be all-inclusive.',
      budgetRange: [550, 2000],
    },
    {
      title: 'Daily school morning run — 5 children, Madina to East Legon',
      description: 'I am looking for a reliable and safety-conscious driver to provide a daily school morning run for five children from our neighbourhood in Madina to an international school in East Legon, Monday to Friday during the school term. Pickup should be at 6:30am from a set collection point in Madina. The driver must have a clean roadworthy vehicle with working seat belts for all passengers, a valid driving licence, police clearance certificate, and strong references from previous school run or child transport work. No smoking or phone use while driving children. I prefer an estate car or minivan. A one-week trial before confirming a termly arrangement.',
      budgetRange: [800, 2800],
    },
  ],
  'Design & Print': [
    {
      title: 'Complete brand identity for new tailoring business — logo, cards, and signage',
      description: 'I am launching a bespoke tailoring and alterations business in Kumasi and need a complete brand identity package. The package includes a modern and versatile logo in three colour variations, a professional two-sided business card design for 500 copies, a simple letterhead and invoice template in Microsoft Word format, and a design file for a 3-foot by 4-foot shop signage board. The brand should feel premium and contemporary while reflecting Ghanaian textile craft. I require at least three distinct initial logo concepts to choose from, followed by two rounds of revisions on the selected concept. Final delivery in print-ready PDF, AI, and high-resolution PNG formats.',
      budgetRange: [600, 2500],
    },
    {
      title: 'Church 25th anniversary — flyer, banner, and programme booklet',
      description: 'Our church is celebrating its 25th anniversary next month and needs professional graphic design for a complete set of printed event materials. The package includes a full-colour A5 event flyer for 1000 copies, a 2-metre pull-up roll-up banner design, a 16-page A5 programme booklet with a full-colour cover and clean internal layout, and digital versions formatted for WhatsApp, Facebook event cover, and Instagram story. Theme colours are royal blue and gold. We will provide all text content, high-resolution photos of pastors, and the church logo. The designer must deliver final CMYK print-ready files on time as the printer deadline is firm.',
      budgetRange: [700, 2800],
    },
    {
      title: 'Restaurant menu redesign for Accra eatery relaunch — Osu',
      description: 'A well-known restaurant in Osu, Accra is relaunching after renovation and wants its menus redesigned with a fresh modern identity that still feels warm and unmistakably Ghanaian. The full menu covers 60 items across starters, mains, specials, drinks, and desserts. Deliverables include an A3-format laminated table menu, an A1 chalkboard-style wall menu, and digital menu files for WhatsApp and Instagram stories. The aesthetic should use rich earth tones, confident typography, and spaces for food photography that I will supply. Up to three full revision rounds included. Final delivery in print-ready PDF plus editable source files.',
      budgetRange: [800, 3000],
    },
    {
      title: 'Open day marketing materials package for private primary school',
      description: 'A private primary school in East Legon is holding its annual open day and needs a fully consistent set of printed and digital marketing materials designed and prepared within eight working days. The package includes an A4 parent-facing flyer for 500 copies and a digital version, a 2-metre by 3-metre entrance banner, a branded one-page insert card for 100 prospective family welcome packs, and a six-panel A4 trifold brochure about the school programmes. All designs must be consistent with the existing blue and yellow brand palette and school logo. We will provide brand guidelines, current photos, and all text content before work begins.',
      budgetRange: [900, 3500],
    },
    {
      title: 'Product label design for natural skincare range — Adwoa Naturals',
      description: 'I produce a small batch of natural skincare products using Ghanaian ingredients including raw shea butter, cold-pressed neem oil, and traditionally prepared black soap. The current range has five products and each needs a professionally designed label that communicates artisan quality, clean ingredients, and local Ghanaian provenance to a health-conscious urban consumer. Labels must incorporate the product name, full ingredients list, usage instructions, net weight, and a simple brand logo. Colour palette should be earthy and natural with subtle African-inspired decorative elements. Label formats include circular labels at 6cm diameter and rectangular labels at 5cm by 8cm. Deliverables are print-ready vector files plus a digital product mockup for each.',
      budgetRange: [500, 1800],
    },
    {
      title: 'Social media content design — 30 branded posts for product launch',
      description: 'I am launching a new skincare and wellness product range and need 30 professionally designed social media posts ready for a four-week launch campaign across Instagram and Facebook. Each post should be 1080 by 1080 pixels and adhere to the brand colour palette of terracotta, cream, and forest green with clean modern typography. The set should include a mix of product feature posts, testimonial quote graphics, promotional offer posts, and countdown posts for the launch day. All 30 graphics must be delivered in JPEG and PNG format within 10 working days. Source files in Canva or Photoshop format preferred for future edits.',
      budgetRange: [600, 2200],
    },
  ],
  Catering: [
    {
      title: 'Full catering for 80-person traditional engagement celebration in Cantonments',
      description: 'I am organising a traditional Ghanaian engagement party for approximately 80 guests at a private family residence in Cantonments, Accra. The event runs from 2pm to approximately 8pm on a Saturday in three weeks. I need a professional catering team to provide a comprehensive traditional Ghanaian buffet including party jollof rice, fried rice, kenkey with fried tilapia, goat light soup with fufu, waakye, assorted salads, kelewele, fried chicken, and grilled fish. A drinks station with minerals and fresh-fruit drinks and a dessert table are also required. The team must handle all preparation, cooking, serving, and complete cleanup. Crockery, chafing dishes, and serving equipment included in quote. Experience with Ghanaian traditional events is essential.',
      budgetRange: [1500, 6000],
    },
    {
      title: 'Daily office lunch delivery for 15 staff — Dzorwulu, Accra',
      description: 'A small technology company in Dzorwulu, Accra is looking for a reliable daily lunch caterer for 15 staff members Monday to Friday, starting next month with a one-week paid trial. I want a rotating weekly menu of freshly prepared Ghanaian home-style meals — rice dishes, soups and stews, fufu, banku, and light dishes — delivered in individually labelled portions to our office by 12:30pm each day. Each portion should include a main dish, a small side, and a 330ml bottle of water. The caterer must hold a valid food handler certificate, operate from a certified kitchen facility, and be willing to accommodate occasional dietary requirements with advance notice.',
      budgetRange: [800, 3000],
    },
    {
      title: 'Outdoor 40th birthday garden party catering — 50 guests, Kumasi',
      description: 'I am planning a 40th birthday garden party for 50 guests at our home in Nhyiaeso, Kumasi. The event runs from 4pm to approximately 10pm. I need catering that includes a two-hour cocktail food station with passed appetisers — spring rolls, mini jollof rice cups, suya skewers, and small chops — followed by a full buffet dinner with rice dishes, pasta, beef stew, grilled and fried chicken, and a dessert table with cakes and fresh fruit. A mobile bar service with soft drinks, fresh juices, and mocktails is required. Staffing should include at least two serving staff and one bartender. The catering team is responsible for setup, service, and complete cleanup by midnight.',
      budgetRange: [1200, 4500],
    },
    {
      title: 'Executive boardroom lunch — 12 senior guests, formal three-course service',
      description: 'I need a professional caterer to prepare and serve a formal three-course boardroom lunch for 12 senior corporate guests at our Cantonments office. The meal should feel genuinely premium with a shared starter platter, individually plated mains presenting a protein, starch, and vegetable component, and a dessert course. Confirmed dietary requirements include one strict vegetarian, one guest managing diabetes, and one with a severe shellfish allergy. The caterer must supply all tableware, linen napkins, serving staff, and manage complete setup and post-meal cleanup. Service must be quiet and unobtrusive as discussions will continue throughout the meal. A proposed menu and photos from previous corporate catering engagements are required with the bid.',
      budgetRange: [1000, 3500],
    },
    {
      title: 'Funeral reception catering — 200 guests, Koforidua',
      description: 'My family is organising a funeral reception in Koforidua following the burial ceremony of our patriarch. We expect approximately 200 guests and the reception runs from approximately 1pm to 5pm in an outdoor venue. We need full catering covering three traditional main dish options — fufu with light soup and goat meat, party jollof rice with fried chicken, and yam and kontomire palava sauce — plus a cold drinks station with minerals and sachet water throughout. Serving staff of at least five people is required. The caterer handles all food setup, service for the full duration, and complete cleanup. Locally-sourced, high-quality traditional Ghanaian menu strongly preferred. Please include any transport costs from Accra in your quote.',
      budgetRange: [2000, 8000],
    },
    {
      title: 'Outdoor naming ceremony catering — 60 guests, Roman Ridge, Accra',
      description: 'We are hosting a traditional naming ceremony for our newborn daughter at our home in Roman Ridge, Accra with approximately 60 family members and close friends. The morning event runs from 7am to approximately 1pm. I need a catering team to provide a traditional Ghanaian morning buffet appropriate for a naming ceremony — koko, koose, and bread for early arrivals, followed by waakye with stew and fried fish, fried yam and eggs, kelewele, and fresh fruit for the mid-morning buffet. Drinks to include fresh zobo, sobolo, and minerals. Minimum two serving staff plus the cook. All setup and clearing done by the catering team. The team must be punctual and smartly presented as this is a formal family occasion.',
      budgetRange: [700, 2800],
    },
  ],
  'IT & Tech Support': [
    {
      title: 'New office network setup — router, cabling, and NAS storage in Tesano',
      description: 'We are moving into a new 200-square-metre office space on two floors in Tesano, Accra, and need a complete network infrastructure setup. The work includes installation of a business-grade dual-band router with separate authenticated staff and guest Wi-Fi networks, a managed network switch, structured Cat6 cabling for 10 workstation drops across both floors, a basic NAS device configured for shared folder access with user permissions, and a properly configured hardware firewall. Wi-Fi coverage must be strong throughout both floors including the boardroom. The engineer should produce a one-page network diagram at handover and provide a 45-minute training session for the office administrator.',
      budgetRange: [800, 3000],
    },
    {
      title: 'Laptop cleanup, malware removal, and antivirus setup for 8 office machines',
      description: 'A small NGO office in Airport Residential, Accra has eight staff laptops in poor health — several running unusually slowly, some displaying persistent pop-ups, two cannot reliably connect to the office printer, and at least one appears to have adware installed. I need a qualified IT technician to visit the office and systematically work through all eight laptops: full malware scans and removal of all threats, uninstalling unnecessary or suspicious software, updating operating systems and drivers, installing and configuring a business-grade antivirus solution, setting up automated backup routines to external drives, and verifying internet and printer connectivity on each machine before sign-off.',
      budgetRange: [600, 2000],
    },
    {
      title: 'Design and build 5-page business website for Accra-based SME',
      description: 'I run a construction materials supply business in Accra and currently have no website. I need a clean, professional five-page website built on WordPress so I can manage content myself after handover. The five pages required are: Home with a hero banner, About Us, Services listing our main product categories, a Gallery showing photos of recent project supplies, and a Contact page with a submission form and embedded Google Map showing our yard location. The design must be fully mobile-responsive, fast-loading, and consistent with my brand colours of dark green and white. I already own the domain. The designer provides a full training session and all login credentials at handover.',
      budgetRange: [900, 3500],
    },
    {
      title: 'QuickBooks setup and staff training for small retail boutique in Osu',
      description: 'I own a clothing and accessories boutique in Osu, Accra and have been managing accounts on spreadsheets for two years. I want to properly set up QuickBooks Desktop for retail business accounting. I need an experienced accountant or IT consultant to install the software, build an appropriate chart of accounts for a retail SME, set up my three main product categories as inventory items with opening stock quantities, design a professional invoice and receipt template with my logo, import three months of historical transactions from Excel, and deliver a practical two-hour training session for me and my assistant covering daily sales entry, expense recording, and basic reports. All configurations must be verified correct before final handover.',
      budgetRange: [500, 2000],
    },
    {
      title: '4-camera CCTV system installation for home security — Madina, Accra',
      description: 'I want a professional 4-camera CCTV security system installed at my home in Madina, Accra. The four cameras should cover the front gate and entrance, the back of the house near the generator housing, the main interior entrance door, and the car park area. I want 2-megapixel full HD night-vision dome or bullet cameras with a DVR that stores a minimum of 14 days of continuous footage on a 2TB hard drive. The installer supplies and installs all cameras, cables all runs neatly through the walls with conduit where exposed, sets up the DVR with correct date and time and motion alerts, and configures remote viewing access on my smartphone via the manufacturer app. A 30-minute demonstration and one-year workmanship guarantee are required.',
      budgetRange: [1200, 4500],
    },
    {
      title: 'E-commerce Shopify store for local Ghanaian food products brand',
      description: 'I produce and sell traditionally prepared Ghanaian food products — shito, groundnut paste, and dried spice blends — and want to launch an online shop with mobile money payment integration. I need a Shopify developer to set up a complete store with a clean professional theme, configure 12 initial product listings with descriptions and photos that I will supply, integrate MTN Mobile Money and Vodafone Cash as payment options, set up standard shipping zones for Accra, Kumasi, and nationwide delivery, and configure order confirmation emails. I also need a brief operations training session covering how to add new products, process orders, and update stock. The store must be fully live and tested before handover.',
      budgetRange: [1000, 4000],
    },
  ],
};

const REVIEW_COMMENTS = {
  'Home Repairs': {
    buyer_positive: [
      'Kwabena arrived exactly on time and the tank has not had a single drip since. Left the compound completely clean. Highly recommend.',
      'Excellent plastering and painting work throughout. The walls look as good as new and the finish is very smooth.',
      'Diagnosed and fixed the AC issue in under three hours. Explained everything clearly and was honest about what was actually needed.',
      'Burglar bars fabricated and installed within two days as promised. Quality welding and a clean black finish throughout.',
      'The bathroom looks brand new. Tiles are perfect and the plumbing is working flawlessly. Very professional team overall.',
      'Ceiling boards replaced perfectly. You cannot even see where the old ones were removed. Highly satisfied.',
    ],
    buyer_negative: [
      'Good quality work overall but arrived 40 minutes late on the first morning without sending a message to warn me.',
      'The job was completed satisfactorily but took one extra day beyond what was agreed. Better communication would have helped.',
      'End result was fine but the original quote was exceeded slightly due to materials. Would have appreciated a heads-up.',
    ],
    seller_positive: [
      'Very clear brief and the client was at the property throughout to answer questions promptly. Payment released immediately.',
      'Well-organised client with everything prepared in advance. Access was available all day both days. Easy job to complete.',
      'Client was cooperative and patient. The site was cleared of furniture before we arrived to work. Smooth engagement.',
    ],
  },
  Tutoring: {
    buyer_positive: [
      'My daughter improved from 38 percent to 64 percent in her next internal test after six sessions. Truly excellent results.',
      'Incredibly patient with my son and found clear ways to explain concepts he had been confused about for an entire term.',
      'Professionally prepared for every single session. Detailed notes provided and a progress report emailed every week.',
      'My Python skills improved remarkably in just two months. Lessons were always practical and used real marketing data examples.',
      'My daughter is now reading independently and her confidence in school has visibly improved. I am very grateful.',
      'Transformed my exam technique completely. Managed my time properly in the BECE and I am very happy with my results.',
    ],
    buyer_negative: [
      'Tutor was clearly knowledgeable but sessions occasionally ran 15 to 20 minutes short of the agreed two hours.',
      'Good results overall but the lesson plan in the first two weeks was less structured than I had hoped for.',
    ],
    seller_positive: [
      'Engaged and involved parent who communicated well and monitored progress closely. The student worked hard between sessions.',
      'Student was genuinely motivated and the family created an excellent study environment at home. A real pleasure to teach.',
      'Expectations were made very clear from day one and payment was made promptly after each confirmed session.',
    ],
  },
  Photography: {
    buyer_positive: [
      'The graduation photos are absolutely stunning. Our family cannot stop looking at them. Every important moment was captured.',
      'Product photographs are exactly what I needed for the website. Professionally styled and delivered two days early.',
      'Covered the entire two-day conference without missing a moment. Same-day social media preview was delivered by 7pm.',
      'Traditional ceremony coverage was remarkable. Every cultural detail was photographed with real understanding and skill.',
      'The food photos are incredible. Regular customers have already commented on how much better the new menu looks.',
      'Naming ceremony photos arrived on the fourth day and the whole family is emotional looking through them. Beautiful work.',
    ],
    buyer_negative: [
      'Good quality photography but the full gallery was delivered on day eight instead of the five days quoted.',
      'Photos were good but only 68 of the 80 minimum guaranteed photos were delivered in the final gallery.',
    ],
    seller_positive: [
      'Well-prepared client with a clear shot list. The venue was beautifully set up and the subject was relaxed and easy to work with.',
      'Clear brief provided upfront and the client trusted my creative direction throughout. Smooth and professional job.',
      'Professional communication throughout. Schedule confirmed in advance and payment made on gallery delivery. Would work together again.',
    ],
  },
  Cleaning: {
    buyer_positive: [
      'The apartment was genuinely spotless on the walkthrough. Every corner cleaned, not just the main surfaces. Outstanding work.',
      'Reliable team that shows up every Saturday without exception. The office always smells fresh when we arrive on Monday morning.',
      'Post-renovation clean was thorough and systematic. Every room was done completely and all debris was removed without being asked.',
      'Carpets look brand new and the wine stain has completely disappeared. Professional equipment made a huge difference.',
      'The most thorough move-out clean I have ever seen done. Got the full security deposit back thanks to their work.',
    ],
    buyer_negative: [
      'Cleaning was very good overall but the insides of the kitchen cupboards were not cleaned as was clearly agreed.',
      'Good job but the team arrived 25 minutes late and missed the top floor window cleaning before leaving.',
    ],
    seller_positive: [
      'Clean and well-maintained property made the work straightforward. Client was clear about priorities from the start.',
      'Good communication before and after. Client conducted a fair walkthrough and released payment the same afternoon.',
      'All requested cleaning products were stocked on-site exactly as agreed. Very easy and professional client to work with.',
    ],
  },
  Delivery: {
    buyer_positive: [
      'Every single piece of furniture arrived at the new house without a scratch. Team was fast, careful, and very professional.',
      'All 20 deliveries completed by 3:30pm with signed receipts photographed and sent to me. Excellent service all day.',
      'Driver arrived five minutes early with a spotless vehicle. My guests arrived to a wonderful first impression. Excellent.',
      'Equipment arrived at the venue 30 minutes before we needed it. Return pickup was also prompt and completely hassle-free.',
      'The children arrive at school on time every morning and the driver is always calm and courteous. Absolute peace of mind.',
    ],
    buyer_negative: [
      'The move was completed but two fragile boxes were not wrapped as I had clearly requested. Thankfully nothing was broken.',
      'Arrived 40 minutes late on the day but the driver called ahead to warn us. Overall the job was done to a good standard.',
    ],
    seller_positive: [
      'All items were carefully packed and clearly labelled before our arrival. Loading was very quick as a result.',
      'Client was available at both locations and sent very clear directions. Absolutely smooth job from pickup to delivery.',
      'All recipient addresses were accurate and everyone was home and ready. No complications throughout a long day.',
    ],
  },
  'Design & Print': {
    buyer_positive: [
      'The logo designs went far beyond what we expected. Strong concepts, a smooth revision process, and files delivered on time.',
      'Every church member has complimented the anniversary materials. The programme booklet in particular is beautiful quality.',
      'Customers have been complimenting the new menu constantly since the relaunch. The designer really captured our feel.',
      'School marketing materials looked premium and completely consistent. Three parents asked who designed them at the open day.',
      'Product labels look incredibly professional. Online sales increased noticeably in the first week after switching packaging.',
      'All 30 social media posts are stunning and perfectly consistent. The launch campaign has had our best ever engagement.',
    ],
    buyer_negative: [
      'Design quality was excellent but the first revision round took three days to turn around. Had expected a faster response.',
      'Final designs were very good but one file was delivered in RGB colour profile instead of the CMYK I had specified.',
    ],
    seller_positive: [
      'Client provided all content assets upfront and gave specific, constructive feedback at each review stage. Very easy brief.',
      'Organised client with a clear vision from day one. Designs approved quickly and payment released the same day.',
      'Comprehensive brief and reference materials from day one made this a straightforward job. A genuinely professional client.',
    ],
  },
  Catering: {
    buyer_positive: [
      'Food was absolutely exceptional and guests are still talking about it two weeks later. Team was organised and left nothing behind.',
      'Office lunches are always on time, portions are very generous, and variety keeps our team genuinely happy every week.',
      'The birthday party was a real success and the catering was a big part of that. Appetisers were the highlight of the evening.',
      'Boardroom lunch was presented beautifully and every dietary requirement was handled perfectly without any awkwardness.',
      'Funeral reception was conducted with dignity and care. The fufu and light soup received enormous compliments from the elders.',
      'Naming ceremony catering was exactly right for the occasion. Food was fresh, plentiful, and the team was perfectly presented.',
    ],
    buyer_negative: [
      'Food quality was very good but the team arrived 20 minutes behind schedule which pushed the buffet opening slightly late.',
      'Generally excellent but they ran slightly short on jollof rice for the very last guests in the queue at the buffet.',
    ],
    seller_positive: [
      'Venue was fully prepared and client had communicated all guest numbers and dietary needs accurately well in advance.',
      'Decisive client who confirmed menu choices promptly and responded to all our questions within the hour. Great to work with.',
      'A professional client who respected all agreed timelines. Payment was transferred the same evening after the event.',
    ],
  },
  'IT & Tech Support': {
    buyer_positive: [
      'Network is running perfectly and fast throughout both floors. The documentation is clear enough for our admin to use daily.',
      'All eight laptops are running quickly and securely now. Thorough and systematic work that did not disrupt a single working day.',
      'Website looks polished and loads fast on mobile. Training session was excellent and I can now manage all updates myself.',
      'QuickBooks is configured correctly and I finally have a clear picture of my accounts. Training was very practical and clear.',
      'CCTV system is excellent. Remote viewing works on all our devices and the night-vision picture quality is very sharp.',
      'Shopify store is live and already processing mobile money orders. Setup and training were both comprehensive and thorough.',
    ],
    buyer_negative: [
      'Good technical work but the job ran a full day longer than quoted. Earlier communication of the delay would have helped.',
      'Network setup was solid but the handover documentation was less detailed than I had been told to expect.',
    ],
    seller_positive: [
      'Office was fully clear and ready for work to begin. Admin staff were available and helpful when we needed assistance.',
      'Client had prepared very clear questions for the handover training session which made it efficient and thorough.',
      'Excellent brief provided upfront. All login credentials and access details were shared promptly without needing to ask.',
    ],
  },
};

const SELLER_BIOS = [
  'Certified plumber and building technician with over eight years servicing residential and commercial properties across Accra.',
  'Patient and results-focused academic tutor with experience preparing students for BECE, WASSCE, and university entrance exams.',
  'Professional photographer specialising in events, corporate, and product photography with a studio in East Legon, Accra.',
  'Experienced residential and commercial cleaning team leader with trained staff and professional-grade equipment across Accra.',
  'Reliable logistics and delivery service operator with covered vehicle and a strong track record across Greater Accra and beyond.',
  'Brand identity and print designer producing premium visual assets for SMEs and event organisers across Ghana.',
  'Traditional and contemporary Ghanaian caterer with experience at weddings, corporate events, and daily office catering.',
  'IT support technician offering network setup, device repair, and custom software configuration for Accra-based businesses.',
  'Skilled handyman and home maintenance specialist covering carpentry, electrical, and general household repairs in Tema and Accra.',
  'Experienced WASSCE and BECE tutor with a structured teaching method and consistently strong student results over six years.',
  'Wedding and events photographer based in Kumasi serving clients across the Ashanti and Greater Accra regions.',
  'Commercial and residential deep cleaning specialist with fully equipped team and flexible scheduling for Accra and Tema.',
  'Inter-city and intra-city courier operator with own vehicle fleet and established same-day delivery routes across Ghana.',
  'Graphic designer and print production manager delivering consistent brand materials for businesses and churches nationwide.',
  'Professional Ghanaian caterer and event food coordinator with experience across all scales from intimate to large outdoor funerals.',
  'Full-stack web developer and IT consultant offering website builds, e-commerce setup, and business software configuration.',
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFrom(list) {
  return list[randomInt(0, list.length - 1)];
}

function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickUnique(list, count) {
  const copy = [...list];
  const picked = [];
  while (copy.length && picked.length < count) {
    const idx = randomInt(0, copy.length - 1);
    picked.push(copy[idx]);
    copy.splice(idx, 1);
  }
  return picked;
}

function randomTemplateForCategory(category) {
  const templates = CATEGORY_TEMPLATES[category] || [];
  if (!templates.length) {
    return {
      title: `${category} service request`,
      description: `Need a verified provider for ${category.toLowerCase()} work. Please provide a clear quote with timeline and scope.`,
      budgetRange: [300, 2500],
    };
  }
  return randomFrom(templates);
}

function sampleIntakeDetails(category) {
  switch (category) {
    case 'Home Repairs':
      return {
        location: randomFrom(GHANA_LOCATIONS),
        issue_type: randomFrom(['Plumbing', 'Electrical', 'Carpentry', 'Tiling', 'AC Service', 'Metalwork']),
        access_window: randomFrom(['Weekdays 8am–5pm', 'Saturday morning', 'Any day after 2pm', 'Weekends only', 'Flexible']),
      };
    case 'Tutoring':
      return {
        subject: randomFrom(['Elective Mathematics', 'Core Maths', 'Integrated Science', 'English Language', 'Python / Data', 'French', 'Social Studies']),
        level: randomFrom(['Primary', 'JHS', 'SHS', 'University', 'Adult Professional']),
        sessions_per_week: String(randomInt(2, 4)),
      };
    case 'Photography':
      return {
        shoot_type: randomFrom(['Graduation', 'Product', 'Corporate Event', 'Traditional Wedding', 'Naming Ceremony', 'Restaurant / Food']),
        event_date: new Date(Date.now() + randomInt(3, 28) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        deliverables: randomFrom(['80+ edited photos', '150 edited photos + gallery link', 'Web + print formats', 'Same-day social media preview']),
      };
    case 'Cleaning':
      return {
        property_size: randomFrom(['2-bedroom apartment', '3-bedroom apartment', '4-bedroom house', 'Office – 200sqm', 'Residential estate']),
        frequency: randomFrom(['One-time deep clean', 'Weekly recurring', 'Monthly recurring', 'Post-event/renovation']),
        supplies_provided: randomFrom(['Yes', 'No – team must supply']),
      };
    case 'Delivery':
      return {
        pickup_location: randomFrom(['Tema', 'Spintex', 'Dansoman', 'Darkuman', 'Madina', 'Accra CBD']),
        dropoff_location: randomFrom(['Adenta', 'Labone', 'Kumasi', 'Kasoa', 'East Legon', 'KIA Airport']),
        load_type: randomFrom(['Full household furniture', 'Parcel deliveries', 'Event equipment', 'Branded cargo', 'School children']),
      };
    case 'Design & Print':
      return {
        asset_type: randomFrom(['Brand identity package', 'Event flyer + banner', 'Menu design', 'Social media content', 'Product labels']),
        quantity: randomFrom(['500 copies', '1000 copies', 'Digital only', '200 copies + digital']),
        print_deadline: randomFrom(['5 working days', '8 working days', '10 working days', 'Flexible']),
      };
    case 'Catering':
      return {
        guest_count: String(randomInt(15, 200)),
        event_type: randomFrom(['Engagement / Knocking', 'Office daily lunch', 'Birthday party', 'Boardroom lunch', 'Funeral reception', 'Naming ceremony']),
        location: randomFrom(GHANA_LOCATIONS),
      };
    case 'IT & Tech Support':
      return {
        service_type: randomFrom(['Network setup', 'Device cleanup / antivirus', 'Website development', 'Accounting software setup', 'CCTV installation', 'E-commerce setup']),
        location: randomFrom(GHANA_LOCATIONS),
        timeline: randomFrom(['Urgent – within 48 hours', '3–5 working days', '1 week', 'Flexible']),
      };
    default:
      return {};
  }
}

function sampleBidProposal(category) {
  const detailByCategory = {
    'Home Repairs': randomFrom(['All materials and consumables included in bid price', 'Site inspection and full parts sourcing included']),
    Tutoring: randomFrom(['Weekly progress quizzes with tracked performance data', 'Personalised lesson plan with monthly mock assessment']),
    Photography: randomFrom(['Professional lighting setup and colour-corrected gallery delivery', 'RAW capture with fully edited digital gallery and same-day previews']),
    Cleaning: randomFrom(['Detailed room-by-room completion checklist provided', 'Eco-friendly certified products and full sanitisation workflow']),
    Delivery: randomFrom(['Live delivery updates via WhatsApp and signed proof of delivery', 'Protective wrapping and route-optimised same-day completion']),
    'Design & Print': randomFrom(['Minimum three concept options plus two revision rounds included', 'Brand-consistent layout with full CMYK print-ready file delivery']),
    Catering: randomFrom(['Full traditional Ghanaian menu with serving staff and cleanup included', 'Freshly prepared food delivered with complete setup and clearing team']),
    'IT & Tech Support': randomFrom(['Full installation with documentation and handover training session', 'Certified setup with 30-day free support period after completion']),
  };

  return {
    timeline_days: randomInt(1, 12),
    supervision_plan: randomFrom(['Daily WhatsApp updates throughout the job', 'Milestone check-ins every two days', 'Before and after photos at each stage']),
    milestone_plan: randomFrom(['Kickoff, draft, final handoff', 'Inspection, execution, quality check, handoff', 'Phase 1 draft, phase 2 revisions, final delivery']),
    category_detail: detailByCategory[category] || 'Full delivery details provided on request',
  };
}

// Weighted rating distribution — realistic, skewed high
function randomRatingInt() {
  const roll = Math.random();
  if (roll < 0.05) return 2;
  if (roll < 0.12) return 3;
  if (roll < 0.28) return 4;
  return 5;
}

function randomComment(category, direction, isPositive) {
  const pool = REVIEW_COMMENTS[category];
  if (!pool) return '';
  const key = isPositive
    ? (direction === 'buyer_to_seller' ? 'buyer_positive' : 'seller_positive')
    : 'buyer_negative';
  const comments = pool[key] || [];
  if (!comments.length) return '';
  return randomFrom(comments);
}

async function createUsers() {
  const buyers = [];
  const sellers = [];
  const providerProfiles = [];

  for (let i = 0; i < BUYER_NAMES.length; i += 1) {
    const buyer = new User({
      email: `buyer${i + 1}@example.com`,
      password: PASSWORD,
      name: BUYER_NAMES[i],
      roles: ['buyer'],
      verified: true,
    });
    await buyer.save();
    buyers.push(buyer);
  }

  for (let i = 0; i < SELLER_NAMES.length; i += 1) {
    const categoryPool = shuffle(CATEGORIES).slice(0, randomInt(1, 3));

    const seededSkills = {
      'Home Repairs': ['Polytank repair and installation', 'Float valve replacement', 'Pipe fitting', 'Tiling', 'AC servicing', 'Burglar bar fabrication'],
      Tutoring: ['WASSCE exam prep', 'One-on-one tutoring', 'Lesson planning', 'Progress tracking', 'BECE preparation'],
      Photography: ['Event photography', 'Portrait photography', 'Product photography', 'Photo retouching', 'Studio lighting'],
      Cleaning: ['Deep cleaning', 'Post-construction cleanup', 'Office sanitation', 'Carpet steam cleaning', 'Eco-friendly products'],
      Delivery: ['Same-day parcel delivery', 'Furniture moving', 'Route optimisation', 'Inter-city cargo', 'Event logistics'],
      'Design & Print': ['Logo design', 'Event flyer design', 'Print-ready setup', 'Brand identity', 'Social media content'],
      Catering: ['Traditional Ghanaian cuisine', 'Corporate catering', 'Event buffet service', 'Daily office lunch', 'Wedding catering'],
      'IT & Tech Support': ['Network setup', 'Malware removal', 'Website development', 'CCTV installation', 'QuickBooks setup', 'Shopify development'],
    };

    const skills = categoryPool.flatMap((cat) => seededSkills[cat] || [cat]).slice(0, 8);
    const primaryCity = randomFrom(['Accra', 'Tema', 'Kumasi', 'Takoradi']);

    const seller = new User({
      email: `seller${i + 1}@example.com`,
      password: PASSWORD,
      name: SELLER_NAMES[i],
      roles: ['seller'],
      verified: true,
      seller_profile: {
        bio: SELLER_BIOS[i],
        hourly_rate: randomInt(40, 150),
        portfolio_url: `https://portfolio.example/seller${i + 1}`,
        skills,
      },
    });

    await seller.save();
    sellers.push(seller);

    providerProfiles.push({
      user_id: seller._id,
      headline: `${categoryPool[0]} specialist delivering reliable results across ${primaryCity} and surrounding areas`,
      city: primaryCity,
      country: 'Ghana',
      is_online: Math.random() < 0.6,
      verification: {
        national_id_verified: true,
        phone_verified: true,
        background_check_cleared: Math.random() < 0.9,
        skill_assessment_passed: true,
        callback_guarantee_active: Math.random() < 0.75,
        electrical_badge: Math.random() < 0.25,
      },
      reliability: {
        avg_response_minutes: randomInt(15, 60),
        bid_acceptance_rate: randomInt(55, 92),
        job_completion_rate: randomInt(88, 100),
        on_time_arrival_rate: randomInt(82, 99),
        repeat_clients: randomInt(2, 30),
        disputes_filed: randomInt(0, 2),
      },
      skills,
      categories_served: categoryPool.map((name) => ({ name, count: randomInt(3, 25) })),
      weekly_availability: [
        ['available', 'available', 'available', 'available', 'available', 'partial', 'off'],
        ['available', 'available', 'available', 'available', 'partial', 'partial', 'off'],
        ['available', 'available', 'available', 'available', 'available', 'off', 'off'],
      ],
    });
  }

  if (providerProfiles.length) await ProviderProfile.insertMany(providerProfiles);

  return { buyers, sellers };
}

function createJobDocs(buyers) {
  const now = Date.now();
  const jobs = [];
  const jobsPerCategory = 10;

  for (const category of CATEGORIES) {
    const templates = CATEGORY_TEMPLATES[category] || [];

    for (let i = 0; i < jobsPerCategory; i += 1) {
      const owner = randomFrom(buyers);
      const template = templates[i % templates.length];
      const budget = randomInt(template.budgetRange[0], template.budgetRange[1]);
      const hoursUntilDeadline = randomInt(18, 288);
      const deadline = new Date(now + hoursUntilDeadline * 60 * 60 * 1000);

      jobs.push({
        title: template.title,
        description: template.description,
        category,
        intake_details: sampleIntakeDetails(category),
        budget,
        owner_id: owner._id,
        deadline,
        sealed_until: deadline,
        status: 'open',
        bids_count: 0,
        escrow_released: false,
        rating_given: false,
        createdAt: new Date(now - randomInt(1, 20) * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      });
    }
  }

  return jobs;
}

async function createBidsAndFinalizeJobs(jobs, sellers) {
  const bidsToInsert = [];
  const jobBulkOps = [];
  const bidBulkOps = [];
  const reviewsToInsert = [];

  for (const job of jobs) {
    const sellerCountForJob = randomInt(3, Math.min(9, sellers.length));
    const chosenSellers = pickUnique(sellers, sellerCountForJob);

    for (const seller of chosenSellers) {
      const maxAllowed = Math.max(100, Number(job.budget) - randomInt(30, 250));
      const amount = randomInt(80, maxAllowed);

      bidsToInsert.push({
        job_id: job._id,
        seller_id: seller._id,
        amount,
        note: `Experienced ${job.category.toLowerCase()} provider. My quote of GH¢ ${amount.toLocaleString()} covers all agreed deliverables as described.`,
        proposal: sampleBidProposal(job.category),
        sealed: true,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    jobBulkOps.push({
      updateOne: {
        filter: { _id: job._id },
        update: { $set: { bids_count: sellerCountForJob } },
      },
    });
  }

  await Bid.insertMany(bidsToInsert);

  const allBids = await Bid.find({}).lean();
  const bidsByJobId = new Map();
  allBids.forEach((bid) => {
    const key = String(bid.job_id);
    if (!bidsByJobId.has(key)) bidsByJobId.set(key, []);
    bidsByJobId.get(key).push(bid);
  });

  for (const job of jobs) {
    const key = String(job._id);
    const jobBids = bidsByJobId.get(key) || [];
    if (jobBids.length === 0) continue;

    const shouldClose = Math.random() < 0.70;
    if (!shouldClose) continue;

    const winningBid = [...jobBids].sort((a, b) => a.amount - b.amount)[0];
    const completed = Math.random() < 0.40;
    const newStatus = completed ? 'completed' : 'closed';

    const completionDate = new Date(Date.now() - randomInt(1, 10) * 24 * 60 * 60 * 1000);
    const contractDate = new Date(completionDate.getTime() - randomInt(3, 14) * 24 * 60 * 60 * 1000);

    const updatePayload = {
      status: newStatus,
      winning_bid_id: winningBid._id,
      escrow_amount: winningBid.amount,
      sealed_until: new Date(),
      updatedAt: new Date(),
    };

    if (completed) {
      updatePayload.workflow_stage = 'completed';
      updatePayload.completion_date = completionDate;
      updatePayload.payment_released_at = completionDate;
      updatePayload.escrow_released = true;
      updatePayload.escrow_deposited_at = contractDate;
      updatePayload.work_started_at = new Date(contractDate.getTime() + randomInt(1, 3) * 24 * 60 * 60 * 1000);
      updatePayload.work_submitted_at = new Date(completionDate.getTime() - randomInt(1, 3) * 24 * 60 * 60 * 1000);
      updatePayload.contract_terms = {
        scope: job.description.slice(0, 300),
        deadline: new Date(completionDate.getTime() + 5 * 24 * 60 * 60 * 1000),
        agreed_price: winningBid.amount,
        buyer_confirmed: true,
        seller_confirmed: true,
        confirmed_at: contractDate,
      };
    } else {
      updatePayload.workflow_stage = randomFrom(['contract', 'escrow', 'in_progress']);
    }

    jobBulkOps.push({
      updateOne: {
        filter: { _id: job._id },
        update: { $set: updatePayload },
      },
    });

    for (const bid of jobBids) {
      if (String(bid._id) === String(winningBid._id)) {
        bidBulkOps.push({
          updateOne: {
            filter: { _id: bid._id },
            update: { $set: { status: 'accepted', sealed: false, accepted_date: new Date(), updatedAt: new Date() } },
          },
        });
      } else {
        bidBulkOps.push({
          updateOne: {
            filter: { _id: bid._id },
            update: { $set: { status: 'rejected', sealed: false, updatedAt: new Date() } },
          },
        });
      }
    }

    if (completed) {
      const buyerRating = randomRatingInt();
      const sellerRating = randomRatingInt();

      reviewsToInsert.push({
        job_id: job._id,
        buyer_id: job.owner_id,
        seller_id: winningBid.seller_id,
        reviewer_id: job.owner_id,
        reviewee_id: winningBid.seller_id,
        rating: buyerRating,
        quality_rating: Math.min(5, Math.max(1, buyerRating + randomInt(-1, 1))),
        communication_rating: Math.min(5, Math.max(1, buyerRating + randomInt(-1, 1))),
        timeliness_rating: Math.min(5, Math.max(1, buyerRating + randomInt(-1, 0))),
        comment: randomComment(job.category, 'buyer_to_seller', buyerRating >= 4),
        createdAt: new Date(completionDate.getTime() + randomInt(1, 24) * 60 * 60 * 1000),
      });

      reviewsToInsert.push({
        job_id: job._id,
        buyer_id: job.owner_id,
        seller_id: winningBid.seller_id,
        reviewer_id: winningBid.seller_id,
        reviewee_id: job.owner_id,
        rating: sellerRating,
        quality_rating: Math.min(5, Math.max(1, sellerRating + randomInt(-1, 1))),
        communication_rating: Math.min(5, Math.max(1, sellerRating + randomInt(-1, 1))),
        timeliness_rating: Math.min(5, Math.max(1, sellerRating + randomInt(-1, 0))),
        comment: randomComment(job.category, 'seller_to_buyer', sellerRating >= 4),
        createdAt: new Date(completionDate.getTime() + randomInt(2, 36) * 60 * 60 * 1000),
      });
    }
  }

  if (jobBulkOps.length) await Job.bulkWrite(jobBulkOps);
  if (bidBulkOps.length) await Bid.bulkWrite(bidBulkOps);
  if (reviewsToInsert.length) await Review.insertMany(reviewsToInsert);
}

async function updateUserRatingsAndStats() {
  const users = await User.find({}, { _id: 1 });

  for (const user of users) {
    const receivedReviews = await Review.find({ reviewee_id: user._id }, { rating: 1 });
    const reviewsCount = receivedReviews.length;
    const averageRating = reviewsCount
      ? Number((receivedReviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount).toFixed(2))
      : null;

    const acceptedBidJobIds = (await Bid.find({ seller_id: user._id, status: 'accepted' }, { job_id: 1 })).map((b) => b.job_id);
    const completedJobs = await Job.countDocuments({
      winning_bid_id: { $ne: null },
      status: { $in: ['closed', 'completed'] },
      _id: { $in: acceptedBidJobIds },
    });

    const updateData = { reviews_count: reviewsCount, total_jobs_completed: completedJobs, updatedAt: new Date() };
    if (averageRating !== null) updateData.average_rating = averageRating;

    await User.findByIdAndUpdate(user._id, updateData);
  }
}

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Missing MONGODB_URI in server/.env');

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  await Review.deleteMany({});
  await Bid.deleteMany({});
  await Job.deleteMany({});
  await ProviderProfile.deleteMany({});
  await User.deleteMany({});
  console.log('Cleared existing data');

  const { buyers, sellers } = await createUsers();
  console.log(`Created ${buyers.length} buyers and ${sellers.length} sellers`);

  const jobDocs = createJobDocs(buyers);
  const jobs = await Job.insertMany(jobDocs);
  console.log(`Inserted ${jobs.length} jobs`);

  await createBidsAndFinalizeJobs(jobs, sellers);
  await updateUserRatingsAndStats();

  console.log('\n=== Seed complete ===');
  console.log('Users:', await User.countDocuments());
  console.log('Jobs:', await Job.countDocuments());
  console.log('Bids:', await Bid.countDocuments());
  console.log('Reviews:', await Review.countDocuments());
  console.log('Open jobs:', await Job.countDocuments({ status: 'open' }));
  console.log('Completed jobs:', await Job.countDocuments({ status: 'completed' }));

  await mongoose.disconnect();
  console.log('Disconnected');
}

seed().catch(async (err) => {
  console.error('Seeding failed:', err.message);
  await mongoose.disconnect();
  process.exit(1);
});
