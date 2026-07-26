import { Section, SubSection } from './SectionShell';

const LANGUAGE_PAIRS = [
  { avoid: 'Saldo disponible calculado', prefer: 'Puedes gastar' },
  { avoid: 'Obligaciones pendientes de pago', prefer: 'Proximos pagos' },
  { avoid: 'Presupuesto: 82% consumido', prefer: 'Presupuesto casi al limite' },
  { avoid: 'Sin alertas activas en el sistema', prefer: 'Todo esta bajo control' },
  { avoid: 'Se recomienda ejecutar la siguiente accion', prefer: 'Accion recomendada' },
  { avoid: 'Transaccion registrada exitosamente', prefer: 'Listo, ya quedo registrado' },
];

const VOICE_TRAITS = [
  { trait: 'Clara', body: 'Una idea por oracion. Si una alerta necesita dos lecturas para entenderse, esta mal escrita.' },
  { trait: 'Humana', body: 'Escribe como se lo dirias a un amigo que te pregunta como van sus finanzas, no como un reporte contable.' },
  { trait: 'Calmada', body: 'Incluso un saldo negativo se comunica sin signos de exclamacion ni mayusculas.' },
  { trait: 'De apoyo', body: 'El tono asume que el usuario quiere mejorar, no que esta fallando.' },
];

export function WritingSection() {
  return (
    <Section id="writing" title="Voice & financial language" description="ATLAS is not a spreadsheet. The interface communicates decisions, not accounting terminology.">
      <SubSection title="Prefer this, not that">
        <div className="overflow-x-auto rounded-[var(--ds-radius-lg)] border border-[var(--ds-neutral-200)]">
          <table className="w-full text-[13px]">
            <thead className="bg-[var(--ds-neutral-50)] text-left text-[var(--ds-neutral-500)]">
              <tr>
                <th className="px-[16px] py-[8px]">Evitar</th>
                <th className="px-[16px] py-[8px]">Preferir</th>
              </tr>
            </thead>
            <tbody>
              {LANGUAGE_PAIRS.map((p) => (
                <tr key={p.prefer} className="border-t border-[var(--ds-neutral-200)]">
                  <td className="px-[16px] py-[8px] text-[var(--ds-neutral-500)] line-through decoration-[var(--ds-color-danger)]">{p.avoid}</td>
                  <td className="px-[16px] py-[8px] font-medium text-[var(--ds-neutral-900)]">{p.prefer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SubSection>

      <SubSection title="Voice">
        <div className="grid gap-[16px] sm:grid-cols-2">
          {VOICE_TRAITS.map((v) => (
            <div key={v.trait} className="rounded-[var(--ds-radius-lg)] border border-[var(--ds-neutral-200)] p-[16px]">
              <p className="text-[15px] font-medium text-[var(--ds-neutral-900)]">{v.trait}</p>
              <p className="mt-[8px] text-[13px] text-[var(--ds-neutral-600)]">{v.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-[16px] text-[13px] text-[var(--ds-neutral-600)]">
          Never: alarming (&quot;PRESUPUESTO EXCEDIDO&quot;), robotic (&quot;Error 400: solicitud invalida&quot;), or
          corporate (&quot;Estimado usuario, le informamos que...&quot;).
        </p>
      </SubSection>
    </Section>
  );
}
