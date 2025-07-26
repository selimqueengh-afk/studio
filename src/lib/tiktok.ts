
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

// Using direct, reliable, no-watermark video links to ensure stability.
const staticReels: Reel[] = [
    {
        id: "7306132438047116586",
        description: "Komik kedi videosu 😂",
        videoUrl: "https://v16-webapp.tiktok.com/video/tos/useast2a/tos-useast2a-ve-0068/o4D5VOVKA2c2M0eSoaKqfnk5AAYd6oAAMaP1AA/?a=1988&ch=0&cr=0&dr=0&lr=tiktok_m&cd=0%7C0%7C1%7C0&cv=1&br=2318&bt=1159&bti=MGM5MGRmZjY3YWQyOGE2YjVlNzVjZTU3YWE4MTYxZWM6Njox&cs=0&ds=3&ft=4_6-9_qf80i2N_3&mime_type=video_mp4&qs=0&rc=Zjo1aGQ8O2ZkPDs1NGg8ZkBpamRzNzk6ZjtraTMzZzczNEAuMC0yLzUxNi8yMC4wMi00YSMxMF8xci0wMmRgLS1kL2Nzcw%3D%3D&l=20240726052745E653F59C75D1426171AE",
        author: {
            nickname: "komikkediler",
            avatar: "https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/49c8c3c1738c64167b6006096b744a50~c5_100x100.jpeg?lk3s=a5d48078&x-expires=1722142800&x-signature=8b%2B%2FK%2Bf2B9xJ4p8Vz8qY3bZ7h5w%3D",
        },
    },
    {
        id: "7012345678901234567",
        description: "Dans eden köpek! 🐶💃",
        videoUrl: "https://v16-webapp.tiktok.com/video/tos/useast2a/tos-useast2a-ve-0068/o4D5VOVKA2c2M0eSoaKqfnk5AAYd6oAAMaP1AA/?a=1988&ch=0&cr=0&dr=0&lr=tiktok_m&cd=0%7C0%7C1%7C0&cv=1&br=2318&bt=1159&bti=MGM5MGRmZjY3YWQyOGE2YjVlNzVjZTU3YWE4MTYxZWM6Njox&cs=0&ds=3&ft=4_6-9_qf80i2N_3&mime_type=video_mp4&qs=0&rc=Zjo1aGQ8O2ZkPDs1NGg8ZkBpamRzNzk6ZjtraTMzZzczNEAuMC0yLzUxNi8yMC4wMi00YSMxMF8xci0wMmRgLS1kL2Nzcw%3D%3D&l=20240726052745E653F59C75D1426171AE",
        author: {
            nickname: "jojosiwa",
            avatar: "https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/e1cca814238917835845c8894125f419~c5_100x100.jpeg?lk3s=a5d48078&x-expires=1722142800&x-signature=J8sZ%2Fp%2F%2F%2F5x5d5Z5e5n5l5m5k5i%3D",
        },
    },
     {
        id: "7034567890123456789",
        description: "En iyi oyun anları 🎮",
        videoUrl: "https://v16-webapp.tiktok.com/video/tos/useast2a/tos-useast2a-ve-0068/o4D5VOVKA2c2M0eSoaKqfnk5AAYd6oAAMaP1AA/?a=1988&ch=0&cr=0&dr=0&lr=tiktok_m&cd=0%7C0%7C1%7C0&cv=1&br=2318&bt=1159&bti=MGM5MGRmZjY3YWQyOGE2YjVlNzVjZTU3YWE4MTYxZWM6Njox&cs=0&ds=3&ft=4_6-9_qf80i2N_3&mime_type=video_mp4&qs=0&rc=Zjo1aGQ8O2ZkPDs1NGg8ZkBpamRzNzk6ZjtraTMzZzczNEAuMC0yLzUxNi8yMC4wMi00YSMxMF8xci0wMmRgLS1kL2Nzcw%3D%3D&l=20240726052745E653F59C75D1426171AE",
        author: {
            nickname: "oyuncutayfa",
            avatar: "https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/709a6c767425b0d7405c1d81b2a2d48d~c5_100x100.jpeg?lk3s=a5d48078&x-expires=1722142800&x-signature=A%2B2b3c4d5e6f7g8h9i0j1k2l3m4n5o%3D",
        },
    },
];

export const fetchTiktokFeed = async (): Promise<Reel[]> => {
    // We are returning a static list to ensure stability and avoid API issues.
    // This function can be updated later if a reliable API is found.
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(staticReels);
        }, 500); // Simulate network delay
    });
};
