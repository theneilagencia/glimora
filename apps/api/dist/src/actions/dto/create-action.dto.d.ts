import { ActionType, ActionStatus } from '@prisma/client';
export declare class CreateActionDto {
    type: ActionType;
    status?: ActionStatus;
    title: string;
    description?: string;
    suggestedMessage?: string;
    checklist?: {
        item: string;
        completed: boolean;
    }[];
    priority?: number;
    dueDate?: string;
    accountId?: string;
    decisorId?: string;
    signalId?: string;
    assignedToId?: string;
    authorityContentId?: string;
}
