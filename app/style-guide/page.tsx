import { IntroductionSection } from './sections/IntroductionSection';
import { PrinciplesSection } from './sections/PrinciplesSection';
import { TypographySection } from './sections/TypographySection';
import { ColorsSection } from './sections/ColorsSection';
import { IconsSection } from './sections/IconsSection';
import { SpacingSection } from './sections/SpacingSection';
import { LayoutSection } from './sections/LayoutSection';
import { SurfacesSection } from './sections/SurfacesSection';
import { ButtonsSection } from './sections/ButtonsSection';
import { FormsSection } from './sections/FormsSection';
import { CardsSection } from './sections/CardsSection';
import { ChartsSection } from './sections/ChartsSection';
import { MotionSection } from './sections/MotionSection';
import { AccessibilitySection } from './sections/AccessibilitySection';
import { MobileSection } from './sections/MobileSection';
import { WritingSection } from './sections/WritingSection';
import { PlaygroundSection } from './sections/PlaygroundSection';

export default function StyleGuidePage() {
  return (
    <div>
      <IntroductionSection />
      <PrinciplesSection />
      <TypographySection />
      <ColorsSection />
      <IconsSection />
      <SpacingSection />
      <LayoutSection />
      <SurfacesSection />
      <ButtonsSection />
      <FormsSection />
      <CardsSection />
      <ChartsSection />
      <MotionSection />
      <AccessibilitySection />
      <MobileSection />
      <WritingSection />
      <PlaygroundSection />
    </div>
  );
}
