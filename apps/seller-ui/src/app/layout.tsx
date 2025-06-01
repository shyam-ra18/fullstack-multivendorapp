import './global.css';
import Providers from './providers';

export const metadata = {
  title: 'Multivendor Eshop | Seller',
  description: 'Multivendonor e-commerce seller app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <Providers>
        <body>{children}</body>
      </Providers>

    </html>
  )
}
