/**
 * Document Store - Manages user uploaded documents
 */

import { create } from "zustand";
import { api } from "@/services/api";
import * as FileSystem from "expo-file-system";

export interface UserDocument {
  id: string;
  fileName: string;
  fileType: "pdf" | "docx" | "doc";
  fileSize: number;
  status: "uploading" | "processing" | "ready" | "failed";
  pageCount?: number;
  uploadedAt: string;
}

interface DocumentState {
  documents: UserDocument[];
  isLoading: boolean;
  isUploading: boolean;
  error: string | null;

  // Actions
  fetchDocuments: () => Promise<void>;
  uploadDocument: (file: { uri: string; name: string; size?: number }) => Promise<void>;
  deleteDocument: (documentId: string) => Promise<void>;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  isLoading: false,
  isUploading: false,
  error: null,

  fetchDocuments: async () => {
    set({ isLoading: true });

    try {
      const response = await api.get("/documents");
      set({ documents: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: "Failed to load documents" });
    }
  },

  uploadDocument: async (file) => {
    set({ isUploading: true, error: null });

    // Add temporary document
    const tempId = `temp-${Date.now()}`;
    const tempDoc: UserDocument = {
      id: tempId,
      fileName: file.name,
      fileType: file.name.endsWith(".pdf") ? "pdf" : "docx",
      fileSize: file.size || 0,
      status: "uploading",
      uploadedAt: new Date().toISOString(),
    };

    set((state) => ({
      documents: [tempDoc, ...state.documents],
    }));

    try {
      // Create form data for upload
      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        name: file.name,
        type: file.name.endsWith(".pdf")
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      } as any);

      const response = await api.post("/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Replace temp document with real one
      set((state) => ({
        documents: state.documents.map((d) =>
          d.id === tempId ? response.data : d
        ),
        isUploading: false,
      }));
    } catch (error) {
      // Mark as failed
      set((state) => ({
        documents: state.documents.map((d) =>
          d.id === tempId ? { ...d, status: "failed" as const } : d
        ),
        isUploading: false,
        error: "Upload failed",
      }));
    }
  },

  deleteDocument: async (documentId: string) => {
    try {
      await api.delete(`/documents/${documentId}`);

      set((state) => ({
        documents: state.documents.filter((d) => d.id !== documentId),
      }));
    } catch (error) {
      set({ error: "Failed to delete document" });
    }
  },
}));
