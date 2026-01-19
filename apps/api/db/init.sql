-- LinkedOut Database Schema

-- Posts table: stores LinkedIn posts that have been voted on
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    urn VARCHAR(100) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Votes table: stores individual votes
CREATE TABLE IF NOT EXISTS votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    vote_type VARCHAR(20) NOT NULL CHECK (vote_type IN ('solid', 'interesting', 'salesman', 'bullshit', 'scam', 'guru', 'theater')),
    voter_id VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, voter_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_urn ON posts(urn);
CREATE INDEX IF NOT EXISTS idx_votes_post_id ON votes(post_id);
CREATE INDEX IF NOT EXISTS idx_votes_vote_type ON votes(vote_type);

-- View for leaderboard (aggregated vote counts per post)
CREATE OR REPLACE VIEW leaderboard AS
SELECT
    p.id,
    p.urn,
    p.content,
    p.created_at,
    COUNT(v.id) AS total_votes,
    COUNT(CASE WHEN v.vote_type = 'bullshit' THEN 1 END) AS bullshit_count,
    COUNT(CASE WHEN v.vote_type = 'solid' THEN 1 END) AS solid_count,
    COUNT(CASE WHEN v.vote_type = 'interesting' THEN 1 END) AS interesting_count,
    COUNT(CASE WHEN v.vote_type = 'salesman' THEN 1 END) AS salesman_count,
    COUNT(CASE WHEN v.vote_type = 'scam' THEN 1 END) AS scam_count,
    COUNT(CASE WHEN v.vote_type = 'guru' THEN 1 END) AS guru_count,
    COUNT(CASE WHEN v.vote_type = 'theater' THEN 1 END) AS theater_count
FROM posts p
LEFT JOIN votes v ON p.id = v.post_id
GROUP BY p.id, p.urn, p.content, p.created_at;
