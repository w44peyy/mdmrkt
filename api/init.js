// Initialization endpoint - create collections and indexes if missing
const { connectToDatabase } = require('./lib/mongodb');

module.exports = async (req, res) => {
    // CORS
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

        const existingCollections = await db.listCollections().toArray();
        const existingNames = new Set(existingCollections.map(c => c.name));

        const created = [];
        const ensuredIndexes = [];

        // Ensure 'products' collection
        if (!existingNames.has('products')) {
            await db.createCollection('products');
            created.push('products');
        }
        // Indexes for products
        try {
            const products = db.collection('products');
            await products.createIndex({ createdAt: -1 }, { name: 'createdAt_desc' });
            await products.createIndex({ name: 1 }, { name: 'name_asc' });
            ensuredIndexes.push('products.createdAt_desc', 'products.name_asc');
        } catch (e) {
            // non-fatal
        }

        // Ensure 'visitors' collection (optional)
        if (!existingNames.has('visitors')) {
            await db.createCollection('visitors');
            created.push('visitors');
        }
        try {
            const visitors = db.collection('visitors');
            await visitors.createIndex({ lastVisit: -1 }, { name: 'lastVisit_desc' });
            await visitors.createIndex({ ip: 1 }, { name: 'ip_asc', unique: false });
            ensuredIndexes.push('visitors.lastVisit_desc', 'visitors.ip_asc');
        } catch (e) {
            // non-fatal
        }

        // Ensure 'userSessions' (optional, online users)
        if (!existingNames.has('userSessions')) {
            await db.createCollection('userSessions');
            created.push('userSessions');
        }
        try {
            const userSessions = db.collection('userSessions');
            await userSessions.createIndex({ lastResponseAt: -1 }, { name: 'lastResponseAt_desc' });
            await userSessions.createIndex({ ip: 1 }, { name: 'ip_asc' });
            ensuredIndexes.push('userSessions.lastResponseAt_desc', 'userSessions.ip_asc');
        } catch (e) {
            // non-fatal
        }

        return res.status(200).json({
            success: true,
            createdCollections: created,
            ensuredIndexes
        });
    } catch (error) {
        console.error('❌ init error:', error);
        return res.status(500).json({
            success: false,
            error: 'Initialization failed',
            message: error.message
        });
    }
};

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

