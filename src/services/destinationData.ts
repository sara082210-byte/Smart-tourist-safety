/**
 * Canonical destination data for SafeJourney
 * Covers the 5 supported Indian destinations with verified geographic coordinates,
 * official emergency resources, nearby safe places, alerts, and offline safety guidance.
 */

export interface SafePlaceItem {
  id: string
  name: string
  category: 'Police' | 'Hospital' | 'Tourist Center'
  address: string
  distance: string // Distance from destination focal point
  phone: string
  isOpen247: boolean
  verifiedSource: string
  lat: number
  lng: number
}

export interface DestinationAlert {
  id: string
  title: string
  category: 'Weather' | 'Security' | 'Advisory' | 'Crowd' | 'Road Condition'
  level: 'Low' | 'Moderate' | 'High'
  time: string
  description: string
  affectedArea: string
  isDemo: boolean
}

export interface OfflineEmergencyNumber {
  service: string
  number: string
  description: string
  telLink: string
  officialSource: string
}

export interface EmergencyPhrase {
  id: string
  situation: string
  english: string
  hindi: string
  hindiPronunciation: string
  localLanguage?: string
  localLanguageName?: string
  localPronunciation?: string
}

export interface DestinationData {
  id: number
  key: string
  name: string
  state: string
  latitude: number
  longitude: number
  tagline: string
  description: string
  imageUrl: string
  localPolice: {
    name: string
    phone: string
    address: string
  }
  safePlaces: SafePlaceItem[]
  alerts: DestinationAlert[]
  offlineGuidance: {
    highlights: string[]
    hazards: string[]
    precautions: string[]
  }
  localPhrases: EmergencyPhrase[]
}

/**
 * Universal National Emergency Numbers across India
 * Sources: https://112.gov.in/, https://www.incredibleindia.gov.in/en/emergency
 */
export const UNIVERSAL_EMERGENCY_NUMBERS: OfflineEmergencyNumber[] = [
  {
    service: 'All-in-One National Emergency Helpline',
    number: '112',
    description: "India's unified single emergency response number for Police, Fire, Ambulance, and Disaster.",
    telLink: 'tel:112',
    officialSource: 'Ministry of Home Affairs (112.gov.in)',
  },
  {
    service: 'Ministry of Tourism 24x7 Multi-lingual Helpline',
    number: '1363',
    description: 'Toll-free national tourist support available in 12 languages (including English, Hindi, French, Spanish).',
    telLink: 'tel:1363',
    officialSource: 'Incredible India / Ministry of Tourism',
  },
  {
    service: 'National Tourist Helpline (Alternate Toll-Free)',
    number: '1800-11-1363',
    description: 'Direct alternate toll-free helpline number for travelers across all Indian states.',
    telLink: 'tel:1800111363',
    officialSource: 'Ministry of Tourism, Govt of India',
  },
  {
    service: 'National Women Safety Helpline',
    number: '1091',
    description: 'Dedicated 24x7 helpline for women safety and emergency security response.',
    telLink: 'tel:1091',
    officialSource: 'National Commission for Women / Police',
  },
  {
    service: 'National Highway Emergency Assistance',
    number: '1033',
    description: 'Toll-free emergency helpline for assistance, medical aid, or vehicle breakdown on National Highways.',
    telLink: 'tel:1033',
    officialSource: 'National Highways Authority of India (NHAI)',
  },
]

/**
 * Comprehensive Emergency Phrases
 * Covering all 11 required emergency scenarios with English, Hindi, and regional equivalents.
 */
export const CRITICAL_EMERGENCY_PHRASES: EmergencyPhrase[] = [
  {
    id: 'p-1',
    situation: 'Asking for police assistance',
    english: 'Please help, call the police immediately!',
    hindi: 'कृपया मदद करें, तुरंत पुलिस को बुलाइए!',
    hindiPronunciation: 'Kripya madad karein, turant police ko bulaiye!',
  },
  {
    id: 'p-2',
    situation: 'Requesting an ambulance or medical help',
    english: 'I need an ambulance urgently. Someone is sick.',
    hindi: 'मुझे तुरंत एम्बुलेंस चाहिए। कोई बीमार है।',
    hindiPronunciation: 'Mujhe turant ambulance chahiye. Koi beemar hai.',
  },
  {
    id: 'p-3',
    situation: 'Explaining that someone is injured',
    english: 'Someone is badly injured. Please call for medical help.',
    hindi: 'यहाँ कोई गंभीर रूप से घायल है। कृपया डॉक्टर को बुलाइए।',
    hindiPronunciation: 'Yahan koi gambhir roop se ghayal hai. Kripya doctor ko bulaiye.',
  },
  {
    id: 'p-4',
    situation: 'Asking for the nearest hospital',
    english: 'Where is the nearest hospital or medical clinic?',
    hindi: 'सबसे नज़दीकी अस्पताल या क्लिनिक कहाँ है?',
    hindiPronunciation: 'Sabse nazdeeki aspatal ya clinic kahan hai?',
  },
  {
    id: 'p-5',
    situation: 'Reporting a lost passport',
    english: 'I have lost my passport and travel documents. Where can I report this?',
    hindi: 'मेरा पासपोर्ट और यात्रा दस्तावेज खो गए हैं। मैं कहाँ रिपोर्ट करूँ?',
    hindiPronunciation: 'Mera passport aur yatra dastavez kho gaye hain. Main kahan report karoon?',
  },
  {
    id: 'p-6',
    situation: 'Reporting a missing person',
    english: 'My companion is missing. They were wearing a blue jacket.',
    hindi: 'मेरा साथी लापता है। उन्होंने नीले रंग का जैकेट पहना था।',
    hindiPronunciation: 'Mera saathi laapata hai. Unhone neele rang ka jacket pehna tha.',
  },
  {
    id: 'p-7',
    situation: 'Asking for help in an unsafe situation',
    english: 'I feel unsafe here. Please help me get to a secure place.',
    hindi: 'मुझे यहाँ असुरक्षित लग रहा है। कृपया मुझे सुरक्षित स्थान तक पहुँचने में मदद करें।',
    hindiPronunciation: 'Mujhe yahan asurakshit lag raha hai. Kripya mujhe surakshit sthan tak pahunchne mein madad karein.',
  },
  {
    id: 'p-8',
    situation: 'Communicating an allergy or urgent medical need',
    english: 'I have a severe medication allergy. I need a doctor right away.',
    hindi: 'मुझे दवा से गंभीर एलर्जी है। मुझे तुरंत डॉक्टर की ज़रूरत है।',
    hindiPronunciation: 'Mujhe dawa se gambhir allergy hai. Mujhe turant doctor ki zaroorat hai.',
  },
  {
    id: 'p-9',
    situation: 'Asking for directions to a police station',
    english: 'Could you please point me towards the nearest police station?',
    hindi: 'क्या आप मुझे नज़दीकी पुलिस स्टेशन का रास्ता बता सकते हैं?',
    hindiPronunciation: 'Kya aap mujhe nazdeeki police station ka raasta bata sakte hain?',
  },
  {
    id: 'p-10',
    situation: 'Asking for directions to a tourist assistance centre',
    english: 'Where is the government tourist information or assistance centre?',
    hindi: 'सरकारी पर्यटन सूचना एवं सहायता केंद्र कहाँ स्थित है?',
    hindiPronunciation: 'Sarkari paryatan soochana evam sahayata kendra kahan sthit hai?',
  },
  {
    id: 'p-11',
    situation: 'Requesting help when unable to speak the local language',
    english: "I do not speak the local language. Does anyone speak English?",
    hindi: 'मुझे स्थानीय भाषा नहीं आती। क्या यहाँ कोई अंग्रेज़ी बोलता है?',
    hindiPronunciation: 'Mujhe sthaniye bhasha nahi aati. Kya yahan koi Angrezi bolta hai?',
  },
]

/**
 * 5 Canonical Supported Destinations
 */
export const DESTINATIONS_DATA: Record<number, DestinationData> = {
  1: {
    id: 1,
    key: 'goa',
    name: 'Goa Beach and Heritage',
    state: 'Goa',
    latitude: 15.2993,
    longitude: 74.1240,
    tagline: 'Sun-drenched coastlines, historic churches & designated safe beach corridors',
    description: 'A coastal paradise known for pristine sandy beaches, colonial Portuguese architecture, and safe seaside promenades.',
    imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
    localPolice: {
      name: 'Goa Tourist Police Unit (Panaji)',
      phone: '+91 832 2420875',
      address: 'Paryatan Bhavan, Patto Plaza, Panaji, Goa 403001',
    },
    safePlaces: [
      {
        id: 'sp-goa-1',
        name: 'Goa Tourist Police Station (Panaji)',
        category: 'Police',
        address: 'Patto Plaza, Panaji, North Goa 403001',
        distance: '1.4 km',
        phone: '+91 832 2420875',
        isOpen247: true,
        verifiedSource: 'Goa Police Official Directory (goapolice.gov.in)',
        lat: 15.4989,
        lng: 73.8278,
      },
      {
        id: 'sp-goa-2',
        name: 'Goa Medical College & Hospital (GMC)',
        category: 'Hospital',
        address: 'Bambolim, Tiswadi, Goa 403202',
        distance: '4.8 km',
        phone: '+91 832 2458725',
        isOpen247: true,
        verifiedSource: 'Directorate of Health Services Goa',
        lat: 15.4611,
        lng: 73.8569,
      },
      {
        id: 'sp-goa-3',
        name: 'GTDC Central Tourist Information Counter',
        category: 'Tourist Center',
        address: 'Paryatan Bhavan, Patto, Panaji, Goa 403001',
        distance: '1.6 km',
        phone: '+91 832 2438520',
        isOpen247: false,
        verifiedSource: 'Goa Tourism Development Corp (goatourism.gov.in)',
        lat: 15.4975,
        lng: 73.8290,
      },
      {
        id: 'sp-goa-4',
        name: 'Calangute Tourist Police Outpost',
        category: 'Police',
        address: 'Calangute Beach Road, North Goa 403516',
        distance: '9.2 km',
        phone: '+91 832 2278255',
        isOpen247: true,
        verifiedSource: 'North Goa District Police Records',
        lat: 15.5435,
        lng: 73.7554,
      },
    ],
    alerts: [
      {
        id: 'alt-goa-1',
        title: 'High Surf & Strong Rip Currents Advisory',
        category: 'Weather',
        level: 'Moderate',
        time: '35 mins ago',
        description: 'Strong swell and undercurrents reported along Calangute and Baga beach zones. Swim only within red-and-yellow flagged areas patrolled by Drishti lifeguards.',
        affectedArea: 'North Goa Coastline',
        isDemo: true,
      },
      {
        id: 'alt-goa-2',
        title: 'Coastal Highway Traffic Re-routing',
        category: 'Road Condition',
        level: 'Low',
        time: '2 hours ago',
        description: 'Road widening work underway along the Chogm Road stretch; minor delays during evening rush. Use inner link roads where available.',
        affectedArea: 'Porvorim - Sangolda Link',
        isDemo: true,
      },
      {
        id: 'alt-goa-3',
        title: 'Monsoon Sea-Swimming Prohibition',
        category: 'Advisory',
        level: 'High',
        time: '5 hours ago',
        description: 'Strict prohibition on entering sea water during active squalls. Water sports operations temporarily halted pending weather clearance.',
        affectedArea: 'All Goa Beaches',
        isDemo: true,
      },
    ],
    offlineGuidance: {
      highlights: [
        'Lifebuoy and lifeguard stations are stationed at 40+ key beaches across Goa.',
        'Official 112 emergency and +91 832 2420875 tourist police assist international and domestic visitors.',
        'Prepaid taxi counters are operated at Dabolim (GOI) and Mopa (GOX) airports.',
      ],
      hazards: [
        'Hidden sandbars and sudden drop-offs with strong undertow currents.',
        'Renting two-wheelers without helmet/license carries strict penalties and accident risk.',
        'Monsoon tides (June-September) make sea bathing hazardous.',
      ],
      precautions: [
        'Always heed colored beach safety flags: Red = Danger / Do Not Swim; Red-over-Yellow = Lifeguard Supervised.',
        'Carry bottled water to stay hydrated under humid coastal sun.',
        'Never drive two-wheelers on beach sand; keep emergency contacts saved offline.',
      ],
    },
    localPhrases: [
      {
        id: 'goa-1',
        situation: 'Konkani: Asking for help',
        english: 'Please help me!',
        hindi: 'कृपया मेरी मदद करें!',
        hindiPronunciation: 'Kripya meri madad karein!',
        localLanguage: 'उपकार करून म्हाका मदत करात!',
        localLanguageName: 'Konkani',
        localPronunciation: 'Upkar korun mhaka modot korat!',
      },
      {
        id: 'goa-2',
        situation: 'Konkani: Where is the police station?',
        english: 'Where is the police station?',
        hindi: 'पुलिस थाना कहाँ है?',
        hindiPronunciation: 'Police thana kahan hai?',
        localLanguage: 'पोलिस ठाणे खंय आसा?',
        localLanguageName: 'Konkani',
        localPronunciation: 'Police thane khoin asa?',
      },
    ],
  },
  2: {
    id: 2,
    key: 'jaipur',
    name: 'Jaipur Pink City',
    state: 'Rajasthan',
    latitude: 26.9124,
    longitude: 75.7873,
    tagline: 'Royal palaces, UNESCO heritage forts & monitored heritage tourist corridors',
    description: 'Historic capital featuring Amber Fort, City Palace, Hawa Mahal, and monitored tourist safety corridors.',
    imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80',
    localPolice: {
      name: 'Jaipur Tourist Police Station',
      phone: '+91 141 2369600',
      address: 'Near Ajmeri Gate, MI Road, Jaipur, Rajasthan 302001',
    },
    safePlaces: [
      {
        id: 'sp-jpr-1',
        name: 'Jaipur Tourist Police Station (Ajmeri Gate)',
        category: 'Police',
        address: 'Ajmeri Gate, Walled City, Jaipur 302001',
        distance: '0.8 km',
        phone: '+91 141 2369600',
        isOpen247: true,
        verifiedSource: 'Rajasthan Police Official Directory (jaipurpolice.com)',
        lat: 26.9160,
        lng: 75.8200,
      },
      {
        id: 'sp-jpr-2',
        name: 'Sawai Man Singh (SMS) Government Hospital',
        category: 'Hospital',
        address: 'JLN Marg, Ashok Nagar, Jaipur 302004',
        distance: '2.1 km',
        phone: '+91 141 2560291',
        isOpen247: true,
        verifiedSource: 'SMS Medical College & Hospital Directory',
        lat: 26.8995,
        lng: 75.8152,
      },
      {
        id: 'sp-jpr-3',
        name: 'Rajasthan Tourism Reception Centre (RTDC)',
        category: 'Tourist Center',
        address: 'Tourist Information Bureau, Railway Station Platform 1, Jaipur 302006',
        distance: '2.9 km',
        phone: '+91 141 2822858',
        isOpen247: false,
        verifiedSource: 'Rajasthan Tourism (tourism.rajasthan.gov.in)',
        lat: 26.9197,
        lng: 75.7878,
      },
      {
        id: 'sp-jpr-4',
        name: 'Amer Fort Tourist Police Assistance Booth',
        category: 'Police',
        address: 'Devi Singhpura, Amer, Jaipur 302028',
        distance: '10.5 km',
        phone: '+91 141 2530264',
        isOpen247: false,
        verifiedSource: 'Archaeological Survey & Jaipur Police',
        lat: 26.9855,
        lng: 75.8513,
      },
    ],
    alerts: [
      {
        id: 'alt-jpr-1',
        title: 'Extreme Daytime Temperature Advisory',
        category: 'Weather',
        level: 'Moderate',
        time: '1 hour ago',
        description: 'Daytime temperatures expected to touch 39°C. Keep well hydrated, wear sun protection, and plan open fort visits before 11:00 AM or after 4:00 PM.',
        affectedArea: 'Jaipur Urban & Heritage Zone',
        isDemo: true,
      },
      {
        id: 'alt-jpr-2',
        title: 'Walled City Market Congestion Advisory',
        category: 'Crowd',
        level: 'Low',
        time: '3 hours ago',
        description: 'Dense festive shopping footfall reported near Johari and Bapu Bazaars. Use e-rickshaws or public transit to navigate narrow alleys.',
        affectedArea: 'Johari Bazaar & Bapu Bazaar',
        isDemo: true,
      },
      {
        id: 'alt-jpr-3',
        title: 'Amber Fort Elephant Pathway Schedule',
        category: 'Advisory',
        level: 'Low',
        time: '6 hours ago',
        description: 'Morning tourist elephant rides operate strictly between 07:30 AM and 11:30 AM subject to heat index limits for animal welfare.',
        affectedArea: 'Amer Fort Ascent',
        isDemo: true,
      },
    ],
    offlineGuidance: {
      highlights: [
        'Tourist Police patrol key monuments including Hawa Mahal, Jantar Mantar, and Amer Fort.',
        'Fixed-fare smart auto booths operate at Jaipur Junction and Sindhi Camp Bus Stand.',
        'Composite monument tickets are available online to avoid queue touts.',
      ],
      hazards: [
        'Extreme summer heat waves require strict hydration and sun protection.',
        'Aggressive unofficial guides or gem/carpet shop commission drivers.',
        'Heavy vehicular and pedestrian crowding within Walled City narrow gates.',
      ],
      precautions: [
        'Purchase official monument tickets exclusively at ASI counters or official portals.',
        'Politely decline unsolicited street offers for gem certifications or private emporiums.',
        'Keep the Jaipur Tourist Police Helpline (+91 141 2369600) saved in your speed dial.',
      ],
    },
    localPhrases: [
      {
        id: 'jpr-1',
        situation: 'Hindi: Where is the hospital?',
        english: 'Where is the nearest hospital?',
        hindi: 'सबसे नज़दीकी अस्पताल कहाँ है?',
        hindiPronunciation: 'Sabse nazdeeki aspatal kahan hai?',
      },
    ],
  },
  3: {
    id: 3,
    key: 'munnar',
    name: 'Munnar Tea Highlands',
    state: 'Kerala',
    latitude: 10.0889,
    longitude: 77.0595,
    tagline: 'Mist-clad Western Ghats, emerald tea estates & high-altitude eco-reserves',
    description: 'Serene hill station renowned for lush emerald tea estates, mist-covered mountains, and guided eco-trails.',
    imageUrl: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80',
    localPolice: {
      name: 'Munnar Police Station',
      phone: '+91 4865 230321',
      address: 'Kochi-Dhanushkodi Road, Munnar, Kerala 685612',
    },
    safePlaces: [
      {
        id: 'sp-mun-1',
        name: 'Munnar Police Station',
        category: 'Police',
        address: 'Kochi - Dhanushkodi Road, Munnar 685612',
        distance: '0.6 km',
        phone: '+91 4865 230321',
        isOpen247: true,
        verifiedSource: 'Kerala Police Official Portal (keralapolice.gov.in)',
        lat: 10.0872,
        lng: 77.0610,
      },
      {
        id: 'sp-mun-2',
        name: 'Tata Tea General Hospital',
        category: 'Hospital',
        address: 'Nullatanni, Munnar, Idukki District, Kerala 685612',
        distance: '1.2 km',
        phone: '+91 4865 230223',
        isOpen247: true,
        verifiedSource: 'Idukki District Health Administration',
        lat: 10.0815,
        lng: 77.0632,
      },
      {
        id: 'sp-mun-3',
        name: 'DTPC Tourist Information Centre (Munnar)',
        category: 'Tourist Center',
        address: 'Old Munnar Town, Near KSRTC Depot, Munnar 685612',
        distance: '1.1 km',
        phone: '+91 4865 231516',
        isOpen247: false,
        verifiedSource: 'District Tourism Promotion Council Idukki',
        lat: 10.0760,
        lng: 77.0585,
      },
      {
        id: 'sp-mun-4',
        name: 'Devikulam Police Station & First Aid Post',
        category: 'Police',
        address: 'Devikulam, Idukki District 685613',
        distance: '7.8 km',
        phone: '+91 4865 264225',
        isOpen247: true,
        verifiedSource: 'Kerala Police Idukki Rural Division',
        lat: 10.0631,
        lng: 77.1022,
      },
    ],
    alerts: [
      {
        id: 'alt-mun-1',
        title: 'Dense Mountain Fog & Reduced Visibility',
        category: 'Weather',
        level: 'Moderate',
        time: '45 mins ago',
        description: 'Heavy evening fog blankets Gap Road and Top Station routes. Drivers must use fog lamps and maintain safe stopping distances on winding ghat hairpin turns.',
        affectedArea: 'Munnar - Gap Road / Bodimettu',
        isDemo: true,
      },
      {
        id: 'alt-mun-2',
        title: 'Monsoon Landslide Caution Advisory',
        category: 'Road Condition',
        level: 'High',
        time: '2 hours ago',
        description: 'Intermittent soil sliding observed along NH-85 stretch after continuous rain. Night driving between 7 PM and 6 AM is strictly discouraged by district authorities.',
        affectedArea: 'NH-85 Kochi-Dhanushkodi Route',
        isDemo: true,
      },
      {
        id: 'alt-mun-3',
        title: 'Eravikulam National Park Nilgiri Tahr Sanctuary Entry',
        category: 'Advisory',
        level: 'Low',
        time: '7 hours ago',
        description: 'Advance online booking is mandatory for park safaris. Visitors must remain inside designated shuttle vehicles and avoid walking onto cliff edges.',
        affectedArea: 'Eravikulam National Park (Rajamalai)',
        isDemo: true,
      },
    ],
    offlineGuidance: {
      highlights: [
        'Munnar is 1,600m above sea level with winding ghat roads having over 40 hairpin bends.',
        'Tata General Hospital and Government First Aid centers handle mountain emergencies.',
        'DTPC facilitates registered trekking guides for Anamudi and Meesapulimala trails.',
      ],
      hazards: [
        'Dense fog suddenly drops visibility to below 5 meters on mountain roads.',
        'Monsoon rains (June to October) frequently cause rockslides along cliff cuttings.',
        'Wild elephant crossings occur near Mattupetty and Chinnar forest fringes.',
      ],
      precautions: [
        'Do not step out of vehicles if wildlife is spotted on road edges.',
        'Hire mountain-experienced drivers; avoid speeding on blind turns.',
        'Carry warm waterproof clothing as temperatures dip sharply at dusk.',
      ],
    },
    localPhrases: [
      {
        id: 'mun-1',
        situation: 'Malayalam: Please help me',
        english: 'Please help me!',
        hindi: 'कृपया मेरी मदद करें!',
        hindiPronunciation: 'Kripya meri madad karein!',
        localLanguage: 'ദയവായി എന്നെ സഹായിക്കൂ!',
        localLanguageName: 'Malayalam',
        localPronunciation: 'Dayavayi enne sahayikkoo!',
      },
      {
        id: 'mun-2',
        situation: 'Malayalam: Where is the doctor/hospital?',
        english: 'Where is the hospital or doctor?',
        hindi: 'अस्पताल या डॉक्टर कहाँ है?',
        hindiPronunciation: 'Aspatal ya doctor kahan hai?',
        localLanguage: 'ഡോക്ടർ അല്ലെങ്കിൽ ആശുപത്രി എവിടെയാണ്?',
        localLanguageName: 'Malayalam',
        localPronunciation: 'Doctor allengil aashupathri evideyannu?',
      },
    ],
  },
  4: {
    id: 4,
    key: 'manali',
    name: 'Manali Mountain Valley',
    state: 'Himachal Pradesh',
    latitude: 32.2432,
    longitude: 77.1892,
    tagline: 'Snow-capped Pir Panjal ranges, alpine river valley & high Himalayan passes',
    description: 'Scenic Himalayan mountain resort offering snowy peaks, alpine passes, and tourist assistance stations.',
    imageUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
    localPolice: {
      name: 'Manali Police Station',
      phone: '+91 1902 252320',
      address: 'Mall Road, Manali, Himachal Pradesh 175131',
    },
    safePlaces: [
      {
        id: 'sp-man-1',
        name: 'Manali Police Station',
        category: 'Police',
        address: 'The Mall Road, Manali, Kullu District 175131',
        distance: '0.4 km',
        phone: '+91 1902 252320',
        isOpen247: true,
        verifiedSource: 'Himachal Pradesh Police (hppolice.gov.in)',
        lat: 32.2415,
        lng: 77.1885,
      },
      {
        id: 'sp-man-2',
        name: 'Civil Hospital Manali',
        category: 'Hospital',
        address: 'Model Town, Near Mall Road, Manali 175131',
        distance: '0.7 km',
        phone: '+91 1902 253385',
        isOpen247: true,
        verifiedSource: 'HP Health Department Official Registry',
        lat: 32.2450,
        lng: 77.1910,
      },
      {
        id: 'sp-man-3',
        name: 'HPTDC Tourist Information Centre',
        category: 'Tourist Center',
        address: 'The Mall, Manali, Himachal Pradesh 175131',
        distance: '0.3 km',
        phone: '+91 1902 253531',
        isOpen247: false,
        verifiedSource: 'Himachal Tourism (himachaltourism.gov.in)',
        lat: 32.2400,
        lng: 77.1870,
      },
      {
        id: 'sp-man-4',
        name: 'Atal Tunnel North/South Portal Traffic Police Post',
        category: 'Police',
        address: 'Atal Tunnel South Portal, Dhundi, Manali 175103',
        distance: '21.0 km',
        phone: '+91 1902 250100',
        isOpen247: true,
        verifiedSource: 'Border Roads Organisation / HP Police',
        lat: 32.3610,
        lng: 77.1320,
      },
    ],
    alerts: [
      {
        id: 'alt-man-1',
        title: 'High-Altitude Cold Wave & Icy Road Warning',
        category: 'Weather',
        level: 'Moderate',
        time: '50 mins ago',
        description: 'Night temperatures dipping to -2°C with black ice forming on Solang Valley approaches and Rohtang pass route. Use anti-skid tire chains when advised.',
        affectedArea: 'Solang Valley & Rohtang Pass Route',
        isDemo: true,
      },
      {
        id: 'alt-man-2',
        title: 'Beas River Bank Safety Enactment',
        category: 'Security',
        level: 'High',
        time: '3 hours ago',
        description: 'Strict prohibition against stepping onto boulders or gravel beds in the Beas River basin due to sudden hydro-dam water releases.',
        affectedArea: 'Beas River Banks (Kullu to Manali stretch)',
        isDemo: true,
      },
      {
        id: 'alt-man-3',
        title: 'Atal Tunnel Entry Pass & Speed Regulations',
        category: 'Advisory',
        level: 'Low',
        time: '8 hours ago',
        description: 'Speed strictly limited to 60 km/h within Atal Tunnel with CCTV monitoring. No overtaking or stopping inside the tunnel tube.',
        affectedArea: 'Atal Tunnel (Rohtang)',
        isDemo: true,
      },
    ],
    offlineGuidance: {
      highlights: [
        'Manali is situated at 2,050m altitude; Atal Tunnel and Rohtang Pass exceed 3,100m to 3,978m.',
        'High-altitude medical centers and oxygen supplies are available at Civil Hospital Manali.',
        'Disaster Management Control Room Kullu operates 24/7 on 1077 / 112.',
      ],
      hazards: [
        'Acute mountain sickness (AMS) can affect unacclimatized visitors visiting passes above 3,000m.',
        'Black ice and sudden snowstorms cause vehicle skidding on high-altitude passes.',
        'Flash floods and rapid river level rises in Beas river without prior warning.',
      ],
      precautions: [
        'Wear multiple thermal layers, waterproof gloves, and high-traction footwear.',
        'Never drink alcohol or exert heavily immediately upon reaching high passes.',
        'Check BRO (Border Roads Organisation) morning clearance status before planning Rohtang or Leh journeys.',
      ],
    },
    localPhrases: [
      {
        id: 'man-1',
        situation: 'Hindi/Pahari: Cold emergency / Need doctor',
        english: 'I am freezing and feel unwell. I need urgent medical attention.',
        hindi: 'मुझे बहुत ठंड लग रही है और तबीयत खराब है। तुरंत डॉक्टर चाहिए।',
        hindiPronunciation: 'Mujhe bahut thand lag rahi hai aur tabiyat kharab hai. Turant doctor chahiye.',
      },
    ],
  },
  5: {
    id: 5,
    key: 'varanasi',
    name: 'Varanasi Cultural Ghats',
    state: 'Uttar Pradesh',
    latitude: 25.3176,
    longitude: 82.9739,
    tagline: 'Ancient spiritual ghats, evening Ganga Aarti & vibrant heritage lanes',
    description: 'Sacred spiritual hub celebrated for river ghats along the Ganga, evening Aarti ceremonies, and rich heritage walks.',
    imageUrl: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
    localPolice: {
      name: 'Varanasi Tourist Police Booth (Dashashwamedh)',
      phone: '+91 542 2451730',
      address: 'Dashashwamedh Ghat Road, Godowlia, Varanasi, UP 221001',
    },
    safePlaces: [
      {
        id: 'sp-vns-1',
        name: 'Varanasi Tourist Police Booth (Dashashwamedh Ghat)',
        category: 'Police',
        address: 'Dashashwamedh Ghat, Godowlia, Varanasi 221001',
        distance: '0.3 km',
        phone: '+91 542 2451730',
        isOpen247: true,
        verifiedSource: 'Varanasi Commissionerate Police (varanasi.nic.in)',
        lat: 25.3075,
        lng: 83.0105,
      },
      {
        id: 'sp-vns-2',
        name: 'Sir Sunderlal Hospital (IMS-BHU)',
        category: 'Hospital',
        address: 'Banaras Hindu University Campus, Varanasi 221005',
        distance: '3.9 km',
        phone: '+91 542 2369291',
        isOpen247: true,
        verifiedSource: 'Institute of Medical Sciences, BHU',
        lat: 25.2750,
        lng: 82.9995,
      },
      {
        id: 'sp-vns-3',
        name: 'UP Tourism Regional Tourist Office',
        category: 'Tourist Center',
        address: 'Parade Kothi, Near Varanasi Cantt Railway Station, Varanasi 221002',
        distance: '3.6 km',
        phone: '+91 542 2206638',
        isOpen247: false,
        verifiedSource: 'UP Tourism Official Portal (uptourism.gov.in)',
        lat: 25.3280,
        lng: 82.9860,
      },
      {
        id: 'sp-vns-4',
        name: 'Chowk Police Station (Vishwanath Corridor)',
        category: 'Police',
        address: 'Chowk, Near Kashi Vishwanath Temple, Varanasi 221001',
        distance: '0.9 km',
        phone: '+91 542 2401625',
        isOpen247: true,
        verifiedSource: 'Varanasi Police Administration',
        lat: 25.3115,
        lng: 83.0118,
      },
    ],
    alerts: [
      {
        id: 'alt-vns-1',
        title: 'Evening Ganga Aarti Ghat Footfall Congestion',
        category: 'Crowd',
        level: 'Moderate',
        time: '1 hour ago',
        description: 'Large gatherings expected at Dashashwamedh and Rajendra Prasad Ghats between 18:00 and 19:30. Visitors should arrive early and secure boats via official tickets.',
        affectedArea: 'Dashashwamedh & Assi Ghats',
        isDemo: true,
      },
      {
        id: 'alt-vns-2',
        title: 'River Current & Boat Lifejacket Mandate',
        category: 'Security',
        level: 'High',
        time: '4 hours ago',
        description: 'Water police actively patrolling the river. Passengers on all mechanized or row boats must wear lifejackets throughout their ride; violators face vessel impoundment.',
        affectedArea: 'Ganga River Waterfront (Assi to Namo Ghat)',
        isDemo: true,
      },
      {
        id: 'alt-vns-3',
        title: 'Vishwanath Corridor Pedestrian Route Advisory',
        category: 'Advisory',
        level: 'Low',
        time: '9 hours ago',
        description: 'Locker facilities available at Gate No. 4. Mobile phones, electronic keys, and heavy bags are prohibited beyond security checkpoints inside temple premises.',
        affectedArea: 'Kashi Vishwanath Temple Precinct',
        isDemo: true,
      },
    ],
    offlineGuidance: {
      highlights: [
        'Varanasi has 84 historic ghats stretching along the crescent curve of the Ganga.',
        'Tourist Police assist international and national pilgrims at Dashashwamedh and Cantt.',
        'BHU Sir Sunderlal Hospital is Eastern UP’s premier super-specialty trauma facility.',
      ],
      hazards: [
        'High water currents in the Ganga, particularly near deep ghat steps and whirlpool areas.',
        'Extremely dense labyrinth of narrow alleys (galis) where GPS reception can fluctuate.',
        'Touts offering unauthorized boat rides or charging exorbitant crematorium viewing fees.',
      ],
      precautions: [
        'Always wear an approved lifejacket before boarding any boat on the Ganga.',
        'Keep a card with your hotel name and contact number written in Hindi/English.',
        'Respect sacred cremation traditions at Manikarnika and Harishchandra Ghats; photography is strictly forbidden.',
      ],
    },
    localPhrases: [
      {
        id: 'vns-1',
        situation: 'Hindi: Where is the ghat/boat counter?',
        english: 'Where is the official boat counter?',
        hindi: 'सरकारी नाव बुकिंग काउंटर कहाँ है?',
        hindiPronunciation: 'Sarkari naav booking counter kahan hai?',
      },
    ],
  },
}

export const SUPPORTED_DESTINATIONS: DestinationData[] = Object.values(DESTINATIONS_DATA)

/**
 * Helper to retrieve destination record by ID or fallback to first destination (Goa)
 */
export function getDestinationData(id?: number | null): DestinationData {
  if (id && DESTINATIONS_DATA[id]) {
    return DESTINATIONS_DATA[id]
  }
  return DESTINATIONS_DATA[1]
}

/**
 * Helper to find destination by query string or name match
 */
export function findDestinationByQuery(query: string): DestinationData | null {
  const q = query.toLowerCase().trim()
  if (!q) return null

  for (const item of Object.values(DESTINATIONS_DATA)) {
    if (
      item.name.toLowerCase().includes(q) ||
      item.key.toLowerCase().includes(q) ||
      item.state.toLowerCase().includes(q)
    ) {
      return item
    }
  }
  return null
}
