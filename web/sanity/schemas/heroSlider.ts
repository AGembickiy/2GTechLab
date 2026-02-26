import { defineField, defineType } from "sanity";

export const heroSlider = defineType({
  name: "heroSlider",
  title: "Слайдер под шапкой",
  type: "document",
  description: "5–7 фото под шапкой сайта. Отображаются в виде хаотично разбросанных фото; при наведении фото выходит на передний план.",
  fields: [
    defineField({
      name: "items",
      title: "Фото слайдера",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "image",
              title: "Изображение",
              type: "image",
              options: { hotspot: true },
              validation: (Rule) => Rule.required(),
            },
            {
              name: "alt",
              title: "Подпись (alt)",
              type: "string",
              description: "Для доступности и SEO",
            },
            {
              name: "order",
              title: "Порядок",
              type: "number",
              initialValue: 0,
            },
          ],
          preview: {
            select: { alt: "alt", media: "image" },
            prepare({ alt, media }: { alt?: string; media?: unknown }) {
              return {
                title: alt || "Фото слайдера",
                media,
              };
            },
          },
        },
      ],
      validation: (Rule) =>
        Rule.max(7).warning("Рекомендуется не более 7 фото").min(1).error("Добавьте хотя бы одно фото"),
    }),
  ],
  preview: {
    select: { items: "items" },
    prepare({ items }: { items?: unknown[] }) {
      const count = Array.isArray(items) ? items.length : 0;
      return {
        title: "Слайдер под шапкой",
        subtitle: `${count} фото`,
      };
    },
  },
});
