import Link from "next/link";
import { CALCULATOR_RATES } from "@/lib/calculatorConfig";

const rows = Object.entries(CALCULATOR_RATES.materials).map(([materialCode, material]) => ({
  materialCode,
  ...material,
}));

export default function AdminWarehousePage() {
  return (
    <div className="card">
      <h1 className="page-title">Склад</h1>
      <p className="page-subtitle">
        Материалы/варианты, которые попадают клиенту в выпадающий список (только активные и в наличии).
      </p>

      <div className="mt-4 flex gap-3 text-sm">
        <Link href="/admin" className="text-[var(--muted)] hover:text-[var(--foreground)]">
          ← Назад
        </Link>
      </div>

      {!rows.length ? (
        <p className="mt-6 text-sm text-[var(--muted)]">Нет данных склада.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-[var(--border)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--card-bg)]">
              <tr className="text-left">
                <th className="p-3">Материал</th>
                <th className="p-3">Технология</th>
                <th className="p-3">Бренд</th>
                <th className="p-3">Тип</th>
                <th className="p-3">Цвет</th>
                <th className="p-3">Диаметр</th>
                <th className="p-3">Плотность</th>
                <th className="p-3">Цена/г</th>
                <th className="p-3">Остаток, г</th>
                <th className="p-3">Активен</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.materialCode} className="border-t border-[var(--border)]">
                  <td className="p-3">{r.label}</td>
                  <td className="p-3">{r.technologyTitle}</td>
                  <td className="p-3">{r.brand}</td>
                  <td className="p-3">{r.type}</td>
                  <td className="p-3">{r.color}</td>
                  <td className="p-3">{r.diameterMm ? `${r.diameterMm} мм` : "-"}</td>
                  <td className="p-3">{r.density}</td>
                  <td className="p-3">{r.pricePerGram}</td>
                  <td className="p-3">{r.inStockGrams}</td>
                  <td className="p-3">{r.isActive ? "Да" : "Нет"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

