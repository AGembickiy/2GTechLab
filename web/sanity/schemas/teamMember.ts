import { defineField, defineType } from "sanity";

export const teamMember = defineType({
  name: "teamMember",
  title: "Сотрудник",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Имя и фамилия",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "role",
      title: "Должность / роль",
      type: "string",
    }),
    defineField({
      name: "photo",
      title: "Фото сотрудника",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "description",
      title: "Краткое описание",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "certificates",
      title: "Сертификаты пройденных курсов",
      type: "array",
      of: [
        defineField({
          name: "certificate",
          title: "Сертификат",
          type: "object",
          fields: [
            {
              name: "title",
              title: "Название курса / сертификата",
              type: "string",
              validation: (rule) => rule.required(),
            },
            {
              name: "provider",
              title: "Организация",
              type: "string",
            },
            {
              name: "year",
              title: "Год",
              type: "string",
            },
          ],
          preview: {
            select: { title: "title", subtitle: "provider" },
            prepare({ title, subtitle }: { title?: string; subtitle?: string }) {
              return {
                title: title || "Сертификат",
                subtitle: subtitle,
              };
            },
          },
        }),
      ],
    }),
    defineField({
      name: "order",
      title: "Порядок",
      type: "number",
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "role",
      media: "photo",
    },
  },
});

