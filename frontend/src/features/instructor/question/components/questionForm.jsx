import { Fragment, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { InputField } from "../../../../components/common/InputField";

function QuestionFormModal({
  isOpen,
  isEditing = false,
  onClose,
  onSave,
  form,
  setForm,
}) {
  const dialogInitialFocusRef = useRef(null);

  console.log(form);

  // 1. Ensures the options array always contains exactly 4 elements
  const options = Array.from({ length: 4 }, (_, index) => ({
    optionText: form.options?.[index]?.optionText || "",
    isCorrect: Boolean(form.options?.[index]?.isCorrect),
  }));

  const update = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  // FIX HERE: Use the computed `options` variable instead of `form.options` to preserve `isCorrect` status
  const handleOptionChange = (index, value) => {
    const updatedOptions = options.map((opt, i) =>
      i === index ? { ...opt, optionText: value } : opt,
    );

    update("options", updatedOptions);
  };

  const setCorrectOption = (selectedIndex) => {
    const updatedOptions = options.map((opt, index) => ({
      ...opt,
      isCorrect: index === selectedIndex,
    }));

    update("options", updatedOptions);
  };

  const submit = (event) => {
    event.preventDefault();

    onSave({
      ...form,
      options: options, // Pass exact computed options
    });

    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={onClose}
        initialFocus={dialogInitialFocusRef}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-surface p-6 text-left align-middle shadow-xl transition-all border border-main">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-bold leading-6 text-main pb-4 border-b border-main flex justify-between items-center"
                >
                  <span>
                    {isEditing ? "Edit Question" : "Add New Question"}
                  </span>

                  <button
                    ref={dialogInitialFocusRef}
                    type="button"
                    onClick={onClose}
                    className="text-muted hover:text-main text-xl font-bold"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </Dialog.Title>

                <form onSubmit={submit} className="space-y-5 mt-4">
                  {/* Question Text */}
                  <div className="w-full">
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                      Question Text <span className="text-red-500">*</span>
                    </label>

                    <textarea
                      rows={3}
                      required
                      value={form.questionText || ""}
                      onChange={(e) => update("questionText", e.target.value)}
                      placeholder="e.g. What type of index is automatically created by MongoDB..."
                      className="w-full rounded-xl border border-main bg-surface px-4 py-2.5 text-sm text-main placeholder:text-muted/50 outline-none transition focus:border-accent"
                    />
                  </div>

                  {/* EXACTLY 4 OPTIONS */}
                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                      Options & Select Correct Answer
                      <span className="text-red-500">*</span>
                      <span className="ml-2 text-[10px] normal-case text-accent font-normal">(Click radio button to mark as correct)</span>
                    </label>

                    <div className="space-y-3">
                      {options.map((option, index) => (
                        <div
                          key={index}
                          className={`relative flex items-center gap-3 rounded-xl border p-2.5 transition ${
                            option.isCorrect
                              ? "border-accent bg-accent/10 shadow-xs"
                              : "border-main bg-surface"
                          }`}
                        >
                          {/* Correct Answer Control */}
                          <button
                            type="button"
                            aria-label={`Mark option ${index + 1} as correct`}
                            onClick={() => setCorrectOption(index)}
                            className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 transition cursor-pointer hover:border-accent ${
                              option.isCorrect
                                ? "border-accent bg-accent"
                                : "border-main"
                            }`}
                          >
                            {option.isCorrect && (
                              <div className="h-2 w-2 rounded-full bg-white" />
                            )}
                          </button>

                          {/* Option Number */}
                          <span className={`text-xs font-semibold shrink-0 w-4 ${option.isCorrect ? "text-accent font-bold" : "text-muted"}`}>
                            {index + 1}.
                          </span>

                          {/* Option Text */}
                          <input
                            type="text"
                            required
                            value={option.optionText}
                            onChange={(e) =>
                              handleOptionChange(index, e.target.value)
                            }
                            placeholder={`Option ${index + 1}`}
                            className="w-full bg-transparent text-sm text-main outline-none placeholder:text-muted/50 focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Marks & Difficulty */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InputField
                      label="Marks"
                      type="number"
                      min="1"
                      required
                      value={form.marks || 1}
                      onChange={(e) => update("marks", Number(e.target.value))}
                    />

                    <div>
                      <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                        Difficulty Level
                      </label>

                      <select
                        value={form.difficulty || "medium"}
                        onChange={(e) => update("difficulty", e.target.value)}
                        className="w-full rounded-xl border border-main bg-surface px-4 py-2.5 text-sm text-main outline-none transition focus:border-accent"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-4 border-t border-main">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-xl border border-main px-4 py-2.5 text-sm font-semibold text-main transition hover:bg-main"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
                    >
                      {isEditing ? "Save Changes" : "Add Question"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default QuestionFormModal;
