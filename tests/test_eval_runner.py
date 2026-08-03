from pathlib import Path

from eval.run_retrieval_eval import DEFAULT_QUERIES, _is_relevant, run_evaluation


def test_run_evaluation_writes_report_and_json(tmp_path: Path):
    data_dir = tmp_path / "data"
    report_dir = tmp_path / "report"
    data_dir.mkdir()
    (data_dir / "campus.md").write_text(
        "# Hoc bong\nSinh vien nop ho so hoc bong tai phong cong tac sinh vien.\n\n"
        "# Thu vien\nThu vien Ta Quang Buu cho muon sach va ho tro tai lieu so.",
        encoding="utf-8",
    )

    summary = run_evaluation(data_dir, report_dir, queries=DEFAULT_QUERIES[:1], top_k=2)

    assert summary["evaluations"]
    assert (report_dir / "retrieval_eval_report.md").exists()
    assert (report_dir / "retrieval_eval_results.json").exists()
    assert "fixed_300" in (report_dir / "retrieval_eval_report.md").read_text(encoding="utf-8")


def test_relevance_matching_ignores_vietnamese_accents():
    assert _is_relevant(["hoc bong"], "Thông tin học bổng sinh viên")
