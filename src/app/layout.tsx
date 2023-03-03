import './globals.css';

export const metadata = {
  title: 'Learning Next.js using ChatGPT',
  description: 'Using GPT-3 to get amazing tips on how to learn Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body>
        <div className='max-w-4xl mx-auto w-full px-6'>{children}</div>
      </body>
    </html>
  );
}
