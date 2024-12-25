import { Database } from "lucide-react"
import { Download, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DeleteDatasetButton } from "./DeleteDatasetButton"

interface Dataset {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  created_at: string;
  file_path: string | null;
}

interface DatasetListProps {
  datasets: Dataset[];
  onView: (id: string) => void;
  onDownload: (datasetId: string, format: 'csv') => void;
  downloading: string | null;
}

export const DatasetList = ({ datasets, onView, onDownload, downloading }: DatasetListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {datasets.map((dataset) => (
        <Card key={dataset.id} className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              {dataset.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-muted-foreground mb-4">
              {dataset.description || "No description provided"}
            </p>
            {dataset.category && (
              <p className="text-sm">
                <span className="font-medium">Category:</span> {dataset.category}
              </p>
            )}
            <p className="text-sm">
              <span className="font-medium">Created:</span>{" "}
              {new Date(dataset.created_at).toLocaleDateString()}
            </p>
          </CardContent>
          <CardFooter className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onView(dataset.id)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onDownload(dataset.id, 'csv')}
              disabled={!!downloading}
            >
              <Download className="h-4 w-4" />
              CSV
            </Button>
            <DeleteDatasetButton 
              datasetId={dataset.id} 
              filePath={dataset.file_path}
            />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}