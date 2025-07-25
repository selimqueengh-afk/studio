
export interface StaticReel {
    id: string;
    videoUrl: string;
    author: string;
    description: string;
}

// Sourced from user-provided TikTok URLs
export const staticReels: StaticReel[] = [
    {
        id: 'tiktok-1',
        videoUrl: 'https://www.tiktok.com/@itsjojosiwa/video/7012345678901234567',
        author: '@itsjojosiwa',
        description: 'JoJo Siwa\'dan en son dans!'
    },
    {
        id: 'tiktok-2',
        videoUrl: 'https://www.tiktok.com/@memequeen/video/7034567890123456789',
        author: '@memequeen',
        description: 'Gülmekten karnınız ağrıyacak'
    },
    {
        id: 'tiktok-3',
        videoUrl: 'https://www.tiktok.com/@sigma_meme/video/7056789012345678901',
        author: '@sigma_meme',
        description: 'Bu akım bir harika dostum'
    },
    {
        id: 'tiktok-4',
        videoUrl: 'https://www.tiktok.com/@darkhumorpage/video/7098765432109876543',
        author: '@darkhumorpage',
        description: 'Buna gülmemelisin'
    },
     {
        id: 'tiktok-5',
        videoUrl: 'https://www.tiktok.com/@robloxmemes/video/7023456789012345678',
        author: '@robloxmemes',
        description: 'En komik Roblox anları'
    }
];
