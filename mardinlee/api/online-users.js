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
            // Response gönderildiğinde kullanıcı online sayılır
            const result = await db.collection('userSessions').updateOne(
                { userFingerprint: userFingerprint },
                {
                    $set: {
                        userId: userId || userFingerprint,
                        userFingerprint: userFingerprint,
                        lastSeen: now,
                        userAgent: browserAgent,
                        browserInfo: browserInfo || {},
                        ip: ip,
                        isOnline: true,
                        lastResponseAt: now
                    },
                    $setOnInsert: {
                        createdAt: now
                    },
                    $inc: { requestCount: 1 }
                },
                { upsert: true }
            );
            
            // Response gönder - response gelirse kullanıcı online
            return res.status(200).json({ 
                success: true, 
                timestamp: now,
                userFingerprint: userFingerprint,
                message: 'Heartbeat alındı, kullanıcı online'
            });
        } catch (error) {
            console.error('Heartbeat error:', error);
            return res.status(500).json({ error: 'Sunucu hatası' });
        }
    }

    if (req.method === 'GET') {
        try {
            const { db } = await connectToDatabase();
            
            const now = new Date();
            // Son 15 saniye içinde heartbeat response'u alınan kullanıcıları online say
            // (Her 5 saniyede bir request atıldığı için 15 saniye yeterli - buffer ekliyoruz)
            const fifteenSecondsAgo = new Date(now.getTime() - 15 * 1000);
            
            console.log('👥 Online kullanıcılar kontrol ediliyor - Son 15 saniye:', fifteenSecondsAgo);
            
            // Son 15 saniye içinde response alınan kullanıcıları say - IP bazında unique (1 IP = 1 kullanıcı)
            const onlineUsersQuery = await db.collection('userSessions')
                .find({
                    $or: [
                        { lastResponseAt: { $gte: fifteenSecondsAgo } },
                        { 
                            $and: [
                                { lastResponseAt: { $exists: false } },
                                { lastSeen: { $gte: fifteenSecondsAgo } }
                            ]
                        }
                    ]
                })
                .toArray();
            
            // Unique IP adreslerini say
            const uniqueIPs = new Set(onlineUsersQuery.map(u => u.ip));
            const onlineUsers = uniqueIPs.size;
            
            console.log('✅ Online kullanıcı sayısı:', onlineUsers);
            
            // Online kullanıcı detaylarını al (opsiyonel - debug için)
            const onlineUsersDetails = await db.collection('userSessions')
                .find({
                    $or: [
                        { lastResponseAt: { $gte: fifteenSecondsAgo } },
                        { 
                            $and: [
                                { lastResponseAt: { $exists: false } },
                                { lastSeen: { $gte: fifteenSecondsAgo } }
                            ]
                        }
                    ]
                })
                .sort({ lastResponseAt: -1, lastSeen: -1 })
                .limit(100)
                .toArray();
            
            // Eski kayıtları temizle (20 saniyeden eski - daha agresif temizlik)
            const twentySecondsAgo = new Date(now.getTime() - 20 * 1000);
            const deleteResult = await db.collection('userSessions').deleteMany({
                $and: [
                    { lastSeen: { $lt: twentySecondsAgo } },
                    { lastResponseAt: { $lt: twentySecondsAgo } }
                ]
            });
            
            if (deleteResult.deletedCount > 0) {
                console.log('🗑️ Eski kullanıcı kayıtları temizlendi:', deleteResult.deletedCount);
            }
            
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

