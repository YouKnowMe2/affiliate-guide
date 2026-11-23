import { Link } from "react-router-dom";
import { ArrowRight, Award, Heart, Target, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import founder from "@/assets/founder.jpg";
import SEO from "@/components/SEO";

const About = () => (
  <>
    <SEO
      title="About — Affiliate Guidance"
      description="Affiliate Guidance-এর গল্প — কীভাবে শূন্য থেকে শুরু করে বাংলাভাষীদের জন্য affiliate marketing শেখানোর mission শুরু করেছি।"
      canonical="/about"
    />
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 mesh-bg opacity-60" />
      <div className="container-app py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
              MY STORY
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight">
              একজন <span className="gradient-text">ব্যর্থ</span> ছেলে থেকে <span className="gradient-text">শিক্ষক</span> হয়ে উঠার গল্প
            </h1>
            <p className="mt-5 text-muted-foreground font-bangla text-lg leading-relaxed">
              আমি Rakib Hasan। ২০২০ সালে ৩টা job rejection-এর পর সিদ্ধান্ত নিলাম — অনলাইনেই কিছু করব। আজকের Affiliate Guidance সেই journey-এর ফসল।
            </p>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-primary opacity-25 blur-3xl rounded-full" />
            <div className="relative card-premium p-2 max-w-md mx-auto">
              <img src={founder} alt="Rakib Hasan" loading="lazy" width={800} height={800} className="rounded-xl w-full" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="section-pad">
      <div className="container-app max-w-3xl">
        <div className="space-y-12 font-bangla text-[17px] leading-[1.85] text-muted-foreground">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">শুরুটা ছিল কঠিন</h2>
            <p>
              ২০২০-এ যখন প্রথম affiliate marketing শুরু করি, কোনো mentor ছিল না। YouTube থেকে English video দেখে দেখে শিখতাম।
              প্রথম ৮ মাসে আয় ছিল মাত্র $৫। অনেকবার ছেড়ে দিতে চেয়েছি।
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">Turning Point</h2>
            <p>
              ২০২১-এর শেষে যখন একটি micro-niche site নিয়ে seriously কাজ করলাম — SEO, content quality, email funnel —
              ৬ মাসে $1000/month milestone touch করি। তারপর আর পেছনে তাকাইনি।
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">কেন Affiliate Guidance?</h2>
            <p>
              বাংলাভাষী beginner-দের যেন আমার মতো ৮ মাস waste না করতে হয় — সেজন্যই এই platform। এখানে যা শেখাই, সব real experience থেকে।
              Theory নয়, practical knowledge।
            </p>
          </div>
        </div>
      </div>
    </section>

    <section className="section-pad bg-surface">
      <div className="container-app">
        <div className="grid md:grid-cols-4 gap-5">
          {[
            { icon: Users, value: "১০,০০০+", label: "Students Taught" },
            { icon: Award, value: "$৫০K+", label: "Personal Earnings" },
            { icon: Target, value: "১২০+", label: "In-depth Articles" },
            { icon: Heart, value: "৯৮%", label: "Reader Satisfaction" },
          ].map((s) => (
            <div key={s.label} className="card-premium p-6 text-center">
              <div className="h-12 w-12 mx-auto rounded-xl bg-gradient-primary grid place-items-center mb-3 shadow-premium-glow">
                <s.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="font-display text-3xl font-bold">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="section-pad">
      <div className="container-app text-center max-w-2xl mx-auto">
        <h2 className="font-display text-3xl md:text-5xl font-bold">Let's <span className="gradient-text">Connect</span></h2>
        <p className="mt-4 text-muted-foreground font-bangla">আপনার affiliate journey-এ help চাইলে সরাসরি মেসেজ করুন।</p>
        <Button variant="cta" size="lg" className="mt-6" asChild>
          <Link to="/contact">Contact Me <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </div>
    </section>
  </>
);

export default About;
