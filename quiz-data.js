// =====================================================================
//  Bank soal latihan untuk tiap tense + kuis campuran (tebak tense).
//
//  Struktur:
//    TENSE_QUIZZES["01"] = { name, file, questions: [ ... ] }
//    Tipe soal:
//      { type:"mc",   q, options:[...], answer:<index>, explain }
//      { type:"fill", q, answers:[...akun jawaban yang diterima], explain }
//    Jawaban "fill" dicek tanpa peduli huruf besar/kecil, spasi ganda,
//    tanda baca akhir, dan apostrof (don't = dont).
//
//    MIX_QUIZ = [ { q, options:[nama tense...], answer:<index>, explain } ]
// =====================================================================

const TENSE_QUIZZES = {
  "01": {
    name: "Simple Present Tense",
    file: "01-simple-present-tense.html",
    questions: [
      { type:"fill", q:"My sister ___ (jog) around the lake every morning.", answers:["jogs"], explain:"Subjek orang ketiga tunggal (she) → verb + -s." },
      { type:"mc", q:"Pilih kalimat yang BENAR.", options:["He go to school by bike.","He goes to school by bike.","He going to school by bike.","He gone to school by bike."], answer:1, explain:"he/she/it + V1 + -s/es → goes." },
      { type:"fill", q:"The children ___ (not/eat) spicy noodles for breakfast.", answers:["do not eat","dont eat"], explain:"I/you/we/they → do not + V1. Setelah do not, verb kembali ke V1." },
      { type:"mc", q:"___ your uncle repair antique clocks?", options:["Do","Does","Is","Are"], answer:1, explain:"Kalimat tanya untuk he/she/it memakai Does." },
      { type:"fill", q:"Water ___ (boil) at one hundred degrees Celsius.", answers:["boils"], explain:"Fakta umum, subjek tunggal → boils." },
      { type:"mc", q:"Time signal manakah yang khas Simple Present?", options:["right now","yesterday","every day","tomorrow"], answer:2, explain:"every day menandakan kebiasaan/rutinitas → Simple Present." }
    ]
  },
  "02": {
    name: "Present Continuous Tense",
    file: "02-present-continuous-tense.html",
    questions: [
      { type:"fill", q:"Look! The baby ___ (sleep) right now.", answers:["is sleeping"], explain:"Subjek tunggal → is + V-ing." },
      { type:"mc", q:"They ___ playing football right now.", options:["is","am","are","be"], answer:2, explain:"they → are + V-ing." },
      { type:"fill", q:"I ___ (study) English at the moment.", answers:["am studying"], explain:"I → am + V-ing." },
      { type:"mc", q:"Pilih kalimat yang BENAR.", options:["She is cook dinner now.","She is cooking dinner now.","She cooking dinner now.","She cook dinner now."], answer:1, explain:"is + V-ing → is cooking." },
      { type:"fill", q:"We ___ (not/watch) TV right now.", answers:["are not watching","arent watching"], explain:"we → are not + V-ing." },
      { type:"mc", q:"Time signal khas Present Continuous adalah…", options:["every day","now / right now","last week","usually"], answer:1, explain:"now/right now menandakan aksi sedang berlangsung." }
    ]
  },
  "03": {
    name: "Present Perfect Tense",
    file: "03-present-perfect-tense.html",
    questions: [
      { type:"fill", q:"She ___ (finish) her homework already.", answers:["has finished"], explain:"she → has + V3 (finished)." },
      { type:"mc", q:"I ___ never ___ to Japan.", options:["has been","have been","have being","had been"], answer:1, explain:"I → have + V3 (been)." },
      { type:"fill", q:"They ___ (live) here since 2010.", answers:["have lived"], explain:"they → have + V3. 'since' adalah sinyal Present Perfect." },
      { type:"mc", q:"Bentuk V3 (past participle) dari 'eat' adalah…", options:["ate","eaten","eat","eating"], answer:1, explain:"eat – ate – eaten." },
      { type:"fill", q:"He ___ (not/see) that movie yet.", answers:["has not seen","hasnt seen"], explain:"he → has not + V3 (seen). 'yet' khas Present Perfect." },
      { type:"mc", q:"Time signal khas Present Perfect adalah…", options:["already / yet","yesterday","right now","tomorrow"], answer:0, explain:"already, yet, just, ever menandakan Present Perfect." }
    ]
  },
  "04": {
    name: "Present Perfect Continuous Tense",
    file: "04-present-perfect-continuous-tense.html",
    questions: [
      { type:"fill", q:"I ___ (wait) for two hours.", answers:["have been waiting"], explain:"have/has been + V-ing → have been waiting." },
      { type:"mc", q:"She ___ been working all day.", options:["have","has","had","is"], answer:1, explain:"she → has been + V-ing." },
      { type:"fill", q:"They ___ (study) since morning.", answers:["have been studying"], explain:"they → have been + V-ing." },
      { type:"mc", q:"Pilih kalimat yang BENAR.", options:["He has been run.","He has been running.","He have been running.","He been running."], answer:1, explain:"has been + V-ing → has been running." },
      { type:"fill", q:"We ___ (not/sleep) well lately.", answers:["have not been sleeping","havent been sleeping"], explain:"we → have not been + V-ing." },
      { type:"mc", q:"Time signal khas tense ini adalah…", options:["for / since","yesterday","tomorrow","every day"], answer:0, explain:"for + durasi & since + titik waktu menandakan durasi aksi." }
    ]
  },
  "05": {
    name: "Simple Past Tense",
    file: "05-simple-past-tense.html",
    questions: [
      { type:"fill", q:"He ___ (go) to the market yesterday.", answers:["went"], explain:"go – went – gone. Simple Past pakai V2 → went." },
      { type:"mc", q:"Bentuk V2 dari 'buy' adalah…", options:["buyed","bought","buy","buying"], answer:1, explain:"buy – bought – bought." },
      { type:"fill", q:"They ___ (not/come) to the party.", answers:["did not come","didnt come"], explain:"Negatif: did not + V1 (come)." },
      { type:"mc", q:"___ you visit your grandma last week?", options:["Do","Does","Did","Was"], answer:2, explain:"Pertanyaan Simple Past memakai Did + S + V1." },
      { type:"fill", q:"I ___ (see) a great film last night.", answers:["saw"], explain:"see – saw – seen → V2 = saw." },
      { type:"mc", q:"Time signal khas Simple Past adalah…", options:["yesterday","now","already","tomorrow"], answer:0, explain:"yesterday, last…, ago menandakan Simple Past." }
    ]
  },
  "06": {
    name: "Past Continuous Tense",
    file: "06-past-continuous-tense.html",
    questions: [
      { type:"fill", q:"I ___ (read) a book when you called.", answers:["was reading"], explain:"I → was + V-ing." },
      { type:"mc", q:"They ___ playing when it started to rain.", options:["was","were","are","is"], answer:1, explain:"they → were + V-ing." },
      { type:"fill", q:"She ___ (cook) at 7 PM yesterday.", answers:["was cooking"], explain:"she → was + V-ing." },
      { type:"mc", q:"Pilih kalimat yang BENAR.", options:["We were watch TV.","We were watching TV.","We was watching TV.","We watching TV."], answer:1, explain:"were + V-ing → were watching." },
      { type:"fill", q:"While I ___ (walk), it began to rain.", answers:["was walking"], explain:"Aksi yang sedang berlangsung di masa lampau → was walking." },
      { type:"mc", q:"Pola Past Continuous yang benar adalah…", options:["was/were + V-ing","was/were + V3","had + V3","will be + V-ing"], answer:0, explain:"S + was/were + V-ing." }
    ]
  },
  "07": {
    name: "Past Perfect Tense",
    file: "07-past-perfect-tense.html",
    questions: [
      { type:"fill", q:"The train ___ (leave) before we arrived.", answers:["had left"], explain:"had + V3 (left) untuk aksi yang lebih dulu terjadi." },
      { type:"mc", q:"After she ___ finished, she went home.", options:["has","had","have","was"], answer:1, explain:"Past Perfect: had + V3." },
      { type:"fill", q:"They ___ (eat) before the guests came.", answers:["had eaten"], explain:"had + V3 (eaten)." },
      { type:"mc", q:"Bentuk V3 dari 'write' adalah…", options:["wrote","written","writed","writing"], answer:1, explain:"write – wrote – written." },
      { type:"fill", q:"I ___ (not/meet) him before that day.", answers:["had not met","hadnt met"], explain:"had not + V3 (met)." },
      { type:"mc", q:"\"When I arrived, the movie had started.\" Mana yang terjadi LEBIH DULU?", options:["I arrived","the movie started","keduanya bersamaan","tidak bisa ditentukan"], answer:1, explain:"Past Perfect (had started) menandai aksi yang lebih dulu terjadi." }
    ]
  },
  "08": {
    name: "Past Perfect Continuous Tense",
    file: "08-past-perfect-continuous-tense.html",
    questions: [
      { type:"fill", q:"She ___ (wait) for an hour before the bus came.", answers:["had been waiting"], explain:"had been + V-ing." },
      { type:"mc", q:"They ___ been working before it rained.", options:["have","has","had","was"], answer:2, explain:"Semua subjek → had been + V-ing." },
      { type:"fill", q:"I ___ (study) for hours before I slept.", answers:["had been studying"], explain:"had been + V-ing." },
      { type:"mc", q:"Pilih kalimat yang BENAR.", options:["He had been play.","He had been playing.","He has been playing.","He had being playing."], answer:1, explain:"had been + V-ing → had been playing." },
      { type:"fill", q:"We ___ (drive) all night before we reached the city.", answers:["had been driving"], explain:"had been + V-ing." },
      { type:"mc", q:"Pola Past Perfect Continuous yang benar adalah…", options:["had been + V-ing","had + V3","was + V-ing","would have + V3"], answer:0, explain:"S + had been + V-ing." }
    ]
  },
  "09": {
    name: "Simple Future Tense",
    file: "09-simple-future-tense.html",
    questions: [
      { type:"fill", q:"I ___ (call) you tomorrow.", answers:["will call"], explain:"will + V1 (call)." },
      { type:"mc", q:"She will ___ the project next week.", options:["finishes","finished","finish","finishing"], answer:2, explain:"Setelah will, verb kembali ke V1." },
      { type:"fill", q:"They ___ (not/come) tomorrow.", answers:["will not come","wont come"], explain:"will not + V1 (come)." },
      { type:"mc", q:"Contraction dari 'will not' adalah…", options:["willn't","won't","wo not","will'nt"], answer:1, explain:"will not → won't." },
      { type:"fill", q:"We ___ (help) you with the homework.", answers:["will help"], explain:"will + V1 (help)." },
      { type:"mc", q:"Time signal khas Simple Future adalah…", options:["tomorrow","yesterday","already","last year"], answer:0, explain:"tomorrow, next…, soon menandakan Simple Future." }
    ]
  },
  "10": {
    name: "Future Continuous Tense",
    file: "10-future-continuous-tense.html",
    questions: [
      { type:"fill", q:"This time tomorrow, I ___ (fly) to Bali.", answers:["will be flying"], explain:"will be + V-ing." },
      { type:"mc", q:"At 8 PM, they ___ watching a movie.", options:["will watch","will be watching","are watching","will watched"], answer:1, explain:"will be + V-ing → will be watching." },
      { type:"fill", q:"She ___ (work) all day tomorrow.", answers:["will be working"], explain:"will be + V-ing." },
      { type:"mc", q:"Pilih kalimat yang BENAR.", options:["I will be study.","I will be studying.","I will studying.","I be studying."], answer:1, explain:"will be + V-ing → will be studying." },
      { type:"fill", q:"We ___ (wait) for you at noon.", answers:["will be waiting"], explain:"will be + V-ing." },
      { type:"mc", q:"Pola Future Continuous yang benar adalah…", options:["will + V1","will be + V-ing","will have + V3","would + V1"], answer:1, explain:"S + will be + V-ing." }
    ]
  },
  "11": {
    name: "Future Perfect Tense",
    file: "11-future-perfect-tense.html",
    questions: [
      { type:"fill", q:"By 2030, I ___ (graduate) from university.", answers:["will have graduated"], explain:"will have + V3 (graduated)." },
      { type:"mc", q:"By next month, she ___ finished the book.", options:["will","will have","would","has"], answer:1, explain:"will have + V3." },
      { type:"fill", q:"They ___ (build) the bridge by next year.", answers:["will have built"], explain:"build – built – built → will have built." },
      { type:"mc", q:"Bentuk V3 dari 'do' adalah…", options:["did","done","doing","does"], answer:1, explain:"do – did – done." },
      { type:"fill", q:"By tonight, we ___ (finish) the project.", answers:["will have finished"], explain:"will have + V3 (finished)." },
      { type:"mc", q:"Time signal khas Future Perfect adalah…", options:["by + waktu (mis. by 2030)","right now","yesterday","while"], answer:0, explain:"by + titik waktu masa depan menandakan Future Perfect." }
    ]
  },
  "12": {
    name: "Future Perfect Continuous Tense",
    file: "12-future-perfect-continuous-tense.html",
    questions: [
      { type:"fill", q:"By next year, I ___ (work) here for ten years.", answers:["will have been working"], explain:"will have been + V-ing." },
      { type:"mc", q:"By 5 PM, they ___ been studying for six hours.", options:["will","will have","would have","have"], answer:1, explain:"will have been + V-ing." },
      { type:"fill", q:"She ___ (teach) for 20 years by 2030.", answers:["will have been teaching"], explain:"will have been + V-ing." },
      { type:"mc", q:"Urutan pola yang BENAR adalah…", options:["will have been + V-ing","will have + V3","will be + V-ing","will been + V-ing"], answer:0, explain:"S + will have been + V-ing." },
      { type:"fill", q:"By midnight, we ___ (drive) for eight hours.", answers:["will have been driving"], explain:"will have been + V-ing." },
      { type:"mc", q:"Tense ini menekankan…", options:["durasi aksi hingga satu titik di masa depan","kebiasaan sekarang","aksi yang sudah selesai kemarin","fakta umum"], answer:0, explain:"Menekankan lamanya (durasi) aksi sampai titik waktu di masa depan." }
    ]
  },
  "13": {
    name: "Past Future Tense",
    file: "13-past-future-tense.html",
    questions: [
      { type:"fill", q:"He said he ___ (help) me.", answers:["would help"], explain:"would + V1 (help)." },
      { type:"mc", q:"She promised she ___ come.", options:["will","would","would have","was"], answer:1, explain:"Masa depan dilihat dari masa lampau → would + V1." },
      { type:"fill", q:"They told me they ___ (call) later.", answers:["would call"], explain:"would + V1 (call)." },
      { type:"mc", q:"I knew you ___ understand.", options:["will","would","would be","are"], answer:1, explain:"would + V1 (understand)." },
      { type:"fill", q:"We thought it ___ (rain) that day.", answers:["would rain"], explain:"would + V1 (rain)." },
      { type:"mc", q:"Past Future dipakai untuk…", options:["masa depan dilihat dari masa lampau","kebiasaan saat ini","aksi yang selesai di masa lampau","aksi yang sedang terjadi sekarang"], answer:0, explain:"Menyatakan rencana/masa depan dari sudut pandang masa lampau." }
    ]
  },
  "14": {
    name: "Past Future Continuous Tense",
    file: "14-past-future-continuous-tense.html",
    questions: [
      { type:"fill", q:"He said he ___ (wait) for me at noon.", answers:["would be waiting"], explain:"would be + V-ing." },
      { type:"mc", q:"She told me she ___ working at that time.", options:["would","would be","will be","was"], answer:1, explain:"would be + V-ing." },
      { type:"fill", q:"They said they ___ (travel) the next day.", answers:["would be traveling","would be travelling"], explain:"would be + V-ing." },
      { type:"mc", q:"Pilih kalimat yang BENAR.", options:["He would be sleep.","He would be sleeping.","He would sleeping.","He will be sleeping."], answer:1, explain:"would be + V-ing → would be sleeping." },
      { type:"fill", q:"I thought you ___ (study) at this time.", answers:["would be studying"], explain:"would be + V-ing." },
      { type:"mc", q:"Pola Past Future Continuous yang benar adalah…", options:["would be + V-ing","would + V1","would have + V3","will be + V-ing"], answer:0, explain:"S + would be + V-ing." }
    ]
  },
  "15": {
    name: "Past Future Perfect Tense",
    file: "15-past-future-perfect-tense.html",
    questions: [
      { type:"fill", q:"If I had studied, I ___ (pass) the exam.", answers:["would have passed"], explain:"would have + V3 (passed)." },
      { type:"mc", q:"She said she ___ finished by then.", options:["would","would have","will have","had"], answer:1, explain:"would have + V3." },
      { type:"fill", q:"He said they ___ (leave) before we arrived.", answers:["would have left"], explain:"would have + V3 (left)." },
      { type:"mc", q:"Bentuk V3 dari 'see' adalah…", options:["saw","seen","see","seeing"], answer:1, explain:"see – saw – seen." },
      { type:"fill", q:"By that time, we ___ (complete) the task.", answers:["would have completed"], explain:"would have + V3 (completed)." },
      { type:"mc", q:"Tense ini sering muncul pada…", options:["conditional ke-3 / pengandaian masa lampau","rutinitas harian","aksi yang sedang terjadi sekarang","simple future biasa"], answer:0, explain:"Umum dipakai pada third conditional (andai… pasti sudah…)." }
    ]
  },
  "16": {
    name: "Past Future Perfect Continuous Tense",
    file: "16-past-future-perfect-continuous-tense.html",
    questions: [
      { type:"fill", q:"By then, I ___ (work) for five years.", answers:["would have been working"], explain:"would have been + V-ing." },
      { type:"mc", q:"She said she ___ been waiting for hours.", options:["would","would have","will have","had"], answer:1, explain:"would have been + V-ing." },
      { type:"fill", q:"They ___ (study) for hours by that time.", answers:["would have been studying"], explain:"would have been + V-ing." },
      { type:"mc", q:"Urutan pola yang BENAR adalah…", options:["would have been + V-ing","would have + V3","would be + V-ing","will have been + V-ing"], answer:0, explain:"S + would have been + V-ing." },
      { type:"fill", q:"By midnight, we ___ (drive) for ten hours.", answers:["would have been driving"], explain:"would have been + V-ing." },
      { type:"mc", q:"Tense ini menyatakan…", options:["durasi aksi hingga satu titik di masa-depan-lampau","satu peristiwa singkat di masa lampau","kebiasaan sekarang","sebuah fakta"], answer:0, explain:"Durasi aksi sampai titik 'masa depan' yang dilihat dari masa lampau." }
    ]
  }
};

// Kuis campuran — tebak tense dari sebuah kalimat.
const MIX_QUIZ = [
  { q:"She walks to school every day.", options:["Simple Present","Present Continuous","Simple Past","Present Perfect"], answer:0, explain:"V1+-s + 'every day' → Simple Present." },
  { q:"They are watching a movie now.", options:["Simple Present","Present Continuous","Past Continuous","Future Continuous"], answer:1, explain:"are + V-ing + 'now' → Present Continuous." },
  { q:"I have finished my homework.", options:["Simple Past","Present Perfect","Past Perfect","Present Perfect Continuous"], answer:1, explain:"have + V3 → Present Perfect." },
  { q:"He has been running for an hour.", options:["Present Perfect","Present Perfect Continuous","Past Perfect Continuous","Present Continuous"], answer:1, explain:"has been + V-ing + 'for' → Present Perfect Continuous." },
  { q:"We visited Bali last year.", options:["Simple Present","Simple Past","Present Perfect","Past Continuous"], answer:1, explain:"V2 + 'last year' → Simple Past." },
  { q:"I was sleeping when you called.", options:["Simple Past","Past Continuous","Past Perfect","Present Continuous"], answer:1, explain:"was + V-ing → Past Continuous." },
  { q:"The train had left before we arrived.", options:["Simple Past","Past Perfect","Past Perfect Continuous","Present Perfect"], answer:1, explain:"had + V3 → Past Perfect." },
  { q:"She had been waiting for an hour.", options:["Past Perfect","Past Perfect Continuous","Present Perfect Continuous","Past Continuous"], answer:1, explain:"had been + V-ing → Past Perfect Continuous." },
  { q:"I will call you tomorrow.", options:["Simple Future","Future Continuous","Past Future","Simple Present"], answer:0, explain:"will + V1 + 'tomorrow' → Simple Future." },
  { q:"At 8 PM, they will be studying.", options:["Simple Future","Future Continuous","Future Perfect","Past Future Continuous"], answer:1, explain:"will be + V-ing → Future Continuous." },
  { q:"By 2030, she will have graduated.", options:["Simple Future","Future Perfect","Future Perfect Continuous","Past Future Perfect"], answer:1, explain:"will have + V3 + 'by 2030' → Future Perfect." },
  { q:"By next year, I will have been working here for ten years.", options:["Future Perfect","Future Perfect Continuous","Past Future Perfect Continuous","Future Continuous"], answer:1, explain:"will have been + V-ing → Future Perfect Continuous." },
  { q:"He said he would help me.", options:["Simple Future","Past Future","Past Future Continuous","Simple Past"], answer:1, explain:"would + V1 (dilihat dari masa lampau) → Past Future." },
  { q:"She told me she would be working then.", options:["Past Future","Past Future Continuous","Future Continuous","Past Continuous"], answer:1, explain:"would be + V-ing → Past Future Continuous." },
  { q:"If I had studied, I would have passed.", options:["Past Perfect","Past Future Perfect","Future Perfect","Past Future"], answer:1, explain:"would have + V3 → Past Future Perfect." },
  { q:"By then, they would have been living there for years.", options:["Past Future Perfect","Past Future Perfect Continuous","Future Perfect Continuous","Past Perfect Continuous"], answer:1, explain:"would have been + V-ing → Past Future Perfect Continuous." },
  { q:"The sun rises in the east.", options:["Simple Present","Present Continuous","Simple Future","Present Perfect"], answer:0, explain:"Fakta umum, V1+-s → Simple Present." },
  { q:"They have lived here since 2010.", options:["Simple Past","Present Perfect","Present Perfect Continuous","Past Perfect"], answer:1, explain:"have + V3 + 'since' → Present Perfect." },
  { q:"I will be waiting at noon.", options:["Simple Future","Future Continuous","Future Perfect","Present Continuous"], answer:1, explain:"will be + V-ing → Future Continuous." },
  { q:"We had eaten before they came.", options:["Simple Past","Past Perfect","Past Perfect Continuous","Present Perfect"], answer:1, explain:"had + V3 → Past Perfect." }
];

if (typeof window !== 'undefined') {
  window.TENSE_QUIZZES = TENSE_QUIZZES;
  window.MIX_QUIZ = MIX_QUIZ;
}
