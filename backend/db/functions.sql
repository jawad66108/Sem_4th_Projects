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

CREATE OR REPLACE FUNCTION calculate_ai_score_local(
    p_title       IN VARCHAR2,
    p_description IN CLOB,
    p_github_link IN VARCHAR2,
    p_report_file IN VARCHAR2
) RETURN NUMBER AS
    v_score      NUMBER := 0;
    v_word_count NUMBER := 0;
    v_text       VARCHAR2(4000);
    v_variation  NUMBER;
BEGIN
    -- 1. Description quality (up to 40 pts)
    IF p_description IS NOT NULL THEN
        v_word_count := REGEXP_COUNT(TRIM(p_description), '\S+');
        IF    v_word_count >= 200 THEN v_score := v_score + 40;
        ELSIF v_word_count >= 100 THEN v_score := v_score + 30;
        ELSIF v_word_count >= 50  THEN v_score := v_score + 20;
        ELSIF v_word_count >= 20  THEN v_score := v_score + 10;
        END IF;
    END IF;

    -- 2. GitHub link (20 pts)
    IF p_github_link IS NOT NULL AND TRIM(p_github_link) != '' THEN
        v_score := v_score + 20;
    END IF;

    -- 3. Report uploaded (20 pts)
    IF p_report_file IS NOT NULL AND TRIM(p_report_file) != '' THEN
        v_score := v_score + 20;
    END IF;

    -- 4. Keywords in title + description (up to 20 pts)
    v_text := LOWER(SUBSTR(p_title || ' ' || p_description, 1, 4000));
    DECLARE
        v_kw_score NUMBER := 0;
        TYPE kw_list IS TABLE OF VARCHAR2(50);
        v_keywords kw_list := kw_list(
            'machine learning','artificial intelligence','deep learning',
            'neural network','computer vision','blockchain','security',
            'automation','database','api','cloud','mobile','web',
            'system','react','node','python','java','flutter','iot',
            'data','nlp','app','django'
        );
    BEGIN
        FOR i IN 1..v_keywords.COUNT LOOP
            IF INSTR(v_text, v_keywords(i)) > 0 THEN
                v_kw_score := v_kw_score + 4;
            END IF;
            EXIT WHEN v_kw_score >= 20;
        END LOOP;
        v_score := v_score + LEAST(v_kw_score, 20);
    END;

    -- 5. Random variation -3 to +3
    v_variation := ROUND(DBMS_RANDOM.VALUE(-3, 3));
    v_score := v_score + v_variation;

    -- 6. Cap between 0 and 92
    RETURN LEAST(92, GREATEST(0, v_score));

EXCEPTION
    WHEN OTHERS THEN RETURN 50;
END;
/