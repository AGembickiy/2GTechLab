import { fetchPortfolio } from "@/lib/sanity/fetch";
import PortfolioPile from "@/components/PortfolioPile";

export const metadata = {
  title: "Портфолио",
  description: "Примеры наших работ по 3D-печати. Прототипы, фигурки, утилитарные изделия и многое другое.",
};

export default async function PortfolioPage() {
  const items = await fetchPortfolio();

  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold text-[var(--foreground)]">Портфолио</h1>
        <p className="mt-4 text-[var(--muted)]">
          Нажмите на фото, чтобы рассмотреть работу подробнее
        </p>
        <PortfolioPile items={items} />
      </div>
    </div>
  );
}
