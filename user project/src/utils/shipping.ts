// Shipping zones based on pin code ranges
interface ShippingZone {
  name: string;
  baseCharge: number;
  freeShippingThreshold: number;
}

const shippingZones: Record<string, ShippingZone> = {
  pudukkottai_city: {
    name: 'Pudukkottai City',
    baseCharge: 30,
    freeShippingThreshold: 500
  },
  pudukkottai_rural: {
    name: 'Pudukkottai Rural',
    baseCharge: 40,
    freeShippingThreshold: 600
  },
  trichy_city: {
    name: 'Trichy City',
    baseCharge: 60,
    freeShippingThreshold: 800
  },
  trichy_rural: {
    name: 'Trichy Rural',
    baseCharge: 80,
    freeShippingThreshold: 1000
  },
  nearby_districts: {
    name: 'Nearby Districts',
    baseCharge: 100,
    freeShippingThreshold: 1200
  },
  tamil_nadu: {
    name: 'Tamil Nadu',
    baseCharge: 120,
    freeShippingThreshold: 1500
  },
  other_states: {
    name: 'Other States',
    baseCharge: 150,
    freeShippingThreshold: 2000
  }
};

// Pin code ranges for different zones
const zoneRanges = {
  pudukkottai_city: [
    { start: 622001, end: 622003 } // Pudukkottai City
  ],
  pudukkottai_rural: [
    { start: 622004, end: 622515 } // Pudukkottai Rural areas
  ],
  trichy_city: [
    { start: 620001, end: 620020 } // Trichy City
  ],
  trichy_rural: [
    { start: 620021, end: 621220 } // Trichy Rural areas
  ],
  nearby_districts: [
    { start: 621301, end: 621399 }, // Thanjavur
    { start: 622601, end: 622699 }, // Sivaganga
    { start: 623001, end: 623099 }, // Madurai (partial)
    { start: 610001, end: 610099 }  // Perambalur
  ],
  tamil_nadu: [
    { start: 600000, end: 659999 } // All Tamil Nadu
  ],
  other_states: [
    { start: 100000, end: 999999 } // Rest of India
  ]
};

export const getShippingZone = (pincode: string): ShippingZone => {
  const numericPincode = parseInt(pincode, 10);
  
  // Check each zone's ranges
  for (const [zoneName, ranges] of Object.entries(zoneRanges)) {
    for (const range of ranges) {
      if (numericPincode >= range.start && numericPincode <= range.end) {
        return shippingZones[zoneName];
      }
    }
  }
  
  // Default to zone3 (highest shipping cost) if no match found
  return shippingZones.other_states;
};

export const calculateShippingCharge = (
  pincode: string,
  cartTotal: number,
  deliveryMethod: 'delivery' | 'pickup'
): { charge: number; zoneName: string } => {
  if (deliveryMethod === 'pickup') {
    return { charge: 0, zoneName: 'Store Pickup' };
  }

  const zone = getShippingZone(pincode);
  
  // Free shipping if cart total is above threshold
  if (cartTotal >= zone.freeShippingThreshold) {
    return { charge: 0, zoneName: zone.name };
  }

  return { 
    charge: zone.baseCharge,
    zoneName: zone.name
  };
}; 