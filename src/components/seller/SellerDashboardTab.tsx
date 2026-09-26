import React, { useState, useMemo } from "react";
import { 
  Award, 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Calendar, 
  Flame, 
  Crown, 
  Sparkles, 
  Phone, 
  History, 
  ExternalLink,
  Layers,
  ArrowUpRight,
  Gem,
  CheckCircle2,
  Clock,
  Shirt,
  Filter
} from "lucide-react";
import { Order, Product } from "../../types";
import { formatVND, formatDateVN } from "../../utils/helpers";
import { CustomerHistoryModal, CustomerSummary } from "../customer/CustomerHistoryModal";

interface SellerDashboardTabProps {
  orders: Order[];
  products: Product[];
  onViewOrderDetail?: (order: Order) => void;
  onViewInvoice?: (order: Order) => void;
  onSelectProduct?: (productId: string) => void;
}

export const SellerDashboardTab: React.FC<SellerDashboardTabProps> = ({
  orders,
  products,
  onViewOrderDetail,
  onViewInvoice,
  onSelectProduct
}) => {
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);
  const [timeRange, setTimeRange] = useState<"all" | "month" | "week">("all");

  const now = new Date();
  const startOfWeek = new Date(now);
  const dayOfWeek = startOfWeek.getDay() || 7;
  startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek + 1);
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Phân tích dữ liệu theo mốc thời gian đã chọn
  const { topDresses, topCustomers, summary, packageStats, currentlyRentedCount } = useMemo(() => {
    // Chỉ tính các đơn hợp lệ (bỏ qua đơn bị hủy)
    const validOrders = orders.filter((o) => {
      if (o.status === "cancelled") return false;
      const orderDate = new Date(o.createdAt || o.updatedAt || Date.now());
      if (timeRange === "week") return orderDate >= startOfWeek;
      if (timeRange === "month") return orderDate >= startOfMonth;
      return true;
    });

    const dressMap = new Map<string, {
      id: string;
      title: string;
      image: string;
      rentCount: number;
      totalRevenue: number;
      price: number;
      category?: string;
      isCurrentlyRented?: boolean;
    }>();

    const customerMap = new Map<string, CustomerSummary>();

    let totalRentalCount = 0;
    let totalRentalRevenue = 0;
    let currentlyRentedItems = 0;

    const pkgCounts = {
      "1day": 0,
      "2days": 0,
      "3days": 0,
      "custom": 0,
    };

    validOrders.forEach((ord) => {
      const phone = (ord.customerPhone || "").trim();
      const customerName = ord.customerName || "Khách hàng";
      const items = ord.items || [];
      const isPaid = ord.paymentStatus === "paid";
      // Doanh thu thực tế của đơn (khấu trừ tiền cọc)
      const orderNetRevenue = Math.max(0, (ord.totalAmount || 0) - (ord.depositTotal || 0));

      // Nhóm khách hàng
      if (phone) {
        if (!customerMap.has(phone)) {
          customerMap.set(phone, {
            id: `cust-${phone}`,
            name: customerName,
            phone,
            email: ord.customerEmail || "",
            address: ord.shippingAddress || "",
            total_rent_count: 0,
            total_orders_count: 0,
            total_spent: 0,
            paid_amount: 0,
            debt: 0,
            last_order_date: ord.createdAt,
            is_vip: false,
            recent_dresses: []
          });
        }
        const cust = customerMap.get(phone)!;
        cust.total_orders_count += 1;
        cust.total_spent += orderNetRevenue;
        if (isPaid) cust.paid_amount += orderNetRevenue;
        else cust.debt += orderNetRevenue;

        if (new Date(ord.createdAt || "").getTime() > new Date(cust.last_order_date || "").getTime()) {
          cust.last_order_date = ord.createdAt;
          if (ord.customerName) cust.name = ord.customerName;
        }
      }

      // Duyệt từng váy trong đơn
      items.forEach((it) => {
        if (it.mode === "rent") {
          const qty = it.quantity || 1;
          const rentFee = (it.price || 0) * qty;

          totalRentalCount += qty;
          totalRentalRevenue += rentFee;

          // Thống kê gói thuê
          if (it.selectedPackage === "1day") pkgCounts["1day"] += qty;
          else if (it.selectedPackage === "2days") pkgCounts["2days"] += qty;
          else if (it.selectedPackage === "3days") pkgCounts["3days"] += qty;
          else pkgCounts["custom"] += qty;

          const isRentedNow = ord.status === "rented" || (ord.status as string) === "renting";
          if (isRentedNow) {
            currentlyRentedItems += qty;
          }

          if (phone && customerMap.has(phone)) {
            customerMap.get(phone)!.total_rent_count += qty;
            if (it.productTitle && !customerMap.get(phone)!.recent_dresses?.includes(it.productTitle)) {
              customerMap.get(phone)!.recent_dresses?.push(it.productTitle);
            }
          }

          const dressKey = it.productId || it.productTitle;
          if (!dressMap.has(dressKey)) {
            const prod = products.find((p) => p.id === it.productId);
            dressMap.set(dressKey, {
              id: it.productId,
              title: it.productTitle,
              image: it.productImage || prod?.featuredImage || prod?.images?.[0] || "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=300&q=80",
              rentCount: 0,
              totalRevenue: 0,
              price: it.price || prod?.rentPrice1Day || 0,
              category: prod?.category,
              isCurrentlyRented: isRentedNow
            });
          }

          const d = dressMap.get(dressKey)!;
          d.rentCount += qty;
          d.totalRevenue += rentFee;
          if (isRentedNow) d.isCurrentlyRented = true;
          if (!d.image && it.productImage) d.image = it.productImage;
        }
      });
    });

    const dressesSorted = Array.from(dressMap.values()).sort((a, b) => b.rentCount - a.rentCount || b.totalRevenue - a.totalRevenue);

    const customersSorted = Array.from(customerMap.values())
      .map((c) => {
        c.is_vip = c.total_rent_count >= 2 || c.total_spent >= 500000;
        return c;
      })
      .sort((a, b) => b.total_rent_count - a.total_rent_count || b.total_spent - a.total_spent);

    return {
      topDresses: dressesSorted,
      topCustomers: customersSorted,
      summary: {
        totalRentalCount,
        totalRentalRevenue,
        totalCustomers: customerMap.size,
        totalDressesRented: dressMap.size
      },
      packageStats: pkgCounts,
      currentlyRentedCount: currentlyRentedItems
    };
  }, [orders, products, timeRange, startOfWeek, startOfMonth]);

  const maxDressRentCount = Math.max(...topDresses.map((d) => d.rentCount), 1);
  const bestDress = topDresses[0];
  const bestCustomer = topCustomers[0];

  // Helper tính tỷ lệ % các gói thuê
  const totalPackages = (packageStats["1day"] + packageStats["2days"] + packageStats["3days"] + packageStats["custom"]) || 1;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. Header Banner & Time Filter */}
      <div className="bg-gradient-to-br from-rose-50 via-white to-amber-50/50 rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-rose-200/30 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-amber-200/30 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100/80 text-rose-800 text-xs font-bold mb-2.5 border border-rose-200/60 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              <span>Bi Bi Boutique • Trung Tâm Thống Kê & Hiệu Suất</span>
            </div>
            <h3 className="font-serif font-black text-2xl sm:text-3xl text-gray-900 tracking-tight">
              Dashboard Váy & Khách Hàng Hot Nhất
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-xl leading-relaxed">
              Theo dõi trực quan tần suất thuê đồ, những mẫu váy được yêu thích nhất và bảng xếp hạng khách hàng thân thiết của shop.
            </p>
          </div>

          {/* Time Filter Pills */}
          <div className="flex items-center gap-1.5 bg-white/90 p-1.5 rounded-2xl border border-gray-200/80 shadow-2xs backdrop-blur-xs shrink-0 self-stretch md:self-auto justify-center">
            <button
              onClick={() => setTimeRange("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeRange === "all"
                  ? "bg-rose-500 text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/70"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setTimeRange("month")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeRange === "month"
                  ? "bg-rose-500 text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/70"
              }`}
            >
              Tháng này
            </button>
            <button
              onClick={() => setTimeRange("week")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeRange === "week"
                  ? "bg-rose-500 text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/70"
              }`}
            >
              7 ngày qua
            </button>
          </div>
        </div>
      </div>

      {/* 2. Four Luxury Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Doanh Thu Thuê Thực Tế */}
        <div className="bg-white p-5 rounded-3xl border border-emerald-100/80 shadow-sm hover:shadow-md transition-all relative overflow-hidden bg-gradient-to-br from-emerald-50/40 via-white to-white">
          <div className="flex items-center justify-between text-xs text-emerald-800 font-bold mb-3">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Doanh Thu Thuê
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              {summary.totalRentalCount} lượt
            </span>
          </div>
          <h4 className="font-mono text-2xl font-black text-emerald-700 tracking-tight">
            {formatVND(summary.totalRentalRevenue)}
          </h4>
          <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span>Đã khấu trừ toàn bộ tiền cọc</span>
          </p>
        </div>

        {/* Card 2: Top 1 Váy Hot Nhất */}
        <div className="bg-white p-5 rounded-3xl border border-amber-200/70 shadow-sm hover:shadow-md transition-all relative overflow-hidden bg-gradient-to-br from-amber-50/50 via-white to-white">
          <div className="flex items-center justify-between text-xs text-amber-900 font-bold mb-2">
            <span className="flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-600 fill-amber-500" />
              Váy Hot #1 Của Shop
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 text-[10px] font-bold">
              🥇 Quán quân
            </span>
          </div>
          {bestDress ? (
            <div className="flex items-center gap-3 mt-1.5">
              <div className="relative shrink-0">
                <img
                  src={bestDress.image}
                  alt={bestDress.title}
                  className="w-12 h-12 rounded-2xl object-cover border border-amber-200 shadow-2xs cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => onSelectProduct && bestDress.id && onSelectProduct(bestDress.id)}
                />
              </div>
              <div className="min-w-0 flex-1">
                <h5 
                  className="font-bold text-xs text-gray-900 truncate hover:text-rose-600 cursor-pointer"
                  onClick={() => onSelectProduct && bestDress.id && onSelectProduct(bestDress.id)}
                  title={bestDress.title}
                >
                  {bestDress.title}
                </h5>
                <p className="text-amber-700 font-mono font-black text-sm mt-0.5">
                  🔥 {bestDress.rentCount} lần thuê
                </p>
                <p className="text-[10px] text-gray-500 font-mono">
                  Thu về {formatVND(bestDress.totalRevenue)}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400 mt-3">Chưa có dữ liệu thuê</p>
          )}
        </div>

        {/* Card 3: Top 1 Khách VIP */}
        <div className="bg-white p-5 rounded-3xl border border-rose-200/70 shadow-sm hover:shadow-md transition-all relative overflow-hidden bg-gradient-to-br from-rose-50/50 via-white to-white">
          <div className="flex items-center justify-between text-xs text-rose-900 font-bold mb-2">
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-rose-600 fill-rose-500" />
              Khách VIP Số 1
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-rose-100 text-rose-800 text-[10px] font-bold">
              👑 Thân thiết
            </span>
          </div>
          {bestCustomer ? (
            <div className="mt-1.5">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-xs text-gray-900 truncate max-w-[120px]">
                  {bestCustomer.name}
                </h5>
                <span className="font-mono text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100">
                  {bestCustomer.phone}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs pt-1">
                <span className="font-bold text-amber-700 font-mono text-[11px]">
                  👗 {bestCustomer.total_rent_count} lần thuê
                </span>
                <span className="font-bold text-gray-800 font-mono text-[11px]">
                  {formatVND(bestCustomer.total_spent)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400 mt-3">Chưa có dữ liệu khách</p>
          )}
        </div>

        {/* Card 4: Tình Trạng Thuê Kho */}
        <div className="bg-white p-5 rounded-3xl border border-indigo-100/80 shadow-sm hover:shadow-md transition-all relative overflow-hidden bg-gradient-to-br from-indigo-50/40 via-white to-white">
          <div className="flex items-center justify-between text-xs text-indigo-900 font-bold mb-3">
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              Tình Trạng Kho Váy
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 text-[10px] font-bold">
              {products.length} mẫu
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <h4 className="font-mono text-2xl font-black text-indigo-700">
              {currentlyRentedCount}
            </h4>
            <span className="text-xs font-semibold text-gray-500">chiếc đang cho thuê</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">
            {summary.totalDressesRented} mẫu đã phát sinh doanh thu thuê
          </p>
        </div>

      </div>

      {/* 3. Visual Breakdown: Phân bổ gói thuê */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="font-serif font-bold text-sm text-gray-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-600" />
              <span>Phân Bổ Xu Hướng Gói Thuê Đồ Của Khách Hàng</span>
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              Khách chuộng gói 1 ngày, 2 ngày hay 3 ngày để shop sắp xếp lịch đón trả đồ phù hợp
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-xl shrink-0">
            Tổng {summary.totalRentalCount} lượt thuê
          </span>
        </div>

        {/* Multi-segment visual progress bar */}
        <div className="w-full bg-gray-100 rounded-2xl h-4 overflow-hidden flex shadow-inner">
          <div 
            style={{ width: `${(packageStats["1day"] / totalPackages) * 100}%` }}
            className="bg-emerald-500 h-full transition-all duration-500 hover:opacity-90"
            title={`Gói 1 ngày: ${packageStats["1day"]} lượt`}
          />
          <div 
            style={{ width: `${(packageStats["2days"] / totalPackages) * 100}%` }}
            className="bg-blue-500 h-full transition-all duration-500 hover:opacity-90"
            title={`Gói 2 ngày: ${packageStats["2days"]} lượt`}
          />
          <div 
            style={{ width: `${(packageStats["3days"] / totalPackages) * 100}%` }}
            className="bg-rose-500 h-full transition-all duration-500 hover:opacity-90"
            title={`Gói 3 ngày: ${packageStats["3days"]} lượt`}
          />
          <div 
            style={{ width: `${(packageStats["custom"] / totalPackages) * 100}%` }}
            className="bg-amber-500 h-full transition-all duration-500 hover:opacity-90"
            title={`Khác/Tự chọn: ${packageStats["custom"]} lượt`}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50/50 border border-emerald-100">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-gray-700 font-medium">Gói 1 ngày:</span>
            <strong className="font-mono text-emerald-800 ml-auto">{packageStats["1day"]}</strong>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-blue-50/50 border border-blue-100">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
            <span className="text-gray-700 font-medium">Gói 2 ngày:</span>
            <strong className="font-mono text-blue-800 ml-auto">{packageStats["2days"]}</strong>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-rose-50/50 border border-rose-100">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
            <span className="text-gray-700 font-medium">Gói 3 ngày:</span>
            <strong className="font-mono text-rose-800 ml-auto">{packageStats["3days"]}</strong>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-50/50 border border-amber-100">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
            <span className="text-gray-700 font-medium">Khác / Thêm ngày:</span>
            <strong className="font-mono text-amber-800 ml-auto">{packageStats["custom"]}</strong>
          </div>
        </div>
      </div>

      {/* 4. Hai Bảng Xếp Hạng Chính (Váy Hot & Khách VIP) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CỘT TRÁI: BẢNG XẾP HẠNG VÁY THUÊ NHIỀU NHẤT */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
            <div>
              <h4 className="font-serif font-black text-base text-gray-900 flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-500 fill-rose-500" />
                <span>Top Mẫu Váy Thuê Nhiều Nhất</span>
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">Xếp theo tổng số lần khách thuê & doanh thu thu về</p>
            </div>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-100">
              {topDresses.length} mẫu hot
            </span>
          </div>

          {topDresses.length > 0 ? (
            <div className="space-y-3">
              {topDresses.map((dress, index) => {
                const isTop1 = index === 0;
                const isTop2 = index === 1;
                const isTop3 = index === 2;
                const percentage = Math.max(12, Math.round((dress.rentCount / maxDressRentCount) * 100));

                return (
                  <div
                    key={dress.id || index}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isTop1 
                        ? "bg-amber-50/40 border-amber-200/90 shadow-xs" 
                        : isTop2
                        ? "bg-rose-50/20 border-rose-100/90"
                        : "bg-white border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank badge */}
                      <div className="w-8 text-center shrink-0 flex items-center justify-center">
                        {isTop1 ? (
                          <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs shadow-2xs border border-amber-300">
                            🥇
                          </div>
                        ) : isTop2 ? (
                          <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-xs shadow-2xs border border-slate-300">
                            🥈
                          </div>
                        ) : isTop3 ? (
                          <div className="w-7 h-7 rounded-xl bg-orange-100 text-orange-900 flex items-center justify-center font-bold text-xs shadow-2xs border border-orange-300">
                            🥉
                          </div>
                        ) : (
                          <span className="font-mono font-bold text-xs text-gray-400">#{index + 1}</span>
                        )}
                      </div>

                      {/* Dress Thumbnail */}
                      <div className="relative shrink-0">
                        <img
                          src={dress.image}
                          alt={dress.title}
                          className="w-13 h-13 rounded-2xl object-cover border border-gray-100 shadow-2xs cursor-pointer hover:opacity-90 hover:scale-105 transition-all"
                          onClick={() => onSelectProduct && dress.id && onSelectProduct(dress.id)}
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <h5 
                            className="font-bold text-xs text-gray-900 truncate cursor-pointer hover:text-rose-600"
                            onClick={() => onSelectProduct && dress.id && onSelectProduct(dress.id)}
                            title={dress.title}
                          >
                            {dress.title}
                          </h5>
                          {dress.isCurrentlyRented && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[9px] shrink-0 border border-emerald-200">
                              Đang cho thuê
                            </span>
                          )}
                        </div>

                        {/* Visual bar */}
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner">
                          <div
                            style={{ width: `${percentage}%` }}
                            className={`h-full rounded-full transition-all duration-500 ${
                              isTop1 ? "bg-amber-500" : isTop2 ? "bg-rose-500" : "bg-emerald-500"
                            }`}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-0.5">
                          <span className="font-bold text-emerald-700 font-mono">
                            👗 {dress.rentCount} lần thuê
                          </span>
                          <span className="font-mono text-gray-500">
                            Thu về: <strong className="text-gray-900">{formatVND(dress.totalRevenue)}</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 text-xs">
              Chưa có dữ liệu thuê váy nào trong khoảng thời gian này.
            </div>
          )}
        </div>

        {/* CỘT PHẢI: BẢNG XẾP HẠNG KHÁCH HÀNG VIP */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
            <div>
              <h4 className="font-serif font-black text-base text-gray-900 flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span>Bảng Xếp Hạng Khách Hàng Thân Thiết</span>
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">Khách thuê nhiều lần & đóng góp doanh thu cao nhất cho shop</p>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
              {topCustomers.length} khách hàng
            </span>
          </div>

          {topCustomers.length > 0 ? (
            <div className="space-y-3">
              {topCustomers.map((customer, index) => {
                const isTop1 = index === 0;
                const isTop2 = index === 1;
                const isTop3 = index === 2;
                const cleanPhone = customer.phone.replace(/\s+/g, "");

                // Loyalty Tier: Kim Cương, Vàng, Bạc
                const isDiamond = customer.total_rent_count >= 4 || customer.total_spent >= 1000000;
                const isGold = !isDiamond && (customer.total_rent_count >= 2 || customer.total_spent >= 500000);

                return (
                  <div
                    key={customer.phone}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isTop1 
                        ? "bg-amber-50/40 border-amber-200/90 shadow-xs" 
                        : isTop2
                        ? "bg-rose-50/20 border-rose-100/90"
                        : "bg-white border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank badge */}
                      <div className="w-8 text-center shrink-0 flex items-center justify-center">
                        {isTop1 ? (
                          <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs shadow-2xs border border-amber-300">
                            👑
                          </div>
                        ) : isTop2 ? (
                          <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-xs shadow-2xs border border-slate-300">
                            🥈
                          </div>
                        ) : isTop3 ? (
                          <div className="w-7 h-7 rounded-xl bg-orange-100 text-orange-900 flex items-center justify-center font-bold text-xs shadow-2xs border border-orange-300">
                            🥉
                          </div>
                        ) : (
                          <span className="font-mono font-bold text-xs text-gray-400">#{index + 1}</span>
                        )}
                      </div>

                      {/* Avatar initials */}
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                        {customer.name ? customer.name.charAt(0).toUpperCase() : "K"}
                      </div>

                      {/* Customer Details */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-bold text-xs text-gray-900 truncate">
                              {customer.name}
                            </span>
                            {isDiamond ? (
                              <span className="px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-800 font-bold text-[9px] border border-purple-200 inline-flex items-center gap-0.5">
                                <Gem className="w-2.5 h-2.5" /> Kim Cương
                              </span>
                            ) : isGold ? (
                              <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 font-bold text-[9px] border border-amber-300">
                                👑 VIP Vàng
                              </span>
                            ) : null}
                          </div>

                          {/* Quick Contact Buttons */}
                          <div className="flex items-center gap-1 shrink-0">
                            <a
                              href={`tel:${cleanPhone}`}
                              className="p-1 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                              title="Gọi điện ngay"
                            >
                              <Phone className="w-3 h-3" />
                            </a>
                            <a
                              href={`https://zalo.me/${cleanPhone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                            >
                              Zalo
                            </a>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-mono font-bold text-rose-600">
                            📞 {customer.phone}
                          </span>
                          <span className="font-mono text-gray-800 font-bold">
                            Chi tiêu: {formatVND(customer.total_spent)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold font-mono text-[10px] border border-emerald-200">
                            👗 {customer.total_rent_count} lần thuê
                          </span>

                          <button
                            onClick={() => setSelectedCustomer(customer)}
                            className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline"
                          >
                            <History className="w-3.5 h-3.5" />
                            <span>Lịch sử thuê ({customer.total_orders_count})</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 text-xs">
              Chưa có dữ liệu khách hàng nào trong khoảng thời gian này.
            </div>
          )}
        </div>

      </div>

      {/* 5. Customer History Modal */}
      {selectedCustomer && (
        <CustomerHistoryModal
          customer={selectedCustomer}
          orders={orders}
          isOpen={Boolean(selectedCustomer)}
          onClose={() => setSelectedCustomer(null)}
          onViewOrderDetail={onViewOrderDetail}
          onViewInvoice={onViewInvoice}
        />
      )}
    </div>
  );
};
