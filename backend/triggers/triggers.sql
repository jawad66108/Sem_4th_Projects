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
