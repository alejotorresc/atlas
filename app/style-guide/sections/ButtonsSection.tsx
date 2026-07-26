import { Plus } from 'lucide-react';
import { Section, SubSection, Example } from './SectionShell';
import { Button } from '@/components/design-system/Button';
import { Icon } from '@/components/design-system/Icon';

export function ButtonsSection() {
  return (
    <Section id="buttons" title="Buttons" description="One Button component, six variants. Hover/pressed states are real CSS — try them.">
      <SubSection title="Variants">
        <Example className="flex flex-wrap items-center gap-[16px]">
          <Button variant="primary">Registrar movimiento</Button>
          <Button variant="secondary">Cancelar</Button>
          <Button variant="ghost">Omitir</Button>
          <Button variant="danger">Eliminar</Button>
          <Button variant="icon" size="iconMd" aria-label="Agregar">
            <Icon icon={Plus} />
          </Button>
          <Button variant="fab" size="fab" aria-label="Nuevo movimiento">
            <Icon icon={Plus} size="lg" />
          </Button>
        </Example>
      </SubSection>

      <SubSection title="Sizes">
        <Example className="flex flex-wrap items-center gap-[16px]">
          <Button size="sm">Pequeno</Button>
          <Button size="md">Mediano (default, 44px)</Button>
          <Button size="lg">Grande</Button>
        </Example>
      </SubSection>

      <SubSection title="States">
        <Example className="flex flex-wrap items-center gap-[16px]">
          <Button>Default</Button>
          <Button disabled>Disabled</Button>
          <Button loading>Loading</Button>
        </Example>
        <p className="mt-[12px] text-[13px] text-[var(--ds-neutral-500)]">
          Hover and pressed states are live on every button above — hover reduces to `hover:bg-primary-hover`, a
          press scales to 98% for 80ms, both driven by the motion tokens.
        </p>
      </SubSection>
    </Section>
  );
}
