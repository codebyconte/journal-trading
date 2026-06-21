import { websiteJsonLd, protocolPageJsonLd } from '@/lib/seo'

interface JsonLdProps {
  data: Record<string, unknown>
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export function SiteJsonLd() {
  return <JsonLd data={websiteJsonLd()} />
}

export function ProtocolJsonLd() {
  return <JsonLd data={protocolPageJsonLd()} />
}
