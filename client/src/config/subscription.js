// Subscription plans configuration
// Update prices and descriptions as needed for your business
export const SUBSCRIPTION_PLANS = [
  {
    id: '1_month',
    name: '1 Month',
    duration: '1 month',
    price: 299, // UPDATE: Set your actual price
    description: 'Perfect for trying out our service'
  },
  {
    id: '3_months',
    name: '3 Months',
    duration: '3 months',
    price: 799, // UPDATE: Set your actual price
    description: 'Save more than 10% with quarterly billing'
  },
  // {
  //   id: '1_year',
  //   name: '1 Year',
  //   duration: '12 months',
  //   price: 3299, // UPDATE: Set your actual price
  //   description: 'Best value - save 30% with annual billing'
  // }
];

// Contact information for subscription
// UPDATE: Replace these placeholders with your actual contact information
export const CONTACT_INFO = {
  whatsapp: {
    number: '+919026400792', // UPDATE: Replace with your actual WhatsApp number (without spaces or dashes)
    display: '+91 90264 00792', // UPDATE: Display format for WhatsApp number
    link: 'https://wa.me/919026400792' // UPDATE: WhatsApp link format: https://wa.me/COUNTRY_CODE_NUMBER
  },
  instagram: {
    handle: '@sh.reyansh9026', // UPDATE: Replace with your actual Instagram handle (include @)
    link: 'https://www.instagram.com/sh.reyansh9026/' // UPDATE: Your Instagram profile URL
  },
  email: {
    address: 'sh.reyansh9026@gmail.com', // UPDATE: Replace with your actual email address
    link: 'mailto:sh.reyansh9026@gmail.com' // UPDATE: Your email address
  }
};
