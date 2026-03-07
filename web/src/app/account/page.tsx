import { Suspense } from "react";
import AccountPageClient from "./AccountPageClient";

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center">Загрузка…</div>}>
      <AccountPageClient />
    </Suspense>
  );
}
