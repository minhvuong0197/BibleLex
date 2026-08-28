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
}

export function findDictionary(term: string): DictionaryEntry[] {
  return DICTIONARIES[term.trim().toLowerCase()] ?? []
}
