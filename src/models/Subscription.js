import mongoose from 'mongoose';

const SubscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    plan: {
      type: String,
      enum: ['free', 'lupuloso', 'pro', 'explorer'],
      required: true,
    },

    status: {
      type: String,
      enum: ['pending', 'active', 'cancelled', 'expired', 'past_due'],
      default: 'pending',
    },

    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      required: true,
    },

    // Dates
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    cancelledAt: { type: Date, default: null },

    // Renewal
    autoRenew: { type: Boolean, default: true },

    // Payment (ready for Stripe/MercadoPago integration)
    paymentMethod: {
      type: String,
      enum: ['stripe', 'mercadopago', 'manual', 'gift'],
      default: 'manual',
    },
    externalPaymentId: { type: String, default: null },
    mpPreapprovalId: { type: String, default: null, index: true },

    // Price at time of purchase (in case prices change later)
    pricePaid: { type: Number, required: true },
    currency: { type: String, default: 'CLP' },

    // Admin/owner can gift plans
    grantedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // Notes (admin use)
    notes: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

/* Indexes */
SubscriptionSchema.index({ user: 1, status: 1 });
SubscriptionSchema.index({ endDate: 1 });
SubscriptionSchema.index({ status: 1 });

/* Virtuals */
SubscriptionSchema.virtual('isActive').get(function () {
  return this.status === 'active' && this.endDate > new Date();
});

SubscriptionSchema.virtual('daysRemaining').get(function () {
  const diff = this.endDate - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

export default mongoose.model('Subscription', SubscriptionSchema);
