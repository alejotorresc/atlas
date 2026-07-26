import { Wallet } from 'lucide-react';
import { Section, SubSection, Example } from './SectionShell';
import { Card, CardEmptyState, CardLoadingState } from '@/components/design-system/Card';
import { Icon } from '@/components/design-system/Icon';
import { Button } from '@/components/design-system/Button';

export function SurfacesSection() {
  return (
    <Section id="surfaces" title="Surfaces" description="Every surface state a card-like element can be in, all rendered with the real Card component.">
      <SubSection title="States">
        <div className="grid gap-[16px] sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="mb-[8px] text-[13px] text-[var(--ds-neutral-500)]">Resting</p>
            <Card>
              <p className="text-[15px] text-[var(--ds-neutral-900)]">Cuenta monetaria</p>
            </Card>
          </div>
          <div>
            <p className="mb-[8px] text-[13px] text-[var(--ds-neutral-500)]">Interactive (hover it)</p>
            <Card state="interactive">
              <p className="text-[15px] text-[var(--ds-neutral-900)]">Cuenta monetaria</p>
            </Card>
          </div>
          <div>
            <p className="mb-[8px] text-[13px] text-[var(--ds-neutral-500)]">Selected</p>
            <Card state="selected">
              <p className="text-[15px] text-[var(--ds-neutral-900)]">Cuenta monetaria</p>
            </Card>
          </div>
          <div>
            <p className="mb-[8px] text-[13px] text-[var(--ds-neutral-500)]">Disabled</p>
            <Card state="disabled">
              <p className="text-[15px] text-[var(--ds-neutral-900)]">Cuenta archivada</p>
            </Card>
          </div>
          <div>
            <p className="mb-[8px] text-[13px] text-[var(--ds-neutral-500)]">Loading</p>
            <Card>
              <CardLoadingState />
            </Card>
          </div>
          <div>
            <p className="mb-[8px] text-[13px] text-[var(--ds-neutral-500)]">Empty state</p>
            <Card>
              <CardEmptyState
                icon={<Icon icon={Wallet} size="lg" />}
                title="Sin cuentas todavia"
                description="Crea tu primera cuenta para empezar a ver tu panorama financiero."
                action={<Button size="sm">Crear cuenta</Button>}
              />
            </Card>
          </div>
        </div>
      </SubSection>

      <SubSection title="Elevation">
        <Example className="flex flex-wrap gap-[24px]">
          <div className="rounded-[var(--ds-radius-lg)] bg-[var(--ds-color-surface)] p-[16px] shadow-[var(--ds-shadow-xs)]">xs — resting card</div>
          <div className="rounded-[var(--ds-radius-lg)] bg-[var(--ds-color-surface)] p-[16px] shadow-[var(--ds-shadow-sm)]">sm — hovered card</div>
          <div className="rounded-[var(--ds-radius-lg)] bg-[var(--ds-color-surface)] p-[16px] shadow-[var(--ds-shadow-md)]">md — popover / toast</div>
          <div className="rounded-[var(--ds-radius-lg)] bg-[var(--ds-color-surface)] p-[16px] shadow-[var(--ds-shadow-lg)]">lg — dialog / sheet</div>
        </Example>
      </SubSection>
    </Section>
  );
}
