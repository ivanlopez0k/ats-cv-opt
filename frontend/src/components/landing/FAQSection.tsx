'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useI18n } from '@/i18n';

const FAQ_KEYS = ['q1', 'q2', 'q3', 'q4'];

function FAQItem({ questionKey }: { questionKey: string }) {
   const [open, setOpen] = useState(false);
   const { t } = useI18n();

   return (
     <div className="border border-border rounded-lg overflow-hidden transition-colors hover:border-border/80">
       <button
         onClick={() => setOpen(!open)}
         className="w-full flex items-center justify-between p-5 text-left hover:bg-secondary/50 transition-colors"
       >
         <span className="text-foreground font-medium pr-4">{t(`landing.faq.questions.${questionKey}`)}</span>
         <motion.div
           animate={{ rotate: open ? 180 : 0 }}
           transition={{ duration: 0.2 }}
           className="shrink-0"
         >
           <ChevronDown className="h-5 w-5 text-muted-foreground" />
         </motion.div>
       </button>
       <AnimatePresence>
         {open && (
           <motion.div
             initial={{ height: 0, opacity: 0 }}
             animate={{ height: 'auto', opacity: 1 }}
             exit={{ height: 0, opacity: 0 }}
             transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
           >
             <div className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed border-t border-border/50 pt-4">
               {t(`landing.faq.questions.${questionKey}Desc`)}
             </div>
           </motion.div>
         )}
       </AnimatePresence>
     </div>
   );
}

export function FAQSection() {
  const { t } = useI18n();

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('landing.faq.title')}
          </h2>
          <p className="text-muted-foreground">
            {t('landing.faq.subtitle')}
          </p>
        </div>
        <div className="space-y-3">
          {FAQ_KEYS.map((key) => (
            <FAQItem key={key} questionKey={key} />
          ))}
        </div>
      </div>
    </section>
  );
}