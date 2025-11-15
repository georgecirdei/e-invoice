import { notFound } from 'next/navigation';
import { BlockRenderer } from '@/components/blocks/BlockRenderer';

async function getPage(slug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/pages/${slug}`,
      { cache: 'no-store' }
    );
    
    if (!res.ok) return null;
    
    const data = await res.json();
    return data.data?.page;
  } catch (error) {
    return null;
  }
}

export default async function CMSPage({ params }: { params: Promise<{ slug: string }> }) {
  // Await params in Next.js 15
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <title>{page.title}</title>
      <meta name="description" content={page.metaDescription || ''} />
      
      {page.blocks?.map((block: any, index: number) => (
        <BlockRenderer key={block.id || index} block={block} />
      ))}
    </div>
  );
}

