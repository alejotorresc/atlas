import { Section, SubSection, Example, RuleList, Rule } from './SectionShell';
import { FormField } from '@/components/design-system/FormField';
import { Input, CurrencyInput, SearchInput, PasswordInput, Textarea, Select } from '@/components/design-system/Input';
import { Checkbox, Radio, Switch } from '@/components/design-system/Toggle';
import { SegmentedControlDemo } from './forms-demo';

export function FormsSection() {
  return (
    <Section id="forms" title="Forms" description="Every input type used across ATLAS, built on one shared visual language. Forms should feel effortless, not like paperwork.">
      <SubSection title="Rules">
        <RuleList>
          <Rule>Minimize required fields — every field is a small tax on the user&apos;s attention.</Rule>
          <Rule>Use sensible defaults (today&apos;s date, the last-used account, the current month) instead of asking.</Rule>
          <Rule>Autofocus the first field when a form&apos;s sole purpose is data entry (e.g. a dialog that just opened).</Rule>
          <Rule>Use the correct mobile keyboard for the data — inputMode=&quot;decimal&quot; for money, type=&quot;email&quot; for email, never a generic text keyboard for numbers.</Rule>
          <Rule>Never make the user think about formatting — accept &quot;1500&quot; or &quot;1,500.00&quot; and normalize it, don&apos;t reject it.</Rule>
          <Rule>Prefer inline validation (see the error example below) over a modal or toast error after submit.</Rule>
        </RuleList>
      </SubSection>

      <div className="grid gap-[24px] sm:grid-cols-2">
        <FormField htmlFor="sg-text" label="Texto">
          <Input id="sg-text" placeholder="Nombre de la cuenta" />
        </FormField>
        <FormField htmlFor="sg-number" label="Numero">
          <Input id="sg-number" type="number" placeholder="0" />
        </FormField>
        <FormField htmlFor="sg-currency" label="Monto" helperText="Alineado a la derecha, cifras tabulares.">
          <CurrencyInput id="sg-currency" placeholder="0.00" />
        </FormField>
        <FormField htmlFor="sg-search" label="Buscar">
          <SearchInput id="sg-search" placeholder="Descripcion o comercio" />
        </FormField>
        <FormField htmlFor="sg-date" label="Fecha">
          <Input id="sg-date" type="date" />
        </FormField>
        <FormField htmlFor="sg-password" label="Contrasena">
          <PasswordInput id="sg-password" placeholder="********" />
        </FormField>
        <FormField htmlFor="sg-select" label="Categoria">
          <Select id="sg-select" defaultValue="">
            <option value="" disabled>
              Selecciona una categoria
            </option>
            <option>Alimentacion</option>
            <option>Transporte</option>
            <option>Vivienda</option>
          </Select>
        </FormField>
        <FormField htmlFor="sg-error" label="Con error" error="Este campo es requerido">
          <Input id="sg-error" aria-invalid placeholder="Descripcion" />
        </FormField>
      </div>

      <FormField htmlFor="sg-textarea" label="Nota (textarea)">
        <Textarea id="sg-textarea" placeholder="Notas adicionales sobre este movimiento" />
      </FormField>

      <SubSection title="Selection controls">
        <Example className="flex flex-wrap items-center gap-[32px]">
          <label className="flex items-center gap-[8px] text-[15px] text-[var(--ds-neutral-900)]">
            <Checkbox defaultChecked /> Incluir en saldo disponible
          </label>
          <label className="flex items-center gap-[8px] text-[15px] text-[var(--ds-neutral-900)]">
            <Radio name="sg-radio-demo" defaultChecked /> Cuenta
          </label>
          <label className="flex items-center gap-[8px] text-[15px] text-[var(--ds-neutral-900)]">
            <Radio name="sg-radio-demo" /> Tarjeta
          </label>
          <label className="flex items-center gap-[12px] text-[15px] text-[var(--ds-neutral-900)]">
            Notificaciones <Switch defaultChecked />
          </label>
        </Example>
      </SubSection>

      <SubSection title="Segmented control">
        <Example>
          <SegmentedControlDemo />
        </Example>
      </SubSection>
    </Section>
  );
}
