export enum ProjectStatusEnum {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum TaskPriorityEnum {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  VERY_HIGH = 'VERY_HIGH',
}

export enum TaskStatusEnum {
  STARTED = 'STARTED', // Bắt đầu
  ACCEPTED = 'ACCEPTED', // Đã nhận việc
  IN_PROGRESS = 'IN_PROGRESS', // Đang thực hiện
  COMPLETED = 'COMPLETED', // Hoàn thành
}
