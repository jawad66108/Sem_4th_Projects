-- 1. Roles
INSERT INTO roles (role_name) VALUES ('admin');
INSERT INTO roles (role_name) VALUES ('faculty');
INSERT INTO roles (role_name) VALUES ('student');

-- 2. Departments
INSERT INTO departments (dept_name) VALUES ('Computer Science');
INSERT INTO departments (dept_name) VALUES ('Software Engineering');
INSERT INTO departments (dept_name) VALUES ('Cyber Security');

-- 3. Batches
INSERT INTO batches (batch_name, dept_id, start_year, end_year) VALUES ('BSCS-4', 1, 2022, 2026);
INSERT INTO batches (batch_name, dept_id, start_year, end_year) VALUES ('BSSE-4', 2, 2022, 2026);
INSERT INTO batches (batch_name, dept_id, start_year, end_year) VALUES ('BSCS-3', 1, 2023, 2027);

-- 4. Sections
INSERT INTO sections (section_name, batch_id) VALUES ('4A', 1);
INSERT INTO sections (section_name, batch_id) VALUES ('4B', 1);
INSERT INTO sections (section_name, batch_id) VALUES ('4A', 2);
INSERT INTO sections (section_name, batch_id) VALUES ('3A', 3);

-- 5. Users (admin)
INSERT INTO users (full_name, email, password_hash, role_id) 
VALUES ('Admin User', 'admin@rankify.com', 'hashed_admin123', 1);

-- 6. Users (faculty)
INSERT INTO users (full_name, email, password_hash, role_id) 
VALUES ('Dr. Ahmed Ali', 'ahmed@rankify.com', 'hashed_faculty123', 2);
INSERT INTO users (full_name, email, password_hash, role_id) 
VALUES ('Dr. Sara Khan', 'sara@rankify.com', 'hashed_faculty123', 2);

-- 7. Users (students)
INSERT INTO users (full_name, email, password_hash, role_id) 
VALUES ('Ali Hassan', 'ali@rankify.com', 'hashed_student123', 3);
INSERT INTO users (full_name, email, password_hash, role_id) 
VALUES ('Fatima Malik', 'fatima@rankify.com', 'hashed_student123', 3);
INSERT INTO users (full_name, email, password_hash, role_id) 
VALUES ('Usman Tariq', 'usman@rankify.com', 'hashed_student123', 3);
INSERT INTO users (full_name, email, password_hash, role_id) 
VALUES ('Ayesha Raza', 'ayesha@rankify.com', 'hashed_student123', 3);

-- 8. Faculty
INSERT INTO faculty (user_id, dept_id, designation) VALUES (2, 1, 'Assistant Professor');
INSERT INTO faculty (user_id, dept_id, designation) VALUES (3, 1, 'Lecturer');

-- 9. Students
INSERT INTO students (user_id, reg_number, section_id, batch_id, dept_id, cgpa) 
VALUES (4, 'BSCS-2022-001', 1, 1, 1, 3.75);
INSERT INTO students (user_id, reg_number, section_id, batch_id, dept_id, cgpa) 
VALUES (5, 'BSCS-2022-002', 1, 1, 1, 3.60);
INSERT INTO students (user_id, reg_number, section_id, batch_id, dept_id, cgpa) 
VALUES (6, 'BSCS-2022-003', 2, 1, 1, 3.20);
INSERT INTO students (user_id, reg_number, section_id, batch_id, dept_id, cgpa) 
VALUES (7, 'BSCS-2022-004', 2, 1, 1, 3.85);

-- 10. Courses
INSERT INTO courses (course_code, course_name, credit_hours, dept_id) 
VALUES ('CS-401', 'Database Systems', 3, 1);
INSERT INTO courses (course_code, course_name, credit_hours, dept_id) 
VALUES ('CS-402', 'Artificial Intelligence', 3, 1);
INSERT INTO courses (course_code, course_name, credit_hours, dept_id) 
VALUES ('CS-403', 'Web Engineering', 3, 1);

-- 11. Projects
INSERT INTO projects (title, description, student_id, batch_id, section_id, semester, ai_score, final_score, status)
VALUES ('Smart Attendance System', 'AI based attendance using face recognition', 1, 1, 1, 'Fall-2025', 87.50, 85.00, 'APPROVED');
INSERT INTO projects (title, description, student_id, batch_id, section_id, semester, ai_score, final_score, status)
VALUES ('E-Commerce Platform', 'Full stack online shopping system', 2, 1, 1, 'Fall-2025', 78.00, 80.00, 'APPROVED');
INSERT INTO projects (title, description, student_id, batch_id, section_id, semester, ai_score, final_score, status)
VALUES ('Hospital Management System', 'Complete HMS with billing', 3, 1, 2, 'Fall-2025', 72.00, 74.00, 'REVIEWED');
INSERT INTO projects (title, description, student_id, batch_id, section_id, semester, ai_score, final_score, status)
VALUES ('Rankify Pro', 'Academic intelligence system', 4, 1, 2, 'Fall-2025', 95.00, 93.00, 'APPROVED');

COMMIT;


INSERT INTO project_reviews (project_id, faculty_id, rating, comments, is_approved)
VALUES (1, 1, 9.0, 'Excellent project', 1);
INSERT INTO project_reviews (project_id, faculty_id, rating, comments, is_approved)
VALUES (2, 1, 8.0, 'Good work', 1);
INSERT INTO project_reviews (project_id, faculty_id, rating, comments, is_approved)
VALUES (3, 2, 7.5, 'Average project', 1);
INSERT INTO project_reviews (project_id, faculty_id, rating, comments, is_approved)
VALUES (4, 2, 9.5, 'Outstanding', 1);
COMMIT;