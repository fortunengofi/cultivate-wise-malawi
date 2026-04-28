import { motion } from "framer-motion";
import { Mail, Phone, User, Leaf, Code2 } from "lucide-react";

const About = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-20 h-20 mx-auto rounded-2xl gradient-earth flex items-center justify-center mb-4">
          <Code2 size={36} className="text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-foreground">About the Developer</h1>
        <p className="text-muted-foreground mt-2">The person behind Ulimi Wanzeru</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl p-6 sm:p-8 shadow-card border border-border"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full gradient-harvest flex items-center justify-center text-2xl font-bold text-foreground">
            FM
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Fortune Mwangofi</h2>
            <p className="text-sm text-muted-foreground">Founder & Developer</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          Fortune Mwangofi built <strong className="text-foreground">Ulimi Wanzeru</strong> to empower Malawian smallholder
          farmers with AI-powered soil analysis, market access, financial tracking, and direct
          buyer-seller communication — all from a phone.
        </p>

        <div className="space-y-3">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <User size={16} /> Get in Touch
          </h3>

          <a
            href="tel:+265990091139"
            className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="w-10 h-10 rounded-lg gradient-earth flex items-center justify-center">
              <Phone size={18} className="text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="font-semibold text-foreground">0990 091 139</p>
            </div>
          </a>

          <a
            href="mailto:fortunengofi@gmail.com"
            className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="w-10 h-10 rounded-lg gradient-harvest flex items-center justify-center">
              <Mail size={18} className="text-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-semibold text-foreground break-all">fortunengofi@gmail.com</p>
            </div>
          </a>
        </div>

        <div className="mt-6 p-4 rounded-xl gradient-earth flex items-start gap-3">
          <Leaf size={20} className="text-primary-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-primary-foreground/90 leading-relaxed">
            Have feedback, ideas, or partnership requests? Reach out anytime — every farmer's
            voice helps shape the future of Ulimi Wanzeru.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default About;
