export const apiEndpoints = {
  auth: {
    login: `/api/v1/auth/login`,
    refresh: `/api/v1/auth/refresh`,
    signup: `/api/v1/auth/signup`,
    oauth: {
      google: `/api/v1/oauth/google`
    },
    check: `/api/v1/debug/auth`,
  },
  bookings: {
    availability: `/api/v1/services/availability`,
    get: `/api/v1/bookings`
  },
  order: {
    validate: "/api/v1/order/validate",
    create: "/api/v1/order/create",
    get: "/api/v1/order/{id}",
  },
  payment: {
    cash: "/api/v1/payment/cash",
    get: "/api/v1/payment/{id}",
  },
  profile: {
    get: `/api/v1/profile`,
    update: `/api/v1/profile/update`,
  },
  refund: {
    request: `/api/v1/refund/{bookingId}`,
    get: `/api/v1/refund/{id}`,
    storm: `/api/v1/refund/storm`,
    registerCash: `/api/v1/refund/{id}/register-cash`,
  }
}
