import type { SharhPatternType } from '../types/book';

export type InlineTokenKind =
  | 'quran'
  | 'hadith'
  | 'matnQuote'
  | 'refutation'
  | 'creedRule'
  | 'division'
  | 'illustration'
  | 'matnSects'
  | 'matnCreed'
  | 'matnParen'
  | 'plain';

export interface InlineToken {
  text: string;
  kind: InlineTokenKind;
}

export interface PatternMeta {
  id: SharhPatternType;
  label: string;
  description: string;
  lightClass: string;
  darkClass: string;
  swatchClass: string;
}

export const SHARH_PATTERNS: PatternMeta[] = [
  {
    id: 'quran',
    label: 'استدلال قرآني',
    description: 'الآيات الكريمة بخط المصحف العثماني حفص',
    lightClass: 'text-[#14532D] bg-[#ECFDF5] px-1 rounded',
    darkClass: 'dark:text-[#6EE7B7] dark:bg-[#064E3B]/45',
    swatchClass: 'bg-[#14532D] dark:bg-[#6EE7B7]',
  },
  {
    id: 'hadith',
    label: 'حديث أو أثر سلف',
    description: 'الأحاديث النبوية وأقوال الصحابة والأئمة',
    lightClass: 'text-[#92400E] bg-[#FEF3C7]/60 px-1 rounded',
    darkClass: 'dark:text-[#FCD34D] dark:bg-[#78350F]/35',
    swatchClass: 'bg-[#B45309] dark:bg-[#FCD34D]',
  },
  {
    id: 'matnQuote',
    label: 'عبارة المتن المشروح',
    description: 'نصوص المصنف المقتبسة أثناء الشرح',
    lightClass: 'text-[#6B4423] bg-[#F5EFE0] px-1 rounded font-semibold',
    darkClass: 'dark:text-[#E5B887] dark:bg-[#2A2218]',
    swatchClass: 'bg-[#8B5E34] dark:bg-[#E5B887]',
  },
  {
    id: 'creedRule',
    label: 'تقرير عقيدة وتأصيل',
    description: 'مذهب أهل السنة والضوابط والقواعد العقدية',
    lightClass: 'text-[#1E3A8A]',
    darkClass: 'dark:text-[#93C5FD]',
    swatchClass: 'bg-[#1E3A8A] dark:bg-[#93C5FD]',
  },
  {
    id: 'refutation',
    label: 'نقل ونقد المخالفين',
    description: 'أقوال الفرق المخالفة وشبهاتهم والرد عليها',
    lightClass: 'text-[#881337]',
    darkClass: 'dark:text-[#FDA4AF]',
    swatchClass: 'bg-[#881337] dark:bg-[#FDA4AF]',
  },
  {
    id: 'division',
    label: 'تقسيم وحصر ومراتب',
    description: 'التفريعات العلمية والأقسام والمراتب والشروط',
    lightClass: 'text-[#5B21B6]',
    darkClass: 'dark:text-[#C4B5FD]',
    swatchClass: 'bg-[#5B21B6] dark:bg-[#C4B5FD]',
  },
  {
    id: 'illustration',
    label: 'تمثيل وتقريب لغوي',
    description: 'الأمثلة التوضيحية والتفسير اللغوي أو العامي',
    lightClass: 'text-[#0F766E]',
    darkClass: 'dark:text-[#5EEAD4]',
    swatchClass: 'bg-[#0F766E] dark:bg-[#5EEAD4]',
  },
];

const SECT_KEYWORDS =
  /(الجهمية|المعتزلة|الأشاعرة|الأشعرية|الماتريدية|المرجئة|الحرورية|الخوارج|الرافضة|الشيعة|النواصب|الناصبة|القدرية|الجبرية|المشبهة|الممثلة|الباطنية|القرامطة|الفلاسفة|الحلولية|الاتحادية|الكرامية|الكلابية|المفوضة|المعطلة|الإباضية|الزيدية|الاثنا عشرية|الإسماعيلية|الدروز|النصيرية|البهائية|الشبهة|التأويل الباطل|تحريف|تعطيل|باطل قطعاً|كلام منكر|كلام فاسد|خالفوا|أنكروا|يكفرون|كفروا|مرقوا|مجوس هذه الأمة)/;

const HADITH_KEYWORDS =
  /(قال رسول الله|قال النبي|عليه الصلاة والسلام|ﷺ|صلى الله عليه وسلم|حديث|رواه البخاري|رواه مسلم|متفق عليه|رواه الترمذي|رواه أحمد|رواه أبو داود|قال ابن عباس|قال الإمام مالك|قال الإمام أحمد|قال الشافعي|قال البخاري|قال عمر بن عبد العزيز|قال شيخ الإسلام|قال ابن عمر)/;

const CREED_RULE_KEYWORDS =
  /(أهل السنة|الفرقة الناجية|الطائفة المنصورة|الصحيح|الراجح|الواجب|القاعدة|الضابط|أصل الإيمان|الإيمان الواجب|الإيمان المستحب|مراتب القدر|التوحيد العلمي|التوحيد العملي|الكتاب والسنة|إثباتاً بلا تكييف|تنزيهاً بلا تحريف|نفي التمثيل|الوسط في)/;

const DIVISION_KEYWORDS =
  /(أولاً|ثانياً|ثالثاً|رابعاً|خامساً|المرتبة الأولى|المرتبة الثانية|المرتبة الثالثة|المرتبة الرابعة|قسمين|ثلاثة أقسام|أربعة أقسام|خمسة أقسام|نوعين|طريقتين|أربعة أمور|شروط|أركان الإيمان|نواقض)/;

const ILLUSTRATION_KEYWORDS =
  /(مثلاً|مثال|كالخشبة|كالورقة|كالريشة|الأب والأم|دايرة|الدائرتين|الكونترول|التلميذ|يعني|المراد|المقصود|في اللغة|الاستعمال العربي|المحجة =|التشريد =|التكفير|الفرق بين)/;

const MATN_CREED_KEYWORDS =
  /(لَا إِلَهَ إِلَّا اللَّهُ|وَحْدَهُ لَا شَرِيكَ لَهُ|التَّوْحِيدِ|أَهْلِ السُّنَّةِ وَالْجَمَاعَةِ|الْفِرْقَةَ النَّاجِيَةَ|الطَّائِفَةُ الْمَنْصُورَةُ|الْمَحَجَّةِ الْبَيْضَاءِ|الشَّرِيعَةُ الْغَرَّاءُ|إِثْبَاتًا بِلَا تَكْيِيفٍ وَلَا تَمْثِيلٍ|وَتَنْزِيهًا بِلَا تَحْرِيفٍ وَلَا تَعْطِيلٍ|الصِّرَاطِ الْمُسْتَقِيمِ|كِتَابِهِ|سُنَّتِهِ|وَالْآخِرَةِ|الْحَكِيمُ الْخَبِيرُ|الْعَلِيُّ الْكَبِيرُ)/;

const MATN_SECT_KEYWORDS =
  /(الْجَهْمِيَّةِ|لِلْجَهْمِيَّةِ|الْمُعْتَزِلَةِ|لِلْمُعْتَزِلَةِ|الْأَشَاعِرَةِ|لِلْأَشَاعِرَةِ|الْمُرْجِئَةِ|لِلْمُرْجِئَةِ|الْحَرُورِيَّةِ|الْخَوَارِجِ|الرَّافِضَةِ|الْقَدَرِيَّةِ|الْجَبْرِيَّةِ|الْمُشَبِّهَةِ|الْمُمَثِّلَةِ|الْوَعِيدِيَّةِ|الشِّرْكِ|الْبِدَعِ|الضَّلَالَةِ|النُّفَاةِ|الْمُعَطِّلَةِ)/;

function splitDelimitedSegments(
  input: string,
  regex: RegExp,
  matchedKind: InlineTokenKind,
  fallbackTransform: (plainSegment: string) => InlineToken[]
): InlineToken[] {
  const result: InlineToken[] = [];
  let lastIndex = 0;
  const globalRegex = new RegExp(regex.source, 'g');
  let match: RegExpExecArray | null;

  while ((match = globalRegex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      result.push(...fallbackTransform(input.slice(lastIndex, match.index)));
    }
    result.push({ text: match[0], kind: matchedKind });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < input.length) {
    result.push(...fallbackTransform(input.slice(lastIndex)));
  }
  return result;
}

export function classifySharhClause(clause: string): InlineTokenKind {
  if (/^\s*(قال المصنف|قال الشيخ|يقول\s*:)/.test(clause)) return 'matnQuote';
  if (HADITH_KEYWORDS.test(clause)) return 'hadith';
  if (SECT_KEYWORDS.test(clause)) return 'refutation';
  if (DIVISION_KEYWORDS.test(clause)) return 'division';
  if (CREED_RULE_KEYWORDS.test(clause)) return 'creedRule';
  if (ILLUSTRATION_KEYWORDS.test(clause)) return 'illustration';
  return 'plain';
}

export function tokenizeSharhText(text: string): InlineToken[] {
  // 1. First extract all Quranic verses ﴿...﴾ cleanly so every verse gets KFGQPC Hafs font
  return splitDelimitedSegments(text, /﴿[^﴾]+﴾/g, 'quran', (nonQuran) =>
    // 2. Extract Matn quotes preceded by يقول: or قال المصنف: «...»
    splitDelimitedSegments(
      nonQuran,
      /(?:يقول|قال المصنف[^:]*|قال الشيخ[^:]*):\s*«[^»]+»/g,
      'matnQuote',
      (segment) =>
        // 3. Extract remaining Hadith/Athar guillemets «...»
        splitDelimitedSegments(segment, /«[^»]+»/g, 'hadith', (plain) => {
          // 4. Split by Arabic/standard sentence delimiters (. ؛ :) keeping punctuation attached
          const clauses = plain.split(/(?<=[.؛])\s+/);
          return clauses
            .filter(Boolean)
            .map((clause, idx) => ({
              text: idx < clauses.length - 1 ? `${clause} ` : clause,
              kind: classifySharhClause(clause),
            }));
        })
    )
  );
}

export function tokenizeMatnText(text: string): InlineToken[] {
  return splitDelimitedSegments(text, /﴿[^﴾]+﴾/g, 'quran', (nonQuran) =>
    splitDelimitedSegments(nonQuran, /—[^—]+—/g, 'matnParen', (core) =>
      splitDelimitedSegments(core, MATN_SECT_KEYWORDS, 'matnSects', (rest) =>
        splitDelimitedSegments(rest, MATN_CREED_KEYWORDS, 'matnCreed', (plain) =>
          plain ? [{ text: plain, kind: 'plain' }] : []
        )
      )
    )
  );
}
