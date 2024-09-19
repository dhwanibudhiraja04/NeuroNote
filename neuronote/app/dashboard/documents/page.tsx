// dashboard/documents/page.tsx

"use client";

import React from 'react'; // Added import for React
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { DocumentCard } from "@/app/dashboard/documents/document-card"; // Updated import path
import CreateDocumentButton from "@/app/dashboard/documents/upload-document-button"; // Updated import path
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { useOrganization } from "@clerk/nextjs";

export default function DocumentsPage() {
  const { organization } = useOrganization();

  const documents = useQuery(api.documents.getDocuments, {
    orgId: organization?.id,
  });

  return (
    <main className="w-full space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">My Documents</h1>
        <CreateDocumentButton />
      </div>

      {documents === undefined && (
        <div className="grid grid-cols-3 gap-8">
          {new Array(8).fill("").map((_, i) => (
            <Card key={i} className="h-[200px] p-6 flex flex-col justify-between">
              <Skeleton className="h-[20px] rounded" />
              <Skeleton className="h-[20px] rounded" />
              <Skeleton className="h-[20px] rounded" />
              <Skeleton className="w-[80px] h-[40px] rounded" />
            </Card>
          ))}
        </div>
      )}

      {documents === null && (
        <div className="py-12 flex flex-col justify-center items-center gap-8">
          <h2 className="text-2xl">You do not have access to this organization</h2>
        </div>
      )}

      {documents && documents.length === 0 && (
        <div className="py-12 flex flex-col justify-center items-center gap-8">
          <Image
            src="/documentUpload.svg"
            width={200}
            height={200}
            alt="a picture of a girl holding documents"
          />
          <h2 className="text-2xl">You have no documents</h2>
          <CreateDocumentButton />
        </div>
      )}

      {documents && documents.length > 0 && (
        <div className="grid grid-cols-3 gap-8">
          {documents.map((doc) => (
            <DocumentCard key={doc._id.toString()} document={doc} />
          ))}
        </div>
      )}
    </main>
  );
}
