
export interface StaticReel {
    id: string;
    videoUrl: string;
    author: string;
    description: string;
}

// Sourced from Pexels, which provides free-to-use videos.
// Updated to be more humorous and gaming-oriented per user request.
// ---
// UPDATED: Replaced potentially expired Pexels URLs with stable, standard test video URLs to fix loading issues.
export const staticReels: StaticReel[] = [
    {
        id: 'sample-1',
        videoUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
        author: '@oyun_canavari',
        description: 'Roblox parkur denemem (sonu komik bitti)'
    },
    {
        id: 'sample-2',
        videoUrl: 'https://test-videos.co.uk/vids/elephantsdream/mp4/h264/360/Elephants_Dream_360_10s_1MB.mp4',
        author: '@dans_kraliçesi',
        description: 'Bu yeni dans akımını deneyen var mı? #challenge'
    },
    {
        id: 'sample-3',
        videoUrl: 'https://test-videos.co.uk/vids/jellyfish/mp4/h264/360/Jellyfish_360_10s_1MB.mp4',
        author: '@şakacı_çocuk',
        description: 'Arkadaşıma yaptığım efsane şaka hehe'
    },
    {
        id: 'sample-4',
        videoUrl: 'https://test-videos.co.uk/vids/sintel/mp4/h264/360/Sintel_360_10s_1MB.mp4',
        author: '@gamer_bro',
        description: 'Oyun oynarken ben'
    },
     {
        id: 'sample-5',
        videoUrl: 'https://test-videos.co.uk/vids/surfing/mp4/h264/360/Surfing_360_10s_1MB.mp4',
        author: '@sevimli_dostlar',
        description: 'Bu kedi tam bir komedyen!'
    }
];
