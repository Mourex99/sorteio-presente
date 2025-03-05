export const metadata = {
  title: 'Sorteio de Presentes',
  description: 'Aplicativo para sorteio de presentes',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          rel="preload"
          href="/fonts/GlacialIndifference-Regular.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/GlacialIndifference-Bold.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Apricots.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
