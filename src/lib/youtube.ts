
'use server';

import { type Reel } from './reels';

// Kota kullanımı olmadan çeşitli, statik bir video listesi döndüren fonksiyon.
// Bu, hem çeşitli içerik talebini karşılar hem de API kotasının harcanmamasını sağlar.
export async function fetchYouTubeShorts(): Promise<Reel[]> {
  const shortsData: Reel[] = [
    {
      id: 'gSE65A6-8A0',
      videoUrl: 'https://www.youtube.com/shorts/gSE65A6-8A0',
      description: 'GigaChad Theme Phonk',
      author: {
        nickname: 'PHONK',
        avatar: 'https://placehold.co/100x100.png',
      },
    },
    {
      id: 'z4j7nSsgq6U',
      videoUrl: 'https://www.youtube.com/shorts/z4j7nSsgq6U',
      description: 'Roblox Egor Edit #roblox',
      author: {
        nickname: 'EgorBest',
        avatar: 'https://placehold.co/100x100.png',
      },
    },
    {
      id: 'R9f24Dw-52I',
      videoUrl: 'https://www.youtube.com/shorts/R9f24Dw-52I',
      description: 'Roblox Doors Nasıl Oynanır? (Tutorial)',
      author: {
        nickname: 'RobloxTuts',
        avatar: 'https://placehold.co/100x100.png',
      },
    },
    {
      id: '5j265yLd-sQ',
      videoUrl: 'https://www.youtube.com/shorts/5j265yLd-sQ',
      description: 'Another GigaChad Edit',
      author: {
        nickname: 'EditsMaster',
        avatar: 'https://placehold.co/100x100.png',
      },
    },
    {
      id: 'K4p0-I_gK5w',
      videoUrl: 'https://www.youtube.com/shorts/K4p0-I_gK5w',
      description: 'Roblox Obby Pro Gameplay',
      author: {
        nickname: 'ProGamer',
        avatar: 'https://placehold.co/100x100.png',
      },
    },
     {
      id: 'u_29u1Vq00o',
      videoUrl: 'https://www.youtube.com/shorts/u_29u1Vq00o',
      description: 'Egor Roblox Dance Edit',
      author: {
        nickname: 'EgorFan',
        avatar: 'https://placehold.co/100x100.png',
      },
    },
     {
      id: 'k0z343jsYmI',
      videoUrl: 'https://www.youtube.com/shorts/k0z343jsYmI',
      description: 'GigaChad Motivation',
      author: {
        nickname: 'AlphaMindset',
        avatar: 'https://placehold.co/100x100.png',
      },
    },
    {
      id: 'ctQQ8z7nd0k',
      videoUrl: 'https://www.youtube.com/shorts/ctQQ8z7nd0k',
      description: 'Roblox Game Tutorial: Blox Fruits',
      author: {
        nickname: 'BloxMaster',
        avatar: 'https://placehold.co/100x100.png',
      },
    },
     {
      id: 'V-6OLI53t5w',
      videoUrl: 'https://www.youtube.com/shorts/V-6OLI53t5w',
      description: 'Funny Roblox Moments with Egor',
      author: {
        nickname: 'RobloxLOL',
        avatar: 'https://placehold.co/100x100.png',
      },
    },
  ];

  return shortsData;
}
