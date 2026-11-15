import { Injectable, signal, computed } from '@angular/core';
import {
  Product,
  FeedItem,
  ProductCategory,
  ProductReview,
  CommunityFitSubmission,
} from '@shared/models';
import { getApiBaseUrl } from './api-config';
export type { CommunityFitSubmission } from '@shared/models';

export interface CollectionMeta {
  slug: string;
  title: string;
  subtitle: string;
  heroImage: string;
  category: ProductCategory | 'all';
  searchQuery?: string;
  tag?: string;
  curatorNotes: string;
}

export const TEEPHA_COLLECTIONS: CollectionMeta[] = [
  {
    slug: 'luxury-flowers',
    title: 'Bridal & Luxury Floral Arrangements',
    subtitle: 'Signature Fresh Bridal Bouquets & Ceremonial Installations',
    heroImage:
      'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1200&q=80',
    category: 'all',
    tag: 'flowers',
    curatorNotes:
      'Artisan floral designs, cascading orchids, and preserved royal blooms curated for landmark weddings and prestige celebrations.',
  },
  {
    slug: 'senator-wools',
    title: 'The Executive Senator Edit',
    subtitle: 'Super 160s Italian Cashmere & Tropical Gabardine',
    heroImage:
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1200&q=80',
    category: 'fabrics',
    tag: 'senator',
    curatorNotes:
      'Tailored for Victoria Island boardrooms and high-stakes diplomatic engagements. Crisp drape, wrinkle-resistant finish, optimized for humid heat.',
  },
  {
    slug: 'swiss-lace',
    title: 'Imperial Swiss Voile & Organza Lace',
    subtitle: 'St. Gallen Master Weaves with 24K Gold & Metallic Filigree',
    heroImage:
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=80',
    category: 'fabrics',
    tag: 'lace',
    curatorNotes:
      'Heirloom caliber textiles crafted for Lagos high society weddings, chieftaincies, and milestone anniversary celebrations.',
  },
  {
    slug: 'heritage-aso-oke',
    title: 'Heritage Hand-Woven Aso-Oke',
    subtitle: 'Traditional Strip-Loom Weaves from Master Artisans in Iseyin',
    heroImage:
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    category: 'fabrics',
    tag: 'asoebi',
    curatorNotes:
      'Pure hand-spun wild silk and fine cotton woven on traditional wood looms. Heavy structural drape with century-old motifs.',
  },
  {
    slug: 'cufflinks-horology',
    title: 'Sovereign Cufflinks & Horology',
    subtitle: 'Onyx, Titanium, 18K Gold Inlays & Automatic Timepieces',
    heroImage:
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=80',
    category: 'accessories',
    tag: 'accessories',
    curatorNotes:
      'Micro-engineered hardware built specifically to anchor heavy Senator cuffs and Agbada sleeves.',
  },
  {
    slug: 'verified-sneakers',
    title: 'Verified Luxury Streetwear & Sneakers',
    subtitle: 'Hand-numbered Limited Editions & Italian Calfskin Lows',
    heroImage:
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1200&q=80',
    category: 'sneakers',
    tag: 'sneakers',
    curatorNotes:
      '100% verified authenticity guarantee. Sourced directly from European boutique stockists.',
  },
  {
    slug: 'artisan-adire',
    title: 'Botanical Adire Eleko & Silk Satin',
    subtitle: 'Resist-Dyed Indigo Textiles from Master Guilds',
    heroImage:
      'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=1200&q=80',
    category: 'fabrics',
    tag: 'adire',
    curatorNotes:
      'Authentic botanical Indigo and cassava-paste resist motifs on pure fluid silk satin.',
  },
];

export const ATELIER_COLLECTIONS = TEEPHA_COLLECTIONS;

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    slug: 'emerald-gold-swiss-voile-lace',
    title: 'Emerald & Gold Swiss Voile Imperial Lace',
    brand: 'Teepha Heritage',
    category: 'fabrics',
    description:
      'Authentic St. Gallen grade Swiss voile lace infused with metallic 24K gold threading. Hand-cut scalloped borders tailored for royalty and high-society Nigerian celebrations.',
    price: 85000,
    compareAtPrice: 110000,
    currency: 'NGN',
    unit: 'yard',
    yardStep: 0.5,
    minOrderQty: 4,
    rating: 4.9,
    reviewCount: 42,
    stockStatus: 'in_stock',
    stockQty: 18,
    featuredImage:
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    ],
    colors: [
      { name: 'Emerald & Gold', hex: '#064E3B' },
      { name: 'Midnight Onyx', hex: '#111827' },
      { name: 'Champagne Royal', hex: '#D97706' },
    ],
    attributes: {
      gsm: 180,
      widthInches: 58,
      materialComposition: '100% Fine Swiss Cotton Voile with Gold Filigree',
      weaveType: 'Imperial Embroidered Voile',
      occasion: 'Aso-Ebi, Weddings & Coronation Events',
      careInstructions: 'Dry clean only. Gentle steam press inside out.',
    },
    aspectRatio: '4:5',
    aiModelViews: [
      {
        id: 'aim-1',
        angle: 'front',
        garment: 'Iro and Buba with Peplum',
        skinTone: 'deep_melanin',
        imageUrl:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        createdAt: '2026-10-15',
      },
      {
        id: 'aim-2',
        angle: 'drape_close_up',
        garment: 'Full Silhouette Agbada Cap',
        skinTone: 'warm_caramel',
        imageUrl:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
        createdAt: '2026-10-16',
      },
    ],
    tags: ['trending_lagos', 'wedding', 'luxury', 'asoebi', 'lace'],
    reviews: [
      {
        id: 'rev-01',
        authorName: 'Chief Adewale Adeleke',
        rating: 5,
        date: '3 days ago',
        comment:
          'The gold threading does not fray when cut by my master tailor. We made a complete 5-piece Agbada for my daughter’s wedding in Ikoyi. Exquisite weight.',
        verifiedBuyer: true,
        city: 'Ikoyi, Lagos',
        fitFeedback: 'Heavy luxury drape',
      },
      {
        id: 'rev-02',
        authorName: 'Hajiya Fatima Bello',
        rating: 5,
        date: '2 weeks ago',
        comment:
          'Delivered to Maitama Abuja within 24 hours. The scallop detailing along both borders saved my tailor hours of manual edging.',
        verifiedBuyer: true,
        city: 'Maitama, Abuja',
        fitFeedback: 'Flawless scallop border',
      },
    ],
  },
  {
    id: 'prod-002',
    slug: 'midnight-italian-cashmere-senator',
    title: 'Midnight Obsidian Italian Cashmere 160s Wool',
    brand: 'Lanificio Biella',
    category: 'fabrics',
    description:
      'Ultra-luxurious super 160s Italian Cashmere wool. Incredible drape, breathable weave engineered specifically for tropical West African climate, non-creasing finish.',
    price: 42000,
    compareAtPrice: 55000,
    currency: 'NGN',
    unit: 'yard',
    yardStep: 0.5,
    minOrderQty: 4,
    rating: 5.0,
    reviewCount: 89,
    stockStatus: 'in_stock',
    stockQty: 34,
    featuredImage:
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
    ],
    colors: [
      { name: 'Obsidian Black', hex: '#0A0A0A' },
      { name: 'Charcoal Slate', hex: '#374151' },
      { name: 'Navy Commander', hex: '#1E3A8A' },
    ],
    attributes: {
      gsm: 260,
      widthInches: 60,
      materialComposition: '95% Super 160s Merino Wool, 5% Pure Cashmere',
      weaveType: 'Double-Faced Gabardine',
      occasion: 'Executive Senator Wear, Diplomatic Meetings, Weddings',
      careInstructions: 'Specialist dry clean. Press with damp cloth.',
    },
    aspectRatio: '3:4',
    aiModelViews: [
      {
        id: 'aim-3',
        angle: 'front',
        garment: 'Slim Fit Senator with Hidden Placket',
        skinTone: 'deep_melanin',
        imageUrl:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
        createdAt: '2026-11-01',
      },
    ],
    tags: ['trending_lagos', 'senator', 'luxury', 'executive'],
    reviews: [
      {
        id: 'rev-03',
        authorName: 'Engr. Femi Babalola',
        rating: 5,
        date: '5 days ago',
        comment:
          'This is the gold standard for executive Senator outfits. Doesn’t crease even after a 6-hour flight from London to Lagos. Truly breathable.',
        verifiedBuyer: true,
        city: 'Victoria Island, Lagos',
        fitFeedback: 'Perfect 4-yard cut',
      },
    ],
  },
  {
    id: 'prod-003',
    slug: 'handwoven-monochrome-aso-oke-set',
    title: 'Heritage Hand-Woven Monochrome Aso-Oke Complete Set',
    brand: 'Iseyin Master Weavers',
    category: 'fabrics',
    description:
      'Masterfully hand-loomed in Oyo State with fine cotton and silk filament. Heavy structure with heirloom longevity, includes Agbada, Buba, Sokoto strips, and Fila.',
    price: 135000,
    compareAtPrice: 160000,
    currency: 'NGN',
    unit: 'piece',
    rating: 4.95,
    reviewCount: 31,
    stockStatus: 'low_stock',
    stockQty: 4,
    featuredImage:
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=800&q=80',
    ],
    colors: [
      { name: 'Monochrome Silver/Black', hex: '#1F2937' },
      { name: 'Alari Crimson/Gold', hex: '#7F1D1D' },
    ],
    attributes: {
      materialComposition: '100% Hand-Spun Wild Silk & Egyptian Cotton',
      weaveType: 'Traditional Strip Loom Weave',
      occasion: 'Groom Wear, Chieftaincy, Milestone Anniversaries',
    },
    aspectRatio: '4:5',
    tags: ['asoebi', 'heritage', 'luxury', 'handwoven'],
    reviews: [
      {
        id: 'rev-04',
        authorName: 'Kolawole Sanusi',
        rating: 5,
        date: '1 week ago',
        comment:
          'The weave density is unmatched. You can feel the weight of real silk in the fila and agbada panels. Authentic Nigerian luxury.',
        verifiedBuyer: true,
        city: 'Ibadan, Oyo',
      },
    ],
  },
  {
    id: 'prod-004',
    slug: 'sovereign-onyx-gold-cufflinks',
    title: 'Sovereign Onyx & 18K Gold Precision Cufflinks',
    brand: 'Teepha Objets',
    category: 'accessories',
    description:
      'Natural faceted black onyx set within hand-finished surgical-grade 316L stainless steel with heavy 18K yellow gold ion plating. Engineered for Senator and double-cuff shirts.',
    price: 32000,
    compareAtPrice: 42000,
    currency: 'NGN',
    unit: 'pair',
    rating: 4.88,
    reviewCount: 56,
    stockStatus: 'in_stock',
    stockQty: 45,
    featuredImage:
      'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1622434641406-a158123450f9?auto=format&fit=crop&w=800&q=80',
    ],
    colors: [
      { name: 'Onyx & Gold', hex: '#D97706' },
      { name: 'Onyx & Silver', hex: '#9CA3AF' },
    ],
    aspectRatio: '16:9',
    tags: ['accessories', 'cufflinks', 'executive', 'complete_the_look'],
    reviews: [
      {
        id: 'rev-05',
        authorName: 'Dr. Chuka Obi',
        rating: 5,
        date: '4 days ago',
        comment:
          'Very solid hinge. It sits flush against heavy 160s cashmere cuffs without drooping. Pure class.',
        verifiedBuyer: true,
        city: 'Enugu',
      },
    ],
  },
  {
    id: 'prod-005',
    slug: 'chronograph-monochrome-timepiece',
    title: 'Lagos Automatique 41mm Monochrome Chronograph',
    brand: 'Teepha Horology',
    category: 'accessories',
    description:
      'Black PVD treated case, sapphire crystal glass with anti-reflective coating, mechanical automatic movement with 42-hour power reserve. Water resistant to 100 meters.',
    price: 195000,
    compareAtPrice: 240000,
    currency: 'NGN',
    unit: 'piece',
    rating: 4.97,
    reviewCount: 28,
    stockStatus: 'in_stock',
    stockQty: 8,
    featuredImage:
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
    ],
    colors: [
      { name: 'Stealth Black', hex: '#111827' },
      { name: 'Brushed Titanium', hex: '#6B7280' },
    ],
    aspectRatio: '4:3',
    tags: ['accessories', 'watch', 'luxury', 'executive'],
    reviews: [
      {
        id: 'rev-06',
        authorName: 'Tunde Oladipo',
        rating: 5,
        date: '2 weeks ago',
        comment:
          'The exhibition case back and silent rotor are mesmerizing. Matches all my obsidian Senator fits.',
        verifiedBuyer: true,
        city: 'Lekki Phase 1, Lagos',
      },
    ],
  },
  {
    id: 'prod-006',
    slug: 'retro-og-monochrome-sneakers',
    title: 'Teepha Signature High "Obsidian & Chalk" Limited Sneaker',
    brand: 'Teepha Footwear',
    category: 'sneakers',
    description:
      'Full-grain Italian calfskin upper, waxed cotton laces, custom sculpted monochrome rubber cupsole. Hand-numbered edition of 250 pairs. 100% Verified Authenticity Guarantee.',
    price: 98000,
    compareAtPrice: 125000,
    currency: 'NGN',
    unit: 'pair',
    rating: 4.92,
    reviewCount: 74,
    stockStatus: 'in_stock',
    stockQty: 12,
    featuredImage:
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=800&q=80',
    ],
    colors: [
      { name: 'Obsidian / Chalk White', hex: '#0A0A0A' },
      { name: 'Triple Black Stealth', hex: '#18181B' },
    ],
    sizes: ['EU 40', 'EU 41', 'EU 42', 'EU 43', 'EU 44', 'EU 45', 'EU 46'],
    aspectRatio: '16:9',
    tags: ['sneakers', 'drop_exclusive', 'trending_lagos', 'streetwear'],
    isExclusiveDrop: true,
    dropCountdownSeconds: 84600,
    reviews: [
      {
        id: 'rev-07',
        authorName: 'David Adeleke Jr.',
        rating: 5,
        date: '6 days ago',
        comment:
          'Buttery leather quality. Better leather than major sportswear collabs. Fits true to size.',
        verifiedBuyer: true,
        city: 'Victoria Island, Lagos',
        fitFeedback: 'True to Size',
      },
    ],
  },
  {
    id: 'prod-007',
    slug: 'pure-white-giza-cotton-voile',
    title: '150s Pure White Egyptian Giza Cotton Senator Voile',
    brand: 'Nile Prestige',
    category: 'fabrics',
    description:
      'Crisp, featherweight yet dense weave from long-staple Giza cotton. Highly resistant to yellowing, cool to the skin in humid heat, the definitive white fabric for Lagos bespoke tailoring.',
    price: 48000,
    compareAtPrice: 60000,
    currency: 'NGN',
    unit: 'yard',
    yardStep: 0.5,
    minOrderQty: 4,
    rating: 4.96,
    reviewCount: 63,
    stockStatus: 'in_stock',
    stockQty: 25,
    featuredImage:
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    ],
    colors: [
      { name: 'Optic Snow White', hex: '#FFFFFF' },
      { name: 'Ivory Cream', hex: '#FDFBF7' },
    ],
    attributes: {
      gsm: 140,
      widthInches: 58,
      materialComposition: '100% Extra Long Staple Egyptian Giza Cotton',
      weaveType: 'Fine Compact Poplin',
      occasion: 'Friday Jummah Senator, White Weddings, Church Thanksgiving',
    },
    aspectRatio: '3:4',
    tags: ['trending_lagos', 'senator', 'white_fabric', 'bestseller'],
    reviews: [
      {
        id: 'rev-08',
        authorName: 'Alhaji Mansur Danbatta',
        rating: 5,
        date: '3 weeks ago',
        comment:
          'Pure elegance. The white is blindingly crisp and holds starch cleanly without turning yellowish.',
        verifiedBuyer: true,
        city: 'Kano',
      },
    ],
  },
  {
    id: 'prod-008',
    slug: 'sunset-ochre-hand-dyed-adire-silk',
    title: 'Indigo & Sunset Ochre Hand-Dyed Adire Silk Satin',
    brand: 'Abeokuta Heritage Guild',
    category: 'fabrics',
    description:
      'Resist-dyed silk satin made with authentic natural indigo and botanical bark pigments. Fluid drape with luminous sheen that turns heads at any gathering.',
    price: 52000,
    compareAtPrice: 68000,
    currency: 'NGN',
    unit: 'yard',
    yardStep: 0.5,
    minOrderQty: 3,
    rating: 4.89,
    reviewCount: 22,
    stockStatus: 'in_stock',
    stockQty: 14,
    featuredImage:
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    ],
    colors: [
      { name: 'Indigo & Ochre', hex: '#1E3A8A' },
      { name: 'Smoky Amethyst', hex: '#4C1D95' },
    ],
    attributes: {
      materialComposition: '100% Silk Satin',
      weaveType: 'Hand Resist Batik / Adire Eleko',
      occasion: 'Contemporary Kaftans, Resort Wear, Evening Gowns',
    },
    aspectRatio: '4:5',
    tags: ['adire', 'silk', 'artisan', 'trending_lagos'],
    reviews: [
      {
        id: 'rev-09',
        authorName: 'Yewande Coker',
        rating: 5,
        date: '1 month ago',
        comment:
          'The pattern is mesmerizing in natural sunlight. Hand-wash instructions were very helpful.',
        verifiedBuyer: true,
        city: 'Surulere, Lagos',
      },
    ],
  },
  {
    id: 'prod-009',
    slug: 'monochrome-runner-low-sneaker',
    title: 'Teepha Retro Minimalist Low Runner in Obsidian Nubuck',
    brand: 'Teepha Footwear',
    category: 'sneakers',
    description:
      'Ultra-plush nubuck suede coupled with perforated calf leather inner lining and ergonomic memory-foam insole. Designed for both casual Senator pairings and travel.',
    price: 88000,
    compareAtPrice: 110000,
    currency: 'NGN',
    unit: 'pair',
    rating: 4.94,
    reviewCount: 39,
    stockStatus: 'in_stock',
    stockQty: 16,
    featuredImage:
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80',
    ],
    colors: [
      { name: 'Black Obsidian', hex: '#000000' },
      { name: 'Slate Grey', hex: '#64748B' },
    ],
    sizes: ['EU 41', 'EU 42', 'EU 43', 'EU 44', 'EU 45'],
    aspectRatio: '4:3',
    tags: ['sneakers', 'streetwear', 'luxury'],
    reviews: [
      {
        id: 'rev-10',
        authorName: 'Seyi Makinde',
        rating: 5,
        date: '2 weeks ago',
        comment:
          'Pairs surprisingly well with modern ankle-cut Senator trousers. Immensely comfortable.',
        verifiedBuyer: true,
        city: 'Ikeja GRA, Lagos',
      },
    ],
  },
  {
    id: 'prod-010',
    slug: 'imperial-damask-gold-brocade',
    title: 'Venetian Imperial Gold-Threaded Damask Brocade',
    brand: 'Teepha Heritage',
    category: 'fabrics',
    description:
      'Heavy architectural weight jacquard brocade with embossed floral flourishes and metallic gilt yarns. Designed for standout chieftains, coronation robes, and grand entrances.',
    price: 92000,
    compareAtPrice: 120000,
    currency: 'NGN',
    unit: 'yard',
    yardStep: 0.5,
    minOrderQty: 4,
    rating: 4.98,
    reviewCount: 19,
    stockStatus: 'low_stock',
    stockQty: 6,
    featuredImage:
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    ],
    colors: [
      { name: 'Imperial Gold & Cream', hex: '#F59E0B' },
      { name: 'Royal Platinum', hex: '#E5E7EB' },
    ],
    attributes: {
      gsm: 320,
      widthInches: 56,
      materialComposition: 'Silk Jacquard & Metallic Filaments',
      weaveType: 'Heavy Damask Brocade',
      occasion: 'Coronations, Golden Jubilee, Chieftaincy Titles',
    },
    aspectRatio: '3:4',
    tags: ['luxury', 'wedding', 'brocade', 'heritage'],
    reviews: [
      {
        id: 'rev-11',
        authorName: 'Oba Kayode Ogunsanya',
        rating: 5,
        date: '1 week ago',
        comment: 'Majestic texture. Commands immediate presence in the hall.',
        verifiedBuyer: true,
        city: 'Abeokuta',
      },
    ],
  },
  {
    id: 'prod-011',
    slug: 'titanium-skeleton-tourbillon-watch',
    title: 'Teepha Calibre IX Titanium Skeleton Automatic Watch',
    brand: 'Teepha Horology',
    category: 'accessories',
    description:
      'Ultra-lightweight grade 5 titanium case with completely open-worked skeletonized dial. Features 72-hour power reserve, ruthenium bridges, and black hand-stitched alligator strap.',
    price: 340000,
    compareAtPrice: 420000,
    currency: 'NGN',
    unit: 'piece',
    rating: 5.0,
    reviewCount: 15,
    stockStatus: 'in_stock',
    stockQty: 5,
    featuredImage:
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
    ],
    colors: [
      { name: 'Anthracite Titanium', hex: '#374151' },
      { name: 'Rose Gold Accent', hex: '#B45309' },
    ],
    aspectRatio: '1:1',
    tags: ['accessories', 'watch', 'luxury', 'collector'],
    reviews: [
      {
        id: 'rev-12',
        authorName: 'Babatunde Folawiyo',
        rating: 5,
        date: '3 weeks ago',
        comment:
          'The movement finishing rivals Swiss boutiques on Bond Street. A true masterwork.',
        verifiedBuyer: true,
        city: 'Ikoyi, Lagos',
      },
    ],
  },
  {
    id: 'prod-012',
    slug: 'heritage-leather-agbada-slippers',
    title: 'Handcrafted Monogram Mule Slippers in Polished Calfskin',
    brand: 'Teepha Objets',
    category: 'accessories',
    description:
      'Designed specifically to complete traditional Senator and Agbada attire. Hand-carved leather sole with brass nail heel, cushioned footbed, and discreet debossed Teepha seal.',
    price: 45000,
    compareAtPrice: 58000,
    currency: 'NGN',
    unit: 'pair',
    rating: 4.88,
    reviewCount: 47,
    stockStatus: 'in_stock',
    stockQty: 20,
    featuredImage:
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
    ],
    colors: [
      { name: 'Burnished Tan', hex: '#78350F' },
      { name: 'Pitch Onyx', hex: '#000000' },
    ],
    sizes: ['EU 40', 'EU 41', 'EU 42', 'EU 43', 'EU 44', 'EU 45'],
    aspectRatio: '16:9',
    tags: ['accessories', 'slippers', 'heritage', 'senator'],
    reviews: [
      {
        id: 'rev-13',
        authorName: 'Emeka Nwosu',
        rating: 5,
        date: '2 weeks ago',
        comment:
          'Slip on easily, no squeaking, leather molded to my feet after two wearings.',
        verifiedBuyer: true,
        city: 'Asokoro, Abuja',
      },
    ],
  },
];

export function mapApiProductToClientProduct(apiProd: any): Product {
  const rawImages = apiProd.images || [];
  const images =
    Array.isArray(rawImages) && rawImages.length > 0
      ? rawImages.map((img: any) =>
          typeof img === 'string' ? img : img.url || '',
        )
      : [
          'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
        ];

  const categorySlug = apiProd.category?.slug || '';
  let category: ProductCategory = 'fabrics';
  if (categorySlug.includes('sneaker') || apiProd.productType === 'SNEAKER') {
    category = 'sneakers';
  } else if (
    categorySlug.includes('accessor') ||
    apiProd.productType === 'ACCESSORY'
  ) {
    category = 'accessories';
  }

  const unit: 'yard' | 'piece' | 'pair' =
    category === 'fabrics'
      ? 'yard'
      : category === 'sneakers'
        ? 'pair'
        : 'piece';

  const reviewsList = Array.isArray(apiProd.reviews) ? apiProd.reviews : [];

  return {
    id: apiProd.id,
    slug: apiProd.slug,
    title: apiProd.name || apiProd.title,
    brand: apiProd.brand?.name || apiProd.brand || 'Teepha Flowers & Fabrics',
    category,
    description: apiProd.description || '',
    price: Number(apiProd.price || 0),
    compareAtPrice: apiProd.compareAtPrice
      ? Number(apiProd.compareAtPrice)
      : undefined,
    currency: 'NGN',
    unit,
    yardStep: 0.5,
    minOrderQty: unit === 'yard' ? 4 : 1,
    rating: reviewsList.length
      ? Number(
          (
            reviewsList.reduce(
              (acc: number, r: any) => acc + (r.rating || 5),
              0,
            ) / reviewsList.length
          ).toFixed(1),
        )
      : 4.9,
    reviewCount: apiProd._count?.reviews || reviewsList.length || 18,
    stockStatus:
      (apiProd.stockQuantity ?? 15) > 5
        ? 'in_stock'
        : (apiProd.stockQuantity ?? 0) > 0
          ? 'low_stock'
          : 'out_of_stock',
    stockQty: apiProd.stockQuantity ?? 15,
    featuredImage:
      images[0] ||
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    images,
    colors:
      Array.isArray(apiProd.colorVariants) && apiProd.colorVariants.length > 0
        ? apiProd.colorVariants
        : [
            { name: 'Imperial Gold', hex: '#D4AF37' },
            { name: 'Midnight Onyx', hex: '#111827' },
          ],
    sizes:
      Array.isArray(apiProd.sizeVariants) && apiProd.sizeVariants.length > 0
        ? apiProd.sizeVariants.map((s: any) =>
            typeof s === 'string' ? s : s.size || 'Standard',
          )
        : category === 'sneakers'
          ? ['EU 41', 'EU 42', 'EU 43', 'EU 44', 'EU 45']
          : ['4 Yards (Full Cut)', '5 Yards (Full Agbada / Set)'],
    tags: Array.isArray(apiProd.tags)
      ? apiProd.tags
      : ['luxury', 'ceremony', 'owambe'],
    aspectRatio: images.length % 2 === 0 ? '4:5' : '3:4',
    reviews: reviewsList.map((r: any) => ({
      id: r.id || `rev-${Math.random()}`,
      authorName: r.user
        ? `${r.user.firstName || ''} ${r.user.lastName || ''}`.trim()
        : 'Distinguished Patron',
      authorLocation: 'Lagos, Nigeria',
      rating: r.rating || 5,
      date: r.createdAt
        ? new Date(r.createdAt).toLocaleDateString('en-NG')
        : 'Recent',
      comment: r.comment || '',
      verifiedPurchase: true,
      fitFeedback: 'true_to_fit',
    })),
  };
}

@Injectable({
  providedIn: 'root',
})
export class ProductStore {
  readonly products = signal<Product[]>(SAMPLE_PRODUCTS);
  readonly selectedProduct = signal<Product | null>(SAMPLE_PRODUCTS[0]);
  readonly categoryFilter = signal<ProductCategory | 'all'>('all');
  readonly searchQuery = signal<string>('');
  readonly colorFilter = signal<string | null>(null);
  readonly maxPriceFilter = signal<number | null>(null);
  readonly sessionSeed = signal<number>(Date.now());

  constructor() {
    this.loadProductsFromApi();
  }

  async loadProductsFromApi(): Promise<void> {
    if (typeof window === 'undefined') return;
    const apiUrl = getApiBaseUrl();

    try {
      const res = await fetch(`${apiUrl}/products?limit=50`);
      if (res.ok) {
        const data = await res.json();
        const items = data.products || data.items || data;
        if (Array.isArray(items) && items.length > 0) {
          const mapped = items.map(mapApiProductToClientProduct);
          this.products.set(mapped);
          if (!this.selectedProduct() && mapped.length > 0) {
            this.selectedProduct.set(mapped[0]);
          }
        }
      }
    } catch {
      // Keep sample products as resilient fallback
    }
  }

  // Infinite Scroll & Paginated Batching (Default 30 items for Instagram-style infinite scroll)
  readonly visibleBatchCount = signal<number>(30);
  readonly isLoadingNextBatch = signal<boolean>(false);
  private savedScrollY = 0;

  // History Tracking (Search and Recently Viewed)
  readonly searchHistory = signal<string[]>([
    'Super 160s Cashmere',
    'Emerald Swiss Voile',
    'Sovereign Gold Cufflinks',
    'Pure White Giza Cotton',
    'Obsidian Limited Sneaker',
  ]);
  readonly recentlyViewedSlugs = signal<string[]>([
    'midnight-italian-cashmere-senator',
    'emerald-gold-swiss-voile-lace',
  ]);

  // Community Fit Submissions for Patron Rail & Admin Curation
  readonly fitSubmissions = signal<CommunityFitSubmission[]>([
    {
      id: 'fit-1',
      patronName: 'Boluwatife Farinu',
      handle: '@bolu_luxe',
      fabricTitle: 'Midnight Obsidian Super 160s Italian Cashmere',
      tailorName: 'Kenechukwu Bespoke, Ikoyi',
      city: 'Ikoyi, Lagos',
      occasion: 'Coronation Gala at Eko Atlantic',
      imageUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      status: 'approved',
      submittedAt: '2 days ago',
      productSlug: 'midnight-italian-cashmere-senator',
      rewardPointsClaimed: true,
    },
    {
      id: 'fit-2',
      patronName: 'Chief Adewale Adeleke',
      handle: '@chief_adeleke',
      fabricTitle: 'Emerald & Gold Imperial Swiss Voile Lace',
      tailorName: 'Royal Savile Guild, Abuja',
      city: 'Maitama, Abuja',
      occasion: 'Chieftaincy Installation Ceremony',
      imageUrl:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
      status: 'approved',
      submittedAt: '3 days ago',
      productSlug: 'emerald-gold-swiss-voile-lace',
      rewardPointsClaimed: true,
    },
    {
      id: 'fit-3',
      patronName: 'Dr. Folashade Alakija-Cole',
      handle: '@folashade_couture',
      fabricTitle: 'Venetian Imperial Gold-Threaded Damask Brocade',
      tailorName: 'Teepha Sovereign Guild, Lekki',
      city: 'Victoria Island, Lagos',
      occasion: '50th Jubilee Banquet',
      imageUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      status: 'pending',
      submittedAt: 'Just now',
      productSlug: 'imperial-damask-gold-brocade',
      rewardPointsClaimed: false,
    },
    {
      id: 'fit-4',
      patronName: 'Emeka Ojukwu',
      handle: '@emeka_gentleman',
      fabricTitle: 'Pure White Egyptian Giza 150s Cotton Voile',
      tailorName: 'Savile Row Savvy, Abuja',
      city: 'Asokoro, Abuja',
      occasion: 'Sunday VIP Service & High Table Lunch',
      imageUrl:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
      status: 'approved',
      submittedAt: '4 days ago',
      productSlug: 'pure-white-giza-cotton-voile',
      rewardPointsClaimed: true,
    },
  ]);

  readonly approvedFitSubmissions = computed<CommunityFitSubmission[]>(() =>
    this.fitSubmissions().filter((f) => f.status === 'approved'),
  );

  readonly pendingFitSubmissions = computed<CommunityFitSubmission[]>(() =>
    this.fitSubmissions().filter((f) => f.status === 'pending'),
  );

  // Full dynamic feed items (All computed items based on current category & search)
  readonly allFeedItems = computed<FeedItem[]>(() => {
    let list = this.products();
    const cat = this.categoryFilter();
    const q = this.searchQuery().trim().toLowerCase();
    const maxP = this.maxPriceFilter();

    if (cat !== 'all') {
      list = list.filter((p) => p.category === cat);
    }

    if (q) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    if (maxP !== null) {
      list = list.filter((p) => p.price <= maxP);
    }

    // Multiply / expand items dynamically to support endless discovery
    const items: FeedItem[] = [];

    // We generate multiple loop passes to create an infinite, varied Instagram-style catalog
    const repeatRounds = 6;
    for (let round = 0; round < repeatRounds; round++) {
      list.forEach((p, index) => {
        const globalIndex = round * list.length + index;
        const aspectRatios: ('1:1' | '4:5' | '3:4' | '16:9' | '4:3' | '2:3')[] =
          ['4:5', '3:4', '16:9', '4:3', '1:1', '4:5', '3:4', '2:3'];
        const assignedAspectRatio =
          p.aspectRatio || aspectRatios[globalIndex % aspectRatios.length];

        items.push({
          id: `feed-prod-${p.id}-r${round}`,
          type: 'product',
          title: p.title,
          subtitle: `${p.brand} · ₦${p.price.toLocaleString()} / ${p.unit}`,
          imageUrl: p.featuredImage,
          aspectRatio: assignedAspectRatio,
          product: p,
          reasonCode: index % 2 === 0 ? 'curated_for_you' : 'trending_in_lagos',
          badge: p.isExclusiveDrop
            ? 'DROP'
            : index === 0 && round === 0
              ? 'LAGOS EDIT'
              : undefined,
        });

        // Inject high-signal editorial or AI-studio teasers periodically
        if (globalIndex === 2) {
          items.push({
            id: `feed-ai-teaser-${round}`,
            type: 'ai_teaser',
            title: 'Teepha AI Studio: Live Silhouette Generation',
            subtitle:
              'Preview fabrics on custom Agbada & Senator silhouettes with 1 free preview token.',
            imageUrl:
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
            aspectRatio: '3:4',
            reasonCode: 'curated_for_you',
            badge: 'AI PREVIEW',
            actionUrl: '/studio',
          });
        }

        if (globalIndex === 6) {
          items.push({
            id: `feed-ugc-${round}`,
            type: 'ugc_look',
            title: 'Styled in Victoria Island: The Obsidian Senator',
            subtitle: 'Bespoke tailoring with 160s Italian Cashmere Wool',
            imageUrl:
              'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
            aspectRatio: '4:5',
            reasonCode: 'bought_similar_color',
            badge: 'LOOKBOOK',
          });
        }
      });
    }

    return items;
  });

  // Visible sliced feed items for infinite scroll
  readonly visibleFeedItems = computed<FeedItem[]>(() => {
    const all = this.allFeedItems();
    return all.slice(0, this.visibleBatchCount());
  });

  // Alias for mobile & components
  readonly feedItems = this.visibleFeedItems;

  readonly hasMoreFeedItems = computed<boolean>(() => {
    return this.visibleBatchCount() < this.allFeedItems().length;
  });

  readonly filteredProducts = computed<Product[]>(() => {
    let result = this.products();
    const cat = this.categoryFilter();
    const q = this.searchQuery().trim().toLowerCase();
    const maxP = this.maxPriceFilter();

    if (cat !== 'all') {
      result = result.filter((p) => p.category === cat);
    }

    if (q) {
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    if (maxP !== null) {
      result = result.filter((p) => p.price <= maxP);
    }

    return result;
  });

  readonly recentlyViewedProducts = computed<Product[]>(() => {
    const slugs = this.recentlyViewedSlugs();
    const all = this.products();
    return slugs
      .map((s) => all.find((p) => p.slug === s))
      .filter((p): p is Product => !!p);
  });

  // Infinite Scroll Batch Loading with simulated luxury latency
  async loadNextBatch(): Promise<void> {
    if (this.isLoadingNextBatch() || !this.hasMoreFeedItems()) {
      return;
    }
    this.isLoadingNextBatch.set(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    this.visibleBatchCount.update((count) => count + 15);
    this.isLoadingNextBatch.set(false);
  }

  // Scroll Restoration Management
  saveScrollPosition(y: number): void {
    this.savedScrollY = y;
  }

  getSavedScrollPosition(): number {
    return this.savedScrollY;
  }

  refreshFeed(): void {
    this.sessionSeed.set(Date.now());
    this.visibleBatchCount.set(30);
    this.savedScrollY = 0;
  }

  setCategoryFilter(cat: ProductCategory | 'all'): void {
    this.categoryFilter.set(cat);
    this.visibleBatchCount.set(30);
  }

  setSearchQuery(q: string): void {
    this.searchQuery.set(q);
    this.visibleBatchCount.set(30);
    if (q.trim() && !this.searchHistory().includes(q.trim())) {
      this.searchHistory.update((h) => [q.trim(), ...h.slice(0, 7)]);
    }
  }

  addRecentlyViewed(slug: string): void {
    this.recentlyViewedSlugs.update((list) => {
      const filtered = list.filter((s) => s !== slug);
      return [slug, ...filtered].slice(0, 8);
    });
  }

  selectProductBySlug(slug: string): Product | null {
    const found = this.products().find((p) => p.slug === slug);
    if (found) {
      this.selectedProduct.set(found);
      this.addRecentlyViewed(slug);
    }

    if (typeof window !== 'undefined') {
      const apiUrl = getApiBaseUrl();
      fetch(`${apiUrl}/products/${encodeURIComponent(slug)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((fresh) => {
          if (fresh) {
            const mapped = mapApiProductToClientProduct(fresh);
            this.updateProduct(mapped);
          }
        })
        .catch(() => {});
    }

    return found || null;
  }

  addReviewToProduct(productIdOrSlug: string, review: ProductReview): void {
    this.products.update((list) =>
      list.map((p) => {
        if (p.id === productIdOrSlug || p.slug === productIdOrSlug) {
          const currentReviews = p.reviews || [];
          const updatedReviews = [review, ...currentReviews];
          const newAvg = Number(
            (
              updatedReviews.reduce((acc, r) => acc + r.rating, 0) /
              updatedReviews.length
            ).toFixed(1),
          );
          return {
            ...p,
            reviews: updatedReviews,
            rating: newAvg,
            reviewCount: updatedReviews.length,
          };
        }
        return p;
      }),
    );

    // If currently selected, update selectedProduct as well
    const current = this.selectedProduct();
    if (
      current &&
      (current.id === productIdOrSlug || current.slug === productIdOrSlug)
    ) {
      this.selectProductBySlug(current.slug);
    }
  }

  addProduct(product: Product): void {
    this.products.update((list) => [product, ...list]);
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('atelier_token');
      if (token) {
        const apiUrl = getApiBaseUrl();
        fetch(`${apiUrl}/admin/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: product.title,
            slug: product.slug,
            description: product.description,
            price: product.price,
            compareAtPrice: product.compareAtPrice,
            productType:
              product.category === 'accessories'
                ? 'ACCESSORY'
                : product.category === 'sneakers'
                  ? 'SNEAKER'
                  : 'FABRIC',
            stockQuantity: product.stockQty,
            tags: product.tags,
            images: product.images,
            colorVariants: product.colors,
            sizeVariants: product.sizes,
          }),
        }).catch(() => {});
      }
    }
  }

  updateProduct(updated: Product): void {
    this.products.update((list) =>
      list.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)),
    );
    if (this.selectedProduct()?.id === updated.id) {
      this.selectedProduct.set(updated);
    }
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('atelier_token');
      if (token) {
        const apiUrl = getApiBaseUrl();
        fetch(`${apiUrl}/admin/products/${updated.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: updated.title,
            description: updated.description,
            price: updated.price,
            compareAtPrice: updated.compareAtPrice,
            stockQuantity: updated.stockQty,
            tags: updated.tags,
          }),
        }).catch(() => {});
      }
    }
  }

  deleteProduct(productId: string): void {
    this.products.update((list) => list.filter((p) => p.id !== productId));
    if (this.selectedProduct()?.id === productId) {
      this.selectedProduct.set(this.products()[0] || null);
    }
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('atelier_token');
      if (token) {
        const apiUrl = getApiBaseUrl();
        fetch(`${apiUrl}/admin/products/${productId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }
    }
  }

  updateProductPriceAndStock(
    productId: string,
    price: number,
    stockQty: number,
  ): void {
    this.products.update((list) =>
      list.map((p) => (p.id === productId ? { ...p, price, stockQty } : p)),
    );
  }

  submitCommunityFit(
    submission: Omit<
      CommunityFitSubmission,
      'id' | 'status' | 'submittedAt' | 'rewardPointsClaimed'
    >,
  ): void {
    const newSubmission: CommunityFitSubmission = {
      ...submission,
      id: `fit-${Date.now()}`,
      status: 'pending',
      submittedAt: 'Just now',
      rewardPointsClaimed: false,
    };
    this.fitSubmissions.update((list) => [newSubmission, ...list]);
  }

  approveFitSubmission(id: string): void {
    this.fitSubmissions.update((list) =>
      list.map((f) =>
        f.id === id
          ? { ...f, status: 'approved', rewardPointsClaimed: true }
          : f,
      ),
    );
  }

  rejectFitSubmission(id: string): void {
    this.fitSubmissions.update((list) =>
      list.map((f) => (f.id === id ? { ...f, status: 'rejected' } : f)),
    );
  }
}
