import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "en" | "ny";

const dict = {
  en: {
    appName: "Farm Link",
    tagline: "Smart Farming for Malawi 🌾",
    footerBlurb: "Smart farming tools for Malawian smallholder farmers — AI soil analysis, marketplace, and profit insights.",
    footerApp: "App",
    footerDeveloper: "Developer",
    footerRights: "Built by Fortune Mwangofi.",
    // nav
    navHome: "Home",
    navFarmAI: "Farm AI",
    navInsights: "Insights",
    navAgriTech: "AgriTech",
    navServices: "Services",
    navRecords: "Records",
    navMarket: "Market",
    navChats: "Chats",
    navProfile: "My Profile",
    navMessages: "Messages",
    navMyRecords: "My Records",
    signIn: "Sign In",
    signOut: "Sign Out",
    // home
    quickActions: "Quick Actions",
    todaysTip: "Today's Tip",
    humidity: "Humidity",
    partlyCloudy: "Partly Cloudy",
    goodPlanting: "Good planting weather",
    soilAI: "Soil AI",
    soilAIDesc: "Analyze soil & get crop tips",
    profitInsights: "Profit Insights",
    profitInsightsDesc: "Market prices & calculator",
    marketDesc: "Buy & sell produce",
    messagesDesc: "Chat with buyers/sellers",
    recordsDesc: "Track expenses & budgets",
    agritechDesc: "Modern farming tech",
    servicesDesc: "Agencies & support",
    maizeTip: "Maize Planting Season",
    maizeTipBody:
      "The rainy season is starting — prepare your fields with compost and ensure proper spacing of 75cm between rows for optimal maize growth. Consider intercropping with legumes for soil nitrogen fixation.",
    // hero slides
    slide1Title: "Farm Link",
    slide1Sub: "Smart Farming for Malawi 🌾",
    slide2Title: "Modern Irrigation",
    slide2Sub: "Save water, boost your yields with drip systems",
    slide3Title: "Greenhouse Farming",
    slide3Sub: "Grow high-value crops all year round",
    slide4Title: "Solar-Powered Future",
    slide4Sub: "Harness Malawi's sunshine for your farm",
    langLabel: "Language",
  },
  ny: {
    appName: "Farm Link",
    tagline: "Ulimi Wanzeru ku Malawi 🌾",
    footerBlurb: "Zothandiza alimi ang'onoang'ono aku Malawi — kusanthula nthaka ndi AI, msika, ndi phindu.",
    footerApp: "Pulogalamu",
    footerDeveloper: "Wopanga",
    footerRights: "Wapangidwa ndi Fortune Mwangofi.",
    navHome: "Kwathu",
    navFarmAI: "Farm AI",
    navInsights: "Phindu",
    navAgriTech: "AgriTech",
    navServices: "Ntchito",
    navRecords: "Zolemba",
    navMarket: "Msika",
    navChats: "Macheza",
    navProfile: "Mbiri Yanga",
    navMessages: "Mauthenga",
    navMyRecords: "Zolemba Zanga",
    signIn: "Lowani",
    signOut: "Tulukani",
    quickActions: "Zochita Msanga",
    todaysTip: "Uphungu Wa Lero",
    humidity: "Chinyezi",
    partlyCloudy: "Mitambo Pang'ono",
    goodPlanting: "Nyengo yabwino yobzala",
    soilAI: "AI ya Nthaka",
    soilAIDesc: "Santhulani nthaka & landirani malangizo",
    profitInsights: "Kuwerengera Phindu",
    profitInsightsDesc: "Mitengo ya msika ndi chowerengera",
    marketDesc: "Gulani & gulitsani zokolola",
    messagesDesc: "Chezani ndi ogula/ogulitsa",
    recordsDesc: "Yang'anirani ndalama zanu",
    agritechDesc: "Ukadaulo wamakono waulimi",
    servicesDesc: "Mabungwe othandiza alimi",
    maizeTip: "Nyengo Yobzala Chimanga",
    maizeTipBody:
      "Nyengo ya mvula ikuyamba — konzani minda yanu ndi manyowa ndipo siyanani mizere ya masentimita 75 kuti chimanga chikule bwino. Muyeserenso kubzala nyemba pakati pa chimanga kuti nthaka ikhale ndi nayitrogeni.",
    slide1Title: "Farm Link",
    slide1Sub: "Ulimi Wanzeru ku Malawi 🌾",
    slide2Title: "Ulimi Wothirira Wamakono",
    slide2Sub: "Sungani madzi ndi kuwonjezera zokolola ndi mafunde a dontho",
    slide3Title: "Ulimi wa Green House",
    slide3Sub: "Bzalani mbewu zamtengo wapatali chaka chonse",
    slide4Title: "Mphamvu ya Dzuwa",
    slide4Sub: "Gwiritsani ntchito dzuwa la Malawi pafamu yanu",
    langLabel: "Chinenero",
  },
} as const;

type Key = keyof typeof dict["en"];

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: Key) => string;
}

const LanguageContext = createContext<Ctx | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    return (localStorage.getItem("farmlink-lang") as Lang) || "en";
  });

  useEffect(() => {
    localStorage.setItem("farmlink-lang", lang);
    document.documentElement.lang = lang === "ny" ? "ny" : "en";
  }, [lang]);

  const setLang = (l: Lang) => setLangState(l);
  const t = (k: Key) => dict[lang][k] ?? dict.en[k];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};