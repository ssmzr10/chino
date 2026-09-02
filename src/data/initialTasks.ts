import { TaskItem } from '../types';
import { getTodayJalaliDate } from '../utils/persianDate';

export function getInitialTasks(): TaskItem[] {
  const todayStr = getTodayJalaliDate().standardString;

  return [
    // 1. شروع شیفت (shift_start)
    {
      id: 'task-start-1',
      title: 'روشن کردن دستگاه اسپرسو و چک فشار بار و هدگروپ‌ها',
      notes: 'دستگاه حداقل ۳۰ دقیقه قبل از سرویس روشن شود تا کاملاً گرم شود.',
      taskType: 'shift_start',
      role: 'both',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-start-2',
      title: 'آماده‌سازی سینک و بررسی مخزن مایع ظرفشویی و جلا دهنده',
      notes: 'بررسی فیلتر کف ماشین ظرفشویی و پر کردن مخزن نمک مخصوص.',
      taskType: 'shift_start',
      role: 'dishwasher',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-start-3',
      title: 'تمیز کردن و چیدمان میزهای سالن، بار و بررسی منوها',
      notes: 'ضدعفونی کردن سطح تمام میزها و چیدمان منظم صندلی‌ها و شیشه‌ها.',
      taskType: 'shift_start',
      role: 'waiter',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-start-4',
      title: 'بررسی روشنایی سالن و تنظیم موسیقی ملایم صبحگاهی',
      notes: 'روشن کردن نورهای دکوراتیو و پلی‌لیست آرامش‌بخش روزانه.',
      taskType: 'shift_start',
      role: 'waiter',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-start-5',
      title: 'تحویل گرفتن پارچه‌ها و حوله‌های خشک و تمیز',
      notes: 'دسته‌بندی دستمال‌های باریستا، سالن و شستشوی ظروف.',
      taskType: 'shift_start',
      role: 'dishwasher',
      createdAt: new Date().toISOString(),
    },

    // 2. پایان شیفت (shift_end)
    {
      id: 'task-end-1',
      title: 'شستشوی کامل تمام ظروف، پیچرها، بلندرها و تیغه‌ها',
      notes: 'استفاده از آب داغ و مواد ضدعفونی‌کننده ظروف حساس بار.',
      taskType: 'shift_end',
      role: 'dishwasher',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-end-2',
      title: 'تخلیه و شستشوی سطل‌های زباله و قرار دادن کیسه‌های نو',
      notes: 'تفکیک زباله‌های خشک و تر و انتقال کیسه‌ها به سطل اصلی بیرون.',
      taskType: 'shift_end',
      role: 'dishwasher',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-end-3',
      title: 'جمع‌آوری و ضدعفونی میزها، شارژ نمک‌پاش‌ها و دستمال‌ها',
      notes: 'شارژ ظروف شکر، نمک‌پاش‌ها و سس‌خوری‌های روی میزهای سالن.',
      taskType: 'shift_end',
      role: 'waiter',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-end-4',
      title: 'جارو و تی زدن کامل کف سالن و بررسی سرویس‌های بهداشتی',
      notes: 'بررسی مایع دستشویی و شارژ دستمال توالت سرویس سالن.',
      taskType: 'shift_end',
      role: 'waiter',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-end-5',
      title: 'خاموش کردن دستگاه‌ها، سیستم‌های صوتی، تهویه و شیرهای اصلی',
      notes: 'بررسی قفل بودن درب‌های پشتی، پنجره‌ها و سیستم امنیتی کافه.',
      taskType: 'shift_end',
      role: 'both',
      createdAt: new Date().toISOString(),
    },

    // 3. تکرارشونده هفتگی (recurring_weekly)
    {
      id: 'task-weekly-1',
      title: 'جرم‌گیری عمیق ماشین ظرفشویی و رسوب‌زدایی کف آشپزخانه',
      notes: 'استفاده از قرص جرم‌گیر صنعتی و شستشوی نازل‌های آبپاش.',
      taskType: 'recurring_weekly',
      role: 'dishwasher',
      weekdays: ['شنبه', 'سه‌شنبه'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-weekly-2',
      title: 'گردگیری اساسی لوسترها، قفسه‌های دکوری و پنجره‌های سالن',
      notes: 'تمیز کردن شیشه‌های ورودی و تابلوهای دیواری سالن با شیشه‌پاک‌کن.',
      taskType: 'recurring_weekly',
      role: 'waiter',
      weekdays: ['دوشنبه'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-weekly-3',
      title: 'آبیاری و تمیز کردن برگ‌های گل‌ها و گلدان‌های سالن',
      notes: 'چک کردن رطوبت خاک و زدودن گرد و غبار از گلدان‌های بزرگ.',
      taskType: 'recurring_weekly',
      role: 'waiter',
      weekdays: ['شنبه', 'چهارشنبه'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-weekly-4',
      title: 'برفک‌زدایی و شستشوی کامل قفسه‌های یخچال و فریزر',
      notes: 'مرتب‌سازی کارتن‌های انبار و بازرسی تاریخ انقضای مواد حساس.',
      taskType: 'recurring_weekly',
      role: 'both',
      weekdays: ['جمعه'],
      createdAt: new Date().toISOString(),
    },

    // 4. کارهای یکباره (one_time)
    {
      id: 'task-onetime-1',
      title: 'تحویل بار هفتگی قهوه تخصصی و سیروپ‌های جدید',
      notes: 'چک کردن سلامت فیزیکی شیشه‌ها و درج تاریخ ورود روی پاکت‌ها.',
      taskType: 'one_time',
      role: 'both',
      fixedDate: todayStr,
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-onetime-2',
      title: 'نصب استند و تخته گچی معرفی آیتم‌های ویژه منوی بهاره',
      notes: 'نوشتن تخفیف‌های ساعت خوش و قرار دادن کنار ورودی سالن.',
      taskType: 'one_time',
      role: 'waiter',
      fixedDate: todayStr,
      completed: false,
      createdAt: new Date().toISOString(),
    },
  ];
}

/**
 * Returns initial realistic completions for demonstration and history
 */
export function getInitialTaskCompletions(): Record<string, { completed: boolean; completedAt?: string; completedBy?: string; completedByRole?: import('../types').AuthRole }> {
  const result: Record<string, { completed: boolean; completedAt?: string; completedBy?: string; completedByRole?: import('../types').AuthRole }> = {};
  
  // Get past 5 days
  const baseDate = new Date();
  // Generate sample completions for offset 0 (today) and past 4 days
  for (let offset = 0; offset < 5; offset++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - offset);
    const dayInfo = getTodayJalaliDate(d, false);
    const dayStr = dayInfo.standardString;

    if (offset === 0) {
      // Today: some completed
      result[`task-start-1_${dayStr}`] = {
        completed: true,
        completedAt: '۰۸:۴۵',
        completedBy: 'سالندار اول',
        completedByRole: 'waiter1',
      };
      result[`task-start-2_${dayStr}`] = {
        completed: true,
        completedAt: '۰۹:۱۰',
        completedBy: 'ظرفشور',
        completedByRole: 'dishwasher',
      };
      result[`task-start-3_${dayStr}`] = {
        completed: true,
        completedAt: '۰۹:۲۵',
        completedBy: 'سالندار دوم',
        completedByRole: 'waiter2',
      };
    } else if (offset === 1) {
      // Yesterday: almost all completed
      result[`task-start-1_${dayStr}`] = {
        completed: true,
        completedAt: '۰۸:۳۰',
        completedBy: 'سالندار اول',
        completedByRole: 'waiter1',
      };
      result[`task-start-2_${dayStr}`] = {
        completed: true,
        completedAt: '۰۸:۵۰',
        completedBy: 'ظرفشور',
        completedByRole: 'dishwasher',
      };
      result[`task-start-3_${dayStr}`] = {
        completed: true,
        completedAt: '۰۹:۱۵',
        completedBy: 'سالندار سوم',
        completedByRole: 'waiter3',
      };
      result[`task-start-4_${dayStr}`] = {
        completed: true,
        completedAt: '۰۹:۳۰',
        completedBy: 'سالندار اول',
        completedByRole: 'waiter1',
      };
      result[`task-start-5_${dayStr}`] = {
        completed: true,
        completedAt: '۱۰:۰۰',
        completedBy: 'ظرفشور',
        completedByRole: 'dishwasher',
      };
      result[`task-end-1_${dayStr}`] = {
        completed: true,
        completedAt: '۲۳:۱۵',
        completedBy: 'ظرفشور',
        completedByRole: 'dishwasher',
      };
      result[`task-end-2_${dayStr}`] = {
        completed: true,
        completedAt: '۲۳:۳۰',
        completedBy: 'ظرفشور',
        completedByRole: 'dishwasher',
      };
      result[`task-end-3_${dayStr}`] = {
        completed: true,
        completedAt: '۲۳:۴۰',
        completedBy: 'سالندار دوم',
        completedByRole: 'waiter2',
      };
      result[`task-end-5_${dayStr}`] = {
        completed: true,
        completedAt: '۰۰:۱۵',
        completedBy: 'مدیریت',
        completedByRole: 'manager',
      };
    } else if (offset === 2) {
      // 2 days ago
      result[`task-start-1_${dayStr}`] = {
        completed: true,
        completedAt: '۰۸:۵۰',
        completedBy: 'سالندار دوم',
        completedByRole: 'waiter2',
      };
      result[`task-start-2_${dayStr}`] = {
        completed: true,
        completedAt: '۰۹:۱۵',
        completedBy: 'ظرفشور',
        completedByRole: 'dishwasher',
      };
      result[`task-start-3_${dayStr}`] = {
        completed: true,
        completedAt: '۰۹:۴۰',
        completedBy: 'سالندار اول',
        completedByRole: 'waiter1',
      };
      result[`task-end-1_${dayStr}`] = {
        completed: true,
        completedAt: '۲۳:۲۰',
        completedBy: 'ظرفشور',
        completedByRole: 'dishwasher',
      };
      result[`task-end-4_${dayStr}`] = {
        completed: true,
        completedAt: '۲۳:۴۵',
        completedBy: 'سالندار سوم',
        completedByRole: 'waiter3',
      };
      result[`task-end-5_${dayStr}`] = {
        completed: true,
        completedAt: '۰۰:۰۵',
        completedBy: 'سالندار اول',
        completedByRole: 'waiter1',
      };
    } else if (offset === 3) {
      // 3 days ago
      result[`task-start-1_${dayStr}`] = {
        completed: true,
        completedAt: '۰۸:۴۰',
        completedBy: 'سالندار سوم',
        completedByRole: 'waiter3',
      };
      result[`task-start-2_${dayStr}`] = {
        completed: true,
        completedAt: '۰۹:۰۰',
        completedBy: 'ظرفشور',
        completedByRole: 'dishwasher',
      };
      result[`task-start-4_${dayStr}`] = {
        completed: true,
        completedAt: '۰۹:۳۰',
        completedBy: 'سالندار اول',
        completedByRole: 'waiter1',
      };
      result[`task-end-1_${dayStr}`] = {
        completed: true,
        completedAt: '۲۳:۱۰',
        completedBy: 'ظرفشور',
        completedByRole: 'dishwasher',
      };
      result[`task-end-2_${dayStr}`] = {
        completed: true,
        completedAt: '۲۳:۳۰',
        completedBy: 'ظرفشور',
        completedByRole: 'dishwasher',
      };
      result[`task-end-3_${dayStr}`] = {
        completed: true,
        completedAt: '۲۳:۵۰',
        completedBy: 'سالندار دوم',
        completedByRole: 'waiter2',
      };
    } else if (offset === 4) {
      // 4 days ago
      result[`task-start-1_${dayStr}`] = {
        completed: true,
        completedAt: '۰۸:۳۵',
        completedBy: 'سالندار اول',
        completedByRole: 'waiter1',
      };
      result[`task-start-2_${dayStr}`] = {
        completed: true,
        completedAt: '۰۹:۰۵',
        completedBy: 'ظرفشور',
        completedByRole: 'dishwasher',
      };
      result[`task-start-3_${dayStr}`] = {
        completed: true,
        completedAt: '۰۹:۲۰',
        completedBy: 'سالندار دوم',
        completedByRole: 'waiter2',
      };
      result[`task-start-5_${dayStr}`] = {
        completed: true,
        completedAt: '۰۹:۵۵',
        completedBy: 'ظرفشور',
        completedByRole: 'dishwasher',
      };
      result[`task-end-1_${dayStr}`] = {
        completed: true,
        completedAt: '۲۳:۰۵',
        completedBy: 'ظرفشور',
        completedByRole: 'dishwasher',
      };
      result[`task-end-5_${dayStr}`] = {
        completed: true,
        completedAt: '۰۰:۱۰',
        completedBy: 'مدیریت',
        completedByRole: 'manager',
      };
    }
  }

  return result;
}

