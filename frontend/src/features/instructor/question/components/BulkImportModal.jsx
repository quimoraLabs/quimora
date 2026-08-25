import { Fragment, useState, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Upload, FileSpreadsheet, Download, CheckCircle, AlertCircle, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import useQuestionStore from "../store/useQuestionStore";

export default function BulkImportModal({ isOpen, onClose, quizId, onImportSuccess }) {
  const { importBulkQuestions, loading } = useQuestionStore();
  const fileInputRef = useRef(null);

  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [parseErrors, setParseErrors] = useState([]);
  const [fileName, setFileName] = useState("");

  const resetState = () => {
    setParsedQuestions([]);
    setParseErrors([]);
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  // 📥 Download Sample CSV Template
  const downloadSampleCSV = () => {
    const csvContent =
      'questionText,optionA,optionB,optionC,optionD,correctAnswer,marks,difficulty\r\n' +
      '"What is React?","A JS library for UI","A database","A web server","A programming language","A",2,"easy"\r\n' +
      '"Which hook handles side effects in React?","useState","useEffect","useContext","useReducer","B",3,"medium"\r\n' +
      '"What is the default port for Express?","3000","8080","5000","Custom configurable","D",1,"easy"';

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "quimora_sample_questions.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  // 📥 Download Sample JSON Template
  const downloadSampleJSON = () => {
    const jsonSample = [
      {
        questionText: "What is React?",
        marks: 2,
        difficulty: "easy",
        options: [
          { optionText: "A JS library for UI", isCorrect: true },
          { optionText: "A database", isCorrect: false },
          { optionText: "A web server", isCorrect: false },
          { optionText: "A programming language", isCorrect: false },
        ],
      },
      {
        questionText: "Which hook handles side effects in React?",
        marks: 3,
        difficulty: "medium",
        options: [
          { optionText: "useState", isCorrect: false },
          { optionText: "useEffect", isCorrect: true },
          { optionText: "useContext", isCorrect: false },
          { optionText: "useReducer", isCorrect: false },
        ],
      },
    ];

    const blob = new Blob([JSON.stringify(jsonSample, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "quimora_sample_questions.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  // 🔄 Parse CSV Content
  const parseCSV = (text) => {
    const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length < 2) {
      throw new Error("CSV file must contain a header row and at least one question row.");
    }

    const parseLine = (line) => {
      const result = [];
      let cur = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' && (i === 0 || line[i - 1] !== "\\")) {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          result.push(cur.trim().replace(/^"|"$/g, "").replace(/""/g, '"'));
          cur = "";
        } else {
          cur += char;
        }
      }
      result.push(cur.trim().replace(/^"|"$/g, "").replace(/""/g, '"'));
      return result;
    };

    const questions = [];
    const errors = [];

    // Header row
    const headers = parseLine(lines[0]).map((h) => h.toLowerCase().trim());
    const qTextIdx = headers.findIndex((h) => h.includes("question"));
    const optAIdx = headers.findIndex((h) => h === "optiona" || h === "opt a" || h === "a");
    const optBIdx = headers.findIndex((h) => h === "optionb" || h === "opt b" || h === "b");
    const optCIdx = headers.findIndex((h) => h === "optionc" || h === "opt c" || h === "c");
    const optDIdx = headers.findIndex((h) => h === "optiond" || h === "opt d" || h === "d");
    const correctIdx = headers.findIndex((h) => h.includes("correct") || h === "ans" || h === "answer");
    const marksIdx = headers.findIndex((h) => h.includes("mark"));
    const diffIdx = headers.findIndex((h) => h.includes("diff"));

    if (qTextIdx === -1 || optAIdx === -1 || optBIdx === -1 || optCIdx === -1 || optDIdx === -1 || correctIdx === -1) {
      throw new Error(
        "CSV header must contain: questionText, optionA, optionB, optionC, optionD, correctAnswer"
      );
    }

    for (let i = 1; i < lines.length; i++) {
      const cols = parseLine(lines[i]);
      if (cols.length < 6 || !cols[qTextIdx]) continue;

      const qText = cols[qTextIdx];
      const optA = cols[optAIdx] || "";
      const optB = cols[optBIdx] || "";
      const optC = cols[optCIdx] || "";
      const optD = cols[optDIdx] || "";
      const correctVal = String(cols[correctIdx] || "").trim().toUpperCase();
      const marks = marksIdx !== -1 && !isNaN(Number(cols[marksIdx])) ? Math.max(1, Number(cols[marksIdx])) : 1;
      const rawDiff = diffIdx !== -1 ? String(cols[diffIdx] || "").toLowerCase() : "medium";
      const difficulty = ["easy", "medium", "hard"].includes(rawDiff) ? rawDiff : "medium";

      // Determine correct option
      let correctIndex = 0;
      if (correctVal === "A" || correctVal === "1" || correctVal === optA.toUpperCase()) correctIndex = 0;
      else if (correctVal === "B" || correctVal === "2" || correctVal === optB.toUpperCase()) correctIndex = 1;
      else if (correctVal === "C" || correctVal === "3" || correctVal === optC.toUpperCase()) correctIndex = 2;
      else if (correctVal === "D" || correctVal === "4" || correctVal === optD.toUpperCase()) correctIndex = 3;
      else {
        errors.push(`Row ${i + 1}: Correct answer '${correctVal}' is invalid. Must be A, B, C, or D.`);
      }

      questions.push({
        questionText: qText,
        marks,
        difficulty,
        options: [
          { optionText: optA, isCorrect: correctIndex === 0 },
          { optionText: optB, isCorrect: correctIndex === 1 },
          { optionText: optC, isCorrect: correctIndex === 2 },
          { optionText: optD, isCorrect: correctIndex === 3 },
        ],
      });
    }

    return { questions, errors };
  };

  // 🔄 Parse JSON Content
  const parseJSON = (text) => {
    const raw = JSON.parse(text);
    if (!Array.isArray(raw)) throw new Error("JSON file must be an array of question objects.");

    const questions = [];
    const errors = [];

    raw.forEach((item, idx) => {
      if (!item.questionText) {
        errors.push(`Item ${idx + 1}: Missing 'questionText'.`);
        return;
      }
      if (!Array.isArray(item.options) || item.options.length !== 4) {
        errors.push(`Item ${idx + 1}: Must contain exactly 4 options.`);
        return;
      }

      const hasCorrect = item.options.some((o) => Boolean(o.isCorrect));
      if (!hasCorrect) {
        errors.push(`Item ${idx + 1}: At least one option must have isCorrect: true.`);
      }

      questions.push({
        questionText: item.questionText,
        marks: item.marks || 1,
        difficulty: ["easy", "medium", "hard"].includes(item.difficulty) ? item.difficulty : "medium",
        options: item.options.map((opt, oIdx) => ({
          optionText: opt.optionText || opt.text || `Option ${oIdx + 1}`,
          isCorrect: Boolean(opt.isCorrect),
        })),
      });
    });

    return { questions, errors };
  };

  // 📂 File Drop / Select Handler
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        let result;

        if (file.name.endsWith(".json")) {
          result = parseJSON(text);
        } else {
          result = parseCSV(text);
        }

        setParsedQuestions(result.questions);
        setParseErrors(result.errors);

        if (result.questions.length > 0) {
          toast.success(`Parsed ${result.questions.length} questions successfully!`);
        }
      } catch (err) {
        console.error("Parse error:", err);
        toast.error(err.message || "Failed to parse file. Please check format.");
        resetState();
      }
    };

    reader.readAsText(file);
  };

  // 🚀 Submit to Backend /bulk
  const handleImportSubmit = async () => {
    if (parsedQuestions.length === 0) {
      toast.error("No valid questions to import.");
      return;
    }

    const success = await importBulkQuestions(quizId, parsedQuestions);
    if (success) {
      handleClose();
      if (onImportSuccess) onImportSuccess();
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-surface p-6 text-left align-middle shadow-2xl transition-all border border-main">
                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b border-main">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                      Bulk Question Importer
                    </span>
                    <Dialog.Title className="text-xl font-bold font-display text-main mt-0.5">
                      Import Questions via CSV / JSON
                    </Dialog.Title>
                    <p className="text-xs text-muted mt-0.5">
                      Upload multiple questions at once to quickly populate your quiz.
                    </p>
                  </div>

                  <button
                    onClick={handleClose}
                    className="p-1.5 rounded-lg text-muted hover:text-main hover:bg-main/50 transition cursor-pointer text-lg font-bold"
                  >
                    ✕
                  </button>
                </div>

                {/* Templates Strip */}
                <div className="mt-4 p-4 rounded-xl bg-elevated border border-main flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-accent shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-main">Need the standard format template?</h4>
                      <p className="text-[11px] text-muted">Download pre-formatted sample files to get started.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={downloadSampleCSV}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-main bg-surface text-xs font-semibold text-main hover:border-accent hover:text-accent transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Sample CSV
                    </button>
                    <button
                      type="button"
                      onClick={downloadSampleJSON}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-main bg-surface text-xs font-semibold text-main hover:border-accent hover:text-accent transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Sample JSON
                    </button>
                  </div>
                </div>

                {/* Upload Dropzone */}
                {parsedQuestions.length === 0 ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-5 border-2 border-dashed border-main/80 hover:border-accent rounded-2xl p-8 text-center cursor-pointer transition bg-surface/50 hover:bg-accent/5 group space-y-3"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.json"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mx-auto group-hover:scale-110 transition">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-main">
                        Click to select or drag and drop a file
                      </p>
                      <p className="text-xs text-muted mt-1">Supports CSV (.csv) and JSON (.json) up to 500 questions</p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 space-y-4">
                    {/* File bar */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-elevated border border-main">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-bold text-main">{fileName}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-accent/10 text-accent font-semibold">
                          {parsedQuestions.length} Questions Ready
                        </span>
                      </div>

                      <button
                        onClick={resetState}
                        className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-semibold cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Change File
                      </button>
                    </div>

                    {/* Warnings */}
                    {parseErrors.length > 0 && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <AlertCircle className="w-4 h-4" /> Formatting Warnings ({parseErrors.length})
                        </div>
                        <ul className="list-disc pl-5 text-[11px] space-y-0.5 max-h-20 overflow-y-auto">
                          {parseErrors.map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Preview Table */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted">
                        Parsed Questions Preview ({parsedQuestions.length})
                      </h4>
                      <div className="max-h-60 overflow-y-auto rounded-xl border border-main divide-y divide-main">
                        {parsedQuestions.map((q, idx) => {
                          const correctOpt = q.options.find((o) => o.isCorrect);
                          return (
                            <div key={idx} className="p-3 bg-surface/50 text-xs space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-main">
                                  Q{idx + 1}. {q.questionText}
                                </span>
                                <span className="text-[10px] uppercase font-semibold text-muted shrink-0">
                                  {q.difficulty} • {q.marks} {q.marks === 1 ? "Mark" : "Marks"}
                                </span>
                              </div>
                              <div className="text-[11px] text-muted flex flex-wrap gap-2">
                                <span>Correct Answer:</span>
                                <strong className="text-emerald-500">
                                  {correctOpt ? correctOpt.optionText : "Not specified"}
                                </strong>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="mt-6 pt-4 border-t border-main flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-main text-main hover:bg-main transition cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={parsedQuestions.length === 0 || loading}
                    onClick={handleImportSubmit}
                    className={`px-5 py-2 text-xs font-semibold rounded-xl text-white shadow-lg transition flex items-center gap-2 ${
                      parsedQuestions.length > 0 && !loading
                        ? "bg-accent hover:opacity-90 cursor-pointer"
                        : "bg-muted/40 cursor-not-allowed opacity-50"
                    }`}
                  >
                    {loading ? "Importing..." : `Import ${parsedQuestions.length} Questions`}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
