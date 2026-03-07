import Link from "next/link";
import { fetchAdminOrders } from "@/lib/sanity/fetch";

export default async function AdminOrdersPage() {
  const orders = await fetchAdminOrders(50);
  return (
    <div className="card">
      <h1 className="page-title">Управление заказами</h1>
      <p className="page-subtitle">Заказы из системы бронирования (материалы/оборудование).</p>

      <div className="mt-4 flex gap-3 text-sm">
        <Link href="/admin" className="text-[var(--muted)] hover:text-[var(--foreground)]">
          ← Назад
        </Link>
      </div>

      <AdminOrdersTable orders={orders} />
    </div>
  );
}

function AdminOrdersTable({ orders }: { orders: any[] }) {
  if (!orders.length) {
    return (
      <p className="mt-6 text-sm text-[var(--muted)]">
        Пока нет заказов (или Sanity не подключен). Оформите заказ через страницу `Заказать`.
      </p>
    );
  }

  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-[var(--border)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--card-bg)]">
          <tr className="text-left">
            <th className="p-3">ID</th>
            <th className="p-3">Клиент</th>
            <th className="p-3">Статус</th>
            <th className="p-3">Создан</th>
            <th className="p-3">Итого</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id} className="border-t border-[var(--border)]">
              <td className="p-3 font-mono text-xs">{o._id}</td>
              <td className="p-3">{o.customerDisplay || "-"}</td>
              <td className="p-3">{o.status}</td>
              <td className="p-3">{o.createdAt ? new Date(o.createdAt).toLocaleString("ru-RU") : "-"}</td>
              <td className="p-3">{o.totalRub ?? 0} ₽</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

