import React from 'react';
import { 
  Monitor, 
  Terminal, 
  Download, 
  Database, 
  Key, 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink, 
  Settings, 
  Laptop, 
  AlertCircle,
  FileText,
  PlayCircle
} from 'lucide-react';

interface WindowsGuideProps {
  onOpenSettings: () => void;
}

export const WindowsGuide: React.FC<WindowsGuideProps> = ({ onOpenSettings }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn" dir="rtl">
      
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900/60 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-2">
              <Laptop className="w-3.5 h-3.5" />
              <span>قدم اول: راهنمای گام به گام کاربر</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
              چگونه این نرم‌افزار را در کامپیوتر خودم اجرا کنم و به Supabase متصل شوم؟
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              این سامانه با زبان مدرن <span className="text-indigo-400 font-semibold">TypeScript & React</span> بازنویسی شده تا دقیقاً جایگزین اپلیکیشن اندروید کاتلین شما شود. در ادامه دو گام ساده برای اجرا روی ویندوز و اتصال به دیتابیس ابری توضیح داده شده است.
            </p>
          </div>

          <button
            onClick={onOpenSettings}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 transition-all shrink-0 w-full md:w-auto cursor-pointer"
          >
            <Settings className="w-4 h-4 animate-spin-slow" />
            <span>وارد کردن کلید Supabase همین الان</span>
          </button>
        </div>
      </div>

      {/* Special Callout for the user screenshot error */}
      <div className="bg-rose-950/40 border-2 border-rose-500/50 rounded-3xl p-6 shadow-2xl space-y-3 animate-pulse">
        <div className="flex items-center gap-2 text-rose-300 font-black text-base">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>پاسخ به خطای تصویر شما: چرا ارور «'vite' is not recognized» داد؟</span>
        </div>
        <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
          این خطا در ویندوز به این معنی است که <strong>کتابخانه‌های پروژه (پوشه node_modules) هنوز دانلود نشده‌اند.</strong> برای حل دائمی این مشکل، ما فایل اسکریپت را بروزرسانی کردیم. اکنون فقط کافی است:
        </p>
        <div className="bg-slate-950 p-4 rounded-2xl border border-rose-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <span className="text-slate-100 font-medium">
            ۱. پروژه را دوباره از بالا (Download ZIP) دانلود کرده و Extract کنید.<br/>
            ۲. روی فایل <code className="text-amber-300 font-bold font-mono">START_ON_WINDOWS.bat</code> دابل کلیک کنید.
          </span>
          <span className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl font-bold text-center shrink-0">
            خودش اتوماتیک کتابخانه‌ها را نصب می‌کند!
          </span>
        </div>
      </div>

      {/* Step 1: Running on Windows PC */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
        <div className="flex items-center gap-3.5 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-lg">
            ۱
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">نحوه دانلود و اجرا روی کامپیوتر شخصی (Windows PC)</h3>
            <p className="text-xs text-slate-400 mt-0.5">شما می‌توانید این برنامه را به صورت آفلاین یا تحت شبکه داخلی روی ویندوز اجرا کنید</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Method A: Standard Web/Node */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-amber-500/40 shadow-xl space-y-4 relative">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black animate-pulse">
              <PlayCircle className="w-4 h-4 text-amber-400" />
              <span>روش اتوماتیک ۱ کلیکی (ویژه ویندوز شما - پیشنهاد فوق‌العاده)</span>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              با توجه به تصویر پوشه شما، ما یک اسکریپت هوشمند به نام <code className="bg-amber-500/20 px-2 py-0.5 rounded text-amber-300 font-mono font-bold text-sm">START_ON_WINDOWS.bat</code> داخل پروژه قرار داده‌ایم که خودش بررسی می‌کند Node.js نصب هست یا نه و اگر نباشد اتوماتیک دانلود می‌کند!
            </p>

            <ol className="space-y-3.5 text-xs md:text-sm text-slate-300 leading-relaxed list-decimal list-inside bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              <li className="pl-1">
                در همین پوشه‌ای که باز کرده‌اید، فایل <strong className="text-amber-400 font-mono text-sm">START_ON_WINDOWS.bat</strong> را پیدا کرده و روی آن <strong className="text-white underline">دابل کلیک (Double Click)</strong> کنید.
              </li>
              <li className="pl-1">
                یک پنجره سیاه (کنسول ویندوز) باز می‌شود. اگر Node.js نصب نباشد، <strong className="text-emerald-400">خودش اتوماتیک شروع به دانلود و نصب می‌کند</strong> (یا لینک دانلود سریع را برای شما باز می‌کند که با Next زدن نصبش کنید).
              </li>
              <li className="pl-1">
                پس از بررسی، خودش اتوماتیک کتابخانه‌ها را نصب کرده و مرورگر شما را روی آدرس <code className="text-amber-300 font-bold font-mono">http://localhost:3000</code> باز می‌کند!
              </li>
            </ol>

            <div className="bg-emerald-950/30 border border-emerald-500/30 p-3 rounded-xl flex items-center gap-2 text-emerald-300 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>دیگر نیازی به تایپ هیچ دستوری در CMD یا Terminal ندارید!</span>
            </div>
          </div>

          {/* Method B: Independent EXE */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800/80 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-400 text-xs font-bold">
                <Download className="w-3.5 h-3.5" />
                <span>تبدیل به فایل نصبی ویندوز (.EXE مستقل)</span>
              </div>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                چون این پروژه استاندارد تحت وب است، شما می‌توانید آن را به کمک فریم‌ورک‌های سبک مثل <strong className="text-sky-400">Tauri</strong> یا <strong className="text-sky-400">Electron</strong> به یک فایل اجرایی مستقل <code className="text-amber-300">App.exe</code> تبدیل کنید تا مثل یک نرم‌افزار دسکتاپ معمولی روی دسکتاپ ویندوز آیکون داشته باشد و بدون نیاز به مرورگر باز شود.
              </p>
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2 text-xs font-mono text-slate-400 text-left" dir="ltr">
                <p className="text-slate-500">// ساخت فایل اجرایی ویندوز با ابزار Tauri:</p>
                <p className="text-slate-300">npm install -g @tauri-apps/cli</p>
                <p className="text-sky-400">npx tauri init</p>
                <p className="text-emerald-400">npx tauri build</p>
              </div>
            </div>

            <div className="bg-sky-950/20 border border-sky-500/20 p-3.5 rounded-xl flex items-start gap-2.5 mt-4">
              <AlertCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-300 leading-normal">
                مزیت نسخه دسکتاپ: سرعت دسترسی فوری کارگران و مهندسین در کارگاه بدون نیاز به اینترنت (در صورت کار در حالت Local Storage آفلاین).
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Step 2: Connecting to Supabase */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
        <div className="flex items-center gap-3.5 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-lg">
            ۲
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">چرا پیغام «خطا در اتصال / آفلاین» می‌دهد و چطور به Supabase وصل شود؟</h3>
            <p className="text-xs text-slate-400 mt-0.5">اتصال زنده به همان دیتابیس ابری که اپلیکیشن اندروید کاتلین به آن متصل بود</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs md:text-sm">
          
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <Database className="w-4 h-4" />
              <span>گام ۱: ورود به پنل Supabase</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">
              در مرورگر به سایت <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-amber-400 underline inline-flex items-center gap-1">supabase.com <ExternalLink className="w-3 h-3" /></a> رفته و وارد حساب کاربری خود شوید. پروژه دیتابیس مربوط به سایلنت باکس ماینر را باز کنید.
            </p>
          </div>

          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Key className="w-4 h-4" />
              <span>گام ۲: کپی کردن کلیدهای API</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">
              از منوی سمت چپ پنل سوپابیس، روی روی چرخ‌دنده <strong className="text-white">Project Settings</strong> و سپس گزینه <strong className="text-white">API</strong> کلیک کنید. دو مقدار زیر را کپی کنید:
            </p>
            <ul className="list-disc list-inside text-[11px] text-slate-400 font-mono space-y-1 bg-slate-900 p-2.5 rounded-lg border border-slate-800" dir="ltr">
              <li>Project URL (https://...)</li>
              <li>anon / public key (eyJhbG...)</li>
            </ul>
          </div>

          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>گام ۳: ثبت در این نرم‌افزار</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">
              در همین صفحه (در بالا گوشه چپ)، روی دکمه <strong className="text-indigo-300">«تنظیمات اتصال»</strong> کلیک کنید. آدرس URL و کلید کپی شده را پیست کرده و ذخیره را بزنید. کل اطلاعات شما بلافاصله همگام‌سازی می‌شود!
            </p>
          </div>

        </div>

        {/* Big action CTA inside guide */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-right">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">آیا کلیدهای Supabase را آماده دارید؟</h4>
              <p className="text-xs text-slate-400 mt-0.5">روی دکمه مقابل کلیک کنید تا کادر ورود اطلاعات باز شود</p>
            </div>
          </div>

          <button
            onClick={onOpenSettings}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <span>باز کردن پنجره تنظیمات اتصال</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>
        </div>
      </div>

      {/* Comparison table Kotlin vs TypeScript */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-400" />
          <span>تضمین سازگاری ۱۰۰٪ با کدهای اندروید سابق شما</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          در اپلیکیشن اندروید شما کلاسی به نام <code className="text-amber-300">SupabaseClient.kt</code> وجود داشت که درخواست‌های کوئری دیتابیس را مدیریت می‌کرد. در این سیستم تمام آن منطق به صورت مستقیم در فایل <code className="text-indigo-300">src/services/supabase.ts</code> پیاده‌سازی شده است. بنابراین وقتی شما رکوردی از متریال یا فرمول BOM را در این نرم‌افزار ویندوزی ویرایش می‌کنید، دقیقاً همان جدول‌های سوپابیس بروزرسانی شده و در صورت اجرای مجدد اپلیکیشن اندروید قدیمی روی گوشی، تغییرات آنجا هم دیده خواهد شد!
        </p>
      </div>

    </div>
  );
};
