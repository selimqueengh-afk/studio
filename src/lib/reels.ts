
export interface StaticReel {
    id: string;
    videoUrl: string;
    author: string;
    description: string;
}

// Sourced from various free-to-use video sites.
// Updated to be more humorous and gaming-oriented to match user expectations.
export const staticReels: StaticReel[] = [
    {
        id: 'sample-1',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-in-a-suit-works-on-a-computer-at-the-office-340-large.mp4',
        author: '@oyun_canavari',
        description: 'Roblox parkur denemem (sonu komik bitti)'
    },
    {
        id: 'sample-2',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-a-blouse-making-funny-faces-4299-large.mp4',
        author: '@dans_kraliçesi',
        description: 'Bu yeni dans akımını deneyen var mı? #challenge'
    },
    {
        id: 'sample-3',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-dancing-happy-in-the-forest-4293-large.mp4',
        author: '@şakacı_çocuk',
        description: 'Arkadaşıma yaptığım efsane şaka hehe'
    },
    {
        id: 'sample-4',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-gamers-playing-a-console-game-4296-large.mp4',
        author: '@gamer_bro',
        description: 'Oyun oynarken ben'
    },
     {
        id: 'sample-5',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-very-happy-puppy-in-a-park-232-large.mp4',
        author: '@sevimli_dostlar',
        description: 'Bu köpek tam bir komedyen!'
    }
];
