/**
 * VIETQR HELPER & CONFIGURATION
 * Hệ thống sinh mã VietQR chuẩn NAPAS 247 tự động kèm số tiền và mã đơn hàng.
 */

export interface BankConfig {
  bankId: string;
  bankName: string;
  accountNo: string;
  accountName: string;
  template: 'compact2' | 'compact' | 'qr_only' | 'print';
}

// Cấu hình STK Ngân Hàng mặc định của Shop Bi Bi
export const DEFAULT_BANK_CONFIG: BankConfig = {
  bankId: 'MB', // Ngân hàng Quân Đội (MB Bank)
  bankName: 'MB Bank (Ngân hàng TMCP Quân Đội)',
  accountNo: '0795623097',
  accountName: 'LE TRUNG HIEU',
  template: 'compact2' // Giao diện QR có logo ngân hàng và thông tin chuyển khoản đẹp mắt
};

// Danh sách các ngân hàng phổ biến tại Việt Nam để dễ dàng chuyển đổi
export const SUPPORTED_BANKS = [
  { id: 'MB', name: 'MB Bank (Quân Đội)' },
  { id: 'VCB', name: 'Vietcombank (Ngoại Thương)' },
  { id: 'TCB', name: 'Techcombank (Kỹ Thương)' },
  { id: 'VPB', name: 'VPBank (Việt Nam Thịnh Vượng)' },
  { id: 'ACB', name: 'ACB (Á Châu)' },
  { id: 'BIDV', name: 'BIDV (Đầu Tư & Phát Triển)' },
  { id: 'VBA', name: 'Agribank (Nông Nghiệp)' },
  { id: 'TPB', name: 'TPBank (Tiên Phong)' },
  { id: 'STB', name: 'Sacombank (Sài Gòn Thương Tín)' },
  { id: 'VIB', name: 'VIB (Quốc Tế)' }
];

export interface VietQrOptions {
  bankId?: string;
  accountNo?: string;
  accountName?: string;
  amount: number;
  orderCode: string;
  template?: 'compact2' | 'compact' | 'qr_only' | 'print';
}

/**
 * Sinh URL hình ảnh VietQR tự động
 * @param options { amount, orderCode, bankId, accountNo, accountName, template }
 * @returns Đường dẫn hình ảnh QR code chuẩn
 */
export function generateVietQrUrl(options: VietQrOptions): string {
  const bank = options.bankId || DEFAULT_BANK_CONFIG.bankId;
  const accNo = options.accountNo || DEFAULT_BANK_CONFIG.accountNo;
  const accName = encodeURIComponent(options.accountName || DEFAULT_BANK_CONFIG.accountName);
  const template = options.template || DEFAULT_BANK_CONFIG.template;
  const amount = Math.round(options.amount || 0);
  const addInfo = encodeURIComponent(options.orderCode || 'Thanh toan don hang');

  return `https://img.vietqr.io/image/${bank}-${accNo}-${template}.png?amount=${amount}&addInfo=${addInfo}&accountName=${accName}`;
}
