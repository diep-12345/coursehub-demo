
function StudentForm({ draftId, setDraftId, onSubmit, onRefresh }) {
  return (
    <form className="student-form" onSubmit={onSubmit}>
      <input
        value={draftId}
        onChange={(e) => setDraftId(e.target.value)}
        placeholder="Nhập mã sinh viên"
      />

      <button type="submit">Chọn sinh viên</button>

      <button type="button" onClick={onRefresh}>
        Tải lại
      </button>
    </form>
  );
}

export default StudentForm;
