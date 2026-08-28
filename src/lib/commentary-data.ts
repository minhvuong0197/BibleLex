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
  "Genesis 1": [
    {
      section: "Dẫn nhập chương",
      content:
        "Chương 1 trình bày sự sáng tạo trong sáu ngày: ánh sáng, vầng thông, muông xanh, loài giống, và sau rốt là loài người. Mọi sự đều tốt lành trước mắt Đức Chúa Trời.",
    },
  ],
  "Genesis 1:26": [
    {
      section: "Matthew Henry's Commentary",
      content:
        "Đức Chúa Trời phán: 'Chúng ta hãy làm nên loài người theo hình ảnh chúng ta.' Loài người được dựng nên mang hình ảnh Đức Chúa Trời — có trí khôn, luân lý và quyền quản trị tạo vật, khác biệt với muôn loài.",
    },
  ],
  "Psalm 23": [
    {
      section: "Dẫn nhập chương",
      content:
        "Thi-thiên 23 là bài ca về Đức Giê-hô-va là Đấng chăn chiên, bày tỏ sự tin cậy và an nghỉ của người tin kính giữa mọi hoàn cảnh.",
    },
  ],
  "Psalm 23:4": [
    {
      section: "Matthew Henry's Commentary",
      content:
        "Dù tôi đi trong trũng bóng chết, tôi sẽ chẳng sợ tai họa nào; vì Chúa ở cùng tôi. Cây trượng và cây gậy của Ngài là nguồn yên ủi và hướng dẫn bảo đảm.",
    },
  ],
  "Romans 8": [
    {
      section: "Dẫn nhập chương",
      content:
        "Romans 8 tôn vinh sự tự do trong Thánh Linh, sự làm con cái Đức Chúa Trời, và sự bảo đảm rằng không gì có thể tách chúng ta khỏi tình yêu Ngài.",
    },
  ],
  "John 1:1": [
    {
      section: "Matthew Henry's Commentary",
      content:
        "Ban đầu có Ngôi Lời, và Ngôi Lời ở cùng Đức Chúa Trời, và Ngôi Lời là Đức Chúa Trời. Ngôi Lời (Logos) là Chúa Giêsus tiền hữu, hiện diện và đồng bản thể với Đức Chúa Trời từ đời đời.",
    },
  ],
  "John 1:14": [
    {
      section: "Matthew Henry's Commentary",
      content:
        "Ngôi Lời đã trở nên xác thịt, ở giữa chúng ta, đầy ơn và lẽ thật. Sự nhập thể là mầu nhiệm cốt lõi: Đức Chúa Trời hóa nên người để cứu chuộc nhân loại.",
    },
  ],
  "John 1": [
    {
      section: "Dẫn nhập chương",
      content:
        "Chương 1 khởi đầu Phúc âm Giăng bằng bản tóm tắt thần học về Ngôi Lời, tiếp đến là chứng cớ của Giăng Báp-tít và tiếng gọi các môn đồ đầu tiên.",
    },
  ],
  "Ephesians 2:8": [
    {
      section: "Matthew Henry's Commentary",
      content:
        "Ấy là nhờ ân điển, bởi đức tin, mà anh em được cứu, chẳng phải bởi chính mình: sự cứu rỗi hoàn toàn là quà tặng của Đức Chúa Trời, không phải bởi việc làm để không ai khoe mình.",
    },
  ],
  "Isaiah 53:5": [
    {
      section: "Matthew Henry's Commentary",
      content:
        "Nhưng vì tội ác chúng ta, Ngài bị vết, vì sự gian ác chúng ta, Ngài bị thương. Sự thương khó của Đấng Mêsi là giá chuộc: bằng lằn roi Ngài chúng ta được lành bệnh.",
    },
  ],
  "Proverbs 3:5": [
    {
      section: "Matthew Henry's Commentary",
      content:
        "Hãy hết lòng tin cậy Đức Giê-hô-va, chớ nương cậy sự thông sáng của mình. Sự khôn ngoan bắt đầu bằng lòng kính sợ và tin cậy Ngài trong mọi đường lối.",
    },
  ],
  "1 Corinthians 13:13": [
    {
      section: "Matthew Henry's Commentary",
      content:
        "Hiện nay còn có đức tin, sự trông cậy, lòng yêu thương, nhưng trong ba điều đó lòng yêu thương là lớn hơn. Đức yêu thương là mục đích cao nhất và còn lại đời đời.",
    },
  ],
  "Philippians 4": [
    {
      section: "Dẫn nhập chương",
      content:
        "Philippians 4 khuyên tín hữu hãy vui mừng luôn luôn, lo gìn giữ tâm hồn trong sự bình an của Đức Chúa Trời, và học content trong mọi cảnh ngộ.",
    },
  ],
  "Matthew 5:3": [
    {
      section: "Matthew Henry's Commentary",
      content:
        "Phước cho những kẻ nghèo khó trong tâm thần, vì nước thiên đàng là của những người ấy. Sự nghèo khó tâm thần là nhận biết mình thiếu thốn và cần đến Đức Chúa Trời.",
    },
  ],
  "Exodus 20:1": [
    {
      section: "Matthew Henry's Commentary",
      content:
        "Đức Chúa Trời phán mọi lời nầy, lập nên giao ước tại Si-na-i. Mười điều răn là nền tảng luân lý và thờ phượng của dân Ngài, bắt đầu bằng sự thờ phượng một Đức Chúa Trời duy nhất.",
    },
  ],
  "Psalm 1:1": [
    {
      section: "Matthew Henry's Commentary",
      content:
        "Phước cho người chẳng theo mưu kế kẻ dữ, chẳng đứng trong đường tội nhân, chẳng ngồi chung với kẻ nhạo báng. Người đẹp lòng Chúa là người vui thỏa trong luật pháp Ngài và gẫm suy ngày đêm.",
    },
  ],
  "Proverbs 1:7": [
    {
      section: "Matthew Henry's Commentary",
      content:
        "Sự kính sợ Đức Giê-hô-va là đầu nguồn của sự tri thức. Kính sợ Ngài là thái độ khiêm nhu nhận lãnh sự khôn ngoan, trái ngược với sự khinh thường sự dạy dỗ.",
    },
  ],
  "Isaiah 40:31": [
    {
      section: "Matthew Henry's Commentary",
      content:
        "Nhưng ai trông cậy Đức Giê-hô-va thì sẽ đổi mới sức lực mình. Sự trông cậy Ngài ban sức bền bỉ, giúp người tin vượt qua thử thách như chim ưng tắp cánh bay cao.",
    },
  ],
  "Romans 12:1": [
    {
      section: "Matthew Henry's Commentary",
      content:
        "Hỡi anh em, tôi lấy sự thương xót của Đức Chúa Trời khuyên anh em dâng thân thể mình làm của lễ sống và thánh, đẹp lòng Ngài. Đây là sự thờ phượng thiêng liêng và hợp lý của người được cứu.",
    },
  ],
  "2 Timothy 3:16": [
    {
      section: "Matthew Henry's Commentary",
      content:
        "Cả Kinh Thánh đều là bởi Đức Chúa Trời soi dẫn, có ích cho sự dạy dỗ, bẻ trách, sửa trị, dạy người trong sự công bình. Lời Ngài đủ để trang bị tín hữu cho mọi việc lành.",
    },
  ],
  "Revelation 21:4": [
    {
      section: "Matthew Henry's Commentary",
      content:
        "Ngài sẽ lau sạch mọi nước mắt họ; sẽ không còn sự chết, sự buồn thảm, tiếng khóc, hay là đau đớn nữa. Đây là cảnh vinh hiển cuối cùng khi Đức Chúa Trời ngự giữa dân Ngài.",
    },
  ],
}

export function findCommentary(bookEn: string, chapter: number, verse?: number): CommentaryEntry[] {
  const exact = verse != null ? COMMENTARIES[`${bookEn} ${chapter}:${verse}`] : undefined
  if (exact) return exact
  return COMMENTARIES[`${bookEn} ${chapter}`] ?? []
}
