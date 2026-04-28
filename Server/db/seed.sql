-- ============================================================
-- Seed Data — Fitness App
-- Paste into the Supabase SQL Editor and click Run
-- ============================================================


-- 1. USERS (4 users) ----------------------------------------
INSERT INTO users (id, first_name, last_name, age, gender, email, username, image, height, weight, role, bio)
OVERRIDING SYSTEM VALUE
VALUES
  (1, 'Clove', '', 20, 'non-binary',
   'clove@valorant.protocol.com', 'clove',
   'https://titles.trackercdn.com/valorant-api/agents/1dbf2edd-4729-0984-3115-daa5eed44993/displayicon.png',
   165.0, 54.0, 'admin',
   'Radiant agent and part-time chaos gremlin. I run on spite and post-match adrenaline. Always training, never peaking.'),
  (2, 'Skye', '', 28, 'female',
   'skye@valorant.protocol.com', 'skye',
   'https://i1.sndcdn.com/avatars-GfJ2hSJWEiRKzSeY-UHT4zA-t240x240.jpg',
   172.0, 63.0, 'user',
   'Nature lover, healer, and certified golden retriever energy. Hiking and swimming keep me sane between ops.'),
  (3, 'Sova', 'Markov', 32, 'male',
   'sova@valorant.protocol.com', 'sova',
   'https://fbi.cults3d.com/uploaders/14684840/illustration-file/388d5e1a-7c44-4172-a0c9-0a34c088be8c/sova-avatar.jpg',
   188.0, 85.0, 'admin',
   'Precision is everything. Russian archer, scientist, and reluctant team player. I train so the mission never fails.'),
  (4, 'Jett', 'Han', 24, 'female',
   'jett@valorant.protocol.com', 'jett',
   'https://mmonster.co/media/7e/88/5a/1745860923/Jett-icon-valorant.webp',
   165.5, 52.3, 'user',
   'Wind doesn''t wait and neither do I. Seoul born, sky bound. Sprinting and cycling are basically meditation for me.')
ON CONFLICT DO NOTHING;


-- 2. FOLLOW RELATIONSHIPS ------------------------------------
INSERT INTO user_follows (follower_id, following_id) VALUES
  (1, 2), -- Clove  → Skye
  (2, 1), -- Skye   → Clove
  (2, 4), -- Skye   → Jett
  (3, 1), -- Sova   → Clove
  (4, 1), -- Jett   → Clove
  (4, 2), -- Jett   → Skye
  (4, 3) -- Jett   → Sova
ON CONFLICT DO NOTHING;


-- 3. POSTS (28 posts across all 4 users) --------------------
INSERT INTO posts (id, user_id, title, type, date, duration, intensity, picture, notes, created_at)
OVERRIDING SYSTEM VALUE
VALUES
  -- Clove (user 1) — 14 posts
  (1,  1, 'Morning 5K Run',        'Running',      '2026-03-10', '24',  'Easy',
   'https://npr.brightspotcdn.com/dims4/default/340783b/2147483647/strip/true/crop/2500x1716+0+0/resize/880x604!/quality/90/?url=http%3A%2F%2Fnpr-brightspot.s3.amazonaws.com%2Fbc%2F8c%2F0f8e9a9946708ff4818cec696242%2Frunninglocations-manoosirivelu-2.jpg',
   'New personal best! Felt great the whole way through.', '2026-03-10T14:30:00Z'),

  (6,  1, 'Recovery Walk',         'Walking',      '2026-03-08', '40',  'Easy',
   'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800',
   'Light walk around the neighborhood. Active recovery day.', '2026-03-08T15:00:00Z'),

  (9,  1, 'Pool Laps',             'Swimming',     '2026-03-06', '35',  'Moderate',
   'https://www.mydomaine.com/thmb/iOI4SXteo8mNXrHE-OYibqmIRZc=/1304x0/filters:no_upscale():strip_icc()/indoor-pool-ideas-2-kendall-wilkinson-eclectic-2916877b8a28450a84c53596958355c6.png',
   '20 laps freestyle. Working on my breathing technique.', '2026-03-06T10:00:00Z'),

  (11, 1, 'Sunday Long Run',       'Running',      '2026-03-01', '50',  'Moderate',
   'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800',
   'Easy paced long run. Building base mileage.', '2026-03-01T08:00:00Z'),

  (12, 1, 'Yoga Flow',             'Yoga',         '2026-03-03', '30',  'Easy',
   'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
   'Rest day yoga. Focusing on hip flexors.', '2026-03-03T09:00:00Z'),

  (13, 1, 'Interval Training',     'Running',      '2026-03-05', '35',  'Hard',
   'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800',
   '6x400m repeats. Lungs were burning!', '2026-03-05T07:00:00Z'),

  (14, 1, 'Swim Drills',           'Swimming',     '2026-03-12', '40',  'Easy',
   'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800',
   'Working on flip turns today.', '2026-03-12T07:30:00Z'),

  (15, 1, 'February Long Run',     'Running',      '2026-02-28', '55',  'Moderate',
   'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
   'Chilly morning run. Felt great!', '2026-02-28T07:30:00Z'),

  (17, 1, 'Hill Repeats',          'Running',      '2026-02-23', '40',  'Hard',
   'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800',
   '8 hill repeats. Brutal but effective.', '2026-02-23T07:00:00Z'),

  (20, 1, 'Tempo Run',             'Running',      '2026-02-15', '30',  'Hard',
   'https://images.unsplash.com/photo-1502904550040-7534597429ae?w=800',
   '4 miles at tempo pace. PR pace effort.', '2026-02-15T07:00:00Z'),

  (22, 1, 'Easy 5K',               'Running',      '2026-02-10', '28',  'Easy',
   'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800',
   'Shakeout run. Nice and relaxed.', '2026-02-10T07:30:00Z'),

  (26, 1, 'New Year Run',          'Running',      '2026-01-28', '30',  'Easy',
   'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800',
   '2026 fitness goals - here we go!', '2026-01-28T08:00:00Z'),

  (28, 1, 'Weightlifting Session', 'Weightlifting','2026-01-22', '50',  'Hard',
   'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800',
   'Upper body strength. Bench PR attempt.', '2026-01-22T17:00:00Z'),

  (29, 1, '5K Time Trial',         'Running',      '2026-01-19', '23',  'Hard',
   'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
   'Testing my current fitness. Pleased with the result.', '2026-01-19T07:30:00Z'),

  -- Skye (user 2) — 8 posts
  (2,   2, 'Sunrise Yoga Session',    'Yoga',        '2026-03-10', '30',  'Easy',
   'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
   'Morning stretching routine. My back feels so much better now.', '2026-03-10T12:00:00Z'),

  (7,   2, 'River Trail Bike Ride',   'Cycling',     '2026-03-07', '75',  'Moderate',
   'https://www.visittruckeetahoe.com/sites/default/files/articles/64d3b618a7e64a73294c7cb9_truckee-river-legacy-trail-katey-hamill-blog.jpg',
   '15 miles along the river trail. Perfect weather for outdoor cardio!', '2026-03-07T20:30:00Z'),

  (10,  2, 'Push-up Progress',        'Weightlifting','2026-03-05', '15',  'Moderate',
   'https://flex-web-media-prod.storage.googleapis.com/2024/11/girl-doing-pushup.jpg',
   'Completed 3 sets of 10 full push-ups! Small wins matter.', '2026-03-05T17:45:00Z'),

  (106, 2, 'Morning Beach Run',       'Running',     '2026-03-11', '35',  'Moderate',
   'https://images.unsplash.com/photo-1502904550040-7534597429ae?w=800',
   'Ran along the coast at sunrise. Salt air and sand — twice as hard but twice as beautiful.', '2026-03-11T10:00:00Z'),

  (107, 2, 'Vinyasa Flow Class',      'Yoga',        '2026-03-09', '45',  'Easy',
   'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
   'Full vinyasa sequence with a great instructor. Really opened up my hips today.', '2026-03-09T10:00:00Z'),

  (108, 2, 'Lap Swimming',            'Swimming',    '2026-03-04', '40',  'Moderate',
   'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
   'Back to the pool after a week off. 25 laps felt better than expected.', '2026-03-04T10:00:00Z'),

  (109, 2, 'Saturday Hike',           'Hiking',      '2026-02-28', '120', 'Hard',
   'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
   'Climbed 800m elevation today. Legs were burning but the views from the top were worth every step.', '2026-02-28T10:00:00Z'),

  (110, 2, 'Cycling Power Intervals', 'Cycling',     '2026-02-22', '50',  'Hard',
   'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800',
   '5x5min power intervals. Legs are completely dead. Worth it.', '2026-02-22T10:00:00Z'),

  -- Sova (user 3) — 3 posts
  (3,  3, 'Leg Day - Squats',  'Weightlifting', '2026-03-09', '45', 'Hard',
   'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800',
   '5x5 at 225lbs. Feeling strong! Legs will be sore tomorrow.', '2026-03-09T18:45:00Z'),

  (8,  3, 'Deadlift PR Day',   'Weightlifting', '2026-03-07', '50', 'Hard',
   'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=800',
   'Hit 315lbs x 3 reps! New personal record. Consistency is key.', '2026-03-07T14:00:00Z'),

  (111, 3, 'Morning Archery Cross-Training', 'Other', '2026-03-05', '60', 'Moderate',
   'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800',
   'Steady upper body workout. Precision and focus above everything.', '2026-03-05T07:00:00Z'),

  -- Jett (user 4) — 3 posts
  (4,  4, 'First Unassisted Pull-up!', 'Weightlifting', '2026-03-09', '20', 'Hard',
   'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
   '8 months of training paid off. Finally did it without the band!', '2026-03-09T16:20:00Z'),

  (5,  4, 'Evening HIIT Session',      'Other',         '2026-03-08', '20', 'Hard',
   'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
   'Burned 300 calories. Sweat is just fat crying!', '2026-03-08T22:10:00Z'),

  (112, 4, 'Sprint Drills',            'Running',       '2026-03-06', '25', 'Hard',
   'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800',
   '10x60m sprints. Fast twitch fibers only. This is my element.', '2026-03-06T16:00:00Z'),

  -- *** THIS WEEK (April 21-27, 2026) — 2 posts per user ***

  -- Clove (user 1) — this week
  (200, 1, 'Monday Morning 5K',        'Running',       '2026-04-27', '25', 'Easy',
   'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800',
   'Starting the week with a solid easy run. Legs feel fresh.', '2026-04-27T07:00:00Z'),
  (201, 1, 'Wednesday Swim',           'Swimming',      '2026-04-23', '40', 'Moderate',
   'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800',
   '30 laps steady pace. Really dialed in my flip turns today.', '2026-04-23T07:30:00Z'),

  -- Skye (user 2) — this week + 2 more to reach 10 total
  (202, 2, 'Sunday Trail Run',         'Running',       '2026-04-27', '45', 'Moderate',
   'https://images.unsplash.com/photo-1502904550040-7534597429ae?w=800',
   'Gorgeous morning on the coastal trail. Everything hurts in the best way.', '2026-04-27T08:00:00Z'),
  (203, 2, 'Thursday Yoga Flow',       'Yoga',          '2026-04-24', '45', 'Easy',
   'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
   'Full body stretch and breathwork session. Exactly what I needed mid-week.', '2026-04-24T09:00:00Z'),
  (204, 2, 'Forest Hike',             'Hiking',        '2026-02-14', '90', 'Moderate',
   'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
   'Valentine''s Day solo hike. Treated myself to a long one.', '2026-02-14T10:00:00Z'),
  (205, 2, 'Open Water Swim',         'Swimming',      '2026-01-25', '35', 'Hard',
   'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
   'Cold water and wild energy. My best open water time yet.', '2026-01-25T10:00:00Z'),

  -- Sova (user 3) — this week + 7 more to reach 10 total
  (206, 3, 'Sunday Upper Body Grind',  'Weightlifting', '2026-04-27', '55', 'Hard',
   'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800',
   'Bench, OHP, rows. Hit 4x8 at 185 on bench. Progress is steady.', '2026-04-27T09:00:00Z'),
  (207, 3, 'Wednesday Squat Session',  'Weightlifting', '2026-04-23', '50', 'Hard',
   'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800',
   '5x5 at 235lbs. PR attempt next week. Feeling solid.', '2026-04-23T18:00:00Z'),
  (208, 3, 'Push Day',                 'Weightlifting', '2026-03-20', '50', 'Hard',
   'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
   'Chest and shoulders. 4x10 bench at 175. Pump was real.', '2026-03-20T17:00:00Z'),
  (209, 3, 'Pull Day',                 'Weightlifting', '2026-03-14', '45', 'Moderate',
   'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=800',
   'Weighted pull-ups, barbell rows. Back is responding well.', '2026-03-14T17:00:00Z'),
  (210, 3, 'Bench Press Focus',        'Weightlifting', '2026-03-01', '40', 'Hard',
   'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
   '4x6 at 205. Getting closer to that 225 mark.', '2026-03-01T17:00:00Z'),
  (211, 3, 'Archery Cross-Training',   'Other',         '2026-02-20', '60', 'Moderate',
   'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800',
   'Precision focus session. 200 arrows at 40m. No misses.', '2026-02-20T07:00:00Z'),
  (212, 3, 'Heavy Leg Day',            'Weightlifting', '2026-02-12', '55', 'Hard',
   'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800',
   'Squats, lunges, leg press. Walking is optional tomorrow.', '2026-02-12T18:00:00Z'),
  (213, 3, 'HIIT Circuit',             'Other',         '2026-02-05', '30', 'Hard',
   'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
   '5 rounds of 6 exercises. Heart rate stayed above 160 the whole time.', '2026-02-05T07:00:00Z'),
  (214, 3, 'Morning Run',              'Running',       '2026-01-25', '30', 'Easy',
   'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
   'Easy recovery run between lift sessions. Needed the fresh air.', '2026-01-25T07:00:00Z'),

  -- Jett (user 4) — this week + 7 more to reach 10 total
  (215, 4, 'Saturday Sprint Session',  'Running',       '2026-04-26', '30', 'Hard',
   'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800',
   '12x60m all-out sprints. New top speed personal best. Untouchable.', '2026-04-26T16:00:00Z'),
  (216, 4, 'Monday Evening HIIT',      'Other',         '2026-04-21', '25', 'Hard',
   'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
   'Tabata style: 20s on, 10s off, 8 rounds. Starting the week right.', '2026-04-21T19:00:00Z'),
  (217, 4, 'Cycling Intervals',        'Cycling',       '2026-03-20', '45', 'Hard',
   'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800',
   '6x4min at threshold. Wind was fighting me the whole time.', '2026-03-20T16:00:00Z'),
  (218, 4, 'Jump Rope Conditioning',   'Other',         '2026-03-15', '20', 'Moderate',
   'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
   '10 minutes of double-unders. Footwork is everything.', '2026-03-15T15:00:00Z'),
  (219, 4, '400m Repeat Track Work',   'Running',       '2026-03-10', '35', 'Hard',
   'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800',
   '8x400m. Hit sub-75s on every rep. That''s a first.', '2026-03-10T16:30:00Z'),
  (220, 4, 'Speed Endurance Run',      'Running',       '2026-02-25', '40', 'Hard',
   'https://images.unsplash.com/photo-1502904550040-7534597429ae?w=800',
   '5K at race pace. Every km faster than the last. Dialed in.', '2026-02-25T16:00:00Z'),
  (221, 4, 'Pull-up Volume Day',       'Weightlifting', '2026-02-18', '25', 'Moderate',
   'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800',
   '5 sets of 8 unassisted. Eight months ago I couldn''t do one.', '2026-02-18T16:00:00Z'),
  (222, 4, 'Cardio Blast',             'Other',         '2026-02-08', '30', 'Hard',
   'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800',
   'Bike + row + ski erg. 10 min each. Destroyed me in the best way.', '2026-02-08T17:00:00Z'),
  (223, 4, 'Morning Speed Work',       'Running',       '2026-01-28', '25', 'Hard',
   'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
   'Fartlek run through the city. I don''t stop for red lights.', '2026-01-28T07:00:00Z')
ON CONFLICT DO NOTHING;


-- 4. LIKES --------------------------------------------------
INSERT INTO post_likes (post_id, user_id) VALUES
  (1, 2), (1, 3), (1, 4),
  (2, 1), (2, 3),
  (3, 1), (3, 2), (3, 4),
  (4, 1), (4, 2),
  (5, 1), (5, 2), (5, 3),
  (6, 3),
  (7, 1), (7, 3), (7, 4),
  (8, 2),
  (9, 2), (9, 4),
  (10, 1), (10, 3), (10, 4),
  (11, 2),
  (13, 3),
  (15, 2), (15, 3),
  (17, 4),
  (20, 2),
  (26, 2), (26, 3), (26, 4),
  (28, 3),
  (29, 2),
  (106, 1), (106, 3),
  (107, 1), (107, 4),
  (108, 1), (108, 3), (108, 4),
  (109, 1), (109, 3), (109, 4),
  (110, 1),
  (111, 1), (111, 4),
  (112, 1), (112, 3)
ON CONFLICT DO NOTHING;


-- 5. COMMENTS -----------------------------------------------
INSERT INTO comments (id, post_id, user_id, content, created_at)
OVERRIDING SYSTEM VALUE
VALUES
  (1,   1,   2, 'That''s amazing! Keep it up!',                         '2026-03-10T14:35:00Z'),
  (2,   1,   4, 'Goals! I can barely do 3K',                            '2026-03-10T14:40:00Z'),
  (3,   2,   3, 'What routine do you follow?',                          '2026-03-10T12:15:00Z'),
  (4,   3,   4, 'Beast mode!',                                          '2026-03-09T18:50:00Z'),
  (5,   3,   1, 'How long did it take you to get to that weight?',      '2026-03-09T19:00:00Z'),
  (6,   5,   3, 'HIIT is no joke! Good work',                           '2026-03-08T22:15:00Z'),
  (7,   5,   4, 'Totally worth the pain',                               '2026-03-08T22:16:00Z'),
  (8,   7,   1, 'That trail is beautiful!',                             '2026-03-07T20:35:00Z'),
  (9,   8,   2, 'Incredible progress!',                                 '2026-03-07T14:05:00Z'),
  (10,  9,   3, 'Swimming is great for recovery!',                      '2026-03-06T10:30:00Z'),
  (11,  10,  1, 'Progress is progress! Keep going!',                    '2026-03-05T18:00:00Z'),
  (12,  10,  4, 'You''ll be doing 50 in no time',                       '2026-03-05T18:10:00Z'),
  (300, 106, 1, 'Beach running looks absolutely incredible!',           '2026-03-11T12:00:00Z'),
  (301, 106, 4, 'So jealous, I need to do this someday!',               '2026-03-11T12:00:00Z'),
  (302, 106, 3, 'Sand training is excellent for leg strength.',         '2026-03-11T12:00:00Z'),
  (303, 107, 3, 'What studio do you go to?',                            '2026-03-09T12:00:00Z'),
  (304, 107, 1, 'This looks so calming, I need this in my life',        '2026-03-09T12:00:00Z'),
  (305, 108, 4, 'Swimming looks so peaceful and meditative',            '2026-03-04T12:00:00Z'),
  (306, 108, 1, 'Great to see you back in the pool!',                   '2026-03-04T12:00:00Z'),
  (307, 108, 3, 'Good endurance base building.',                        '2026-03-04T12:00:00Z'),
  (308, 109, 1, 'Those views must be absolutely incredible!',           '2026-02-28T12:00:00Z'),
  (309, 109, 3, '800m elevation is serious work.',                      '2026-02-28T12:00:00Z'),
  (310, 109, 4, 'I NEED to join you next time!!',                       '2026-02-28T12:00:00Z'),
  (311, 110, 1, 'Respect for grinding through those intervals!',        '2026-02-22T12:00:00Z'),
  (312, 111, 1, 'Focused training. Love to see it.',                    '2026-03-05T09:00:00Z'),
  (313, 112, 3, 'Speed is a weapon. Nice work.',                        '2026-03-06T17:00:00Z')
ON CONFLICT DO NOTHING;


-- 6. RESET SEQUENCES so future inserts auto-increment correctly
SELECT setval(pg_get_serial_sequence('users',    'id'), (SELECT MAX(id) FROM users));
SELECT setval(pg_get_serial_sequence('posts',    'id'), (SELECT MAX(id) FROM posts));
SELECT setval(pg_get_serial_sequence('comments', 'id'), (SELECT MAX(id) FROM comments));
