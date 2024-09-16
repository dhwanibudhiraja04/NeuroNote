import {
  MutationCtx,
  QueryCtx,
  action,
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import OpenAI from "openai";
import { Id } from "./_generated/dataModel";
import { embed } from "./notes";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function hasAccessToDocument(
  ctx: MutationCtx | QueryCtx,
  documentId: Id<"documents">
): Promise<{ document: any; userId: string } | null> {  // Added return type
  const userId = (await ctx.auth.getUserIdentity())?.tokenIdentifier;
  if (!userId) {
    return null;
  }
  const document = await ctx.db.get(documentId);
  if (!document) {
    return null;
  }
  if (document.tokenIdentifier !== userId) {
    return null;
  }
  return { document, userId };
}

export const hasAccessToDocumentQuery = internalQuery({
  args: {
    documentId: v.id("documents"),
  },
  async handler(ctx, args): Promise<{ document: any; userId: string } | null> {  // Added return type
    return await hasAccessToDocument(ctx, args.documentId);
  },
});

export const generateUploadUrl = mutation(async (ctx): Promise<string> => {  // Added return type
  return await ctx.storage.generateUploadUrl();
});

export const getDocuments = query({
  async handler(ctx): Promise<any[] | undefined> {  // Added return type
    const userId = (await ctx.auth.getUserIdentity())?.tokenIdentifier;
    if (!userId) {
      return undefined;
    }
    return await ctx.db
      .query("documents")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", userId))
      .collect();
  },
});

export const getDocument = query({
  args: {
    documentId: v.id("documents"),
  },
  async handler(
    ctx,
    args
  ): Promise<{ documentUrl: string; [key: string]: any } | null> {  // Added return type
    const accessObj = await hasAccessToDocument(ctx, args.documentId);
    if (!accessObj) {
      return null;
    }
    return {
      ...accessObj.document,
      documentUrl: await ctx.storage.getUrl(accessObj.document.fileId),
    };
  },
});

export const createDocument = mutation({
  args: {
    title: v.string(),
    fileId: v.id("_storage"),
  },
  async handler(ctx, args): Promise<void> {  // Added return type
    const userId = (await ctx.auth.getUserIdentity())?.tokenIdentifier;
    if (!userId) {
      throw new ConvexError("Not authenticated");
    }
    const documentId = await ctx.db.insert("documents", {
      title: args.title,
      tokenIdentifier: userId,
      fileId: args.fileId,
      description: "",
    });
    await ctx.scheduler.runAfter(
      0,
      internal.documents.generateDocumentDescription,
      {
        fileId: args.fileId,
        documentId,
      }
    );
  },
});

export const generateDocumentDescription = internalAction({
  args: {
    fileId: v.id("_storage"),
    documentId: v.id("documents"),
  },
  async handler(ctx, args): Promise<void> {  // Added return type
    const file = await ctx.storage.get(args.fileId);
    if (!file) {
      throw new ConvexError("File not found");
    }
    const text: string = await file.text();
    const chatCompletion: OpenAI.Chat.Completions.ChatCompletion =
      await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `Here is a text file: ${text}`,
          },
          {
            role: "user",
            content: `Please generate 1 sentence description for this document.`,
          },
        ],
        model: "gpt-3.5-turbo",
      });

    const description: string =
      chatCompletion.choices[0].message.content ??
      "Could not generate a description for this document";

    const embedding = await embed(description);

    await ctx.runMutation(internal.documents.updateDocumentDescription, {
      documentId: args.documentId,
      description: description,
      embedding,
    });
  },
});

export const updateDocumentDescription = internalMutation({
  args: {
    documentId: v.id("documents"),
    description: v.string(),
    embedding: v.array(v.float64()),
  },
  async handler(ctx, args): Promise<void> {  // Added return type
    await ctx.db.patch(args.documentId, {
      description: args.description,
      embedding: args.embedding,
    });
  },
});

export const askQuestion = action({
  args: {
    question: v.string(),
    documentId: v.id("documents"),
  },
  async handler(
    ctx,
    args
  ): Promise<string> {  // Added return type
    const accessObj: { document: any; userId: string } | null = await ctx.runQuery(
      internal.documents.hasAccessToDocumentQuery,
      {
        documentId: args.documentId,
      }
    );
    if (!accessObj) {
      throw new ConvexError("You do not have access to this document");
    }
    const file: { text: () => Promise<string> } | null = await ctx.storage.get(accessObj.document.fileId);
    if (!file) {
      throw new ConvexError("File not found");
    }
    const text: string = await file.text();
    const chatCompletion: OpenAI.Chat.Completions.ChatCompletion =
      await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `Here is a text file: ${text}`,
          },
          {
            role: "user",
            content: `Please answer this question: ${args.question}`,
          },
        ],
        model: "gpt-3.5-turbo",
      });

    const response: string =
      chatCompletion.choices[0].message.content ?? "Could not generate a response";

    await ctx.runMutation(internal.chats.createChatRecord, {
      documentId: args.documentId,
      text: args.question,
      isHuman: true,
      tokenIdentifier: accessObj.userId,
    });

    await ctx.runMutation(internal.chats.createChatRecord, {
      documentId: args.documentId,
      text: response,
      isHuman: false,
      tokenIdentifier: accessObj.userId,
    });

    return response;
  },
});

export const deleteDocument = mutation({
  args: {
    documentId: v.id("documents"),
  },
  async handler(ctx, args): Promise<void> {  // Added return type
    const accessObj = await hasAccessToDocument(ctx, args.documentId);
    if (!accessObj) {
      throw new ConvexError("You do not have access to this document");
    }
    await ctx.storage.delete(accessObj.document.fileId);
    await ctx.db.delete(args.documentId);
  },
});
