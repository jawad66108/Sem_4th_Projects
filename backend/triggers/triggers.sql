-- CREATE OR REPLACE TRIGGER trg_dean_list_check
-- AFTER UPDATE OF cgpa ON students
-- FOR EACH ROW
-- DECLARE
--     v_semester VARCHAR2(20) := 'Fall-2025';
-- BEGIN
--     IF :NEW.cgpa >= 3.5 THEN
--         MERGE INTO dean_list dl
--         USING (SELECT :NEW.student_id AS sid FROM DUAL) src
--         ON (dl.student_id = src.sid AND dl.semester = v_semester)
--         WHEN NOT MATCHED THEN
--             INSERT (student_id, semester, cgpa, batch_id, section_id)
--             VALUES (:NEW.student_id, v_semester, :NEW.cgpa,
--                     :NEW.batch_id, :NEW.section_id)
--         WHEN MATCHED THEN
--             UPDATE SET dl.cgpa = :NEW.cgpa;
--     ELSE
--         DELETE FROM dean_list
--         WHERE student_id = :NEW.student_id
--         AND semester = v_semester;
--     END IF;
-- END;
-- /

-- -- SELECT * FROM dean_list;

-- -- Update student 3 (currently 3.20 - not on dean list)
-- -- Raise it to 3.7 - should AUTO appear in dean list
-- -- UPDATE students SET cgpa = 3.7 WHERE student_id = 3;
-- -- COMMIT;

-- SELECT * FROM dean_list;

-- -- Trigger #2 =================================
-- CREATE OR REPLACE TRIGGER trg_prevent_locked_edit
-- BEFORE UPDATE ON enrollments
-- FOR EACH ROW
-- BEGIN
--     IF :OLD.is_locked = 1 THEN
--         RAISE_APPLICATION_ERROR(-20001, 
--             'ERROR: This enrollment is locked. Grades cannot be modified.');
--     END IF;
-- END;
-- /

-- -- Insert an enrollment
-- INSERT INTO enrollments (student_id, course_id, semester, grade, grade_points, is_locked)
-- VALUES (1, 1, 'Fall-2025', 'A', 4.0, 1);
-- COMMIT;

-- -- Now try to update it - trigger should BLOCK this
-- UPDATE enrollments SET grade = 'B' WHERE student_id = 1 AND course_id = 1;


-- Trigger #3 =================================
CREATE OR REPLACE TRIGGER trg_audit_students
AFTER UPDATE ON students
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (table_name, operation, old_value, new_value, changed_by, changed_at)
    VALUES (
        'STUDENTS',
        'UPDATE',
        'CGPA: ' || :OLD.cgpa || ' | REG: ' || :OLD.reg_number,
        'CGPA: ' || :NEW.cgpa || ' | REG: ' || :NEW.reg_number,
        USER,
        SYSDATE
    );
END;
/
---testing the audit trigger
-- Update a student CGPA
UPDATE students SET cgpa = 3.9 WHERE student_id = 1;
COMMIT;

-- Check audit log - should show old and new value automatically
SELECT * FROM audit_logs;


CREATE OR REPLACE TRIGGER trg_auto_score_project
AFTER INSERT ON projects
FOR EACH ROW
DECLARE
    v_ai    NUMBER(5,2);
    v_final NUMBER(5,2);
BEGIN
    v_ai    := calculate_ai_score_local(
                   :NEW.title,
                   :NEW.description,
                   :NEW.github_link,
                   :NEW.report_file
               );
    v_final := v_ai;

    UPDATE projects
    SET ai_score    = v_ai,
        final_score = v_final
    WHERE project_id = :NEW.project_id;
END;
/

CREATE OR REPLACE TRIGGER trg_auto_score_project
BEFORE INSERT ON projects
FOR EACH ROW
DECLARE
    v_ai NUMBER(5,2);
BEGIN
    v_ai := calculate_ai_score_local(
                :NEW.title,
                :NEW.description,
                :NEW.github_link,
                :NEW.report_file
            );

    :NEW.ai_score    := v_ai;
    :NEW.final_score := v_ai;
END;
/

-- Log INSERT on STUDENTS
CREATE OR REPLACE TRIGGER TRG_AUDIT_STUDENTS_INSERT
AFTER INSERT ON STUDENTS
FOR EACH ROW
BEGIN
    INSERT INTO AUDIT_LOGS (TABLE_NAME, OPERATION, OLD_VALUE, NEW_VALUE, CHANGED_BY, CHANGED_AT)
    VALUES (
        'STUDENTS',
        'INSERT',
        NULL,
        'REG: ' || :NEW.REG_NUMBER || ' | CGPA: ' || :NEW.CGPA,
        'RANKIFY',
        SYSDATE
    );
END;
/

-- Log DELETE on STUDENTS
CREATE OR REPLACE TRIGGER TRG_AUDIT_STUDENTS_DELETE
AFTER DELETE ON STUDENTS
FOR EACH ROW
BEGIN
    INSERT INTO AUDIT_LOGS (TABLE_NAME, OPERATION, OLD_VALUE, NEW_VALUE, CHANGED_BY, CHANGED_AT)
    VALUES (
        'STUDENTS',
        'DELETE',
        'REG: ' || :OLD.REG_NUMBER || ' | CGPA: ' || :OLD.CGPA,
        NULL,
        'RANKIFY',
        SYSDATE
    );
END;
/

-- Log INSERT on USERS
CREATE OR REPLACE TRIGGER TRG_AUDIT_USERS_INSERT
AFTER INSERT ON USERS
FOR EACH ROW
BEGIN
    INSERT INTO AUDIT_LOGS (TABLE_NAME, OPERATION, OLD_VALUE, NEW_VALUE, CHANGED_BY, CHANGED_AT)
    VALUES (
        'USERS',
        'INSERT',
        NULL,
        'Name: ' || :NEW.FULL_NAME || ' | Email: ' || :NEW.EMAIL,
        'RANKIFY',
        SYSDATE
    );
END;
/

-- Log DELETE on USERS
CREATE OR REPLACE TRIGGER TRG_AUDIT_USERS_DELETE
AFTER DELETE ON USERS
FOR EACH ROW
BEGIN
    INSERT INTO AUDIT_LOGS (TABLE_NAME, OPERATION, OLD_VALUE, NEW_VALUE, CHANGED_BY, CHANGED_AT)
    VALUES (
        'USERS',
        'DELETE',
        'Name: ' || :OLD.FULL_NAME || ' | Email: ' || :OLD.EMAIL,
        NULL,
        'RANKIFY',
        SYSDATE
    );
END;
/


-- Drop old ones first
DROP TRIGGER TRG_AUDIT_STUDENTS_INSERT;
DROP TRIGGER TRG_AUDIT_STUDENTS_DELETE;
DROP TRIGGER TRG_AUDIT_USERS_INSERT;
DROP TRIGGER TRG_AUDIT_USERS_DELETE;

-- INSERT on USERS (fires when any user is added)
CREATE OR REPLACE TRIGGER TRG_AUDIT_USERS_INSERT
AFTER INSERT ON USERS
FOR EACH ROW
BEGIN
    INSERT INTO AUDIT_LOGS (TABLE_NAME, OPERATION, OLD_VALUE, NEW_VALUE, CHANGED_BY, CHANGED_AT)
    VALUES (
        'USERS',
        'INSERT',
        NULL,
        'Name: ' || :NEW.FULL_NAME || ' | Email: ' || :NEW.EMAIL || ' | Role: ' || :NEW.ROLE_ID,
        :NEW.FULL_NAME,
        SYSDATE
    );
END;
/

-- DELETE on USERS
CREATE OR REPLACE TRIGGER TRG_AUDIT_USERS_DELETE
AFTER DELETE ON USERS
FOR EACH ROW
BEGIN
    INSERT INTO AUDIT_LOGS (TABLE_NAME, OPERATION, OLD_VALUE, NEW_VALUE, CHANGED_BY, CHANGED_AT)
    VALUES (
        'USERS',
        'DELETE',
        'Name: ' || :OLD.FULL_NAME || ' | Email: ' || :OLD.EMAIL,
        NULL,
        :OLD.FULL_NAME,
        SYSDATE
    );
END;
/

-- INSERT on STUDENTS
CREATE OR REPLACE TRIGGER TRG_AUDIT_STUDENTS_INSERT
AFTER INSERT ON STUDENTS
FOR EACH ROW
DECLARE
    v_name VARCHAR2(200);
BEGIN
    SELECT FULL_NAME INTO v_name FROM USERS WHERE USER_ID = :NEW.USER_ID;
    INSERT INTO AUDIT_LOGS (TABLE_NAME, OPERATION, OLD_VALUE, NEW_VALUE, CHANGED_BY, CHANGED_AT)
    VALUES (
        'STUDENTS',
        'INSERT',
        NULL,
        'REG: ' || :NEW.REG_NUMBER || ' | CGPA: ' || :NEW.CGPA,
        v_name,
        SYSDATE
    );
END;
/

-- DELETE on STUDENTS
CREATE OR REPLACE TRIGGER TRG_AUDIT_STUDENTS_DELETE
AFTER DELETE ON STUDENTS
FOR EACH ROW
DECLARE
    v_name VARCHAR2(200);
BEGIN
    SELECT FULL_NAME INTO v_name FROM USERS WHERE USER_ID = :OLD.USER_ID;
    INSERT INTO AUDIT_LOGS (TABLE_NAME, OPERATION, OLD_VALUE, NEW_VALUE, CHANGED_BY, CHANGED_AT)
    VALUES (
        'STUDENTS',
        'DELETE',
        'REG: ' || :OLD.REG_NUMBER || ' | CGPA: ' || :OLD.CGPA,
        NULL,
        v_name,
        SYSDATE
    );
END;
/

-- INSERT on FACULTY
CREATE OR REPLACE TRIGGER TRG_AUDIT_FACULTY_INSERT
AFTER INSERT ON FACULTY
FOR EACH ROW
DECLARE
    v_name VARCHAR2(200);
BEGIN
    SELECT FULL_NAME INTO v_name FROM USERS WHERE USER_ID = :NEW.USER_ID;
    INSERT INTO AUDIT_LOGS (TABLE_NAME, OPERATION, OLD_VALUE, NEW_VALUE, CHANGED_BY, CHANGED_AT)
    VALUES (
        'FACULTY',
        'INSERT',
        NULL,
        'Designation: ' || :NEW.DESIGNATION || ' | Dept: ' || :NEW.DEPT_ID,
        v_name,
        SYSDATE
    );
END;
/

-- DELETE on FACULTY
CREATE OR REPLACE TRIGGER TRG_AUDIT_FACULTY_DELETE
AFTER DELETE ON FACULTY
FOR EACH ROW
DECLARE
    v_name VARCHAR2(200);
BEGIN
    SELECT FULL_NAME INTO v_name FROM USERS WHERE USER_ID = :OLD.USER_ID;
    INSERT INTO AUDIT_LOGS (TABLE_NAME, OPERATION, OLD_VALUE, NEW_VALUE, CHANGED_BY, CHANGED_AT)
    VALUES (
        'FACULTY',
        'DELETE',
        'Designation: ' || :OLD.DESIGNATION || ' | Dept: ' || :OLD.DEPT_ID,
        NULL,
        v_name,
        SYSDATE
    );
END;
/

-- UPDATE on CGPA (already exists but improve it)
CREATE OR REPLACE TRIGGER TRG_AUDIT_STUDENTS
AFTER UPDATE ON STUDENTS
FOR EACH ROW
DECLARE
    v_name VARCHAR2(200);
BEGIN
    SELECT FULL_NAME INTO v_name FROM USERS WHERE USER_ID = :OLD.USER_ID;
    INSERT INTO AUDIT_LOGS (TABLE_NAME, OPERATION, OLD_VALUE, NEW_VALUE, CHANGED_BY, CHANGED_AT)
    VALUES (
        'STUDENTS',
        'UPDATE',
        'CGPA: ' || :OLD.CGPA || ' | REG: ' || :OLD.REG_NUMBER,
        'CGPA: ' || :NEW.CGPA || ' | REG: ' || :NEW.REG_NUMBER,
        v_name,
        SYSDATE
    );
END;
/