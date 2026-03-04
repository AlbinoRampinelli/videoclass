"use client";

import React from 'react';
import InfoPythonModal from "./InfoPythonModal";

export default function ModalInteresse({ course, onClose, onAction, userDb }: any) {
    return (
        <InfoPythonModal
            isOpen={true}
            onClose={onClose}
            onAction={onAction}
            cursoNome={course?.title}
        />
    );
}