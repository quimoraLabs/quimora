import React from "react";
import * as XLSX from "xlsx";
import { FileSpreadsheet } from "lucide-react";

/**
 * Export assessment report data to Excel (.xlsx) workbook with Summary & Detailed sheets
 * @param {Object} data - Assessment attempt report object
 */
export const exportAssessmentToExcel = (data) => {
  if (!data) return;

  const studentName = data.studentName || "Student";
  const quizTitle = data.quizTitle || "Quiz Assessment";

  // 1. Summary metadata rows for the overview sheet
  const summaryRows = [
    { Field: "Quiz Title", Value: quizTitle },
    { Field: "Student Name", Value: studentName },
    { Field: "Total Score", Value: `${data.marksObtained ?? 0} / ${data.totalMarks ?? 0} (${data.score ?? 0}%)` },
    { Field: "Result Status", Value: data.passed ? "PASSED" : "FAILED" },
    {
      Field: "Performance Breakdown",
      Value: `${data.correctAnswersCount ?? 0} Correct / ${data.incorrectAnswersCount ?? 0} Incorrect`,
    },
    { Field: "Time Taken (Seconds)", Value: data.timeTakenInSeconds ?? data.timeTakenSeconds ?? "N/A" },
    { Field: "Completion Date", Value: data.completedAt ? new Date(data.completedAt).toLocaleString() : "N/A" },
    { Field: "", Value: "" }, // Separator row
  ];

  // 2. Detailed questions data formatting
  const questions = data.questions || [];
  const questionRows = questions.map((q, index) => {
    const selectedIds = (q.selectedOptions || []).map((id) => id.toString());
    const isSkipped = selectedIds.length === 0 || selectedIds.includes("-1");

    const getOptionTextById = (id) => {
      const found = (q.options || []).find((opt) => opt._id?.toString() === id.toString());
      return found ? found.optionText : "";
    };

    const selectedTexts = selectedIds
      .map(getOptionTextById)
      .filter(Boolean)
      .join(", ");

    return {
      "S.N.": index + 1,
      "Question Text": q.questionText || "N/A",
      "Chosen Option(s)": isSkipped ? "Skipped" : selectedTexts || "Unattempted",
      "Correct (Yes/No)": q.isCorrect ? "Yes ✓" : "No ✗",
      "Marks Awarded": q.marks ?? 0,
    };
  });

  // 3. Build Excel Workbook
  const workbook = XLSX.utils.book_new();

  // Summary Sheet
  const summarySheet = XLSX.utils.json_to_sheet(summaryRows, { skipHeader: true });
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

  // Detailed Questions Sheet
  const questionsSheet = XLSX.utils.json_to_sheet(questionRows);
  XLSX.utils.book_append_sheet(workbook, questionsSheet, "Detailed Report");

  // 4. Trigger download
  const safeFilename = `${studentName.replace(/[^a-zA-Z0-9]/g, "_")}_Assessment_Report.xlsx`;
  XLSX.writeFile(workbook, safeFilename);
};

const AssessmentExport = ({ apiResponse }) => {
  const handleDownloadExcel = () => {
    const data = apiResponse?.data || apiResponse;
    exportAssessmentToExcel(data);
  };

  return (
    <button
      onClick={handleDownloadExcel}
      className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md font-bold text-xs shadow transition-all cursor-pointer"
      title="Download detailed assessment data as Excel spreadsheet (.xlsx)"
    >
      <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
      <span>Download Excel Report</span>
    </button>
  );
};

export default AssessmentExport;
