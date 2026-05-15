DECLARE
    CURSOR c_student_ranking IS
        SELECT s.student_id, u.full_name, s.reg_number,
               s.cgpa, b.batch_name, sec.section_name,
               get_student_rank(s.student_id) AS rank
        FROM students s
        JOIN users u ON s.user_id = u.user_id
        JOIN batches b ON s.batch_id = b.batch_id
        JOIN sections sec ON s.section_id = sec.section_id
        ORDER BY s.cgpa DESC;

    v_student c_student_ranking%ROWTYPE;
BEGIN
    DBMS_OUTPUT.PUT_LINE('============================================');
    DBMS_OUTPUT.PUT_LINE('        STUDENT RANKING REPORT              ');
    DBMS_OUTPUT.PUT_LINE('============================================');
    DBMS_OUTPUT.PUT_LINE(
        RPAD('Name', 20) ||
        RPAD('Reg No', 18) ||
        RPAD('Batch', 10) ||
        RPAD('Section', 10) ||
        RPAD('CGPA', 8) ||
        'Rank'
    );
    DBMS_OUTPUT.PUT_LINE(RPAD('-', 70, '-'));

    OPEN c_student_ranking;
    LOOP
        FETCH c_student_ranking INTO v_student;
        EXIT WHEN c_student_ranking%NOTFOUND;

        DBMS_OUTPUT.PUT_LINE(
            RPAD(v_student.full_name, 20) ||
            RPAD(v_student.reg_number, 18) ||
            RPAD(v_student.batch_name, 10) ||
            RPAD(v_student.section_name, 10) ||
            RPAD(v_student.cgpa, 8) ||
            v_student.rank
        );
    END LOOP;
    DBMS_OUTPUT.PUT_LINE('============================================');
    DBMS_OUTPUT.PUT_LINE('Total Students: ' || c_student_ranking%ROWCOUNT);
    CLOSE c_student_ranking;

    
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
        IF c_student_ranking%ISOPEN THEN
            CLOSE c_student_ranking;
        END IF;
END;
/


-- cursor #2======================================================================
DECLARE
    CURSOR c_top_projects IS
        SELECT p.project_id, p.title, p.ai_score,
               p.final_score, u.full_name,
               sec.section_name, b.batch_name,
               RANK() OVER (
                   PARTITION BY p.section_id 
                   ORDER BY p.final_score DESC
               ) AS project_rank
        FROM projects p
        JOIN students s ON p.student_id = s.student_id
        JOIN users u ON s.user_id = u.user_id
        JOIN sections sec ON p.section_id = sec.section_id
        JOIN batches b ON p.batch_id = b.batch_id
        ORDER BY sec.section_name, p.final_score DESC;

    v_project c_top_projects%ROWTYPE;
BEGIN
    DBMS_OUTPUT.PUT_LINE('============================================');
    DBMS_OUTPUT.PUT_LINE('      TOP PROJECTS PER SECTION REPORT      ');
    DBMS_OUTPUT.PUT_LINE('============================================');
    DBMS_OUTPUT.PUT_LINE(
        RPAD('Section', 10) ||
        RPAD('Student', 20) ||
        RPAD('Title', 25) ||
        RPAD('AI Score', 10) ||
        RPAD('Final', 8) ||
        'Rank'
    );
    DBMS_OUTPUT.PUT_LINE(RPAD('-', 80, '-'));

    OPEN c_top_projects;
    LOOP
        FETCH c_top_projects INTO v_project;
        EXIT WHEN c_top_projects%NOTFOUND;

        -- Only show top 3 per section
        IF v_project.project_rank <= 3 THEN
            DBMS_OUTPUT.PUT_LINE(
                RPAD(v_project.section_name, 10) ||
                RPAD(v_project.full_name, 20) ||
                RPAD(v_project.title, 25) ||
                RPAD(v_project.ai_score, 10) ||
                RPAD(v_project.final_score, 8) ||
                v_project.project_rank
            );
        END IF;
    END LOOP;

    DBMS_OUTPUT.PUT_LINE('============================================');
    CLOSE c_top_projects;

EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
        IF c_top_projects%ISOPEN THEN
            CLOSE c_top_projects;
        END IF;
END;
/

