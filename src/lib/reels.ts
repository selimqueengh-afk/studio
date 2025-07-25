
export interface StaticReel {
    id: string;
    videoUrl: string;
    author: string;
    description: string;
}

// Sourced from Pexels, which provides free-to-use videos.
export const staticReels: StaticReel[] = [
    {
        id: 'pexels-1',
        videoUrl: 'https://videos.pexels.com/video-files/853835/853835-hd.mp4',
        author: '@kelly',
        description: 'Doğada huzurlu bir an'
    },
    {
        id: 'pexels-2',
        videoUrl: 'https://videos.pexels.com/video-files/4434246/4434246-hd.mp4',
        author: '@mikhail',
        description: 'Şehrin ışıkları altında gece yolculuğu'
    },
    {
        id: 'pexels-3',
        videoUrl: 'https://videos.pexels.com/video-files/855321/855321-hd.mp4',
        author: '@jill',
        description: 'Okyanusun dinlendirici dalgaları'
    },
    {
        id: 'pexels-4',
        videoUrl: 'https://videos.pexels.com/video-files/4690623/4690623-hd.mp4',
        author: '@peter',
        description: 'Lezzetli bir kahve molası'
    },
     {
        id: 'pexels-5',
        videoUrl: 'https://videos.pexels.com/video-files/3209535/3209535-hd.mp4',
        author: '@lisa',
        description: 'Yemyeşil ormanda bir yürüyüş'
    }
];
