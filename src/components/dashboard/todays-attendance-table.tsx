import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatTime } from "@/lib/utils";
import type { AttendanceStatus } from "@/lib/types/database";

export interface TodayRow {
  id: string;
  name: string;
  department: string;
  checkIn: string | null;
  status: AttendanceStatus | "not-checked-in";
}

const TONE: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  present: "success",
  late: "warning",
  absent: "danger",
  "not-checked-in": "neutral",
};

const LABEL: Record<string, string> = {
  present: "On time",
  late: "Late",
  absent: "Absent",
  "not-checked-in": "—",
};

export function TodaysAttendanceTable({ rows }: { rows: TodayRow[] }) {
  return (
    <Card className="overflow-hidden p-0">
      <CardHeader className="p-5">
        <CardTitle>Today&apos;s attendance</CardTitle>
      </CardHeader>
      <CardContent className="p-0 pt-3">
        {rows.length === 0 ? (
          <EmptyState
            title="No workforce data yet"
            description="Add employees to start tracking attendance."
            className="border-none"
          />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Employee</Th>
                <Th>Department</Th>
                <Th>Check-in</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {rows.slice(0, 6).map((r) => (
                <Tr key={r.id}>
                  <Td>{r.name}</Td>
                  <Td className="text-ink-500">{r.department}</Td>
                  <Td>{formatTime(r.checkIn)}</Td>
                  <Td>
                    <Badge tone={TONE[r.status]}>{LABEL[r.status]}</Badge>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
