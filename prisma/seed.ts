import { PrismaClient, Role, Difficulty, QuestionType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting CBT Platform Database Seeding...");

  // 1. Clean existing records in reverse dependency order
  await prisma.attemptAnswer.deleteMany({});
  await prisma.attempt.deleteMany({});
  await prisma.bookmark.deleteMany({});
  await prisma.testQuestion.deleteMany({});
  await prisma.questionOption.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.testSection.deleteMany({});
  await prisma.test.deleteMany({});
  await prisma.topic.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.exam.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("🧹 Cleaned existing database tables.");

  // 2. Create Users
  const passwordAdmin = await bcrypt.hash("Admin@12345", 10);
  const passwordUser = await bcrypt.hash("User@12345", 10);

  const adminUser = await prisma.user.create({
    data: {
      name: "CBT Administrator",
      email: "admin@cbt.com",
      passwordHash: passwordAdmin,
      role: Role.ADMIN,
    },
  });

  const demoUser = await prisma.user.create({
    data: {
      name: "Vikram Sharma",
      email: "user@cbt.com",
      passwordHash: passwordUser,
      role: Role.USER,
    },
  });

  console.log(`👤 Created Users: Admin (${adminUser.email}), User (${demoUser.email})`);

  // 3. Create Categories
  const sscCat = await prisma.category.create({
    data: {
      name: "SSC Examinations",
      slug: "ssc-exams",
      description: "Staff Selection Commission recruitment exams including CGL, CHSL, MTS, and CPO.",
      icon: "Award",
    },
  });

  const bankCat = await prisma.category.create({
    data: {
      name: "Banking & Insurance",
      slug: "banking-exams",
      description: "IBPS, SBI, RBI and Insurance officers and clerical exams.",
      icon: "Building2",
    },
  });

  const rrbCat = await prisma.category.create({
    data: {
      name: "Railways (RRB)",
      slug: "railways-rrb",
      description: "Railway Recruitment Board exams including NTPC, Group D, ALP, and JE.",
      icon: "Train",
    },
  });

  // 4. Create Exams
  const sscCgl = await prisma.exam.create({
    data: {
      categoryId: sscCat.id,
      title: "SSC CGL (Tier 1)",
      slug: "ssc-cgl-tier-1",
      code: "SSC-CGL-T1",
      description: "Combined Graduate Level Examination for Group B and C Gazetted/Non-Gazetted posts.",
      icon: "GraduationCap",
      isPublished: true,
    },
  });

  const ibpsPo = await prisma.exam.create({
    data: {
      categoryId: bankCat.id,
      title: "IBPS PO Prelims",
      slug: "ibps-po-prelims",
      code: "IBPS-PO-PRE",
      description: "Probationary Officer / Management Trainee preliminary examination.",
      icon: "Landmark",
      isPublished: true,
    },
  });

  const rrbNtpc = await prisma.exam.create({
    data: {
      categoryId: rrbCat.id,
      title: "RRB NTPC (CBT-1)",
      slug: "rrb-ntpc-cbt-1",
      code: "RRB-NTPC-1",
      description: "Non-Technical Popular Categories Stage-1 Computer Based Test.",
      icon: "Compass",
      isPublished: true,
    },
  });

  console.log("📚 Created Categories and Exams.");

  // 5. Create Subjects and Topics
  const quantSub = await prisma.subject.create({
    data: {
      name: "Quantitative Aptitude",
      code: "QUANT",
      description: "Arithmetic, Algebra, Geometry, Trigonometry, and Data Interpretation",
    },
  });

  const reasoningSub = await prisma.subject.create({
    data: {
      name: "General Intelligence & Reasoning",
      code: "REAS",
      description: "Analogy, Series, Coding-Decoding, Syllogism, Blood Relations, and Puzzles",
    },
  });

  const gaSub = await prisma.subject.create({
    data: {
      name: "General Awareness & Science",
      code: "GA",
      description: "Indian History, Polity, Geography, Economy, Science, and Current Affairs",
    },
  });

  const engSub = await prisma.subject.create({
    data: {
      name: "English Comprehension",
      code: "ENG",
      description: "Grammar, Vocabulary, Reading Comprehension, Error Spotting, and Idioms",
    },
  });

  // Topics
  const topicPercentage = await prisma.topic.create({
    data: { subjectId: quantSub.id, name: "Percentage & Profit-Loss" },
  });
  const topicTimeWork = await prisma.topic.create({
    data: { subjectId: quantSub.id, name: "Time and Work" },
  });
  const topicSeries = await prisma.topic.create({
    data: { subjectId: reasoningSub.id, name: "Number & Letter Series" },
  });
  const topicPolity = await prisma.topic.create({
    data: { subjectId: gaSub.id, name: "Indian Constitution & Polity" },
  });
  const topicScience = await prisma.topic.create({
    data: { subjectId: gaSub.id, name: "General Science" },
  });
  const topicGrammar = await prisma.topic.create({
    data: { subjectId: engSub.id, name: "Grammar & Error Detection" },
  });

  console.log("📖 Created Subjects and Topics.");

  // 6. Create Questions with Options and Bilingual content
  const questionsData = [
    // --- General Awareness & Science ---
    {
      subjectId: gaSub.id,
      topicId: topicScience.id,
      questionEn: "Which planet in our solar system is known as the 'Red Planet'?",
      questionHi: "हमारे सौरमंडल में किस ग्रह को 'लाल ग्रह' (Red Planet) के नाम से जाना जाता है?",
      explanationEn: "Mars appears red due to the abundance of iron oxide (rust) on its surface.",
      explanationHi: "मंगल ग्रह की सतह पर प्रचुर मात्रा में मौजूद आयरन ऑक्साइड (जंग) के कारण यह लाल दिखाई देता है।",
      difficulty: Difficulty.EASY,
      options: [
        { optionKey: "A", contentEn: "Venus", contentHi: "शुक्र", isCorrect: false },
        { optionKey: "B", contentEn: "Mars", contentHi: "मंगल", isCorrect: true },
        { optionKey: "C", contentEn: "Jupiter", contentHi: "बृहस्पति", isCorrect: false },
        { optionKey: "D", contentEn: "Saturn", contentHi: "शनि", isCorrect: false },
      ],
    },
    {
      subjectId: gaSub.id,
      topicId: topicPolity.id,
      questionEn: "Under which Article of the Indian Constitution is the 'Right to Equality' guaranteed?",
      questionHi: "भारतीय संविधान के किस अनुच्छेद के तहत 'समानता का अधिकार' सुनिश्चित किया गया है?",
      explanationEn: "Articles 14 to 18 of the Constitution of India deal with the Right to Equality.",
      explanationHi: "भारतीय संविधान के अनुच्छेद 14 से 18 समानता के अधिकार से संबंधित हैं।",
      difficulty: Difficulty.MEDIUM,
      options: [
        { optionKey: "A", contentEn: "Articles 12-13", contentHi: "अनुच्छेद 12-13", isCorrect: false },
        { optionKey: "B", contentEn: "Articles 14-18", contentHi: "अनुच्छेद 14-18", isCorrect: true },
        { optionKey: "C", contentEn: "Articles 19-22", contentHi: "अनुच्छेद 19-22", isCorrect: false },
        { optionKey: "D", contentEn: "Articles 25-28", contentHi: "अनुच्छेद 25-28", isCorrect: false },
      ],
    },
    {
      subjectId: gaSub.id,
      topicId: topicScience.id,
      questionEn: "What is the chemical formula of Washing Soda?",
      questionHi: "धावन सोडा (Washing Soda) का रासायनिक सूत्र क्या है?",
      explanationEn: "Washing soda is Sodium carbonate decahydrate with formula Na2CO3·10H2O.",
      explanationHi: "धावन सोडा सोडियम कार्बोनेट डेकाहाइड्रेट है जिसका सूत्र Na2CO3·10H2O है।",
      difficulty: Difficulty.MEDIUM,
      options: [
        { optionKey: "A", contentEn: "NaHCO3", contentHi: "NaHCO3", isCorrect: false },
        { optionKey: "B", contentEn: "Na2CO3·10H2O", contentHi: "Na2CO3·10H2O", isCorrect: true },
        { optionKey: "C", contentEn: "Ca(OH)2", contentHi: "Ca(OH)2", isCorrect: false },
        { optionKey: "D", contentEn: "CaOCl2", contentHi: "CaOCl2", isCorrect: false },
      ],
    },
    {
      subjectId: gaSub.id,
      topicId: topicPolity.id,
      questionEn: "Who is the ex-officio Chairman of the Rajya Sabha in India?",
      questionHi: "भारत में राज्य सभा का पदेन सभापति कौन होता है?",
      explanationEn: "The Vice-President of India is the ex-officio Chairman of the Rajya Sabha according to Article 64.",
      explanationHi: "अनुच्छेद 64 के अनुसार भारत का उपराष्ट्रपति राज्य सभा का पदेन सभापति होता है।",
      difficulty: Difficulty.EASY,
      options: [
        { optionKey: "A", contentEn: "President of India", contentHi: "भारत का राष्ट्रपति", isCorrect: false },
        { optionKey: "B", contentEn: "Prime Minister of India", contentHi: "भारत का प्रधानमंत्री", isCorrect: false },
        { optionKey: "C", contentEn: "Vice-President of India", contentHi: "भारत का उपराष्ट्रपति", isCorrect: true },
        { optionKey: "D", contentEn: "Chief Justice of India", contentHi: "भारत का मुख्य न्यायाधीश", isCorrect: false },
      ],
    },

    // --- Quantitative Aptitude ---
    {
      subjectId: quantSub.id,
      topicId: topicPercentage.id,
      questionEn: "If the price of sugar increases by 25%, by what percentage should a household reduce its consumption so that the expenditure remains unchanged?",
      questionHi: "यदि चीनी के मूल्य में 25% की वृद्धि होती है, तो एक परिवार को अपनी खपत में कितने प्रतिशत की कमी करनी चाहिए ताकि कुल खर्च अपरिवर्तित रहे?",
      explanationEn: "Reduction % = [R / (100 + R)] * 100 = [25 / 125] * 100 = 20%.",
      explanationHi: "कमी % = [R / (100 + R)] * 100 = [25 / 125] * 100 = 20%.",
      difficulty: Difficulty.MEDIUM,
      options: [
        { optionKey: "A", contentEn: "20%", contentHi: "20%", isCorrect: true },
        { optionKey: "B", contentEn: "25%", contentHi: "25%", isCorrect: false },
        { optionKey: "C", contentEn: "16.67%", contentHi: "16.67%", isCorrect: false },
        { optionKey: "D", contentEn: "15%", contentHi: "15%", isCorrect: false },
      ],
    },
    {
      subjectId: quantSub.id,
      topicId: topicTimeWork.id,
      questionEn: "A can complete a piece of work in 12 days and B can do the same work in 18 days. If they work together, how many days will they take to complete the work?",
      questionHi: "A किसी कार्य को 12 दिनों में और B उसी कार्य को 18 दिनों में पूरा कर सकता है। यदि वे एक साथ कार्य करें, तो कार्य पूरा करने में कितने दिन लगेंगे?",
      explanationEn: "Total work = LCM(12, 18) = 36 units. Efficiency of A = 3, B = 2. Combined efficiency = 5 units/day. Time = 36 / 5 = 7.2 days.",
      explanationHi: "कुल कार्य = ल.स.प.(12, 18) = 36 इकाइयां। A की क्षमता = 3, B की = 2. कुल क्षमता = 5 इकाई/दिन। समय = 36 / 5 = 7.2 दिन (7 सही 1/5 दिन)।",
      difficulty: Difficulty.EASY,
      options: [
        { optionKey: "A", contentEn: "6.5 days", contentHi: "6.5 दिन", isCorrect: false },
        { optionKey: "B", contentEn: "7.2 days", contentHi: "7.2 दिन", isCorrect: true },
        { optionKey: "C", contentEn: "8 days", contentHi: "8 दिन", isCorrect: false },
        { optionKey: "D", contentEn: "7.5 days", contentHi: "7.5 दिन", isCorrect: false },
      ],
    },
    {
      subjectId: quantSub.id,
      topicId: topicPercentage.id,
      questionEn: "A shopkeeper sells an article at a profit of 15%. If he had bought it for 10% less and sold it for ₹4 less, he would have gained 25%. What is the cost price of the article?",
      questionHi: "एक दुकानदार किसी वस्तु को 15% लाभ पर बेचता है। यदि उसने इसे 10% कम पर खरीदा होता और ₹4 कम में बेचा होता, तो उसे 25% का लाभ होता। वस्तु का क्रय मूल्य ज्ञात कीजिए।",
      explanationEn: "Let CP = 100x. SP1 = 115x. New CP = 90x. New SP = 90x * 1.25 = 112.5x. Difference: 115x - 112.5x = 2.5x = ₹4. Therefore x = 4 / 2.5 = 1.6. CP = 100 * 1.6 = ₹160.",
      explanationHi: "माना CP = 100x, SP1 = 115x, नया CP = 90x, नया SP = 90x * 1.25 = 112.5x। अंतर: 115x - 112.5x = 2.5x = ₹4। अतः x = 1.6, CP = ₹160।",
      difficulty: Difficulty.HARD,
      options: [
        { optionKey: "A", contentEn: "₹140", contentHi: "₹140", isCorrect: false },
        { optionKey: "B", contentEn: "₹150", contentHi: "₹150", isCorrect: false },
        { optionKey: "C", contentEn: "₹160", contentHi: "₹160", isCorrect: true },
        { optionKey: "D", contentEn: "₹180", contentHi: "₹180", isCorrect: false },
      ],
    },

    // --- General Intelligence & Reasoning ---
    {
      subjectId: reasoningSub.id,
      topicId: topicSeries.id,
      questionEn: "Find the missing number in the series: 3, 7, 15, 31, 63, ?",
      questionHi: "शृंखला में लुप्त संख्या ज्ञात कीजिए: 3, 7, 15, 31, 63, ?",
      explanationEn: "Pattern: x2 + 1. 3*2+1=7, 7*2+1=15, 15*2+1=31, 31*2+1=63, 63*2+1=127.",
      explanationHi: "पैटर्न: x2 + 1. 3*2+1=7, 7*2+1=15, 15*2+1=31, 31*2+1=63, 63*2+1=127.",
      difficulty: Difficulty.EASY,
      options: [
        { optionKey: "A", contentEn: "124", contentHi: "124", isCorrect: false },
        { optionKey: "B", contentEn: "127", contentHi: "127", isCorrect: true },
        { optionKey: "C", contentEn: "129", contentHi: "129", isCorrect: false },
        { optionKey: "D", contentEn: "135", contentHi: "135", isCorrect: false },
      ],
    },
    {
      subjectId: reasoningSub.id,
      topicId: topicSeries.id,
      questionEn: "Select the related word from given alternatives: Thermometer : Temperature :: Hygrometer : ?",
      questionHi: "दिए गए विकल्पों में से संबंधित शब्द चुनिए: थर्मामीटर : तापमान :: हाइग्रोमीटर : ?",
      explanationEn: "A thermometer measures temperature, whereas a hygrometer measures humidity in the air.",
      explanationHi: "थर्मामीटर तापमान मापता है, जबकि हाइग्रोमीटर वायु में आर्द्रता (Humidity) मापता है।",
      difficulty: Difficulty.EASY,
      options: [
        { optionKey: "A", contentEn: "Pressure", contentHi: "दबाव", isCorrect: false },
        { optionKey: "B", contentEn: "Humidity", contentHi: "आर्द्रता", isCorrect: true },
        { optionKey: "C", contentEn: "Density", contentHi: "घनत्व", isCorrect: false },
        { optionKey: "D", contentEn: "Wind Speed", contentHi: "पवन वेग", isCorrect: false },
      ],
    },
    {
      subjectId: reasoningSub.id,
      topicId: topicSeries.id,
      questionEn: "In a certain code language, 'ROSE' is written as '6821' and 'CHAIR' is written as '73456'. How will 'SEARCH' be written in that code?",
      questionHi: "एक निश्चित कूट भाषा में, 'ROSE' को '6821' और 'CHAIR' को '73456' लिखा जाता है। उसी कूट भाषा में 'SEARCH' को कैसे लिखा जाएगा?",
      explanationEn: "Direct letter-to-digit substitution: S=2, E=1, A=4, R=6, C=7, H=3 => 214673.",
      explanationHi: "प्रत्यक्ष वर्ण प्रतिस्थापन: S=2, E=1, A=4, R=6, C=7, H=3 => 214673.",
      difficulty: Difficulty.MEDIUM,
      options: [
        { optionKey: "A", contentEn: "214673", contentHi: "214673", isCorrect: true },
        { optionKey: "B", contentEn: "214763", contentHi: "214763", isCorrect: false },
        { optionKey: "C", contentEn: "216473", contentHi: "216473", isCorrect: false },
        { optionKey: "D", contentEn: "241673", contentHi: "241673", isCorrect: false },
      ],
    },

    // --- English Comprehension ---
    {
      subjectId: engSub.id,
      topicId: topicGrammar.id,
      questionEn: "Select the most appropriate synonym of the given word: 'TENACIOUS'",
      questionHi: "दिए गए शब्द का सबसे उपयुक्त समानार्थी (Synonym) चुनिए: 'TENACIOUS'",
      explanationEn: "'Tenacious' means persistent or determined. 'Persistent' is the exact synonym.",
      explanationHi: "'Tenacious' का अर्थ दृढ़ या निरंतर बने रहने वाला होता है। 'Persistent' इसका सटीक पर्यायवाची है।",
      difficulty: Difficulty.MEDIUM,
      options: [
        { optionKey: "A", contentEn: "Yielding", contentHi: "झुकने वाला", isCorrect: false },
        { optionKey: "B", contentEn: "Persistent", contentHi: "दृढ़ / निरंतर", isCorrect: true },
        { optionKey: "C", contentEn: "Hesitant", contentHi: "संकोची", isCorrect: false },
        { optionKey: "D", contentEn: "Fragile", contentHi: "नाजुक", isCorrect: false },
      ],
    },
    {
      subjectId: engSub.id,
      topicId: topicGrammar.id,
      questionEn: "Choose the correct idiom meaning: 'To burn the midnight oil'",
      questionHi: "मुहावरे का सही अर्थ चुनिए: 'To burn the midnight oil'",
      explanationEn: "'To burn the midnight oil' means to work or study late into the night.",
      explanationHi: "'To burn the midnight oil' का अर्थ देर रात तक कठिन परिश्रम या पढ़ाई करना होता है।",
      difficulty: Difficulty.EASY,
      options: [
        { optionKey: "A", contentEn: "To waste resources", contentHi: "संसाधनों को बर्बाद करना", isCorrect: false },
        { optionKey: "B", contentEn: "To work or study late into the night", contentHi: "देर रात तक परिश्रम या अध्ययन करना", isCorrect: true },
        { optionKey: "C", contentEn: "To cause damage to property", contentHi: "संपत्ति को नुकसान पहुँचाना", isCorrect: false },
        { optionKey: "D", contentEn: "To wake up very early", contentHi: "बहुत सुबह उठना", isCorrect: false },
      ],
    },
  ];

  const createdQuestions = [];
  for (const q of questionsData) {
    const question = await prisma.question.create({
      data: {
        subjectId: q.subjectId,
        topicId: q.topicId,
        questionEn: q.questionEn,
        questionHi: q.questionHi,
        explanationEn: q.explanationEn,
        explanationHi: q.explanationHi,
        difficulty: q.difficulty,
        type: QuestionType.SINGLE_CHOICE,
        defaultMarks: 2.0,
        defaultNegativeMarks: 0.5,
        options: {
          create: q.options.map((opt, idx) => ({
            optionKey: opt.optionKey,
            contentEn: opt.contentEn,
            contentHi: opt.contentHi,
            isCorrect: opt.isCorrect,
            orderIndex: idx,
          })),
        },
      },
      include: {
        options: true,
      },
    });
    createdQuestions.push(question);
  }

  console.log(`❓ Created ${createdQuestions.length} bilingual Questions with options.`);

  // 7. Create Tests and TestSections
  const sscMock1 = await prisma.test.create({
    data: {
      examId: sscCgl.id,
      title: "SSC CGL Tier-1 Full Mock Test 01",
      slug: "ssc-cgl-tier-1-full-mock-01",
      description: "Complete full-length Tier-1 pattern test with General Intelligence, General Awareness, Quantitative Aptitude, and English.",
      instructions: "1. The test comprises multiple choice questions with 4 options each.\n2. +2 marks for every correct answer.\n3. -0.5 marks negative marking for every incorrect answer.\n4. You can navigate between questions using the Question Palette.\n5. The test will auto-submit when the timer reaches 00:00.",
      durationMinutes: 60,
      totalMarks: 200.0,
      passPercentage: 45.0,
      positiveMarksPerQ: 2.0,
      negativeMarksPerQ: 0.5,
      isNegativeMarking: true,
      isPublished: true,
      isFree: true,
    },
  });

  // Create 4 Sections in SSC Test
  const secReasoning = await prisma.testSection.create({
    data: {
      testId: sscMock1.id,
      title: "General Intelligence & Reasoning",
      orderIndex: 0,
      positiveMarks: 2.0,
      negativeMarks: 0.5,
      totalQuestions: 3,
      instructions: "Section 1: Test of reasoning logic, series, analogies.",
    },
  });

  const secGA = await prisma.testSection.create({
    data: {
      testId: sscMock1.id,
      title: "General Awareness",
      orderIndex: 1,
      positiveMarks: 2.0,
      negativeMarks: 0.5,
      totalQuestions: 4,
      instructions: "Section 2: Science, Polity, History, and Current Affairs.",
    },
  });

  const secQuant = await prisma.testSection.create({
    data: {
      testId: sscMock1.id,
      title: "Quantitative Aptitude",
      orderIndex: 2,
      positiveMarks: 2.0,
      negativeMarks: 0.5,
      totalQuestions: 3,
      instructions: "Section 3: Arithmetic, Percentage, Time & Work, Algebra.",
    },
  });

  const secEng = await prisma.testSection.create({
    data: {
      testId: sscMock1.id,
      title: "English Comprehension",
      orderIndex: 3,
      positiveMarks: 2.0,
      negativeMarks: 0.5,
      totalQuestions: 2,
      instructions: "Section 4: Grammar, Vocabulary, Idioms and Comprehension.",
    },
  });

  // Attach questions to test sections
  let qOrder = 0;
  for (const q of createdQuestions) {
    let targetSectionId = secGA.id;
    if (q.subjectId === reasoningSub.id) targetSectionId = secReasoning.id;
    else if (q.subjectId === quantSub.id) targetSectionId = secQuant.id;
    else if (q.subjectId === engSub.id) targetSectionId = secEng.id;

    await prisma.testQuestion.create({
      data: {
        testId: sscMock1.id,
        sectionId: targetSectionId,
        questionId: q.id,
        orderIndex: qOrder++,
        marks: 2.0,
        negativeMarks: 0.5,
      },
    });
  }

  // Also create a second quick test (Mini Speed Mock Test - 15 mins)
  const quickMock = await prisma.test.create({
    data: {
      examId: sscCgl.id,
      title: "General Awareness Live Speed Quiz",
      slug: "ga-live-speed-quiz-01",
      description: "Quick 15-minute speed quiz covering Science and Constitution essentials.",
      instructions: "Rapid fire quiz. +2 for correct, -0.5 for incorrect.",
      durationMinutes: 15,
      totalMarks: 20.0,
      passPercentage: 50.0,
      positiveMarksPerQ: 2.0,
      negativeMarksPerQ: 0.5,
      isNegativeMarking: true,
      isPublished: true,
      isFree: true,
    },
  });

  const speedSec = await prisma.testSection.create({
    data: {
      testId: quickMock.id,
      title: "General Awareness",
      orderIndex: 0,
      positiveMarks: 2.0,
      negativeMarks: 0.5,
      totalQuestions: 4,
    },
  });

  // Attach first 4 GA questions
  const gaQuestions = createdQuestions.filter((q) => q.subjectId === gaSub.id);
  for (let i = 0; i < gaQuestions.length; i++) {
    await prisma.testQuestion.create({
      data: {
        testId: quickMock.id,
        sectionId: speedSec.id,
        questionId: gaQuestions[i].id,
        orderIndex: i,
        marks: 2.0,
        negativeMarks: 0.5,
      },
    });
  }

  // Create a third test for RRB NTPC
  const rrbMock1 = await prisma.test.create({
    data: {
      examId: rrbNtpc.id,
      title: "RRB NTPC CBT-1 Practice Set 01",
      slug: "rrb-ntpc-cbt-1-practice-01",
      description: "Comprehensive practice test according to official Railway recruitment syllabus.",
      instructions: "Follow all NTA/RRB standard examination guidelines.",
      durationMinutes: 45,
      totalMarks: 50.0,
      passPercentage: 40.0,
      positiveMarksPerQ: 1.0,
      negativeMarksPerQ: 0.33,
      isNegativeMarking: true,
      isPublished: true,
      isFree: true,
    },
  });

  console.log("📝 Created Mock Tests and Section Mappings.");
  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
