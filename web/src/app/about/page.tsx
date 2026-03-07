import Image from "next/image";
import { fetchTeamMembers } from "../../lib/sanity/fetch";
import { urlFor } from "../../lib/sanity/image";

export const metadata = {
  title: "О нас",
  description:
    "Команда 2GTechLab: фото, краткая биография и сертификаты.",
};

type TeamMember = {
  _id: string;
  name?: string;
  role?: string;
  description?: string;
  photo?: { asset?: { _ref?: string } } | null;
  imageUrl?: string;
  certificates?: {
    title?: string;
    provider?: string;
    year?: string;
  }[];
};

function getPhotoUrl(member: TeamMember) {
  if (member.imageUrl) return member.imageUrl;
  if (member.photo) return urlFor(member.photo).width(600).height(400).fit("crop").url();
  return null;
}

export default async function AboutPage() {
  const team = await fetchTeamMembers();
  const list = Array.isArray(team) ? team : [];

  return (
    <div className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold text-[var(--foreground)]">О нас</h1>
        <p className="mt-4 text-[var(--muted)]">
          Команда 2GTechLab: фото, краткая биография и сертификаты.
        </p>

        {list.length === 0 ? (
          <p className="mt-10 text-[var(--muted)]">Пока нет данных о команде. Добавьте сотрудников в админке.</p>
        ) : (
        <div className="about-team-grid">
          {list.map((member: TeamMember) => {
            const photoUrl = getPhotoUrl(member);
            const isExternal = photoUrl?.startsWith("http");

            return (
              <div
                key={member._id}
                className="flex flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card-bg)]"
              >
                {/* Фото */}
                <div className="relative aspect-[3/2] w-full shrink-0 bg-[var(--border)]">
                  {photoUrl ? (
                    isExternal ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photoUrl}
                        alt={member.name ?? "Сотрудник"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Image
                        src={photoUrl}
                        alt={member.name ?? "Сотрудник"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                    )
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[var(--muted)] text-sm">
                      Нет фото
                    </div>
                  )}
                </div>
                {/* Текст: имя, роль, биография, сертификаты */}
                <div className="flex flex-1 flex-col p-4">
                  <h2 className="text-lg font-semibold text-[var(--foreground)]">{member.name}</h2>
                  {member.role && (
                    <p className="mt-1 text-sm text-[var(--muted)]">{member.role}</p>
                  )}
                  {member.description && (
                    <p className="mt-3 text-sm text-[var(--muted)]">{member.description}</p>
                  )}
                  {member.certificates && member.certificates.length > 0 && (
                    <div className="mt-4 border-t border-[var(--border)] pt-3">
                      <h3 className="text-xs font-semibold uppercase text-[var(--muted)]">
                        Сертификаты
                      </h3>
                      <ul className="mt-2 space-y-1 text-xs text-[var(--foreground)]">
                        {member.certificates.map((cert, idx) => (
                          <li key={idx}>
                            {cert.title}
                            {cert.provider && (
                              <span className="text-[var(--muted)]"> — {cert.provider}</span>
                            )}
                            {cert.year && (
                              <span className="text-[var(--muted)]">, {cert.year}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
}
