CREATE OR REPLACE FUNCTION calculate_project_score(p_project_id IN NUMBER)
RETURN NUMBER
AS
    v_ai_score      NUMBER(5,2);
    v_avg_rating    NUMBER(5,2);
    v_final_score   NUMBER(5,2);
BEGIN
    SELECT ai_score INTO v_ai_score
    FROM projects WHERE project_id = p_project_id;

    SELECT NVL(AVG(rating * 10), 0) INTO v_avg_rating
    FROM project_reviews WHERE project_id = p_project_id;

    v_final_score := (v_ai_score * 0.6) + (v_avg_rating * 0.4);

    RETURN v_final_score;

EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN 0;
    WHEN OTHERS THEN
        RETURN 0;
END;
/

--Testing the function#2
-- Test calculate_project_score for all projects
SELECT p.project_id, p.title, p.ai_score,
       p.final_score AS old_score,
       calculate_project_score(p.project_id) AS new_calculated_score
FROM projects p
ORDER BY new_calculated_score DESC;