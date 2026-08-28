// Dữ liệu giải kinh — trích dẫn Kinh Thánh dùng bản VI1934 (phạm vi công cộng,
// là bản dịch đang hiển thị trong ứng dụng), phần chú giải theo Matthew Henry.
// Key: "BookEn chapter:verse" (ưu tiên) hoặc "BookEn chapter" (dẫn nhập chương).
// Lưu ý: tên sách phải khớp với BibleBook.name trong DB (vd "Psalms", "1 Corinthians").

export interface CommentaryEntry {
  section: string
  content: string
}

export const COMMENTARIES: Record<string, CommentaryEntry[]> = {
  "John 3:16": [
    {
      section: "Matthew Henry's Commentary",
      content:
        "Vì Đức Chúa Trời yêu thương thế gian, đến nỗi đã ban Con một của Ngài, hầu cho hễ ai tin Con ấy không bị hư mất mà được sự sống đời đời. — Đây là lời tóm tắt trọn vẹn của phúc âm: tình yêu Đức Chúa Trời là nguồn, Con một là quà tặng, và đức tin là điều kiện để nhận sự sống đời đời.",
    },
  ],
  "Genesis 1:1": [
    {
      section: "Matthew Henry's Commentary",
      content:
        "Ban đầu Đức Chúa Trời dựng nên trời đất. — Sự hiện hữu của vũ trụ là bằng cớ về quyền năng và ý chỉ của Đấng Tạo Hóa; mọi vật đều do Ngài mà có, chứ không tự nhiên mà sinh.",
    },
  ],
  "Genesis 1:26": [
    {
      section: "Matthew Henry's Commentary",
      content:
        "Đức Chúa Trời phán rằng: Chúng ta hãy làm nên loài người như hình ta và theo tượng ta, đặng quản trị loài cá biển, loài chim trời, loài súc vật, loài côn trùng bò trên mặt đất, và khắp cả đất. — Loài người được dựng nên mang hình ảnh Đức Chúa Trời: có trí khôn, luân lý và quyền quản trị tạo vật, khác biệt với muôn loài.",
    },
  ],
  "Philippians 4:13": [
    {
      section: "Matthew Henry's Commentary",
      content:
        "Tôi làm được mọi sự nhờ Đấng ban thêm sức cho tôi. — Thông điệp không phải là sự tự tín vào bản thân, nhưng là cậy nhờ quyền năng của Đức Chúa Trời trong mọi hoàn cảnh.",
    },
  ],
  "Romans 8:28": [
    {
      section: "Matthew Henry's Commentary",
      content:
        "Vả, chúng ta biết rằng mọi sự hiệp lại làm ích cho kẻ yêu mến Đức Chúa Trời, tức là cho kẻ được gọi theo ý muốn Ngài đã định. — Đây là sự yên ủi lớn: dẫu hoàn cảnh ra sao, Đức Chúa Trời dùng mọi sự vì ích tốt của dân Ngài.",
    },
  ],
  "Psalms 23:1": [
    {
      section: "Matthew Henry's Commentary",
      content:
        "Đức Giê-hô-va là Đấng chăn giữ tôi: tôi sẽ chẳng thiếu thốn gì. — Thi-thiên dùng hình ảnh người chăn chiên để diễn tả sự chăm sóc, dẫn dắt và bảo vệ của Đức Chúa Trời đối với dân Ngài.",
    },
  ],
  "Psalms 23:4": [
    {
      section: "Matthew Henry's Commentary",
      content:
        "Dầu khi tôi đi trong trũng bóng chết, Tôi sẽ chẳng sợ tai họa nào; vì Chúa ở cùng tôi; Cây trượng và cây gậy của Chúa an ủi tôi. — Giữa nguy hiểm và sự chết, sự hiện diện của Đức Chúa Trời là nguồn yên ủi và hướng dẫn bảo đảm.",
    },
  ],
  "John 3": [
    {
      section: "Dẫn nhập chương",
      content:
        "Chương 3 ghi lại cuộc đối thoại giữa Đức Chúa Jêsus và Nicô-đem — một người Pha-ri-si — về sự tái sinh bởi Thánh Linh và về ánh sáng đến trong thế gian (câu 16).",
    },
  ],
  "Genesis 1": [
    {
      section: "Dẫn nhập chương",
      content:
        "Chương 1 trình bày sự sáng tạo trong sáu ngày: ánh sáng, vầng thông, muông xanh, loài giống, và sau rốt là loài người. Mọi sự đều tốt lành trước mắt Đức Chúa Trời.",
    },
  ],
  "Psalms 23": [
    {
      section: "Dẫn nhập chương",
      content:
        "Thi-thiên 23 là bài ca về Đức Giê-hô-va là Đấng chăn chiên, bày tỏ sự tin cậy và an nghỉ của người tin kính giữa mọi hoàn cảnh.",
    },
  ],
  "Psalms 1:1": [
    {
      section: "Matthew Henry's Commentary",
      content:
        "Phước cho người nào chẳng theo mưu kế của kẻ dữ, Chẳng đứng trong đường tội nhân, Không ngồi chỗ của kẻ nhạo báng; — Người đẹp lòng Đức Chúa Trời là người vui thỏa trong luật pháp Ngài và gẫm suy ngày đêm.",
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
        "Ban đầu có Ngôi Lời, Ngôi Lời ở cùng Đức Chúa Trời, và Ngôi Lời là Đức Chúa Trời. — Ngôi Lời (Logos) là Đức Chúa Jêsus tiền hữu, hiện diện và đồng bản thể với Đức Chúa Trời từ đời đời.",
    },
  ],
  "John 1:14": [
    {
      section: "Matthew Henry's Commentary",
      content:
        "Ngôi Lời đã trở nên xác thịt, ở giữa chúng ta, đầy ơn và lẽ thật; chúng ta đã ngắm xem sự vinh hiển của Ngài, thật như vinh hiển của Con một đến từ nơi Cha. — Sự nhập thể là mầu nhiệm cốt lõi: Đức Chúa Trời hóa nên người để cứu chuộc nhân loại.",
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
        "Vả, ấy là nhờ ân điển, bởi đức tin, mà anh em được cứu, điều đó không phải đến từ anh em, bèn là sự ban cho của Đức Chúa Trời. — Sự cứu rỗi hoàn toàn là quà tặng của Đức Chúa Trời, không phải bởi việc làm, để không ai khoe mình.",
    },
  ],
  "Isaiah 53:5": [
    {
      section: "Matthew Henry's Commentary",
      content:
        "Nhưng người đã vì tội lỗi chúng ta mà bị vết, vì sự gian ác chúng ta mà bị thương. Bởi sự sửa phạt người chịu chúng ta được bình an, bởi lằn roi người chúng ta được lành bịnh. — Sự thương khó của Đấng Mê-si là giá chuộc: bởi lằn roi Ngài chúng ta được lành bịnh.",
    },
  ],
  "Proverbs 3:5": [
    {
      section: "Matthew Henry's Commentary",
      content:
        "Hãy hết lòng tin cậy Đức Giê-hô-va, Chớ nương cậy nơi sự thông sáng của con; — Sự khôn ngoan bắt đầu bằng lòng tin cậy Ngài trong mọi đường lối, chớ nương cậy sự thông sáng riêng của mình.",
    },
  ],
  "1 Corinthians 13:13": [
    {
      section: "Matthew Henry's Commentary",
      content:
        "Nên bây giờ còn có ba điều nầy: đức tin, sự trông cậy, tình yêu thương; nhưng điều trọng hơn trong ba điều đó là tình yêu thương. — Đức yêu thương là mục đích cao nhất và còn lại đời đời.",
    },
  ],
  "Philippians 4": [
    {
      section: "Dẫn nhập chương",
      content:
        "Philippians 4 khuyên tín hữu hãy vui mừng luôn luôn, gin giữ tâm hồn trong sự bình an của Đức Chúa Trời, và học thỏa nguyện trong mọi cảnh ngộ.",
    },
  ],
  "Matthew 5:3": [
    {
      section: "Matthew Henry's Commentary",
      content:
        "Phước cho những kẻ có lòng khó khăn, vì nước thiên đàng là của những kẻ ấy! — Sự nghèo khó tâm thần là nhận biết mình thiếu thốn và cần đến Đức Chúa Trời.",
    },
  ],
  "Exodus 20:1": [
    {
      section: "Matthew Henry's Commentary",
      content:
        "Bấy giờ, Đức Chúa Trời phán mọi lời nầy, rằng: — Mười điều răn là nền tảng luân lý và thờ phượng của dân Ngài, bắt đầu bằng điều thờ phượng một Đức Chúa Trời duy nhất.",
    },
  ],
  "Proverbs 1:7": [
    {
      section: "Matthew Henry's Commentary",
      content:
        "Sự kính sợ Đức Giê-hô-va là khởi đầu sự tri thức; Còn kẻ ngu muội khinh bỉ sự khôn ngoan và lời khuyên dạy. — Kính sợ Ngài là thái độ khiêm nhu nhận lãnh sự khôn ngoan, trái ngược với sự khinh thường sự dạy dỗ.",
    },
  ],
  "Isaiah 40:31": [
    {
      section: "Matthew Henry's Commentary",
      content:
        "Nhưng ai trông đợi Đức Giê-hô-va thì chắc được sức mới, cất cánh bay cao như chim ưng; chạy mà không mệt nhọc, đi mà không mòn mỏi. — Sự trông cậy Ngài ban sức bền bỉ, giúp người tin vượt qua thử thách.",
    },
  ],
  "Romans 12:1": [
    {
      section: "Matthew Henry's Commentary",
      content:
        "Vậy, hỡi anh em, tôi lấy sự thương xót của Đức Chúa Trời khuyên anh em dâng thân thể mình làm của lễ sống và thánh, đẹp lòng Đức Chúa Trời, ấy là sự thờ phượng phải lẽ của anh em. — Đây là sự thờ phượng thiêng liêng và hợp lý của người được cứu.",
    },
  ],
  "2 Timothy 3:16": [
    {
      section: "Matthew Henry's Commentary",
      content:
        "Cả Kinh Thánh đều là bởi Đức Chúa Trời soi dẫn, có ích cho sự dạy dỗ, bẻ trách, sửa trị, dạy người trong sự công bình, — Lời Ngài đủ để trang bị tín hữu cho mọi việc lành.",
    },
  ],
  "Revelation 21:4": [
    {
      section: "Matthew Henry's Commentary",
      content:
        "Ngài sẽ lau ráo hết nước mắt khỏi mắt chúng, sẽ không có sự chết, cũng không có than khóc, kêu ca, hay là đau đớn nữa; vì những sự thứ nhất đã qua rồi. — Đây là cảnh vinh hiển cuối cùng khi Đức Chúa Trời ngự giữa dân Ngài.",
    },
  ],
}

export function findCommentary(bookEn: string, chapter: number, verse?: number): CommentaryEntry[] {
  const exact = verse != null ? COMMENTARIES[`${bookEn} ${chapter}:${verse}`] : undefined
  if (exact) return exact
  return COMMENTARIES[`${bookEn} ${chapter}`] ?? []
}
