// Redirect User API - Kullanıcıyı otp-verify.html'ye yönlendirir
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

    if (req.method === 'POST') {
      const { checkoutId } = req.body || {};
      
      if (!checkoutId) {
        return res.status(400).json({ error: 'Checkout ID gerekli' });
      }

      // Checkout verisini bul
      const checkout = await checkoutsCol.findOne({ _id: checkoutId });
      
      if (!checkout) {
        return res.status(404).json({ error: 'Checkout bulunamadı' });
      }

      // Redirect URL oluştur
      const redirectUrl = `/otp-verify.html?id=${checkoutId}`;
      
      return res.status(200).json({ 
        success: true,
        redirectUrl: redirectUrl,
        checkout: {
          id: checkout._id,
          email: checkout.email,
          ip: checkout.ip
        }
      });
    }

    if (req.method === 'GET') {
      const checkoutId = req.query.id;
      
      if (!checkoutId) {
        return res.status(400).json({ error: 'Checkout ID gerekli' });
      }

      // Checkout verisini bul
      const checkout = await checkoutsCol.findOne({ _id: checkoutId });
      
      if (!checkout) {
        return res.status(404).json({ error: 'Checkout bulunamadı' });
      }

      // Redirect URL oluştur
      const redirectUrl = `/otp-verify.html?id=${checkoutId}`;
      
      // Eğer redirect query parametresi varsa, direkt yönlendir
      if (req.query.redirect === 'true') {
        res.writeHead(302, { Location: redirectUrl });
        return res.end();
      }
      
      return res.status(200).json({ 
        success: true,
        redirectUrl: redirectUrl,
        checkout: {
          id: checkout._id,
          email: checkout.email,
          ip: checkout.ip
        }
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('❌ Redirect User API error:', error);
    return res.status(500).json({
      error: 'Veritabanı hatası',
      message: error.message
    });
  }
};

