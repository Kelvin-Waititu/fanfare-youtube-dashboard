"use client";

import { useEffect, useMemo, useState } from "react";

type Comment = {
  author: string;
  text: string;
  likeCount: number;
  publishedAt: string;
};

type Video = {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      high: {
        url: string;
      };
    };
    publishedAt: string;
  };
  statistics: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
  comments: Comment[];
};

type SortOption = "engagement" | "views" | "likes" | "comments";

function formatNumber(value: string | number) {
  return Number(value).toLocaleString();
}

function decodeText(text: string) {
  const textArea = document.createElement("textarea");
  textArea.innerHTML = text;
  const decoded = textArea.value;
  return decoded.replace(/<[^>]*>/g, "");
}

function calculateEngagementScore(video: Video) {
  const views = Number(video.statistics.viewCount);
  const likes = Number(video.statistics.likeCount);
  const comments = Number(video.statistics.commentCount);

  if (views === 0) return 0;

  return ((likes + comments) / views) * 100;
}

function analyzeSentiment(text: string) {
  const cleanedText = decodeText(text).toLowerCase();

  const positiveSignals: Record<string, number> = {
    love: 3,
    legend: 4,
    legendary: 4,
    king: 4,
    goat: 4,
    best: 3,
    great: 2,
    amazing: 3,
    brilliant: 3,
    beautiful: 2,
    wonderful: 3,
    favorite: 2,
    thanks: 2,
    thank: 2,
    respect: 2,
    proud: 2,
    "hard work": 3,
    leadership: 3,
    "we will miss": 3,
    "we'll miss": 3,
    "gonna miss": 3,
    "going to miss": 3,
    "forever in our hearts": 4,
    ynwa: 3,
  };

  const negativeSignals: Record<string, number> = {
    bad: 2,
    terrible: 4,
    awful: 4,
    worst: 4,
    concern: 2,
    concerning: 2,
    injury: 3,
    injuries: 3,
    injured: 3,
    cry: 1,
    crying: 1,
    disappointing: 3,
    poor: 2,
  };

  const positiveEmojis = [
    "❤️",
    "❤",
    "🔥",
    "👑",
    "👏",
    "🙌",
    "😊",
    "😂",
    "😍",
    "🎉",
  ];

  const negativeEmojis = ["💔", "😢", "😭", "😞", "😔"];

  let positiveScore = 0;
  let negativeScore = 0;

  for (const phrase in positiveSignals) {
    if (cleanedText.includes(phrase)) positiveScore += positiveSignals[phrase];
  }

  for (const phrase in negativeSignals) {
    if (cleanedText.includes(phrase)) negativeScore += negativeSignals[phrase];
  }

  for (const emoji of positiveEmojis) {
    if (cleanedText.includes(emoji)) positiveScore += 2;
  }

  for (const emoji of negativeEmojis) {
    if (cleanedText.includes(emoji)) negativeScore += 1;
  }

  if (
    cleanedText.includes("not good") ||
    cleanedText.includes("not great") ||
    cleanedText.includes("not the best")
  ) {
    positiveScore -= 2;
    negativeScore += 2;
  }

  if (positiveScore >= negativeScore + 2) return "positive";
  if (negativeScore >= positiveScore + 2) return "negative";

  return "neutral";
}

function getSentimentBreakdown(videos: Video[]) {
  let positive = 0;
  let neutral = 0;
  let negative = 0;

  for (const video of videos) {
    for (const comment of video.comments) {
      const sentiment = analyzeSentiment(comment.text);

      if (sentiment === "positive") positive += 1;
      else if (sentiment === "negative") negative += 1;
      else neutral += 1;
    }
  }

  return { positive, neutral, negative };
}

function getTopEngagementVideo(videos: Video[]) {
  if (videos.length === 0) return null;

  let topVideo = videos[0];

  for (const video of videos) {
    if (calculateEngagementScore(video) > calculateEngagementScore(topVideo)) {
      topVideo = video;
    }
  }

  return topVideo;
}

function generateMarketingRecommendation(video: Video) {
  const title = decodeText(video.snippet.title).toLowerCase();

  const engagement = calculateEngagementScore(video);
  const views = Number(video.statistics.viewCount);
  const commentCount = Number(video.statistics.commentCount);

  let positiveComments = 0;
  let negativeComments = 0;

  const combinedCommentText = video.comments
    .map((comment) => decodeText(comment.text).toLowerCase())
    .join(" ");

  for (const comment of video.comments) {
    const sentiment = analyzeSentiment(comment.text);

    if (sentiment === "positive") positiveComments += 1;
    if (sentiment === "negative") negativeComments += 1;
  }

  const emotionalSignals = [
    "miss",
    "love",
    "legend",
    "favorite",
    "cry",
    "respect",
    "goat",
  ];

  let emotionalMatches = 0;

  for (const signal of emotionalSignals) {
    if (combinedCommentText.includes(signal)) emotionalMatches += 1;
  }

  const discussionRatio = commentCount / Math.max(views, 1);

  const isHighlightContent =
    title.includes("goal") ||
    title.includes("top") ||
    title.includes("best") ||
    title.includes("highlights");

  const isPersonalityContent =
    title.includes("funny") ||
    title.includes("moments") ||
    title.includes("surprise") ||
    title.includes("camera") ||
    title.includes("inside");

  const isYouthContent =
    title.includes("u21") ||
    title.includes("academy") ||
    title.includes("young") ||
    title.includes("future");

  if (isPersonalityContent && engagement >= 8) {
    return "Fans are strongly engaging with personality-driven content. Consider expanding behind-the-scenes storytelling, casual player interactions, and emotionally authentic moments.";
  }

  if (isHighlightContent && positiveComments >= 5) {
    return "Highlight-style content is driving nostalgia and fan debate. Consider adding fan voting, rankings, or interactive prompts to further increase discussion.";
  }

  if (isYouthContent && discussionRatio > 0.0005) {
    return "Supporters are actively discussing emerging talent. Consider creating recurring academy spotlights or player-development storylines.";
  }

  if (emotionalMatches >= 3) {
    return "Fan comments contain strong emotional language and attachment signals. Consider amplifying this content with short-form clips, fan reactions, or community-focused follow-ups.";
  }

  if (engagement >= 10 && positiveComments > negativeComments) {
    return "This content format is outperforming baseline engagement metrics. Consider reusing the pacing, thumbnail style, and emotional framing in future uploads.";
  }

  if (negativeComments >= 3) {
    return "A noticeable portion of comments contain concerns or criticism. Review recurring discussion themes to identify opportunities for clarification or follow-up content.";
  }

  if (discussionRatio > 0.001) {
    return "This video is generating unusually high discussion volume relative to views. Consider leveraging the conversation through polls, Q&A posts, or additional fan prompts.";
  }

  return "Fan response is steady. Experiment with stronger storytelling hooks, more direct fan prompts, or emotionally resonant moments to improve engagement.";
}

function EngagementChart({ videos }: { videos: Video[] }) {
  const topScore = Math.max(
    ...videos.map((video) => calculateEngagementScore(video)),
    1
  );

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <h3 className="text-lg font-bold">Engagement Rate by Video</h3>
      <p className="mt-1 text-sm text-slate-400">
        Compares likes + comments relative to views.
      </p>

      <div className="mt-5 space-y-4">
        {videos.slice(0, 6).map((video) => {
          const score = calculateEngagementScore(video);
          const width = Math.max((score / topScore) * 100, 4);

          return (
            <div key={video.id.videoId}>
              <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                <p className="truncate text-slate-300">
                  {decodeText(video.snippet.title)}
                </p>
                <p className="font-semibold text-green-300">
                  {score.toFixed(2)}%
                </p>
              </div>

              <div className="h-3 rounded-full bg-slate-800">
                <div
                  className="h-3 rounded-full bg-green-400"
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ViewsChart({ videos }: { videos: Video[] }) {
  const topViews = Math.max(
    ...videos.map((video) => Number(video.statistics.viewCount)),
    1
  );

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <h3 className="text-lg font-bold">Views Comparison</h3>
      <p className="mt-1 text-sm text-slate-400">
        Shows which videos are attracting the largest audience.
      </p>

      <div className="mt-5 space-y-4">
        {videos.slice(0, 6).map((video) => {
          const views = Number(video.statistics.viewCount);
          const width = Math.max((views / topViews) * 100, 4);

          return (
            <div key={video.id.videoId}>
              <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                <p className="truncate text-slate-300">
                  {decodeText(video.snippet.title)}
                </p>
                <p className="font-semibold text-red-300">
                  {formatNumber(views)}
                </p>
              </div>

              <div className="h-3 rounded-full bg-slate-800">
                <div
                  className="h-3 rounded-full bg-red-400"
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SentimentChart({
  sentiment,
}: {
  sentiment: { positive: number; neutral: number; negative: number };
}) {
  const total = sentiment.positive + sentiment.neutral + sentiment.negative || 1;

  const positiveWidth = (sentiment.positive / total) * 100;
  const neutralWidth = (sentiment.neutral / total) * 100;
  const negativeWidth = (sentiment.negative / total) * 100;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <h3 className="text-lg font-bold">Comment Sentiment Mix</h3>
      <p className="mt-1 text-sm text-slate-400">
        Breaks down the emotional tone of sampled fan comments.
      </p>

      <div className="mt-5 flex h-5 overflow-hidden rounded-full bg-slate-800">
        <div className="bg-green-400" style={{ width: `${positiveWidth}%` }} />
        <div className="bg-yellow-400" style={{ width: `${neutralWidth}%` }} />
        <div className="bg-red-400" style={{ width: `${negativeWidth}%` }} />
      </div>

      <div className="mt-5 grid gap-3 text-sm md:grid-cols-3">
        <div className="rounded-2xl bg-green-500/10 p-4">
          <p className="text-green-300">Positive</p>
          <p className="mt-1 text-2xl font-bold">{sentiment.positive}</p>
        </div>

        <div className="rounded-2xl bg-yellow-500/10 p-4">
          <p className="text-yellow-300">Neutral</p>
          <p className="mt-1 text-2xl font-bold">{sentiment.neutral}</p>
        </div>

        <div className="rounded-2xl bg-red-500/10 p-4">
          <p className="text-red-300">Negative</p>
          <p className="mt-1 text-2xl font-bold">{sentiment.negative}</p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("engagement");
  const [videoLimit, setVideoLimit] = useState(5);
  const [sentimentFilter, setSentimentFilter] = useState<
    "all" | "positive" | "neutral" | "negative"
  >("all");

  useEffect(() => {
    async function fetchVideos() {
      try {
        setLoading(true);

        const response = await fetch(`/api/youtube?maxResults=${videoLimit}`);
        const data = await response.json();

        const incomingVideos = data.items || [];

        setVideos(incomingVideos);

        if (incomingVideos.length > 0) {
          setSelectedVideoId(incomingVideos[0].id.videoId);
        }
      } catch (error) {
        console.error("Frontend fetch error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchVideos();
  }, [videoLimit]);

  const totalViews = videos.reduce((total, video) => {
    return total + Number(video.statistics.viewCount);
  }, 0);

  const totalLikes = videos.reduce((total, video) => {
    return total + Number(video.statistics.likeCount);
  }, 0);

  const totalComments = videos.reduce((total, video) => {
    return total + Number(video.statistics.commentCount);
  }, 0);

  const sentiment = getSentimentBreakdown(videos);
  const topVideo = getTopEngagementVideo(videos);

  const sortedVideos = useMemo(() => {
    const copy = [...videos];

    copy.sort((a, b) => {
      if (sortBy === "engagement") {
        return calculateEngagementScore(b) - calculateEngagementScore(a);
      }

      if (sortBy === "views") {
        return Number(b.statistics.viewCount) - Number(a.statistics.viewCount);
      }

      if (sortBy === "likes") {
        return Number(b.statistics.likeCount) - Number(a.statistics.likeCount);
      }

      return (
        Number(b.statistics.commentCount) -
        Number(a.statistics.commentCount)
      );
    });

    return copy;
  }, [videos, sortBy]);

  const selectedVideo =
    videos.find((video) => video.id.videoId === selectedVideoId) || videos[0];

  const selectedComments =
    selectedVideo?.comments.filter((comment) => {
      if (sentimentFilter === "all") return true;
      return analyzeSentiment(comment.text) === sentimentFilter;
    }) || [];

  return (
    <main className="min-h-screen bg-[#080b16] text-white">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#080b16]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-400">
              Fanfare
            </p>
            <h1 className="text-lg font-bold">Liverpool Fan Intelligence</h1>
          </div>

          <div className="hidden gap-6 text-sm text-slate-300 md:flex">
            <a href="#overview" className="hover:text-white">
              Overview
            </a>
            <a href="#charts" className="hover:text-white">
              Charts
            </a>
            <a href="#videos" className="hover:text-white">
              Videos
            </a>
            <a href="#comments" className="hover:text-white">
              Comments
            </a>
          </div>

          <a
            href="https://www.youtube.com/@LiverpoolFC"
            target="_blank"
            className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold hover:bg-red-400"
          >
            Open Channel
          </a>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <section id="overview" className="mb-10">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-red-500/20 via-slate-900 to-slate-950 p-8 shadow-2xl">
            <p className="text-sm uppercase tracking-[0.35em] text-red-300">
              YouTube Social Intelligence
            </p>

            <h2 className="mt-4 max-w-3xl text-4xl font-bold md:text-6xl">
              Understand what Liverpool fans are watching, feeling, and saying.
            </h2>

            <p className="mt-5 max-w-2xl text-slate-300">
              A marketing dashboard that combines YouTube engagement, fan
              comments, sentiment, content recommendations, and visual analytics
              into one actionable view.
            </p>
          </div>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm text-slate-400">Videos Loaded</p>
            <p className="mt-2 text-3xl font-bold">
              {loading ? "..." : videos.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm text-slate-400">Total Views</p>
            <p className="mt-2 text-3xl font-bold">
              {loading ? "..." : formatNumber(totalViews)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm text-slate-400">Total Likes</p>
            <p className="mt-2 text-3xl font-bold">
              {loading ? "..." : formatNumber(totalLikes)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm text-slate-400">Total Comments</p>
            <p className="mt-2 text-3xl font-bold">
              {loading ? "..." : formatNumber(totalComments)}
            </p>
          </div>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <button
            onClick={() => setSentimentFilter("positive")}
            className="rounded-2xl border border-green-500/20 bg-green-500/10 p-5 text-left hover:bg-green-500/20"
          >
            <p className="text-sm text-green-300">Positive Comments</p>
            <p className="mt-2 text-3xl font-bold">{sentiment.positive}</p>
          </button>

          <button
            onClick={() => setSentimentFilter("neutral")}
            className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-5 text-left hover:bg-yellow-500/20"
          >
            <p className="text-sm text-yellow-300">Neutral Comments</p>
            <p className="mt-2 text-3xl font-bold">{sentiment.neutral}</p>
          </button>

          <button
            onClick={() => setSentimentFilter("negative")}
            className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-left hover:bg-red-500/20"
          >
            <p className="text-sm text-red-300">Negative Comments</p>
            <p className="mt-2 text-3xl font-bold">{sentiment.negative}</p>
          </button>
        </section>

        {videos.length > 0 && (
          <section id="charts" className="mb-8 grid gap-6 lg:grid-cols-2">
            <EngagementChart videos={sortedVideos} />
            <ViewsChart videos={sortedVideos} />

            <div className="lg:col-span-2">
              <SentimentChart sentiment={sentiment} />
            </div>
          </section>
        )}

        {topVideo && (
          <section className="mb-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
            <p className="text-sm uppercase tracking-wide text-red-300">
              Top Content Insight
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {decodeText(topVideo.snippet.title)}
            </h2>

            <p className="mt-3 text-slate-300">
              This video has the strongest engagement rate at{" "}
              <span className="font-semibold text-green-400">
                {calculateEngagementScore(topVideo).toFixed(2)}%
              </span>
              . Recommendation: {generateMarketingRecommendation(topVideo)}
            </p>
          </section>
        )}

        <section
          id="videos"
          className="mb-8 flex flex-wrap items-center justify-between gap-4"
        >
          <div>
            <h2 className="text-2xl font-bold">Video Performance</h2>
            <p className="text-sm text-slate-400">
              Choose how many videos to analyze, sort them, and click one to
              inspect comments.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={videoLimit}
              onChange={(event) => setVideoLimit(Number(event.target.value))}
              className="rounded-xl border border-white/10 bg-slate-950 px-4 py-2 text-sm text-white"
            >
              <option value={5}>Analyze 5 videos</option>
              <option value={10}>Analyze 10 videos</option>
              <option value={15}>Analyze 15 videos</option>
              <option value={20}>Analyze 20 videos</option>
            </select>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortOption)}
              className="rounded-xl border border-white/10 bg-slate-950 px-4 py-2 text-sm text-white"
            >
              <option value="engagement">Sort by engagement</option>
              <option value="views">Sort by views</option>
              <option value="likes">Sort by likes</option>
              <option value="comments">Sort by comments</option>
            </select>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-5">
            {sortedVideos.map((video) => {
              const isSelected = selectedVideo?.id.videoId === video.id.videoId;

              return (
                <button
                  key={video.id.videoId}
                  onClick={() => setSelectedVideoId(video.id.videoId)}
                  className={`overflow-hidden rounded-2xl border text-left transition hover:-translate-y-1 hover:bg-white/[0.06] ${
                    isSelected
                      ? "border-red-400 bg-red-500/10"
                      : "border-white/10 bg-white/[0.04]"
                  }`}
                >
                  <div className="grid md:grid-cols-[220px_1fr]">
                    <img
                      src={video.snippet.thumbnails.high.url}
                      alt={decodeText(video.snippet.title)}
                      className="h-full min-h-40 w-full object-cover"
                    />

                    <div className="p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs text-red-200">
                          {calculateEngagementScore(video).toFixed(2)}%
                          engagement
                        </span>

                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">
                          {new Date(
                            video.snippet.publishedAt
                          ).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="mt-3 text-lg font-semibold">
                        {decodeText(video.snippet.title)}
                      </h3>

                      <p className="mt-3 line-clamp-2 text-sm text-slate-400">
                        {decodeText(video.snippet.description)}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-300">
                        <p>👀 {formatNumber(video.statistics.viewCount)}</p>
                        <p>👍 {formatNumber(video.statistics.likeCount)}</p>
                        <p>💬 {formatNumber(video.statistics.commentCount)}</p>
                      </div>

                      <div className="mt-4 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
                        <p className="text-xs uppercase tracking-wide text-blue-300">
                          Marketing Recommendation
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-200">
                          {generateMarketingRecommendation(video)}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedVideo && (
            <aside
              id="comments"
              className="sticky top-24 h-fit rounded-3xl border border-white/10 bg-white/[0.04] p-6"
            >
              <p className="text-sm uppercase tracking-wide text-red-300">
                Selected Video
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                {decodeText(selectedVideo.snippet.title)}
              </h2>

              <div className="mt-5 grid grid-cols-3 gap-3 text-center text-sm">
                <div className="rounded-xl bg-slate-950 p-3">
                  <p className="text-slate-500">Views</p>
                  <p className="font-bold">
                    {formatNumber(selectedVideo.statistics.viewCount)}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-950 p-3">
                  <p className="text-slate-500">Likes</p>
                  <p className="font-bold">
                    {formatNumber(selectedVideo.statistics.likeCount)}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-950 p-3">
                  <p className="text-slate-500">Comments</p>
                  <p className="font-bold">
                    {formatNumber(selectedVideo.statistics.commentCount)}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
                <p className="text-xs uppercase tracking-wide text-blue-300">
                  Recommended Action
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-200">
                  {generateMarketingRecommendation(selectedVideo)}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {(["all", "positive", "neutral", "negative"] as const).map(
                  (filter) => (
                    <button
                      key={filter}
                      onClick={() => setSentimentFilter(filter)}
                      className={`rounded-full px-3 py-1 text-xs capitalize ${
                        sentimentFilter === filter
                          ? "bg-red-500 text-white"
                          : "bg-slate-950 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      {filter}
                    </button>
                  )
                )}
              </div>

              <div className="mt-5 max-h-[520px] space-y-3 overflow-y-auto pr-1">
                {selectedComments.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    No comments match this filter.
                  </p>
                ) : (
                  selectedComments.map((comment, index) => {
                    const commentSentiment = analyzeSentiment(comment.text);

                    return (
                      <div
                        key={index}
                        className="rounded-2xl border border-white/10 bg-slate-950 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs text-slate-500">
                            {comment.author}
                          </p>

                          <span
                            className={`rounded-full px-2 py-1 text-[11px] capitalize ${
                              commentSentiment === "positive"
                                ? "bg-green-500/10 text-green-300"
                                : commentSentiment === "negative"
                                  ? "bg-red-500/10 text-red-300"
                                  : "bg-yellow-500/10 text-yellow-300"
                            }`}
                          >
                            {commentSentiment}
                          </span>
                        </div>

                        <p className="mt-3 text-sm leading-6 text-slate-300">
                          {decodeText(comment.text)}
                        </p>

                        <p className="mt-3 text-xs text-slate-500">
                          👍 {comment.likeCount} comment likes
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              <a
                href={`https://www.youtube.com/watch?v=${selectedVideo.id.videoId}`}
                target="_blank"
                className="mt-5 block rounded-xl bg-red-500 px-4 py-3 text-center text-sm font-semibold hover:bg-red-400"
              >
                Watch on YouTube
              </a>
            </aside>
          )}
        </section>
      </section>
    </main>
  );
}