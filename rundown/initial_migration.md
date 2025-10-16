Table custom_user {
  id uuid [pk]
  email text [unique, not null]
  password varchar [not null]
  is_active boolean [default: false]
  is_staff boolean [default: false]
  is_superuser boolean [default: false]
  last_login timestamp
  created_at timestamp [default: `now()`]
}

Table user_profile {
  user_id uuid [pk, unique, ref: - custom_user.id] // 1:1 with users
  display_name text //for future social features, null at first
  default_translation_id int [ref: > translations.id, note: 'KJV by default'] //will save having to select the deck each time user selects verses
  review_goal_per_day int [default: 10] //for streak/progress/ect
  notif_hour int [note: '0–23; local notifications'] //notifications, if wanted use it for push notifications if this feature is desired
  accessibility_json json // we can store serialized UI preferances, font size, high contrast, ect. maybe not MVP
  created_at timestamp [default: `now()`] // for audits, 
  updated_at timestamp [default: `now()`] //audits, update via trigger
}

Table user_habit {
  id int [pk, increment]
  user_id int [ref: > user_profile.user_id]
  habit varchar
  frequency varchar
  purpose varchar
  day varchar
  time datetime
  reminder int
}

Table translations {
  id int [pk, increment]
  code text [unique, note: 'e.g., KJV, NIV'] //short stable handle for each, instead of entire name.
  name text // "King James Version, ect."
  license text //eg public domain. may be usefull later if adding licenced versions
  is_public bool [default: true] // keep true for kjv switch for others
}
//will there be language options? spanish, portuguese, Klingon?

Enum Testament {
  OT
  NT
} // enumerated list of choices for further organization.

Table books {
  id int [pk, increment]
  canon_order int //1-66 for normal canon, lets us sort "bible order"
  name text        // e.g., "Proverbs"
  short_name text  // e.g., "Prov" for compact UI
  testament Testament //enum from above quick filters
}

Table verses {
  id int [pk, increment]
  translation_id int [ref: > translations.id]
  book_id int [ref: > books.id]
  chapter int
  verse_num int // together these are unique, so we cant import duplicates.
  text text // the actual verse
  text_len int //text length, for filtering
  tokens_json json  // optional pre-tokenization for cloze, can be null

  Note: 'Unique per translation/book/chapter/verse'
  indexes {
    (translation_id, book_id, chapter, verse_num) [unique]
    book_id
  }
}

Table decks { //a lest of verses with an order, but not a users progress. user studies from a deck, progress is tracked elsewhere
  id int [pk, increment]
  name text //display title of deck named by user
  is_public bool [default: true] //visibility switch
  owner_id uuid [ref: > custom_user.id, note: 'null = curated/public system deck'] 
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]

  indexes {
    owner_id
    (is_public, id)
  }
}

// Many-to-many join: which verses are in a given deck, and in what order.
Table deck_verses {
  deck_id int [ref: > decks.id]
  verse_id int [ref: > verses.id]
  sort_order int

  indexes {
    (deck_id, verse_id) [pk]
    (deck_id, sort_order)
  }
}


Table user_verse_state { //spaced repetition schedule and latest review outcome One row per (user, verse) that you’re studying.
  user_id uuid [ref: > custom_user.id]
  verse_id int [ref: > verses.id]
  ease float [default: 2.5] //higher = grows intervals faster? 
  interval int [default: 0, note: 'days'] //spacing in days until next review
  due_at timestamp [default: `now()`] //when it next becomes due
  repetitions int [default: 0] //count of consecutive successful reviews, resets on "failures"
  lapses int [default: 0] // count of failures
  last_grade int //last grade given
  updated_at timestamp [default: `now()`] 

  indexes {
    (user_id, verse_id) [pk]
    (user_id, due_at)
  }
}

Enum ReviewMode {
  cloze
  recall
  listen
}

// Append-only history of practice attempts (for stats).
Table review_logs { //one row, per attempt you make on a verse. only insert and query later for analytics
  user_id uuid [ref: > custom_user.id]
  verse_id int [ref: > verses.id]
  ts timestamp [default: `now()`] // when the attempt happened, server time
  mode ReviewMode // are we only doing cloze, or will there be listen/recall ect?
  grade int           // 0–5 or 0/1
  deck_id int [ref: > decks.id, null, note: 'no decks for mvp'] //null from global queue, deck id if we want per deck stats
  duration_ms int //for like a speed charts
  response_json json  // e.g., {blanks:[{i:3, guess:"discretion", ok:true}]}

  indexes {
    (user_id, verse_id, ts) [pk]
    (user_id, ts)
  }
}
