export const translations = {
    vi: {
        common: {
            clean_now: "Làm sạch Ngay",
            copy_result: "Copy Kết quả",
            copied: "Đã copy vào bộ nhớ tạm!",
            loading: "Đang xử lý...",
            success: "Thành công!",
            error: "Lỗi hệ thống.",
            browse: "Chọn",
            directory: "Thư mục",
            file: "Tệp tin",
        },
        html_cleaner: {
            title: "HTML",
            highlight: "Cleaner",
            subtitle: "Chuẩn hóa nội dung từ tệp tin hoặc văn bản dán trực tiếp.",
            file_mode: "Xử lý Tệp tin",
            paste_mode: "Dán Trực tiếp",
            step_1_source: "1. Chọn nguồn",
            step_1_subtitle: "Hỗ trợ .html, .htm",
            step_2_dest: "2. Thư mục đích",
            step_2_overwrite: "Ghi đè tệp gốc",
            files_selected: "Đã chọn {count} tệp tin",
            original_content: "Nội dung Gốc (Rich Text)",
            clean_result: "Kết quả Làm sạch (HTML)",
            placeholder_paste: "Vui lòng dán nội dung vào trình soạn thảo.",
            placeholder_result: "Kết quả làm sạch sẽ xuất hiện tại đây...",
            seo_link_control: "SEO Link Control",
            seo_subtitle: "Tự động gắn Target / Rel",
            domain_placeholder: "Nhập domain của bạn (ví dụ: example.com)...",
            seo_note: "* Các link bắt đầu bằng domain này sẽ được giữ nguyên. Các link khác (External) sẽ tự động được gắn target=\"_blank\" và rel=\"nofollow\".",
            config_title: "Cấu hình Tùy chọn làm sạch",
            update_preview: "Cập nhật Preview",
            exec_clean: "Thực thi làm sạch ngay",
            save_all: "Làm sạch & Lưu tất cả",
            preview_title: "Xem trước nội dung ({count} tệp)",
            original_size: "Gốc",
            new_size: "Mới",
            options: {
                remove_scripts_styles: "Xóa Scripts & Styles",
                remove_comments: "Xóa Chú thích (Comments)",
                remove_attributes: "Xóa TẤT CẢ thuộc tính",
                remove_classes_ids: "Xóa Class & IDs",
                remove_inline_styles: "Xóa Inline Styles",
                remove_all_tags: "Strip Tags (Chữ thuần)",
                remove_extra_whitespace: "Làm gọn khoảng trắng",
                remove_spans: "Xóa thẻ <span> thừa",
                remove_empty_tags: "Xóa thẻ trống",
                remove_successive_nbsp: "Xóa &nbsp; thừa",
                remove_tags_with_nbsp: "Xóa thẻ chỉ chứa &nbsp;",
                remove_links: "Gỡ thẻ Link (<a>)",
                remove_images: "Xóa toàn bộ Ảnh",
                remove_tables: "Xóa toàn bộ Bảng",
                replace_tables_with_divs: "Thay Table bằng Div",
                prettify: "Định dạng (Prettify)",
            }
        },
        guide: {
            title: "Hướng dẫn",
            highlight: "Sử dụng",
            subtitle: "4 bước đơn giản để chuẩn hóa dữ liệu của bạn.",
            steps: [
                {
                    title: "Chọn nguồn dữ liệu",
                    description: "Chọn tệp tin lẻ hoặc quét toàn bộ thư mục để bắt đầu quy trình chuẩn hóa.",
                },
                {
                    title: "Chế độ & Cấu hình",
                    description: "Sử dụng Slugify để đổi tên file hàng loạt hoặc HTML Cleaner để làm sạch mã nguồn HTML.",
                },
                {
                    title: "Kiểm tra Preview",
                    description: "Hệ thống cung cấp khung CodeMirror chuyên nghiệp để bạn soi từng dòng mã trước khi dọn dẹp.",
                },
                {
                    title: "Thực thi an toàn",
                    description: "Chọn ghi đè hoặc lưu ra thư mục mới để đảm bảo an toàn tuyệt đối cho dữ liệu gốc.",
                }
            ],
            tips_title: "Mẹo nhỏ cho bạn",
            tips: [
                "Luôn dùng Preview để kiểm tra cấu trúc mã HTML sau khi làm sạch.",
                "SEO Link Control giúp bạn tự động hóa việc gắn rel='nofollow' cho link ngoài cực kỳ nhanh chóng.",
                "Sử dụng {n} trong Rename để tạo danh sách tệp tin có thứ tự khoa học cho website."
            ]
        },
        docs: {
            title: "Tài liệu",
            highlight: "Kỹ thuật",
            subtitle: "Kiến trúc hệ thống và cơ chế vận hành của Slugify Master.",
            architecture: {
                title: "Kiến trúc hệ thống",
                content: "Sử dụng FastAPI làm lõi xử lý hiệu năng cao, kết hợp cùng Next.js 14 và Tailwind CSS cho giao diện người dùng hiện đại."
            },
            cleaning_logic: {
                title: "Logic làm sạch HTML",
                content: "Sử dụng bộ thư viện BeautifulSoup4 với thuật toán làm sạch phân cấp, đảm bảo chỉ loại bỏ mã rác mà không làm hỏng cấu trúc DOM văn bản."
            },
            security: {
                title: "Bảo mật tệp tin",
                content: "Cơ chế Path Validation ngăn chặn Directory Traversal. Toàn bộ thao tác tệp đều được kiểm duyệt nghiêm ngặt qua lớp Service."
            },
            api_structure: "Cấu trúc API",
            api_analyze: "Phân tích và tạo Preview cho HTML/File.",
            api_execute: "Thực hiện xử lý (Đổi tên / Lưu tệp đã làm sạch)."
        },
        rename: {
            title: "Slugify",
            highlight: "Master",
            subtitle: "Hỗ trợ đổi tên file hàng loạt chuẩn SEO.",
            select_folder: "Chọn Thư Mục",
            select_folder_sub: "Quét toàn bộ tệp trong folder",
            select_files: "Chọn Nhiều Tệp",
            select_files_sub: "Chọn rời rạc các file muốn sửa",
            pattern_label: "Cấu hình tên tệp hàng loạt (Naming Pattern)",
            pattern_hint: "Hỗ trợ: {slug}, {n}",
            placeholder_pattern: "Nhập mẫu: master-{n} hoặc {slug}_v1",
            source_path: "Đường dẫn Nguồn",
            target_path: "Thư mục Đích (Tùy chọn)",
            browse_folder: "Chọn Folder",
            browse_target: "Chọn Đích",
            summary: "Tổng cộng {count} mục",
            apply_changes: "Áp dụng thay đổi",
            col_original: "Tên gốc",
            col_new: "Tên mới (Slug)",
            status_success: "Đã hoàn thành! Thành công: {success}, Lỗi: {error}",
            error_no_selection: "Vui lòng chọn tệp hoặc thư mục trước."
        },
        header: {
            rename: "Đổi tên",
            html_cleaner: "HTML Cleaner",
            guide: "Hướng dẫn",
            docs: "Tài liệu",
            get_pro: "Bản Pro"
        },
        footer: {
            description: "Giải pháp tối ưu cho việc dọn dẹp và chuẩn hóa tên tệp tin. Giúp dự án của bạn trở nên chuyên nghiệp và chuẩn SEO hơn.",
            product: "Sản phẩm",
            connect: "Kết nối",
            rights: "All rights reserved.",
            made_with: "Made with"
        }
    },
    en: {
        common: {
            clean_now: "Clean Now",
            copy_result: "Copy Result",
            copied: "Copied to clipboard!",
            loading: "Processing...",
            success: "Success!",
            error: "System error.",
            browse: "Browse",
            directory: "Directory",
            file: "Files",
        },
        html_cleaner: {
            title: "HTML",
            highlight: "Cleaner",
            subtitle: "Normalize content from files or pasted text directly.",
            file_mode: "File Processing",
            paste_mode: "Direct Paste",
            step_1_source: "1. Select Source",
            step_1_subtitle: "Supports .html, .htm",
            step_2_dest: "2. Target Directory",
            step_2_overwrite: "Overwrite original",
            files_selected: "{count} files selected",
            original_content: "Original Content (Rich Text)",
            clean_result: "Cleaned Result (HTML)",
            placeholder_paste: "Please paste content into the editor.",
            placeholder_result: "Cleaned result will appear here...",
            seo_link_control: "SEO Link Control",
            seo_subtitle: "Auto-assign Target / Rel",
            domain_placeholder: "Enter your domain (e.g., example.com)...",
            seo_note: "* Links starting with this domain stay unchanged. External links get target=\"_blank\" and rel=\"nofollow\".",
            config_title: "Cleaning Configuration",
            update_preview: "Update Preview",
            exec_clean: "Execute Cleaning Now",
            save_all: "Clean & Save All",
            preview_title: "Preview Content ({count} files)",
            original_size: "Original",
            new_size: "New",
            options: {
                remove_scripts_styles: "Remove Scripts & Styles",
                remove_comments: "Remove Comments",
                remove_attributes: "Remove ALL Attributes",
                remove_classes_ids: "Remove Classes & IDs",
                remove_inline_styles: "Remove Inline Styles",
                remove_all_tags: "Strip All Tags (Plain Text)",
                remove_extra_whitespace: "Collapse Whitespace",
                remove_spans: "Remove redundant <span>",
                remove_empty_tags: "Remove empty tags",
                remove_successive_nbsp: "Remove extra &nbsp;",
                remove_tags_with_nbsp: "Remove tags with only &nbsp;",
                remove_links: "Unwrap Link tags (<a>)",
                remove_images: "Remove all Images",
                remove_tables: "Remove all Tables",
                replace_tables_with_divs: "Replace Tables with Divs",
                prettify: "Format (Prettify)",
            }
        },
        guide: {
            title: "User",
            highlight: "Guide",
            subtitle: "4 simple steps to normalize your data data.",
            steps: [
                {
                    title: "Select Source",
                    description: "Select individual files or scan an entire folder to start the normalization process.",
                },
                {
                    title: "Mode & Config",
                    description: "Use Slugify for batch renaming or HTML Cleaner to sanitize source code.",
                },
                {
                    title: "Check Preview",
                    description: "The system provides a professional CodeMirror preview to inspect every line before cleaning.",
                },
                {
                    title: "Safe Execution",
                    description: "Choose to overwrite or save to a new directory for absolute original data safety.",
                }
            ],
            tips_title: "Pro Tips",
            tips: [
                "Always use Preview to check the HTML structure after cleaning.",
                "SEO Link Control automates target='_blank' and rel='nofollow' for external links.",
                "Use {n} in Rename to create SEO-optimized numbered lists for your website."
            ]
        },
        docs: {
            title: "Technical",
            highlight: "Docs",
            subtitle: "System architecture and operational mechanism of Slugify Master.",
            architecture: {
                title: "System Architecture",
                content: "Built with FastAPI core for high performance, combined with Next.js 14 and Tailwind CSS for a modern UI."
            },
            cleaning_logic: {
                title: "HTML Cleaning Logic",
                content: "Powered by BeautifulSoup4 with a hierarchical cleaning algorithm, ensuring junk removal without breaking the document structure."
            },
            security: {
                title: "File Security",
                content: "Path Validation prevents Directory Traversal. All file operations are strictly audited via the Service layer."
            },
            api_execute: "Execution (Rename / Save Cleaned Files)."
        },
        rename: {
            title: "Slugify",
            highlight: "Master",
            subtitle: "SEO-friendly bulk file renaming tool.",
            select_folder: "Select Folder",
            select_folder_sub: "Scan all files in folder",
            select_files: "Select Files",
            select_files_sub: "Pick individual files to edit",
            pattern_label: "Bulk Naming Pattern",
            pattern_hint: "Supports: {slug}, {n}",
            placeholder_pattern: "Enter pattern: master-{n} or {slug}_v1",
            source_path: "Source Path",
            target_path: "Target Directory (Optional)",
            browse_folder: "Browse Folder",
            browse_target: "Browse Target",
            summary: "Total {count} items",
            apply_changes: "Apply Changes",
            col_original: "Original Name",
            col_new: "New Name (Slug)",
            status_success: "Done! Success: {success}, Errors: {error}",
            error_no_selection: "Please select files or folders first."
        },
        header: {
            rename: "Rename",
            html_cleaner: "HTML Cleaner",
            guide: "Guide",
            docs: "Docs",
            get_pro: "Get Pro"
        },
        footer: {
            description: "Optimal solution for cleaning and normalizing file names. Professional and SEO-friendly projects.",
            product: "Product",
            connect: "Connect",
            rights: "All rights reserved.",
            made_with: "Made with"
        }
    }
};

export type Language = 'vi' | 'en';
