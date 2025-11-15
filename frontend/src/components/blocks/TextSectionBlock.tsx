interface TextSectionBlockProps {
  heading?: string;
  content: any;
}

export function TextSectionBlock({ heading, content }: TextSectionBlockProps) {
  // Simple rendering - Payload rich text can be enhanced with proper renderer
  const renderContent = () => {
    if (typeof content === 'string') return content;
    return JSON.stringify(content);
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {heading && (
            <h2 className="text-3xl font-bold mb-6">{heading}</h2>
          )}
          <div className="prose prose-lg max-w-none">
            {renderContent()}
          </div>
        </div>
      </div>
    </section>
  );
}

