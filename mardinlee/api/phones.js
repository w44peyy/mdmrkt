// Phones API - iPhone modelleri (statik seed + listeleme)
const { connectToDatabase } = require('./lib/mongodb');

// Varsayılan iPhone konfigürasyonları (model + kapasite)
const DEFAULT_PHONES = [
  // 17 serisi
  { family: 'iPhone 17 Pro Max', baseName: 'APPLE iPhone 17 Pro Max 5G', storage: '256 GB',  realPrice: 1599, discountedPrice: 1499, rating: 4.9, reviews: 120 },
  { family: 'iPhone 17 Pro Max', baseName: 'APPLE iPhone 17 Pro Max 5G', storage: '512 GB',  realPrice: 1799, discountedPrice: 1699, rating: 4.9, reviews: 120 },
  { family: 'iPhone 17 Pro Max', baseName: 'APPLE iPhone 17 Pro Max 5G', storage: '1 TB',    realPrice: 1999, discountedPrice: 1899, rating: 4.9, reviews: 120 },
  { family: 'iPhone 17 Pro Max', baseName: 'APPLE iPhone 17 Pro Max 5G', storage: '2 TB',    realPrice: 2299, discountedPrice: 2199, rating: 4.9, reviews: 120 },

  { family: 'iPhone 17 Pro',     baseName: 'APPLE iPhone 17 Pro 5G',     storage: '256 GB',  realPrice: 1499, discountedPrice: 1399, rating: 4.8, reviews: 110 },
  { family: 'iPhone 17 Pro',     baseName: 'APPLE iPhone 17 Pro 5G',     storage: '512 GB',  realPrice: 1699, discountedPrice: 1599, rating: 4.8, reviews: 110 },
  { family: 'iPhone 17 Pro',     baseName: 'APPLE iPhone 17 Pro 5G',     storage: '1 TB',    realPrice: 1899, discountedPrice: 1799, rating: 4.8, reviews: 110 },
  { family: 'iPhone 17 Pro',     baseName: 'APPLE iPhone 17 Pro 5G',     storage: '2 TB',    realPrice: 2199, discountedPrice: 2099, rating: 4.8, reviews: 110 },

  { family: 'iPhone 17 Air',     baseName: 'APPLE iPhone 17 Air 5G',     storage: '256 GB',  realPrice: 1299, discountedPrice: 1199, rating: 4.7, reviews: 90 },
  { family: 'iPhone 17 Air',     baseName: 'APPLE iPhone 17 Air 5G',     storage: '512 GB',  realPrice: 1499, discountedPrice: 1399, rating: 4.7, reviews: 90 },
  { family: 'iPhone 17 Air',     baseName: 'APPLE iPhone 17 Air 5G',     storage: '1 TB',    realPrice: 1699, discountedPrice: 1599, rating: 4.7, reviews: 90 },
  { family: 'iPhone 17 Air',     baseName: 'APPLE iPhone 17 Air 5G',     storage: '2 TB',    realPrice: 1899, discountedPrice: 1799, rating: 4.7, reviews: 90 },

  { family: 'iPhone 17',         baseName: 'APPLE iPhone 17 5G',         storage: '256 GB',  realPrice: 1199, discountedPrice: 1099, rating: 4.6, reviews: 80 },
  { family: 'iPhone 17',         baseName: 'APPLE iPhone 17 5G',         storage: '512 GB',  realPrice: 1399, discountedPrice: 1299, rating: 4.6, reviews: 80 },
  { family: 'iPhone 17',         baseName: 'APPLE iPhone 17 5G',         storage: '1 TB',    realPrice: 1599, discountedPrice: 1499, rating: 4.6, reviews: 80 },
  { family: 'iPhone 17',         baseName: 'APPLE iPhone 17 5G',         storage: '2 TB',    realPrice: 1799, discountedPrice: 1699, rating: 4.6, reviews: 80 },

  // 16 serisi
  { family: 'iPhone 16 Pro Max', baseName: 'APPLE iPhone 16 Pro Max 5G', storage: '256 GB',  realPrice: 1499, discountedPrice: 1399, rating: 4.8, reviews: 150 },
  { family: 'iPhone 16 Pro Max', baseName: 'APPLE iPhone 16 Pro Max 5G', storage: '512 GB',  realPrice: 1699, discountedPrice: 1599, rating: 4.8, reviews: 150 },
  { family: 'iPhone 16 Pro Max', baseName: 'APPLE iPhone 16 Pro Max 5G', storage: '1 TB',    realPrice: 1899, discountedPrice: 1799, rating: 4.8, reviews: 150 },
  { family: 'iPhone 16 Pro Max', baseName: 'APPLE iPhone 16 Pro Max 5G', storage: '2 TB',    realPrice: 2099, discountedPrice: 1999, rating: 4.8, reviews: 150 },

  { family: 'iPhone 16 Pro',     baseName: 'APPLE iPhone 16 Pro 5G',     storage: '256 GB',  realPrice: 1399, discountedPrice: 1299, rating: 4.8, reviews: 140 },
  { family: 'iPhone 16 Pro',     baseName: 'APPLE iPhone 16 Pro 5G',     storage: '512 GB',  realPrice: 1599, discountedPrice: 1499, rating: 4.8, reviews: 140 },
  { family: 'iPhone 16 Pro',     baseName: 'APPLE iPhone 16 Pro 5G',     storage: '1 TB',    realPrice: 1799, discountedPrice: 1699, rating: 4.8, reviews: 140 },
  { family: 'iPhone 16 Pro',     baseName: 'APPLE iPhone 16 Pro 5G',     storage: '2 TB',    realPrice: 1999, discountedPrice: 1899, rating: 4.8, reviews: 140 },

  { family: 'iPhone 16',         baseName: 'APPLE iPhone 16 5G',         storage: '256 GB',  realPrice: 1199, discountedPrice: 1099, rating: 4.5, reviews: 100 },
  { family: 'iPhone 16',         baseName: 'APPLE iPhone 16 5G',         storage: '512 GB',  realPrice: 1399, discountedPrice: 1299, rating: 4.5, reviews: 100 },
  { family: 'iPhone 16',         baseName: 'APPLE iPhone 16 5G',         storage: '1 TB',    realPrice: 1599, discountedPrice: 1499, rating: 4.5, reviews: 100 },
  { family: 'iPhone 16',         baseName: 'APPLE iPhone 16 5G',         storage: '2 TB',    realPrice: 1799, discountedPrice: 1699, rating: 4.5, reviews: 100 },

  // 15 serisi
  { family: 'iPhone 15 Pro Max', baseName: 'APPLE iPhone 15 Pro Max 5G', storage: '256 GB',  realPrice: 1399, discountedPrice: 1299, rating: 4.7, reviews: 200 },
  { family: 'iPhone 15 Pro Max', baseName: 'APPLE iPhone 15 Pro Max 5G', storage: '512 GB',  realPrice: 1599, discountedPrice: 1499, rating: 4.7, reviews: 200 },
  { family: 'iPhone 15 Pro Max', baseName: 'APPLE iPhone 15 Pro Max 5G', storage: '1 TB',    realPrice: 1799, discountedPrice: 1699, rating: 4.7, reviews: 200 },
  { family: 'iPhone 15 Pro Max', baseName: 'APPLE iPhone 15 Pro Max 5G', storage: '2 TB',    realPrice: 1999, discountedPrice: 1899, rating: 4.7, reviews: 200 },

  { family: 'iPhone 15 Pro',     baseName: 'APPLE iPhone 15 Pro 5G',     storage: '256 GB',  realPrice: 1299, discountedPrice: 1199, rating: 4.7, reviews: 180 },
  { family: 'iPhone 15 Pro',     baseName: 'APPLE iPhone 15 Pro 5G',     storage: '512 GB',  realPrice: 1499, discountedPrice: 1399, rating: 4.7, reviews: 180 },
  { family: 'iPhone 15 Pro',     baseName: 'APPLE iPhone 15 Pro 5G',     storage: '1 TB',    realPrice: 1699, discountedPrice: 1599, rating: 4.7, reviews: 180 },
  { family: 'iPhone 15 Pro',     baseName: 'APPLE iPhone 15 Pro 5G',     storage: '2 TB',    realPrice: 1899, discountedPrice: 1799, rating: 4.7, reviews: 180 },

  { family: 'iPhone 15',         baseName: 'APPLE iPhone 15 5G',         storage: '256 GB',  realPrice: 999,  discountedPrice: 949,  rating: 4.6, reviews: 220 },
  { family: 'iPhone 15',         baseName: 'APPLE iPhone 15 5G',         storage: '512 GB',  realPrice: 1199, discountedPrice: 1149, rating: 4.6, reviews: 220 },
  { family: 'iPhone 15',         baseName: 'APPLE iPhone 15 5G',         storage: '1 TB',    realPrice: 1399, discountedPrice: 1349, rating: 4.6, reviews: 220 },
  { family: 'iPhone 15',         baseName: 'APPLE iPhone 15 5G',         storage: '2 TB',    realPrice: 1599, discountedPrice: 1549, rating: 4.6, reviews: 220 }
];

function toDoc(phone) {
  const realPrice = phone.realPrice;
  const discountedPrice = phone.discountedPrice;
  const discountPercent = realPrice > 0 ? ((realPrice - discountedPrice) / realPrice) * 100 : 0;

  return {
    name: `${phone.baseName} ${phone.storage}`,
    family: phone.family,
    storage: phone.storage,
    realPrice,
    discountedPrice,
    discountPercent,
    imageUrl: 'https://assets.mmsrg.com/isr/166325/c1/-/ASSET_MMS_161554000/fee_786_587_png', // placeholder
    rating: phone.rating,
    reviews: phone.reviews,
    datasheetEnabled: true,
    energyClass: 'A',
    category: 'phone',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const phonesCol = db.collection('phones');

    // Eğer boşsa varsayılanları seed et
    const count = await phonesCol.countDocuments();
    if (count === 0) {
      const docs = DEFAULT_PHONES.map(toDoc);
      await phonesCol.insertMany(docs);
      console.log('📱 Default iPhone konfigürasyonları phones koleksiyonuna eklendi:', docs.length);
    }

    const phones = await phonesCol
      .find({ isActive: { $ne: false } })
      .sort({ family: 1, realPrice: 1 })
      .toArray();

    return res.status(200).json(phones);
  } catch (error) {
    console.error('❌ Phones API error:', error);
    return res.status(500).json({
      error: 'Veritabanı hatası',
      message: error.message
    });
  }
};


