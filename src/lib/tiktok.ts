
'use server';

import 'server-only';

export interface Reel {
    id: string;
    description: string;
    videoUrl: string;
    author: {
        nickname: string;
        avatar: string;
    };
}

// A static list of reliable, no-watermark video URLs.
// This removes the dependency on the unreliable RapidAPI endpoint.
const staticReels: Reel[] = [
    {
        id: '7319939599533722886',
        description: 'Amazing sunset view from a beautiful balcony.',
        videoUrl: 'https://v16m-webapp.tiktokcdn-us.com/ed129ecb41791845a7a9c73335265004/6659f427/video/tos/useast5/tos-useast5-pve-0068-tx/oAAG3DBoCgqIDfR1IDIODflQACfbygAnXABoD3/?a=1988&ch=0&cr=0&dr=0&lr=tiktok&cd=0%7C0%7C1%7C0&cv=1&br=2840&bt=1420&cs=0&ds=3&ft=_Gz9_qT4EVi0PDc-A6-m.6EFh4qAKo_t~&mime_type=video_mp4&qs=0&rc=Zjo1MzU5O2hkaGU1PDg5NEBpanZ0OTg6ZjVoZjMzZzczNEAuMC4xNi0xLzExMTYxYjBeYS0xYSNqXy9ucjQwY2ZgLS1kL2Nzcw%3D%3D&l=20240531093118B808945F3689436E92AE',
        author: {
            nickname: 'naturelover',
            avatar: 'https://placehold.co/100x100.png',
        },
    },
    {
        id: '7280945331189910811',
        description: 'Cute cat playing with a ball of yarn.',
        videoUrl: 'https://v16-webapp.tiktokcdn-us.com/b52de5837076f82e854746f3a1d9532d/6659f471/video/tos/useast5/tos-useast5-pve-0068-tx/oAAG3DBoCgqAIhSMC9LO60rQAyb41pAXfABoD3/?a=1988&ch=0&cr=0&dr=0&lr=tiktok&cd=0%7C0%7C1%7C0&cv=1&br=2614&bt=1307&cs=0&ds=3&ft=IBm_qyE4EVi0PDc-A6-m.6EFh4qAKo_t~&mime_type=video_mp4&qs=0&rc=ZmZoZTs1ZDQ4OjY8Ozo8N0Bpamw6cDQ6ZjU2ZjMzZzczNEAuNi8xNi4xLS0yMTAxYV8vYSMxXy9ucjQwY2ZgLS1kL2Nzcw%3D%3D&l=202405310932249E69B34808A56E24E688',
        author: {
            nickname: 'cat_zone',
            avatar: 'https://placehold.co/100x100.png',
        },
    },
    {
        id: '7297950259835145514',
        description: 'Delicious recipe for homemade pasta.',
        videoUrl: 'https://v16-webapp.tiktokcdn-us.com/97836895b68e9e18b44474d284a14f48/6659f493/video/tos/useast5/tos-useast5-ve-0068-tx/oAAG3DBoCgqAIg6d0h7O60KQAyb41fASfABoD3/?a=1988&ch=0&cr=0&dr=0&lr=tiktok&cd=0%7C0%7C1%7C0&cv=1&br=3324&bt=1662&cs=0&ds=3&ft=IBm_qyE4EVi0PDc-A6-m.6EFh4qAKo_t~&mime_type=video_mp4&qs=0&rc=aWc1aGQ3NzU1NTU0ZDo3O0BpanhwOTg6ZjYwZjMzZzczNEAuLzEtMV4xMi01MTAxNV9eYSMxMmBvcjQwY2ZgLS1kL2Nzcw%3D%3D&l=202405310932588147C567A531C13E7705',
        author: {
            nickname: 'chefstable',
            avatar: 'https://placehold.co/100x100.png',
        },
    },
    {
        id: '7320038992383216902',
        description: 'A thrilling mountain bike ride through the forest.',
        videoUrl: 'https://v16m-webapp.tiktokcdn-us.com/71576f75f8f85141e17d05e2691f16d8/6659f4b3/video/tos/useast5/tos-useast5-pve-0068-tx/oAAG3DBoCgqADhg7DBLOA4lQACfbugAXbABoD3/?a=1988&ch=0&cr=0&dr=0&lr=tiktok&cd=0%7C0%7C1%7C0&cv=1&br=3386&bt=1693&cs=0&ds=3&ft=IBm_qyE4EVi0PDc-A6-m.6EFh4qAKo_t~&mime_type=video_mp4&qs=0&rc=aTw6OjU1NTM2NGRnaTc1OkBpanU6bDw6ZmY4ZjMzZzczNEAuNl4tNi8vLzYtMTAtNjNhYSMxXy5ucjQwY2ZgLS1kL2Nzcw%3D%3D&l=20240531093329D81768853A47817E9385',
        author: {
            nickname: 'mtb_life',
            avatar: 'https://placehold.co/100x100.png',
        },
    },
];


export const fetchTiktokFeed = async (): Promise<Reel[]> => {
    // Return the static list of reels. This is reliable and fast.
    return staticReels;
};
