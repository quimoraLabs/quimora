import { InputField } from "../../../../components/common/InputField"; // Adjust path
import ModalWrapper from "../../../../components/common/ModalWrapper";

function QuizFormModal({ isOpen, quiz, onClose, onSave, form, setForm }) {
  const editing = Boolean(quiz);

  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = (event) => {
    event.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={editing ? "Update Quiz" : "Create Quiz"}
    >
      <form onSubmit={submit} className="space-y-5">
        <InputField
          label="Quiz title"
          required
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="e.g. Web Security & Authentication Basics"
        />

        <div className="w-full">
          <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
            Description
          </label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Describe what this quiz covers..."
            className="w-full rounded-xl border border-main bg-surface px-4 py-2.5 text-sm text-main placeholder-text-muted outline-none transition focus:border-accent"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            label="Time limit (minutes)"
            type="number"
            min="1"
            required
            value={form.timeLimit}
            onChange={(e) => update("timeLimit", Number(e.target.value))}
          />

          <InputField
            label="Max attempts"
            type="number"
            min="1"
            required
            value={form.maxAttempts}
            onChange={(e) => update("maxAttempts", Number(e.target.value))}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            label="Start Date"
            type="date"
            value={form.startDate}
            onChange={(e) => update("startDate", e.target.value)}
          />

          <InputField
            label="End Date"
            type="date"
            value={form.endDate}
            onChange={(e) => update("endDate", e.target.value)}
          />
        </div>

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
            className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold shadow-lg shadow-brand-mid/10 transition hover:opacity-90"
          >
            {editing ? "Save changes" : "Create quiz"}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}

export default QuizFormModal;