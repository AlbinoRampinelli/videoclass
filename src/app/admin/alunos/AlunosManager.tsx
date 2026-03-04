"use client";

import { useState, useMemo } from "react";
import { Search, GraduationCap, X, Plus, Loader2, ChevronDown, ChevronUp, FlaskConical, History } from "lucide-react";

interface Enrollment {
  id: string;
  courseId: string;
  createdAt: string;
}

interface Submission {
  challengeId: string;
  grade: number;
  completed: boolean;
  feedback: string | null;
  code: string;
  createdAt: string;
  challenge: { title: string };
}

interface User {
  id: string;
  name: string | null;
  email: string | null;
  cpf: string | null;
  schoolName: string | null;
  userType: string;
  enrollments: Enrollment[];
  submissions: Submission[];
}

interface Course {
  id: string;
  title: string;
}

export default function AlunosManager({
  initialUsers,
  courses,
}: {
  initialUsers: User[];
  courses: Course[];
}) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  // expandedGrades: userId with summary open
  const [expandedGrades, setExpandedGrades] = useState<Set<string>>(new Set());
  // expandedHistory: "userId-challengeId" with full history open
  const [expandedHistory, setExpandedHistory] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.cpf?.includes(q) ||
        u.schoolName?.toLowerCase().includes(q)
    );
  }, [users, search]);

  function toggleGrades(userId: string) {
    setExpandedGrades((prev) => {
      const next = new Set(prev);
      next.has(userId) ? next.delete(userId) : next.add(userId);
      return next;
    });
  }

  function toggleHistory(userId: string, challengeId: string) {
    const key = `${userId}-${challengeId}`;
    setExpandedHistory((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function setLoading(key: string, val: boolean) {
    setLoadingMap((m) => ({ ...m, [key]: val }));
  }

  async function handleEnroll(userId: string, courseId: string) {
    const key = `enroll-${userId}-${courseId}`;
    setLoading(key, true);
    const res = await fetch("/api/admin/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, courseId }),
    });
    if (res.ok) {
      const enrollment = await res.json();
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, enrollments: [...u.enrollments, enrollment] }
            : u
        )
      );
    }
    setLoading(key, false);
  }

  async function handleUnenroll(userId: string, enrollmentId: string, courseTitle: string) {
    if (!confirm(`Remover matrícula em "${courseTitle}"?`)) return;
    const key = `unenroll-${enrollmentId}`;
    setLoading(key, true);
    const res = await fetch(`/api/admin/enrollments/${enrollmentId}`, { method: "DELETE" });
    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, enrollments: u.enrollments.filter((e) => e.id !== enrollmentId) }
            : u
        )
      );
    }
    setLoading(key, false);
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
            Gestão de <span className="text-[#81FE88]">Alunos</span>
          </h1>
          <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mt-1">
            {users.length} aluno{users.length !== 1 ? "s" : ""} cadastrado{users.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, e-mail, CPF ou escola..."
          className="w-full bg-zinc-900/60 border border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-white text-sm focus:border-[#81FE88] outline-none transition-all"
        />
      </div>

      {/* Lista */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="border border-dashed border-zinc-700 rounded-2xl p-10 text-center">
            <p className="text-zinc-600 text-[10px] uppercase font-black italic">Nenhum aluno encontrado.</p>
          </div>
        )}

        {filtered.map((user) => {
          // Latest per challenge (submissions already ordered desc by createdAt)
          const latestSubs = user.submissions.reduce<Submission[]>((acc, sub) => {
            if (!acc.find((s) => s.challengeId === sub.challengeId)) acc.push(sub);
            return acc;
          }, []);
          const gradesExpanded = expandedGrades.has(user.id);

          return (
            <div key={user.id} className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6">
              {/* Cabeçalho do aluno */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-white font-black italic uppercase text-sm">
                      {user.name || "—"}
                    </p>
                    {user.userType === "ADMIN" && (
                      <span className="bg-[#81FE88]/10 text-[#81FE88] border border-[#81FE88]/20 text-[9px] font-black uppercase px-2 py-0.5 rounded-md">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-zinc-500 text-[11px]">{user.email}</p>
                  {user.cpf && (
                    <p className="text-zinc-600 text-[10px] font-mono mt-0.5">{user.cpf}</p>
                  )}
                  {user.schoolName && (
                    <p className="text-zinc-600 text-[10px] uppercase font-black mt-0.5">
                      {user.schoolName}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap size={14} className="text-zinc-600" />
                  <span className="text-zinc-600 text-[10px] font-black uppercase">
                    {user.enrollments.length} curso{user.enrollments.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Cursos */}
              <div className="flex flex-wrap gap-2">
                {courses.map((course) => {
                  const enrollment = user.enrollments.find((e) => e.courseId === course.id);
                  const isEnrolled = !!enrollment;
                  const enrollKey = `enroll-${user.id}-${course.id}`;
                  const unenrollKey = `unenroll-${enrollment?.id}`;
                  const isLoading = loadingMap[enrollKey] || loadingMap[unenrollKey];

                  return (
                    <button
                      key={course.id}
                      type="button"
                      disabled={isLoading}
                      onClick={() =>
                        isEnrolled
                          ? handleUnenroll(user.id, enrollment.id, course.title)
                          : handleEnroll(user.id, course.id)
                      }
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all disabled:opacity-50 ${
                        isEnrolled
                          ? "bg-[#81FE88]/10 border border-[#81FE88]/30 text-[#81FE88] hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
                          : "bg-zinc-800 border border-zinc-700 text-zinc-500 hover:border-[#81FE88]/30 hover:text-[#81FE88]"
                      }`}
                    >
                      {isLoading ? (
                        <Loader2 size={10} className="animate-spin" />
                      ) : isEnrolled ? (
                        <X size={10} />
                      ) : (
                        <Plus size={10} />
                      )}
                      {course.title}
                    </button>
                  );
                })}
              </div>

              {/* Notas */}
              {latestSubs.length > 0 && (
                <div className="mt-4 border-t border-zinc-800 pt-4">
                  <button
                    onClick={() => toggleGrades(user.id)}
                    className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-[10px] font-black uppercase"
                  >
                    <FlaskConical size={12} />
                    {latestSubs.length} desafio{latestSubs.length !== 1 ? "s" : ""} respondido{latestSubs.length !== 1 ? "s" : ""}
                    {gradesExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>

                  {gradesExpanded && (
                    <div className="mt-3 space-y-2">
                      {latestSubs.map((sub) => {
                        const histKey = `${user.id}-${sub.challengeId}`;
                        const histOpen = expandedHistory.has(histKey);
                        const allForChallenge = user.submissions.filter(
                          (s) => s.challengeId === sub.challengeId
                        );

                        return (
                          <div key={sub.challengeId} className="bg-zinc-900/60 rounded-2xl overflow-hidden">
                            {/* Summary row */}
                            <div className="flex items-center justify-between px-4 py-3">
                              <span className="text-zinc-400 text-[10px] font-bold uppercase italic truncate flex-1 mr-3">
                                {sub.challenge.title}
                              </span>
                              <div className="flex items-center gap-3 shrink-0">
                                <span className={`text-[11px] font-black ${sub.grade >= 7 ? "text-[#81FE88]" : "text-red-400"}`}>
                                  {sub.grade}/10
                                </span>
                                <button
                                  onClick={() => toggleHistory(user.id, sub.challengeId)}
                                  className="flex items-center gap-1 text-zinc-600 hover:text-zinc-300 transition-colors text-[9px] font-black uppercase"
                                >
                                  <History size={10} />
                                  {allForChallenge.length > 1 ? `${allForChallenge.length} tent.` : "Ver"}
                                  {histOpen ? <ChevronUp size={9} /> : <ChevronDown size={9} />}
                                </button>
                              </div>
                            </div>

                            {/* History panel */}
                            {histOpen && (
                              <div className="border-t border-zinc-800 divide-y divide-zinc-800/60">
                                {allForChallenge.map((h, i) => (
                                  <div key={i} className="px-4 py-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                      <span className="text-zinc-600 text-[9px] font-mono">
                                        {new Date(h.createdAt).toLocaleString('pt-BR')}
                                        {i === 0 && allForChallenge.length > 1 && (
                                          <span className="ml-2 text-[#81FE88] font-black uppercase">• última</span>
                                        )}
                                      </span>
                                      <span className={`text-[11px] font-black ${h.grade >= 7 ? "text-[#81FE88]" : "text-red-400"}`}>
                                        {h.grade}/10
                                      </span>
                                    </div>

                                    {/* Código enviado */}
                                    {h.code && (
                                      <div>
                                        <p className="text-[9px] text-zinc-600 font-black uppercase mb-1">Resposta do aluno</p>
                                        <pre className="text-zinc-300 text-[10px] leading-relaxed bg-zinc-950 rounded-xl px-3 py-3 overflow-x-auto font-mono whitespace-pre-wrap">
                                          {h.code}
                                        </pre>
                                      </div>
                                    )}

                                    {/* Feedback da IA */}
                                    {h.feedback && (
                                      <div>
                                        <p className="text-[9px] text-zinc-600 font-black uppercase mb-1">Retorno da IA</p>
                                        <p className="text-zinc-400 text-[10px] leading-relaxed bg-zinc-950/60 rounded-xl px-3 py-3 whitespace-pre-wrap">
                                          {h.feedback}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
