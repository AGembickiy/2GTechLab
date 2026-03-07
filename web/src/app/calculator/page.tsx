"use client";

import { INFILL_PERCENT_RANGE, LAYER_HEIGHT_PRESETS } from "@/lib/calculatorConfig";
import { useCalculator } from "@/hooks/useCalculator";
import { addItem } from "@/store/slices/cartSlice";
import { useDispatch } from "react-redux";

function formatMoney(value: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const parseNumber = (value: string, fallback: number): number => {
  const normalized = value.replace(",", ".").trim();
  if (normalized === "") return fallback;
  const n = Number(normalized);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

export default function CalculatorPage() {
  const dispatch = useDispatch();
  const { state, pricing, setParams, materials } = useCalculator();

  const handleAddToCart = () => {
    if (state.weightGrams <= 0 || pricing.totalPrice <= 0) return;

    const selectedMaterial = materials[state.materialCode];
    if (!selectedMaterial) return;

    const requiredMaterialGrams = state.weightGrams * state.quantity;

    if (requiredMaterialGrams > selectedMaterial.inStockGrams) {
      if (typeof window !== "undefined") {
        window.alert(
          `Недостаточно материала "${selectedMaterial.label}". ` +
            `Нужно ${requiredMaterialGrams} г, на складе ${selectedMaterial.inStockGrams} г. ` +
            `Свяжитесь с администратором для пополнения или изменения заказа.`,
        );
      }
      return;
    }
    dispatch(
      addItem({
        id: `print-${Date.now()}`,
        type: "print",
        quantity: state.quantity,
        modelFileId: state.modelFileId,
        calculatorSnapshot: {
          state,
          pricing,
          createdAt: new Date().toISOString(),
        },
      }),
    );
  };

  return (
    <div className="card">
      <h1 className="page-title">Калькулятор 3D‑печати</h1>
      <p className="page-subtitle mb-6 text-[var(--muted)] max-w-2xl">
        Укажите вес модели и параметры печати — рассчитаем ориентировочную стоимость. Слева — ввод данных, справа
        — подробный расчёт.
      </p>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-start">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-5 lg:p-6 shadow-[0_18px_45px_rgba(15,23,42,0.7)]">
          <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Параметры заказа</h2>
          <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                  Вес модели, г
                </span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={state.weightGrams || ""}
                  onChange={(e) => {
                    const { value } = e.target;
                    const next = value === "" ? 0 : parseNumber(value, state.weightGrams);
                    setParams({ weightGrams: next });
                  }}
                  className="rounded-lg border border-[var(--border)] bg-[var(--card-bg)] px-3 py-2.5 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
                  placeholder="Например, 50"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                  Количество, шт.
                </span>
                <input
                  type="number"
                  min={1}
                  value={state.quantity}
                  onChange={(e) => {
                    const { value } = e.target;
                    const parsed = value === "" ? 1 : parseNumber(value, state.quantity || 1);
                    const next = Math.max(1, Math.round(parsed));
                    setParams({ quantity: next });
                  }}
                  className="rounded-lg border border-[var(--border)] bg-[var(--card-bg)] px-3 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                  Материал
                </span>
                <select
                  value={state.materialCode}
                  onChange={(e) => setParams({ materialCode: e.target.value })}
                  className="rounded-lg border border-[var(--border)] bg-[var(--card-bg)] px-3 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
                >
                  {Object.entries(materials).map(([code, { label }]) => (
                    <option key={code} value={code}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                  Срочность
                </span>
                <select
                  value={state.urgency}
                  onChange={(e) =>
                    setParams({
                      urgency: e.target.value as typeof state.urgency,
                    })
                  }
                  className="rounded-lg border border-[var(--border)] bg-[var(--card-bg)] px-3 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
                >
                  <option value="standard">Стандартный срок</option>
                  <option value="rush">Срочно</option>
                </select>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                  Заполнение, %
                </span>
                <div className="rounded-lg border border-[var(--border)] bg-[var(--card-bg)] px-3 py-2.5">
                  <input
                    type="range"
                    min={INFILL_PERCENT_RANGE.min}
                    max={INFILL_PERCENT_RANGE.max}
                    step={INFILL_PERCENT_RANGE.step}
                    value={state.infillPercent}
                    onChange={(e) => setParams({ infillPercent: Number(e.target.value) })}
                    className="w-full accent-[var(--accent)]"
                  />
                  <div className="mt-1 flex items-center justify-between text-[0.8rem] text-[var(--muted)]">
                    <span>Экономия → Прочность</span>
                    <span className="text-[var(--foreground)] font-medium">{state.infillPercent}%</span>
                  </div>
                </div>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                  Высота слоя, мм
                </span>
                <select
                  value={state.layerHeightMm}
                  onChange={(e) => setParams({ layerHeightMm: Number(e.target.value) })}
                  className="rounded-lg border border-[var(--border)] bg-[var(--card-bg)] px-3 py-2.5 text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
                >
                  {LAYER_HEIGHT_PRESETS.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-end">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                  Время печати одного изделия, ч (0 — авто)
                </span>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={state.printTimeHours || ""}
                  onChange={(e) => {
                    const { value } = e.target;
                    const next = value === "" ? 0 : parseNumber(value, state.printTimeHours);
                    setParams({
                      printTimeHours: next,
                    });
                  }}
                  className="rounded-lg border border-[var(--border)] bg-[var(--card-bg)] px-3 py-2.5 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
                  placeholder="Можно оставить 0 — рассчитаем автоматически"
                />
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={state.postProcessing}
                  onChange={(e) => setParams({ postProcessing: e.target.checked })}
                  className="h-4 w-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                />
                <span className="text-sm text-[var(--foreground)]">
                  Постобработка (шлифовка, покраска)
                </span>
              </label>
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-5 lg:p-6 lg:sticky lg:top-4 shadow-[0_18px_45px_rgba(15,23,42,0.7)]">
          <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Расчёт</h2>
          {state.weightGrams > 0 ? (
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted)]">Материал</span>
                <span className="font-medium">{formatMoney(pricing.materialCost)} ₽</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted)]">Время печати</span>
                <span className="font-medium">
                  {pricing.estimatedDurationHours.toFixed(1)} ч
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted)]">Работа оборудования</span>
                <span className="font-medium">{formatMoney(pricing.machineCost)} ₽</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted)]">Коммунальные</span>
                <span className="font-medium">{formatMoney(pricing.utilitiesCost)} ₽</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted)]">Операционные издержки</span>
                <span className="font-medium">
                  {formatMoney(pricing.operatingOverheadCost)} ₽
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted)]">
                  Наценка ({state.urgency === "rush" ? "срочный" : "базовый"} тариф)
                </span>
                <span className="font-medium">{formatMoney(pricing.markupAmount)} ₽</span>
              </div>
              {state.postProcessing && (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted)]">Постобработка</span>
                  <span className="font-medium">
                    {formatMoney(pricing.postProcessingCost)} ₽
                  </span>
                </div>
              )}
              <div className="mt-3 border-t border-[var(--border)] pt-3 flex justify-between items-center">
                <span className="font-semibold text-[var(--foreground)]">Итого</span>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xl font-bold text-[var(--accent)]">
                    {formatMoney(pricing.totalPrice)} ₽
                  </span>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="rounded-lg bg-[var(--accent)] px-4 py-1.5 text-sm font-semibold text-black hover:opacity-90 transition"
                  >
                    Добавить в заказ
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)]">
              Введите вес модели в граммах, чтобы увидеть расчёт.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
