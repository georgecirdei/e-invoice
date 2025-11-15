interface HeroBlockProps {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
}

export function HeroBlock({ title, subtitle, ctaText, ctaLink }: HeroBlockProps) {
  return (
    <section className="relative bg-gradient-to-r from-primary to-blue-600 text-white py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              {subtitle}
            </p>
          )}
          {ctaText && ctaLink && (
            <a
              href={ctaLink}
              className="inline-block bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              {ctaText}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

