interface Result {
  original: string;
  augmented?: string;
  error?: string;
}

interface ResultsProps {
  results: Result[];
}

const Results = ({ results }: ResultsProps) => {
  if (results.length === 0) return null;

  return (
    <div className="mt-8 space-y-6">
      <h2 className="text-xl font-semibold">Results</h2>
      {results.map((result, index) => (
        <div key={index} className="p-4 rounded-lg border">
          <div className="mb-2">
            <h3 className="font-medium">Original Prompt:</h3>
            <p className="text-muted-foreground">{result.original}</p>
          </div>
          {result.augmented ? (
            <div>
              <h3 className="font-medium">Augmented Prompt:</h3>
              <p className="text-muted-foreground">{result.augmented}</p>
            </div>
          ) : (
            <p className="text-red-500">{result.error}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default Results;