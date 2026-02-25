interface ProductPageProps {
  params: { slug: string };
}

export default function ProductPage({ params }: ProductPageProps) {
  return (
    <div className="card">
      <h1 className="page-title">Карточка товара</h1>
      <p className="page-subtitle">Страница товара с URL‑идентификатором: {params.slug}</p>
    </div>
  );
}

