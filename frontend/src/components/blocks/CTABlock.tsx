interface CTABlockProps {
  heading: string;
  description?: string;
  buttonText: string;
  buttonLink: string;
}

export function CTABlock({ heading, description, buttonText, buttonLink }: CTABlockProps) {
  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">{heading}</h2>
          {description && (
            <p className="text-xl mb-8 opacity-90">{description}</p>
          )}
          <a
            href={buttonLink}
            className="inline-block bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
          >
            {buttonText}
          </a>
        </div>
      </div>
    </section>
  );
}

