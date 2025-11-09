export type ExpenseSplitMode = 'EQUAL' | 'PERCENT' | 'AMOUNT' | 'SHARE';

export interface ExpenseParticipantDto {
  id?: number;
  userId: number;
  displayName: string;
  share: number;
  amountOwed: number;
}

export interface ExpenseDetailDto {
  id: number;
  groupId: number;
  title: string;
  amount: number;
  currencyCode: string;
  paidById: number;
  paidByName: string;
  splitMode: ExpenseSplitMode;
  createdAt: string; // ISO string
  participants: ExpenseParticipantDto[];
}

export interface CommentDto {
  id: number;
  expenseId: number;
  authorId: number;
  authorName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}
