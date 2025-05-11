import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchJoinRequests,
  approveJoinRequest,
  denyJoinRequest,
} from "../../../util/teacher/httpTeacher";
import PrimaryButton from "../../shared/PrimaryButton";

interface StudentJoinRequestsModalProps {
  classId: string;
  className: string;
}

interface Student {
  firstName: string;
  lastName: string;
  email: string;
}

export type JoinRequestStatus = "PENDING" | "APPROVED" | "DENIED";

interface JoinRequest {
  requestId: number;
  student: Student;
  status: JoinRequestStatus;
}

interface JoinRequestResponse {
  joinRequests: JoinRequest[];
}

const StudentJoinRequestsModal: React.FC<StudentJoinRequestsModalProps> = ({ classId, className }) => {
  const queryClient = useQueryClient();

  const {
    data: joinRequests,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["studentJoinRequests", classId],
    queryFn: () => fetchJoinRequests(classId),
    enabled: !!classId,
  });

  const approveMutation = useMutation({
    mutationFn: (requestId: number) => approveJoinRequest({ classId, requestId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studentJoinRequests", classId] });
    },
  });

  const denyMutation = useMutation({
    mutationFn: (requestId: number) => denyJoinRequest({ classId, requestId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studentJoinRequests", classId] });
    },
  });

  const handleApprove = (requestId: number) => {
    approveMutation.mutate(requestId);
  };

  const handleDeny = (requestId: number) => {
    denyMutation.mutate(requestId);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Leerling Join Requests</h2>
      <p className="mb-4">
        Hier beheer je de join requests van leerlingen voor klas:{" "}
        <span className="font-medium">{className}</span>.
      </p>

      {isLoading && <p>Loading...</p>}
      {isError && (
        <p className="text-red-500">
          {error instanceof Error
            ? error.message
            : "Er is iets misgegaan bij het ophalen van de join requests."}
        </p>
      )}

      {!isLoading && !isError && joinRequests && (
        <div>
          <table className="min-w-full border">
            <thead>
              <tr>
                <th className="border px-2 py-1">Voornaam</th>
                <th className="border px-2 py-1">Achternaam</th>
                <th className="border px-2 py-1">Email</th>
                <th className="border px-2 py-1">Status</th>
                <th className="border px-2 py-1">Acties</th>
              </tr>
            </thead>
            <tbody>
              {joinRequests.joinRequests.map((request: JoinRequest) => (
                <tr key={request.requestId}>
                  <td className="border px-2 py-1">{request.student.firstName}</td>
                  <td className="border px-2 py-1">{request.student.lastName}</td>
                  <td className="border px-2 py-1">{request.student.email}</td>
                  <td className="border px-2 py-1">{request.status}</td>
                  <td className="border px-2 py-1 flex gap-2">
                    {request.status === "PENDING" && (
                      <>
                        <PrimaryButton onClick={() => handleApprove(request.requestId)}>
                          Approve
                        </PrimaryButton>
                        <PrimaryButton onClick={() => handleDeny(request.requestId)}>
                          Deny
                        </PrimaryButton>
                      </>
                    )}
                    {request.status === "DENIED" && (
                      <PrimaryButton onClick={() => handleApprove(request.requestId)}>
                        Approve
                      </PrimaryButton>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(approveMutation.isError || denyMutation.isError) && (
            <p className="text-red-500 mt-2">
              {approveMutation.error instanceof Error ? approveMutation.error.message : ""}
              {denyMutation.error instanceof Error ? denyMutation.error.message : ""}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentJoinRequestsModal;
