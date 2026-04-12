export class ListDataroomCommentsResponseDto {
  success: boolean;
  data: {
    comments: Array<{
      id: string;
      content: string;
      pageNumber: number | null;
      createdAt: string;
      updatedAt: string;
      author: {
        id: string;
        firstName: string;
        lastName: string;
        avatar: { url: string | null } | null;
      };
      replies: Array<{
        id: string;
        content: string;
        createdAt: string;
        updatedAt: string;
        author: {
          id: string;
          firstName: string;
          lastName: string;
          avatar: { url: string | null } | null;
        };
      }>;
    }>;
    total: number;
  };
}
