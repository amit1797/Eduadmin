import { db } from "./db";
import { 
  schools, users, students, teachers, classes, attendance, subjects, 
  classSubjects, events, auditLogs, schoolModules, rolePermissions 
} from "@shared/schema";
import { hashPassword } from "./middleware/auth";
import { fileURLToPath } from "url";
import path from "path";

async function seedData() {
  console.log("🌱 Starting database seeding...");

  try {
    // Clear existing data (in correct order due to foreign key constraints)
    await db.delete(auditLogs);
    await db.delete(attendance);
    await db.delete(classSubjects);
    await db.delete(events);
    await db.delete(subjects);
    await db.delete(students);
    await db.delete(teachers);
    await db.delete(classes);
    await db.delete(schoolModules);
    await db.delete(rolePermissions);
    await db.delete(users);
    await db.delete(schools);

    console.log("🗑️  Cleared existing data");

    // 1. Create Schools
    const schoolsData = await db.insert(schools).values([
      {
        name: "Sunrise Public School",
        code: "SPS001",
        address: "123 Education Street, Academic City, AC 12345",
        phone: "+1-555-0123",
        email: "admin@sunriseschool.edu",
        website: "https://sunriseschool.edu",
        status: "active"
      },
      {
        name: "Greenwood International Academy",
        code: "GIA002",
        address: "456 Learning Avenue, Knowledge Town, KT 67890",
        phone: "+1-555-0456",
        email: "contact@greenwood.edu",
        website: "https://greenwood.edu",
        status: "active"
      },
      {
        name: "Pine Valley Elementary",
        code: "PVE003",
        address: "789 Scholar Road, Education Valley, EV 13579",
        phone: "+1-555-0789",
        email: "info@pinevalley.edu",
        website: "https://pinevalley.edu",
        status: "active"
      }
    ]).returning();

    console.log("🏫 Created schools");

    // 2. Enable modules for schools (align with onboarding defaults)
    const defaultModules = [
      "student_management",
      "teacher_management",
      "class_management",
      "academics_management",
      "attendance_management",
      "event_management",
      "audit_system"
    ] as const;
    const modulesList = defaultModules as readonly string[];

    for (const school of schoolsData) {
      for (const module of modulesList) {
        await db.insert(schoolModules).values({
          schoolId: school.id,
          module: module as any,
          enabled: true
        });
      }
    }

    console.log("📚 Enabled core modules for all schools");

    // 3. Create Super Admin
    const superAdmin = await db.insert(users).values({
      username: "superadmin",
      email: "superadmin@edumanage.com",
      password: hashPassword("admin123"),
      firstName: "Super",
      lastName: "Administrator",
      phone: "+1-555-9999",
      role: "super_admin",
      status: "active"
    }).returning();

    console.log("👑 Created Super Admin");

    // 4. Create School Admins
    const schoolAdmins = await db.insert(users).values([
      {
        username: "admin_sps",
        email: "admin@sunriseschool.edu",
        password: hashPassword("admin123"),
        firstName: "Sarah",
        lastName: "Johnson",
        phone: "+1-555-1001",
        role: "school_admin",
        schoolId: schoolsData[0].id,
        status: "active"
      },
      {
        username: "admin_gia",
        email: "admin@greenwood.edu",
        password: hashPassword("admin123"),
        firstName: "Michael",
        lastName: "Chen",
        phone: "+1-555-1002",
        role: "school_admin",
        schoolId: schoolsData[1].id,
        status: "active"
      },
      {
        username: "admin_pve",
        email: "admin@pinevalley.edu",
        password: hashPassword("admin123"),
        firstName: "Emily",
        lastName: "Rodriguez",
        phone: "+1-555-1003",
        role: "school_admin",
        schoolId: schoolsData[2].id,
        status: "active"
      }
    ]).returning();

    console.log("🏫 Created School Admins");

    // 5. Create Teachers for Sunrise Public School
    const teachersUsers = await db.insert(users).values([
      {
        username: "john_smith",
        email: "john.smith@sunriseschool.edu",
        password: hashPassword("teacher123"),
        firstName: "John",
        lastName: "Smith",
        phone: "+1-555-2001",
        role: "teacher",
        schoolId: schoolsData[0].id,
        status: "active"
      },
      {
        username: "mary_wilson",
        email: "mary.wilson@sunriseschool.edu",
        password: hashPassword("teacher123"),
        firstName: "Mary",
        lastName: "Wilson",
        phone: "+1-555-2002",
        role: "teacher",
        schoolId: schoolsData[0].id,
        status: "active"
      },
      {
        username: "david_brown",
        email: "david.brown@sunriseschool.edu",
        password: hashPassword("teacher123"),
        firstName: "David",
        lastName: "Brown",
        phone: "+1-555-2003",
        role: "teacher",
        schoolId: schoolsData[0].id,
        status: "active"
      },
      {
        username: "lisa_garcia",
        email: "lisa.garcia@sunriseschool.edu",
        password: hashPassword("teacher123"),
        firstName: "Lisa",
        lastName: "Garcia",
        phone: "+1-555-2004",
        role: "teacher",
        schoolId: schoolsData[0].id,
        status: "active"
      }
    ]).returning();

    // Create teacher profiles
    const teacherProfiles = await db.insert(teachers).values([
      {
        userId: teachersUsers[0].id,
        employeeId: "EMP001",
        department: "Mathematics",
        qualification: "M.Sc. Mathematics, B.Ed.",
        experience: 8,
        specialization: "Algebra, Calculus",
        joiningDate: new Date("2020-08-15"),
        salary: 65000,
        status: "active"
      },
      {
        userId: teachersUsers[1].id,
        employeeId: "EMP002",
        department: "English",
        qualification: "M.A. English Literature, B.Ed.",
        experience: 12,
        specialization: "Literature, Creative Writing",
        joiningDate: new Date("2018-07-20"),
        salary: 68000,
        status: "active"
      },
      {
        userId: teachersUsers[2].id,
        employeeId: "EMP003",
        department: "Science",
        qualification: "M.Sc. Physics, B.Ed.",
        experience: 6,
        specialization: "Physics, Chemistry",
        joiningDate: new Date("2021-09-01"),
        salary: 62000,
        status: "active"
      },
      {
        userId: teachersUsers[3].id,
        employeeId: "EMP004",
        department: "Social Studies",
        qualification: "M.A. History, B.Ed.",
        experience: 10,
        specialization: "World History, Geography",
        joiningDate: new Date("2019-06-10"),
        salary: 64000,
        status: "active"
      }
    ]).returning();

    console.log("👩‍🏫 Created Teachers");

    // 6. Create Classes
    const classesData = await db.insert(classes).values([
      {
        name: "Grade 9A",
        grade: "9",
        section: "A",
        capacity: 30,
        schoolId: schoolsData[0].id,
        classTeacherId: teachersUsers[0].id,
        academicYear: "2024-25",
        status: "active"
      },
      {
        name: "Grade 9B",
        grade: "9",
        section: "B",
        capacity: 28,
        schoolId: schoolsData[0].id,
        classTeacherId: teachersUsers[1].id,
        academicYear: "2024-25",
        status: "active"
      },
      {
        name: "Grade 10A",
        grade: "10",
        section: "A",
        capacity: 32,
        schoolId: schoolsData[0].id,
        classTeacherId: teachersUsers[2].id,
        academicYear: "2024-25",
        status: "active"
      },
      {
        name: "Grade 10B",
        grade: "10",
        section: "B",
        capacity: 30,
        schoolId: schoolsData[0].id,
        classTeacherId: teachersUsers[3].id,
        academicYear: "2024-25",
        status: "active"
      }
    ]).returning();

    console.log("🏛️ Created Classes");

    // 7. Create Subjects
    const subjectsData = await db.insert(subjects).values([
      {
        name: "Mathematics",
        code: "MATH",
        description: "Algebra, Geometry, Calculus",
        schoolId: schoolsData[0].id
      },
      {
        name: "English Literature",
        code: "ENG",
        description: "Reading, Writing, Literature Analysis",
        schoolId: schoolsData[0].id
      },
      {
        name: "Physics",
        code: "PHY",
        description: "Mechanics, Thermodynamics, Optics",
        schoolId: schoolsData[0].id
      },
      {
        name: "Chemistry",
        code: "CHEM",
        description: "Organic, Inorganic, Physical Chemistry",
        schoolId: schoolsData[0].id
      },
      {
        name: "Biology",
        code: "BIO",
        description: "Cell Biology, Genetics, Ecology",
        schoolId: schoolsData[0].id
      },
      {
        name: "History",
        code: "HIST",
        description: "World History, Ancient Civilizations",
        schoolId: schoolsData[0].id
      }
    ]).returning();

    console.log("📖 Created Subjects");

    // 8. Assign subjects to classes
    await db.insert(classSubjects).values([
      // Grade 9A
      { classId: classesData[0].id, subjectId: subjectsData[0].id, teacherId: teacherProfiles[0].id },
      { classId: classesData[0].id, subjectId: subjectsData[1].id, teacherId: teacherProfiles[1].id },
      { classId: classesData[0].id, subjectId: subjectsData[2].id, teacherId: teacherProfiles[2].id },
      // Grade 9B
      { classId: classesData[1].id, subjectId: subjectsData[0].id, teacherId: teacherProfiles[0].id },
      { classId: classesData[1].id, subjectId: subjectsData[1].id, teacherId: teacherProfiles[1].id },
      { classId: classesData[1].id, subjectId: subjectsData[4].id, teacherId: teacherProfiles[2].id },
      // Grade 10A
      { classId: classesData[2].id, subjectId: subjectsData[0].id, teacherId: teacherProfiles[0].id },
      { classId: classesData[2].id, subjectId: subjectsData[2].id, teacherId: teacherProfiles[2].id },
      { classId: classesData[2].id, subjectId: subjectsData[3].id, teacherId: teacherProfiles[2].id },
      // Grade 10B
      { classId: classesData[3].id, subjectId: subjectsData[1].id, teacherId: teacherProfiles[1].id },
      { classId: classesData[3].id, subjectId: subjectsData[4].id, teacherId: teacherProfiles[2].id },
      { classId: classesData[3].id, subjectId: subjectsData[5].id, teacherId: teacherProfiles[3].id }
    ]);

    console.log("🔗 Assigned subjects to classes");

    // 9. Create Parent Users
    const parentUsers = await db.insert(users).values([
      {
        username: "robert_johnson",
        email: "robert.johnson@email.com",
        password: hashPassword("parent123"),
        firstName: "Robert",
        lastName: "Johnson",
        phone: "+1-555-3001",
        role: "parent",
        schoolId: schoolsData[0].id,
        status: "active"
      },
      {
        username: "jennifer_davis",
        email: "jennifer.davis@email.com",
        password: hashPassword("parent123"),
        firstName: "Jennifer",
        lastName: "Davis",
        phone: "+1-555-3002",
        role: "parent",
        schoolId: schoolsData[0].id,
        status: "active"
      },
      {
        username: "william_miller",
        email: "william.miller@email.com",
        password: hashPassword("parent123"),
        firstName: "William",
        lastName: "Miller",
        phone: "+1-555-3003",
        role: "parent",
        schoolId: schoolsData[0].id,
        status: "active"
      }
    ]).returning();

    console.log("👨‍👩‍👧‍👦 Created Parents");

    // 10. Create Student Users
    const studentUsers = await db.insert(users).values([
      {
        username: "alex_johnson",
        email: "alex.johnson@student.sunriseschool.edu",
        password: hashPassword("student123"),
        firstName: "Alex",
        lastName: "Johnson",
        phone: "+1-555-4001",
        role: "student",
        schoolId: schoolsData[0].id,
        status: "active"
      },
      {
        username: "emma_davis",
        email: "emma.davis@student.sunriseschool.edu",
        password: hashPassword("student123"),
        firstName: "Emma",
        lastName: "Davis",
        phone: "+1-555-4002",
        role: "student",
        schoolId: schoolsData[0].id,
        status: "active"
      },
      {
        username: "jacob_miller",
        email: "jacob.miller@student.sunriseschool.edu",
        password: hashPassword("student123"),
        firstName: "Jacob",
        lastName: "Miller",
        phone: "+1-555-4003",
        role: "student",
        schoolId: schoolsData[0].id,
        status: "active"
      },
      {
        username: "sophia_wilson",
        email: "sophia.wilson@student.sunriseschool.edu",
        password: hashPassword("student123"),
        firstName: "Sophia",
        lastName: "Wilson",
        phone: "+1-555-4004",
        role: "student",
        schoolId: schoolsData[0].id,
        status: "active"
      },
      {
        username: "ethan_brown",
        email: "ethan.brown@student.sunriseschool.edu",
        password: hashPassword("student123"),
        firstName: "Ethan",
        lastName: "Brown",
        phone: "+1-555-4005",
        role: "student",
        schoolId: schoolsData[0].id,
        status: "active"
      },
      {
        username: "olivia_garcia",
        email: "olivia.garcia@student.sunriseschool.edu",
        password: hashPassword("student123"),
        firstName: "Olivia",
        lastName: "Garcia",
        phone: "+1-555-4006",
        role: "student",
        schoolId: schoolsData[0].id,
        status: "active"
      }
    ]).returning();

    // Create student profiles
    const studentProfiles = await db.insert(students).values([
      {
        userId: studentUsers[0].id,
        studentId: "SPS2024001",
        classId: classesData[0].id, // Grade 9A
        admissionDate: new Date("2024-04-15"),
        dateOfBirth: new Date("2009-03-12"),
        gender: "Male",
        bloodGroup: "O+",
        address: "123 Student Lane, Academic City, AC 12345",
        parentId: parentUsers[0].id,
        emergencyContact: "+1-555-3001",
        status: "active"
      },
      {
        userId: studentUsers[1].id,
        studentId: "SPS2024002",
        classId: classesData[0].id, // Grade 9A
        admissionDate: new Date("2024-04-16"),
        dateOfBirth: new Date("2009-07-22"),
        gender: "Female",
        bloodGroup: "A+",
        address: "456 Learning Street, Academic City, AC 12345",
        parentId: parentUsers[1].id,
        emergencyContact: "+1-555-3002",
        status: "active"
      },
      {
        userId: studentUsers[2].id,
        studentId: "SPS2024003",
        classId: classesData[1].id, // Grade 9B
        admissionDate: new Date("2024-04-17"),
        dateOfBirth: new Date("2009-11-08"),
        gender: "Male",
        bloodGroup: "B+",
        address: "789 Education Avenue, Academic City, AC 12345",
        parentId: parentUsers[2].id,
        emergencyContact: "+1-555-3003",
        status: "active"
      },
      {
        userId: studentUsers[3].id,
        studentId: "SPS2024004",
        classId: classesData[2].id, // Grade 10A
        admissionDate: new Date("2023-04-10"),
        dateOfBirth: new Date("2008-05-15"),
        gender: "Female",
        bloodGroup: "AB+",
        address: "321 Scholar Road, Academic City, AC 12345",
        parentId: parentUsers[0].id,
        emergencyContact: "+1-555-3001",
        status: "active"
      },
      {
        userId: studentUsers[4].id,
        studentId: "SPS2024005",
        classId: classesData[2].id, // Grade 10A
        admissionDate: new Date("2023-04-11"),
        dateOfBirth: new Date("2008-09-30"),
        gender: "Male",
        bloodGroup: "O-",
        address: "654 Knowledge Street, Academic City, AC 12345",
        parentId: parentUsers[1].id,
        emergencyContact: "+1-555-3002",
        status: "active"
      },
      {
        userId: studentUsers[5].id,
        studentId: "SPS2024006",
        classId: classesData[3].id, // Grade 10B
        admissionDate: new Date("2023-04-12"),
        dateOfBirth: new Date("2008-12-18"),
        gender: "Female",
        bloodGroup: "A-",
        address: "987 Study Lane, Academic City, AC 12345",
        parentId: parentUsers[2].id,
        emergencyContact: "+1-555-3003",
        status: "active"
      }
    ]).returning();

    console.log("🎓 Created Students");

    // 11. Create sample attendance records
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    await db.insert(attendance).values([
      // Today's attendance for Grade 9A
      {
        studentId: studentProfiles[0].id,
        classId: classesData[0].id,
        date: today,
        status: "present",
        markedBy: teachersUsers[0].id,
        remarks: "On time"
      },
      {
        studentId: studentProfiles[1].id,
        classId: classesData[0].id,
        date: today,
        status: "present",
        markedBy: teachersUsers[0].id,
        remarks: "On time"
      },
      // Yesterday's attendance
      {
        studentId: studentProfiles[0].id,
        classId: classesData[0].id,
        date: yesterday,
        status: "present",
        markedBy: teachersUsers[0].id
      },
      {
        studentId: studentProfiles[1].id,
        classId: classesData[0].id,
        date: yesterday,
        status: "absent",
        markedBy: teachersUsers[0].id,
        remarks: "Sick leave"
      },
      {
        studentId: studentProfiles[2].id,
        classId: classesData[1].id,
        date: yesterday,
        status: "late",
        markedBy: teachersUsers[1].id,
        remarks: "Arrived 10 minutes late"
      }
    ]);

    console.log("📝 Created attendance records");

    // 12. Create Events
    const upcomingDate = new Date();
    upcomingDate.setDate(upcomingDate.getDate() + 7);

    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 3);

    await db.insert(events).values([
      {
        title: "Science Fair 2024",
        description: "Annual science exhibition showcasing student projects and innovations",
        startDate: upcomingDate,
        endDate: upcomingDate,
        location: "Main Auditorium",
        schoolId: schoolsData[0].id,
        createdBy: schoolAdmins[0].id,
        status: "active"
      },
      {
        title: "Parent-Teacher Conference",
        description: "Quarterly meeting between parents and teachers to discuss student progress",
        startDate: new Date(upcomingDate.getTime() + 14 * 24 * 60 * 60 * 1000), // 2 weeks later
        location: "Classroom Block A",
        schoolId: schoolsData[0].id,
        createdBy: schoolAdmins[0].id,
        status: "active"
      },
      {
        title: "Sports Day Celebration",
        description: "Annual sports competition with various athletic events",
        startDate: pastDate,
        endDate: pastDate,
        location: "School Playground",
        schoolId: schoolsData[0].id,
        createdBy: schoolAdmins[0].id,
        status: "active"
      }
    ]);

    console.log("🎉 Created events");

    // 13. Create audit logs for recent activities
    await db.insert(auditLogs).values([
      {
        userId: schoolAdmins[0].id,
        action: "create",
        resource: "student",
        resourceId: studentProfiles[0].id,
        newValues: JSON.stringify({ studentId: "SPS2024001", name: "Alex Johnson" }),
        schoolId: schoolsData[0].id,
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      },
      {
        userId: teachersUsers[0].id,
        action: "mark_attendance",
        resource: "attendance",
        resourceId: studentProfiles[0].id,
        newValues: JSON.stringify({ status: "present", date: today.toISOString() }),
        schoolId: schoolsData[0].id,
        ipAddress: "192.168.1.101",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      },
      {
        userId: schoolAdmins[0].id,
        action: "create",
        resource: "event",
        resourceId: "event-1",
        newValues: JSON.stringify({ title: "Science Fair 2024", date: upcomingDate.toISOString() }),
        schoolId: schoolsData[0].id,
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    ]);

    console.log("📋 Created audit logs");

    // 14. Set up role permissions aligned with modulesList and routes
    const allCrud = ["create", "read", "update", "delete"] as const;

    // Super Admin: full on all default modules
    for (const mod of modulesList) {
      for (const perm of allCrud) {
        await db.insert(rolePermissions).values({ role: "super_admin" as any, module: mod as any, permission: perm as any });
      }
    }

    // School Admin: full on operational modules, read on audit
    const adminCrudModules = modulesList.filter((m) => m !== "audit_system");
    for (const mod of adminCrudModules) {
      for (const perm of allCrud) {
        await db.insert(rolePermissions).values({ role: "school_admin" as any, module: mod as any, permission: perm as any });
      }
    }
    await db.insert(rolePermissions).values({ role: "school_admin" as any, module: "audit_system" as any, permission: "read" as any });

    // Teacher: read students, manage attendance, read academics and events
    await db.insert(rolePermissions).values({ role: "teacher" as any, module: "student_management" as any, permission: "read" as any });
    await db.insert(rolePermissions).values({ role: "teacher" as any, module: "academics_management" as any, permission: "read" as any });
    for (const perm of ["create", "read", "update"] as const) {
      await db.insert(rolePermissions).values({ role: "teacher" as any, module: "attendance_management" as any, permission: perm as any });
    }
    await db.insert(rolePermissions).values({ role: "teacher" as any, module: "event_management" as any, permission: "read" as any });

    // Student: read academics, attendance, events
    await db.insert(rolePermissions).values({ role: "student" as any, module: "academics_management" as any, permission: "read" as any });
    await db.insert(rolePermissions).values({ role: "student" as any, module: "attendance_management" as any, permission: "read" as any });
    await db.insert(rolePermissions).values({ role: "student" as any, module: "event_management" as any, permission: "read" as any });

    // Parent: read student info, attendance, events
    await db.insert(rolePermissions).values({ role: "parent" as any, module: "student_management" as any, permission: "read" as any });
    await db.insert(rolePermissions).values({ role: "parent" as any, module: "attendance_management" as any, permission: "read" as any });
    await db.insert(rolePermissions).values({ role: "parent" as any, module: "event_management" as any, permission: "read" as any });

    console.log("🔐 Set up role permissions");

    console.log("✅ Database seeded successfully!");
    console.log("\n📝 Test Credentials:");
    console.log("================================");
    console.log("🔑 Super Admin:");
    console.log("   Email: superadmin@edumanage.com");
    console.log("   Password: admin123");
    console.log("   School Code: N/A (Super Admin)");
    console.log("");
    console.log("🏫 School Admin (Sunrise Public School):");
    console.log("   Email: admin@sunriseschool.edu");
    console.log("   Password: admin123");
    console.log("   School Code: SPS001");
    console.log("");
    console.log("👩‍🏫 Teacher (John Smith - Mathematics):");
    console.log("   Email: john.smith@sunriseschool.edu");
    console.log("   Password: teacher123");
    console.log("   School Code: SPS001");
    console.log("");
    console.log("🎓 Student (Alex Johnson - Grade 9A):");
    console.log("   Email: alex.johnson@student.sunriseschool.edu");
    console.log("   Password: student123");
    console.log("   School Code: SPS001");
    console.log("");
    console.log("👨‍👩‍👧‍👦 Parent (Robert Johnson):");
    console.log("   Email: robert.johnson@email.com");
    console.log("   Password: parent123");
    console.log("   School Code: SPS001");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly (robust across platforms and tsx/node ESM)
const thisFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === thisFile) {
  seedData()
    .then(() => {
      console.log("🎉 Seeding completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Seeding failed:", error);
      process.exit(1);
    });
}

export default seedData;