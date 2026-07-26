import { AlertCircle, AlertOctagon, AlertTriangle, CheckCircle2, Handshake, Layers, ShieldCheck, TrendingUp, type LucideIcon } from 'lucide-react';
import type { DebtStatus } from '@/lib/finance/debt-status';
import type { BadgeProps } from '@/components/design-system/Badge';

export interface DebtStatusMeta {
  label: string;
  icon: LucideIcon;
  tone: NonNullable<BadgeProps['tone']>;
  explanation: string;
  action: string;
}

export const DEBT_STATUS_META: Record<DebtStatus, DebtStatusMeta> = {
  paid_in_full: {
    label: 'Pagado en su totalidad',
    icon: CheckCircle2,
    tone: 'success',
    explanation: 'No tienes saldo pendiente en esta tarjeta.',
    action: 'Sigue usando la tarjeta con responsabilidad para mantener este estado.',
  },
  current: {
    label: 'Al dia',
    icon: ShieldCheck,
    tone: 'success',
    explanation: 'Tu ultimo estado de cuenta fue pagado en su totalidad, asi que no deberias generar intereses este ciclo.',
    action: 'Continua pagando el saldo completo cada mes para evitar intereses.',
  },
  generating_interest: {
    label: 'Generando intereses',
    icon: TrendingUp,
    tone: 'warning',
    explanation: 'Tu saldo esta rotando y se cobra interes cada ciclo.',
    action: 'Aumenta el pago de este mes para reducir los intereses futuros.',
  },
  financing_balance: {
    label: 'Financiando saldo',
    icon: Layers,
    tone: 'info',
    explanation: 'Tienes un plan de cuotas activo en esta tarjeta.',
    action: 'Revisa que las cuotas esten al dia para evitar cargos adicionales.',
  },
  minimum_payment_only: {
    label: 'Solo pago minimo',
    icon: AlertTriangle,
    tone: 'caution',
    explanation: 'Solo estas cubriendo el pago minimo, lo que extiende tu deuda y el interes total pagado.',
    action: 'Paga mas del minimo para salir de la deuda mas rapido.',
  },
  past_due: {
    label: 'Pago atrasado',
    icon: AlertOctagon,
    tone: 'danger',
    explanation: 'El pago de esta tarjeta esta vencido.',
    action: 'Realiza un pago lo antes posible para evitar cargos por mora.',
  },
  over_limit: {
    label: 'Sobre el limite',
    icon: AlertCircle,
    tone: 'danger',
    explanation: 'Tu saldo actual supera el limite de credito de la tarjeta.',
    action: 'Realiza un pago para volver a estar dentro de tu limite.',
  },
  payment_agreement: {
    label: 'Acuerdo de pago',
    icon: Handshake,
    tone: 'info',
    explanation: 'Esta tarjeta esta marcada bajo un acuerdo de pago especial.',
    action: 'Sigue el plan acordado con tu institucion financiera.',
  },
};
