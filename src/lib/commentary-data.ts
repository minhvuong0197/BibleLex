// Dữ liệu giải kinh công cộng (public domain, trích Matthew Henry / Geneva).
// Key: "BookEn chapter:verse" (ưu tiên) hoặc "BookEn chapter" (dẫn nhập chương).
// Mở rộng bằng cách thêm entry vào object này (hoặc import từ file JSON).

export interface CommentaryEntry {
  section: string
  content: string
}

export const COMMENTARIES: Record<string, CommentaryEntry[]> = {
  "John 3:16": [
    {
      section: "Matthew Henry's Commentary",
      content:
        "Ngài đã yêu thế gian đến nỗi đã ban Con một của Ngài, hầu cho ai tin Ngài không bị hư mất mà được sự sống đời đời. Đây là lời tóm tắt trọn vẹn của phúc âm: tình yêu của Đức Chúa Trời là nguồn, Con Ngài là quà tặng, và đức tin là điều kiện để nhận sự sống đời đời.",
    },
  ],
  "Genesis 1:1": [
    {
      section: "Matthew Henry's Commentary",
      content:
        "Ban đầu Đức Chúa Trời dựng nên trời và đất. Sự hiện hữu của vũ trụ là bằng chứng quyền năng và ý chỉ của Đấng Tạo Hóa; mọi vật đều do Ngài mà có, chứ không tự nhiên mà sinh.",
    },
  ],
  "Philippians 4:13": [
    {
      section: "Matthew Henry's Commentary",
      content:
        "Tôi làm được mọi sự nhờ Đấng ban thêm sức cho tôi. Thông điệp không phải là tự tín lực của bản thân, nhưng là sự cậy nhờ quyền năng của Đấng Christ trong mọi hoàn cảnh.",
    },
  ],
  "Romans 8:28": [
    {
      section: "Matthew Henry's Commentary",
      content:
        "Chúng ta biết rằng mọi sự hiệp lại làm ích cho kẻ yêu mến Đức Chúa Trời. Đây là sự an ủi lớn: dù hoàn cảnh ra sao, Đức Chúa Trời dùng mọi sự vì ích tốt của dân Ngài.",
    },
  ],
  "Psalm 23:1": [
    {
      section: "Matthew Henry's Commentary",
      content:
        "Đức Giê-hô-va là Đấng chăn giữ tôi, tôi sẽ không thiếu thốn gì. Thi-thiên dùng hình ảnh người chăn chiên để diễn tả sự chăm sóc, dẫn dắt và bảo vệ của Đức Chúa Trời đối với dân Ngài.",
    },
  ],
  "John 3": [
    {
      section: "Dẫn nhập chương",
      content:
        "Chương 3 ghi lại cuộc đối thoại giữa Chúa Giêsus và Nicô-đem — một người Pha-ri-si — về sự tái sinh bởi Thánh Linh và về ánh sáng đến trong thế gian (câu 16).",
    },
  ],
}

export function findCommentary(bookEn: string, chapter: number, verse?: number): CommentaryEntry[] {
  const exact = verse != null ? COMMENTARIES[`${bookEn} ${chapter}:${verse}`] : undefined
  if (exact) return exact
  return COMMENTARIES[`${bookEn} ${chapter}`] ?? []
}
