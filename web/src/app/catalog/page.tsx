import { fetchProducts } from "@/lib/sanity/fetch";
import CatalogGrid from "@/components/CatalogGrid";

export const metadata = {
  title: "Каталог продукции",
  description: "Готовые изделия из 3D-печати. Фигурки, прототипы, сувениры и утилитарные изделия.",
};

const CATEGORIES = [
  { value: "all", label: "Все" },
  { value: "figurines", label: "Фигурки" },
  { value: "prototypes", label: "Прототипы" },
  { value: "utilities", label: "Утилитарные" },
  { value: "souvenirs", label: "Сувениры" },
  { value: "other", label: "Прочее" },
];

const MATERIALS = [
  { value: "all", label: "Любой материал" },
  { value: "pla", label: "PLA" },
  { value: "abs", label: "ABS" },
  { value: "petg", label: "PETG" },
  { value: "tpu", label: "TPU" },
  { value: "other", label: "Другое" },
];

export default async function CatalogPage() {
  const products = await fetchProducts();

  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold text-[var(--foreground)]">Каталог продукции</h1>
        <p className="mt-4 text-[var(--muted)]">
          Готовые изделия, напечатанные на профессиональном оборудовании
        </p>
        <CatalogGrid
          products={products}
          categories={CATEGORIES}
          materials={MATERIALS}
        />
      </div>
    </div>
  );
}
