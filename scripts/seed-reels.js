
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
    author: '@komikkediler',
    description: 'Lazerin peşindeki kedi yine dağıttı ortalığı 😂 #kedi #komikvideo',
    thumbnailUrl: 'https://placehold.co/1080x1920/f4b04d/ffffff.png?text=Komik+Kedi',
    videoUrl: 'https://placehold.co/1080x1920/f4b04d/ffffff.png?text=Komik+Kedi',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    data-ai-hint: 'funny cat'
  },
  {
    author: '@mutfaksakarlari',
    description: 'Kek yapmaya çalışırken mutfağı batıran o arkadaşını etiketle 👇 #fail #mutfak',
    thumbnailUrl: 'https://placehold.co/1080x1920/d2638a/ffffff.png?text=Mutfak+Fail',
    videoUrl: 'https://placehold.co/1080x1920/d2638a/ffffff.png?text=Mutfak+Fail',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    data-ai-hint: 'kitchen fail'
  },
  {
    author: '@dansedenbebek',
    description: 'Bu bebek benden daha iyi dans ediyor! 🕺 #bebek #dans',
    thumbnailUrl: 'https://placehold.co/1080x1920/63cdda/ffffff.png?text=Dans+Bebek',
    videoUrl: 'https://placehold.co/1080x1920/63cdda/ffffff.png?text=Dans+Bebek',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    data-ai-hint: 'dancing baby'
  },
  {
    author: '@sokakroportaji',
    description: 'Basit bir soru sorduk, aldığımız cevaplar şok etti! 😱 #röportaj #komik',
    thumbnailUrl: 'https://placehold.co/1080x1920/8a63d2/ffffff.png?text=Röportaj',
    videoUrl: 'https://placehold.co/1080x1920/8a63d2/ffffff.png?text=Röportaj',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    data-ai-hint: 'street interview'
  },
  {
    author: '@yeteneksiz',
    description: 'Evde denemeyin! Bu taklit ne kadar kötü olabilir? #taklit #mizah',
    thumbnailUrl: 'https://placehold.co/1080x1920/6388d2/ffffff.png?text=Yetenek',
    videoUrl: 'https://placehold.co/1080x1920/6388d2/ffffff.png?text=Yetenek',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    data-ai-hint: 'talent show'
  },
   {
    author: '@1saniyelik',
    description: 'Hayatım gözlerimin önünden 1 saniyede geçti... #viral #akım',
    thumbnailUrl: 'https://placehold.co/1080x1920/333333/ffffff.png?text=Viral',
    videoUrl: 'https://placehold.co/1080x1920/333333/ffffff.png?text=Viral',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    data-ai-hint: 'fast motion'
  },
   {
    author: '@papaganpower',
    description: 'Sahibine laf yetiştiren papağan 🦜 #hayvanlar #konuşanpapağan',
    thumbnailUrl: 'https://placehold.co/1080x1920/a0522d/ffffff.png?text=Papağan',
    videoUrl: 'https://placehold.co/1080x1920/a0522d/ffffff.png?text=Papağan',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    data-ai-hint: 'talking parrot'
  },
   {
    author: '@babakomik',
    description: 'Babamın teknolojiyle imtihanı... İzlerken gülme krizine girdim 😂 #baba #teknoloji',
    thumbnailUrl: 'https://placehold.co/1080x1920/ff4500/ffffff.png?text=Baba+Komik',
    videoUrl: 'https://placehold.co/1080x1920/ff4500/ffffff.png?text=Baba+Komik',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    data-ai-hint: 'dad joke'
  }
];

async function seedDatabase() {
  const reelsCollection = db.collection('reels');
  console.log('Veritabanına ekleme başlıyor...');
  const snapshot = await reelsCollection.limit(1).get();
  if (!snapshot.empty) {
      console.log("Veritabanı zaten tohumlanmış gibi görünüyor. Komut dosyası atlanıyor.");
      return;
  }

  for (const reel of reels) {
    await reelsCollection.add(reel);
    console.log(`Eklenen: ${reel.author} - ${reel.description}`);
  }
  console.log('Veritabanına ekleme tamamlandı!');
}

seedDatabase().catch(console.error);
