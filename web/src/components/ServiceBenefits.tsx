export default function ServiceBenefits() {
  return (
    <section className="space-y-5">
      <h2 className="text-lg font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
        Основные преимущества сервиса
      </h2>
      <ul className="grid gap-4 text-[var(--foreground)] md:grid-cols-2">
        <li className="rounded-2xl border border-[var(--border)] bg-black/40 p-4">
          <div className="text-sm font-semibold">Быстрая подготовка и подача заказа</div>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Загрузите готовую 3D‑модель или пришлите рисунок/эскиз изделия — мы поможем довести его до печати.
          </p>
        </li>
        <li className="rounded-2xl border border-[var(--border)] bg-black/40 p-4">
          <div className="text-sm font-semibold">Удобное редактирование и визуальный контроль</div>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Меняйте масштаб и оценивайте объём прямо в браузере с помощью интерактивного 3D‑просмотра.
          </p>
        </li>
        <li className="rounded-2xl border border-[var(--border)] bg-black/40 p-4">
          <div className="text-sm font-semibold">Поддержка профессиональных форматов</div>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Импортируйте файлы в форматах OBJ, FBX, STL, DAE, GLTF, BLEND, SKP, IGES, STEP и VRML.
          </p>
        </li>
        <li className="rounded-2xl border border-[var(--border)] bg-black/40 p-4">
          <div className="text-sm font-semibold">Помощь дизайнеров и готовность к производству</div>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Если у вас нет модели, наши специалисты создадут её по вашим материалам и подготовят к печати.
          </p>
        </li>
      </ul>
    </section>
  );
}

