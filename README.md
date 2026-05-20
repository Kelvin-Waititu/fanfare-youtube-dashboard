````md
# Liverpool Fan Intelligence Dashboard

An interactive YouTube analytics dashboard built using the YouTube Data API v3 to help marketing and social media teams better understand Liverpool FC fan engagement, sentiment, and content performance.

---

# Live Demo

https://fanfare-youtube-dashboard.vercel.app/

---

# Features

- Real-time Liverpool FC YouTube video analytics
- Dynamic video loading (5, 10, 15, or 20 videos)
- Comment sentiment analysis
- Engagement rate calculation
- Interactive charts and visualizations
- Video-level marketing recommendations
- Sort videos by:
  - Engagement
  - Views
  - Likes
  - Comments
- Comment filtering:
  - Positive
  - Neutral
  - Negative
- Direct links to YouTube videos
- Responsive modern dashboard UI

---

# Tech Stack

- Next.js 16
- TypeScript
- Tailwind CSS
- YouTube Data API v3

---

# Product Thinking

This dashboard was designed specifically for sports marketing and social media teams trying to understand:

- Which content formats drive the strongest engagement
- What emotional signals appear in fan discussions
- Which videos generate the most conversation
- What types of content should be amplified or replicated

The recommendation engine uses engagement signals, sentiment analysis, comment themes, and content heuristics to generate actionable marketing insights.

---

# How Sentiment Analysis Works

The application performs lightweight sentiment analysis using:

- Positive/negative keyword scoring
- Emoji detection
- Emotional language detection
- Comment aggregation heuristics

This avoids requiring external paid NLP APIs while still surfacing useful fan sentiment trends.

---

# Architecture

## Frontend

- Next.js App Router
- Interactive dashboard UI
- Dynamic filtering and sorting
- Custom visualizations

## Backend

- Secure server-side API route
- Protected YouTube API key
- YouTube Data API integration
- Comment enrichment pipeline

---

# Running Locally

## 1. Clone the repository

```bash
git clone https://github.com/Kelvin-Waititu/fanfare-youtube-dashboard.git
cd fanfare-youtube-dashboard
```
````

## 2. Install dependencies

```bash
npm install
```

## 3. Create environment variables

Create:

```bash
.env.local
```

Add:

```bash
YOUTUBE_API_KEY=your_youtube_api_key
```

## 4. Start development server

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

---

# Deployment

This project is designed for deployment on Vercel.

Required environment variable:

```bash
YOUTUBE_API_KEY
```

---

# Testing Instructions

1. Open the dashboard
2. Use the dropdown to choose the number of videos to analyze
3. Sort videos using the sorting controls
4. Click any video card to inspect comments and sentiment
5. Use sentiment filters to isolate positive, neutral, or negative comments
6. Review generated marketing recommendations
7. Inspect charts for engagement and audience trends

---

# YouTube API Quota Considerations

The application was intentionally designed to minimize API quota usage.

Optimizations include:

- Fetching videos from a known channel ID
- Avoiding expensive broad search queries
- Lightweight heuristic-based sentiment analysis instead of external APIs

---

# Future Improvements / Roadmap

With additional time, I would extend the platform with:

- Trend detection across upload history
- Topic clustering for fan discussion themes
- AI-generated campaign suggestions
- Cross-platform analytics (TikTok, Instagram, X)
- Historical engagement tracking
- Exportable reports for social teams
- Real NLP classification using transformer models
- Time-series engagement visualizations

---

# Author

Kelvin Waititu

```

```
