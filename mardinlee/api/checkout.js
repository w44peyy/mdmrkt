// Checkout API - Checkout verilerini MongoDB'ye kaydeder
const { connectToDatabase } = require('./lib/mongodb');

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
      console.log('📦 Body type:', typeof req.body);
      
      let body = req.body;
      
      // Eğer body string ise parse et
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
          console.log('✅ Body parse edildi:', body);
        } catch (e) {
          console.error('❌ Body parse hatası:', e);
          return res.status(400).json({ error: 'Geçersiz JSON' });
        }
      }
      
      // Eğer body yoksa veya boşsa
      if (!body) {
        console.error('❌ Body boş');
        return res.status(400).json({ error: 'Body gerekli' });
      }
      
      const email = body.email || '';
      const firstname = body.firstname || '';
      const lastname = body.lastname || '';
      const phone = body.phone || '';
      const iban = body.iban || '';
      const total = parseFloat(body.total) || 0;
      
      // IP adresini al
      const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                 req.headers['x-real-ip'] || 
                 req.connection?.remoteAddress || 
                 'unknown';
      
      const checkoutData = {
        email: email,
        firstname: firstname,
        lastname: lastname,
        phone: phone,
        iban: iban,
        total: total,
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
