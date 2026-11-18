// Hand-maintained corrections applied on top of the dr5hn dataset by build-data.mjs.
// Checked against: every state/UT capital, every district headquarters, and every city with 100k+ people
// (Census 2011), see test/reference-places.json. Keyed by current ISO 3166-2 state code.

/** Places missing from the dataset. */
export const SUPPLEMENT = {
  AN: ['Swaraj Dweep'],
  AP: ['Paderu'],
  AR: ['Anini', 'Boleng', 'Changlang', 'Koloriang', 'Lemmi', 'Likabali', 'Longding', 'Napangphung', 'Palin', 'Raga', 'Tato', 'Yachuli', 'Yingkiong', 'Yupia'],
  AS: ['Amingaon', 'Garamur', 'Hamren', 'Hatsingimari', 'Kajalgaon', 'Mushalpur', 'Pathsala', 'Sankardev Nagar', 'Tamulpur'],
  BR: ['Danapur'],
  CG: ['Balrampur', 'Mohla', 'Sukma', 'Surajpur'],
  DL: ['Bhalswa Jahangir Pur', 'Hastsal', 'Karawal Nagar', 'Kirari Suleman Nagar', 'Sultan Pur Majra'],
  HP: ['McLeod Ganj', 'Reckong Peo'],
  HR: ['Bhiwani', 'Kurukshetra'],
  JH: ['Adityapur', 'Mango'],
  JK: ['Gulmarg', 'Pahalgam'],
  KA: ['Kalaburagi', 'Shivamogga'],
  KL: ['Kakkanad', 'Painavu'],
  LA: ['Diskit', 'Drass', 'Khalatse', 'Nyoma', 'Sankoo'],
  MH: ['Gadchiroli', 'Oros', 'Vasai'],
  ML: ['Mawkyrwat'],
  MN: ['Imphal', 'Lamphelpat', 'Porompat', 'Senapati'],
  MP: ['Betul', 'Datia', 'Niwari', 'Waidhan'],
  MZ: ['Champhai', 'Hnahthial', 'Saitual'],
  NL: ['Chümoukedima', 'Kiphire', 'Longleng', 'Niuland', 'Noklak', 'Shamator', 'Tseminyü'],
  OD: ['Sundargarh'],
  PB: ['Fatehgarh Sahib', 'Zirakpur'],
  PY: ['Ozhukarai'],
  RJ: ['Deeg', 'Khairthal'],
  SK: ['Pakyong', 'Pelling', 'Soreng'],
  TN: ['Tirupattur'],
  TR: ['Bishramganj'],
  TS: ['Hanamkonda', 'Mulugu', 'Shamirpet'],
  UK: ['Dehradun', 'Gairsain', 'Gopeshwar', 'Kedarnath', 'New Tehri'],
  UP: ['Karwi', 'Khora', 'Naugarh', 'Shravasti'],
  WB: ['Alipore', 'Bidhannagar', 'Chinsurah', 'Maheshtala', 'North Dum Dum', 'South Dum Dum'],
};

/** Outdated or misspelled dataset names → current official name. The old name keeps working as an alias. */
export const RENAMES = {
  AP: { Cuddapah: 'Kadapa', Rajahmundry: 'Rajamahendravaram', Thenali: 'Tenali', Tadpatri: 'Tadipatri', Tadepallegudem: 'Tadepalligudem' },
  AR: { Along: 'Aalo' },
  BR: { Jahanabad: 'Jehanabad', Mothihari: 'Motihari', Luckeesarai: 'Lakhisarai' },
  CG: { 'Raj Nandgaon': 'Rajnandgaon' },
  HP: { Kulu: 'Kullu', Dharamsala: 'Dharamshala', Kyelang: 'Keylong' },
  JH: { Deogarh: 'Deoghar', Kodarma: 'Koderma', Sahibganj: 'Sahebganj', Saraikela: 'Seraikela' },
  JK: { Baramula: 'Baramulla', Rajauri: 'Rajouri', Punch: 'Poonch', Badgam: 'Budgam', Riasi: 'Reasi', Shupiyan: 'Shopian' },
  KA: { Bagalkot: 'Bagalkote', Chamrajnagar: 'Chamarajanagar' },
  LA: { Padam: 'Padum' },
  MH: { Aurangabad: 'Chhatrapati Sambhajinagar', Buldana: 'Buldhana' },
  MP: { Narsimhapur: 'Narsinghpur', 'Khajuraho Group of Monuments': 'Khajuraho' },
  OD: { Baudh: 'Boudh', Nowrangapur: 'Nabarangpur', Konarka: 'Konark' },
  PB: { Bhatinda: 'Bathinda' },
  RJ: { Abu: 'Mount Abu', Chittaurgarh: 'Chittorgarh', Jhunjhunun: 'Jhunjhunu', Dhaulpur: 'Dholpur' },
  TN: { Kallakkurichchi: 'Kallakurichi', Karaikkudi: 'Karaikudi', Thenkasi: 'Tenkasi', Thiruvallur: 'Tiruvallur', Villupuram: 'Viluppuram' },
  TR: { Ambasa: 'Ambassa' },
  TS: { Suriapet: 'Suryapet', Sangareddi: 'Sangareddy', Sirsilla: 'Sircilla', Kottagudem: 'Kothagudem', Wanparti: 'Wanaparthy', 'Nagar Karnul': 'Nagarkurnool' },
  UK: { 'Naini Tal': 'Nainital' },
  UP: { 'Bara Banki': 'Barabanki', Muradabad: 'Moradabad' },
  WB: { Berhampore: 'Baharampur', 'Ingraj Bazar': 'English Bazar' },
};

/** Dataset rows that are districts or divisions, not places. */
export const EXCLUDE = {
  UK: ['Tehri-Garhwal'],
};

/** Alternative names (old, short, or the municipal-corporation name) → name in this package. Per state. */
export const ALIASES = {
  AN: { 'Port Blair': 'Sri Vijaya Puram', Havelock: 'Swaraj Dweep', 'Havelock Island': 'Swaraj Dweep' },
  AP: { Anakapalli: 'Anakapalle', Ananthapuramu: 'Anantapur', Markapuram: 'Markapur', Parvathipuram: 'Parvatipuram', Vijayanagaram: 'Vizianagaram', Vizag: 'Visakhapatnam' },
  AS: { Mangaldoi: 'Mangaldai', Marigaon: 'Morigaon' },
  BR: { Bhabua: 'Bhabhua', Chhapra: 'Chapra' },
  CG: { 'Jashpur Nagar': 'Jashpurnagar' },
  GA: { Margao: 'Madgaon' },
  GJ: { 'Chhota Udaipur': 'Chhota Udepur', Mahesana: 'Mehsana', Morvi: 'Morbi', Somnath: 'Prabhas Patan', Baroda: 'Vadodara', 'Surendranagar Dudhrej': 'Surendranagar' },
  HR: { Gurgaon: 'Gurugram' },
  HP: { Simla: 'Shimla' },
  JH: { Daltonganj: 'Medininagar' },
  KA: {
    Bangalore: 'Bengaluru', 'Bengaluru South': 'Ramanagara', Mysore: 'Mysuru', Mangalore: 'Mangaluru', Belgaum: 'Belagavi',
    Hubli: 'Hubballi', 'Hubli–Dharwad': 'Hubballi', 'Hubli-Dharwad': 'Hubballi', Gulbarga: 'Kalaburagi', Shimoga: 'Shivamogga',
    Bijapur: 'Vijayapura', Bellary: 'Ballari', Tumkur: 'Tumakuru', Hospet: 'Hosapete', Hospete: 'Hosapete',
    Chikmagalur: 'Chikkamagaluru', Davangere: 'Davanagere',
  },
  KL: { Trivandrum: 'Thiruvananthapuram', Cochin: 'Kochi', Calicut: 'Kozhikode' },
  MH: {
    Bombay: 'Mumbai', Poona: 'Pune', Lonavala: 'Lonavla', Ahmednagar: 'Ahilyanagar', 'Kalyan-Dombivli': 'Kalyan', 'Mira-Bhayandar': 'Bhayandar',
    'Nanded Waghala': 'Nanded', 'Sangli-Miraj & Kupwad': 'Sangli', 'Vasai-Virar': 'Vasai',
  },
  ML: { Sohra: 'Cherrapunji' },
  OD: { Berhampur: 'Brahmapur', Debagarh: 'Deogarh', Subarnapur: 'Sonepur', Sundergarh: 'Sundargarh', 'Raurkela Industrial Township': 'Rourkela' },
  PB: { 'Sahibzada Ajit Singh Nagar': 'Mohali', 'SAS Nagar': 'Mohali' },
  PY: { Pondicherry: 'Puducherry' },
  TN: { Madras: 'Chennai', Udhagamandalam: 'Ooty', Kancheepuram: 'Kanchipuram', Tiruvannaamalai: 'Tiruvannamalai' },
  TS: { Bhupalpally: 'Jayashankar Bhupalapally' },
  UK: { 'Haldwani-Kathgodam': 'Haldwani' },
  UP: { Allahabad: 'Prayagraj', Cawnpore: 'Kanpur', Benares: 'Varanasi', Banaras: 'Varanasi', 'Maunath Bhanjan': 'Mau' },
  WB: {
    Calcutta: 'Kolkata', 'Bidhan Nagar': 'Bidhannagar', 'Salt Lake': 'Bidhannagar', 'North Dumdum': 'North Dum Dum',
    'South Dumdum': 'South Dum Dum', 'Hugli-Chuchura': 'Chinsurah', Chuchura: 'Chinsurah', Malda: 'English Bazar', Midnapore: 'Medinipur',
  },
};
