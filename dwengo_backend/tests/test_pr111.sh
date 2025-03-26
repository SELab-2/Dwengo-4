#!/usr/bin/env bash
#
# test_full_flow.sh
#
# Demo-script dat de volledige functionaliteit test:
#  1) Teacher en Student registreren/inloggen
#  2) Class aanmaken, Student laten joinen, Teacher approve
#  3) Lokaal LearningObject + LearningPath maken
#  4) Assignments maken (zowel lokaal als Dwengo)
#  5) Student assignments opvragen
#  6) Laatste 10 leerobjecten en leerpaden tonen, enkel beperkte velden
#
# Vereisten:
#   - jq (voor JSON-parsing en filtering)
#   - De server draait op http://localhost:5000 (pas BASE_URL aan indien nodig)

set -e  # Stop bij de eerste fout

# --[ Configuratie ]---------------------------------------------------------
BASE_URL="http://localhost:5000"

TEACHER_EMAIL="testleerkracht@gmail.com"
TEACHER_PASSWORD="geheims123"
TEACHER_FIRSTNAME="Tom"
TEACHER_LASTNAME="Teacher"

STUDENT_EMAIL="testleerling@gmail.com"
STUDENT_PASSWORD="wachtwoord123"
STUDENT_FIRSTNAME="Sofie"
STUDENT_LASTNAME="Student"

echo "==[ 0) (Optioneel) Opschonen - indien nodig ]====================="
# Eventueel kun je hier DB-cleanup doen of prisma migrate reset.
# Niet verplicht, hangt af van je ontwikkelomgeving.

echo
echo "==[ 1) Registreren van Teacher en Student ]========================"
# --- Teacher register ---
curl -i -X POST "$BASE_URL/auth/teacher/register" \
     -H "Content-Type: application/json" \
     -d "{
       \"firstName\":\"$TEACHER_FIRSTNAME\",
       \"lastName\":\"$TEACHER_LASTNAME\",
       \"email\":\"$TEACHER_EMAIL\",
       \"password\":\"$TEACHER_PASSWORD\"
     }" || true

# --- Student register ---
curl -i -X POST "$BASE_URL/auth/student/register" \
     -H "Content-Type: application/json" \
     -d "{
       \"firstName\":\"$STUDENT_FIRSTNAME\",
       \"lastName\":\"$STUDENT_LASTNAME\",
       \"email\":\"$STUDENT_EMAIL\",
       \"password\":\"$STUDENT_PASSWORD\"
     }" || true

echo
echo "==[ 2) Inloggen Teacher en Student ]==============================="
# Inloggen Teacher
TEACHER_TOKEN=$(curl -s -X POST "$BASE_URL/auth/teacher/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\":\"$TEACHER_EMAIL\",
    \"password\":\"$TEACHER_PASSWORD\"
  }" | jq -r '.token' )

echo "Teacher token: $TEACHER_TOKEN"

# Inloggen Student
STUDENT_TOKEN=$(curl -s -X POST "$BASE_URL/auth/student/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\":\"$STUDENT_EMAIL\",
    \"password\":\"$STUDENT_PASSWORD\"
  }" | jq -r '.token' )

echo "Student token: $STUDENT_TOKEN"

echo
echo "==[ 3) Teacher maakt klas aan ]===================================="
CLASS_CREATE_RESP=$(curl -s -X POST "$BASE_URL/class/teacher" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Klas 3A"
  }')

CLASS_ID=$(echo "$CLASS_CREATE_RESP" | jq -r '.classroom.id')
echo "Gemaakte klas: id=$CLASS_ID"
echo "$CLASS_CREATE_RESP"

echo
echo "==[ 4) Teacher haalt de join link op ]============================="
JOIN_LINK_RESP=$(curl -s -X GET "$BASE_URL/class/teacher/$CLASS_ID/join-link" \
   -H "Authorization: Bearer $TEACHER_TOKEN")

JOIN_LINK=$(echo "$JOIN_LINK_RESP" | jq -r '.joinLink')
echo "Join link JSON: $JOIN_LINK_RESP"

# Uit de joinLink kun je 'joinCode' parsen
JOIN_CODE=$(echo "$JOIN_LINK" | sed 's/.*joinCode=\(.*\)/\1/')
echo "JoinCode is: $JOIN_CODE"

echo
echo "==[ 5) Student join request ]======================================"
curl -i -X POST "$BASE_URL/class/student/join" \
   -H "Authorization: Bearer $STUDENT_TOKEN" \
   -H "Content-Type: application/json" \
   -d "{
     \"joinCode\":\"$JOIN_CODE\"
   }"

echo
echo "==[ 6) Teacher bekijkt join requests en approve ]=================="
JOIN_REQS=$(curl -s -X GET "$BASE_URL/join-request/class/$CLASS_ID" \
  -H "Authorization: Bearer $TEACHER_TOKEN")

echo "Join requests: $JOIN_REQS"

# Let op: de JSON is bv:
# {
#   "joinRequests":[ {"requestId":2,"studentId":6,"classId":2,"status":"PENDING"} ]
# }
REQUEST_ID=$(echo "$JOIN_REQS" | jq -r '.joinRequests[0].requestId')
echo "Approve requestId: $REQUEST_ID"

curl -i -X PATCH "$BASE_URL/join-request/$REQUEST_ID/classes/$CLASS_ID" \
   -H "Authorization: Bearer $TEACHER_TOKEN" \
   -H "Content-Type: application/json" \
   -d '{"action":"approve"}'

echo
echo "==[ 7) Teacher maakt lokaal leerobject ]==========================="
LOCAL_LO=$(curl -s -X POST "$BASE_URL/learningObjectByTeacher" \
   -H "Authorization: Bearer $TEACHER_TOKEN" \
   -H "Content-Type: application/json" \
   -d '{
     "title":"Sensorles Lokaal",
     "description":"Lokale beschrijving over sensoren",
     "contentType":"TEXT_MARKDOWN",
     "keywords":["sensor","hardware"],
     "targetAges":[14,15],
     "teacherExclusive":false,
     "difficulty":2
   }')

LO_ID=$(echo "$LOCAL_LO" | jq -r '.learningObject.id')
echo "Aangemaakte leerobject: $LO_ID"
echo "$LOCAL_LO"

echo
echo "==[ 8) Teacher maakt lokaal leerpad ]=============================="
LOCAL_LP_RESP=$(curl -s -X POST "$BASE_URL/pathByTeacher" \
   -H "Authorization: Bearer $TEACHER_TOKEN" \
   -H "Content-Type: application/json" \
   -d '{
     "title":"Mijn Lokaal Pad",
     "language":"nl",
     "description":"Een test-leerpad",
     "image":null
   }')

LP_ID=$(echo "$LOCAL_LP_RESP" | jq -r '.learningPath.id')
echo "Aangemaakt leerpad ID: $LP_ID"
echo "$LOCAL_LP_RESP"

echo
echo "==[ 9) Teacher voegt node toe in leerpad (lokaal LO) ]============"
LP_NODE_RESP=$(curl -s -X POST "$BASE_URL/learningPath/$LP_ID/node" \
   -H "Authorization: Bearer $TEACHER_TOKEN" \
   -H "Content-Type: application/json" \
   -d "{
     \"isExternal\": false,
     \"localLearningObjectId\": \"$LO_ID\",
     \"start_node\": true
   }")

echo "Node response: $LP_NODE_RESP"








echo
echo "==[ 9b) Teacher voegt TWEEDE node toe (extern Dwengo LO) ]========="
# Voorbeeld: hruid= 'opdracht_leds', language='nl', version=2
LP_NODE2_RESP=$(curl -s -X POST "$BASE_URL/teacher/learningPath/$LP_ID/node" \
   -H "Authorization: Bearer $TEACHER_TOKEN" \
   -H "Content-Type: application/json" \
   -d "{
     \"isExternal\": true,
     \"dwengoHruid\": \"pc_micro_p1_oef1\",
     \"dwengoLanguage\": \"nl\",
     \"dwengoVersion\": 3,
     \"start_node\": false
   }")

echo "Second node response (Dwengo LO): $LP_NODE2_RESP"









echo
echo "==[ 10) Teacher maakt assignment met LOKAAL leerpad ]============="
ASSIGN_LOCAL_RESP=$(curl -s -X POST "$BASE_URL/teacher/assignments" \
   -H "Authorization: Bearer $TEACHER_TOKEN" \
   -H "Content-Type: application/json" \
   -d "{
     \"classId\": $CLASS_ID,
     \"pathRef\": \"$LP_ID\",
     \"pathLanguage\": \"\",  
     \"isExternal\": false,
     \"deadline\": \"2025-05-30T23:59:59.000Z\"
   }")

echo "Assignment response: $ASSIGN_LOCAL_RESP"

echo
echo "==[ 11) Teacher maakt assignment met EXTERN Dwengo lerpad]=============="
# Voorbeeld: hruid= 'test-v1', language='nl'
ASSIGN_DWENGO_RESP=$(curl -s -X POST "$BASE_URL/teacher/assignments" \
   -H "Authorization: Bearer $TEACHER_TOKEN" \
   -H "Content-Type: application/json" \
   -d "{
     \"classId\": $CLASS_ID,
     \"pathRef\": \"test-v1\",
     \"pathLanguage\": \"nl\",
     \"isExternal\": true,
     \"deadline\": \"2025-05-30T23:59:59.000Z\"
   }")

echo "Dwengo assignment response: $ASSIGN_DWENGO_RESP"

echo
echo "==[ 12) Student haalt eigen assignments op ]======================"
STU_ASSIGNMENTS=$(curl -s -X GET "$BASE_URL/student/assignments?sort=deadline" \
   -H "Authorization: Bearer $STUDENT_TOKEN")

echo "Assignments for student:"
echo "$STU_ASSIGNMENTS"

echo
echo "==[ 13) Teacher bekijkt laatste 10 leerobjecten (combi) ]"

echo "---- Teacher sees LO (limited fields) ----"
ALL_LO_TEACHER=$(curl -s -X GET "$BASE_URL/learningObject" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  | jq '.[-10:] | map({title, id, hruid, language, teacherExclusive})')
echo "$ALL_LO_TEACHER"

echo

echo "==== DEMO-flow completed succesfully ===="

