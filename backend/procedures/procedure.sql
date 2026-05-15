CREATE OR REPLACE PROCEDURE generate_dean_list(p_semester IN VARCHAR2)
AS
BEGIN
    -- Clear existing dean list for this semester
    DELETE FROM dean_list WHERE semester = p_semester;

    -- Insert all students with CGPA >= 3.5
    INSERT INTO dean_list (student_id, semester, cgpa, batch_id, section_id)
    SELECT s.student_id, p_semester, s.cgpa, s.batch_id, s.section_id
    FROM students s
    WHERE s.cgpa >= 3.5;

    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Dean List generated successfully for ' || p_semester);
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
END;
/

--Testing the procedure
-- Enable output
SET SERVEROUTPUT ON;

-- Run the procedure
EXEC generate_dean_list('Fall-2025');

-- Check results
SELECT d.dean_id, u.full_name, s.reg_number, d.cgpa, d.semester
FROM dean_list d
JOIN students s ON d.student_id = s.student_id
JOIN users u ON s.user_id = u.user_id
ORDER BY d.cgpa DESC;

--Stored Procedure #2====================================
CREATE OR REPLACE PROCEDURE get_top_projects_by_batch(p_batch_id IN NUMBER)
AS
    CURSOR c_projects IS
        SELECT p.project_id, u.full_name, p.title, 
               p.ai_score, p.final_score, p.status
        FROM projects p
        JOIN students s ON p.student_id = s.student_id
        JOIN users u ON s.user_id = u.user_id
        WHERE p.batch_id = p_batch_id
        ORDER BY p.final_score DESC
        FETCH FIRST 6 ROWS ONLY;
BEGIN
    DBMS_OUTPUT.PUT_LINE('========== TOP PROJECTS FOR BATCH ' || p_batch_id || ' ==========');
    DBMS_OUTPUT.PUT_LINE(RPAD('Student', 20) || RPAD('Title', 30) || RPAD('AI Score', 10) || 'Final Score');
    DBMS_OUTPUT.PUT_LINE(RPAD('-', 75, '-'));

    FOR rec IN c_projects LOOP
        DBMS_OUTPUT.PUT_LINE(
            RPAD(rec.full_name, 20) ||
            RPAD(rec.title, 30) ||
            RPAD(rec.ai_score, 10) ||
            rec.final_score
        );
    END LOOP;

    DBMS_OUTPUT.PUT_LINE('========================================');
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
END;
/

--Testing the procedure#2
SET SERVEROUTPUT ON;

-- Get top projects for batch 1 (BSCS-4)
EXEC get_top_projects_by_batch(1);


--Stored Procedure #3====================================
CREATE OR REPLACE PROCEDURE calculate_batch_average(p_batch_id IN NUMBER)
AS
    v_avg_cgpa    NUMBER(4,2);
    v_total_std   NUMBER;
    v_batch_name  VARCHAR2(50);
    v_max_cgpa    NUMBER(4,2);
    v_min_cgpa    NUMBER(4,2);
BEGIN
    -- Get batch name
    SELECT batch_name INTO v_batch_name
    FROM batches WHERE batch_id = p_batch_id;

    -- Calculate stats
    SELECT AVG(cgpa), COUNT(*), MAX(cgpa), MIN(cgpa)
    INTO v_avg_cgpa, v_total_std, v_max_cgpa, v_min_cgpa
    FROM students
    WHERE batch_id = p_batch_id;

    DBMS_OUTPUT.PUT_LINE('========== BATCH STATISTICS ==========');
    DBMS_OUTPUT.PUT_LINE('Batch Name   : ' || v_batch_name);
    DBMS_OUTPUT.PUT_LINE('Total Students: ' || v_total_std);
    DBMS_OUTPUT.PUT_LINE('Average CGPA : ' || v_avg_cgpa);
    DBMS_OUTPUT.PUT_LINE('Highest CGPA : ' || v_max_cgpa);
    DBMS_OUTPUT.PUT_LINE('Lowest CGPA  : ' || v_min_cgpa);
    DBMS_OUTPUT.PUT_LINE('======================================');

EXCEPTION
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('Error: Batch not found.');
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
END;
/


--Testing the procedure#3
SET SERVEROUTPUT ON;

-- Calculate stats for batch 1 (BSCS-4)
EXEC calculate_batch_average(1);
