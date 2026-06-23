import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type ModulePageProps = {
  title: string;
  description: string;
  highlights?: Array<{ label: string; value: string }>;
  tableColumns?: string[];
  tableRows?: string[][];
};

export function AdminModulePage({
  title,
  description,
  highlights = [],
  tableColumns = [],
  tableRows = [],
}: ModulePageProps) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-[var(--font-sora)] text-[32px] font-bold leading-tight text-[#17231d]">{title}</h1>
        <p className="text-sm text-[#66766e]">{description}</p>
      </div>

      {highlights.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {highlights.map((item) => (
            <Card key={item.label} className="rounded-2xl border-[#e5ece8] bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-[#5f6e67]">{item.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-[#1b2a22]">{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tableColumns.length > 0 && (
        <Card className="rounded-2xl border-[#e5ece8] bg-white">
          <CardHeader>
            <CardTitle className="text-base">Data {title}</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {tableColumns.map((column) => (
                    <TableHead key={column}>{column}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableRows.map((row, rowIndex) => (
                  <TableRow key={`${title}-${rowIndex}`}>
                    {row.map((value, cellIndex) => (
                      <TableCell key={`${title}-${rowIndex}-${cellIndex}`}>{value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
