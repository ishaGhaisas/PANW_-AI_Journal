// Error state component
// Displays error messages

type ErrorStateProps = {
  message: string;
};

export default function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
      {message}
    </div>
  );
}
