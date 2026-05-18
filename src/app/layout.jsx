import './globals.css'
import Providers from '@/components/Providers'

export const metadata = {
  title: 'Magenta Investments LLC — Purchase Approval',
  description: 'Procurement management and approval workflow for Magenta Investments LLC',
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
