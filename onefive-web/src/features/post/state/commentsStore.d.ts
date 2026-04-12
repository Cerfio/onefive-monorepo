import type { CommentType } from '../definitions/comment.definition';
export declare const upsertNormalizedComment: (comment: CommentType | any) => void;
export declare const removeNormalizedComment: (id: string) => void;
export declare const getNormalizedComment: (id: string) => any;
export declare const listNormalizedComments: () => any[];
