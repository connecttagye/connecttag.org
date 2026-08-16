const emergencyData = [
    // الطوارئ المركزية
    { id: 1, name: "النجدة", number: "199", category: "emergency", icon: "fa-shield-halved", desc: "خدمات الطوارئ والشرطة" },
    { id: 2, name: "الإسعاف", number: "191", category: "emergency", icon: "fa-ambulance", desc: "الإسعاف المركزي والطوارئ الطبية" },
    { id: 3, name: "الدفاع المدني", number: "125", category: "emergency", icon: "fa-fire-extinguisher", desc: "إطفاء الحرائق والإنقاذ" },
    { id: 4, name: "المرور", number: "194", category: "emergency", icon: "fa-car-side", desc: "حوادث السير والبلاغات المرورية" },
    { id: 5, name: "حرس السواحل", number: "191", category: "emergency", icon: "fa-ship", desc: "طوارئ البحر والإنقاذ البحري" },

    // الاتصالات والإنترنت
    { id: 10, name: "يمن موبايل - خدمة العملاء", number: "121", category: "telecom", icon: "fa-mobile-screen", desc: "دعم مشتركين يمن موبايل" },
    { id: 11, name: "يو YOU - خدمة العملاء", number: "111", category: "telecom", icon: "fa-mobile-screen", desc: "دعم مشتركين يو" },
    { id: 12, name: "سبأفون - خدمة العملاء", number: "211", category: "telecom", icon: "fa-mobile-screen", desc: "دعم مشتركين سبأفون" },
    { id: 13, name: "واي WAY - خدمة العملاء", number: "444", category: "telecom", icon: "fa-mobile-screen", desc: "دعم مشتركين واي" },
    { id: 14, name: "يمن نت - الدعم الفني ADSL", number: "8000000", category: "telecom", icon: "fa-network-wired", desc: "مشاكل الإنترنت الأرضي" },
    { id: 15, name: "المؤسسة العامة للاتصالات", number: "01250001", category: "telecom", icon: "fa-building", desc: "المركز الرئيسي للاتصالات" },

    // المرافق العامة
    { id: 20, name: "طوارئ الكهرباء", number: "136", category: "utilities", icon: "fa-bolt", desc: "بلاغات انقطاع التيار الكهربائي" },
    { id: 21, name: "طوارئ المياه", number: "171", category: "utilities", icon: "fa-faucet-drip", desc: "بلاغات انقطاع المياه والصرف الصحي" },
    { id: 22, name: "صندوق النظافة", number: "175", category: "utilities", icon: "fa-trash-can", desc: "بلاغات النظافة والتحسين" },

    // البنوك والمصارف
    { id: 30, name: "بنك الكريمي", number: "8008800", category: "banks", icon: "fa-building-columns", desc: "خدمة العملاء وبطائق الصراف" },
    { id: 31, name: "بنك التضامن", number: "8001010", category: "banks", icon: "fa-building-columns", desc: "خدمة العملاء المصرفية" },
    { id: 32, name: "بنك اليمن والبحرين الشامل", number: "8000005", category: "banks", icon: "fa-building-columns", desc: "دعم العملاء" },
    { id: 33, name: "كاك بنك - التسليف الزراعي", number: "8002222", category: "banks", icon: "fa-building-columns", desc: "خدمة العملاء" },

    // الوزارات والمؤسسات
    { id: 40, name: "وزارة الداخلية - شكاوى", number: "199", category: "ministries", icon: "fa-user-shield", desc: "مركز شكاوى المواطنين" },
    { id: 41, name: "وزارة التربية - نتائج الطلاب", number: "160", category: "ministries", icon: "fa-graduation-cap", desc: "الاستعلام عن النتائج (للجوال)" },
    { id: 42, name: "وزارة الصحة", number: "01252213", category: "ministries", icon: "fa-house-medical", desc: "مركز المعلومات والبلاغات" },
    { id: 43, name: "الهيئة العامة للطيران", number: "01272647", category: "ministries", icon: "fa-plane", desc: "معلومات الرحلات والمطارات" },

    // خدمات النقل والبريد
    { id: 50, name: "مطار صنعاء الدولي", number: "01331911", category: "transport", icon: "fa-plane-arrival", desc: "استعلامات المطار" },
    { id: 51, name: "مطار عدن الدولي", number: "02231151", category: "transport", icon: "fa-plane-arrival", desc: "استعلامات المطار" },
    { id: 52, name: "الهيئة العامة للبريد", number: "01271140", category: "transport", icon: "fa-envelope", desc: "خدمات البريد والتوفير" },
];

export default emergencyData;
