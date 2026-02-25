import { defineField, defineType } from "sanity";

export const review = defineType({
  name: "review",
  title: "Отзывы",
  type: "document",
  fields: [
    defineField({
      name: "authorName",
      title: "Имя автора",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "text",
      title: "Текст отзыва",
      type: "text",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "rating",
      title: "Рейтинг (1-5)",
      type: "number",
      validation: (Rule) => Rule.min(1).max(5),
    }),
    defineField({
      name: "date",
      title: "Дата",
      type: "datetime",
    }),
    defineField({
      name: "approved",
      title: "Одобрен для публикации",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: { authorName: "authorName", text: "text" },
    prepare({ authorName, text }) {
      return {
        title: authorName,
        subtitle: text?.slice(0, 50) + (text && text.length > 50 ? "..." : ""),
      };
    },
  },
});
