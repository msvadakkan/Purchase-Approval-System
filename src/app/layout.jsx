import './globals.css'
import Providers from '@/components/Providers'

export const metadata = {
  title: 'Purchase Approval System',
  description: 'Procurement management and approval workflow',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
