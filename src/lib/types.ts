export type FieldError<FieldName extends string = string> = {
  path: FieldName;
  message: string;
};

export type TError = {
  error: {
    message: string;
    description?: string;
  };
};

export type ApiError<FieldName extends string = string> = {
  errors?: FieldError<FieldName>[];
  statusCode?: number;
} & TError;
