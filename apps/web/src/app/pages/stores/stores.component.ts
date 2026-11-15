import {
  Component,
  signal,
  computed,
  AfterViewInit,
  ElementRef,
  ViewChildren,
  ViewChild,
  QueryList,
  OnDestroy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartStore, ProductStore } from '@shared/data-access';

export interface FeedPostComment {
  id: string;
  user: string;
  handle: string;
  text: string;
  time: string;
  avatar: string;
  likes: number;
  isLiked?: boolean;
}

export interface FeedPost {
  id: string;
  slug: string;
  brandLine: string;
  brandHandle: string;
  avatarText: string;
  isVerified: boolean;
  location: string;
  timeAgo: string;
  title: string;
  caption: string;
  price: number;
  unit: string;
  mediaType: 'carousel' | 'video' | 'image';
  mediaItems: string[];
  videoUrl?: string;
  likesCount: number;
  isLiked: boolean;
  commentsCount: number;
  comments: FeedPostComment[];
  isBookmarked: boolean;
  sharesCount: number;
  repostsCount: number;
  tags: string[];
  fabricSpecs?: {
    material: string;
    width: string;
    occasion: string;
  };
}

export interface CollectionStory {
  id: string;
  title: string;
  subtitle: string;
  coverImage: string;
  videoPreview?: string;
  itemCount: number;
  slides: {
    type: 'image' | 'video';
    url: string;
    title: string;
    caption: string;
    price: number;
    slug: string;
  }[];
}

export interface VerticalAdSlide {
  id: string;
  badge: string;
  title: string;
  desc: string;
  stats: { label: string; val: string }[];
  bgImage: string;
  actionLabel: string;
  actionUrl: string;
  isExternal?: boolean;
}

@Component({
  selector: 'atelier-stores',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './stores.component.html',
  styleUrl: './stores.component.scss',
})
export class StoresComponent implements AfterViewInit, OnDestroy {
  readonly cartStore = inject(CartStore);
  readonly productStore = inject(ProductStore);

  @ViewChildren('postVideo') videoElements!: QueryList<
    ElementRef<HTMLVideoElement>
  >;
  @ViewChildren('collectionVideo') collectionVideos!: QueryList<
    ElementRef<HTMLVideoElement>
  >;
  @ViewChild('infiniteSentinel') infiniteSentinel?: ElementRef<HTMLDivElement>;

  private videoObserver?: IntersectionObserver;
  private sentinelObserver?: IntersectionObserver;
  private storyTimer: any = null;

  readonly isMuted = signal<boolean>(true);
  readonly visibleCount = signal<number>(30);
  readonly isLoadingMore = signal<boolean>(false);
  readonly shareToastMessage = signal<string | null>(null);

  // Per-post carousel index tracking
  readonly carouselIndexes = signal<Record<string, number>>({});
  // Per-post caption expansion toggle
  readonly expandedCaptions = signal<Record<string, boolean>>({});

  // Instagram Comments Modal Drawer
  readonly activeCommentPost = signal<FeedPost | null>(null);
  newCommentText = '';

  // Status / Story View Modal State
  readonly activeStory = signal<CollectionStory | null>(null);
  readonly storySlideIndex = signal<number>(0);
  readonly isStoryPaused = signal<boolean>(false);

  // Store Physical Location Info (Ipaja, Lagos)
  readonly physicalStore = {
    name: 'Teepha Flowers & Fabrics Fashion Store Lagos',
    address: 'Shagari Estate, 16 B C St, Ipaja, Lagos 102213, Lagos',
    hours: 'Mon – Sat: 8:30 AM – 7:30 PM · Sun: 12:00 PM – 6:00 PM',
    phone: '+234 812 000 8821',
    note: 'Our Sole Physical Fashion Store & Wholesale Showroom in Lagos',
  };

  // Horizontal Curated Collections (Story Status Previews)
  readonly curatedCollections: CollectionStory[] = [
    {
      id: 'col-swiss-voile',
      title: 'Imperial Swiss Voile',
      subtitle: '24K Gold Filigree & Scalloped Borders',
      coverImage:
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
      videoPreview:
        'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-tailor-working-with-cloth-42861-large.mp4',
      itemCount: 14,
      slides: [
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1080&q=85',
          title: 'Emerald & Gold Swiss Voile Imperial Lace',
          caption: 'St. Gallen Master Weave with pure metallic 24K filigree.',
          price: 85000,
          slug: 'emerald-gold-swiss-voile-lace',
        },
        {
          type: 'video',
          url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-tailor-working-with-cloth-42861-large.mp4',
          title: 'Precision Scalloped Edge Demonstration',
          caption: 'Hand-cut finish specifically designed for Aso-Ebi luxury.',
          price: 85000,
          slug: 'emerald-gold-swiss-voile-lace',
        },
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1080&q=85',
          title: 'Imperial Amethyst Swiss Voile Lace',
          caption: 'Deep royal purple with raised botanical embroidery.',
          price: 92000,
          slug: 'imperial-amethyst-swiss-voile',
        },
      ],
    },
    {
      id: 'col-senator-suite',
      title: 'The Senator Suite',
      subtitle: 'Super 160s Italian Cashmere & Gabardine',
      coverImage:
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80',
      videoPreview:
        'https://assets.mixkit.co/videos/preview/mixkit-sewing-machine-needle-stitching-fabric-42864-large.mp4',
      itemCount: 18,
      slides: [
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1080&q=85',
          title: 'Midnight Obsidian Super 160s Cashmere',
          caption:
            'Wrinkle-resistant luxury weave engineered for Lagos boardrooms.',
          price: 65000,
          slug: 'midnight-italian-cashmere-senator',
        },
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1080&q=85',
          title: 'Bespoke Fit: The Double Breasted Senator',
          caption:
            'Crisp finish tailored by master craftsmen in Victoria Island.',
          price: 65000,
          slug: 'midnight-italian-cashmere-senator',
        },
      ],
    },
    {
      id: 'col-bridal-flowers',
      title: 'Bridal Floral Bar',
      subtitle: 'Preserved Orchids & Fresh Cascades',
      coverImage:
        'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80',
      videoPreview:
        'https://assets.mixkit.co/videos/preview/mixkit-woman-holding-a-bouquet-of-flowers-43187-large.mp4',
      itemCount: 12,
      slides: [
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1080&q=85',
          title: 'Royal White Orchid & Garden Rose Cascade',
          caption:
            '72-hour moisture lock for ceremonial events and luxury weddings.',
          price: 45000,
          slug: 'royal-bridal-bouquet-cascade',
        },
        {
          type: 'video',
          url: 'https://assets.mixkit.co/videos/preview/mixkit-woman-holding-a-bouquet-of-flowers-43187-large.mp4',
          title: 'Fresh Morning Arrangement Studio',
          caption: 'Arranged daily at Teepha Fashion Store Ipaja floral suite.',
          price: 45000,
          slug: 'royal-bridal-bouquet-cascade',
        },
      ],
    },
    {
      id: 'col-aso-oke',
      title: 'Heritage Aso-Oke',
      subtitle: 'Strip-Loom Metallic Wild Silk Weaves',
      coverImage:
        'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
      videoPreview:
        'https://assets.mixkit.co/videos/preview/mixkit-fabric-samples-in-a-tailor-shop-42862-large.mp4',
      itemCount: 9,
      slides: [
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1080&q=85',
          title: 'Ochre & Copper Heritage Metallic Aso-Oke',
          caption: 'Traditional strip-loom weave by Iseyin master artisans.',
          price: 72000,
          slug: 'ochre-copper-heritage-aso-oke',
        },
      ],
    },
    {
      id: 'col-cufflinks-horology',
      title: 'Sovereign Horology',
      subtitle: 'Onyx, Titanium & Automatic Timepieces',
      coverImage:
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80',
      videoPreview:
        'https://assets.mixkit.co/videos/preview/mixkit-spinning-gold-rings-on-black-surface-42512-large.mp4',
      itemCount: 15,
      slides: [
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1080&q=85',
          title: 'Sovereign 18K Gold Onyx Inlay Cufflinks',
          caption: 'Engineered weight anchors heavy Senator and Agbada cuffs.',
          price: 38000,
          slug: 'sovereign-18k-gold-onyx-cufflinks',
        },
      ],
    },
    {
      id: 'col-silk-adire',
      title: 'Adire & Pure Silk',
      subtitle: 'Botanical Indigo Resist Motifs',
      coverImage:
        'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=600&q=80',
      videoPreview:
        'https://assets.mixkit.co/videos/preview/mixkit-hands-folding-a-fabric-42863-large.mp4',
      itemCount: 11,
      slides: [
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=1080&q=85',
          title: 'Botanical Adire Eleko Silk Satin',
          caption: 'Fluid drape with shimmering high-luster sheen.',
          price: 52000,
          slug: 'sunset-ochre-hand-dyed-adire-silk',
        },
      ],
    },
  ];

  // Vertical Scroll Ads / Services Section 1 (App Highlights & Programs)
  readonly verticalAppServices: VerticalAdSlide[] = [
    {
      id: 'vert-ad-affiliate',
      badge: 'TAILOR & CREATOR PARTNERSHIP',
      title: 'Earn 8% Commission with the Teepha Guild',
      desc: 'Partner with Teepha Flowers & Fabrics. Get dedicated client promo codes, instant Paystack payouts, and priority yardage reservation.',
      stats: [
        { label: 'Commission', val: '8% Flat' },
        { label: 'Payout Speed', val: 'Same-Day' },
        { label: 'Lagos Tailors Paid', val: '₦4.8M+' },
      ],
      bgImage:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
      actionLabel: 'Join Affiliate Guild →',
      actionUrl: '/affiliate',
    },
    {
      id: 'vert-ad-studio',
      badge: 'AI STYLE STUDIO & DRAPING',
      title: 'Virtual Fabric Silhouette Preview',
      desc: 'Visualize our Italian cashmeres and Swiss voile laces draped on custom Agbada and Senator silhouettes before placing your cut.',
      stats: [
        { label: 'Free Tokens', val: '3 Free' },
        { label: 'Render Time', val: '3 Seconds' },
        { label: 'Nigerian Cuts', val: 'Senator & Agbada' },
      ],
      bgImage:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
      actionLabel: 'Launch AI Studio ✦',
      actionUrl: '/studio',
    },
    {
      id: 'vert-ad-rewards',
      badge: 'CUSTOMER LOYALTY PRIVILEGES',
      title: 'Guild Rewards: Bronze to Black Tier',
      desc: 'Earn loyalty points on every yard. Unlock free same-day Lagos dispatch, complimentary curbside fitting, and private styling sessions.',
      stats: [
        { label: 'VIP Tiers', val: '4 Levels' },
        { label: 'Top Tier', val: 'Black Sovereign' },
        { label: 'Lagos Delivery', val: 'Complimentary' },
      ],
      bgImage:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      actionLabel: 'Explore Guild Privileges →',
      actionUrl: '/rewards',
    },
    {
      id: 'vert-ad-showroom',
      badge: 'LAGOS PHYSICAL SHOWROOM',
      title: 'Visit Our Ipaja Fashion Store & Fitting Suite',
      desc: 'Located at Shagari Estate, 16 B C St, Ipaja, Lagos. Feel 1,000+ fabric bolts, inspect 24K St. Gallen filigree, and consult our master tailor.',
      stats: [
        { label: 'Opening Hours', val: 'Mon-Sat 8:30 AM' },
        { label: 'Location', val: 'Ipaja, Lagos' },
        { label: 'Direct Line', val: '+234 812 000 8821' },
      ],
      bgImage:
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
      actionLabel: 'Book Showroom Visit on WhatsApp ↗',
      actionUrl:
        'https://wa.me/2348120008821?text=Hello%20Teepha%20Flowers%20%26%20Fabrics%2C%20I%20would%20like%20to%20visit%20the%20Ipaja%20showroom.',
      isExternal: true,
    },
  ];

  // Vertical Scroll Ads / Spotlights Section 2 (Bespoke Product Flash Spotlights)
  readonly verticalProductSpotlights: VerticalAdSlide[] = [
    {
      id: 'vert-prod-senator',
      badge: 'EXECUTIVE SENATOR EDIT',
      title: 'Super 180s Presidential Navy Gabardine',
      desc: 'The gold standard for diplomatic conferences and federal summits. Zero wrinkle retention, cool in tropical heat.',
      stats: [
        { label: 'Price', val: '₦72,000/yd' },
        { label: 'Weave', val: 'Super 180s' },
        { label: 'Width', val: '60 Inches' },
      ],
      bgImage:
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80',
      actionLabel: 'View Senator Fabrics →',
      actionUrl: '/collections/senator-wools',
    },
    {
      id: 'vert-prod-flowers',
      badge: 'FRESH BRIDAL BAR',
      title: 'Royal White Orchid & Garden Rose Cascade',
      desc: 'Hand-crafted bridal bouquets preserved with our signature 72-hour moisture lock. Tailored for landmark wedding celebrations.',
      stats: [
        { label: 'Price', val: '₦45,000' },
        { label: 'Freshness', val: '72-Hour Lock' },
        { label: 'Dispatch', val: 'Same-Day Lagos' },
      ],
      bgImage:
        'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
      actionLabel: 'Explore Bridal Floral Bar →',
      actionUrl: '/collections/luxury-flowers',
    },
    {
      id: 'vert-prod-swiss',
      badge: 'ST. GALLEN MASTER WEAVE',
      title: 'Emerald & 24K Gold Swiss Voile Lace',
      desc: 'Authentic Swiss-milled cotton voile lace adorned with metallic gold lurex threads and heavy scalloped borders.',
      stats: [
        { label: 'Price', val: '₦85,000/yd' },
        { label: 'Gold Filigree', val: '24K Metallic' },
        { label: 'Occasion', val: 'Royal Aso-Ebi' },
      ],
      bgImage:
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
      actionLabel: 'Shop Swiss Voile Lace →',
      actionUrl: '/collections/swiss-lace',
    },
  ];

  // Foundational Database of 24 High-Signal Posts (with 10+ Autoplay Video Posts!)
  readonly allPosts: FeedPost[] = [
    {
      id: 'post-01',
      slug: 'emerald-gold-swiss-voile-lace',
      brandLine: 'Teepha Signature Edit',
      brandHandle: '@teepha.lagos',
      avatarText: 'TF',
      isVerified: true,
      location: 'Showroom · Ipaja, Lagos',
      timeAgo: '2h',
      title: 'Emerald & Gold Swiss Voile Imperial Lace',
      caption:
        'Fresh arrival at our Ipaja showroom. Hand-cut scalloped borders with genuine metallic 24K filigree St. Gallen master weave. Heavy drape tailored for wedding Aso-Ebi and royal chieftaincies.',
      price: 85000,
      unit: 'yard',
      mediaType: 'carousel',
      mediaItems: [
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80',
      ],
      likesCount: 312,
      isLiked: false,
      commentsCount: 24,
      comments: [
        {
          id: 'c-1',
          user: 'Adebayo Tailoring Hub',
          handle: '@adebayo_cuts',
          text: 'The gold filigree on this piece is truly magnificent. Sewed 12 yards for a Lekki groom last week!',
          time: '1h',
          avatar:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
          likes: 8,
          isLiked: false,
        },
      ],
      isBookmarked: false,
      sharesCount: 48,
      repostsCount: 16,
      tags: [
        '#TeephaFabrics',
        '#SwissVoile',
        '#LagosAsoEbi',
        '#LuxuryTextiles',
      ],
      fabricSpecs: {
        material: '100% Cotton Voile with 24K Lurex Filigree',
        width: '56 Inches',
        occasion: 'Traditional Weddings, Chieftaincy, Milestone Anniversaries',
      },
    },
    {
      id: 'post-02',
      slug: 'royal-bridal-bouquet-cascade',
      brandLine: 'Teepha Luxury Floral Bar',
      brandHandle: '@teepha.flowers',
      avatarText: 'TF',
      isVerified: true,
      location: 'Ipaja Flagship Floral Suite, Lagos',
      timeAgo: '3h',
      title: 'Royal Bridal White Orchid & Rose Cascade',
      caption:
        'Crafted fresh this morning at our Ipaja studio. Preserved for the humid Lagos atmosphere with our signature 72-hour moisture lock. Cascading Ecuadorian orchids and ivory garden roses.',
      price: 45000,
      unit: 'arrangement',
      mediaType: 'video',
      mediaItems: [
        'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1000&q=80',
      ],
      videoUrl:
        'https://assets.mixkit.co/videos/preview/mixkit-woman-holding-a-bouquet-of-flowers-43187-large.mp4',
      likesCount: 428,
      isLiked: true,
      commentsCount: 31,
      comments: [
        {
          id: 'c-3',
          user: 'Eniola Brides',
          handle: '@eniola_luxury',
          text: 'The scent and cascade on this bouquet is heavenly! Ordered for our bridal train next Saturday.',
          time: '2h',
          avatar:
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
          likes: 12,
          isLiked: false,
        },
      ],
      isBookmarked: true,
      sharesCount: 65,
      repostsCount: 22,
      tags: [
        '#TeephaFlowers',
        '#BridalBouquet',
        '#LagosWeddings',
        '#FreshFlorals',
      ],
      fabricSpecs: {
        material: 'Preserved White Orchids, Avalanche Garden Roses',
        width: 'Cascading 45cm Drop',
        occasion: 'Bridal Entrance, Church Ceremonies, Luxury Reception',
      },
    },
    {
      id: 'post-03',
      slug: 'midnight-italian-cashmere-senator',
      brandLine: 'The Senator Vault',
      brandHandle: '@teepha.senator',
      avatarText: 'TF',
      isVerified: true,
      location: 'Shagari Estate · Ipaja, Lagos',
      timeAgo: '5h',
      title: 'Midnight Obsidian Super 160s Italian Cashmere',
      caption:
        'The definitive VIP executive fabric. Super 160s Italian cashmere wool with featherlight gabardine weave. Crisp structural drape, breathability in 34°C tropical heat, and zero crease retention.',
      price: 65000,
      unit: 'yard',
      mediaType: 'carousel',
      mediaItems: [
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1000&q=80',
      ],
      likesCount: 512,
      isLiked: false,
      commentsCount: 42,
      comments: [
        {
          id: 'c-4',
          user: 'Kenechukwu Bespoke',
          handle: '@kene_tailor',
          text: 'Best Italian wool in Lagos right now. Sews like butter and creates razor-sharp lapels.',
          time: '4h',
          avatar:
            'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
          likes: 19,
          isLiked: true,
        },
      ],
      isBookmarked: false,
      sharesCount: 77,
      repostsCount: 29,
      tags: [
        '#ItalianCashmere',
        '#SenatorStyle',
        '#BespokeLagos',
        '#MenOfClass',
      ],
      fabricSpecs: {
        material: 'Super 160s Worsted Cashmere & Virgin Wool Blend',
        width: '58 Inches',
        occasion: 'Boardrooms, State Banquets, Jummah Senator Bespoke',
      },
    },
    {
      id: 'post-04',
      slug: 'tailor-mastery-loom-cut',
      brandLine: 'Teepha Atelier Studio',
      brandHandle: '@teepha.atelier',
      avatarText: 'TF',
      isVerified: true,
      location: 'Ipaja Bespoke Tailor Suite, Lagos',
      timeAgo: '7h',
      title: 'Master Cutting: Super 150s Egyptian Giza Cotton',
      caption:
        'Watch our in-house master tailor draft the foundational cut for an executive Senator Agbada. Notice how clean the edges cut with zero fraying. Experience pure fabric mastery.',
      price: 48000,
      unit: 'yard',
      mediaType: 'video',
      mediaItems: [
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80',
      ],
      videoUrl:
        'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-tailor-working-with-cloth-42861-large.mp4',
      likesCount: 389,
      isLiked: false,
      commentsCount: 19,
      comments: [
        {
          id: 'c-5',
          user: 'Chief Balogun',
          handle: '@balogun_class',
          text: 'Does this hold starch cleanly after several washes?',
          time: '5h',
          avatar:
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
          likes: 5,
          isLiked: false,
        },
      ],
      isBookmarked: false,
      sharesCount: 34,
      repostsCount: 14,
      tags: [
        '#MasterTailor',
        '#EgyptianGiza',
        '#LagosFashion',
        '#TeephaQuality',
      ],
      fabricSpecs: {
        material: '100% Extra Long Staple Egyptian Cotton',
        width: '58 Inches',
        occasion: 'Friday Jummah Senator, White Weddings, Church Thanksgiving',
      },
    },
    {
      id: 'post-05',
      slug: 'venetian-damask-gold-brocade',
      brandLine: 'Imperial Brocade Suite',
      brandHandle: '@teepha.brocade',
      avatarText: 'TF',
      isVerified: true,
      location: 'Ipaja Showroom · Lagos',
      timeAgo: '9h',
      title: 'Venetian Imperial Gold-Threaded Damask Brocade',
      caption:
        'Heavy architectural jacquard weave with embossed botanical medallions in antique gold and royal noir. Reflects ambient hall lighting with regal grandeur.',
      price: 95000,
      unit: 'yard',
      mediaType: 'carousel',
      mediaItems: [
        'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80',
      ],
      likesCount: 671,
      isLiked: false,
      commentsCount: 52,
      comments: [
        {
          id: 'c-6',
          user: 'Lady Victoria',
          handle: '@victoria_luxe',
          text: 'This is the exact fabric for my 50th birthday dinner gown! Sending inquiry right away.',
          time: '6h',
          avatar:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
          likes: 15,
          isLiked: true,
        },
      ],
      isBookmarked: true,
      sharesCount: 92,
      repostsCount: 38,
      tags: [
        '#DamaskBrocade',
        '#GoldJacquard',
        '#NigerianRoyalty',
        '#TeephaLagos',
      ],
      fabricSpecs: {
        material: 'Metallic Silk & Acetate Heavy Jacquard',
        width: '54 Inches',
        occasion: 'Coronations, 50th/60th Jubilees, Royal Gala Dinners',
      },
    },
    {
      id: 'post-06',
      slug: 'sovereign-18k-gold-onyx-cufflinks',
      brandLine: 'Sovereign Accessories',
      brandHandle: '@teepha.accessories',
      avatarText: 'TF',
      isVerified: true,
      location: 'Showroom · Ipaja, Lagos',
      timeAgo: '11h',
      title: 'Sovereign 18K Gold Inlay Natural Onyx Cufflinks',
      caption:
        'Engineered weight specifically tailored to anchor heavy Senator cuffs and layered Agbada sleeves. Natural black onyx stone framed in mirror-polished 18K gold electroplate.',
      price: 38000,
      unit: 'pair',
      mediaType: 'video',
      mediaItems: [
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80',
      ],
      videoUrl:
        'https://assets.mixkit.co/videos/preview/mixkit-spinning-gold-rings-on-black-surface-42512-large.mp4',
      likesCount: 295,
      isLiked: false,
      commentsCount: 16,
      comments: [
        {
          id: 'c-7',
          user: 'Barrister Dimeji',
          handle: '@dimeji_law',
          text: 'Subtle, weighty, and commanding. Exactly what a lawyer needs on a crisp white shirt.',
          time: '8h',
          avatar:
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
          likes: 7,
          isLiked: false,
        },
      ],
      isBookmarked: false,
      sharesCount: 41,
      repostsCount: 9,
      tags: [
        '#Cufflinks',
        '#GentlemansEdit',
        '#LuxuryHorology',
        '#SenatorCuff',
      ],
      fabricSpecs: {
        material: 'Natural Black Onyx & 18K Gold Plated Brass Core',
        width: '18mm Diameter',
        occasion:
          'Diplomatic Engagements, Courtroom Appearances, Executive Dinners',
      },
    },
    {
      id: 'post-07',
      slug: 'sunset-ochre-adire-silk-satin',
      brandLine: 'Teepha Heritage Collection',
      brandHandle: '@teepha.heritage',
      avatarText: 'TF',
      isVerified: true,
      location: 'Ipaja Flagship Store, Lagos',
      timeAgo: '14h',
      title: 'Botanical Adire Eleko & Sunset Ochre Silk Satin',
      caption:
        'Hand-painted botanical indigo resist patterns on pure fluid silk satin. Shimmers in natural sunlight with unmatched fluidity. Perfect for modern boubous and statement evening wear.',
      price: 52000,
      unit: 'yard',
      mediaType: 'carousel',
      mediaItems: [
        'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80',
      ],
      likesCount: 489,
      isLiked: true,
      commentsCount: 29,
      comments: [
        {
          id: 'c-8',
          user: 'Zainab Buba',
          handle: '@zainab_styles',
          text: 'The drape of this silk satin is completely breathless. Wearing this for Eid in Abuja!',
          time: '10h',
          avatar:
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
          likes: 11,
          isLiked: true,
        },
      ],
      isBookmarked: true,
      sharesCount: 58,
      repostsCount: 20,
      tags: [
        '#AdireSilk',
        '#HeritageLagos',
        '#PureSilk',
        '#ContemporaryAfricanArt',
      ],
      fabricSpecs: {
        material: '100% Pure Mulberry Silk Satin with Natural Indigo Dye',
        width: '54 Inches',
        occasion:
          'Cocktail Galas, High-Society Art Exhibitions, Milestone Events',
      },
    },
    {
      id: 'post-08',
      slug: 'needle-precision-stitching-art',
      brandLine: 'Teepha Atelier Studio',
      brandHandle: '@teepha.craft',
      avatarText: 'TF',
      isVerified: true,
      location: 'Bespoke Atelier · Ipaja, Lagos',
      timeAgo: '15h',
      title: 'High-Tensile Stitching: St. Gallen Voile Hemline',
      caption:
        'Watch the precision needlework securing the scalloped hemline of our 24K Swiss Voile. Every micro-stitch reinforces the heirloom longevity of the garment.',
      price: 88000,
      unit: 'yard',
      mediaType: 'video',
      mediaItems: [
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80',
      ],
      videoUrl:
        'https://assets.mixkit.co/videos/preview/mixkit-sewing-machine-needle-stitching-fabric-42864-large.mp4',
      likesCount: 523,
      isLiked: false,
      commentsCount: 38,
      comments: [
        {
          id: 'c-14',
          user: 'Master Tailor Jide',
          handle: '@jide_couture',
          text: 'Mesmerizing precision. What needle gauge is recommended for this voile?',
          time: '11h',
          avatar:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
          likes: 14,
          isLiked: false,
        },
      ],
      isBookmarked: true,
      sharesCount: 71,
      repostsCount: 25,
      tags: [
        '#PrecisionStitching',
        '#TailoringArt',
        '#SwissLace',
        '#HeirloomQuality',
      ],
      fabricSpecs: {
        material: 'Pure Voile & High-Tensile Metallic Thread',
        width: '56 Inches',
        occasion: 'Traditional Wedding Attire, Chieftaincy Regalia',
      },
    },
    {
      id: 'post-09',
      slug: 'obsidian-leather-luxury-lows',
      brandLine: 'Teepha Streetwear & Kicks',
      brandHandle: '@teepha.kicks',
      avatarText: 'TF',
      isVerified: true,
      location: 'Showroom Vault · Ipaja, Lagos',
      timeAgo: '16h',
      title: 'Obsidian Verified Italian Calfskin Luxury Lows',
      caption:
        'Individually numbered luxury sneakers built with supple Italian box calfskin leather. Double-cushioned insole designed for effortless walkability between high-profile Lagos venues.',
      price: 125000,
      unit: 'pair',
      mediaType: 'image',
      mediaItems: [
        'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=80',
      ],
      likesCount: 382,
      isLiked: false,
      commentsCount: 22,
      comments: [
        {
          id: 'c-9',
          user: 'Tobi Alabi',
          handle: '@tobi_sneakers',
          text: 'Better leather grain than luxury Italian houses. Super clean silhouette.',
          time: '12h',
          avatar:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
          likes: 9,
          isLiked: false,
        },
      ],
      isBookmarked: false,
      sharesCount: 46,
      repostsCount: 15,
      tags: [
        '#LuxuryKicks',
        '#ItalianCalfskin',
        '#LagosStreetwear',
        '#VerifiedOriginal',
      ],
      fabricSpecs: {
        material: 'Full-Grain Italian Box Calfskin & Margom Rubber Sole',
        width: 'EU 40 - 46 Available',
        occasion:
          'Private Jet Lounges, Casual Friday Boardrooms, VIP Weekend Galas',
      },
    },
    {
      id: 'post-10',
      slug: 'showroom-fabric-bolt-inspect',
      brandLine: 'Teepha Showroom Live',
      brandHandle: '@teepha.showroom',
      avatarText: 'TF',
      isVerified: true,
      location: 'Shagari Estate · Ipaja, Lagos',
      timeAgo: '17h',
      title: 'Showroom Walk-through: Curated Italian Wool Bolts',
      caption:
        'Take a 30-second virtual walk through our Ipaja showroom vault. Feel the rich textures of Super 160s cashmeres, brocades, and ceremonial linens ready for immediate Lagos dispatch.',
      price: 68000,
      unit: 'yard',
      mediaType: 'video',
      mediaItems: [
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80',
      ],
      videoUrl:
        'https://assets.mixkit.co/videos/preview/mixkit-fabric-samples-in-a-tailor-shop-42862-large.mp4',
      likesCount: 610,
      isLiked: true,
      commentsCount: 49,
      comments: [
        {
          id: 'c-15',
          user: 'Senator Adeleke',
          handle: '@adeleke_vip',
          text: 'Coming over to Shagari Estate this Friday to pick up 20 yards for my brothers!',
          time: '13h',
          avatar:
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
          likes: 21,
          isLiked: true,
        },
      ],
      isBookmarked: true,
      sharesCount: 88,
      repostsCount: 33,
      tags: ['#ShowroomTour', '#ItalianWool', '#IpajaLagos', '#TeephaShowroom'],
      fabricSpecs: {
        material: 'Super 160s Worsted Wool & Cashmere',
        width: '60 Inches',
        occasion: 'Executive Wardrobes, Royal Ensembles',
      },
    },
    {
      id: 'post-11',
      slug: 'champagne-st-gallen-cord-lace',
      brandLine: 'Imperial Swiss Voile Suite',
      brandHandle: '@teepha.swiss',
      avatarText: 'TF',
      isVerified: true,
      location: 'Ipaja Showroom · Lagos',
      timeAgo: '18h',
      title: 'Champagne St. Gallen Raised Cord Lace with Swarovski Stones',
      caption:
        'Exquisite raised cord embroidery embellished with certified Austrian Swarovski crystal accents. The definitive choice for the mother of the bride or anniversary celebrants.',
      price: 98000,
      unit: 'yard',
      mediaType: 'carousel',
      mediaItems: [
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80',
      ],
      likesCount: 541,
      isLiked: false,
      commentsCount: 36,
      comments: [
        {
          id: 'c-10',
          user: 'Hajiya Amina',
          handle: '@hajiya_amina',
          text: 'Can I purchase 30 yards for my daughter’s wedding in Kaduna?',
          time: '15h',
          avatar:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
          likes: 14,
          isLiked: true,
        },
      ],
      isBookmarked: false,
      sharesCount: 63,
      repostsCount: 27,
      tags: ['#CordLace', '#SwarovskiCrystals', '#SwissVoile', '#AsoEbiLagos'],
      fabricSpecs: {
        material: 'Raised Cotton Cord & Austrian Swarovski Crystal Elements',
        width: '56 Inches',
        occasion: 'Mother of the Bride, Silver Jubilee, State Banquets',
      },
    },
    {
      id: 'post-12',
      slug: 'designer-sketch-draping-studio',
      brandLine: 'Teepha Haute Couture',
      brandHandle: '@teepha.couture',
      avatarText: 'TF',
      isVerified: true,
      location: 'Design Studio · Ipaja, Lagos',
      timeAgo: '19h',
      title: 'Bespoke Draping: Traditional Agbada with Modern Lapels',
      caption:
        'Our lead bridal and menswear designer sketching the structural proportions for a 3-piece imperial Agbada. Notice the silhouette balance for broad-shouldered Nigerian dignitaries.',
      price: 110000,
      unit: 'ensemble',
      mediaType: 'video',
      mediaItems: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1000&q=80',
      ],
      videoUrl:
        'https://assets.mixkit.co/videos/preview/mixkit-fashion-designer-working-on-a-sketch-42857-large.mp4',
      likesCount: 712,
      isLiked: true,
      commentsCount: 54,
      comments: [
        {
          id: 'c-16',
          user: 'Dr. Alabi',
          handle: '@alabi_diplomacy',
          text: 'Phenomenal sketch. How many weeks does a bespoke commission take?',
          time: '16h',
          avatar:
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
          likes: 18,
          isLiked: true,
        },
      ],
      isBookmarked: true,
      sharesCount: 94,
      repostsCount: 39,
      tags: [
        '#BespokeSketch',
        '#AgbadaSilhouette',
        '#HauteCoutureLagos',
        '#TeephaStyling',
      ],
      fabricSpecs: {
        material: 'Super 160s Cashmere & Heavy Hand-Woven Silk Lining',
        width: 'Custom Tailored Fit',
        occasion:
          'Coronation Ceremonies, Presidential Banquets, High Society Weddings',
      },
    },
    {
      id: 'post-13',
      slug: 'presidential-navy-senator-gabardine',
      brandLine: 'The Senator Vault',
      brandHandle: '@teepha.senator',
      avatarText: 'TF',
      isVerified: true,
      location: 'Shagari Estate · Ipaja, Lagos',
      timeAgo: '1d',
      title: 'Presidential Deep Navy Super 180s Senator Gabardine',
      caption:
        'A commanding deep navy hue with subtle micro-twill weave. Crisp memory retention keeps pant creases sharp through entire 14-hour diplomatic conferences.',
      price: 72000,
      unit: 'yard',
      mediaType: 'image',
      mediaItems: [
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=80',
      ],
      likesCount: 418,
      isLiked: false,
      commentsCount: 20,
      comments: [
        {
          id: 'c-11',
          user: 'Senator Nnamdi',
          handle: '@nnamdi_consulting',
          text: 'Ordered 8 yards. Flawless weight and breathability.',
          time: '20h',
          avatar:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
          likes: 10,
          isLiked: false,
        },
      ],
      isBookmarked: false,
      sharesCount: 52,
      repostsCount: 18,
      tags: [
        '#PresidentialNavy',
        '#SenatorCut',
        '#Super180s',
        '#LuxuryFabrics',
      ],
      fabricSpecs: {
        material: 'Super 180s Extra-Fine Gabardine & Silk Microtwill',
        width: '60 Inches',
        occasion: 'State Protocol, International Summits, High-End Weddings',
      },
    },
    {
      id: 'post-14',
      slug: 'shears-cut-cashmere-bolt',
      brandLine: 'Teepha Master Cutters',
      brandHandle: '@teepha.cutters',
      avatarText: 'TF',
      isVerified: true,
      location: 'Cutting Floor · Ipaja, Lagos',
      timeAgo: '1d',
      title: 'Heavy Tailor Shears: Slicing Italian Cashmere Wool',
      caption:
        'The crisp sound of forged carbon shears slicing through 400 GSM Italian Cashmere. Zero fraying, clean bias lines, prepared for master basting.',
      price: 65000,
      unit: 'yard',
      mediaType: 'video',
      mediaItems: [
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1000&q=80',
      ],
      videoUrl:
        'https://assets.mixkit.co/videos/preview/mixkit-cutting-fabric-with-scissors-42865-large.mp4',
      likesCount: 588,
      isLiked: false,
      commentsCount: 33,
      comments: [
        {
          id: 'c-17',
          user: 'Olu of Warri Stylist',
          handle: '@royal_stylist_ng',
          text: 'That sound is pure music to any real tailor. Ordered 16 yards for royal entourage.',
          time: '1d',
          avatar:
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
          likes: 16,
          isLiked: true,
        },
      ],
      isBookmarked: true,
      sharesCount: 79,
      repostsCount: 28,
      tags: [
        '#TailorShears',
        '#PureWoolCut',
        '#BespokeMastery',
        '#TeephaLagos',
      ],
      fabricSpecs: {
        material: '100% Super 160s Worsted Cashmere Wool',
        width: '58 Inches',
        occasion: 'Formal Senator Bespoke, Agbada Trousering',
      },
    },
    {
      id: 'post-15',
      slug: 'blush-rose-fresh-ceremonial-box',
      brandLine: 'Teepha Luxury Floral Bar',
      brandHandle: '@teepha.flowers',
      avatarText: 'TF',
      isVerified: true,
      location: 'Ipaja Showroom · Lagos',
      timeAgo: '1d',
      title: 'Blush Rose & Hydrangea Ceremonial Centerpiece Box',
      caption:
        'Arranged with English garden roses, Dutch hydrangeas, and fragrant silver eucalyptus. Includes an acrylic moisture vase suited for dinner tables and executive reception desks.',
      price: 36000,
      unit: 'arrangement',
      mediaType: 'image',
      mediaItems: [
        'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1000&q=80',
      ],
      likesCount: 310,
      isLiked: true,
      commentsCount: 15,
      comments: [
        {
          id: 'c-12',
          user: 'Bukky Event Decor',
          handle: '@bukky_events',
          text: 'Do you deliver to Ikoyi on Sunday mornings?',
          time: '22h',
          avatar:
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
          likes: 4,
          isLiked: false,
        },
      ],
      isBookmarked: false,
      sharesCount: 38,
      repostsCount: 11,
      tags: [
        '#FloralCenterpiece',
        '#LuxuryGifts',
        '#LagosFlowers',
        '#TeephaFloral',
      ],
      fabricSpecs: {
        material: 'Dutch Hydrangeas, English Garden Roses, Silver Eucalyptus',
        width: '35cm Cube Display',
        occasion:
          'Milestone Birthdays, Executive Board Desks, Anniversary Surprises',
      },
    },
    {
      id: 'post-16',
      slug: 'folding-luxury-fabric-bolt',
      brandLine: 'Teepha Showroom Vault',
      brandHandle: '@teepha.vault',
      avatarText: 'TF',
      isVerified: true,
      location: 'Showroom Floor · Ipaja, Lagos',
      timeAgo: '1d',
      title: 'Preserving the Weave: Hand-Folding 50-Yard Damask Rolls',
      caption:
        'Our fabric curators fold and roll each high-luster damask bolt along the natural bias to prevent crease memory and preserve the embossed relief of the gold yarns.',
      price: 95000,
      unit: 'yard',
      mediaType: 'video',
      mediaItems: [
        'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80',
      ],
      videoUrl:
        'https://assets.mixkit.co/videos/preview/mixkit-hands-folding-a-fabric-42863-large.mp4',
      likesCount: 467,
      isLiked: false,
      commentsCount: 28,
      comments: [
        {
          id: 'c-18',
          user: 'Ifeoma Chima',
          handle: '@chima_fashion',
          text: 'This attention to fabric preservation is why Teepha is unmatched in Lagos.',
          time: '1d',
          avatar:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
          likes: 11,
          isLiked: false,
        },
      ],
      isBookmarked: true,
      sharesCount: 62,
      repostsCount: 19,
      tags: [
        '#FabricCare',
        '#DamaskBrocade',
        '#LagosLuxuryTextiles',
        '#TeephaCraft',
      ],
      fabricSpecs: {
        material: 'Silk Brocade & Lurex Heavy Gold Weave',
        width: '56 Inches',
        occasion:
          'Chieftaincy Coronations, High Society Weddings, Imperial Galas',
      },
    },
    {
      id: 'post-17',
      slug: 'imperial-amethyst-swiss-voile',
      brandLine: 'Imperial Swiss Voile Suite',
      brandHandle: '@teepha.swiss',
      avatarText: 'TF',
      isVerified: true,
      location: 'Ipaja Showroom · Lagos',
      timeAgo: '2d',
      title: 'Imperial Royal Amethyst Swiss Voile with Silver Filigree',
      caption:
        'A royal deep amethyst purple backdrop illuminated by St. Gallen silver thread lace. The density of the cotton voile creates an effortless stately silhouette.',
      price: 92000,
      unit: 'yard',
      mediaType: 'carousel',
      mediaItems: [
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80',
      ],
      likesCount: 519,
      isLiked: false,
      commentsCount: 37,
      comments: [
        {
          id: 'c-19',
          user: 'Hajiya Maryam',
          handle: '@maryam_couture',
          text: 'The amethyst shade is regal beyond words. Reserving 10 yards for wedding in Abuja!',
          time: '1d',
          avatar:
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
          likes: 9,
          isLiked: false,
        },
      ],
      isBookmarked: false,
      sharesCount: 68,
      repostsCount: 24,
      tags: ['#AmethystVoile', '#SwissLace', '#RoyalAsoEbi', '#TeephaFabrics'],
      fabricSpecs: {
        material: '100% Long-Staple Swiss Cotton Voile & Silver Lurex',
        width: '56 Inches',
        occasion: 'Wedding Aso-Ebi, Royal Chieftaincies, 50th Jubilees',
      },
    },
    {
      id: 'post-18',
      slug: 'delicate-pink-rose-dew',
      brandLine: 'Teepha Luxury Floral Bar',
      brandHandle: '@teepha.flowers',
      avatarText: 'TF',
      isVerified: true,
      location: 'Fresh Floral Cold Room · Ipaja, Lagos',
      timeAgo: '2d',
      title: 'Dew-Kissed Avalanche Roses: Fresh Morning Import',
      caption:
        'Imported overnight and misted with nutrient water in our temperature-controlled cold room at Ipaja. Petals crisp, velvety, and fragrant.',
      price: 38000,
      unit: 'arrangement',
      mediaType: 'video',
      mediaItems: [
        'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1000&q=80',
      ],
      videoUrl:
        'https://assets.mixkit.co/videos/preview/mixkit-delicate-pink-rose-with-water-droplets-40540-large.mp4',
      likesCount: 442,
      isLiked: true,
      commentsCount: 26,
      comments: [
        {
          id: 'c-20',
          user: 'Grace Adeyemi',
          handle: '@grace_flowers',
          text: 'These roses last over a week in AC rooms! Best florist in Lagos.',
          time: '2d',
          avatar:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
          likes: 12,
          isLiked: true,
        },
      ],
      isBookmarked: true,
      sharesCount: 54,
      repostsCount: 17,
      tags: [
        '#AvalancheRoses',
        '#FreshFlorals',
        '#LagosLuxuryFlorist',
        '#TeephaBloom',
      ],
      fabricSpecs: {
        material: 'Fresh Avalanche Garden Roses, Silver Dusty Miller',
        width: '30cm Hand-Tied Posy',
        occasion: 'Romance, Mother’s Day, VIP Welcome Gifts',
      },
    },
    {
      id: 'post-19',
      slug: 'ochre-copper-heritage-aso-oke',
      brandLine: 'Heritage Weavers Guild',
      brandHandle: '@teepha.heritage',
      avatarText: 'TF',
      isVerified: true,
      location: 'Ipaja Showroom · Lagos',
      timeAgo: '2d',
      title: 'Copper & Burnished Ochre Strip-Loom Metallic Aso-Oke',
      caption:
        'Traditional strip-loom hand-woven Aso-Oke from Iseyin master weavers. Metallic copper warp infused with raw wild silk threads for structural head-ties and Agbada accents.',
      price: 72000,
      unit: 'set',
      mediaType: 'carousel',
      mediaItems: [
        'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=1000&q=80',
      ],
      likesCount: 531,
      isLiked: false,
      commentsCount: 34,
      comments: [
        {
          id: 'c-21',
          user: 'Dr. (Mrs) Kofo Tinubu',
          handle: '@kofo_tinubu',
          text: 'The heavy metallic shimmer on the gele holds its pleats throughout the entire day.',
          time: '2d',
          avatar:
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
          likes: 15,
          isLiked: false,
        },
      ],
      isBookmarked: false,
      sharesCount: 60,
      repostsCount: 21,
      tags: [
        '#AsoOke',
        '#TraditionalWedding',
        '#YorubaHeritage',
        '#TeephaLagos',
      ],
      fabricSpecs: {
        material: 'Hand-Spun Wild Silk & Metallic Copper Lurex',
        width: 'Traditional 4-Inch Strips Joined to 60-Inch Width',
        occasion: 'Traditional Engagements, Chieftaincy Turbaning',
      },
    },
    {
      id: 'post-20',
      slug: 'model-studio-silhouette-walk',
      brandLine: 'Teepha Lookbook Live',
      brandHandle: '@teepha.lookbook',
      avatarText: 'TF',
      isVerified: true,
      location: 'Runway Studio · Ipaja, Lagos',
      timeAgo: '2d',
      title: 'Movement Test: Fluid Silk Satin Boubou in Motion',
      caption:
        'Watch the luminous refraction as this silk boubou catches direct stage lighting. Notice the graceful, undulating wave of the fabric hemline with every step.',
      price: 75000,
      unit: 'dress cut',
      mediaType: 'video',
      mediaItems: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
      ],
      videoUrl:
        'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-studio-wearing-a-dress-41885-large.mp4',
      likesCount: 820,
      isLiked: true,
      commentsCount: 62,
      comments: [
        {
          id: 'c-22',
          user: 'Omawunmi Lifestyle',
          handle: '@omawunmi_life',
          text: 'This video sold me. Ordering 6 yards in the rust orange colorway!',
          time: '2d',
          avatar:
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
          likes: 24,
          isLiked: true,
        },
      ],
      isBookmarked: true,
      sharesCount: 108,
      repostsCount: 45,
      tags: [
        '#SilkMovement',
        '#RunwayLook',
        '#LagosFashionWeek',
        '#TeephaCouture',
      ],
      fabricSpecs: {
        material: '100% Fluid Mulberry Silk Satin',
        width: '54 Inches',
        occasion: 'Evening Galas, High-Profile Receptions, Luxury Lounging',
      },
    },
    {
      id: 'post-21',
      slug: 'sovereign-horology-gold-chronometer',
      brandLine: 'Sovereign Horology',
      brandHandle: '@teepha.timepieces',
      avatarText: 'TF',
      isVerified: true,
      location: 'Horology Suite · Ipaja, Lagos',
      timeAgo: '3d',
      title: 'Sovereign 18K Gold Fluted Bezel Chronometer',
      caption:
        'Precision Swiss automatic movement housed in brushed surgical steel with an 18K gold fluted bezel. Scratch-resistant sapphire crystal and 100M water resistance.',
      price: 185000,
      unit: 'piece',
      mediaType: 'image',
      mediaItems: [
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80',
      ],
      likesCount: 374,
      isLiked: false,
      commentsCount: 18,
      comments: [
        {
          id: 'c-23',
          user: 'Chief Danjuma',
          handle: '@danjuma_oil',
          text: 'Weighted perfectly on the wrist. Pairs impeccably with an obsidian senator.',
          time: '2d',
          avatar:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
          likes: 7,
          isLiked: false,
        },
      ],
      isBookmarked: false,
      sharesCount: 43,
      repostsCount: 12,
      tags: [
        '#LuxuryTimepieces',
        '#GentlemansAccessories',
        '#SovereignWatch',
        '#TeephaLagos',
      ],
      fabricSpecs: {
        material: '316L Surgical Steel, 18K Gold Electroplate, Sapphire Glass',
        width: '41mm Case Diameter',
        occasion:
          'Executive Board Meetings, Gala Dinners, Milestone Anniversaries',
      },
    },
    {
      id: 'post-22',
      slug: 'embroidery-thread-silk-detail',
      brandLine: 'Teepha Textile Lab',
      brandHandle: '@teepha.lab',
      avatarText: 'TF',
      isVerified: true,
      location: 'Showroom Lab · Ipaja, Lagos',
      timeAgo: '3d',
      title: 'Micro-Loom Filaments: Pure Silk Embroidery Spools',
      caption:
        'Close-up view of the multi-ply spun silk embroidery spools used across our Swiss voile lace borders. Dyed with colorfast botanical pigments guaranteed against washing fade.',
      price: 42000,
      unit: 'spool set',
      mediaType: 'video',
      mediaItems: [
        'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=1000&q=80',
      ],
      videoUrl:
        'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-colorful-embroidery-threads-42858-large.mp4',
      likesCount: 462,
      isLiked: false,
      commentsCount: 21,
      comments: [
        {
          id: 'c-24',
          user: 'Couture Thread Guild',
          handle: '@thread_guild',
          text: 'The color saturation on the royal gold thread is extraordinary.',
          time: '3d',
          avatar:
            'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
          likes: 8,
          isLiked: false,
        },
      ],
      isBookmarked: true,
      sharesCount: 51,
      repostsCount: 15,
      tags: [
        '#SilkEmbroidery',
        '#TextileLab',
        '#LagosArtisans',
        '#TeephaStandards',
      ],
      fabricSpecs: {
        material: '100% Multi-ply Mulberry Spun Silk',
        width: 'Set of 12 Colorfast Spools',
        occasion: 'Bespoke Monogramming, High-End Border Embroidery',
      },
    },
    {
      id: 'post-23',
      slug: 'pure-white-giza-cotton-voile',
      brandLine: 'Nile Prestige Suite',
      brandHandle: '@teepha.cotton',
      avatarText: 'TF',
      isVerified: true,
      location: 'Ipaja Showroom · Lagos',
      timeAgo: '3d',
      title: '150s Pure White Egyptian Giza Cotton Senator Voile',
      caption:
        'Crisp, featherweight yet dense weave from long-staple Giza cotton. Highly resistant to yellowing, cool to the skin in humid heat, the definitive white fabric for Lagos bespoke tailoring.',
      price: 48000,
      unit: 'yard',
      mediaType: 'carousel',
      mediaItems: [
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1000&q=80',
      ],
      likesCount: 680,
      isLiked: true,
      commentsCount: 44,
      comments: [
        {
          id: 'c-25',
          user: 'Alhaji Mansur Danbatta',
          handle: '@danbatta_kano',
          text: 'Pure elegance. The white is blindingly crisp and holds starch cleanly without turning yellowish.',
          time: '3d',
          avatar:
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
          likes: 22,
          isLiked: true,
        },
      ],
      isBookmarked: true,
      sharesCount: 85,
      repostsCount: 31,
      tags: [
        '#GizaCotton',
        '#WhiteSenator',
        '#JummahElegance',
        '#TeephaPrestige',
      ],
      fabricSpecs: {
        material: '100% Extra Long Staple Egyptian Giza Cotton',
        width: '58 Inches',
        occasion: 'Friday Jummah Senator, White Weddings, Church Thanksgiving',
      },
    },
    {
      id: 'post-24',
      slug: 'emerald-green-silk-brocade-bale',
      brandLine: 'Imperial Brocade Suite',
      brandHandle: '@teepha.brocade',
      avatarText: 'TF',
      isVerified: true,
      location: 'Warehouse Vault · Ipaja, Lagos',
      timeAgo: '3d',
      title: 'Emerald Green & Metallic Gold Brocade Bolt Inspection',
      caption:
        'Our fabric specialists unwrapping a 50-yard commercial roll of genuine Venetian damask. Notice the metallic reflections and heavy drape. Ready for instant wholesale and retail cuts.',
      price: 95000,
      unit: 'yard',
      mediaType: 'video',
      mediaItems: [
        'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80',
      ],
      videoUrl:
        'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-tailor-working-with-cloth-42861-large.mp4',
      likesCount: 590,
      isLiked: false,
      commentsCount: 39,
      comments: [
        {
          id: 'c-26',
          user: 'Madam Funke Bridal',
          handle: '@funke_bridals',
          text: 'Taking 30 yards for my sister’s chieftaincy next month. The green is royal!',
          time: '3d',
          avatar:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
          likes: 17,
          isLiked: false,
        },
      ],
      isBookmarked: false,
      sharesCount: 76,
      repostsCount: 26,
      tags: [
        '#EmeraldBrocade',
        '#GoldLurex',
        '#LagosChieftaincy',
        '#TeephaLagos',
      ],
      fabricSpecs: {
        material: 'Metallic Silk & Acetate Heavy Jacquard',
        width: '56 Inches',
        occasion:
          'Royal Coronations, Chieftaincy Celebrations, Milestone Birthdays',
      },
    },
  ];

  // Dynamically populated 72+ feed items by multiplying with unique variations
  readonly feedPosts = signal<FeedPost[]>([]);

  readonly visibleFeedPosts = computed<FeedPost[]>(() => {
    return this.feedPosts().slice(0, this.visibleCount());
  });

  readonly hasMorePosts = computed<boolean>(() => {
    return this.visibleCount() < this.feedPosts().length;
  });

  constructor() {
    this.initFeedData();
  }

  private initFeedData(): void {
    // Generate 72 rich posts by cycling the 24 core items with customized attributes
    const fullList: FeedPost[] = [];
    const repeatCycles = 3;

    for (let c = 0; c < repeatCycles; c++) {
      this.allPosts.forEach((base, idx) => {
        const uniqueId = `${base.id}-c${c}`;
        fullList.push({
          ...base,
          id: uniqueId,
          likesCount: base.likesCount + c * 17 + idx * 3,
          commentsCount: base.commentsCount + c * 5,
          sharesCount: base.sharesCount + c * 8,
          isLiked: c === 0 && idx % 3 === 0,
          isBookmarked: c === 0 && idx % 4 === 0,
        });
      });
    }

    this.feedPosts.set(fullList);
  }

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') return;

    // Observe videos to auto-play when in viewport and reset when out of view
    this.setupVideoObserver();

    // Observe infinite scroll sentinel
    this.setupSentinelObserver();
  }

  private setupVideoObserver(): void {
    if (!('IntersectionObserver' in window)) return;

    this.videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            video.muted = this.isMuted();
            video.play().catch(() => {});
          } else {
            video.pause();
            video.currentTime = 0;
          }
        });
      },
      { threshold: 0.55 },
    );

    this.observeAllVideos();

    this.videoElements.changes.subscribe(() => {
      this.observeAllVideos();
    });
  }

  private observeAllVideos(): void {
    this.videoElements.forEach((el) => {
      if (el?.nativeElement) {
        this.videoObserver?.observe(el.nativeElement);
      }
    });

    this.collectionVideos.forEach((el) => {
      if (el?.nativeElement) {
        this.videoObserver?.observe(el.nativeElement);
      }
    });
  }

  private setupSentinelObserver(): void {
    if (!('IntersectionObserver' in window)) return;

    this.sentinelObserver = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !this.isLoadingMore() &&
          this.hasMorePosts()
        ) {
          this.loadMorePosts();
        }
      },
      { rootMargin: '600px' },
    );

    if (this.infiniteSentinel?.nativeElement) {
      this.sentinelObserver.observe(this.infiniteSentinel.nativeElement);
    }
  }

  async loadMorePosts(): Promise<void> {
    if (this.isLoadingMore() || !this.hasMorePosts()) return;

    this.isLoadingMore.set(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    this.visibleCount.update((c) => c + 15);
    this.isLoadingMore.set(false);

    // Re-observe newly attached video elements
    setTimeout(() => {
      this.observeAllVideos();
    }, 100);
  }

  // Toggle Video Play / Pause on direct tap
  toggleVideoPlay(videoEl: HTMLVideoElement, event: Event): void {
    event.stopPropagation();
    if (videoEl.paused) {
      videoEl.play().catch(() => {});
    } else {
      videoEl.pause();
    }
  }

  // Multi-Content Slide Carousel Actions
  getCarouselIndex(postId: string): number {
    return this.carouselIndexes()[postId] || 0;
  }

  prevSlide(post: FeedPost, event: Event): void {
    event.stopPropagation();
    const curr = this.getCarouselIndex(post.id);
    const next = curr > 0 ? curr - 1 : post.mediaItems.length - 1;
    this.carouselIndexes.update((map) => ({ ...map, [post.id]: next }));
  }

  nextSlide(post: FeedPost, event: Event): void {
    event.stopPropagation();
    const curr = this.getCarouselIndex(post.id);
    const next = curr < post.mediaItems.length - 1 ? curr + 1 : 0;
    this.carouselIndexes.update((map) => ({ ...map, [post.id]: next }));
  }

  setSlide(post: FeedPost, index: number, event: Event): void {
    event.stopPropagation();
    this.carouselIndexes.update((map) => ({ ...map, [post.id]: index }));
  }

  // Audio Toggle
  toggleAudio(event: Event): void {
    event.stopPropagation();
    const nextMuted = !this.isMuted();
    this.isMuted.set(nextMuted);

    this.videoElements.forEach((el) => {
      if (el?.nativeElement) {
        el.nativeElement.muted = nextMuted;
      }
    });
  }

  // Like Toggle with Instant Counter Update
  toggleLike(post: FeedPost): void {
    const updatedLiked = !post.isLiked;
    const updatedCount = updatedLiked
      ? post.likesCount + 1
      : Math.max(0, post.likesCount - 1);

    this.feedPosts.update((list) =>
      list.map((p) =>
        p.id === post.id
          ? { ...p, isLiked: updatedLiked, likesCount: updatedCount }
          : p,
      ),
    );
  }

  // Bookmark Toggle
  toggleBookmark(post: FeedPost): void {
    const updatedBookmarked = !post.isBookmarked;
    this.feedPosts.update((list) =>
      list.map((p) =>
        p.id === post.id ? { ...p, isBookmarked: updatedBookmarked } : p,
      ),
    );
  }

  // Repost Action
  toggleRepost(post: FeedPost): void {
    this.feedPosts.update((list) =>
      list.map((p) =>
        p.id === post.id ? { ...p, repostsCount: p.repostsCount + 1 } : p,
      ),
    );
    this.triggerToast(`Reposted "${post.title}" to your customer feed!`);
  }

  // Caption Toggle (Read More / Less)
  isCaptionExpanded(postId: string): boolean {
    return !!this.expandedCaptions()[postId];
  }

  toggleCaption(postId: string, event: Event): void {
    event.stopPropagation();
    this.expandedCaptions.update((map) => ({
      ...map,
      [postId]: !map[postId],
    }));
  }

  // Classic WhatsApp Inquiry Button
  getWhatsAppInquiryUrl(post: FeedPost): string {
    const message = `Hello Teepha Flowers & Fabrics! I am inquiring about "${post.title}" (₦${post.price.toLocaleString()} / ${post.unit}). Ref: ${post.slug}. Is this available at the Ipaja showroom?`;
    return `https://wa.me/2348120008821?text=${encodeURIComponent(message)}`;
  }

  getShowroomBookingUrl(): string {
    const msg =
      'Hello Teepha Flowers & Fabrics! I would like to book a VIP showroom visit at Shagari Estate, 16 B C St, Ipaja, Lagos.';
    return `https://wa.me/2348120008821?text=${encodeURIComponent(msg)}`;
  }

  getStoryWhatsAppUrl(): string {
    const story = this.activeStory();
    if (!story) return 'https://wa.me/2348120008821';
    const slide = story.slides[this.storySlideIndex()];
    const msg = `Hello Teepha Flowers & Fabrics! I am viewing your Story status for "${slide.title}". Please confirm availability at the showroom.`;
    return `https://wa.me/2348120008821?text=${encodeURIComponent(msg)}`;
  }

  // Quick Add to Bag
  quickAddToBag(post: FeedPost, event: Event): void {
    event.stopPropagation();
    const product = {
      id: post.id,
      slug: post.slug,
      title: post.title,
      brand: post.brandLine,
      category: 'fabrics' as const,
      description: post.caption,
      price: post.price,
      currency: 'NGN' as const,
      unit: (post.unit === 'yard' ? 'yard' : 'piece') as any,
      featuredImage: post.mediaItems[0],
      images: post.mediaItems,
      rating: 4.9,
      reviewCount: post.likesCount,
      stockStatus: 'in_stock' as const,
      stockQty: 50,
      colors: [],
      tags: post.tags,
      aspectRatio: '4:5' as const,
    };
    this.cartStore.addItem(product, 4, 'Signature Exclusive');
    this.triggerToast(`Added 4 ${post.unit}s of ${post.title} to your bag!`);
  }

  // Share Post with Native Web Share / Clipboard
  sharePost(post: FeedPost): void {
    if (typeof window === 'undefined') return;

    const url = `${window.location.origin}/product/${post.slug}`;
    if (navigator.share) {
      navigator
        .share({
          title: post.title,
          text: `Check out ${post.title} at Teepha Flowers & Fabrics (Ipaja, Lagos):`,
          url,
        })
        .catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        this.triggerToast('Product link copied to clipboard!');
      });
    }
  }

  // Instagram Comments Modal Drawer
  openComments(post: FeedPost): void {
    this.activeCommentPost.set(post);
    this.newCommentText = '';
  }

  closeComments(): void {
    this.activeCommentPost.set(null);
  }

  toggleCommentLike(comment: FeedPostComment): void {
    const nextLiked = !comment.isLiked;
    comment.isLiked = nextLiked;
    comment.likes = nextLiked
      ? comment.likes + 1
      : Math.max(0, comment.likes - 1);
  }

  addComment(event: Event): void {
    event.preventDefault();
    const text = this.newCommentText.trim();
    const post = this.activeCommentPost();
    if (!text || !post) return;

    const newComment: FeedPostComment = {
      id: `c-user-${Date.now()}`,
      user: 'You (Bespoke Customer)',
      handle: '@you',
      text,
      time: 'Just now',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      likes: 0,
      isLiked: false,
    };

    post.comments.unshift(newComment);
    post.commentsCount += 1;
    this.newCommentText = '';
  }

  addEmojiReaction(emoji: string): void {
    this.newCommentText += emoji;
  }

  // Status / Story View Modal
  openStory(collection: CollectionStory): void {
    this.activeStory.set(collection);
    this.storySlideIndex.set(0);
    this.isStoryPaused.set(false);
    this.startStoryTimer();
  }

  closeStory(): void {
    this.clearStoryTimer();
    this.activeStory.set(null);
  }

  private startStoryTimer(): void {
    this.clearStoryTimer();
    this.storyTimer = setInterval(() => {
      if (!this.isStoryPaused()) {
        this.nextStorySlide();
      }
    }, 4500);
  }

  private clearStoryTimer(): void {
    if (this.storyTimer) {
      clearInterval(this.storyTimer);
      this.storyTimer = null;
    }
  }

  nextStorySlide(): void {
    const story = this.activeStory();
    if (!story) return;

    const current = this.storySlideIndex();
    if (current < story.slides.length - 1) {
      this.storySlideIndex.set(current + 1);
    } else {
      this.closeStory();
    }
  }

  prevStorySlide(): void {
    const current = this.storySlideIndex();
    if (current > 0) {
      this.storySlideIndex.set(current - 1);
    }
  }

  pauseStory(): void {
    this.isStoryPaused.set(true);
  }

  resumeStory(): void {
    this.isStoryPaused.set(false);
  }

  private triggerToast(msg: string): void {
    this.shareToastMessage.set(msg);
    setTimeout(() => {
      this.shareToastMessage.set(null);
    }, 3000);
  }

  ngOnDestroy(): void {
    this.videoObserver?.disconnect();
    this.sentinelObserver?.disconnect();
    this.clearStoryTimer();
  }
}
