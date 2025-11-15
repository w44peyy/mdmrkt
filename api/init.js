// MongoDB Collection'larını otomatik oluşturur ve başlangıç verilerini ekler
const { connectToDatabase } = require('./lib/mongodb');

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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
        const now = new Date();
        const collections = [];

        // 1. userSessions collection - Online kullanıcı takibi için
        try {
            const userSessionsExists = await db.listCollections({ name: 'userSessions' }).hasNext();
            if (!userSessionsExists) {
                await db.collection('userSessions').insertOne({
                    _id: 'init',
                    createdAt: now,
                    message: 'userSessions collection initialized'
                });
                await db.collection('userSessions').deleteOne({ _id: 'init' });
                collections.push('userSessions - ✅ Oluşturuldu');
            } else {
                collections.push('userSessions - ✅ Zaten mevcut');
            }
        } catch (error) {
            collections.push('userSessions - ❌ Hata: ' + error.message);
        }

        // 2. carts collection - Sepet takibi için
        try {
            const cartsExists = await db.listCollections({ name: 'carts' }).hasNext();
            if (!cartsExists) {
                await db.collection('carts').insertOne({
                    _id: 'init',
                    createdAt: now,
                    message: 'carts collection initialized'
                });
                await db.collection('carts').deleteOne({ _id: 'init' });
                collections.push('carts - ✅ Oluşturuldu');
            } else {
                collections.push('carts - ✅ Zaten mevcut');
            }
        } catch (error) {
            collections.push('carts - ❌ Hata: ' + error.message);
        }

        // 3. purchases collection - Satın alma kayıtları için
        try {
            const purchasesExists = await db.listCollections({ name: 'purchases' }).hasNext();
            if (!purchasesExists) {
                await db.collection('purchases').insertOne({
                    _id: 'init',
                    createdAt: now,
                    message: 'purchases collection initialized'
                });
                await db.collection('purchases').deleteOne({ _id: 'init' });
                collections.push('purchases - ✅ Oluşturuldu');
            } else {
                collections.push('purchases - ✅ Zaten mevcut');
            }
        } catch (error) {
            collections.push('purchases - ❌ Hata: ' + error.message);
        }

        // 4. activities collection - Aktivite logları için
        try {
            const activitiesExists = await db.listCollections({ name: 'activities' }).hasNext();
            if (!activitiesExists) {
                await db.collection('activities').insertOne({
                    _id: 'init',
                    createdAt: now,
                    message: 'activities collection initialized'
                });
                await db.collection('activities').deleteOne({ _id: 'init' });
                collections.push('activities - ✅ Oluşturuldu');
            } else {
                collections.push('activities - ✅ Zaten mevcut');
            }
        } catch (error) {
            collections.push('activities - ❌ Hata: ' + error.message);
        }

        // 5. stats collection - İstatistikler için (aktif kullanıcı sayısı vs.)
        try {
            const statsExists = await db.listCollections({ name: 'stats' }).hasNext();
            if (!statsExists) {
                await db.collection('stats').insertOne({
                    _id: 'current',
                    activeUsers: 0,
                    totalCarts: 0,
                    totalPurchases: 0,
                    lastUpdated: now,
                    createdAt: now
                });
                collections.push('stats - ✅ Oluşturuldu ve başlangıç verisi eklendi');
            } else {
                // Mevcut stats'i kontrol et
                const currentStats = await db.collection('stats').findOne({ _id: 'current' });
                if (!currentStats) {
                    await db.collection('stats').insertOne({
                        _id: 'current',
                        activeUsers: 0,
                        totalCarts: 0,
                        totalPurchases: 0,
                        lastUpdated: now,
                        createdAt: now
                    });
                    collections.push('stats - ✅ Başlangıç verisi eklendi');
                } else {
                    collections.push('stats - ✅ Zaten mevcut');
                }
            }
        } catch (error) {
            collections.push('stats - ❌ Hata: ' + error.message);
        }

        // Aktif kullanıcı sayısını güncelle
        try {
            const fifteenSecondsAgo = new Date(now.getTime() - 15 * 1000);
            const activeUsers = await db.collection('userSessions').countDocuments({
                $or: [
                    { lastResponseAt: { $gte: fifteenSecondsAgo } },
                    { 
                        $and: [
                            { lastResponseAt: { $exists: false } },
                            { lastSeen: { $gte: fifteenSecondsAgo } }
                        ]
                    }
                ]
            });

            await db.collection('stats').updateOne(
                { _id: 'current' },
                {
                    $set: {
                        activeUsers: activeUsers,
                        lastUpdated: now
                    },
                    $setOnInsert: {
                        totalCarts: 0,
                        totalPurchases: 0,
                        createdAt: now
                    }
                },
                { upsert: true }
            );

            return res.status(200).json({
                success: true,
                message: 'MongoDB collection\'ları oluşturuldu/güncellendi',
                collections: collections,
                currentStats: {
                    activeUsers: activeUsers,
                    timestamp: now.toISOString()
                }
            });
        } catch (error) {
            return res.status(200).json({
                success: true,
                message: 'Collection\'lar oluşturuldu ama stats güncellenemedi',
                collections: collections,
                error: error.message
            });
        }

    } catch (error) {
        console.error('❌ Init error:', error);
        return res.status(500).json({
            success: false,
            error: 'MongoDB bağlantı hatası',
            message: error.message
        });
    }
};

