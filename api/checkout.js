// Checkout API - Checkout verilerini MongoDB'ye kaydeder
const { connectToDatabase } = require('../mardinlee/api/lib/mongodb');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { db } = await connectToDatabase();
    const checkoutsCol = db.collection('checkouts');

    // Checkout verisi kaydetme
    if (req.method === 'POST') {
      console.log('📥 POST isteği geldi');
      console.log('📦 Body:', req.body);
      
      const { email, firstname, lastname, phone, iban, total } = req.body || {};
      
      // IP adresini al
      const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                 req.headers['x-real-ip'] || 
                 req.connection?.remoteAddress || 
                 'unknown';
      
      const checkoutData = {
        email: email || '',
        firstname: firstname || '',
        lastname: lastname || '',
        phone: phone || '',
        iban: iban || '',
        total: parseFloat(total) || 0,
        ip: ip,
        userAgent: req.headers['user-agent'] || '',
        createdAt: new Date()
      };

      console.log('💾 Kaydedilecek veri:', checkoutData);
      
      const result = await checkoutsCol.insertOne(checkoutData);
      console.log('✅ Veri kaydedildi, ID:', result.insertedId);
      
      return res.status(200).json({ 
        success: true,
        message: 'Checkout verisi kaydedildi',
        id: result.insertedId
      });
    }

    // Checkout verilerini getir
    if (req.method === 'GET') {
      const checkouts = await checkoutsCol
        .find({})
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray();

      return res.status(200).json(checkouts);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('❌ Checkout API error:', error);
    console.error('❌ Error stack:', error.stack);
    return res.status(500).json({
      error: 'Veritabanı hatası',
      message: error.message
    });
  }
};

