'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw, 
  Plus, 
  Sparkles, 
  History, 
  Settings, 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Music,
  Smartphone,
  Languages,
  MoonStar,
  Info,
  Layers,
  HelpCircle,
  Share2,
  Flame,
  MessageSquare,
  Compass,
  Sliders
} from 'lucide-react';
import { audioService } from '@/lib/audio';
import { ThemePicker } from '@/components/theme-picker';
import { isThemeType, type ThemeType } from '@/lib/themes';

// Supplication Preset Interface
interface DhikrPreset {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  defaultTarget: number;
  description: string;
  benefit?: string;
}

const DEFAULT_PRESETS: DhikrPreset[] = [
  {
    id: 'subhanallah',
    arabic: 'سُبْحَانَ ٱللَّٰهِ',
    transliteration: 'Subhan Allah',
    translation: 'Glory be to Allah',
    defaultTarget: 33,
    description: 'Praising the purity and perfection of Allah, above any imperfection.',
    benefit: 'Wipes away sins, heavy on the scales, plants a tree in Jannah.'
  },
  {
    id: 'alhamdulillah',
    arabic: 'ٱلْحَمْدُ لِلَّٰهِ',
    transliteration: 'Alhamdulillah',
    translation: 'Praise be to Allah',
    defaultTarget: 33,
    description: 'Expressing deep gratitude and complete contentment for all blessings.',
    benefit: 'Fills the scales with reward, increases Allah\'s blessings upon you.'
  },
  {
    id: 'allahuakbar',
    arabic: 'ٱللَّٰهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    translation: 'Allah is the Greatest',
    defaultTarget: 34,
    description: 'Affirming that Allah rises supreme above any trial, worry, or entity.',
    benefit: 'Elevates resolve, removes fear of Dunya, completes the Fatimah tasbih.'
  },
  {
    id: 'astaghfirullah',
    arabic: 'أَسْتَغْفِرُ ٱللَّٰهَ',
    transliteration: 'Astaghfirullah',
    translation: 'I seek forgiveness from Allah',
    defaultTarget: 100,
    description: 'Seeking infinite mercy and forgiveness for shortfalls and negligence.',
    benefit: 'Opens doors of sustenance, brings ease in difficulties, clears the heart.'
  },
  {
    id: 'lailahaillallah',
    arabic: 'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ',
    transliteration: 'La ilaha illallah',
    translation: 'There is no god but Allah',
    defaultTarget: 100,
    description: 'The supreme declaration of absolute monotheism and ultimate truth.',
    benefit: 'The best form of remembrance, keys to Paradise, shields from Hellfire.'
  },
  {
    id: 'salawat',
    arabic: 'ٱللَّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ',
    transliteration: 'Allahumma Salli Ala Muhammad',
    translation: 'O Allah, send peace and blessings upon Muhammad',
    defaultTarget: 100,
    description: 'Expressing love and sending divine benedictions to the Prophet ﷺ.',
    benefit: 'Allah sends blessings 10x back, elevates status, relieves mental distress.'
  },
  {
    id: 'hawqala',
    arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِٱللَّٰهِ',
    transliteration: 'La Hawla wa La Quwwata illa billah',
    translation: 'There is no power nor strength except by Allah',
    defaultTarget: 33,
    description: 'Admitting our weakness and relying completely on Allah\'s supreme agency.',
    benefit: 'A treasure from the treasures of Paradise, cure for anxiety.'
  }
];

interface HistoryLog {
  id: string;
  dhikrName: string;
  arabic: string;
  count: number;
  target: number;
  timestamp: string; // ISO string
}

type SoundStyle = 'mechanical' | 'soft' | 'bubble' | 'bead';
type AmbientType = 'none' | 'rain' | 'breeze' | 'resonance';
type CounterMode = 'tally' | 'bead';
type Language = 'en' | 'ur';

const UI_TEXT = {
  en: {
    appKicker: 'Spiritual Tally Companion',
    appTitle: 'Tasbih Digital Prestige',
    devotionalPresets: 'Devotional Presets',
    languageToggle: 'اردو',
    languageTitle: 'Switch to Urdu',
    addDhikr: 'Add Dhikr',
    active: 'Active',
    custom: 'Custom',
    goal: 'Goal',
    counts: 'counts',
    deleteDevotion: 'Delete devotion',
    merits: 'Authentic Merits',
    aiTitle: 'AI Prayer Customizer',
    aiIntro: 'Share your emotional state or need to craft a tailor-made, authentic remembrance.',
    aiPlaceholder: 'e.g., I am feeling anxious about exams, or I want to thank Allah for a healthy child...',
    aiLoading: 'Seeking Devotion...',
    aiButton: 'Seek AI Remembrance',
    aiBadge: 'Divine Custom Devotion',
    spiritualContext: 'Spiritual Context',
    meritWisdom: 'Hadith / Merit Wisdom',
    recommendedRepeats: 'Recommended repeats',
    times: 'times',
    beginAi: 'Begin AI Devotion',
    previousPreset: 'Previous preset',
    nextPreset: 'Next preset',
    tallyMode: 'Tally Mode',
    beadMode: 'Beads Mode',
    target: 'Target',
    tapOrb: 'Tap Orb to Tally',
    beadTitle: 'Tap or swipe downward to slide bead',
    beadGap: 'Counter Bead Gap',
    slideBeads: 'Slide Beads',
    prayerProgress: 'Prayer Progress',
    goalDone: 'Goal Accomplished!',
    targetMet: (target: number) => `Target of ${target} counts met successfully`,
    resetCount: 'Reset Count',
    nextPresetBtn: 'Next Preset',
    audioSettings: 'Audio Settings',
    clickSound: 'Click Sound',
    soundTally: 'Tally',
    soundSoft: 'Soft',
    soundWater: 'Water',
    soundWood: 'Wood',
    atmosphere: 'Meditative Atmosphere',
    silent: 'Silent',
    rain: 'Rain',
    wind: 'Wind',
    hum: 'Hum',
    volume: 'Volume',
    repetitionGoal: 'Set repetition goal',
    customGoal: 'Set custom goal',
    resetCounter: 'Reset Counter',
    ledger: 'Devotion Ledger',
    clearLogs: 'Clear logs',
    clearLogsTitle: 'Clear ledger logs',
    streak: 'Streak',
    days: 'Days',
    todayCount: "Today's count",
    ledgerEmpty: 'Ledger is clean.',
    ledgerEmptyHint: (target: number) => `Complete a full target of ${target} loops to record the spiritual log.`,
    done: 'Done',
    repeats: 'repeats',
    shareAchievement: 'Share Achievement',
    totalTargets: 'Total targets completed:',
    completed: 'completed',
    createCustom: 'Create Custom Supplication',
    createCustomIntro: 'Add your personal Duas, Salawat, or Tasbih to keep custom tracks of devotions.',
    titleTranslit: 'Title / Transliteration *',
    titlePlaceholder: 'e.g. Subhanallahi wa bihamdihi',
    arabicLettering: 'Arabic Lettering (Optional)',
    translationLabel: 'English Translation (Optional)',
    translationPlaceholder: 'e.g. Glory be to Allah and His is the praise',
    defaultGoal: 'Default Tally Goal *',
    benefitDetail: 'Wisdom Benefit Detail',
    benefitPlaceholder: 'e.g. Clears heart, wipes sins',
    cancel: 'Cancel',
    savePreset: 'Save Preset',
    shareCardTitle: 'Devotional Accomplishment Card',
    remembranceGoalMet: 'Remembrance Goal Met',
    achievedRepetitions: 'Achieved repetitions',
    dailyStreak: 'Daily Streak',
    copied: 'Copied to Clipboard!',
    copyShare: 'Copy Share Card Text',
    closeCard: 'Close Card',
    madeBy: 'Made by Taha',
    muteAudio: 'Mute audio click',
    unmuteAudio: 'Unmute audio click',
    disableHaptics: 'Disable haptics',
    enableHaptics: 'Enable haptics',
    deleteConfirm: 'Are you sure you want to delete this custom Dhikr?',
    clearConfirm: 'Do you want to clear your local completed Dhikr sessions history? This will reset your streak.',
    aiServerError: 'Server error occurred during AI generation',
    aiFallbackError: 'AI is not ready. Add GEMINI_API_KEY in .env.local and restart the app.',
    personalDevotion: 'Personal Devotion',
    personalDescription: 'Personal supplication tally and prayer tracker.',
    themeTab: 'Theme',
    chooseTheme: 'Choose a theme',
    currentTheme: 'Current theme',
    themeSuffix: 'Theme',
    themeNames: {
      emerald: 'Emerald',
      desert: 'Desert',
      shiraz: 'Shiraz',
      alhambra: 'Alhambra',
      ocean: 'Ocean',
      kaaba: 'Kaaba'
    }
  },
  ur: {
    appKicker: 'روحانی تسبیح ساتھی',
    appTitle: 'تسبیح ڈیجیٹل پریسٹیج',
    devotionalPresets: 'ذکر کی فہرست',
    languageToggle: 'EN',
    languageTitle: 'Switch to English',
    addDhikr: 'ذکر شامل کریں',
    active: 'فعال',
    custom: 'ذاتی',
    goal: 'ہدف',
    counts: 'مرتبہ',
    deleteDevotion: 'ذکر حذف کریں',
    merits: 'مستند فضائل',
    aiTitle: 'AI دعا منتخب کریں',
    aiIntro: 'اپنی کیفیت یا ضرورت لکھیں تاکہ مناسب اور با معنی ذکر منتخب ہو سکے۔',
    aiPlaceholder: 'مثلاً: امتحان کی پریشانی ہے، یا اللہ کا شکر ادا کرنا چاہتا ہوں...',
    aiLoading: 'ذکر تلاش ہو رہا ہے...',
    aiButton: 'AI سے ذکر لیں',
    aiBadge: 'خصوصی ذکر',
    spiritualContext: 'روحانی پس منظر',
    meritWisdom: 'حدیث / فضیلت',
    recommendedRepeats: 'تجویز کردہ تعداد',
    times: 'مرتبہ',
    beginAi: 'یہ ذکر شروع کریں',
    previousPreset: 'پچھلا ذکر',
    nextPreset: 'اگلا ذکر',
    tallyMode: 'کاؤنٹر موڈ',
    beadMode: 'تسبیح موڈ',
    target: 'ہدف',
    tapOrb: 'شمار کے لیے دبائیں',
    beadTitle: 'دبائیں یا نیچے سوائپ کریں',
    beadGap: 'دانوں کا وقفہ',
    slideBeads: 'تسبیح دانے',
    prayerProgress: 'ذکر کی پیش رفت',
    goalDone: 'ہدف مکمل!',
    targetMet: (target: number) => `${target} مرتبہ کا ہدف مکمل ہو گیا`,
    resetCount: 'دوبارہ شروع',
    nextPresetBtn: 'اگلا ذکر',
    audioSettings: 'آواز کی سیٹنگز',
    clickSound: 'کلک ساؤنڈ',
    soundTally: 'ٹلی',
    soundSoft: 'نرم',
    soundWater: 'پانی',
    soundWood: 'لکڑی',
    atmosphere: 'روحانی ماحول',
    silent: 'خاموش',
    rain: 'بارش',
    wind: 'ہوا',
    hum: 'ہم',
    volume: 'آواز',
    repetitionGoal: 'ذکر کا ہدف مقرر کریں',
    customGoal: 'اپنا ہدف لکھیں',
    resetCounter: 'کاؤنٹر ری سیٹ کریں',
    ledger: 'ذکر ریکارڈ',
    clearLogs: 'ریکارڈ صاف',
    clearLogsTitle: 'ذکر ریکارڈ صاف کریں',
    streak: 'تسلسل',
    days: 'دن',
    todayCount: 'آج کی تعداد',
    ledgerEmpty: 'ابھی کوئی ریکارڈ نہیں۔',
    ledgerEmptyHint: (target: number) => `${target} مرتبہ مکمل کریں تاکہ ریکارڈ محفوظ ہو۔`,
    done: 'مکمل',
    repeats: 'مرتبہ',
    shareAchievement: 'کامیابی شیئر کریں',
    totalTargets: 'کل مکمل اہداف:',
    completed: 'مکمل',
    createCustom: 'اپنا ذکر شامل کریں',
    createCustomIntro: 'اپنی دعا، درود یا تسبیح شامل کریں اور اسے الگ سے شمار کریں۔',
    titleTranslit: 'عنوان / تلفظ *',
    titlePlaceholder: 'مثلاً Subhanallahi wa bihamdihi',
    arabicLettering: 'عربی عبارت (اختیاری)',
    translationLabel: 'اردو/انگریزی ترجمہ (اختیاری)',
    translationPlaceholder: 'مثلاً اللہ پاک ہے اور اسی کے لیے حمد ہے',
    defaultGoal: 'ابتدائی ہدف *',
    benefitDetail: 'فضیلت یا نوٹ',
    benefitPlaceholder: 'مثلاً دل کو سکون، گناہوں کی معافی',
    cancel: 'منسوخ',
    savePreset: 'محفوظ کریں',
    shareCardTitle: 'ذکر کامیابی کارڈ',
    remembranceGoalMet: 'ذکر کا ہدف مکمل',
    achievedRepetitions: 'مکمل تعداد',
    dailyStreak: 'روزانہ تسلسل',
    copied: 'کاپی ہو گیا!',
    copyShare: 'شیئر ٹیکسٹ کاپی کریں',
    closeCard: 'بند کریں',
    madeBy: 'تیار کردہ: طٰہٰ',
    muteAudio: 'کلک آواز بند کریں',
    unmuteAudio: 'کلک آواز چلائیں',
    disableHaptics: 'وائبریشن بند کریں',
    enableHaptics: 'وائبریشن چلائیں',
    deleteConfirm: 'کیا آپ یہ ذاتی ذکر حذف کرنا چاہتے ہیں؟',
    clearConfirm: 'کیا آپ مکمل ذکر کا مقامی ریکارڈ صاف کرنا چاہتے ہیں؟ اس سے تسلسل بھی ری سیٹ ہو جائے گا۔',
    aiServerError: 'AI ذکر بناتے ہوئے سرور مسئلہ آیا',
    aiFallbackError: 'AI is not ready. Add GEMINI_API_KEY in .env.local and restart the app.',
    personalDevotion: 'ذاتی ذکر',
    personalDescription: 'ذاتی دعا اور ذکر شمار کرنے کا ٹریکر۔',
    themeTab: 'Theme',
    chooseTheme: 'Choose a theme',
    currentTheme: 'Current theme',
    themeSuffix: 'تھیم',
    themeNames: {
      emerald: 'زمرد',
      desert: 'صحرا',
      shiraz: 'شیراز',
      alhambra: 'الحمرا',
      ocean: 'سمندر',
      kaaba: 'کعبہ'
    }
  }
} as const;

const PRESET_URDU: Record<string, Partial<DhikrPreset>> = {
  subhanallah: {
    translation: 'اللہ پاک ہے',
    description: 'اللہ کی پاکی اور کمال کا اقرار۔',
    benefit: 'گناہوں کی معافی، میزان میں وزن، اور جنت میں درخت کا سبب۔'
  },
  alhamdulillah: {
    translation: 'تمام تعریفیں اللہ کے لیے ہیں',
    description: 'اللہ کی نعمتوں پر شکر اور رضا کا اظہار۔',
    benefit: 'ثواب کے ترازو کو بھرتا ہے اور شکر کی کیفیت بڑھاتا ہے۔'
  },
  allahuakbar: {
    translation: 'اللہ سب سے بڑا ہے',
    description: 'یہ اقرار کہ اللہ ہر پریشانی، خوف اور آزمائش سے بڑا ہے۔',
    benefit: 'حوصلہ بڑھاتا ہے اور فاطمی تسبیح کو مکمل کرتا ہے۔'
  },
  astaghfirullah: {
    translation: 'میں اللہ سے مغفرت مانگتا ہوں',
    description: 'کوتاہیوں پر اللہ کی رحمت اور معافی طلب کرنا۔',
    benefit: 'رزق، آسانی اور دل کی صفائی کا سبب۔'
  },
  lailahaillallah: {
    translation: 'اللہ کے سوا کوئی معبود نہیں',
    description: 'توحید کا سب سے عظیم اعلان۔',
    benefit: 'بہترین ذکر، جنت کی کنجی، اور ایمان کی مضبوطی۔'
  },
  salawat: {
    translation: 'اے اللہ، محمد ﷺ پر رحمتیں نازل فرما',
    description: 'نبی کریم ﷺ سے محبت اور درود کا اظہار۔',
    benefit: 'درود پڑھنے والے پر اللہ کی رحمتیں نازل ہوتی ہیں۔'
  },
  hawqala: {
    translation: 'نیکی کی طاقت اور برائی سے بچنے کی قوت صرف اللہ سے ہے',
    description: 'اپنی کمزوری کا اقرار اور اللہ پر مکمل بھروسہ۔',
    benefit: 'جنت کے خزانوں میں سے ایک خزانہ اور پریشانی میں سکون۔'
  }
};

const getPresetCopy = (preset: DhikrPreset, language: Language): DhikrPreset => {
  if (language !== 'ur') return preset;
  return {
    ...preset,
    ...PRESET_URDU[preset.id]
  };
};

export default function TasbihPage() {
  const [mounted, setMounted] = useState(false);
  const [presets, setPresets] = useState<DhikrPreset[]>(DEFAULT_PRESETS);
  const [activeIdx, setActiveIdx] = useState(0);
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(33);
  const [targetInput, setTargetInput] = useState('33');
  const [language, setLanguage] = useState<Language>('en');
  
  // Custom Controls and Customizer States
  const [counterMode, setCounterMode] = useState<CounterMode>('tally');
  const [theme, setTheme] = useState<ThemeType>('emerald');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundType, setSoundType] = useState<SoundStyle>('mechanical');
  const [vibeEnabled, setVibeEnabled] = useState(true);
  const [ambientType, setAmbientType] = useState<AmbientType>('none');
  const [ambientVolume, setAmbientVolume] = useState(30); // scale 0 - 100
  
  // Analytics & Streaks
  const [history, setHistory] = useState<HistoryLog[]>([]);
  const [streak, setStreak] = useState(0);
  const [dailyTotal, setDailyTotal] = useState(0);
  
  // AI Dhikr Customizer States
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiError, setAiError] = useState('');
  
  // Add Custom Dhikr Modal
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customArabic, setCustomArabic] = useState('');
  const [customTranslit, setCustomTranslit] = useState('');
  const [customTrans, setCustomTrans] = useState('');
  const [customTargetVal, setCustomTargetVal] = useState('33');
  const [customDesc, setCustomDesc] = useState('');
  
  // Share Card Modal State
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLog, setShareLog] = useState<HistoryLog | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);

  // Tap ripple effect states
  const [isTapping, setIsTapping] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const tapAreaRef = useRef<HTMLDivElement>(null);
  const beadContainerRef = useRef<HTMLDivElement>(null);

  const copy = UI_TEXT[language];
  const isUrdu = language === 'ur';

  const setGoalTarget = (nextTarget: number) => {
    const normalizedTarget = Math.min(Math.max(Math.trunc(nextTarget), 1), 99999);
    setTarget(normalizedTarget);
    setTargetInput(String(normalizedTarget));
  };

  const handleTargetInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '').slice(0, 5);
    setTargetInput(rawValue);

    const nextTarget = parseInt(rawValue, 10);
    if (!Number.isNaN(nextTarget) && nextTarget > 0) {
      setTarget(nextTarget);
    }
  };

  const commitTargetInput = () => {
    const nextTarget = parseInt(targetInput, 10);
    if (Number.isNaN(nextTarget) || nextTarget < 1) {
      setTargetInput(String(target));
      return;
    }

    setGoalTarget(nextTarget);
  };

  // Stable vibration trigger
  const triggerHaptic = (ms: number | number[] = 40) => {
    if (vibeEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(ms);
      } catch (e) {
        // Safe fail
      }
    }
  };

  // Preset Selection Helper
  const selectPreset = (idx: number) => {
    if (!presets[idx]) return;
    setActiveIdx(idx);
    setCount(0);
    setGoalTarget(presets[idx].defaultTarget);
    
    // Automatically suggest best audio style for bead mode
    if (counterMode === 'bead') {
      setSoundType('bead');
    }
  };

  // Streak Calculation Algorithm
  const calculateStreak = (historyList: HistoryLog[]) => {
    if (historyList.length === 0) return 0;
    
    const dates = Array.from(new Set(historyList.map(h => {
      try {
        return h.timestamp.split('T')[0];
      } catch {
        return '';
      }
    }).filter(Boolean))).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (dates.length === 0) return 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // If the latest completion isn't today or yesterday, streak is broken
    if (dates[0] !== todayStr && dates[0] !== yesterdayStr) {
      return 0;
    }

    let streakCount = 1;
    for (let i = 0; i < dates.length - 1; i++) {
      const current = new Date(dates[i]);
      const next = new Date(dates[i + 1]);
      const diffTime = Math.abs(current.getTime() - next.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streakCount++;
      } else if (diffDays > 1) {
        break; // Gap found, streak broken
      }
    }
    return streakCount;
  };

  // Calculate Daily Total repeats
  const calculateDailyTotal = (historyList: HistoryLog[]) => {
    const todayStr = new Date().toISOString().split('T')[0];
    return historyList
      .filter(h => h.timestamp.startsWith(todayStr))
      .reduce((sum, h) => sum + h.count, 0);
  };

  // Persistent Storage Management
  const saveHistory = (newHistory: HistoryLog[]) => {
    setHistory(newHistory);
    localStorage.setItem('tasbih_history', JSON.stringify(newHistory));
    setStreak(calculateStreak(newHistory));
    setDailyTotal(calculateDailyTotal(newHistory));
  };

  // Click & Counter handlers
  const handleIncrement = (e?: React.MouseEvent | React.TouchEvent) => {
    if (!presets[activeIdx]) return;
    
    // Increment ripple creation
    if (e && tapAreaRef.current) {
      let clientX = 0;
      let clientY = 0;

      if ('touches' in e) {
        const touch = (e as any).touches[0];
        if (touch) {
          clientX = touch.clientX;
          clientY = touch.clientY;
        }
      } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
      }

      const rect = tapAreaRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      
      const rippleId = Date.now() + Math.random();
      const newRipple = {
        id: rippleId,
        x,
        y
      };
      setRipples(prev => [...prev, newRipple]);
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== rippleId));
      }, 800);
    }

    const currentPreset = presets[activeIdx];
    const newCount = count + 1;
    setCount(newCount);
    
    // Sound & Haptics trigger
    audioService.playClick(soundType);
    triggerHaptic(soundType === 'bead' ? 25 : 35);

    setIsTapping(true);
    setTimeout(() => setIsTapping(false), 80);

    // Goal Completed!
    if (newCount === target) {
      triggerHaptic([100, 50, 100]);
      setTimeout(() => {
        audioService.playGoalChime();
      }, 50);

      const newLog: HistoryLog = {
        id: 'log_' + Date.now(),
        dhikrName: currentPreset.transliteration,
        arabic: currentPreset.arabic,
        count: newCount,
        target: target,
        timestamp: new Date().toISOString()
      };
      
      const updatedHistory = [newLog, ...history];
      saveHistory(updatedHistory);
    }
  };

  const handleReset = () => {
    setCount(0);
    audioService.playClick('soft');
    triggerHaptic(80);
  };

  const handleNextDhikr = () => {
    if (presets.length === 0) return;
    const nextIdx = (activeIdx + 1) % presets.length;
    selectPreset(nextIdx);
    audioService.playClick('bubble');
    triggerHaptic(50);
  };

  const handlePrevDhikr = () => {
    if (presets.length === 0) return;
    const prevIdx = (activeIdx - 1 + presets.length) % presets.length;
    selectPreset(prevIdx);
    audioService.playClick('bubble');
    triggerHaptic(50);
  };

  // Keyboard Event handlers (Space/Enter to trigger count)
  const incrementRef = useRef(handleIncrement);
  useEffect(() => {
    incrementRef.current = handleIncrement;
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        const activeElem = document.activeElement;
        // Ignore space/enter if user is inside form inputs
        if (activeElem && (
          activeElem.tagName === 'INPUT' || 
          activeElem.tagName === 'TEXTAREA' || 
          activeElem.getAttribute('contenteditable') === 'true'
        )) {
          return;
        }
        e.preventDefault();
        incrementRef.current();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Ambient sound system client synchronization
  useEffect(() => {
    if (mounted && soundEnabled) {
      audioService.setAmbientType(ambientType);
      audioService.setAmbientVolume(ambientVolume / 100);
    } else if (mounted && !soundEnabled) {
      audioService.setAmbientType('none');
    }
  }, [ambientType, ambientVolume, soundEnabled, mounted]);

  // Loading persisted parameters on client mount
  useEffect(() => {
      setTimeout(() => {
      setMounted(true);
      
      const savedLanguage = localStorage.getItem('tasbih_language') as Language;
      if (savedLanguage === 'en' || savedLanguage === 'ur') setLanguage(savedLanguage);

      const savedTheme = localStorage.getItem('tasbih_theme');
      if (isThemeType(savedTheme)) setTheme(savedTheme);

      const savedMode = localStorage.getItem('tasbih_counter_mode') as CounterMode;
      if (savedMode) setCounterMode(savedMode);

      const savedSound = localStorage.getItem('tasbih_sound_enabled');
      if (savedSound !== null) {
        const isSoundOn = savedSound === 'true';
        setSoundEnabled(isSoundOn);
        audioService.setEnabled(isSoundOn);
      }

      const savedSoundType = localStorage.getItem('tasbih_sound_type') as SoundStyle;
      if (savedSoundType) setSoundType(savedSoundType);

      const savedVibe = localStorage.getItem('tasbih_vibe_enabled');
      if (savedVibe !== null) {
        setVibeEnabled(savedVibe === 'true');
      }

      const savedAmbient = localStorage.getItem('tasbih_ambient_type') as AmbientType;
      if (savedAmbient) setAmbientType(savedAmbient);

      const savedAmbientVol = localStorage.getItem('tasbih_ambient_vol');
      if (savedAmbientVol) setAmbientVolume(parseInt(savedAmbientVol));

      const savedHistory = localStorage.getItem('tasbih_history');
      if (savedHistory) {
        try {
          const parsed = JSON.parse(savedHistory);
          setHistory(parsed);
          setStreak(calculateStreak(parsed));
          setDailyTotal(calculateDailyTotal(parsed));
        } catch (e) {
          console.error(e);
        }
      }

      const savedCustomPresets = localStorage.getItem('tasbih_custom_presets');
      if (savedCustomPresets) {
        try {
          const parsed = JSON.parse(savedCustomPresets);
          setPresets([...DEFAULT_PRESETS, ...parsed]);
        } catch (e) {
          console.error(e);
        }
      }
    }, 0);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.lang = language === 'ur' ? 'ur-PK' : 'en';
    document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr';
  }, [language, mounted]);

  // Persisting custom choices
  const toggleLanguage = () => {
    const nextLanguage: Language = language === 'en' ? 'ur' : 'en';
    setLanguage(nextLanguage);
    localStorage.setItem('tasbih_language', nextLanguage);
    triggerHaptic(30);
  };

  const changeTheme = (newTheme: ThemeType) => {
    setTheme(newTheme);
    localStorage.setItem('tasbih_theme', newTheme);
    triggerHaptic(30);
  };

  const changeCounterMode = (newMode: CounterMode) => {
    setCounterMode(newMode);
    localStorage.setItem('tasbih_counter_mode', newMode);
    
    // Automatically match the audio clicking sound to the mode
    if (newMode === 'bead') {
      setSoundType('bead');
      localStorage.setItem('tasbih_sound_type', 'bead');
    } else if (soundType === 'bead') {
      setSoundType('mechanical');
      localStorage.setItem('tasbih_sound_type', 'mechanical');
    }
    triggerHaptic(40);
  };

  const toggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    audioService.setEnabled(nextVal);
    localStorage.setItem('tasbih_sound_enabled', String(nextVal));
    triggerHaptic(30);
  };

  const changeSoundType = (type: SoundStyle) => {
    setSoundType(type);
    localStorage.setItem('tasbih_sound_type', type);
    audioService.playClick(type);
    triggerHaptic(30);
  };

  const toggleVibration = () => {
    const nextVal = !vibeEnabled;
    setVibeEnabled(nextVal);
    localStorage.setItem('tasbih_vibe_enabled', String(nextVal));
    triggerHaptic(50);
  };

  const handleAmbientVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setAmbientVolume(val);
    localStorage.setItem('tasbih_ambient_vol', String(val));
  };

  const handleAmbientTypeChange = (type: AmbientType) => {
    setAmbientType(type);
    localStorage.setItem('tasbih_ambient_type', type);
    triggerHaptic(30);
  };

  // Custom presets creation
  const handleAddCustomPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTranslit.trim()) return;

    const newPreset: DhikrPreset = {
      id: 'custom_' + Date.now(),
      arabic: customArabic.trim() || '—',
      transliteration: customTranslit.trim(),
      translation: customTrans.trim() || copy.personalDevotion,
      defaultTarget: parseInt(customTargetVal) || 33,
      description: customDesc.trim() || copy.personalDescription
    };

    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);

    const customOnly = updatedPresets.filter(p => p.id.startsWith('custom_'));
    localStorage.setItem('tasbih_custom_presets', JSON.stringify(customOnly));

    setActiveIdx(updatedPresets.length - 1);
    setShowAddCustom(false);

    // Reset inputs
    setCustomArabic('');
    setCustomTranslit('');
    setCustomTrans('');
    setCustomTargetVal('33');
    setCustomDesc('');
    
    audioService.playGoalChime();
  };

  const handleDeleteCustom = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(copy.deleteConfirm)) return;

    const updatedPresets = presets.filter(p => p.id !== id);
    setPresets(updatedPresets);

    const customOnly = updatedPresets.filter(p => p.id.startsWith('custom_'));
    localStorage.setItem('tasbih_custom_presets', JSON.stringify(customOnly));

    if (activeIdx >= updatedPresets.length) {
      setActiveIdx(0);
    }
  };

  const clearHistory = () => {
    if (confirm(copy.clearConfirm)) {
      saveHistory([]);
    }
  };

  // AI Dhikr Customizer Call
  const handleGenerateDhikr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setAiLoading(true);
    setAiError('');
    setAiResult(null);
    triggerHaptic(40);

    try {
      const res = await fetch('/api/generate-dhikr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feeling: aiQuery.trim(), language })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAiError(data.details || data.error || copy.aiServerError);
        return;
      }

      setAiResult(data);
      triggerHaptic([60, 40, 60]);
    } catch (err: any) {
      console.warn('AI request failed:', err?.message || err);
      setAiError(err.message || copy.aiFallbackError);
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyAiDhikr = () => {
    if (!aiResult) return;

    const newPreset: DhikrPreset = {
      id: 'custom_' + Date.now(),
      arabic: aiResult.arabic,
      transliteration: aiResult.transliteration,
      translation: aiResult.translation,
      defaultTarget: aiResult.defaultTarget || 33,
      description: aiResult.description,
      benefit: aiResult.benefit
    };

    const updatedPresets = [...presets, newPreset];
    setPresets(updatedPresets);

    const customOnly = updatedPresets.filter(p => p.id.startsWith('custom_'));
    localStorage.setItem('tasbih_custom_presets', JSON.stringify(customOnly));

    // Choose the newly added custom AI preset
    const nextIdx = updatedPresets.length - 1;
    setActiveIdx(nextIdx);
    setCount(0);
    setGoalTarget(newPreset.defaultTarget);

    // Reset customizer query
    setAiResult(null);
    setAiQuery('');
    
    // Play holy chime
    audioService.playGoalChime();
    triggerHaptic([80, 50, 100]);
  };

  // Share Card Trigger
  const triggerShareLog = (log: HistoryLog) => {
    setShareLog(log);
    setShowShareModal(true);
    setCopiedShare(false);
    triggerHaptic(30);
  };

  const copyShareText = () => {
    if (!shareLog) return;
    const text = `📿 Completed Dhikr: ${shareLog.dhikrName} (${shareLog.arabic})\n🔢 Count: ${shareLog.count} repeats achieved\n📅 Date: ${new Date(shareLog.timestamp).toLocaleDateString()} at ${new Date(shareLog.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n🔥 Daily Completion Streak: ${streak} days\n🌱 Empowered by Tasbih Digital Prestige`;
    const shareDate = new Date(shareLog.timestamp).toLocaleDateString(language === 'ur' ? 'ur-PK' : undefined);
    const shareTime = new Date(shareLog.timestamp).toLocaleTimeString(language === 'ur' ? 'ur-PK' : undefined, { hour: '2-digit', minute: '2-digit' });
    const shareText = language === 'ur'
      ? `📿 مکمل ذکر: ${shareLog.dhikrName} (${shareLog.arabic})\n🔢 تعداد: ${shareLog.count} مرتبہ\n📅 تاریخ: ${shareDate}، ${shareTime}\n🔥 روزانہ تسلسل: ${streak} دن\n🌙 ${copy.appTitle}`
      : text;
    navigator.clipboard.writeText(shareText);
    setCopiedShare(true);
    triggerHaptic([50, 50]);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  // Utility Date/Time Formatter
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString(language === 'ur' ? 'ur-PK' : undefined, { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(language === 'ur' ? 'ur-PK' : undefined, { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const activePreset = presets[activeIdx] || DEFAULT_PRESETS[0];
  const activePresetCopy = getPresetCopy(activePreset, language);
  const percentComplete = Math.min((count / target) * 100, 100);

  // Dynamic calculations for bead slider mode offset
  // Height of bead is 36px, gap is 12px, so total index height is 48px
  const currentBeadOffset = (count % 33) * 48;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#021e1a] flex items-center justify-center text-emerald-300">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin mx-auto"></div>
          <p className="font-serif tracking-widest text-sm uppercase">{copy.appTitle}</p>
        </div>
      </div>
    );
  }

  return (
    <main dir={isUrdu ? 'rtl' : 'ltr'} className={`theme-${theme} dynamic-bg min-h-screen w-full flex flex-col justify-between overflow-x-hidden relative font-sans select-none ${isUrdu ? 'urdu-ui' : ''}`}>
      
      {/* Dynamic Background Atmosphere lights */}
      <div className="absolute inset-0 bg-radial-[circle_at_50%_30%] from-[var(--theme-radial-1)] via-[var(--theme-bg)]/95 to-transparent opacity-90 pointer-events-none z-0 transition-all duration-1000" />
      <div className="absolute inset-0 bg-radial-[circle_at_10%_80%] from-[var(--theme-radial-2)] via-transparent to-transparent pointer-events-none z-0 transition-all duration-1000" />
      <div className="absolute inset-0 bg-radial-[circle_at_90%_90%] from-[var(--theme-radial-3)] via-transparent to-transparent pointer-events-none z-0 transition-all duration-1000" />
      
      {/* Sacred Star Geometric Pattern Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none z-0 transition-all duration-1000" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='30' y='30' width='20' height='20' fill='none' stroke='%23ffffff' stroke-width='1.2'/%3E%3Crect x='30' y='30' width='20' height='20' fill='none' stroke='%23ffffff' stroke-width='1.2' transform='rotate(45 40 40)'/%3E%3Ccircle cx='40' cy='40' r='3.5' fill='%23ffffff'/%3E%3Cpath d='M 0 40 L 30 40 M 50 40 L 80 40 M 40 0 L 40 30 M 40 50 L 40 80' stroke='%23ffffff' stroke-width='0.6' stroke-dasharray='1,2' opacity='0.5'/%3E%3Cpath d='M 0 0 L 26 26 M 54 54 L 80 80 M 80 0 L 54 26 M 26 54 L 0 80' stroke='%23ffffff' stroke-width='0.6' stroke-dasharray='1,2' opacity='0.3'/%3E%3Ccircle cx='0' cy='0' r='1.5' fill='%23ffffff' opacity='0.6'/%3E%3Ccircle cx='80' cy='0' r='1.5' fill='%23ffffff' opacity='0.6'/%3E%3Ccircle cx='0' cy='80' r='1.5' fill='%23ffffff' opacity='0.6'/%3E%3Ccircle cx='80' cy='80' r='1.5' fill='%23ffffff' opacity='0.6'/%3E%3C/svg%3E")`,
          backgroundSize: '120px 120px'
        }}
      />

      {/* Elegant Header Area */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-4 transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-black/45 border border-[var(--theme-border)] flex items-center justify-center dynamic-accent-text shadow-md">
            <MoonStar className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] tracking-[0.3em] uppercase block dynamic-accent-text font-bold font-mono">{copy.appKicker}</span>
            <h1 className="text-lg font-serif tracking-wide text-slate-100 leading-none">{copy.appTitle}</h1>
          </div>
        </div>

        {/* Global theme controls & quick settings */}
        <div className="flex items-center flex-wrap gap-2.5">
          <ThemePicker
            activeTheme={theme}
            onThemeChange={changeTheme}
            labels={{
              button: copy.themeTab,
              heading: copy.chooseTheme,
              current: copy.currentTheme,
              suffix: copy.themeSuffix,
              names: copy.themeNames,
            }}
          />

          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-full bg-black/45 dynamic-accent-text border border-[var(--theme-border)] hover:bg-black/70 transition-all cursor-pointer shadow-sm"
            title={copy.languageTitle}
          >
            <Languages className="h-3.5 w-3.5" />
            <span>{copy.languageToggle}</span>
          </button>

          {/* Sound & Haptic Quick Toggles */}
          <button 
            onClick={toggleSound}
            className={`p-2.5 rounded-full border transition-all duration-200 cursor-pointer ${
              soundEnabled 
                ? 'bg-black/35 border-[var(--theme-border)] dynamic-accent-text hover:bg-black/50' 
                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
            }`}
            title={soundEnabled ? copy.muteAudio : copy.unmuteAudio}
          >
            {soundEnabled ? <Volume2 className="h-4.5 w-4.5" /> : <VolumeX className="h-4.5 w-4.5" />}
          </button>

          <button 
            onClick={toggleVibration}
            className={`p-2.5 rounded-full border transition-all duration-200 cursor-pointer ${
              vibeEnabled 
                ? 'bg-black/35 border-[var(--theme-border)] dynamic-accent-text hover:bg-black/50' 
                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
            }`}
            title={vibeEnabled ? copy.disableHaptics : copy.enableHaptics}
          >
            <Smartphone className="h-4.5 w-4.5" />
          </button>

          <button
            onClick={() => setShowAddCustom(true)}
            className="flex items-center gap-1 px-3.5 py-2 text-xs font-semibold rounded-full bg-black/45 dynamic-accent-text border border-[var(--theme-border)] hover:bg-black/70 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{copy.addDhikr}</span>
          </button>
        </div>
      </header>

      {/* Main Content Layout Grid */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 py-2 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch flex-1">
        
        {/* Left Side Column: Presets Library & AI Customizer (4 cols on desktop) */}
        <div className="lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1">
          
          {/* Dhikr Presets Card */}
          <div className="bg-[var(--theme-surface)] backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-xl flex flex-col min-h-[380px] max-h-[500px]" id="presets-panel">
            <div className="flex justify-between items-center mb-3.5">
              <h3 className="text-xs uppercase tracking-[0.2em] font-bold font-mono text-slate-400 flex items-center gap-2">
                <Layers className="h-4 w-4 dynamic-accent-text" /> {copy.devotionalPresets}
              </h3>
              <span className="text-[10px] bg-black/30 border border-white/5 dynamic-accent-text px-2 py-0.5 rounded-full font-mono">
                {presets.length} {copy.active}
              </span>
            </div>

            {/* Presets scrolling box */}
            <div className="space-y-2 overflow-y-auto pr-1 flex-1 custom-scrollbar">
              {presets.map((p, index) => {
                const isActive = index === activeIdx;
                const isCustom = p.id.startsWith('custom_');
                const presetCopy = getPresetCopy(p, language);
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      selectPreset(index);
                      audioService.playClick('soft');
                    }}
                    className={`p-3 rounded-2xl border transition-all duration-300 cursor-pointer flex justify-between items-start gap-2.5 ${
                      isActive 
                        ? 'bg-[var(--theme-accent)]/15 border-[var(--theme-accent)] shadow-md shadow-[var(--theme-accent-glow)]/5' 
                        : 'bg-white/3 border-white/5 hover:bg-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className={`text-xs font-semibold tracking-wide truncate ${isActive ? 'dynamic-accent-text font-bold' : 'text-slate-100'}`}>
                          {presetCopy.transliteration}
                        </h4>
                        {isCustom && (
                          <span className="text-[8px] uppercase tracking-wide bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-1.5 py-0.2 rounded font-mono">
                            {copy.custom}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{presetCopy.translation}</p>
                      <p className="text-[9px] text-[var(--theme-accent)]/80 font-mono mt-1 flex items-center gap-1">
                        {copy.goal}: <span className="font-bold">{p.defaultTarget} {copy.counts}</span>
                      </p>
                    </div>

                    <div className="flex flex-col items-end justify-between self-stretch">
                      <span className="text-right text-[11px] text-slate-200 font-serif leading-none opacity-90 max-w-[80px] overflow-hidden truncate">
                        {p.arabic}
                      </span>
                      {isCustom && (
                        <button
                          onClick={(e) => handleDeleteCustom(p.id, e)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors rounded-lg hover:bg-white/5 cursor-pointer mt-1"
                          title={copy.deleteDevotion}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active preset citation box */}
            {activePreset && (
              <div className="mt-4 p-3.5 rounded-2xl bg-black/35 border border-white/5 text-[11px]">
                <span className="text-[8px] uppercase tracking-[0.25em] dynamic-accent-secondary-text font-extrabold block mb-1">{copy.merits}</span>
                <p className="text-slate-300 leading-relaxed font-serif italic">
                  &quot;{activePresetCopy.benefit || activePresetCopy.description}&quot;
                </p>
              </div>
            )}
          </div>

          {/* AI Supplication Customizer Card */}
          <div className="bg-[var(--theme-surface)] backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-xl flex flex-col" id="ai-customizer-panel">
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold font-mono text-slate-400 flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 dynamic-accent-text animate-pulse" /> {copy.aiTitle}
            </h3>
            <p className="text-[10px] text-slate-400 mb-3">{copy.aiIntro}</p>

            <form onSubmit={handleGenerateDhikr} className="space-y-2">
              <div className="relative">
                <textarea
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder={copy.aiPlaceholder}
                  rows={2}
                  maxLength={180}
                  className="w-full text-xs px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-2xl text-slate-200 focus:outline-none focus:border-[var(--theme-accent)] placeholder-slate-500 resize-none pr-7 custom-scrollbar"
                />
                <span className="absolute bottom-2.5 right-3 text-[8px] font-mono text-slate-500">
                  {180 - aiQuery.length}
                </span>
              </div>

              <button
                type="submit"
                disabled={aiLoading || !aiQuery.trim()}
                className={`w-full py-2.5 rounded-xl font-semibold text-xs tracking-wide cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 border ${
                  aiLoading || !aiQuery.trim()
                    ? 'bg-white/5 border-white/5 text-slate-500 cursor-not-allowed'
                    : 'bg-black/45 border-[var(--theme-border)] dynamic-accent-text hover:bg-black/60 shadow-[0_0_12px_rgba(255,255,255,0.02)]'
                }`}
              >
                {aiLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-500 border-t-white rounded-full animate-spin"></div>
                    <span>{copy.aiLoading}</span>
                  </>
                ) : (
                  <>
                    <Compass className="w-3.5 h-3.5" />
                    <span>{copy.aiButton}</span>
                  </>
                )}
              </button>
            </form>

            {/* Error messaging */}
            {aiError && (
              <div className="mt-3 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-300 leading-relaxed font-serif">
                ⚠️ {aiError}
              </div>
            )}

            {/* AI Custom Result Display Block */}
            {aiResult && (
              <div className="mt-3.5 p-4 rounded-2xl bg-gradient-to-br from-black/50 to-black/20 border border-[var(--theme-border)] text-xs animate-slide-up relative overflow-hidden">
                {/* Visual glow element */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--theme-accent)]/10 rounded-full blur-2xl pointer-events-none"></div>
                
                <span className="text-[8px] uppercase tracking-[0.25em] bg-[var(--theme-accent)]/10 border border-[var(--theme-accent)]/20 px-2 py-0.5 rounded-full dynamic-accent-text font-bold inline-block mb-2">
                  {copy.aiBadge}
                </span>

                <div className="text-center py-2 border-b border-white/5 mb-2.5">
                  <h4 className="text-2xl font-serif text-slate-100 my-1 drop-shadow-md">{aiResult.arabic}</h4>
                  <p className="text-xs font-semibold dynamic-accent-secondary-text mt-1">{aiResult.transliteration}</p>
                  <p className="text-[11px] text-slate-400 italic mt-0.5">&quot;{aiResult.translation}&quot;</p>
                </div>

                <div className="space-y-1.5 text-[10px] text-slate-350 leading-relaxed font-serif">
                  <p><span className="font-bold dynamic-accent-text font-sans uppercase text-[8px] tracking-wider block">{copy.spiritualContext}</span>{aiResult.description}</p>
                  {aiResult.benefit && (
                    <p><span className="font-bold dynamic-accent-text font-sans uppercase text-[8px] tracking-wider block">{copy.meritWisdom}</span>{aiResult.benefit}</p>
                  )}
                  <p className="font-sans text-[9px] font-mono dynamic-accent-secondary-text">{copy.recommendedRepeats}: {aiResult.defaultTarget} {copy.times}</p>
                </div>

                <button
                  onClick={handleApplyAiDhikr}
                  className="w-full mt-3.5 py-2 rounded-xl bg-[var(--theme-accent)] text-slate-950 hover:opacity-90 font-bold text-xs tracking-wider transition-opacity cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-[var(--theme-accent-glow)]/10"
                >
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                  <span>{copy.beginAi}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Center Dashboard Column: Main Tapping Counter & Interface Controls (8 cols on desktop) */}
        <div className="lg:col-span-8 flex flex-col gap-6 order-1 lg:order-2 justify-center">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            
            {/* The giant Interactive Counting Deck (md:col-span-8) */}
            <div className="md:col-span-8 bg-[var(--theme-surface)] backdrop-blur-xl border border-white/10 rounded-4xl p-6 md:p-8 shadow-2xl flex flex-col items-center justify-between relative overflow-hidden min-h-[510px]" id="tasbih-interactive-counter">
              
              {/* Active Dhikr Title Card */}
              <div className="text-center space-y-2.5 w-full z-10">
                <div className="flex justify-between items-center px-1">
                  <button 
                    onClick={handlePrevDhikr}
                    className="p-2 text-slate-500 hover:text-slate-100 transition-colors rounded-full hover:bg-white/5 cursor-pointer"
                    title={copy.previousPreset}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  {/* Mode switcher tabs tally vs bead */}
                  <div className="flex bg-black/40 border border-white/5 rounded-full p-0.5">
                    <button
                      onClick={() => changeCounterMode('tally')}
                      className={`px-3.5 py-1 rounded-full text-[10px] font-bold tracking-wider capitalize transition-all cursor-pointer ${
                        counterMode === 'tally' 
                          ? 'bg-[var(--theme-accent)] text-slate-950 shadow-sm' 
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {copy.tallyMode}
                    </button>
                    <button
                      onClick={() => changeCounterMode('bead')}
                      className={`px-3.5 py-1 rounded-full text-[10px] font-bold tracking-wider capitalize transition-all cursor-pointer ${
                        counterMode === 'bead' 
                          ? 'bg-[var(--theme-accent)] text-slate-950 shadow-sm' 
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {copy.beadMode}
                    </button>
                  </div>

                  <button 
                    onClick={handleNextDhikr}
                    className="p-2 text-slate-500 hover:text-slate-100 transition-colors rounded-full hover:bg-white/5 cursor-pointer"
                    title={copy.nextPreset}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex flex-col items-center justify-center pt-2">
                  <h2 className="text-3xl md:text-4xl text-slate-100 font-serif font-semibold my-1 text-center font-arabic leading-relaxed drop-shadow-md select-none tracking-wide">
                    {activePresetCopy.arabic}
                  </h2>
                  <p className="text-lg md:text-xl font-bold dynamic-accent-secondary-text glow-text-secondary drop-shadow select-none">
                    {activePresetCopy.transliteration}
                  </p>
                  <p className="text-xs italic text-slate-400 max-w-[85%] select-none mt-0.5 leading-relaxed">
                    {activePresetCopy.translation}
                  </p>
                </div>
              </div>

              {/* DYNAMIC TAP WORKSPACE ZONE */}
              <div className="relative w-full flex items-center justify-center py-4 z-10 h-72">
                
                {/* 1. TALLY COUNTER MODE (Modern Glowing Orb Tapper) */}
                {counterMode === 'tally' ? (
                  <div 
                    ref={tapAreaRef}
                    onClick={(e) => handleIncrement(e)}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      handleIncrement(e);
                    }}
                    className={`relative w-60 h-60 md:w-64 md:h-64 rounded-full border flex flex-col items-center justify-center cursor-pointer transition-all duration-300 select-none ${
                      isTapping 
                        ? 'scale-95 border-[var(--theme-accent)] bg-[var(--theme-accent)]/10 shadow-[0_0_50px_var(--theme-accent-glow)]' 
                        : 'border-white/10 bg-black/45 hover:bg-black/30 hover:border-[var(--theme-border)] hover:shadow-[0_0_35px_rgba(255,255,255,0.02)]'
                    }`}
                    style={{ touchAction: 'none' }}
                  >
                    {/* Visual ripple overlays */}
                    {ripples.map(ripple => (
                      <span
                        key={ripple.id}
                        className="absolute rounded-full bg-[var(--theme-accent)]/20 pointer-events-none animate-ping"
                        style={{
                          left: ripple.x - 20,
                          top: ripple.y - 20,
                          width: '40px',
                          height: '40px'
                        }}
                      />
                    ))}

                    {/* Orbit and Ring Ornaments */}
                    <div className="absolute inset-0 w-full h-full border border-[var(--theme-border)] rounded-full scale-102 opacity-60 animate-pulse pointer-events-none" />
                    <div className="absolute inset-0 w-full h-full border border-white/5 rounded-full scale-106 pointer-events-none" />
                    
                    {/* Large Count value */}
                    <div className="text-center">
                      <span className="text-8xl md:text-9xl font-sans font-light tracking-tighter text-slate-100 select-none leading-none drop-shadow-lg glow-text">
                        {count}
                      </span>
                      <div className="text-[10px] font-mono tracking-widest text-slate-400 mt-1.5 uppercase font-semibold">
                        {copy.target} {target}
                      </div>
                    </div>

                    <div className="absolute bottom-5 text-[8px] uppercase tracking-[0.4em] text-slate-500 select-none font-bold">
                      {copy.tapOrb}
                    </div>
                  </div>
                ) : (
                  
                  /* 2. REALISTIC BEAD STRING MODE (Sliding scroll chain) */
                  <div 
                    ref={beadContainerRef}
                    onClick={() => handleIncrement()}
                    className="relative w-44 h-72 border border-white/10 bg-black/50 rounded-3xl overflow-hidden cursor-pointer shadow-inner flex items-center justify-center select-none group"
                    title={copy.beadTitle}
                  >
                    {/* Bead string vertical thread */}
                    <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-yellow-600/35 z-0" />
                    
                    {/* Center separator marker bead (Traditional sheikh divider) */}
                    <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-0.5 bg-white/10 z-10 flex items-center justify-between px-3 pointer-events-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--theme-accent)] opacity-40 shadow-sm"></span>
                      <span className="text-[8px] font-mono tracking-widest text-[var(--theme-accent)]/45 uppercase font-bold">{copy.beadGap}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--theme-accent)] opacity-40 shadow-sm"></span>
                    </div>

                    {/* Animated vertical sliding bead string container */}
                    <div 
                      className="absolute w-full flex flex-col items-center gap-3 transition-transform duration-300 ease-out z-20 pointer-events-none"
                      style={{ 
                        transform: `translateY(${-currentBeadOffset}px)`,
                        // Keep the active bead roughly centered in viewport
                        top: '80px'
                      }}
                    >
                      {Array.from({ length: 33 }).map((_, idx) => {
                        const isSheikh = idx === 0 || idx === 11 || idx === 22;
                        const beadId = idx + 1;
                        const hasBeenCounted = (count % 33) >= beadId;
                        
                        return (
                          <div
                            key={idx}
                            className={`w-9 h-9 md:w-10 md:h-10 rounded-full transition-all duration-300 flex items-center justify-center relative shadow-md ${
                              isSheikh
                                ? 'scale-108 bg-gradient-to-br from-yellow-400 to-amber-600 border-2 border-yellow-300 text-slate-950 font-bold text-[9px] shadow-[0_0_12px_rgba(234,179,8,0.2)]'
                                : 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 border border-white/10'
                            } ${
                              hasBeenCounted 
                                ? 'opacity-30 scale-90 translate-y-3 brightness-75' 
                                : 'opacity-95 brightness-100 group-hover:scale-103'
                            }`}
                          >
                            {/* Wooden / Crystal highlights */}
                            {!isSheikh && (
                              <div className="absolute top-1 left-1.5 w-2 h-2 rounded-full bg-white/20 blur-[0.5px]" />
                            )}
                            
                            {/* Gold center orbit */}
                            {isSheikh && (
                              <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-60" />
                            )}

                            {/* Bead index indicator */}
                            <span className={`text-[8px] font-mono select-none ${
                              isSheikh ? 'text-slate-950 font-bold' : 'text-slate-400/80'
                            }`}>
                              {beadId}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Dynamic bead counting badge overlay */}
                    <div className="absolute bottom-3 inset-x-0 text-center pointer-events-none z-30">
                      <span className="bg-black/75 px-3 py-1 rounded-full border border-white/5 text-lg font-bold font-mono tracking-tighter text-slate-100 glow-text shadow-md">
                        {count}
                      </span>
                    </div>

                    <div className="absolute top-3 inset-x-0 text-center pointer-events-none z-35">
                      <span className="text-[8px] tracking-[0.25em] font-bold text-slate-500 uppercase bg-black/60 px-2 py-0.5 rounded-full border border-white/5">
                        {copy.slideBeads}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Slider Indicator */}
              <div className="w-full space-y-1.5 z-10">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 px-1">
                  <span className="uppercase tracking-widest font-bold">{copy.prayerProgress}</span>
                  <div className="flex gap-1.5 items-center">
                    <span className="bg-black/35 border border-white/5 px-2 py-0.5 rounded text-[var(--theme-accent)]">
                      {count} / {target}
                    </span>
                    <span className="font-semibold text-slate-200">({Math.round(percentComplete)}%)</span>
                  </div>
                </div>
                
                {/* Visual Glowing Progress Bar */}
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                  <div 
                    className="h-full bg-gradient-to-r from-[var(--theme-accent)] to-[var(--theme-accent-secondary)] rounded-full transition-all duration-300 shadow-[0_0_15px_var(--theme-accent-glow)]"
                    style={{ width: `${percentComplete}%` }}
                  />
                </div>
              </div>

              {/* Heavenly Spiritual Congratulatory Ribbon */}
              {count >= target && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--theme-bg)]/98 to-[var(--theme-bg)]/95 py-5 px-6 border-t border-[var(--theme-border)] flex flex-col sm:flex-row items-center justify-between gap-3.5 z-40 animate-slide-up">
                  <div className="flex items-center gap-2.5 text-center sm:text-left">
                    <div className="w-8 h-8 rounded-full bg-[var(--theme-accent)] flex items-center justify-center text-slate-950 shadow-md">
                      <Check className="h-5 w-5" strokeWidth={3} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-300 uppercase tracking-widest font-bold leading-none">{copy.goalDone}</p>
                      <p className="text-xs font-semibold dynamic-accent-secondary-text">{copy.targetMet(target)}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleReset}
                      className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors cursor-pointer text-center"
                    >
                      {copy.resetCount}
                    </button>
                    <button
                      onClick={handleNextDhikr}
                      className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-xl bg-[var(--theme-accent)] text-slate-950 hover:opacity-90 transition-opacity cursor-pointer text-center shadow-md shadow-[var(--theme-accent-glow)]/10"
                    >
                      {copy.nextPresetBtn}
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Custom Settings & Analytical Ledger Column (md:col-span-4) */}
            <div className="md:col-span-4 flex flex-col gap-6">
              
              {/* Detailed Settings Controls Card */}
              <div className="bg-[var(--theme-surface)] backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-lg flex flex-col justify-between" id="settings-panel">
                <div>
                  <h3 className="text-xs uppercase tracking-[0.2em] font-bold font-mono text-slate-400 mb-3.5 flex items-center gap-2">
                    <Settings className="h-4 w-4 dynamic-accent-text" /> {copy.audioSettings}
                  </h3>

                  {/* Sound Type Selection Grid */}
                  <div className="space-y-1.5 mt-2">
                    <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">{copy.clickSound}</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {([
                        { key: 'mechanical', name: copy.soundTally },
                        { key: 'soft', name: copy.soundSoft },
                        { key: 'bubble', name: copy.soundWater },
                        { key: 'bead', name: copy.soundWood }
                      ] as const).map((soundS) => (
                        <button
                          key={soundS.key}
                          onClick={() => changeSoundType(soundS.key)}
                          className={`py-1.5 text-[10px] font-semibold rounded-xl border transition-all cursor-pointer capitalize ${
                            soundType === soundS.key 
                              ? 'bg-[var(--theme-accent)]/20 border-[var(--theme-accent)] dynamic-accent-text' 
                              : 'bg-white/3 border-white/5 hover:bg-white/5 text-slate-300'
                          }`}
                        >
                          {soundS.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Offline Ambient Loops Soundboard */}
                  <div className="mt-5 space-y-2 border-t border-white/5 pt-3.5">
                    <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5">
                      <Music className="w-3 h-3 dynamic-accent-text" /> {copy.atmosphere}
                    </label>
                    
                    <div className="grid grid-cols-2 gap-1.5">
                      {([
                        { key: 'none', name: copy.silent },
                        { key: 'rain', name: copy.rain },
                        { key: 'breeze', name: copy.wind },
                        { key: 'resonance', name: copy.hum }
                      ] as const).map((ambientS) => (
                        <button
                          key={ambientS.key}
                          onClick={() => handleAmbientTypeChange(ambientS.key)}
                          className={`py-1.5 text-[10px] font-semibold rounded-xl border transition-all cursor-pointer ${
                            ambientType === ambientS.key
                              ? 'bg-[var(--theme-accent)]/20 border-[var(--theme-accent)] dynamic-accent-text shadow-sm'
                              : 'bg-white/3 border-white/5 hover:bg-white/5 text-slate-350'
                          }`}
                        >
                          {ambientS.name}
                        </button>
                      ))}
                    </div>

                    {ambientType !== 'none' && (
                      <div className="space-y-1 mt-2.5 bg-black/35 p-2 rounded-xl border border-white/5 animate-slide-up">
                        <div className="flex justify-between text-[8px] font-mono text-slate-400">
                          <span>{copy.volume}</span>
                          <span>{ambientVolume}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={ambientVolume}
                          onChange={handleAmbientVolumeChange}
                          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--theme-accent)]"
                        />
                      </div>
                    )}
                  </div>

                  {/* Manual Target Modifier */}
                  <div className="mt-5 space-y-2 border-t border-white/5 pt-3.5">
                    <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block">{copy.repetitionGoal}</label>
                    <div className="flex gap-1.5 items-center">
                      {[33, 99, 100].map((presetTarget) => (
                        <button
                          key={presetTarget}
                          onClick={() => {
                            setGoalTarget(presetTarget);
                            audioService.playClick('bubble');
                          }}
                          className={`flex-1 py-1.5 text-xs font-mono rounded-xl border transition-all cursor-pointer ${
                            target === presetTarget
                              ? 'bg-[var(--theme-accent)]/20 border-[var(--theme-accent)] dynamic-accent-text font-bold'
                              : 'bg-white/3 border-white/5 text-slate-350 hover:bg-white/5'
                          }`}
                        >
                          {presetTarget}
                        </button>
                      ))}
                      
                      {/* Direct manual input */}
                      <input 
                        type="number"
                        inputMode="numeric"
                        min="1"
                        max="99999"
                        value={targetInput}
                        onChange={handleTargetInputChange}
                        onBlur={commitTargetInput}
                        onFocus={(e) => e.currentTarget.select()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.currentTarget.blur();
                          }
                        }}
                        className="w-16 px-1.5 py-1 text-center bg-black/45 border border-white/10 rounded-xl text-xs font-mono dynamic-accent-text focus:outline-none focus:border-[var(--theme-accent)] transition-colors"
                        title={copy.customGoal}
                      />
                    </div>
                  </div>
                </div>

                {/* Reset Trigger */}
                <div className="mt-5 pt-4 border-t border-white/5 flex gap-2">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-xs tracking-wide flex items-center justify-center gap-1.5 cursor-pointer transition-colors border border-white/5 shadow-sm"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    {copy.resetCounter}
                  </button>
                </div>
              </div>

              {/* Streaks, Stats, & Ledger Ledger Card */}
              <div className="bg-[var(--theme-surface)] backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-lg flex-1 flex flex-col justify-between min-h-[290px]" id="ledger-panel">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs uppercase tracking-[0.2em] font-bold font-mono text-slate-400 flex items-center gap-2">
                      <History className="h-4 w-4 dynamic-accent-text" /> {copy.ledger}
                    </h3>
                    {history.length > 0 && (
                      <button
                        onClick={clearHistory}
                        className="text-[9px] text-rose-400 hover:text-rose-300 font-mono transition-colors cursor-pointer"
                        title={copy.clearLogsTitle}
                      >
                        {copy.clearLogs}
                      </button>
                    )}
                  </div>

                  {/* Streaks & Daily counts badges */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-black/35 border border-white/5 p-2 rounded-2xl flex items-center gap-2">
                      <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
                      <div>
                        <span className="text-[8px] uppercase tracking-wider text-slate-500 block leading-none">{copy.streak}</span>
                        <span className="text-sm font-bold font-mono text-slate-100">{streak} {copy.days}</span>
                      </div>
                    </div>

                    <div className="bg-black/35 border border-white/5 p-2 rounded-2xl flex items-center gap-2">
                      <Check className="w-6 h-6 dynamic-accent-text" />
                      <div>
                        <span className="text-[8px] uppercase tracking-wider text-slate-500 block leading-none">{copy.todayCount}</span>
                        <span className="text-sm font-bold font-mono text-slate-100">{dailyTotal}</span>
                      </div>
                    </div>
                  </div>

                  {/* Empty state or ledger logs */}
                  {history.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 space-y-2">
                      <History className="h-8 w-8 text-slate-600 mx-auto opacity-30" />
                      <p className="text-xs font-serif italic">{copy.ledgerEmpty}</p>
                      <p className="text-[9px] px-3">{copy.ledgerEmptyHint(target)}</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-0.5 custom-scrollbar">
                      {history.slice(0, 10).map((log) => (
                        <div 
                          key={log.id}
                          className="p-2 rounded-xl bg-white/3 border border-white/5 flex items-center justify-between gap-1.5 hover:bg-white/5 transition-colors group"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-semibold text-slate-200 truncate">{log.dhikrName}</span>
                              <span className="text-[8px] uppercase tracking-wider bg-emerald-500/10 text-emerald-300 px-1 py-0.2 rounded font-sans scale-90">{copy.done}</span>
                            </div>
                            <span className="text-[9px] text-[var(--theme-accent)]/80 font-mono block mt-0.5">
                              {log.count} {copy.repeats} • {formatDate(log.timestamp)}
                            </span>
                          </div>

                          <div className="text-right flex items-center gap-2">
                            <div>
                              <span className="text-[11px] font-serif text-slate-300 block leading-none">
                                {log.arabic !== '—' ? log.arabic : ''}
                              </span>
                              <span className="text-[9px] text-slate-500 font-mono">
                                {formatTime(log.timestamp)}
                              </span>
                            </div>
                            <button
                              onClick={() => triggerShareLog(log)}
                              className="p-1.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                              title={copy.shareAchievement}
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {history.length > 0 && (
                  <div className="mt-3 pt-3.5 border-t border-white/5 text-[9px] font-mono flex justify-between items-center bg-black/35 px-3 py-2 rounded-2xl border border-white/5">
                    <span className="text-slate-400">{copy.totalTargets}</span>
                    <span className="font-bold dynamic-accent-secondary-text">{history.length} {copy.completed}</span>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* MODAL 1: CREATE CUSTOM DEVOTION */}
      {showAddCustom && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-4xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-serif text-slate-100 mb-1">{copy.createCustom}</h3>
            <p className="text-xs text-slate-400 mb-4">{copy.createCustomIntro}</p>

            <form onSubmit={handleAddCustomPreset} className="space-y-4">
              <div>
                <label className="text-[9px] uppercase font-bold text-[var(--theme-accent)] tracking-wider block mb-1">{copy.titleTranslit}</label>
                <input
                  type="text"
                  required
                  placeholder={copy.titlePlaceholder}
                  value={customTranslit}
                  onChange={(e) => setCustomTranslit(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/55 border border-white/10 rounded-2xl text-xs text-slate-200 focus:outline-none focus:border-[var(--theme-accent)]"
                />
              </div>

              <div>
                <label className="text-[9px] uppercase font-bold text-[var(--theme-accent)] tracking-wider block mb-1">{copy.arabicLettering}</label>
                <input
                  type="text"
                  placeholder="e.g. سُبْحَانَ اللَّهِ وَبِحَمْدِهِ"
                  value={customArabic}
                  onChange={(e) => setCustomArabic(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/55 border border-white/10 rounded-2xl text-xs text-slate-200 text-right focus:outline-none focus:border-[var(--theme-accent)] font-serif"
                />
              </div>

              <div>
                <label className="text-[9px] uppercase font-bold text-[var(--theme-accent)] tracking-wider block mb-1">{copy.translationLabel}</label>
                <input
                  type="text"
                  placeholder={copy.translationPlaceholder}
                  value={customTrans}
                  onChange={(e) => setCustomTrans(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/55 border border-white/10 rounded-2xl text-xs text-slate-200 focus:outline-none focus:border-[var(--theme-accent)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] uppercase font-bold text-[var(--theme-accent)] tracking-wider block mb-1">{copy.defaultGoal}</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={customTargetVal}
                    onChange={(e) => setCustomTargetVal(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-black/55 border border-white/10 rounded-2xl text-xs text-slate-200 focus:outline-none focus:border-[var(--theme-accent)] font-mono"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold text-[var(--theme-accent)] tracking-wider block mb-1">{copy.benefitDetail}</label>
                  <input
                    type="text"
                    placeholder={copy.benefitPlaceholder}
                    value={customDesc}
                    onChange={(e) => setCustomDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-black/55 border border-white/10 rounded-2xl text-xs text-slate-300 focus:outline-none focus:border-[var(--theme-accent)]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddCustom(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {copy.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[var(--theme-accent)] text-slate-950 hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-[var(--theme-accent-glow)]/15"
                >
                  {copy.savePreset}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ELEGANT SHARE COMPLETION CARD */}
      {showShareModal && shareLog && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-4xl max-w-sm w-full p-6 shadow-2xl relative text-center">
            <h3 className="text-base font-serif text-slate-100 mb-3 flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4 dynamic-accent-text" /> {copy.shareCardTitle}
            </h3>
            
            {/* Visual card mockup */}
            <div className="my-5 p-5 rounded-3xl bg-gradient-to-br from-black/80 to-black/40 border border-[var(--theme-border)] text-center relative overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-radial-[circle_at_50%_40%] from-[var(--theme-radial-2)] to-transparent opacity-40 z-0"></div>
              
              <div className="relative z-10 space-y-3.5">
                <div className="w-12 h-12 rounded-full bg-black/60 border border-[var(--theme-border)] flex items-center justify-center mx-auto text-emerald-300">
                  <Check className="w-6 h-6 dynamic-accent-text animate-pulse" strokeWidth={3} />
                </div>
                
                <div>
                  <span className="text-[7.5px] uppercase tracking-[0.3em] text-slate-500 font-bold block mb-1">{copy.remembranceGoalMet}</span>
                  <h4 className="text-3xl font-serif text-slate-100 my-0.5 tracking-wide leading-relaxed">{shareLog.arabic}</h4>
                  <p className="text-sm font-bold dynamic-accent-secondary-text leading-none">{shareLog.dhikrName}</p>
                </div>

                <div className="bg-black/35 py-2 px-3 rounded-2xl border border-white/5 inline-block font-mono">
                  <span className="text-[8px] uppercase tracking-wider text-slate-500 block leading-none mb-0.5">{copy.achievedRepetitions}</span>
                  <span className="text-xl font-extrabold text-slate-100">{shareLog.count} {copy.repeats}</span>
                </div>

                <div className="flex justify-between items-center text-[8px] font-mono text-slate-500 border-t border-white/5 pt-3 mt-1 px-1">
                  <span>{copy.dailyStreak}: <span className="font-bold text-orange-500">{streak} {copy.days} 🔥</span></span>
                  <span>{formatDate(shareLog.timestamp)} • {formatTime(shareLog.timestamp)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <button
                onClick={copyShareText}
                className="w-full py-2.5 rounded-xl bg-[var(--theme-accent)] text-slate-950 hover:opacity-90 font-bold text-xs tracking-wider transition-opacity cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-[var(--theme-accent-glow)]/15"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedShare ? copy.copied : copy.copyShare}</span>
              </button>
              
              <button
                onClick={() => setShowShareModal(false)}
                className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-100 transition-colors font-medium text-xs tracking-wider cursor-pointer border border-white/5"
              >
                {copy.closeCard}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Area */}
      <footer className="footer-credit relative z-10 w-full text-center py-6 mt-8 border-t border-white/5 bg-black/25">
        <div className="max-w-7xl mx-auto px-6 text-slate-500 text-xs [&_p:not(:first-child)]:hidden">
          <div>
            <p className="font-serif tracking-[0.2em] text-[var(--theme-accent-secondary)] font-semibold">{copy.madeBy}</p>
            <p className="text-[10px] text-slate-600">{copy.appKicker}</p>
          </div>
          <div className="hidden">
            Crafted for focus, serenity, and continuous spiritual elevation.
          </div>
        </div>
      </footer>
    </main>
  );
}
