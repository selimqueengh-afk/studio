
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
// This ensures the feature is stable and not dependent on unreliable external APIs.
const staticReels: Reel[] = [
    {
        id: '1',
        description: 'Amazing waterfall view',
        videoUrl: 'https://cdn.coverr.co/videos/coverr-a-beautiful-waterfall-in-slovenia-5469/1080p.mp4',
        author: {
            nickname: 'NatureExplorer',
            avatar: 'https://placehold.co/100x100.png',
        },
    },
    {
        id: '2',
        description: 'Exploring the city streets at night.',
        videoUrl: 'https://cdn.coverr.co/videos/coverr-a-man-walking-on-a-street-at-night-5437/1080p.mp4',
        author: {
            nickname: 'CityVibes',
            avatar: 'https://placehold.co/100x100.png',
        },
    },
    {
        id: '3',
        description: 'Peaceful moments by the lake.',
        videoUrl: 'https://cdn.coverr.co/videos/coverr-a-boat-sailing-on-a-lake-804/1080p.mp4',
        author: {
            nickname: 'LakeLife',
            avatar: 'https://placehold.co/100x100.png',
        },
    },
    {
        id: '4',
        description: 'A beautiful aerial shot of a forest.',
        videoUrl: 'https://cdn.coverr.co/videos/coverr-a-woman-running-through-a-forest-4876/1080p.mp4',
        author: {
            nickname: 'ForestRunner',
            avatar: 'https://placehold.co/100x100.png',
        },
    },
    {
        id: '5',
        description: 'Cozy coffee shop atmosphere.',
        videoUrl: 'https://cdn.coverr.co/videos/coverr-a-cup-of-coffee-on-a-table-362/1080p.mp4',
        author: {
            nickname: 'CoffeeLover',
            avatar: 'https://placehold.co/100x100.png',
        },
    },
];


export const fetchTiktokFeed = async (): Promise<Reel[]> => {
    // We are now returning a static list to ensure stability and avoid API issues.
    return new Promise(resolve => setTimeout(() => resolve(staticReels), 500));
};
