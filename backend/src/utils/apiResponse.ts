
type ApiResponseData<T> = {
    status: 'success' | 'error';
    message: string;
    data?: T;
    error?: any;
};
  
export class ApiResponse {
    static success<T>(message: string, data?: T): ApiResponseData<T> {
      return {
        status: 'success',
        message,
        data,
      };
    }
  
static error<T>(message: string, error?: any): ApiResponseData<T> {
    return {
        status: 'error',
        message,
        error,
        };
    }
}
