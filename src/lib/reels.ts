
export interface StaticReel {
    id: string;
    videoUrl: string;
    author: string;
    description: string;
}

// Sourced from Pexels, which provides free-to-use videos.
// Updated to be more humorous and gaming-oriented per user request.
export const staticReels: StaticReel[] = [
    {
        id: 'pexels-1',
        videoUrl: 'https://videos.pexels.com/video-files/7578544/7578544-hd.mp4',
        author: '@oyun_canavari',
        description: 'Roblox parkur denemem (sonu komik bitti)'
    },
    {
        id: 'pexels-2',
        videoUrl: 'https://videos.pexels.com/video-files/8024935/8024935-hd.mp4',
        author: '@dans_kraliçesi',
        description: 'Bu yeni dans akımını deneyen var mı? #challenge'
    },
    {
        id: 'pexels-3',
        videoUrl: 'https://videos.pexels.com/video-files/5960076/5960076-hd.mp4',
        author: '@şakacı_çocuk',
        description: 'Arkadaşıma yaptığım efsane şaka hehe'
    },
    {
        id: 'pexels-4',
        videoUrl: 'https://videos.pexels.com/video-files/4783389/4783389-hd.mp4',
        author: '@gamer_bro',
        description: 'Oyun oynarken ben'
    },
     {
        id: 'pexels-5',
        videoUrl: 'https://videos.pexels.com/video-files/6980362/6980362-hd.mp4',
        author: '@sevimli_dostlar',
        description: 'Bu kedi tam bir komedyen!'
    }
];
