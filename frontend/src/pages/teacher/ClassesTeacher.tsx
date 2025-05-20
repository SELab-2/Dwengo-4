import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {

  fetchTeacherInvites,
  updateInviteStatus,
} from "../../util/teacher/classInvites";

import { Invite } from '@/types/api.types';

import {
  fetchClasses
} from "../../util/teacher/class";
import PrimaryButton from "../../components/shared/PrimaryButton";
import CreateClass from "../../components/teacher/classes/CreateClassForm";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface ClassItem {
  id: string;
  name: string;
  code: string;
}

const ClassesPageTeacher: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  // Klassen ophalen
  const {
    data: classes,
    isLoading: isClassesLoading,
    isError: isClassesError,
    error: classesError,
  } = useQuery<ClassItem[]>({
    queryKey: ["classes"],
    queryFn: fetchClasses,
  });

  // Uitnodigingen ophalen
  const {
    data: invites,
    isLoading: isInvitesLoading,
    isError: isInvitesError,
    error: invitesError,
  } = useQuery<Invite[]>({
    queryKey: ["teacherInvites"],
    queryFn: fetchTeacherInvites,
  });

  // Accept-invite mutation
  const acceptMutation = useMutation({
    mutationFn: (inviteId: number) =>
      updateInviteStatus(inviteId, "accept"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacherInvites"] });
      queryClient.invalidateQueries({ queryKey: ["classes"] });
    }
  });

  // Decline-invite mutation
  const declineMutation = useMutation({
    mutationFn: (inviteId: number) =>
      updateInviteStatus(inviteId, "decline"),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["teacherInvites"] }),
  });

  const handleAccept = (inviteId: number) => {
    acceptMutation.mutate(inviteId);
  };

  const handleDecline = (inviteId: number) => {
    declineMutation.mutate(inviteId);
  };

  return (
    <div className="flex flex-col items-center w-full space-y-10">
      {/* Create Class Form */}
      <div className="w-full px-10">
        <CreateClass />
      </div>

      {/* My Classes */}
      <div className="w-full px-10">
        {isClassesLoading && <p>{t("loading.loading")}</p>}
        {isClassesError && (
          <p className="text-red-500">
            {(classesError as any)?.info?.message || t("loading.error")}
          </p>
        )}
        {!isClassesLoading && !isClassesError && classes && classes.length > 0 ? (
          <div>
            <h2 className="text-2xl font-bold mb-4">
              {t("class.my_classes")}
            </h2>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Edit</th>
                  <th className="border px-4 py-2">Naam</th>
                  <th className="border px-4 py-2">Code</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((classItem) => (
                  <tr key={classItem.id}>
                    <td className="border px-4 py-2">
                      <PrimaryButton
                        onClick={() =>
                          navigate(`/teacher/classes/${classItem.id}`)
                        }
                      >
                        Beheer
                      </PrimaryButton>
                    </td>
                    <td className="border px-4 py-2">
                      {classItem.name}
                    </td>
                    <td className="border px-4 py-2">
                      {classItem.code}
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((classItem) => (
                    <tr key={classItem.id}>
                      <td className="text-center">
                        <Link to={`/teacher/classes/${classItem.id}`}>
                          <PrimaryButton>Beheer</PrimaryButton>
                        </Link>
                      </td>
                      <td className="text-center">
                        <div className="max-w-[200px] truncate" title={classItem.name}>
                          {classItem.name}
                        </div>
                      </td>
                      <td className="text-center">{classItem.code}</td>
                      <td className='text-center'>
                        <PrimaryButton
                          onClick={() => handleManageTeacherInvites(classItem.id)}
                        >
                          <span className="f-s">Beheer</span>
                        </PrimaryButton>
                      </td>
                      <td className='text-center'>
                        <PrimaryButton
                          onClick={() =>
                            handleManageStudentJoinRequests(classItem.id)
                          }
                        >
                          <span className="f-s">Beheer</span>
                        </PrimaryButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          !isClassesLoading && <p>Geen klassen gevonden.</p>
        )}
      </div>

      {/* Jouw Uitnodigingen */}
      <div className="w-full px-10">
        {isInvitesLoading && <p>Loading invites...</p>}
        {isInvitesError && (
          <p className="text-red-500">
            {invitesError instanceof Error
              ? invitesError.message
              : "Er is iets misgegaan bij het ophalen van de invites."}
          </p>
        )}
        {!isInvitesLoading &&
          !isInvitesError &&
          invites &&
          invites.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">
                Jouw uitnodigingen
              </h2>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border px-2 py-1">Klas</th>
                    <th className="border px-2 py-1">Uitnodiger</th>
                    <th className="border px-2 py-1">Status</th>
                    <th className="border px-2 py-1">Acties</th>
                  </tr>
                </thead>
                <tbody>
                  {invites.map((invite) => (
                    <tr key={invite.inviteId}>
                      <td className="border px-2 py-1">
                        {invite.class.name}
                      </td>
                      <td className="border px-2 py-1">
                        {invite.classTeacher.teacher.user.email}
                      </td>
                      <td className="border px-2 py-1">
                        {invite.status}
                      </td>
                      <td className="border px-2 py-1 flex gap-2">
                        {invite.status === "PENDING" && (
                          <>
                            <PrimaryButton
                              onClick={() =>
                                handleAccept(invite.inviteId)
                              }
                            >
                              Accepteer
                            </PrimaryButton>
                            <PrimaryButton
                              onClick={() =>
                                handleDecline(invite.inviteId)
                              }
                            >
                              Weiger
                            </PrimaryButton>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(acceptMutation.isError ||
                declineMutation.isError) && (
                  <p className="text-red-500 mt-2">
                    {acceptMutation.error instanceof Error
                      ? acceptMutation.error.message
                      : ""}
                    {declineMutation.error instanceof Error
                      ? declineMutation.error.message
                      : ""}
                  </p>
                )}
            </div>
          )}
      </div>
    </div>
  );
};

export default ClassesPageTeacher;
