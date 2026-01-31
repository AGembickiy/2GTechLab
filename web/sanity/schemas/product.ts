import { defineField, defineType } from "sanity";

export const product = defineType({
  name: "product",
  title: "Товары",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Название",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "URL (slug)",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Описание",
      type: "text",
    }),
    defineField({
      name: "price",
      title: "Цена (руб)",
      type: "number",
    }),
    defineField({
      name: "images",
      title: "Изображения",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "category",
      title: "Категория",
      type: "string",
      options: {
        list: [
          { title: "Фигурки", value: "figurines" },
          { title: "Прототипы", value: "prototypes" },
          { title: "Утилитарные изделия", value: "utilities" },
          { title: "Сувениры", value: "souvenirs" },
          { title: "Прочее", value: "other" },
        ],
      },
    }),
    defineField({
      name: "material",
      title: "Материал",
      type: "string",
      options: {
        list: [
          { title: "PLA", value: "pla" },
          { title: "ABS", value: "abs" },
          { title: "PETG", value: "petg" },
          { title: "TPU", value: "tpu" },
          { title: "Другое", value: "other" },
        ],
      },
    }),
    defineField({
      name: "featured",
      title: "Показать на главной",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "title", media: "images.0" },
    prepare({ title, media }) {
      return {
        title,
        media,
      };
    },
  },
});
