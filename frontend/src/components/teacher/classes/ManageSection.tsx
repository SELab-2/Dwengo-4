import React, { useRef } from "react";
import PrimaryButton from "../../shared/PrimaryButton";
import Modal, { ModalHandle } from "../../shared/Modal";
import TeacherInvitesModal from "./TeacherInvitesModal";
import StudentJoinRequestsModal from "./StudentJoinRequestsModal";

interface ManageSectionProps {
  classId: string;
  className: string;
}

const ManageSection: React.FC<ManageSectionProps> = ({ classId, className }) => {
  const teacherModalRef = useRef<ModalHandle>(null);
  const studentModalRef = useRef<ModalHandle>(null);

  return (
    <>
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Beheer Uitnodigingen voor {className}</h2>
        <div className="flex gap-4">
          <PrimaryButton onClick={() => teacherModalRef.current?.open()}>
            Leerkracht Uitnodigingen
          </PrimaryButton>
          <PrimaryButton onClick={() => studentModalRef.current?.open()}>
            Leerling Join Requests
          </PrimaryButton>
        </div>
      </div>

      {/* Modal wrapper voor de leerkracht content */}
      <Modal ref={teacherModalRef}>
        <TeacherInvitesModal classId={classId} className={className} />
      </Modal>

      {/* Modal wrapper voor de leerling join requests */}
      <Modal ref={studentModalRef}>
        <StudentJoinRequestsModal classId={classId} className={className} />
      </Modal>
    </>
  );
};

export default ManageSection;
