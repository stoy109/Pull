"use client";

import { useId, useMemo, useState } from "react";
import { Info, Plus, X } from "lucide-react";

export const SKILL_SUGGESTIONS = [
  "Pelayanan pelanggan",
  "Kasir",
  "Packing",
  "Canva dasar",
  "Admin marketplace",
  "Memasak",
  "Menjahit",
  "Produksi batik",
  "Pertanian",
  "Kebersihan",
  "Pengiriman",
  "Konstruksi",
];

type SkillPickerProps = {
  value: string[];
  onChangeAction: (skills: string[]) => void;
  suggestions?: string[];
  name?: string;
  maxSelections?: number;
};

export function SkillPicker({
  value,
  onChangeAction,
  suggestions = SKILL_SUGGESTIONS,
  name,
  maxSelections = 10,
}: SkillPickerProps) {
  const inputId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const matches = useMemo(
    () =>
      suggestions.filter(
        (skill) =>
          !value.some((selected) => selected.toLowerCase() === skill.toLowerCase()) &&
          (!normalizedQuery || skill.toLowerCase().includes(normalizedQuery)),
      ),
    [normalizedQuery, suggestions, value],
  );
  const canAddQuery =
    Boolean(query.trim()) &&
    value.length < maxSelections &&
    !value.some((skill) => skill.toLowerCase() === normalizedQuery);

  const addSkill = (skill: string) => {
    const cleanSkill = skill.trim().slice(0, 60);
    if (!cleanSkill || value.length >= maxSelections) return;
    if (value.some((item) => item.toLowerCase() === cleanSkill.toLowerCase())) return;
    onChangeAction([...value, cleanSkill]);
    setQuery("");
  };

  const removeSkill = (skill: string) => {
    onChangeAction(value.filter((item) => item !== skill));
  };

  return (
    <div>
      {name
        ? value.map((skill) => (
            <input key={skill} type="hidden" name={name} value={skill} />
          ))
        : null}

      <div className="flex flex-wrap gap-2">
        {value.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-2 rounded-full border border-[#cfe2d6] bg-[#f0f8f3] py-2 pl-3 pr-2 text-xs font-bold text-[#17663d]"
          >
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(skill)}
              className="grid size-5 place-items-center rounded-full text-[#56806a] transition hover:bg-white hover:text-[#923f35]"
              aria-label={`Hapus keahlian ${skill}`}
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg border border-[#65a77f] px-4 text-xs font-extrabold text-[#08783f] transition hover:bg-[#f0f8f3]"
        >
          <Plus size={16} /> Tambah keahlian
        </button>
      ) : (
        <div className="mt-4 rounded-[18px] border-2 border-[#24312b] bg-white p-4 shadow-[0_12px_35px_rgba(18,59,48,.07)] sm:p-5">
          <div className="flex items-center justify-between gap-4">
            <h3 className="flex items-center gap-2 text-sm font-extrabold text-[#17251f]"><Plus size={18} /> Tambah baru</h3>
            <button type="button" onClick={() => { setOpen(false); setQuery(""); }} className="grid size-8 place-items-center rounded-lg text-[#34473e] hover:bg-[#f1f5f2]" aria-label="Tutup penambah keahlian"><X size={18} /></button>
          </div>

          <p className="mt-4 flex gap-2 rounded-xl border border-[#b8cdfd] bg-[#f1f5ff] p-4 text-xs font-medium leading-5 text-[#344052]"><Info size={18} className="mt-0.5 shrink-0" />Tambahkan keahlian spesifik agar peluang kerja yang tepat lebih mudah menemukan Anda.</p>

          <label htmlFor={inputId} className="sr-only">Cari atau tambah keahlian</label>
          <div className="mt-4 flex gap-2">
            <input
              id={inputId}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && canAddQuery) {
                  event.preventDefault();
                  addSkill(query);
                }
              }}
              placeholder="Tambah keahlian, contoh: Kasir"
              maxLength={60}
              className="h-12 min-w-0 flex-1 rounded-xl border border-[#aebbb4] bg-white px-4 text-sm font-semibold text-[#17251f] outline-none transition placeholder:text-[#8b9892] focus:border-[#08783f] focus:ring-4 focus:ring-[#dff0e5]"
              autoFocus
            />
            <button type="button" disabled={!canAddQuery} onClick={() => addSkill(query)} className="h-12 rounded-xl bg-[#08783f] px-5 text-xs font-extrabold text-white transition hover:bg-[#066f3a] disabled:cursor-not-allowed disabled:bg-[#e4e7e5] disabled:text-[#9aa39e]">Tambah</button>
          </div>

          <div className="mt-2 max-h-44 overflow-y-auto rounded-xl border border-[#e1e7e3] bg-white p-2">
            {normalizedQuery ? (
              matches.length ? matches.map((skill) => <button key={skill} type="button" onClick={() => addSkill(skill)} className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs font-bold text-[#34473e] hover:bg-[#f0f8f3] hover:text-[#08783f]"><span>{skill}</span><Plus size={14} /></button>) : <p className="px-3 py-4 text-center text-xs font-medium text-[#7b8982]">Tekan Enter atau Tambah untuk memakai keahlian ini.</p>
            ) : <p className="px-3 py-4 text-center text-xs font-medium text-[#7b8982]">Mulai mengetik untuk mencari keahlian</p>}
          </div>

          <p className="mt-3 text-right text-[10px] font-semibold text-[#718079]">{value.length}/{maxSelections} keahlian</p>
        </div>
      )}
    </div>
  );
}
