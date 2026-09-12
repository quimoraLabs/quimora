import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Printer, 
  ArrowLeft 
} from "lucide-react";
import axiosClient from "../../api/axiosClient";
import Loader from "../../components/common/Loader";

const StudentFullReportPage = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get(`/student/attempts/${attemptId}`);
        if (res.data.success) {
          setReport(res.data.data);
        } else {
          setError(res.data.message || "Failed to load report");
        }
      } catch (err) {
        setError(err.response?.data?.message || err.response?.data?.error || "Error fetching report");
      } finally {
        setLoading(false);
      }
    };

    if (attemptId) {
      fetchReport();
    }
  }, [attemptId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <Loader />;

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-100 text-gray-900 p-6 flex flex-col items-center justify-center font-sans">
        <p className="text-red-600 font-bold mb-4">{error || "Report not found"}</p>
        <button
          onClick={() => navigate("/student/quizzes")}
          className="px-5 py-2 bg-gray-800 text-white rounded-lg font-bold flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Desk
        </button>
      </div>
    );
  }

  const passed = report.passed;
  const percentage = report.score || 0;
  const questions = report.questions || [];

  const handleCloseOrBack = () => {
    window.close();
    setTimeout(() => {
      navigate("/student/my-attempts");
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-3 sm:p-6 font-sans text-xs print:p-0 print:bg-white print:text-black">
      
      {/* Print Setup CSS */}
      <style>{`
        @media print {
          @page {
            margin: 6mm;
            size: A4 landscape;
          }
          html, body {
            background: white !important;
            color: black !important;
            font-family: Arial, sans-serif !important;
          }
          .print-hidden {
            display: none !important;
          }
          .page-break-inside-avoid {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Top Action Header */}
      <div className="max-w-6xl mx-auto mb-4 flex items-center justify-between print-hidden">
        <button
          onClick={handleCloseOrBack}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-200 text-gray-800 border border-gray-300 rounded-md text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back / Close Tab
        </button>
        
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-md font-bold text-xs shadow transition-all"
        >
          <Printer className="w-4 h-4" /> Print / Save PDF
        </button>
      </div>

      {/* Main Clean Report Sheet */}
      <div className="max-w-6xl mx-auto bg-white border border-gray-300 rounded-lg p-5 shadow-sm print:border-none print:shadow-none print:p-0 print:max-w-full">
        
        {/* Simple Header */}
        <div className="border-b-2 border-gray-900 pb-2 mb-3 flex justify-between items-end">
          <div>
            <h1 className="text-base font-black text-gray-900 leading-tight">
              {report.quizTitle}
            </h1>
            <div className="text-[11px] text-gray-700 font-bold mt-0.5">
              Student: <span className="text-gray-900 font-extrabold">{report.studentName || "Student"}</span> • Date: {report.completedAt ? new Date(report.completedAt).toLocaleDateString() : "N/A"}
            </div>
          </div>
          <div className="text-right text-xs font-black text-gray-900">
            Score: {report.marksObtained} / {report.totalMarks} ({percentage}%) • <span className={passed ? "text-emerald-700" : "text-red-700"}>{passed ? "PASSED" : "FAILED"}</span>
          </div>
        </div>

        {/* Structured Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-gray-300 text-[11px]">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300 font-black text-gray-900 text-[10px] uppercase tracking-wider">
                <th className="p-2 border-r border-gray-300 w-10 text-center">S.N.</th>
                <th className="p-2 border-r border-gray-300">Question Text</th>
                <th className="p-2 border-r border-gray-300">Option A</th>
                <th className="p-2 border-r border-gray-300">Option B</th>
                <th className="p-2 border-r border-gray-300">Option C</th>
                <th className="p-2 border-r border-gray-300">Option D</th>
                <th className="p-2 border-r border-gray-300 bg-gray-200">Chosen Option</th>
                <th className="p-2 border-r border-gray-300 text-center w-24">Correct (Yes/No)</th>
                <th className="p-2 text-right w-16">Marks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-medium">
              {questions.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-4 text-center text-gray-500 italic">No question data available.</td>
                </tr>
              ) : (
                questions.map((q, idx) => {
                  const selectedIds = (q.selectedOptions || []).map((id) => id.toString());
                  const isSkipped = selectedIds.length === 0 || selectedIds.includes("-1");
                  
                  const opts = q.options || [];
                  const optA = opts[0] ? opts[0].optionText : "-";
                  const optB = opts[1] ? opts[1].optionText : "-";
                  const optC = opts[2] ? opts[2].optionText : "-";
                  const optD = opts[3] ? opts[3].optionText : "-";

                  const selectedOpt = opts.find((o) => selectedIds.includes(o._id.toString()));
                  const chosenOptionText = isSkipped ? "Skipped" : (selectedOpt ? selectedOpt.optionText : "N/A");
                  
                  const marksEarned = q.isCorrect ? q.marks : (isSkipped ? 0 : -((q.marks * 25) / 100));

                  return (
                    <tr key={q.questionId || idx} className="hover:bg-gray-50 page-break-inside-avoid">
                      <td className="p-2 border-r border-gray-300 text-center font-bold">{idx + 1}</td>
                      <td className="p-2 border-r border-gray-300 font-semibold text-gray-900">{q.questionText}</td>
                      <td className="p-2 border-r border-gray-300 text-gray-700">{optA}</td>
                      <td className="p-2 border-r border-gray-300 text-gray-700">{optB}</td>
                      <td className="p-2 border-r border-gray-300 text-gray-700">{optC}</td>
                      <td className="p-2 border-r border-gray-300 text-gray-700">{optD}</td>
                      <td className={`p-2 border-r border-gray-300 font-bold ${isSkipped ? "text-gray-400 bg-gray-50" : (q.isCorrect ? "text-emerald-800 bg-emerald-50" : "text-red-800 bg-red-50")}`}>
                        {chosenOptionText}
                      </td>
                      <td className="p-2 border-r border-gray-300 text-center font-bold">
                        {isSkipped ? (
                          <span className="text-gray-500">Skipped</span>
                        ) : q.isCorrect ? (
                          <span className="text-emerald-700">Yes ✓</span>
                        ) : (
                          <span className="text-red-700">No ✗</span>
                        )}
                      </td>
                      <td className="p-2 text-right font-bold">
                        {marksEarned > 0 ? `+${marksEarned}` : marksEarned}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 border-t-2 border-gray-900 font-black text-gray-900 text-xs">
                <td colSpan="6" className="p-2 text-right uppercase border-r border-gray-300">
                  Total Score Obtained:
                </td>
                <td colSpan="2" className="p-2 border-r border-gray-300 text-center">
                  Result: <span className={passed ? "text-emerald-800" : "text-red-800"}>{passed ? "PASSED" : "FAILED"}</span> ({percentage}%)
                </td>
                <td className="p-2 text-right text-emerald-800">
                  {report.marksObtained} / {report.totalMarks}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Clean Footer Note */}
        <div className="mt-3 pt-2 border-t border-gray-300 text-center text-[10px] text-gray-500 font-medium">
          Quimora Assessment Platform • Student: {report.studentName || "Student"} • Report ID: {report._id}
        </div>

      </div>
    </div>
  );
};

export default StudentFullReportPage;
