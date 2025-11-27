"use client";

import { useState } from "react";
import { INVESTMENT_CATEGORIES, CATEGORY_LABELS } from "@/lib/constants";
import { saveDayEntry } from "./actions";

interface Investment {
  category: string;
  score: number;
  comment: string;
}

interface TodayFormProps {
  initialData: {
    mood: number | null;
    energy: number | null;
    note: string;
    investments: Investment[];
  };
}

export default function TodayForm({ initialData }: TodayFormProps) {
  const [mood, setMood] = useState<number | null>(initialData.mood);
  const [energy, setEnergy] = useState<number | null>(initialData.energy);
  const [note, setNote] = useState(initialData.note);
  const [investments, setInvestments] = useState<Investment[]>(
    initialData.investments
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const updateInvestment = (category: string, score: number) => {
    setInvestments((prev) =>
      prev.map((inv) =>
        inv.category === category ? { ...inv, score } : inv
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const result = await saveDayEntry({
      date: new Date(),
      mood,
      energy,
      note,
      investments,
    });

    setSaving(false);
    
    if (result.success) {
      setMessage("Saved successfully! 🎉");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage("Error saving. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Investments */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-zinc-200">
        <h3 className="text-lg font-semibold text-zinc-900 mb-4">
          Life Investments
        </h3>
        <div className="space-y-4">
          {INVESTMENT_CATEGORIES.map((category) => {
            const investment = investments.find(
              (inv) => inv.category === category
            )!;
            return (
              <div key={category} className="flex items-center justify-between">
                <label className="text-zinc-700 font-medium">
                  {CATEGORY_LABELS[category]}
                </label>
                <div className="flex gap-2">
                  {[0, 1, 2, 3].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => updateInvestment(category, score)}
                      className={`w-10 h-10 rounded-lg font-medium transition-all ${
                        investment.score === score
                          ? "bg-emerald-500 text-white shadow-md"
                          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mood and Energy */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-zinc-200">
        <h3 className="text-lg font-semibold text-zinc-900 mb-4">
          Mood & Energy
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-zinc-700 font-medium">Mood</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMood(value)}
                  className={`w-10 h-10 rounded-lg font-medium transition-all ${
                    mood === value
                      ? "bg-sky-500 text-white shadow-md"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-zinc-700 font-medium">Energy</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setEnergy(value)}
                  className={`w-10 h-10 rounded-lg font-medium transition-all ${
                    energy === value
                      ? "bg-sky-500 text-white shadow-md"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-zinc-200">
        <h3 className="text-lg font-semibold text-zinc-900 mb-4">
          Reflection
        </h3>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="How did today go? Any highlights or learnings?"
          className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
          rows={3}
        />
      </div>

      {/* Submit button */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors disabled:bg-zinc-400 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Today's Entry"}
        </button>
        {message && (
          <span
            className={`text-sm font-medium ${
              message.includes("Error") ? "text-red-600" : "text-emerald-600"
            }`}
          >
            {message}
          </span>
        )}
      </div>
    </form>
  );
}

