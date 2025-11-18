// Heartbeat endpoint - tüm sayfalardan gelen ziyaretçileri takip eder
const { connectToDatabase } = require('./lib/mongodb');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed',
            status: 'error'
        });
    }

    const source = req.query.source || 'unknown';
    const forwarded = req.headers['x-forwarded-for'];
    const realIp = req.headers['x-real-ip'];
    const cfConnectingIp = req.headers['cf-connecting-ip'];
    const ip = cfConnectingIp || (forwarded ? forwarded.split(',')[0].trim() : null) || realIp || req.socket?.remoteAddress || req.connection?.remoteAddress || 'unknown';

    const userAgent = req.headers['user-agent'] || 'unknown';
    const userFingerprint = `${ip}-${userAgent.substring(0, 50)}`;
    const now = new Date();

    console.log('💓 Heartbeat', { source, ip, ua: userAgent.substring(0, 40) });

    try {
        const { db } = await connectToDatabase();

        await db.collection('userSessions').updateOne(
            { ip },
            {
                $set: {
                    userId: ip,
                    userFingerprint,
                    lastSeen: now,
                    userAgent,
                    ip,
                    isOnline: true,
                    lastResponseAt: now,
                    lastSource: source
                },
                $setOnInsert: { createdAt: now },
                $inc: { requestCount: 1 }
            },
            { upsert: true }
        );

        if (ip && ip !== 'unknown' && ip !== '::1' && ip !== '127.0.0.1') {
            try {
                const deviceType = detectDeviceType(userAgent);
                await db.collection('visitors').updateOne(
                    { ip },
                    {
                        $set: {
                            ip,
                            userAgent,
                            deviceType,
                            lastVisit: now,
                            lastSource: source
                        },
                        $setOnInsert: { firstVisit: now },
                        $inc: { visitCount: 1 }
                    },
                    { upsert: true }
                );
            } catch (visitorError) {
                console.error('❌ Visitor log hata:', visitorError);
            }
        }

        try {
            const sevenSecondsAgo = new Date(now.getTime() - 7 * 1000);
            const eightSecondsAgo = new Date(now.getTime() - 8 * 1000);

            const activeFilter = {
                $or: [
                    { lastResponseAt: { $gte: sevenSecondsAgo } },
                    {
                        $and: [
                            { lastResponseAt: { $exists: false } },
                            { lastSeen: { $gte: sevenSecondsAgo } }
                        ]
                    }
                ]
            };

            const activeUsers = await db.collection('userSessions').countDocuments(activeFilter);

            const pruneFilter = {
                $and: [
                    { lastSeen: { $lt: eightSecondsAgo } },
                    {
                        $or: [
                            { lastResponseAt: { $lt: eightSecondsAgo } },
                            { lastResponseAt: { $exists: false } }
                        ]
                    }
                ]
            };

            await db.collection('userSessions').deleteMany(pruneFilter);

            await db.collection('stats').updateOne(
                { _id: 'current' },
                {
                    $set: {
                        activeUsers,
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
        } catch (statsError) {
            console.error('❌ Stats log hata:', statsError);
        }

        return res.status(200).json({
            success: true,
            status: 'ok',
            timestamp: now.toISOString(),
            ip,
            userFingerprint,
            message: 'Heartbeat OK - User online'
        });
    } catch (error) {
        console.error('❌ Heartbeat GET error:', error);
        return res.status(200).json({
            success: false,
            status: 'ok',
            error: error.message,
            message: 'Heartbeat received but error occurred'
        });
    }
};

function detectDeviceType(userAgent) {
    if (!userAgent) return 'Unknown';
    const ua = userAgent.toLowerCase();
    if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) return 'iOS';
    if (ua.includes('android')) return 'Android';
    if (ua.includes('windows')) return 'Windows';
    if (ua.includes('mac')) return 'macOS';
    if (ua.includes('linux')) return 'Linux';
    return 'Unknown';
}
