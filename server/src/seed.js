import dotenv from 'dotenv';
import mongoose from 'mongoose';

import User from './models/User.js';
import Job from './models/Job.js';
import Bid from './models/Bid.js';
import Review from './models/Review.js';
import ProviderProfile from './models/Provider.js';

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
  'Maame Serwaa Asante', 'Fiifi Benson', 'Ekow Mensah', 'Akua Asante',
  'Obeng Darko', 'Serwaa Boateng', 'Nana Ama Acheampong', 'Yaa Amponsah',
  'Kwabena Osei', 'Abigail Frempong', 'Baffour Quainoo', 'Mabel Antwi',
  'Raymond Darko',
];

const SELLER_NAMES = [
  'Kwabena Twumasi', 'Akua Bonsu', 'Emmanuel Agyemang', 'Abigail Tetteh',
  'Samuel Ofori', 'Priscilla Asiedu', 'Bright Amoah', 'Cecilia Dankwa',
  'Joseph Mensah', 'Benedicta Quaye', 'Kweku Baffour', 'Nana Ama Darko',
  'Prince Ofosu', 'Vivian Opoku', 'Aaron Kwarteng', 'Elsie Boampong',
  'Kofi Sarpong', 'Gifty Owusu', 'Bernard Asante', 'Felicia Nyarko',
  'Desmond Boateng', 'Patience Tawiah', 'Reginald Acheampong', 'Diana Mensah',
  'Maxwell Asiedu',
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
      title: 'Repair leaking polytank and replace float valve',
      description: 'The 5,000-litre overhead polytank has been dripping for three weeks and developed a visible crack near the base fitting. The float valve no longer shuts off flow properly, so the overflow pipe runs all night. I need a qualified plumber to inspect the tank, replace the float valve with a quality brass unit, seal the crack with polytank repair compound, check all inlet and outlet pipework, and do a pressure test before handoff. All materials should be included in the quote. Work must be completed within two working days.',
      budgetRange: [280, 950],
    },
    {
      title: 'Replaster cracked bedroom walls and repaint',
      description: 'Two bedroom walls have developed hairline and structural cracks from building settlement. The master bedroom has three cracks about 1.5 metres long running from window corners. The second bedroom has minor surface cracks near the cornice. I need a skilled tradesman to chip out all damaged sections, apply bonding agent, replaster to a smooth finish, sand back, prime, and apply two coats of Dulux emulsion in the existing off-white shade. The house is occupied so dustsheets and careful cleanup are essential.',
      budgetRange: [450, 1600],
    },
    {
      title: 'Full service of split AC unit, cooling performance reduced',
      description: 'A 1.5-tonne Midea inverter split AC has been running two years and cooling has dropped noticeably over the past month. The unit blows slightly warm air during peak afternoon hours and the outdoor compressor sounds louder than usual. I need a certified technician to do a full diagnostic, deep clean the indoor and outdoor coils, check and top up refrigerant as needed, inspect all electrical connections and capacitors, and test the unit under load for at least 30 minutes. A written service report is required before payment.',
      budgetRange: [320, 1200],
    },
    {
      title: 'Replace water-damaged POP ceiling across two rooms',
      description: 'Water stains from a roof leak have damaged about 15 square metres of POP ceiling boards across the living room and a guest bedroom. The roof has been repaired but the boards remain discoloured, some have bowed, and two sections have small cracks. I need a ceiling contractor to remove and replace only the affected sections, confirm the framing timber is dry and sound, install matching white POP boards with clean joins, apply two coats of ceiling paint, and leave all surfaces spotless.',
      budgetRange: [600, 2200],
    },
    {
      title: 'Fabricate and install burglar bars on six windows',
      description: 'A ground-floor apartment needs iron burglar bars on six windows and a steel security grill on the back utility door. The windows are wooden-frame louvre type approximately 90cm by 120cm each. I need a metalwork fabricator to measure all openings on site, fabricate bars using at least 16mm round iron rods with welded cross bracing at 30cm intervals, and install all pieces securely using rawlbolts. Finish should be black hammered paint over anti-rust red oxide primer. Include all materials, fabrication, and installation.',
      budgetRange: [900, 3000],
    },
    {
      title: 'Full bathroom retile with new toilet and wall-hung basin',
      description: 'A 4-square-metre bathroom requires complete ceramic tile replacement from floor to ceiling. Existing tiles are cracked in multiple locations and grout lines are badly moulded. I also want to replace the old low-cistern toilet with a modern close-couple unit and swap the pedestal basin for a wall-hung basin with chrome bottle-trap fittings. Quote should include labour, tile adhesive, grout, plumbing fittings, and disposal of all old fixtures. A portfolio of previous bathroom projects is strongly preferred.',
      budgetRange: [2500, 7000],
    },
    {
      title: 'Borehole pump repair, low pressure and frequent tripping',
      description: 'A one-inch borehole pump has been problematic for three months, tripping the circuit breaker every few days. When running, pressure is lower than normal. I suspect bearing wear, a failing pressure switch, or a drop in the water table. I need a borehole technician to pull the pump, check the motor windings and bearings, test the pressure switch and starter capacitor, reinstall or replace as needed, and adjust the pressure switch to correct cut-in and cut-out settings. Please include a diagnosis visit in your quote.',
      budgetRange: [500, 2000],
    },
    {
      title: 'Install concealed electrical wiring across five rooms',
      description: 'A newly renovated four-bedroom house in Adenta needs full concealed electrical wiring across five rooms that were plastered without conduit runs. Work includes cutting conduit channels in plastered walls, laying concealed PVC conduit, pulling wiring for sockets, switches, and lighting points in each room, fitting all back boxes and faceplates, connecting to the distribution board, and testing all circuits before final handover. All materials and labour to be included in quote. Minimum 10mm twin-and-earth cable throughout.',
      budgetRange: [800, 3000],
    },
    {
      title: 'Repair compound gate and rehang wooden entrance door',
      description: 'The steel compound gate has a broken hinge weld and the frame has shifted so it no longer closes flush. The wooden entrance door to the house also has a failing hinge and the bottom rail has swollen, making it very hard to shut properly. I need a metalwork and carpentry handyman to reweld and reinforce the gate hinge, realign the gate frame, plane and reshape the door bottom rail, replace both door hinges with heavy-duty brass units, and rehang the door level. Compound is in Spintex Road area. Bring all necessary tools and materials.',
      budgetRange: [300, 1100],
    },
    {
      title: 'Waterproof and tile an open-air rooftop terrace',
      description: 'A 40-square-metre open rooftop terrace on a two-storey house in Labone is currently unfinished concrete with cracked screed and no waterproofing. I need a contractor to apply a full liquid membrane waterproofing system over the entire deck area and up the parapet walls, allow proper curing time, lay anti-slip outdoor ceramic tiles throughout, grout all joints with waterproof grout, and install a clean aluminium edge trim at the terrace boundary. Quote should include all waterproofing materials, tiles, adhesive, grout, and trims.',
      budgetRange: [2000, 6500],
    },
    {
      title: 'Fix roof leak above master bedroom during rainy season',
      description: 'The corrugated iron roof above the master bedroom and adjacent bathroom leaks during heavy rain. There are two clear entry points visible from outside where the roofing sheets have lifted slightly at the ridge and where a flashing has corroded away. I need an experienced roofing technician to access the roof safely, identify all leak points, replace corroded flashings, reseat lifted roofing sheets, seal all ridge and hip joints with appropriate roofing sealant, and test with water before leaving the site. Please include materials and confirm your safety equipment is in good order.',
      budgetRange: [400, 1500],
    },
    {
      title: 'Install 2,000-litre underground water storage tank',
      description: 'I want to install a 2,000-litre underground plastic water storage tank beside the house in Tema to act as a backup supply. Work includes excavation of the pit to the correct depth, bedding the tank on a level sand base, connecting the inlet from the overhead supply line and the outlet to the house pump via buried HDPE pipes, fitting a manual isolation valve, backfilling and compacting around the tank, and testing the full supply loop from tank to internal fixtures. The installer supplies all pipes, fittings, valves, and any necessary concrete cradle.',
      budgetRange: [1200, 4000],
    },
  ],
  Tutoring: [
    {
      title: 'WASSCE elective maths intensive, series and calculus',
      description: 'My daughter is in Form 3 and struggling with elective maths units covering arithmetic and geometric progressions, three-dimensional vectors, and introductory calculus. Her internal exam scores average 38 percent and her WASSCE is six months away. I need a tutor to assess her current level, build an eight-week study plan, deliver two-hour sessions twice weekly, provide worked example sheets for every topic, assign weekly practice questions, and run two full mock test sessions in the final two weeks. Familiarity with the WAEC marking scheme is essential.',
      budgetRange: [350, 1400],
    },
    {
      title: 'JHS Science and Mathematics coaching, three evenings weekly',
      description: 'My son is in JHS 2 and falling behind in Integrated Science and Core Mathematics. His science teacher moves too fast through topics like light refraction, electricity, and nutrition. In maths he struggles with directed numbers, fractions, ratios, and algebraic word problems. I need a patient tutor to visit our home three evenings per week for 90-minute sessions. The tutor should set and mark assignments between sessions, keep a progress log, and provide a brief written update every two weeks.',
      budgetRange: [300, 1100],
    },
    {
      title: 'Python and data analysis coaching for working professional',
      description: 'I am a marketing analyst with no prior coding experience but I understand spreadsheets and basic statistics. I need a tutor to teach me Python fundamentals through practical exercises using pandas and matplotlib, with examples drawn from marketing data. Sessions should be two hours each, twice a week for eight weeks, at my home or via Google Meet. The tutor must provide structured notes after each session and set project assignments between sessions.',
      budgetRange: [500, 2000],
    },
    {
      title: 'Primary school reading and comprehension support, Grade 4',
      description: 'My daughter in Grade 4 is having difficulty with reading comprehension, vocabulary development, and writing structured paragraphs. She communicates well verbally but loses confidence with longer passages or written tasks. I need a warm and patient tutor with primary education experience to work with her for 60 minutes twice per week, use age-appropriate reading materials, build vocabulary through games and shared reading, and track her progress clearly. Sessions will be at our home in the late afternoon.',
      budgetRange: [250, 900],
    },
    {
      title: 'University economics tutoring, Stata and regression analysis',
      description: 'I am a second-year economics student struggling with quantitative economics and statistics modules. I specifically need help with hypothesis testing, confidence intervals, multiple regression analysis, and interpreting econometric output from Stata. My mid-semester examinations are in three weeks and grades this semester have been poor. I need a tutor with a strong quantitative background, ideally a graduate student or junior lecturer, who can explain concepts clearly and work through past examination papers.',
      budgetRange: [400, 1600],
    },
    {
      title: 'French conversation lessons for adult beginner',
      description: 'I have accepted a professional role in Abidjan and will be relocating in four months. I have no prior French beyond basic travel phrases. I need a fluent French speaker to teach me practical conversational French from the ground up. Topics should include workplace vocabulary, courtesy expressions, numbers and currency, asking for directions, and basic social conversation. I want 90-minute sessions twice weekly at my home or via video call. Monthly progress reviews to assess speaking confidence are important.',
      budgetRange: [350, 1300],
    },
    {
      title: 'BECE full preparation, all core subjects, Kumasi',
      description: 'My son is in JHS 3 and sitting the BECE in four months. His terminal mock results were unsatisfactory: English 52 percent, Maths 44 percent, Social Studies 48 percent. He is a capable student but lacks exam technique and time management. I need a tutor with BECE preparation experience to work across all three core subjects, focusing on past paper practice, time-allocation strategy, and filling key knowledge gaps. Sessions should be four evenings per week, two hours each.',
      budgetRange: [450, 1700],
    },
    {
      title: 'A-level accounting and business studies coaching, SHS 2',
      description: 'My daughter is in SHS 2 studying Business and is weak in both Accounting and Business Management. She struggles with ledger entries, trial balances, trading accounts, and strategic management theory. I need a business teacher or professional with teaching experience to deliver two sessions per week of 90 minutes each at our East Legon home. The tutor should provide model answers for past WASSCE questions, build a structured revision timetable, and conduct a mock exam at the midway point.',
      budgetRange: [400, 1500],
    },
    {
      title: 'After-school STEM support for two primary school children',
      description: 'I need a STEM-focused tutor to work with my son (Grade 5) and daughter (Grade 3) for 90 minutes three times per week after school at our Tema home. The focus is building curiosity and confidence in maths and basic science rather than pure exam drilling. I want the tutor to use hands-on activities, puzzles, and structured exercises. Both children are bright but easily distracted. The tutor must be energetic and patient with this age group. Weekly feedback to me on both children is required.',
      budgetRange: [300, 1200],
    },
    {
      title: 'Corporate presentation and public speaking coaching',
      description: 'I am a mid-level manager preparing for a series of board presentations and want professional coaching in public speaking, slide design principles, and executive presence. I need at least six one-hour sessions combining theory, video review of practice presentations, and structured feedback. Sessions can be in person at my Cantonments office or via video call. The coach should have experience working with professionals in a corporate setting and be able to provide a personalised development plan after the first assessment session.',
      budgetRange: [600, 2200],
    },
    {
      title: 'IELTS preparation intensive, target band 7.0',
      description: 'I am preparing for the IELTS Academic test in eight weeks and am targeting a band score of 7.0 for a UK university application. My current estimated level is around 5.5. I need an experienced IELTS tutor to deliver sessions covering all four skills: listening, reading, writing, and speaking. Special focus on Task 1 and Task 2 writing and the speaking interview format. I want at least two full timed mock tests during the preparation period with detailed score feedback. Sessions twice a week, 2 hours each, at my Accra home or online.',
      budgetRange: [500, 1800],
    },
    {
      title: 'Senior high school physics coaching, mechanics and waves',
      description: 'My nephew is in SHS 3 and failing elective physics with particular weakness in mechanics, waves, and electricity. He has a mock WASSCE in two months. I need an experienced SHS physics tutor to work with him three evenings weekly, delivering structured sessions using past exam questions from the start. The tutor must diagnose his specific gaps in the first session, build a focused revision plan, provide worked solutions to all practice questions, and conduct a timed mock test by week four. Must be available on short notice for an initial assessment call.',
      budgetRange: [400, 1500],
    },
  ],
  Photography: [
    {
      title: 'Graduation portrait session and digital album, KNUST',
      description: 'My son is graduating from KNUST and I want professional graduation portraits at the campus and a scenic outdoor location in Kumasi. I want a minimum of 80 edited high-resolution photographs delivered within five business days via an online gallery link. The shoot should last two to three hours and include at least two outfit changes. The photographer must bring professional lighting equipment. A preview set of 10 images within 24 hours of the shoot is very important to us. Final gallery in both web-optimised and full-resolution print formats.',
      budgetRange: [600, 2200],
    },
    {
      title: 'Product photography for 30 fashion accessories, white background',
      description: 'I am launching an online accessories shop and need professional product photographs of 30 items including beaded handbags, jewellery sets, and woven scarves. All photos must be shot on a pure white background with consistent lighting. Each item needs a minimum of three angles plus one lifestyle shot. All images should be colour-corrected and delivered within seven business days at 300 DPI minimum. Photographer must have their own portable studio lighting setup and diffusers.',
      budgetRange: [800, 3000],
    },
    {
      title: 'Two-day corporate conference photography in Accra',
      description: 'Our company is hosting a two-day leadership conference for approximately 120 delegates. I need an experienced corporate photographer to cover both full days from 8am to 6pm, capturing keynote sessions, panel discussions, networking moments, and formal group photographs. Deliverables include a minimum of 300 edited images, a curated social media highlight set of 30 images within 24 hours, and the full edited gallery within five business days. The photographer must be professional and unobtrusive throughout.',
      budgetRange: [1500, 5000],
    },
    {
      title: 'Traditional Akan engagement ceremony photography, full day',
      description: 'We are planning a traditional engagement ceremony for approximately 150 guests at a family compound in Kumasi. The event runs from approximately 10am to 8pm. I need a photographer who understands the cultural significance of the Ghanaian knocking ceremony and can capture the family presentations, schnapps sharing, gift exchange, prayers, kente cloth moments, dancing, and family interactions naturally. I want at least 200 edited photographs and a thoughtfully arranged photo story of the day. A portfolio showing previous Ghanaian traditional events is preferred.',
      budgetRange: [1200, 4000],
    },
    {
      title: 'Restaurant interior and food photography for menu launch',
      description: 'A restaurant in Osu is updating its physical menu, website, and social media. I need a skilled photographer to shoot approximately 40 styled menu items and 15 interior ambience shots during a single closed-day session. All food shots must use professional soft or natural lighting with clean contemporary styling. Interior shots should showcase the atmosphere and seating. The complete edited set should be delivered within four working days in both web and print formats. A portfolio showing previous restaurant work is required.',
      budgetRange: [900, 3500],
    },
    {
      title: 'Naming ceremony and family portrait photography, East Legon',
      description: 'We are hosting an outdoor naming ceremony for our newborn at our home in East Legon with approximately 80 guests. The event runs from 7am to approximately 2pm. I need a photographer experienced with naming ceremonies to capture the naming ritual, family blessings, outdoor gathering moments, and candid interactions throughout. I also want formal family portrait photographs taken at a selected moment during the event. Minimum 150 edited images delivered within a week, plus a selection of 10 prints.',
      budgetRange: [700, 2800],
    },
    {
      title: 'Outdoor brand photoshoot for fashion startup, 15 looks',
      description: 'I run a small Accra-based fashion label launching its first seasonal lookbook and need a professional photographer for a full outdoor shoot of 15 complete outfits across two Accra locations. The shoot should have a clean, editorial aesthetic with natural light supplemented by a portable reflector. I want at least four final edited images per look, delivered in both print-ready and web-optimised formats within five business days. The photographer must have experience with fashion and apparel shooting and should provide a short mood board for approval before shoot day.',
      budgetRange: [900, 3200],
    },
    {
      title: 'School annual awards ceremony photography',
      description: 'A private secondary school in Kumasi is holding its annual speech and prize-giving day for approximately 300 students, parents, and staff. The event runs from 9am to approximately 3pm. I need a photographer to capture the ceremony comprehensively: the procession, award presentations, group photos of prize winners, candid audience moments, and formal staff group photographs. Minimum 200 edited images delivered within five business days. Images will be used in the school newsletter, website, and social media.',
      budgetRange: [700, 2500],
    },
    {
      title: 'Real estate photography for 4-bedroom property listing',
      description: 'I am listing a four-bedroom detached house for sale in North Ridge, Accra and need high-quality real estate photography to support the marketing campaign. I need wide-angle interior shots of all four bedrooms, the two bathrooms, open-plan living and dining area, kitchen, and compound, plus exterior shots from multiple angles. All images should be brightness-corrected and delivered within two working days. The property will be staged and cleaned before the photographer arrives. Drone shots of the exterior and compound are optional at extra cost.',
      budgetRange: [500, 1800],
    },
    {
      title: 'Headshots and team profile photographs for corporate website',
      description: 'A professional services firm in Cantonments needs updated headshots and team profile photographs for a new company website. We have 12 staff members who need individual headshots on a neutral background, plus two group shots of the full team for the website homepage. The photographer should shoot at our office during a single two-hour session. All individual headshots must be delivered colour-corrected, and we want at least two final versions per person. Full gallery delivery within three business days is essential.',
      budgetRange: [600, 2200],
    },
    {
      title: 'Birthday party photography and same-day highlight reel',
      description: 'I am organising a 30th birthday party at an outdoor venue in Labone for approximately 60 guests and need a photographer to cover the full event from setup at 5pm through to approximately 11pm. Coverage should include decor detail shots, arrival and guest interaction photographs, the cake cutting, speeches, and dancing. I want a same-day social media highlight set of 20 images within one hour of the party ending, and the full edited gallery of at least 120 images within four days.',
      budgetRange: [700, 2500],
    },
    {
      title: 'Documentary photography for community project report',
      description: 'An NGO is completing a six-month community water project in a rural district near Koforidua and needs a professional documentary photographer to capture the final phase including the borehole handover ceremony, community members using the new facility, and formal group photographs with project partners and local chiefs. The shoot covers approximately four hours at the site. Minimum 60 edited documentary-style images delivered within three business days for use in the NGO annual report and donor communications.',
      budgetRange: [500, 1800],
    },
  ],
  Cleaning: [
    {
      title: 'Deep clean of 3-bedroom apartment before new tenants',
      description: 'A recently vacated three-bedroom apartment in Labone requires a thorough deep clean before new tenants arrive in five days. The flat was occupied for three years. Work required includes full kitchen degreasing behind the cooker and inside all cupboards, descaling of taps, showerheads, tiles, and toilet fittings in both bathrooms, window cleaning inside and out, thorough vacuuming and mopping of every room, and proper disposal of any rubbish. Approximately 140 square metres. Cleaning team must bring all materials and equipment. A formal walkthrough on completion is required.',
      budgetRange: [350, 1400],
    },
    {
      title: 'Weekly office cleaning for co-working space in Tesano',
      description: 'A shared co-working office in Tesano with approximately 180 square metres of open-plan workspace, two private offices, two washrooms, a small kitchen, and a boardroom needs professional cleaning every Saturday morning. The weekly job includes vacuuming and mopping, cleaning both washrooms, emptying all waste bins, wiping down all desks and workstations, cleaning the kitchen including sink and microwave, and washing glass partitions as needed. We are looking for a reliable professional who can commit to a consistent schedule. Cleaning supplies are provided on site.',
      budgetRange: [600, 2200],
    },
    {
      title: 'Post-renovation deep clean, five-bedroom house in Achimota',
      description: 'A five-bedroom house has just completed a major renovation involving plastering, repainting, tiling, and extensive joinery work. There is construction dust on all surfaces, cement and paint droppings on tile floors, paint overspray on window frames, and building debris in the compound. I need a professional cleaning crew of at least four to do a systematic post-construction clean: dust removal from all surfaces, tile scrubbing, window and frame cleaning, compound sweeping and washing, and proper debris disposal. Approximately 320 square metres.',
      budgetRange: [700, 2500],
    },
    {
      title: 'Carpet and upholstery steam cleaning, living room suite',
      description: 'A large living and dining room area has fitted carpets and a full upholstered suite with accumulated dust, pet hair, and one prominent red wine stain. Total fitted carpet area is approximately 60 square metres. Furniture includes a three-piece sofa, two armchairs, and four dining chairs with upholstered seats. I need a professional with a commercial-grade hot water extraction machine to clean all carpets, treat and lift the wine stain, clean all upholstered furniture, and apply a deodorising treatment. Professional machine only.',
      budgetRange: [400, 1600],
    },
    {
      title: 'Monthly common area cleaning for 24-unit estate in Spintex',
      description: 'A gated residential estate of 24 townhouses in Spintex Road requires monthly professional cleaning of all shared common areas. Scope covers the perimeter road, central landscaped garden, guard post and entry gate area, communal pool deck and changing area, stairwells of two apartment blocks, and the communal waste zone. The full service takes two consecutive days and should be scheduled for the last weekend of each month. A team of at least six experienced cleaners is required. Estate management conducts a formal walkthrough inspection after each clean.',
      budgetRange: [1200, 4000],
    },
    {
      title: 'Move-out deep clean for 4-bedroom house in Tema',
      description: 'I am vacating a four-bedroom detached house in Tema Community 18 and need a comprehensive move-out clean to return the property to excellent condition. The job covers four bedrooms, two bathrooms, a guest toilet, the kitchen, open-plan living and dining area, a study, and the external compound. Thorough cleaning required throughout: kitchen behind appliances and inside all cupboards, bathrooms fully descaled including grout, ceiling fans and light fixtures cleaned, and all tile grout scrubbed throughout. Per-room breakdown plus a total package quote preferred.',
      budgetRange: [450, 1700],
    },
    {
      title: 'Pre-event venue cleaning for corporate dinner, 200 guests',
      description: 'A hotel function room in Airport Residential is being used for a corporate dinner of 200 guests. The room has not been used for four weeks and needs a full professional clean before setup begins at noon on the day. Work includes thorough vacuuming of all carpeted areas, wiping down all hard surfaces, cleaning both washrooms serving the room to a high standard, polishing the wooden dance floor area, and ensuring all windows and partitions are spotless. Full team of at least three required. Work must be completed by 10am and the space left ready for event setup.',
      budgetRange: [400, 1500],
    },
    {
      title: 'End-of-tenancy full clean for rental property in Madina',
      description: 'I am a landlord preparing a three-bedroom rental property in Madina for new tenants after the previous occupants have left. The property needs a comprehensive clean throughout including full bathroom and kitchen deep clean, removal of residue from walls, cleaning of all louvre windows, mopping and polishing all tiled floors, cleaning of all fitted wardrobes inside and out, and a full exterior compound sweep and wash. A written report confirming the condition of each room at completion is required. The property needs to be ready for inspection within three days.',
      budgetRange: [350, 1300],
    },
    {
      title: 'Spring clean and declutter for family home in Kumasi',
      description: 'A four-bedroom family home in Asokwa, Kumasi needs a full top-to-bottom spring clean and general decluttering. The owners are preparing to sell and want the property in perfect presentation condition. Work includes full kitchen deep clean, bathroom cleaning and descaling, washing all windows inside and out, removing cobwebs from all ceilings and ceiling fans, cleaning all floor types including hardwood and tiled surfaces, and generally tidying all rooms to a show-home standard. A team of at least three people is needed to complete this within one day.',
      budgetRange: [400, 1500],
    },
    {
      title: 'Industrial kitchen deep clean for restaurant in Osu',
      description: 'A restaurant kitchen in Osu needs a monthly deep clean to commercial food safety standards. The kitchen has a six-burner gas range, a commercial fryer, two refrigeration units, stainless steel prep surfaces, and an extraction hood system. Work includes full degreasing of all cooking equipment and surfaces, deep cleaning the extraction hood and filters, descaling all stainless steel surfaces, cleaning behind and underneath all units, sanitising all storage areas and shelving, and mopping and sanitising the full floor area. The clean must be done on Sunday morning from 7am while the kitchen is closed.',
      budgetRange: [600, 2200],
    },
    {
      title: 'Post-party full clean for event venue in Dansoman',
      description: 'A private home in Dansoman hosted a 100-person birthday party last weekend and needs a full post-event clean. The outdoor compound, large living room, two bathrooms, and kitchen all need thorough attention: removal and disposal of all event rubbish, full floor washing throughout, bathroom sanitisation, kitchen cleaning, wiping of all furniture surfaces, and removal of all temporary decorations left behind. Work needs to be completed within one day. A team of at least four experienced cleaners is required. Cleaning materials must be brought by the team.',
      budgetRange: [350, 1300],
    },
    {
      title: 'Specialist mould removal and bathroom sanitisation',
      description: 'A bathroom in a Labone apartment has developed significant black mould on two walls and ceiling due to a blocked ventilation duct. The mould has spread over approximately three square metres of grouted tile surface. I need a specialist cleaning team to apply appropriate fungicidal treatment, scrub all mould from tiles and grout, re-grout affected joints with anti-mould grout, treat the ceiling with mould-resistant paint, and restore the ventilation flow. All products used must be safe for a home with a young child. A six-month mould-free guarantee from the contractor is preferred.',
      budgetRange: [300, 1100],
    },
  ],
  Delivery: [
    {
      title: 'Full house removal from Tema to Adenta, one day',
      description: 'I am relocating from a three-bedroom house in Tema Community 18 to a house in Adenta and need a professional moving service for a full household. Items include a king-size bed, two single beds, wardrobes, a dining table with six chairs, a three-piece sofa set, a 450-litre refrigerator, a washing machine, a 65-inch television, and approximately 25 packed boxes. I need a covered truck of at least five tonnes with three experienced handlers who can wrap fragile items, dismantle and reassemble all bed frames, and complete the move in one day.',
      budgetRange: [600, 2500],
    },
    {
      title: 'Same-day parcel delivery across Greater Accra, 20 orders',
      description: 'I operate a small online retail business and have an unusually high order volume to fulfil this Saturday: approximately 20 customer deliveries spread across Accra, Tema, and Spintex. I need one or two reliable riders with strong local knowledge who can pick up all parcels from my Dansoman dispatch point at 8am, follow an efficient route, collect a customer signature for each drop, send live status updates throughout the day, and return any failed deliveries by 6pm. All parcels are light clothing and cosmetics items under 3kg. Valid commercial licence required.',
      budgetRange: [400, 1600],
    },
    {
      title: 'VIP airport transfer service over a long weekend, KIA',
      description: 'I need reliable private vehicle hire for airport transfers over a long weekend in Accra. The schedule involves two international arrivals at Kotoka International Airport on Friday evening and one departure early Sunday morning. The vehicle must be a clean air-conditioned executive saloon or SUV no older than 2020, and the driver must be well-presented, strictly punctual, and hold a valid commercial driving licence. Professional name signage must be displayed for all arrival pickups. Quote should include fuel, any applicable tolls, and airport parking.',
      budgetRange: [450, 1800],
    },
    {
      title: 'Wedding equipment delivery and return, Kasoa venue',
      description: 'I am coordinating a Saturday wedding reception in Kasoa and need a reliable enclosed van to transport rented event equipment from a hire company in Darkuman to the venue by 7am, and to collect and return all equipment by 9pm the same evening. The load includes 100 plastic chairs, 12 folding tables, one large canopy frame, a PA system with speaker stands, and LED fairy lights. The hire supplier will assist with loading at both ends but I need two additional handlers for the evening return. Vehicle must be covered and clean.',
      budgetRange: [500, 1900],
    },
    {
      title: 'Inter-city cargo delivery, Accra to Kumasi by Thursday',
      description: 'I have a time-sensitive consignment of trade show merchandise that must be delivered to a hotel in Kumasi by 10am on Thursday for a product launch. The goods comprise four roll-up banners in carry cases, ten medium boxes of promotional items weighing approximately 80kg total, and two folding display stands. I need a contact with a covered vehicle making the Accra-to-Kumasi run Wednesday evening or very early Thursday. I require a signed waybill on collection, WhatsApp confirmation of delivery, and a photo of the goods at the destination.',
      budgetRange: [550, 2000],
    },
    {
      title: 'Daily school morning run, five children, Madina to East Legon',
      description: 'I am looking for a reliable and safety-conscious driver to provide a daily school morning run for five children from our neighbourhood in Madina to an international school in East Legon, Monday to Friday during the school term. Pickup should be at 6:30am from a set collection point. The driver must have a clean roadworthy vehicle with working seat belts for all passengers, a valid driving licence, police clearance certificate, and strong references from previous school run work. No smoking or phone use while driving children. One-week trial before confirming a termly arrangement.',
      budgetRange: [800, 2800],
    },
    {
      title: 'Office relocation across Accra, full equipment move',
      description: 'Our company is relocating from Tesano to a new office in Airport Residential. We have 15 workstations including monitors, CPUs, and peripherals, a large conference table, 20 chairs, two filing cabinets, a server rack, a large-format printer, and approximately 30 boxes of documents. I need a professional office moving company with appropriate vehicle and at least four experienced handlers who can disconnect, move, and reconnect all IT equipment carefully. Move must be completed over a Saturday to minimise business disruption. Padding and professional wrapping of all screens is required.',
      budgetRange: [700, 2800],
    },
    {
      title: 'Motorcycle courier for urgent document delivery, same day',
      description: 'I need a reliable, fast, and professional motorcycle courier for same-day urgent document delivery within Accra. The job involves picking up a sealed document package from our office in Osu and delivering it to a law firm in Cantonments by 2pm, then picking up a signed return document and bringing it back to our Osu office by 4pm. The courier must have a smartphone for real-time communication, sign a simple chain of custody form at each collection, and be prepared to provide a delivery photo at both drop-off points. Same-day rate inclusive of fuel.',
      budgetRange: [80, 300],
    },
    {
      title: 'Furniture delivery from warehouse to client homes, 5 orders',
      description: 'I run a small furniture retail business in Spintex and have five client orders ready for delivery this week across East Legon, Adenta, Tema, and Roman Ridge. Items include a combination of wardrobes, bed frames, dressers, and dining sets. I need a covered van and two handlers who can carefully transport and carry each piece to the relevant floor and room in each client home. The van must be large enough for a 6-foot wardrobe flat-packed in its box. All deliveries should be completed within two working days. Delivery notes signed by client at each drop required.',
      budgetRange: [400, 1500],
    },
    {
      title: 'Cold chain delivery for pharmaceutical stock, weekly run',
      description: 'A pharmaceutical distributor in Accra needs a reliable cold chain delivery contractor to distribute temperature-sensitive medical products to six clinics and pharmacies across Greater Accra every Monday morning. All products must remain between 2 and 8 degrees Celsius throughout transit. The contractor must have a refrigerated vehicle or an adequately cooled insulated transport solution, carry a temperature logging device throughout the run, and deliver signed delivery documentation to us at the end of each Monday run. This is a recurring weekly contract subject to a two-week trial.',
      budgetRange: [600, 2200],
    },
    {
      title: 'Removal and storage of household items for renovation',
      description: 'I am renovating my Cantonments home and need all furniture and belongings from three bedrooms, the living room, and dining room moved to a secure storage facility for approximately eight weeks, then returned once work is complete. Items include a full bedroom suite, sofa sets, a dining table, electronics, and approximately 40 boxes of personal effects. I need a moving and storage company that can provide professional packing, wrapped transport, secure dry storage, and a scheduled return delivery at the end of the renovation. Full itemised inventory list required at time of collection.',
      budgetRange: [1000, 3500],
    },
    {
      title: 'Bulk building materials delivery from supplier to site',
      description: 'I am building a two-bedroom house in Kasoa and need a tipper truck to deliver three loads of building sand and one load of stone ballast from a supplier in Bortianor to my site in Kasoa over two days. Each load is approximately 10 tonnes. The truck must be able to access a site road that is firm but unpaved and tip the material at the designated location on site. A signed delivery note for each load is required. I need the four loads completed by end of the week to keep my build on schedule. Quote per load and for all four loads.',
      budgetRange: [500, 2000],
    },
  ],
  'Design & Print': [
    {
      title: 'Brand identity for new tailoring business, logo and cards',
      description: 'I am launching a bespoke tailoring and alterations business in Kumasi and need a complete brand identity package including a modern and versatile logo in three colour variations, a professional two-sided business card design for 500 copies, a simple letterhead and invoice template in Microsoft Word format, and a design file for a shop signage board. The brand should feel premium and contemporary while reflecting Ghanaian textile craft. At least three distinct initial logo concepts required, followed by two rounds of revisions. Final delivery in print-ready PDF, AI, and high-resolution PNG formats.',
      budgetRange: [600, 2500],
    },
    {
      title: 'Church anniversary flyer, banner, and programme booklet',
      description: 'Our church is celebrating its 25th anniversary next month and needs professional graphic design for a complete set of printed event materials: an A5 event flyer for 1000 copies, a 2-metre pull-up roll-up banner design, a 16-page A5 programme booklet with full-colour cover, and digital versions for WhatsApp, Facebook, and Instagram story. Theme colours are royal blue and gold. We will provide all text content, high-resolution photos, and the church logo. The designer must deliver final CMYK print-ready files on time as the printer deadline is firm.',
      budgetRange: [700, 2800],
    },
    {
      title: 'Restaurant menu redesign for relaunch, Osu eatery',
      description: 'A restaurant in Osu is relaunching after renovation and wants its menus redesigned with a fresh modern identity that still feels warm and Ghanaian. The full menu covers 60 items across starters, mains, specials, drinks, and desserts. Deliverables include an A3 laminated table menu, an A1 chalkboard-style wall menu, and digital menu files for WhatsApp and Instagram stories. The aesthetic should use rich earth tones, confident typography, and spaces for food photography that I will supply. Up to three full revision rounds. Final delivery in print-ready PDF plus editable source files.',
      budgetRange: [800, 3000],
    },
    {
      title: 'School open day marketing materials, A4 flyer and banner',
      description: 'A private primary school in East Legon is holding its annual open day and needs a consistent set of printed and digital marketing materials designed and prepared within eight working days. The package includes an A4 flyer for 500 copies and a digital version, a 2-metre by 3-metre entrance banner, a branded one-page insert card for 100 welcome packs, and a six-panel A4 trifold brochure about school programmes. All designs must match the existing blue and yellow brand palette. We will provide brand guidelines, current photos, and all text content before work begins.',
      budgetRange: [900, 3500],
    },
    {
      title: 'Product label design for five natural skincare products',
      description: 'I produce natural skincare products using Ghanaian ingredients including raw shea butter, cold-pressed neem oil, and traditionally prepared black soap. Each of the five products needs a professionally designed label communicating artisan quality, clean ingredients, and local Ghanaian provenance. Labels must incorporate the product name, full ingredients list, usage instructions, net weight, and a simple brand logo. Colour palette should be earthy and natural with subtle African-inspired decorative elements. Deliverables are print-ready vector files plus a digital product mockup for each item.',
      budgetRange: [500, 1800],
    },
    {
      title: '30 branded social media posts for product launch campaign',
      description: 'I am launching a new skincare and wellness product range and need 30 professionally designed social media posts for a four-week campaign across Instagram and Facebook. Each post should be 1080 by 1080 pixels and adhere to the brand colour palette of terracotta, cream, and forest green with clean modern typography. The set should include product feature posts, testimonial quote graphics, promotional offer posts, and countdown posts. All 30 graphics must be delivered in JPEG and PNG format within 10 working days. Canva or Photoshop source files preferred.',
      budgetRange: [600, 2200],
    },
    {
      title: 'Corporate annual report design, 24 pages, Accra firm',
      description: 'A professional services firm in Accra needs a 24-page annual report designed for print and digital distribution. The document covers financial highlights, key milestones, board messages, team photographs, and a project showcase section. I will provide all text content, photographs, and data charts in spreadsheet format. The designer must lay out all content in a clean, professional style consistent with our brand guidelines, which I will provide at briefing. Final delivery in print-ready PDF for a 500-copy print run and a separate interactive screen-optimised PDF.',
      budgetRange: [1000, 3500],
    },
    {
      title: 'Wedding stationery set, invitations, order of service',
      description: 'I am planning a 150-guest wedding in Accra and need a complete stationery set designed and delivered within four weeks. The package includes an A5 double-card invitation with envelope, an A5 order of service booklet of eight pages, a matching table name card design, a thank-you card design, and a small seating plan board graphic. Colour palette is blush pink, gold, and ivory. Design should feel elegant and minimal. The designer should supply print-ready files for all items. I will manage my own printing locally. Two rounds of revisions included.',
      budgetRange: [700, 2500],
    },
    {
      title: 'NGO fundraising campaign graphics, digital and print',
      description: 'A Ghana-based NGO is launching a fundraising campaign and needs a set of visual assets to support online and offline outreach. Deliverables include a campaign hero banner image for the website, three email newsletter header designs, five social media graphics in various formats, and a double-sided A4 printed impact report summary for 200 copies. All assets must be aligned with the NGO brand guidelines provided at briefing. The designer should have experience producing materials for the non-profit sector. Final files delivered in both print-ready and digital-optimised formats.',
      budgetRange: [600, 2200],
    },
    {
      title: 'Vehicle branding design for two company cars',
      description: 'A building contractor in Accra wants both company vehicles branded with a consistent vinyl wrap design featuring the company name, logo, key services list, and contact details. I need a vehicle branding designer to produce full-wrap design files correctly scaled for a Toyota Hilux pickup and a Hyundai H100 panel van. Design should be bold, professional, and readable at a distance. The designer supplies print-ready vector files formatted for the vinyl printing company of my choice. Full-vehicle mockup renderings in both side-view and three-quarter-view perspectives must be included in the approval process.',
      budgetRange: [800, 3000],
    },
    {
      title: 'Canva presentation template for professional training company',
      description: 'A professional training company in Accra runs regular corporate workshops and needs a polished, fully editable Canva presentation template that trainers can customise for each client workshop. The template should have 25 distinct slide layouts covering title slides, section dividers, content layouts with text and icons, full-bleed image slides, and data visualisation layouts. All layouts must use the brand colour palette, fonts, and logo which I will provide at briefing. The template should be shared as an editable Canva team file with clear layer naming. Two rounds of revisions included.',
      budgetRange: [400, 1500],
    },
    {
      title: 'Event programme and ticket design for comedy show',
      description: 'I am organising a live comedy show in Accra for approximately 400 attendees and need two graphic design deliverables: a 4-page A5 event programme booklet and a professionally designed ticket in two tiers (standard and VIP). The programme should include a welcome message, performer bios, event schedule, and sponsor logos. The ticket design should include security features like a unique QR code zone, event branding, and clear tier differentiation. Both designs must be delivered print-ready within five working days. One revision round included per deliverable.',
      budgetRange: [500, 1800],
    },
  ],
  Catering: [
    {
      title: 'Full catering for 80-person engagement party in Cantonments',
      description: 'I am organising a traditional Ghanaian engagement party for approximately 80 guests at a private family residence in Cantonments. The event runs from 2pm to approximately 8pm on a Saturday in three weeks. I need a professional catering team to provide a comprehensive traditional Ghanaian buffet including party jollof rice, fried rice, kenkey with fried tilapia, goat light soup with fufu, waakye, assorted salads, kelewele, fried chicken, and grilled fish, plus a drinks station and dessert table. The team handles all preparation, cooking, serving, and complete cleanup.',
      budgetRange: [1500, 6000],
    },
    {
      title: 'Daily office lunch for 15 staff, Dzorwulu, trial week included',
      description: 'A small technology company in Dzorwulu is looking for a reliable daily lunch caterer for 15 staff members Monday to Friday, starting next month with a paid one-week trial. I want a rotating weekly menu of freshly prepared Ghanaian home-style meals delivered in individually labelled portions to our office by 12:30pm. Each portion should include a main dish, a small side, and a 330ml bottle of water. The caterer must hold a valid food handler certificate, operate from a certified kitchen, and be willing to accommodate dietary requirements with advance notice.',
      budgetRange: [800, 3000],
    },
    {
      title: '40th birthday garden party catering, 50 guests in Kumasi',
      description: 'I am planning a 40th birthday garden party for 50 guests at our home in Nhyiaeso, Kumasi running from 4pm to approximately 10pm. I need catering including a two-hour cocktail food station with passed appetisers followed by a full buffet dinner with rice dishes, pasta, beef stew, grilled and fried chicken, and a dessert table with cakes and fresh fruit. A mobile bar service with soft drinks, fresh juices, and mocktails is required. Staffing should include at least two serving staff and one bartender plus full setup and cleanup.',
      budgetRange: [1200, 4500],
    },
    {
      title: 'Executive boardroom lunch, 12 senior guests, formal service',
      description: 'I need a professional caterer to prepare and serve a formal three-course boardroom lunch for 12 senior corporate guests at our Cantonments office. The meal should feel genuinely premium with a shared starter platter, individually plated mains, and a dessert course. Confirmed dietary requirements include one vegetarian, one diabetic guest, and one with a severe shellfish allergy. The caterer must supply all tableware, linen napkins, and serving staff and manage complete setup and post-meal cleanup. A proposed menu and photos from previous corporate catering are required with the bid.',
      budgetRange: [1000, 3500],
    },
    {
      title: 'Funeral reception catering, 200 guests in Koforidua',
      description: 'My family is organising a funeral reception in Koforidua following the burial ceremony of our patriarch. We expect approximately 200 guests and the reception runs from approximately 1pm to 5pm at an outdoor venue. We need full catering covering three traditional main dish options: fufu with light soup and goat meat, party jollof rice with fried chicken, and yam with kontomire palava sauce, plus a cold drinks station throughout. Serving staff of at least five required. The caterer handles all food setup, service for the full duration, and complete cleanup.',
      budgetRange: [2000, 8000],
    },
    {
      title: 'Naming ceremony catering, 60 guests in Roman Ridge',
      description: 'We are hosting a traditional naming ceremony for our newborn daughter at our home in Roman Ridge with approximately 60 family members and close friends. The morning event runs from 7am to approximately 1pm. I need a catering team to provide a traditional Ghanaian morning buffet appropriate for a naming ceremony: koko, koose, and bread for early arrivals, followed by waakye, fried yam and eggs, kelewele, and fresh fruit for the mid-morning buffet. Drinks to include fresh zobo, sobolo, and minerals. Minimum two serving staff plus the cook.',
      budgetRange: [700, 2800],
    },
    {
      title: 'Corporate cocktail reception catering, 60 guests in Accra',
      description: 'A financial services company in Accra is hosting a stakeholder cocktail reception for approximately 60 guests to mark its 10th anniversary. The two-hour standing reception requires a professional catering team to provide a selection of eight passed canape and finger food varieties, a staffed cheese and charcuterie display, a non-alcoholic drinks station with fresh-fruit punches and mineral water, and full cleanup after the event. Presentation must be premium and the serving staff must be smartly uniformed. A proposed menu and previous corporate event portfolio are required with the bid.',
      budgetRange: [1200, 4000],
    },
    {
      title: 'University graduation dinner catering, 40 families',
      description: 'I am coordinating a private celebration dinner following a graduation ceremony for approximately 40 family members and friends of a graduate. The seated dinner at a hired venue in Accra runs from 7pm to approximately 10pm. I need a caterer to provide a two-course seated meal with a starter, a main course, dessert, and soft drinks service throughout the evening. Food should be a blend of Ghanaian and continental dishes. Staffing should include at least three serving staff. Tableware, napkins, and serving equipment should all be supplied by the caterer.',
      budgetRange: [800, 3000],
    },
    {
      title: 'Outdoor wedding reception full catering, 180 guests',
      description: 'We are planning a traditional outdoor wedding reception for approximately 180 guests at a private compound in Kumasi. The event runs from 2pm to approximately 9pm. I need a professional catering team to provide a comprehensive full-service meal: a hot and cold starter display, a main course buffet with at least five Ghanaian and two continental options, a dessert table, and a non-alcoholic drinks station throughout. A minimum of six serving staff, full setup, and complete post-reception cleanup are required. Experience catering traditional Ghanaian weddings of this scale is essential.',
      budgetRange: [2500, 9000],
    },
    {
      title: 'Children birthday party catering, 40 kids in East Legon',
      description: 'I am organising a birthday party for my daughter who is turning seven, with approximately 40 children and 20 accompanying parents in our East Legon home garden. The event runs from 2pm to 6pm. I need a caterer to provide child-friendly foods including mini sandwiches, spring rolls, chicken strips, jollof rice in small bowls, popcorn, and fresh fruit skewers, plus a squash drinks station throughout. Two serving staff required for the duration. The caterer should handle all setup before 1:30pm and complete full cleanup by 7pm. Clean presentation using fun disposable tableware is acceptable.',
      budgetRange: [500, 1800],
    },
    {
      title: 'Outdoor church harvest festival catering, 150 members',
      description: 'Our church is holding its annual harvest festival outdoor gathering for approximately 150 church members on a Saturday afternoon. The event runs from 12pm to approximately 5pm. I need a professional catering team to provide a buffet lunch covering three main dish options: jollof rice with chicken, kenkey with fried fish and shito, and vegetable fried rice, plus a salad station, fresh fruit, kelewele, and a cold drinks station with minerals and sobolo. Staffing should include at least four serving staff. The caterer handles all preparation, service, and cleanup.',
      budgetRange: [1500, 5500],
    },
    {
      title: 'Pop-up food stall catering for trade fair, two days',
      description: 'I am running a pop-up food stall at a two-day trade fair at the International Conference Centre in Accra and need an experienced Ghanaian food caterer to manage the stall operation for both days from 9am to 6pm. The stall will serve traditional Ghanaian lunch dishes: jollof rice and chicken, waakye, and kelewele with grilled tilapia, plus cold drinks. The caterer provides all food preparation, cooking equipment, serving staff, packaging materials, and manages the entire stall operation independently. I provide the stall space and brand materials only. Quote per day and for the two-day engagement.',
      budgetRange: [800, 3000],
    },
  ],
  'IT & Tech Support': [
    {
      title: 'New office network setup with cabling and NAS storage',
      description: 'We are moving into a new 200-square-metre office space on two floors in Tesano and need a complete network infrastructure setup. The work includes a business-grade dual-band router with separate authenticated staff and guest networks, a managed network switch, structured Cat6 cabling for 10 workstation drops across both floors, a basic NAS device configured for shared folder access with user permissions, and a configured hardware firewall. Wi-Fi coverage must be strong throughout both floors. A one-page network diagram at handover and a training session for the office administrator are required.',
      budgetRange: [800, 3000],
    },
    {
      title: 'Malware removal and antivirus setup for 8 office laptops',
      description: 'A small NGO office has eight staff laptops in poor health: several running unusually slowly, some with persistent pop-ups, two with print connectivity issues, and at least one with adware installed. I need a qualified IT technician to work through all eight laptops: full malware scans and removal of all threats, uninstalling unnecessary software, updating operating systems and drivers, installing and configuring a business-grade antivirus solution, setting up automated backup routines, and verifying internet and printer connectivity on each machine before sign-off.',
      budgetRange: [600, 2000],
    },
    {
      title: '5-page business website for Accra SME on WordPress',
      description: 'I run a construction materials supply business and currently have no website. I need a clean, professional five-page website built on WordPress so I can manage content myself after handover. The five pages are: Home with a hero banner, About Us, Services listing our main product categories, a Gallery showing recent project photos, and a Contact page with a submission form and embedded Google Map. The design must be fully mobile-responsive, fast-loading, and consistent with my brand colours. The designer provides a training session and all login credentials at handover.',
      budgetRange: [900, 3500],
    },
    {
      title: 'QuickBooks setup and staff training for retail boutique',
      description: 'I own a clothing and accessories boutique in Osu and have been managing accounts on spreadsheets for two years. I want to properly set up QuickBooks Desktop for retail business accounting. I need an IT consultant to install the software, build an appropriate chart of accounts for a retail SME, set up my three main product categories as inventory items with opening stock quantities, design a professional invoice template with my logo, import three months of historical transactions from Excel, and deliver a two-hour training session for me and my assistant.',
      budgetRange: [500, 2000],
    },
    {
      title: 'CCTV installation, 4 cameras for home in Madina',
      description: 'I want a professional 4-camera CCTV system installed at my home in Madina. The four cameras should cover the front gate, the back of the house near the generator, the main interior entrance door, and the car park. I want 2-megapixel HD night-vision cameras with a DVR that stores at least 14 days of footage on a 2TB hard drive. The installer supplies and installs all cameras, cables all runs neatly with conduit where exposed, sets up the DVR with correct settings and motion alerts, and configures remote viewing on my smartphone. A 30-minute demonstration is required.',
      budgetRange: [1200, 4500],
    },
    {
      title: 'Shopify store for Ghanaian food products brand, mobile money',
      description: 'I produce traditionally prepared Ghanaian food products and want to launch an online shop with mobile money payment integration. I need a Shopify developer to set up a complete store with a clean professional theme, configure 12 initial product listings, integrate MTN Mobile Money and Vodafone Cash as payment options, set up standard shipping zones for Accra, Kumasi, and nationwide delivery, and configure order confirmation emails. I also need a brief operations training session covering how to add new products, process orders, and update stock. The store must be fully live and tested before handover.',
      budgetRange: [1000, 4000],
    },
    {
      title: 'IT support contract for small business, monthly retainer',
      description: 'A 12-person professional services firm in Accra needs a reliable IT support partner on a monthly retainer basis. The scope covers remote and on-site support for Windows workstations, troubleshooting printer and network connectivity issues, software updates and license renewals, quarterly security reviews, and a monthly one-hour check-in visit. A typical month involves two to four support requests. The IT partner must respond to priority issues within four hours during business hours and provide a monthly brief summary of work carried out. Please quote a monthly retainer and confirm your availability.',
      budgetRange: [400, 1500],
    },
    {
      title: 'Build custom Excel dashboard for sales reporting',
      description: 'I own a wholesale distribution business and need a custom Excel dashboard built to consolidate sales data from three product lines and produce clear weekly and monthly performance reports. The dashboard should automatically calculate total revenue, gross margin, top-performing products, sales by region, and month-on-month growth percentages using formulas drawing from input sheets I update weekly. I need a dynamic chart section with at least three visualisation types. The final workbook should be clean, clearly labelled, and include a brief instruction sheet for daily use.',
      budgetRange: [300, 1200],
    },
    {
      title: 'Cloud migration for small business, Google Workspace setup',
      description: 'A 15-person media company in Accra is moving from an on-premise file server to Google Workspace for Businesses. I need an IT consultant to set up the Google Workspace account with our custom domain, migrate existing email accounts and archived emails for all 15 staff, configure Shared Drive folders with appropriate access permissions, migrate key files from the existing file server to Shared Drive, and deliver a practical two-hour training session for all staff on Google Drive, Gmail, and Meet. The migration should cause minimum disruption and be completed over a single weekend.',
      budgetRange: [600, 2200],
    },
    {
      title: 'Software developer for simple inventory management app',
      description: 'I run a spare parts shop in Kumasi and need a simple desktop or web-based inventory management application built from scratch. Core features required: add and update product records with name, category, quantity, unit cost, and selling price; record stock-in and stock-out transactions; flag items with low stock; and generate a simple daily sales summary and monthly inventory valuation report as printable PDFs. The application should be straightforward for a non-technical staff member to use. I need a developer who can deliver a working tested application within four weeks of project kickoff.',
      budgetRange: [800, 3000],
    },
    {
      title: 'Repair and upgrade school computer lab, 20 desktops',
      description: 'A private secondary school in Tamale has a 20-workstation computer lab that has not been maintained for two years. At least 12 machines have hardware or software faults: slow boot times, overheating, cracked keyboards and mice, and outdated operating systems. I need a qualified IT technician to assess all 20 machines, replace faulty hardware components, install updated software including Windows 10, a browser, and basic productivity suite, configure the lab network connection and shared printer, and deliver a condition report for each machine. Machines must be left fully functional and clean for student use.',
      budgetRange: [800, 3000],
    },
    {
      title: 'Set up social media management and scheduling tools',
      description: 'I run a growing retail brand with active Instagram, Facebook, and TikTok pages and need help setting up a proper social media management workflow. I need an IT and digital marketing consultant to configure a professional social media scheduling platform for my team, connect all three accounts, set up a content calendar template, configure basic analytics tracking and reporting, and deliver a practical two-hour training session for two staff members. The consultant should also recommend and set up basic link-in-bio and analytics tools. I want everything set up and working within one week of engagement start.',
      budgetRange: [400, 1500],
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
      'Gate repair was done on the same day without any drama. Works perfectly now and the compound looks tidier for it.',
      'The waterproofing and tiling on the terrace is excellent work. No bubbling, clean grout lines, and drains properly now.',
      'Roof leak is completely fixed. No water came in during two heavy rains since the repair. Very thorough technician.',
      'Underground tank installed neatly. All pipe connections are watertight and the plumber cleaned up the site before leaving.',
    ],
    buyer_negative: [
      'Good quality work overall but arrived 40 minutes late on the first morning without sending a message to warn me.',
      'The job was completed satisfactorily but took one extra day beyond what was agreed. Better communication would have helped.',
      'End result was fine but the original quote was exceeded slightly due to materials. Would have appreciated a heads-up.',
      'Work was completed to a reasonable standard but the team left some sand and debris behind in the corridor.',
    ],
    seller_positive: [
      'Very clear brief and the client was at the property throughout to answer questions promptly. Payment released immediately.',
      'Well-organised client with everything prepared in advance. Access was available all day both days. Easy job to complete.',
      'Client was cooperative and patient. The site was cleared of furniture before we arrived to work. Smooth engagement.',
      'Professional client who gave clear instructions and was available by phone for any questions during the job.',
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
      'My son passed his WASSCE elective maths with a grade B2. We are absolutely over the moon. Thank you so much.',
      'The IELTS coaching was structured and thorough. Achieved a band 7.5 overall which exceeded my target. Very skilled teacher.',
      'After-school sessions are engaging and both children look forward to them. Progress in maths has been remarkable.',
      'French speaking confidence has improved massively. I can now hold basic conversations and feel ready for my move.',
    ],
    buyer_negative: [
      'Tutor was clearly knowledgeable but sessions occasionally ran 15 to 20 minutes short of the agreed two hours.',
      'Good results overall but the lesson plan in the first two weeks was less structured than I had hoped for.',
      'Very capable tutor but response time to messages between sessions was sometimes slow when I had quick questions.',
    ],
    seller_positive: [
      'Engaged and involved parent who communicated well and monitored progress closely. The student worked hard between sessions.',
      'Student was genuinely motivated and the family created an excellent study environment at home. A real pleasure to teach.',
      'Expectations were made very clear from day one and payment was made promptly after each confirmed session.',
      'The student prepared diligently between sessions which made teaching progress very rewarding and efficient.',
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
      'Fashion lookbook came out far better than expected. The outdoor light management was especially impressive.',
      'School prize-giving coverage was comprehensive and very well organised. Parents are very happy with the gallery.',
      'Real estate photos attracted three enquiries within the first week of the listing going live. Excellent investment.',
      'Birthday party coverage was fun and natural. The same-day highlights were sent to us even before the party ended.',
    ],
    buyer_negative: [
      'Good quality photography but the full gallery was delivered on day eight instead of the five days quoted.',
      'Photos were good but only 68 of the 80 minimum guaranteed photos were delivered in the final gallery.',
      'The photographer was slightly late to the venue and missed the very first ten minutes of the event.',
    ],
    seller_positive: [
      'Well-prepared client with a clear shot list. The venue was beautifully set up and the subject was relaxed and easy to work with.',
      'Clear brief provided upfront and the client trusted my creative direction throughout. Smooth and professional job.',
      'Professional communication throughout. Schedule confirmed in advance and payment made on gallery delivery. Would work together again.',
      'Client had the venue fully prepared and all participants briefed on the schedule. Made the shoot very efficient.',
    ],
  },
  Cleaning: {
    buyer_positive: [
      'The apartment was genuinely spotless on the walkthrough. Every corner cleaned, not just the main surfaces. Outstanding work.',
      'Reliable team that shows up every Saturday without exception. The office always smells fresh when we arrive on Monday morning.',
      'Post-renovation clean was thorough and systematic. Every room was done completely and all debris was removed without being asked.',
      'Carpets look brand new and the wine stain has completely disappeared. Professional equipment made a huge difference.',
      'The most thorough move-out clean I have ever seen done. Got the full security deposit back thanks to their work.',
      'Pre-event clean was completed by 9:30am as promised. The function room looked spotless and the client was very impressed.',
      'The industrial kitchen is gleaming and passed the food safety inspection with no issues. Outstanding thorough work.',
      'Spring clean transformed the house completely. It is now showing beautifully and we have already had offers.',
      'Mould has completely gone and the bathroom smells clean for the first time in months. Very specialist work done well.',
      'Post-party clean was done quickly and thoroughly. Everything was back to normal by midday. Very professional team.',
    ],
    buyer_negative: [
      'Cleaning was very good overall but the insides of the kitchen cupboards were not cleaned as was clearly agreed.',
      'Good job but the team arrived 25 minutes late and missed the top floor window cleaning before leaving.',
      'Generally thorough but the bathroom ceiling was not fully cleaned and required me to follow up after the job.',
    ],
    seller_positive: [
      'Clean and well-maintained property made the work straightforward. Client was clear about priorities from the start.',
      'Good communication before and after. Client conducted a fair walkthrough and released payment the same afternoon.',
      'All requested cleaning products were stocked on site exactly as agreed. Very easy and professional client to work with.',
      'Client was reasonable and understanding when we requested an extra 30 minutes to complete the kitchen properly.',
    ],
  },
  Delivery: {
    buyer_positive: [
      'Every single piece of furniture arrived at the new house without a scratch. Team was fast, careful, and very professional.',
      'All 20 deliveries completed by 3:30pm with signed receipts photographed and sent to me. Excellent service all day.',
      'Driver arrived five minutes early with a spotless vehicle. My guests arrived to a wonderful first impression. Excellent.',
      'Equipment arrived at the venue 30 minutes before we needed it. Return pickup was also prompt and completely hassle-free.',
      'The children arrive at school on time every morning and the driver is always calm and courteous. Absolute peace of mind.',
      'Office relocation was completed in six hours without a single item damaged. Team wrapped every screen individually.',
      'Document was delivered and returned within the three-hour window with signed receipts as requested. Very reliable courier.',
      'All five furniture deliveries done in one day with clients sending very positive feedback to me. Excellent service.',
      'Cold chain deliveries have been consistently on time and temperature logs are always correct. Very professional service.',
      'The sand and ballast were all delivered within two days and tipped exactly where I needed them. Simple but very reliable.',
    ],
    buyer_negative: [
      'The move was completed but two fragile boxes were not wrapped as I had clearly requested. Thankfully nothing was broken.',
      'Arrived 40 minutes late on the day but the driver called ahead to warn us. Overall the job was done to a good standard.',
      'Delivery was completed but the driver did not have change for a small cash payment adjustment and it took time to resolve.',
    ],
    seller_positive: [
      'All items were carefully packed and clearly labelled before our arrival. Loading was very quick as a result.',
      'Client was available at both locations and sent very clear directions. Absolutely smooth job from pickup to delivery.',
      'All recipient addresses were accurate and everyone was home and ready. No complications throughout a long day.',
      'Client communicated all building access details clearly in advance which made the office move very efficient.',
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
      'The annual report looks genuinely corporate and impressive. Board was very pleased with the final presentation.',
      'Wedding stationery set is exactly what I wanted. Elegant, minimal, and beautifully consistent across all pieces.',
      'Vehicle branding mockups were approved first round. The vans look very professional on site and the brand stands out.',
      'The Canva template has saved our trainers so much time. Clients consistently comment on how polished the slides look.',
    ],
    buyer_negative: [
      'Design quality was excellent but the first revision round took three days to turn around. Had expected a faster response.',
      'Final designs were very good but one file was delivered in RGB colour profile instead of the CMYK I had specified.',
      'Good work overall but the designer could have been more proactive about checking in during the project.',
    ],
    seller_positive: [
      'Client provided all content assets upfront and gave specific, constructive feedback at each review stage. Very easy brief.',
      'Organised client with a clear vision from day one. Designs approved quickly and payment released the same day.',
      'Comprehensive brief and reference materials from day one made this a straightforward job. A genuinely professional client.',
      'Client responded to review requests within the hour throughout the project which kept the timeline on track.',
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
      'The cocktail reception food was outstanding and the serving team were polished and professional throughout. Very impressed.',
      'Graduation dinner was a lovely occasion and the food quality matched the ambience. Guests were very complimentary.',
      'Wedding reception catering fed 180 guests without any queue issues. Food was hot, plentiful, and very well cooked.',
      'Children loved every single item on the menu and parents were genuinely impressed by the presentation and cleanliness.',
    ],
    buyer_negative: [
      'Food quality was very good but the team arrived 20 minutes behind schedule which pushed the buffet opening slightly late.',
      'Generally excellent but they ran slightly short on jollof rice for the very last guests in the queue at the buffet.',
      'Good overall but two of the serving staff were not as smartly presented as I had expected for a formal event.',
    ],
    seller_positive: [
      'Venue was fully prepared and client had communicated all guest numbers and dietary needs accurately well in advance.',
      'Decisive client who confirmed menu choices promptly and responded to all our questions within the hour. Great to work with.',
      'A professional client who respected all agreed timelines. Payment was transferred the same evening after the event.',
      'Client provided a detailed brief and trusted our menu recommendations entirely. One of our smoothest events this year.',
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
      'The monthly IT retainer has been excellent value. Issues are always resolved quickly and the team is very professional.',
      'Excel dashboard is exactly what I needed. Saves me two hours every week and the charts are clear and easy to present.',
      'Google Workspace migration was seamless. All emails were migrated without any data loss and staff training was very clear.',
      'The inventory app is working perfectly in the shop. Staff picked it up in a single day and stocktakes are now much faster.',
    ],
    buyer_negative: [
      'Good technical work but the job ran a full day longer than quoted. Earlier communication of the delay would have helped.',
      'Network setup was solid but the handover documentation was less detailed than I had been told to expect.',
      'The developer delivered the core features well but two of the five agreed features were not included at final handover.',
    ],
    seller_positive: [
      'Office was fully clear and ready for work to begin. Admin staff were available and helpful when we needed assistance.',
      'Client had prepared very clear questions for the handover training session which made it efficient and thorough.',
      'Excellent brief provided upfront. All login credentials and access details were shared promptly without needing to ask.',
      'Client reviewed and signed off at each project milestone which made the final handover smooth and straightforward.',
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
  'Licensed electrician and building services engineer with over a decade of residential and light commercial installations.',
  'Qualified maths and science tutor with six years teaching SHS and JHS learners in Kumasi and surrounding areas.',
  'Portrait and documentary photographer offering fast turnaround and consistent professional editing for every project.',
  'Commercial cleaning contractor specialising in post-construction and industrial kitchen cleans across Greater Accra.',
  'Furniture removal and secure storage specialist with a covered truck fleet serving Greater Accra and Kumasi routes.',
  'Freelance graphic designer with a strong track record in brand identity, print collateral, and social media content.',
  'Experienced Ghanaian event caterer with a trained team and certified kitchen facility in Accra, available seven days a week.',
  'Senior IT consultant and Shopify developer with a focus on practical solutions for Ghanaian SMEs and retail businesses.',
  'Borehole and water system technician with specialist equipment for repairs, maintenance, and new installations.',
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
        load_type: randomFrom(['Full household furniture', 'Parcel deliveries', 'Event equipment', 'Branded cargo', 'School children', 'Office equipment', 'Cold chain pharmaceuticals']),
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

// Ratings range 3 to 5 (maps to 3.5 to 5 average when weighted correctly)
function randomRatingInt() {
  const roll = Math.random();
  if (roll < 0.08) return 3;
  if (roll < 0.30) return 4;
  return 5;
}

function randomComment(category, direction, isPositive) {
  const pool = REVIEW_COMMENTS[category];
  if (!pool) return '';
  const key = isPositive
    ? (direction === 'buyer_to_seller' ? 'buyer_positive' : 'seller_positive')
    : (direction === 'buyer_to_seller' ? 'buyer_negative' : 'seller_positive');
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
        portfolio_url: `https://portfolio.brafom.gh/seller${i + 1}`,
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

// 100 jobs with deadline groups close to 33/33/34 for 7/14/30 days
function createJobDocs(buyers) {
  const now = Date.now();
  const jobs = [];

  const totalJobs = 100;
  const deadlineBands = [
    ...Array(33).fill(7),
    ...Array(33).fill(14),
    ...Array(34).fill(30),
  ];
  const shuffledBands = shuffle(deadlineBands);

  // Jobs per category: 4 categories get 13, 4 categories get 12 = 100
  const categoryCounts = { 0: 13, 1: 13, 2: 13, 3: 13, 4: 12, 5: 12, 6: 12, 7: 12 };

  let bandIndex = 0;
  CATEGORIES.forEach((category, catIdx) => {
    const templates = CATEGORY_TEMPLATES[category] || [];
    const count = categoryCounts[catIdx];

    for (let i = 0; i < count; i += 1) {
      if (jobs.length >= totalJobs) break;

      const owner = randomFrom(buyers);
      const template = templates[i % templates.length];
      const budget = randomInt(template.budgetRange[0], template.budgetRange[1]);

      const baseDays = shuffledBands[bandIndex];
      bandIndex += 1;
      const dayOffset = baseDays === 7 ? randomInt(-1, 1) : baseDays === 14 ? randomInt(-2, 2) : randomInt(-3, 3);
      const deadline = new Date(now + (baseDays + dayOffset) * 24 * 60 * 60 * 1000);

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
        createdAt: new Date(now - randomInt(1, 10) * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      });
    }
  });

  return jobs;
}

async function createBidsAndFinalizeJobs(jobs, sellers) {
  const bidsToInsert = [];
  const jobBulkOps = [];
  const bidBulkOps = [];
  const reviewsToInsert = [];

  for (const job of jobs) {
    // Target average 7 bids per job
    const sellerCountForJob = randomInt(5, Math.min(9, sellers.length));
    const chosenSellers = pickUnique(sellers, sellerCountForJob);

    for (const seller of chosenSellers) {
      const maxAllowed = Math.max(100, Number(job.budget) - randomInt(30, 250));
      const amount = randomInt(80, maxAllowed);

      bidsToInsert.push({
        job_id: job._id,
        seller_id: seller._id,
        amount,
        note: `Experienced ${job.category.toLowerCase()} provider. My quote of GH\u00a2 ${amount.toLocaleString()} covers all agreed deliverables as described.`,
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

    const shouldClose = Math.random() < 0.65;
    if (!shouldClose) continue;

    const winningBid = [...jobBids].sort((a, b) => a.amount - b.amount)[0];
    const completed = Math.random() < 0.45;
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
      const isPosBuyer = buyerRating >= 4;
      const isPosSeller = sellerRating >= 4;

      reviewsToInsert.push({
        job_id: job._id,
        buyer_id: job.owner_id,
        seller_id: winningBid.seller_id,
        reviewer_id: job.owner_id,
        reviewee_id: winningBid.seller_id,
        rating: buyerRating,
        quality_rating: Math.min(5, Math.max(3, buyerRating + randomInt(-1, 1))),
        communication_rating: Math.min(5, Math.max(3, buyerRating + randomInt(-1, 1))),
        timeliness_rating: Math.min(5, Math.max(3, buyerRating + randomInt(-1, 0))),
        comment: randomComment(job.category, 'buyer_to_seller', isPosBuyer),
        createdAt: new Date(completionDate.getTime() + randomInt(1, 24) * 60 * 60 * 1000),
      });

      reviewsToInsert.push({
        job_id: job._id,
        buyer_id: job.owner_id,
        seller_id: winningBid.seller_id,
        reviewer_id: winningBid.seller_id,
        reviewee_id: job.owner_id,
        rating: sellerRating,
        quality_rating: Math.min(5, Math.max(3, sellerRating + randomInt(-1, 1))),
        communication_rating: Math.min(5, Math.max(3, sellerRating + randomInt(-1, 1))),
        timeliness_rating: Math.min(5, Math.max(3, sellerRating + randomInt(-1, 0))),
        comment: randomComment(job.category, 'seller_to_buyer', isPosSeller),
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

  const openJobs = await Job.countDocuments({ status: 'open' });
  const closedJobs = await Job.countDocuments({ status: 'closed' });
  const completedJobs = await Job.countDocuments({ status: 'completed' });

  console.log('\n=== Seed complete ===');
  console.log('Users:', await User.countDocuments());
  console.log('Jobs:', await Job.countDocuments());
  console.log('Bids:', await Bid.countDocuments());
  console.log('Reviews:', await Review.countDocuments());
  console.log(`Open: ${openJobs}, In progress: ${closedJobs}, Completed: ${completedJobs}`);

  const now = Date.now();
  const in7 = await Job.countDocuments({ deadline: { $lte: new Date(now + 9 * 24 * 60 * 60 * 1000) } });
  const in14 = await Job.countDocuments({ deadline: { $gt: new Date(now + 9 * 24 * 60 * 60 * 1000), $lte: new Date(now + 18 * 24 * 60 * 60 * 1000) } });
  const in30 = await Job.countDocuments({ deadline: { $gt: new Date(now + 18 * 24 * 60 * 60 * 1000) } });
  console.log(`Deadline bands: ~7 days: ${in7}, ~14 days: ${in14}, ~30 days: ${in30}`);

  await mongoose.disconnect();
  console.log('Disconnected');
}

seed().catch(async (err) => {
  console.error('Seeding failed:', err.message);
  await mongoose.disconnect();
  process.exit(1);
});
