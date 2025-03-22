import React, { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchClasses,
  getPendingInvitesForClass,
  createInvite,
  fetchJoinRequests,
  approveJoinRequest,
  denyJoinRequest,
} from "../../util/teacher/httpTeacher";
import PrimaryButton from "../../components/shared/PrimaryButton";
import CreateClass from "../../components/teacher/classes/CreateClassForm";
import Modal from "../../components/shared/Modal";
import SuccessMessage from "../../components/shared/SuccessMessage";

interface ClassItem {
  id: string;
  name: string;
  code: string;
}

const ClassesPage: React.FC = () => {
  const { data, isLoading, isError, error } = useQuery<{
    classes: ClassItem[];
  }>({
    queryKey: ["classes"],
    queryFn: fetchClasses,
  });

  // Query: Haal pending teacher invites voor de geselecteerde klas op
  const { data: teacherInvites, isLoading: isInvitesLoading } = useQuery<TeacherInvite[]>({
    queryKey: ["teacherInvites", selectedTeacherClassId],
    queryFn: () => getPendingInvitesForClass(selectedTeacherClassId!),
    enabled: !!selectedTeacherClassId,
  });

  // Query: Haal student join requests voor de geselecteerde klas op
  const { data: studentJoinRequests, isLoading: isStudentJoinLoading } = useQuery<JoinRequest[]>({
    queryKey: ["studentJoinRequests", selectedStudentClassId],
    queryFn: () => fetchJoinRequests(selectedStudentClassId!),
    enabled: !!selectedStudentClassId,
  });

  // Mutation: Creëer een invite (op basis van teacher email)
  const createInviteMutation = useMutation({
    mutationFn: ({
      classId,
      otherTeacherEmail,
    }: {
      classId: string;
      otherTeacherEmail: string;
    }) => createInvite({ classId, otherTeacherEmail }),
    onSuccess: () => {
      if (selectedTeacherClassId) {
        queryClient.invalidateQueries({ queryKey: ["teacherInvites", selectedTeacherClassId] });
        setInviteTeacherEmail(""); // Reset het form
      }
    },
  });

  // Mutatie: Approve student join request
  const approveMutation = useMutation({
    mutationFn: ({ classId, requestId }: { classId: string; requestId: number }) =>
      approveJoinRequest({ classId, requestId }),
    onSuccess: () => {
      if (selectedStudentClassId) {
        queryClient.invalidateQueries({ queryKey: ["studentJoinRequests", selectedStudentClassId] });
      }
    },
  });

  // Mutatie: Deny student join request
  const denyMutation = useMutation({
    mutationFn: ({ classId, requestId }: { classId: string; requestId: number }) =>
      denyJoinRequest({ classId, requestId }),
    onSuccess: () => {
      if (selectedStudentClassId) {
        queryClient.invalidateQueries({ queryKey: ["studentJoinRequests", selectedStudentClassId] });
      }
    },
  });

  const handleInviteSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedTeacherClassId && inviteTeacherEmail.trim() !== "") {
      createInviteMutation.mutate({ classId: selectedTeacherClassId, otherTeacherEmail: inviteTeacherEmail });
    }
  };

  const handleApprove = (requestId: number) => {
    if (selectedStudentClassId) {
      approveMutation.mutate({ classId: selectedStudentClassId, requestId });
    }
  };

  const handleDeny = (requestId: number) => {
    if (selectedStudentClassId) {
      denyMutation.mutate({ classId: selectedStudentClassId, requestId });
    }
  };

  const handleManageTeacherInvites = (classId: string): void => {
    setSelectedTeacherClassId(classId);
    teacherInvitesModalRef.current?.open();
  };

  const handleManageStudentJoinRequests = (classId: string): void => {
    setSelectedStudentClassId(classId);
    studentJoinModalRef.current?.open();
  };

  return (
    <div className="flex flex-col gap-6">
      <CreateClass />

      {isLoading && <p>Loading...</p>}
      {isError && (
        <p className="c-r">
          {(error as any)?.info?.message ||
            "Er is iets fout gegaan bij het ophalen van de klassen."}
        </p>
      )}

      {!isLoading && !isError && (
        <div className="flex flex-col gap-4">
          <h2>Mijn Klassen</h2>
          <table className="tableSimpleStyling">
            <thead>
              <tr>
                <th>Edit</th>
                <th>Naam</th>
                <th>Code</th>
                <th>Leerkracht Invites</th>
                <th>Leerling Join Requests</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {classes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="c-r">
                    Geen klassen gevonden.
            <tbody className="divide-y divide-gray-200">
              {classes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="c-r">
                    Geen klassen gevonden.
                  </td>
                </tr>
              ) : (
                classes.map((classItem) => (
                  <tr key={classItem.id} className="py-2">
                    <td className="py-3">{classItem.name}</td>
                    <td className="py-3">{classItem.code}</td>
                    <td className="py-3">
                      <PrimaryButton
                        onClick={() => handleTeacherInvite(classItem.id)}
                      >
                        Beheer
                      </PrimaryButton>
                    </td>
                    <td className="py-3">
                      <PrimaryButton
                        onClick={() => handleStudentInvite(classItem.id)}
                      >
                        Beheer
                      </PrimaryButton>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        !isLoading && <p>Geen klassen gevonden.</p>
        </div>
      )}

      {/* Modal voor teacher invites */}
      <Modal ref={teacherInvitesModalRef}>
        <h2>Teacher Invites</h2>
        {/* Mini-form om een leerkracht uit te nodigen via email */}
        <form
          onSubmit={handleInviteSubmit}
          className="mb-4 g-1fr-130 gap-2 items-center"
        >
          <input
            type="email"
            value={inviteTeacherEmail}
            onChange={(e) => setInviteTeacherEmail(e.target.value)}
            placeholder="Voer teacher email in"
            className="border p-1 rounded"
          />
          <PrimaryButton type="submit">Nodig uit</PrimaryButton>
        </form>
        {/* Success- en error-message voor invite */}
        {createInviteMutation.isSuccess && (
          <SuccessMessage
            title="Succes!"
            description="De invite is verstuurd."
          />
        )}
        {createInviteMutation.isError && (
          <div className="c-r">
            {(createInviteMutation.error as any)?.info?.message ||
              "Er is iets fout gegaan bij het versturen van de invite."}
          </div>
        )}
        {isInvitesLoading ? (
          <p>Loading...</p>
        ) : teacherInvites && teacherInvites.length > 0 ? (
          <table className="tableSimpleStyling">
            <thead>
              <tr>
                <th>Voornaam</th>
                <th>Achternaam</th>
                <th>Email</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {[...teacherInvites]
                .sort((a, b) => {
                  const order = { PENDING: 0, DENIED: 1, APPROVED: 2 };
                  return order[a.status] - order[b.status];
                })
                .map((invite) => (
                  <tr key={`INVITE_${invite.inviteId}`}>
                    <td>{invite.otherTeacher.firstName}</td>
                    <td>{invite.otherTeacher.lastName}</td>
                    <td>{invite.otherTeacher.email}</td>
                    <td>
                      <button
                        disabled
                        className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded"
                      >
                        {invite.status}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          <p>Geen invites gevonden.</p>
        )}
      </Modal>

      {/* Modal voor student join requests */}
      <Modal ref={studentJoinModalRef}>
        <h2>Student Join Requests</h2>
        {isStudentJoinLoading ? (
          <p>Loading...</p>
        ) : studentJoinRequests && studentJoinRequests.length > 0 ? (
          <table className="tableSimpleStyling">
            <thead>
              <tr>
                <th>Voornaam</th>
                <th>Achternaam</th>
                <th>Email</th>
                <th>Status</th>
                <th>Acties</th>
              </tr>
            </thead>
            <tbody>
              {[...studentJoinRequests]
                .sort((a, b) => {
                  const order = { PENDING: 0, DENIED: 1, APPROVED: 2 };
                  return order[a.status] - order[b.status];
                })
                .map((request) => (
                  <tr key={`JOIN_REQUEST_${request.requestId}`}>
                    <td>{request.student.firstName}</td>
                    <td>{request.student.lastName}</td>
                    <td>{request.student.email}</td>
                    <td>
                      <button
                        disabled
                        className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded"
                      >
                        {request.status}
                      </button>
                    </td>
                    <td>
                      {request.status === "PENDING" && (
                        <div className="flex gap-2">
                          <PrimaryButton
                            onClick={() => handleApprove(request.requestId)}
                          >
                            Approve
                          </PrimaryButton>
                          <PrimaryButton
                            onClick={() => handleDeny(request.requestId)}
                          >
                            Deny
                          </PrimaryButton>
                        </div>
                      )}
                      {request.status === "DENIED" && (
                        <PrimaryButton
                          onClick={() => handleApprove(request.requestId)}
                        >
                          Approve
                        </PrimaryButton>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          <p>Geen join requests gevonden.</p>
        )}
      </Modal>
    </div>
  );
};

export default ClassesPageTeacher;
