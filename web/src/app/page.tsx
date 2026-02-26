import Link from "next/link";

export default function HomePage() {
  const features = [
    {
      text: "Разработка",
      subtext: "Воплотим идею",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
      )
    },
    {
      text: "Высшее качество",
      subtext: "Точность, надежность",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
      )
    },
    {
      text: "Изготовим в срок",
      subtext: "Соблюдаем дедлайны",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      text: "Быстрая доставка",
      subtext: "Бережно вовремя",
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.806H14.25M16.5 18.75h-2.25m0-11.25v11.25m-10.5-6h10.5" />
        </svg>
      )
    }
  ];

  return (
    <div className="home-content">
      <div className="cta-row">
        <Link href="/order" className="cta-btn cta-btn--blue">ЗАКАЗАТЬ</Link>
        <Link href="/catalog" className="cta-btn cta-btn--purple">КУПИТЬ</Link>
        <Link href="/models" className="cta-btn cta-btn--blue">МОДЕЛИ</Link>
      </div>
      <div className="features-grid">
        {features.map((f, i) => (
          <div key={i} className="feature-tile group hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
            <div className="feature-tile__icon group-hover:scale-125 transition-transform duration-500 ease-out text-blue-400">{f.icon}</div>
            <div className="flex flex-col">
              <div><span className="feature-tile__text group-hover:text-blue-300 transition-colors">{f.text}</span></div>
              <div><span className="feature-tile__subtext">{f.subtext}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
