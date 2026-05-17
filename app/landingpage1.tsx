// GES Lesson Planner — Expo / React Native Web
// Rebranded: Professional Ghanaian EdTech & Mobile-First
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
  Image,
  type DimensionValue,
} from "react-native";
import { router } from "expo-router";
import {
  loadLandingFaqGroups,
  type LandingFaqGroup,
} from "@/lib/landingFaqs";

// ─── Design Tokens (Professional Ghanaian EdTech) ────────────────
const C = {
  // Rich, professional colors inspired by Ghanaian heritage
  gold: "#D4AF37",       // Rich Gold
  goldLight: "#F5DF96",
  goldPale: "#FDF9EC",
  emerald: "#0B4D3C",    // Deep Independence Emerald
  emeraldMid: "#116B54",
  emeraldLight: "#1A9B7A",
  red: "#C91C2D",        // Black Star Red (used sparingly for accents)
  cream: "#FAF9F6",      // Warm off-white background
  white: "#FFFFFF",
  ink: "#121A16",        // Near black for sharp text
  ink70: "rgba(18,26,22,0.75)",
  ink40: "rgba(18,26,22,0.45)",
  border: "rgba(11,77,60,0.12)", // Tinted border
  surface: "#FFFFFF",
} as const;

// ─── Types ────────────────────────────────────────────────────────
interface FaqItem { q: string; a: string; }
interface FaqGroup { title: string; items: FaqItem[]; }
interface Feature { icon: string; name: string; text: string; }
interface TopicBase { strand: string; subStrand: string; topic: string; objective: string; }
interface SchemeWeek { week: number; strand: string; subStrand: string; topic: string; objectives: string; }
interface Scheme { subject: string; classLevel: string; term: string; weeks: SchemeWeek[]; }
interface LessonPhase { phase: 1 | 2 | 3; title: string; duration?: string; activities: string[]; resources?: string[]; assessment?: string[]; }
interface LessonPlan { termTitle: string; subjectClassTitle: string; weekTitle: string; subject: string; classLevel: string; date: string; period: string; duration: string; strand: string; subStrand: string; contentStandard: string; indicator: string; performanceIndicator: string; coreCompetencies: string[]; references: string; classSize: string; lessonNumber: string; week: number; topic: string; phases: LessonPhase[]; }

// ─── Data (Preserved from original) ───────────────────────────────
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

function Spinner({ dark }: { dark?: boolean }): JSX.Element {
  const rot = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.timing(rot, { toValue: 1, duration: 700, easing: Easing.linear, useNativeDriver: true })).start();
  }, [rot]);
  const rotate = rot.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  return <Animated.View style={[s.spinner, dark && s.spinnerDark, { transform: [{ rotate }] }]} />;
}

function NavBar({ onTryDemo, onGetAccess, isMobile }: { onTryDemo: () => void; onGetAccess: () => void; isMobile: boolean }): JSX.Element {
  return (
    <View style={s.nav}>
      {/* Subtle Ghanaian flag accent bar at the very top */}
      <View style={{ flexDirection: "row", height: 4, width: "100%" }}>
        <View style={{ flex: 1, backgroundColor: C.red }} />
        <View style={{ flex: 1, backgroundColor: C.gold }} />
        <View style={{ flex: 1, backgroundColor: C.emerald }} />
      </View>
      <View style={s.navInner}>
        <View style={s.brand}>
          <View style={s.brandIcon}>
            <Text style={{ fontSize: 18 }}>📋</Text>
          </View>
          <View>
            <Text style={s.brandName}>GES Planner</Text>
            {!isMobile && <Text style={s.brandSub}>Free for B1–B9 teachers</Text>}
          </View>
        </View>
        <View style={s.navActions}>
          {!isMobile && (
            <TouchableOpacity style={s.btnGhost} onPress={onTryDemo}>
              <Text style={s.btnGhostText}>Try Demo</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={s.btnPrimary} onPress={onGetAccess}>
            <Text style={s.btnPrimaryText}>Start Free</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function HeroSection({ onTryDemo, onGetAccess, isMobile }: { onTryDemo: () => void; onGetAccess: () => void; isMobile: boolean }): JSX.Element {
  return (
    <View style={[s.heroWrap, isMobile && { flexDirection: "column", paddingTop: 32 }]}>
      <View style={[s.heroCopy, isMobile && { minWidth: "100%" }]}>
        <View style={s.kickerPill}>
          <Text style={s.kickerText}>Ghana's Smart Teaching Assistant</Text>
        </View>
        <Text style={[s.heroTitle, isMobile && { fontSize: 36, lineHeight: 42 }]}>
          Empower your teaching with{"\n"}
          <Text style={s.heroTitleEm}>instant planning.</Text>
        </Text>
        <Text style={[s.heroBody, isMobile && { fontSize: 15 }]}>
          Generate professional schemes of work, lesson plans, and teaching notes for B1–B9 classes. Aligned with the Ghana National Curriculum to give you hours of your week back.
        </Text>
        <View style={[s.heroCta, isMobile && { flexDirection: "column", width: "100%" }]}>
          <TouchableOpacity style={[s.btnPrimary, s.btnXl]} onPress={onGetAccess}>
            <Text style={s.btnPrimaryText}>Create Free Account</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.btnGhost, s.btnXl]} onPress={onTryDemo}>
            <Text style={s.btnGhostText}>View Live Demo</Text>
          </TouchableOpacity>
        </View>
        <View style={s.heroStats}>
          {([ ["Free", "Account"], ["B1–B9", "Levels"], ["3", "Terms"] ] as [string, string][]).map(([n, l]) => (
            <View key={l} style={s.stat}>
              <Text style={s.statNum}>{n}</Text>
              <Text style={s.statLabel}>{l}</Text>
            </View>
          ))}
        </View>
      </View>
      
      {/* Replaced graphic abstract with a more engaging photographic card setup */}
      <View style={[s.heroImageWrap, isMobile && { width: "100%", marginTop: 24 }]}>
        <Image 
          source={{ uri: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800" }} 
          style={s.heroImage} 
        />
        <View style={s.heroImageOverlay}>
          <View style={s.docBadge}><Text style={s.docBadgeText}>AI Powered</Text></View>
          <Text style={{color: C.white, fontWeight: "bold", fontSize: 18, marginTop: 8}}>Term 1 Lesson Plan</Text>
          <View style={{ width: "80%", height: 6, backgroundColor: C.gold, borderRadius: 3, marginTop: 12 }} />
          <View style={{ width: "60%", height: 6, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 3, marginTop: 8 }} />
        </View>
        <View style={s.accentCard}>
          <View style={s.accentIcon}><Text style={{ fontSize: 18 }}>⏱️</Text></View>
          <View>
            <Text style={s.accentBig}>3 mins</Text>
            <Text style={s.accentSmall}>Avg. preparation time</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function ScrollingBand(): JSX.Element {
  const anim = useRef(new Animated.Value(0)).current;
  const items = [...BAND_ITEMS, ...BAND_ITEMS];
  useEffect(() => {
    Animated.loop(
      Animated.timing(anim, { toValue: -1440, duration: 25000, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, [anim]);
  return (
    <View style={s.band}>
      <Animated.View style={[{ flexDirection: "row" }, { transform: [{ translateX: anim }] }]}>
        {items.map((item, i) => (
          <View key={i} style={s.bandItem}>
            <View style={s.bandDiamond} />
            <Text style={s.bandText}>{item}</Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

function SelectPicker({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (val: string) => void; }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TouchableOpacity style={s.select} onPress={() => setOpen(!open)}>
        <Text style={s.selectText}>{value}</Text>
        <Text style={{ color: C.emerald, fontSize: 12 }}>▼</Text>
      </TouchableOpacity>
      {open && (
        <View style={s.dropdown}>
          <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
            {options.map((opt) => (
              <TouchableOpacity key={opt} style={[s.dropdownItem, opt === value && s.dropdownItemActive]} onPress={() => { onChange(opt); setOpen(false); }}>
                <Text style={[s.dropdownText, opt === value && { color: C.emerald, fontWeight: "700" }]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

function DemoSection({ isMobile }: { isMobile: boolean }): JSX.Element {
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

  function generateScheme() {
    setLoadingScheme(true); setLessonPlan(null);
    setTimeout(() => {
      const tb = getTopicBase(subject);
      setScheme({ subject, classLevel, term, weeks: Array.from({ length: 12 }, (_, i) => ({ week: i + 1, strand: tb.strand, subStrand: tb.subStrand, topic: tb.topic + " " + (i + 1), objectives: "Learners demonstrate understanding of " + tb.objective + " through guided classroom activities." })) });
      setLoadingScheme(false);
    }, 800);
  }

  function generateLesson() {
    if (!scheme) return;
    setLoadingLesson(true);
    setTimeout(() => {
      const wNum = parseInt(week.replace("Week ", ""));
      const sw = scheme.weeks.find((w) => w.week === wNum) ?? scheme.weeks[0];
      setLessonPlan({
        termTitle: `${scheme.term} Lesson Plan`, subjectClassTitle: `${scheme.subject} - ${scheme.classLevel}`, weekTitle: `Week ${wNum}`, subject: scheme.subject, classLevel: scheme.classLevel, date: "Demo week ending", period: "1", duration: "60 mins", strand: sw.strand, subStrand: sw.subStrand, contentStandard: buildContentStandard(scheme.subject, scheme.classLevel), indicator: buildIndicator(scheme.subject, wNum), performanceIndicator: "Learners can explain the main idea and apply it in a guided classroom task.", coreCompetencies: ["Critical Thinking", "Communication", "Collaboration"], references: "Teacher resource pack, learner textbook, and locally available teaching materials.", classSize: "45", lessonNumber: lesson.replace("Lesson ", "") + ` of ${lessonsPerWeek}`, week: wNum, topic: sw.topic,
        phases: [
          { phase: 1, title: "STARTER", duration: "10 mins", activities: ["Guide learners to recall previous knowledge through quick oral questions.", "Let learners share familiar examples connected to " + sw.topic.toLowerCase() + "."], resources: ["Chalkboard", "Learners' responses"] },
          { phase: 2, title: "NEW LEARNING", duration: "40 mins", activities: ["Introduce the lesson objective and demonstrate the main idea with clear examples.", "Guide learners to work in pairs or groups, discuss solutions, and present findings.", "Support learners with prompts, corrections, and additional practice activities."], resources: ["Textbook", "Chart", "Local materials"], assessment: ["Explain the main idea in your own words.", "Apply the lesson idea to solve one guided classroom task."] },
          { phase: 3, title: "REFLECTION", duration: "10 mins", activities: ["Summarize the key points with learners and correct remaining misconceptions.", "Let learners complete a short exit task and state one thing learned."], resources: ["Exercise books", "Exit task"] }
        ],
      });
      setLoadingLesson(false);
    }, 800);
  }

  return (
    <View style={s.demoSection}>
      <View style={s.sectionInner}>
        <Text style={s.eyebrow}>Interactive Demo</Text>
        <Text style={[s.sectionTitle, { color: C.emerald }]}>Experience the planner.</Text>
        <Text style={s.sectionBody}>See how easily you can transition from a Scheme of Work to a detailed Lesson Plan. Demo previews are watermarked and view-only. Create a free account to save, print, and export full documents.</Text>

        <View style={[s.demoGrid, isMobile && { flexDirection: "column" }]}>
          {/* Controls */}
          <View style={[s.demoControls, isMobile && { width: "100%" }]}>
            <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16}}>
               <Text style={s.demoControlsTitle}>Configure Settings</Text>
               <View style={s.lockBadge}><Text style={s.lockBadgeText}>🔒 Demo</Text></View>
            </View>

            <SelectPicker label="Class Level" value={classLevel} options={["B1","B2","B3","B4","B5","B6","B7","B8","B9"]} onChange={setClassLevel} />
            <SelectPicker label="Subject" value={subject} options={["Mathematics","English Language","Science","Ghanaian Language","RME","Social Studies","Computing","Creative Arts"]} onChange={setSubject} />
            
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}><SelectPicker label="Term" value={term} options={["Term 1","Term 2","Term 3"]} onChange={setTerm} /></View>
              <View style={{ flex: 1 }}><SelectPicker label="Week" value={week} options={Array.from({ length: 12 }, (_, i) => `Week ${i + 1}`)} onChange={setWeek} /></View>
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}><SelectPicker label="Lessons/Wk" value={lessonsPerWeek} options={["2","3","4","5"]} onChange={(v) => { setLessonsPerWeek(v); setLesson("Lesson 1"); }} /></View>
              <View style={{ flex: 1 }}><SelectPicker label="Lesson" value={lesson} options={lessonOptions} onChange={setLesson} /></View>
            </View>

            <TouchableOpacity style={[s.btnPrimary, { width: "100%", justifyContent: "center", marginTop: 8 }]} onPress={generateScheme} disabled={loadingScheme}>
              {loadingScheme ? <Spinner /> : <Text style={s.btnPrimaryText}>Generate Scheme</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={[s.btnGhost, { width: "100%", justifyContent: "center", marginTop: 10, opacity: !scheme || loadingLesson ? 0.5 : 1 }]} onPress={generateLesson} disabled={!scheme || loadingLesson}>
              {loadingLesson ? <Spinner dark /> : <Text style={s.btnGhostText}>Generate Lesson Plan</Text>}
            </TouchableOpacity>
            <View style={s.demoNotice}>
              <Text style={s.demoNoticeText}>Your free account unlocks saved work, printable PDFs, and full lesson-plan exports inside the app.</Text>
            </View>
          </View>

          {/* Output */}
          <View style={{ flex: 1, gap: 16, width: isMobile ? "100%" : "auto" }}>
            {!scheme && !lessonPlan && (
              <View style={s.previewPanel}>
                <View style={s.emptyPanel}>
                  <View style={s.emptyIcon}><Text style={{ fontSize: 28 }}>🇬🇭</Text></View>
                  <Text style={s.emptyTitle}>Your document will appear here.</Text>
                  <Text style={s.emptyBody}>Click "Generate Scheme" to begin building your custom Ghanaian curriculum layout.</Text>
                </View>
              </View>
            )}
            {scheme && <SchemePreview scheme={scheme} isMobile={isMobile} />}
            {lessonPlan && <LessonPreview lp={lessonPlan} isMobile={isMobile} />}
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

function SchemePreview({ scheme, isMobile }: { scheme: Scheme; isMobile: boolean }): JSX.Element {
  return (
    <View style={s.previewPanel}>
      <Watermark />
      <Text style={s.previewKicker}>Scheme of Work Demo</Text>
      <Text style={s.previewTitle}>{scheme.subject} — {scheme.classLevel} — {scheme.term}</Text>
      {/* ScrollView ensures tables don't squash on mobile */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
        <View style={[s.table, { minWidth: isMobile ? 600 : "100%" }]}>
          <View style={[s.tableRow, { backgroundColor: C.emerald }]}>
            <Text style={[s.th, { width: 50 }]}>Wk</Text>
            <Text style={[s.th, { flex: 1 }]}>Topic / Sub-Strand</Text>
            <Text style={[s.th, { flex: 1 }]}>Objective</Text>
          </View>
          {scheme.weeks.slice(0, 4).map((w, i) => (
            <View key={w.week} style={[s.tableRow, { backgroundColor: i % 2 === 1 ? C.goldPale : C.surface }]}>
              <Text style={[s.td, { width: 50, fontWeight: "bold" }]}>{w.week}</Text>
              <View style={{ flex: 1, padding: 8 }}>
                <Text style={{ fontWeight: "700", color: C.emerald }}>{w.topic}</Text>
                <Text style={{ fontSize: 10, color: C.ink40, marginTop: 2 }}>{w.strand} | {w.subStrand}</Text>
              </View>
              <Text style={[s.td, { flex: 1 }]}>{w.objectives}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <Text style={{ fontSize: 12, color: C.ink40, marginTop: 12, fontStyle: "italic" }}>Showing 4 of 12 weeks. Create a free account for full exports.</Text>
    </View>
  );
}

function LessonPreview({ lp, isMobile }: { lp: LessonPlan; isMobile: boolean }): JSX.Element {
  return (
    <View style={s.previewPanel}>
      <Watermark />
      <Text style={s.previewKicker}>Lesson Plan Demo</Text>
      <View style={s.lessonTitleBlock}>
        <Text style={s.lessonTitleMain}>{lp.termTitle.toUpperCase()}</Text>
        <Text style={s.lessonTitleSub}>{`${lp.subjectClassTitle} - ${lp.weekTitle}`.toUpperCase()}</Text>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ minWidth: isMobile ? 760 : "100%" }}>
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

          <View style={[s.lessonTable, { marginTop: 12 }]}>
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

          <View style={[s.lessonTable, { marginTop: 12 }]}>
            <View style={[s.lessonInfoRow, s.lessonPhaseHeader]}>
              <Text style={[s.lessonPhaseHeadText, { flex: 0.45 }]}>Phase/Duration</Text>
              <Text style={[s.lessonPhaseHeadText, { flex: 2.8 }]}>Learners Activities</Text>
              <Text style={[s.lessonPhaseHeadText, { flex: 0.45 }, s.lessonLastCell]}>Resources</Text>
            </View>
            {lp.phases.map((p, index) => (
              <View key={p.phase} style={[s.lessonInfoRow, index % 2 === 1 && s.lessonAltRow]}>
                <View style={[s.lessonPhaseCellWrap, { flex: 0.45 }]}>
                  <Text style={s.lessonPhaseLabel}>PHASE {p.phase}:</Text>
                  <Text style={s.lessonPhaseName}>{p.title}</Text>
                  {p.duration && <Text style={s.lessonPhaseDuration}>{p.duration}</Text>}
                </View>
                <View style={[s.lessonPhaseCellWrap, { flex: 2.8 }]}>
                  {p.activities.map((act, i) => <Text key={i} style={s.lessonActivityText}>{act}</Text>)}
                  {p.assessment?.length ? (
                    <View style={s.lessonAssessmentBlock}>
                      <Text style={s.lessonAssessmentTitle}>Assessment</Text>
                      {p.assessment.map((question, i) => (
                        <Text key={i} style={s.lessonAssessmentText}>{i + 1}. {question}</Text>
                      ))}
                    </View>
                  ) : null}
                </View>
                <View style={[s.lessonPhaseCellWrap, { flex: 0.45 }, s.lessonLastCell]}>
                  {p.resources?.map((res, i) => <Text key={i} style={s.lessonResourceText}>{res}</Text>)}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      <View style={s.demoOnlyStrip}>
        <Text style={s.demoOnlyText}>Demo preview only. Export, print, copy, and full lesson details unlock after sign in.</Text>
      </View>
    </View>
  );
}

function LessonInfoCell({ label, value, flex, last }: { label: string; value: string; flex: number; last?: boolean; }) {
  return (
    <View style={[s.lessonCell, { flex }, last && s.lessonLastCell]}>
      <Text style={s.lessonInlineText}>
        <Text style={s.lessonInlineLabel}>{label}: </Text>
        {value}
      </Text>
    </View>
  );
}

function LessonTextCell({ label, value, flex, last }: { label: string; value: string; flex: number; last?: boolean; }) {
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

function FeaturesSection({ isMobile }: { isMobile: boolean }): JSX.Element {
  return (
    <View style={s.section}>
      <View style={s.sectionInner}>
        <Text style={s.eyebrow}>Capabilities</Text>
        <Text style={s.sectionTitle}>Everything a professional teacher needs.</Text>
        <View style={s.featuresGrid}>
          {FEATURES.map((f) => (
            <View key={f.name} style={[s.featureCard, isMobile && { width: "100%" }]}>
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

function ValueSection({ isMobile }: { isMobile: boolean }): JSX.Element {
  return (
    <View style={[s.section, { backgroundColor: C.goldPale }]}>
      <View style={s.sectionInner}>
        <Text style={s.eyebrow}>Why teachers use it</Text>
        <Text style={s.sectionTitle}>Less planning stress. More organised classrooms.</Text>
        <View style={[s.valueGrid, isMobile && { flexDirection: "column" }]}>
          {VALUE_PROPS.map((value) => (
            <View key={value} style={[s.valueItem, isMobile && { width: "100%" }]}>
              <View style={s.valueCheck}><Text style={s.valueCheckText}>✓</Text></View>
              <Text style={s.valueText}>{value}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function HowSection({ isMobile }: { isMobile: boolean }): JSX.Element {
  const steps = [
    { num: "01", icon: "⚙️", text: "Choose your class, subject, and term." },
    { num: "02", icon: "🧠", text: "AI maps the curriculum to generate a Scheme of Work." },
    { num: "03", icon: "📄", text: "Export ready-to-print lesson plans and notes." },
  ];

  return (
    <View style={[s.section, { backgroundColor: C.emerald }]}>
      <View style={s.sectionInner}>
        <Text style={[s.eyebrow, { color: C.gold }]}>How it works</Text>
        <Text style={[s.sectionTitle, { color: C.white }]}>Ready in three steps.</Text>
        <View style={[s.stepsGrid, isMobile && { flexDirection: "column", gap: 12 }]}>
          {steps.map((step) => (
            <View key={step.num} style={[s.step, isMobile && { padding: 24, borderRadius: 8 }]}>
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

function CtaSection({ onGetAccess }: { onGetAccess: () => void }): JSX.Element {
  return (
    <View style={[s.section, s.ctaSection]}>
      <View style={[s.sectionInner, { alignItems: "center" }]}>
        <Text style={[s.eyebrow, { color: C.gold }]}>Free to start</Text>
        <Text style={[s.sectionTitle, { color: C.white, textAlign: "center" }]}>Open your free teacher account.</Text>
        <Text style={[s.sectionBody, { color: "rgba(255,255,255,0.72)", textAlign: "center" }]}>
          Start building full lesson plans, schemes, teaching notes, and PDFs with GES Lesson Planner.
        </Text>
        <TouchableOpacity style={[s.btnPrimary, s.ctaButton]} onPress={onGetAccess}>
          <Text style={s.ctaButtonText}>Create Free Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function FaqGroupComponent({ group }: { group: LandingFaqGroup }): JSX.Element {
  const [open, setOpen] = useState(false);
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({});
  return (
    <View style={s.faqGroup}>
      <TouchableOpacity style={s.faqGroupTop} onPress={() => setOpen(!open)}>
        <View>
          <Text style={s.faqGroupTitle}>{group.title}</Text>
          <Text style={s.faqGroupMeta}>{group.items.length} questions</Text>
        </View>
        <Text style={[s.faqArrow, open && { transform: [{ rotate: "180deg" }] }]}>▼</Text>
      </TouchableOpacity>
      {open && (
        <View style={{ padding: 12 }}>
          {group.items.map((item, i) => {
            const itemOpen = openItems[i];
            return (
              <View key={i} style={s.faqItem}>
                <TouchableOpacity style={s.faqQ} onPress={() => setOpenItems((p) => ({ ...p, [i]: !p[i] }))}>
                  <Text style={s.faqQuestion}>{item.question}</Text>
                  <Text style={[{ color: C.emerald, fontSize: 12 }, itemOpen && { transform: [{ rotate: "180deg" }] }]}>▼</Text>
                </TouchableOpacity>
                {itemOpen && (
                  <View style={s.faqAnswerBlock}>
                    <Text style={s.faqAnswerText}>{item.answer}</Text>
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
    loadLandingFaqGroups().then((next) => { if (active) setGroups(next); }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  return (
    <View style={[s.section, { backgroundColor: C.cream }]}>
      <View style={[s.sectionInner, { maxWidth: 820 }]}>
        <Text style={s.eyebrow}>FAQ</Text>
        <Text style={s.sectionTitle}>Common questions.</Text>
        {groups.map((g) => <FaqGroupComponent key={g.id ?? g.title} group={g} />)}
      </View>
    </View>
  );
}

function legacyFaqGroupsToLanding(groups: FaqGroup[]): LandingFaqGroup[] {
  return groups.map((group, groupIndex) => ({
    title: group.title, sortOrder: groupIndex + 1, active: true,
    items: group.items.map((item, itemIndex) => ({ question: item.q, answer: item.a, sortOrder: itemIndex + 1, active: true })),
  }));
}

function Footer(): JSX.Element {
  return (
    <View style={s.footer}>
      <Text style={s.footerText}>
        <Text style={{ color: C.gold, fontWeight: "700" }}>GES Lesson Planner</Text>
        {" — Professional AI support for Ghanaian educators."}
      </Text>
      <Text style={s.footerSub}>© 2026 GES Lesson Planner. All rights reserved.</Text>
    </View>
  );
}

// ─── Main App ──────────────────────────────────────────────────────
export default function LandingPage({ onGetAccess }: { onGetAccess?: () => void }): JSX.Element {
  const scrollRef = useRef<ScrollView>(null);
  const demoY = useRef<number>(0);
  const handleGetAccess = onGetAccess ?? (() => router.push("/(auth)/sign-in"));
  const { width } = useWindowDimensions();
  const isMobile = width < 768; // Mobile breakpoint

  return (
    <View style={{ flex: 1, backgroundColor: C.cream }}>
      <NavBar isMobile={isMobile} onTryDemo={() => scrollRef.current?.scrollTo({ y: demoY.current - 80, animated: true })} onGetAccess={handleGetAccess} />
      <ScrollView ref={scrollRef} style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <HeroSection isMobile={isMobile} onTryDemo={() => scrollRef.current?.scrollTo({ y: demoY.current - 80, animated: true })} onGetAccess={handleGetAccess} />
        <ScrollingBand />
        <View onLayout={(e) => { demoY.current = e.nativeEvent.layout.y; }}>
          <DemoSection isMobile={isMobile} />
        </View>
        <FeaturesSection isMobile={isMobile} />
        <HowSection isMobile={isMobile} />
        <ValueSection isMobile={isMobile} />
        <CtaSection onGetAccess={handleGetAccess} />
        <FaqSection />
        <Footer />
      </ScrollView>
    </View>
  );
}

// ─── StyleSheet (Refined & Mobile-Responsive) ──────────────────────
const s = StyleSheet.create({
  nav: { backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border, zIndex: 100, elevation: 2 },
  navInner: { maxWidth: 1200, alignSelf: "center", width: "100%", paddingHorizontal: 20, height: 70, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brand: { flexDirection: "row", alignItems: "center", gap: 12 },
  brandIcon: { width: 40, height: 40, backgroundColor: C.emerald, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  brandName: { fontFamily: Platform.OS === "web" ? "Georgia, serif" : "serif", fontSize: 18, fontWeight: "bold", color: C.emerald },
  brandSub: { fontSize: 12, color: C.ink40, marginTop: 2 },
  navActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  
  btnPrimary: { backgroundColor: C.emerald, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  btnPrimaryText: { color: C.white, fontSize: 14, fontWeight: "700", letterSpacing: 0.5 },
  btnGhost: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, borderWidth: 1, borderColor: C.emerald, alignItems: "center", justifyContent: "center" },
  btnGhostText: { color: C.emerald, fontSize: 14, fontWeight: "600" },
  btnXl: { paddingVertical: 16, paddingHorizontal: 28, borderRadius: 8 },

  kickerPill: { flexDirection: "row", alignItems: "center", backgroundColor: C.goldPale, borderWidth: 1, borderColor: C.gold, paddingVertical: 6, paddingHorizontal: 14, borderRadius: 100, alignSelf: "flex-start", marginBottom: 20 },
  kickerText: { fontSize: 12, fontWeight: "700", color: C.gold, letterSpacing: 0.5, textTransform: "uppercase" },

  heroWrap: { maxWidth: 1200, alignSelf: "center", width: "100%", paddingHorizontal: 20, paddingTop: 80, paddingBottom: 60, flexDirection: "row", gap: 48, alignItems: "center" },
  heroCopy: { flex: 1 },
  heroTitle: { fontFamily: Platform.OS === "web" ? "Georgia, serif" : "serif", fontSize: 48, fontWeight: "900", color: C.emerald, lineHeight: 56, marginBottom: 16 },
  heroTitleEm: { color: C.gold, fontStyle: "italic" },
  heroBody: { fontSize: 18, lineHeight: 28, color: C.ink70, marginBottom: 32, maxWidth: 540 },
  heroCta: { flexDirection: "row", gap: 16, marginBottom: 40 },
  heroStats: { flexDirection: "row", gap: 32 },
  stat: {},
  statNum: { fontFamily: Platform.OS === "web" ? "Georgia, serif" : "serif", fontSize: 28, fontWeight: "700", color: C.emerald },
  statLabel: { fontSize: 13, color: C.ink40, marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: "600" },

  heroImageWrap: { flex: 1, position: "relative", minHeight: 350, borderRadius: 16, shadowColor: C.emerald, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.15, shadowRadius: 30, elevation: 10 },
  heroImage: { width: "100%", height: "100%", borderRadius: 16, backgroundColor: C.border },
  heroImageOverlay: { position: "absolute", bottom: 20, right: 20, backgroundColor: C.emerald, padding: 20, borderRadius: 12, shadowColor: "#000", shadowOffset: {width: 0, height: 10}, shadowOpacity: 0.3, shadowRadius: 20 },
  docBadge: { backgroundColor: C.gold, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, alignSelf: "flex-start" },
  docBadgeText: { fontSize: 10, fontWeight: "bold", color: C.emerald, textTransform: "uppercase" },
  accentCard: { position: "absolute", top: -20, left: -20, backgroundColor: C.surface, borderRadius: 12, padding: 16, flexDirection: "row", alignItems: "center", gap: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 8 },
  accentIcon: { width: 40, height: 40, backgroundColor: C.goldPale, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  accentBig: { color: C.emerald, fontSize: 18, fontWeight: "900" },
  accentSmall: { color: C.ink40, fontSize: 12 },

  band: { backgroundColor: C.emeraldMid, paddingVertical: 16, overflow: "hidden", borderTopWidth: 4, borderTopColor: C.gold },
  bandItem: { flexDirection: "row", alignItems: "center", gap: 16, paddingHorizontal: 32 },
  bandDiamond: { width: 8, height: 8, backgroundColor: C.gold, transform: [{ rotate: "45deg" }] },
  bandText: { color: C.white, fontSize: 14, letterSpacing: 1, fontWeight: "600", textTransform: "uppercase" },

  section: { paddingVertical: 80, paddingHorizontal: 20 },
  sectionInner: { maxWidth: 1200, alignSelf: "center", width: "100%" },
  eyebrow: { fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.5, color: C.gold, marginBottom: 12 },
  sectionTitle: { fontFamily: Platform.OS === "web" ? "Georgia, serif" : "serif", fontSize: 38, fontWeight: "900", color: C.emerald, lineHeight: 46, marginBottom: 16 },
  sectionBody: { fontSize: 16, lineHeight: 26, color: C.ink70, maxWidth: 650 },

  demoSection: { backgroundColor: C.white, paddingVertical: 80, paddingHorizontal: 20 },
  demoGrid: { flexDirection: "row", gap: 32, marginTop: 40 },
  demoControls: { width: 340, backgroundColor: C.cream, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 24 },
  demoControlsTitle: { fontSize: 18, fontWeight: "700", color: C.emerald },
  lockBadge: { backgroundColor: C.goldPale, borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4 },
  lockBadgeText: { fontSize: 11, fontWeight: "bold", color: C.gold },
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 12, fontWeight: "700", color: C.ink70, textTransform: "uppercase", marginBottom: 6 },
  select: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: C.border, borderRadius: 8, backgroundColor: C.white },
  selectText: { fontSize: 14, color: C.ink, fontWeight: "500" },
  dropdown: { position: "absolute", top: 70, left: 0, right: 0, backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 8, zIndex: 999, elevation: 5 },
  dropdownItem: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: C.border },
  dropdownItemActive: { backgroundColor: C.goldPale },
  dropdownText: { fontSize: 14, color: C.ink },
  demoNotice: { backgroundColor: C.goldPale, borderWidth: 1, borderColor: "rgba(212,175,55,0.35)", borderRadius: 8, padding: 12, marginTop: 14 },
  demoNoticeText: { fontSize: 12, lineHeight: 18, color: C.ink70 },

  previewPanel: { backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 24, flex: 1, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 2 },
  watermarkWrap: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, alignItems: "center", justifyContent: "center", zIndex: 0 },
  watermarkText: { fontSize: 32, fontWeight: "900", color: C.ink, opacity: 0.03, transform: [{ rotate: "-20deg" }], letterSpacing: 2 },
  previewKicker: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.5, color: C.gold, marginBottom: 8 },
  previewTitle: { fontFamily: Platform.OS === "web" ? "Georgia, serif" : "serif", fontSize: 22, fontWeight: "bold", color: C.emerald, marginBottom: 12 },
  
  table: { borderWidth: 1, borderColor: C.border, borderRadius: 8, overflow: "hidden" },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.border },
  th: { padding: 12, color: C.white, fontWeight: "700", fontSize: 12, letterSpacing: 0.5, textTransform: "uppercase" },
  td: { padding: 12, color: C.ink, fontSize: 13, lineHeight: 20 },

  lessonTitleBlock: { alignItems: "center", paddingVertical: 16, backgroundColor: C.cream, borderRadius: 8, marginBottom: 16 },
  lessonTitleMain: { color: C.emerald, fontSize: 18, fontWeight: "900", textAlign: "center", letterSpacing: 1 },
  lessonTitleSub: { color: C.ink70, fontSize: 14, fontWeight: "600", marginTop: 4, textAlign: "center" },
  lessonTable: { borderWidth: 1, borderColor: C.border, borderRadius: 8, backgroundColor: C.white, overflow: "hidden" },
  lessonInfoRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.border },
  lessonAltRow: { backgroundColor: C.cream },
  lessonCell: { padding: 10, borderRightWidth: 1, borderRightColor: C.border },
  lessonLastCell: { borderRightWidth: 0 },
  lessonCellLabel: { color: C.ink40, fontSize: 10, fontWeight: "bold", textTransform: "uppercase", marginBottom: 4 },
  lessonCellValue: { color: C.ink, fontSize: 13, fontWeight: "600" },
  lessonInlineText: { color: C.ink, fontSize: 12, lineHeight: 18 },
  lessonInlineLabel: { color: C.emerald, fontWeight: "900" },
  lessonPhaseHeader: { backgroundColor: C.emeraldMid },
  lessonPhaseHeadText: { color: C.white, fontSize: 11, fontWeight: "bold", textTransform: "uppercase", padding: 10, borderRightWidth: 1, borderRightColor: "rgba(255,255,255,0.2)" },
  lessonPhaseCellWrap: { padding: 12, borderRightWidth: 1, borderRightColor: C.border },
  lessonPhaseLabel: { color: C.gold, fontSize: 10, fontWeight: "900", letterSpacing: 0.5 },
  lessonPhaseName: { color: C.emerald, fontSize: 12, fontWeight: "bold", marginTop: 4 },
  lessonPhaseDuration: { color: C.ink40, fontSize: 11, marginTop: 4 },
  lessonActivityText: { color: C.ink, fontSize: 13, lineHeight: 20, marginBottom: 6 },
  lessonAssessmentBlock: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: C.border },
  lessonAssessmentTitle: { color: C.emerald, fontSize: 11, fontWeight: "900", marginBottom: 4 },
  lessonAssessmentText: { color: C.ink, fontSize: 13, lineHeight: 20, marginBottom: 3 },
  lessonResourceText: { color: C.ink, fontSize: 12, lineHeight: 18, fontStyle: "italic" },
  demoOnlyStrip: { backgroundColor: C.goldPale, borderWidth: 1, borderColor: "rgba(212,175,55,0.38)", borderRadius: 8, padding: 10, marginTop: 12 },
  demoOnlyText: { color: C.ink70, fontSize: 12, lineHeight: 18, textAlign: "center" },

  emptyPanel: { alignItems: "center", justifyContent: "center", minHeight: 300, gap: 16 },
  emptyIcon: { width: 64, height: 64, backgroundColor: C.goldPale, borderRadius: 32, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontFamily: Platform.OS === "web" ? "Georgia, serif" : "serif", fontSize: 20, fontWeight: "bold", color: C.emerald },
  emptyBody: { fontSize: 15, color: C.ink40, maxWidth: 320, textAlign: "center", lineHeight: 22 },

  featuresGrid: { flexDirection: "row", flexWrap: "wrap", gap: 24, marginTop: 40 },
  featureCard: { backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 28, width: "31%", minWidth: 260, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 1 },
  featureIcon: { width: 48, height: 48, backgroundColor: C.cream, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 20, borderWidth: 1, borderColor: C.border },
  featureName: { fontFamily: Platform.OS === "web" ? "Georgia, serif" : "serif", fontSize: 18, fontWeight: "bold", color: C.emerald, marginBottom: 8 },
  featureText: { fontSize: 15, color: C.ink70, lineHeight: 24 },

  stepsGrid: { flexDirection: "row", gap: 16, marginTop: 48 },
  step: { flex: 1, padding: 40, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 16, borderTopWidth: 2, borderTopColor: C.gold },
  stepNum: { fontFamily: Platform.OS === "web" ? "Georgia, serif" : "serif", fontSize: 48, fontWeight: "900", color: C.gold, opacity: 0.8, marginBottom: 16 },
  stepIcon: { fontSize: 28, position: "absolute", top: 40, right: 32, opacity: 0.9 },
  stepText: { fontSize: 18, lineHeight: 28, fontWeight: "500", color: C.white },

  valueGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16, marginTop: 36 },
  valueItem: { backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 18, flexDirection: "row", alignItems: "flex-start", gap: 12, width: "47%", minWidth: 260, flex: 1 },
  valueCheck: { width: 26, height: 26, backgroundColor: C.emerald, borderRadius: 13, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  valueCheckText: { color: C.white, fontSize: 14, fontWeight: "900" },
  valueText: { fontSize: 15, fontWeight: "600", color: C.ink, lineHeight: 23, flex: 1 },

  ctaSection: { backgroundColor: C.emerald, paddingVertical: 84, alignItems: "center", borderTopWidth: 4, borderTopColor: C.gold },
  ctaButton: { backgroundColor: C.gold, marginTop: 28, paddingHorizontal: 34, paddingVertical: 16 },
  ctaButtonText: { color: C.emerald, fontSize: 16, fontWeight: "900" },

  faqGroup: { backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 12, marginTop: 16, overflow: "hidden" },
  faqGroupTop: { padding: 20, backgroundColor: C.cream, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  faqGroupTitle: { fontFamily: Platform.OS === "web" ? "Georgia, serif" : "serif", fontSize: 18, fontWeight: "bold", color: C.emerald },
  faqGroupMeta: { fontSize: 12, color: C.ink40, marginTop: 3 },
  faqArrow: { color: C.emerald, fontSize: 14, fontWeight: "bold" },
  faqItem: { backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border },
  faqQ: { padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  faqQuestion: { fontSize: 15, fontWeight: "600", color: C.ink, flex: 1 },
  faqAnswerBlock: { paddingHorizontal: 16, paddingBottom: 16 },
  faqAnswerText: { fontSize: 14, lineHeight: 24, color: C.ink70 },

  footer: { backgroundColor: C.ink, paddingVertical: 40, paddingHorizontal: 20, alignItems: "center", borderTopWidth: 4, borderTopColor: C.emerald },
  footerText: { color: C.white, fontSize: 15, textAlign: "center", marginBottom: 8 },
  footerSub: { color: C.ink40, fontSize: 13 },
  
  spinner: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: "rgba(255,255,255,0.3)", borderTopColor: C.white },
  spinnerDark: { borderColor: "rgba(11,77,60,0.2)", borderTopColor: C.emerald },
});
