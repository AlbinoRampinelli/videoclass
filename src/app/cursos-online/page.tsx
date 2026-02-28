// src/app/cursos-online/page.tsx
import CourseList from "./CourseList"; // Ele busca automaticamente o index.tsx dentro da pasta
import { db } from '../../../prisma/db'

export default async function Page() {
  const courses = await db.course.findMany({
    where: { format: "ONLINE" }
  });

  return (
    <main className="p-10">
      <h1 className="text-white text-3xl font-black mb-10">CURSOS</h1>
      {/* Chama o componente passando os cursos do banco */}
      <CourseList courses={courses} />
    </main>
  );
}