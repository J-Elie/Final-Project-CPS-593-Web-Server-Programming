-- PostgreSQL schema

CREATE TYPE user_role AS ENUM ('admin', 'moderator', 'user');

-- Maps to: User
CREATE TABLE users (
    id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name TEXT        NOT NULL,
    last_name  TEXT,
    age        INTEGER,
    gender     TEXT,
    email      TEXT        NOT NULL UNIQUE,
    username   TEXT        NOT NULL UNIQUE,
    image      TEXT,
    height     NUMERIC(5,1),
    weight     NUMERIC(5,1),
    role       user_role   NOT NULL DEFAULT 'user',
    bio        TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Maps to: User.following / User.followers (many-to-many self-join)
CREATE TABLE user_follows (
    follower_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (follower_id, following_id)
);

-- Maps to: Post
CREATE TABLE posts (
    id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id    INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title      TEXT        NOT NULL,
    type       TEXT        NOT NULL,
    date       DATE        NOT NULL,
    duration   TEXT        NOT NULL,
    intensity  TEXT        NOT NULL,
    picture    TEXT,
    notes      TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Maps to: Post.likes (users who liked a post)
CREATE TABLE post_likes (
    post_id    INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, user_id)
);

-- Maps to: Comment
CREATE TABLE comments (
    id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    post_id    INTEGER     NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id    INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content    TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
