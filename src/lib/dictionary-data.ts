// Từ điển Kinh Thánh công cộng (phong cách Easton's / Smith's, public domain).
// Key: thuật ngữ tiếng Anh viết thường. Mở rộng bằng cách thêm entry.
// Định nghĩa được diễn đạt tiếng Việt ngắn gọn, khách quan.

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
  sin: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Tội lỗi (sin): sự trái phép với luật pháp và bản tính thánh của Đức Chúa Trời (1 Giăng 3:4). Tội lỗi phân rẽ con người khỏi Đức Chúa Trời và đòi hỏi giá chuộc bằng huyết của Đấng Christ.",
    },
  ],
  salvation: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Sự cứu rỗi (salvation): việc Đức Chúa Trời giải cứu tội nhân khỏi tội và hình phạt đời đời, ban sự sống đời đời nhờ đức tin nơi Đức Chúa Jêsus (Rô-ma 10:9). Gồm quá khứ (xưng công bình), hiện tại (nên thánh) và tương lai (vinh hiển).",
    },
  ],
  covenant: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Giao ước (covenant): giao ước thiêng liêng giữa Đức Chúa Trời và dân Ngài. Cựu ước (với Áp-ra-ham, Môi-se) hứa phước qua vâng giữ luật; Tân ước (huyết Đức Chúa Jêsus) ban ân điển và tha tội cho mọi kẻ tin.",
    },
  ],
  baptism: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Phép báp-têm (baptism): dìm hoặc rưới nước nhân danh Cha, Con và Thánh Linh, là dấu chỉ sự chết với tội và sống lại trong Đấng Christ (Công-vụ 2:38). Báp-têm thuộc linh phân biệt với báp-têm bằng nước của Giăng.",
    },
  ],
  resurrection: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Sự sống lại (resurrection): Đức Chúa Jêsus từ kẻ chết sống lại thân thể (1 Cô-rinh-tô 15:4) — nền tảng đức tin. Tín hữu cũng sẽ sống lại trong ngày sau rốt để nhận sự phán xét và sự sống đời đời.",
    },
  ],
  "holy spirit": [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Đức Thánh Linh (Holy Spirit): ngôi thứ ba trong Đức Chúa Trời ba ngôi. Ngài dạy dỗ, bày tỏ tội lỗi, ban năng lực, ban sự sống và làm ấn chứng cho tín hữu (Giăng 14:26; Công-vụ 1:8).",
    },
  ],
  messiah: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Đấng Mê-si (Messiah, nghĩa 'Đấng được xức dầu'): Đấng Cứu thế mà Đức Chúa Trời hứa qua các tiên tri, là Đức Chúa Jêsus Christ — Vua, Thầy tế lễ thượng phẩm và Tiên tri trọn vẹn.",
    },
  ],
  "kingdom of god": [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Nước Đức Chúa Trời (kingdom of God): quyền cai trị của Đức Chúa Trời trong lòng và đời sống tín hữu, cùng với vương quốc tương lai Ngài sẽ lập (Ma-thi-ơ 6:10). Đã đến trong Đức Chúa Jêsus và sẽ hoàn tất khi Ngài tái lâm.",
    },
  ],
  atonement: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Sự chuộc tội (atonement): việc Đức Chúa Jêsus bằng huyết Ngài làm hòa tội nhân với Đức Chúa Trời (Rô-ma 3:25). Ngài gánh thay hình phạt, thỏa mãn công lý thánh và đem lại sự tha thứ.",
    },
  ],
  justification: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Sự xưng công bình (justification): Đức Chúa Trời tuyên bố tội nhân là công bình vì đức tin nơi Đấng Christ, không phải bởi việc làm (Rô-ma 5:1). Là hành động của ân điển, không phải thưởng công.",
    },
  ],
  sanctification: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Sự nên thánh (sanctification): quá trình Đức Thánh Linh khiến tín hữu nên thánh trong thực tế, tách khỏi tội và giống Đức Chúa Jêsus (1 Tê-sa-lô-ni-ca 4:3). Khởi đầu lúc cứu rỗi và tiếp diễn trọn đời.",
    },
  ],
  repentance: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Sự ăn năn (repentance): tâm trí đổi ý, quay khỏi tội và hướng về Đức Chúa Trời (Công-vụ 3:19). Ăn năn thật đi đôi với đức tin và sinh kết quả của sự sống mới.",
    },
  ],
  prophecy: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Lời tiên tri (prophecy): sứ điệp Đức Chúa Trời cậy Thánh Linh ban cho, vừa bày tỏ ý muốn Ngài, vừa báo trước điều sẽ đến (2 Phi-e-rơ 1:21). Tiên tri xác thực Đấng Christ là cốt lõi.",
    },
  ],
  apostle: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Sứ đồ (apostle): người được Đức Chúa Jêsus sai đi với quyền phán sự và lập hội thánh (Ma-thi-ơ 10:2). Mười hai sứ đồ cùng Phao-lô là nền móng của hội thánh sơ khai.",
    },
  ],
  church: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Hội thánh (church): cộng đồng những kẻ được kêu gọi bởi Đức Chúa Trời, thân thể của Đấng Christ (Ê-phê-sô 1:22). Vừa chỉ hội thánh vô hình phổ quát, vừa chỉ các hội đoàn địa phương.",
    },
  ],
  sabbath: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Ngày Sa-bát (Sabbath): ngày thứ bảy, ngày nghỉ Đức Chúa Trời lập sau sự sáng tạo và truyền giữ làm dấu giao ước (Xuất Ê-díp-tô 20:8). Đấng Christ là chủ của Sa-bát và nghỉ ngơi thật cho dân Ngài.",
    },
  ],
  passover: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Lễ Vượt Qua (Passover): lễ kỷ niệm Đức Chúa Trời cứu dân Y-sơ-ra-ên khỏi chết đầu lòng tại Ai-cập nhờ huyết chiên (Xuất Ê-díp-tô 12). Trọn vẹn ứng nghiệm trong Đức Chúa Jêsus, Chiên Con của Đức Chúa Trời.",
    },
  ],
  tithe: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Thuế một phần mười (tithe): dâng một phần mười sản nghiệp cho Đức Chúa Trời, dùng cấp dưỡng việc thờ phượng và kẻ nghèo (Lê-vi-ký 27:30). Trong Tân ước là sự dâng hiến vui lòng và rộng rãi.",
    },
  ],
  prayer: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Sự cầu nguyện (prayer): sự giao tiếp của tín hữu với Đức Chúa Trời trong xưng tội, ngợi khen và nài xin (Phi-líp 4:6). Cầu nguyện nhờ Đấng Christ và quyền Thánh Linh, tin cậy ý Ngài.",
    },
  ],
  worship: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Sự thờ phượng (worship): tôn ngợi và phục sự Đức Chúa Trời vì Ngài là Chúa (Giăng 4:24). Thờ phượng thật bởi Thánh Linh và lẽ thật, cả trong nghi lễ lẫn đời sống thánh.",
    },
  ],
  trinity: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Đức Chúa Trời ba ngôi (Trinity): một Đức Chúa Trời duy nhất hiện hữu trong ba ngôi: Cha, Con và Thánh Linh, đồng bản thể và bình đẳng (Ma-thi-ơ 28:19).",
    },
  ],
  gospel: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Phúc âm (gospel, 'tin lành'): tin mừng về sự cứu rỗi nhờ Đức Chúa Jêsus Christ chịu chết và sống lại (1 Cô-rinh-tô 15:1-4). Là quyền phép của Đức Chúa Trời cho kẻ tin.",
    },
  ],
  mercy: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Sự thương xót (mercy): lòng nhân từ Đức Chúa Trời tha thứ và cứu giúp kẻ khốn khổ (Thi-thiên 23:6). Kết hợp với ân điển: thương xót giải khỏi tai họa, ân điển ban phước tốt lành.",
    },
  ],
  glory: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Sự vinh hiển (glory): sự rực rỡ của uy nghi và bản tính Đức Chúa Trời (Xuất Ê-díp-tô 33:18). Dân Ngài được dự phần vinh hiển Ngài đời đời.",
    },
  ],
  righteousness: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Sự công bình (righteousness): sự hiệp với luật thánh của Đức Chúa Trời. Bằng đức tin, tín hữu được ban sự công bình của Đấng Christ (Phi-líp 3:9), không bởi tự mình.",
    },
  ],
  redemption: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Sự chuộc (redemption): Đức Chúa Trời giải phóng tội nhân khỏi nô lệ tội và Satan bởi giá chuộc là huyết Đấng Christ (Ê-phê-sô 1:7). Trọn vẹn và đời đời.",
    },
  ],
  incarnation: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Sự nhập thể (incarnation): Ngôi Lời trở nên xác thịt, Đức Chúa Trời hóa nên người trong Đức Chúa Jêsus (Giăng 1:14). Mầu nhiệm cốt lõi của đức tin: vừa Đức Chúa Trời vừa con người.",
    },
  ],
  creation: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Sự sáng tạo (creation): Đức Chúa Trời dựng nên muôn vật từ không (Sáng-thế ký 1:1). Vũ trụ không tự sinh, nhưng do ý chỉ và quyền năng Ngài, tốt lành và có mục đích.",
    },
  ],
  "the fall": [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Sự sa ngã (the Fall): A-đam và Ê-va bất tuân Đức Chúa Trời, khiến tội và sự chết vào thế gian (Sáng-thế ký 3). Mọi người sinh ra trong tội, cần Đấng Cứu thế chuộc lại.",
    },
  ],
  revelation: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Sự tỏ ra (revelation): Đức Chúa Trời bày tỏ chính Ngài và ý muốn qua tạo vật, lịch sử và Kinh Thánh (Hê-bơ-rơ 1:1). Kinh Thánh là sự tỏ ra hữu hiệu, đủ để biết Ngài.",
    },
  ],
  secondcoming: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Sự tái lâm (Second Coming): Đức Chúa Jêsus trở lại trong vinh hiển để lập nước Ngài, phán xét và đổi mới muôn vật (Khải-huyền 22:20). Niềm trông cậy của hội thánh.",
    },
  ],
  judgment: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Sự phán xét (judgment): Đức Chúa Trời định tội hoặc thưởng mỗi người theo việc làm (2 Cô-rinh-tô 5:10). Gồm phán xét dân sự và phán xét sau rốt trước ngôi trắng lớn.",
    },
  ],
  heaven: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Thiên đàng (heaven): nơi ngự trị của Đức Chúa Trời và chỗ ở đời đời của tín hữu (Giăng 14:2). Cũng chỉ bầu trời và cả vũ trụ thuộc quyền Ngài.",
    },
  ],
  hell: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Địa ngục (hell): nơi phân cách đời đời khỏi Đức Chúa Trời, nơi hình phạt tội (Ma-thi-ơ 25:46). Kinh Thánh gọi là hồ lửa và chốn chết thứ hai.",
    },
  ],
  angel: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Thiên sứ (angel): sứ giả thiêng liêng Đức Chúa Trời dựng nên để thờ phượng và hầu việc Ngài (Hê-bơ-rơ 1:14). Thiện (thiên sứ) và sa ngã (quỷ).",
    },
  ],
  demon: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Quỷ (demon): thiên sứ sa ngã dưới quyền Sa-tan, mưu hại nhân loại và cản trở nước Đức Chúa Trời (Ma-thi-ơ 12:43). Đấng Christ có quyền đuổi quỷ.",
    },
  ],
  satan: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Sa-tan (Satan, 'kẻ thù nghịch'): thiên sứ sa ngã đứng đầu quỷ, mưu gạt và cáo trách dân Đức Chúa Trời (1 Phi-e-rơ 5:8). Đã bị Đấng Christ thắng qua thập tự giá.",
    },
  ],
  israel: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Y-sơ-ra-ên (Israel): dân Đức Chúa Trời chọn, con cháu Gia-cốp; vừa chỉ dân tộc vật lý, vừa chỉ hội thánh thiêng liêng (Rô-ma 9:6). Trung tâm kế hoạch cứu rỗi.",
    },
  ],
  law: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Luật pháp (law): hệ thống điều răn Đức Chúa Trời, trọn vẹn nơi Mười điều răn và Luật Môi-se. Luật bày tỏ tội và dẫn đến Đấng Christ, chứ không cứu bởi việc làm.",
    },
  ],
  commandment: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Điều răn (commandment): mạng lịnh Đức Chúa Trời cho dân Ngài. Mười điều răn là nền tảng luân lý; điều răn mới là yêu thương (Giăng 13:34).",
    },
  ],
  temple: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Đền thờ (temple): nơi thờ phượng và ngự của Đức Chúa Trời tại Giê-ru-sa-lem. Đấng Christ là đền thờ thật, và thân thể tín hữu là đền thờ của Thánh Linh (1 Cô-rinh-tô 6:19).",
    },
  ],
  manna: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Ma-na (manna): vật thực Đức Chúa Trời ban cho dân Y-sơ-ra-ên trong đồng vắng (Xuất Ê-díp-tô 16). Hình bóng của Đức Chúa Jêsus, bánh hằng sống từ trời.",
    },
  ],
  pentecost: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Lễ Ngũ Tuần (Pentecost): lễ kỷ niệm mùa màng và 50 ngày sau Vượt Qua. Tại đây Đức Thánh Linh giáng xuống trên hội thánh sơ khai (Công-vụ 2), khởi đầu kỷ nguyên mới.",
    },
  ],
  circumcision: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Phép cắt bì (circumcision): dấu giao ước Áp-ra-ham và dân Y-sơ-ra-ên (Sáng-thế ký 17). Tân ước xem cắt bì thật là trong lòng bởi Thánh Linh (Rô-ma 2:29).",
    },
  ],
  priest: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Thầy tế lễ (priest): người thay dân sự dâng tế lễ và gần gũi Đức Chúa Trời. Đức Chúa Jêsus là Thầy tế lễ thượng phẩm đời đời, dâng chính mình một lần đủ cả (Hê-bơ-rơ 7:24).",
    },
  ],
  prophet: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Tiên tri (prophet): người Đức Chúa Trời kêu gọi để truyền lời Ngài, cảnh tỉnh và hứa Đấng Cứu thế. Kinh Thánh gồm nhiều sách tiên tri.",
    },
  ],
  disciple: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Môn đồ (disciple): người theo học và vâng phục Đức Chúa Jêsus (Lu-ca 14:27). Môn đồ thật từ bỏ mình, vác thập tự giá và học làm giống Thầy.",
    },
  ],
  parable: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Dụ ngôn (parable): bài giảng dùng ví dụ đời thường để bày tỏ lẽ thật nước Đức Chúa Trời (Ma-thi-ơ 13). Đức Chúa Jêsus dùng dụ ngôn để dạy và phân rẽ kẻ cứng lòng.",
    },
  ],
  miracle: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Phép lạ (miracle): việc Đức Chúa Trời làm vượt tự nhiên để bày tỏ quyền năng và xác nhận sứ điệp (Giăng 2:11). Đấng Christ làm phép lạ vì lòng thương xót và vinh hiển Ngài.",
    },
  ],
  amen: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "A-men (Amen, 'quả thật'): lời xác nhận 'cầu mong được vậy' hay 'chắc chắn' (Khải-huyền 3:14). Đức Chúa Jêsus dùng để nhấn mạnh lẽ thật.",
    },
  ],
  hosanna: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Ho-sa-na (Hosanna, 'xin cứu'): lời tung hô Đức Chúa Jêsus khi Ngài vào Giê-ru-sa-lem (Ma-thi-ơ 21:9). Trở thành tiếng ngợi khen cứu Chúa.",
    },
  ],
  abba: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Áp-ba (Abba, 'Cha ơi'): tiếng A-ram thân mật Đức Chúa Jêsus dùng gọi Đức Chúa Trời (Mác 14:36), và tín hữu được Thánh Linh cho gọi Ngài là Cha (Rô-ma 8:15).",
    },
  ],
  cross: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Thập tự giá (cross): khung gỗ Đức Chúa Jêsus chịu đóng để chuộc tội (1 Cô-rinh-tô 1:18). Trở thành biểu tượng sự cứu rỗi và lời kêu gọi vác giá mình theo Ngài.",
    },
  ],
  gospelofkingdom: [
    {
      dict: "Easton's Bible Dictionary",
      definition:
        "Tin lành nước Đức Chúa Trời (gospel of the kingdom): sứ điệp Đức Chúa Jêsus rao giảng: nước Đức Chúa Trời đã đến, hãy ăn năn và tin (Mác 1:15). Nền tảng của mọi giảng đạo.",
    },
  ],
}

export function findDictionary(term: string): DictionaryEntry[] {
  const t = term.toLowerCase().trim()
  if (!t) return []
  const exact = DICTIONARIES[t]
  if (exact) return exact
  return Object.entries(DICTIONARIES)
    .filter(([k]) => k.includes(t))
    .flatMap(([, v]) => v)
}
