import {v} from "convex/values";

import {mutation, query} from "./_generated/server";
import {Doc, Id} from "./_generated/dataModel";

// export const get = query({
//     handler: async (ctx) => {
//         const identity = await ctx.auth.getUserIdentity();

//         if (!identity) {
//             throw new Error("Not authenticated");
//         }

//         const documents = await ctx.db.query("documents").collect();

//         return documents;
//     }
// });

export const archive = mutation({
    args: { id: v.id("documents") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not authenticated");
        }

        const userId = identity.subject;

        // 해당 유저의 db에 존재하는 document가 있는지 확인
        const existingDocument = await ctx.db.get(args.id);

        if (!existingDocument) {
            throw new Error("Not found");
        }

        if (existingDocument.userId !== userId) {
            throw new Error("Unauthorized");
        }

        // documentId를 부모로 갖는 모든 자식 문서들을 데이터베이스에서 찾아 children 변수에 저장합니다.
        // 근데 이게 depth가 여러개니까 이 작업을 계속 반복해야 함
        const recursiveArchive = async (documentId: Id<"documents">) => {
            const children = await ctx.db.query('documents')
            .withIndex("by_user_parent", (q) => (
                q
                   .eq("userId", userId)
                   .eq("parentDocument", documentId)
            ))
            .collect();

            for (const child of children) {
                await ctx.db.patch(child._id, {
                    isArchived: true,
                });
                await recursiveArchive(child._id);
            }
        }

        const document = await ctx.db.patch(args.id, {
            isArchived: true,
        });

        recursiveArchive(args.id);

        return document;
    }
})

export const getSidebar = query({
    args: {
        parentDocument: v.optional(v.id("documents"))
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if(!identity) {
            throw new Error("Not authenticated");
        }

        const userId = identity.subject;

        const documents = await ctx.db.query("documents")
        // userId와 parentDocument가 일치하는지 확인
            .withIndex("by_user_parent", (q) =>
            q
                .eq("userId", userId)
                .eq("parentDocument", args.parentDocument)
            )
            // 삭제된 문서는 참고하지 않도록 설정 (Archived == false <- 현재 저장되어 있지 않음을 의미)
            .filter((q) =>
                q.eq(q.field("isArchived"), false)
            )
            .order("desc")
            .collect()
        // console.log(documents)

        return documents;
    }
})

export const create = mutation({
    args: {
        title: v.string(),
        parentDocument: v.optional(v.id("documents"))
    },
    handler : async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if(!identity) {
            throw new Error("Not authenticated");
        }

        const userId = identity.subject;

        const document = await ctx.db.insert("documents", {
            title: args.title,
            parentDocument: args.parentDocument,
            userId,
            isArchived: false,
            isPublished: false,
        });

        return document;
    }
})

export const getTrash = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not authenticated");
        }

        const userId = identity.subject;

        const documents = await ctx.db.query("documents")
            .withIndex("by_user", (q) =>
                q.eq("userId", userId)
            )
            .filter((q)=>q.eq(q.field("isArchived"), true))
            .order("desc")
            .collect()

        return documents;
    }
})

export const restore = mutation({
    args: {id : v.id("documents")},
    handler: async (ctx, args) => {
        // 로그인(유저id) 유효성 확인
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not authenticated");
        }

        // db 유효성 확인
        const userId = identity.subject;

        const existingDocument = await ctx.db.get(args.id);

        if (!existingDocument) {
            throw new Error("Not found");
        }

        if (existingDocument.userId !== userId) {
            throw new Error("Unauthorized");
        }

        const recursiveRestore = async (documentId: Id<"documents">) => {
            const children = await ctx.db
            .query("documents")
            .withIndex("by_user_parent", (q) => (
                q
                .eq("userId", userId)
                .eq("parentDocument", documentId)
            ))
            .collect();

            for (const child of children) {
                await ctx.db.patch(child._id, {
                    isArchived: false
                });

                await recursiveRestore(child._id);
            }
        }

        const options: Partial<Doc<"documents">> = {
            isArchived: false,
        }

        if (existingDocument.parentDocument) {
            const parent = await ctx.db.get(existingDocument.parentDocument);
            // 해당 문서의 부모 문서가 아카이브됐으면, 부모 문서의 정보를 undefined로 변경해야 한다.
            if (parent?.isArchived) {
                options.parentDocument = undefined;
            }
        }

        const document = await ctx.db.patch(args.id, options);

        recursiveRestore(args.id);

        return document;


    }
})

export const remove = mutation({
    args: {id : v.id("documents")},
    handler: async (ctx, args) => {
        // 로그인(유저id) 유효성 확인
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not authenticated");
        }

        const userId = identity.subject;

        const existingDocument = await ctx.db.get(args.id);

        if (!existingDocument) {
            throw new Error("Not found");
        }

        if (existingDocument.userId !== userId) {
            throw new Error("Unauthorized");
        }

        const document = await ctx.db.delete(args.id);

        return document;

    }
})