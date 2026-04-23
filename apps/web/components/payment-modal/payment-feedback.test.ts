import assert from 'node:assert/strict';
import test from 'node:test';
import { buildPaymentSuccessMessage } from './payment-feedback';
import { formatCurrency } from '@/lib/utils';

test('descreve a sobra aguardando complemento depois de quitar corridas', () => {
  const message = buildPaymentSuccessMessage({
    settledRides: 1,
    unappliedAmount: 25,
    nextRideAmount: 30,
    nextRideShortfall: 5,
    generatedBalance: 0,
  });

  assert.equal(
    message,
    `Pagamento registrado. 1 corrida quitada. Já recebemos ${formatCurrency(25)} e faltam ${formatCurrency(5)} para quitar a próxima corrida.`,
  );
});

test('descreve quando o valor ainda nao quita nenhuma corrida', () => {
  const message = buildPaymentSuccessMessage({
    settledRides: 0,
    unappliedAmount: 25,
    nextRideAmount: 30,
    nextRideShortfall: 5,
    generatedBalance: 0,
  });

  assert.equal(
    message,
    `Pagamento registrado. Nenhuma corrida foi quitada ainda. Já recebemos ${formatCurrency(25)} e faltam ${formatCurrency(5)} para quitar a próxima corrida.`,
  );
});

test('descreve saldo gerado por excedente', () => {
  const message = buildPaymentSuccessMessage({
    settledRides: 2,
    unappliedAmount: 0,
    nextRideAmount: null,
    nextRideShortfall: null,
    generatedBalance: 15,
  });

  assert.equal(
    message,
    `Pagamento registrado. 2 corridas quitadas e ${formatCurrency(15)} viraram saldo do cliente.`,
  );
});

test('mantem a mensagem curta quando o pagamento fecha exatamente as corridas', () => {
  const message = buildPaymentSuccessMessage({
    settledRides: 3,
    unappliedAmount: 0,
    nextRideAmount: null,
    nextRideShortfall: null,
    generatedBalance: 0,
  });

  assert.equal(message, 'Pagamento registrado. 3 corridas quitadas.');
});
