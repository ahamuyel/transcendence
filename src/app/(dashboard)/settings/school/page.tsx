"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Loader2,
  Save,
  RotateCcw,
  Palette,
  Type,
  Square,
  Sparkles,
  Eye,
  Rocket,
  BookOpen,
  Briefcase,
  type LucideIcon,
} from "lucide-react";

import {
  useSchoolBranding,
  THEME_PRESETS,
  type ThemePreset,
} from "@/provider/school-branding";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n";

const PRESET_COLORS = [
  { value: "#6366f1", label: "Indigo" },
  { value: "#06B6D4", label: "Ciano" },
  { value: "#10B981", label: "Esmeralda" },
  { value: "#F59E0B", label: "Âmbar" },
  { value: "#f43f5e", label: "Rosa" },
  { value: "#8B5CF6", label: "Violeta" },
  { value: "#EC4899", label: "Pink" },
  { value: "#14B8A6", label: "Teal" },
  { value: "#3B82F6", label: "Azul" },
  { value: "#EF4444", label: "Vermelho" },
];

const THEME_PRESET_OPTIONS: {
  value: ThemePreset;
  label: string;
  icon: LucideIcon;
  desc: string;
}[] = [
  {
    value: "moderno",
    label: "Moderno",
    icon: Palette,
    desc: "Design contemporâneo com cantos arredondados",
  },
  {
    value: "minimalista",
    label: "Minimalista",
    icon: Square,
    desc: "Visual limpo e direto",
  },
  {
    value: "academico",
    label: "Acadêmico",
    icon: BookOpen,
    desc: "Tradicional e profissional",
  },
  {
    value: "corporativo",
    label: "Corporativo",
    icon: Briefcase,
    desc: "Elegante e compacto",
  },
  {
    value: "futurista",
    label: "Futurista",
    icon: Rocket,
    desc: "Visual ousado e moderno",
  },
];

const FONT_OPTIONS = [
  "Inter",
  "Poppins",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Nunito",
  "DM Sans",
];

type FormData = {
  logo: string | null;
  primaryColor: string;
  secondaryColor: string;
  slogan: string | null;
  contactEmail: string | null;
  socialFacebook: string | null;
  socialInstagram: string | null;
  socialWhatsapp: string | null;
  loginMessage: string | null;
  footerText: string | null;

  themePreset: ThemePreset;

  fontFamily: string;
  fontSize: string;
  fontWeight: string;

  borderRadius: string;
  shadowSize: string;

  spacing: string;
  cardStyle: string;
  buttonStyle: string;
  layoutDensity: string;
};

function hexToHSL(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  let h = 0;
  let s = 0;

  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;

    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function applyPreviewColors(primary: string, secondary: string) {
  const doc = document.documentElement;

  doc.style.setProperty("--school-primary", primary);
  doc.style.setProperty("--school-secondary", secondary);

  try {
    const { h, s, l } = hexToHSL(primary);

    doc.style.setProperty(
      "--school-primary-light",
      `hsl(${h}, ${s}%, ${Math.min(l + 40, 95)}%)`,
    );

    doc.style.setProperty(
      "--school-primary-dark",
      `hsl(${h}, ${s}%, ${Math.max(l - 25, 10)}%)`,
    );
  } catch {}
}

function applyPreviewTheme(settings: Partial<FormData>) {
  const doc = document.documentElement;

  if (settings.fontFamily) {
    doc.style.setProperty(
      "--school-font-family",
      `'${settings.fontFamily}', sans-serif`,
    );
  }

  if (settings.borderRadius) {
    const radiusMap: Record<string, string> = {
      none: "0px",
      sm: "6px",
      md: "10px",
      lg: "16px",
      xl: "24px",
    };

    doc.style.setProperty("--school-radius", radiusMap[settings.borderRadius]);
  }
}

export default function SchoolSettingsPage() {
  const { tUI } = useTranslation();
  const { refresh: refreshBranding } = useSchoolBranding();

  const fileRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [isDirty, setIsDirty] = useState(false);

  const [activeTab, setActiveTab] = useState<"theme" | "brand">("theme");

  const [schoolName, setSchoolName] = useState("");

  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const [form, setForm] = useState<FormData>({
    logo: null,

    primaryColor: "#6366f1",
    secondaryColor: "#06B6D4",

    slogan: null,
    contactEmail: null,
    socialFacebook: null,
    socialInstagram: null,
    socialWhatsapp: null,

    loginMessage: null,
    footerText: null,

    themePreset: "moderno",

    fontFamily: "Inter",
    fontSize: "base",
    fontWeight: "normal",

    borderRadius: "lg",
    shadowSize: "md",

    spacing: "comfortable",
    cardStyle: "default",
    buttonStyle: "default",
    layoutDensity: "comfortable",
  });

  useEffect(() => {
    fetch("/api/school-settings")
      .then((r) => r.json())
      .then((d) => {
        setSchoolName(d.name || "");

        setForm((prev) => ({
          ...prev,
          ...d,
        }));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    applyPreviewColors(form.primaryColor, form.secondaryColor);
  }, [form.primaryColor, form.secondaryColor]);

  useEffect(() => {
    applyPreviewTheme(form);
  }, [form]);

  const updateForm = useCallback(
    <K extends keyof FormData>(field: K, value: FormData[K]) => {
      setForm((prev) => ({
        ...prev,
        [field]: value,
      }));

      setIsDirty(true);
    },
    [],
  );

  const applyPreset = (preset: ThemePreset) => {
    const theme = THEME_PRESETS[preset];

    if (!theme) return;

    setForm((prev) => ({
      ...prev,
      ...(theme as Record<string, string>),
      themePreset: preset,
    } as FormData));

    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const res = await fetch("/api/school-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error();
      }

      refreshBranding();

      setMessage({
        text: tUI("Configurações guardadas com sucesso!"),
        type: "success",
      });

      setIsDirty(false);
    } catch {
      setMessage({
        text: tUI("Erro ao guardar configurações"),
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const defaults: FormData = {
      logo: null,

      primaryColor: "#6366f1",
      secondaryColor: "#06B6D4",

      slogan: null,
      contactEmail: null,
      socialFacebook: null,
      socialInstagram: null,
      socialWhatsapp: null,

      loginMessage: null,
      footerText: null,

      themePreset: "moderno",

      fontFamily: "Inter",
      fontSize: "base",
      fontWeight: "normal",

      borderRadius: "lg",
      shadowSize: "md",

      spacing: "comfortable",
      cardStyle: "default",
      buttonStyle: "default",
      layoutDensity: "comfortable",
    };

    setForm(defaults);

    setIsDirty(true);

    setMessage({
      text: tUI("Tema redefinido"),
      type: "success",
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > 200 * 1024) {
      setMessage({
        text: tUI("Imagem muito grande (máx. 200KB)"),
        type: "error",
      });

      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      updateForm("logo", reader.result as string);
    };

    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const inputClass =
    "w-full px-3 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-primary transition-all";

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      <div className="flex-1 min-w-0 space-y-6">
        {/* HEADER */}
        <div className="theme-card p-6">
          <h1 className="text-2xl font-bold">{tUI("Personalização Visual")}</h1>

          <p className="text-sm text-zinc-500 mt-1">
            {tUI("Configure a identidade visual da escola")}
          </p>
        </div>

        {/* TABS */}
        <div className="flex gap-2 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 w-fit">
          <button
            onClick={() => setActiveTab("theme")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === "theme"
                ? "bg-white dark:bg-zinc-700 shadow text-zinc-900 dark:text-white"
                : "text-zinc-500",
            )}
          >
            {tUI("Tema")}
          </button>

          <button
            onClick={() => setActiveTab("brand")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === "brand"
                ? "bg-white dark:bg-zinc-700 shadow text-zinc-900 dark:text-white"
                : "text-zinc-500",
            )}
          >
            {tUI("Marca")}
          </button>
        </div>

        {activeTab === "theme" && (
          <>
            {/* PRESETS */}
            <Section icon={Sparkles} title={tUI("Presets")}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {THEME_PRESET_OPTIONS.map((preset) => {
                  const Icon = preset.icon;

                  return (
                    <button
                      key={preset.value}
                      onClick={() => applyPreset(preset.value)}
                      className={cn(
                        "p-4 rounded-2xl border-2 transition-all text-left hover:scale-[1.01]",
                        form.themePreset === preset.value
                          ? "border-primary bg-primary/5"
                          : "border-zinc-200 dark:border-zinc-700",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Icon
                          size={20}
                          className="text-primary shrink-0 mt-1"
                        />

                        <div>
                          <p className="font-semibold">{tUI(preset.label)}</p>

                          <p className="text-xs text-zinc-500 mt-1">
                            {tUI(preset.desc)}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Section>

            {/* TYPOGRAPHY */}
            <Section icon={Type} title={tUI("Tipografia")}>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium mb-1 block">
                    {tUI("Fonte")}
                  </label>

                  <select
                    className={inputClass}
                    value={form.fontFamily}
                    onChange={(e) => updateForm("fontFamily", e.target.value)}
                  >
                    {FONT_OPTIONS.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Section>

            {/* COLORS */}
            <Section icon={Palette} title={tUI("Cores")}>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.value}
                    aria-label={`Selecionar cor ${c.label}`}
                    aria-selected={form.primaryColor === c.value}
                    onClick={() => updateForm("primaryColor", c.value)}
                    className={cn(
                      "w-10 h-10 rounded-xl border-2 transition-all hover:scale-110",
                      form.primaryColor === c.value
                        ? "border-zinc-950 dark:border-white"
                        : "border-transparent",
                    )}
                    style={{
                      backgroundColor: c.value,
                    }}
                  />
                ))}
              </div>
            </Section>

            {/* RESET */}
            <div>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              >
                <RotateCcw size={14} />
                {tUI("Resetar tema")}
              </button>
            </div>
          </>
        )}

        {activeTab === "brand" && (
          <>
            <Section title={tUI("Logo e Identidade")}>
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 overflow-hidden flex items-center justify-center">
                  {form.logo ? (
                    <img
                      src={form.logo}
                      alt="Logo"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-primary">
                      {schoolName?.[0] || "E"}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />

                  <Button
                    variant="primary"
                    onClick={() => fileRef.current?.click()}
                  >
                    {tUI("Carregar logo")}
                  </Button>

                  {form.logo && (
                    <Button
                      variant="outline"
                      onClick={() => updateForm("logo", null)}
                    >
                      {tUI("Remover")}
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-xs font-medium block mb-1">
                    {tUI("Slogan")}
                  </label>

                  <input
                    className={inputClass}
                    value={form.slogan || ""}
                    onChange={(e) => updateForm("slogan", e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium block mb-1">
                    {tUI("Email")}
                  </label>

                  <input
                    className={inputClass}
                    value={form.contactEmail || ""}
                    onChange={(e) => updateForm("contactEmail", e.target.value)}
                  />
                </div>
              </div>
            </Section>
          </>
        )}

        {/* SAVE */}
        <div className="sticky bottom-4 z-20">
          <div className="theme-card p-4 flex items-center justify-between">
            <div>
              {isDirty ? (
                <p className="text-sm text-amber-600">
                  {tUI("Existem alterações não guardadas")}
                </p>
              ) : (
                <p className="text-sm text-emerald-600">{tUI("Tudo sincronizado")}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              {message && (
                <span
                  className={cn(
                    "text-xs",
                    message.type === "success"
                      ? "text-emerald-600"
                      : "text-rose-600",
                  )}
                >
                  {message.text}
                </span>
              )}

              <Button
                onClick={handleSave}
                disabled={saving || !isDirty}
                variant="primary"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                {tUI("Guardar")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* PREVIEW */}
      <div className="xl:w-[340px] 2xl:w-[380px] shrink-0">
        <div className="sticky top-24">
          <div className="theme-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Eye size={16} className="text-primary" />

              <h3 className="font-semibold">{tUI("Pré-visualização")}</h3>
            </div>

            {/* MINI DASHBOARD */}
            <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              {/* NAVBAR */}
              <div className="h-14 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center text-sm font-bold">
                    {schoolName?.[0] || "E"}
                  </div>

                  <div>
                    <p className="text-xs font-semibold">
                      {schoolName || "Minha Escola"}
                    </p>

                    <p className="text-[10px] text-zinc-500">Dashboard</p>
                  </div>
                </div>

                <Badge variant="default">{tUI("Online")}</Badge>
              </div>

              {/* CONTENT */}
              <div className="p-4 space-y-4">
                {/* STATS */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="theme-card p-3">
                    <p className="text-[10px] text-zinc-500">{tUI("Alunos")}</p>

                    <p className="text-lg font-bold text-primary">245</p>
                  </div>

                  <div className="theme-card p-3">
                    <p className="text-[10px] text-zinc-500">{tUI("Professores")}</p>

                    <p className="text-lg font-bold text-primary">18</p>
                  </div>
                </div>

                {/* TABLE */}
                <div className="theme-card p-3">
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800"
                      >
                        <div>
                          <p className="text-xs font-medium">Aula #{i}</p>

                          <p className="text-[10px] text-zinc-500">
                            {tUI("Matemática")}
                          </p>
                        </div>

                        <Badge variant="secondary">{tUI("Ativa")}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* BUTTONS */}
                <div className="flex gap-2">
                  <Button size="sm" variant="primary">
                    {tUI("Primário")}
                  </Button>

                  <Button size="sm" variant="primary-outline">
                    {tUI("Outline")}
                  </Button>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-zinc-500 mt-4 text-center">
              {tUI("Tema")}:{" "}
              <strong>
                {tUI(
                  THEME_PRESET_OPTIONS.find((p) => p.value === form.themePreset)
                    ?.label || ""
                )}
              </strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon?: React.ComponentType<{
    size?: number;
    className?: string;
  }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="theme-card p-6 space-y-4">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={16} className="text-primary" />}

        <h2 className="text-sm font-bold uppercase tracking-wider">{title}</h2>
      </div>

      {children}
    </div>
  );
}
