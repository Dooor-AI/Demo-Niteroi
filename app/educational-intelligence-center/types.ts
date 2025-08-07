export interface FileAttachment {
  id: string;
  name: string;
  type: "pdf" | "csv";
  size: number;
  content?: string;
  url?: string;
}

export interface Message {
  id: number;
  type: "ai" | "user";
  content: string;
  timestamp: Date;
  files?: FileAttachment[];
}

export interface ChatHistory {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  isActive: boolean;
  messages: Message[];
}

export interface AIResponse {
  content: string;
  error?: string;
}

