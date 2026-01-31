// client/vite-project/src/utils/affiliateLinks.ts

/**
 * AWIN Booking.com Affiliate Integration
 * Merchant ID: 18117 (Booking.com)
 * Publisher ID: Get from your AWIN dashboard
 */

const AWIN_CONFIG = {
  MERCHANT_ID: '18117', // Booking.com on AWIN
  PUBLISHER_ID: import.meta.env.VITE_AWIN_PUBLISHER_ID as string, // ⚠️ REPLACE with your actual ID
  TRACKING_URL: 'https://www.awin1.com/cread.php',
  BOOKING_BASE: 'https://www.booking.com',
};

if (!AWIN_CONFIG.PUBLISHER_ID) {
  console.warn('AWIN Publisher ID missing - using fallback for development');
  AWIN_CONFIG.PUBLISHER_ID = '2733218'; // Your actual ID as fallback
}

/**
 * Extract destination name from various data structures
 */
export function extractDestinationName(destination: any): string {
  if (typeof destination === 'string') {
    return destination;
  }
  
  if (!destination) {
    return 'India';
  }

  const nameCandidate = 
    destination.name || 
    destination.destination?.name || 
    destination.title ||
    destination.destination?.title;

  if (Array.isArray(nameCandidate)) {
    return nameCandidate[0] || 'India';
  }

  if (typeof nameCandidate === 'object' && nameCandidate?.text) {
    return nameCandidate.text;
  }

  return String(nameCandidate || 'India');
}

/**
 * Format date to YYYY-MM-DD for Booking.com
 */
function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * Calculate check-in/out dates
 */
function getBookingDates(travelDetails?: any): { checkin?: string; checkout?: string } {
  if (travelDetails?.startDate && travelDetails?.endDate) {
    return {
      checkin: formatDate(travelDetails.startDate),
      checkout: formatDate(travelDetails.endDate),
    };
  }

  // Default: tomorrow + duration (or 3 days)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const duration = travelDetails?.duration || travelDetails?.tripDuration || 3;
  const checkout = new Date(tomorrow);
  checkout.setDate(checkout.getDate() + duration);

  return {
    checkin: formatDate(tomorrow),
    checkout: formatDate(checkout),
  };
}

/**
 * Create Booking.com search URL
 */
function createBookingUrl(params: {
  destination: string;
  checkin?: string;
  checkout?: string;
  adults?: number;
  children?: number;
  rooms?: number;
}): string {
  const searchParams = new URLSearchParams({
    ss: params.destination,
    selected_currency: 'INR',
    lang: 'en-gb', // Added: consistent English (India-friendly)
    sb: '1',       // Added: search bar origin
  });

  if (params.checkin) searchParams.append('checkin', params.checkin);
  if (params.checkout) searchParams.append('checkout', params.checkout);
  if (params.adults) searchParams.append('group_adults', params.adults.toString());
  if (params.children) searchParams.append('group_children', params.children.toString());
  if (params.rooms) searchParams.append('no_rooms', params.rooms.toString());

  return `${AWIN_CONFIG.BOOKING_BASE}/searchresults.html?${searchParams.toString()}`;
}

/**
 * Wrap URL with AWIN tracking
 */
function wrapWithAffiliateTracking(bookingUrl: string, clickref: string = ''): string {
  const params = new URLSearchParams({
    mid: AWIN_CONFIG.MERCHANT_ID,
    id: AWIN_CONFIG.PUBLISHER_ID,
    clickref: clickref || `yatramaker-${Date.now()}`,
    p: bookingUrl,
  });

  return `${AWIN_CONFIG.TRACKING_URL}?${params.toString()}`;
}

/**
 * ========================================
 * MAIN FUNCTIONS TO USE IN YOUR COMPONENTS
 * ========================================
 */

/**
 * Get affiliate link for single destination (DestinationCard, DestinationDetail)
 */
export function getDestinationAffiliateLink(
  destination: any,
  travelDetails?: {
    startDate?: string;
    endDate?: string;
    duration?: number;
    tripDuration?: number;
    adults?: number;
    children?: number;
    travellers?: { adults?: number; children?: number };
  },
  variant?: string // 'cheapest', 'fastest', 'comfortable'
): string {
  const destName = extractDestinationName(destination);
  const dates = getBookingDates(travelDetails);

  const adults = travelDetails?.adults || travelDetails?.travellers?.adults || 2;
  const children = travelDetails?.children || travelDetails?.travellers?.children || 0;

  const bookingUrl = createBookingUrl({
    destination: destName,
    checkin: dates.checkin,
    checkout: dates.checkout,
    adults,
    children,
    rooms: Math.ceil(adults / 2), // Simple room calculation
  });

  const safeName = destName.toLowerCase().replace(/\s+/g, '-');
  const clickref = `yatramaker-${safeName || 'fallback'}-${variant || 'default'}`;

  return wrapWithAffiliateTracking(bookingUrl, clickref);
}

/**
 * Get affiliate link for multi-city itinerary
 */
export function getMultiCityAffiliateLink(
  itinerary: any,
  currentDestinationIndex: number = 0
): string {
  const destinations = itinerary.destinations || [];
  
  if (destinations.length === 0) {
    return getDestinationAffiliateLink({ name: 'India' });
  }

  // Use FIRST destination by default (most logical starting point)
  const mainDestObj = destinations[0]?.destination || {};
  const destName = extractDestinationName(mainDestObj);

  // Use nights from FIRST destination
  const nights = destinations[0]?.nights || 2;
  const dates = getBookingDates({ duration: nights });

  const bookingUrl = createBookingUrl({
    destination: destName,
    checkin: dates.checkin,
    checkout: dates.checkout,
    adults: itinerary.travellers?.adults || 2,
    children: itinerary.travellers?.children || 0,
  });

  const safeName = destName.toLowerCase().replace(/\s+/g, '-');
  const clickref = `yatramaker-multi-${safeName}-first-${currentDestinationIndex}`;

  return wrapWithAffiliateTracking(bookingUrl, clickref);
}

/**
 * Track affiliate click (optional - for analytics)
 */
export function trackAffiliateClick(
  destinationName: string,
  source: 'card' | 'detail' | 'multi-city' = 'card',
  variant?: string
): void {
  // Google Analytics tracking
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'affiliate_click', {
      event_category: 'affiliate',
      event_label: destinationName,
      event_source: source,
      event_variant: variant || 'default',
    });
  }

  // Console log for debugging
  console.log('Affiliate click:', { destinationName, source, variant });
}

/**
 * Affiliate disclosure text (REQUIRED by AWIN terms)
 */
export const AFFILIATE_DISCLOSURE = 'As a Booking.com affiliate, YatraMaker may earn a commission from qualifying bookings.';

/**
 * Simple helper for quick links (if you just need a basic search)
 */
export function getSimpleBookingLink(destinationName: string): string {
  const bookingUrl = createBookingUrl({
    destination: destinationName,
  });

  return wrapWithAffiliateTracking(bookingUrl, `yatramaker-quick-${destinationName.toLowerCase()}`);
}