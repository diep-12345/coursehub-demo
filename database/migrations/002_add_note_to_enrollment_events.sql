
BEGIN;

-- 1. Thêm cột note, cho phép NULL để giữ nguyên dữ liệu cũ
ALTER TABLE enrollment_events
ADD COLUMN note VARCHAR(200);

-- 2. Ghi nhận migration đã được thực hiện
INSERT INTO schema_migrations (version, description)
VALUES ('002', 'Add note column to enrollment events');

COMMIT;
