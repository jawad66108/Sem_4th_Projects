--=========================Transcation #1=========================
DECLARE
    v_student_id    NUMBER := 1;
    v_course_id     NUMBER := 2;
    v_semester      VARCHAR2(20) := 'Spring-2026';
    v_grade         VARCHAR2(2) := 'A';
    v_grade_points  NUMBER := 4.0;
    v_new_cgpa      NUMBER := 3.95;
BEGIN
    -- Start Transaction
    SAVEPOINT start_upload;

    -- Step 1: Insert enrollment record
    INSERT INTO enrollments (student_id, course_id, semester, grade, grade_points, is_locked)
    VALUES (v_student_id, v_course_id, v_semester, v_grade, v_grade_points, 0);

    DBMS_OUTPUT.PUT_LINE('Step 1 Done: Enrollment inserted');

    -- Step 2: Insert CGPA record
    INSERT INTO cgpa_records (student_id, semester, sgpa, cgpa)
    VALUES (v_student_id, v_semester, 3.95, v_new_cgpa);

    DBMS_OUTPUT.PUT_LINE('Step 2 Done: CGPA record inserted');

    -- Step 3: Update student CGPA
    UPDATE students SET cgpa = v_new_cgpa
    WHERE student_id = v_student_id;

    DBMS_OUTPUT.PUT_LINE('Step 3 Done: Student CGPA updated');

    -- Step 4: Log in audit
    INSERT INTO audit_logs (table_name, operation, old_value, new_value, changed_by)
    VALUES ('ENROLLMENTS', 'INSERT', 'NULL', 'Grade: ' || v_grade, USER);

    DBMS_OUTPUT.PUT_LINE('Step 4 Done: Audit log inserted');

    -- All steps passed - COMMIT
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('SUCCESS: Transaction committed!');

EXCEPTION
    WHEN OTHERS THEN
        -- Something failed - ROLLBACK everything
        ROLLBACK TO start_upload;
        DBMS_OUTPUT.PUT_LINE('FAILED: Transaction rolled back!');
        DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
END;
/

--=========================Transcation #2=========================
-- Simulate two faculty editing same project simultaneously
-- Faculty 1 locks the row first

DECLARE
    v_project_id NUMBER := 1;
    v_score      NUMBER := 92.0;
    v_dummy      NUMBER;
BEGIN
    SAVEPOINT before_lock;

    -- Lock the row (simulates Faculty 1 editing)
    SELECT project_id INTO v_dummy FROM projects
    WHERE project_id = v_project_id
    FOR UPDATE NOWAIT;

    DBMS_OUTPUT.PUT_LINE('Faculty 1: Row locked successfully');

    -- Faculty 1 updates score
    UPDATE projects 
    SET final_score = v_score,
        status = 'REVIEWED'
    WHERE project_id = v_project_id;

    DBMS_OUTPUT.PUT_LINE('Faculty 1: Score updated to ' || v_score);

    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Faculty 1: Changes committed, lock released!');

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK TO before_lock;
        DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
        DBMS_OUTPUT.PUT_LINE('Row is locked by another user!');
END;
/

--=========================Indexing and Performance Optimization===========================
-- Before indexing (check query cost)
EXPLAIN PLAN FOR
SELECT * FROM students WHERE cgpa > 3.5;
SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY);

-- Create indexes
CREATE INDEX idx_student_cgpa ON students(cgpa);
CREATE INDEX idx_student_batch ON students(batch_id);
CREATE INDEX idx_project_score ON projects(final_score);
CREATE INDEX idx_project_batch ON projects(batch_id);

-- After indexing (check improved cost)
EXPLAIN PLAN FOR
SELECT * FROM students WHERE cgpa > 3.5;
SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY);
