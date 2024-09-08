"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import ChatPanel from "./chat-panel";

export default function DocumentPage() {
  const { documentID } = useParams();  // Extract the documentID from the URL

  // Ensure documentID is a string before using it
  const document = useQuery(
    api.documents.getDocument,
    documentID && typeof documentID === 'string'
      ? { documentId: documentID as Id<"documents"> }
      : "skip"
  );

  if (!documentID) {
    return <div>Loading...</div>;  // Handle the case where documentId is undefined
  }

  if (!document) {
    return <div>You do not have access to view this document</div>;
  }

  return (
    <main className="p-24 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">{document.title}</h1>
      </div>

      <div className="flex gap-12">
        <div className="bg-gray-900 p-4 rounded flex-1 h-[400px]">
          {document.documentUrl && (
            <iframe className="w-full h-full" src={document.documentUrl} />
          )}
        </div>

        <ChatPanel documentId={document._id} />
      </div>
    </main>
  );
}
