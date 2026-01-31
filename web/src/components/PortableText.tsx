import { PortableText as BasePortableText, type PortableTextComponents } from "@portabletext/react";

const components: Partial<PortableTextComponents> = {
  block: {
    h2: ({ children }) => (
      <h2 className="mb-4 mt-8 text-2xl font-bold text-[var(--foreground)]">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-3 mt-6 text-xl font-semibold text-[var(--foreground)]">{children}</h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-4 border-l-4 border-[var(--accent)] pl-4 text-[var(--muted)]">
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
  },
};

type Content = unknown;

export default function PortableText({ value }: { value: Content }) {
  if (!value || !Array.isArray(value)) return null;
  return (
    <div className="max-w-none [&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-[var(--muted)]">
      <BasePortableText value={value} components={components} />
    </div>
  );
}
