import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log(
    '--- Seeding Teepha Flowers and Fabrics Luxury Catalog & System Data ---',
  );

  // 1. Categories
  const catFabrics = await prisma.category.upsert({
    where: { slug: 'luxury-fabrics' },
    update: {},
    create: {
      name: 'Luxury Fabrics & Textiles',
      slug: 'luxury-fabrics',
      description:
        'Exclusive ceremonial brocades, hand-loomed aso-oke, vibrant Swiss laces, and royal damasks.',
      imageUrl:
        'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
      sortOrder: 1,
    },
  });

  const catFlowers = await prisma.category.upsert({
    where: { slug: 'luxury-flowers' },
    update: {},
    create: {
      name: 'Luxury Flowers & Bridal Bouquets',
      slug: 'luxury-flowers',
      description:
        'Preserved royal orchids, fresh ceremonial wedding bouquets, and bespoke floral installations.',
      imageUrl:
        'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1200&q=80',
      sortOrder: 2,
    },
  });

  const catAccessories = await prisma.category.upsert({
    where: { slug: 'artisan-accessories' },
    update: {},
    create: {
      name: 'Bespoke Accessories & Accents',
      slug: 'artisan-accessories',
      description:
        '24k gold-plated cufflinks, luxury mechanical timepieces, and artisan leather goods.',
      imageUrl:
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80',
      sortOrder: 3,
    },
  });

  // 2. Brands
  const brandTeepha = await prisma.brand.upsert({
    where: { slug: 'teepha-flowers-and-fabrics' },
    update: {},
    create: {
      name: 'Teepha Flowers and Fabrics',
      slug: 'teepha-flowers-and-fabrics',
      description:
        'The definitive Nigerian luxury house for bespoke fabrics, ceremonial textiles, and haute floral styling.',
    },
  });

  const brandCrown = await prisma.brand.upsert({
    where: { slug: 'crown-heritage' },
    update: {},
    create: {
      name: 'Crown Heritage Weavers',
      slug: 'crown-heritage',
      description:
        'Traditional Yoruba woven aso-oke and royal regalia master artisans from Iseyin.',
    },
  });

  const brandMaison = await prisma.brand.upsert({
    where: { slug: 'maison-de-lagos' },
    update: {},
    create: {
      name: 'Maison de Lagos',
      slug: 'maison-de-lagos',
      description:
        'Contemporary African haute couture and luxury ceremonial accents.',
    },
  });

  const brandVeldt = await prisma.brand.upsert({
    where: { slug: 'veldt-and-gold' },
    update: {},
    create: {
      name: 'Veldt & Gold',
      slug: 'veldt-and-gold',
      description:
        'Sovereign horology, precision cufflinks, and precious metal hardware.',
    },
  });

  // 3. Key Patrons (Admin, Customer, Affiliate)
  const adminUser = await prisma.user.upsert({
    where: { phone: '+2348000000001' },
    update: {},
    create: {
      phone: '+2348000000001',
      email: 'admin@teepha.com',
      firstName: 'Guild',
      lastName: 'Director',
      role: 'ADMIN',
      isGuest: false,
      isEmailVerified: true,
      isPhoneVerified: true,
      loyaltyTier: 'BLACK',
      loyaltyPoints: 10000,
      imageGenTokens: 100,
      referralCode: 'TP-ADMIN-01',
    },
  });

  const vipPatron = await prisma.user.upsert({
    where: { phone: '+2348039876543' },
    update: {},
    create: {
      phone: '+2348039876543',
      email: 'patron@teepha.com',
      firstName: 'Boluwatife',
      lastName: 'Farinu',
      role: 'CUSTOMER',
      isGuest: false,
      isEmailVerified: true,
      isPhoneVerified: true,
      loyaltyTier: 'PLATINUM',
      loyaltyPoints: 3450,
      imageGenTokens: 12,
      referralCode: 'TP-BOLU-VIP',
      avatarUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    },
  });

  const affiliatePatron = await prisma.user.upsert({
    where: { phone: '+2348022223333' },
    update: {},
    create: {
      phone: '+2348022223333',
      email: 'affiliate@teepha.com',
      firstName: 'Folake',
      lastName: 'Adeyemi',
      role: 'CUSTOMER',
      isGuest: false,
      isEmailVerified: true,
      isPhoneVerified: true,
      loyaltyTier: 'GOLD',
      loyaltyPoints: 1200,
      imageGenTokens: 5,
      referralCode: 'TP-FOLAKE-AFF',
    },
  });

  // 4. Products Catalog
  const rawProducts = [
    {
      name: 'Emerald & 24K Gold Swiss Voile Imperial Lace',
      slug: 'emerald-gold-swiss-voile-lace',
      description:
        'Authentic St. Gallen grade Swiss voile lace infused with metallic 24K gold threading. Hand-cut scalloped borders tailored for high-society Nigerian weddings and chieftaincy investitures.',
      price: 85000,
      compareAtPrice: 110000,
      productType: 'FABRIC',
      categoryId: catFabrics.id,
      brandId: brandTeepha.id,
      material: '100% Swiss Cotton Voile with 24K Gold Filigree',
      tags: ['lace', 'swiss-voile', 'gold', 'emerald', 'wedding', 'owambe'],
      stockQuantity: 28,
      isFeatured: true,
      trendingScore: 99.4,
      colorVariants: [
        { name: 'Emerald & Gold', hex: '#064E3B' },
        { name: 'Midnight Onyx', hex: '#111827' },
        { name: 'Champagne Royal', hex: '#D97706' },
      ],
      sizeVariants: [
        '4 Yards (Wrapper & Blouse)',
        '5 Yards (Head-Tie Included)',
      ],
      images: [
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80',
      ],
    },
    {
      name: 'Midnight Obsidian Italian Cashmere 160s Wool',
      slug: 'midnight-italian-cashmere-senator',
      description:
        'Super 160s virgin wool milled in Biella, Italy, blended with Mongolian cashmere. Crisp drape, wrinkle recovery, and breathable weave perfected for Lagos tropical humidity.',
      price: 42000,
      compareAtPrice: 55000,
      productType: 'FABRIC',
      categoryId: catFabrics.id,
      brandId: brandTeepha.id,
      material: '90% Super 160s Virgin Wool, 10% Cashmere',
      tags: ['senator', 'cashmere', 'italian', 'suiting', 'executive'],
      stockQuantity: 45,
      isFeatured: true,
      trendingScore: 98.1,
      colorVariants: [
        { name: 'Obsidian Black', hex: '#0B0F19' },
        { name: 'Imperial Navy', hex: '#1E3A8A' },
        { name: 'Charcoal Shadow', hex: '#374151' },
      ],
      sizeVariants: [
        '4 Yards (Full Senator Suit)',
        '5 Yards (Senator Suit + Cap)',
      ],
      images: [
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80',
      ],
    },
    {
      name: 'Heritage Indigo & Silver Hand-Loomed Aso-Oke',
      slug: 'heritage-indigo-silver-aso-oke',
      description:
        'Centuries-old strip-loom weaving tradition from Iseyin master artisans. Pure hand-spun wild silk interwoven with metallic silver threads, perfect for ceremonial caps, geles, and agbadas.',
      price: 135000,
      compareAtPrice: 165000,
      productType: 'FABRIC',
      categoryId: catFabrics.id,
      brandId: brandCrown.id,
      material: 'Hand-Spun Wild Silk & Silver Filigree',
      tags: ['aso-oke', 'indigo', 'traditional', 'wedding', 'royal'],
      stockQuantity: 18,
      isFeatured: true,
      trendingScore: 96.5,
      colorVariants: [
        { name: 'Deep Indigo', hex: '#1E1B4B' },
        { name: 'Crimson Heritage', hex: '#881337' },
        { name: 'Champagne Shimmer', hex: '#F59E0B' },
      ],
      sizeVariants: ['Full 3-Piece Set (Agbada, Fila, Buba)'],
      images: [
        'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=80',
      ],
    },
    {
      name: 'Calfskin Minimalist Low-Top Sneaker in Triple Black',
      slug: 'calfskin-minimalist-low-top-sneaker',
      description:
        'Italian full-grain calfskin leather low-top luxury sneaker. Hand-stitched Margom rubber cupsole, waxed laces, and glove-soft lambskin lining.',
      price: 95000,
      compareAtPrice: 120000,
      productType: 'SNEAKER',
      categoryId: catSneakers.id,
      brandId: brandTeepha.id,
      material: 'Full-Grain Italian Calfskin Leather',
      tags: ['sneakers', 'black', 'calfskin', 'luxury', 'shoes'],
      stockQuantity: 24,
      isFeatured: true,
      trendingScore: 94.2,
      colorVariants: [
        { name: 'Triple Black', hex: '#111827' },
        { name: 'Chalk White', hex: '#F9FAFB' },
      ],
      sizeVariants: ['EU 40', 'EU 41', 'EU 42', 'EU 43', 'EU 44', 'EU 45'],
      images: [
        'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=80',
      ],
    },
    {
      name: 'Sovereign Onyx & 18K Gold Precision Cufflinks',
      slug: 'sovereign-onyx-gold-cufflinks',
      description:
        'Micro-engineered cufflinks crafted specifically to anchor heavy Senator cuffs and layered Agbada sleeves. Natural polished black onyx set in 18k electroplated brass.',
      price: 32000,
      compareAtPrice: 45000,
      productType: 'ACCESSORY',
      categoryId: catAccessories.id,
      brandId: brandVeldt.id,
      material: '18K Gold Electroplate & Natural Onyx Gemstone',
      tags: ['cufflinks', 'gold', 'onyx', 'executive', 'formal'],
      stockQuantity: 50,
      isFeatured: false,
      trendingScore: 89.0,
      colorVariants: [
        { name: 'Gold & Onyx', hex: '#D4AF37' },
        { name: 'Silver & Mother of Pearl', hex: '#E5E7EB' },
      ],
      sizeVariants: ['Standard One-Size'],
      images: [
        'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80',
      ],
    },
    {
      name: 'Botanical Indigo Hand-Drawn Adire Eleko Silk',
      slug: 'botanical-indigo-adire-eleko-silk',
      description:
        'Traditional botanical cassava-starch resist dying technique rendered onto pure fluid silk satin. Each yard is painted by female guild artisans in Abeokuta.',
      price: 68000,
      compareAtPrice: 85000,
      productType: 'FABRIC',
      categoryId: catFabrics.id,
      brandId: brandCrown.id,
      material: '100% Mulberry Silk Satin with Indigo Resist Dye',
      tags: ['adire', 'silk', 'indigo', 'artisan', 'botanical'],
      stockQuantity: 30,
      isFeatured: true,
      trendingScore: 92.4,
      colorVariants: [
        { name: 'Botanical Indigo', hex: '#1E3A8A' },
        { name: 'Sepia Earth', hex: '#78350F' },
      ],
      sizeVariants: ['5 Yards (Full Boubou / Kaftan Cut)'],
      images: [
        'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=1000&q=80',
      ],
    },
    {
      name: 'Monogram Velvet Loafer with Gold Zari Bullion',
      slug: 'monogram-velvet-loafer-gold-bullion',
      description:
        'Silk-velvet smoking loafer adorned with hand-embroidered gold zari bullion crest. Goodyear welted leather sole, quilted satin lining.',
      price: 115000,
      compareAtPrice: 145000,
      productType: 'SNEAKER',
      categoryId: catSneakers.id,
      brandId: brandMaison.id,
      material: 'Italian Cotton-Silk Velvet & Gold Thread',
      tags: ['loafers', 'velvet', 'gold', 'evening', 'shoes'],
      stockQuantity: 15,
      isFeatured: true,
      trendingScore: 95.7,
      colorVariants: [
        { name: 'Royal Burgundy', hex: '#4C0519' },
        { name: 'Midnight Emerald', hex: '#064E3B' },
      ],
      sizeVariants: ['EU 41', 'EU 42', 'EU 43', 'EU 44'],
      images: [
        'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=1000&q=80',
      ],
    },
    {
      name: 'Chieftaincy Heavyweight Hand-Cut Organza Velvet',
      slug: 'chieftaincy-hand-cut-organza-velvet',
      description:
        'Opulent dual-layer organza velvet featuring raised 3D geometric relief. Heavy hand-feel with remarkable drape for ceremonial grand agbadas.',
      price: 125000,
      compareAtPrice: 160000,
      productType: 'FABRIC',
      categoryId: catFabrics.id,
      brandId: brandTeepha.id,
      material: 'Heavyweight Silk-Rayon Organza Velvet',
      tags: ['velvet', 'organza', 'chieftaincy', 'agbada', 'ceremony'],
      stockQuantity: 20,
      isFeatured: true,
      trendingScore: 97.2,
      colorVariants: [
        { name: 'Crown Crimson', hex: '#881337' },
        { name: 'Royal Sapphire', hex: '#1E3A8A' },
      ],
      sizeVariants: ['5 Yards'],
      images: [
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80',
      ],
    },
    {
      name: 'Solid 18K Gold Plated Agbada Chain & Brooch',
      slug: 'solid-18k-gold-agbada-chain-brooch',
      description:
        'Artisan collar jewelry designed to clasp the neck placket of luxury Agbada regalia. Hand-finished filigree with twin security chains.',
      price: 48000,
      compareAtPrice: 65000,
      productType: 'ACCESSORY',
      categoryId: catAccessories.id,
      brandId: brandVeldt.id,
      material: '18K Gold Plated Brass & Zirconia Stones',
      tags: ['brooch', 'agbada', 'gold', 'accessories', 'jewelry'],
      stockQuantity: 40,
      isFeatured: false,
      trendingScore: 87.5,
      colorVariants: [{ name: '18K Polished Gold', hex: '#D4AF37' }],
      sizeVariants: ['Standard Length (18cm twin drape)'],
      images: [
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80',
      ],
    },
  ];

  for (const p of rawProducts) {
    const prod = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        colorVariants: p.colorVariants,
        sizeVariants: p.sizeVariants,
        tags: p.tags,
      },
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        productType: p.productType as any,
        categoryId: p.categoryId,
        brandId: p.brandId,
        material: p.material,
        tags: p.tags,
        stockQuantity: p.stockQuantity,
        isFeatured: p.isFeatured,
        status: 'ACTIVE',
        trendingScore: p.trendingScore,
        colorVariants: p.colorVariants,
        sizeVariants: p.sizeVariants,
        publishedAt: new Date(),
        images: {
          create: p.images.map((url, idx) => ({
            url,
            sortOrder: idx,
            isPrimary: idx === 0,
          })),
        },
      },
    });

    // Add high-signal customer review
    const existingReview = await prisma.review.findFirst({
      where: { productId: prod.id, userId: vipPatron.id },
    });
    if (!existingReview) {
      await prisma.review.create({
        data: {
          productId: prod.id,
          userId: vipPatron.id,
          rating: 5,
          title: 'Unmatched Hand-feel & Craftsmanship',
          body: `Exceeded expectations. The hand-feel and weight are second to none in Lagos. Same-day delivery arrived in under 3 hours to Ikoyi.`,
          isVerified: true,
          isApproved: true,
        },
      });
    }

    console.log(`✓ Product ready: ${prod.name}`);
  }

  // 5. Promotional Coupons
  const coupons = [
    {
      code: 'TEEPHA10',
      description: '10% Welcome Courtesy for Distinguished Patrons',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderAmount: 40000,
      maxDiscount: 25000,
      isActive: true,
    },
    {
      code: 'TEEPHAVIP',
      description: 'Exclusive ₦20,000 Courtesy on Orders over ₦150,000',
      discountType: 'FIXED_AMOUNT',
      discountValue: 20000,
      minOrderAmount: 150000,
      isActive: true,
    },
    {
      code: 'ATELIER10',
      description: 'Legacy 10% Welcome Courtesy',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderAmount: 40000,
      maxDiscount: 25000,
      isActive: true,
    },
    {
      code: 'LAGOSVIP',
      description: 'Exclusive ₦20,000 Courtesy on Orders over ₦150,000',
      discountType: 'FIXED_AMOUNT',
      discountValue: 20000,
      minOrderAmount: 150000,
      isActive: true,
    },
  ];

  for (const c of coupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: {},
      create: c as any,
    });
  }

  // 6. Affiliate Profile & Link
  const affiliateProfile = await prisma.affiliateProfile.upsert({
    where: { userId: affiliatePatron.id },
    update: {},
    create: {
      userId: affiliatePatron.id,
      status: 'APPROVED',
      commissionRate: 10,
      bankName: 'Access Bank Nigeria',
      bankAccount: '0123456789',
      totalEarnings: 85000,
      pendingBalance: 35000,
      paidBalance: 50000,
    },
  });

  await prisma.affiliateLink.upsert({
    where: { code: 'aff_owambe_exclusive' },
    update: {},
    create: {
      affiliateId: affiliateProfile.id,
      code: 'aff_owambe_exclusive',
      targetUrl: '/collection/swiss-lace',
      label: 'Folake Instagram Bio Curated Edit',
      clickCount: 142,
      conversionCount: 8,
    },
  });

  // 7. Seed Sample Completed Order
  const firstProd = await prisma.product.findFirst({
    where: { slug: 'emerald-gold-swiss-voile-lace' },
  });
  if (firstProd) {
    const existingOrder = await prisma.order.findFirst({
      where: { userId: vipPatron.id, status: 'CONFIRMED' },
    });
    if (!existingOrder) {
      const orderNumber = `TP-${Math.floor(100000 + Math.random() * 900000)}`;
      const order = await prisma.order.create({
        data: {
          orderNumber,
          userId: vipPatron.id,
          status: 'CONFIRMED',
          subtotal: 170000,
          discountAmount: 17000,
          deliveryFee: 0,
          total: 153000,
          notes: 'Deliver before 4:00 PM for chieftaincy fitting',
          items: {
            create: [
              {
                productId: firstProd.id,
                quantity: 2,
                color: 'Emerald & Gold',
                size: '4 Yards',
                unitPrice: 85000,
                totalPrice: 170000,
              },
            ],
          },
          payments: {
            create: {
              reference: `PAY-${Date.now()}-mock`,
              amount: 153000,
              currency: 'NGN',
              status: 'SUCCESS',
              gateway: 'paystack',
              paidAt: new Date(),
              gatewayResponse: { channel: 'card', bank: 'Zenith Bank' },
            },
          },
          statusHistory: {
            create: [
              { status: 'PENDING', note: 'Checkout initiated' },
              { status: 'CONFIRMED', note: 'Payment verified via Paystack' },
            ],
          },
        },
      });
      console.log(`✓ Sample Order seeded: #${order.orderNumber}`);
    }
  }

  // 8. Seed Support Ticket
  const existingTicket = await prisma.supportTicket.findFirst({
    where: { userId: vipPatron.id },
  });
  if (!existingTicket) {
    await prisma.supportTicket.create({
      data: {
        userId: vipPatron.id,
        subject: 'Inquiry on Chieftaincy Regalia Fitting & Tailor Match',
        status: 'OPEN',
        messages: {
          create: [
            {
              senderId: vipPatron.id,
              isAdmin: false,
              body: 'Hello Teepha Flowers & Fabrics Concierge, please can you recommend a certified master tailor in Ikoyi for heavy damask agbada construction?',
            },
            {
              senderId: adminUser.id,
              isAdmin: true,
              body: 'Greetings Chief Farinu. We have paired you with Master Tailor Ibrahim at our Victoria Island Flagship. He has been briefed on your fabric specifications.',
            },
          ],
        },
      },
    });
    console.log('✓ Concierge Support ticket seeded');
  }

  console.log('--- Database Seeding Complete! ---');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
