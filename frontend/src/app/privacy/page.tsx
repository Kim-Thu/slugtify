"use client";

import { GlassCard } from "@/components/GlassCard";
import { PageWrapper } from "@/components/PageWrapper";
import { SectionHeader } from "@/components/SectionHeader";
import { EyeOff, Lock, ShieldAlert } from "lucide-react";

export default function PrivacyPage() {
    return (
        <PageWrapper>
            <SectionHeader
                title="Chính sách"
                highlight="Bảo mật"
                subtitle="Sự riêng tư và an toàn dữ liệu của bạn là ưu tiên hàng đầu của chúng tôi."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                <GlassCard>
                    <Lock className="w-8 h-8 text-blue-400 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-3">Xử lý tệp cục bộ</h3>
                    <p className="text-gray-400 leading-relaxed font-light">
                        Slugify Master hoạt động trực tiếp trên máy tính của bạn. Chúng tôi KHÔNG bao giờ tải tệp tin của bạn lên bất kỳ máy chủ nào. Mọi thao tác đổi tên được thực hiện bởi Backend local.
                    </p>
                </GlassCard>

                <GlassCard>
                    <EyeOff className="w-8 h-8 text-emerald-400 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-3">Không theo dõi</h3>
                    <p className="text-gray-400 leading-relaxed font-light">
                        Ứng dụng không sử dụng cookie theo dõi, không thu thập thông tin cá nhân hay hành vi sử dụng của bạn. Dữ liệu của bạn là của bạn.
                    </p>
                </GlassCard>
            </div>

            <GlassCard className="space-y-4">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <ShieldAlert className="w-6 h-6 text-amber-400" /> Cam kết an toàn
                </h3>
                <div className="space-y-4 text-gray-400 font-light leading-relaxed">
                    <p>
                        1. <strong>Quyền truy cập tệp</strong>: Ứng dụng chỉ có quyền truy cập vào các thư mục và tệp tin mà bạn chủ động chọn thông qua hộp thoại hệ thống.
                    </p>
                    <p>
                        2. <strong>Tính minh bạch</strong>: Mã nguồn của công cụ được cung cấp minh bạch để bạn có thể kiểm tra các hàm xử lý IO (vào/ra) tệp tin.
                    </p>
                    <p>
                        3. <strong>Bảo mật Backend</strong>: Backend FastAPI được cấu hình chỉ nhận yêu cầu từ chính địa chỉ Localhost (127.0.0.1), ngăn chặn các truy cập trái phép từ internet.
                    </p>
                </div>
            </GlassCard>

            <div className="text-center pt-8 text-gray-500 text-sm italic">
                Cập nhật lần cuối: 25 tháng 1, 2026 bởi Kim Thu.
            </div>
        </PageWrapper>
    );
}
