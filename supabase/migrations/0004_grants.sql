-- Restrict RPC execution to authenticated users only (default PUBLIC grant
-- would let anon call these; every function already re-checks auth.uid()
-- ownership internally as a second layer of defense).

revoke execute on function
  seed_default_categories(uuid),
  create_account_income(uuid, bigint, text, date, text, text, uuid, transaction_status),
  create_account_expense(uuid, bigint, text, date, text, text, uuid, transaction_status),
  create_credit_card_expense(uuid, bigint, text, date, text, text, uuid, transaction_status),
  create_account_transfer(uuid, uuid, bigint, text, date, text, transaction_status),
  create_credit_card_payment(uuid, uuid, bigint, text, date, text, transaction_status),
  create_savings_contribution(uuid, uuid, bigint, text, date, text, transaction_status),
  create_savings_withdrawal(uuid, uuid, bigint, text, date, text, transaction_status),
  create_refund(uuid, uuid, bigint, text, date, text, uuid, transaction_status),
  create_balance_adjustment(uuid, uuid, bigint, date, text),
  cancel_transaction(uuid),
  mark_obligation_occurrence_paid(uuid, uuid, uuid, bigint, date),
  skip_obligation_occurrence(uuid)
from public;

grant execute on function
  seed_default_categories(uuid),
  create_account_income(uuid, bigint, text, date, text, text, uuid, transaction_status),
  create_account_expense(uuid, bigint, text, date, text, text, uuid, transaction_status),
  create_credit_card_expense(uuid, bigint, text, date, text, text, uuid, transaction_status),
  create_account_transfer(uuid, uuid, bigint, text, date, text, transaction_status),
  create_credit_card_payment(uuid, uuid, bigint, text, date, text, transaction_status),
  create_savings_contribution(uuid, uuid, bigint, text, date, text, transaction_status),
  create_savings_withdrawal(uuid, uuid, bigint, text, date, text, transaction_status),
  create_refund(uuid, uuid, bigint, text, date, text, uuid, transaction_status),
  create_balance_adjustment(uuid, uuid, bigint, date, text),
  cancel_transaction(uuid),
  mark_obligation_occurrence_paid(uuid, uuid, uuid, bigint, date),
  skip_obligation_occurrence(uuid)
to authenticated;
