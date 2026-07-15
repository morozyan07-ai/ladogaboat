import Link from 'next/link'
import { getSession } from '@/lib/session'
import HeaderNav from '@/components/layout/HeaderNav'

export default async function Header() {
  const session = await getSession()

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-1.5">
          <Link href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="data:image/webp;base64,UklGRloDAABXRUJQVlA4IE4DAABwFQCdASq3AGAAPikUiEMhoSERWqwQGAKEtLdwuOzbbcO0DeLeYDHAPQA6UP9lPR0uY3Pa+OvVLJrvY/lu1Cv+E3gjjH8H/xX45cwHa78YNF9/efyA/s3wyf1X3Ge0f6e/43uCfyL+f/5r8uf3/5ZH9gAu/n7RR/rcq9oo/1tuo+G+4V1kSnGaiSkyD+i46I16qBV0m/SggaiORcd42fxpK7Jf3dYqvaKP9blXtFH+tyr2dAAA/v/OeqncAGgwrm4LPPerBSfD6v9oebUU/rnJ1zvMP8f1s/QnRBeNwmxDqeD44n//PMa+TQvz/N//08wQ/GKc4lLhv1a6INuUqZlK/5U/5thxPs+X9C7M/Bn619DsJl0r2NqsxIYiH+lc5Vsl6eTatmpRlaaVRnG8DXeyvh5/f1clUSlH4Wug/n3k9iQUlDbfsrZyLC6CEidbVP/ZtTpHB5WOoO1v8A4SlJy8ABjwGUS1aCSs9Kpk+RRv7kevz42Rojr4MIJwDKhI4KHSKchs420nNs8DOKulhSpO7vwYY2mz+JwblK/kgLyl8nABJHuEi3B2P967y8pqF+0r3y8Emo2WFH0H5fxxCJrvJWwVqh3uuWOI8A8p+psXF+M683vACcjCs+3zuQPX6CZHTHQ4UOifl20P/n4t8Z515YffQY/1tnu4WZzBw9lVuHJO0ISKS56hy7V3mRh1e4vW6KA+mLyhgsavYuxtUXRzj3EWIENMu4TXO+4TDaBv/S+kXwdRcW9M35eRr85Y/j+r/8iRL0aHVffbZxpRdOltBMtUktYsC5A9cmnIZA77z59m36z+se4zYLT3kbBNCS1Xs78HCcHlZmbb1/fKe4nQPmZnTfgHovhbckwIAYBwYOh5FRTNT0xLZIwR765F3slJxm0J9b/9EJI5vkvbmHkwjDULUdRhjqENH8Om9ousdldfgl7f/kRv3bDSRXepeS6ZQv5bVmo4IqS7s1UcQIvTxeLIlQOy8//cB8EnDpy6iJXtgNwH8rF8UkoqN3W/tXpJE/i1EWnkP7leu5+rKrZLc37tVHH4FR0L/TCzj/LYpJkgKnkV92OW7vhvR4lTRiAOgDRYAB+A3Ny0U1hZvdY/6ZEi//lrYmEdAAAAAAA="
              alt="Ladoga Boat"
              style={{ height: '44px', width: 'auto' }}
            />
          </Link>
          <HeaderNav role={session?.role ?? null} />
        </div>
      </div>
    </header>
  )
}
