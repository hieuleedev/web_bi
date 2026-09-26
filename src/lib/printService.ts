/**
 * BiBI Boutique - Print Service
 * Gọi local print server (http://localhost:8080) để in hóa đơn thuê đồ
 */

const PRINT_SERVER = 'http://localhost:8080';

export interface PrintItem {
  name: string;
  qty: number;
  price: number;
  total: number;
  rentalDates?: string;
  note?: string;
}

export interface PrintPayload {
  printerShareName?: string;
  printerIp?: string;
  printerPort?: number;
  useGDI?: boolean;
  keepAccents?: boolean;
  paperWidth?: number;
  paperSize?: '58' | '80';
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
  orderId?: string;
  customerName?: string;
  customerPhone?: string;
  staffName?: string;
  createdAt?: string;
  printedAt?: string;
  items: PrintItem[];
  subtotal?: number;
  depositTotal?: number;
  discount?: number;
  total: number;
  note?: string;
  openDrawer?: boolean;
  enableBankQr?: boolean;
  bankName?: string;
  bankAccount?: string;
}

/** Kiểm tra print server có đang chạy không */
export async function checkPrintServer(): Promise<boolean> {
  try {
    const res = await fetch(`${PRINT_SERVER}/api/status`, {
      signal: AbortSignal.timeout(2000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Lấy danh sách máy in từ server */
export async function getPrinters(): Promise<string[]> {
  try {
    const res = await fetch(`${PRINT_SERVER}/api/printers`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.printers || [];
  } catch {
    return [];
  }
}

/** In hóa đơn thuê đồ */
export async function printReceipt(payload: PrintPayload): Promise<{ success: boolean; message: string }> {
  try {
    const body = {
      ...payload,
      storeName: payload.storeName || 'BI BI BOUTIQUE - CHO THUE DO',
      storePhone: payload.storePhone || '0795623097',
      printedAt: new Date().toLocaleString('vi-VN'),
      useGDI: payload.useGDI ?? true,
      paperWidth: payload.paperWidth ?? 32,
      keepAccents: payload.keepAccents ?? true,
    };

    const res = await fetch(`${PRINT_SERVER}/api/print`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, message: data.message || 'In thành công!' };
    }
    return { success: false, message: data.error || 'Lỗi in hóa đơn' };
  } catch (err: any) {
    if (err?.name === 'TimeoutError' || err?.name === 'AbortError') {
      return { success: false, message: 'Không kết nối được máy in server (timeout). Kiểm tra BiBI_PrintServer.exe đã chạy chưa?' };
    }
    return { success: false, message: `Không kết nối được print server: ${err?.message || err}` };
  }
}

/** Build PrintPayload từ Order object */
import type { Order } from '../types';

export function orderToPrintPayload(order: Order, printerName?: string): PrintPayload {
  const items: PrintItem[] = order.items.map((item) => {
    let rentalDates = '';
    if (item.rentalStartDate && item.rentalEndDate) {
      const fmt = (d: string) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      rentalDates = `${fmt(item.rentalStartDate)} - ${fmt(item.rentalEndDate)} (${item.rentalDays ?? 1} ngày)`;
    }

    const note = [
      item.size ? `Size ${item.size}` : '',
      item.color ? `Màu ${item.color}` : '',
    ].filter(Boolean).join(', ');

    return {
      name: item.productTitle,
      qty: item.quantity,
      price: item.price,
      total: item.price * item.quantity,
      rentalDates,
      note,
    };
  });

  const createdAt = new Date(order.createdAt).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return {
    printerShareName: printerName || localStorage.getItem('bibi_printer_name') || 'POS-80',
    paperSize: '80',
    paperWidth: 48,
    useGDI: true,
    orderId: order.code || order.id,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    createdAt,
    items,
    subtotal: order.subtotal,
    depositTotal: order.depositTotal,
    discount: 0,
    total: order.totalAmount,
    note: order.notes,
  };
}
