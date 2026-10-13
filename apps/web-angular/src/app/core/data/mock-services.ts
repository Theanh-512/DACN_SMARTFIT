export interface ServiceItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  benefits: string[];
}

export const MOCK_SERVICES: ServiceItem[] = [
  {
    id: '1',
    name: 'Smart Tracking AI',
    slug: 'smart-tracking-ai',
    description: 'Theo dõi chỉ số sinh trắc học và lịch trình luyện tập thông minh thời gian thực.',
    icon: '📊',
    benefits: ['Theo dõi nhịp tim', 'Đo đạc calo tiêu thụ', 'Gợi ý bài tập cá nhân hoá']
  },
  {
    id: '2',
    name: 'HLV Cá Nhân 1-on-1',
    slug: 'personal-training',
    description: 'Đội ngũ HLV chứng chỉ quốc tế kèm 1:1, lên thực đơn và lộ trình chuyên sâu.',
    icon: '🏋️',
    benefits: ['Lịch tập linh hoạt', 'Kiểm soát form chuẩn y khoa', 'Thực đơn dinh dưỡng riêng']
  },
  {
    id: '3',
    name: 'Phòng Tập Hybrid Studio',
    slug: 'hybrid-studio',
    description: 'Trang thiết bị chuẩn Olympic kết hợp màn hình hiển thị cảm biến số.',
    icon: '🏢',
    benefits: ['Không gian chuẩn quốc tế', 'Môi trường vô trùng', 'Khu vực phục hồi cơ bắp']
  }
];

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  popular?: boolean;
  features: string[];
  ctaText: string;
}

export const MOCK_PRICING_PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Gói Cơ Bản',
    price: '499.000₫',
    period: '/tháng',
    popular: false,
    features: ['Truy cập phòng tập cơ bản', 'Đo chỉ số InBody miễn phí 1 lần/tháng', 'Ứng dụng lịch tập di động'],
    ctaText: 'Đăng Ký Cơ Bản'
  },
  {
    id: 'pro',
    name: 'Gói Pro Studio',
    price: '899.000₫',
    period: '/tháng',
    popular: true,
    features: ['Toàn quyền truy cập mọi cơ sở', 'Kèm 2 buổi với HLV chuyên nghiệp', 'Phân tích dữ liệu vận động AI', 'Khu vực xông hơi & recovery'],
    ctaText: 'Chọn Gói Phổ Biến'
  },
  {
    id: 'elite',
    name: 'Gói Elite VIP',
    price: '1.499.000₫',
    period: '/tháng',
    popular: false,
    features: ['Đặc quyền VIP không giới hạn', 'HLV cá nhân định kỳ hàng tuần', 'Đặc quyền tủ đồ và khăn riêng', 'Tư vấn dinh dưỡng chuyên gia'],
    ctaText: 'Trải Nghiệm VIP'
  }
];
