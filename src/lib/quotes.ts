export interface Quote {
  text: string;
  author: string;
  category: string;
}

export const MOTIVATIONAL_QUOTES: Quote[] = [
  // 1-5 Nietzsche (Philosophy)
  {
    text: "自分を支配できない者は、常に他人に支配される。",
    author: "フリードリヒ・ニーチェ",
    category: "哲学"
  },
  {
    text: "自分を殺さないものはすべて、自分をより強くする。",
    author: "フリードリヒ・ニーチェ",
    category: "哲学"
  },
  {
    text: "脱皮できない蛇は滅びる。意見を脱ぎ捨てていかない知性もまた同様である。",
    author: "フリードリヒ・ニーチェ",
    category: "哲学"
  },
  {
    text: "高く昇ろうとするなら、自分の足を使うことだ。他人に持ち上げられてはならない。",
    author: "フリードリヒ・ニーチェ",
    category: "哲学"
  },
  {
    text: "世界には、君以外には誰も歩むことのできない唯一の道がある。その道がどこへ続くのかを問うてはならない。ただ進め。",
    author: "フリードリヒ・ニーチェ",
    category: "哲学"
  },

  // 6-10 Einstein (Intellect)
  {
    text: "私は天才ではない。ただ、人より長く問題と付き合っているだけだ。",
    author: "アルバート・アインシュタイン",
    category: "知性"
  },
  {
    text: "何かを学ぶのに、自分で体験する以上の方法はない。",
    author: "アルバート・アインシュタイン",
    category: "知性"
  },
  {
    text: "同じことを繰り返しながら違う結果を望むこと、それを狂気という。",
    author: "アルバート・アインシュタイン",
    category: "知性"
  },
  {
    text: "困難の中にのみ、機会が眠っている。",
    author: "アルバート・アインシュタイン",
    category: "知性"
  },
  {
    text: "天才とは、努力する凡才のことである。",
    author: "アルバート・アインシュタイン",
    category: "知性"
  },

  // 11-15 George Bernard Shaw (Life / Progress)
  {
    text: "人生とは自分自身を見つけることではない。人生とは自分自身を創り上げることだ。",
    author: "ジョージ・バーナード・ショー",
    category: "人生"
  },
  {
    text: "進歩は変化なしには不可能であり、自分の考えを変えられない者は何も変えることができない。",
    author: "ジョージ・バーナード・ショー",
    category: "人生"
  },
  {
    text: "やる価値のあることなら、下手であってもやる価値がある。",
    author: "ジョージ・バーナード・ショー",
    category: "人生"
  },
  {
    text: "明日の成功は、今日の準備にかかっている。",
    author: "ジョージ・バーナード・ショー",
    category: "人生"
  },
  {
    text: "理性的であるとは状況に適応すること。非理性的であるとは状況を自分に適応させようとすること。すべての進歩は非理性的な者によってもたらされる。",
    author: "ジョージ・バーナード・ショー",
    category: "人生"
  },

  // 16-20 Go Rin No Sho (Miyamoto Musashi)
  {
    text: "千日の稽古を鍛とし、万日の稽古を錬とす。",
    author: "宮本武蔵『五輪書』",
    category: "武道"
  },
  {
    text: "我、事において後悔をせず。",
    author: "宮本武蔵『独行道』",
    category: "武道"
  },
  {
    text: "観の目つよく、見の目よわく、遠き所を近く見、近き所を遠く見ること、兵法の専なり。",
    author: "宮本武蔵『五輪書』",
    category: "武道"
  },
  {
    text: "拍子を知るということ、兵法の第一なり。",
    author: "宮本武蔵『五輪書』",
    category: "武道"
  },
  {
    text: "実の道において、朝鍛夕錬（ちょうたんせきれん）すべし。",
    author: "宮本武蔵『五輪書』",
    category: "武道"
  },

  // 21-25 Bushido (Hagakure / Tsunetomo Yamamoto)
  {
    text: "武士道とは、死ぬことと見つけたり。",
    author: "山本常朝『葉隠』",
    category: "武士道"
  },
  {
    text: "大事の場に臨んでは、ただ一念、勇気を奮い起こすべし。",
    author: "山本常朝『葉隠』",
    category: "武士道"
  },
  {
    text: "一歩も引かぬという覚悟が、すべての不可能を可能にする。",
    author: "山本常朝『葉隠』",
    category: "武士道"
  },
  {
    text: "日々、己の怠惰を斬る。それこそが真の武士の修練なり。",
    author: "山本常朝『葉隠』",
    category: "武士道"
  },
  {
    text: "勝負は時の運にあらず。日々の覚悟の差なり。",
    author: "山本常朝『葉隠』",
    category: "武士道"
  },

  // 26-30 Arnold Schwarzenegger (Bodybuilding Pioneer)
  {
    text: "筋肉が成長するのは限界を超えたときだ。人間の精神も全く同じである。",
    author: "アーノルド・シュワルツェネッガー",
    category: "肉体"
  },
  {
    text: "力は勝利から生まれるのではない。君の闘いから生まれるのだ。困難に屈しないと決めたとき、それが力となる。",
    author: "アーノルド・シュワルツェネッガー",
    category: "肉体"
  },
  {
    text: "他人が寝ているとき、遊んでいるとき、私はトレーニングしていた。だから私は勝ったのだ。",
    author: "アーノルド・シュワルツェネッガー",
    category: "肉体"
  },
  {
    text: "限界を決めるのは心だ。心が『できる』と信じれば、100%可能になる。",
    author: "アーノルド・シュワルツェネッガー",
    category: "肉体"
  },
  {
    text: "ノーペイン、ノーゲイン（痛みなくして、得るものなし）。",
    author: "アーノルド・シュワルツェネッガー",
    category: "肉体"
  },

  // 31-34 Ronnie Coleman (8x Mr. Olympia Legend)
  {
    text: "みんなボディビルダーになりたがるが、誰も重い重量を持ち上げたがらない。だが俺は持ち上げるぜ！",
    author: "ロニー・コールマン",
    category: "肉体"
  },
  {
    text: "イエス・バディ！ライトウェイト、ベイビー！（Yeah Buddy! Light weight, baby!）",
    author: "ロニー・コールマン",
    category: "肉体"
  },
  {
    text: "これっぽっちの重さ、羽毛のようじゃないか！（Ain't nothin' but a peanut!）",
    author: "ロニー・コールマン",
    category: "肉体"
  },
  {
    text: "他人が『もう無理だ』と諦めた限界の先から、本物のセットが始まる。",
    author: "ロニー・コールマン",
    category: "肉体"
  },

  // 35-37 Dorian Yates / Tom Platz / Lee Haney
  {
    text: "1回の強烈な限界突破は、ダラダラ行う100回のトレーニングに勝る。",
    author: "ドリアン・イェーツ",
    category: "肉体"
  },
  {
    text: "スクワットラックに入るとき、私は恐怖と対峙する。それを克服した瞬間、私は勝利している。",
    author: "トム・プラッツ",
    category: "肉体"
  },
  {
    text: "筋肉を破壊するな、刺激を与えるのだ。",
    author: "リー・ヘイニー",
    category: "肉体"
  },

  // 38-42 Napoleon Bonaparte (Strategy & Conquer)
  {
    text: "余の辞書に、不可能の文字はない。",
    author: "ナポレオン・ボナパルト",
    category: "覇道"
  },
  {
    text: "真の強さとは、障害を乗り越えるたびに増していくものだ。",
    author: "ナポレオン・ボナパルト",
    category: "覇道"
  },
  {
    text: "勝利は、最も忍耐強い者のもとに訪れる。",
    author: "ナポレオン・ボナパルト",
    category: "覇道"
  },
  {
    text: "熟考せよ。しかし、行動の時が来たら、考えるのをやめて進め。",
    author: "ナポレオン・ボナパルト",
    category: "覇道"
  },
  {
    text: "戦術とは、ある一点に全力を集中させることだ。",
    author: "ナポレオン・ボナパルト",
    category: "覇道"
  },

  // 43-50 Philosophical additions
  {
    text: "『時間がない』と言うのは言い訳にすぎない。24時間のうち、6時間寝るなら残りは18時間ある。",
    author: "アーノルド・シュワルツェネッガー",
    category: "肉体"
  },
  {
    text: "万事において、己の技能を過信するなかれ。常に謙虚に基本を磨け。",
    author: "宮本武蔵『五輪書』",
    category: "武道"
  },
  {
    text: "あなたがスクワットを限界までやりきったとき、世界であなたに勝てるものは誰もいない。",
    author: "トム・プラッツ",
    category: "肉体"
  },
  {
    text: "初心を忘るべからず。一日の初めに今日が本番であると心得よ。",
    author: "山本常朝『葉隠』",
    category: "武士道"
  },
  {
    text: "優れた戦略とは、最も単純な行動を最も確実に行うことである。",
    author: "ナポレオン・ボナパルト",
    category: "覇道"
  },
  {
    text: "学べば学ぶほど、自分がどれだけ無知であるかを知る。",
    author: "アルバート・アインシュタイン",
    category: "知性"
  },
  {
    text: "進歩は日々の単調な反復の中にのみ存在する。劇的な変化を夢見るな。",
    author: "フリードリヒ・ニーチェ",
    category: "哲学"
  },
  {
    text: "事実というものは存在しない。存在するのは解釈だけである。",
    author: "フリードリヒ・ニーチェ",
    category: "哲学"
  },

  // 51-55 Marcus Aurelius (Stoicism / Meditations)
  {
    text: "最大の復讐とは、敵と同じような者にならないことだ。",
    author: "マルクス・アウレリウス『自省録』",
    category: "哲学"
  },
  {
    text: "心は自らの中に退いて守りを固めるとき、何ものにも屈しない。",
    author: "マルクス・アウレリウス『自省録』",
    category: "哲学"
  },
  {
    text: "自分の内を見よ。内には善の泉があり、掘り下げれば掘り下げるほど湧き出てくる。",
    author: "マルクス・アウレリウス『自省録』",
    category: "哲学"
  },
  {
    text: "あなたが障害だと思うものは、進むべき道を指し示す道標である。",
    author: "マルクス・アウレリウス『自省録』",
    category: "哲学"
  },
  {
    text: "朝起きたらこう思え。今日生きていること、考えられること、楽しむこと、愛することは、なんと素晴らしい特権だろうと。",
    author: "マルクス・アウレリウス『自省録』",
    category: "哲学"
  },

  // 56-59 Seneca (Stoic Action)
  {
    text: "幸運とは、準備と機会が出会ったときに起こるものだ。",
    author: "ルキウス・アンナエウス・セネカ",
    category: "哲学"
  },
  {
    text: "短い人生を生きているのではない。我々が人生を短くしているのだ。怠惰によって時間を浪費しているからである。",
    author: "ルキウス・アンナエウス・セネカ",
    category: "哲学"
  },
  {
    text: "困難は、人を強くするために現れる。それは鉄を鍛える火のようなものだ。",
    author: "ルキウス・アンナエウス・セネカ",
    category: "哲学"
  },
  {
    text: "どこに行くべきか分かっていない船乗りにとって、どんな風も追い風にはならない。",
    author: "ルキウス・アンナエウス・セネカ",
    category: "哲学"
  },

  // 60-62 Julius Caesar (Decision & Speed)
  {
    text: "賽は投げられた。",
    author: "ユリウス・カエサル",
    category: "覇道"
  },
  {
    text: "人は自分が信じたいものを喜んで信じる。",
    author: "ユリウス・カエサル",
    category: "覇道"
  },
  {
    text: "困難な状況下では、迅速な決断こそが最善の防策となる。",
    author: "ユリウス・カエサル",
    category: "覇道"
  },

  // 63-67 Bruce Lee (Flow & Focus)
  {
    text: "目標は必ずしも達成されるためにあるのではない。それは単に向かうべき方向を示す標識なのだ。",
    author: "ブルース・リー",
    category: "武道"
  },
  {
    text: "水のようにあれ。水はどんな器にも形を合わせ、かつ岩をも穿つ力を持つ。",
    author: "ブルース・リー",
    category: "武道"
  },
  {
    text: "私は1万種類の蹴りを1回ずつ練習した者を恐れない。1種類の蹴りを1万回練習した者を恐れる。",
    author: "ブルース・リー",
    category: "武道"
  },
  {
    text: "知識は力となるが、人格は尊敬をもたらす。",
    author: "ブルース・リー",
    category: "武道"
  },
  {
    text: "言い訳を重ねるな。実行あるのみだ。",
    author: "ブルース・リー",
    category: "武道"
  },

  // 68-70 Mike Tyson (Discipline & Grit)
  {
    text: "誰にでも計画はある。口元を殴られるまではな。だからこそ、日々の打たれ強さが勝敗を分ける。",
    author: "マイク・タイソン",
    category: "肉体"
  },
  {
    text: "規律（ディシプリン）とは、やりたくないことを、あたかもそれが大好きであるかのように全力で実行することだ。",
    author: "マイク・タイソン",
    category: "肉体"
  },
  {
    text: "恐怖は友である。それは君を研ぎ澄まし、油断を排し、前に進むエネルギーをくれる。",
    author: "マイク・タイソン",
    category: "肉体"
  },

  // 71-74 Go Rin No Sho additions
  {
    text: "万の理を知って、一の事を行う。",
    author: "宮本武蔵『五輪書』",
    category: "武道"
  },
  {
    text: "空（くう）を道とし、道を空とす。",
    author: "宮本武蔵『五輪書』",
    category: "武道"
  },
  {
    text: "構えあって構えなし。変化に即応することこそが極意なり。",
    author: "宮本武蔵『五輪書』",
    category: "武道"
  },
  {
    text: "敵の心を動かすこと、これ勝負の専一なり。",
    author: "宮本武蔵『五輪書』",
    category: "武道"
  },

  // 75-77 Hagakure additions
  {
    text: "ただ今の一念を大切にすべし。一念の集積が人生なり。",
    author: "山本常朝『葉隠』",
    category: "武士道"
  },
  {
    text: "迷うたときは、最も過酷で、己にとって最も困難な道を選べ。",
    author: "山本常朝『葉隠』",
    category: "武士道"
  },
  {
    text: "他人に勝つことは難しくない。昨日までの己に勝つことが、真の勝利である。",
    author: "山本常朝『葉隠』",
    category: "武士道"
  },

  // 78-79 Aristotle (Habit & Excellence)
  {
    text: "我々は、自分が繰り返し行うことの現れである。したがって、卓越性とは行動ではなく、習慣である。",
    author: "アリストテレス",
    category: "知性"
  },
  {
    text: "己を支配することこそが、最も偉大な勝利である。",
    author: "アリストテレス",
    category: "知性"
  },

  // 80-81 Sengoku Warlords (Resolution)
  {
    text: "必死に生きてみよ。その先にのみ、真の道が開ける。",
    author: "織田信長",
    category: "武士道"
  },
  {
    text: "人の一生は重荷を負うて遠き道を行くがごとし。急ぐべからず。",
    author: "徳川家康",
    category: "武士道"
  },

  // 82-84 Arnold additions
  {
    text: "成功へのエレベーターは故障している。君は階段を使わなければならない。一歩一歩な。",
    author: "アーノルド・シュワルツェネッガー",
    category: "肉体"
  },
  {
    text: "誰もが私に『無理だ』と言った。その言葉こそが、私を燃え上がらせる最高の燃料だった。",
    author: "アーノルド・シュワルツェネッガー",
    category: "肉体"
  },
  {
    text: "私の人生における最大の功績は、重いバーベルを持ち上げたことではない。自分を信じる力を見つけたことだ。",
    author: "アーノルド・シュワルツェネッガー",
    category: "肉体"
  },

  // 85-87 Ronnie additions
  {
    text: "限界？そんなものは頭の中にある幻想だ。俺のバーにプレートを追加してくれ！",
    author: "ロニー・コールマン",
    category: "肉体"
  },
  {
    text: "ハードワークを愛せ。そうでなければ、トップに立つことはできない。",
    author: "ロニー・コールマン",
    category: "肉体"
  },
  {
    text: "最後のレップをやり遂げたとき、君の背中には誰も追いつけない鎧が完成する。",
    author: "ロニー・コールマン",
    category: "肉体"
  },

  // 88-89 Tom Platz (Squat Intensity)
  {
    text: "私はハーフスクワットを絶対に認めない。床に尻がつくほどの深さからしか、本物の意志は育たない。",
    author: "トム・プラッツ",
    category: "肉体"
  },
  {
    text: "スクワットが終わったとき歩くことすら困難になる。その極限状態の疲労の中にこそ、究極の達成感がある。",
    author: "トム・プラッツ",
    category: "肉体"
  },

  // 90-91 Dorian Yates (Intensity & Truth)
  {
    text: "他人の目を気にするな。鏡の前の己と、鉄の塊だけが、君の真実を教えてくれる。",
    author: "ドリアン・イェーツ",
    category: "肉体"
  },
  {
    text: "ヘビーデューティー（超高強度）。1レップに魂のすべてを注ぎ込め。",
    author: "ドリアン・イェーツ",
    category: "肉体"
  },

  // 92 Frank Zane (Harmony)
  {
    text: "筋肉とは、肉体をもって描く彫刻である。ディテールへの執念が、調和を生み出す。",
    author: "フランク・ゼーン",
    category: "肉体"
  },

  // 93-94 Nietzsche additions
  {
    text: "自分を愛することから始めよう。自分を愛せなければ、何も始めることはできない。",
    author: "フリードリヒ・ニーチェ",
    category: "哲学"
  },
  {
    text: "人生を最高に旅せよ。危険に生きよ。",
    author: "フリードリヒ・ニーチェ",
    category: "哲学"
  },

  // 95-96 Einstein additions
  {
    text: "挫折を経験したことがない者は、新しいことに挑戦したことがない者だ。",
    author: "アルバート・アインシュタイン",
    category: "知性"
  },
  {
    text: "人の価値は、その人が何を得たかではなく、何を与えたかによって決まる。",
    author: "アルバート・アインシュタイン",
    category: "知性"
  },

  // 97 George Bernard Shaw addition
  {
    text: "他人の真似をするな。君自身のオリジナルな人生を、泥まみれになりながら走り抜け。",
    author: "ジョージ・バーナード・ショー",
    category: "人生"
  },

  // 98-99 Napoleon additions
  {
    text: "状況？私が状況を作るのだ。",
    author: "ナポレオン・ボナパルト",
    category: "覇道"
  },
  {
    text: "戦いに勝つのは、最後まで戦い抜く者だ。途中で諦めた者に勝利の女神は微笑まない。",
    author: "ナポレオン・ボナパルト",
    category: "覇道"
  },

  // 100 Marcus Aurelius addition
  {
    text: "あなたの人生の質は、あなたの思考の質によって決まる。",
    author: "マルクス・アウレリウス『自省録』",
    category: "哲学"
  }
];

export function getRandomQuote(): Quote {
  const index = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
  return MOTIVATIONAL_QUOTES[index];
}
