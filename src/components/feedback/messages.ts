export interface FeedbackMessages {
  title: string;
  description: string;
  message: {
    label: string;
    placeholder: string;
    min: string;
    max: string;
  };
  email: {
    label: string;
    placeholder: string;
    invalid: string;
  };
  submit: string;
  submitting: string;
  errors: {
    submit: string;
  };
}
