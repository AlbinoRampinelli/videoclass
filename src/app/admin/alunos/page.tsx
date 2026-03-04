export const dynamic = 'force-dynamic';
import { db } from "../../../../prisma/db";
import AlunosManager from "./AlunosManager";

export default async function AlunosPage() {
  const [users, courses, allSubmissions] = await Promise.all([
    db.user.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        schoolName: true,
        userType: true,
        enrollments: {
          select: { id: true, courseId: true, createdAt: true },
        },
      },
    }),
    db.course.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
    db.submission.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        userId: true,
        challengeId: true,
        grade: true,
        completed: true,
        feedback: true,
        code: true,
        createdAt: true,
        challenge: { select: { title: true } },
      },
    }),
  ]);

  // Group ALL submissions per user (no deduplication — keep full history)
  const submissionsByUser: Record<string, Array<{
    challengeId: string;
    grade: number;
    completed: boolean;
    feedback: string | null;
    code: string;
    createdAt: string;
    challenge: { title: string };
  }>> = {};

  for (const sub of allSubmissions) {
    if (!submissionsByUser[sub.userId]) submissionsByUser[sub.userId] = [];
    submissionsByUser[sub.userId].push({
      challengeId: sub.challengeId,
      grade: sub.grade,
      completed: sub.completed,
      feedback: sub.feedback,
      code: sub.code,
      createdAt: sub.createdAt.toISOString(),
      challenge: sub.challenge,
    });
  }

  const usersWithSubmissions = users.map(u => ({
    ...u,
    submissions: submissionsByUser[u.id] ?? [],
  }));

  return <AlunosManager initialUsers={usersWithSubmissions as any} courses={courses} />;
}
