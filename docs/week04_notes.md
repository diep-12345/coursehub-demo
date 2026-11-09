## 1. Kết quả trước khi tạo Index

- Scan type: Seq Scan
- Rows returned by scan: 820
- Rows removed by filter: 99183
- Execution Time: 6.774 ms
- Buffers: shared hit = 1137

## 2. Kết quả sau khi tạo Index

- Scan type: Index Scan
- Index: idx_enrollment_events_dataset_student_time
- Rows returned: 50
- Execution Time: 0.191 ms
- Buffers: shared hit = 50, read = 3

## 3. So sánh

- Trước Index: 6.774 ms
- Sau Index: 0.191 ms
- Speedup: approximately 35.47x

# CourseHub - Buoi 4

- Migration 001: enrollment_events.
- Demo class: RACE-01, capacity = 1.
- POST /enrollments: lock class_sections bang FOR UPDATE.
- Concurrency test: 1 request 201, 1 request 409.
- Performance data: 100000 rows, dataset=performance.
- Index: idx_enrollment_events_dataset_student_time.
- Ghi lai scan type va Execution Time truoc/sau o day.

Khong commit backend/.env.