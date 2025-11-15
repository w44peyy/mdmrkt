# MongoDB Kurulum ve Yapılandırma

## Environment Variables (Vercel'de)

Vercel dashboard'da Settings > Environment Variables bölümüne gidin ve şu değişkenleri ekleyin:

### 1. MONGODB_URI
```
mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
```

**MongoDB Atlas için:**
- MongoDB Atlas'ta cluster oluşturun
- Database Access'te kullanıcı oluşturun
- Network Access'te IP adresinizi (veya 0.0.0.0/0 için tüm IP'leri) ekleyin
- Cluster'a tıklayın > Connect > Connect your application
- Connection string'i kopyalayın ve username/password'ü değiştirin

**Yerel MongoDB için:**
```
mongodb://localhost:27017
```

### 2. MONGODB_DB
```
toki
```

## Veritabanı: "toki"

### Gerekli Collection'lar

Admin paneli şu collection'ları kullanır:

#### 1. `purchases` - Satın Alanlar
```javascript
{
  _id: ObjectId,
  firstName: String,      // Ad
  lastName: String,       // Soyad
  iban: String,           // IBAN
  address: String,        // Adres (opsiyonel - sonra eklenecek)
  phone: String,          // Telefon numarası (opsiyonel - sonra eklenecek)
  createdAt: Date,        // Oluşturulma tarihi
  updatedAt: Date         // Güncellenme tarihi
}
```

#### 2. `carts` - Sepetler
```javascript
{
  _id: ObjectId,
  userId: String,         // Kullanıcı ID (opsiyonel)
  items: Array,           // Sepet ürünleri
  total: Number,          // Toplam tutar
  createdAt: Date,        // Oluşturulma tarihi
  updatedAt: Date         // Güncellenme tarihi
}
```

#### 3. `activities` - Kullanıcı Aktiviteleri
```javascript
{
  _id: ObjectId,
  userId: String,         // Kullanıcı ID
  message: String,        // Aktivite mesajı
  type: String,           // Aktivite tipi (örn: "login", "purchase", "cart_add")
  createdAt: Date         // Oluşturulma tarihi
}
```

#### 4. `users` - Kullanıcılar (opsiyonel - gelecekte kullanılabilir)
```javascript
{
  _id: ObjectId,
  email: String,
  name: String,
  isOnline: Boolean,
  lastSeen: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## MongoDB'de Collection Oluşturma

### MongoDB Atlas'ta:
1. Cluster'a bağlanın
2. "Browse Collections" tıklayın
3. "Create Database" butonuna tıklayın
4. Database name: `toki`
5. Collection name'i ekleyin: `purchases`, `carts`, `activities`
6. Her collection için "Create" tıklayın

### MongoDB Compass veya MongoDB Shell ile:
```javascript
// MongoDB Shell'de
use toki

// Collection'ları oluştur (ilk doküman eklendiğinde otomatik oluşur)
db.purchases.insertOne({
  firstName: "Test",
  lastName: "User",
  iban: "TR000000000000000000000000",
  createdAt: new Date()
})

db.carts.insertOne({
  userId: "test-user",
  items: [],
  total: 0,
  createdAt: new Date()
})

db.activities.insertOne({
  userId: "test-user",
  message: "Test aktivitesi",
  type: "test",
  createdAt: new Date()
})
```

## Vercel'de Environment Variable Ekleme

1. Vercel Dashboard'a gidin
2. Projenizi seçin
3. Settings > Environment Variables
4. Aşağıdaki değişkenleri ekleyin:
   - **Key:** `MONGODB_URI`
   - **Value:** MongoDB connection string'iniz
   - **Environments:** Production, Preview, Development (hepsini seçin)

   - **Key:** `MONGODB_DB`
   - **Value:** `toki`
   - **Environments:** Production, Preview, Development (hepsini seçin)

5. "Save" butonuna tıklayın
6. Projenizi yeniden deploy edin

## Test Etme

Test için örnek veri ekleme:

```javascript
// purchases collection'ına örnek veri
db.purchases.insertOne({
  firstName: "Ahmet",
  lastName: "Yılmaz",
  iban: "TR330006100519786457841326",
  createdAt: new Date()
})

// carts collection'ına örnek veri
db.carts.insertOne({
  userId: "user123",
  items: [{ productId: "prod1", quantity: 2 }],
  total: 150.50,
  createdAt: new Date()
})

// activities collection'ına örnek veri
db.activities.insertOne({
  userId: "user123",
  message: "Kullanıcı giriş yaptı",
  type: "login",
  createdAt: new Date()
})
```

## Önemli Notlar

- MongoDB URI'deki username ve password'ü gerçek değerlerinizle değiştirmeyi unutmayın
- MongoDB Atlas kullanıyorsanız Network Access ayarlarını kontrol edin
- Environment variable'ları `.env.local` dosyasında local development için saklayabilirsiniz (git'e commit etmeyin!)
- Vercel'de environment variable değişikliklerinden sonra projeyi yeniden deploy edin

