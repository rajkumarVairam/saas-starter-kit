import { motion } from "motion/react";

const steps = [
  {
    step: "01",
    title: "Clone & Install",
    description:
      "Clone the repo, run pnpm install, copy .env.example to .env.local and fill in your service keys.",
  },
  {
    step: "02",
    title: "Configure & Brand",
    description:
      "Edit config/site.ts with your product name and links. Push your DB schema. Done — everything else follows automatically.",
  },
  {
    step: "03",
    title: "Build & Ship",
    description:
      "Deploy to Vercel in one click. Auth, billing, email, and admin are live from day one. Add your own features on top.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="w-full py-24 md:py-32 relative overflow-hidden isolate"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
           <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
           >
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                    From Zero to <br/>
                    <span className="text-primary">Production</span>
                </h2>
                <p className="text-muted-foreground text-lg md:text-xl max-w-[600px]">
                    We&apos;ve done the infrastructure work so you can focus on your actual product.
                </p>
           </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
              className="relative group"
            >
              <div className="mb-6 relative">
                 <span className="text-8xl font-bold text-muted/20 group-hover:text-primary/10 transition-colors duration-500 block">
                    {step.step}
                 </span>
                 <div className="absolute bottom-4 left-2 w-12 h-1 bg-primary rounded-full"></div>
              </div>
              <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
