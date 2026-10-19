/*
 * HOTEL ND MANOR — shared configuration for contact details, room labels and media.
 * Keep all media paths relative to the repository root for GitHub Pages.
 */
window.NDM_CONFIG = {
  hotel: {
    name: "HOTEL ND MANOR",
    phoneDisplay: "+91 99684 07707",
    phoneTel: "+919968407707",
    calls: [
      { label: "Hotel line 1", display: "+91 99684 07707", tel: "+919968407707" },
      { label: "Hotel line 2", display: "+91 70789 44451", tel: "+917078944451" }
    ],
    whatsapp: "917417774451",
    whatsapps: [
      { label: "WhatsApp 1", display: "+91 74177 74451", number: "917417774451", url: "https://wa.me/917417774451" },
      { label: "WhatsApp 2", display: "+91 70789 44451", number: "917078944451", url: "https://wa.me/917078944451" }
    ],
    email: "ndmanorhotel@gmail.com",
    address: "Doon University Rd, Mothrowala, Dehradun, Uttarakhand 248121",
    instagram: "https://www.instagram.com/hotelndmanordehradun/?hl=en",
    maps: "https://www.google.com/maps/place/Hotel+ND+Manor/@30.2596924,78.0335144,17z/data=!4m9!3m8!1s0x39092971dd5e77a5:0x29014a071a2145b3!5m2!4m1!1i2!8m2!3d30.2596878!4d78.0360893!16s%2Fg%2F11txz3qr4w?entry=ttu&g_ep=EgoyMDI2MTAxMy4wIKXMDSoASAFQAw%3D%3D",
    directions: "https://www.google.com/maps/dir/?api=1&destination=Hotel+ND+Manor%2C+Doon+University+Rd%2C+Mothrowala%2C+Dehradun%2C+Uttarakhand+248121",
    canonical: "https://adi049.github.io/LiveNDMARON/"
  },
  media: {
    introPoster: "assets/img/nd-manor-1600.webp",
    homeHeroPoster: "assets/img/nd-manor-1600.webp"
  },
  /* Keep unavailable clips as inactive slots until their category, source and use are confirmed. */
  videoSlots: {
    intro: { src: "assets/videos/intro-video.mp4", poster: "assets/img/nd-manor-1600.webp", available: false },
    homeHero: { src: "assets/videos/home-hero.mp4", poster: "assets/img/nd-manor-1600.webp", available: false },
    deluxeRoom: { src: "assets/videos/deluxe-room.mp4", poster: "assets/img/gallery/deluxe-room.jpg", available: false },
    superDeluxeRoom: { src: "assets/videos/super-deluxe-room.mp4", poster: "assets/img/gallery/super-deluxe-room.jpg", available: false },
    hotelWalkthrough: { src: "assets/videos/hotel-walkthrough.mp4", poster: "assets/img/nd-manor-1000.webp", available: false },
    banquetHighlights: { src: "assets/videos/banquet-highlights.mp4", poster: "assets/img/gallery/banquet-lounge.webp", available: false }
  },
  images: {
    logo: "assets/img/nd-logo-mandala.png",
    exteriorDusk: "assets/img/nd-manor-1600.webp",
    exteriorDuskSmall: "assets/img/nd-manor-1000.webp",
    exteriorNight: "assets/img/gallery/hotel-exterior-night.webp",
    guestBedroomOne: "assets/img/gallery/deluxe-room.jpg",
    guestBedroomTwo: "assets/img/gallery/super-deluxe-room.jpg",
    bathroomTub: "assets/img/gallery/royal-suite-bathtub.jpg",
    bedroomWithSeating: "assets/img/gallery/royal-suite-bedroom.jpg",
    corridor: "assets/img/gallery/hotel-corridor.jpg",
    banquet: "assets/img/gallery/banquet-lounge.webp",
    dining: "assets/img/gallery/restaurant-dining.webp"
  },
  occupancy: {
    maxGuestsPerRoom: 3,
    quotedRateGuestCount: 2,
    additionalPersonChargeApplies: true,
    additionalGuestCharge: "Amount confirmed directly with HOTEL ND MANOR"
  },
  roomCatalog: [
    {
      id: "deluxe-room",
      name: "Deluxe Room",
      description: "A listed room category at HOTEL ND MANOR. Ask the hotel to confirm the room layout and included facilities for your dates.",
      meta: ["Maximum 3 guests per room"],
      features: [],
      videoSlot: "",
    },
    {
      id: "super-deluxe-balcony",
      name: "Super Deluxe Room With Balcony",
      description: "A balcony room category. Forest and Himalayan outlooks have been described for this category; please confirm the view and room configuration directly with the hotel.",
      meta: ["Maximum 3 guests per room"],
      features: [],
      videoSlot: "",
    },
    {
      id: "royal-suite-bathtub",
      name: "Royal Suite With Bathtub",
      description: "A separate suite category described with a bathtub. Confirm the room layout, fixtures and availability directly with the hotel.",
      meta: ["Maximum 3 guests per room"],
      features: [],
      videoSlot: "",
    },
    {
      id: "family-room",
      name: "Family Room",
      description: "A family room option for guests travelling together. Confirm the room layout, occupancy and included facilities directly with the hotel.",
      meta: ["3 family rooms listed"],
      features: ["Family-friendly room category", "Ask about bedding configuration"],
      videoSlot: "",
    }
  ],
  galleryLimit: 24,
  /*
   * Central metadata for approved images. Use neutral captions where the precise room category is unknown.
   * /uploads/download.png was inspected and is a near-duplicate of restaurant-dining.webp, so it is not added again.
   */
  galleryItems: [
    { id: "guest-bedroom-one", imageKey: "guestBedroomOne", alt: "A hotel bedroom interior with a bed and seating area.", caption: "Guest room interior", category: "rooms", layout: "tall" },
    { id: "guest-bedroom-two", imageKey: "guestBedroomTwo", alt: "Another bedroom interior with a bed, seating and a desk.", caption: "Bedroom interior", category: "rooms" },
    { id: "hotel-corridor", imageKey: "corridor", alt: "Interior hallway with several room doors.", caption: "Interior corridor", category: "interiors" },
    { id: "bathroom-tub", imageKey: "bathroomTub", alt: "Bathtub and washbasin in a bathroom, with a bedroom visible through a glass partition.", caption: "Bathroom with bathtub", category: "interiors" },
    { id: "bedroom-with-seating", imageKey: "bedroomWithSeating", alt: "Hotel bedroom with a bed and two chairs.", caption: "Bedroom with seating", category: "rooms", layout: "wide" },
    { id: "hotel-exterior-night", imageKey: "exteriorNight", alt: "Hotel facade illuminated after dark against a blue evening sky.", caption: "Exterior at night", category: "exterior", layout: "tall" },
    { id: "banquet-lounge", imageKey: "banquet", alt: "Indoor lounge with sofas and event-style chairs arranged around tables.", caption: "Indoor gathering space", category: "lounge", placeholder: "Lounge photography" },
    { id: "restaurant-dining", imageKey: "dining", alt: "Restaurant interior with dining tables, upholstered chairs and a buffet counter.", caption: "Restaurant dining room", category: "dining" }
  ]
};
