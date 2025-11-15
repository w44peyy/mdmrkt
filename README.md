# MediaMarkt Admin Panel

Vercel uyumlu MongoDB bağlantılı admin paneli.

## Özellikler

- ✅ Sidebar navigasyon
- ✅ Loglar bölümü (en üstte)
- ✅ Toplam Sepet sayısı
- ✅ Anlık çevrimiçi kullanıcı sayısı
- ✅ Socket.io ile kullanıcı aktivite takibi
- ✅ Satın alanlar listesi (Ad, Soyad, IBAN)

## Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. Environment değişkenlerini ayarlayın (Vercel'de):
- `MONGODB_URI`: MongoDB bağlantı string'i
- `MONGODB_DB`: Veritabanı adı (varsayılan: toki)

Detaylı kurulum için `MONGODB_SETUP.md` dosyasına bakın.

3. Vercel'e deploy edin:
```bash
vercel deploy
```

## Socket.io Server

Socket.io server'ı ayrı bir process olarak çalıştırmanız gerekiyor:

```bash
node server.js
```

Veya ayrı bir Vercel deployment olarak deploy edebilirsiniz.

## MongoDB Collections (Veritabanı: "toki")

Admin paneli şu collection'ları kullanır:

### 1. `purchases` - Satın Alanlar
- `firstName`: Ad
- `lastName`: Soyad
- `iban`: IBAN
- `address`: Adres (opsiyonel - sonra eklenecek)
- `phone`: Telefon numarası (opsiyonel - sonra eklenecek)
- `createdAt`: Oluşturulma tarihi
- `updatedAt`: Güncellenme tarihi

### 2. `carts` - Sepetler
- Toplam sepet sayısını hesaplamak için kullanılır
- `userId`: Kullanıcı ID (opsiyonel)
- `items`: Sepet ürünleri
- `total`: Toplam tutar
- `createdAt`: Oluşturulma tarihi

### 3. `activities` - Kullanıcı Aktiviteleri
- `userId`: Kullanıcı ID
- `message`: Aktivite mesajı
- `type`: Aktivite tipi (örn: "login", "purchase", "cart_add")
- `createdAt`: Oluşturulma tarihi

Detaylı kurulum ve collection yapısı için `MONGODB_SETUP.md` dosyasına bakın.

## API Endpoints

- `GET /api/purchases`: Satın alanlar listesi
- `GET /api/stats`: İstatistikler (toplam sepet, çevrimiçi kullanıcı)
- `GET /api/online-users`: Çevrimiçi kullanıcı sayısı

## Notlar

- Socket.io Vercel serverless functions ile tam uyumlu değildir. Ayrı bir server gerekebilir.
- Alternatif olarak polling mekanizması kullanılabilir.

