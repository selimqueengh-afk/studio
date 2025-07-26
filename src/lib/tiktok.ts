
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

// A list of hardcoded TikTok post URLs to fetch.
// This is now just a placeholder.
const TIKTOK_VIDEO_URLS = [
    'https://www.tiktok.com/@google/video/7355135759942405419',
];


// This function now returns a hardcoded list with a single test video.
// All API fetching logic has been removed to ensure stability.
export const fetchTiktokFeed = async (): Promise<Reel[]> => {
    
    const testReel: Reel = {
        id: 'test-video-1',
        // Using a reliable, direct MP4 link for testing purposes.
        videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        description: 'Test Video: https://youtube.com/shorts/ctQQ8z7nd0k?feature=shared',
        author: {
            nickname: 'Test User',
            avatar: 'https://placehold.co/100x100.png',
        },
    };

    return [testReel];
};
