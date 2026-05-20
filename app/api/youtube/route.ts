const LIVERPOOL_CHANNEL_ID = "UC9LQwHZoucFT94I2h6JOcjw";

async function fetchCommentsForVideo(videoId: string, apiKey: string) {
  try {
    const commentsUrl =
      `https://www.googleapis.com/youtube/v3/commentThreads` +
      `?key=${apiKey}` +
      `&videoId=${videoId}` +
      `&part=snippet` +
      `&maxResults=10` +
      `&order=relevance`;

    const response = await fetch(commentsUrl);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    return (data.items || []).map((item: any) => {
      const comment = item.snippet.topLevelComment.snippet;

      return {
        author: comment.authorDisplayName,
        text: comment.textDisplay,
        likeCount: comment.likeCount,
        publishedAt: comment.publishedAt,
      };
    });
  } catch (error) {
    console.error("Comment fetch error:", error);
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "Missing YouTube API key" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const requestedMaxResults = Number(searchParams.get("maxResults") || 5);
    const maxResults = Math.min(Math.max(requestedMaxResults, 1), 20);

    const searchUrl =
      `https://www.googleapis.com/youtube/v3/search` +
      `?key=${apiKey}` +
      `&channelId=${LIVERPOOL_CHANNEL_ID}` +
      `&part=snippet,id` +
      `&order=date` +
      `&maxResults=${maxResults}`;

    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    const videoIds = searchData.items
      .map((item: any) => item.id.videoId)
      .join(",");

    const statsUrl =
      `https://www.googleapis.com/youtube/v3/videos` +
      `?key=${apiKey}` +
      `&id=${videoIds}` +
      `&part=statistics`;

    const statsResponse = await fetch(statsUrl);
    const statsData = await statsResponse.json();

    const enrichedVideos = await Promise.all(
      searchData.items.map(async (video: any, index: number) => {
        const videoId = video.id.videoId;
        const comments = await fetchCommentsForVideo(videoId, apiKey);

        return {
          ...video,
          statistics: statsData.items[index]?.statistics || {},
          comments,
        };
      })
    );

    return Response.json({
      items: enrichedVideos,
      maxResults,
    });
  } catch (error) {
    console.error("API route error:", error);

    return Response.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}