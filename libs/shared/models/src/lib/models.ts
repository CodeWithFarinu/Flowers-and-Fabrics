/**
 * ATELIER Domain Models
 * Domain-Driven Design (DDD) Core Types & Entities
 */

export type ProductCategory = 'fabrics' | 'accessories' | 'sneakers';

export interface ColorSwatch {
  name: string;
  hex: string;
  previewUrl?: string;
}

export interface AiModelView {
  id: string;
  angle: string; // 'front' | 'side' | 'drape_close_up' | 'full_silhouette'
  garment: string; // 'Agbada' | 'Senator' | 'Kaftan' | 'Bespoke Suit'
  skinTone: string;
  imageUrl: string;
  createdAt: string;
}

export interface ProductReview {
  id: string;
  authorName: string;
  rating: number; // 1 to 5
  date: string;
  comment: string;
  verifiedBuyer: boolean;
  city?: string;
  avatarUrl?: string;
  fitFeedback?: string; // e.g. "True to size", "Flows luxuriously"
}

export interface FabricAttribute {
  gsm?: number;
  widthInches?: number;
  materialComposition: string; // e.g. "100% Egyptian Giza Cotton"
  weaveType?: string; // e.g. "Jacquard Brocade", "Voile", "Double Weave"
  occasion?: string; // "Wedding", "Aso-Ebi", "Formal / Executive", "Everyday"
  careInstructions?: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  brand: string;
  category: ProductCategory;
  description: string;
  price: number; // in NGN
  compareAtPrice?: number;
  currency: 'NGN';
  unit: 'yard' | 'piece' | 'pair';
  yardStep?: number; // default 0.5 for fabrics
  minOrderQty?: number; // e.g. 2 or 4 yards for Senator/Agbada
  rating: number;
  reviewCount: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  stockQty: number;
  featuredImage: string;
  images: string[];
  colors: ColorSwatch[];
  sizes?: string[]; // sneakers: EU 40 - 46, US 7 - 12
  attributes?: FabricAttribute;
  aiModelViews?: AiModelView[];
  tags: string[];
  aspectRatio?: '1:1' | '4:5' | '3:4' | '16:9' | '4:3' | '2:3';
  reviews?: ProductReview[];
  isExclusiveDrop?: boolean;
  dropCountdownSeconds?: number;
}

export type FeedItemType =
  | 'product'
  | 'ugc_look'
  | 'editorial_story'
  | 'ai_teaser'
  | 'nearby_trending'
  | 'drop_countdown';

export interface FeedItem {
  id: string;
  type: FeedItemType;
  title: string;
  subtitle?: string;
  imageUrl: string;
  aspectRatio: '1:1' | '4:5' | '3:4' | '16:9' | '4:3' | '2:3';
  product?: Product;
  reasonCode:
    | 'curated_for_you'
    | 'bought_similar_color'
    | 'trending_in_lagos'
    | 'viewed_cashmere'
    | 'exclusive_drop';
  actionUrl?: string;
  badge?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  productTitle: string;
  productSlug: string;
  price: number;
  quantity: number; // can be fractional for yards (e.g. 4.5)
  unit: 'yard' | 'piece' | 'pair';
  selectedColor?: string;
  selectedSize?: string;
  image: string;
  lineTotal: number;
}

export type AccountState = 'LEAD' | 'SHADOW' | 'MEMBER';
export type LoyaltyTier = 'Thread' | 'Stitch' | 'Tailor' | 'Atelier';

export interface UserAddress {
  id: string;
  fullName: string;
  phone: string;
  state: string; // Lagos, Abuja FCT, Rivers, etc.
  lga: string; // Ikeja, Eti-Osa, Surulere, etc.
  streetAddress: string;
  landmark?: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  phone: string; // E.164 e.g. +2348012345678
  name?: string;
  email?: string;
  avatarUrl?: string;
  accountState: AccountState;
  loyaltyTier: LoyaltyTier;
  loyaltyPoints: number;
  aiTokenBalance: number; // new users get 1 free trial
  addresses: UserAddress[];
  role: 'customer' | 'admin' | 'affiliate';
  createdAt: string;
  totalSpend?: number;
  ordersCount?: number;
  vipStatus?: 'Sovereign' | 'Executive' | 'Connoisseur' | 'Member' | 'Lead';
  lastActive?: string;
}

export type DeliverySpeed = 'lagos_same_day' | 'standard_nigeria' | 'pickup';
export type PaymentMethodType =
  'bank_transfer' | 'card' | 'ussd' | 'wallet_points';

export interface DynamicVirtualAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
  expiresInMinutes: number;
  reference: string;
}

export type OrderStatus =
  'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';

export interface TrackingTimelineEvent {
  status: OrderStatus;
  title: string;
  description: string;
  timestamp: string;
  location?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  customerDetails: {
    phone: string;
    name: string;
    email?: string;
  };
  deliveryDetails: {
    address: string;
    state: string;
    lga: string;
    landmark?: string;
    speed: DeliverySpeed;
  };
  paymentMethod: PaymentMethodType;
  paymentStatus: 'paid' | 'pending' | 'failed';
  trackingTimeline: TrackingTimelineEvent[];
  whatsappTrackingUrl: string;
}

export type GarmentType =
  'agbada' | 'senator' | 'kaftan' | 'iro_and_buba' | 'bespoke_suit';

export interface StylePreviewPrompt {
  fabricId: string;
  fabricTitle: string;
  fabricImageUrl: string;
  garmentType: GarmentType;
  fit: 'slim_fit' | 'classic' | 'relaxed';
  skinTone: 'deep_melanin' | 'warm_caramel' | 'chestnut' | 'fair';
  accessoryNotes?: string;
}

export interface AiGenerationResult {
  id: string;
  prompt: StylePreviewPrompt;
  status: 'queued' | 'generating' | 'completed' | 'failed';
  renderedImageUrl: string;
  createdAt: string;
  tokenCost: number;
  tailorLookbookUrl?: string;
}

export interface AffiliateProfile {
  affiliateCode: string;
  userId: string;
  commissionRate: number; // e.g. 0.10 (10%)
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  clicksCount: number;
  conversionsCount: number;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
}

export interface TrackedLink {
  id: string;
  code: string;
  targetProductSlug: string;
  productTitle: string;
  utmSource: string; // e.g. "facebook_ads", "instagram_story", "tiktok"
  utmCampaign: string;
  affiliateCode?: string;
  shortUrl: string;
  clicks: number;
  leadsCaptured: number;
  ordersCompleted: number;
  revenueGenerated: number;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  customerPhone: string;
  customerName: string;
  channel: 'whatsapp' | 'web_chat' | 'email';
  status: 'open' | 'pending_admin' | 'resolved';
  subject: string;
  messages: {
    id: string;
    sender: 'customer' | 'admin' | 'ai';
    content: string;
    timestamp: string;
  }[];
  aiSuggestedReply?: {
    suggestedText: string;
    confidence: number;
    intent: string;
    citedOrderNumber?: string;
  };
  updatedAt: string;
}

export interface AdminDashboardMetrics {
  totalGmv: number;
  gmvGrowth: number;
  totalOrders: number;
  ordersGrowth: number;
  averageOrderValue: number;
  conversionRate: number;
  liveVisitors: number;
  leadsFunnel: {
    totalLeads: number;
    shadowAccounts: number;
    convertedMembers: number;
  };
  channelRevenue: { channel: string; revenue: number; percentage: number }[];
  recentOrders: Order[];
}

export interface PaymentRecord {
  id: string;
  reference: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  gateway:
    | 'paystack'
    | 'flutterwave'
    | 'wema_virtual_account'
    | 'direct_bank_transfer';
  amount: number;
  fee: number;
  netSettlement: number;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  createdAt: string;
  verifiedAt?: string;
}

export interface DeliveryCourier {
  id: string;
  riderName: string;
  riderPhone: string;
  vehicleType: 'motorcycle_express' | 'van_vip' | 'abuja_air_cargo';
  status: 'available' | 'in_transit' | 'off_duty';
  activeDeliveriesCount: number;
  assignedOrders: string[];
  currentLocationZone: string;
  rating: number;
}

export interface CommunityFitSubmission {
  id: string;
  patronName: string;
  patronPhone?: string;
  handle?: string;
  outfitTitle?: string;
  fabricTitle?: string;
  fabricUsed?: string;
  tailorName?: string;
  city: string;
  occasion?: string;
  photoUrl?: string;
  imageUrl?: string;
  railTarget?:
    | 'executive_senator'
    | 'asoebi_bellanaija'
    | 'streetwear_grail'
    | 'sovereign_black_tie'
    | string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  productSlug?: string;
  rewardPointsClaimed?: boolean;
}
