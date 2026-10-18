"use client";

import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { CheckCircle2, ChevronDown, LoaderCircle, MapPin } from "lucide-react";

export type PostalLocation = {
  postalCode: string;
  province: string;
  city: string;
  district: string;
  village: string;
};

type PostalDistrict = {
  name: string;
  subdistricts: string[];
};

type PostalCity = {
  province: string;
  city: string;
  districts: PostalDistrict[];
};

type PostalLookupResponse = {
  postal_code: string;
  locations: PostalCity[];
};

type PostalLocationFieldsProps = {
  value: PostalLocation;
  onChangeAction: Dispatch<SetStateAction<PostalLocation>>;
  required?: boolean;
};

const emptyAddress = {
  province: "",
  city: "",
  district: "",
  village: "",
};

/** Raised when the lookup service responded, but has no area for the code. */
class PostalCodeNotFoundError extends Error {}

export function PostalLocationFields({ value, onChangeAction, required = true }: PostalLocationFieldsProps) {
  const [locations, setLocations] = useState<PostalCity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!/^\d{5}$/.test(value.postalCode)) return;

    const controller = new AbortController();
    const lookup = async () => {
      setLoading(true);
      setError("");
      try {
        const query = new URLSearchParams({ kode_pos: value.postalCode });
        const response = await fetch(`/api/location/lookup-postal-code?${query}`, { signal: controller.signal });
        const payload = await response.json().catch(() => null) as
          | (PostalLookupResponse & { error?: { message?: string } })
          | null;
        if (!response.ok) {
          const message = payload?.error?.message;
          // 4xx means the code itself is rejected; anything else is an outage.
          if (response.status === 400 || response.status === 404) {
            throw new PostalCodeNotFoundError(message || "Kode pos tidak ditemukan.");
          }
          throw new Error(message || "Pencarian kode pos sedang tidak tersedia.");
        }
        if (!payload || !Array.isArray(payload.locations) || payload.locations.length === 0) {
          throw new PostalCodeNotFoundError("Kode pos tidak ditemukan.");
        }

        setLocations(payload.locations);
        const first = payload.locations[0];
        const singleCity = payload.locations.length === 1 ? first.city : "";
        onChangeAction((current) => ({
          ...current,
          province: first?.province || "",
          city: singleCity,
          district: "",
          village: "",
        }));
      } catch (reason) {
        if (controller.signal.aborted) return;
        setLocations([]);
        onChangeAction((current) => ({ ...current, ...emptyAddress }));
        setError(reason instanceof PostalCodeNotFoundError
          ? reason.message
          : "Pencarian kode pos sedang tidak tersedia.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    lookup();
    return () => controller.abort();
  }, [onChangeAction, value.postalCode]);

  const selectedCity = useMemo(
    () => locations.find((location) => location.city === value.city) || (locations.length === 1 ? locations[0] : null),
    [locations, value.city],
  );
  const selectedDistrict = selectedCity?.districts.find((district) => district.name === value.district);
  const cityIsAmbiguous = locations.length > 1;

  const updatePostalCode = (postalCode: string) => {
    const digits = postalCode.replace(/\D/g, "").slice(0, 5);
    setLocations([]);
    setError("");
    onChangeAction((current) => ({ ...current, postalCode: digits, ...emptyAddress }));
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block"><span className="mb-2 block text-xs font-extrabold text-[#34473e]">Kode Pos</span><span className="relative block"><input name="postalCode" value={value.postalCode} onChange={(event) => updatePostalCode(event.target.value)} inputMode="numeric" autoComplete="postal-code" pattern="[0-9]{5}" maxLength={5} required={required} placeholder="Contoh: 40132" className="h-12 w-full rounded-lg border border-[#d8e1dc] bg-white px-4 pr-11 text-sm font-semibold text-[#17251f] outline-none transition placeholder:text-[#8b9892] focus:border-[#69a982] focus:ring-4 focus:ring-[#dff0e5]" />{loading ? <LoaderCircle size={18} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-[#08783f]" /> : value.province ? <CheckCircle2 size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#08783f]" /> : <MapPin size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#718079]" />}</span>{error ? <span className="mt-1.5 block text-[10px] font-semibold text-[#bd4d3f]">{error}</span> : null}</label>

      <ReadOnlyField name="province" label="Provinsi" value={value.province} placeholder="Terisi otomatis" />

      {cityIsAmbiguous ? <SelectField name="city" label="Kota/Kabupaten" value={value.city} required={required} placeholder="Pilih kota/kabupaten" options={locations.map((location) => location.city)} onChange={(city) => onChangeAction((current) => ({ ...current, city, district: "", village: "" }))} /> : <ReadOnlyField name="city" label="Kota/Kabupaten" value={value.city} placeholder="Terisi otomatis" />}

      <SelectField name="district" label="Kecamatan" value={value.district} required={required} disabled={!selectedCity} placeholder="Pilih kecamatan" options={selectedCity?.districts.map((district) => district.name) || []} onChange={(district) => onChangeAction((current) => ({ ...current, district, village: "" }))} />

      <SelectField name="village" label="Kelurahan/Desa" value={value.village} required={required} disabled={!selectedDistrict} placeholder="Pilih kelurahan/desa" options={selectedDistrict?.subdistricts || []} onChange={(village) => onChangeAction((current) => ({ ...current, village }))} />

      {value.village ? <p className="self-end rounded-lg bg-[#edf7f1] px-3 py-3 text-[10px] font-semibold leading-5 text-[#17663d] sm:min-h-12">{value.village}, {value.district}, {value.city}, {value.province} · {value.postalCode}</p> : null}
    </div>
  );
}

function ReadOnlyField({ name, label, value, placeholder }: { name: string; label: string; value: string; placeholder: string }) {
  return <label className="block"><span className="mb-2 block text-xs font-extrabold text-[#34473e]">{label}</span><input name={name} value={value} readOnly placeholder={placeholder} className="h-12 w-full rounded-lg border border-[#e0e6e2] bg-[#f7f9f8] px-4 text-sm font-semibold text-[#52645c] outline-none placeholder:text-[#9aa59f]" /></label>;
}

function SelectField({ name, label, value, options, placeholder, disabled = false, required = false, onChange }: { name: string; label: string; value: string; options: string[]; placeholder: string; disabled?: boolean; required?: boolean; onChange: (value: string) => void }) {
  return <label className="block"><span className="mb-2 block text-xs font-extrabold text-[#34473e]">{label}</span><span className="relative block"><select name={name} value={value} disabled={disabled} required={required} onChange={(event) => onChange(event.target.value)} className="h-12 w-full cursor-pointer appearance-none rounded-lg border border-[#d8e1dc] bg-white px-4 pr-11 text-sm font-semibold text-[#17251f] outline-none transition disabled:cursor-not-allowed disabled:bg-[#f3f5f4] disabled:text-[#9aa59f] focus:border-[#69a982] focus:ring-4 focus:ring-[#dff0e5]"><option value="">{placeholder}</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select><ChevronDown size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#5f7068]" /></span></label>;
}
