import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPendingInvitesForClass,
  createInvite,
  Invite,
} from "../../../util/teacher/httpTeacher";
import PrimaryButton from "../../shared/PrimaryButton";

interface TeacherInvitesModalProps {
  classId: string;
  className: string;
}

export type InviteStatus = "PENDING" | "ACCEPTED" | "DECLINED";

const TeacherInvitesModal: React.FC<TeacherInvitesModalProps> = ({ classId, className }) => {
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState("");

  const {
    data: invites,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["teacherInvites", classId],
    queryFn: () => getPendingInvitesForClass(classId),
    enabled: !!classId,
  });

  const createInviteMutation = useMutation({
    mutationFn: () => createInvite({ classId, otherTeacherEmail: inviteEmail }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacherInvites", classId] });
      setInviteEmail("");
    },
  });

  const handleInviteSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inviteEmail.trim() !== "") {
      createInviteMutation.mutate();
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Leerkracht Uitnodigingen</h2>
      <p className="mb-4">
        Hier kun je de uitnodigingen voor leerkrachten beheren voor klas:{" "}
        <span className="font-medium">{className}</span>.
      </p>

      <form onSubmit={handleInviteSubmit} className="mb-6 flex flex-col gap-2">
        <input
          type="email"
          placeholder="Voer teacher email in"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          className="border p-2 rounded"
        />
        <PrimaryButton type="submit">Nodig uit</PrimaryButton>
      </form>

      {createInviteMutation.isError && (
        <p className="text-red-500">
          {createInviteMutation.error instanceof Error
            ? createInviteMutation.error.message
            : "Er is iets misgegaan bij het versturen van de uitnodiging."}
        </p>
      )}

      {isLoading && <p>Loading...</p>}
      {isError && (
        <p className="text-red-500">
          {error instanceof Error
            ? error.message
            : "Er is iets misgegaan bij het ophalen van de uitnodigingen."}
        </p>
      )}

      {!isLoading && !isError && invites && (
        <div>
          <table className="min-w-full border">
            <thead>
              <tr>
                <th className="border px-2 py-1">Voornaam</th>
                <th className="border px-2 py-1">Achternaam</th>
                <th className="border px-2 py-1">Email</th>
                <th className="border px-2 py-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {invites.map((invite: Invite) => (
                <tr key={invite.inviteId}>
                  <td className="border px-2 py-1">{invite.otherTeacher.user.firstName}</td>
                  <td className="border px-2 py-1">{invite.otherTeacher.user.lastName}</td>
                  <td className="border px-2 py-1">{invite.otherTeacher.user.email}</td>
                  <td className="border px-2 py-1">{invite.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TeacherInvitesModal;
