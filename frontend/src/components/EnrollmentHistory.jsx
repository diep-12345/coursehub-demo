
import { useEffect, useState } from "react";
import { api } from "../api";

const PAGE_SIZE = 5;

export default function EnrollmentHistory({ studentId }) {
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadHistory() {
      setLoading(true);
      setError("");

      try {
        const data = await api(
          `/enrollment-events?student_id=${encodeURIComponent(studentId)}&skip=${page * PAGE_SIZE}&limit=${PAGE_SIZE + 1}`,
          { signal: controller.signal }
        );

        if (controller.signal.aborted) return;

        setEvents(data.slice(0, PAGE_SIZE));
        setHasNext(data.length > PAGE_SIZE);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
          setEvents([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadHistory();

    return () => controller.abort();
  }, [studentId, page]);

  return (
    <section className="panel">
      <h2>Lịch sử đăng ký học phần</h2>

      {loading && <p>Đang tải lịch sử...</p>}

      {error && <p className="notice error">{error}</p>}

      {!loading && !error && events.length === 0 && (
        <p>Sinh viên chưa có lịch sử đăng ký.</p>
      )}

      {!loading && events.length > 0 && (
        <>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Mã sự kiện</th>
                  <th>Mã sinh viên</th>
                  <th>Mã lớp</th>
                  <th>Loại sự kiện</th>
                  <th>Thời gian</th>
                </tr>
              </thead>

              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td>{event.id}</td>
                    <td>{event.student_id}</td>
                    <td>{event.class_section_id}</td>
                    <td>
                      {event.event_type === "CREATED"
                        ? "Đăng ký"
                        : "Hủy đăng ký"}
                    </td>
                    <td>
                      {new Date(event.occurred_at).toLocaleString("vi-VN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: "15px" }}>
            <button
              disabled={page === 0 || loading}
              onClick={() => setPage((p) => p - 1)}
            >
              Trang trước
            </button>

            <span style={{ margin: "0 12px" }}>
              Trang {page + 1}
            </span>

            <button
              disabled={!hasNext || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Trang sau
            </button>
          </div>
        </>
      )}
    </section>
  );
}
