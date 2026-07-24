export const SUBSCRIPTION_PLANS = [
    {
        id: 1,
        name: 'Basic', // Ensure this matches DB if the user has 'Basic' plan
        monthlyPrice: 499,
        yearlyPrice: 5999,
        currency: '₹',
        limits: {
            mahals: 1,
            galleryPhotos: 5
        },
        features: ['Create up to 1 Mahals', 'Basic Gallery Limit (5 Photos)', 'Email Support', 'Community Access'],
        recommended: false
    },
    {
        id: 2,
        name: 'Premium',
        monthlyPrice: 999,
        yearlyPrice: 11999,
        currency: '₹',
        limits: {
            mahals: 5,
            galleryPhotos: -1 // -1 for unlimited
        },
        features: ['Create up to 5 Mahals', 'Unlimited Gallery', 'Priority Support', 'Advanced Analytics', 'Custom Branding'],
        recommended: true
    }
];
