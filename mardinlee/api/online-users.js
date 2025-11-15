// Online kullanıcı sayısını MongoDB'den alır (heartbeat mekanizması)
// Son 5 dakika içinde aktivitesi olan kullanıcıları online sayar
const { connectToDatabase } = require('./lib/mongodb');

module.exports = async (req, res) => {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        // Kullanıcı heartbeat gönderiyor (online kalıyor)
        try {
            const { userId, userAgent, browserInfo } = req.body;
            const { db } = await connectToDatabase();
            
            // IP adresini request'ten al (Vercel proxy'leri için)
            const forwarded = req.headers['x-forwarded-for'];
            const realIp = req.headers['x-real-ip'];
            const ip = forwarded ? forwarded.split(',')[0].trim() : (realIp || req.socket?.remoteAddress || 'unknown');
            
            // Browser bilgilerini al
            const browserAgent = userAgent || req.headers['user-agent'] || 'unknown';
            
            // Unique user identifier - IP + Browser fingerprint
            const userFingerprint = userId || `${ip}-${browserAgent.substring(0, 50)}`;
            
            const now = new Date();
            
            // Kullanıcı aktivitesini kaydet/güncelle
            await db.collection('userSessions').updateOne(
                { userFingerprint: userFingerprint },
                {
                    $set: {
                        userId: userId || userFingerprint,
                        userFingerprint: userFingerprint,
                        lastSeen: now,
                        userAgent: browserAgent,
                        browserInfo: browserInfo || {},
                        ip: ip,
                        isOnline: true
                    },
                    $setOnInsert: {
                        createdAt: now,
                        requestCount: 0
                    },
                    $inc: { requestCount: 1 }
                },
                { upsert: true }
            );
            
            return res.status(200).json({ success: true, timestamp: now });
        } catch (error) {
            console.error('Heartbeat error:', error);
            return res.status(500).json({ error: 'Sunucu hatası' });
        }
    }

    if (req.method === 'GET') {
        try {
            const { db } = await connectToDatabase();
            
            const now = new Date();
            // Son 2 dakika içinde aktivitesi olan kullanıcıları online say
            const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
            
            // Son 2 dakika içinde aktivitesi olan kullanıcıları say
            const onlineUsers = await db.collection('userSessions')
                .countDocuments({
                    lastSeen: { $gte: twoMinutesAgo }
                });
            
            // Online kullanıcı detaylarını al (opsiyonel - debug için)
            const onlineUsersDetails = await db.collection('userSessions')
                .find({
                    lastSeen: { $gte: twoMinutesAgo }
                })
                .sort({ lastSeen: -1 })
                .limit(100)
                .toArray();
            
            // Eski kayıtları temizle (10 dakikadan eski)
            const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
            await db.collection('userSessions').deleteMany({
                lastSeen: { $lt: tenMinutesAgo }
            });
            
            return res.status(200).json({ 
                count: onlineUsers,
                users: onlineUsersDetails.map(u => ({
                    ip: u.ip,
                    userAgent: u.userAgent,
                    lastSeen: u.lastSeen,
                    requestCount: u.requestCount || 0
                }))
            });
        } catch (error) {
            console.error('Online users error:', error);
            return res.status(500).json({ error: 'Sunucu hatası', count: 0 });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
};

