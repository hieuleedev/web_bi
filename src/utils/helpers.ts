import { Product, RentalBookingDate } from '../types';

/**
 * Format currency to Vietnamese Dong (VNĐ)
 */
export function formatVND(amount?: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format Date string (YYYY-MM-DD or ISO) to display format (DD/MM/YYYY)
 */
export function formatDateVN(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Calculate difference in days between start date and end date
 * Minimum 1 day
 */
export function calculateRentalDays(start: string, end: string): number {
  if (!start || !end) return 1;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = endDate.getTime() - startDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
}

/**
 * Calculate rental price based on days and product tier pricing
 */
export function calculateRentalPrice(product: Product, days: number): number {
  const dayRate = product.rentPrice1Day || 0;
  if (days <= 1) {
    return dayRate;
  }
  if (days === 3 && product.rentPrice3Days) {
    return product.rentPrice3Days;
  }
  if (days === 7 && product.rentPrice7Days) {
    return product.rentPrice7Days;
  }
  // Package calculation with progressive discount
  if (days >= 7 && product.rentPrice7Days) {
    const fullWeeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    return (fullWeeks * product.rentPrice7Days) + (remainingDays * dayRate * 0.85);
  }
  if (days >= 3 && product.rentPrice3Days) {
    const base3Days = product.rentPrice3Days;
    const remainingDays = days - 3;
    return base3Days + (remainingDays * dayRate * 0.9);
  }
  return Math.round(days * dayRate);
}

/**
 * Check if rental date range overlaps with any confirmed or active bookings
 * Overlap formula: newStart <= existing_end && newEnd >= existing_start (inclusive calendar day check)
 */
export function checkRentalOverlap(
  newStart: string,
  newEnd: string,
  existingBookings: RentalBookingDate[] = [],
  excludeBookingId?: string
): { hasConflict: boolean; conflictingBooking?: RentalBookingDate } {
  if (!newStart || !newEnd || !existingBookings || existingBookings.length === 0) {
    return { hasConflict: false };
  }

  const s = newStart.split('T')[0];
  const e = newEnd.split('T')[0];

  for (const booking of existingBookings) {
    if (booking.status === 'cancelled') continue;
    if (excludeBookingId && booking.id === excludeBookingId) continue;
    if (!booking.startDate || !booking.endDate) continue;

    const bStart = booking.startDate.split('T')[0];
    const bEnd = booking.endDate.split('T')[0];

    // Standard inclusive calendar date overlap: s <= bEnd && e >= bStart
    if (s <= bEnd && e >= bStart) {
      return { hasConflict: true, conflictingBooking: booking };
    }
  }

  return { hasConflict: false };
}

/**
 * Generate unique order code (e.g., BB-89241)
 */
export function generateOrderCode(): string {
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `BB-${rand}`;
}

/**
 * Convert file to base64 Data URL for local preview & persistence
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Format relative time (e.g. "5 phút trước", "2 giờ trước", "Hôm qua")
 */
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return 'Vừa xong';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay} ngày trước`;
  return formatDateVN(dateString);
}
