import { Injectable, signal, computed } from '@angular/core';
import {
  AdminDashboardMetrics,
  Order,
  TrackedLink,
  SupportTicket,
  AiModelView,
  User,
  PaymentRecord,
  DeliveryCourier,
  CommunityFitSubmission,
  LoyaltyTier,
} from '@shared/models';
import { getApiBaseUrl } from './api-config';

export type TimeframeOption = '24h' | '7d' | '30d' | 'quarter' | 'ytd';

const SAMPLE_ORDERS: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 'ATL-924180',
    createdAt: '2026-11-14T10:14:00Z',
    status: 'confirmed',
    items: [
      {
        id: 'ci-1',
        productId: 'prod-002',
        productTitle: 'Midnight Obsidian Italian Cashmere 160s Wool',
        productSlug: 'midnight-italian-cashmere-senator',
        price: 42000,
        quantity: 4,
        unit: 'yard',
        selectedColor: 'Obsidian Black',
        image:
          'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=400&q=80',
        lineTotal: 168000,
      },
      {
        id: 'ci-2',
        productId: 'prod-004',
        productTitle: 'Sovereign Onyx & 18K Gold Precision Cufflinks',
        productSlug: 'sovereign-onyx-gold-cufflinks',
        price: 32000,
        quantity: 1,
        unit: 'pair',
        selectedColor: 'Onyx & Gold',
        image:
          'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=400&q=80',
        lineTotal: 32000,
      },
    ],
    subtotal: 200000,
    deliveryFee: 0,
    discount: 20000,
    total: 180000,
    customerDetails: {
      phone: '+2348023456789',
      name: 'Senator Adewale Adeleke',
      email: 'a.adeleke@lagosexec.ng',
    },
    deliveryDetails: {
      address: 'Plot 12, Osborne Foreshore Estate, Phase 2, Ikoyi',
      state: 'Lagos',
      lga: 'Eti-Osa',
      landmark: 'Near Osborne Club',
      speed: 'lagos_same_day',
    },
    paymentMethod: 'bank_transfer',
    paymentStatus: 'paid',
    trackingTimeline: [
      {
        status: 'confirmed',
        title: 'Payment Confirmed',
        description:
          'Instant virtual account transfer verified by Wema switch.',
        timestamp: '10:14 AM',
        location: 'Lagos Hub',
      },
    ],
    whatsappTrackingUrl: 'https://wa.me/2348023456789',
  },
  {
    id: 'ord-102',
    orderNumber: 'TP-924181',
    createdAt: '2026-11-14T11:02:00Z',
    status: 'packed',
    items: [
      {
        id: 'ci-3',
        productId: 'prod-006',
        productTitle:
          'Teepha Signature High "Obsidian & Chalk" Limited Sneaker',
        productSlug: 'retro-og-monochrome-sneakers',
        price: 98000,
        quantity: 1,
        unit: 'pair',
        selectedSize: 'EU 43',
        selectedColor: 'Obsidian / Chalk White',
        image:
          'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=400&q=80',
        lineTotal: 98000,
      },
    ],
    subtotal: 98000,
    deliveryFee: 3500,
    discount: 0,
    total: 101500,
    customerDetails: {
      phone: '+2348176543210',
      name: 'Chinedu Okonkwo',
      email: 'chinedu.o@fintech.co',
    },
    deliveryDetails: {
      address: '22 Bisola Durosinmi Etti Drive, Lekki Phase 1',
      state: 'Lagos',
      lga: 'Eti-Osa',
      speed: 'lagos_same_day',
    },
    paymentMethod: 'card',
    paymentStatus: 'paid',
    trackingTimeline: [
      {
        status: 'packed',
        title: 'Inspected & Sealed with Authenticity Hologram',
        description: 'Sneaker verified authentic by Teepha Quality Lead.',
        timestamp: '11:45 AM',
        location: 'Lagos Vault',
      },
    ],
    whatsappTrackingUrl: 'https://wa.me/2348176543210',
  },
  {
    id: 'ord-103',
    orderNumber: 'ATL-924182',
    createdAt: '2026-11-14T09:30:00Z',
    status: 'shipped',
    items: [
      {
        id: 'ci-4',
        productId: 'prod-001',
        productTitle: 'Emerald & Gold Swiss Voile Imperial Lace',
        productSlug: 'emerald-gold-swiss-voile-lace',
        price: 85000,
        quantity: 10,
        unit: 'yard',
        selectedColor: 'Imperial Emerald',
        image:
          'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80',
        lineTotal: 850000,
      },
    ],
    subtotal: 850000,
    deliveryFee: 15000,
    discount: 50000,
    total: 815000,
    customerDetails: {
      phone: '+2348039876543',
      name: 'Chief Folake Alakija',
      email: 'f.alakija@lagosholding.com',
    },
    deliveryDetails: {
      address: 'Penthouse 4, Eko Atlantic Tower, Victoria Island',
      state: 'Lagos',
      lga: 'Eti-Osa',
      landmark: 'Near Financial Centre',
      speed: 'lagos_same_day',
    },
    paymentMethod: 'bank_transfer',
    paymentStatus: 'paid',
    trackingTimeline: [
      {
        status: 'shipped',
        title: 'Dispatched with VIP Armored Courier',
        description: 'In transit with Rider Sunday Adebayo (Van VIP).',
        timestamp: '12:15 PM',
        location: 'Victoria Island Zone',
      },
    ],
    whatsappTrackingUrl: 'https://wa.me/2348039876543',
  },
  {
    id: 'ord-104',
    orderNumber: 'ATL-924183',
    createdAt: '2026-11-14T08:15:00Z',
    status: 'pending',
    items: [
      {
        id: 'ci-5',
        productId: 'prod-003',
        productTitle: 'Pure White Super 180s Loro Piana Wool',
        productSlug: 'pure-white-super-180s-wool',
        price: 55000,
        quantity: 5,
        unit: 'yard',
        selectedColor: 'Chalk White',
        image:
          'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=400&q=80',
        lineTotal: 275000,
      },
    ],
    subtotal: 275000,
    deliveryFee: 8000,
    discount: 0,
    total: 283000,
    customerDetails: {
      phone: '+2348091122334',
      name: 'Dr. Amina Bello',
      email: 'amina.bello@fct.gov.ng',
    },
    deliveryDetails: {
      address: 'Villa 7, Mississippi Street, Maitama',
      state: 'Abuja FCT',
      lga: 'Abuja Municipal',
      landmark: 'Near IBB Golf Course',
      speed: 'standard_nigeria',
    },
    paymentMethod: 'bank_transfer',
    paymentStatus: 'pending',
    trackingTimeline: [
      {
        status: 'pending',
        title: 'Awaiting Manual Wire Verification',
        description: 'Customer uploaded proof of transfer from Zenith Bank.',
        timestamp: '08:15 AM',
        location: 'Abuja Air Desk',
      },
    ],
    whatsappTrackingUrl: 'https://wa.me/2348091122334',
  },
];

const SAMPLE_CUSTOMERS: User[] = [
  {
    id: 'usr-001',
    name: 'Senator Adewale Adeleke',
    phone: '+2348023456789',
    email: 'a.adeleke@lagosexec.ng',
    accountState: 'MEMBER',
    loyaltyTier: 'Atelier',
    loyaltyPoints: 14200,
    aiTokenBalance: 8,
    totalSpend: 4850000,
    ordersCount: 16,
    vipStatus: 'Sovereign',
    role: 'customer',
    createdAt: '2026-01-15',
    lastActive: 'Just now',
    addresses: [
      {
        id: 'addr-1',
        fullName: 'Senator Adewale Adeleke',
        phone: '+2348023456789',
        state: 'Lagos',
        lga: 'Eti-Osa',
        streetAddress: 'Plot 12, Osborne Foreshore Estate, Phase 2, Ikoyi',
        isDefault: true,
      },
    ],
  },
  {
    id: 'usr-002',
    name: 'Chief Folake Alakija',
    phone: '+2348039876543',
    email: 'f.alakija@lagosholding.com',
    accountState: 'MEMBER',
    loyaltyTier: 'Atelier',
    loyaltyPoints: 9800,
    aiTokenBalance: 12,
    totalSpend: 3920000,
    ordersCount: 9,
    vipStatus: 'Sovereign',
    role: 'customer',
    createdAt: '2026-02-10',
    lastActive: '12m ago',
    addresses: [
      {
        id: 'addr-2',
        fullName: 'Chief Folake Alakija',
        phone: '+2348039876543',
        state: 'Lagos',
        lga: 'Eti-Osa',
        streetAddress: 'Penthouse 4, Eko Atlantic Tower, Victoria Island',
        isDefault: true,
      },
    ],
  },
  {
    id: 'usr-003',
    name: 'Chinedu Okonkwo',
    phone: '+2348176543210',
    email: 'chinedu.o@fintech.co',
    accountState: 'MEMBER',
    loyaltyTier: 'Tailor',
    loyaltyPoints: 3400,
    aiTokenBalance: 3,
    totalSpend: 1120000,
    ordersCount: 4,
    vipStatus: 'Executive',
    role: 'customer',
    createdAt: '2026-05-20',
    lastActive: '1h ago',
    addresses: [
      {
        id: 'addr-3',
        fullName: 'Chinedu Okonkwo',
        phone: '+2348176543210',
        state: 'Lagos',
        lga: 'Eti-Osa',
        streetAddress: '22 Bisola Durosinmi Etti Drive, Lekki Phase 1',
        isDefault: true,
      },
    ],
  },
  {
    id: 'usr-004',
    name: 'Dr. Amina Bello',
    phone: '+2348091122334',
    email: 'amina.bello@fct.gov.ng',
    accountState: 'MEMBER',
    loyaltyTier: 'Tailor',
    loyaltyPoints: 4600,
    aiTokenBalance: 5,
    totalSpend: 1840000,
    ordersCount: 5,
    vipStatus: 'Executive',
    role: 'customer',
    createdAt: '2026-04-02',
    lastActive: '3h ago',
    addresses: [
      {
        id: 'addr-4',
        fullName: 'Dr. Amina Bello',
        phone: '+2348091122334',
        state: 'Abuja FCT',
        lga: 'Abuja Municipal',
        streetAddress: 'Villa 7, Mississippi Street, Maitama',
        isDefault: true,
      },
    ],
  },
  {
    id: 'usr-005',
    name: 'Tunde Bakare',
    phone: '+2348034567890',
    email: 'tundebakare@creativehub.ng',
    accountState: 'MEMBER',
    loyaltyTier: 'Stitch',
    loyaltyPoints: 1200,
    aiTokenBalance: 2,
    totalSpend: 420000,
    ordersCount: 2,
    vipStatus: 'Connoisseur',
    role: 'customer',
    createdAt: '2026-08-11',
    lastActive: 'Yesterday',
    addresses: [
      {
        id: 'addr-5',
        fullName: 'Tunde Bakare',
        phone: '+2348034567890',
        state: 'Lagos',
        lga: 'Ikeja',
        streetAddress: '14 Joel Ogunnaike Street, GRA Ikeja',
        isDefault: true,
      },
    ],
  },
  {
    id: 'usr-006',
    name: 'Guest Patron (Lekki Checkout)',
    phone: '+2348123450987',
    accountState: 'SHADOW',
    loyaltyTier: 'Thread',
    loyaltyPoints: 0,
    aiTokenBalance: 1,
    totalSpend: 168000,
    ordersCount: 1,
    vipStatus: 'Lead',
    role: 'customer',
    createdAt: '2026-11-12',
    lastActive: '2 days ago',
    addresses: [],
  },
  {
    id: 'usr-007',
    name: 'Phone Lead (Instagram Ad Click)',
    phone: '+2348056781234',
    accountState: 'LEAD',
    loyaltyTier: 'Thread',
    loyaltyPoints: 0,
    aiTokenBalance: 1,
    totalSpend: 0,
    ordersCount: 0,
    vipStatus: 'Lead',
    role: 'customer',
    createdAt: '2026-11-13',
    lastActive: 'Today',
    addresses: [],
  },
  {
    id: 'usr-008',
    name: 'Boluwatife Farinu',
    phone: '+2348010000000',
    email: 'boluwatife@teepha.com',
    accountState: 'MEMBER',
    loyaltyTier: 'Atelier',
    loyaltyPoints: 50000,
    aiTokenBalance: 100,
    totalSpend: 15400000,
    ordersCount: 32,
    vipStatus: 'Sovereign',
    role: 'admin',
    createdAt: '2025-10-01',
    lastActive: 'Active Admin Session',
    addresses: [
      {
        id: 'addr-adm',
        fullName: 'Boluwatife Farinu',
        phone: '+2348010000000',
        state: 'Lagos',
        lga: 'Eti-Osa',
        streetAddress:
          'Teepha Flowers & Fabrics Fashion Store, Shagari Estate, 16 B C St, Ipaja, Lagos 102213, Lagos',
        isDefault: true,
      },
    ],
  },
];

const SAMPLE_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-001',
    reference: 'PSK-924180-WEM',
    orderNumber: 'ATL-924180',
    customerName: 'Senator Adewale Adeleke',
    customerPhone: '+2348023456789',
    gateway: 'wema_virtual_account',
    amount: 180000,
    fee: 100,
    netSettlement: 179900,
    status: 'paid',
    createdAt: '2026-11-14T10:14:00Z',
    verifiedAt: '2026-11-14T10:14:12Z',
  },
  {
    id: 'pay-002',
    reference: 'PSK-889123-CRD',
    orderNumber: 'ATL-924181',
    customerName: 'Chinedu Okonkwo',
    customerPhone: '+2348176543210',
    gateway: 'paystack',
    amount: 101500,
    fee: 1522.5,
    netSettlement: 99977.5,
    status: 'paid',
    createdAt: '2026-11-14T11:02:00Z',
    verifiedAt: '2026-11-14T11:02:28Z',
  },
  {
    id: 'pay-003',
    reference: 'FLW-771239-USSD',
    orderNumber: 'ATL-924182',
    customerName: 'Chief Folake Alakija',
    customerPhone: '+2348039876543',
    gateway: 'wema_virtual_account',
    amount: 815000,
    fee: 100,
    netSettlement: 814900,
    status: 'paid',
    createdAt: '2026-11-14T09:30:00Z',
    verifiedAt: '2026-11-14T09:30:45Z',
  },
  {
    id: 'pay-004',
    reference: 'MNL-WIRE-9921',
    orderNumber: 'ATL-924183',
    customerName: 'Dr. Amina Bello',
    customerPhone: '+2348091122334',
    gateway: 'direct_bank_transfer',
    amount: 283000,
    fee: 0,
    netSettlement: 283000,
    status: 'pending',
    createdAt: '2026-11-14T08:15:00Z',
  },
  {
    id: 'pay-005',
    reference: 'PSK-654110-CRD',
    orderNumber: 'ATL-924177',
    customerName: 'Tunde Bakare',
    customerPhone: '+2348034567890',
    gateway: 'paystack',
    amount: 210000,
    fee: 3150,
    netSettlement: 206850,
    status: 'paid',
    createdAt: '2026-11-13T16:22:00Z',
    verifiedAt: '2026-11-13T16:22:50Z',
  },
  {
    id: 'pay-006',
    reference: 'FLW-550912-BNK',
    orderNumber: 'ATL-924176',
    customerName: 'Emeka Anyaoku',
    customerPhone: '+2348029988776',
    gateway: 'flutterwave',
    amount: 145000,
    fee: 2030,
    netSettlement: 142970,
    status: 'paid',
    createdAt: '2026-11-13T14:10:00Z',
    verifiedAt: '2026-11-13T14:11:05Z',
  },
];

const SAMPLE_COURIERS: DeliveryCourier[] = [
  {
    id: 'cour-01',
    riderName: 'Babajide "Speedy" Sanusi',
    riderPhone: '+2348021112233',
    vehicleType: 'motorcycle_express',
    status: 'available',
    activeDeliveriesCount: 1,
    assignedOrders: ['ATL-924180'],
    currentLocationZone: 'Ikoyi / Osborne Axis',
    rating: 4.96,
  },
  {
    id: 'cour-02',
    riderName: 'Emeka Obi',
    riderPhone: '+2348033334455',
    vehicleType: 'motorcycle_express',
    status: 'in_transit',
    activeDeliveriesCount: 2,
    assignedOrders: ['ATL-924181'],
    currentLocationZone: 'Lekki Phase 1 / Admiralty Way',
    rating: 4.92,
  },
  {
    id: 'cour-03',
    riderName: 'Sunday Adebayo (Executive Armored Van)',
    riderPhone: '+2348055556677',
    vehicleType: 'van_vip',
    status: 'in_transit',
    activeDeliveriesCount: 1,
    assignedOrders: ['ATL-924182'],
    currentLocationZone: 'Victoria Island / Eko Atlantic',
    rating: 5.0,
  },
  {
    id: 'cour-04',
    riderName: 'Malam Ibrahim Danjuma',
    riderPhone: '+2348099998877',
    vehicleType: 'abuja_air_cargo',
    status: 'available',
    activeDeliveriesCount: 0,
    assignedOrders: [],
    currentLocationZone: 'Nnamdi Azikiwe Airport Hub / Maitama',
    rating: 4.88,
  },
];

const SAMPLE_COMMUNITY_FITS: CommunityFitSubmission[] = [
  {
    id: 'fit-001',
    patronName: 'Kolawole Durojaiye',
    patronPhone: '+2348022223344',
    outfitTitle: 'Midnight Double-Breasted Executive Senator',
    fabricUsed: 'Midnight Obsidian Italian Cashmere 160s',
    city: 'Ikoyi, Lagos',
    photoUrl:
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
    railTarget: 'executive_senator',
    status: 'approved',
    submittedAt: '2026-11-13T14:20:00Z',
  },
  {
    id: 'fit-002',
    patronName: 'Aisha Danladi',
    patronPhone: '+2348098887766',
    outfitTitle: 'Imperial Emerald Aso-Ebi Gown with Gold Piping',
    fabricUsed: 'Emerald & Gold Swiss Voile Imperial Lace',
    city: 'Maitama, Abuja',
    photoUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    railTarget: 'asoebi_bellanaija',
    status: 'pending',
    submittedAt: '2026-11-14T09:10:00Z',
  },
  {
    id: 'fit-003',
    patronName: 'Babatunde Adeleke',
    patronPhone: '+2348037776655',
    outfitTitle: 'Monochrome High Teepha Signature Streetwear Styling',
    fabricUsed: 'Teepha Signature High "Obsidian & Chalk" Sneaker',
    city: 'Victoria Island, Lagos',
    photoUrl:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
    railTarget: 'streetwear_grail',
    status: 'pending',
    submittedAt: '2026-11-14T10:45:00Z',
  },
];

const SAMPLE_TRACKED_LINKS: TrackedLink[] = [
  {
    id: 'tl-1',
    code: 'FB-SENATOR-Q4',
    targetProductSlug: 'midnight-italian-cashmere-senator',
    productTitle: 'Midnight Obsidian Italian Cashmere 160s Wool',
    utmSource: 'facebook_ads',
    utmCampaign: 'lagos_executive_senator_drop',
    affiliateCode: 'AFF-SEUN',
    shortUrl: 'https://teepha.com/g/FB-SENATOR-Q4',
    clicks: 1420,
    leadsCaptured: 198,
    ordersCompleted: 43,
    revenueGenerated: 7224000,
    createdAt: '2026-11-01',
  },
  {
    id: 'tl-2',
    code: 'IG-SWISS-LACE',
    targetProductSlug: 'emerald-gold-swiss-voile-lace',
    productTitle: 'Emerald & Gold Swiss Voile Imperial Lace',
    utmSource: 'instagram_story',
    utmCampaign: 'asoebi_bellanaija_collab',
    shortUrl: 'https://teepha.com/g/IG-SWISS-LACE',
    clicks: 2890,
    leadsCaptured: 342,
    ordersCompleted: 68,
    revenueGenerated: 5780000,
    createdAt: '2026-11-05',
  },
  {
    id: 'tl-3',
    code: 'TK-SNEAKER-01',
    targetProductSlug: 'retro-og-monochrome-sneakers',
    productTitle: 'Teepha Signature High Sneaker',
    utmSource: 'tiktok',
    utmCampaign: 'lagos_streetwear_unboxing',
    shortUrl: 'https://teepha.com/g/TK-SNEAKER-01',
    clicks: 4120,
    leadsCaptured: 512,
    ordersCompleted: 54,
    revenueGenerated: 5292000,
    createdAt: '2026-11-08',
  },
];

const SAMPLE_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-01',
    customerPhone: '+2348039876543',
    customerName: 'Chief Folake Alakija',
    channel: 'whatsapp',
    status: 'pending_admin',
    subject: 'Aso-Ebi Bulk Order for 15 guests - Emerald Swiss Voile',
    messages: [
      {
        id: 'msg-1',
        sender: 'customer',
        content:
          'Good day Teepha Flowers & Fabrics team, I need 60 yards of the Emerald Swiss Voile Lace for my upcoming wedding in Victoria Island. Can I get a bridal party discount?',
        timestamp: '11:30 AM',
      },
    ],
    aiSuggestedReply: {
      suggestedText:
        'Hello Chief Folake, congratulations on your upcoming wedding! Yes, for 60 yards (15 sets of 4 yards), our Bridal Concierge offers an exclusive 12% group tiered discount plus complimentary custom embroidery gift boxes for each guest. Would you like me to reserve the uncut bolt and issue a formal invoice?',
      confidence: 0.94,
      intent: 'bulk_order_bridal_discount',
      citedOrderNumber: 'PROD-001',
    },
    updatedAt: '11:32 AM',
  },
  {
    id: 'tkt-02',
    customerPhone: '+2348123456780',
    customerName: 'Chinedu Okonkwo',
    channel: 'web_chat',
    status: 'open',
    subject: 'Delivery Timeline to Lekki Phase 1',
    messages: [
      {
        id: 'msg-2',
        sender: 'customer',
        content:
          'Hi, if I place an order for the Onyx Gold Cufflinks right now, will it arrive before 5pm today?',
        timestamp: '12:05 PM',
      },
    ],
    aiSuggestedReply: {
      suggestedText:
        'Hello Chinedu, yes absolutely! All orders placed before 1:00 PM selecting Lagos Same-Day Dispatch are handed to our direct dispatch riders and delivered to Lekki Phase 1 between 3:30 PM - 5:00 PM today.',
      confidence: 0.98,
      intent: 'shipping_inquiry_same_day',
    },
    updatedAt: '12:06 PM',
  },
];

@Injectable({
  providedIn: 'root',
})
export class AdminStore {
  // Query Filters for Dashboard Intelligence
  readonly selectedTimeframe = signal<TimeframeOption>('30d');
  readonly selectedChannel = signal<string>('all');
  readonly selectedCategory = signal<string>('all');
  readonly selectedRegion = signal<string>('all');

  // Core Data Signals
  readonly orders = signal<Order[]>(SAMPLE_ORDERS);
  readonly customers = signal<User[]>(SAMPLE_CUSTOMERS);
  readonly payments = signal<PaymentRecord[]>(SAMPLE_PAYMENTS);
  readonly couriers = signal<DeliveryCourier[]>(SAMPLE_COURIERS);
  readonly communityFits = signal<CommunityFitSubmission[]>(
    SAMPLE_COMMUNITY_FITS,
  );
  readonly trackedLinks = signal<TrackedLink[]>(SAMPLE_TRACKED_LINKS);
  readonly tickets = signal<SupportTicket[]>(SAMPLE_TICKETS);
  readonly isGeneratingModelShot = signal<boolean>(false);

  // Dynamic Metrics computed reactively based on query filters
  readonly metrics = computed<AdminDashboardMetrics>(() => {
    const timeframe = this.selectedTimeframe();
    const multiplier =
      timeframe === '24h'
        ? 0.08
        : timeframe === '7d'
          ? 0.32
          : timeframe === 'quarter'
            ? 2.85
            : timeframe === 'ytd'
              ? 4.6
              : 1.0;

    const baseGmv = 48950000;
    const baseOrders = 412;
    const computedGmv = Math.round(baseGmv * multiplier);
    const computedOrders = Math.round(baseOrders * multiplier);
    const aov =
      computedOrders > 0 ? Math.round(computedGmv / computedOrders) : 118800;

    return {
      totalGmv: computedGmv,
      gmvGrowth: +(28.4 * (timeframe === '24h' ? 0.7 : 1)).toFixed(1),
      totalOrders: computedOrders,
      ordersGrowth: +(19.2 * (timeframe === '24h' ? 0.8 : 1)).toFixed(1),
      averageOrderValue: aov,
      conversionRate: +(3.82 + (timeframe === '7d' ? 0.4 : 0)).toFixed(2),
      liveVisitors: 64,
      leadsFunnel: {
        totalLeads: Math.round(1840 * multiplier),
        shadowAccounts: Math.round(620 * multiplier),
        convertedMembers: Math.round(412 * multiplier),
      },
      channelRevenue: [
        {
          channel: 'Facebook / Meta Ads',
          revenue: Math.round(21500000 * multiplier),
          percentage: 44,
        },
        {
          channel: 'Instagram Direct & Story',
          revenue: Math.round(15600000 * multiplier),
          percentage: 32,
        },
        {
          channel: 'TikTok Influencers',
          revenue: Math.round(6850000 * multiplier),
          percentage: 14,
        },
        {
          channel: 'Direct / Referral & WhatsApp',
          revenue: Math.round(5000000 * multiplier),
          percentage: 10,
        },
      ],
      recentOrders: this.orders(),
    };
  });

  constructor() {
    this.loadAdminDataFromApi();
  }

  private getApiUrl(): string {
    return getApiBaseUrl();
  }

  private getAuthHeader(): Record<string, string> {
    if (typeof window === 'undefined')
      return { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('atelier_token');
    return token
      ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      : { 'Content-Type': 'application/json' };
  }

  async loadAdminDataFromApi(): Promise<void> {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('atelier_token');
    if (!token) return;

    const headers = this.getAuthHeader();
    const apiUrl = this.getApiUrl();

    // 1. Fetch Orders from Backend
    try {
      const ordersRes = await fetch(`${apiUrl}/admin/orders`, { headers });
      if (ordersRes.ok) {
        const data = await ordersRes.json();
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          const mappedOrders: Order[] = data.items.map((o: any) => ({
            id: o.id,
            orderNumber: o.orderNumber || o.id,
            createdAt: o.createdAt,
            status: (o.status || 'pending').toLowerCase() as Order['status'],
            items: (o.items || []).map((it: any) => ({
              id: it.id,
              productId: it.productId,
              productTitle: it.product?.name || 'Luxury Item',
              productSlug: it.product?.slug || '',
              price: Number(it.unitPrice || 0),
              quantity: it.quantity,
              unit: 'yard' as const,
              selectedColor: it.color || 'Default',
              selectedSize: it.size,
              image:
                it.product?.images?.[0]?.url ||
                'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=400&q=80',
              lineTotal: Math.round(it.quantity * Number(it.unitPrice || 0)),
            })),
            subtotal: Number(o.subtotal || 0),
            deliveryFee: Number(o.deliveryFee || 0),
            discount: Number(o.discountAmount || 0),
            total: Number(o.total || 0),
            customerDetails: {
              phone: o.user?.phone || '+2348000000000',
              name: `${o.user?.firstName || 'Patron'} ${o.user?.lastName || ''}`.trim(),
              email: o.user?.email || 'patron@teepha.com',
            },
            deliveryDetails: {
              address: o.address?.street || 'Victoria Island Axis',
              state: o.address?.state || 'Lagos',
              lga: o.address?.city || 'Eti-Osa',
              speed: 'lagos_same_day' as const,
            },
            paymentMethod: 'paystack' as const,
            paymentStatus:
              o.payments?.[0]?.status === 'SUCCESS' ? 'paid' : 'pending',
            trackingTimeline: [
              {
                status: (
                  o.status || 'pending'
                ).toLowerCase() as Order['status'],
                title: `Order ${(o.status || 'PENDING').toUpperCase()}`,
                description: `Order processed via Teepha Core Switch.`,
                timestamp: new Date(o.createdAt).toLocaleTimeString('en-NG', {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
                location: 'Teepha Fashion Store, Ipaja, Lagos',
              },
            ],
            whatsappTrackingUrl: `https://wa.me/2348023456789?text=Order%20${o.orderNumber}`,
          }));
          this.orders.set(mappedOrders);
        }
      }
    } catch {
      // offline fallback
    }

    // 2. Fetch Patrons / Users
    try {
      const usersRes = await fetch(`${apiUrl}/users/admin/list?limit=50`, {
        headers,
      });
      if (usersRes.ok) {
        const data = await usersRes.json();
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          const mappedUsers: User[] = data.items.map((u: any) => ({
            id: u.id,
            name:
              `${u.firstName || ''} ${u.lastName || ''}`.trim() ||
              'Patron ' + u.phone.slice(-4),
            phone: u.phone,
            email: u.email || 'patron@teepha.com',
            accountState: u.isGuest ? 'SHADOW' : 'MEMBER',
            loyaltyTier:
              u.loyaltyTier === 'BLACK'
                ? 'Atelier'
                : u.loyaltyTier === 'GOLD'
                  ? 'Tailor'
                  : 'Stitch',
            loyaltyPoints: u.loyaltyPoints || 0,
            aiTokenBalance: u.imageGenTokens || 3,
            totalSpend: 0,
            ordersCount: u.orders?.length || 0,
            vipStatus: u.role === 'ADMIN' ? 'Sovereign' : 'Connoisseur',
            role: (u.role || 'customer').toLowerCase() as User['role'],
            createdAt: u.createdAt ? u.createdAt.split('T')[0] : '2026-01-01',
            lastActive: 'Active',
            addresses: [],
          }));
          this.customers.set(mappedUsers);
        }
      }
    } catch {
      // offline fallback
    }

    // 3. Fetch Support Tickets
    try {
      const ticketsRes = await fetch(`${apiUrl}/support/admin/tickets`, {
        headers,
      });
      if (ticketsRes.ok) {
        const data = await ticketsRes.json();
        if (data && Array.isArray(data) && data.length > 0) {
          const mappedTickets: SupportTicket[] = data.map((t: any) => ({
            id: t.id,
            customerPhone: t.user?.phone || '+2348000000000',
            customerName:
              `${t.user?.firstName || 'Patron'} ${t.user?.lastName || ''}`.trim(),
            channel: 'web_chat' as const,
            status: t.status === 'RESOLVED' ? 'resolved' : 'open',
            subject: t.subject || 'VIP Concierge Inquiry',
            messages: (t.messages || []).map((m: any) => ({
              id: m.id,
              sender: m.isStaff ? 'admin' : 'customer',
              content: m.content,
              timestamp: new Date(m.createdAt).toLocaleTimeString('en-NG', {
                hour: '2-digit',
                minute: '2-digit',
              }),
            })),
            updatedAt: new Date(t.updatedAt).toLocaleTimeString('en-NG', {
              hour: '2-digit',
              minute: '2-digit',
            }),
          }));
          this.tickets.set(mappedTickets);
        }
      }
    } catch {
      // offline fallback
    }
  }

  // Query Setters
  setTimeframe(tf: TimeframeOption): void {
    this.selectedTimeframe.set(tf);
  }

  setChannel(ch: string): void {
    this.selectedChannel.set(ch);
  }

  setCategory(cat: string): void {
    this.selectedCategory.set(cat);
  }

  setRegion(reg: string): void {
    this.selectedRegion.set(reg);
  }

  // Order Mutations
  updateOrderStatus(orderId: string, status: Order['status']): void {
    this.orders.update((list) =>
      list.map((o) => (o.id === orderId ? { ...o, status } : o)),
    );

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('atelier_token');
      if (token) {
        const statusMap: Record<string, string> = {
          pending: 'PENDING',
          confirmed: 'CONFIRMED',
          packed: 'PACKED',
          shipped: 'SHIPPED',
          delivered: 'DELIVERED',
          cancelled: 'CANCELLED',
        };
        fetch(`${this.getApiUrl()}/admin/orders/${orderId}/status`, {
          method: 'PATCH',
          headers: this.getAuthHeader(),
          body: JSON.stringify({ status: statusMap[status] || 'CONFIRMED' }),
        }).catch(() => {});
      }
    }
  }

  // Customer / Patron Mutations
  updateCustomerLoyalty(
    userId: string,
    pointsDelta: number,
    tokensDelta: number,
  ): void {
    this.customers.update((list) =>
      list.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            loyaltyPoints: Math.max(0, u.loyaltyPoints + pointsDelta),
            aiTokenBalance: Math.max(0, u.aiTokenBalance + tokensDelta),
          };
        }
        return u;
      }),
    );
  }

  updateCustomerTier(
    userId: string,
    tier: LoyaltyTier,
    vipStatus?: User['vipStatus'],
  ): void {
    this.customers.update((list) =>
      list.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            loyaltyTier: tier,
            vipStatus: vipStatus || u.vipStatus,
          };
        }
        return u;
      }),
    );
  }

  convertShadowAccount(userId: string, name: string, email: string): void {
    this.customers.update((list) =>
      list.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            name,
            email,
            accountState: 'MEMBER',
            vipStatus: 'Connoisseur',
            loyaltyTier: 'Stitch',
            aiTokenBalance: u.aiTokenBalance + 2,
          };
        }
        return u;
      }),
    );
  }

  addCustomer(user: User): void {
    this.customers.update((list) => [user, ...list]);
  }

  // Payment Verification & Ledger Mutations
  verifyBankTransfer(paymentId: string): void {
    const nowIso = new Date().toISOString();
    this.payments.update((list) =>
      list.map((p) => {
        if (p.id === paymentId) {
          return {
            ...p,
            status: 'paid',
            verifiedAt: nowIso,
          };
        }
        return p;
      }),
    );

    // Also update matching order status if any
    const payment = this.payments().find((p) => p.id === paymentId);
    if (payment) {
      this.orders.update((list) =>
        list.map((o) => {
          if (o.orderNumber === payment.orderNumber) {
            return {
              ...o,
              paymentStatus: 'paid',
              status: 'confirmed',
              trackingTimeline: [
                ...o.trackingTimeline,
                {
                  status: 'confirmed',
                  title: 'Wire Transfer Verified',
                  description: 'Manual wire verified by Head of Treasury.',
                  timestamp: new Date().toLocaleTimeString('en-NG', {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                  location: 'Vault Treasury',
                },
              ],
            };
          }
          return o;
        }),
      );
    }
  }

  refundPayment(paymentId: string): void {
    this.payments.update((list) =>
      list.map((p) => (p.id === paymentId ? { ...p, status: 'refunded' } : p)),
    );
  }

  // Courier & Fleet Logistics Mutations
  assignCourierToOrder(orderId: string, courierId: string): void {
    const order = this.orders().find((o) => o.id === orderId);
    const courier = this.couriers().find((c) => c.id === courierId);
    if (!order || !courier) return;

    this.couriers.update((list) =>
      list.map((c) => {
        if (c.id === courierId) {
          return {
            ...c,
            status: 'in_transit',
            activeDeliveriesCount: c.activeDeliveriesCount + 1,
            assignedOrders: Array.from(
              new Set([...c.assignedOrders, order.orderNumber]),
            ),
          };
        }
        return c;
      }),
    );

    this.orders.update((list) =>
      list.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'shipped',
            trackingTimeline: [
              ...o.trackingTimeline,
              {
                status: 'shipped',
                title: `Handed to Courier: ${courier.riderName}`,
                description: `Vehicle: ${courier.vehicleType.replace('_', ' ').toUpperCase()} · Rider: ${courier.riderPhone}`,
                timestamp: new Date().toLocaleTimeString('en-NG', {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
                location: courier.currentLocationZone,
              },
            ],
          };
        }
        return o;
      }),
    );
  }

  updateCourierStatus(
    courierId: string,
    status: DeliveryCourier['status'],
    locationZone?: string,
  ): void {
    this.couriers.update((list) =>
      list.map((c) => {
        if (c.id === courierId) {
          return {
            ...c,
            status,
            currentLocationZone: locationZone || c.currentLocationZone,
          };
        }
        return c;
      }),
    );
  }

  addCourier(courier: DeliveryCourier): void {
    this.couriers.update((list) => [courier, ...list]);
  }

  // Community Fit Submissions Moderation (Story Rails)
  approveFit(id: string): void {
    this.communityFits.update((list) =>
      list.map((f) => (f.id === id ? { ...f, status: 'approved' } : f)),
    );
  }

  rejectFit(id: string): void {
    this.communityFits.update((list) =>
      list.map((f) => (f.id === id ? { ...f, status: 'rejected' } : f)),
    );
  }

  // Tracked Links
  createTrackedLink(data: {
    targetProductSlug: string;
    productTitle: string;
    utmSource: string;
    utmCampaign: string;
    affiliateCode?: string;
  }): TrackedLink {
    const code = `${data.utmSource.substring(0, 2).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const newLink: TrackedLink = {
      id: 'tl-' + Date.now(),
      code,
      targetProductSlug: data.targetProductSlug,
      productTitle: data.productTitle,
      utmSource: data.utmSource,
      utmCampaign: data.utmCampaign,
      affiliateCode: data.affiliateCode,
      shortUrl: `https://teepha.com/g/${code}`,
      clicks: 0,
      leadsCaptured: 0,
      ordersCompleted: 0,
      revenueGenerated: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    this.trackedLinks.update((links) => [newLink, ...links]);
    return newLink;
  }

  generateAiModelShot(params: {
    productId: string;
    skinTone: string;
    garment: string;
    angle: string;
  }): Promise<AiModelView> {
    this.isGeneratingModelShot.set(true);

    return new Promise((resolve) => {
      setTimeout(() => {
        const newShot: AiModelView = {
          id: 'aim-' + Date.now(),
          angle: params.angle,
          garment: params.garment,
          skinTone: params.skinTone,
          imageUrl:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=80',
          createdAt: new Date().toISOString().split('T')[0],
        };
        this.isGeneratingModelShot.set(false);
        resolve(newShot);
      }, 1800);
    });
  }

  sendTicketReply(ticketId: string, replyText: string): void {
    this.tickets.update((list) =>
      list.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            status: 'resolved',
            messages: [
              ...t.messages,
              {
                id: 'msg-' + Date.now(),
                sender: 'admin',
                content: replyText,
                timestamp: new Date().toLocaleTimeString('en-NG', {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
              },
            ],
            aiSuggestedReply: undefined,
          };
        }
        return t;
      }),
    );

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('atelier_token');
      if (token) {
        fetch(`${this.getApiUrl()}/support/admin/tickets/${ticketId}/reply`, {
          method: 'POST',
          headers: this.getAuthHeader(),
          body: JSON.stringify({ content: replyText }),
        }).catch(() => {});
      }
    }
  }
}
