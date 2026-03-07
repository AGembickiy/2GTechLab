import dynamic from "next/dynamic";

const OrderUploadForm = dynamic(() => import("@/components/OrderUploadForm"), { ssr: false });

export const metadata = {
  title: "Заказать 3D‑печать",
  description:
    "Онлайн‑сервис для заказа уникальной 3D‑печати: загрузка моделей, выбор материалов и оформление заказа.",
};

export default function OrderPage() {
  return (
    <div className="order-layout">
      {/* Левая колонка: занимает 75% ширины main.app-main */}
      <div className="card order-layout__left">
        <div className="space-y-10">
          <section className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950/95 px-5 py-6 shadow-[0_24px_70px_rgba(15,23,42,0.9)] lg:px-8 lg:py-8">
            <div className="pointer-events-none absolute inset-0 opacity-60">
              <div className="absolute -left-32 top-0 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl" />
              <div className="absolute right-0 top-10 h-64 w-64 rounded-full bg-purple-500/15 blur-3xl" />
            </div>
          </section>

          <section className="space-y-8">
            <OrderUploadForm />
          </section>
        </div>
      </div>

      {/* Правая колонка: занимает 25% ширины main.app-main */}
      <aside className="order-layout__right space-y-4 rounded-2xl border border-[var(--border)] bg-black/40 p-5 lg:p-6 shadow-[0_18px_45px_rgba(15,23,42,0.8)]">
        <h3 className="text-lg font-semibold text-[var(--foreground)]">Как оформить заказ</h3>
        <div className="space-y-1.5 text-sm text-[var(--foreground)]">
          <p>Подготовьте 3D‑модель или эскиз желаемого изделия.</p>
          <p>Используйте калькулятор, чтобы оценить стоимость печати.</p>
          <p>Загрузите файлы и укажите параметры печати в форме ниже.</p>
        </div>
        <div className="mt-3 rounded-xl border border-dashed border-sky-500/50 bg-slate-900/60 p-3 text-xs text-[var(--muted)]">
          Поддерживаем популярные форматы 3D‑моделей (STL, OBJ, STEP, FBX, GLTF и др.) и помогаем подготовить файлы к
          печати, если у вас пока только рисунок или фото.
        </div>
      </aside>
    </div>
  );
}

