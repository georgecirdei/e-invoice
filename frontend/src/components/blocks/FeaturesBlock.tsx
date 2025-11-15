interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface FeaturesBlockProps {
  heading?: string;
  features: Feature[];
}

export function FeaturesBlock({ heading, features }: FeaturesBlockProps) {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        {heading && (
          <h2 className="text-4xl font-bold text-center mb-16">{heading}</h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

