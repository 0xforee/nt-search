
// API response types
export interface ApiResponse<T> {
    code: number;
    success: boolean;
    message: string;
    data: T;
  }
  

