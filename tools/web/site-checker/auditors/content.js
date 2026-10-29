/**
 * Content Quality Auditor for site-checker
 * Focuses on Readability, Word Count, and Filler Words (Arabic & English Optimized)
 */

export const ARABIC_STOPWORDS = [
    'من', 'إلى', 'عن', 'على', 'في', 'مع', 'هذا', 'هذه', 'تم', 'كان', 'يكون',
    'التي', 'الذي', 'الذين', 'هناك', 'كل', 'بعد', 'قبل', 'عند', 'حيث', 'بين',
    'إذا', 'لو', 'قد', 'لقد', 'بشكل', 'طريقة', 'جداً', 'أنه', 'أنها', 'انهم',
    'ذلك', 'تلك', 'هؤلاء', 'أو', 'ثم', 'بل', 'حتى', 'منذ', 'خلا', 'عدا',
    'حاشا', 'رب', 'مذ', 'كي', 'لعل', 'ليت', 'كأن', 'لكن', 'إن', 'أن',
    'كما', 'أيضا', 'أيضاً', 'فقط', 'دون', 'بدون', 'خلال', 'عبر', 'نحو', 'لدى'
];

export const ENGLISH_STOPWORDS = [
    'the', 'and', 'for', 'that', 'this', 'with', 'from', 'your', 'have', 'more',
    'will', 'home', 'about', 'page', 'into', 'other', 'time', 'they', 'what',
    'which', 'their', 'there', 'been', 'were', 'when', 'where', 'some', 'over',
    'Also', 'also', 'just', 'like', 'than', 'then', 'them', 'these', 'those'
];

/**
 * Extracts visible human-readable text from a parsed DOM document,
 * stripping out non-content tags like <script>, <style>, <svg>, etc.
 */
export function extractCleanText(doc) {
    if (!doc || !doc.body) return '';
    const clone = doc.body.cloneNode(true);
    clone.querySelectorAll('script, style, noscript, svg, template, iframe, canvas').forEach(el => el.remove());
    return (clone.textContent || '').replace(/\s+/g, ' ').trim();
}

export function checkContentQuality(doc) {
    const text = extractCleanText(doc);
    const words = text ? text.split(/\s+/).filter(w => w.length > 1) : [];
    const wordCount = words.length;

    const sentences = text
        ? text.split(/[.!?\u060C\u061F\n]+/).filter(s => s.trim().length > 5)
        : [];
    const sentenceCount = Math.max(1, sentences.length);

    const avgSentenceLength = wordCount > 0 ? (wordCount / sentenceCount) : 0;

    // Arabic & Multilingual Readability Approximation
    const totalChars = words.join('').length;
    const avgCharsPerWord = wordCount > 0 ? (totalChars / wordCount) : 0;
    const readabilityScore = wordCount > 0
        ? Math.max(0, Math.min(100, 206.835 - (1.015 * avgSentenceLength) - (20 * avgCharsPerWord)))
        : 0;

    // Detect Filler Words
    const fillerWords = words.filter(w => {
        const cleanW = w.replace(/[^\u0600-\u06FFa-zA-Z]/g, '').toLowerCase();
        return ARABIC_STOPWORDS.includes(cleanW) || ENGLISH_STOPWORDS.includes(cleanW);
    });
    const fillerPercentage = wordCount > 0 ? ((fillerWords.length / wordCount) * 100) : 0;

    const results = [];

    // 1. Thin Content Check
    results.push({
        title: 'كثافة المحتوى (Word Count)',
        value: `${wordCount} كلمة`,
        status: wordCount >= 600 ? 'pass' : (wordCount >= 250 ? 'warn' : 'fail'),
        weight: 15,
        priority: wordCount < 250 ? 'critical' : 'moderate',
        msg: wordCount < 250
            ? 'المحتوى النصي قليل جداً (Thin Content). محركات البحث تفضل الصفحات الغنية بالمعلومات (300 إلى 600+ كلمة).'
            : (wordCount < 600
                ? 'كمية المحتوى مقبولة، ولكن التوسع بأكثر من 600 كلمة يعزز فرص تصدر نتائج البحث التنافسية.'
                : 'محتوى الصفحة غني وشامل ويلبي معايير التعمق الموضوعي.'),
        meta: { current: wordCount, target: 600 }
    });

    // 2. Readability Check
    results.push({
        title: 'سهولة القراءة (Readability)',
        value: wordCount > 0 ? `${readabilityScore.toFixed(1)}/100` : 'غير متاح (لا يوجد نص)',
        status: wordCount === 0 ? 'fail' : (readabilityScore >= 60 ? 'pass' : (readabilityScore >= 40 ? 'warn' : 'fail')),
        weight: 10,
        priority: 'moderate',
        msg: wordCount === 0
            ? 'لم يتم العثور على محتوى نصي كافٍ لحساب سهولة القراءة.'
            : (readabilityScore >= 60
                ? 'المحتوى سهل القراءة ومقسم إلى جمل متوازنة ومريحة للزوار.'
                : 'الجمل تبدو طويلة أو مركبة. حاول تقسيم الفقرات واستخدام جمل أقصر لتحسين تجربة القراءة.')
    });

    // 3. Filler Words Check
    results.push({
        title: 'الكلمات الحشوية (Filler Words)',
        value: `${fillerPercentage.toFixed(1)}%`,
        status: fillerPercentage <= 18 ? 'pass' : 'warn',
        weight: 5,
        priority: 'minor',
        msg: fillerPercentage <= 18
            ? 'نسبة حروف الجر والكلمات الوظيفية متوازنة وطبيعية.'
            : 'المحتوى يحتوي على نسبة مرتفعة من الكلمات الحشوية (من، في، إلى، هذا...). ركز على الكلمات المفتاحية والمصطلحات الدلالية.'
    });

    return results;
}

export function updateContentDashboard(doc) {
    const text = extractCleanText(doc);
    const words = text ? text.split(/\s+/).filter(w => w.length > 1) : [];
    const sentences = text
        ? text.split(/[.!?\u060C\u061F\n]+/).filter(s => s.trim().length > 5)
        : [];

    const container = document.getElementById('content-quality-stats');
    if (!container) return;

    const avgSentence = words.length > 0 ? (words.length / Math.max(1, sentences.length)).toFixed(1) : '0.0';
    const avgWordLen = words.length > 0 ? (words.join('').length / words.length).toFixed(1) : '0.0';
    const readingTime = words.length > 0 ? Math.max(1, Math.ceil(words.length / 200)) : 0;

    container.innerHTML = `
        <div class="row g-3 mb-4">
            <div class="col-md-4">
                <div class="stat-box p-3 rounded-4 bg-white border text-center">
                    <span class="small text-muted d-block mb-1">متوسط طول الجملة</span>
                    <span class="h4 fw-800 text-primary">${avgSentence}</span>
                    <span class="small text-muted">كلمة/جملة</span>
                </div>
            </div>
            <div class="col-md-4">
                <div class="stat-box p-3 rounded-4 bg-white border text-center">
                    <span class="small text-muted d-block mb-1">متوسط طول الكلمة</span>
                    <span class="h4 fw-800 text-primary">${avgWordLen}</span>
                    <span class="small text-muted">حرف/كلمة</span>
                </div>
            </div>
            <div class="col-md-4">
                <div class="stat-box p-3 rounded-4 bg-white border text-center">
                    <span class="small text-muted d-block mb-1">زمن القراءة المتوقع</span>
                    <span class="h4 fw-800 text-primary">${readingTime}</span>
                    <span class="small text-muted">دقيقة</span>
                </div>
            </div>
        </div>
    `;
}
