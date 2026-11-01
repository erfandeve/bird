"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { AddressFields, emptyAddress, validateAddress, type AddressDraft, type AddressErrors } from "@/components/account/AddressFields";
import { ApiError } from "@/lib/api";
import { useAuth, useToast } from "@/lib/store";

export default function AddressesPage() {
  const addresses = useAuth((s) => s.addresses);
  const load = useAuth((s) => s.loadAddresses);
  const save = useAuth((s) => s.saveAddress);
  const remove = useAuth((s) => s.removeAddress);
  const toast = useToast((s) => s.push);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<AddressDraft>(emptyAddress);
  const [errors, setErrors] = useState<AddressErrors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load().catch(() => toast("نشانی‌ها بارگذاری نشد."));
  }, [load, toast]);

  const open = (id: string | "new", value: AddressDraft) => {
    setEditing(id);
    setDraft(value);
    setErrors({});
  };

  return (
    <div>
      <h1 className="mb-5 font-display text-5xl font-bold text-olive-900">نشانی‌ها</h1>
      <ul className="mb-5 space-y-2">
        {addresses.map((a) => (
          <li key={a.id} className="flex items-start justify-between gap-3 rounded-2xl bg-white p-4 ring-1 ring-olive-200">
            <p className="leading-7">
              <b>{a.receiver}</b>
              <span className="block text-sm text-olive-800">{a.province}، {a.city}، {a.line}</span>
              <span className="block text-sm text-olive-800" dir="ltr">{a.postalCode} · {a.mobile}</span>
            </p>
            <div className="flex shrink-0">
              <button type="button" aria-label={`ویرایش نشانی ${a.receiver}`} onClick={() => open(a.id, a)} className="grid size-11 place-items-center rounded-full hover:bg-lemon-200">
                <Pencil className="size-4" aria-hidden="true" />
              </button>
              <button type="button" aria-label={`حذف نشانی ${a.receiver}`} onClick={() => remove(a.id).catch(() => toast("حذف نشانی انجام نشد."))} className="grid size-11 place-items-center rounded-full hover:bg-clay-100 hover:text-clay-700">
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </div>
          </li>
        ))}
      </ul>
      {editing ? (
        <form
          noValidate
          className="rounded-2xl bg-lemon-200 p-5"
          onSubmit={async (e) => {
            e.preventDefault();
            const found = validateAddress(draft);
            setErrors(found);
            if (Object.keys(found).length) return;
            setSaving(true);
            try {
              await save({ ...draft, title: draft.city, id: editing === "new" ? undefined : editing });
              setEditing(null);
            } catch (err) {
              if (err instanceof ApiError) {
                setErrors(err.fields);
                if (!Object.keys(err.fields).length) toast(err.message);
              }
            } finally {
              setSaving(false);
            }
          }}
        >
          <AddressFields value={draft} errors={errors} onChange={setDraft} />
          <div className="mt-5 flex gap-2">
            <button type="submit" disabled={saving} className="btn btn-primary">ذخیرهٔ نشانی</button>
            <button type="button" className="btn btn-soft" onClick={() => setEditing(null)}>انصراف</button>
          </div>
        </form>
      ) : (
        <button type="button" className="btn btn-primary" onClick={() => open("new", emptyAddress)}>افزودن نشانی</button>
      )}
    </div>
  );
}
