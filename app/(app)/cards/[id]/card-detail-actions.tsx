'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { ActionForm } from '@/components/forms/action-form';
import { archiveCard, payCard, updateCard, type PayCardResult } from '@/features/cards/actions';
import { todayISO } from '@/lib/dates/format';
import { NumericDisplay } from '@/components/design-system/NumericDisplay';
import { Card } from '@/components/ui/card';
import type { Account, CreditCard } from '@/types/database';

export function CardDetailActions({ card, accounts }: { card: CreditCard; accounts: Account[] }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [confirmExceeds, setConfirmExceeds] = useState(false);
  const [lastPayment, setLastPayment] = useState<PayCardResult | null>(null);

  async function handleArchive() {
    if (!confirm('Archivar esta tarjeta?')) return;
    const result = await archiveCard(card.id);
    if (!result.error) router.push('/cards');
  }

  async function handlePay(formData: FormData): Promise<PayCardResult> {
    if (confirmExceeds) formData.set('confirm_exceeds_balance', 'on');
    const result = await payCard(card.id, formData);
    if (result.error === 'CONFIRM_EXCEEDS_ACCOUNT_BALANCE') {
      return { error: 'El monto excede el saldo de la cuenta origen. Marca la casilla para confirmar y reintenta.' };
    }
    if (result.error === 'CONFIRM_EXCEEDS_CARD_BALANCE') {
      return { error: 'El monto excede el saldo actual de la tarjeta. Marca la casilla para confirmar y reintenta.' };
    }
    return result;
  }

  return (
    <div>
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => setPayOpen(true)}>Registrar pago</Button>
      <Button variant="secondary" onClick={() => setEditOpen(true)}>
        Editar
      </Button>
      <Button variant="danger" onClick={handleArchive}>
        Archivar
      </Button>

      <Dialog open={payOpen} onClose={() => setPayOpen(false)} title="Registrar pago de tarjeta">
        <ActionForm
          action={handlePay}
          onSuccess={(result) => {
            setPayOpen(false);
            setLastPayment(result);
          }}
          submitLabel="Pagar"
        >
          <div>
            <Label htmlFor="source_account_id">Cuenta origen</Label>
            <Select
              id="source_account_id"
              name="source_account_id"
              required
              placeholder="Selecciona una cuenta"
              options={accounts.map((a) => ({ value: a.id, label: a.name }))}
            />
          </div>
          <div>
            <Label htmlFor="pay-amount">Monto</Label>
            <Input id="pay-amount" name="amount" required />
          </div>
          <div>
            <Label htmlFor="pay-date">Fecha</Label>
            <DatePicker id="pay-date" name="transaction_date" defaultValue={todayISO()} required />
          </div>
          <div>
            <Label htmlFor="pay-desc">Descripcion</Label>
            <Input id="pay-desc" name="description" defaultValue="Pago de tarjeta" required />
          </div>
          <div className="flex items-center gap-[8px]">
            <Checkbox id="confirm-exceeds" checked={confirmExceeds} onCheckedChange={(v) => setConfirmExceeds(v === true)} />
            <Label htmlFor="confirm-exceeds" className="mb-0">
              Confirmo el monto aunque exceda el saldo disponible o de la tarjeta
            </Label>
          </div>
        </ActionForm>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} title="Editar tarjeta">
        <ActionForm action={(fd) => updateCard(card.id, fd)} onSuccess={() => setEditOpen(false)}>
          <div>
            <Label htmlFor="edit-card-name">Nombre</Label>
            <Input id="edit-card-name" name="name" defaultValue={card.name} required />
          </div>
          <div>
            <Label htmlFor="edit-card-institution">Institucion</Label>
            <Input id="edit-card-institution" name="institution_name" defaultValue={card.institution_name ?? ''} />
          </div>
          <div>
            <Label htmlFor="edit-card-last4">Ultimos 4 digitos</Label>
            <Input id="edit-card-last4" name="last_four" defaultValue={card.last_four ?? ''} maxLength={4} />
          </div>
          <div>
            <Label htmlFor="edit-card-limit">Limite de credito</Label>
            <Input id="edit-card-limit" name="credit_limit" defaultValue={(card.credit_limit_minor / 100).toFixed(2)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-card-statement">Dia de corte</Label>
              <Input id="edit-card-statement" name="statement_day" type="number" min={1} max={31} defaultValue={card.statement_day} required />
            </div>
            <div>
              <Label htmlFor="edit-card-due">Dia de pago</Label>
              <Input id="edit-card-due" name="payment_due_day" type="number" min={1} max={31} defaultValue={card.payment_due_day} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-card-apr">Tasa de interes anual (APR %)</Label>
              <Input id="edit-card-apr" name="annual_interest_rate" defaultValue={card.annual_interest_rate ?? ''} placeholder="24.99" />
            </div>
            <div>
              <Label htmlFor="edit-card-method">Metodo de calculo de interes</Label>
              <Select
                id="edit-card-method"
                name="interest_calculation_method"
                defaultValue={card.interest_calculation_method}
                options={[
                  { value: 'statement_balance', label: 'Saldo de estado de cuenta' },
                  { value: 'average_daily_balance', label: 'Promedio diario (aproximado)' },
                ]}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-card-min-payment">Pago minimo fijo</Label>
              <Input
                id="edit-card-min-payment"
                name="minimum_payment"
                defaultValue={card.minimum_payment_minor != null ? (card.minimum_payment_minor / 100).toFixed(2) : ''}
                placeholder="Opcional"
              />
            </div>
            <div>
              <Label htmlFor="edit-card-min-pct">Pago minimo (% del saldo)</Label>
              <Input
                id="edit-card-min-pct"
                name="minimum_payment_percentage"
                defaultValue={card.minimum_payment_percentage != null ? (card.minimum_payment_percentage * 100).toString() : ''}
                placeholder="Opcional"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-card-late-fee">Cargo por mora</Label>
              <Input id="edit-card-late-fee" name="late_fee" defaultValue={(card.late_fee_minor / 100).toFixed(2)} />
            </div>
            <div>
              <Label htmlFor="edit-card-annual-fee">Cuota anual</Label>
              <Input id="edit-card-annual-fee" name="annual_fee" defaultValue={(card.annual_fee_minor / 100).toFixed(2)} />
            </div>
          </div>
          <div>
            <Label htmlFor="edit-card-free-days">Dias sin intereses (periodo de gracia)</Label>
            <Input id="edit-card-free-days" name="interest_free_days" type="number" min={0} max={90} defaultValue={card.interest_free_days} />
          </div>
          <div className="flex items-center gap-[8px]">
            <Checkbox id="edit-card-agreement" name="in_payment_agreement" defaultChecked={card.in_payment_agreement} />
            <Label htmlFor="edit-card-agreement" className="mb-0">
              Esta tarjeta esta en un acuerdo de pago
            </Label>
          </div>
        </ActionForm>
      </Dialog>
    </div>

      {lastPayment?.success && lastPayment.interestPortionMinor != null && lastPayment.principalPortionMinor != null && (
        <Card className="mt-[16px] max-w-[420px]">
          <h3 className="font-display mb-[12px] text-[13px] font-medium tracking-[0.02em] text-[var(--ds-neutral-500)]">DESGLOSE DEL PAGO</h3>
          <dl className="space-y-[8px]">
            <div className="flex items-center justify-between">
              <dt className="text-[13px] text-[var(--ds-neutral-600)]">Pago</dt>
              <dd><NumericDisplay amountMinor={lastPayment.amountMinor ?? 0} currency={card.currency} size="small" /></dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-[13px] text-[var(--ds-neutral-600)]">Aplicado a interes</dt>
              <dd><NumericDisplay amountMinor={lastPayment.interestPortionMinor} currency={card.currency} size="small" /></dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-[13px] text-[var(--ds-neutral-600)]">Aplicado a principal</dt>
              <dd><NumericDisplay amountMinor={lastPayment.principalPortionMinor} currency={card.currency} size="small" /></dd>
            </div>
          </dl>
        </Card>
      )}
    </div>
  );
}
