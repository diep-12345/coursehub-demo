
import { useEffect, useState } from "react";
import { api } from "./api";
import Notice from "./components/Notice";
import SectionTable from "./components/SectionTable";
import EnrollmentList from "./components/EnrollmentList";
import StudentForm from "./components/StudentForm";
import EnrollmentHistory from "./components/EnrollmentHistory";

export default function App() {
  const [studentId, setStudentId] = useState("22000004");
  const [draftId, setDraftId] = useState("22000004");
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [courseData, sectionData, enrollmentData] =
          await Promise.all([
            api("/courses", { signal: controller.signal }),
            api("/sections", { signal: controller.signal }),
            api(`/students/${encodeURIComponent(studentId)}/enrollments`, {
              signal: controller.signal,
            }),
          ]);

        setCourses(courseData);
        setSections(sectionData);
        setEnrollments(enrollmentData);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadData();
    return () => controller.abort();
  }, [studentId, refresh]);

  function chooseStudent(event) {
    event.preventDefault();

    if (!/^\d{8}$/.test(draftId)) {
      setError("Mã sinh viên phải gồm đúng 8 chữ số.");
      return;
    }

    setError("");
    setNotice("");
    setStudentId(draftId);
  }

  async function changeEnrollment(sectionId, cancel = false) {
    if (busy || loading || error) return;

    if (cancel && !window.confirm("Bạn chắc chắn muốn hủy đăng ký?")) {
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");

    try {
      if (cancel) {
        await api(
          `/enrollments/${encodeURIComponent(studentId)}/${encodeURIComponent(sectionId)}`,
          { method: "DELETE" }
        );
        setNotice("Hủy đăng ký thành công!");
      } else {
        await api("/enrollments", {
          method: "POST",
          body: {
            student_id: studentId,
            class_section_id: sectionId,
          },
        });
        setNotice("Đăng ký thành công!");
      }

      setRefresh((value) => value + 1);
    } catch (err) {
      setError(err.message);
      setRefresh((value) => value + 1);
    } finally {
      setBusy(false);
    }
  }

  const displaySections = sections
    .map((section) => ({
      ...section,
      course_name:
        courses.find((c) => c.course_code === section.course_code)?.course_name ||
        section.course_name ||
        section.course_code,
      registered: enrollments.some(
        (e) => e.class_section_id === section.class_id
      ),
    }))
    .filter((section) => {
      const keyword = search.toLowerCase();
      const matchesSearch =
        section.class_id.toLowerCase().includes(keyword) ||
        section.course_code.toLowerCase().includes(keyword);

      const matchesCourse =
        courseFilter === "ALL" || section.course_code === courseFilter;

      return (
        matchesSearch &&
        matchesCourse &&
        (!onlyAvailable || section.remaining > 0)
      );
    });

  return (
    <main className="container">
      <header className="panel">
        <h1>CourseHub</h1>
        <p>Hệ thống quản lý đăng ký lớp học phần</p>
      </header>

      <section className="panel">
        <h2>Thông tin sinh viên</h2>

        <StudentForm
          draftId={draftId}
          setDraftId={setDraftId}
          onSubmit={chooseStudent}
          onRefresh={() => setRefresh((v) => v + 1)}
        />

        <p>Sinh viên hiện tại: {studentId}</p>
      </section>

      <Notice kind="success">{notice}</Notice>
      <Notice kind="error">{error}</Notice>

      <section className="panel">
        <h2>Danh sách lớp học phần</h2>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo mã lớp hoặc mã học phần"
        />

        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
        >
          <option value="ALL">Tất cả học phần</option>
          <option value="INT2204">INT2204</option>
          <option value="INT2205">INT2205</option>
          <option value="INT2206">INT2206</option>
        </select>

        <label>
          <input
            type="checkbox"
            checked={onlyAvailable}
            onChange={(e) => setOnlyAvailable(e.target.checked)}
          />
          Chỉ hiện lớp còn chỗ
        </label>

        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <div className="table-wrapper">
            <SectionTable
              rows={displaySections}
              disabled={busy || loading}
              onEnroll={(id) => changeEnrollment(id)}
            />
          </div>
        )}
      </section>

      <section className="panel">
        <h2>Lớp học phần đã đăng ký</h2>
        <EnrollmentList
          rows={enrollments}
          disabled={busy || loading}
          onCancel={(id) => changeEnrollment(id, true)}
        />
      </section>
      <EnrollmentHistory studentId={studentId} />
    </main>
  );
}
