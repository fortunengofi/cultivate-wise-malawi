import { Link } from "react-router-dom";
import { Leaf, Mail, Phone, User } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="mt-12 border-t border-border bg-card/50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg gradient-earth flex items-center justify-center">
                <Leaf size={16} className="text-primary-foreground" />
              </div>
              <span className="font-serif font-bold text-foreground">{t("appName")}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("footerBlurb")}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-sm text-foreground mb-2">{t("footerApp")}</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/soil" className="text-muted-foreground hover:text-primary">{t("navFarmAI")}</Link></li>
              <li><Link to="/market" className="text-muted-foreground hover:text-primary">{t("navMarket")}</Link></li>
              <li><Link to="/insights" className="text-muted-foreground hover:text-primary">{t("profitInsights")}</Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-primary">{t("footerDeveloper")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm text-foreground mb-2">{t("footerDeveloper")}</h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-2"><User size={12} /> Fortune Mwangofi</li>
              <li className="flex items-center gap-2">
                <Phone size={12} />
                <a href="tel:+265990091139" className="hover:text-primary">0990 091 139</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={12} />
                <a href="mailto:fortunengofi@gmail.com" className="hover:text-primary break-all">fortunengofi@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {t("appName")}. {t("footerRights")}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
