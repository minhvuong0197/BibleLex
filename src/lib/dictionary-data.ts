// Từ điển Kinh Thánh công cộng (phong cách Easton's / Smith's, public domain).
// Key: thuật ngữ tiếng Anh viết thường. Mở rộng bằng cách thêm entry.

export interface DictionaryEntry {
  dict: string
  definition: string
}

export const DICTIONARIES: Record<string, DictionaryEntry[]> = {
  love: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Tình yêu (love): trong Kinh Thánh, agapē chỉ tình yêu hy sinh, ban cho, bắt nguồn từ Đức Chúa Trời (1 Giăng 4:8). Khác với tình cảm nhất thời, đây là sự chọn lựa ý chí vì ích tốt của người khác.",
    },
  ],
  faith: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Đức tin (faith): sự tin cậy vững vàng vào Đức Chúa Trời và Lời Ngài (Hê-bơ-rơ 11:1). Không phải chỉ là tin lý thuyết, nhưng là sự trông cậy sống động dẫn đến vâng phục.",
    },
  ],
  grace: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Ân điển (grace): sự thiện cảm tự do và không đáng có mà Đức Chúa Trời ban cho tội nhân (Ê-phê-sô 2:8). Ân điển là nền tảng của sự cứu rỗi và sự sống thánh.",
    },
  ],
  covenant: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Giao ước (covenant): sự giao kết thiêng liêng giữa Đức Chúa Trời và dân Ngài. Cựu Ước qua Môi-se, Tân Ước qua huyết Đấng Christ (Lu-ca 22:20).",
    },
  ],
  redeem: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Chuộc (redeem): mua lại, giải thoát bằng giá chuộc. Trong Cựu Ước chỉ sự giải cứu khỏi Ai-cập; trong Tân Ước chỉ sự chuộc tội bởi huyết Đấng Christ (Ê-phê-sô 1:7).",
    },
  ],
  righteousness: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Sự công bình (righteousness): sự ngay thẳng theo tiêu chuẩn thánh của Đức Chúa Trời, được ban nhờ đức tin nơi Đấng Christ (Phi-líp 3:9).",
    },
  ],
  sin: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Tội (sin): sự vi phạm luật pháp và bản tính thánh của Đức Chúa Trời (1 Giăng 3:4). Tội phân ly con người khỏi Đức Chúa Trời và đòi hỏi sự chuộc tội bởi huyết Đấng Christ.",
    },
  ],
  holy: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Thánh (holy): tách biệt để dùng cho Đức Chúa Trời, và thanh sạch về bản tính. Đức Chúa Trời là Đấng Thánh (Ê-sai 6:3); dân Ngài được kêu gọi nên thánh trong đời sống.",
    },
  ],
  kingdom: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Nước (kingdom): quyền trị vì của Đức Chúa Trời. Nước thiên đàng đã đến trong Đấng Christ và sẽ trọn vẹn khi Ngài tái lâm (Ma-thi-ơ 6:33).",
    },
  ],
  prophet: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Tiên tri (prophet): người được Đức Chúa Trời kêu gọi để truyền đạt lời Ngài, cảnh cáo và an ủi dân sự. Chúa Giêsus là tiên tri tối cao và ứng nghiệm mọi lời tiên báo.",
    },
  ],
  sabbath: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Ngày Sa-bát (sabbath): ngày nghỉ thứ bảy, dấu hiệu giao ước giữa Đức Chúa Trời và Israel (Xuất Ê-díp-tô 20:8). Trong Tân Ước, nó hướng về sự nghỉ ngơi thiêng liêng trong Đấng Christ.",
    },
  ],
  baptism: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Báp-tem (baptism): phép nhúng nước, biểu tượng sự chết và sống lại với Đấng Christ, và là lời tuyên xưng đức tin (Công-vụ 2:38).",
    },
  ],
  resurrection: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Sự sống lại (resurrection): Đức Chúa Giêsus từ kẻ chết sống lại là nền tảng của đức tin Cơ Đốc (1 Cô-rinh-tô 15:14). Tín hữu cũng sẽ sống lại trong ngày sau rốt.",
    },
  ],
  gospel: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Phúc âm (gospel): tin lành về sự cứu rỗi nhờ Chúa Giêsus Christ, gồm sự chết, chôn, và sống lại của Ngài (1 Cô-rinh-tô 15:1-4).",
    },
  ],
  mercy: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Sự thương xót (mercy): lòng trắc ẩn của Đức Chúa Trời đối với kẻ khốn khổ và tội lỗi. Lòng thương xót Ngài mới mẻ mỗi buổi sáng (Ca-thương 3:22-23).",
    },
  ],
  glory: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Vinh hiển (glory): sự rực rỡ của hiện diện và uy nghi Đức Chúa Trời. Tín hữu được đổi nên cũng một ảnh tượng Ngài, từ vinh hiển đến vinh hiển (2 Cô-rinh-tô 3:18).",
    },
  ],
}

export function findDictionary(term: string): DictionaryEntry[] {
  return DICTIONARIES[term.trim().toLowerCase()] ?? []
}
