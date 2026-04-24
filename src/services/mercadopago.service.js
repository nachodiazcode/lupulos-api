import { MercadoPagoConfig, PreApproval } from 'mercadopago';
import config from '../config/index.js';
import { getPlan } from '../config/plans.js';
import logger from '../utils/logger.js';

/* ═══════════════════════════════════
   SDK initialization
═══════════════════════════════════ */

let client = null;
let preApproval = null;

const getClient = () => {
  if (!client) {
    const accessToken = config.mercadopago?.accessToken;
    if (!accessToken) {
      throw new Error(
        'MERCADOPAGO_ACCESS_TOKEN is not configured. Set it in your .env file.'
      );
    }
    client = new MercadoPagoConfig({ accessToken });
    preApproval = new PreApproval(client);
  }
  return { client, preApproval };
};

/* ═══════════════════════════════════
   Public API
═══════════════════════════════════ */

/**
 * Create a MercadoPago subscription (PreApproval).
 *
 * Returns the init_point URL where the user completes payment.
 *
 * @param {Object} params
 * @param {string} params.email      - Payer email
 * @param {string} params.planSlug   - Plan slug (lupuloso, pro, explorer)
 * @param {string} params.billingCycle - 'monthly' or 'yearly'
 * @param {string} params.externalRef - Internal subscription ID for webhook tracking
 * @returns {Promise<{ id: string, initPoint: string }>}
 */
export const createMPSubscription = async ({
  email,
  planSlug,
  billingCycle,
  externalRef,
}) => {
  const { preApproval: pa } = getClient();
  const planConfig = getPlan(planSlug);

  const isYearly = billingCycle === 'yearly';
  const amount = isYearly ? planConfig.prices.yearly : planConfig.prices.monthly;

  const body = {
    back_url: config.mercadopago.backUrl,
    reason: `Lúpulos App — Plan ${planConfig.name} (${isYearly ? 'Anual' : 'Mensual'})`,
    auto_recurring: {
      frequency: isYearly ? 12 : 1,
      frequency_type: 'months',
      transaction_amount: amount,
      currency_id: 'CLP',
    },
    payer_email: email,
    external_reference: externalRef,
    status: 'pending',
  };

  logger.info(`Creating MP subscription: plan=${planSlug} email=${email} amount=${amount}`);

  const result = await pa.create({ body });

  logger.info(`MP subscription created: id=${result.id} init_point=${result.init_point}`);

  return {
    id: result.id,
    initPoint: result.init_point,
  };
};

/**
 * Get the status of a MercadoPago subscription.
 *
 * @param {string} preapprovalId - MP PreApproval ID
 * @returns {Promise<Object>} - Full PreApproval object from MP
 */
export const getMPSubscriptionStatus = async (preapprovalId) => {
  const { preApproval: pa } = getClient();
  return pa.get({ id: preapprovalId });
};

/**
 * Cancel a MercadoPago subscription.
 *
 * @param {string} preapprovalId - MP PreApproval ID
 * @returns {Promise<Object>}
 */
export const cancelMPSubscription = async (preapprovalId) => {
  const { preApproval: pa } = getClient();

  logger.info(`Cancelling MP subscription: id=${preapprovalId}`);

  return pa.update({
    id: preapprovalId,
    body: { status: 'cancelled' },
  });
};
