
// This is a script to seed the Firestore database with some initial reel data.
// You can run this script from your local machine using Node.js.
// Make sure you have firebase-admin installed (`npm install firebase-admin`)
// and have your service account key file ready.

const admin = require('firebase-admin');

// IMPORTANT: Replace with the path to your service account key file
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const reels = [
  {
    author: '@gezginruh',
    description: 'Norveç fiyortlarında inanılmaz bir gün! 🏔️ #doğa #gezi',
    thumbnailUrl: 'https://placehold.co/1080x1920/63cdda/ffffff.png?text=Fiyort',
    videoUrl: 'https://placehold.co/1080x1920/63cdda/ffffff.png?text=Fiyort',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    author: '@gurmelezzetler',
    description: 'Ev yapımı pizza tarifi. 🍕 #yemek #tarif #pizza',
    thumbnailUrl: 'https://placehold.co/1080x1920/f4b04d/ffffff.png?text=Pizza',
    videoUrl: 'https://placehold.co/1080x1920/f4b04d/ffffff.png?text=Pizza',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    author: '@sanatsokagi',
    description: 'Suluboya ile galaksi çizimi. 🌌 #sanat #çizim',
    thumbnailUrl: 'https://placehold.co/1080x1920/8a63d2/ffffff.png?text=Galaksi',
    videoUrl: 'https://placehold.co/1080x1920/8a63d2/ffffff.png?text=Galaksi',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    author: '@fitgunluk',
    description: 'Sabah sporu rutinim. 💪 #spor #sağlık',
    thumbnailUrl: 'https://placehold.co/1080x1920/d2638a/ffffff.png?text=Spor',
    videoUrl: 'https://placehold.co/1080x1920/d2638a/ffffff.png?text=Spor',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    author: '@komikkediler',
    description: 'Benim kedi yine formunda! 😂 #kedi #komik',
    thumbnailUrl: 'https://placehold.co/1080x1920/6388d2/ffffff.png?text=Kedi',
    videoUrl: 'https://placehold.co/1080x1920/6388d2/ffffff.png?text=Kedi',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
   {
    author: '@yazilimgunlugu',
    description: 'Kod yazarken ben. 💻 #yazılım #kodlama',
    thumbnailUrl: 'https://placehold.co/1080x1920/333333/ffffff.png?text=Kod',
    videoUrl: 'https://placehold.co/1080x1920/333333/ffffff.png?text=Kod',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
   {
    author: '@kitapkurdu',
    description: 'Bu ay okuduğum en iyi kitap. 📚 #kitap #okuma',
    thumbnailUrl: 'https://placehold.co/1080x1920/a0522d/ffffff.png?text=Kitap',
    videoUrl: 'https://placehold.co/1080x1920/a0522d/ffffff.png?text=Kitap',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
   {
    author: '@muzikruhu',
    description: 'Gitar coverım yayında! 🎸 #müzik #gitar',
    thumbnailUrl: 'https://placehold.co/1080x1920/ff4500/ffffff.png?text=Gitar',
    videoUrl: 'https://placehold.co/1080x1920/ff4500/ffffff.png?text=Gitar',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  }
];

async function seedDatabase() {
  const reelsCollection = db.collection('reels');
  console.log('Veritabanına ekleme başlıyor...');
  for (const reel of reels) {
    await reelsCollection.add(reel);
    console.log(`Eklenen: ${reel.author} - ${reel.description}`);
  }
  console.log('Veritabanına ekleme tamamlandı!');
}

seedDatabase().catch(console.error);
