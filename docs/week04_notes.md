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

#### 4. Kiểm tra Rollback Transaction

Mục tiêu: Kiểm tra tính Atomicity khi ghi dữ liệu đăng ký và lịch sử sự kiện trong cùng một transaction.

Dữ liệu thử nghiệm:
- Student ID: `22000002`.
- Class Section ID: `DM-01`.
- Số bản ghi `enrollments` trước thử nghiệm: 0.
- Số bản ghi `enrollment_events` trước thử nghiệm: 0.

Cách thực hiện:
1. Tạo một endpoint thử nghiệm `/enrollments/test-rollback`.
2. Thực hiện INSERT vào bảng `enrollments`.
3. Cố tình INSERT `event_type` dài hơn giới hạn 20 ký tự vào `enrollment_events`.
4. PostgreSQL phát sinh lỗi dữ liệu và transaction tự động rollback.

Kết quả:
- API trả về HTTP 500 do lỗi được cố tình tạo ra.
- Số bản ghi `enrollments` sau thử nghiệm: 0.
- Số bản ghi `enrollment_events` sau thử nghiệm: 0.
- Endpoint thử nghiệm đã được xóa sau khi kiểm tra.

Kết luận: Transaction rollback thành công. Khi thao tác ghi lịch sử sự kiện thất bại, thao tác đăng ký trước đó cũng được hoàn tác. Điều này chứng minh tính Atomicity của transaction.

#### 5. Thiết kế và đánh giá Index thứ hai

Mục tiêu: Tối ưu truy vấn tìm kiếm sự kiện theo lớp học phần và loại sự kiện.

Truy vấn kiểm thử:
- `class_section_id = 'PY-01'`
- `event_type = 'CREATED'`
- Sắp xếp `occurred_at DESC`.
- Giới hạn 50 bản ghi.

Index được tạo:

```sql
CREATE INDEX idx_enrollment_events_section_event_time
ON enrollment_events (
    class_section_id,
    event_type,
    occurred_at DESC
);
```

Kết quả trước và sau Index:

| Chỉ số         | Trước Index   | Sau Index |
| Scan type      | Seq Scan      | Index Scan|
| Execution Time | 8.764 ms      | 0.138 ms  |
| Buffers        | 1140          | 54        |
| Rows returned  | 50            | 50        |
Speedup: 8.764 / 0.138 ≈ 63.5 lần.

Kết luận: Index giúp PostgreSQL tìm kiếm trực tiếp các bản ghi phù hợp, giảm số lượng buffer truy cập và loại bỏ bước sắp xếp riêng trong kế hoạch thực thi. Hiệu năng truy vấn cải thiện đáng kể trong lần đo thử nghiệm này.