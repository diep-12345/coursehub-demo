export default function EnrollmentList({ rows, disabled, onCancel }) {
  if (!rows.length) return <p>Chưa có lớp học phần nào được đăng ký.</p>;

  return (
    <ul>
      {rows.map((row) => (
        <li key={row.class_section_id}>
          {row.course_name || row.course_code} - {row.class_section_id}
          <button
            disabled={disabled}
            onClick={() => onCancel(row.class_section_id)}
          >
            Hủy đăng ký
          </button>
        </li>
      ))}
    </ul>
  );
}