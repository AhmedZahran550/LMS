import { roleApi } from "./api";

export const subscriptionApis = {
  getMySubscription: async () => {
    const response = await roleApi.get("/subscription");
    return response.data;
  },

  getPlans: async () => {
    const response = await roleApi.get("/subscription/plans");
    return response.data;
  },

  createCheckoutSession: async (planType: string, successUrl?: string, cancelUrl?: string) => {
    const response = await roleApi.post("/subscription/checkout", { planType, successUrl, cancelUrl });
    return response.data;
  },

  createPortalSession: async () => {
    const response = await roleApi.post("/subscription/portal");
    return response.data;
  },

  cancelSubscription: async () => {
    const response = await roleApi.post("/subscription/cancel");
    return response.data;
  },
};
