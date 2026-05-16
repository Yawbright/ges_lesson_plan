// GES Lesson Planner — Expo / React Native Web
// Refined evergreen + warm gold (modernized 2026)
// Run with: npx expo start (web target)

import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  useWindowDimensions,
  type DimensionValue,
} from "react-native";
import { router } from "expo-router";
import {
  loadLandingFaqGroups,
  type LandingFaqGroup,
} from "@/lib/landingFaqs";

// ─── Design Tokens (modernized) ───────────────────────────────────
const C = {
  // Warm gold accent (more refined than pure yellow)
  yellow: "#E0A82E",
  yellowLight: "#F0BD55",
  yellowPale: "#FDF4DE",
  // Refined evergreen — matches the new brand palette in src/theme/tokens.ts
  forest: "#0E3D31",
  forestMid: "#125243",
  forestLight: "#1F8A6F",
  red: "#C2122A",
  cream: "#FBFBFA",
  warmWhite: "#FFFFFF",
  ink: "#0B1410",
  ink70: "rgba(11,20,16,0.72)",
  ink40: "rgba(11,20,16,0.42)",
  border: "rgba(11,20,16,0.10)",
  surface: "#FFFFFF",
  white: "#FFFFFF",
} as const;

// ─── Types ────────────────────────────────────────────────────────
interface FaqItem {
  q: string;
  a: string;
}

interface FaqGroup {
  title: string;
  items: FaqItem[];
}

interface Feature {
  icon: string;
  name: string;
  text: string;
}

interface TopicBase {
  strand: string;
  subStrand: string;
  topic: string;
  objective: string;
}

interface SchemeWeek {
  week: number;
  strand: string;
  subStrand: string;
  topic: string;
  objectives: string;
}

interface Scheme {
  subject: string;
  classLevel: string;
  term: string;
  weeks: SchemeWeek[];
}

interface LessonPhase {
  phase: 1 | 2 | 3;
  title: string;
  duration?: string;
  activities: string[];
  resources?: string[];
  assessment?: string[];
}

interface LessonPlan {
  termTitle: string;
  subjectClassTitle: string;
  weekTitle: string;
  subject: string;
  classLevel: string;
  date: string;
  period: string;
  duration: string;
  strand: string;
  subStrand: string;
  contentStandard: string;
  indicator: string;
  performanceIndicator: string;
  coreCompetencies: string[];
  references: string;
  classSize: string;
  lessonNumber: string;
  week: number;
  topic: string;
  phases: LessonPhase[];
}

// ─── FAQ Data ──────────────────────────────────────────────────────
const FAQ_GROUPS: FaqGroup[] = [
  {
    title: "General",
    items: [
      { q: "What is GES Lesson Planner?", a: "An AI-powered tool that helps Ghanaian teachers create lesson plans, schemes of work, and teaching notes faster." },
      { q: "Is GES Lesson Planner free?", a: "Yes. Teachers can create a free account and start using the platform without making any payment." },
      { q: "Who is it for?", a: "Teachers in Ghanaian basic schools, especially those handling B1 to B9 classes." },
      { q: "Which class levels are supported?", a: "B1, B2, B3, B4, B5, B6, B7, B8, and B9 are all supported." },
      { q: "Is it designed for the Ghana curriculum?", a: "Yes. Built around Ghanaian class levels, subjects, terms, lesson structure, and scheme-of-work planning." },
    ],
  },
  {
    title: "Lesson Plans",
    items: [
      { q: "How does lesson plan generation work?", a: "Select class, subject, term, week, and lesson number. GES Lesson Planner creates a structured plan based on your selected scheme." },
      { q: "Can I export plans as PDF?", a: "Yes. Lesson plans can be saved or exported as PDF for printing, sharing, or record keeping." },
      { q: "Do plans include my teacher details?", a: "Yes. Save your teacher name, school name, district, and class sizes in your profile, and they appear on new lesson plans." },
    ],
  },
  {
    title: "Schemes of Work",
    items: [
      { q: "Can GES Lesson Planner generate a scheme of work?", a: "Yes — a full 12-week scheme for any selected subject, class, and term." },
      { q: "Can I upload my own scheme?", a: "Yes. Upload a PDF or DOCX scheme and the app analyses it into week-by-week scheme rows." },
    ],
  },
  {
    title: "Credits & Payments",
    items: [
      { q: "How do credits work?", a: "Credits are used for AI actions like generating lesson plans, schemes, custom scheme analysis, and teaching notes. The current cost is controlled from the admin dashboard." },
      { q: "How can I get more credits?", a: "You can earn more credits by referring other teachers. Credit purchases can be enabled later when available." },
      { q: "Do new users get free credits?", a: "Yes. New users may receive starter credits when the setting is active." },
    ],
  },
  {
    title: "Technical & Privacy",
    items: [
      { q: "Is my work private?", a: "Yes. Each teacher can only access their own saved work and credit data through protected account access." },
      { q: "Can I use it on mobile and web?", a: "Yes. The app works on both mobile and web browsers." },
      { q: "Are the generated plans always perfect?", a: "No AI tool is perfect. GES Lesson Planner provides a strong draft; teachers should review before classroom use." },
    ],
  },
];

const FEATURES: Feature[] = [
  { icon: "📅", name: "Schemes of Work", text: "Generate or analyse 12-week term schemes aligned to the Ghana curriculum." },
  { icon: "📝", name: "Lesson Plans", text: "Create structured lesson plans from saved schemes in minutes." },
  { icon: "📖", name: "Teaching Notes", text: "Turn lesson plans into detailed, classroom-ready teacher notes." },
  { icon: "📥", name: "PDF Exports", text: "Save and print professional documents for school submission or personal records." },
  { icon: "🇬🇭", name: "Ghanaian Languages", text: "Draft support for Twi, Ewe, Ga, Dagbani, Nzema, and more local language lessons." },
  { icon: "👤", name: "Teacher Profiles", text: "Add your name, school, district, and class size to personalise every document." },
];

const VALUE_PROPS: string[] = [
  "Free account for teachers to get started",
  "Saves hours of weekly preparation time",
  "Connects schemes directly to lesson plans",
  "Supports class size and teacher profile details",
  "Keeps all documents in one organised library",
  "Built around the Ghana basic school curriculum",
  "Try a demo before creating your free account",
];

const BAND_ITEMS: string[] = [
  "Free Account", "Schemes of Work", "Lesson Plans", "Teaching Notes",
  "PDF Exports", "Ghanaian Languages", "B1–B9 Support", "View-only Demo",
];

// ─── Helpers ───────────────────────────────────────────────────────
function getTopicBase(subject: string): TopicBase {
  const s = subject.toLowerCase();
  if (s.includes("math")) return { strand: "Number", subStrand: "Number Operations", topic: "Solving practical number problems", objective: "number operations" };
  if (s.includes("english")) return { strand: "Language and Literacy", subStrand: "Reading and Writing", topic: "Building meaning from texts", objective: "reading comprehension and written response" };
  if (s.includes("science")) return { strand: "Systems", subStrand: "Living and Non-living Things", topic: "Investigating the environment", objective: "scientific observation and explanation" };
  if (s.includes("ghanaian")) return { strand: "Oral Language", subStrand: "Listening and Speaking", topic: "Using familiar expressions", objective: "oral communication in a Ghanaian language" };
  return { strand: "Knowledge and Understanding", subStrand: "Concept Development", topic: "Exploring " + subject, objective: subject + " concepts" };
}

function buildContentStandard(subject: string, classLevel: string): string {
  const normalized = subject.toLowerCase();
  if (normalized.includes("math")) return `${classLevel}.2.1.1 Demonstrate understanding of number concepts and operations.`;
  if (normalized.includes("english")) return `${classLevel}.1.2.1 Read, understand, and respond to texts using appropriate language.`;
  if (normalized.includes("science")) return `${classLevel}.3.1.1 Observe, investigate, and explain natural phenomena.`;
  if (normalized.includes("ghanaian")) return `${classLevel}.1.1.1 Communicate ideas clearly in the selected Ghanaian language.`;
  return `${classLevel}.1.1.1 Demonstrate understanding of selected ${subject} concepts.`;
}

function buildIndicator(subject: string, week: number): string {
  const normalized = subject.toLowerCase();
  if (normalized.includes("math")) return `Use examples from Week ${week} to solve practical number problems.`;
  if (normalized.includes("english")) return "Read a short text and answer questions with supporting details.";
  if (normalized.includes("science")) return "Carry out a simple observation and describe findings accurately.";
  if (normalized.includes("ghanaian")) return "Use familiar expressions appropriately in guided oral practice.";
  return `Apply the Week ${week} topic in a guided classroom activity.`;
}

// ─── Sub-components ────────────────────────────────────────────────

interface SpinnerProps {
  dark?: boolean;
}

function Spinner({ dark }: SpinnerProps): JSX.Element {
  const rot = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(rot, { toValue: 1, duration: 700, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, [rot]);
  const rotate = rot.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  return (
    <Animated.View style={[s.spinner, dark && s.spinnerDark, { transform: [{ rotate }] }]} />
  );
}

interface KickerPillProps {
  label: string;
}

function KickerPill({ label }: KickerPillProps): JSX.Element {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 0.5, duration: 1000, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
    ])).start();
  }, [pulse]);
  return (
    <View style={s.kickerPill}>
      <Animated.View style={[s.kickerDot, { opacity: pulse }]} />
      <Text style={s.kickerText}>{label}</Text>
    </View>
  );
}

interface NavBarProps {
  onTryDemo: () => void;
  onGetAccess: () => void;
}

function NavBar({ onTryDemo, onGetAccess }: NavBarProps): JSX.Element {
  const { width } = useWindowDimensions();
  const showFreePill = width >= 520;

  return (
    <View style={s.nav}>
      <View style={s.navInner}>
        <View style={s.brand}>
          <View style={s.brandIcon}>
            <Text style={{ fontSize: 18 }}>📋</Text>
          </View>
          <View>
            <Text style={s.brandName}>GES Lesson Planner</Text>
            <Text style={s.brandSub}>Free for B1–B9 teachers</Text>
          </View>
        </View>
        <View style={s.navActions}>
          {showFreePill && (
            <View style={s.freePill}>
              <Text style={s.freePillText}>Free</Text>
            </View>
          )}
          <TouchableOpacity style={s.btnGhost} onPress={onTryDemo}>
            <Text style={s.btnGhostText}>Try Demo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btnPrimary} onPress={onGetAccess}>
            <Text style={s.btnPrimaryText}>Start Free →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

interface HeroSectionProps {
  onTryDemo: () => void;
  onGetAccess: () => void;
}

function HeroSection({ onTryDemo, onGetAccess }: HeroSectionProps): JSX.Element {
  return (
    <View style={s.heroWrap}>
      <View style={s.heroCopy}>
        <KickerPill label="Free AI Planning for Ghanaian Teachers" />
        <Text style={s.heroTitle}>
          Create Ghana-ready{"\n"}
          <Text style={s.heroTitleEm}>lesson plans</Text> in minutes.
        </Text>
        <Text style={s.heroBody}>
          Start with a free account and generate schemes of work, lesson plans, and teaching notes for B1–B9 classes. Built around the Ghana curriculum — so you never start from a blank page.
        </Text>
        <View style={s.heroCta}>
          <TouchableOpacity style={[s.btnPrimary, s.btnXl]} onPress={onTryDemo}>
            <Text style={s.btnPrimaryText}>Try Free Demo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.btnGhost, s.btnXl]} onPress={onGetAccess}>
            <Text style={s.btnGhostText}>Create Free Account</Text>
          </TouchableOpacity>
        </View>
        <View style={s.freeNote}>
          <Text style={s.freeNoteText}>No payment needed to open your account.</Text>
        </View>
        <View style={s.heroStats}>
          {([ ["Free", "Account"], ["B1–B9", "Class levels"], ["3", "Terms supported"] ] as [string, string][]).map(([n, l]) => (
            <View key={l} style={s.stat}>
              <Text style={s.statNum}>{n}</Text>
              <Text style={s.statLabel}>{l}</Text>
            </View>
          ))}
        </View>
      </View>
      <DocCard />
    </View>
  );
}

function DocCard(): JSX.Element {
  const float = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(float, { toValue: -8, duration: 2500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(float, { toValue: 0, duration: 2500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start();
  }, [float]);

  const docRows: { label: string; bars: { w: DimensionValue; gold: boolean }[] }[] = [
    { label: "Strand",     bars: [{ w: "100%", gold: false }] },
    { label: "Sub-strand", bars: [{ w: "80%",  gold: true  }] },
    { label: "Indicator",  bars: [{ w: "60%",  gold: false }, { w: "80%", gold: false }] },
    { label: "Core Skills",bars: [{ w: "100%", gold: true  }] },
  ];

  return (
    <View style={{ position: "relative", marginTop: 24 }}>
      <Animated.View style={[s.docCard, { transform: [{ translateY: float }] }]}>
        <View style={s.docHeader}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{ flexDirection: "row", gap: 5 }}>
              <View style={[s.docDot, { backgroundColor: "#ff5f57" }]} />
              <View style={[s.docDot, { backgroundColor: "#febc2e" }]} />
              <View style={[s.docDot, { backgroundColor: "#28c840" }]} />
            </View>
            <Text style={s.docHeaderLabel}>Term Lesson Plan</Text>
          </View>
          <View style={s.docBadge}><Text style={s.docBadgeText}>Demo</Text></View>
        </View>
        <View style={s.docBody}>
          {docRows.map((row) => (
            <View key={row.label} style={s.docRow}>
              <Text style={s.docRowLabel}>{row.label}</Text>
              <View style={{ flex: 1, gap: 5 }}>
                {row.bars.map((b, i) => (
                  <View
                    key={i}
                    style={[s.docBar, { width: b.w, backgroundColor: b.gold ? C.yellow : C.forestLight }]}
                  />
                ))}
              </View>
            </View>
          ))}
          <View style={{ flexDirection: "row", gap: 6, marginTop: 12 }}>
            <View style={[s.docCell, { backgroundColor: "rgba(61,122,92,0.12)" }]} />
            <View style={[s.docCell, { backgroundColor: C.yellowPale }]} />
            <View style={[s.docCell, { backgroundColor: "rgba(61,122,92,0.12)" }]} />
          </View>
        </View>
      </Animated.View>
      <View style={s.accentCard}>
        <View style={s.accentIcon}><Text style={{ fontSize: 18 }}>📋</Text></View>
        <View>
          <Text style={s.accentBig}>3 mins</Text>
          <Text style={s.accentSmall}>Avg. plan generation</Text>
        </View>
      </View>
    </View>
  );
}

function ScrollingBand(): JSX.Element {
  const anim = useRef(new Animated.Value(0)).current;
  const items = [...BAND_ITEMS, ...BAND_ITEMS];
  const itemW = 180;
  const totalW = BAND_ITEMS.length * itemW;
  useEffect(() => {
    Animated.loop(
      Animated.timing(anim, { toValue: -totalW, duration: 22000, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, [anim, totalW]);
  return (
    <View style={s.band}>
      <Animated.View style={[{ flexDirection: "row" }, { transform: [{ translateX: anim }] }]}>
        {items.map((item, i) => (
          <View key={i} style={s.bandItem}>
            <Text style={s.bandStar}>✦</Text>
            <Text style={s.bandText}>{item}</Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

interface SelectPickerProps {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
}

function SelectPicker({ label, value, options, onChange }: SelectPickerProps): JSX.Element {
  const [open, setOpen] = useState(false);
  return (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TouchableOpacity style={s.select} onPress={() => setOpen(!open)}>
        <Text style={s.selectText}>{value}</Text>
        <Text style={{ color: C.ink40, fontSize: 12 }}>▾</Text>
      </TouchableOpacity>
      {open && (
        <View style={s.dropdown}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[s.dropdownItem, opt === value && s.dropdownItemActive]}
              onPress={() => { onChange(opt); setOpen(false); }}
            >
              <Text style={[s.dropdownText, opt === value && { color: C.forest, fontWeight: "700" }]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

function DemoSection(): JSX.Element {
  const [classLevel, setClassLevel] = useState("B7");
  const [subject, setSubject] = useState("Mathematics");
  const [term, setTerm] = useState("Term 1");
  const [week, setWeek] = useState("Week 1");
  const [lessonsPerWeek, setLessonsPerWeek] = useState("2");
  const [lesson, setLesson] = useState("Lesson 1");
  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [loadingScheme, setLoadingScheme] = useState(false);
  const [loadingLesson, setLoadingLesson] = useState(false);

  const lessonOptions = Array.from({ length: parseInt(lessonsPerWeek) }, (_, i) => `Lesson ${i + 1}`);

  function generateScheme(): void {
    setLoadingScheme(true);
    setLessonPlan(null);
    setTimeout(() => {
      const tb = getTopicBase(subject);
      setScheme({
        subject, classLevel, term,
        weeks: Array.from({ length: 12 }, (_, i) => ({
          week: i + 1,
          strand: tb.strand,
          subStrand: tb.subStrand,
          topic: tb.topic + " " + (i + 1),
          objectives: "Learners demonstrate understanding of " + tb.objective + " through guided classroom activities.",
        })),
      });
      setLoadingScheme(false);
    }, 700);
  }

  function generateLesson(): void {
    if (!scheme) return;
    setLoadingLesson(true);
    setTimeout(() => {
      const wNum = parseInt(week.replace("Week ", ""));
      const lNum = parseInt(lesson.replace("Lesson ", ""));
      const sw = scheme.weeks.find((w) => w.week === wNum) ?? scheme.weeks[0];
      setLessonPlan({
        termTitle: `${scheme.term} Lesson Plan`,
        subjectClassTitle: `${scheme.subject} - ${scheme.classLevel}`,
        weekTitle: `Week ${wNum}`,
        subject: scheme.subject,
        classLevel: scheme.classLevel,
        date: "Demo week ending",
        period: "1",
        duration: "60 mins",
        strand: sw.strand,
        subStrand: sw.subStrand,
        contentStandard: buildContentStandard(scheme.subject, scheme.classLevel),
        indicator: buildIndicator(scheme.subject, wNum),
        performanceIndicator: "Learners can explain the main idea and apply it in a guided classroom task.",
        coreCompetencies: ["Critical Thinking", "Communication", "Collaboration"],
        references: "Teacher resource pack, learner textbook, and locally available teaching materials.",
        classSize: "45",
        lessonNumber: `${lNum} of ${lessonsPerWeek}`,
        week: wNum,
        topic: sw.topic,
        phases: [
          {
            phase: 1,
            title: "STARTER",
            duration: "10 mins",
            activities: [
              "Guide learners to recall previous knowledge through quick oral questions.",
              "Let learners share familiar examples connected to " + sw.topic.toLowerCase() + ".",
            ],
            resources: ["Chalkboard", "Learners' responses"],
          },
          {
            phase: 2,
            title: "NEW LEARNING",
            duration: "40 mins",
            activities: [
              "Introduce the lesson objective and demonstrate the main idea with clear examples.",
              "Guide learners to work in pairs or groups, discuss solutions, and present findings.",
              "Support learners with prompts, corrections, and additional practice activities.",
            ],
            resources: ["Textbook", "Chart", "Local materials"],
            assessment: [
              "Explain the main idea in your own words.",
              "Apply the lesson idea to solve one guided classroom task.",
            ],
          },
          {
            phase: 3,
            title: "REFLECTION",
            duration: "10 mins",
            activities: [
              "Summarize the key points with learners and correct remaining misconceptions.",
              "Let learners complete a short exit task and state one thing learned.",
            ],
            resources: ["Exercise books", "Exit task"],
          },
        ],
      });
      setLoadingLesson(false);
    }, 700);
  }

  return (
    <View style={s.demoSection}>
      <View style={s.sectionInner}>
        <Text style={s.eyebrow}>Interactive Demo</Text>
        <Text style={s.sectionTitle}>Generate a test scheme,{"\n"}then a lesson plan.</Text>
        <Text style={s.sectionBody}>Try GES Lesson Planner with a sample run. All demo previews are watermarked. Create a free account to save, print, and export full documents.</Text>

        <View style={s.demoGrid}>
          {/* Controls */}
          <View style={s.demoControls}>
            <Text style={s.demoControlsTitle}>🎛️ Configure</Text>
            <View style={s.lockBadge}><Text style={s.lockBadgeText}>🔒 View-only preview</Text></View>

            <SelectPicker label="Class Level" value={classLevel} options={["B1","B2","B3","B4","B5","B6","B7","B8","B9"]} onChange={setClassLevel} />
            <SelectPicker label="Subject" value={subject} options={["Mathematics","English Language","Science","Ghanaian Language","RME","Social Studies","Computing","Creative Arts and Design"]} onChange={setSubject} />

            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <SelectPicker label="Term" value={term} options={["Term 1","Term 2","Term 3"]} onChange={setTerm} />
              </View>
              <View style={{ flex: 1 }}>
                <SelectPicker label="Week" value={week} options={Array.from({ length: 12 }, (_, i) => `Week ${i + 1}`)} onChange={setWeek} />
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <SelectPicker label="Lessons/Week" value={lessonsPerWeek} options={["2","3","4","5"]} onChange={(v) => { setLessonsPerWeek(v); setLesson("Lesson 1"); }} />
              </View>
              <View style={{ flex: 1 }}>
                <SelectPicker label="Lesson" value={lesson} options={lessonOptions} onChange={setLesson} />
              </View>
            </View>

            <TouchableOpacity
              style={[s.btnPrimary, { width: "100%", justifyContent: "center", marginTop: 8 }]}
              onPress={generateScheme}
              disabled={loadingScheme}
            >
              {loadingScheme ? <Spinner /> : <Text style={s.btnPrimaryText}>Generate Demo Scheme</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.btnGhost, { width: "100%", justifyContent: "center", marginTop: 10, opacity: !scheme || loadingLesson ? 0.5 : 1 }]}
              onPress={generateLesson}
              disabled={!scheme || loadingLesson}
            >
              {loadingLesson ? <Spinner dark /> : <Text style={s.btnGhostText}>Generate Demo Lesson Plan</Text>}
            </TouchableOpacity>

            <View style={s.demoNotice}>
              <Text style={s.demoNoticeText}>Demo previews are watermarked and view-only. Your free account lets you save, export, and print classroom-ready documents inside the app.</Text>
            </View>
          </View>

          {/* Output */}
          <View style={{ flex: 1, gap: 16 }}>
            {!scheme && !lessonPlan && (
              <View style={s.previewPanel}>
                <View style={s.emptyPanel}>
                  <View style={s.emptyIcon}><Text style={{ fontSize: 28 }}>📄</Text></View>
                  <Text style={s.emptyTitle}>Your preview appears here.</Text>
                  <Text style={s.emptyBody}>Start with a Demo Scheme — then unlock the lesson plan generator.</Text>
                </View>
              </View>
            )}
            {scheme && <SchemePreview scheme={scheme} />}
            {lessonPlan && <LessonPreview lp={lessonPlan} />}
          </View>
        </View>
      </View>
    </View>
  );
}

function Watermark(): JSX.Element {
  return (
    <View pointerEvents="none" style={s.watermarkWrap}>
      <Text style={s.watermarkText}>DEMO PREVIEW ONLY</Text>
    </View>
  );
}

interface SchemePreviewProps {
  scheme: Scheme;
}

function SchemePreview({ scheme }: SchemePreviewProps): JSX.Element {
  return (
    <View style={s.previewPanel}>
      <Watermark />
      <Text style={s.previewKicker}>Generated demo scheme</Text>
      <Text style={s.previewTitle}>{scheme.subject} — {scheme.classLevel} — {scheme.term}</Text>
      <View style={s.table}>
        <View style={[s.tableRow, { backgroundColor: C.forest }]}>
          <Text style={[s.th, { width: 42 }]}>Wk</Text>
          <Text style={[s.th, { flex: 1 }]}>Topic</Text>
          <Text style={[s.th, { flex: 1 }]}>Objective</Text>
        </View>
        {scheme.weeks.slice(0, 5).map((w, i) => (
          <View key={w.week} style={[s.tableRow, { backgroundColor: i % 2 === 1 ? C.yellowPale : C.surface }]}>
            <Text style={[s.td, { width: 42 }]}>{w.week}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[s.td, { fontWeight: "700", color: C.forest }]}>{w.topic}</Text>
              <Text style={[s.td, { fontSize: 10, color: C.ink40 }]}>{w.strand} | {w.subStrand}</Text>
            </View>
            <Text style={[s.td, { flex: 1 }]}>{w.objectives}</Text>
          </View>
        ))}
      </View>
      <Text style={{ fontSize: 11, color: C.ink40, marginTop: 10 }}>Showing 5 of 12 weeks. Sign up for the full scheme.</Text>
    </View>
  );
}

interface LessonPreviewProps {
  lp: LessonPlan;
}

function LessonPreview({ lp }: LessonPreviewProps): JSX.Element {
  const { width } = useWindowDimensions();
  const compact = width < 760;
  const title = `${lp.subjectClassTitle} - ${lp.weekTitle}`;

  return (
    <View style={[s.previewPanel, compact && s.previewPanelCompact]}>
      <Watermark />
      <Text style={s.previewKicker}>Generated demo lesson plan</Text>
      <View style={[s.lessonTitleBlock, compact && s.lessonTitleBlockCompact]}>
        <Text style={[s.lessonTitleMain, compact && s.lessonTitleMainCompact]}>{lp.termTitle.toUpperCase()}</Text>
        <Text style={[s.lessonTitleSub, compact && s.lessonTitleSubCompact]}>{title.toUpperCase()}</Text>
      </View>

      <View style={s.lessonTable}>
        <View style={s.lessonInfoRow}>
          <LessonInfoCell label="Week ending" value={lp.date} flex={1.2} />
          <LessonInfoCell label="Period" value={lp.period} flex={0.8} />
          <LessonInfoCell label="Subject" value={lp.subject} flex={1} last />
        </View>
        <View style={[s.lessonInfoRow, s.lessonAltRow]}>
          <LessonInfoCell label="Duration" value={lp.duration} flex={1.2} />
          <LessonInfoCell label="Strand" value={lp.strand} flex={1.8} last />
        </View>
        <View style={s.lessonInfoRow}>
          <LessonInfoCell label="Class" value={lp.classLevel} flex={1.2} />
          <LessonInfoCell label="Class Size" value={lp.classSize} flex={0.8} />
          <LessonInfoCell label="Sub Strand" value={lp.subStrand} flex={1} last />
        </View>
        <View style={[s.lessonInfoRow, s.lessonAltRow]}>
          <LessonInfoCell label="Topic" value={lp.topic} flex={1.5} />
          <LessonInfoCell label="Lesson in Week" value={lp.lessonNumber} flex={0.8} last />
        </View>
      </View>

      <View style={s.lessonTable}>
        <View style={s.lessonInfoRow}>
          <LessonTextCell label="Content Standard:" value={lp.contentStandard} flex={1.5} />
          <LessonTextCell label="Indicator:" value={lp.indicator} flex={1.3} />
          <LessonTextCell label="Lesson:" value={lp.lessonNumber} flex={0.5} last />
        </View>
        <View style={[s.lessonInfoRow, s.lessonAltRow]}>
          <LessonTextCell label="Performance Indicator:" value={lp.performanceIndicator} flex={1.5} />
          <LessonTextCell label="Core Competencies:" value={lp.coreCompetencies.join(": ")} flex={1.8} last />
        </View>
        <View style={s.lessonInfoRow}>
          <LessonTextCell label="References:" value={lp.references} flex={1} last />
        </View>
      </View>

      <View style={s.lessonTable}>
        <View style={[s.lessonInfoRow, s.lessonPhaseHeader]}>
          <Text style={[s.lessonPhaseHeadText, { flex: compact ? 0.7 : 0.45 }]}>Phase/Duration</Text>
          <Text style={[s.lessonPhaseHeadText, { flex: compact ? 1.8 : 2.8 }]}>Learners Activities</Text>
          <Text style={[s.lessonPhaseHeadText, { flex: compact ? 0.55 : 0.45 }, s.lessonLastCell]}>Resources</Text>
        </View>
        {lp.phases.map((p, index) => (
          <View key={p.phase} style={[s.lessonInfoRow, index % 2 === 1 && s.lessonAltRow]}>
            <View style={[s.lessonPhaseCellWrap, { flex: compact ? 0.7 : 0.45 }]}>
              <Text style={s.lessonPhaseLabel}>PHASE {p.phase}:</Text>
              <Text style={s.lessonPhaseName}>{p.title}</Text>
              {p.duration ? <Text style={s.lessonPhaseDuration}>{p.duration}</Text> : null}
            </View>
            <View style={[s.lessonPhaseCellWrap, { flex: compact ? 1.8 : 2.8 }]}>
              {p.activities.map((activity, activityIndex) => (
                <Text key={activityIndex} style={s.lessonActivityText}>{activity}</Text>
              ))}
              {p.assessment?.length ? (
                <View style={s.lessonAssessmentBlock}>
                  <Text style={s.lessonAssessmentTitle}>Assessment</Text>
                  {p.assessment.map((question, questionIndex) => (
                    <Text key={questionIndex} style={s.lessonAssessmentText}>
                      {questionIndex + 1}. {question}
                    </Text>
                  ))}
                </View>
              ) : null}
            </View>
            <View style={[s.lessonPhaseCellWrap, { flex: compact ? 0.55 : 0.45 }, s.lessonLastCell]}>
              {p.resources?.map((resource, resourceIndex) => (
                <Text key={resourceIndex} style={s.lessonResourceText}>{resource}</Text>
              ))}
            </View>
          </View>
        ))}
      </View>

      <View style={s.demoOnlyStrip}>
        <Text style={s.demoOnlyText}>Demo preview only. Export, print, copy, and full lesson details unlock after sign in.</Text>
      </View>
    </View>
  );
}

function LessonInfoCell({
  label,
  value,
  flex,
  last,
}: {
  label: string;
  value: string;
  flex: number;
  last?: boolean;
}) {
  return (
    <View style={[s.lessonCell, { flex }, last && s.lessonLastCell]}>
      <Text style={s.lessonInlineText}>
        <Text style={s.lessonInlineLabel}>{label}: </Text>
        {value}
      </Text>
    </View>
  );
}

function LessonTextCell({
  label,
  value,
  flex,
  last,
}: {
  label: string;
  value: string;
  flex: number;
  last?: boolean;
}) {
  const separator = label.trim().endsWith(":") ? " " : ": ";
  return (
    <View style={[s.lessonCell, { flex }, last && s.lessonLastCell]}>
      <Text style={s.lessonInlineText}>
        <Text style={s.lessonInlineLabel}>{label}{separator}</Text>
        {value}
      </Text>
    </View>
  );
}

function FeaturesSection(): JSX.Element {
  return (
    <View style={s.section}>
      <View style={s.sectionInner}>
        <Text style={s.eyebrow}>What you can create</Text>
        <Text style={s.sectionTitle}>Everything a teacher needs{"\n"}for weekly planning.</Text>
        <View style={s.featuresGrid}>
          {FEATURES.map((f) => (
            <View key={f.name} style={s.featureCard}>
              <View style={s.featureIcon}><Text style={{ fontSize: 22 }}>{f.icon}</Text></View>
              <Text style={s.featureName}>{f.name}</Text>
              <Text style={s.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

interface HowStep {
  num: string;
  icon: string;
  text: string;
}

function HowSection(): JSX.Element {
  const steps: HowStep[] = [
    { num: "01", icon: "🎯", text: "Choose your class level, subject, and term." },
    { num: "02", icon: "⚡", text: "Generate a 12-week scheme of work — or upload your own." },
    { num: "03", icon: "✅", text: "Create lesson plans, teaching notes, and export to PDF." },
  ];

  return (
    <View style={[s.section, { backgroundColor: C.forest }]}>
      <View style={s.sectionInner}>
        <Text style={[s.eyebrow, { color: C.yellowLight }]}>How it works</Text>
        <Text style={[s.sectionTitle, { color: C.white }]}>Ready in three steps.</Text>
        <View style={s.stepsGrid}>
          {steps.map((step) => (
            <View key={step.num} style={s.step}>
              <Text style={s.stepNum}>{step.num}</Text>
              <Text style={s.stepIcon}>{step.icon}</Text>
              <Text style={s.stepText}>{step.text}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function ValueSection(): JSX.Element {
  return (
    <View style={s.section}>
      <View style={s.sectionInner}>
        <Text style={s.eyebrow}>Why teachers use it</Text>
        <Text style={s.sectionTitle}>Less planning stress.{"\n"}More organised classrooms.</Text>
        <View style={s.valueGrid}>
          {VALUE_PROPS.map((v) => (
            <View key={v} style={s.valueItem}>
              <View style={s.valueCheck}><Text style={{ color: C.forestLight, fontSize: 13 }}>✓</Text></View>
              <Text style={s.valueText}>{v}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

interface FaqGroupProps {
  group: LandingFaqGroup;
}

function FaqGroupComponent({ group }: FaqGroupProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({});
  return (
    <View style={s.faqGroup}>
      <TouchableOpacity style={s.faqGroupTop} onPress={() => setOpen(!open)}>
        <View>
          <Text style={s.faqGroupTitle}>{group.title}</Text>
          <Text style={s.faqGroupMeta}>{group.items.length} questions</Text>
        </View>
        <Text style={[s.faqArrow, open && { transform: [{ rotate: "180deg" }] }]}>▾</Text>
      </TouchableOpacity>
      {open && (
        <View style={{ padding: 10 }}>
          {group.items.map((item, i) => {
            const itemOpen = openItems[i];
            return (
              <View key={i} style={s.faqItem}>
                <TouchableOpacity style={s.faqQ} onPress={() => setOpenItems((p) => ({ ...p, [i]: !p[i] }))}>
                  <Text style={s.faqQuestion}>{item.question}</Text>
                  <Text style={[{ color: C.ink40, fontSize: 16 }, itemOpen && { transform: [{ rotate: "180deg" }] }]}>▾</Text>
                </TouchableOpacity>
                {itemOpen && (
                  <View style={{ paddingHorizontal: 16, paddingBottom: 14, borderTopWidth: 1, borderTopColor: C.border, paddingTop: 12 }}>
                    <Text style={{ fontSize: 13, lineHeight: 22, color: C.ink70 }}>{item.answer}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

function FaqSection(): JSX.Element {
  const [groups, setGroups] = useState<LandingFaqGroup[]>(() => legacyFaqGroupsToLanding(FAQ_GROUPS));

  useEffect(() => {
    let active = true;
    loadLandingFaqGroups()
      .then((next) => {
        if (active) setGroups(next);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  return (
    <View style={[s.section, { backgroundColor: C.warmWhite }]}>
      <View style={[s.sectionInner, { maxWidth: 820 }]}>
        <Text style={s.eyebrow}>FAQ</Text>
        <Text style={s.sectionTitle}>Everything teachers usually ask.</Text>
        {groups.map((g) => <FaqGroupComponent key={g.id ?? g.title} group={g} />)}
      </View>
    </View>
  );
}

function legacyFaqGroupsToLanding(groups: FaqGroup[]): LandingFaqGroup[] {
  return groups.map((group, groupIndex) => ({
    title: group.title,
    sortOrder: groupIndex + 1,
    active: true,
    items: group.items.map((item, itemIndex) => ({
      question: item.q,
      answer: item.a,
      sortOrder: itemIndex + 1,
      active: true,
    })),
  }));
}

interface CtaSectionProps {
  onGetAccess: () => void;
}

function CtaSection({ onGetAccess }: CtaSectionProps): JSX.Element {
  return (
    <View style={s.ctaSection}>
      <View style={[s.sectionInner, { alignItems: "center" }]}>
        <Text style={[s.eyebrow, { color: C.yellowLight }]}>Free to start</Text>
        <Text style={[s.sectionTitle, { color: C.white, textAlign: "center" }]}>Open your free teacher account.</Text>
        <Text style={[s.sectionBody, { color: "rgba(255,255,255,0.65)", textAlign: "center", marginBottom: 28 }]}>
          Create your GES Lesson Planner account and start building full lesson plans, schemes, teaching notes, and PDFs.
        </Text>
        <TouchableOpacity style={[s.btnYellow, s.btnXl]} onPress={onGetAccess}>
          <Text style={s.btnYellowText}>Create Free Account →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Footer(): JSX.Element {
  return (
    <View style={s.footer}>
      <Text style={s.footerText}>
        <Text style={{ color: "rgba(255,255,255,0.8)", fontWeight: "700" }}>GES Lesson Planner</Text>
        {" — AI planning support for B1–B9 Ghanaian teachers."}
      </Text>
      <Text style={s.footerSub}>© 2026 GES Lesson Planner. All rights reserved.</Text>
    </View>
  );
}

// ─── Main App ──────────────────────────────────────────────────────
interface LandingPageProps {
  onGetAccess?: () => void;
}

export default function LandingPage({ onGetAccess }: LandingPageProps): JSX.Element {
  const scrollRef = useRef<ScrollView>(null);
  const demoY = useRef<number>(0);
  const handleGetAccess = onGetAccess ?? (() => router.push("/(auth)/sign-in"));

  return (
    <View style={{ flex: 1, backgroundColor: C.cream }}>
      <NavBar
        onTryDemo={() => scrollRef.current?.scrollTo({ y: demoY.current - 80, animated: true })}
        onGetAccess={handleGetAccess}
      />
      <ScrollView ref={scrollRef} style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <HeroSection
          onTryDemo={() => scrollRef.current?.scrollTo({ y: demoY.current - 80, animated: true })}
          onGetAccess={handleGetAccess}
        />
        <ScrollingBand />
        <View onLayout={(e) => { demoY.current = e.nativeEvent.layout.y; }}>
          <DemoSection />
        </View>
        <FeaturesSection />
        <HowSection />
        <ValueSection />
        <FaqSection />
        <CtaSection onGetAccess={handleGetAccess} />
        <Footer />
      </ScrollView>
    </View>
  );
}

// ─── StyleSheet ────────────────────────────────────────────────────
const s = StyleSheet.create({
  // NAV
  nav: { backgroundColor: "rgba(250,247,242,0.96)", borderBottomWidth: 1, borderBottomColor: C.border, zIndex: 100 },
  navInner: { maxWidth: 1160, alignSelf: "center", width: "100%", paddingHorizontal: 20, height: 64, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brand: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandIcon: { width: 38, height: 38, backgroundColor: C.forest, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  brandName: { fontFamily: Platform.OS === "web" ? "Georgia, serif" : "serif", fontSize: 14, fontWeight: "700", color: C.forest },
  brandSub: { fontSize: 11, color: C.ink40 },
  navActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  freePill: { backgroundColor: C.yellowPale, borderWidth: 1, borderColor: "rgba(255,230,0,0.55)", borderRadius: 999, paddingVertical: 6, paddingHorizontal: 11 },
  freePillText: { color: C.forest, fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.4 },

  // BUTTONS
  btnPrimary: { backgroundColor: C.forest, paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  btnPrimaryText: { color: C.white, fontSize: 14, fontWeight: "700" },
  btnGhost: { backgroundColor: "transparent", paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8, borderWidth: 1.5, borderColor: C.border, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  btnGhostText: { color: C.forest, fontSize: 14, fontWeight: "600" },
  btnYellow: { backgroundColor: C.yellow, paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  btnYellowText: { color: C.forest, fontSize: 15, fontWeight: "700" },
  btnXl: { paddingVertical: 17, paddingHorizontal: 36, borderRadius: 12 },

  // KICKER PILL
  kickerPill: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: C.yellowPale, borderWidth: 1, borderColor: "rgba(255,230,0,0.4)", paddingVertical: 5, paddingHorizontal: 12, borderRadius: 100, alignSelf: "flex-start", marginBottom: 18 },
  kickerDot: { width: 6, height: 6, backgroundColor: C.yellow, borderRadius: 3 },
  kickerText: { fontSize: 11, fontWeight: "600", color: C.yellow, letterSpacing: 1.2, textTransform: "uppercase" },

  // HERO
  heroWrap: { maxWidth: 1160, alignSelf: "center", width: "100%", paddingHorizontal: 20, paddingTop: 60, paddingBottom: 48, flexDirection: "row", flexWrap: "wrap", gap: 48, alignItems: "center" },
  heroCopy: { flex: 1, minWidth: 280 },
  heroTitle: { fontFamily: Platform.OS === "web" ? "Georgia, serif" : "serif", fontSize: 44, fontWeight: "900", color: C.forest, lineHeight: 50, marginBottom: 16, letterSpacing: -0.5 },
  heroTitleEm: { fontStyle: "italic", color: C.yellow },
  heroBody: { fontSize: 16, lineHeight: 27, color: C.ink70, marginBottom: 28 },
  heroCta: { flexDirection: "row", gap: 12, marginBottom: 36, flexWrap: "wrap" },
  freeNote: { backgroundColor: C.yellowPale, borderWidth: 1, borderColor: "rgba(255,230,0,0.38)", borderRadius: 8, paddingVertical: 9, paddingHorizontal: 12, alignSelf: "flex-start", marginTop: -22, marginBottom: 28 },
  freeNoteText: { color: C.forest, fontSize: 13, fontWeight: "700" },
  heroStats: { flexDirection: "row", gap: 28, flexWrap: "wrap" },
  stat: {},
  statNum: { fontFamily: Platform.OS === "web" ? "Georgia, serif" : "serif", fontSize: 26, fontWeight: "700", color: C.forest },
  statLabel: { fontSize: 12, color: C.ink40, marginTop: 3 },

  // DOC CARD
  docCard: { backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.14, shadowRadius: 28, elevation: 8 },
  docHeader: { backgroundColor: C.forest, padding: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  docHeaderLabel: { color: C.white, fontSize: 14, fontWeight: "700" },
  docDot: { width: 8, height: 8, borderRadius: 4 },
  docBadge: { backgroundColor: C.yellow, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100 },
  docBadgeText: { fontSize: 10, fontWeight: "600", color: C.forest, textTransform: "uppercase", letterSpacing: 0.6 },
  docBody: { padding: 18 },
  docRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: C.border },
  docRowLabel: { fontSize: 10, color: C.ink40, textTransform: "uppercase", letterSpacing: 0.8, width: 72, flexShrink: 0, paddingTop: 2 },
  docBar: { height: 8, borderRadius: 4 },
  docCell: { flex: 1, height: 52, borderRadius: 6 },
  accentCard: { position: "absolute", bottom: -16, left: -20, backgroundColor: C.forest, borderRadius: 12, padding: 14, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", gap: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 20, elevation: 6 },
  accentIcon: { width: 36, height: 36, backgroundColor: C.yellow, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  accentBig: { color: C.white, fontSize: 18, fontWeight: "700", fontFamily: Platform.OS === "web" ? "Georgia, serif" : "serif" },
  accentSmall: { color: "rgba(255,255,255,0.65)", fontSize: 11, marginTop: 2 },

  // BAND
  band: { backgroundColor: C.forest, paddingVertical: 14, overflow: "hidden" },
  bandItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 24 },
  bandStar: { color: C.yellow, fontSize: 14 },
  bandText: { color: "rgba(255,255,255,0.7)", fontSize: 12, letterSpacing: 0.8, fontFamily: Platform.OS === "web" ? "monospace" : "monospace" },

  // SECTIONS
  section: { paddingVertical: 64, paddingHorizontal: 20 },
  sectionInner: { maxWidth: 1160, alignSelf: "center", width: "100%" },
  eyebrow: { fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1.4, color: C.yellow, marginBottom: 10, fontFamily: Platform.OS === "web" ? "monospace" : "monospace" },
  sectionTitle: { fontFamily: Platform.OS === "web" ? "Georgia, serif" : "serif", fontSize: 36, fontWeight: "900", color: C.forest, lineHeight: 42, letterSpacing: -0.5, marginBottom: 12 },
  sectionBody: { fontSize: 15, lineHeight: 25, color: C.ink70, maxWidth: 600 },

  // DEMO
  demoSection: { backgroundColor: C.warmWhite, paddingVertical: 64, paddingHorizontal: 20 },
  demoGrid: { flexDirection: "row", gap: 24, marginTop: 32, flexWrap: "wrap", alignItems: "flex-start" },
  demoControls: { width: 320, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 20, elevation: 2 },
  demoControlsTitle: { fontFamily: Platform.OS === "web" ? "Georgia, serif" : "serif", fontSize: 16, fontWeight: "700", color: C.forest, marginBottom: 16 },
  lockBadge: { backgroundColor: C.yellowPale, borderWidth: 1, borderColor: "rgba(255,230,0,0.3)", borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start", marginBottom: 12 },
  lockBadgeText: { fontSize: 11, fontWeight: "500", color: C.forest, fontFamily: Platform.OS === "web" ? "monospace" : "monospace" },
  field: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: "600", color: C.ink70, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 5 },
  select: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1.5, borderColor: C.border, borderRadius: 8, backgroundColor: C.cream },
  selectText: { fontSize: 14, color: C.ink },
  dropdown: { position: "absolute", top: 68, left: 0, right: 0, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 8, zIndex: 999, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4, maxHeight: 200 },
  dropdownItem: { paddingVertical: 10, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  dropdownItemActive: { backgroundColor: C.yellowPale },
  dropdownText: { fontSize: 14, color: C.ink },
  demoNotice: { backgroundColor: C.yellowPale, borderWidth: 1, borderColor: "rgba(255,230,0,0.25)", borderRadius: 7, padding: 12, marginTop: 14 },
  demoNoticeText: { fontSize: 12, lineHeight: 19, color: C.ink40 },

  // PREVIEW / SCHEME / LESSON
  previewPanel: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 20, flex: 1, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 20, elevation: 2 },
  previewPanelCompact: { padding: 10 },
  watermarkWrap: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, alignItems: "center", justifyContent: "center", zIndex: 0 },
  watermarkText: { fontSize: 22, fontWeight: "900", color: C.red, opacity: 0.07, transform: [{ rotate: "-15deg" }], letterSpacing: 0.4, fontFamily: Platform.OS === "web" ? "Georgia, serif" : "serif" },
  previewKicker: { fontSize: 10, fontWeight: "500", textTransform: "uppercase", letterSpacing: 1, color: C.yellow, marginBottom: 4, fontFamily: Platform.OS === "web" ? "monospace" : "monospace" },
  previewTitle: { fontFamily: Platform.OS === "web" ? "Georgia, serif" : "serif", fontSize: 18, fontWeight: "700", color: C.forest, marginBottom: 4 },
  previewMeta: { fontSize: 12, color: C.ink40, marginBottom: 16 },
  table: { borderWidth: 1, borderColor: C.border, borderRadius: 8, overflow: "hidden" },
  tableRow: { flexDirection: "row" },
  th: { padding: 9, color: C.white, fontWeight: "600", fontSize: 11, letterSpacing: 0.4 },
  td: { padding: 8, color: C.ink, fontSize: 12, lineHeight: 18 },
  phaseCard: { borderWidth: 1, borderColor: C.border, borderRadius: 8, padding: 14, marginTop: 10, backgroundColor: C.cream },
  phaseTitle: { fontFamily: Platform.OS === "web" ? "Georgia, serif" : "serif", fontSize: 14, fontWeight: "700", color: C.forest },
  phaseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.yellow, flexShrink: 0 },
  phaseLineLabel: { fontWeight: "700", color: C.forestLight, flexShrink: 0, fontSize: 11, minWidth: 72 },
  phaseLineText: { flex: 1, fontSize: 12, lineHeight: 19, color: C.ink70 },
  lessonTitleBlock: { alignItems: "center", paddingVertical: 12, marginTop: 8, marginBottom: 8 },
  lessonTitleBlockCompact: { paddingVertical: 8, marginBottom: 6 },
  lessonTitleMain: { color: C.forest, fontSize: 15, fontWeight: "800", textAlign: "center" },
  lessonTitleMainCompact: { fontSize: 12 },
  lessonTitleSub: { color: C.forest, fontSize: 13, fontWeight: "700", marginTop: 2, textAlign: "center" },
  lessonTitleSubCompact: { fontSize: 11 },
  lessonTable: { borderWidth: 1, borderColor: C.border, borderRadius: 6, overflow: "hidden", marginTop: 8, backgroundColor: C.surface },
  lessonInfoRow: { flexDirection: "row", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border, minHeight: 32 },
  lessonAltRow: { backgroundColor: C.yellowPale },
  lessonCell: { padding: 5, borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: C.border, justifyContent: "flex-start" },
  lessonLastCell: { borderRightWidth: 0 },
  lessonCellLabel: { color: C.ink40, fontSize: 9, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 3 },
  lessonCellValue: { color: C.ink, fontSize: 11, lineHeight: 16, fontWeight: "600" },
  lessonInlineText: { color: C.ink, fontSize: 11, lineHeight: 16 },
  lessonInlineLabel: { color: C.forest, fontWeight: "800" },
  lessonPhaseHeader: { backgroundColor: C.forest },
  lessonPhaseHeadText: { color: C.white, fontSize: 9, lineHeight: 13, fontWeight: "800", padding: 6, borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: "rgba(255,255,255,0.3)" },
  lessonPhaseLabel: { color: C.forest, fontSize: 8, fontWeight: "800" },
  lessonPhaseName: { color: C.ink, fontSize: 9, fontWeight: "700", lineHeight: 12, marginTop: 2 },
  lessonPhaseDuration: { color: C.ink40, fontSize: 8, lineHeight: 12, marginTop: 2 },
  lessonPhaseCellWrap: { padding: 6, borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: C.border },
  lessonActivityText: { color: C.ink, fontSize: 10, lineHeight: 15, marginBottom: 3 },
  lessonAssessmentBlock: { marginTop: 6, paddingTop: 6, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.border },
  lessonAssessmentTitle: { color: C.forest, fontSize: 9, fontWeight: "800", marginBottom: 3 },
  lessonAssessmentText: { color: C.ink, fontSize: 10, lineHeight: 15, marginBottom: 2 },
  lessonResourceText: { color: C.ink, fontSize: 9, lineHeight: 13, marginBottom: 2 },
  demoOnlyStrip: { backgroundColor: C.yellowPale, borderWidth: 1, borderColor: "rgba(255,230,0,0.35)", borderRadius: 7, padding: 10, marginTop: 10 },
  demoOnlyText: { color: C.ink70, fontSize: 11, lineHeight: 17, textAlign: "center" },

  // EMPTY
  emptyPanel: { alignItems: "center", justifyContent: "center", minHeight: 260, gap: 12 },
  emptyIcon: { width: 56, height: 56, backgroundColor: C.yellowPale, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontFamily: Platform.OS === "web" ? "Georgia, serif" : "serif", fontSize: 17, fontWeight: "700", color: C.forest },
  emptyBody: { fontSize: 13, color: C.ink40, maxWidth: 300, textAlign: "center", lineHeight: 20 },

  // FEATURES
  featuresGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16, marginTop: 40 },
  featureCard: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 22, width: "30%", minWidth: 240, flex: 1 },
  featureIcon: { width: 44, height: 44, backgroundColor: C.forest, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  featureName: { fontFamily: Platform.OS === "web" ? "Georgia, serif" : "serif", fontSize: 16, fontWeight: "700", color: C.forest, marginBottom: 6 },
  featureText: { fontSize: 14, color: C.ink70, lineHeight: 22 },

  // HOW
  stepsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 2, marginTop: 40, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 12, overflow: "hidden" },
  step: { flex: 1, minWidth: 220, padding: 32, backgroundColor: "rgba(255,255,255,0.04)" },
  stepNum: { fontFamily: Platform.OS === "web" ? "Georgia, serif" : "serif", fontSize: 52, fontWeight: "900", color: C.yellow, opacity: 0.4, lineHeight: 56, marginBottom: 12 },
  stepIcon: { fontSize: 20, position: "absolute", top: 28, right: 24, opacity: 0.3 },
  stepText: { fontSize: 16, lineHeight: 24, fontWeight: "500", color: "rgba(255,255,255,0.85)" },

  // VALUE
  valueGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 32 },
  valueItem: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 16, flexDirection: "row", alignItems: "flex-start", gap: 12, width: "47%", minWidth: 240, flex: 1 },
  valueCheck: { width: 24, height: 24, backgroundColor: "rgba(61,122,92,0.12)", borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  valueText: { fontSize: 14, fontWeight: "500", color: C.ink, lineHeight: 21, flex: 1 },

  // FAQ
  faqGroup: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, marginTop: 12, overflow: "hidden" },
  faqGroupTop: { padding: 18, paddingHorizontal: 20, backgroundColor: C.forest, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  faqGroupTitle: { fontFamily: Platform.OS === "web" ? "Georgia, serif" : "serif", fontSize: 16, fontWeight: "700", color: C.white },
  faqGroupMeta: { fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 },
  faqArrow: { color: C.white, fontSize: 16 },
  faqItem: { backgroundColor: C.cream, borderWidth: 1, borderColor: C.border, borderRadius: 8, marginTop: 8, overflow: "hidden" },
  faqQ: { padding: 14, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  faqQuestion: { fontSize: 14, fontWeight: "600", color: C.forest, flex: 1, lineHeight: 20 },

  // CTA
  ctaSection: { backgroundColor: C.forest, paddingVertical: 80, paddingHorizontal: 20 },

  // FOOTER
  footer: { backgroundColor: C.ink, paddingVertical: 28, paddingHorizontal: 20, alignItems: "center" },
  footerText: { color: "rgba(255,255,255,0.5)", fontSize: 13, textAlign: "center" },
  footerSub: { color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 6 },

  // SPINNER
  spinner: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: "rgba(255,255,255,0.3)", borderTopColor: C.white },
  spinnerDark: { borderColor: "rgba(0,0,0,0.15)", borderTopColor: C.forest },
});
