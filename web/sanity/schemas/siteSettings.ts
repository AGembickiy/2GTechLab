import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Настройки сайта",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Название сайта",
      type: "string",
      initialValue: "2G Tech Lab",
    }),
    defineField({
      name: "description",
      title: "Описание сайта (SEO)",
      type: "text",
    }),
    defineField({
      name: "phone",
      title: "Телефон",
      type: "string",
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
    }),
    defineField({
      name: "address",
      title: "Адрес",
      type: "string",
    }),
    defineField({
      name: "socialLinks",
      title: "Социальные сети",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "platform", title: "Платформа", type: "string", options: { list: ["vk", "telegram", "whatsapp", "youtube"] } },
            { name: "url", title: "URL", type: "url" },
          ],
          preview: {
            select: { platform: "platform" },
            prepare({ platform }: { platform?: string }) {
              return { title: platform || "Соцсеть" };
            },
          },
        },
      ],
    }),
    defineField({
      name: "heroTitle",
      title: "Заголовок на главной",
      type: "string",
    }),
    defineField({
      name: "heroSubtitle",
      title: "Подзаголовок на главной",
      type: "text",
    }),
  ],
});
