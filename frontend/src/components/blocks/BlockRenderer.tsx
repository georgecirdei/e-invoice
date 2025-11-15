import { HeroBlock } from './HeroBlock';
import { FeaturesBlock } from './FeaturesBlock';
import { ContactFormBlock } from './ContactFormBlock';
import { CTABlock } from './CTABlock';
import { TextSectionBlock } from './TextSectionBlock';

interface BlockRendererProps {
  block: any;
}

export function BlockRenderer({ block }: BlockRendererProps) {
  switch (block.blockType) {
    case 'hero':
      return <HeroBlock {...block} />;
    case 'features':
      return <FeaturesBlock {...block} />;
    case 'contactForm':
      return <ContactFormBlock {...block} />;
    case 'cta':
      return <CTABlock {...block} />;
    case 'textSection':
      return <TextSectionBlock {...block} />;
    default:
      return null;
  }
}

