
BEGIN;

-- Xóa cột note
ALTER TABLE enrollment_events
DROP COLUMN note;

-- Xóa lịch sử migration 002
DELETE FROM schema_migrations
WHERE version = '002';

COMMIT;
