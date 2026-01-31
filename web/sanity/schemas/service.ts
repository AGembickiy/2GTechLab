import { defineField, defineType } from "sanity";

export const service = defineType({
  name: "service",
  title: "Услуги",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Название",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Описание",
      type: "text",
    }),
    defineField({
      name: "icon",
      title: "Иконка",
      type: "string",
      description: "Название иконки (например: printer, design, prototype)",
      options: {
        list: [
          { title: "Принтер", value: "printer" },
          { title: "Дизайн", value: "design" },
          { title: "Прототип", value: "prototype" },
          { title: "Моделирование", value: "modeling" },
          { title: "Консультация", value: "consult" },
        ],
      },
    }),
    defineField({
      name: "order",
      title: "Порядок отображения",
      type: "number",
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: "По порядку",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
});
