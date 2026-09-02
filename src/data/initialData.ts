import { Category, RequirementItem } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'kitchen',
    name: 'آشپزخانه',
    subcategories: [
      {
        id: 'main-sauces',
        name: 'سس‌های اصلی',
        items: [
          { id: 'sauce-alfredo', name: 'سس آلفردو', type: 'level', value: 'medium', description: 'دست‌ساز مخصوص پاستا', unit: 'ظرف' },
          { id: 'sauce-white', name: 'سس سفید', type: 'level', value: 'medium', description: 'دست‌ساز', unit: 'ظرف' },
          { id: 'sauce-red', name: 'سس قرمز', type: 'level', value: 'medium', description: 'دست‌ساز', unit: 'ظرف' },
          { id: 'sauce-spicy', name: 'سس تند', type: 'level', value: 'full', description: 'صنعتی', unit: 'بطری' },
          { id: 'sauce-caesar', name: 'سس سزار', type: 'level', value: 'medium', description: 'دست‌ساز روزانه', unit: 'ظرف' }
        ]
      },
      {
        id: 'fresh-fridge',
        name: 'مواد تازه و یخچالی',
        items: [
          { id: 'basil', name: 'ریحان تازه', type: 'level', value: 'medium', description: 'پاک شده و شسته شده', unit: 'بسته' },
          { id: 'cherry-tomato', name: 'گوجه گیلاسی', type: 'level', value: 'low', description: 'شسته شده و آماده مصرف', unit: 'ظرف' },
          { id: 'lettuce', name: 'کاهو فرانسوی/بیس‌بیس تازه', type: 'level', value: 'medium', description: 'ضدعفونی شده و آبکش‌شده', unit: 'سبد' },
          { id: 'tomato', name: 'گوجه فرنگی گلخانه‌ای', type: 'numeric', value: 4, description: 'جعبه ۵ کیلویی درجه یک', unit: 'کیلو' },
          { id: 'cream-cheese', name: 'پنیر خامه‌ای صبحانه', type: 'numeric', value: 0, description: 'قالب‌های ۱ کیلویی', unit: 'بسته' }
        ]
      },
      {
        id: 'freezer',
        name: 'مواد فریزری',
        items: [
          { id: 'pizza-dough', name: 'خمیر پیتزا', type: 'numeric', value: 15, description: 'چونه‌های ۲۵۰ گرمی آماده', unit: 'عدد' },
          { id: 'pizza-cheese', name: 'پنیر پیتزا مطهر', type: 'numeric', value: 3, description: 'بسته ۲ کیلویی', unit: 'بسته' },
          { id: 'pizza-cheese-40', name: 'پنیر پیتزا ۴۰ گرمی', type: 'numeric', value: 20, description: 'بسته‌های تک نفره', unit: 'عدد' },
          { id: 'pizza-cheese-80', name: 'پنیر پیتزا ۸۰ گرمی', type: 'numeric', value: 12, description: 'بسته‌های دو نفره', unit: 'عدد' },
          { id: 'beef-burger', name: 'برگر گوشت', type: 'numeric', value: 8, description: 'دست‌ساز ۹۰ گرمی', unit: 'عدد' },
          { id: 'chicken-burger', name: 'برگر مرغ', type: 'numeric', value: 6, description: 'دست‌ساز ۹۰ گرمی', unit: 'عدد' },
          { id: 'steak-meat', name: 'گوشت استیکی', type: 'numeric', value: 4, description: 'برش‌های مرینیت شده', unit: 'پرس' },
          { id: 'pasta-chicken', name: 'مرغ پاستا', type: 'numeric', value: 5, description: 'بسته‌بندی فیله مرینیت شده', unit: 'بسته' },
          { id: 'caesar-fillet', name: 'فیله سزار', type: 'numeric', value: 10, description: 'سوخاری شده آماده', unit: 'عدد' },
          { id: 'pepperoni', name: 'پپرونی', type: 'numeric', value: 2, description: 'رول یک کیلویی', unit: 'کیلو' },
          { id: 'chopped-ham', name: 'ژامبون خردشده', type: 'numeric', value: 3, description: 'آماده پیتزا', unit: 'بسته' },
          { id: 'bell-pepper', name: 'فلفل دلمه‌ای', type: 'numeric', value: 2, description: 'خلالی خرد شده', unit: 'کیلو' },
          { id: 'garlic', name: 'سیر تازه', type: 'level', value: 'medium', description: 'پوست کنده', unit: 'ظرف' },
          { id: 'garlic-toast', name: 'نان تست سیر', type: 'numeric', value: 14, description: 'برش‌های آماده فر', unit: 'عدد' },
          { id: 'sausage', name: 'سوسیس فرانکفورتر', type: 'numeric', value: 4, description: 'بسته ۸ تایی', unit: 'بسته' },
          { id: 'potato', name: 'سیب‌زمینی نیمه‌آماده', type: 'numeric', value: 5, description: 'کیسه ۲.۵ کیلویی', unit: 'کیسه' }
        ]
      }
    ]
  },
  {
    id: 'storage',
    name: 'انبار',
    subcategories: [
      {
        id: 'cold-drinks-dairy',
        name: 'نوشیدنی و لبنیات سرد',
        items: [
          { id: 'milk-full-fat', name: 'شیر پرچرب کاله', type: 'numeric', value: 24, description: 'باکس ۱۲ عددی ۱ لیتری', unit: 'بطری' },
          { id: 'milk-low-fat', name: 'شیر کم‌چرب', type: 'numeric', value: 6, description: '۱ لیتری', unit: 'بطری' },
          { id: 'sparkling-water', name: 'آب‌گازدار', type: 'numeric', value: 18, description: 'بطری شیشه‌ای', unit: 'بطری' },
          { id: 'cream', name: 'خامه قنادی/صبحانه', type: 'numeric', value: 8, description: 'پاکت صورتی ۲۰۰ میلی', unit: 'پاکت' },
          { id: 'orange-juice', name: 'آب‌پرتقال طبیعی', type: 'numeric', value: 3, description: 'بطری ۲ لیتری', unit: 'بطری' },
          { id: 'coke', name: 'نوشابه مشکی کوکاکولا', type: 'numeric', value: 24, description: 'قوطی ۳۳۰ میلی', unit: 'قوطی' },
          { id: 'sevenup', name: 'نوشابه سون‌آپ', type: 'numeric', value: 12, description: 'قوطی ۳۳۰ میلی', unit: 'قوطی' },
          { id: 'fanta', name: 'نوشابه فانتا زرد', type: 'numeric', value: 12, description: 'قوطی ۳۳۰ میلی', unit: 'قوطی' },
          { id: 'malt-tropical', name: 'دلستر استوایی', type: 'numeric', value: 10, description: 'شیشه‌ای', unit: 'بطری' },
          { id: 'malt-lemon', name: 'دلستر لیمو', type: 'numeric', value: 10, description: 'شیشه‌ای', unit: 'بطری' },
          { id: 'malt-peach', name: 'دلستر هلو', type: 'numeric', value: 8, description: 'شیشه‌ای', unit: 'بطری' },
          { id: 'water', name: 'آب معدنی کوچک', type: 'numeric', value: 48, description: 'باکس ۲۴ تایی', unit: 'بطری' }
        ]
      },
      {
        id: 'dry-goods',
        name: 'مواد خشک و اولیه',
        items: [
          { id: 'biscuit', name: 'بیسکویت پتی‌بور', type: 'level', value: 'full', description: 'کارتن اصلی انبار', unit: 'کارتن' },
          { id: 'flour', name: 'آرد مخصوص پیتزا و کیک', type: 'level', value: 'medium', description: 'کیسه ۲۵ کیلویی', unit: 'کیسه' },
          { id: 'sugar', name: 'شکر سفید', type: 'level', value: 'full', description: 'کیسه ۵۰ کیلویی', unit: 'کیسه' },
          { id: 'coffee', name: 'دانه قهوه اسپرسو (بلند اصلی)', type: 'level', value: 'medium', description: 'پاکت‌های ۱ کیلویی عربیکا', unit: 'کیلو' },
          { id: 'spices', name: 'مجموعه ادویه‌جات', type: 'level', value: 'full', description: 'اورگانو، فلفل سیاه، پاپریکا', unit: 'ظرف' },
          { id: 'oil', name: 'روغن زیتون فرابکر', type: 'numeric', value: 2, description: 'بطری ۱ لیتری حلب', unit: 'بطری' },
          { id: 'lemon-juice', name: 'آب‌لیمو طبیعی', type: 'numeric', value: 4, description: 'بطری شیشه‌ای ۱ لیتری', unit: 'بطری' }
        ]
      },
      {
        id: 'cleaning',
        name: 'نظافت و بهداشتی',
        items: [
          { id: 'domestos', name: 'مایع سفیدکننده دامستوس', type: 'numeric', value: 3, description: 'بطری بزرگ ضدعفونی سطوح', unit: 'بطری' },
          { id: 'glass-cleaner', name: 'شیشه‌پاک‌کن اتک', type: 'numeric', value: 0, description: 'مخصوص شیشه و آینه‌ها', unit: 'بطری' },
          { id: 'multi-purpose', name: 'اسپری چندمنظوره', type: 'numeric', value: 2, description: 'تمیزکننده چربی میز و کانتر', unit: 'بطری' },
          { id: 'laundry-powder', name: 'پودر ماشین لباسشویی', type: 'numeric', value: 2, description: 'مخصوص شستشوی حوله و دستمال‌ها', unit: 'بسته' },
          { id: 'hand-wash-powder', name: 'مایع دستشویی گالنی', type: 'numeric', value: 1, description: 'گالن ۴ لیتری سرویس بهداشتی', unit: 'گالن' },
          { id: 'black-trash-bag', name: 'کیسه زباله بزرگ مشکی', type: 'numeric', value: 5, description: 'رول سایز ۱۰۰ در ۱۲۰', unit: 'رول' },
          { id: 'regular-trash-bag', name: 'کیسه زباله معمولی', type: 'numeric', value: 4, description: 'سایز متوسط برای سطل‌های سالن', unit: 'رول' },
          { id: 'paper-towel', name: 'دستمال کاغذی جعبه‌ای', type: 'numeric', value: 12, description: 'بسته‌های ۲۰۰ برگ سالن', unit: 'جعبه' },
          { id: 'paper-roll', name: 'دستمال حوله‌ای لوله‌ای', type: 'numeric', value: 8, description: 'برای خشک کردن دست بار و آشپزخانه', unit: 'رول' },
          { id: 'catering-napkin', name: 'دستمال کاغذی کترینگ', type: 'numeric', value: 6, description: 'بسته‌های بزرگ همراه غذا', unit: 'بسته' }
        ]
      },
      {
        id: 'disposables',
        name: 'یکبارمصرف بار و بیرون‌بر',
        items: [
          { id: 'straw-shake', name: 'نی شیک قطور', type: 'boolean', value: true, description: 'بسته ۵۰۰ تایی', unit: 'بسته' },
          { id: 'straw-thin', name: 'نی نازک نوشیدنی سرد', type: 'boolean', value: true, description: 'بسته ۱۰۰۰ تایی', unit: 'بسته' },
          { id: 'straw-thick', name: 'نی کاغذی اکو', type: 'boolean', value: false, description: 'تمام شده - نیاز به خرید', unit: 'بسته' }
        ]
      }
    ]
  },
  {
    id: 'bar',
    name: 'بار سرد و گرم',
    subcategories: [
      {
        id: 'icecream-dairy',
        name: 'بستنی و لبنیات بار',
        items: [
          { id: 'icecream-banana', name: 'بستنی موزی', type: 'numeric', value: 2, description: 'ظرف ۵ لیتری سنتی/جلاتی', unit: 'ظرف' },
          { id: 'icecream-chocolate', name: 'بستنی شکلاتی', type: 'numeric', value: 3, description: 'ظرف ۵ لیتری', unit: 'ظرف' },
          { id: 'icecream-vanilla', name: 'بستنی وانیل فرانسوی', type: 'numeric', value: 4, description: 'ظرف ۵ لیتری پایه شیک‌ها', unit: 'ظرف' },
          { id: 'icecream-nescafe', name: 'بستنی نسکافه', type: 'numeric', value: 1, description: 'ظرف ۵ لیتری', unit: 'ظرف' },
          { id: 'vanilla-milk', name: 'شیر وانیل آماده', type: 'level', value: 'medium', description: 'ترکیب روزانه بارتندر', unit: 'پارچ' }
        ]
      },
      {
        id: 'syrups-sauces',
        name: 'سیروپ و سس‌های بار',
        items: [
          { id: 'syrup-lemon', name: 'سیروپ لیمو (مونین)', type: 'numeric', value: 2, description: 'شیشه ۷۰۰ میلی‌لیتری', unit: 'شیشه' },
          { id: 'syrup-vanilla', name: 'سیروپ وانیل ماداگاسکار', type: 'numeric', value: 3, description: 'شیشه ۷۰۰ میلی‌لیتری', unit: 'شیشه' },
          { id: 'syrup-hazelnut', name: 'سیروپ فندق روست شده', type: 'numeric', value: 1, description: 'شیشه ۷۰۰ میلی‌لیتری', unit: 'شیشه' },
          { id: 'caramel-sauce', name: 'سس کارامل هیرشیز', type: 'numeric', value: 2, description: 'بطری فشاری ۱ کیلویی', unit: 'بطری' },
          { id: 'chocolate-sauce-large', name: 'سس شکلات بزرگ', type: 'numeric', value: 2, description: 'گالن ۲.۵ کیلویی لاین موکا', unit: 'گالن' },
          { id: 'chocolate-sauce-small', name: 'سس شکلات کوچک تزئینی', type: 'numeric', value: 3, description: 'قوطی فشاری ۵۰۰ گرمی', unit: 'بطری' }
        ]
      },
      {
        id: 'fruits',
        name: 'میوه و سبزیجات بار',
        items: [
          { id: 'lemon', name: 'لیمو ترش سنگی', type: 'level', value: 'low', description: 'اسلایس شده برای موهیتو و چای', unit: 'ظرف' },
          { id: 'mint', name: 'برگ نعنا تازه', type: 'level', value: 'medium', description: 'شسته و ساقه‌گیری شده', unit: 'ظرف' },
          { id: 'garnish-fruit', name: 'میوه گارنیش فصلی', type: 'level', value: 'medium', description: 'توت‌فرنگی و پرتقال خشک', unit: 'ظرف' },
          { id: 'banana', name: 'موز تازه شیرموز', type: 'numeric', value: 6, description: 'کیلوگرم درجه یک', unit: 'کیلو' }
        ]
      },
      {
        id: 'misc-bar',
        name: 'متفرقه بار',
        items: [
          {
            id: 'flowerpot-crumble',
            name: 'خاک‌گلدون',
            type: 'level',
            value: 'medium',
            description: 'بیسکویت پتی‌بور پودر شده، برای گلدون شکلاتی',
            unit: 'ظرف'
          }
        ]
      }
    ]
  }
];

export const INITIAL_REQUIREMENTS: RequirementItem[] = [
  {
    id: 'req-1',
    text: 'شیشه‌پاک‌کن نداریم (خرید فوری)',
    createdAt: new Date().toISOString()
  },
  {
    id: 'req-2',
    text: 'لیمو ترش تازه نیاز داریم بخریم',
    createdAt: new Date().toISOString()
  }
];

export const STORAGE_KEY_CATEGORIES = 'cafe_inventory_categories_v2';
export const STORAGE_KEY_REQUIREMENTS = 'cafe_inventory_shift_requirements_v2';
