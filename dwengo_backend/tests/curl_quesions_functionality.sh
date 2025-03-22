#!/usr/bin/env bash
set -euo pipefail

BASE_URL="http://localhost:5000"

############################################
## 1) Teacher registreren & inloggen
############################################
TEACHER_EMAIL="teacher@example.com"
TEACHER_PASS="secret123"

echo "=== [1] Teacher registreren ==="
curl -s -X POST "$BASE_URL/teacher/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Teachy",
    "lastName": "McTeachface",
    "email": "'"$TEACHER_EMAIL"'",
    "password": "'"$TEACHER_PASS"'"
  }' || true  # herhaald run => 'Gebruiker bestaat al'

echo ""
echo "=== [2] Teacher inloggen & token opslaan ==="
TEACHER_TOKEN=$(curl -s -X POST "$BASE_URL/teacher/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'"$TEACHER_EMAIL"'",
    "password": "'"$TEACHER_PASS"'"
  }' | jq -r '.token')

echo "TEACHER_TOKEN = $TEACHER_TOKEN"
echo ""

############################################
## 2) Teacher maakt een Klas
############################################
echo "=== [3] Teacher maakt een klas ==="
CREATE_CLASS_RESP=$(curl -s -X POST "$BASE_URL/teacher/classes" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "TestClass"}')

CLASS_ID=$(echo "$CREATE_CLASS_RESP" | jq -r '.classroom.id')
JOIN_CODE=$(echo "$CREATE_CLASS_RESP" | jq -r '.classroom.code')
echo "CLASS_ID=$CLASS_ID"
echo "JOIN_CODE=$JOIN_CODE"
echo ""

############################################
## 3) Studenten registreren & inloggen
############################################
STUDENTS=( "student1@example.com" "student2@example.com" )
STUDENT_PASS="secret456"

for S in "${STUDENTS[@]}"; do
  echo "=== Registreren van student: $S ==="
  curl -s -X POST "$BASE_URL/student/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
      "firstName": "Firstname",
      "lastName": "Lastname",
      "email": "'"$S"'",
      "password": "'"$STUDENT_PASS"'"
    }' || true

  echo -n "-> Inloggen student $S => "
  TOKEN=$(curl -s -X POST "$BASE_URL/student/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "'"$S"'",
      "password": "'"$STUDENT_PASS"'"
    }' | jq -r '.token')
  echo "$TOKEN"

  # Extract userId
  STUD_ID=$(echo "$TOKEN" | cut -d '.' -f2 | base64 -d 2>/dev/null | jq -r '.id' || echo "unknown")

  # Student join de klas
  echo "-> Student $S (id=$STUD_ID) join klas met code=$JOIN_CODE"
  curl -s -X POST "$BASE_URL/student/classes/join" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"joinCode":"'"$JOIN_CODE"'"}' >/dev/null

  echo "{\"email\":\"$S\",\"token\":\"$TOKEN\",\"id\":\"$STUD_ID\"}" > "$S.json"
  echo ""
done

############################################
## 4) Teacher keurt joinRequests goed
############################################
echo "=== [4] Teacher checkt & approve joinRequests ==="
JOIN_REQUESTS=$(curl -s -X GET "$BASE_URL/teacher/classes/$CLASS_ID/join-requests" \
  -H "Authorization: Bearer $TEACHER_TOKEN")
REQ_IDS=$(echo "$JOIN_REQUESTS" | jq -r '.joinRequests[].requestId')
for RID in $REQ_IDS; do
  curl -s -X PATCH "$BASE_URL/teacher/classes/$CLASS_ID/join-requests/$RID" \
    -H "Authorization: Bearer $TEACHER_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"action":"approve"}' >/dev/null
  echo "-> Approved requestId=$RID"
done
echo ""

############################################
## 5) Teacher maakt lokaal leerobject + leerpad
############################################
echo "=== [5a] Teacher maakt lokaal leerobject (LO) ==="
LO_RESP=$(curl -s -X POST "$BASE_URL/teacher/learningObjects" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Sensor Intro LO",
    "description":"Uitleg over sensoren",
    "contentType":"TEXT_MARKDOWN",
    "keywords":["sensor","hardware"],
    "targetAges":[14,15],
    "teacherExclusive":false,
    "difficulty":2
  }')
LO_ID=$(echo "$LO_RESP" | jq -r '.learningObject.id')
echo "LO_ID=$LO_ID"

echo ""
echo "=== [5b] Teacher maakt lokaal leerpad ==="
LP_RESP=$(curl -s -X POST "$BASE_URL/teacher/learningPaths" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Local Path #1",
    "language": "nl",
    "description": "Dit is een lokaal leerpad",
    "image": null
  }')
LP_ID=$(echo "$LP_RESP" | jq -r '.learningPath.id')
echo "LP_ID=$LP_ID"
echo ""

############################################
## 6) Teacher maakt assignments
##   a) Lokaal => pathRef= local path (LP_ID)
##   b) Extern => pathRef= "aiz5_triage", isExternal=true, pathLanguage="nl"
############################################
echo "=== [6] Teacher maakt 2 assignments ==="
ASSIGNMENT_LOCAL=$(curl -s -X POST "$BASE_URL/teacher/assignments" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "classId": '"$CLASS_ID"',
    "pathRef": "'"$LP_ID"'",
    "isExternal": false,
    "deadline": "2025-12-31T23:59:59.000Z"
  }' | jq -r '.id')

ASSIGNMENT_DWENGO=$(curl -s -X POST "$BASE_URL/teacher/assignments" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "classId": '"$CLASS_ID"',
    "pathRef": "aiz5_triage",
    "pathLanguage": "nl",
    "isExternal": true,
    "deadline": "2025-12-31T23:59:59.000Z"
  }' | jq -r '.id')

echo "ASSIGNMENT_LOCAL=$ASSIGNMENT_LOCAL"
echo "ASSIGNMENT_DWENGO=$ASSIGNMENT_DWENGO"
echo ""

############################################
## 7) Teacher maakt teams
## Let op: de route is nu:
##  POST /teacher/assignments/:assignmentId/team/class/:classId
############################################
STUD1_ID=$(jq -r .id student1@example.com.json)
STUD2_ID=$(jq -r .id student2@example.com.json)

echo "=== [7a] Teams in local assignment ==="
TEAM_ALPHA=$(curl -s -X POST "$BASE_URL/teacher/assignments/$ASSIGNMENT_LOCAL/team/class/$CLASS_ID" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "teams": [
      {
        "teamName": "TeamAlpha",
        "studentIds": ['"$STUD1_ID"']
      }
    ]
  }')

TEAM_BETA=$(curl -s -X POST "$BASE_URL/teacher/assignments/$ASSIGNMENT_LOCAL/team/class/$CLASS_ID" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "teams": [
      {
        "teamName": "TeamBeta",
        "studentIds": ['"$STUD2_ID"']
      }
    ]
  }')

TEAM_ID_ALPHA=$(echo "$TEAM_ALPHA" | jq -r '.createdTeams[0].id')
TEAM_ID_BETA=$(echo "$TEAM_BETA" | jq -r '.createdTeams[0].id')
echo "TEAM_ID_ALPHA=$TEAM_ID_ALPHA"
echo "TEAM_ID_BETA=$TEAM_ID_BETA"
echo ""

echo "=== [7b] Team in Dwengo assignment (zodat Student2 vragen kan stellen) ==="
TEAM_DWENGO_RESP=$(curl -s -X POST "$BASE_URL/teacher/assignments/$ASSIGNMENT_DWENGO/team/class/$CLASS_ID" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "teams": [
      {
        "teamName": "TeamDwengo",
        "studentIds": ['"$STUD2_ID"']
      }
    ]
  }')
TEAM_ID_DWENGO=$(echo "$TEAM_DWENGO_RESP" | jq -r '.createdTeams[0].id')
echo "TEAM_ID_DWENGO=$TEAM_ID_DWENGO"
echo ""

echo "=== [7c] TeamShared in local assignment (beide studenten) om interactie te tonen ==="
TEAM_SHARED_RESP=$(curl -s -X POST "$BASE_URL/teacher/assignments/$ASSIGNMENT_LOCAL/team/class/$CLASS_ID" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "teams": [
      {
        "teamName": "TeamShared",
        "studentIds": ['"$STUD1_ID"','"$STUD2_ID"']
      }
    ]
  }')
TEAM_ID_SHARED=$(echo "$TEAM_SHARED_RESP" | jq -r '.createdTeams[0].id')
echo "TEAM_ID_SHARED=$TEAM_ID_SHARED"
echo ""

############################################
## 8) Studenten stellen vragen
##  - Stud1 SPECIFIC (lokaal LO)
##  - Stud1 GENERAL (lokaal path)
##  - Stud2 SPECIFIC (dwengo LO => hruid='aiz5_inleiding')
##  - Stud2 GENERAL (dwengo path => 'aiz5_triage')
############################################
STUDENT1_TOKEN=$(jq -r .token student1@example.com.json)
STUDENT2_TOKEN=$(jq -r .token student2@example.com.json)

echo "=== [8a] Student1 => SPECIFIC over LOKAAL LO ==="
Q_SPEC_LOCAL=$(curl -s -X POST "$BASE_URL/question/specific/$ASSIGNMENT_LOCAL" \
  -H "Authorization: Bearer $STUDENT1_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "teamId": '"$TEAM_ID_ALPHA"',
    "title": "Vraag over Lokaal LO",
    "text": "Ik snap nog niet hoe ik Sensor Intro LO gebruik?",
    "isExternal": false,
    "localLearningObjectId": "'"$LO_ID"'"
  }')
SPEC_LOCAL_ID=$(echo "$Q_SPEC_LOCAL" | jq -r '.questionId')
echo "SPEC_LOCAL_ID=$SPEC_LOCAL_ID"

echo ""
echo "=== [8b] Student1 => GENERAL over LOKAAL leerpad (LP_ID) ==="
Q_GEN_LOCAL=$(curl -s -X POST "$BASE_URL/question/general/$ASSIGNMENT_LOCAL" \
  -H "Authorization: Bearer $STUDENT1_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "teamId": '"$TEAM_ID_ALPHA"',
    "title": "Algemene vraag over local path",
    "text": "Hoe verwerk ik de nodes in Local Path #1?",
    "isExternal": false,
    "pathRef": "'"$LP_ID"'"
  }')
GEN_LOCAL_ID=$(echo "$Q_GEN_LOCAL" | jq -r '.questionId')
echo "GEN_LOCAL_ID=$GEN_LOCAL_ID"

echo ""
echo "=== [8c] Student2 => SPECIFIC over Dwengo LO (bv. 'aiz5_inleiding') ==="
Q_SPEC_DWENGO=$(curl -s -X POST "$BASE_URL/question/specific/$ASSIGNMENT_LOCAL" \
  -H "Authorization: Bearer $STUDENT2_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "teamId": '"$TEAM_ID_BETA"',
    "title": "Vraag over Dwengo LO (aiz5_inleiding)",
    "text": "Ik snap de inleiding nog niet!",
    "isExternal": true,
    "dwengoHruid": "aiz5_inleiding",
    "dwengoLanguage": "nl",
    "dwengoVersion": 1
  }')
SPEC_DWENGO_ID=$(echo "$Q_SPEC_DWENGO" | jq -r '.questionId')
echo "SPEC_DWENGO_ID=$SPEC_DWENGO_ID"

echo ""
echo "=== [8d] Student2 => GENERAL over Dwengo leerpad 'aiz5_triage' ==="
Q_GEN_DWENGO=$(curl -s -X POST "$BASE_URL/question/general/$ASSIGNMENT_DWENGO" \
  -H "Authorization: Bearer $STUDENT2_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "teamId": '"$TEAM_ID_DWENGO"',
    "title": "Vraag over Dwengo path 'aiz5_triage'",
    "text": "Hoe werkt stap 3 in triage?",
    "isExternal": true,
    "pathRef": "aiz5_triage",
    "dwengoLanguage":"nl"
  }')
GEN_DWENGO_ID=$(echo "$Q_GEN_DWENGO" | jq -r '.questionId')
echo "GEN_DWENGO_ID=$GEN_DWENGO_ID"
echo ""

############################################
## 9) Voorbeeld van gedeelde interactie (TeamShared)
############################################
echo "=== [9a] Student1 stelt GENERAL (lokaal) in TEAM_SHARED (beide studenten) ==="
Q_SHARED=$(curl -s -X POST "$BASE_URL/question/general/$ASSIGNMENT_LOCAL" \
  -H "Authorization: Bearer $STUDENT1_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "teamId": '"$TEAM_ID_SHARED"',
    "title": "Gezamenlijke vraag in TeamShared",
    "text": "Hey, wie weet hoe we node X bereiken?",
    "isExternal": false,
    "pathRef": "'"$LP_ID"'"
  }')
Q_SHARED_ID=$(echo "$Q_SHARED" | jq -r '.questionId')
echo "Q_SHARED_ID=$Q_SHARED_ID"

echo "=== [9b] Student2 reageert in dezelfde vraag Q_SHARED_ID ==="
MSG_STUD2=$(curl -s -X POST "$BASE_URL/question/$Q_SHARED_ID/message" \
  -H "Authorization: Bearer $STUDENT2_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"Ik denk dat we node X overslaan, want ..."}')
MSG_STUD2_ID=$(echo "$MSG_STUD2" | jq -r '.id')
echo "MSG_STUD2_ID=$MSG_STUD2_ID"

echo "=== [9c] Teacher reageert ook in die vraag ==="
MSG_TEACH=$(curl -s -X POST "$BASE_URL/question/$Q_SHARED_ID/message" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"Interessant! Probeer eens node Y te bekijken."}')
MSG_TEACH_ID=$(echo "$MSG_TEACH" | jq -r '.id')
echo "MSG_TEACH_ID=$MSG_TEACH_ID"

echo "=== [9d] Student1 stuurt nog bericht ==="
MSG_STUD1_2=$(curl -s -X POST "$BASE_URL/question/$Q_SHARED_ID/message" \
  -H "Authorization: Bearer $STUDENT1_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"Bedankt leraar, dat helpt."}')
echo "$MSG_STUD1_2"

echo ""
echo "=== [9e] Bekijk de hele conversation van Q_SHARED_ID ==="
curl -s -X GET "$BASE_URL/question/$Q_SHARED_ID" \
  -H "Authorization: Bearer $STUDENT1_TOKEN" | jq '.'

############################################
## 10) Enkele extra messages, GET/UPDATE
############################################
echo ""
echo "=== [10a] Student1 maakt nog een message op SPEC_LOCAL_ID ==="
MSG1=$(curl -s -X POST "$BASE_URL/question/$SPEC_LOCAL_ID/message" \
  -H "Authorization: Bearer $STUDENT1_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"Ik heb nieuwe info..."}')
MSG1_ID=$(echo "$MSG1" | jq -r '.id')
echo "MSG1_ID=$MSG1_ID"

echo ""
echo "=== [10b] GET question $SPEC_LOCAL_ID (incl. messages) ==="
curl -s -X GET "$BASE_URL/question/$SPEC_LOCAL_ID" \
  -H "Authorization: Bearer $STUDENT1_TOKEN" | jq '.'

echo ""
echo "=== [10c] Update de titel van question $SPEC_LOCAL_ID ==="
curl -s -X PATCH "$BASE_URL/question/$SPEC_LOCAL_ID" \
  -H "Authorization: Bearer $STUDENT1_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Vraag over Lokaal LO (updated)"}' > /dev/null

echo ""
echo "=== [10d] Verwijder message $MSG1_ID ==="
curl -s -X DELETE "$BASE_URL/question/$SPEC_LOCAL_ID/message/$MSG1_ID" \
  -H "Authorization: Bearer $STUDENT1_TOKEN" > /dev/null

############################################
## 11) Vragen ophalen per team/class/assignment
############################################
echo ""
echo "=== [11a] GET questions for team=$TEAM_ID_ALPHA ==="
curl -s -X GET "$BASE_URL/question/team/$TEAM_ID_ALPHA" \
  -H "Authorization: Bearer $STUDENT1_TOKEN" | jq '.'

echo ""
echo "=== [11b] GET questions for class=$CLASS_ID ==="
curl -s -X GET "$BASE_URL/question/class/$CLASS_ID" \
  -H "Authorization: Bearer $TEACHER_TOKEN" | jq '.'

echo ""
echo "=== [11c] GET questions for assignment=$ASSIGNMENT_LOCAL in class=$CLASS_ID ==="
curl -s -X GET "$BASE_URL/question/assignment/$ASSIGNMENT_LOCAL/class/$CLASS_ID" \
  -H "Authorization: Bearer $TEACHER_TOKEN" | jq '.'

echo ""
echo "🎉 Einde script. (Dwengo + lokaal) vragen flow + interactie succesvol getest!"
