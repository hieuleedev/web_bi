import React, { useState, useEffect } from 'react';
import { Printer, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { checkPrintServer, printReceipt, orderToPrintPayload } from '../../lib/printService';
import type { Order } from '../../types';

interface Props {
  order: Order;
  className?: string;
  size?: 'sm' | 'md';
}

type ServerStatus = 'unknown' | 'online' | 'offline';

export const PrintReceiptButton: React.FC<Props> = ({ order, className = '', size = 'sm' }) => {
  const [printing, setPrinting]       = useState(false);
  const [result, setResult]           = useState<{ ok: boolean; msg: string } | null>(null);
  const [serverStatus, setServerStatus] = useState<ServerStatus>('unknown');

  // Kiểm tra server khi hover
  const handleMouseEnter = async () => {
    if (serverStatus !== 'unknown') return;
    const ok = await checkPrintServer();
    setServerStatus(ok ? 'online' : 'offline');
  };

  const handlePrint = async () => {
    if (printing) return;
    setPrinting(true);
    setResult(null);

    // Kiểm tra server
    const isOnline = await checkPrintServer();
    setServerStatus(isOnline ? 'online' : 'offline');

    if (!isOnline) {
      setPrinting(false);
      setResult({
        ok: false,
        msg: 'Chưa kết nối máy in! Hãy mở BiBI_PrintServer.exe trên máy tính này.',
      });
      return;
    }

    const payload = orderToPrintPayload(order);
    const res = await printReceipt(payload);
    setPrinting(false);
    setResult({ ok: res.success, msg: res.message });

    // Tự ẩn sau 4 giây
    setTimeout(() => setResult(null), 4000);
  };

  const iconSize = size === 'sm' ? 13 : 15;
  const btnClass = size === 'sm'
    ? 'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all'
    : 'flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all';

  // Màu nút theo trạng thái server
  const colorClass = serverStatus === 'offline'
    ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
    : serverStatus === 'online'
      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
      : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100';

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={handlePrint}
        onMouseEnter={handleMouseEnter}
        disabled={printing}
        title={
          serverStatus === 'offline'
            ? 'Máy in offline - mở BiBI_PrintServer.exe'
            : 'In trực tiếp ra máy in POS (qua API)'
        }
        className={`${btnClass} ${colorClass} disabled:opacity-60 disabled:cursor-not-allowed`}
      >
        {printing ? (
          <Loader2 size={iconSize} className="animate-spin" />
        ) : serverStatus === 'offline' ? (
          <AlertTriangle size={iconSize} />
        ) : (
          <Printer size={iconSize} />
        )}
        <span>{printing ? 'Đang in...' : 'In bill POS'}</span>
        {/* Chấm trạng thái server */}
        {serverStatus !== 'unknown' && (
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              serverStatus === 'online' ? 'bg-emerald-500' : 'bg-red-500'
            }`}
          />
        )}
      </button>

      {/* Toast kết quả */}
      {result && (
        <div
          className={`absolute top-full left-0 mt-1.5 z-50 flex items-start gap-2 px-3 py-2 rounded-xl shadow-lg text-xs whitespace-nowrap max-w-xs ${
            result.ok
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {result.ok ? (
            <CheckCircle size={14} className="mt-0.5 shrink-0 text-emerald-600" />
          ) : (
            <XCircle size={14} className="mt-0.5 shrink-0 text-red-500" />
          )}
          <span>{result.msg}</span>
        </div>
      )}
    </div>
  );
};
