-- ============================================================
-- Fleet Dry Dock Manager — SQLite Schema
-- ============================================================

PRAGMA foreign_keys = ON;

-- ── Vessels ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vessels (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    type          TEXT,
    imo           TEXT,
    shipyard      TEXT,
    class_society TEXT,
    dock_in       TEXT,
    dock_out      TEXT,
    duration      INTEGER,
    grt           TEXT,
    created_at    TEXT DEFAULT (datetime('now'))
);

-- ── Jobs ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    vessel_id   TEXT NOT NULL REFERENCES vessels(id) ON DELETE CASCADE,
    number      TEXT,
    section     TEXT,           -- GENERAL|PAINT|STEEL|DECK|ENGINE|ELECTRIC|ETC
    category    TEXT,           -- Shipyard|Shore Repair|Crew
    description TEXT,
    vendor      TEXT,
    budget      REAL    DEFAULT 0,
    consumption REAL    DEFAULT 0,
    start_date  TEXT,
    end_date    TEXT,
    completion  REAL    DEFAULT 0,
    remarks     TEXT    DEFAULT '[]',  -- JSON: [{date,progress,important}]
    updated_at  TEXT    DEFAULT (datetime('now'))
);

-- ── Class Items ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS class_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    vessel_id   TEXT NOT NULL REFERENCES vessels(id) ON DELETE CASCADE,
    no          TEXT,
    finding     TEXT,
    description TEXT,
    actions     TEXT    DEFAULT '[]',  -- JSON: [{date,progress,important}]
    responsible TEXT,           -- Crew|Shipyard|Crew / Shipyard|3rd Party
    open_date   TEXT,
    close_date  TEXT,
    status      TEXT    DEFAULT 'Open',    -- Open|Closed
    priority    TEXT    DEFAULT 'Normal',  -- Normal|Urgent|Critical|On Hold
    updated_at  TEXT    DEFAULT (datetime('now'))
);

-- ── Daily Discussion Log ───────────────────────────────────
CREATE TABLE IF NOT EXISTS discussions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    vessel_id   TEXT NOT NULL REFERENCES vessels(id) ON DELETE CASCADE,
    no          TEXT,
    date        TEXT,
    time_of_day TEXT,
    item        TEXT,
    description TEXT,
    actions     TEXT    DEFAULT '[]',  -- JSON: [{date,progress,important}]
    status      TEXT    DEFAULT 'Open',    -- Open|Close
    priority    TEXT    DEFAULT 'Normal',  -- Normal|Urgent|Critical|On Hold
    updated_at  TEXT    DEFAULT (datetime('now'))
);

-- ── File Attachments ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS attachments (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    vessel_id   TEXT    NOT NULL REFERENCES vessels(id) ON DELETE CASCADE,
    ref_type    TEXT    NOT NULL,   -- job|class|disc
    ref_id      INTEGER NOT NULL,
    filename    TEXT    NOT NULL,
    filesize    INTEGER,
    mimetype    TEXT,
    data        BLOB    NOT NULL,
    uploaded_at TEXT    DEFAULT (datetime('now'))
);

-- ── Indexes ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_jobs_vessel   ON jobs(vessel_id);
CREATE INDEX IF NOT EXISTS idx_jobs_vendor   ON jobs(vendor);
CREATE INDEX IF NOT EXISTS idx_class_vessel  ON class_items(vessel_id);
CREATE INDEX IF NOT EXISTS idx_disc_vessel   ON discussions(vessel_id);
CREATE INDEX IF NOT EXISTS idx_disc_date     ON discussions(date);
CREATE INDEX IF NOT EXISTS idx_attach_ref    ON attachments(vessel_id, ref_type, ref_id);
