// Hand-maintained types mirroring supabase/migrations/*.sql.
// A live Supabase project would let us run `supabase gen types typescript`
// instead; see README for that follow-up command.

export type AccountType = 'checking' | 'savings' | 'cash' | 'digital_wallet' | 'investment' | 'other';
export type CategoryType = 'income' | 'expense' | 'savings';
export type TransactionType =
  | 'income'
  | 'expense'
  | 'transfer'
  | 'credit_card_payment'
  | 'savings_contribution'
  | 'savings_withdrawal'
  | 'refund'
  | 'adjustment';
export type TransactionStatus = 'pending' | 'cleared' | 'cancelled';
export type InstallmentPlanStatus = 'active' | 'completed' | 'cancelled';
export type ObligationType =
  | 'bill'
  | 'subscription'
  | 'rent'
  | 'loan'
  | 'insurance'
  | 'card_payment'
  | 'savings'
  | 'other';
export type AmountType = 'fixed' | 'estimated';
export type RecurrenceFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
export type OccurrenceStatus = 'upcoming' | 'pending' | 'paid' | 'partial' | 'overdue' | 'skipped';
export type GoalPriority = 'low' | 'medium' | 'high';
export type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled';
export type ContributionType = 'contribution' | 'withdrawal';
export type AlertType =
  | 'obligation_due'
  | 'obligation_overdue'
  | 'credit_card_statement'
  | 'credit_card_payment_due'
  | 'credit_utilization'
  | 'budget_warning'
  | 'budget_exceeded'
  | 'low_available_balance'
  | 'savings_goal_behind'
  | 'savings_goal_reached';
export type AlertSeverity = 'info' | 'warning' | 'urgent';

export interface Profile {
  id: string;
  display_name: string | null;
  primary_currency: string;
  locale: string;
  timezone: string;
  onboarding_completed: boolean;
  default_obligation_horizon_days: number;
  pending_affects_safe_to_spend: boolean;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  institution_name: string | null;
  account_type: AccountType;
  currency: string;
  opening_balance_minor: number;
  current_balance_minor: number;
  include_in_available_balance: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreditCard {
  id: string;
  user_id: string;
  name: string;
  institution_name: string | null;
  last_four: string | null;
  currency: string;
  credit_limit_minor: number;
  statement_balance_minor: number;
  current_balance_minor: number;
  statement_day: number;
  payment_due_day: number;
  minimum_payment_minor: number | null;
  annual_interest_rate: number | null;
  default_payment_account_id: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string | null;
  name: string;
  category_type: CategoryType;
  parent_id: string | null;
  is_system: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  transaction_type: TransactionType;
  amount_minor: number;
  currency: string;
  transaction_date: string;
  description: string;
  merchant: string | null;
  category_id: string | null;
  account_id: string | null;
  credit_card_id: string | null;
  destination_account_id: string | null;
  transfer_group_id: string | null;
  recurring_obligation_id: string | null;
  installment_plan_id: string | null;
  status: TransactionStatus;
  notes: string | null;
  reversed_transaction_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface InstallmentPlan {
  id: string;
  user_id: string;
  credit_card_id: string;
  description: string;
  total_amount_minor: number;
  installment_count: number;
  first_installment_date: string;
  installment_amount_minor: number;
  remaining_installments: number;
  status: InstallmentPlanStatus;
  created_at: string;
  updated_at: string;
}

export interface RecurringObligation {
  id: string;
  user_id: string;
  name: string;
  obligation_type: ObligationType;
  amount_type: AmountType;
  amount_minor: number;
  currency: string;
  frequency: RecurrenceFrequency;
  next_due_date: string;
  end_date: string | null;
  account_id: string | null;
  credit_card_id: string | null;
  category_id: string | null;
  auto_create_transaction: boolean;
  reminder_days_before: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ObligationOccurrence {
  id: string;
  user_id: string;
  recurring_obligation_id: string;
  due_date: string;
  expected_amount_minor: number;
  actual_amount_minor: number | null;
  status: OccurrenceStatus;
  paid_transaction_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  target_amount_minor: number;
  current_amount_minor: number;
  currency: string;
  target_date: string | null;
  linked_account_id: string | null;
  priority: GoalPriority;
  exclude_from_available_balance: boolean;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
}

export interface SavingsGoalTransaction {
  id: string;
  user_id: string;
  savings_goal_id: string;
  transaction_id: string;
  amount_minor: number;
  contribution_type: ContributionType;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  month: string;
  budget_amount_minor: number;
  rollover_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Alert {
  id: string;
  user_id: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  related_entity_type: string | null;
  related_entity_id: string | null;
  effective_date: string;
  read_at: string | null;
  dismissed_at: string | null;
  deduplication_key: string;
  created_at: string;
}

export interface MonthlySnapshot {
  id: string;
  user_id: string;
  month: string;
  total_income_minor: number;
  total_expense_minor: number;
  total_saved_minor: number;
  closing_liquid_balance_minor: number;
  closing_credit_debt_minor: number;
  net_cash_flow_minor: number;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile> & { id: string }; Update: Partial<Profile> };
      accounts: { Row: Account; Insert: Partial<Account>; Update: Partial<Account> };
      credit_cards: { Row: CreditCard; Insert: Partial<CreditCard>; Update: Partial<CreditCard> };
      categories: { Row: Category; Insert: Partial<Category>; Update: Partial<Category> };
      transactions: { Row: Transaction; Insert: Partial<Transaction>; Update: Partial<Transaction> };
      installment_plans: { Row: InstallmentPlan; Insert: Partial<InstallmentPlan>; Update: Partial<InstallmentPlan> };
      recurring_obligations: { Row: RecurringObligation; Insert: Partial<RecurringObligation>; Update: Partial<RecurringObligation> };
      obligation_occurrences: { Row: ObligationOccurrence; Insert: Partial<ObligationOccurrence>; Update: Partial<ObligationOccurrence> };
      savings_goals: { Row: SavingsGoal; Insert: Partial<SavingsGoal>; Update: Partial<SavingsGoal> };
      savings_goal_transactions: { Row: SavingsGoalTransaction; Insert: Partial<SavingsGoalTransaction>; Update: Partial<SavingsGoalTransaction> };
      budgets: { Row: Budget; Insert: Partial<Budget>; Update: Partial<Budget> };
      alerts: { Row: Alert; Insert: Partial<Alert>; Update: Partial<Alert> };
      monthly_snapshots: { Row: MonthlySnapshot; Insert: Partial<MonthlySnapshot>; Update: Partial<MonthlySnapshot> };
    };
  };
}
