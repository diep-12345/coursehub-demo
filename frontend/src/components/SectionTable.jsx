export default function SectionTable({ rows, disabled, onEnroll }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Mã lớp</th>
          <th>Mã học phần</th>
          <th>Sức chứa</th>
          <th>Đã đăng ký</th>
          <th>Còn chỗ</th>
          <th>Thao tác</th>
        </tr>
      </thead>

      <tbody>
        {rows.map((row) => (
          <tr key={row.class_id}>
            <td>{row.class_id}</td>
            <td>{row.course_code}</td>
            <td>{row.capacity}</td>
            <td>{row.enrolled}</td>
            <td>{row.remaining}</td>
            <td>
              <button
                disabled={disabled || row.remaining <= 0 || row.registered}
                onClick={() => onEnroll(row.class_id)}
              >
                {row.registered
                  ? "Đã đăng ký"
                  : row.remaining <= 0
                    ? "Hết chỗ"
                    : "Đăng ký"}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}