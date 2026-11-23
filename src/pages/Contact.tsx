import { Mail, MessageCircle, Send } from "lucide-react";
import SEO from "@/components/SEO";
import ContactForm from "@/components/ContactForm";

const Contact = () => {
  return (
    <>
      <SEO
        title="Contact — Affiliate Guidance"
        description="যেকোনো প্রশ্ন, collaboration বা feedback — সরাসরি মেসেজ করুন। সাধারণত ২৪ ঘণ্টার মধ্যে reply দেই।"
        canonical="/contact"
      />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 mesh-bg opacity-60" />
        <div className="container-app py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
            GET IN TOUCH
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight">
            চলুন <span className="gradient-text">কথা বলি</span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto font-bangla">
            যেকোনো প্রশ্ন, collaboration বা feedback — সরাসরি মেসেজ করুন। সাধারণত ২৪ ঘণ্টার মধ্যে reply দেই।
          </p>
        </div>
      </section>

      <section className="container-app pb-20">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="md:col-span-1 space-y-4">
            {[
              { icon: Mail, title: "Email", value: "hello@affiliateguidance.com" },
              { icon: MessageCircle, title: "WhatsApp", value: "+880 1XXX-XXXXXX" },
              { icon: Send, title: "Telegram", value: "@affiliateguidance" },
            ].map((c) => (
              <div key={c.title} className="card-premium p-5">
                <div className="h-10 w-10 rounded-lg bg-primary/10 grid place-items-center mb-3">
                  <c.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{c.title}</p>
                <p className="font-semibold text-sm mt-1">{c.value}</p>
              </div>
            ))}
          </div>

          <div className="md:col-span-2">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
