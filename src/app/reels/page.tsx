
import { fetchYouTubeShorts } from '@/lib/youtube';
import ReelsFeed from '@/components/reels/ReelsFeed';

// This is now the Server Component Wrapper
export default async function ReelsPage() {
    // Data is fetched on the server
    const shortsData = await fetchYouTubeShorts();

    // The Client Component is rendered with the fetched data
    return (
       <ReelsFeed shortsData={shortsData} />
    );
}
