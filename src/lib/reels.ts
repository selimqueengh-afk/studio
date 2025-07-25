
export interface StaticReel {
    id: string;
    videoUrl: string;
    author: string;
    description: string;
}

// Sourced from reliable, public test video URLs that are always available.
export const staticReels: StaticReel[] = [
    {
        id: 'sample-1',
        videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        author: '@oyun_canavari',
        description: 'Roblox parkur denemem (sonu komik bitti)'
    },
    {
        id: 'sample-2',
        videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        author: '@dans_kraliçesi',
        description: 'Bu yeni dans akımını deneyen var mı? #challenge'
    },
    {
        id: 'sample-3',
        videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        author: '@şakacı_çocuk',
        description: 'Arkadaşıma yaptığım efsane şaka hehe'
    },
    {
        id: 'sample-4',
        videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        author: '@gamer_bro',
        description: 'Oyun oynarken ben'
    },
     {
        id: 'sample-5',
        videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        author: '@sevimli_dostlar',
        description: 'Bu fil tam bir komedyen!'
    }
];
