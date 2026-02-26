import CatalogGrid from "@components/CatalogGrid";

type ApiProduct = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  basePrice: string;
  isActive: boolean;
};

async function fetchCatalogProducts(): Promise<ApiProduct[]> {
  const endpoint = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/graphql";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        query CatalogProducts {
          products {
            id
            slug
            name
            description
            basePrice
            isActive
          }
        }
      `,
    }),
    // Каталог должен показывать актуальные данные
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to load products: ${response.statusText}`);
  }

  const json = (await response.json()) as {
    data?: { products?: ApiProduct[] };
    errors?: Array<{ message: string }>;
  };

  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }

  return json.data?.products ?? [];
}

export default async function CatalogPage() {
  const apiProducts = await fetchCatalogProducts();

  const products = apiProducts.map((p) => ({
    _id: p.id,
    title: p.name,
    slug: { current: p.slug },
    description: p.description ?? undefined,
    price: Number(p.basePrice),
    category: "default",
    material: "default",
    imageUrl: undefined,
  }));

  const categories = [
    { value: "all", label: "Все категории" },
    { value: "default", label: "Каталог" },
  ];

  const materials = [
    { value: "all", label: "Все материалы" },
    { value: "default", label: "По умолчанию" },
  ];

  return (
    <div className="card">
      <h1 className="page-title">Магазин готовых изделий</h1>
      <p className="page-subtitle">Список товаров загружается из GraphQL API каталога.</p>
      <CatalogGrid products={products} categories={categories} materials={materials} />
    </div>
  );
}

