/**
 * Content Quality Auditor for site-checker
 * Focuses on Readability, Word Count, and Filler Words (Arabic Optimized)
 */

const ARABIC_STOPWORDS = [
    'من', 'إلى', 'عن', 'على', 'في', 'مع', 'هذا', 'هذه', 'تم', 'كان', 'يكون',
    'التي', 'الذي', 'الذين', 'هناك', 'كل', 'بعد', 'قبل', 'عند', 'حيث', 'بين',
    'إذا', 'لو', 'قد', 'لقد', 'بشكل', 'طريقة', 'جداً', 'أنه', 'أنها', 'انهم'
];

export function checkContentQuality(doc) {
    const text = doc.body ? doc.body.innerText : '';
    const words = text.trim().split(/\s+/).filter(w => w.length > 1);
    const wordCount = words.length;

    const sentences = text.split(/[.!?\u060C\u061F]+/).filter(s => s.trim().length > 5);
    const sentenceCount = sentences.length || 1;

    const avgSentenceLength = wordCount / sentenceCount;

    // Simple Arabic Readability Approximation (Simplified Flesch-Kincaid)
    // Formula: 206.835 - 1.015 * (total words / total sentences) - 84.6 * (total syllables / total words)
    // For Arabic, we use char-based syllable approximation: avg_chars_per_word / 2
    const avgCharsPerWord = words.join('').length / wordCount;
    const readabilityScore = Math.max(0, Math.min(100, 206.835 - (1.015 * avgSentenceLength) - (20 * avgCharsPerWord)));

    // Detect Filler Words
    const fillerWords = words.filter(w => ARABIC_STOPWORDS.includes(w));
    const fillerPercentage = (fillerWords.length / wordCount) * 100;

    const results = [];

    // 1. Thin Content Check
    results.push({
        title: 'كثافة المحتوى (Word Count)',
        value: `${wordCount} كلمة`,
        status: wordCount > 600 ? 'pass' : (wordCount > 300 ? 'warn' : 'fail'),
        weight: 15,
        priority: wordCount < 300 ? 'critical' : 'moderate',
        msg: wordCount < 300 ? 'المحتوى ضعيف جداً (Thin Content). محركات البحث تفضل الصفحات التي تحتوي على أكثر من 600 كلمة غنية بالمعلومات.' : 'كمية المحتوى جيدة ولكن يمكن التوسع أكثر للفوز بالمنافسة.',
        meta: { current: wordCount, target: 600 }
    });

    // 2. Readability Check
    results.push({
        title: 'سهولة القراءة (Readability)',
        value: `${readabilityScore.toFixed(1)}/100`,
        status: readabilityScore > 60 ? 'pass' : (readabilityScore > 40 ? 'warn' : 'fail'),
        weight: 10,
        priority: 'moderate',
        msg: readabilityScore > 60 ? 'المحتوى سهل القراءة ومنظم بشكل جيد للزوار.' : 'الجمل تبدو طويلة أو معقدة. حاول استخدام جمل أقصر وتقليل الكلمات الصعبة لتحسين تجربة المستخدم.'
    });

    // 3. Filler Words Check
    results.push({
        title: 'الكلمات الحشوية (Filler Words)',
        value: `${fillerPercentage.toFixed(1)}%`,
        status: fillerPercentage < 15 ? 'pass' : 'warn',
        weight: 5,
        priority: 'minor',
        msg: fillerPercentage < 15 ? 'نسبة الكلمات الوظيفية متوازنة.' : 'المحتوى يحتوي على الكثير من الكلمات الحشوية (من، في، إلى، تم...). حاول التركيز على الكلمات المفتاحية والمعلومات المباشرة.'
    });

    return results;
}

export function updateContentDashboard(doc) {
    const text = doc.body ? doc.body.innerText : '';
    const words = text.trim().split(/\s+/).filter(w => w.length > 1);
    const sentences = text.split(/[.!?\u060C\u061F]+/).filter(s => s.trim().length > 5);

    const container = document.getElementById('content-quality-stats');
    if (!container) return;

    container.innerHTML = `
        <div class="row g-3 mb-4">
            <div class="col-md-4">
                <div class="stat-box p-3 rounded-4 bg-white border">
                    <span class="small text-muted d-block">متوسط طول الجملة</span>
                    <span class="h4 fw-800">${(words.length / (sentences.length || 1)).toFixed(1)}</span>
                    <span class="small">كلمة/جملة</span>
                </div>
            </div>
            <div class="col-md-4">
                <div class="stat-box p-3 rounded-4 bg-white border">
                    <span class="small text-muted d-block">تعقيد المفردات</span>
                    <span class="h4 fw-800">${(words.join('').length / words.length).toFixed(1)}</span>
                    <span class="small">حرف/كلمة</span>
                </div>
            </div>
            <div class="col-md-4">
                <div class="stat-box p-3 rounded-4 bg-white border">
                    <span class="small text-muted d-block">زمن القراءة المتوقع</span>
                    <span class="h4 fw-800">${Math.ceil(words.length / 200)}</span>
                    <span class="small">دقيقة</span>
                </div>
            </div>
        </div>
    `;
}
