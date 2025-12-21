import { ErrorCode } from './errors-list';

const defaultErrorMessages: Partial<Record<ErrorCode, string>> = {
  [ErrorCode.UNAUTHORIZED]: 'Unauthorized',
  [ErrorCode.VALIDATION_ERROR]: 'Invalid Request',
  [ErrorCode.INSUFFICIENT_FUND]: 'Insuficient Point',
  [ErrorCode.ACCOUNT_NOT_FOUND]: 'Account Not Found',
  [ErrorCode.PERM_NOT_FOUND]: 'Group Permission not found',
  [ErrorCode.INVALID_FILE_TYPE]: 'Invalid File Type',
  [ErrorCode.FILE_TOO_LARGE]: 'File too large',
  [ErrorCode.WRONG_PASSWORD]: 'Wrong password',
  [ErrorCode.ACCOUNT_BANNED]: 'Account Banned',
  [ErrorCode.EMAIL_IS_EXIST]: 'Email is existed',
  [ErrorCode.WRONG_RE_PASSWORD]: 'Wrong re password',
  [ErrorCode.USER_NOT_FOUND]: 'User Not Found',
  [ErrorCode.USER_NOT_ACTIVE]: 'User Not Active',
  [ErrorCode.USER_IS_BLOCKED]: 'User is Blocked',
  [ErrorCode.CREATE_ACCOUNT_ERROR]: 'Create Account Error',
  [ErrorCode.CREATE_PROJECT_ERROR]: 'Create Project Error',
  [ErrorCode.CREATE_TASK_ERROR]: 'Create Task Error',
  [ErrorCode.PROJECT_NOT_FOUND]: 'Project Not Found',
  [ErrorCode.GET_TASK_ERROR]: 'Get Task Error',
  [ErrorCode.DELETE_PROJECT_ERROR]: 'Delete Project Error',
  [ErrorCode.FORBIDDEN]: 'Forbidden',
  [ErrorCode.UPDATE_PROJECT_ERROR]: 'Update Project Error',
  [ErrorCode.PROJECT_COMPLETED]: 'Project already Completed',
  [ErrorCode.UPDATE_TASK_ERROR]: 'Update Task Error',
  [ErrorCode.TASK_NOT_FOUND]: 'Task Not Found',
  [ErrorCode.TASK_COMPLETED]: 'Task already Completed',
  [ErrorCode.GET_DASHBOARD_ERROR]: 'Get Dashboard Error',
  [ErrorCode.GET_EMPLOYEES_ERROR]: 'Get Employees Error',
  [ErrorCode.START_END_TIME_ERROR]: 'Start time must be less than end time',
  [ErrorCode.UPDATE_USER_ERROR]: 'Update User Error',
  [ErrorCode.UPLOAD_IMAGE_ERROR]: 'Upload Image Error',
  [ErrorCode.FILE_NOT_FOUND]: 'File Not Found',
  [ErrorCode.UPLOAD_PROJECT_FILES_ERROR]: 'Upload Project Files Error',
  [ErrorCode.UPLOAD_FILE_ERROR]: 'Upload File Error',
  [ErrorCode.GET_PROJECT_ERROR]: 'Get Project Error',
};

export function resolveErrorMessage(code: ErrorCode) {
  return defaultErrorMessages[code] ?? ErrorCode[code];
}
